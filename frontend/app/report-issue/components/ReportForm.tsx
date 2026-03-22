"use client";

import { reportSchema } from "@/app/lib/validations/reportSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ReportFormData = z.infer<typeof reportSchema>;

<<<<<<< HEAD
=======
// Expected phrase for voice verification
const VERIFICATION_PHRASE = "Public.";

interface UserDetails {
  id: string;
  voice_base64?: string; // Stored sample voice data
  voice_sample_mime?: string; // Mime type for sample voice
}

>>>>>>> origin/main
// Custom Ref Type to track which recording process is active
interface RecorderRef {
  mediaRecorder: MediaRecorder | null;
  isVerification: boolean; // True if recording verification, false if recording issue
}

// -------------------------------------------------------
// TTS Helper: Speaks text aloud using browser Speech API
// Provides audio feedback for accessibility (illiterate users)
// -------------------------------------------------------
const speak = (text: string) => {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.lang = "en-IN"; // Indian English
    window.speechSynthesis.speak(utterance);
  }
};

export default function ReportForm() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [redirecting, setRedirecting] = useState<boolean>(false);

  // Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationAudioUrl, setVerificationAudioUrl] = useState<
    string | null
  >(null);
  const [verificationScore, setVerificationScore] = useState<number | null>(null);
  const [replayDetected, setReplayDetected] = useState<boolean>(false);

  // Issue recording state
  const [recording, setRecording] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [autoFilled, setAutoFilled] = useState(false);

  // Recorder refs
  const activeRecorderRef = useRef<RecorderRef | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      priority: "Medium",
    },
  });

  const currentVoiceUrl = watch("voice_url");

  // -------------------------------------------------------
  // Helper: Read blob as base64 data URL
  // -------------------------------------------------------
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const mimeType = blob.type;
      reader.onloadend = () => {
        const result = reader.result as string;
        if (result.startsWith(`data:${mimeType}`)) {
          resolve(result);
        } else {
          resolve(`data:${mimeType};base64,${btoa(result)}`);
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // -------------------------------------------------------
  // Helper: Start/Stop recording for any purpose
  // -------------------------------------------------------
  const startStopRecording = async (
    onStopCallback: (blob: Blob, url: string) => Promise<void>,
    isVerification: boolean
  ) => {
    setError("");

    // STOP Logic
    if (
      recording &&
      activeRecorderRef.current?.isVerification === isVerification
    ) {
      activeRecorderRef.current.mediaRecorder?.stop();
      return;
    }

    // Prevent starting if the other process is running
    if (
      recording &&
      activeRecorderRef.current?.isVerification !== isVerification
    ) {
      const msg = "Please stop the active recording before starting a new one.";
      setError(msg);
      speak(msg);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);

      activeRecorderRef.current = {
        mediaRecorder: recorder,
        isVerification: isVerification,
      };

      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          await onStopCallback(blob, url);
        } catch (err) {
          console.error("Audio processing failed:", err);
          const msg = "Failed to process audio.";
          setError(msg);
          speak(msg);
        } finally {
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          activeRecorderRef.current = null;
          setRecording(false);
        }
      };

      if (isVerification) {
        setVerificationAudioUrl(null);
        setIsVerified(false);
        setVerificationScore(null);
        setReplayDetected(false);
      } else {
        setRecordedAudio(null);
        setValue("voice_url", undefined);
      }

      recorder.start();
      setRecording(true);

      // TTS feedback
      if (isVerification) {
        speak("Recording started. Please speak now for voice verification.");
      } else {
        speak("Recording started. Please describe your issue now.");
      }
    } catch (err) {
      console.error("Microphone error:", err);
      const msg = "Microphone access denied or not available.";
      setError(msg);
      speak(msg);
      setRecording(false);
    }
  };

  // -------------------------------------------------------
  // Step 1: Handle Verification Recording
  // Uses biometric speaker verification via the Python service
  // -------------------------------------------------------
  const handleVerificationRecording = () => {
    startStopRecording(handleVerificationStop, true);
  };

  const handleVerificationStop = async (blob: Blob, url: string) => {
    setVerificationAudioUrl(url);
    setIsVerifying(true);
    setSuccess("Audio recorded. Verifying your voice identity...");
    speak("Audio recorded. Verifying your voice identity. Please wait.");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const msg = "You must be logged in to verify voice.";
        setError(msg);
        speak(msg);
        setIsVerifying(false);
        return;
      }

      // Send the voice sample to the biometric verification endpoint
      const formData = new FormData();
      formData.append("voice_sample", blob, "verification_sample.webm");

      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
      const res = await fetch(`${API_BASE}/api/auth/verify-voice`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.error || "Voice verification failed.";
        setError(msg);
        speak(msg);
        setIsVerifying(false);
        return;
      }

      setVerificationScore(data.similarity_score);
      setReplayDetected(data.replay_detection?.is_replay || false);

      if (data.verified) {
        setIsVerified(true);
        const msg =
          "Voice verified successfully! You can now record your complaint.";
        setSuccess(`✅ ${msg} (Similarity: ${(data.similarity_score * 100).toFixed(1)}%)`);
        speak(msg);
      } else {
        setIsVerified(false);
        const msg = data.replay_detection?.is_replay
          ? "Replay attack detected! Please speak live into the microphone. Do not play a recording."
          : "Voice verification failed. Your voice does not match the registered sample. Please try again.";
        setError(msg);
        speak(msg);
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Server error during voice verification.";
      setError(msg);
      speak(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  // -------------------------------------------------------
  // Step 2: Handle Issue Recording
  // Records, uploads to Cloudinary, then auto-fills form
  // -------------------------------------------------------
  const handleIssueRecording = () => {
    if (!isVerified) {
      const msg =
        "You must verify your voice first before recording your complaint.";
      setError(msg);
      speak(msg);
      return;
    }
    startStopRecording(handleIssueStop, false);
  };

  const handleIssueStop = async (blob: Blob, url: string) => {
    setRecordedAudio(url);
    setSuccess("Issue audio recorded. Uploading...");
    speak("Issue audio recorded. Uploading and processing your complaint.");

    // 1. Upload to Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append("file", blob);
    cloudinaryFormData.append("upload_preset", "unsigned_preset");

    try {
      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/diqacdink/video/upload`,
        { method: "POST", body: cloudinaryFormData }
      );

      const cloudData = await cloudRes.json();
      if (cloudData && cloudData.secure_url) {
        setValue("voice_url", cloudData.secure_url);
        setSuccess("✅ Audio uploaded. Now extracting complaint details...");
      } else {
        console.error("Cloudinary response:", cloudData);
        setError("Failed to upload issue audio.");
        speak("Failed to upload audio. Please try again.");
        return;
      }
    } catch (err) {
      console.error("Audio upload failed:", err);
      setError("Failed to upload issue audio.");
      speak("Failed to upload audio. Please try again.");
      return;
    }

    // 2. Auto-fill form fields from voice using NLP
    setIsExtracting(true);
    try {
      const token = localStorage.getItem("token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

      const audioBase64 = await blobToBase64(blob);

      const extractRes = await fetch(
        `${API_BASE}/api/transcribe/extract-fields`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            audio_base64: audioBase64,
            audio_mime: blob.type,
          }),
        }
      );

      const extractData = await extractRes.json();

      if (extractRes.ok && extractData.fields) {
        const { title, description, category, priority } = extractData.fields;

        setValue("title", title);
        setValue("description", description);
        setValue("category", category);
        setValue("priority", priority);

        setAutoFilled(true);
        const msg = `Form auto-filled from your voice! Title: ${title}. Category: ${category}. Priority: ${priority}. You can review and edit the fields below.`;
        setSuccess(`🤖 ${msg}`);
        speak(msg);
      } else {
        console.error("Field extraction failed:", extractData);
        setSuccess(
          "✅ Audio uploaded, but auto-fill could not extract fields. Please fill the form manually."
        );
        speak(
          "Audio uploaded successfully, but I could not extract details from your speech. Please fill the form manually."
        );
      }
    } catch (err) {
      console.error("Field extraction error:", err);
      setSuccess(
        "✅ Audio uploaded, but auto-fill failed. Please fill the form manually."
      );
      speak(
        "Audio uploaded successfully, but auto-fill failed. Please fill the form manually."
      );
    } finally {
      setIsExtracting(false);
    }
  };

  // -------------------------------------------------------
  // Auto-categorize from typed description
  // -------------------------------------------------------
  const handleAutoCategorize = async () => {
    const description = watch("description");
    if (!description || description.trim().length < 10) {
      const msg = "Please enter a longer description first (at least 10 characters).";
      setError(msg);
      speak(msg);
      return;
    }

    setIsExtracting(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

      const res = await fetch(`${API_BASE}/api/transcribe/extract-fields`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: description }),
      });

      const data = await res.json();
      if (res.ok && data.fields) {
        setValue("category", data.fields.category);
        setValue("priority", data.fields.priority);
        if (!watch("title") || watch("title").trim() === "") {
          setValue("title", data.fields.title);
        }
        const msg = `Auto-suggested: Category is ${data.fields.category}, Priority is ${data.fields.priority}.`;
        setSuccess(`🤖 ${msg}`);
        speak(msg);
      } else {
        setError("Could not auto-categorize. Please select manually.");
      }
    } catch (err) {
      console.error(err);
      setError("Auto-categorize failed. Please select manually.");
    } finally {
      setIsExtracting(false);
    }
  };

  // -------------------------------------------------------
  // Location detection
  // -------------------------------------------------------
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("location", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        } as any);
        speak("Location detected successfully.");
      },
      () => {
        const msg = "Failed to fetch location.";
        setError(msg);
        speak(msg);
      }
    );
  };

  // -------------------------------------------------------
  // Photo upload
  // -------------------------------------------------------
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/diqacdink/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      setValue("photo_url", data.secure_url);
      speak("Photo uploaded successfully.");
    } catch (error) {
      console.error("Upload error:", error);
      setError("Photo upload failed.");
      speak("Photo upload failed.");
    }
  };

  // -------------------------------------------------------
  // Form submission
  // -------------------------------------------------------
  const onSubmit = async (data: ReportFormData) => {
    setError("");
    setSuccess("");
    setRedirecting(false);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/issues`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            location: {
              type: "Point",
              coordinates: [data.location.lng, data.location.lat],
            },
          }),
        }
      );

      const result = await res.json();
      if (!res.ok) {
        const msg = result.error || "Failed to submit issue";
        setError(msg);
        speak(msg);
        return;
      }

      const msg =
        "Your complaint has been submitted successfully! Redirecting to dashboard.";
      setSuccess(`✅ ${msg}`);
      speak(msg);

      setTimeout(() => {
        setRedirecting(true);
        router.push("/dashboard/citizen");
      }, 2500);
    } catch {
      const msg = "Server error. Please try again later.";
      setError(msg);
      speak(msg);
    }
  };

  // Helper for button disabled states
  const isVerificationButtonDisabled =
    isVerifying || (recording && !activeRecorderRef.current?.isVerification);

  const isIssueButtonDisabled =
    !isVerified ||
    isVerifying ||
    isExtracting ||
    (recording && activeRecorderRef.current?.isVerification);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100
 p-4 "
    >
      {/* Left blob */}
      {/* ROAD POTHHOLES */}
      <svg
        className="absolute left-[190px] top-[10px] w-[190px] opacity-25 text-yellow-400 z-0 hidden md:block animate-blink"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M471.3 373.9c-8.9-16.6-30.5-23-47.1-14.1l-55.9 30.1-50.6-83.6 50.9-83.8 55.5 29.8c16.6 8.9 38.2 2.6 47.1-14.1 8.9-16.6 2.6-38.2-14.1-47.1l-71.9-38.7 24.6-40.5c7.9-13.1 3.7-30.1-9.4-38-13.1-7.9-30.1-3.7-38 9.4l-29.7 49-38.4-20.7V64h32c17.7 0 32-14.3 32-32S358.3 0 340.6 0H171.4C153.7 0 139.4 14.3 139.4 32s14.3 32 32 32h32v67.6l-38.4 20.7-29.7-49c-7.9-13.1-24.9-17.3-38-9.4-13.1 7.9-17.3 24.9-9.4 38l24.6 40.5-71.9 38.7c-16.6 8.9-23 30.5-14.1 47.1 8.9 16.6 30.5 23 47.1 14.1l55.5-29.8 50.9 83.8-50.6 83.6-55.9-30.1c-16.6-8.9-38.2-2.6-47.1 14.1-8.9 16.6-2.6 38.2 14.1 47.1l71.9 38.7-24.6 40.5c-7.9 13.1-3.7 30.1 9.4 38 13.1 7.9 30.1 3.7 38-9.4l29.7-49 38.4 20.7V448h64v67.6l38.4-20.7 29.7 49c7.9 13.1 24.9 17.3 38 9.4 13.1-7.9 17.3-24.9 9.4-38l-24.6-40.5 71.9-38.7c16.6-8.9 23-30.5 14.1-47.1zM256 320l-36-59.3L256 201.3l36 59.3L256 320z"
        />
      </svg>
      {/* Left: Map + Location pin */}
      <svg
        className="absolute left-[-30px] top-1/2 -translate-y-1/2 w-[250px] opacity-30 text-red-400 z-0 hidden md:block"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M256 0C167.6 0 96 71.6 96 160c0 112 160 352 160 352s160-240 160-352C416 71.6 344.4 0 256 0zm0 224c-35.3 0-64-28.7-64-64s28.7-64 64-64s64 28.7 64 64s-28.7 64-64 64z"
        />
      </svg>

      {/* Right blob */}
      {/* WRENCH */}
      <svg
        className="absolute right-[-50px] top-1/3 w-[340px] opacity-25 text-blue-500 z-0 hidden md:block"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M501.1 395.2l-84.4-84.4c19.3-45.9 10-101.5-27.8-139.4s-93.5-47.1-139.4-27.8l84.4 84.4-90.5 90.5-84.4-84.4c-19.3 45.9-10 101.5 27.8 139.4s93.5 47.1 139.4 27.8l84.4 84.4c9.4 9.4 24.6 9.4 33.9 0l56.6-56.6c9.4-9.3 9.4-24.5 0-33.9z"
        />
      </svg>

      {/* DUSTBIN */}
      <svg
        className="absolute right-[150px] top-[40px] w-[200px] opacity-25 text-green-500 z-0 hidden md:block"
        viewBox="0 0 512 512"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fill="currentColor"
          d="M432 96h-82.4l-34-56.7C312.1 31.6 306.2 28 300 28H212c-6.2 0-12.1 3.6-15.6 11.3L162.4 96H80c-8.8 0-16 7.2-16 16s7.2 16 16 16h16v320c0 30.9 25.1 56 56 56h208c30.9 0 56-25.1 56-56V128h16c8.8 0 16-7.2 16-16s-7.2-16-16-16zM213.7 64h84.6l20 32H193.7l20-32zM368 448c0 13.2-10.8 24-24 24H176c-13.2 0-24-10.8-24-24V128h216v320zm-160-240v176c0 8.8-7.2 16-16 16s-16-7.2-16-16V208c0-8.8 7.2-16 16-16s16 7.2 16 16zm64 0v176c0 8.8-7.2 16-16 16s-16-7.2-16-16V208c0-8.8 7.2-16 16-16s16 7.2 16 16zm64 0v176c0 8.8-7.2 16-16 16s-16-7.2-16-16V208c0-8.8 7.2-16 16-16s16 7.2 16 16z"
        />
      </svg>

      <div className="bg-white/80 backdrop-blur-lg border border-blue-200/40 shadow-2xl rounded-3xl p-10 w-full max-w-2xl transition-transform hover:scale-[1.01] duration-200">
        <h2 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-blue-700">
          📝 Report an Issue
<<<<<<< HEAD
        </h2>

        {/* --- STEP 1: VOICE IDENTITY VERIFICATION --- */}
        <div className="space-y-3 mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            🔐 Step 1: Voice Identity Verification
          </h3>
          <p className="text-sm text-gray-600">
            Speak into your microphone to verify your identity. Your voice will
            be compared against your registered voice sample using biometric
            analysis.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleVerificationRecording}
              disabled={isVerificationButtonDisabled}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                isVerified
                  ? "bg-green-600"
                  : isVerifying ||
                    (recording && activeRecorderRef.current?.isVerification)
                  ? "bg-red-600 animate-pulse"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white disabled:opacity-50 flex items-center gap-2`}
            >
              {isVerified ? (
                "✅ Verified"
              ) : isVerifying ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Verifying...
                </>
              ) : recording && activeRecorderRef.current?.isVerification ? (
                "⏹️ Stop Speaking"
              ) : (
                "🎙️ Start Verification"
              )}
            </button>
            {verificationAudioUrl && (
              <audio
                controls
                src={verificationAudioUrl}
                className="w-full max-w-xs h-10"
              />
            )}
          </div>

          {/* Verification details */}
          {verificationScore !== null && (
            <div
              className={`text-xs p-2 rounded ${
                isVerified
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              <p>
                Similarity Score:{" "}
                <strong>{(verificationScore * 100).toFixed(1)}%</strong>
                {verificationScore > 0.75 ? " ✓" : " ✗"}
              </p>
              {replayDetected && (
                <p className="text-red-600 font-semibold mt-1">
                  ⚠️ Replay attack detected — please speak live!
                </p>
              )}
=======
        </h2>        
        {/* --- VOICE AUTHENTICATION SECTION --- */}
        <div className="space-y-3">
            <h3 className="text-lg font-bold text-gray-800">Voice Verification</h3>
            <p className="text-sm text-gray-600">
                To enable voice recording for the issue, please speak the exact phrase: 
                <span className="font-semibold text-blue-600 ml-1">"{VERIFICATION_PHRASE}"</span>
            </p>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={handleVerificationRecording}
                    // 💡 FIX: Use the calculated helper function. Enabled when recording, or when ready to start.
                    disabled={isVerificationButtonDisabled} 
                    className={`px-4 py-2 rounded ${
                        isVerified ? "bg-green-600" : isVerifying || (recording && activeRecorderRef.current?.isVerification) ? "bg-red-600" : "bg-blue-600"
                    } text-white hover:opacity-90 disabled:opacity-50 flex items-center gap-2`}
                >
                    {isVerified ? (
                        "✅ Verified"
                    ) : isVerifying ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4" />
                            Verifying...
                        </>
                    ) : (recording && activeRecorderRef.current?.isVerification) ? (
                        "Stop Speaking"
                    ) : (
                        "Start Verification"
                    )}
                </button>
                {verificationAudioUrl && (
                    <audio controls src={verificationAudioUrl} className="mt-2 w-full max-w-xs" />
                )}
>>>>>>> origin/main
            </div>
          )}
        </div>
<<<<<<< HEAD

        <hr className="my-4" />

        {/* --- STEP 2: RECORD YOUR COMPLAINT --- */}
        <div className="space-y-3 mb-4">
          <h3 className="text-lg font-bold text-gray-800">
            🎤 Step 2: Record Your Complaint
          </h3>
          <p className="text-sm text-gray-600">
            {isVerified
              ? "Describe your civic issue by speaking. The system will automatically fill the form with your complaint details."
              : "Please complete voice verification first (Step 1) before recording your issue."}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleIssueRecording}
              disabled={isIssueButtonDisabled}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                recording && !activeRecorderRef.current?.isVerification
                  ? "bg-red-600 animate-pulse"
                  : isVerified
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              } text-white disabled:opacity-50 flex items-center gap-2`}
            >
              {isExtracting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4" />
                  Processing...
                </>
              ) : recording && !activeRecorderRef.current?.isVerification ? (
                "⏹️ Stop Recording"
              ) : (
                "🎙️ Record Issue Voice"
              )}
=======
        {error ? <p className="text-red-500 text-sm">{error}</p> 
          :<p className="text-green-600 text-sm">{success}</p>}
        <hr className="my-4" />
        
        {/* --- VOICE RECORDING FOR ISSUE --- */}
        {/* Error / Success */}
        <div className="mb-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Voice Message (optional)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleIssueRecording}
              // 💡 FIX: Use the calculated helper function.
              disabled={isIssueButtonDisabled} 
              className={`px-4 py-2 rounded mb-2 ${
                (recording && !activeRecorderRef.current?.isVerification) ? "bg-red-600" : isVerified ? "bg-blue-600" : "bg-gray-400"
              } text-white hover:opacity-90 disabled:opacity-50`}
              >
              {(recording && !activeRecorderRef.current?.isVerification) ? "Stop Recording" : "Record Issue Voice"}
>>>>>>> origin/main
            </button>

            {recordedAudio && (
              <audio controls src={recordedAudio} className="w-full max-w-xs h-10" />
            )}
          </div>
<<<<<<< HEAD

          {/* Auto-fill indicator */}
          {autoFilled && (
            <div className="text-xs p-2 rounded bg-blue-50 text-blue-700 border border-blue-200">
              🤖 Form fields were auto-filled from your voice recording. You can
              review and edit them below.
            </div>
          )}
        </div>
=======
        </div> 
>>>>>>> origin/main

        <hr className="my-4" />

        {/* --- STEP 3: REVIEW & SUBMIT FORM --- */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <h3 className="text-lg font-bold text-gray-800">
            📋 Step 3: Review & Submit
          </h3>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Title
            </label>
            <input
              {...register("title")}
              className="w-full p-3 text-[#171717] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none placeholder-gray-400"
              placeholder="Enter issue title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full text-[#171717] p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none placeholder-gray-400"
              placeholder="Describe the issue in detail"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Category with Auto-suggest button */}
          <div>
            <label className="block text-sm font-semibold text-[#78716c] mb-1">
              Category
            </label>
            <div className="flex gap-2 items-center">
              <input
                {...register("category")}
                className="flex-1 p-3 text-[#171717] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none placeholder-gray-400 bg-white"
                placeholder="Category (e.g., Waste, Roads, Parks)"
              />
              <button
                type="button"
                onClick={handleAutoCategorize}
                disabled={isExtracting}
                className="px-3 py-2 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold disabled:opacity-50 flex items-center gap-1 whitespace-nowrap"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="animate-spin h-3 w-3" />
                    Analyzing...
                  </>
                ) : (
                  "🤖 Auto-suggest"
                )}
              </button>
            </div>
            {errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm text-[#78716c] font-semibold mb-1">
              Priority
            </label>
            <select
              {...register("priority")}
              defaultValue="Medium"
              className="w-full p-3 text-[#171717]  border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Location
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-sm text-blue-600 hover:underline"
            >
              📍 Detect My Location
            </button>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">
                {errors.location.message as string}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-gray-600"
            />
          </div>

          {/* Error / Success */}
<<<<<<< HEAD
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-600 text-sm">{success}</p>}

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting || redirecting}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow transition-all duration-200 flex items-center justify-center"
            >
              {isSubmitting || redirecting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />{" "}
                  Submitting...
                </>
              ) : (
                "Submit Issue"
              )}
            </button>

            {/* Dashboard Button */}
            <button
              type="button"
              onClick={() => router.push("/dashboard/citizen")}
              className="w-full sm:w-auto px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow transition-all duration-200"
            >
              Go to Dashboard
            </button>
          </div>
=======
          {/* {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>)} */}
      

        {/* Submit */}
        <button 
            type="submit" 
            disabled={isSubmitting || (Boolean(currentVoiceUrl) && !isVerified)} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Submitting...
            </>
          ) : (
            "Submit Issue"
          )}
          {/* {success && (
            <p className="text-green-600 text-sm font-medium text-center">
              {success}
            </p>
          )} */}
          </button>
>>>>>>> origin/main
        </form>
      </div>
    </div>
  );
}
