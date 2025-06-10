interface LoginSuccessProps {
  user: { username: string };
  otp: number;
  verifyMfaNext: () => void;
}

export function LoginSuccess({ user, otp, verifyMfaNext }: LoginSuccessProps) {
  const copyToken = () => {
    navigator.clipboard.writeText(String(otp));
    alert("Token copied to clipboard!");
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="mb-4">
          <svg
            className="mx-auto h-12 w-12 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-green-600 mb-4">
          Login Successful!
        </h2>

        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <p className="text-sm text-green-800">
            Welcome back, <strong>{user.username}</strong>!
          </p>
          <p className="text-xs text-green-600 mt-1">
            You have successfully logged in to your account.
          </p>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6">
          <p className="text-sm font-medium text-gray-700 mb-2">Your TOTP:</p>
          <div className="bg-white border rounded p-2 text-xs font-mono text-gray-600 break-all">
            {otp}
          </div>
          <button
            onClick={copyToken}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
          >
            Copy Full TOTP (this would be sent to mail on production)
          </button>
        </div>

        <div className="space-y-3">
          <button
            onClick={verifyMfaNext}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
