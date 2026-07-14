"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { authInputClasses, authLabelClasses } from "@/lib/authFormStyles";

type SignupFormValues = {
  email: string;
  password: string;
};

export default function SignupForm() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<SignupFormValues>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (response.status === 409) {
        setError("An account with this email already exists.");
        return;
      }
      if (!response.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }
      router.push("/");
    } catch {
      setError("Something went wrong. Please try again.");
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className={authLabelClasses}>Email</span>
        <input type="email" className={authInputClasses} {...register("email", { required: true })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={authLabelClasses}>Password</span>
        <input
          type="password"
          className={authInputClasses}
          {...register("password", { required: true, minLength: 8 })}
        />
        {formState.errors.password && (
          <span className="text-xs text-red-600">Password must be at least 8 characters.</span>
        )}
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        Create account
      </button>
    </form>
  );
}
