import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-purple-300 text-center px-6">
      <h2 className="text-2xl md:text-4xl font-semibold text-white w-[70%]">Hello, Welcome to</h2>
      <h1 className="text-5xl md:text-7xl font-bold text-white mt-4 w-[80%]">CulinaMind</h1>
      <p className="text-2xl md:text-3xl text-white mt-4 w-[70%]">Your Personalized Recipe Assistant</p>

      <div className="flex gap-6 mt-8">
        <button
          className="bg-[#9A61B0] text-white px-8 py-3 rounded-md text-xl font-semibold hover:bg-[#8A50A0] transition"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button
          className="bg-[#9A61B0] text-white px-8 py-3 rounded-md text-xl font-semibold hover:bg-[#8A50A0] transition"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Welcome;
