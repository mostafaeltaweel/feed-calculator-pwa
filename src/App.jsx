import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Header from './components/Header';
import IngredientTable from './components/IngredientTable';
import NutrientResultsCard from './components/NutrientResultsCard';
import SavedRecipesModal from './components/SavedRecipesModal';
import AdminModal from './components/AdminModal';
import ExportModal from './components/ExportModal';

import { calculateFormulation } from './utils/calculator';
import {
  getStoredIngredients,
  saveStoredIngredients,
  getStoredNutrients,
  saveStoredNutrients,
  getStoredDraft,
  saveStoredDraft,
  getStoredRecipes,
  saveRecipe,
  deleteStoredRecipe,
  getStoredSettings,
  saveStoredSettings,
  resetToDefaults
} from './utils/storage';

export default function App() {
  // 1) حالات البيانات الأساسية
  const [ingredients, setIngredients] = useState(() => getStoredIngredients());
  const [nutrients, setNutrients] = useState(() => getStoredNutrients());
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [recipes, setRecipes] = useState(() => getStoredRecipes());

  // 2) نسب الخامات وسعر السوق المسودة
  const [inclusionRates, setInclusionRates] = useState(() => {
    const draft = getStoredDraft();
    if (draft.inclusionRates) return draft.inclusionRates;
    const initial = {};
    ingredients.forEach(ing => {
      initial[ing.id] = ing.defaultInclusion ?? 0;
    });
    return initial;
  });

  const [customPrices, setCustomPrices] = useState(() => {
    const draft = getStoredDraft();
    if (draft.customPrices) return draft.customPrices;
    const initial = {};
    ingredients.forEach(ing => {
      initial[ing.id] = ing.cost ?? 0;
    });
    return initial;
  });

  // 3) النوافذ المنبثقة PWA
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isRecipesOpen, setIsRecipesOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // 4) حالة الاتصال وتثبيت PWA
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallPwaClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      });
    }
  };

  // 5) الحفظ التلقائي للمسودة
  useEffect(() => {
    saveStoredDraft(inclusionRates, customPrices);
  }, [inclusionRates, customPrices]);

  // 6) الحساب الرياضي الحي اللحظي (SUMPRODUCT Engine)
  const calculationResult = useMemo(() => {
    return calculateFormulation(
      ingredients,
      nutrients,
      inclusionRates,
      customPrices,
      settings.tolerance ?? 0.01
    );
  }, [ingredients, nutrients, inclusionRates, customPrices, settings]);

  // الاحتفال بالوصول لـ 100%
  const [hasCelebrated, setHasCelebrated] = useState(false);
  useEffect(() => {
    if (calculationResult.isValid100 && !hasCelebrated) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setHasCelebrated(true);
    } else if (!calculationResult.isValid100) {
      setHasCelebrated(false);
    }
  }, [calculationResult.isValid100, hasCelebrated]);

  // 7) معالجات الأحداث وتغيير النسب/الأسعار
  const handleInclusionChange = (ingId, val) => {
    const num = val === '' ? 0 : parseFloat(val);
    setInclusionRates(prev => ({
      ...prev,
      [ingId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handlePriceChange = (ingId, val) => {
    const num = val === '' ? 0 : parseFloat(val);
    setCustomPrices(prev => ({
      ...prev,
      [ingId]: isNaN(num) ? 0 : Math.max(0, num)
    }));
  };

  const handleResetAll = () => {
    if (window.confirm('هل تود تصفير كل نسب المواد في الخلطة الحالية؟')) {
      const reset = {};
      ingredients.forEach(ing => {
        reset[ing.id] = 0;
      });
      setInclusionRates(reset);
    }
  };

  // تحميل وصفة محفوظة
  const handleLoadRecipe = (recipe) => {
    if (recipe.inclusionRates) {
      setInclusionRates(recipe.inclusionRates);
    }
    if (recipe.customPrices) {
      setCustomPrices(recipe.customPrices);
    }
  };

  // حفظ الخلطة الحالية
  const handleSaveCurrentRecipe = (meta) => {
    const updatedRecipes = saveRecipe({
      ...meta,
      inclusionRates: inclusionRates,
      customPrices: customPrices
    });
    setRecipes(updatedRecipes);
    alert('تم حفظ التركيبة بنجاح!');
  };

  const handleDeleteRecipe = (id) => {
    const updated = deleteStoredRecipe(id);
    setRecipes(updated);
  };

  // حفظ الأدمن للمكونات والعناصر والإعدادات
  const handleSaveIngredients = (newIngredients) => {
    setIngredients(newIngredients);
    saveStoredIngredients(newIngredients);
  };

  const handleSaveNutrients = (newNutrients) => {
    setNutrients(newNutrients);
    saveStoredNutrients(newNutrients);
  };

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    saveStoredSettings(newSettings);
  };

  const handleResetFactoryDefaults = () => {
    const defaults = resetToDefaults();
    setIngredients(defaults.ingredients);
    setNutrients(defaults.nutrients);
    setSettings(defaults.settings);

    const initRates = {};
    const initPrices = {};
    defaults.ingredients.forEach(ing => {
      initRates[ing.id] = ing.defaultInclusion ?? 0;
      initPrices[ing.id] = ing.cost ?? 0;
    });
    setInclusionRates(initRates);
    setCustomPrices(initPrices);

    alert('تمت إعادة ضبط بيانات التطبيق للمصنع بنجاح!');
    setIsAdminOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* الشريط العلوي */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenRecipes={() => setIsRecipesOpen(true)}
        onResetAll={handleResetAll}
        onOpenExport={() => setIsExportOpen(true)}
        isOnline={isOnline}
        canInstallPwa={Boolean(deferredPrompt)}
        onInstallPwa={handleInstallPwaClick}
      />

      {/* الجسم الرئيسي للتطبيق */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* جدول الخامات التفاعلي باللون الأصفر والأزرق والأخضر */}
        <IngredientTable
          ingredients={ingredients}
          inclusionRates={inclusionRates}
          customPrices={customPrices}
          onInclusionChange={handleInclusionChange}
          onPriceChange={handlePriceChange}
          totalInclusion={calculationResult.totalInclusion}
          isValid100={calculationResult.isValid100}
          tolerance={settings.tolerance ?? 0.01}
          totalCostPerKg={calculationResult.totalCostPerKg}
          onResetAll={handleResetAll}
        />

        {/* بطاقة النتائج والتحليل الغذائي النهائي */}
        <NutrientResultsCard
          nutrients={nutrients}
          nutrientTotals={calculationResult.nutrientTotals}
          totalCostPerKg={calculationResult.totalCostPerKg}
          totalCostPerTon={calculationResult.totalCostPerTon}
          isValid100={calculationResult.isValid100}
        />
      </main>

      {/* النافذة المنبثقة: الوصفات المحفوظة */}
      <SavedRecipesModal
        isOpen={isRecipesOpen}
        onClose={() => setIsRecipesOpen(false)}
        recipes={recipes}
        onLoadRecipe={handleLoadRecipe}
        onSaveCurrentRecipe={handleSaveCurrentRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        currentCalculation={calculationResult}
      />

      {/* النافذة المنبثقة: لوحة الأدمن */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        ingredients={ingredients}
        nutrients={nutrients}
        adminPin={settings.adminPin ?? '1234'}
        tolerance={settings.tolerance ?? 0.01}
        onSaveIngredients={handleSaveIngredients}
        onSaveNutrients={handleSaveNutrients}
        onSaveSettings={handleSaveSettings}
        onResetFactoryDefaults={handleResetFactoryDefaults}
      />

      {/* النافذة المنبثقة: التصدير والمشاركة */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        ingredients={ingredients}
        nutrients={nutrients}
        inclusionRates={inclusionRates}
        customPrices={customPrices}
        calculationResult={calculationResult}
      />

      {/* الذيل */}
      <footer className="border-t border-slate-900 bg-slate-950 p-4 text-center text-xs text-slate-500">
        حاسبة تركيبة الأعلاف Progressive Web App (PWA) • حسابات فورية offline-first • متوافقة مع أندرويد و Capacitor
      </footer>
    </div>
  );
}
