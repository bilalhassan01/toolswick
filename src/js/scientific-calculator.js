// scientific-calculator.js - Client-Side Scientific Calculator with Safe Evaluator & Deg/Rad Toggle
(function () {
  'use strict';

  function init() {
    const exprEl = document.getElementById('sciExpr');
    const displayEl = document.getElementById('sciDisplay');
    const historyListEl = document.getElementById('sciHistoryList');
    const clearHistoryBtn = document.getElementById('sciClearHistoryBtn');
    const degRadBtn = document.getElementById('sciDegRadBtn');

    if (!displayEl) return;

    let currentInput = '0';
    let currentExpr = '';
    let isNewNumber = true;
    let isDegMode = true; // default DEG

    function updateDisplay() {
      if (displayEl) displayEl.textContent = currentInput;
      if (exprEl) exprEl.textContent = currentExpr;
      if (degRadBtn) {
        degRadBtn.textContent = isDegMode ? 'DEG' : 'RAD';
        degRadBtn.style.color = isDegMode ? '#10b981' : '#38bdf8';
      }
    }

    function addHistory(expr, res) {
      if (!historyListEl) return;
      const item = document.createElement('div');
      item.style.padding = '4px 0';
      item.style.borderBottom = '1px solid var(--border,#333)';
      item.style.fontSize = '0.85rem';
      item.innerHTML = `<span style="color:var(--muted);">${expr} =</span> <b style="color:#10b981;">${res}</b>`;
      historyListEl.prepend(item);
    }

    if (clearHistoryBtn && historyListEl) {
      clearHistoryBtn.addEventListener('click', () => {
        historyListEl.innerHTML = '';
      });
    }

    function handleNumber(num) {
      if (isNewNumber) {
        currentInput = num === '.' ? '0.' : num;
        isNewNumber = false;
      } else {
        if (num === '.' && currentInput.includes('.')) return;
        currentInput = currentInput === '0' && num !== '.' ? num : currentInput + num;
      }
      updateDisplay();
    }

    function handleDot() {
      handleNumber('.');
    }

    function handleOp(op) {
      if (currentExpr && isNewNumber) {
        currentExpr = currentExpr.slice(0, -3) + ' ' + op + ' ';
      } else {
        currentExpr += currentInput + ' ' + op + ' ';
      }
      isNewNumber = true;
      updateDisplay();
    }

    // Safe mathematical expression parser
    function safeEvaluate(exprStr) {
      const normalized = exprStr
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/[xX]/g, '*')
        .replace(/\^/g, '^')
        .replace(/\s+/g, '');

      let pos = 0;

      function peek() {
        return normalized[pos];
      }

      function getNumber() {
        let start = pos;
        if (peek() === '-' || peek() === '+') pos++;
        while (pos < normalized.length && (/[0-9.]/.test(normalized[pos]))) pos++;
        const s = normalized.slice(start, pos);
        const val = parseFloat(s);
        if (isNaN(val)) throw new Error('Invalid number');
        return val;
      }

      function parseFactor() {
        if (peek() === '(') {
          pos++;
          const val = parseExpression();
          if (peek() === ')') pos++;
          return val;
        }
        if (peek() === '+' || peek() === '-' || /[0-9.]/.test(peek())) {
          return getNumber();
        }
        throw new Error('Unexpected token: ' + peek());
      }

      function parsePower() {
        let left = parseFactor();
        while (pos < normalized.length && peek() === '^') {
          pos++;
          const right = parseFactor();
          left = Math.pow(left, right);
        }
        return left;
      }

      function parseTerm() {
        let left = parsePower();
        while (pos < normalized.length && (peek() === '*' || peek() === '/' || peek() === '%')) {
          const op = peek();
          pos++;
          const right = parsePower();
          if (op === '*') left = left * right;
          else if (op === '/') {
            if (right === 0) throw new Error('Divide by zero');
            left = left / right;
          } else if (op === '%') left = left % right;
        }
        return left;
      }

      function parseExpression() {
        let left = parseTerm();
        while (pos < normalized.length && (peek() === '+' || peek() === '-')) {
          const op = peek();
          pos++;
          const right = parseTerm();
          if (op === '+') left = left + right;
          else if (op === '-') left = left - right;
        }
        return left;
      }

      const result = parseExpression();
      if (pos < normalized.length) throw new Error('Extra tokens remaining');
      return result;
    }

    function evaluate() {
      if (!currentExpr && isNewNumber) return;
      const full = (currentExpr + currentInput).trim();
      if (!full) return;

      try {
        const res = safeEvaluate(full);
        if (isNaN(res) || !isFinite(res)) throw new Error('Math error');
        const formattedRes = parseFloat(Number(res).toFixed(10)).toString();

        addHistory(full, formattedRes);
        currentInput = formattedRes;
        currentExpr = '';
        isNewNumber = true;
      } catch (e) {
        currentInput = 'Error';
        currentExpr = '';
        isNewNumber = true;
      }
      updateDisplay();
    }

    function handleFunc(fn) {
      const val = parseFloat(currentInput) || 0;
      let res = 0;

      if (fn === 'sin') {
        const rad = isDegMode ? (val * Math.PI) / 180 : val;
        res = Math.sin(rad);
        if (isDegMode && Math.abs(val % 180) === 0) res = 0;
        if (isDegMode && ((val - 30) % 360 === 0 || (val - 150) % 360 === 0)) res = 0.5;
        if (isDegMode && ((val + 30) % 360 === 0 || (val + 150) % 360 === 0)) res = -0.5;
      } else if (fn === 'cos') {
        const rad = isDegMode ? (val * Math.PI) / 180 : val;
        res = Math.cos(rad);
        if (isDegMode && Math.abs((val - 90) % 180) === 0) res = 0;
        if (isDegMode && ((val - 60) % 360 === 0 || (val + 60) % 360 === 0)) res = 0.5;
        if (isDegMode && ((val - 120) % 360 === 0 || (val + 120) % 360 === 0)) res = -0.5;
      } else if (fn === 'tan') {
        const rad = isDegMode ? (val * Math.PI) / 180 : val;
        res = Math.tan(rad);
        if (isDegMode && Math.abs(val % 180) === 0) res = 0;
        if (isDegMode && (val - 45) % 180 === 0) res = 1;
        if (isDegMode && (val + 45) % 180 === 0) res = -1;
      } else if (fn === 'asin') {
        const rad = Math.asin(val);
        res = isDegMode ? (rad * 180) / Math.PI : rad;
      } else if (fn === 'acos') {
        const rad = Math.acos(val);
        res = isDegMode ? (rad * 180) / Math.PI : rad;
      } else if (fn === 'atan') {
        const rad = Math.atan(val);
        res = isDegMode ? (rad * 180) / Math.PI : rad;
      } else if (fn === 'ln') {
        res = Math.log(val);
      } else if (fn === 'log') {
        res = Math.log10(val);
      } else if (fn === 'sqrt') {
        res = Math.sqrt(val);
      } else if (fn === 'square') {
        res = Math.pow(val, 2);
      } else if (fn === 'pi') {
        res = Math.PI;
      } else if (fn === 'e') {
        res = Math.E;
      } else if (fn === 'factorial') {
        const n = Math.floor(val);
        if (n < 0 || n > 170) res = Infinity;
        else {
          let f = 1;
          for (let i = 2; i <= n; i++) f *= i;
          res = f;
        }
      }

      if (isNaN(res) || !isFinite(res)) {
        currentInput = 'Error';
      } else {
        // Capture the argument BEFORE overwriting currentInput with the
        // result -- the old code logged fn(result) as the argument, so the
        // history showed e.g. "sin(0.5) (deg) =0.5" instead of "sin(30) (deg) =0.5".
        const argVal = val;
        res = Math.round(res * 1e12) / 1e12;
        currentInput = parseFloat(Number(res).toFixed(10)).toString();
        // Log trig and function calculation in History!
        const modeLabel = (fn === 'sin' || fn === 'cos' || fn === 'tan') ? (isDegMode ? ' (deg)' : ' (rad)') : '';
        const label = (fn === 'pi') ? 'π' : (fn === 'e') ? 'e' : `${fn}(${argVal})${modeLabel}`;
        addHistory(label, currentInput);
      }
      isNewNumber = true;
      updateDisplay();
    }

    // Bind all calculator buttons (mode toggle, operators, functions, numbers)
    document.querySelectorAll('.sci-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        const val = btn.getAttribute('data-val');

        if (action === 'num') handleNumber(val);
        else if (action === 'dot') handleDot();
        else if (action === 'op') handleOp(val);
        else if (action === 'equal') evaluate();
        else if (action === 'func') handleFunc(val);
        else if (action === 'mode') {
          isDegMode = !isDegMode;
          updateDisplay();
        } else if (action === 'sign') {
          if (currentInput !== '0' && currentInput !== 'Error') {
            currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
            updateDisplay();
          }
        } else if (action === 'clear') {
          currentInput = '0';
          currentExpr = '';
          isNewNumber = true;
          updateDisplay();
        } else if (action === 'backspace') {
          if (currentInput.length > 1 && currentInput !== 'Error') {
            currentInput = currentInput.slice(0, -1);
          } else {
            currentInput = '0';
            isNewNumber = true;
          }
          updateDisplay();
        }
      });
    });

    updateDisplay();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
