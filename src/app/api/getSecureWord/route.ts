import { sessionStore } from "@/lib/session-store";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
const requestSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long"),
});

interface ApiResponse {
  success: boolean;
  secureWord?: string;
  expiresAt?: number;
  error?: string;
  remainingTime?: number;
}

export async function POST(request: NextRequest) {
  try {
    const { username } = requestSchema.parse(await request.json());
    if (!sessionStore.canRequestSecureWord(username)) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Rate limit exceeded. Please wait before requesting again.",
          remainingTime: 10, // seconds
        },
        {
          status: 429,
        }
      );
    }
    const { secureWord, expiresAt } = sessionStore.createSession(username);
    console.log(secureWord, expiresAt);
    return NextResponse.json<ApiResponse>({
      success: true,
      secureWord,
      expiresAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: error.errors[0].message,
        },
        {
          status: 400,
        }
      );
    }
    console.error("Error generating secure word:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
