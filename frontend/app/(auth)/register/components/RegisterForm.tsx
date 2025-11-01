"use client";

import { registerSchema } from "@/app/lib/validations/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type RegisterFormData = z.infer<typeof registerSchema>;

// Required phrase for the voice sample
const REQUIRED_PHRASE = "Janta";

export default function RegistrationForm() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "citizen",
    },
  });

  const router = useRouter();
  const selectedRole = watch("role");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

  // Fetch departments for admin users
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch(
          `${API_BASE}/api/departments`
        );
        const data = await res.json();
        setDepartments(data);
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    }
    fetchDepartments();
  }, [API_BASE]);

  // Start voice recording
  const startRecording = async () => {
    setError("");
    setSuccess("");
    setVoiceFile(null); // Clear previous recording

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunks.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) audioChunks.current.push(event.data);
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
          const file = new File([audioBlob], "voice_sample.webm", {
            type: "audio/webm",
          });
          setAudioURL(URL.createObjectURL(audioBlob));
          setVoiceFile(file);
          setSuccess("Voice sample recorded. Remember to speak the required phrase!");
        };

        mediaRecorder.start();
        setRecording(true);
    } catch (err) {
        console.error("Microphone access error:", err);
        setError("Microphone access denied or not available.");
        setRecording(false);
    }
  };

  // Stop voice recording
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) =>
        formData.append(key, value as string)
      );

      // The voice file is optional, but if recorded, it's added.
      if (voiceFile) formData.append("voice_sample", voiceFile);
      
      const res = await fetch(
        `${API_BASE}/api/auth/register`,
        {
          method: "POST",
          body: formData,
        }
      );

      const returned = await res.json();

      if (!res.ok) {
        setError(returned.error || "Something went wrong");
        return;
      }

      setSuccess(returned.message);
      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Server error. Please try again later.");
    }
  };

  return (
    <div className="bg-transparent sm:rounded-2xl">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="shadow-md p-6 space-y-4"
      >
        <h2 className="text-2xl text-blue-600 font-semibold text-center">
          Register
        </h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-bold mb-1">Full Name</label>
          <input
            {...register("name")}
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-bold mb-1">Email</label>
          <input
            {...register("email")}
            type="email"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-bold mb-1">
            Phone (optional)
          </label>
          <input
            {...register("phone")}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.phone && (
            <p className="text-red-500 text-sm">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-bold mb-1">
            Address (optional)
          </label>
          <input
            {...register("address")}
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address.message}</p>
          )}
        </div>

        {/* Role */}
        <div>
          <label className="block text-sm font-bold mb-1">Role</label>
          <select
            {...register("role")}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="citizen">Citizen</option>
            <option value="admin">Admin</option>
          </select>
          {errors.role && (
            <p className="text-red-500 text-sm">{errors.role.message}</p>
          )}
        </div>

        {/* Department (only if admin) */}
        {selectedRole === "admin" && (
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              {...register("department_id")}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select Department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            {errors.department_id && (
              <p className="text-red-500 text-sm">
                {errors.department_id.message}
              </p>
            )}
          </div>
        )}

        {/* Password */}
        <div>
          <label className="block text-sm font-bold mb-1">Password</label>
          <input
            {...register("password")}
            type="password"
            className="w-full p-2 border border-gray-300 rounded"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>

        {/* Voice Recording (UPDATED UI/Logic) */}
        <div className="space-y-2 border p-3 rounded bg-gray-50">
          <label className="block text-sm font-bold mb-1 text-gray-800">
            Voice Sample (Mandatory for Reporting)
          </label>
          
          <p className="text-sm text-gray-600">
            Please speak the **exact phrase**: 
            <span className="font-semibold text-blue-600 ml-1">"{REQUIRED_PHRASE}"</span>. 
            This sample is required for your future voice authentication when reporting an issue.
          </p>
          
          <div className="flex gap-3 items-center">
            {/* Recording Button */}
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              className={`flex items-center gap-1 text-white px-3 py-1 rounded transition-colors ${
                recording ? "bg-red-600 hover:bg-red-700" : 
                "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {recording ? (
                "⏹️ Stop Speaking"
              ) : (
                "🎙️ Start Recording"
              )}
            </button>
            
            {/* Audio Player */}
            {audioURL && (
              <audio
                controls
                src={audioURL}
                className="w-full rounded max-w-[200px]"
              />
            )}
          </div>
        </div>

        {/* Error / Success */}
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">{success}</p>}


        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting} // NOTE: You may want to disable if voiceFile is null
          className="flex items-center font-bold justify-center gap-2 cursor-pointer w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              Registering...
            </>
          ) : (
            "Register"
          )}
        </button>

        <p className="text-sm text-center font-bold text-white-700">
          Already part of JanBol?{" "}
          <Link
            href="/login"
            className="text-blue-600 font-semibold hover:underline hover:text-blue-800 transition-colors"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}