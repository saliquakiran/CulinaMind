import { FC } from "react";
import { Outlet, useLocation } from "react-router-dom";
import DashboardNavbar from "../components/DashboardNavbar";

const Wrapper: FC = () => {
  const { pathname } = useLocation();
  const isLoginPage = pathname.includes("login");

  return (
    <main className="w-full bg-transparent mx-auto relative transition-all">
      <div className="h-screen bg-[#F5F5F5] overflow-y-auto w-full">
        {!isLoginPage && (
          <div className="w-full fixed top-0 left-0">
            <DashboardNavbar />
          </div>
        )}
        <div className={`${!isLoginPage ? "mt-[50px]" : ""} w-full`}>
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default Wrapper;
