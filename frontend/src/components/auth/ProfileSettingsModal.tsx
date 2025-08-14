import { useState, FormEvent, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import Input from "../ui/FloatingLabelInput";
import { updateUserProfile, updateUserPreferences, getUserPreferences } from "../../services/api";
import { mcpValidator } from "../../services/mcpValidator";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFirstName: string;
  currentLastName: string;
  onProfileUpdate: (firstName: string, lastName: string) => void;
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

// Custom Input Modal Component - moved outside to prevent re-creation
const CustomInputModal = ({ 
  isOpen, 
  onClose, 
  category, 
  onAdd 
}: {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onAdd: (value: string) => void;
}) => {
  const [customInputValue, setCustomInputValue] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);

  // Helper functions for custom input validation
  const getCategoryLabel = (category: string) => {
    const labels = {
      dietary_restrictions: 'Dietary Restriction',
      cuisine_preferences: 'Cuisine',
      cooking_equipment: 'Cooking Equipment',
      health_goals: 'Health Goal'
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryExample = (category: string) => {
    const examples = {
      dietary_restrictions: 'lactose-free, halal, kosher',
      cuisine_preferences: 'Lebanese, Ethiopian, Peruvian',
      cooking_equipment: 'instant pot, sous vide, wok',
      health_goals: 'muscle building, heart health, weight loss'
    };
    return examples[category as keyof typeof examples] || 'example';
  };


  const handleValidate = async () => {
    if (!customInputValue.trim()) return;
    
    setValidating(true);
    try {
      // Use real MCP validation instead of mock
      const categoryMap = {
        dietary_restrictions: 'dietary' as const,
        cuisine_preferences: 'cuisine' as const,
        cooking_equipment: 'equipment' as const,
        ingredient_preferences: 'dietary' as const, // Map to dietary for validation
        ingredient_dislikes: 'dietary' as const, // Map to dietary for validation
        health_goals: 'health' as const
      };
      
      const mcpCategory = categoryMap[category as keyof typeof categoryMap] || 'dietary';
      const validation = await mcpValidator.validateEntry(customInputValue, mcpCategory);
      setValidationResult(validation);
      
    } catch (error) {
      console.error('Validation error:', error);
      setValidationResult({ 
        isValid: false, 
        confidence: 0.0,
        reason: 'Validation failed', 
        sources: [],
        suggestions: [],
        category_match: false
      });
    } finally {
      setValidating(false);
    }
  };

  const handleAddCustom = () => {
    if (validationResult?.isValid) {
      // Add to preferences
      const value = validationResult.suggestion || customInputValue;
      onAdd(value);
      
      // Close modal and reset
      onClose();
      setCustomInputValue('');
      setValidationResult(null);
      toast.success(`${getCategoryLabel(category)} added successfully!`);
    }
  };

  const handleClose = () => {
    onClose();
    setCustomInputValue('');
    setValidationResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative z-[10000000] bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Add Custom {getCategoryLabel(category)}</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter {getCategoryLabel(category).toLowerCase()}
              </label>
              <input
                type="text"
                value={customInputValue}
                onChange={(e) => setCustomInputValue(e.target.value)}
                placeholder={`e.g., ${getCategoryExample(category)}`}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                autoFocus
              />
            </div>
            
            <button
              onClick={handleValidate}
              disabled={validating || !customInputValue.trim()}
              className="w-full bg-[#9A61B0] text-white py-2 px-4 rounded-lg font-semibold hover:bg-[#8A50A0] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {validating ? 'Validating...' : 'Validate'}
            </button>
            
            {validationResult && (
              <div className={`p-3 rounded-lg ${
                validationResult.isValid 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${
                    validationResult.isValid ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className={`font-medium ${
                    validationResult.isValid ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {validationResult.isValid ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {validationResult.reason && (
                  <p className={`text-sm mt-1 ${
                    validationResult.isValid ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {validationResult.reason}
                  </p>
                )}
                {validationResult.suggestion && validationResult.suggestion !== customInputValue && (
                  <p className="text-sm mt-1 text-blue-700">
                    Suggestion: {validationResult.suggestion}
                  </p>
                )}
                
                {/* Display suggestions if available */}
                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {validationResult.isValid ? 'Related terms:' : 'Did you mean:'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {validationResult.suggestions.map((suggestion: string, index: number) => (
                        <button
                          key={index}
                          onClick={() => {
                            setCustomInputValue(suggestion);
                            setValidationResult(null);
                          }}
                          className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {validationResult?.isValid && (
              <button
                onClick={handleAddCustom}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700"
              >
                Add to Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfileSettingsModal = ({ 
  isOpen, 
  onClose, 
  currentFirstName, 
  currentLastName, 
  onProfileUpdate 
}: ProfileSettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences'>('profile');
  const [form, setForm] = useState({
    first_name: currentFirstName,
    last_name: currentLastName,
  });
  const [originalForm, setOriginalForm] = useState({
    first_name: currentFirstName,
    last_name: currentLastName,
  });
  const [loading, setLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);

  // Custom Input Modal State
  const [showCustomInputModal, setShowCustomInputModal] = useState(false);
  const [customInputCategory, setCustomInputCategory] = useState<string>('');

  // User Preferences State
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

  // Original preferences state for change tracking
  const [originalPreferences, setOriginalPreferences] = useState<UserPreferences>({
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

  // Options for preferences
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

  const timeOptions = [
    { value: "", label: "Select time" },
    { value: "15min", label: "Under 15 minutes" },
    { value: "30min", label: "15-30 minutes" },
    { value: "1hr", label: "30-60 minutes" },
    { value: "2hrs", label: "1-2 hours" },
    { value: "3hrs", label: "2-3 hours" },
    { value: "4hrs", label: "3+ hours" }
  ];

  const servingSizeOptions = [
    { value: 0, label: "Select serving" },
    { value: 1, label: "1 person" },
    { value: 2, label: "2 people" },
    { value: 3, label: "3 people" },
    { value: 4, label: "4 people" },
    { value: 5, label: "5 people" },
    { value: 6, label: "6 people" },
    { value: 7, label: "7 people" },
    { value: 8, label: "8 people" }
  ];

  // Load user preferences when modal opens
  useEffect(() => {
    if (isOpen && !preferencesLoaded) {
      loadUserPreferences();
    }
  }, [isOpen, preferencesLoaded]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setForm({
        first_name: currentFirstName,
        last_name: currentLastName,
      });
      setOriginalForm({
        first_name: currentFirstName,
        last_name: currentLastName,
      });
      setActiveTab('profile'); // Always start with profile tab
    }
  }, [isOpen, currentFirstName, currentLastName]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const loadUserPreferences = async () => {
    try {
      const response = await getUserPreferences();
      if (response.data) {
        const userPrefs = response.data;
        const loadedPreferences = {
          skill_level: userPrefs.skill_level || "",
          dietary_restrictions: userPrefs.dietary_restrictions || [],
          cuisine_preferences: userPrefs.cuisine_preferences || [],
          cooking_equipment: userPrefs.cooking_equipment || [],
          ingredient_preferences: userPrefs.ingredient_preferences || [],
          ingredient_dislikes: userPrefs.ingredient_dislikes || [],
          health_goals: userPrefs.health_goals || [],
          cooking_time_preferences: userPrefs.cooking_time_preferences || {
            weekday: "",
            weekend: ""
          },
          serving_size_preferences: userPrefs.serving_size_preferences || {
            weekday: 0,
            weekend: 0
          }
        };
        setPreferences(loadedPreferences);
        setOriginalPreferences(loadedPreferences);
      }
      setPreferencesLoaded(true);
    } catch (error) {
      console.error("Error loading user preferences:", error);
      setPreferencesLoaded(true);
    }
  };

  const handleFormChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Check if form has been modified from original values
  const isFormModified = () => {
    return form.first_name !== originalForm.first_name || 
           form.last_name !== originalForm.last_name;
  };

  // Check if preferences have been modified from original values
  const isPreferencesModified = () => {
    return (
      preferences.skill_level !== originalPreferences.skill_level ||
      JSON.stringify(preferences.dietary_restrictions.sort()) !== JSON.stringify(originalPreferences.dietary_restrictions.sort()) ||
      JSON.stringify(preferences.cuisine_preferences.sort()) !== JSON.stringify(originalPreferences.cuisine_preferences.sort()) ||
      JSON.stringify(preferences.cooking_equipment.sort()) !== JSON.stringify(originalPreferences.cooking_equipment.sort()) ||
      JSON.stringify(preferences.ingredient_preferences.sort()) !== JSON.stringify(originalPreferences.ingredient_preferences.sort()) ||
      JSON.stringify(preferences.ingredient_dislikes.sort()) !== JSON.stringify(originalPreferences.ingredient_dislikes.sort()) ||
      JSON.stringify(preferences.health_goals.sort()) !== JSON.stringify(originalPreferences.health_goals.sort()) ||
      preferences.cooking_time_preferences.weekday !== originalPreferences.cooking_time_preferences.weekday ||
      preferences.cooking_time_preferences.weekend !== originalPreferences.cooking_time_preferences.weekend ||
      preferences.serving_size_preferences.weekday !== originalPreferences.serving_size_preferences.weekday ||
      preferences.serving_size_preferences.weekend !== originalPreferences.serving_size_preferences.weekend
    );
  };

  const handleMultiSelect = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => {
      const currentValue = prev[category];
      
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

  const handleSingleSelect = (category: keyof UserPreferences, value: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: value
    }));
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

  const handleTimePreference = (day: 'weekday' | 'weekend', value: string) => {
    setPreferences(prev => ({
      ...prev,
      cooking_time_preferences: {
        ...prev.cooking_time_preferences,
        [day]: value
      }
    }));
  };

  const handleServingSize = (day: 'weekday' | 'weekend', value: number) => {
    setPreferences(prev => ({
      ...prev,
      serving_size_preferences: {
        ...prev.serving_size_preferences,
        [day]: value
      }
    }));
  };

  const handleProfileSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateUserProfile(form.first_name, form.last_name);
      
      // Update local storage with new user data
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const updatedUser = {
          ...user,
          first_name: form.first_name,
          last_name: form.last_name,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }

      // Call the callback to update parent component
      onProfileUpdate(form.first_name, form.last_name);
      
      // Update original form values to reflect the successful update
      setOriginalForm({
        first_name: form.first_name,
        last_name: form.last_name,
      });
      
      toast.success("Profile updated successfully!");
      
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesSubmit = async () => {
    setPreferencesLoading(true);
    try {
      await updateUserPreferences(preferences);
      
      // Update original preferences to reflect the successful save
      setOriginalPreferences(preferences);
      
      toast.success("Preferences updated successfully!");
    } catch (error) {
      toast.error("Failed to update preferences. Please try again.");
      console.error("Error updating preferences:", error);
    } finally {
      setPreferencesLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  // Handle custom input addition
  const handleAddCustomInput = useCallback((value: string) => {
    handleMultiSelect(customInputCategory as keyof UserPreferences, value);
  }, [customInputCategory]);

  // Handle opening custom input modal
  const handleOpenCustomInput = useCallback((category: string) => {
    setCustomInputCategory(category);
    setShowCustomInputModal(true);
  }, []);

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-[1000000] bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] transform transition-all border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-200 bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] text-white">
          <h2 className="text-xl font-bold">
            Profile Settings
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

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'profile'
                ? 'bg-white text-[#9A61B0] border-b-2 border-[#9A61B0]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Personal Info
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'preferences'
                ? 'bg-white text-[#9A61B0] border-b-2 border-[#9A61B0]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Culinary Preferences
            </div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Personal Info Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-gray-600">Update your basic profile information below.</p>
              </div>
              
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    value={form.first_name}
                    onChange={({ target }) => handleFormChange("first_name", target.value)}
                    type="text"
                  />
                  
                  <Input
                    label="Last Name"
                    value={form.last_name}
                    onChange={({ target }) => handleFormChange("last_name", target.value)}
                    type="text"
                  />
                </div>
                
                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={loading || !form.first_name.trim() || !form.last_name.trim() || !isFormModified()}
                    className="bg-[#9A61B0] text-white py-3 px-8 rounded-xl font-semibold hover:bg-[#8A50A0] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Updating...</span>
                      </div>
                    ) : (
                      "Update Profile"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Culinary Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="space-y-8">
              <div className="text-center">
                <p className="text-gray-600">Customize your culinary preferences and cooking style below.</p>
              </div>

              {/* Skill Level - Horizontal Layout */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Cooking Experience</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {skillLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => handleSingleSelect('skill_level', level.value)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        preferences.skill_level === level.value
                          ? 'border-[#9A61B0] bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          preferences.skill_level === level.value
                            ? 'border-[#9A61B0] bg-[#9A61B0]'
                            : 'border-gray-300'
                        }`}>
                          {preferences.skill_level === level.value && (
                            <div className="w-2 h-2 bg-white rounded-full m-0.5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{level.label}</h4>
                          <p className="text-sm text-gray-600">{level.description}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Restrictions */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dietary Restrictions</h3>
                  <button
                    onClick={() => handleOpenCustomInput('dietary_restrictions')}
                    className="flex items-center gap-2 text-[#9A61B0] hover:text-[#8A50A0] font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {dietaryOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleDietaryRestriction(option)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        preferences.dietary_restrictions.includes(option)
                          ? 'border-[#9A61B0] bg-purple-50 text-[#9A61B0]'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                  {/* Display custom dietary restrictions */}
                  {preferences.dietary_restrictions
                    .filter(restriction => !dietaryOptions.includes(restriction))
                    .map((restriction) => (
                      <button
                        key={`custom-${restriction}`}
                        type="button"
                        onClick={() => handleDietaryRestriction(restriction)}
                        className="p-3 rounded-lg border text-sm transition-all border-[#9A61B0] bg-purple-50 text-[#9A61B0]"
                      >
                        {restriction}
                      </button>
                    ))}
                </div>
              </div>

              {/* Cuisine Preferences */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Favorite Cuisines</h3>
                  <button
                    onClick={() => handleOpenCustomInput('cuisine_preferences')}
                    className="flex items-center gap-2 text-[#9A61B0] hover:text-[#8A50A0] font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                  {/* Display custom cuisine preferences */}
                  {preferences.cuisine_preferences
                    .filter(cuisine => !cuisineOptions.includes(cuisine))
                    .map((cuisine) => (
                      <button
                        key={`custom-${cuisine}`}
                        type="button"
                        onClick={() => handleMultiSelect('cuisine_preferences', cuisine)}
                        className="p-3 rounded-lg border text-sm transition-all border-[#9A61B0] bg-purple-50 text-[#9A61B0]"
                      >
                        {cuisine}
                      </button>
                    ))}
                </div>
              </div>

              {/* Cooking Equipment */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Available Cooking Equipment</h3>
                  <button
                    onClick={() => handleOpenCustomInput('cooking_equipment')}
                    className="flex items-center gap-2 text-[#9A61B0] hover:text-[#8A50A0] font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                  {/* Display custom cooking equipment */}
                  {preferences.cooking_equipment
                    .filter(equipment => !equipmentOptions.includes(equipment))
                    .map((equipment) => (
                      <button
                        key={`custom-${equipment}`}
                        type="button"
                        onClick={() => handleMultiSelect('cooking_equipment', equipment)}
                        className="p-3 rounded-lg border text-sm transition-all border-[#9A61B0] bg-purple-50 text-[#9A61B0]"
                      >
                        {equipment}
                      </button>
                    ))}
                </div>
              </div>

              {/* Ingredient Preferences - Only Type Box */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Favorite Ingredients</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Type ingredient and press Enter (e.g., tomatoes, basil, garlic)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
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
                    <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Ingredient Dislikes - Only Type Box */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients to Avoid</h3>
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Type ingredient and press Enter (e.g., mushrooms, anchovies)"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
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
                    <div className="flex flex-wrap gap-2 mt-2">
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

              {/* Health Goals - Consistent Design */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Health Goals</h3>
                  <button
                    onClick={() => handleOpenCustomInput('health_goals')}
                    className="flex items-center gap-2 text-[#9A61B0] hover:text-[#8A50A0] font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Custom
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {healthGoals.map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => handleMultiSelect('health_goals', goal)}
                      className={`p-3 rounded-lg border text-sm transition-all ${
                        preferences.health_goals.includes(goal)
                          ? 'border-[#9A61B0] bg-purple-50 text-[#9A61B0]'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                  {/* Display custom health goals */}
                  {preferences.health_goals
                    .filter(goal => !healthGoals.includes(goal))
                    .map((goal) => (
                      <button
                        key={`custom-${goal}`}
                        type="button"
                        onClick={() => handleMultiSelect('health_goals', goal)}
                        className="p-3 rounded-lg border text-sm transition-all border-[#9A61B0] bg-purple-50 text-[#9A61B0]"
                      >
                        {goal}
                      </button>
                    ))}
                </div>
              </div>

              {/* Cooking Time Preferences - Dropdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Cooking Times</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Weekday Cooking Time</label>
                    <select
                      value={preferences.cooking_time_preferences.weekday}
                      onChange={(e) => handleTimePreference('weekday', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Weekend Cooking Time</label>
                    <select
                      value={preferences.cooking_time_preferences.weekend}
                      onChange={(e) => handleTimePreference('weekend', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    >
                      {timeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Serving Size Preferences - Dropdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preferred Serving Sizes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Weekday Serving Size</label>
                    <select
                      value={preferences.serving_size_preferences.weekday}
                      onChange={(e) => handleServingSize('weekday', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    >
                      {servingSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Weekend Serving Size</label>
                    <select
                      value={preferences.serving_size_preferences.weekend}
                      onChange={(e) => handleServingSize('weekend', parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent"
                    >
                      {servingSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Save Preferences Button */}
              <div className="flex justify-center pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handlePreferencesSubmit}
                  disabled={preferencesLoading || !isPreferencesModified()}
                  className="bg-[#9A61B0] text-white py-3 px-8 rounded-xl font-semibold hover:bg-[#8A50A0] transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {preferencesLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    "Update Preferences"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={handleClose}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors hover:bg-gray-100 py-2 px-4 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Custom Input Modal */}
      <CustomInputModal
        isOpen={showCustomInputModal}
        onClose={() => setShowCustomInputModal(false)}
        category={customInputCategory}
        onAdd={handleAddCustomInput}
      />
    </div>
  );
};

export default ProfileSettingsModal;
