// password-strength.js - Client-Side Password Entropy & Security Analyzer (100% Local)
(function () {
  'use strict';

  function init() {
    const input = document.getElementById('pwStrengthInput');
    const toggleBtn = document.getElementById('pwToggleVisibility');
    const bar = document.getElementById('pwStrengthBar');
    const label = document.getElementById('pwStrengthLabel');
    const bitsEl = document.getElementById('pwEntropyBits');
    const crackTimeEl = document.getElementById('pwCrackTime');

    const checkLen = document.getElementById('pwCheckLen');
    const checkUpper = document.getElementById('pwCheckUpper');
    const checkLower = document.getElementById('pwCheckLower');
    const checkNum = document.getElementById('pwCheckNum');
    const checkSym = document.getElementById('pwCheckSym');

    if (!input || !bar) return;

    function calculateEntropy(pwd) {
      if (!pwd) return 0;
      let pool = 0;
      if (/[a-z]/.test(pwd)) pool += 26;
      if (/[A-Z]/.test(pwd)) pool += 26;
      if (/[0-9]/.test(pwd)) pool += 10;
      if (/[^a-zA-Z0-9]/.test(pwd)) pool += 33;

      if (pool === 0) return 0;
      return Math.round(pwd.length * (Math.log(pool) / Math.LN2));
    }

    function estimateCrackTime(bits) {
      // Assuming 100 billion guesses per second (modern GPU cluster)
      const guesses = Math.pow(2, bits);
      const seconds = guesses / 1e11;

      if (seconds < 1) return 'Instant';
      if (seconds < 60) return `${Math.round(seconds)} seconds`;
      if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
      if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
      if (seconds < 31536000) return `${Math.round(seconds / 86400)} days`;
      if (seconds < 3153600000) return `${Math.round(seconds / 31536000)} years`;
      return 'Centuries';
    }

    function evaluate() {
      const pwd = input.value;
      const bits = calculateEntropy(pwd);

      const hasLen = pwd.length >= 12;
      const hasUpper = /[A-Z]/.test(pwd);
      const hasLower = /[a-z]/.test(pwd);
      const hasNum = /[0-9]/.test(pwd);
      const hasSym = /[^a-zA-Z0-9]/.test(pwd);

      if (checkLen) checkLen.style.color = hasLen ? '#10b981' : 'var(--muted)';
      if (checkUpper) checkUpper.style.color = hasUpper ? '#10b981' : 'var(--muted)';
      if (checkLower) checkLower.style.color = hasLower ? '#10b981' : 'var(--muted)';
      if (checkNum) checkNum.style.color = hasNum ? '#10b981' : 'var(--muted)';
      if (checkSym) checkSym.style.color = hasSym ? '#10b981' : 'var(--muted)';

      if (bitsEl) bitsEl.textContent = `${bits} bits`;
      if (crackTimeEl) crackTimeEl.textContent = estimateCrackTime(bits);

      let pct = Math.min(100, Math.round((bits / 80) * 100));
      bar.style.width = `${pct}%`;

      if (bits < 28) {
        bar.style.background = '#ef4444';
        if (label) { label.textContent = 'Very Weak'; label.style.color = '#ef4444'; }
      } else if (bits < 45) {
        bar.style.background = '#f97316';
        if (label) { label.textContent = 'Weak'; label.style.color = '#f97316'; }
      } else if (bits < 60) {
        bar.style.background = '#eab308';
        if (label) { label.textContent = 'Reasonable'; label.style.color = '#eab308'; }
      } else if (bits < 80) {
        bar.style.background = '#10b981';
        if (label) { label.textContent = 'Strong'; label.style.color = '#10b981'; }
      } else {
        bar.style.background = '#059669';
        if (label) { label.textContent = 'Very Strong'; label.style.color = '#059669'; }
      }
    }

    input.addEventListener('input', evaluate);

    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        input.type = input.type === 'password' ? 'text' : 'password';
        toggleBtn.textContent = input.type === 'password' ? '👁 Show' : '🙈 Hide';
      });
    }

    evaluate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
