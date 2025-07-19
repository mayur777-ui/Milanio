import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const cookieStore = cookies();
    const token = (await cookieStore).get("token")?.value;

    if (!token) {
        return NextResponse.json({ message: "already logout" }, { status: 200 });
    }

    (await cookieStore).set("token", "", {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        expires: new Date(0), // expires in the past
    });

    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
}
