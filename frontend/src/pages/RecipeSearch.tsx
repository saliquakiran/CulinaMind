import { useState } from "react";
import recipeImage from "../assets/images/recipe.jpg";
import { generateRecipes } from "../utils/api";
import { addRecipeToFavorites } from "../utils/api";
import { toast } from "react-toastify";
const RecipeSearch = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [exemption, setExemption] = useState("");
  const [dietary, setDietary] = useState<string[]>([]);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [timeConstraint, setTimeConstraint] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [strictIngredients, setStrictIngredients] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
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
    "Lactose Intolerant",
    "Gluten Intolerant",
    "Histamine Intolerant",
    "Sulfite Intolerant",
    "Fructose Intolerant",
    "Diabetic",
    "Low Sodium",
    "Low Cholesterol",
    "Renal Diet",
    "Ketogenic",
    "Low FODMAP",
    "GERD-friendly",
    "Low oxalate",
    "Low purine",
    "Vegan",
    "Vegetarian",
  ];  
  const [recipes, setRecipes] = useState<
    {
      title: string;
      time: string;
      nutritional: string;
      ingredients: string[];
      steps: string[];
      favorite: boolean;
    }[]
  >([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

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
      } catch (error) {
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
          ? prev.filter((item) => item !== option) // Remove if already selected
          : [...prev, option] // Add if not selected
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
      toast.error(error.response?.data?.error || "Failed to fetch recipes.");
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="bg-[#C7AAF4] min-h-screen flex flex-col items-center w-full">
      {/* Full-Width Search Section */}
      <div className="bg-gray-200 w-full py-12 px-10 flex flex-col items-center">
        {/* Search Header */}
        <h1 className="text-5xl font-bold text-black text-center mb-8">
          Search
        </h1>

        {/* Filters Section */}
        <div className="w-full max-w-6xl flex flex-wrap justify-center gap-6">
          {/* Cuisine Preference */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <select
              className="p-4 pr-12 rounded-full bg-white border border-gray-300 w-full shadow-sm appearance-none"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
            >
              <option value="">Preferred Cuisine</option>
              <option value="moroccan">Moroccan</option>
              <option value="tunisian">Tunisian</option>
              <option value="algerian">Algerian</option>
              <option value="egyptian">Egyptian</option>
              <option value="libyan">Libyan</option>
              <option value="nigerian">Nigerian</option>
              <option value="ghanaian">Ghanaian</option>
              <option value="senegalese">Senegalese</option>
              <option value="ethiopian">Ethiopian</option>
              <option value="somali">Somali</option>
              <option value="kenyan">Kenyan</option>
              <option value="tanzanian">Tanzanian</option>
              <option value="zimbabwean">Zimbabwean</option>
              <option value="chinese">Chinese</option>
              <option value="japanese">Japanese</option>
              <option value="korean">Korean</option>
              <option value="taiwanese">Taiwanese</option>
              <option value="mongolian">Mongolian</option>
              <option value="thai">Thai</option>
              <option value="vietnamese">Vietnamese</option>
              <option value="filipino">Filipino</option>
              <option value="malaysian">Malaysian</option>
              <option value="indian">Indian</option>
              <option value="pakistani">Pakistani</option>
              <option value="nepali">Nepali</option>
              <option value="kazakh">Kazakh</option>
              <option value="turkish">Turkish</option>
              <option value="lebanese">Lebanese</option>
              <option value="iranian">Iranian</option>
              <option value="syrian">Syrian</option>
              <option value="iraqi">Iraqi</option>
              <option value="yemeni">Yemeni</option>
              <option value="palestinian">Palestinian</option>
              <option value="armenian">Armenian</option>
              <option value="french">French</option>
              <option value="italian">Italian</option>
              <option value="spanish">Spanish</option>
              <option value="portuguese">Portuguese</option>
              <option value="scandinavian">Scandinavian</option>
              <option value="icelandic">Icelandic</option>
              <option value="polish">Polish</option>
              <option value="ukrainian">Ukrainian</option>
              <option value="hungarian">Hungarian</option>
              <option value="czech">Czech</option>
              <option value="slovak">Slovak</option>
              <option value="romanian">Romanian</option>
              <option value="bulgarian">Bulgarian</option>
              <option value="georgian">Georgian</option>
              <option value="greek">Greek</option>
              <option value="albanian">Albanian</option>
              <option value="maltese">Maltese</option>
              <option value="mexican">Mexican</option>
              <option value="american">American</option>
              <option value="guatemalan">Guatemalan</option>
              <option value="nicaraguan">Nicaraguan</option>
              <option value="brazilian">Brazilian</option>
              <option value="argentinian">Argentinian</option>
              <option value="chilean">Chilean</option>
              <option value="venezuelan">Venezuelan</option>
              <option value="bolivian">Bolivian</option>
              <option value="paraguayan">Paraguayan</option>
              <option value="uruguayan">Uruguayan</option>
              <option value="cuban">Cuban</option>
              <option value="dominican">Dominican</option>
              <option value="polynesian">Polynesian</option>
              <option value="melanesian">Melanesian</option>
              <option value="afro-caribbean">Afro-Caribbean</option>
              <option value="indian-chinese">Indian-Chinese</option>
              <option value="goan">Goan (Indo-Portuguese)</option>
              <option value="chifa">Chifa (Chinese-Peruvian)</option>
              <option value="nikkei">Nikkei (Japanese-Brazilian)</option>
              <option value="surprise">Surprise Me</option>
            </select>
            <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 text-lg">
              ▼
            </span>
          </div>

          {/* ✅ Exemption Dropdown (Only Show if "Surprise Me" is Selected) */}
          {cuisine.toLowerCase() === "surprise" && (
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <select
                className="p-4 pr-12 rounded-full bg-white border border-gray-300 w-full shadow-sm appearance-none"
                value={exemption}
                onChange={(e) => setExemption(e.target.value)}
              >
                <option value="">Exclude a Cuisine</option>
                {exemptionOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 text-lg">
                ▼
              </span>
            </div>
          )}

          {/* Dietary Requirements - Custom Dropdown */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            {/* Dropdown Button (Styled like a Select) */}
            <button
              type="button"
              onClick={() => setDropdownOpen(!isDropdownOpen)}
              className="p-4 pr-12 rounded-full bg-white border border-gray-300 w-full shadow-sm flex justify-between items-center appearance-none"
            >
              {dietary.length > 0 ? dietary.join(", ") : "Dietary Req."}{" "}
              {/* Display selected options */}
              <span className="text-gray-500 text-lg">▼</span>
            </button>

            {/* Dropdown Options */}
            {isDropdownOpen && (
              <div className="absolute w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-md max-h-60 overflow-y-auto z-10">
                {dietaryOptions.map((option) => (
                  <label
                    key={option}
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={dietary.includes(option)}
                      onChange={() => handleDietaryChange(option)}
                      className="mr-3 h-5 w-5 accent-[#9A61B0] cursor-pointer"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Time Constraints */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <select
              className="p-4 pr-12 rounded-full bg-white border border-gray-300 w-full shadow-sm appearance-none"
              value={timeConstraint}
              onChange={(e) => setTimeConstraint(e.target.value)}
            >
              <option value="">Time Constraints</option>
              <option value="30min">Under 30 min</option>
              <option value="1hr">1 hour</option>
              <option value="2hrs">2 hours</option>
              <option value="3hrs">3 hours</option>
              <option value="4hrs">4 hours</option>
              <option value="5hrs">5 hours</option>
              <option value="6hrs">6 hours</option>
              <option value="6+hrs">6+ hours</option>
            </select>
            <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 text-lg">
              ▼
            </span>
          </div>

          {/* Serving Size */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <select
              className="p-4 pr-12 rounded-full bg-white border border-gray-300 w-full shadow-sm appearance-none"
              value={servingSize}
              onChange={(e) => setServingSize(e.target.value)}
            >
              <option value="">Serving Size</option>
              <option value="single">Single-serving</option>
              <option value="2-people">2 People serving</option>
              <option value="4-people">4 People serving</option>
              <option value="6-people">6 People serving</option>
              <option value="8-people">8 People serving</option>
              <option value="10-people">10 People serving</option>
            </select>
            <span className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 text-lg">
              ▼
            </span>
          </div>
        </div>

        {/* Ingredient Input Section */}
        <div className="bg-white w-full max-w-4xl mt-6 p-4 rounded-full shadow-md border border-gray-300 flex flex-wrap gap-2 items-center overflow-y-auto max-h-[120px]">
          <div className="flex flex-wrap gap-2 flex-grow">
            {ingredients.map((item, index) => (
              <span
                key={index}
                className="bg-[#9A61B0] text-white px-4 py-2 rounded-full flex items-center gap-2"
              >
                {item}
                <button
                  onClick={() => removeIngredient(index)}
                  className="text-white text-lg font-bold"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              className="flex-grow min-w-[150px] p-3 border border-gray-300 rounded-full focus:ring-0 outline-none"
              placeholder="Add Ingredients"
              value={ingredientInput}
              onChange={(e) => setIngredientInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            />
          </div>
          <button
            onClick={addIngredient}
            className="bg-[#9A61B0] text-white px-6 py-3 rounded-full text-lg shadow-md"
          >
            +
          </button>
        </div>

        {ingredients.length > 0 && (
  <div className="flex items-center gap-8 mt-4">
    <label className="flex items-center gap-2 text-sm text-gray-800">
      <input
        type="radio"
        name="ingredient-strictness"
        checked={strictIngredients === true}
        onChange={() => setStrictIngredients(true)}
        className="h-4 w-4 accent-[#9A61B0]"
      />
      Only these Ingredients
    </label>
    <label className="flex items-center gap-2 text-sm text-gray-800">
      <input
        type="radio"
        name="ingredient-strictness"
        checked={strictIngredients === false}
        onChange={() => setStrictIngredients(false)}
        className="h-4 w-4 accent-[#9A61B0]"
      />
      These and more
    </label>
  </div>
)}


        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={
            (ingredients.length > 0 && ingredients.length < 3) ||
            (!ingredients.length && [
              cuisine,
              dietary.length,
              timeConstraint,
              servingSize
            ].filter(Boolean).length < 2) ||
            loading
          }
          className={`mt-6 px-8 py-4 rounded-full text-lg shadow-md transition ${
            (ingredients.length > 0 && ingredients.length < 3) ||
            (!ingredients.length && [
              cuisine,
              dietary.length,
              timeConstraint,
              servingSize
            ].filter(Boolean).length < 2) ||
            loading
              ? "bg-gray-500 cursor-not-allowed"
              : "bg-black hover:bg-gray-800"
          } text-white`}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Search Results Section */}
      {recipes.length > 0 && (
        <div className="w-full max-w-6xl mt-10">
          <h2 className="text-4xl font-semibold text-black text-center mb-6">
            Search Results
          </h2>
          <div className="flex flex-col gap-6">
            {recipes.map((recipe, index) => (
              <div
                key={index}
                className="bg-gray-100 rounded-lg shadow-md p-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                {/* Condensed Recipe Row */}
                <div className="flex items-center">
                  <img
                    src={recipe.image_url || recipeImage}
                    alt={recipe.title}
                    className="w-24 h-24 rounded-lg object-cover mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{recipe.title}</h3>
                    <p className="text-gray-700">
                      Time: {recipe.estimated_cooking_time}
                    </p>
                    <p className="text-gray-600 font-bold">
                      Nutrition: {recipe.nutritional_info}
                    </p>
                  </div>
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(index);
                    }}
                    className="text-2xl"
                  >
                    {recipe.favorite ? (
                      <span className="text-red-500">★</span>
                    ) : (
                      <span className="text-gray-400">☆</span>
                    )}
                  </button>
                </div>

                {/* Expanded Section */}
                {expandedIndex === index && (
                  <div className="mt-4 p-4 border-t border-gray-300 bg-white rounded-lg flex flex-wrap items-start">
                    {/* Left side: Text details */}
                    <div className="w-full md:w-2/3 pr-4">
                      <p className="text-gray-800 font-bold mt-2">
                        Ingredients:
                      </p>
                      <ul className="list-disc list-inside text-gray-700">
                        {recipe.ingredients.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>

                      <p className="text-gray-800 font-bold mt-2">
                        Step-by-step Instructions:
                      </p>
                      {recipe.steps && recipe.steps.length > 0 ? (
                        <ul className="list-decimal list-inside text-gray-700">
                          {recipe.steps.map((step, i) => (
                            <li key={i}>{step}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-600 italic">
                          No instructions available.
                        </p>
                      )}
                        <p className="text-gray-800 font-bold mt-4">Time Breakdown:</p>
                        {recipe.time_breakdown && Object.keys(recipe.time_breakdown).length > 0 ? (
                          <ul className="list-disc list-inside text-gray-700">
                            {Object.entries(recipe.time_breakdown).map(([step, time], i) => (
                              <li key={i}>
                                <strong>{time}</strong>: {step}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-600 italic">No time breakdown available.</p>
                        )}
                    </div>

                    {/* Right side: Large image */}
                    <div className="w-full md:w-1/3 flex justify-center">
                      <img
                        src={recipe.image_url || recipeImage} 
                        alt={recipe.title}
                        className="w-full h-auto rounded-lg object-cover max-w-[400px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeSearch;
