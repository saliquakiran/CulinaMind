import { useState, useEffect } from "react";
import recipeImage from "../../assets/images/recipe.jpg";
import { generateRecipes } from "../../services/api";
import { addRecipeToFavorites } from "../../services/api";
import { toast } from "react-toastify";

const Recipe = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [exemption, setExemption] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [isDietaryDropdownOpen, setIsDietaryDropdownOpen] = useState(false);
  const [isCuisineDropdownOpen, setIsCuisineDropdownOpen] = useState(false);
  const [isTimeDropdownOpen, setIsTimeDropdownOpen] = useState(false);
  const [isServingDropdownOpen, setIsServingDropdownOpen] = useState(false);
  const [isIngredientUsageDropdownOpen, setIsIngredientUsageDropdownOpen] = useState(false);
  const [timeConstraint, setTimeConstraint] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [strictIngredients, setStrictIngredients] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('search');
  
  const exemptionOptions = [
    "Moroccan", "Tunisian", "Algerian", "Egyptian", "Libyan",
    "Nigerian", "Ghanaian", "Senegalese", "Ethiopian", "Somali",
    "Kenyan", "Tanzanian", "Zimbabwean", "Chinese", "Japanese",
    "Korean", "Taiwanese", "Mongolian", "Thai", "Vietnamese",
    "Filipino", "Malaysian", "Indian", "Pakistani", "Nepali",
    "Kazakh", "Turkish", "Lebanese", "Iranian", "Syrian",
    "Iraqi", "Yemeni", "Palestinian", "Armenian", "French",
    "Italian", "Spanish", "Portuguese", "Scandinavian",
    "Icelandic", "Polish", "Ukrainian", "Hungarian", "Czech",
    "Slovak", "Romanian", "Bulgarian", "Georgian", "Greek",
    "Albanian", "Maltese", "Mexican", "American", "Guatemalan",
    "Nicaraguan", "Brazilian", "Argentinian", "Chilean",
    "Venezuelan", "Bolivian", "Paraguayan", "Uruguayan",
    "Cuban", "Dominican", "Polynesian", "Melanesian",
    "Afro-Caribbean", "Indian-Chinese", "Goan (Indo-Portuguese)",
    "Chifa (Chinese-Peruvian)", "Nikkei (Japanese-Brazilian)"
  ];
  
  const dietaryOptions = [
    "Lactose Intolerant", "Gluten Intolerant", "Histamine Intolerant",
    "Sulfite Intolerant", "Fructose Intolerant", "Diabetic",
    "Low Sodium", "Low Cholesterol", "Renal Diet", "Ketogenic",
    "Low FODMAP", "GERD-friendly", "Low oxalate", "Low purine",
    "Vegan", "Vegetarian"
  ];  
  
  const [recipes, setRecipes] = useState<
    {
      title: string;
      estimated_cooking_time: string;
      nutritional_info: string;
      ingredients: string[];
      steps: string[];
      time_breakdown: Record<string, string>;
      image_url?: string;
      favorite: boolean;
    }[]
  >([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Handle clicking outside the dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close all dropdowns when clicking outside
      const target = event.target as Element;
      if (!target.closest('[data-dropdown]')) {
        setIsDietaryDropdownOpen(false);
        setIsCuisineDropdownOpen(false);
        setIsTimeDropdownOpen(false);
        setIsServingDropdownOpen(false);
        setIsIngredientUsageDropdownOpen(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDietaryDropdownOpen(false);
        setIsCuisineDropdownOpen(false);
        setIsTimeDropdownOpen(false);
        setIsServingDropdownOpen(false);
        setIsIngredientUsageDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  const addIngredient = () => {
    if (
      ingredientInput.trim() !== "" &&
      !ingredients.includes(ingredientInput.trim())
    ) {
      setIngredients([...ingredients, ingredientInput.trim()]);
      setIngredientInput("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const toggleFavorite = async (index: number) => {
    const selectedRecipe = recipes[index];
  
    if (!selectedRecipe.steps || selectedRecipe.steps.length === 0) {
      toast.error("Missing instructions, cannot add to favorites.");
      return;
    }
  
    const payload = {
      title: selectedRecipe.title,
      ingredients: selectedRecipe.ingredients,
      instructions: selectedRecipe.steps,
      image_url: selectedRecipe.image_url || recipeImage,
      time: selectedRecipe.estimated_cooking_time,
      nutritional_value: selectedRecipe.nutritional_info,
      time_breakdown: selectedRecipe.time_breakdown,
    };
  
    if (!selectedRecipe.favorite) {
      try {
        await addRecipeToFavorites(payload);
        setRecipes((prevRecipes) =>
          prevRecipes.map((recipe, i) =>
            i === index ? { ...recipe, favorite: true } : recipe
          )
        );
        toast.success("Added to favorites!");
      } catch (error: any) {
        toast.error("Failed to add to favorites.");
        console.error("Favorite API Error:", error.response?.data || error);
      }
    } else {
      toast.info("Already in favorites.");
    }
  };  
  
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleDietaryChange = (option: string) => {
    setDietary(
      (prev) =>
        prev.includes(option)
          ? prev.filter((item) => item !== option)
          : [...prev, option]
    );
  };

  const handleSearch = async () => {
    const selectedFilters = [
      cuisine && cuisine.trim(),
      dietary.length > 0,
      timeConstraint && timeConstraint.trim(),
      servingSize && servingSize.trim()
    ].filter(Boolean);
  
    const usingIngredients = ingredients.length > 0;
  
    if (usingIngredients && ingredients.length < 4) {
      toast.error("Please add at least 4 ingredients.");
      return;
    }
  
    if (!usingIngredients && selectedFilters.length < 2) {
      toast.error("Please select at least 2 options");
      return;
    }

    if (ingredients.length > 0 && strictIngredients === null) {
      toast.error("Please select how the ingredients should be used (strict or flexible).");
      return;
    }    
  
    setLoading(true);
  
    try {
      const requestData: any = {
        ingredients,
        cuisine,
        dietary_restrictions: dietary,
        time_limit: timeConstraint,
        serving_size: servingSize,
      };

      if (strictIngredients !== null) {
        requestData.strict_ingredients = strictIngredients;
      }
  
      if (cuisine.toLowerCase() === "surprise" && exemption.trim() !== "") {
        requestData.exemption = exemption;
      }
  
      const response = await generateRecipes(requestData);
  
      setRecipes(
        response.data.map((recipe: any) => ({
          title: recipe.title,
          estimated_cooking_time: recipe.estimated_cooking_time,
          nutritional_info: recipe.nutritional_info,
          ingredients: recipe.ingredients || [],
          steps: Array.isArray(recipe.instructions) ? recipe.instructions : [],
          time_breakdown: recipe.time_breakdown || {},
          image_url: recipe.image_url || recipeImage,
          favorite: false,
        }))
      );
  
      toast.success(response.message);
    } catch (error: any) {
      toast.error("Failed to fetch recipes. Please try again.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-lavender-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] text-white py-16 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Welcome to CulinaMind!
          </h1>
          <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto">
            Your AI-powered culinary companion
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('search')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'search'
                  ? 'border-[#9A61B0] text-[#9A61B0]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Recipe Search
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'favorites'
                  ? 'border-[#9A61B0] text-[#9A61B0]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab('meal-plan')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'meal-plan'
                  ? 'border-[#9A61B0] text-[#9A61B0]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Meal Plan
            </button>
            <button
              onClick={() => setActiveTab('ai-assistant')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'ai-assistant'
                  ? 'border-[#9A61B0] text-[#9A61B0]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              AI Assistant
            </button>
          </div>
        </div>
      </div>

      {/* Search Form Section */}
      {activeTab === 'search' && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
          {/* Search Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-[#9A61B0] mb-2">
              Recipe Search
            </h2>
            <p className="text-gray-600">
              Select at least 2 dropdown options or just your ingredients
            </p>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Cuisine Preference */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Cuisine</label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setIsCuisineDropdownOpen(!isCuisineDropdownOpen)}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all text-left flex justify-between items-center hover:bg-gray-100 min-h-[52px]"
                  aria-haspopup="listbox"
                  aria-expanded={isCuisineDropdownOpen}
                  aria-label="Select cuisine"
                >
                  <div className="flex-1 flex items-center">
                    {cuisine ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                        {cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select Cuisine</span>
                    )}
            </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isCuisineDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isCuisineDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setCuisine("");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !cuisine ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Select Cuisine
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("moroccan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "moroccan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Moroccan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("tunisian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "tunisian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Tunisian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("algerian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "algerian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Algerian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("egyptian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "egyptian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Egyptian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("libyan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "libyan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Libyan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("nigerian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "nigerian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Nigerian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("ghanaian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "ghanaian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Ghanaian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("senegalese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "senegalese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Senegalese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("ethiopian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "ethiopian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Ethiopian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("somali");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "somali" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Somali
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("kenyan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "kenyan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Kenyan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("tanzanian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "tanzanian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Tanzanian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("zimbabwean");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "zimbabwean" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Zimbabwean
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("chinese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "chinese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Chinese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("japanese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "japanese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Japanese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("korean");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "korean" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Korean
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("taiwanese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "taiwanese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Taiwanese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("mongolian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "mongolian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Mongolian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("thai");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "thai" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Thai
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("vietnamese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "vietnamese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Vietnamese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("filipino");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "filipino" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Filipino
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("malaysian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "malaysian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Malaysian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("indian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "indian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Indian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("pakistani");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "pakistani" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Pakistani
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("nepali");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "nepali" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Nepali
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("kazakh");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "kazakh" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Kazakh
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("turkish");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "turkish" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Turkish
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("lebanese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "lebanese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Lebanese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("iranian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "iranian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Iranian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("syrian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "syrian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Syrian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("iraqi");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "iraqi" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Iraqi
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("yemeni");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "yemeni" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Yemeni
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("palestinian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "palestinian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Palestinian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("armenian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "armenian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Armenian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("french");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "french" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        French
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("italian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "italian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Italian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("spanish");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "spanish" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Spanish
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("portuguese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "portuguese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Portuguese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("scandinavian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "scandinavian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Scandinavian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("icelandic");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "icelandic" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Icelandic
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("polish");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "polish" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Polish
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("ukrainian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "ukrainian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Ukrainian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("hungarian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "hungarian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Hungarian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("czech");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "czech" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Czech
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("slovak");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "slovak" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Slovak
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("romanian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "romanian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Romanian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("bulgarian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "bulgarian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Bulgarian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("georgian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "georgian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Georgian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("greek");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "greek" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Greek
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("albanian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "albanian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Albanian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("maltese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "maltese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Maltese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("mexican");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "mexican" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Mexican
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("american");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "american" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        American
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("guatemalan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "guatemalan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Guatemalan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("nicaraguan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "nicaraguan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Nicaraguan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("brazilian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "brazilian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Brazilian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("argentinian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "argentinian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Argentinian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("chilean");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "chilean" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Chilean
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("venezuelan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "venezuelan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Venezuelan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("bolivian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "bolivian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Bolivian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("paraguayan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "paraguayan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Paraguayan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("uruguayan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "uruguayan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Uruguayan
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("cuban");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "cuban" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Cuban
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("dominican");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "dominican" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Dominican
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("polynesian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "polynesian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Polynesian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("melanesian");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "melanesian" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Melanesian
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("afro-caribbean");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "afro-caribbean" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Afro-Caribbean
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("indian-chinese");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "indian-chinese" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Indian-Chinese
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("goan");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "goan" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Goan (Indo-Portuguese)
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("chifa");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "chifa" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Chifa (Chinese-Peruvian)
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("nikkei");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "nikkei" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Nikkei (Japanese-Brazilian)
                      </button>
                      <button
                        onClick={() => {
                          setCuisine("surprise");
                          setIsCuisineDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          cuisine === "surprise" ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Surprise Me
                      </button>
                    </div>
              </div>
            )}
              </div>
            </div>

            {/* Dietary Requirements */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Dietary Requirements</label>
              <div className="relative" data-dropdown>
              <button
                type="button"
                onClick={() => setIsDietaryDropdownOpen(!isDietaryDropdownOpen)}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all text-left flex justify-between items-center hover:bg-gray-100 min-h-[52px]"
                  aria-haspopup="listbox"
                  aria-expanded={isDietaryDropdownOpen}
                  aria-label="Select dietary requirements"
                >
                  <div className="flex-1 flex flex-wrap gap-1 items-center">
                    {dietary.length > 0 ? (
                      dietary.map((item, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 max-w-[120px] truncate"
                          title={item}
                        >
                          <span className="truncate">{item}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDietaryChange(item);
                            }}
                            className="text-purple-600 hover:text-purple-800 transition-colors flex-shrink-0"
                          >
                            ×
                          </button>
                </span>
                      ))
                    ) : (
                      <span className="text-gray-500">Select options</span>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform ${isDietaryDropdownOpen ? 'rotate-180' : ''} flex-shrink-0 ml-2`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDietaryDropdownOpen && (
                  <div 
                    className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20"
                    role="listbox"
                    aria-label="Dietary requirements options"
                  >
                    <div className="p-2">
                  {dietaryOptions.map((option) => (
                    <label
                      key={option}
                          className="flex items-center px-3 py-2 hover:bg-purple-50 cursor-pointer text-gray-700 rounded-lg transition-colors"
                          role="option"
                          aria-selected={dietary.includes(option)}
                    >
                      <input
                        type="checkbox"
                        checked={dietary.includes(option)}
                        onChange={() => handleDietaryChange(option)}
                        className="mr-3 h-4 w-4 accent-[#9A61B0] cursor-pointer"
                      />
                          <span className="text-sm">{option}</span>
                    </label>
                  ))}
                    </div>
                </div>
              )}
              </div>
            </div>

            {/* Time Constraints */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Time Limit</label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all text-left flex justify-between items-center hover:bg-gray-100 min-h-[52px]"
                  aria-haspopup="listbox"
                  aria-expanded={isTimeDropdownOpen}
                  aria-label="Select time limit"
                >
                  <div className="flex-1 flex items-center">
                    {timeConstraint ? (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md text-sm font-medium">
                        {timeConstraint === "30min" ? "Under 30 min" : 
                         timeConstraint === "1hr" ? "1 hour" :
                         timeConstraint === "2hrs" ? "2 hours" :
                         timeConstraint === "3hrs" ? "3 hours" :
                         timeConstraint === "4hrs" ? "4 hours" :
                         timeConstraint === "5hrs" ? "5 hours" :
                         timeConstraint === "6hrs" ? "6 hours" :
                         timeConstraint === "6+hrs" ? "6+ hours" : timeConstraint}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select Time</span>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isTimeDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isTimeDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setTimeConstraint("");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !timeConstraint ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Select Time
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("30min");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "30min" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Under 30 min
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("1hr");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "1hr" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        1 hour
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("2hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "2hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        2 hours
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("3hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "3hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        3 hours
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("4hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "4hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        4 hours
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("5hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "5hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        5 hours
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("6hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "6hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        6 hours
                      </button>
                      <button
                        onClick={() => {
                          setTimeConstraint("6+hrs");
                          setIsTimeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          timeConstraint === "6+hrs" ? "bg-green-50 text-green-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        6+ hours
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Serving Size */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Serving Size</label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setIsServingDropdownOpen(!isServingDropdownOpen)}
                  className="w-full p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all text-left flex justify-between items-center hover:bg-gray-100 min-h-[52px]"
                  aria-haspopup="listbox"
                  aria-expanded={isServingDropdownOpen}
                  aria-label="Select serving size"
                >
                  <div className="flex-1 flex items-center">
                    {servingSize ? (
                      <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-md text-sm font-medium">
                        {servingSize === "single" ? "Single-serving" :
                         servingSize === "2-people" ? "2 People" :
                         servingSize === "4-people" ? "4 People" :
                         servingSize === "6-people" ? "6 People" :
                         servingSize === "8-people" ? "8 People" :
                         servingSize === "10-people" ? "10 People" : servingSize}
                      </span>
                    ) : (
                      <span className="text-gray-500">Select Servings</span>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isServingDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isServingDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto z-20">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setServingSize("");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          !servingSize ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Select Servings
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("single");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "single" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Single-serving
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("2-people");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "2-people" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        2 People
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("4-people");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "4-people" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        4 People
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("6-people");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "6-people" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        6 People
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("8-people");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "8-people" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        8 People
                      </button>
                      <button
                        onClick={() => {
                          setServingSize("10-people");
                          setIsServingDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          servingSize === "10-people" ? "bg-orange-50 text-orange-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        10 People
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Exemption Dropdown - Full Width Below Filters */}
          {cuisine.toLowerCase() === "surprise" && (
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Exclude Cuisine</label>
              <select
                className="w-full max-w-md p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all"
                value={exemption}
                onChange={(e) => setExemption(e.target.value)}
              >
                <option value="">Select to Exclude</option>
                {exemptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Ingredient Input Section */}
          <div className="mb-8">
            <label className="text-sm font-semibold text-gray-700 mb-3 block">Available Ingredients</label>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex flex-wrap gap-2 mb-3">
                {ingredients.map((item, index) => (
                  <span
                    key={index}
                    className="bg-[#9A61B0] text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium"
                  >
                    {item}
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-white hover:text-purple-200 transition-colors"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-3">
                <input
                  type="text"
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all"
                  placeholder="Type an ingredient and press Enter"
                  value={ingredientInput}
                  onChange={(e) => setIngredientInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                />
                <button
                  onClick={addIngredient}
                  className="bg-[#9A61B0] text-white px-6 py-3 rounded-lg hover:bg-[#8A50A0] transition-colors font-medium"
                >
                  Add
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Select at least 4 ingredients
              </p>
            </div>
          </div>

          {/* Ingredient Usage */}
          {ingredients.length > 0 && (
            <div className="mb-8">
              <label className="text-sm font-semibold text-gray-700 mb-3 block">Ingredient Usage</label>
              <div className="relative" data-dropdown>
                <button
                  type="button"
                  onClick={() => setIsIngredientUsageDropdownOpen(!isIngredientUsageDropdownOpen)}
                  className="w-64 p-3 rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-[#9A61B0] focus:border-transparent transition-all text-left flex justify-between items-center hover:bg-gray-100 min-h-[52px]"
                  aria-haspopup="listbox"
                  aria-expanded={isIngredientUsageDropdownOpen}
                  aria-label="Select ingredient usage preference"
                >
                  <div className="flex-1 flex items-center">
                    {strictIngredients === true ? (
                      <span className="bg-red-100 text-red-800 px-3 py-1 rounded-md text-sm font-medium">
                        Only these ingredients
                      </span>
                    ) : strictIngredients === false ? (
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-md text-sm font-medium">
                        These and more
                      </span>
                    ) : (
                      <span className="text-gray-500">Select preference</span>
                    )}
                  </div>
                  <svg className={`w-5 h-5 text-gray-400 transition-transform flex-shrink-0 ml-2 ${isIngredientUsageDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {isIngredientUsageDropdownOpen && (
                  <div className="absolute w-64 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
                    <div className="p-2">
                      <button
                        onClick={() => {
                          setStrictIngredients(null);
                          setIsIngredientUsageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          strictIngredients === null ? "bg-gray-50 text-gray-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Select preference
                      </button>
                      <button
                        onClick={() => {
                          setStrictIngredients(true);
                          setIsIngredientUsageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          strictIngredients === true ? "bg-red-50 text-red-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Only these ingredients
                      </button>
                      <button
                        onClick={() => {
                          setStrictIngredients(false);
                          setIsIngredientUsageDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                          strictIngredients === false ? "bg-blue-50 text-blue-800" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        These and more
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Button */}
          <div className="text-center">
            <button
              onClick={handleSearch}
              disabled={
                (ingredients.length > 0 && ingredients.length < 4) ||
                (!ingredients.length && [
                  cuisine,
                  dietary.length,
                  timeConstraint,
                  servingSize
                ].filter(Boolean).length < 2) ||
                loading
              }
              className={`px-12 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 ${
                (ingredients.length > 0 && ingredients.length < 4) ||
                (!ingredients.length && [
                  cuisine,
                  dietary.length,
                  timeConstraint,
                  servingSize
                ].filter(Boolean).length < 2) ||
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#9A61B0] to-[#8A50A0] text-white shadow-lg hover:shadow-xl"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                "Generate Recipes"
              )}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Search Results Section */}
      {activeTab === 'search' && recipes.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 pb-16">
          <h2 className="text-4xl font-bold text-[#9A61B0] text-center mb-8">
            Your Personalized Recipes
          </h2>
          <div className="space-y-6">
            {recipes.map((recipe, index) => (
              <div
                key={index}
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
                      alt={recipe.title}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">{recipe.title}</h3>
                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {recipe.estimated_cooking_time}
                        </span>
                        <span className="flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          {recipe.nutritional_info}
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
                      >
                        {recipe.favorite ? (
                          <span className="text-red-500">★</span>
                        ) : (
                          <span className="text-gray-400 hover:text-red-400">☆</span>
                        )}
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
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {recipe.ingredients.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-gray-700">
                                  <div className="w-2 h-2 bg-[#9A61B0] rounded-full"></div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Instructions */}
                          <div>
                            <h4 className="text-lg font-semibold text-[#9A61B0] mb-3 flex items-center gap-2">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Instructions
                            </h4>
                            {recipe.steps && recipe.steps.length > 0 ? (
                              <ol className="space-y-3">
                                {recipe.steps.map((step, i) => (
                                  <li key={i} className="flex gap-3 text-gray-700">
                                    <span className="flex-shrink-0 w-6 h-6 bg-[#9A61B0] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                                      {i + 1}
                                    </span>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <p className="text-gray-500 italic">No instructions available.</p>
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
                                    <span>{time}</span>
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
                            alt={recipe.title}
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
      )}

      {/* Favorites Tab Content */}
      {activeTab === 'favorites' && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#9A61B0] mb-2">
                Your Favorite Recipes
              </h2>
              <p className="text-gray-600">
                All your saved recipes in one place
              </p>
            </div>
            <div className="text-center text-gray-500">
              <p>Favorites functionality coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* Meal Plan Tab Content */}
      {activeTab === 'meal-plan' && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#9A61B0] mb-2">
                Meal Planning
              </h2>
              <p className="text-gray-600">
                Plan your meals with AI assistance
              </p>
            </div>
            <div className="text-center text-gray-500">
              <p>Meal planning functionality coming soon...</p>
            </div>
          </div>
        </div>
      )}

      {/* AI Assistant Tab Content */}
      {activeTab === 'ai-assistant' && (
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-purple-100">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#9A61B0] mb-2">
                AI Assistant
              </h2>
              <p className="text-gray-600">
                Get personalized culinary advice and recommendations
              </p>
            </div>
            <div className="text-center text-gray-500">
              <p>AI Assistant functionality coming soon...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipe;
