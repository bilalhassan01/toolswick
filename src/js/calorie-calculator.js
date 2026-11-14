// calorie-calculator.js - Client-Side BMR & Daily Calorie Calculator (Mifflin-St Jeor) with Macro Splits
(function () {
  'use strict';

  function init() {
    const genderSel = document.getElementById('calGender');
    const ageInp = document.getElementById('calAge');
    const weightInp = document.getElementById('calWeight');
    const heightInp = document.getElementById('calHeight');
    const unitSel = document.getElementById('calUnit');
    const activitySel = document.getElementById('calActivity');

    const bmrDisplay = document.getElementById('calBmrDisplay');
    const tdeeDisplay = document.getElementById('calTdeeDisplay');
    const cutDisplay = document.getElementById('calCutDisplay');
    const bulkDisplay = document.getElementById('calBulkDisplay');

    const proteinDisplay = document.getElementById('calProteinDisplay');
    const carbsDisplay = document.getElementById('calCarbsDisplay');
    const fatDisplay = document.getElementById('calFatDisplay');

    if (!ageInp || !weightInp || !heightInp) return;

    function calculate() {
      const isMale = genderSel ? genderSel.value === 'male' : true;
      const isMetric = unitSel ? unitSel.value === 'metric' : true;
      const age = parseFloat(ageInp.value) || 25;
      let weight = parseFloat(weightInp.value) || 70; // kg or lbs
      let height = parseFloat(heightInp.value) || 175; // cm or inches
      const activity = parseFloat(activitySel ? activitySel.value : 1.2) || 1.2;

      // Convert imperial to metric for formula
      if (!isMetric) {
        weight = weight * 0.453592; // lbs to kg
        height = height * 2.54;      // inches to cm
      }

      // Mifflin-St Jeor Equation:
      // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
      // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161
      let bmr = (10 * weight) + (6.25 * height) - (5 * age) + (isMale ? 5 : -161);
      bmr = Math.max(800, bmr);

      const tdee = Math.round(bmr * activity);
      const cut = Math.round(tdee - 500); // 500 kcal deficit
      const bulk = Math.round(tdee + 300); // 300 kcal surplus

      if (bmrDisplay) bmrDisplay.textContent = `${Math.round(bmr)} kcal / day`;
      if (tdeeDisplay) tdeeDisplay.textContent = `${tdee} kcal / day`;
      if (cutDisplay) cutDisplay.textContent = `${cut} kcal / day`;
      if (bulkDisplay) bulkDisplay.textContent = `${bulk} kcal / day`;

      // Macronutrient Splits: 30% Protein (4 kcal/g), 40% Carbs (4 kcal/g), 30% Fat (9 kcal/g)
      const proteinGrams = Math.round((tdee * 0.30) / 4);
      const carbsGrams = Math.round((tdee * 0.40) / 4);
      const fatGrams = Math.round((tdee * 0.30) / 9);

      const proteinCals = proteinGrams * 4;
      const carbsCals = carbsGrams * 4;
      const fatCals = fatGrams * 9;

      if (proteinDisplay) proteinDisplay.textContent = `${proteinGrams}g (${proteinCals} kcal)`;
      if (carbsDisplay) carbsDisplay.textContent = `${carbsGrams}g (${carbsCals} kcal)`;
      if (fatDisplay) fatDisplay.textContent = `${fatGrams}g (${fatCals} kcal)`;
    }

    [genderSel, ageInp, weightInp, heightInp, unitSel, activitySel].forEach(el => {
      if (el) {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      }
    });

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
