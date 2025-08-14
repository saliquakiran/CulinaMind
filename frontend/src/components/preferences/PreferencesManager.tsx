import { FC, useState, useEffect } from "react";
import { getUserPreferences } from "../../services/api";
import UserPreferencesModal from "./UserPreferencesModal";
import { toast } from "react-toastify";

interface PreferencesManagerProps {
  onPreferencesUpdated?: (preferences: any) => void;
}

const PreferencesManager: FC<PreferencesManagerProps> = ({ onPreferencesUpdated }) => {
  const [preferences, setPreferences] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await getUserPreferences();
      setPreferences(response.data);
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences");
    } finally {
      setLoading(false);
    }
  };

  const handleEditPreferences = () => {
    setShowEditModal(true);
  };

  const handlePreferencesUpdated = (updatedPreferences: any) => {
    setPreferences(updatedPreferences);
    onPreferencesUpdated?.(updatedPreferences);
    toast.success("Preferences updated successfully!");
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <div className="text-gray-500 mb-4">
          <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <p className="text-lg font-medium">No preferences set</p>
          <p className="text-sm text-gray-400">Set your preferences to get personalized recommendations</p>
        </div>
        <button
          onClick={handleEditPreferences}
          className="mt-4 bg-[#9A61B0] text-white px-6 py-2 rounded-lg hover:bg-[#8A50A0] transition-colors"
        >
          Set Preferences
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-900">Your Preferences</h3>
        <button
          onClick={handleEditPreferences}
          className="bg-[#9A61B0] text-white px-4 py-2 rounded-lg hover:bg-[#8A50A0] transition-colors text-sm font-medium"
        >
          Edit Preferences
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Skill Level */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Cooking Skill Level</h4>
          <div className="bg-purple-50 text-purple-800 px-3 py-2 rounded-lg text-sm font-medium capitalize">
            {preferences.skill_level || "Not set"}
          </div>
        </div>

        {/* Dietary Restrictions */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Dietary Restrictions</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0 ? (
              preferences.dietary_restrictions.map((restriction: string, index: number) => (
                <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {restriction}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Cuisine Preferences */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Favorite Cuisines</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.cuisine_preferences && preferences.cuisine_preferences.length > 0 ? (
              preferences.cuisine_preferences.map((cuisine: string, index: number) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {cuisine}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Cooking Equipment */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Available Equipment</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.cooking_equipment && preferences.cooking_equipment.length > 0 ? (
              preferences.cooking_equipment.map((equipment: string, index: number) => (
                <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                  {equipment}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Favorite Ingredients */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Favorite Ingredients</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.ingredient_preferences && preferences.ingredient_preferences.length > 0 ? (
              preferences.ingredient_preferences.map((ingredient: string, index: number) => (
                <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                  {ingredient}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Disliked Ingredients */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Ingredients to Avoid</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.ingredient_dislikes && preferences.ingredient_dislikes.length > 0 ? (
              preferences.ingredient_dislikes.map((ingredient: string, index: number) => (
                <span key={index} className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  {ingredient}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Health Goals */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Health Goals</h4>
          <div className="flex flex-wrap gap-2">
            {preferences.health_goals && preferences.health_goals.length > 0 ? (
              preferences.health_goals.map((goal: string, index: number) => (
                <span key={index} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs">
                  {goal}
                </span>
              ))
            ) : (
              <span className="text-gray-500 text-sm">None specified</span>
            )}
          </div>
        </div>

        {/* Cooking Time Preferences */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Cooking Time Preferences</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weekday:</span>
              <span className="text-sm font-medium">
                {preferences.cooking_time_preferences?.weekday || "Not set"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weekend:</span>
              <span className="text-sm font-medium">
                {preferences.cooking_time_preferences?.weekend || "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Serving Size Preferences */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">Serving Size Preferences</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weekday:</span>
              <span className="text-sm font-medium">
                {preferences.serving_size_preferences?.weekday || "Not set"} people
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Weekend:</span>
              <span className="text-sm font-medium">
                {preferences.serving_size_preferences?.weekend || "Not set"} people
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Last Updated */}
      {preferences.last_updated && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Last updated: {new Date(preferences.last_updated).toLocaleString()}
          </p>
        </div>
      )}

      {/* Edit Preferences Modal */}
      <UserPreferencesModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onComplete={handlePreferencesUpdated}
        isOnboarding={false}
      />
    </div>
  );
};

export default PreferencesManager;
