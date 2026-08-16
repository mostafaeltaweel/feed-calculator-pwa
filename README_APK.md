# دليل تحويل تطبيق "حاسبة تركيبة الأعلاف" إلى ملف APK حقيقي للأندرويد

تطبیق الويب الحالي مبني كـ **Progressive Web App (PWA)** يعمل 100% أوفلاين ويسمح بالتثبيت المباشر على الهاتف من المتصفح عبر خيار "إضافة إلى الشاشة الرئيسية".

إذا كنت ترغب بتحويله إلى ملف **APK حقيقي** لتثبيته أو رفعه على متجر Google Play، يمكنك ذلك بطريقتين سهلتين:

---

## الطريقة الأولى: استخدام PWA Builder (الأسهل والأسرع - بدون كود)

1. ارفع مجلد `dist` على أي استضافة مجانية (مثل Vercel, Netlify, أو GitHub Pages).
2. افتح موقع **[PWABuilder.com](https://www.pwabuilder.com)**.
3. أدخل رابط التطبيق واضغط **Start**.
4. اضغط على زر **Package for Android (APK)** وسيتم توليد ملف APK جاهز للتثبيت على الأندرويد مباشرة في أقل من دقيقتين.

---

## الطريقة الثانية: استخدام Ionic Capacitor (تحكم كامل ومشروع Android Studio)

المشروع جاهز ومُعد ومُهيأ لاستخدام Capacitor من البداية عبر الملف `capacitor.config.json`.

نفّذ الخطوات التالية في موجه الأوامر (Terminal) داخل مجلد المشروع `d:\Apk`:

```bash
# 1. بناء ملفات الويب الحالية
npm run build

# 2. تهيئة وتثبيت Capacitor Android
npx cap init "حاسبة الأعلاف" "com.feedcalc.app" --web-dir dist
npx cap add android

# 3. مزامنة ملفات الويب مع مشروع الأندرويد
npx cap sync

# 4. فتح المشروع في Android Studio لتوليد الـ APK
npx cap open android
```

من داخل **Android Studio**:
- اختر القائمة **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
- ستحصل على ملف `app-debug.apk` أو `app-release.apk` جاهز للتثبيت على أي جهاز أندرويد.
