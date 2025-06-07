import { FC, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useOutsideClick from "./useOutsideClick";

interface DashboardNavbarProps {
  onProfileSettingsClick: () => void;
  currentFirstName: string;
  currentLastName: string;
}

const DashboardNavbar: FC<DashboardNavbarProps> = ({ 
  onProfileSettingsClick, 
    currentFirstName 
}) => {
  const { isComponentVisible, ref, setIsComponentVisible } = useOutsideClick(false);
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  // Update userName whenever currentFirstName changes
  useEffect(() => {
    setUserName(currentFirstName || "");
  }, [currentFirstName]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleProfileSettingsClick = () => {
    onProfileSettingsClick();
    setIsComponentVisible(false); // Close the profile dropdown
  };

  return (
    <>
      <div className="bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] w-full shadow-lg">
        <div className="max-w-7xl mx-auto px-2 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-2xl">🍳</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CulinaMind</h1>
                <p className="text-purple-100 text-sm">Your Culinary Companion</p>
              </div>
            </div>

            {/* User Welcome and Actions */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-white font-medium">Welcome back, {userName || "Chef"}!</p>
                <p className="text-purple-100 text-sm">Ready to cook something amazing?</p>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsComponentVisible(!isComponentVisible)}
                  className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
                >
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {userName ? userName.charAt(0).toUpperCase() : "C"}
                    </span>
                  </div>
                  <span className="font-medium">Profile</span>
                  <svg 
                    className={`w-4 h-4 transition-transform ${isComponentVisible ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isComponentVisible && (
                  <div ref={ref} className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[60]">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Signed in as</p>
                      <p className="font-semibold text-gray-900">{userName || "Guest"}</p>
                    </div>
                    
                    {/* Profile Settings Options */}
                    <button
                      onClick={handleProfileSettingsClick}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors flex items-center gap-2 border-b border-gray-100"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </button>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardNavbar;
