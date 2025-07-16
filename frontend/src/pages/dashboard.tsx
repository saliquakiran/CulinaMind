import { FC, useState } from "react";
import RecipeTab from "./recipe";
import MealPlanTab from "./meal-plan";
import AIAssistantTab from "./ai-assistant";

const Dashboard: FC = () => {
  const [activeTab, setActiveTab] = useState("recipe");

  const tabs = [
    { id: "recipe", label: "Recipe", icon: "🍳" },
    { id: "meal-plan", label: "Meal Plan", icon: "📅" },
    { id: "ai-assistant", label: "AI Assistant", icon: "🤖" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "recipe":
        return <RecipeTab />;
      case "meal-plan":
        return <MealPlanTab />;
      case "ai-assistant":
        return <AIAssistantTab />;
      default:
        return <RecipeTab />;
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
            Your personal culinary companion for recipes, meal planning, and AI-powered cooking assistance
          </p>
        </div>
      </div>

      {/* Tab Navigation - Fixed positioning to prevent disappearing */}
      <div className="sticky top-0 z-[50] bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-2">
          <div className="bg-white rounded-t-2xl shadow-lg border border-purple-100 border-b-0">
            <div className="flex border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-3 py-4 text-lg font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? "bg-[#9A61B0] text-white border-b-2 border-[#9A61B0]"
                      : "text-gray-600 hover:text-[#9A61B0] hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl">{tab.icon}</span>
                    <span>{tab.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-2">
        <div className="bg-white rounded-b-2xl shadow-lg border border-purple-100 border-t-0">
          <div className="p-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 