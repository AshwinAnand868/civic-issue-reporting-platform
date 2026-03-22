"use client";

// import { useAuthStore } from "@/lib/store/auth";
import { loginSchema } from "@/app/lib/validations/loginSchema";
import { Transition, TransitionChild } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Shield, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [error, setError] = useState<string>("");
  const router = useRouter();
  //   const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);

  // forgot password modal
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // Voice Login State
  const [loginMethod, setLoginMethod] = useState<"password" | "voice">("password");
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [voiceFile, setVoiceFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string>("");
  const [verificationScore, setVerificationScore] = useState<number | null>(null);
  const [replayDetected, setReplayDetected] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  // Start voice recording
  const startRecording = async () => {
    setError("");
    setSuccess("");
    setVoiceFile(null);

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
        const file = new File([audioBlob], "voice_login_sample.webm", {
          type: "audio/webm",
        });
        setAudioURL(URL.createObjectURL(audioBlob));
        setVoiceFile(file);
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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // handle outside click + escape for modal
  useEffect(() => {
    if (!showForgotPasswordModal) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowForgotPasswordModal(false);
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setShowForgotPasswordModal(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showForgotPasswordModal]);

  // login submit
  const onSubmit = async (data: LoginFormData) => {
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      let res;
      let returned;

      if (loginMethod === "password") {
        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );
        returned = await res.json();
      } else {
        // Voice Login
        if (!voiceFile) {
          setError("Please record a voice sample first.");
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append("email", data.email);
        formData.append("voice_sample", voiceFile);

        res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/voice-login`,
          {
            method: "POST",
            body: formData,
          }
        );
        returned = await res.json();

        // Capture score and replay status for feedback
        if (returned.similarity_score !== undefined) {
          setVerificationScore(returned.similarity_score);
        }
        if (returned.replay_detection) {
          setReplayDetected(returned.replay_detection.is_replay);
        }
      }

      if (!res.ok) {
        setError(returned.error || "Something went wrong");
        return;
      }

      // ✅ Store JWT and user info
      localStorage.setItem("token", returned.token);
      localStorage.setItem("user", JSON.stringify(returned.user)); // optional
      console.log(localStorage.getItem("user"));
      // redirect to dashboard
      // we have to write if condition here if admin redirect to admin dashbaord
      // if citizen redirect to citizen dashboard

      if (returned.user.role == "admin") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/citizen");
      }
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[url(/LoginPage2.jpg)] bg-contain bg-[position:50%_85%] flex items-center justify-end px-4">
      <div className="bg-black/50 backdrop-blur-md w-full h-[70vh] max-w-md lg:Kmax-w-sm rounded-xl shadow-md p-6 border border-gray-800 text-white ">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6">
          Welcome Back
        </h2>

        {/* Tabs for Login Type */}
        <div className="flex justify-center mb-6 space-x-4">
          <button
            type="button"
            onClick={() => setLoginMethod("password")}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
              loginMethod === "password"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => setLoginMethod("voice")}
            className={`px-4 py-2 font-semibold text-sm rounded-lg transition ${
              loginMethod === "voice"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            Voice Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-100 mb-1">
              Email
            </label>
            <input
              {...register("email")}
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-200"
            />
            {errors.email && (
              <p className="text-rose-400 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input (Only for Password Login) */}
          {loginMethod === "password" && (
            <div>
              <label className="block text-sm font-medium text-gray-100 mb-1">
                Password
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-gray-200 "
              />
              {errors.password && (
                <p className="text-rose-400 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Voice Login Recorder (Only for Voice Login) */}
          {loginMethod === "voice" && (
            <div className="space-y-2 border border-gray-700 p-4 rounded-lg bg-gray-900/50">
              <label className="block text-sm font-medium text-gray-100 mb-1">
                Voice Authentication
              </label>
              <p className="text-xs text-gray-400 mb-3">
                Please speak the exact phrase you registered with to authenticate (e.g., "Janta").
              </p>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={recording ? stopRecording : startRecording}
                  className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                    recording
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {recording ? "⏹️ Stop Recording" : "🎙️ Start Recording"}
                </button>

                {audioURL && (
                  <audio
                    controls
                    src={audioURL}
                    className="w-full rounded-md h-10 mt-2"
                  />
                )}
              </div>

              {/* Score Feedback */}
              {verificationScore !== null && (
                <div
                  className={`mt-4 text-xs p-3 rounded-lg border ${
                    verificationScore > 0.75
                      ? "bg-green-900/40 text-green-300 border-green-700"
                      : "bg-red-900/40 text-red-300 border-red-700"
                  }`}
                >
                  <p className="font-semibold">
                    Biometric Identity Match: {(verificationScore * 100).toFixed(1)}%
                    {verificationScore > 0.75 ? " ✓" : " ✗"}
                  </p>
                  <p className="text-[10px] mt-1 text-gray-400">
                    Required for entry: 75.0%
                  </p>
                  {replayDetected && (
                    <p className="text-rose-400 font-bold mt-2">
                      ⚠️ Replay attack detected. Please speak live into the microphone!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-rose-400 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || loading || (loginMethod === "voice" && !voiceFile)}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-cyan-600 hover:to-blue-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting || loading ? (
              <>
                <Loader2 className="animate-spin h-5 w-5" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </button>

          {/* ✅ Admin Login Button */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={() => router.push("/admin/login")}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-800/70 border border-gray-600 rounded-lg hover:bg-gray-700 transition text-blue-300 hover:text-blue-100"
            >
              <Shield className="w-4 h-4" />
              Admin Login
            </button>
          </div>
        </form>

        {/*    <div className="absolute right-10 top-1/3 text-white text-xl max-w-md">
          <p className="font-semibold">
            "Speak up for your street. We’ll make sure it’s heard."
          </p>
          <p className="mt-2 text-sm">
            Empowering citizens to build a better Bharat.
          </p>
        </div> */}

        {/* Register link */}
        <p className="text-sm text-center text-gray-300 mt-6">
          New to JanBol?{" "}
          <Link
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>
      {/* Forgot Password Modal */}
      <Transition show={showForgotPasswordModal}>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
          </TransitionChild>

          {/* Modal */}
          <TransitionChild
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-300"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div
              ref={modalRef}
              className="relative bg-white z-50 shadow-lg p-6 w-80 sm:w-96 rounded-xl"
            >
              <button
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                onClick={() => setShowForgotPasswordModal(false)}
                aria-label="Close"
              >
                <X />
              </button>

              <h3 className="text-lg font-semibold mb-3 text-center text-blue-600">
                Reset password
              </h3>

              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Enter your email"
                className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />

              {resetError && (
                <p className="text-sm text-red-500 mt-2">{resetError}</p>
              )}
              {resetSuccess && (
                <p className="text-sm text-green-600 mt-2">{resetSuccess}</p>
              )}

              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    setResetError("");
                    setResetSuccess("");

                    if (!emailInput.trim()) {
                      setResetError("Email is required.");
                      return;
                    }

                    setLoading(true);
                    try {
                      const res = await fetch(
                        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/forgot-password`,
                        {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: emailInput }),
                        }
                      );
                      const data = await res.json();

                      if (!res.ok) {
                        setResetError(data.error || "Something went wrong");
                      } else {
                        setResetSuccess(
                          "If an account exists, a reset link has been sent."
                        );
                      }
                    } catch {
                      setResetError("Server error. Please try again later.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      Sending... <Loader2 className="animate-spin h-4 w-4" />
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </div>
            </div>
          </TransitionChild>
        </div>
      </Transition>
    </div>
  );
}
