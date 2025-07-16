import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: (
        <svg className="w-12 h-12 text-[#9A61B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      title: "AI Chat Interface",
      description: "Get personalized cooking guidance and real-time assistance"
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#9A61B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      title: "Recipe Discovery",
      description: "Find recipes based on ingredients, preferences, and dietary needs"
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#9A61B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: "Cooking Lessons",
      description: "Learn new techniques and track your culinary progress"
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#9A61B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Meal Planning",
      description: "Plan your meals and create smart shopping lists"
    },
    {
      icon: (
        <svg className="w-12 h-12 text-[#9A61B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Community",
      description: "Connect with fellow food enthusiasts and share experiences"
    }
  ];

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Purple Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><radialGradient id="a" cx="50%" cy="50%"><stop offset="0%" stop-color="%23e9d5ff"/><stop offset="100%" stop-color="%23d8b4fe"/></radialGradient><radialGradient id="b" cx="80%" cy="20%"><stop offset="0%" stop-color="%23c084fc"/><stop offset="100%" stop-color="%23a855f7"/></radialGradient></defs><rect width="100%" height="100%" fill="url(%23a)"/><circle cx="80%" cy="20%" r="300" fill="url(%23b)" opacity="0.3"/><circle cx="20%" cy="80%" r="200" fill="%23a855f7" opacity="0.2"/></svg>')`
        }}
      />
      
      {/* Purple Overlay for Better Text Readability */}
      <div className="absolute inset-0 bg-purple-300/40" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#9A61B0] rounded-full flex items-center justify-center">
              <span className="text-white text-lg font-bold">C</span>
            </div>
            <span className="text-xl font-bold text-white drop-shadow-lg">CulinaMind</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate("/login")}
              className="text-white hover:text-purple-100 font-medium transition-colors drop-shadow-lg"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#9A61B0] text-white px-6 py-2 rounded-lg hover:bg-[#8A50A0] transition-colors font-medium shadow-lg"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center px-6 py-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
            Your AI Cooking
            <span className="block text-purple-100">Companion</span>
          </h1>
          <p className="text-xl md:text-2xl text-white mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow-lg">
            Transform your culinary journey with intelligent recipe generation, 
            personalized cooking guidance, and a community of food enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="bg-[#9A61B0] text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-[#8A50A0] transition-all transform hover:scale-105 shadow-lg"
            >
              Start Cooking with AI
            </button>
            <button
              onClick={() => navigate("/login")}
              className="border-2 border-white text-white px-8 py-4 rounded-xl text-xl font-semibold hover:bg-white hover:text-[#9A61B0] transition-all transform hover:scale-105 backdrop-blur-sm"
            >
              Sign In
            </button>
          </div>
        </div>

        {/* Features Section */}
        <div className="px-6 py-16 bg-white/90 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-[#9A61B0] mb-12">
              Everything You Need to Master the Kitchen
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-purple-100 group"
                >
                  <div className="flex items-center justify-between mb-3 group-hover:scale-105 transition-transform duration-200">
                    <h3 className="text-xl font-semibold text-[#9A61B0]">
                      {feature.title}
                    </h3>
                    <div>
                      {feature.icon}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="px-6 py-16 bg-purple-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-[#9A61B0] mb-12">
              How CulinaMind Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#9A61B0] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold text-[#9A61B0] mb-2">Tell Us What You Have</h3>
                <p className="text-gray-700">Share your available ingredients and preferences</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#9A61B0] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold text-[#9A61B0] mb-2">AI Generates Recipes</h3>
                <p className="text-gray-700">Get personalized, detailed cooking instructions</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-[#9A61B0] rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold text-[#9A61B0] mb-2">Cook & Learn</h3>
                <p className="text-gray-700">Follow along with AI guidance and improve your skills</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="px-6 py-16 bg-gradient-to-r from-[#9A61B0] to-[#8A50A0]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Cooking Experience?
            </h2>
            <p className="text-xl text-purple-100 mb-8">
              Join thousands of home chefs who are already cooking smarter with AI
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="bg-white text-[#9A61B0] px-8 py-4 rounded-xl text-xl font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
            >
              Start Your Culinary Journey
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="px-6 py-8 bg-[#8A50A0] text-white">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-purple-100">
              © 2024 CulinaMind. Your AI-powered culinary companion.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Welcome;
