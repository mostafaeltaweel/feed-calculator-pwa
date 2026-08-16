import React, { useState } from 'react';
import { Bookmark, Trash2, Download, Check, Plus, X, Calendar, Tag } from 'lucide-react';

export default function SavedRecipesModal({
  isOpen,
  onClose,
  recipes = [],
  onLoadRecipe,
  onSaveCurrentRecipe,
  onDeleteRecipe,
  currentCalculation = {}
}) {
  const [recipeName, setRecipeName] = useState('');
  const [category, setCategory] = useState('فروج تسمين - نامي');
  const [notes, setNotes] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);

  if (!isOpen) return null;

  const handleSaveSubmit = (e) => {
    e.preventDefault();
    if (!recipeName.trim()) return;

    onSaveCurrentRecipe({
      title: recipeName.trim(),
      category: category,
      notes: notes.trim(),
      totalCostPerKg: currentCalculation.totalCostPerKg,
      totalCostPerTon: currentCalculation.totalCostPerTon,
      totalInclusion: currentCalculation.totalInclusion
    });

    setRecipeName('');
    setNotes('');
    setShowSaveForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-100">
        {/* الرأس */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold">وصفاتي المحفوظة (سجل الخلطات)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم النافذة */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* زر فتح نموذج الحفظ */}
          {!showSaveForm ? (
            <button
              onClick={() => setShowSaveForm(true)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>حفظ التركيبة الحالية كخلطة جديدة</span>
            </button>
          ) : (
            <form onSubmit={handleSaveSubmit} className="p-4 rounded-xl bg-slate-950 border border-indigo-900/60 space-y-3">
              <h3 className="text-sm font-bold text-indigo-300">بيانات الحفظ الجديدة</h3>
              <div>
                <label className="text-xs text-slate-400 block mb-1">اسم الوصفة / الخلطة</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: خلطة تسمين نامي رقم 1"
                  value={recipeName}
                  onChange={(e) => setRecipeName(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 text-slate-100 text-sm border border-slate-700 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">الفئة / نوع الحيوان</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 text-slate-100 text-sm border border-slate-700 outline-none"
                >
                  <option value="فروج تسمين - بادئ">فروج تسمين - بادئ</option>
                  <option value="فروج تسمين - نامي">فروج تسمين - نامي</option>
                  <option value="فروج تسمين - ناهي">فروج تسمين - ناهي</option>
                  <option value="دجاج بياض - إنتاج">دجاج بياض - إنتاج</option>
                  <option value="أبقار حليب">أبقار حليب</option>
                  <option value="أغنام ومواشي">أغنام ومواشي</option>
                  <option value="خيار مخصص">خيار مخصص</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">ملاحظات إضافية (اختياري)</label>
                <textarea
                  rows="2"
                  placeholder="أضف أي تفاصيل أو ملاحظات عن خامات هذه الخلطة..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-slate-900 text-slate-100 text-sm border border-slate-700 outline-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowSaveForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                >
                  حفظ في الأرشيف
                </button>
              </div>
            </form>
          )}

          {/* قائمة الوصفات المحفوظة */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">الخلطات المتاحة ({recipes.length})</h3>
            {recipes.length === 0 ? (
              <div className="p-8 text-center bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                <Bookmark className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm text-slate-400 font-medium">لا توجد خلطات محفوظة حتى الآن.</p>
                <p className="text-xs text-slate-500 mt-1">قم بإعداد النسب الحالية واضغط حفظ لاسترجاعها في أي وقت.</p>
              </div>
            ) : (
              recipes.map(recipe => (
                <div
                  key={recipe.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-100 text-sm">{recipe.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {recipe.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold">
                        {recipe.totalCostPerKg} د.ع/كغم
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-300">
                        مجموع النسب: {recipe.totalInclusion}%
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(recipe.createdAt).toLocaleDateString('ar-IQ')}
                      </span>
                    </div>

                    {recipe.notes && (
                      <p className="text-xs text-slate-400 mt-1 italic line-clamp-1">{recipe.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => {
                        onLoadRecipe(recipe);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all"
                    >
                      تطبيق هذه الخلطة
                    </button>
                    <button
                      onClick={() => onDeleteRecipe(recipe.id)}
                      className="p-1.5 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs transition-all"
                      title="حذف الخلطة"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
