import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
export async function POST(request: NextRequest, Response: NextResponse) {
    const {email , password} = await request.json();

   try{
     const res = await axios.post("http://localhost:8000/User/login", {
      email,
      password,
    });
    const { token } = res.data;
    const response = NextResponse.json({ success: true });
    console.log("hello world");
    // response.headers.set( "Set-Cookie",serialize('token', token,{
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === "production",
    //     sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //     path: "/",
    //     maxAge: 60 * 60 * 24 * 7, // 7 days
    //   })
    // );
    response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
});
      return response;
   }catch (err: any) {
  console.error("Login proxy error:", err);

  if (axios.isAxiosError(err)) {
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || "Unexpected error from backend";
    return NextResponse.json({ error: message }, { status });
  }

  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

}