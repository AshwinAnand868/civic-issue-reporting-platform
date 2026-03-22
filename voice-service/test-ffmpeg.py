import subprocess
import imageio_ffmpeg
import os

def test_ffmpeg():
    ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
    print(f"Using FFmpeg: {ffmpeg_exe}")
    
    # Create a dummy input file if needed, or just pipe empty
    # For a real test, let's try to convert nothing to wav and see if it errors
    try:
        process = subprocess.Popen(
            f'"{ffmpeg_exe}" -version',
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            shell=True
        )
        stdout, stderr = process.communicate()
        print(f"Return code: {process.returncode}")
        if process.returncode == 0:
            print("FFmpeg -version success")
        else:
            print(f"FFmpeg failed: {stderr.decode()}")
            
    except Exception as e:
        print(f"Subprocess crash: {e}")

test_ffmpeg()
