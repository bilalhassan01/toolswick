// fraction-calculator.js - Client-Side Fraction Arithmetic, Steps & Simplifier
(function () {
  'use strict';

  function init() {
    const num1Inp = document.getElementById('fracNum1');
    const den1Inp = document.getElementById('fracDen1');
    const opSel = document.getElementById('fracOp');
    const num2Inp = document.getElementById('fracNum2');
    const den2Inp = document.getElementById('fracDen2');

    const resultFracEl = document.getElementById('fracResultDisplay');
    const decimalEl = document.getElementById('fracDecimalDisplay');
    const mixedEl = document.getElementById('fracMixedDisplay');
    const stepsEl = document.getElementById('fracStepsDisplay');

    if (!num1Inp || !den1Inp || !num2Inp || !den2Inp) return;

    function gcd(a, b) {
      a = Math.abs(a);
      b = Math.abs(b);
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    }

    function calculate() {
      const n1 = parseInt(num1Inp.value, 10) || 0;
      const d1 = parseInt(den1Inp.value, 10) || 1;
      const n2 = parseInt(num2Inp.value, 10) || 0;
      const d2 = parseInt(den2Inp.value, 10) || 1;
      const op = opSel ? opSel.value : '+';

      if (d1 === 0 || d2 === 0) {
        if (resultFracEl) resultFracEl.textContent = 'Error: Denominator cannot be 0';
        if (stepsEl) stepsEl.textContent = 'Division by zero is undefined.';
        return;
      }

      let resNum = 0;
      let resDen = 1;
      let stepStr = '';

      if (op === '+') {
        resNum = n1 * d2 + n2 * d1;
        resDen = d1 * d2;
        stepStr = `Common Denominator: (${n1}×${d2} + ${n2}×${d1}) / (${d1}×${d2}) = ${resNum}/${resDen}`;
      } else if (op === '-' || op === '−') {
        resNum = n1 * d2 - n2 * d1;
        resDen = d1 * d2;
        stepStr = `Common Denominator: (${n1}×${d2} - ${n2}×${d1}) / (${d1}×${d2}) = ${resNum}/${resDen}`;
      } else if (op === '×' || op === '*') {
        resNum = n1 * n2;
        resDen = d1 * d2;
        stepStr = `Multiply Across: (${n1}×${n2}) / (${d1}×${d2}) = ${resNum}/${resDen}`;
      } else if (op === '÷' || op === '/') {
        if (n2 === 0) {
          if (resultFracEl) resultFracEl.textContent = 'Error: Division by 0';
          if (stepsEl) stepsEl.textContent = 'Cannot divide by a fraction with numerator 0.';
          return;
        }
        resNum = n1 * d2;
        resDen = d1 * n2;
        stepStr = `Invert and Multiply: (${n1}/${d1}) × (${d2}/${n2}) = ${resNum}/${resDen}`;
      }

      // Simplify
      const divisor = gcd(resNum, resDen);
      let simpNum = resNum / divisor;
      let simpDen = resDen / divisor;

      if (simpDen < 0) {
        simpNum = -simpNum;
        simpDen = -simpDen;
      }

      if (divisor > 1) {
        stepStr += ` → Reduced by GCD (${divisor}) = ${simpNum}/${simpDen}`;
      }

      if (resultFracEl) {
        resultFracEl.textContent = simpDen === 1 ? `${simpNum}` : `${simpNum} / ${simpDen}`;
      }

      const decVal = resNum / resDen;
      if (decimalEl) {
        decimalEl.textContent = `Decimal: ${decVal.toFixed(4)}`;
      }

      if (mixedEl) {
        if (Math.abs(simpNum) >= simpDen && simpDen !== 1) {
          const whole = Math.floor(Math.abs(simpNum) / simpDen) * (simpNum < 0 ? -1 : 1);
          const rem = Math.abs(simpNum) % simpDen;
          mixedEl.textContent = rem > 0 ? `Mixed Number: ${whole} ${rem}/${simpDen}` : `Integer: ${whole}`;
        } else {
          mixedEl.textContent = `Proper Fraction: ${simpNum}/${simpDen}`;
        }
      }

      if (stepsEl) {
        stepsEl.textContent = stepStr;
      }
    }

    [num1Inp, den1Inp, opSel, num2Inp, den2Inp].forEach(el => {
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
