import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { loginUser, loginWithGoogle } from "../utils/api";
import Input from "../components/FloatingLabelInput";
import Eye from "../assets/icons/eye";
import EyeSlash from "../assets/icons/eye-slash";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID = "409907844476-eq9oh3fbjbphec1ldljni608sjpcnqnb.apps.googleusercontent.com";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(form);

      if (response?.data?.access_token) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        toast.success(response.message);
        navigate("/dashboard");
      } else {
        toast.error("Invalid response from server. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const decoded = jwtDecode(credentialResponse.credential);

    try {
      const res = await loginWithGoogle({ token: credentialResponse.credential });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Google login failed. Try again.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google sign-in failed. Try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300">
        {/* Main Login Box */}
        <div className="bg-gray-200 p-10 rounded-md shadow-lg w-[500px]">
          <h1 className="text-center text-2xl font-bold text-[#9A61B0] mb-6">Login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-5">
            <Input
              label="Email"
              value={form.email}
              onChange={({ target }) => handleFormChange("email", target.value)}
            />
            <Input
              label="Password"
              value={form.password}
              onChange={({ target }) => handleFormChange("password", target.value)}
              eyeIcon={<Eye />}
              eyeSlashIcon={<EyeSlash />}
              type="password"
            />

            {/* Forgot Password */}
            <div className="text-right text-sm text-[#9A61B0] hover:underline cursor-pointer -mt-3">
              <a href="/forgot-password">Forgot password?</a>
            </div>

            <button
              className="bg-[#9A61B0] text-white py-3 rounded-md font-semibold hover:bg-[#8A50A0] transition"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Sign up */}
          <div className="text-center mt-4 text-sm">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#9A61B0] font-semibold">
              Sign Up
            </a>
          </div>
        </div>

        {/* OR Section */}
        <div className="flex items-center my-4 w-[500px]">
          <hr className="flex-grow border-gray-400" />
          <span className="mx-2 text-gray-600 text-sm">or</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Login Buttons */}
        <div className="flex justify-center w-[500px] mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
          {/* <button className="bg-white border border-gray-400 rounded-md py-2 flex-1 flex items-center justify-center gap-2 shadow-md hover:bg-gray-100 transition">
            <img src="https://img.icons8.com/color/20/000000/facebook-new.png" alt="Facebook" />
            Continue with Facebook
          </button> */}
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default AdminLogin;
