"use client";

import { registerSchema } from "@/app/lib/validations/registerSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { useEffect } from "react";

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegistrationForm() {
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [departments, setDepartments] = useState<
    { _id: string; name: string }[]
  >([]);

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

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE}/api/departments`
        );
        const data = await res.json();
        setDepartments(data); // data should be an array of {_id, name}
      } catch (err) {
        console.error("Failed to fetch departments", err);
      }
    }
    fetchDepartments();
  }, []);

  const onSubmit = async (data: RegisterFormData) => {
    setError("");
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/auth/register`,
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

      setSuccess(returned.message);
      router.push("/login");
    } catch {
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

        {/* Department ID (only for admin) */}
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

        {/* Error Message */}
        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
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
