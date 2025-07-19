"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Flag, Loader2 } from "lucide-react";

export default function VerifyOtp({ email }: { email: string }) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<{submitLoader:boolean,otpresendLoader:boolean }>({
    submitLoader: false,
    otpresendLoader: false,
  });
  const router = useRouter();
  const [showResend, setShowResend] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({
  ...prev,
  submitLoader: true,
    otpresendLoader: false
}));
    setError(null);
    try {
      const res = await axios.post("/api/auth/VerifyOtp", {
        email,
        otp,
      });

      if (res.status === 201) {
        router.replace("/Loby");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "OTP verification failed");
    } finally {
      setLoading(prev => ({
  ...prev,
  submitLoader: false,
    otpresendLoader: false
}));
    }
  };

  const handleResend = async () => {
    setError(null); 
    setLoading(prev => ({
  ...prev,
  submitLoader: false,
    otpresendLoader: true,
}));
    try{
        const res = await axios.post("http://localhost:8000/user/resendOtp", {email});
    
    if (res.status === 200) {
      setError(null);
      setOtp("");
    //   alert("OTP resent successfully");
    setShowResend(true);
    }
    }catch (err: any) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    }finally{
        setLoading(prev => ({
  ...prev,
  submitLoader: false,
    otpresendLoader: false,
}));
        setTimeout(() => {
          setShowResend(false);
        }, 5000);
    }
  }

  return (
    <>
    {loading.otpresendLoader && (
  <div className="fixed inset-0 bg-black/30 bg-opacity-30 z-50 flex items-center justify-center">
    <Loader2 className="animate-spin text-white w-10 h-10" />
  </div>
)}
    {showResend && (
  <div className="mt-4 text-center">
    <div className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm transition-all duration-300">
      OTP resent successfully 🎉
    </div>
  </div>
)}
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-300 dark:from-zinc-900 dark:to-zinc-800 px-4">
        
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 transition-all duration-300">
        <h2 className="text-3xl font-bold text-center text-zinc-800 dark:text-white mb-6">
          Verify Your Email
        </h2>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          We’ve sent a 4-digit code to <span className="font-medium">{email}</span>
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 px-4 py-2 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={4}
            className="w-full text-center text-xl tracking-widest p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            type="submit"
            disabled={loading.submitLoader}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50"
          >
            {loading.submitLoader&& <Loader2 className="animate-spin w-4 h-4" />}
            {loading.submitLoader ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <p className="text-xs text-center text-zinc-500 dark:text-zinc-400 mt-6">
          Didn’t receive an email?{" "}
          <button onClick={handleResend} className="text-blue-600 hover:underline">Resend OTP</button>
        </p>
      </div>
    </div>
    </>
  );
  
}
