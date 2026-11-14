// color-contrast.js - Client-Side WCAG 2.1 AA & AAA Color Contrast Ratio Evaluator
(function () {
  'use strict';

  function init() {
    const fgColorInp = document.getElementById('contrastFgColor');
    const fgHexInp = document.getElementById('contrastFgHex');
    const bgColorInp = document.getElementById('contrastBgColor');
    const bgHexInp = document.getElementById('contrastBgHex');
    const swapBtn = document.getElementById('contrastSwapBtn');

    const ratioDisplay = document.getElementById('contrastRatioDisplay');
    const previewBox = document.getElementById('contrastPreviewBox');
    const aaNormalBadge = document.getElementById('contrastAaNormal');
    const aaLargeBadge = document.getElementById('contrastAaLarge');
    const aaaNormalBadge = document.getElementById('contrastAaaNormal');
    const aaaLargeBadge = document.getElementById('contrastAaaLarge');

    if (!fgColorInp || !bgColorInp || !ratioDisplay) return;

    function hexToRgb(hex) {
      hex = hex.replace(/^#/, '');
      if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const int = parseInt(hex, 16);
      return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
    }

    function getLuminance(r, g, b) {
      const a = [r, g, b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      });
      return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    }

    function getContrastRatio(hex1, hex2) {
      const rgb1 = hexToRgb(hex1);
      const rgb2 = hexToRgb(hex2);
      const lum1 = getLuminance(rgb1[0], rgb1[1], rgb1[2]);
      const lum2 = getLuminance(rgb2[0], rgb2[1], rgb2[2]);
      const brightest = Math.max(lum1, lum2);
      const darkest = Math.min(lum1, lum2);
      return (brightest + 0.05) / (darkest + 0.05);
    }

    function normalizeHex(val) {
      val = val.trim();
      if (!val.startsWith('#')) val = '#' + val;
      if (/^#[0-9A-Fa-f]{3}$/.test(val)) {
        val = '#' + val[1] + val[1] + val[2] + val[2] + val[3] + val[3];
      }
      return val.toLowerCase();
    }

    function isValidHex(val) {
      val = val.trim();
      if (!val.startsWith('#')) val = '#' + val;
      return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(val);
    }

    function update() {
      const fg = fgColorInp.value;
      const bg = bgColorInp.value;

      if (previewBox) {
        previewBox.style.color = fg;
        previewBox.style.backgroundColor = bg;
      }

      const ratio = getContrastRatio(fg, bg);
      ratioDisplay.textContent = `${ratio.toFixed(2)} : 1`;

      const passBadge = '<span style="color:#10b981;font-weight:700;">✓ Pass</span>';
      const failBadge = '<span style="color:#ef4444;font-weight:700;">✗ Fail</span>';

      // WCAG 2.1 Requirements:
      // AA Normal: 4.5:1
      // AA Large: 3:1
      // AAA Normal: 7:1
      // AAA Large: 4.5:1
      if (aaNormalBadge) aaNormalBadge.innerHTML = ratio >= 4.5 ? passBadge : failBadge;
      if (aaLargeBadge) aaLargeBadge.innerHTML = ratio >= 3.0 ? passBadge : failBadge;
      if (aaaNormalBadge) aaaNormalBadge.innerHTML = ratio >= 7.0 ? passBadge : failBadge;
      if (aaaLargeBadge) aaaLargeBadge.innerHTML = ratio >= 4.5 ? passBadge : failBadge;
    }

    // Color picker input handlers
    fgColorInp.addEventListener('input', () => {
      if (fgHexInp) fgHexInp.value = fgColorInp.value.toUpperCase();
      update();
    });

    bgColorInp.addEventListener('input', () => {
      if (bgHexInp) bgHexInp.value = bgColorInp.value.toUpperCase();
      update();
    });

    // Real-time live keystroke input handlers on hex fields (no Enter required!)
    if (fgHexInp) {
      fgHexInp.addEventListener('input', () => {
        if (isValidHex(fgHexInp.value)) {
          const norm = normalizeHex(fgHexInp.value);
          fgColorInp.value = norm;
          update();
        }
      });
    }

    if (bgHexInp) {
      bgHexInp.addEventListener('input', () => {
        if (isValidHex(bgHexInp.value)) {
          const norm = normalizeHex(bgHexInp.value);
          bgColorInp.value = norm;
          update();
        }
      });
    }

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const tmp = fgColorInp.value;
        fgColorInp.value = bgColorInp.value;
        bgColorInp.value = tmp;
        if (fgHexInp) fgHexInp.value = fgColorInp.value.toUpperCase();
        if (bgHexInp) bgHexInp.value = bgColorInp.value.toUpperCase();
        update();
      });
    }

    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
