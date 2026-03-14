import { createClient } from "@/utils/superbase/server";
import { NextResponse } from "next/server";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (code) {
        const superbase = await createClient();
        await superbase.auth.exchangeCodeForSession(code);
    }

    return NextResponse.redirect(new URL("/", request.url));

}