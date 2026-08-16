import React, { useState } from 'react';
import { ANIMAL_TARGETS } from '../data/defaultData';
import { Activity, Award, CheckCircle, Flame, PieChart, Sparkles, TrendingUp, Info } from 'lucide-react';

export default function NutrientResultsCard({
  nutrients = [],
  nutrientTotals = {},
  totalCostPerKg = 0,
  totalCostPerTon = 0,
  isValid100 = false
}) {
  const [selectedTargetId, setSelectedTargetId] = useState('broiler_grower');
  const currentTargetObj = ANIMAL_TARGETS.find(t => t.id === selectedTargetId) || ANIMAL_TARGETS[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden mb-6">
      {/* رأس بطاقة النتائج */}
      <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
            <PieChart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100">
              بطاقة النتائج والتحليل الغذائي النهائي
            </h2>
            <p className="text-xs text-slate-400">
              القيمة الغذائية المحسوبة تلقائياً بدالة SUMPRODUCT لكل عنصر غذائي.
            </p>
          </div>
        </div>

        {/* اختيار المعيار والهدف الاحتياجي للحيوان */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">مقترن باحتياجات:</span>
          <select
            value={selectedTargetId}
            onChange={(e) => setSelectedTargetId(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {ANIMAL_TARGETS.map(target => (
              <option key={target.id} value={target.id}>
                {target.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ملخص الكلفة الإجمالية الهام */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* كلفة الكيلوغرام */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">كلفة الكيلوغرام الواحد</span>
            <span className="text-xl font-extrabold text-blue-400 font-mono">
              {totalCostPerKg.toFixed(2)}{' '}
              <span className="text-xs text-slate-300 font-sans">دينار/كغم</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-900/40 text-blue-400 flex items-center justify-center font-bold">
            IQD
          </div>
        </div>

        {/* كلفة الطن */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">كلفة الطن الواحد (1000 كغم)</span>
            <span className="text-xl font-extrabold text-emerald-400 font-mono">
              {totalCostPerTon.toLocaleString('ar-IQ')}{' '}
              <span className="text-xs text-slate-300 font-sans">دينار/طن</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-900/40 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* الطاقة الممثلة */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">الطاقة الممثلة (ME)</span>
            <span className="text-xl font-extrabold text-amber-400 font-mono">
              {Math.round(nutrientTotals['me'] || 0)}{' '}
              <span className="text-xs text-slate-300 font-sans">kcal/kg</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-900/40 text-amber-400 flex items-center justify-center">
            <Flame className="w-5 h-5" />
          </div>
        </div>

        {/* نسبة البروتين الخام */}
        <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">البروتين الخام (CP)</span>
            <span className="text-xl font-extrabold text-purple-400 font-mono">
              {(nutrientTotals['cp'] || 0).toFixed(2)}{' '}
              <span className="text-xs text-slate-300 font-sans">%</span>
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-900/40 text-purple-400 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* جدول التحليل الغذائي الكامل */}
      <div className="overflow-x-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {nutrients.map(nut => {
            const calculatedVal = nutrientTotals[nut.id] || 0;
            const targetVal = currentTargetObj.targets?.[nut.id] ?? nut.defaultTarget;
            const hasTarget = targetVal !== undefined;
            const ratio = hasTarget && targetVal > 0 ? (calculatedVal / targetVal) * 100 : 100;

            // ألوان ونسبة الوفاء بالاحتياج
            let statusColor = 'bg-slate-700 text-slate-300';
            let barColor = 'bg-slate-500';

            if (hasTarget) {
              if (ratio >= 98 && ratio <= 105) {
                statusColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                barColor = 'bg-emerald-500';
              } else if (ratio < 98) {
                statusColor = 'bg-amber-950 text-amber-300 border-amber-800';
                barColor = 'bg-amber-500';
              } else {
                statusColor = 'bg-indigo-950 text-indigo-300 border-indigo-800';
                barColor = 'bg-indigo-500';
              }
            }

            return (
              <div
                key={nut.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-slate-200">{nut.name}</span>
                  <span className="text-[11px] text-slate-400 font-mono">({nut.unit})</span>
                </div>

                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <span className="text-2xl font-black font-mono text-amber-300">
                    {nut.unit === 'kcal/kg' ? Math.round(calculatedVal) : calculatedVal.toFixed(2)}
                  </span>
                  {hasTarget && (
                    <span className="text-xs text-slate-400 font-mono">
                      الهدف: {targetVal} {nut.unit}
                    </span>
                  )}
                </div>

                {/* شريط الوفاء بالاحتياج */}
                {hasTarget && (
                  <div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.min(ratio, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>الوفاء بالاحتياج: {Math.round(ratio)}%</span>
                      {ratio >= 98 && ratio <= 105 && (
                        <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                          مثالي ✓
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
