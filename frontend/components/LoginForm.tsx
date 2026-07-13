"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";

type LoginFormValues = {
  email: string;
  password: string;
};

const inputClasses =
  "w-full rounded-md border border-black/15 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-primary focus:outline-none dark:border-white/15 dark:bg-black";
const labelClasses = "text-sm font-medium text-foreground";

export default function LoginForm() {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<LoginFormValues>();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
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
        <span className={labelClasses}>Email</span>
        <input type="email" className={inputClasses} {...register("email", { required: true })} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelClasses}>Password</span>
        <input type="password" className={inputClasses} {...register("password", { required: true })} />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={formState.isSubmitting}
        className="rounded-md bg-purple-secondary px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-60"
      >
        Log in
      </button>
    </form>
  );
}
