import React, { useState } from 'react';
import { ShieldCheck, Plus, Trash2, Edit, Save, Lock, Unlock, FileSpreadsheet, Download, Upload, RefreshCw, X, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function AdminModal({
  isOpen,
  onClose,
  ingredients = [],
  nutrients = [],
  adminPin = '1234',
  tolerance = 0.01,
  onSaveIngredients,
  onSaveNutrients,
  onSaveSettings,
  onResetFactoryDefaults
}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeTab, setActiveTab] = useState('ingredients'); // 'ingredients' | 'matrix' | 'nutrients' | 'settings'

  // حالة إضافة مادة جديدة
  const [newIngName, setNewIngName] = useState('');
  const [newIngPrice, setNewIngPrice] = useState('');

  // حالة إضافة عنصر غذائي جديد
  const [newNutrientName, setNewNutrientName] = useState('');
  const [newNutrientUnit, setNewNutrientUnit] = useState('%');

  // إعدادات
  const [newTolerance, setNewTolerance] = useState(tolerance);
  const [newAdminPin, setNewAdminPin] = useState(adminPin);

  if (!isOpen) return null;

  // تسجيل الدخول للأدمن
  const handleLogin = (e) => {
    e.preventDefault();
    if (enteredPin === adminPin) {
      setIsAuthenticated(true);
      setPinError(false);
    } else {
      setPinError(true);
    }
  };

  // إضافة مادة علفية جديدة
  const handleAddIngredient = (e) => {
    e.preventDefault();
    if (!newIngName.trim()) return;

    const newId = 'ing_' + Date.now();
    const defaultNutrientsObj = {};
    nutrients.forEach(n => {
      defaultNutrientsObj[n.id] = 0;
    });

    const updated = [
      ...ingredients,
      {
        id: newId,
        name: newIngName.trim(),
        cost: parseFloat(newIngPrice) || 0,
        nutrients: defaultNutrientsObj,
        defaultInclusion: 0
      }
    ];

    onSaveIngredients(updated);
    setNewIngName('');
    setNewIngPrice('');
  };

  // حذف مادة علفية
  const handleDeleteIngredient = (id) => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذه المادة العلفية؟')) {
      const updated = ingredients.filter(ing => ing.id !== id);
      onSaveIngredients(updated);
    }
  };

  // تعديل اسم / سعر مادة
  const handleIngredientUpdate = (id, field, val) => {
    const updated = ingredients.map(ing => {
      if (ing.id === id) {
        return {
          ...ing,
          [field]: field === 'cost' ? parseFloat(val) || 0 : val
        };
      }
      return ing;
    });
    onSaveIngredients(updated);
  };

  // تعديل مصفوفة القيم الغذائية (Matrix Editor)
  const handleMatrixCellUpdate = (ingId, nutrientId, val) => {
    const updated = ingredients.map(ing => {
      if (ing.id === ingId) {
        return {
          ...ing,
          nutrients: {
            ...(ing.nutrients || {}),
            [nutrientId]: parseFloat(val) || 0
          }
        };
      }
      return ing;
    });
    onSaveIngredients(updated);
  };

  // إضافة عنصر غذائي جديد
  const handleAddNutrient = (e) => {
    e.preventDefault();
    if (!newNutrientName.trim()) return;

    const newId = 'nut_' + Date.now();
    const updated = [
      ...nutrients,
      {
        id: newId,
        name: newNutrientName.trim(),
        unit: newNutrientUnit,
        category: 'مخصص',
        defaultTarget: 0
      }
    ];

    onSaveNutrients(updated);
    setNewNutrientName('');
  };

  // حذف عنصر غذائي
  const handleDeleteNutrient = (id) => {
    if (window.confirm('هل أنت تأكد من رغبتك في حذف هذا العنصر الغذائي؟')) {
      const updated = nutrients.filter(n => n.id !== id);
      onSaveNutrients(updated);
    }
  };

  // تصدير كامل قاعدة البيانات لشيت إكسل (Backup Excel Export)
  const handleExportDatabaseExcel = () => {
    // إنشاء شيت المكونات والمصفوفة
    const matrixRows = ingredients.map(ing => {
      const row = {
        'معرف المادة': ing.id,
        'اسم المادة العلفية': ing.name,
        'السعر الافتراضي (دينار)': ing.cost,
      };
      nutrients.forEach(n => {
        row[`${n.name} (${n.unit})`] = ing.nutrients?.[n.id] || 0;
      });
      return row;
    });

    const wb = XLSX.utils.book_new();
    const wsIngredients = XLSX.utils.json_to_sheet(matrixRows);
    XLSX.utils.book_append_sheet(wb, wsIngredients, 'المواد العلفية');

    const wsNutrients = XLSX.utils.json_to_sheet(nutrients);
    XLSX.utils.book_append_sheet(wb, wsNutrients, 'العناصر الغذائية');

    XLSX.writeFile(wb, `feed_database_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // استيراد قاعدة البيانات من ملف إكسل
  const handleImportDatabaseExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        const firstSheetName = wb.SheetNames[0];
        const ws = wb.Sheets[firstSheetName];
        const rawData = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert('الملف المرفوع فارغ أو بتنسيق غير مدعوم.');
          return;
        }

        // استخراج خامات العلف
        const importedIngredients = rawData.map((row, idx) => {
          const id = row['معرف المادة'] || `ing_imp_${idx}_${Date.now()}`;
          const name = row['اسم المادة العلفية'] || row['اسم المادة'] || row['Ingredient'] || `مادة ${idx + 1}`;
          const cost = parseFloat(row['السعر الافتراضي (دينار)'] || row['السعر'] || row['Cost'] || 0);

          const nutrientsObj = {};
          nutrients.forEach(n => {
            // البحث عن اسم العنصر في الأعمدة
            const matchingKey = Object.keys(row).find(k => k.includes(n.name) || k === n.id);
            nutrientsObj[n.id] = matchingKey ? parseFloat(row[matchingKey]) || 0 : 0;
          });

          return {
            id: id,
            name: name,
            cost: cost,
            nutrients: nutrientsObj,
            defaultInclusion: 0
          };
        });

        onSaveIngredients(importedIngredients);
        alert(`تم استيراد ${importedIngredients.length} مادة علفية بنجاح!`);
      } catch (err) {
        console.error(err);
        alert('حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من التنسيق.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // حفظ الإعدادات العامة
  const handleSaveSettingsSubmit = (e) => {
    e.preventDefault();
    onSaveSettings({
      tolerance: parseFloat(newTolerance) || 0.01,
      adminPin: newAdminPin.trim() || '1234'
    });
    alert('تم حفظ الإعدادات بنجاح!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-right text-slate-100">
        {/* شريط العنوان */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="text-lg font-bold">لوحة تحكم الأدمن (Admin Panel)</h2>
              <p className="text-xs text-slate-400">إدارة خامات العلف، مصفوفة القيم الغذائية، والعناصر</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* شاشة الدخول أولاً إن لم يكن مسجلاً */}
        {!isAuthenticated ? (
          <div className="p-8 max-w-md mx-auto my-auto text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">تسجيل دخول الأدمن</h3>
              <p className="text-xs text-slate-400 mt-1">
                يرجى إدخال رمز PIN للدخول لوحة التحكم (الرمز الافتراضي: <span className="font-mono text-amber-400 font-bold">1234</span>)
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                maxLength="8"
                autoFocus
                placeholder="رمز PIN"
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                className="w-full text-center text-xl font-mono tracking-widest p-3 rounded-xl bg-slate-950 text-amber-400 border border-slate-700 outline-none focus:border-amber-500"
              />

              {pinError && (
                <p className="text-xs text-rose-400 font-bold flex items-center justify-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  رمز PIN غير صحيح! حاول مرة أخرى.
                </p>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                تأكيد الدخول
              </button>
            </form>
          </div>
        ) : (
          /* شاشة الأدمن الرئيسية */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* ألسنة التبويب */}
            <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto text-xs font-bold">
              <button
                onClick={() => setActiveTab('ingredients')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'ingredients'
                    ? 'border-amber-500 text-amber-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                إدارة خامات العلف ({ingredients.length})
              </button>
              <button
                onClick={() => setActiveTab('matrix')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'matrix'
                    ? 'border-amber-500 text-amber-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                مصفوفة العناصر الغذائية (Matrix Editor)
              </button>
              <button
                onClick={() => setActiveTab('nutrients')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'nutrients'
                    ? 'border-amber-500 text-amber-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                العناصر الغذائية ({nutrients.length})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all ${
                  activeTab === 'settings'
                    ? 'border-amber-500 text-amber-400 bg-slate-900'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                الإعدادات والاستيراد/التصدير
              </button>
            </div>

            {/* محتوى التبويب */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 1) تبويب الخامات */}
              {activeTab === 'ingredients' && (
                <div className="space-y-4">
                  {/* نموذج إضافة خامة جديدة */}
                  <form onSubmit={handleAddIngredient} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-amber-400">إضافة خامة جديدة:</span>
                    <input
                      type="text"
                      placeholder="اسم المادة العلفية"
                      required
                      value={newIngName}
                      onChange={(e) => setNewIngName(e.target.value)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-100 text-xs border border-slate-700 outline-none flex-1 min-w-[150px]"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="السعر الافتراضي (دينار/كغم)"
                      value={newIngPrice}
                      onChange={(e) => setNewIngPrice(e.target.value)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-100 text-xs border border-slate-700 outline-none w-36"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة
                    </button>
                  </form>

                  {/* قائمة الخامات الحالية */}
                  <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl bg-slate-950 overflow-hidden">
                    {ingredients.map(ing => (
                      <div key={ing.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-900/50">
                        <div className="flex-1 flex items-center gap-3">
                          <input
                            type="text"
                            value={ing.name}
                            onChange={(e) => handleIngredientUpdate(ing.id, 'name', e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-slate-100 font-bold flex-1"
                          />
                          <div className="flex items-center gap-1 text-xs">
                            <span className="text-slate-400">السعر:</span>
                            <input
                              type="number"
                              value={ing.cost}
                              onChange={(e) => handleIngredientUpdate(ing.id, 'cost', e.target.value)}
                              className="w-24 bg-slate-900 border border-slate-700 rounded p-1.5 text-xs font-mono text-blue-300 font-bold"
                            />
                            <span className="text-slate-400">د.ع</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteIngredient(ing.id)}
                          className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 transition-all text-xs"
                          title="حذف المادة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 2) تبويب المصفوفة كاملة Matrix Editor */}
              {activeTab === 'matrix' && (
                <div className="space-y-2 overflow-x-auto">
                  <p className="text-xs text-slate-400">
                    جدول تحرير قيم المصفوفة كاملة: تعديل نسبة كل عنصر غذائي لكل مادة علفية بشكل مباشر وسريع.
                  </p>

                  <table className="w-full text-right text-xs border-collapse">
                    <thead>
                      <tr className="bg-purple-950 text-purple-200">
                        <th className="p-2 border border-slate-700 font-bold sticky right-0 bg-purple-950 z-10">المادة العلفية</th>
                        {nutrients.map(n => (
                          <th key={n.id} className="p-2 border border-slate-700 text-center font-bold min-w-[80px]">
                            {n.name} ({n.unit})
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {ingredients.map((ing, idx) => (
                        <tr key={ing.id} className={idx % 2 === 0 ? 'bg-slate-900' : 'bg-slate-950'}>
                          <td className="p-2 border border-slate-800 font-bold text-slate-200 sticky right-0 bg-slate-900 z-10">
                            {ing.name}
                          </td>
                          {nutrients.map(n => (
                            <td key={n.id} className="p-1 border border-slate-800 text-center">
                              <input
                                type="number"
                                step="any"
                                value={ing.nutrients?.[n.id] ?? 0}
                                onChange={(e) => handleMatrixCellUpdate(ing.id, n.id, e.target.value)}
                                className="w-full text-center bg-slate-950 border border-slate-800 rounded p-1 text-xs text-amber-300 font-mono focus:border-amber-400"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3) تبويب العناصر الغذائية */}
              {activeTab === 'nutrients' && (
                <div className="space-y-4">
                  {/* إضافة عنصر غذائي جديد */}
                  <form onSubmit={handleAddNutrient} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-amber-400">إضافة عنصر غذائي جديد:</span>
                    <input
                      type="text"
                      placeholder="اسم العنصر الغذائي (مثلاً: ألياف خام)"
                      required
                      value={newNutrientName}
                      onChange={(e) => setNewNutrientName(e.target.value)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-100 text-xs border border-slate-700 outline-none flex-1 min-w-[150px]"
                    />
                    <select
                      value={newNutrientUnit}
                      onChange={(e) => setNewNutrientUnit(e.target.value)}
                      className="p-2 rounded-lg bg-slate-900 text-slate-100 text-xs border border-slate-700 outline-none"
                    >
                      <option value="%">%</option>
                      <option value="كيلوكالوري/كغم">كيلوكالوري/كغم</option>
                      <option value="غم/كغم">غم/كغم</option>
                      <option value="ملغم/كغم">ملغم/كغم</option>
                    </select>
                    <button
                      type="submit"
                      className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة عنصر
                    </button>
                  </form>

                  {/* قائمة العناصر الغذائية الحالية */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {nutrients.map(nut => (
                      <div key={nut.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-xs text-slate-100 block">{nut.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">الوحدة: {nut.unit} • المعرف: {nut.id}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteNutrient(nut.id)}
                          className="p-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 hover:bg-rose-900 text-xs"
                          title="حذف العنصر"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4) تبويب الإعدادات والاستيراد/التصدير */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  {/* استيراد وتصدير قاعدة البيانات */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>تصدير واستيراد قاعدة البيانات (إكسل Excel)</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      يمكنك استخراج نسخة احتياطية من قاعدة البيانات الحالية، أو رفع ملف إكسل جديد لتحديث البيانات.
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        onClick={handleExportDatabaseExcel}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        تصدير النسخة الاحتياطية كملف Excel
                      </button>

                      <label className="px-4 py-2 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm">
                        <Upload className="w-4 h-4" />
                        <span>استيراد من ملف Excel</span>
                        <input
                          type="file"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleImportDatabaseExcel}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* إعدادات النظام والسماحية */}
                  <form onSubmit={handleSaveSettingsSubmit} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200">إعدادات النظام والسماحية</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">نسبة السماحية المقبولة حول 100% (Tolerance)</label>
                        <input
                          type="number"
                          step="0.001"
                          value={newTolerance}
                          onChange={(e) => setNewTolerance(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold text-sm border border-slate-700 outline-none"
                        />
                        <p className="text-[10px] text-slate-500 mt-1">مثال: 0.01 تعني أن المجموع المقبول بين 99.99% و 100.01%.</p>
                      </div>

                      <div>
                        <label className="text-xs text-slate-400 block mb-1">كلمة مرور / رمز PIN للأدمن</label>
                        <input
                          type="text"
                          value={newAdminPin}
                          onChange={(e) => setNewAdminPin(e.target.value)}
                          className="w-full p-2.5 rounded-lg bg-slate-900 text-amber-300 font-mono font-bold text-sm border border-slate-700 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('هل تود حقاً إعادة ضبط المصنع واسترجاع البيانات الأولية؟')) {
                            onResetFactoryDefaults();
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800 text-xs font-bold flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        إعادة ضبط المصنع
                      </button>

                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
                      >
                        حفظ الإعدادات
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
