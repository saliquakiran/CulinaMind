import { useEffect, useState } from "react";
import { getFavorites, removeRecipeFromFavorites } from "../../services/api";
import recipeImage from "../../assets/images/recipe.jpg";
import { toast } from "react-toastify";

interface Recipe {
  id?: number;
  title?: string;
  time?: string;
  nutritional_value?: string;
  image_url?: string;
  ingredients?: string[];
  instructions?: string[];
  time_breakdown?: Record<string, string>;
  favorite: boolean;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Helper function to get the best available time display
  const getTimeDisplay = (recipe: Recipe) => {
    if (recipe.time && recipe.time.trim()) {
      return recipe.time;
    }
    if (recipe.time_breakdown && recipe.time_breakdown['Total Time']) {
      return recipe.time_breakdown['Total Time'];
    }
    return "Not available";
  };

  // Fetch favorite recipes
  const fetchFavorites = async () => {
    try {
      const favoritesData = await getFavorites();
      console.log('=== FRONTEND RECEIVED DATA ===');
      console.log('Raw favorites data:', favoritesData);
      console.log('First recipe:', favoritesData[0]);
      console.log('First recipe nutritional_value:', favoritesData[0]?.nutritional_value);
      console.log('First recipe nutritional_value type:', typeof favoritesData[0]?.nutritional_value);
      console.log('=== END FRONTEND DATA ===');
      
      setFavorites(
        favoritesData.map((recipe: any) => ({
          ...recipe,
          favorite: true,
          time_breakdown: recipe.time_breakdown || {},
        }))
      );
    } catch (error) {
      toast.error("Failed to load favorite recipes.");
      setFavorites([]);
    }
  };

  // Fetch favorites when component mounts
  useEffect(() => {
    fetchFavorites();
  }, []);

  // Toggle Favorite (Remove from favorites)
  const toggleFavorite = async (index: number) => {
    const selectedRecipe = favorites[index];
    if (!selectedRecipe.id) return;

    try {
      await removeRecipeFromFavorites(selectedRecipe.id);
      toast.success("Removed from favorites!");
      fetchFavorites();
    } catch (error) {
      toast.error("Failed to remove from favorites.");
    }
  };

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-lavender-50">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-purple-100/50 to-transparent py-12 mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#9A61B0] mb-2">
            Your Favorite Recipes
          </h1>
          <p className="text-gray-600 mb-1">
            All your saved recipes in one place. Click on any recipe to see the full details.
          </p>
        </div>
      </div>

      {/* Favorites Content */}
      {favorites.length > 0 ? (
        <div className="max-w-7xl mx-auto px-2">
          <div className="space-y-6">
            {favorites.map((recipe, index) => (
              <div
                key={recipe.id || index}
                className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden hover:shadow-xl transition-all"
              >
                {/* Recipe Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-purple-50 transition-colors"
                  onClick={() => toggleExpand(index)}
                >
                  <div className="flex items-center gap-6">
                    <img
                      src={recipe.image_url || recipeImage}
                      alt={recipe.title || "Recipe"}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {recipe.title || "No Title"}
                      </h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {getTimeDisplay(recipe)}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3-16h3" />
                          </svg>
                          {(() => {
                            console.log('Nutritional value details:', {
                              value: recipe.nutritional_value,
                              type: typeof recipe.nutritional_value,
                              stringified: JSON.stringify(recipe.nutritional_value)
                            });
                            if (recipe.nutritional_value && typeof recipe.nutritional_value === 'string') {
                              return recipe.nutritional_value;
                            } else if (recipe.nutritional_value && typeof recipe.nutritional_value === 'object') {
                              return JSON.stringify(recipe.nutritional_value);
                            }
                            return "Not available";
                          })()} 
                          {/* Debug: {JSON.stringify(recipe.nutritional_value)} */}
                        </span>
                      </div>

                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(index);
                        }}
                        className="text-2xl hover:scale-110 transition-transform"
                        title="Remove from favorites"
                      >
                        <span className="text-red-500">★</span>
                      </button>
                      <svg 
                        className={`w-6 h-6 text-gray-400 transition-transform ${expandedIndex === index ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedIndex === index && (
                  <div className="border-t border-purple-100 bg-purple-50/30">
                    <div className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left Column - Recipe Details */}
                        <div className="space-y-6">
                          {/* Ingredients */}
                          <div>
                            <h4 className="text-lg font-semibold text-[#9A61B0] mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                              </svg>
                              Ingredients
                            </h4>
                            {recipe.ingredients && recipe.ingredients.length > 0 ? (
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {recipe.ingredients.map((item: string, i: number) => (
                                  <li key={i} className="flex items-center gap-2 text-gray-700">
                                    <div className="w-2 h-2 bg-[#9A61B0] rounded-full"></div>
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-gray-500 italic">No ingredients listed</p>
                            )}
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className="text-lg font-semibold text-[#9A61B0] mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Instructions
                            </h4>
                            {recipe.instructions && recipe.instructions.length > 0 ? (
                              <ol className="space-y-3">
                                {recipe.instructions.map((step: string, i: number) => (
                                  <li key={i} className="flex gap-3 text-gray-700">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#9A61B0] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                      {i + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-gray-500 italic">No instructions available</p>
                            )}
                          </div>

                          {/* Time Breakdown */}
                          {recipe.time_breakdown && Object.keys(recipe.time_breakdown).length > 0 && (
                            <div>
                              <h4 className="text-lg font-semibold text-[#9A61B0] mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Time Breakdown
                              </h4>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {Object.entries(recipe.time_breakdown).map(([step, time], i) => (
                                  <div key={i} className="flex items-center gap-2 text-gray-700">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#9A61B0] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                      {step}
                                    </span>
                                    <span>{time as string}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column - Large Image */}
                        <div className="flex justify-center">
                          <img
                            src={recipe.image_url || recipeImage} 
                            alt={recipe.title || "Recipe"}
                            className="w-full h-auto rounded-xl object-cover max-w-md shadow-lg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="text-6xl mb-6">⭐</div>
            <h2 className="text-3xl font-bold text-[#9A61B0] mb-4">
              No Favorites Yet
            </h2>
            <p className="text-gray-600 text-lg mb-8">
              Start building your collection of favorite recipes by searching and saving the ones you love.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Favorites;
