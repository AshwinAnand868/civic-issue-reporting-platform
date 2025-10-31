"use client";

import { reportSchema } from "@/app/lib/validations/reportSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportForm() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      priority: "Medium",
    },
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

      setSuccess("✅ Issue reported successfully!");
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

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/diqacdink/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      setValue("photo_url", data.secure_url);
    } catch (error) {
      console.error("Upload error:", error);
      setError("Photo upload failed.");
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
        if (e.data && e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);

          const formData = new FormData();
          formData.append("file", blob);
          formData.append("upload_preset", "unsigned_preset");

          const res = await fetch(
            `https://api.cloudinary.com/v1_1/diqacdink/video/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await res.json();
          if (data && data.secure_url) {
            setValue("voice_url", data.secure_url);
          } else {
            console.error("Cloudinary response:", data);
            setError("Failed to upload audio.");
          }
        } catch (err) {
          console.error("Audio upload failed:", err);
          setError("Failed to upload audio.");
        } finally {
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          mediaRecorderRef.current = null;
          setRecording(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied or not available.");
      setRecording(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e6f0ff] p-4">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-blue-100">
        <h2 className="text-3xl font-bold text-blue-700 mb-6 text-center">
          📝 Report an Issue
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
            <input
              {...register("title")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none placeholder-gray-400"
              placeholder="Enter issue title"
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea
              {...register("description")}
              rows={4}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none placeholder-gray-400"
              placeholder="Describe the issue in detail"
            />
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              {...register("category")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white"
            >
              <option value="">Select Category</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Roads">Roads</option>
              <option value="Electricity">Electricity</option>
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
            <select
              {...register("priority")}
              defaultValue="Medium"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
            <button
              type="button"
              onClick={handleDetectLocation}
              className="text-sm text-blue-600 hover:underline"
            >
              📍 Detect My Location
            </button>
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message as string}</p>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Photo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="w-full text-gray-600"
            />
          </div>

          {/* Voice Recording */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Voice Message (optional)</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleVoiceRecording}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  recording
                    ? "bg-red-600 text-white hover:bg-red-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {recording ? "⏹ Stop Recording" : " Record Voice"}
              </button>
              {recordedAudio && <audio controls src={recordedAudio} className="mt-2 w-full" />}
            </div>
          </div>

          {/* Error / Success */}
          {error && <p className="text-red-600 text-sm font-medium text-center">{error}</p>}
          {success && <p className="text-green-600 text-sm font-medium text-center">{success}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Submitting...
              </>
            ) : (
              "Submit Issue"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
