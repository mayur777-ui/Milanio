"use client";

import React, { useState } from "react";
import Image from "next/image";
// Your uploaded image
import Lottie from "lottie-react";
import loginAnimation from "../img/loginAuth.json";
import { X, Eye, EyeClosed, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import validatePassword from "../utility/Password";
import axios from "axios";
export default function Register({ handleShow }: { handleShow: () => void }) {
  let router = useRouter();
  let [input, setInput] = useState<{ name:string, email: string; password: string }>({
    name:"",
    email: "",
    password: "",
  });
  let [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    both?: string;
  }>();
  const [showpass, setShowPass] = useState<boolean>(false);
   const [loading, setLoading] = useState(false);

  const handleShowPass = (e: React.MouseEvent<HTMLButtonElement>) => {
    
    e.preventDefault();
    setShowPass((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors(undefined);
  };

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!input.name||!input.email && !input.password) {
      setErrors({ both: "All fields are required" });
      return;
    }
    if (!input.name) {
      setErrors({ email: "name is required" });
      return;
    }
    if (!input.email) {
      setErrors({ email: "Email is required" });
      return;
    }

    if (!input.password) {
      setErrors({ password: "Password is required" });
      return;
    }

    if(validatePassword(input.password)){
        setErrors({ password: validatePassword(input.password) as string | undefined });
        return;
    }
    try {
        setLoading(true);
      let res = await axios.post(
        "http://localhost:8000/User/register",input,
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      const email = input.email;
      if (res.status === 200) {
        // console.log("Login successful:", res.data);
        router.push(`/VerifyOtp/${email}`);
        setInput({ name:"",email: "", password: "" });
    }
    } catch (err) {
      if (axios.isAxiosError(err)) {
    const status = err.response?.status;

    if (status === 404 || status === 401 || status === 500) {
      setErrors({ both: err.response?.data?.error || "Unexpected error" });
    } else {
      setErrors({ both: "Something went wrong. Try again later." });
    }
  } else {
    console.error("Unknown login error:", err);
    setErrors({ both: "Unexpected error occurred." });
  }
    }finally{
        setLoading(false);
    }
  };

  return (
    <>
    {loading && (
  <div className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center">
    <Loader2 className="animate-spin text-white w-10 h-10" />
  </div>
)}
      {errors && (
  <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] px-6 py-4 rounded-xl shadow-lg border border-red-300/30 bg-red-100/50 text-red-800 dark:bg-red-900/30 dark:border-red-600/40 dark:text-red-200 backdrop-blur-md animate-in slide-in-from-top fade-in duration-300">
    <div className="flex items-start gap-3">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-[2px] text-red-500 dark:text-red-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M12 2a10 10 0 1010 10A10 10 0 0012 2z" />
      </svg>
      <div className="text-left text-sm font-medium space-y-1">
        {errors.both && <p>{errors.both}</p>}
        {errors.email && <p>{errors.email}</p>}
        {errors.password && <p>{errors.password}</p>}
      </div>
    </div>
  </div>
)}

      <div className="flex inset-0 absolute items-center justify-center bg-gradient-to-br from-white/10 to-zinc-100 dark:from-zinc-900 dark:to-zinc-800 backdrop-blur-md">
       <div className="relative w-[90%] max-w-5xl min-h-[32rem] max-h-[95vh] overflow-auto p-6 md:p-10 rounded-2xl bg-white/30 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/20 dark:border-zinc-700 shadow-lg flex flex-col md:flex-row items-center justify-between transition-all duration-300">
          <button
            className=" absolute top-5 text-zinc-950 right-7 cursor-pointer"
            onClick={handleShow}
          >
            <X />
          </button>
          {/* Left: Image */}
          <div className="w-full md:w-1/2 flex justify-center items-center mb-6 md:mb-0">
            <div className="p-6 rounded-xl bg-[#f4f4f4] dark:bg-zinc-700 shadow-inner dark:shadow-[inset_4px_4px_8px_#1c1c1c,inset_-4px_-4px_8px_#2c2c2c]">
              <Lottie
                animationData={loginAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
          </div>

          {/* Right: Form */}
          <div className="w-full md:w-1/2 px-2 md:px-6">
            <h2 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-6 text-center md:text-left">
              Welcome
            </h2>
            <form className="flex flex-col gap-4">
                <input
                type="text"
                placeholder="Name"
                name="name"
                onChange={handleChange}
                value={input.name}
                className="p-4 rounded-xl bg-[#e0e0e0] dark:bg-zinc-700 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1c1c1c,inset_-4px_-4px_8px_#2c2c2c] focus:outline-none text-zinc-800 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                name="email"
                onChange={handleChange}
                value={input.email}
                className="p-4 rounded-xl bg-[#e0e0e0] dark:bg-zinc-700 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1c1c1c,inset_-4px_-4px_8px_#2c2c2c] focus:outline-none text-zinc-800 dark:text-white"
              />
              <div className="relative">
                <input
                  type={showpass ? "text" : "password"}
                  placeholder="Password"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  className="p-4 w-full rounded-xl bg-[#e0e0e0] dark:bg-zinc-700 shadow-[inset_4px_4px_8px_#bebebe,inset_-4px_-4px_8px_#ffffff] dark:shadow-[inset_4px_4px_8px_#1c1c1c,inset_-4px_-4px_8px_#2c2c2c] focus:outline-none text-zinc-800 dark:text-white"
                />
                {input.password && (
                  <button
                  type="button"
                  onClick={handleShowPass}
                  className="absolute top-2 right-4 text-sm text-blue-500 hover:underline mt-2"
                >
                  {showpass ? <Eye /> : <EyeClosed />}
                </button>
                )}
              </div>
              <button
                type="submit"
                onClick={handleSubmit}
                className="mt-2 bg-[#d1d9e6] dark:bg-zinc-600 text-zinc-800 dark:text-white font-semibold py-3 rounded-xl shadow-[4px_4px_8px_#bebebe,-4px_-4px_8px_#ffffff] dark:shadow-[4px_4px_8px_#1c1c1c,-4px_-4px_8px_#2c2c2c] hover:scale-105 transition-all"
              >
                Sign-Up
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
