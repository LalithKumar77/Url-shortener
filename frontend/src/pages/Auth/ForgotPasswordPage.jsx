import { useState } from "react";
import { forgotPassword } from "../../api/auth";
import { toast } from 'react-toastify';
import { Mail, Lock, ArrowRight } from "lucide-react";
import InputField from "../../components/InputField";
import { Link } from "react-router-dom";

const ForgotPasswordPage = () => {
  // using centralized apiClient
  const [gmail, setGmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleGmailChange = (e) => {
    setGmail(e.target.value);
    if (error) setError("");
  };

  const validateGmail = () => {
    if (!gmail) {
      setError("Gmail is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(gmail)) {
      setError("Please enter a valid gmail address");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateGmail()) return;
    setIsLoading(true);
    try {
      const res = await forgotPassword({ gmail });
      if (res.data) {
        toast.success(res.data.message || 'Reset link sent', { position: 'top-center' });
        setEmailSent(true);
      } else {
        const msg = res.error || "Failed to send reset link";
        toast.error(msg, { position: 'top-center' });
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state after email is sent
  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Check Your Gmail
          </h2>
          <p className="text-gray-600 mb-4">
            We&apos;ve sent a password reset link to <strong>{gmail}</strong>.
            Please check your inbox and follow the instructions to reset your
            password.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setEmailSent(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
            >
              Try Again
            </button>
            <Link
              to="/login"
              className="block w-full px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 text-center"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Forgot Password?</h2>
          <p className="mt-2 text-gray-600">
            Don&apos;t worry, we&apos;ll send you reset instructions
          </p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-gray-600 text-sm">
                Enter your email address and we&apos;ll send you a link to reset
                your password.
              </p>
            </div>

            <InputField
              type="email"
              placeholder="Enter your gmail address"
              value={gmail}
              onChange={handleGmailChange}
              icon={Mail}
              error={error}
            />

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Sending reset link...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
