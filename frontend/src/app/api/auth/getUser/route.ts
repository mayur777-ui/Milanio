import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
    const cookieStore = cookies();
    const token = (await cookieStore).get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        const res =  await axios.get("http://localhost:8000/User/getUser",{
            headers: {
    Authorization: `Bearer ${token}`,
  },

        });
        const user = res.data;
        const response = NextResponse.json({ user });
        return response;
    }catch (err) {
    console.error('Token verification failed:', err);
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

}