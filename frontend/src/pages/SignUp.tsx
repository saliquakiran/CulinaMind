import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { signUpUser, loginWithGoogle } from "../utils/api";
import Input from "../components/FloatingLabelInput";
import Eye from "../assets/icons/eye";
import EyeSlash from "../assets/icons/eye-slash";
import { toast } from "react-toastify";

const GOOGLE_CLIENT_ID = "409907844476-eq9oh3fbjbphec1ldljni608sjpcnqnb.apps.googleusercontent.com";

const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
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
      const response = await signUpUser(form);
      toast.success(response.message);
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Sign-up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await loginWithGoogle({ token: credentialResponse.credential });

      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      toast.success(res.message);
      navigate("/dashboard");
    } catch (error) {
      toast.error("Google sign-in failed. Try again.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google sign-in failed. Try again.");
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300">
        {/* Sign Up Box */}
        <div className="bg-gray-200 p-10 rounded-md shadow-lg w-[500px]">
          <h1 className="text-center text-2xl font-bold text-[#9A61B0] mb-6">Sign Up</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-y-4">
            <div className="flex gap-4">
              <Input
                label="First Name"
                value={form.first_name}
                onChange={({ target }) => handleFormChange("first_name", target.value)}
              />
              <Input
                label="Last Name"
                value={form.last_name}
                onChange={({ target }) => handleFormChange("last_name", target.value)}
              />
            </div>
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
            <button
              className="bg-[#9A61B0] text-white py-3 rounded-md font-semibold hover:bg-[#8A50A0] transition"
              disabled={loading}
            >
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          </form>
          <div className="text-center mt-4 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-[#9A61B0] font-semibold">
              Login
            </a>
          </div>
        </div>

        {/* OR Section */}
        <div className="flex items-center my-4 w-[500px]">
          <hr className="flex-grow border-gray-400" />
          <span className="mx-2 text-gray-600 text-sm">or</span>
          <hr className="flex-grow border-gray-400" />
        </div>

        {/* Social Sign-In Button */}
        <div className="flex justify-center w-[500px] mt-4">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
          />
        </div>

      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUp;
