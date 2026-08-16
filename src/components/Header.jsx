import React from 'react';
import { Calculator, ShieldCheck, Bookmark, RefreshCw, Download, Layers, Wifi, WifiOff } from 'lucide-react';

export default function Header({
  onOpenAdmin,
  onOpenRecipes,
  onResetAll,
  onOpenExport,
  isOnline = true,
  canInstallPwa = false,
  onInstallPwa
}) {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* الشعار والعنوان */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-indigo-600 flex items-center justify-center shadow-md shadow-emerald-900/30">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-200 via-emerald-200 to-white bg-clip-text text-transparent">
              حاسبة تركيبة الأعلاف
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Feed Formulation Calculator • PWA الذكية
            </p>
          </div>
        </div>

        {/* أزرار الإجراءات والشاشات */}
        <div className="flex items-center flex-wrap gap-2">
          {/* حالة الأوفلاين / أونلاين */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
              isOnline
                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                : 'bg-amber-950/80 text-amber-400 border border-amber-800/50'
            }`}
            title={isOnline ? 'متصل بالإنترنت (يعمل محلياً أوفلاين)' : 'يعمل بالكامل بدون إنترنت'}
          >
            {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isOnline ? 'أوفلاين جاهز' : 'وضع أوفلاين'}</span>
          </div>

          {/* زر تثبيت الـ PWA لو متاح */}
          {canInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-md active:scale-95 animate-pulse"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
            </button>
          )}

          {/* زر إعادة التعيين */}
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all active:scale-95"
            title="تصفير كل نسب المكونات"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span>تصفير النسب</span>
          </button>

          {/* زر الوصفات المحفوظة */}
          <button
            onClick={onOpenRecipes}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-900/60 hover:bg-indigo-800/80 text-indigo-200 text-xs font-medium border border-indigo-700/60 transition-all active:scale-95"
          >
            <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
            <span>وصفاتي المحفوظة</span>
          </button>

          {/* زر التصدير */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 text-xs font-medium border border-emerald-700/60 transition-all active:scale-95"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>تصدير تقرير</span>
          </button>

          {/* زر الأدمن */}
          <button
            onClick={onOpenAdmin}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold shadow-sm transition-all active:scale-95"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>لوحة الأدمن</span>
          </button>
        </div>
      </div>
    </header>
  );
}
