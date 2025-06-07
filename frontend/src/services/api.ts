import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Automatically attach JWT token to requests if available
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle API errors globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;
    if (response) {
      const { status, data } = response;
      alert(`Error ${status}: ${data.message || "Something went wrong"}`);

      if (status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    } else {
      alert("Network error or server unreachable. Please try again.");
    }

    return Promise.reject(error);
  }
);

// User Login
export const loginUser = async (credentials: { email: string; password: string }) => {
  return (await API.post("/auth/login", credentials)).data;
};

// Google Login
export const loginWithGoogle = async (googleData: { token: string }) => {
  return (await API.post("/auth/login/google", googleData)).data;
};


// User Signup
export const signUpUser = async (userData: { first_name: string; last_name: string; email: string; password: string }) => {
  return (await API.post("/auth/signup", userData)).data;
};

// Generate AI-Powered Recipes
export const generateRecipes = async (requestData: any) => {
  return (await API.post("/recipes/generate_recipes", requestData)).data;
};

// Add Recipe to Favorites
export const addRecipeToFavorites = async (recipeData: any) => {
  return (await API.post("/recipes/favorite", recipeData)).data;
};

// Fetch Favorite Recipes
export const getFavorites = async () => {
  try {
    const response = await API.get("/recipes/favorites");

    if (response.data && Array.isArray(response.data.data)) {
      return response.data.data; 
    } else {
      console.error("Unexpected response structure:", response.data);
      return [];
    }
  } catch (error: any) {
    console.error("Error fetching favorites:", error.response?.data || error);
    throw error;
  }
};

// Remove Recipe from Favorites
export const removeRecipeFromFavorites = async (recipeId: number) => {
  try {
    const response = await API.delete(`/recipes/favorite/${recipeId}`);
    return response.data;
  } catch (error: any) {
    console.error("Error removing favorite:", error.response?.data || error);
    throw error;
  }
};

// Fetch User Profile
export const getUserProfile = async () => {
  try {
    const response = await API.get("/auth/profile");
    return response.data.data;
  } catch (error: any) {
    console.error("Error fetching user profile:", error.response?.data || error);
    throw error;
  }
};

// Update User Profile
export const updateUserProfile = async (firstName: string, lastName: string) => {
  try {
    const response = await API.put("/auth/profile", { first_name: firstName, last_name: lastName });
    return response.data.data;
  } catch (error: any) {
    console.error("Error updating user profile:", error.response?.data || error);
    throw error;
  }
};

// AI Chatbot API functions
export const sendChatMessage = async (message: string, context: string = "") => {
  try {
    const response = await API.post("/ai/chat", { message, context });
    return response.data;
  } catch (error: any) {
    console.error("Error sending chat message:", error.response?.data || error);
    throw error;
  }
};

export const getCookingTips = async (category?: string, difficulty?: string) => {
  try {
    const params: any = {};
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    
    const response = await API.get("/ai/tips", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error getting cooking tips:", error.response?.data || error);
    throw error;
  }
};

export const modifyRecipe = async (recipe: string, request: string) => {
  try {
    const response = await API.post("/ai/modify-recipe", { recipe, request });
    return response.data;
  } catch (error: any) {
    console.error("Error modifying recipe:", error.response?.data || error);
    throw error;
  }
};

export const searchKnowledge = async (query: string, category?: string, difficulty?: string, limit?: number) => {
  try {
    const params: any = { query };
    if (category) params.category = category;
    if (difficulty) params.difficulty = difficulty;
    if (limit) params.limit = limit;
    
    const response = await API.get("/ai/search", { params });
    return response.data;
  } catch (error: any) {
    console.error("Error searching knowledge:", error.response?.data || error);
    throw error;
  }
};

export const getCategories = async () => {
  try {
    const response = await API.get("/ai/categories");
    return response.data;
  } catch (error: any) {
    console.error("Error getting categories:", error.response?.data || error);
    throw error;
  }
};

export const getServiceStats = async () => {
  try {
    const response = await API.get("/ai/stats");
    return response.data;
  } catch (error: any) {
    console.error("Error getting service stats:", error.response?.data || error);
    throw error;
  }
};

export const checkAIServiceHealth = async () => {
  try {
    const response = await API.get("/ai/health");
    return response.data;
  } catch (error: any) {
    console.error("Error checking AI service health:", error.response?.data || error);
    throw error;
  }
};

export default API;
