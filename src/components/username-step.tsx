"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const usernameSchema = z.object({
  username: z
    .string()
    .min(1, "Username is required")
    .max(50, "Username too long"),
});

type UsernameFormData = z.infer<typeof usernameSchema>;

interface UsernameStepProps {
  onSecureWordReceived: (
    username: string,
    secureWord: string,
    expiresAt: number
  ) => void;
}

export function UsernameStep({ onSecureWordReceived }: UsernameStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernameFormData>({
    resolver: zodResolver(usernameSchema),
  });

  const onSubmit = async (data: UsernameFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/getSecureWord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: data.username }),
      });
      console.log(response);
      const result = await response.json();

      if (!result.success) {
        setError(result.error || "Failed to get secure word");
        return;
      }

      onSecureWordReceived(data.username, result.secureWord, result.expiresAt);
    } catch (err) {
      setError("Network error. Please try again.");
      console.log("Error: ", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Enter Username
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Username
          </label>
          <input
            {...register("username")}
            type="text"
            id="username"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your username"
            disabled={isLoading}
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Getting Secure Word..." : "Get Secure Word"}
        </button>
      </form>

      <div className="mt-4 text-sm text-gray-600">
        <p>
          <strong>Test Users:</strong>
        </p>
        <p>• admin (password: secret123)</p>
        <p>• user (password: password123)</p>
      </div>
    </div>
  );
}
