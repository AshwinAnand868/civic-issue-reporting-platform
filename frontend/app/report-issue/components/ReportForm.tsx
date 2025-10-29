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

  // recording state & refs
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

  // Location detection
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

  // Submit
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

  // Photo upload (unchanged)
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

  // Voice recording + upload logic (fixed)
  const handleVoiceRecording = async () => {
    setError("");

    // If currently recording -> stop
    if (recording) {
      // stop recorder and cleanup will happen in onstop handler
      mediaRecorderRef.current?.stop();
      return;
    }

    // Start recording
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
          // combine chunks
          const blob = new Blob(chunks, { type: "audio/webm" });

          // show local preview
          const url = URL.createObjectURL(blob);
          setRecordedAudio(url);

          // upload to Cloudinary (use video endpoint for audio)
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
          // cleanup media tracks
          if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach((t) => t.stop());
            mediaStreamRef.current = null;
          }
          mediaRecorderRef.current = null;
          setRecording(false);
        }
      };

      // start and set recording UI
      recorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Microphone error:", err);
      setError("Microphone access denied or not available.");
      setRecording(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-blue-600 mb-4 text-center">
        Report an Issue
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input {...register("title")} className="w-full p-2 border border-gray-300 rounded" />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea {...register("description")} rows={4} className="w-full p-2 border border-gray-300 rounded" />
          {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium">Category</label>
          <select {...register("category")} className="w-full p-2 border border-gray-300 rounded">
            <option value="">Select Category</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Roads">Roads</option>
            <option value="Electricity">Electricity</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm">{errors.category.message}</p>}
        </div>

        {/* Priority */}
        <div>
          <label className="block text-sm font-medium">Priority</label>
          <select {...register("priority")} defaultValue="Medium" className="w-full p-2 border border-gray-300 rounded">
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium">Location</label>
          <button type="button" onClick={handleDetectLocation} className="text-sm text-blue-600 underline">
            Detect My Location
          </button>
          {errors.location && <p className="text-red-500 text-sm">{errors.location.message as string}</p>}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium">Upload Photo</label>
          <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full p-2 border border-gray-300 rounded" />
        </div>

        {/* Voice Recording */}
        <div>
          <label className="block text-sm font-medium">Voice Message (optional)</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleVoiceRecording}
              className={`px-4 py-2 rounded ${recording ? "bg-red-600 text-white" : "bg-blue-600 text-white"} hover:opacity-90`}
            >
              {recording ? "Stop Recording" : "Record Voice"}
            </button>

            {recordedAudio && <audio controls src={recordedAudio} className="mt-2 w-full" />}
          </div>
        </div>

        {/* Error / Success */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
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
  );
}
