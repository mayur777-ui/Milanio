"use client";

import React, { useState, useEffect } from "react";
import { X, Eye, EyeClosed, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { UserService } from "@/apis/user.api";

interface LoginProps {
  handleShow: () => void;
  onSwitchToRegister?: () => void;
}

export default function Login({ handleShow, onSwitchToRegister }: LoginProps) {
  const router = useRouter();
  const [input, setInput] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    both?: string;
  }>();
  const [showpass, setShowPass] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleShow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleShow]);

  const handleShowPass = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setShowPass((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.email && !input.password) {
      setErrors({ both: "Both fields are required." });
      return;
    }
    if (!input.email) {
      setErrors({ email: "Email is required." });
      return;
    }
    if (!input.password) {
      setErrors({ password: "Password is required." });
      return;
    }

    try {
      setLoading(true);
      const res = await UserService.Login({
        email: input.email,
        password: input.password,
      });

      if (res.status === 200) {
        localStorage.setItem("adminToken", res.data.token);
        router.replace("/Loby");
        setInput({ email: "", password: "" });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status;
        if (status === 404 || status === 401 || status === 500) {
          setErrors({ both: err.response?.data?.error || "Invalid email or password." });
        } else {
          setErrors({ both: "Unable to sign in. Please try again." });
        }
      } else {
        setErrors({ both: "An unexpected error occurred." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleShow();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col text-zinc-900 dark:text-zinc-100">
        {/* Close Button */}
        <button
          onClick={handleShow}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="w-9 h-9 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-bold text-sm mb-3 shadow-sm">
            M
          </div>
          <h2
            id="login-dialog-title"
            className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-white"
          >
            Welcome back
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Sign in to start or join your video meeting.
          </p>
        </div>

        {/* Error Alert */}
        {(errors?.both || errors?.email || errors?.password) && (
          <div className="mb-4 flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-600 dark:text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errors.both || errors.email || errors.password}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Email address
            </label>
            <input
              type="email"
              name="email"
              placeholder="you@domain.com"
              onChange={handleChange}
              value={input.email}
              autoFocus
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <div className="relative">
              <input
                type={showpass ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                value={input.password}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition"
              />
              <button
                type="button"
                onClick={handleShowPass}
                aria-label={showpass ? "Hide password" : "Show password"}
                className="absolute top-1/2 -translate-y-1/2 right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition cursor-pointer"
              >
                {showpass ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold rounded-xl text-sm transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        {/* Switch to Register */}
        {onSwitchToRegister && (
          <div className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-zinc-900 dark:text-zinc-100 font-semibold underline underline-offset-4 hover:opacity-80 transition cursor-pointer"
            >
              Sign up
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
