import { sessionStore } from "@/lib/session-store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const verifyOtpSchema = z.object({
  otp: z.string(),
  username: z
    .string()
    .min(1, "Too short username")
    .max(50, "Too long username"),
});

interface VerifyOtpResponse {
  success: boolean;
  token?: string;
  error?: string;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, otp } = verifyOtpSchema.parse(await request.json());

    const isValid = sessionStore.validateTotpCode(username, parseInt(otp));
    console.log(isValid, otp, username, sessionStore.getCode(username));
    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid TOTP code" },
        {
          status: 401,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "TOTP verified",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<VerifyOtpResponse>(
        {
          success: false,
          error: error.errors[0].message,
        },
        {
          status: 400,
        }
      );
    }
    console.error("Login error:", error);
    return NextResponse.json<VerifyOtpResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
      }
    );
  }
}
