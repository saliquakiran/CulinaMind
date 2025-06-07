import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { signUpUser, loginWithGoogle } from "../../services/api";
import Input from "../../components/ui/FloatingLabelInput";
import Eye from "../../assets/icons/eye";
import EyeSlash from "../../assets/icons/eye-slash";
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
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-purple-100 to-lavender-50 flex flex-col items-center justify-center px-6 py-8">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-[#9A61B0] rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">C</span>
            </div>
            <span className="text-3xl font-bold text-[#9A61B0]">CulinaMind</span>
          </div>
          <p className="text-gray-600 text-lg">Join your culinary adventure</p>
        </div>

        {/* Main Sign Up Card */}
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl border border-purple-100 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-[#9A61B0] mb-8">Create Account</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
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

            {/* Email Field */}
            <Input
              label="Email"
              value={form.email}
              onChange={({ target }) => handleFormChange("email", target.value)}
            />

            {/* Password Field */}
            <Input
              label="Password"
              value={form.password}
              onChange={({ target }) => handleFormChange("password", target.value)}
              eyeIcon={<Eye />}
              eyeSlashIcon={<EyeSlash />}
              type="password"
            />

            {/* Sign Up Button */}
            <button
              className="w-full bg-[#9A61B0] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#8A50A0] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Already have an account?{" "}
              <a 
                href="/login" 
                className="text-[#9A61B0] font-semibold hover:text-[#8A50A0] hover:underline transition-colors"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>

        {/* OR Divider */}
        <div className="flex items-center my-6 w-full max-w-md">
          <hr className="flex-grow border-gray-300" />
          <span className="mx-4 text-gray-500 text-sm font-medium">or continue with</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Social Sign Up */}
        <div className="w-full max-w-md">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-purple-100">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleFailure}
            />
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <a 
            href="/" 
            className="text-[#9A61B0] hover:text-[#8A50A0] font-medium hover:underline transition-colors"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default SignUp;
