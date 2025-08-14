import { FC, useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardNavbar from "../components/common/DashboardNavbar";
import ProfileSettingsModal from "../components/auth/ProfileSettingsModal";
import FloatingChatWidget from "../components/common/FloatingChatWidget";

const Wrapper: FC = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname.includes("login");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [userFirstName, setUserFirstName] = useState<string>("");
  const [userLastName, setUserLastName] = useState<string>("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserFirstName(user.first_name || "");
      setUserLastName(user.last_name || "");
    }
  }, []);

  const handleProfileSettingsClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdate = (firstName: string, lastName: string) => {
    setUserFirstName(firstName);
    setUserLastName(lastName);
    
    // Update local storage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const updatedUser = {
        ...user,
        first_name: firstName,
        last_name: lastName,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  };

  const handleProfileUpdateCallback = (firstName: string, lastName: string) => {
    handleProfileUpdate(firstName, lastName);
    // Force a re-render of the navbar by updating localStorage
    localStorage.setItem("user", JSON.stringify({
      ...JSON.parse(localStorage.getItem("user") || "{}"),
      first_name: firstName,
      last_name: lastName,
    }));
  };

  const handleChatToggle = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <main className="w-full bg-transparent mx-auto relative transition-all">
      <div className="h-screen bg-[#F5F5F5] overflow-y-auto w-full">
        {!isLoginPage && (
          <div className="w-full fixed top-0 left-0 z-[40]">
            <DashboardNavbar 
              onProfileSettingsClick={handleProfileSettingsClick}
              currentFirstName={userFirstName}
              currentLastName={userLastName}
            />
          </div>
        )}
        <div className={`${!isLoginPage ? "mt-[50px]" : ""} w-full`}>
          <Outlet />
        </div>
      </div>

      {/* Profile Settings Modal - Rendered at root level */}
      {!isLoginPage && (
        <ProfileSettingsModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentFirstName={userFirstName}
          currentLastName={userLastName}
          onProfileUpdate={handleProfileUpdateCallback}
        />
      )}

      {/* Floating Chat Widget - Available on all pages */}
      <FloatingChatWidget
        isOpen={isChatOpen}
        onToggle={handleChatToggle}
      />
    </main>
  );
};

export default Wrapper;
