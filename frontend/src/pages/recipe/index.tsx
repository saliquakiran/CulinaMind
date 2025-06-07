import { FC, useState } from "react";
import RecipeSearch from "./search";
import Favorites from "./favorites";

const RecipeTab: FC = () => {
  const [activeSection, setActiveSection] = useState<"search" | "favorites">("search");

  return (
    <div className="space-y-8">
      {/* Section Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveSection("search")}
          className={`px-6 py-3 text-lg font-semibold transition-all duration-200 ${
            activeSection === "search"
              ? "text-[#9A61B0] border-b-2 border-[#9A61B0]"
              : "text-gray-600 hover:text-[#9A61B0]"
          }`}
        >
          Recipe Search
        </button>
        <button
          onClick={() => setActiveSection("favorites")}
          className={`px-6 py-3 text-lg font-semibold transition-all duration-200 ${
            activeSection === "favorites"
              ? "text-[#9A61B0] border-b-2 border-[#9A61B0]"
              : "text-gray-600 hover:text-[#9A61B0]"
          }`}
        >
          Favorites
        </button>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === "search" ? (
          <RecipeSearch />
        ) : (
          <Favorites />
        )}
      </div>
    </div>
  );
};

export default RecipeTab; 