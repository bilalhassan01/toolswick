// ratio-calculator.js - Pure client-side Ratio & Aspect Ratio Calculator
(function () {
  'use strict';

  function init() {
    // Mode tabs
    const tabSolve = document.getElementById('ratioTabSolve');
    const tabAspect = document.getElementById('ratioTabAspect');
    const tabSimplify = document.getElementById('ratioTabSimplify');

    const panelSolve = document.getElementById('ratioPanelSolve');
    const panelAspect = document.getElementById('ratioPanelAspect');
    const panelSimplify = document.getElementById('ratioPanelSimplify');

    if (tabSolve && tabAspect && tabSimplify) {
      function showTab(activeTab, activePanel) {
        [tabSolve, tabAspect, tabSimplify].forEach(t => t.classList.remove('active'));
        [panelSolve, panelAspect, panelSimplify].forEach(p => (p.style.display = 'none'));
        activeTab.classList.add('active');
        activePanel.style.display = 'block';
      }

      tabSolve.addEventListener('click', () => showTab(tabSolve, panelSolve));
      tabAspect.addEventListener('click', () => showTab(tabAspect, panelAspect));
      tabSimplify.addEventListener('click', () => showTab(tabSimplify, panelSimplify));
    }

    // Tab 1: Solve A : B = C : D
    const inA = document.getElementById('ratioA');
    const inB = document.getElementById('ratioB');
    const inC = document.getElementById('ratioC');
    const inD = document.getElementById('ratioD');
    const resSolve = document.getElementById('ratioResSolve');

    function solveProportion() {
      const a = inA.value === '' ? null : parseFloat(inA.value);
      const b = inB.value === '' ? null : parseFloat(inB.value);
      const c = inC.value === '' ? null : parseFloat(inC.value);
      const d = inD.value === '' ? null : parseFloat(inD.value);

      const nulls = [a, b, c, d].filter(v => v === null).length;
      if (nulls !== 1) {
        if (resSolve) resSolve.textContent = 'Please leave exactly ONE field blank (the unknown X).';
        return;
      }

      let res = 0;
      let solvedVar = '';

      if (a === null && b !== null && c !== null && d !== null && d !== 0) {
        res = (b * c) / d;
        solvedVar = 'A';
      } else if (b === null && a !== null && c !== null && d !== null && c !== 0) {
        res = (a * d) / c;
        solvedVar = 'B';
      } else if (c === null && a !== null && b !== null && d !== null && b !== 0) {
        res = (a * d) / b;
        solvedVar = 'C';
      } else if (d === null && a !== null && b !== null && c !== null && a !== 0) {
        res = (b * c) / a;
        solvedVar = 'D';
      }

      if (resSolve) {
        resSolve.innerHTML = `Result: <strong>${solvedVar} = ${res.toLocaleString('en-US', { maximumFractionDigits: 4 })}</strong>`;
      }
    }

    [inA, inB, inC, inD].forEach(el => {
      if (el) el.addEventListener('input', solveProportion);
    });

    // Tab 2: Aspect Ratio & Scaler
    const arW1 = document.getElementById('ratioArW1');
    const arH1 = document.getElementById('ratioArH1');
    const arW2 = document.getElementById('ratioArW2');
    const arH2 = document.getElementById('ratioArH2');
    const arPresetBtns = document.querySelectorAll('.ratio-preset-btn');
    const resAspectDesc = document.getElementById('ratioResAspectDesc');

    function updateAspectFromW() {
      const w1 = parseFloat(arW1.value) || 0;
      const h1 = parseFloat(arH1.value) || 0;
      const w2 = parseFloat(arW2.value) || 0;

      if (w1 > 0 && h1 > 0 && w2 > 0) {
        const h2 = (w2 * h1) / w1;
        arH2.value = Math.round(h2 * 100) / 100;
        updateAspectInfo();
      }
    }

    function updateAspectFromH() {
      const w1 = parseFloat(arW1.value) || 0;
      const h1 = parseFloat(arH1.value) || 0;
      const h2 = parseFloat(arH2.value) || 0;

      if (w1 > 0 && h1 > 0 && h2 > 0) {
        const w2 = (h2 * w1) / h1;
        arW2.value = Math.round(w2 * 100) / 100;
        updateAspectInfo();
      }
    }

    function updateAspectInfo() {
      const w1 = parseFloat(arW1.value) || 0;
      const h1 = parseFloat(arH1.value) || 0;
      if (w1 > 0 && h1 > 0 && resAspectDesc) {
        const gcd = (x, y) => (y === 0 ? x : gcd(y, x % y));
        const divisor = gcd(Math.round(w1), Math.round(h1));
        const simpW = Math.round(w1) / divisor;
        const simpH = Math.round(h1) / divisor;
        const dec = (w1 / h1).toFixed(3);
        resAspectDesc.textContent = `Aspect Ratio: ${simpW}:${simpH} (${dec}:1)`;
      }
    }

    if (arW1 && arH1) {
      arW1.addEventListener('input', () => { updateAspectInfo(); updateAspectFromW(); });
      arH1.addEventListener('input', () => { updateAspectInfo(); updateAspectFromW(); });
    }
    if (arW2) arW2.addEventListener('input', updateAspectFromW);
    if (arH2) arH2.addEventListener('input', updateAspectFromH);

    arPresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const pw = btn.getAttribute('data-w');
        const ph = btn.getAttribute('data-h');
        arW1.value = pw;
        arH1.value = ph;
        updateAspectInfo();
        updateAspectFromW();
      });
    });

    // Tab 3: Simplify Ratio
    const simA = document.getElementById('ratioSimA');
    const simB = document.getElementById('ratioSimB');
    const resSimResult = document.getElementById('ratioResSimResult');
    const resSimDec = document.getElementById('ratioResSimDec');

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

    function simplifyRatio() {
      const a = parseFloat(simA ? simA.value : 0) || 0;
      const b = parseFloat(simB ? simB.value : 0) || 0;

      if (a <= 0 || b <= 0) {
        if (resSimResult) resSimResult.textContent = '-';
        if (resSimDec) resSimDec.textContent = '-';
        return;
      }

      // Handle decimals by multiplying by factor of 10
      let fa = a;
      let fb = b;
      while (!Number.isInteger(fa) || !Number.isInteger(fb)) {
        fa *= 10;
        fb *= 10;
      }
      const divisor = gcd(Math.round(fa), Math.round(fb));
      const sA = Math.round(fa) / divisor;
      const sB = Math.round(fb) / divisor;

      if (resSimResult) resSimResult.textContent = `${sA} : ${sB}`;
      if (resSimDec) resSimDec.textContent = (a / b).toFixed(4) + ' (Decimal value)';
    }

    if (simA && simB) {
      simA.addEventListener('input', simplifyRatio);
      simB.addEventListener('input', simplifyRatio);
    }

    solveProportion();
    updateAspectInfo();
    simplifyRatio();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
