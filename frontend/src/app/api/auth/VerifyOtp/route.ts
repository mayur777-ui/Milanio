import { NextRequest, NextResponse } from "next/server";
import { serialize } from "cookie"; 
import axios from "axios";

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();

  try {
    // Send to Express backend
    const backendRes = await axios.post("http://localhost:8000/User/verifyOtpAndRegister", {
      email,
      otp,
    });

    const { token, user } = backendRes.data;

    // Create response and set cookie
    const response = NextResponse.json({ success: true, user });

    response.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
});

    return response;
  } catch (err: any) {
    console.error("OTP verification error:", err);

    if (axios.isAxiosError(err)) {
      const status = err.response?.status || 500;
      const message = err.response?.data?.error || "OTP verification failed";
      return NextResponse.json({ error: message }, { status });
    }

    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
