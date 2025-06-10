import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { sessionStore } from "@/lib/session-store";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  hashedPassword: z.string().min(1, "Password is required"),
  secureWord: z.string().min(1, "Secure word is required"),
});

interface LoginResponse {
  success: boolean;
  token?: string;
  error?: string;
  user?: {
    username: string;
  };
  otp?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { username, hashedPassword, secureWord } = loginSchema.parse(
      await request.json()
    );

    if (!sessionStore.validateSession(username, secureWord)) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error:
            "Invalid or expired secure word. Please restart the login process.",
        },
        {
          status: 401,
        }
      );
    }
    const isValidPassword = await validatePassword(username, hashedPassword);
    if (!isValidPassword) {
      return NextResponse.json<LoginResponse>(
        {
          success: false,
          error: "Invalid credentials",
        },
        {
          status: 401,
        }
      );
    }

    const token = jwt.sign(
      {
        username,
        iat: Math.floor(Date.now() / 1000),
      },
      process.env.JWT_SECRET || "default-jwt-secret",
      {
        expiresIn: "24h",
        issuer: "your-app-name",
      }
    );

    return NextResponse.json<LoginResponse>({
      success: true,
      token,
      user: { username },
      otp: sessionStore.getCode(username),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json<LoginResponse>(
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
    return NextResponse.json<LoginResponse>(
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

// Mock password validation function
async function validatePassword(
  username: string,
  hashedPassword: string
): Promise<boolean> {
  // Mock user database
  const mockUsers: Record<string, string> = {
    admin: "fcf730b6d95236ecd3c9fc2d92d7b6b2bb061514961aec041d6c7a7192f592e4", // SHA-256 of "secret123"
    user: "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f", // SHA-256 of "password123"
  };

  return mockUsers[username] === hashedPassword;
}
