import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/FloatingLabelInput";
import API from "../utils/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password", { email });
      toast.success("OTP sent to your email.");
      navigate("/verify-otp", { state: { email } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || email.trim() === "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300">
      {/* Forgot Password Box */}
      <div className="bg-gray-200 p-10 rounded-md shadow-lg w-[500px]">
        <h1 className="text-center text-2xl font-bold text-[#9A61B0] mb-6">Reset Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
          <Input
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            className={`py-3 rounded-md font-semibold transition ${
              isDisabled
                ? "bg-[#caaee0] text-white cursor-not-allowed"
                : "bg-[#9A61B0] text-white hover:bg-[#8A50A0]"
            }`}
            disabled={isDisabled}
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          Remember your password?{" "}
          <a href="/login" className="text-[#9A61B0] font-semibold hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
