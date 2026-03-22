from fastapi import FastAPI, UploadFile, File

# Monkey-patch 1: torchaudio 2.10+ removed list_audio_backends(),
# but speechbrain still calls it during import. Patch it BEFORE importing speechbrain.
import torchaudio
if not hasattr(torchaudio, "list_audio_backends"):
    torchaudio.list_audio_backends = lambda: ["default"]

# Monkey-patch 2: huggingface_hub v0.24+ renamed 'use_auth_token' to 'token'.
# SpeechBrain still uses the old name, causing a TypeError.
import huggingface_hub
from huggingface_hub.utils import EntryNotFoundError
orig_download = huggingface_hub.hf_hub_download
def patched_download(*args, **kwargs):
    if "use_auth_token" in kwargs:
        kwargs["token"] = kwargs.pop("use_auth_token")
    try:
        return orig_download(*args, **kwargs)
    except EntryNotFoundError as e:
        # SpeechBrain's fetch() expects a ValueError for 404s to skip optional files
        raise ValueError(f"File not found on HF hub: {e}")
huggingface_hub.hf_hub_download = patched_download

# Use non-deprecated path for speechbrain 1.0
from speechbrain.inference.classifiers import EncoderClassifier
from speechbrain.utils.fetching import LocalStrategy
import soundfile as sf
import numpy as np
import torch
import io
import tempfile
import os
from numpy import dot
from numpy.linalg import norm

# Use imageio-ffmpeg's bundled ffmpeg binary
import imageio_ffmpeg
import subprocess

# Avoid symlink errors on Windows by forcing copy strategy
os.environ["SB_LOCAL_STRATEGY"] = "copy"

app = FastAPI()

print("Loading Speaker Recognition Model...")
classifier = EncoderClassifier.from_hparams(
    source="speechbrain/spkrec-ecapa-voxceleb",
    savedir="pretrained_models/spkrec",
    local_strategy=LocalStrategy.COPY
)
print("Model Loaded Successfully")


# -----------------------------
# Function: Convert any audio to WAV
# torchaudio cannot load webm files without ffmpeg backend.
# This converts webm/ogg/mp3/etc to WAV using pydub.
# -----------------------------
def convert_to_wav(audio_bytes: bytes) -> bytes:
    """Convert audio bytes to WAV format using ffmpeg via subprocess."""
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    
    # Run ffmpeg: read from stdin (pipe:0), output to stdout (pipe:1) in WAV format
    # Use shell=True for better Windows compatibility
    process = subprocess.Popen(
        f'"{ffmpeg_exe}" -i pipe:0 -f wav pipe:1',
        stdin=subprocess.PIPE,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        shell=True
    )
    
    stdout, stderr = process.communicate(input=audio_bytes)
    
    if process.returncode != 0:
        print(f"FFmpeg error: {stderr.decode()}")
        # Return original bytes if conversion fails (might be valid wav)
        return audio_bytes
        
    return stdout


# -----------------------------
# Function: Extract Embedding
# -----------------------------
def get_embedding(audio_bytes):
    # Convert to WAV first (handles webm from browser MediaRecorder)
    wav_bytes = convert_to_wav(audio_bytes)
    
    # Use soundfile instead of torchaudio.load (more robust on Windows)
    with io.BytesIO(wav_bytes) as audio_file:
        data, sample_rate = sf.read(audio_file)
    
    # Convert to torch tensor (Shape: [Channels, Time])
    if len(data.shape) == 1:
        # Mono: [Time] -> [1, Time]
        waveform = torch.from_numpy(data).float().unsqueeze(0)
    else:
        # Stereo: [Time, Channels] -> [Channels, Time]
        waveform = torch.from_numpy(data.T).float()

    # Ensure mono if stereo
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)

    embedding = classifier.encode_batch(waveform)
    return embedding.squeeze().detach().numpy()


# -----------------------------
# Function: Cosine Similarity
# -----------------------------
def cosine_similarity(a, b):
    return dot(a, b) / (norm(a) * norm(b))


# -----------------------------
# Function: Replay Attack Detection
# Uses spectral flatness analysis to detect pre-recorded audio.
# Real live speech has variable spectral characteristics;
# replayed audio through speakers tends to have more uniform
# spectral flatness with less natural variation.
# -----------------------------
def detect_replay_attack(audio_bytes):
    # Convert to WAV first
    wav_bytes = convert_to_wav(audio_bytes)
    
    # Use soundfile instead of torchaudio.load
    with io.BytesIO(wav_bytes) as audio_file:
        data, sample_rate = sf.read(audio_file)
    
    if len(data.shape) == 1:
        waveform = torch.from_numpy(data).float().unsqueeze(0)
    else:
        waveform = torch.from_numpy(data.T).float()

    # Convert to mono if stereo
    if waveform.shape[0] > 1:
        waveform = torch.mean(waveform, dim=0, keepdim=True)

    # Compute spectrogram
    n_fft = 1024
    hop_length = 512
    spectrogram = torchaudio.transforms.Spectrogram(
        n_fft=n_fft,
        hop_length=hop_length,
        power=2.0
    )(waveform)

    # Add small epsilon to avoid log(0)
    eps = 1e-10
    spec_np = spectrogram.squeeze().numpy() + eps

    # Compute spectral flatness per frame:
    # geometric_mean / arithmetic_mean
    # Low flatness = tonal (speech-like), High flatness = noise-like
    log_spec = np.log(spec_np)
    geometric_mean = np.exp(np.mean(log_spec, axis=0))
    arithmetic_mean = np.mean(spec_np, axis=0)
    spectral_flatness = geometric_mean / (arithmetic_mean + eps)

    # Analyze the variation in spectral flatness across frames
    flatness_std = float(np.std(spectral_flatness))
    flatness_mean = float(np.mean(spectral_flatness))

    # Replay indicators: Re-enabled as requested by user
    is_replay = False
    confidence = 0.0

    if flatness_std < 0.03:
        is_replay = True
        confidence = min(1.0, (0.03 - flatness_std) / 0.03 * 0.7 + 0.3)
    
    if flatness_mean > 0.6:
        is_replay = True
        confidence = max(confidence, min(1.0, (flatness_mean - 0.6) / 0.3 * 0.6 + 0.4))

    return {
        "is_replay": is_replay,
        "confidence": round(confidence, 3),
        "flatness_mean": round(flatness_mean, 4),
        "flatness_std": round(flatness_std, 4)
    }


# -----------------------------
# API 1: Extract Embedding
# -----------------------------
@app.post("/extract-embedding/")
async def extract_embedding(file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        embedding = get_embedding(audio_bytes)
        return {
            "embedding": embedding.tolist()
        }
    except Exception as e:
        return {
            "error": str(e),
            "embedding": []
        }


# -----------------------------
# API 2: Compare Embeddings
# -----------------------------
@app.post("/compare-embedding/")
async def compare_embedding(data: dict):
    try:
        emb1 = np.array(data["embedding1"])
        emb2 = np.array(data["embedding2"])

        if len(emb1) == 0 or len(emb2) == 0:
            return {"similarity_score": 0.0, "verified": False}

        score = cosine_similarity(emb1, emb2)
        return {
            "similarity_score": float(score),
            "verified": bool(score > 0.60)   #check the strictness scale
        }
    except Exception as e:
        return {
            "error": str(e),
            "similarity_score": 0.0,
            "verified": False
        }


# -----------------------------
# API 3: Verify Speaker (Combined)
# Accepts two audio files, extracts embeddings,
# compares them, and also checks for replay attacks.
# -----------------------------
@app.post("/verify-speaker/")
async def verify_speaker(
    file1: UploadFile = File(...),
    file2: UploadFile = File(...)
):
    try:
        bytes1 = await file1.read()
        bytes2 = await file2.read()

        # Extract embeddings
        emb1 = get_embedding(bytes1)
        emb2 = get_embedding(bytes2)

        # Compare
        score = cosine_similarity(emb1, emb2)
        verified = bool(score > 0.60) #check the strictness scale

        # Replay check on the new sample (file2 = the live recording)
        replay_result = detect_replay_attack(bytes2)

        # If replay detected, mark as not verified
        if replay_result["is_replay"]:
            verified = False

        return {
            "similarity_score": round(float(score), 4),
            "verified": verified,
            "replay_detection": replay_result
        }
    except Exception as e:
        return {
            "error": f"Internal Error: {str(e)}",
            "verified": False
        }


# -----------------------------
# API 4: Detect Replay (Standalone)
# -----------------------------
@app.post("/detect-replay/")
async def detect_replay(file: UploadFile = File(...)):
    audio_bytes = await file.read()
    result = detect_replay_attack(audio_bytes)
    return result