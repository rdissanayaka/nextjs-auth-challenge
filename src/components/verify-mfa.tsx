"use client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const VerifyMFA = ({ username }: { username: string }) => {
  const [otp, setOtp] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleVerifyOtp = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/verifyMfa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, otp: String(otp) }),
      });
      const result = await res.json();
      if (!result.success) {
        setError(result.error || "Login failed");
        localStorage.removeItem("token");
        return;
      }

      // verfied, redirect to dashboar
      if (result.success) {
        toast.success("Login Successful");
        router.replace("/dashboard");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.log("Error: ", error);
      localStorage.removeItem("token");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="flex flex-col items-center justify-center gap-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        <h2 className="text-lg font-semibold">Verify Your OTP</h2>
        <InputOTP
          className="w-full"
          value={otp}
          onChange={(value) => setOtp(value)}
          maxLength={6}
        >
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <button
          disabled={isLoading}
          onClick={handleVerifyOtp}
          className="flex-1 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {isLoading ? "Verifying the OTP..." : "Verify OTP"}
        </button>
      </div>
    </div>
  );
};

export default VerifyMFA;
