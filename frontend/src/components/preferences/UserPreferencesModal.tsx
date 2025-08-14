import { FC, useState } from "react";
import { updateUserPreferences } from "../../services/api";
import { toast } from "react-toastify";

interface UserPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: any) => void;
  isOnboarding?: boolean;
}

interface UserPreferences {
  skill_level: string;
  dietary_restrictions: string[];
  cuisine_preferences: string[];
  cooking_equipment: string[];
  ingredient_preferences: string[];
  ingredient_dislikes: string[];
  health_goals: string[];
  cooking_time_preferences: {
    weekday: string;
    weekend: string;
  };
  serving_size_preferences: {
    weekday: number;
    weekend: number;
  };
}

const UserPreferencesModal: FC<UserPreferencesModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  isOnboarding = false
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    skill_level: "",
    dietary_restrictions: [],
    cuisine_preferences: [],
    cooking_equipment: [],
    ingredient_preferences: [],
    ingredient_dislikes: [],
    health_goals: [],
    cooking_time_preferences: {
      weekday: "",
      weekend: ""
    },
    serving_size_preferences: {
      weekday: 0,
      weekend: 0
    }
  });

  const [loading, setLoading] = useState(false);

  const skillLevels = [
    { value: "beginner", label: "Beginner", description: "New to cooking" },
    { value: "intermediate", label: "Intermediate", description: "Some experience" },
    { value: "advanced", label: "Advanced", description: "Experienced cook" }
  ];

  const dietaryOptions = [
    "None", "Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Keto", "Paleo",
    "Low-Carb", "Low-Sodium", "Diabetic-Friendly", "Lactose Intolerant",
    "Nut Allergy", "Seafood Allergy", "Egg Allergy", "Soy Allergy"
  ];

  const cuisineOptions = [
    "Italian", "Mexican", "Chinese", "Indian", "Japanese", "Thai", "French",
    "Mediterranean", "American", "Korean", "Vietnamese", "Greek", "Spanish",
    "Middle Eastern", "Caribbean", "African", "German", "British", "Fusion"
  ];

  const equipmentOptions = [
    "Oven", "Stovetop", "Microwave", "Grill", "Slow Cooker", "Pressure Cooker",
    "Air Fryer", "Blender", "Food Processor", "Stand Mixer", "Sous Vide",
    "Wok", "Cast Iron Pan", "Dutch Oven", "Rice Cooker", "Toaster Oven"
  ];

  const healthGoals = [
    "Weight Loss", "Weight Gain", "Muscle Building", "Heart Health",
    "Diabetes Management", "Digestive Health", "Energy Boost",
    "Immune Support", "Anti-Inflammatory", "General Wellness"
  ];



  const handleMultiSelect = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const currentValue = prev[category];
      
      // Only handle array properties for multi-select
      if (Array.isArray(currentValue)) {
        return {
          ...prev,
          [category]: currentValue.includes(value)
            ? currentValue.filter(item => item !== value)
            : [...currentValue, value]
        };
      }
      
      return prev;
    });
  };

  const handleDietaryRestriction = (value: string) => {
    setPreferences(prev => {
      const currentRestrictions = prev.dietary_restrictions;
      
      if (value === "None") {
        // If "None" is selected, clear all other restrictions
        return {
          ...prev,
          dietary_restrictions: ["None"]
        };
      } else {
        // If any other option is selected, remove "None" if it exists
        const filteredRestrictions = currentRestrictions.filter(item => item !== "None");
        
        if (filteredRestrictions.includes(value)) {
          // Remove the option if it's already selected
          return {
            ...prev,
            dietary_restrictions: filteredRestrictions.filter(item => item !== value)
          };
        } else {
          // Add the option
          return {
            ...prev,
            dietary_restrictions: [...filteredRestrictions, value]
          };
        }
      }
    });
  };

  const handleSingleSelect = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const nextStep = () => {
    // For required steps (1 & 2), validate even when skipping
    if (currentStep === 1 && !preferences.skill_level) {
      toast.error("Please select your cooking experience level");
      return;
    }
    if (currentStep === 2 && preferences.dietary_restrictions.length === 0) {
      toast.error("Please select at least one dietary restriction (or 'None')");
      return;
    }
    
    // For optional steps (3-7), allow skipping without validation
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateUserPreferences(preferences);
      onComplete(preferences);
      toast.success("Preferences saved successfully!");
    } catch (error) {
      toast.error("Failed to save preferences. Please try again.");
      console.error("Error saving preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-[1000000] bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] transform transition-all border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-200 bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] text-white">
          <h2 className="text-xl font-bold">
            {isOnboarding ? "Set Your Preferences" : "Update Preferences"}
          </h2>
          <button
            onClick={handleClose}
            className="text-purple-100 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 7</span>
            <span className="text-sm text-gray-500">{Math.round(((currentStep - 1) / 7) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-[#9A61B0] h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Step 1: Skill Level */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What's your cooking experience?</h3>
                <p className="text-gray-600">This helps us recommend recipes that match your skill level.</p>
              </div>
              
              <div className="grid gap-4">
                {skillLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => handleSingleSelect('skill_level', level.value)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      preferences.skill_level === level.value
                        ? 'border-[#9A61B0] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        preferences.skill_level === level.value
                          ? 'border-[#9A61B0] bg-[#9A61B0]'
                          : 'border-gray-300'
                      }`}>
                        {preferences.skill_level === level.value && (
                          <div className="w-2 h-2 bg-white rounded-full m-1" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{level.label}</h4>
                        <p className="text-gray-600">{level.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Dietary Restrictions */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Any dietary restrictions?</h3>
                <p className="text-gray-600">Select all that apply to help us filter recipes for you.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {dietaryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleDietaryRestriction(option)}
                    className={`p-4 rounded-lg border text-sm transition-all ${
                      preferences.dietary_restrictions.includes(option)
                        ? 'border-[#9A61B0] bg-purple-50 text-[#9A61B0]'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Cuisine Preferences */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What cuisines do you enjoy?</h3>
                <p className="text-gray-600">Select your favorite types of cuisine.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {cuisineOptions.map((cuisine) => (
                  <button
                    key={cuisine}
                    type="button"
                    onClick={() => handleMultiSelect('cuisine_preferences', cuisine)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      preferences.cuisine_preferences.includes(cuisine)
                        ? 'border-[#9A61B0] bg-purple-50 text-[#9A61B0]'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Cooking Equipment */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">What cooking equipment do you have?</h3>
                <p className="text-gray-600">This helps us suggest recipes you can actually make.</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {equipmentOptions.map((equipment) => (
                  <button
                    key={equipment}
                    type="button"
                    onClick={() => handleMultiSelect('cooking_equipment', equipment)}
                    className={`p-3 rounded-lg border text-sm transition-all ${
                      preferences.cooking_equipment.includes(equipment)
                        ? 'border-[#9A61B0] bg-purple-50 text-[#9A61B0]'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    {equipment}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 5: Ingredient Preferences */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Favorite ingredients</h3>
                <p className="text-gray-600">Type ingredients you love and press Enter to add them.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Type ingredient and press Enter (e.g., tomatoes, basil, garlic)"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !preferences.ingredient_preferences.includes(value)) {
                          setPreferences(prev => ({
                            ...prev,
                            ingredient_preferences: [...prev.ingredient_preferences, value]
                          }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preferences.ingredient_preferences.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {ingredient}
                        <button
                          onClick={() => setPreferences(prev => ({
                            ...prev,
                            ingredient_preferences: prev.ingredient_preferences.filter((_, i) => i !== index)
                          }))}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Ingredient Dislikes */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Ingredients to avoid</h3>
                <p className="text-gray-600">Type ingredients you dislike or are allergic to.</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Type ingredient and press Enter (e.g., mushrooms, anchovies)"
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.currentTarget.value.trim();
                        if (value && !preferences.ingredient_dislikes.includes(value)) {
                          setPreferences(prev => ({
                            ...prev,
                            ingredient_dislikes: [...prev.ingredient_dislikes, value]
                          }));
                          e.currentTarget.value = '';
                        }
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-3">
                    {preferences.ingredient_dislikes.map((ingredient, index) => (
                      <span
                        key={index}
                        className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {ingredient}
                        <button
                          onClick={() => setPreferences(prev => ({
                            ...prev,
                            ingredient_dislikes: prev.ingredient_dislikes.filter((_, i) => i !== index)
                          }))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Health Goals */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Health goals</h3>
                <p className="text-gray-600">What are you trying to achieve with your cooking?</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {healthGoals.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => handleMultiSelect('health_goals', goal)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      preferences.health_goals.includes(goal)
                        ? 'border-[#9A61B0] bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded border-2 ${
                        preferences.health_goals.includes(goal)
                          ? 'border-[#9A61B0] bg-[#9A61B0]'
                          : 'border-gray-300'
                      }`}>
                        {preferences.health_goals.includes(goal) && (
                          <div className="w-2 h-2 bg-white rounded m-0.5" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">{goal}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <div className="flex gap-3">
              <button
                onClick={currentStep === 7 ? handleSubmit : () => nextStep()}
                disabled={currentStep === 1 || currentStep === 2 || (currentStep === 7 && preferences.health_goals.length > 0)}
                className={`px-4 py-2 font-medium transition-colors ${
                  currentStep === 1 || currentStep === 2 || (currentStep === 7 && preferences.health_goals.length > 0)
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {currentStep === 7 ? 'Skip & Save' : 'Skip'}
              </button>
              
              {currentStep === 7 ? (
                <button
                  onClick={handleSubmit}
                  disabled={loading || preferences.health_goals.length === 0}
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform shadow-lg ${
                    loading || preferences.health_goals.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none'
                      : 'bg-[#9A61B0] text-white hover:bg-[#8A50A0] hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Save Preferences"
                  )}
                </button>
              ) : (
                <button
                  onClick={() => nextStep()}
                  disabled={
                    (currentStep === 1 && !preferences.skill_level) || 
                    (currentStep === 2 && preferences.dietary_restrictions.length === 0) ||
                    (currentStep === 3 && preferences.cuisine_preferences.length === 0) ||
                    (currentStep === 4 && preferences.cooking_equipment.length === 0) ||
                    (currentStep === 5 && preferences.ingredient_preferences.length === 0) ||
                    (currentStep === 6 && preferences.ingredient_dislikes.length === 0) ||
                    (currentStep === 7 && preferences.health_goals.length === 0)
                  }
                  className={`px-6 py-2 rounded-lg font-semibold transition-all duration-200 transform shadow-lg ${
                    (currentStep === 1 && !preferences.skill_level) || 
                    (currentStep === 2 && preferences.dietary_restrictions.length === 0) ||
                    (currentStep === 3 && preferences.cuisine_preferences.length === 0) ||
                    (currentStep === 4 && preferences.cooking_equipment.length === 0) ||
                    (currentStep === 5 && preferences.ingredient_preferences.length === 0) ||
                    (currentStep === 6 && preferences.ingredient_dislikes.length === 0) ||
                    (currentStep === 7 && preferences.health_goals.length === 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none'
                      : 'bg-[#9A61B0] text-white hover:bg-[#8A50A0] hover:scale-[1.02] hover:shadow-xl'
                  }`}
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPreferencesModal;
