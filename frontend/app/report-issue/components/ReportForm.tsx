"use client";

import { reportSchema } from "@/app/lib/validations/reportSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation"; // ✅ Added for redirect

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportForm() {
  const router = useRouter(); // ✅ Initialize router
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [redirecting, setRedirecting] = useState<boolean>(false); // ✅ for loader before redirect

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
        setError(result.error || "Failed to submit issue");
        return;
      }

      setSuccess("✅ Issue reported successfully!");

      // ✅ Redirect after short delay
      setTimeout(() => {
        setRedirecting(true);
        router.push("/dashboard/citizen"); // 🔁 change route if needed
      }, 1500);
    } catch {
      setError("Server error. Please try again later.");
    }
  };
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

      {/* bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-blue-200/50 */}
      <div className="bg-white/80 backdrop-blur-lg border border-blue-200/40 shadow-2xl rounded-3xl p-10 w-full max-w-2xl transition-transform hover:scale-[1.01] duration-200">
        {/* text-3xl font-bold text-blue-700 mb-6 text-center */}
        <h2 className="text-4xl font-extrabold text-center mb-8 bg-clip-text text-blue-700">
          📝 Report an Issue
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-[#78716c] mb-1">
              Category
            </label>
            <select
              {...register("category")}
              className="w-full p-3 text-[#171717] border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none bg-white"
            >
              <option value="">Select Category</option>
              <option value="Sanitation">Sanitation</option>
              <option value="Roads">Roads</option>
              <option value="Electricity">Electricity</option>
            </select>
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

          {/* Voice Recording */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Voice Message (optional)
            </label>
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
              {recordedAudio && (
                <audio controls src={recordedAudio} className="mt-2 w-full" />
              )}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <p className="text-red-600 text-sm font-medium text-center">
              {error}
            </p>
          )}
          {success && (
            <p className="text-green-600 text-sm font-medium text-center">
              {success}
            </p>
          )}

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
