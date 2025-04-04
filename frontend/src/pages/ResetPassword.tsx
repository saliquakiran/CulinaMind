import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../components/FloatingLabelInput";
import API from "../utils/api";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { email, otp } = location.state;

  const handleReset = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/reset-password/confirm", {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || newPassword.trim() === "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300">
      {/* Reset Password Box */}
      <div className="bg-gray-200 p-10 rounded-md shadow-lg w-[500px]">
        <h1 className="text-center text-2xl font-bold text-[#9A61B0] mb-6">Set New Password</h1>
        <form onSubmit={handleReset} className="flex flex-col gap-y-5">
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <button
            className={`py-3 rounded-md font-semibold transition ${
              isDisabled
                ? "bg-[#caaee0] text-white cursor-not-allowed"
                : "bg-[#9A61B0] text-white hover:bg-[#8A50A0]"
            }`}
            disabled={isDisabled}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          Back to{" "}
          <a href="/login" className="text-[#9A61B0] font-semibold hover:underline">
            Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
