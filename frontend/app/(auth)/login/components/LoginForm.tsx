"use client";

// import { useAuthStore } from "@/lib/store/auth";
import { loginSchema } from "@/app/lib/validations/loginSchema";
import { Transition, TransitionChild } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
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
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const returned = await res.json();

      if (!res.ok) {
        setError(returned.error || "Something went wrong");
        return;
      }

      // ✅ Store JWT and user info
      localStorage.setItem("token", returned.token);
      localStorage.setItem("user", JSON.stringify(returned.user)); // optional

      // redirect to dashboard
      router.push("/dashboard");
    } catch (err) {
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-[url(/LoginPage2.jpg)] bg-cover bg-contain bg-[position:50%_85%] flex items-center justify-end px-4">
      <div className="bg-black/50 backdrop-blur-md w-full h-[70vh] max-w-md lg:max-w-sm rounded-xl shadow-md p-6 border border-gray-800 text-white">
        {/* Header */}
        <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent mb-6">
          Welcome Back
        </h2>

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

          {/* Password */}
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

            {/* <div className="text-right mt-1">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </button>
            </div> */}
          </div>

          {error && <p className="text-rose-400 text-sm">{error}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-blue-700 text-white py-2.5 rounded-lg hover:from-cyan-600 hover:to-blue-800 transition"
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
