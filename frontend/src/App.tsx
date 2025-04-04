import { Routes, Route } from "react-router-dom";
import Wrapper from "./layouts/Wrapper";
import Welcome from "./pages/Welcome";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import RecipeSearch from "./pages/RecipeSearch";
import Favorites from "./pages/Favorites";
import ProfileSettings from "./pages/ProfileSettings";
import Account from "./pages/Account";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route path="" element={<Wrapper />}>
            <Route index element={<RecipeSearch />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile-settings" element={<ProfileSettings />} />
            <Route path="account" element={<Account />} />
          </Route>
        </Route>
      </Routes>
      <ToastContainer />
    </>
  );
};

export default App;
