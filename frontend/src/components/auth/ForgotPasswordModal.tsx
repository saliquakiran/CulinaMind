import { useState, FormEvent, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "../ui/FloatingLabelInput";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal = ({ isOpen, onClose }: ForgotPasswordModalProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setEmailSent(false);
      setEmail("");
      setLoading(false);
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual forgot password API call
      // const response = await forgotPassword({ email });
      
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSent(true);
      toast.success("Password reset email sent! Check your inbox.");
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
      }, 3000);
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - Transparent blur instead of black */}
      <div 
        className="fixed inset-0 bg-purple-200/30 backdrop-blur-sm z-[9999]"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all border border-purple-100">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-purple-200">
            <h2 className="text-xl font-bold text-[#9A61B0]">
              {emailSent ? "Check Your Email" : "Reset Password"}
            </h2>
            <button
              onClick={handleClose}
              className="text-purple-400 hover:text-[#9A61B0] transition-colors p-1 rounded-full hover:bg-purple-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {!emailSent ? (
              <>
                <p className="text-gray-600 mb-6 text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    label="Email Address"
                    value={email}
                    onChange={({ target }: React.ChangeEvent<HTMLInputElement>) => setEmail(target.value)}
                    type="text"
                  />
                  
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="w-full bg-[#9A61B0] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#8A50A0] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending...</span>
                      </div>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Sent!</h3>
                <p className="text-gray-600 mb-4">
                  We've sent a password reset link to <span className="font-medium">{email}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Check your inbox and click the link to reset your password.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!emailSent && (
            <div className="px-6 py-4 bg-purple-50 rounded-b-2xl">
              <button
                onClick={handleClose}
                className="w-full text-[#9A61B0] hover:text-[#8A50A0] font-medium transition-colors hover:bg-purple-100 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForgotPasswordModal; 