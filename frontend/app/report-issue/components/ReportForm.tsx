"use client";

import { reportSchema } from "@/app/lib/validations/reportSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Mic,
  StopCircle,
  MapPin,
  Upload,
  CheckCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: { priority: "Medium" },
  });

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
      },
      () => setError("Failed to fetch location.")
    );
  };

  const onSubmit = async (data: ReportFormData) => {
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/api/issues`, {
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
      });

      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Failed to submit issue");
        return;
      }

      setSuccess("Issue reported successfully!");
    } catch {
      setError("Server error. Please try again later.");
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "unsigned_preset");

    setUploading(true);
    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/diqacdink/image/upload`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      setValue("photo_url", data.secure_url);
      setSuccess("✅ Photo uploaded successfully!");
    } catch {
      setError("Photo upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceRecording = async () => {
    setError("");
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setRecordedAudio(url);

        const formData = new FormData();
        formData.append("file", blob);
        formData.append("upload_preset", "unsigned_preset");

        try {
          const res = await fetch(
            `https://api.cloudinary.com/v1_1/diqacdink/video/upload`,
            { method: "POST", body: formData }
          );
          const data = await res.json();
          if (data.secure_url) setValue("voice_url", data.secure_url);
          else setError("Failed to upload audio.");
        } catch {
          setError("Audio upload failed.");
        } finally {
          mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
          setRecording(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch {
      setError("Microphone access denied or not available.");
      setRecording(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-6">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-500 animate-gradient-slow"></div>

      {/* Floating Blur Circles */}
      <div className="absolute w-72 h-72 bg-pink-400 opacity-30 rounded-full blur-3xl top-10 left-10 animate-float-slow"></div>
      <div className="absolute w-80 h-80 bg-blue-400 opacity-30 rounded-full blur-3xl bottom-20 right-10 animate-float-fast"></div>

      {/* Form Card */}
      <div className="relative bg-white/90 backdrop-blur-lg shadow-2xl border border-white/40 rounded-3xl p-8 w-full max-w-lg transition-all hover:shadow-blue-300 animate-fade-in">
        <h2 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-purple-700 to-cyan-500 mb-6">
          🚩 Report an Issue
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-gray-800">
          {/* Title */}
          <div>
            <label className="font-semibold text-gray-700">Title</label>
            <input
              {...register("title")}
              className="mt-1 w-full p-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="e.g., Broken streetlight near park"
            />
            {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="font-semibold text-gray-700">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="mt-1 w-full p-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-400"
              placeholder="Describe the issue clearly..."
            />
          </div>

          {/* Category & Priority */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="font-semibold text-gray-700">Category</label>
              <select
                {...register("category")}
                className="mt-1 w-full p-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800"
              >
                <option value="">Select</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Roads">Roads</option>
                <option value="Electricity">Electricity</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-gray-700">Priority</label>
              <select
                {...register("priority")}
                className="mt-1 w-full p-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-700 flex items-center gap-1">
              <MapPin className="w-4 h-4" /> Location
            </span>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Detect My Location
            </button>
          </div>

          {/* Photo Upload */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <Upload className="w-4 h-4" /> Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="mt-1 w-full p-3 bg-white/80 border border-gray-300 rounded-xl text-gray-800"
            />
            {uploading && <p className="text-blue-600 text-sm mt-1">Uploading...</p>}
          </div>

          {/* Voice Recording */}
          <div>
            <label className="font-semibold text-gray-700 flex items-center gap-2">
              <Mic className="w-4 h-4" /> Voice Message (optional)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceRecording}
                className={`px-4 py-2 rounded-xl text-white font-medium shadow transition ${
                  recording
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {recording ? (
                  <span className="flex items-center gap-2">
                    <StopCircle className="w-4 h-4" /> Stop
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Mic className="w-4 h-4" /> Record
                  </span>
                )}
              </button>
              {recordedAudio && (
                <audio controls src={recordedAudio} className="mt-2 w-full rounded-lg"></audio>
              )}
            </div>
          </div>

          {/* Error & Success */}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && (
            <p className="text-green-600 text-sm text-center flex items-center justify-center gap-1">
              <CheckCircle className="w-4 h-4" /> {success}
            </p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-700 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow-lg hover:scale-105 hover:shadow-xl transition-transform duration-300"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" /> Submitting...
              </>
            ) : (
              "Submit Issue"
            )}
          </button>
        </form>
      </div>

      {/* Keyframes */}
      <style jsx global>{`
        @keyframes gradient-slow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-fast {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(25px);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-gradient-slow {
          background-size: 400% 400%;
          animation: gradient-slow 12s ease infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-float-fast {
          animation: float-fast 6s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
