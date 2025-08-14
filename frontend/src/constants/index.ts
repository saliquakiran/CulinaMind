// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
export const API_TIMEOUT = 10000; // 10 seconds

// Google OAuth
export const GOOGLE_CLIENT_ID = "409907844476-eq9oh3fbjbphec1ldljni608sjpcnqnb.apps.googleusercontent.com";

// Application Colors
export const COLORS = {
  primary: '#9A61B0',
  primaryLight: '#8A50A0',
  secondary: '#F5F5F5',
  accent: '#E6E6FA',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    light: '#9CA3AF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
    gradient: 'from-purple-50 via-white to-lavender-50',
  }
} as const;

// Recipe Categories
export const RECIPE_CATEGORIES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Dessert',
  'Appetizer',
  'Soup',
  'Salad',
  'Main Course',
  'Side Dish',
] as const;

// Cuisine Types
export const CUISINE_TYPES = [
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'Japanese',
  'Thai',
  'French',
  'Mediterranean',
  'American',
  'Greek',
  'Spanish',
  'Korean',
  'Vietnamese',
  'Moroccan',
  'Lebanese',
  'Turkish',
  'Surprise Me',
] as const;

// Dietary Restrictions
export const DIETARY_RESTRICTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Low-Carb',
  'Keto',
  'Paleo',
  'Halal',
  'Kosher',
] as const;

// Difficulty Levels
export const DIFFICULTY_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const;

// Meal Types
export const MEAL_TYPES = [
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
] as const;

// Days of Week
export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

// Time Limits (in minutes)
export const TIME_LIMITS = [
  15,
  30,
  45,
  60,
  90,
  120,
  180,
] as const;

// Serving Sizes
export const SERVING_SIZES = [
  1, 2, 3, 4, 5, 6, 8, 10, 12
] as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER: 'user',
  THEME: 'theme',
  LANGUAGE: 'language',
  PREFERENCES: 'preferences',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  VERIFY_OTP: '/verify-otp',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  FAVORITES: '/favorites',
  RECIPE: '/recipe',
  AI_ASSISTANT: '/ai-assistant',
} as const;

// Toast Configuration
export const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

// Search Configuration
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  MAX_RESULTS: 20,
  DEBOUNCE_DELAY: 300, // milliseconds
} as const;

// Image Configuration
export const IMAGE_CONFIG = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  DEFAULT_QUALITY: 0.8,
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false,
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
  },
} as const; 