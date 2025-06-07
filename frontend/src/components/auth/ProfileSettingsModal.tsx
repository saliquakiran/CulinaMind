import { useState, FormEvent, useEffect } from "react";
import { toast } from "react-toastify";
import Input from "../ui/FloatingLabelInput";
import { updateUserProfile } from "../../services/api";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
  onProfileUpdate: (firstName: string, lastName: string) => void;
}

const ProfileSettingsModal = ({ 
  isOpen, 
  onClose, 
  currentFirstName, 
  currentLastName, 
  onProfileUpdate 
}: ProfileSettingsModalProps) => {
  const [form, setForm] = useState({
    first_name: currentFirstName,
    last_name: currentLastName,
  });
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({
        first_name: currentFirstName,
        last_name: currentLastName,
      });
    }
  }, [isOpen, currentFirstName, currentLastName]);

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
      await updateUserProfile(form.first_name, form.last_name);
      
      // Update local storage with new user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          first_name: form.first_name,
          last_name: form.last_name,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Call the callback to update parent component
      onProfileUpdate(form.first_name, form.last_name);
      
      toast.success("Profile updated successfully!");
      onClose();
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
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
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-[1000000] bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 transform transition-all border border-purple-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-200">
          <h2 className="text-xl font-bold text-[#9A61B0]">
            Profile Settings
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
          <p className="text-gray-600 mb-6 text-center">
            Update your profile information below.
          </p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="First Name"
              value={form.first_name}
              onChange={({ target }) => handleFormChange("first_name", target.value)}
              type="text"
            />
            
            <Input
              label="Last Name"
              value={form.last_name}
              onChange={({ target }) => handleFormChange("last_name", target.value)}
              type="text"
            />
            
            <button
              type="submit"
              disabled={loading || !form.first_name.trim() || !form.last_name.trim()}
              className="w-full bg-[#9A61B0] text-white py-3 px-6 rounded-xl font-semibold hover:bg-[#8A50A0] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Updating...</span>
                </div>
              ) : (
                "Update Profile"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-purple-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            className="w-full text-[#9A61B0] hover:text-[#8A50A0] font-medium transition-colors hover:bg-purple-100 py-2 rounded-lg"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal; 