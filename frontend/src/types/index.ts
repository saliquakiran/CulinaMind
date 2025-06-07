// User types
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  google_id?: string;
  facebook_id?: string;
}

// Recipe types
export interface Recipe {
  id: string;
  title: string;
  ingredients: string[];
  instructions: string[];
  cooking_time: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  image_url?: string;
  nutritional_info?: NutritionalInfo;
  time_breakdown?: TimeBreakdown;
}

export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

export interface TimeBreakdown {
  prep_time: number;
  cook_time: number;
  total_time: number;
}

// API response types
export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  cuisine?: string;
  dietary_restrictions?: string[];
  time_limit?: number;
  servings?: number;
}

// Chat types
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Meal planning types
export interface MealPlan {
  id: string;
  user_id: number;
  week_start_date: string;
  week_end_date: string;
  items: MealPlanItem[];
}

export interface MealPlanItem {
  id: string;
  meal_plan_id: string;
  day_of_week: number;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipe_id?: string;
  custom_meal_name?: string;
  custom_meal_notes?: string;
}

// Shopping list types
export interface ShoppingList {
  id: string;
  user_id: number;
  name: string;
  items: ShoppingListItem[];
  created_at: string;
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: string;
  category: string;
  is_completed: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignUpForm {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface ProfileUpdateForm {
  first_name: string;
  last_name: string;
}

// Component prop types
export interface InputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  eyeIcon?: React.ReactNode;
  eyeSlashIcon?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
} 