# 🌾 حاسبة تركيبة الأعلاف | Feed Formulation Calculator

[![PWA](https://img.shields.io/badge/PWA-Enabled-green)](https://mostafaeltaweel.github.io/feed-calculator-pwa/)
[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-blue)](https://mostafaeltaweel.github.io/feed-calculator-pwa/)

> تطبيق ويب تفاعلي (PWA) لحساب تركيبة أعلاف الدواجن والحيوانات، يحل محل ملفات الإكسل بواجهة عربية كاملة (RTL) مع حسابات فورية وعمل أوفلاين 100%.

## 🔗 رابط التطبيق المباشر

**[https://mostafaeltaweel.github.io/feed-calculator-pwa/](https://mostafaeltaweel.github.io/feed-calculator-pwa/)**

---

## ✨ المميزات الرئيسية

- 📊 **جدول تفاعلي** بنفس ألوان الإكسل (أصفر للمدخلات، أزرق للأسعار، أخضر للنتائج)
- ⚡ **حسابات فورية** بدون ضغط زر — محرك SUMPRODUCT لحظي
- ✅ **مؤشر المجموع 100%** — أحمر عند الخطأ، أخضر عند الاكتمال
- 💰 **حساب تكلفة الخلطة** بالدينار/كغم والدينار/طن
- 🧪 **تحليل غذائي كامل** — بروتين، طاقة، أحماض أمينية، معادن
- 💾 **حفظ تلقائي** للمسودة — لا تفقد بياناتك عند إغلاق التطبيق
- 📚 **وصفات محفوظة** — احفظ واسترجع خلطاتك بنقرة واحدة
- 🛡️ **لوحة أدمن** محمية بـ PIN لإدارة الخامات ومصفوفة القيم الغذائية
- 📥 **استيراد/تصدير Excel** — رفع ملف إكسل لتحديث البيانات
- 📤 **تصدير تقارير** — Excel, PDF, نص واتساب
- 📱 **PWA** — ثبّته على هاتفك كتطبيق حقيقي
- 🌐 **أوفلاين 100%** — يعمل بدون إنترنت بالكامل
- 🤖 **متوافق مع Capacitor** لتحويله لـ APK أندرويد حقيقي

---

## 🚀 تشغيل المشروع محلياً

```bash
git clone https://github.com/mostafaeltaweel/feed-calculator-pwa.git
cd feed-calculator-pwa
npm install
npm run dev
```

ثم افتح المتصفح على: **http://localhost:5173**

---

## 📦 بناء النسخة الإنتاجية

```bash
npm run build
```

---

## 📱 تحويل إلى APK أندرويد

راجع ملف [README_APK.md](./README_APK.md) للتعليمات الكاملة لتحويل التطبيق لملف APK حقيقي عبر **Capacitor** أو **PWA Builder**.

---

## 🛠️ التقنيات المستخدمة

| التقنية | الاستخدام |
|---|---|
| React + Vite | إطار عمل الواجهة الأمامية |
| Tailwind CSS v4 | التصميم والتنسيق |
| Lucide React | الأيقونات |
| xlsx | استيراد/تصدير ملفات Excel |
| html2canvas + jsPDF | تصدير PDF |
| LocalStorage | حفظ البيانات أوفلاين |
| Service Worker | دعم PWA والعمل بدون إنترنت |
| Capacitor | تحويل لـ APK أندرويد |

---

## 🔐 لوحة الأدمن

- رمز PIN الافتراضي: **`1234`**
- يمكن تغييره من إعدادات لوحة الأدمن
