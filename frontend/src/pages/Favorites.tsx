import { useEffect, useState } from "react";
import { getFavorites, removeRecipeFromFavorites } from "../utils/api";
import recipeImage from "../assets/images/recipe.jpg";
import { toast } from "react-toastify";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Fetch favorite recipes
  const fetchFavorites = async () => {
    try {
      const favoritesData = await getFavorites();
      setFavorites(
        favoritesData.map((recipe) => ({
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
    <div className="bg-[#C7AAF4] min-h-screen flex flex-col items-center w-full p-6">
      <h1 className="text-4xl font-bold text-black text-center mb-6">
        Favorite Recipes
      </h1>

      {/* Display Favorited Recipes */}
      {favorites.length > 0 ? (
        <div className="w-full max-w-6xl mt-4">
          <div className="flex flex-col gap-6">
            {favorites.map((recipe, index) => (
              <div
                key={recipe.id || index}
                className="bg-gray-100 rounded-lg shadow-md p-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-center">
                  <img
                    src={recipe.image_url || recipeImage}
                    alt={recipe.title || "Recipe"}
                    className="w-24 h-24 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">
                      {recipe.title || "No Title"}
                    </h3>
                    <p className="text-gray-700">Time: {recipe.time || "N/A"}</p>
                    <p className="text-gray-600 font-bold">
                      Nutritional Value: {recipe.nutritional_value || "N/A"}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(index);
                    }}
                    className="text-2xl"
                  >
                    <span className="text-red-500">★</span>
                  </button>
                </div>

                {expandedIndex === index && (
                  <div className="mt-4 p-4 border-t border-gray-300 bg-white rounded-lg flex justify-between">
                    <div className="flex-1">
                      <p className="text-gray-800 font-bold mt-2">Ingredients:</p>
                      <ul className="list-disc list-inside text-gray-700">
                        {recipe.ingredients?.length > 0 ? (
                          recipe.ingredients.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))
                        ) : (
                          <li className="italic text-gray-500">No ingredients listed</li>
                        )}
                      </ul>

                      <p className="text-gray-800 font-bold mt-2">Instructions:</p>
                      <ul className="list-decimal list-inside text-gray-700">
                        {recipe.instructions?.length > 0 ? (
                          recipe.instructions.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))
                        ) : (
                          <li className="italic text-gray-500">No instructions available</li>
                        )}
                      </ul>
                        {recipe.time_breakdown && Object.keys(recipe.time_breakdown).length > 0 && (
                          <div className="mt-4">
                            <p className="text-gray-800 font-bold">Time Breakdown:</p>
                            <ul className="list-disc list-inside text-gray-700">
                              {Object.entries(recipe.time_breakdown).map(([step, duration], i) => (
                                <li key={i}>
                                  <span className="font-semibold">{step}:</span> {duration}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    <div className="w-1/3 flex justify-end">
                      <img
                        src={recipe.image_url || recipeImage}
                        alt={recipe.title || "Recipe Image"}
                        className="w-full h-auto rounded-lg object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600 mt-6 text-lg">No favorite recipes yet.</p>
      )}
    </div>
  );
};

export default Favorites;
