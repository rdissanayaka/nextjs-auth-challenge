"use client";
import { useState } from "react";
import { UsernameStep } from "./username-step";
import { SecureWordDisplay } from "./secure-word-display";
import { PasswordStep } from "./password-step";
import { LoginSuccess } from "./login-success";
import VerifyMFA from "./verify-mfa";

type LoginStep =
  | "username"
  | "secureWord"
  | "password"
  | "verifyMfa"
  | "success";

interface LoginState {
  username: string;
  secureWord: string;
  expiresAt: number;
  token: string;
  user: { username: string } | null;
  otp: number;
}

export function LoginFlow() {
  const [currentStep, setCurrentStep] = useState<LoginStep>("username");
  const [loginState, setLoginState] = useState<LoginState>({
    username: "",
    secureWord: "",
    expiresAt: 0,
    token: "",
    user: null,
    otp: 0,
  });

  const handleSecureWordReceived = (
    username: string,
    secureWord: string,
    expiresAt: number
  ) => {
    setLoginState((prev) => ({
      ...prev,
      username,
      secureWord,
      expiresAt,
    }));
    setCurrentStep("secureWord");
  };

  const handleSecureWordNext = () => {
    setCurrentStep("password");
  };

  const handleLoginSuccess = (
    otp: number,
    token: string,
    user: { username: string }
  ) => {
    setLoginState((prev) => ({
      ...prev,
      otp,
      token,
      user,
    }));
    setCurrentStep("success");
    localStorage.setItem("token", token);
  };

  const handleVerifyMFANext = () => {
    setCurrentStep("verifyMfa");
  };

  const handleBack = () => {
    switch (currentStep) {
      case "secureWord":
        setCurrentStep("username");
        break;
      case "password":
        setCurrentStep("secureWord");
        break;
      case "verifyMfa":
        setCurrentStep("success");
        break;
      default:
        setCurrentStep("username");
    }
  };
  const stepLabels = [
    "Username",
    "Secure Word",
    "Password",
    "Verify Login",
    "Verify MFA",
  ];
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {["username", "secureWord", "password", "success", "verifyMfa"].map(
              (step, index) => {
                const isActive = step === currentStep;
                const isCompleted =
                  ["username", "secureWord", "password", "success"].indexOf(
                    currentStep
                  ) > index;

                return (
                  <div key={step} className="flex items-center">
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-300 text-gray-600"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    {index < 4 && (
                      <div
                        className={`w-12 h-1 mx-2 ${
                          isCompleted ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              }
            )}
          </div>
          <div className="flex justify-between mt-2">
            {stepLabels.map((label, index) => (
              <span
                key={index}
                className="text-xs text-gray-600 w-16 text-center"
              >
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* Current Step Component */}
        {currentStep === "username" && (
          <UsernameStep onSecureWordReceived={handleSecureWordReceived} />
        )}

        {currentStep === "secureWord" && (
          <SecureWordDisplay
            username={loginState.username}
            secureWord={loginState.secureWord}
            expiresAt={loginState.expiresAt}
            onNext={handleSecureWordNext}
            onBack={handleBack}
          />
        )}

        {currentStep === "password" && (
          <PasswordStep
            username={loginState.username}
            secureWord={loginState.secureWord}
            onLoginSuccess={handleLoginSuccess}
            onBack={handleBack}
          />
        )}
        {currentStep === "success" && loginState.user && (
          <LoginSuccess
            user={loginState.user}
            otp={loginState.otp}
            verifyMfaNext={handleVerifyMFANext}
          />
        )}
        {currentStep === "verifyMfa" && (
          <VerifyMFA username={loginState.username} />
        )}
      </div>
    </div>
  );
}
