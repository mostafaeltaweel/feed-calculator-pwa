import React, { useRef } from 'react';
import { Download, FileSpreadsheet, Copy, Printer, Check, X, Share2, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function ExportModal({
  isOpen,
  onClose,
  ingredients = [],
  nutrients = [],
  inclusionRates = {},
  customPrices = {},
  calculationResult = {}
}) {
  const [copiedText, setCopiedText] = React.useState(false);
  const printRef = useRef(null);

  if (!isOpen) return null;

  const { totalInclusion, totalCostPerKg, totalCostPerTon, nutrientTotals = {}, itemContributions = [] } = calculationResult;

  // 1) تصدير كملف إكسل XLSX
  const handleExportExcel = () => {
    // شيت نسب الخامات
    const ingRows = ingredients.map(ing => {
      const rate = inclusionRates[ing.id] ?? ing.defaultInclusion ?? 0;
      const price = customPrices[ing.id] ?? ing.cost ?? 0;
      return {
        'اسم المادة العلفية': ing.name,
        'الكلفة (دينار/كغم)': price,
        'النسبة في الخلطة (%)': rate,
        'المساهمة في التكلفة (دينار)': (rate * price) / 100,
      };
    });

    // شيت العناصر الغذائية المحسوبة
    const nutRows = nutrients.map(n => ({
      'العنصر الغذائي': n.name,
      'الوحدة': n.unit,
      'القيمة الغذائية المحسوبة (SUMPRODUCT)': nutrientTotals[n.id] ? nutrientTotals[n.id].toFixed(2) : '0.00'
    }));

    const wb = XLSX.utils.book_new();
    const wsIng = XLSX.utils.json_to_sheet(ingRows);
    const wsNut = XLSX.utils.json_to_sheet(nutRows);

    XLSX.utils.book_append_sheet(wb, wsIng, 'نسب الخلطة');
    XLSX.utils.book_append_sheet(wb, wsNut, 'التحليل الغذائي النهائي');

    XLSX.writeFile(wb, `feed_formulation_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // 2) نسخ نص التقرير للواتساب
  const handleCopyWhatsAppText = () => {
    let text = `*📋 تقرير تركيبة الأعلاف - Feed Formulation*\n`;
    text += `📅 التاريخ: ${new Date().toLocaleDateString('ar-IQ')}\n`;
    text += `----------------------------------------\n`;
    text += `💰 *تكلفة الخلطة:* ${totalCostPerKg.toFixed(2)} دينار/كغم  (${totalCostPerTon.toLocaleString('ar-IQ')} دينار/طن)\n`;
    text += `⚖️ *مجموع النسب:* ${totalInclusion.toFixed(2)}%\n`;
    text += `----------------------------------------\n`;
    text += `🌾 *مكونات الخلطة:*\n`;

    ingredients.forEach(ing => {
      const rate = inclusionRates[ing.id] ?? ing.defaultInclusion ?? 0;
      if (rate > 0) {
        text += `• ${ing.name}: *${rate}%*\n`;
      }
    });

    text += `----------------------------------------\n`;
    text += `🧪 *التحليل الغذائي النهائي:*\n`;
    nutrients.forEach(n => {
      const val = nutrientTotals[n.id] || 0;
      if (val > 0) {
        text += `• ${n.name}: *${n.unit === 'kcal/kg' ? Math.round(val) : val.toFixed(2)} ${n.unit}*\n`;
      }
    });

    text += `----------------------------------------\n`;
    text += `تطوير عبر: حاسبة الأعلاف الذكية PWA`;

    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  // 3) تصدير PDF / طباعة
  const handlePrintPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`feed_report_${Date.now()}.pdf`);
    } catch (e) {
      console.error(e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-100">
        {/* الرأس */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold">تصدير ومشاركة تقرير الخلطة</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* جسم المعاينة والتصدير */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* خيارات التصدير السريعة */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handleExportExcel}
              className="p-3 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-800 text-emerald-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير ملف Excel (.xlsx)</span>
            </button>

            <button
              onClick={handleCopyWhatsAppText}
              className="p-3 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-800 text-indigo-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              {copiedText ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-indigo-400" />}
              <span>{copiedText ? 'تم النسخ للتقرير!' : 'نسخ نص للواتساب'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="p-3 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>تصدير تقرير PDF / طباعة</span>
            </button>
          </div>

          {/* التقرير القابل للطباعة والمعاينة */}
          <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl space-y-4" ref={printRef}>
            <div className="border-b border-slate-800 pb-4 text-center">
              <h3 className="text-xl font-extrabold text-amber-400">تقرير تركيبة الأعلاف والتحليل الغذائي</h3>
              <p className="text-xs text-slate-400 mt-1">تاريخ الإصدار: {new Date().toLocaleDateString('ar-IQ')}</p>
            </div>

            {/* ملخص النتائج والتكلفة */}
            <div className="grid grid-cols-2 gap-4 p-3 bg-slate-900 rounded-xl text-center">
              <div>
                <span className="text-xs text-slate-400 block">تكلفة الكيلوغرام</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">{totalCostPerKg.toFixed(2)} د.ع</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">تكلفة الطن</span>
                <span className="text-lg font-bold text-blue-400 font-mono">{totalCostPerTon.toLocaleString('ar-IQ')} د.ع</span>
              </div>
            </div>

            {/* جدول المكونات والنسب */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">مكونات الخلطة والنسب %</h4>
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-slate-300">
                    <th className="p-2 border border-slate-800">المادة العلفية</th>
                    <th className="p-2 border border-slate-800 text-center">السعر (د.ع)</th>
                    <th className="p-2 border border-slate-800 text-center">النسبة (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map(ing => {
                    const rate = inclusionRates[ing.id] ?? ing.defaultInclusion ?? 0;
                    if (rate <= 0) return null;
                    const price = customPrices[ing.id] ?? ing.cost ?? 0;
                    return (
                      <tr key={ing.id} className="border-b border-slate-900">
                        <td className="p-2 font-medium">{ing.name}</td>
                        <td className="p-2 text-center font-mono">{price}</td>
                        <td className="p-2 text-center font-mono font-bold text-amber-300">{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* التحليل الغذائي النهائي */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-2">التحليل الغذائي النهائي الناتج (SUMPRODUCT)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {nutrients.map(nut => {
                  const val = nutrientTotals[nut.id] || 0;
                  return (
                    <div key={nut.id} className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">{nut.name}:</span>
                      <span className="font-bold font-mono text-emerald-400">
                        {nut.unit === 'kcal/kg' ? Math.round(val) : val.toFixed(2)} {nut.unit}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
