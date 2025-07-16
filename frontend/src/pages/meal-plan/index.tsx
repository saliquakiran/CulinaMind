import { FC } from "react";

const MealPlanTab: FC = () => {
  return (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto">
        <div className="text-6xl mb-6">📅</div>
        <h2 className="text-3xl font-bold text-[#9A61B0] mb-4">
          Meal Planning
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Plan your weekly meals, create shopping lists, and organize your culinary journey.
        </p>
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <p className="text-purple-700">
            🚧 Coming Soon! This feature will help you plan your meals for the week ahead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealPlanTab; 