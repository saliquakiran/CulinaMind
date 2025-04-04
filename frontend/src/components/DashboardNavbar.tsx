import { FC, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useOutsideClick from "../hooks/useOutsideClick";

const DashboardNavbar: FC = () => {
  const { isComponentVisible, ref, setIsComponentVisible } = useOutsideClick(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`${user.first_name}`);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="bg-[#B682CA] w-full flex items-center justify-between px-6 py-3 text-black">
      <span className="text-lg">Welcome, {userName || "Guest"}!</span>

      <div className="flex items-center gap-x-8">
        <Link
          to="/dashboard"
          className={`px-4 py-2 rounded-md ${
            isActive("/dashboard") ? "font-bold bg-[#87539B] text-white" : "hover:underline"
          }`}
        >
          Recipe Search
        </Link>

        <Link
          to="/dashboard/favorites"
          className={`px-4 py-2 rounded-md ${
            isActive("/dashboard/favorites") ? "font-bold bg-[#87539B] text-white" : "hover:underline"
          }`}
        >
          Favorites
        </Link>

        <div className="relative">
          <button
            onClick={() => setIsComponentVisible(!isComponentVisible)}
            className={`px-4 py-2 rounded-md ${
              isActive("/dashboard/profile-settings") ? "font-bold bg-[#87539B] text-white" : "hover:underline"
            } flex items-center`}
          >
            Profile Settings <span className="ml-1">▼</span>
          </button>

          {isComponentVisible && (
            <div ref={ref} className="absolute right-0 mt-2 w-40 bg-[#9A61B0] text-white rounded-md shadow-lg">
              <Link to="/dashboard/account" className="block px-4 py-2 hover:bg-[#87539B] rounded-t-md">
                Account
              </Link>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 hover:bg-[#87539B] rounded-b-md"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardNavbar;
