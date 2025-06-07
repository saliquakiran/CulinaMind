import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Input from "../../components/ui/FloatingLabelInput";
import API from "../../services/api";

const VerifyOTP = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleVerify = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post("/auth/verify-otp", { email, otp });
      toast.success("OTP verified. Set new password.");
      navigate("/reset-password", { state: { email, otp } });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || otp.trim() === "";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300">
      {/* OTP Verification Box */}
      <div className="bg-gray-200 p-10 rounded-md shadow-lg w-[500px]">
        <h1 className="text-center text-2xl font-bold text-[#9A61B0] mb-6">Verify OTP</h1>
        <form onSubmit={handleVerify} className="flex flex-col gap-y-5">
          <Input
            label="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          <button
            className={`py-3 rounded-md font-semibold transition ${
              isDisabled
                ? "bg-[#caaee0] text-white cursor-not-allowed"
                : "bg-[#9A61B0] text-white hover:bg-[#8A50A0]"
            }`}
            disabled={isDisabled}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-4 text-sm">
          Didn't get the code?{" "}
          <a href="/forgot-password" className="text-[#9A61B0] font-semibold hover:underline">
            Resend OTP
          </a>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;
