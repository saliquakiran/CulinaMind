import { FC, useState } from "react";
import Search from "./recipe/search.tsx";
import Favorites from "./recipe/favorites.tsx";

const Dashboard: FC = () => {
  const [activeTab, setActiveTab] = useState("search");

  const tabs = [
    { id: "search", label: "Search", icon: "🔍" },
    { id: "favorites", label: "Favorites", icon: "❤️" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "search":
        return <Search />;
      case "favorites":
        return <Favorites />;
      default:
        return <Search />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-lavender-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] text-white py-16 px-2">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            CulinaMind Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-4xl mx-auto">
            Your personal culinary companion for recipes and AI-powered cooking assistance
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 text-lg font-semibold transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-[#9A61B0] border-b-2 border-[#9A61B0]"
                  : "text-gray-600 hover:text-[#9A61B0]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;