import { DEFAULT_INGREDIENTS, DEFAULT_NUTRIENTS, DEFAULT_TOLERANCE, DEFAULT_ADMIN_PIN } from '../data/defaultData';

const KEYS = {
  INGREDIENTS: 'feed_calc_ingredients',
  NUTRIENTS: 'feed_calc_nutrients',
  DRAFT_RATES: 'feed_calc_draft_rates',
  DRAFT_PRICES: 'feed_calc_draft_prices',
  SAVED_RECIPES: 'feed_calc_saved_recipes',
  SETTINGS: 'feed_calc_settings',
};

// تهيئة واسترجاع المواد العلفية
export function getStoredIngredients() {
  try {
    const data = localStorage.getItem(KEYS.INGREDIENTS);
    return data ? JSON.parse(data) : DEFAULT_INGREDIENTS;
  } catch (e) {
    console.error('Error loading ingredients', e);
    return DEFAULT_INGREDIENTS;
  }
}

export function saveStoredIngredients(ingredients) {
  try {
    localStorage.setItem(KEYS.INGREDIENTS, JSON.stringify(ingredients));
  } catch (e) {
    console.error('Error saving ingredients', e);
  }
}

// تهيئة واسترجاع العناصر الغذائية
export function getStoredNutrients() {
  try {
    const data = localStorage.getItem(KEYS.NUTRIENTS);
    return data ? JSON.parse(data) : DEFAULT_NUTRIENTS;
  } catch (e) {
    console.error('Error loading nutrients', e);
    return DEFAULT_NUTRIENTS;
  }
}

export function saveStoredNutrients(nutrients) {
  try {
    localStorage.setItem(KEYS.NUTRIENTS, JSON.stringify(nutrients));
  } catch (e) {
    console.error('Error saving nutrients', e);
  }
}

// استرجاع المسودة الحالية (النسب والأسعار المخصصة)
export function getStoredDraft() {
  try {
    const rates = localStorage.getItem(KEYS.DRAFT_RATES);
    const prices = localStorage.getItem(KEYS.DRAFT_PRICES);
    return {
      inclusionRates: rates ? JSON.parse(rates) : null,
      customPrices: prices ? JSON.parse(prices) : null,
    };
  } catch (e) {
    return { inclusionRates: null, customPrices: null };
  }
}

export function saveStoredDraft(inclusionRates, customPrices) {
  try {
    localStorage.setItem(KEYS.DRAFT_RATES, JSON.stringify(inclusionRates));
    localStorage.setItem(KEYS.DRAFT_PRICES, JSON.stringify(customPrices));
  } catch (e) {
    console.error('Error saving draft', e);
  }
}

// استرجاع وإدارة الوصفات المحفوظة
export function getStoredRecipes() {
  try {
    const data = localStorage.getItem(KEYS.SAVED_RECIPES);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
}

export function saveRecipe(recipe) {
  const recipes = getStoredRecipes();
  const newRecipe = {
    id: 'rec_' + Date.now(),
    createdAt: new Date().toISOString(),
    ...recipe,
  };
  recipes.unshift(newRecipe);
  try {
    localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error('Error saving recipe', e);
  }
  return recipes;
}

export function deleteStoredRecipe(id) {
  const recipes = getStoredRecipes().filter(r => r.id !== id);
  try {
    localStorage.setItem(KEYS.SAVED_RECIPES, JSON.stringify(recipes));
  } catch (e) {
    console.error('Error deleting recipe', e);
  }
  return recipes;
}

// الإعدادات البسيطة (السماحية وكلمة مرور الأدمن)
export function getStoredSettings() {
  try {
    const data = localStorage.getItem(KEYS.SETTINGS);
    return data ? JSON.parse(data) : { tolerance: DEFAULT_TOLERANCE, adminPin: DEFAULT_ADMIN_PIN };
  } catch (e) {
    return { tolerance: DEFAULT_TOLERANCE, adminPin: DEFAULT_ADMIN_PIN };
  }
}

export function saveStoredSettings(settings) {
  try {
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings', e);
  }
}

// إعادة ضبط المصنع للبيانات
export function resetToDefaults() {
  localStorage.removeItem(KEYS.INGREDIENTS);
  localStorage.removeItem(KEYS.NUTRIENTS);
  localStorage.removeItem(KEYS.DRAFT_RATES);
  localStorage.removeItem(KEYS.DRAFT_PRICES);
  localStorage.removeItem(KEYS.SETTINGS);
  return {
    ingredients: DEFAULT_INGREDIENTS,
    nutrients: DEFAULT_NUTRIENTS,
    settings: { tolerance: DEFAULT_TOLERANCE, adminPin: DEFAULT_ADMIN_PIN }
  };
}
