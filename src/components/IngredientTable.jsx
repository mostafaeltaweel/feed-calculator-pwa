import React from 'react';
import { AlertTriangle, CheckCircle2, DollarSign, Percent, PlusCircle, Trash2, Edit3, HelpCircle } from 'lucide-react';

export default function IngredientTable({
  ingredients = [],
  inclusionRates = {},
  customPrices = {},
  onInclusionChange,
  onPriceChange,
  totalInclusion = 0,
  isValid100 = false,
  tolerance = 0.01,
  totalCostPerKg = 0,
  onResetAll,
  onOpenAddIngredientModal
}) {
  const diff = Math.round((totalInclusion - 100) * 1000) / 1000;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* شريط الإحصائيات والإشارات البصرية العلوي */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Percent className="w-5 h-5 text-amber-400" />
            <span>جدول نسب الخامات والأسعار</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            أدخل نسبة كل مادة في الخلطة وسعر السوق الحالي. الحسابات تعمل بأسلوب الإكسل (SUMPRODUCT).
          </p>
        </div>

        {/* مؤشر الألوان البصري حسب إكسل */}
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            نسبة المادة (مدخلات)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-100 text-blue-900 font-bold border border-blue-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            الكلفة (دينار)
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-medium border border-slate-700">
            مساهمة خامات العلف
          </span>
        </div>
      </div>

      {/* شريط التنبيه والمجموع التراكمي للـ 100% */}
      <div
        className={`px-5 py-3.5 transition-all duration-300 flex flex-wrap items-center justify-between gap-3 ${
          isValid100
            ? 'bg-emerald-950/90 border-b border-emerald-800 text-emerald-200'
            : 'bg-rose-950/90 border-b border-rose-800 text-rose-200'
        }`}
      >
        <div className="flex items-center gap-3">
          {isValid100 ? (
            <div className="p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
              <CheckCircle2 className="w-6 h-6 animate-bounce" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg">
                مجموع الخلطة الحالي: {totalInclusion.toFixed(2)}%
              </span>
              <span
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  isValid100 ? 'bg-emerald-800 text-white' : 'bg-rose-800 text-white'
                }`}
              >
                {isValid100 ? 'مكتمل 100% ✓' : diff > 0 ? `زيادة +${diff.toFixed(2)}%` : `نقص ${diff.toFixed(2)}%`}
              </span>
            </div>
            <p className="text-xs opacity-90 mt-0.5">
              {isValid100
                ? 'النسب مطابقة تماماً للشروط (100% exact). النتائج والقيم الغذائية دقيقة وحاهزة للاستخدام.'
                : `تنبيه: يجب أن يكون المجموع الكلي للنسب مساوياً لـ 100% بالضبط (سماحية ±${tolerance}%).`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onResetAll}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700 shadow-sm"
          >
            تصفير الخلطة
          </button>
        </div>
      </div>

      {/* الجدول التفاعلي */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm border-collapse">
          <thead>
            <tr className="bg-purple-950/80 text-purple-200 border-b border-purple-800/60 text-xs uppercase">
              <th className="p-3.5 font-bold">اسم المادة العلفية</th>
              <th className="p-3.5 font-bold text-center bg-blue-950/60 text-blue-200 border-r border-l border-purple-800/40">
                الكلفة (دينار / كغم)
              </th>
              <th className="p-3.5 font-bold text-center bg-amber-950/60 text-amber-200 border-l border-purple-800/40">
                نسبة المادة في الخلطة (%)
              </th>
              <th className="p-3.5 font-bold text-center">المساهمة في التكلفة (دينار/كغم)</th>
              <th className="p-3.5 font-bold text-center">المساهمة في البروتين (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-200">
            {ingredients.map((ing, idx) => {
              const rate = inclusionRates[ing.id] ?? ing.defaultInclusion ?? 0;
              const price = customPrices[ing.id] ?? ing.cost ?? 0;
              const costContrib = (rate * price) / 100;
              const cpContrib = (rate * (ing.nutrients?.cp ?? 0)) / 100;

              return (
                <tr
                  key={ing.id}
                  className={`hover:bg-slate-800/50 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-900/40' : 'bg-slate-900/80'
                  }`}
                >
                  {/* اسم المادة */}
                  <td className="p-3 font-semibold text-slate-100 flex items-center justify-between gap-2">
                    <span>{ing.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">ID:{ing.id}</span>
                  </td>

                  {/* الكلفة (خانة زرقاء تفاعلية) */}
                  <td className="p-2 text-center bg-blue-950/20 border-r border-l border-slate-800">
                    <div className="relative inline-block w-28 sm:w-32">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={price === 0 ? '' : price}
                        onChange={(e) => onPriceChange(ing.id, e.target.value)}
                        placeholder="0"
                        className="w-full text-center py-1.5 px-2 rounded-lg bg-blue-900/40 text-blue-100 font-bold border border-blue-500/50 focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 outline-none transition-all shadow-inner text-sm"
                      />
                    </div>
                  </td>

                  {/* النسبة (خانة صفراء/خضراء تفاعلية) */}
                  <td className="p-2 text-center bg-amber-950/20 border-l border-slate-800">
                    <div className="relative inline-block w-28 sm:w-32">
                      <input
                        type="number"
                        step="any"
                        min="0"
                        max="100"
                        value={rate === 0 ? '' : rate}
                        onChange={(e) => onInclusionChange(ing.id, e.target.value)}
                        placeholder="0.00"
                        className={`w-full text-center py-1.5 px-2 rounded-lg font-extrabold border outline-none transition-all shadow-inner text-sm ${
                          rate > 0
                            ? 'bg-amber-400 text-slate-950 border-amber-300 font-black'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        } focus:ring-2 focus:ring-amber-400/50`}
                      />
                    </div>
                  </td>

                  {/* المساهمة في التكلفة */}
                  <td className="p-3 text-center font-mono font-medium text-blue-300">
                    {costContrib.toFixed(2)} د.ع
                  </td>

                  {/* المساهمة في البروتين */}
                  <td className="p-3 text-center font-mono text-emerald-400 font-medium">
                    {cpContrib.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>

          {/* صف المجموع السفلي */}
          <tfoot>
            <tr
              className={`font-black text-base transition-colors ${
                isValid100
                  ? 'bg-emerald-900/80 text-emerald-100 border-t-2 border-emerald-500'
                  : 'bg-rose-900/80 text-rose-100 border-t-2 border-rose-500'
              }`}
            >
              <td className="p-3.5 text-right">
                <span>المجموع الإجمالي</span>
              </td>
              <td className="p-3.5 text-center font-mono text-sm">
                متوسط السعر
              </td>
              <td className="p-3.5 text-center font-mono text-lg border-l border-r border-slate-700/50">
                <span className="inline-block px-3 py-1 rounded-md bg-black/40 shadow-inner">
                  {totalInclusion.toFixed(2)}%
                </span>
              </td>
              <td className="p-3.5 text-center font-mono text-lg text-emerald-300">
                {totalCostPerKg.toFixed(2)} دينار/كغم
              </td>
              <td className="p-3.5 text-center text-xs opacity-90">
                {(totalCostPerKg * 1000).toLocaleString('ar-IQ')} دينار/طن
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
