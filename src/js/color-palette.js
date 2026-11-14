// color-palette.js - Client-Side Color Palette Generator with Lock Controls
(function () {
  'use strict';

  function init() {
    const generateBtn = document.getElementById('paletteGenerateBtn');
    const container = document.getElementById('paletteContainer');
    const copyAllBtn = document.getElementById('paletteCopyAllBtn');

    if (!generateBtn || !container) return;

    let currentColors = [];
    let locked = [false, false, false, false, false];

    function randomHex() {
      const hex = Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
      return `#${hex.toUpperCase()}`;
    }

    function render() {
      container.innerHTML = currentColors.map((color, i) => {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        const textColor = yiq >= 128 ? '#18181b' : '#ffffff';
        const isLocked = locked[i];

        return `
          <div class="color-swatch-card" data-idx="${i}" style="flex:1;min-height:180px;background:${color};border-radius:8px;display:flex;flex-direction:column;justify-content:space-between;padding:12px;box-sizing:border-box;box-shadow:0 4px 12px rgba(0,0,0,0.15);position:relative;cursor:pointer;" title="Click swatch to copy hex">
            <div style="display:flex;justify-content:flex-end;">
              <button type="button" class="swatch-lock-btn" data-lock="${i}" style="background:${isLocked ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.25)'};color:#ffffff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;font-size:0.8rem;font-weight:600;display:flex;align-items:center;gap:4px;" title="${isLocked ? 'Unlock color' : 'Lock color'}">
                ${isLocked ? '🔒 Locked' : '🔓 Lock'}
              </button>
            </div>
            <div>
              <span class="hex-label" style="font-family:monospace;font-weight:700;font-size:1.1rem;color:${textColor};display:block;">${color}</span>
              <span style="font-size:0.75rem;color:${textColor};opacity:0.85;">RGB(${r}, ${g}, ${b})</span>
            </div>
          </div>
        `;
      }).join('');

      // Wire lock buttons
      container.querySelectorAll('.swatch-lock-btn').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          const idx = parseInt(btn.dataset.lock, 10);
          locked[idx] = !locked[idx];
          render();
        });
      });

      // Wire copy click on swatch body
      container.querySelectorAll('.color-swatch-card').forEach(card => {
        card.addEventListener('click', () => {
          const idx = parseInt(card.dataset.idx, 10);
          navigator.clipboard.writeText(currentColors[idx]).then(() => {
            const span = card.querySelector('.hex-label');
            const old = span.textContent;
            span.textContent = 'COPIED!';
            setTimeout(() => (span.textContent = old), 1200);
          });
        });
      });
    }

    function generate() {
      for (let i = 0; i < 5; i++) {
        if (!locked[i] || !currentColors[i]) {
          currentColors[i] = randomHex();
        }
      }
      render();
    }

    generateBtn.addEventListener('click', generate);

    if (copyAllBtn) {
      copyAllBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentColors.join(', ')).then(() => {
          const old = copyAllBtn.textContent;
          copyAllBtn.textContent = 'Copied All!';
          setTimeout(() => (copyAllBtn.textContent = old), 1500);
        });
      });
    }

    // Spacebar to generate new unlocked colors
    document.addEventListener('keydown', e => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault();
        generate();
      }
    });

    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
