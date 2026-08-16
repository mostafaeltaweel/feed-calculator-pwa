/**
 * وحدة الحساب الرياضي لتركيبة الأعلاف
 * تحاكي دالة SUMPRODUCT في الإكسل
 */

/**
 * تحويل القيمة إلى رقم آمن موجِب
 */
export function sanitizeNumber(val, allowNegative = false) {
  if (val === null || val === undefined || val === '') return 0;
  const num = parseFloat(val);
  if (isNaN(num)) return 0;
  if (!allowNegative && num < 0) return 0;
  return num;
}

/**
 * حساب تركيبة العلاف الكاملة (SUMPRODUCT)
 * @param {Array} ingredients قائمة المواد العلفية
 * @param {Array} nutrients قائمة العناصر الغذائية
 * @param {Object} inclusionRates خريطة نسبة كل مادة في الخلطة { ing_id: rate% }
 * @param {Object} customPrices خريطة سعر كل مادة { ing_id: price }
 * @param {number} tolerance نسبة السماحية المسموحة حول 100%
 */
export function calculateFormulation(
  ingredients = [],
  nutrients = [],
  inclusionRates = {},
  customPrices = {},
  tolerance = 0.01
) {
  let totalInclusion = 0;
  let totalCostPerKg = 0;
  
  // خريطة لتخزين ناتج SUMPRODUCT لكل عنصر غذائي
  const nutrientTotals = {};
  nutrients.forEach(n => {
    nutrientTotals[n.id] = 0;
  });

  // تفاصيل المساهمة لكل مادة علفية
  const itemContributions = [];

  ingredients.forEach(ing => {
    const rate = sanitizeNumber(inclusionRates[ing.id] ?? ing.defaultInclusion ?? 0);
    const price = sanitizeNumber(customPrices[ing.id] ?? ing.cost ?? 0);
    
    totalInclusion += rate;
    
    // التكلفة النسبية للمادة = (النسبة % * السعر) / 100
    const costContribution = (rate * price) / 100;
    totalCostPerKg += costContribution;

    // حساب المساهمات الغذائية = (النسبة % * القيمة الغذائية) / 100
    const nutrientContribs = {};
    nutrients.forEach(n => {
      const ingredientNutrientVal = sanitizeNumber(ing.nutrients?.[n.id] ?? 0);
      const contrib = (rate * ingredientNutrientVal) / 100;
      nutrientTotals[n.id] += contrib;
      nutrientContribs[n.id] = contrib;
    });

    itemContributions.push({
      ingredientId: ing.id,
      name: ing.name,
      price: price,
      inclusionRate: rate,
      costContribution: costContribution,
      nutrientContribs: nutrientContribs
    });
  });

  // مستويات الدقة والتحقق من المجموع 100%
  const roundedTotalInclusion = Math.round(totalInclusion * 1000) / 1000;
  const isExact100 = Math.abs(roundedTotalInclusion - 100) <= tolerance;

  const totalCostPerTon = totalCostPerKg * 1000;

  return {
    totalInclusion: roundedTotalInclusion,
    isValid100: isExact100,
    tolerance: tolerance,
    diffFrom100: Math.round((roundedTotalInclusion - 100) * 1000) / 1000,
    totalCostPerKg: Math.round(totalCostPerKg * 100) / 100,
    totalCostPerTon: Math.round(totalCostPerTon),
    nutrientTotals: nutrientTotals, // القيم النهائية لكل عنصر غذائي (بروتين، طاقة...)
    itemContributions: itemContributions
  };
}
