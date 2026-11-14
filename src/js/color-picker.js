// color-picker.js - Pure client-side Image Color Picker & Dominant Palette Extractor
(function () {
  'use strict';

  function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
  }

  function rgbToHsl(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  }

  function extractDominantColors(canvas, numColors = 6) {
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    const colorMap = {};
    const step = 4 * 10; // sample every 10th pixel for rapid performance

    for (let i = 0; i < imgData.length; i += step) {
      const a = imgData[i + 3];
      if (a < 128) continue; // ignore transparent pixels

      // Quantize to 5-bit color buckets to group similar shades
      const r = Math.round(imgData[i] / 16) * 16;
      const g = Math.round(imgData[i + 1] / 16) * 16;
      const b = Math.round(imgData[i + 2] / 16) * 16;
      const key = `${r},${g},${b}`;

      colorMap[key] = (colorMap[key] || 0) + 1;
    }

    const sorted = Object.entries(colorMap).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, numColors).map(item => {
      const [r, g, b] = item[0].split(',').map(Number);
      return {
        r, g, b,
        hex: rgbToHex(r, g, b)
      };
    });
  }

  function init() {
    const fileInput = document.getElementById('cpFile');
    const dropZone = document.getElementById('cpDrop');
    const canvas = document.getElementById('cpCanvas');
    const loupe = document.getElementById('cpLoupe');
    const workspace = document.getElementById('cpWorkspace');

    const swatchEl = document.getElementById('cpSwatch');
    const hexInput = document.getElementById('cpHex');
    const rgbInput = document.getElementById('cpRgb');
    const hslInput = document.getElementById('cpHsl');
    const paletteBox = document.getElementById('cpPalette');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');
    let img = null;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        URL.revokeObjectURL(url);

        const maxW = 680;
        const scale = img.width > maxW ? maxW / img.width : 1;
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Render Dominant Colors
        const palette = extractDominantColors(canvas, 6);
        renderPalette(palette);

        // Pick center pixel by default
        pickColor(Math.round(canvas.width / 2), Math.round(canvas.height / 2));

        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
      };
      tempImg.src = url;
    }

    function renderPalette(colors) {
      if (!paletteBox) return;
      paletteBox.innerHTML = '';
      colors.forEach(c => {
        const chip = document.createElement('div');
        chip.style.cssText = `
          flex:1;
          min-width:45px;
          height:45px;
          border-radius:6px;
          background:${c.hex};
          cursor:pointer;
          display:flex;
          align-items:flex-end;
          justify-content:center;
          padding-bottom:4px;
          box-shadow:inset 0 0 0 1px rgba(0,0,0,0.15);
          transition:transform 0.15s ease;
        `;
        chip.title = `Click to copy ${c.hex}`;
        chip.innerHTML = `<span style="font-size:0.65rem;background:rgba(0,0,0,0.6);color:#fff;padding:1px 4px;border-radius:3px;">${c.hex}</span>`;
        chip.addEventListener('mouseenter', () => (chip.style.transform = 'scale(1.08)'));
        chip.addEventListener('mouseleave', () => (chip.style.transform = 'scale(1)'));
        chip.addEventListener('click', () => {
          updateSelectedColor(c.r, c.g, c.b);
          navigator.clipboard.writeText(c.hex).then(() => {
            if (TK && TK.toast) TK.toast(`Copied ${c.hex} to clipboard!`);
          });
        });
        paletteBox.appendChild(chip);
      });
    }

    function updateSelectedColor(r, g, b) {
      const hex = rgbToHex(r, g, b);
      const rgb = `rgb(${r}, ${g}, ${b})`;
      const hsl = rgbToHsl(r, g, b);

      if (swatchEl) swatchEl.style.backgroundColor = hex;
      if (hexInput) hexInput.value = hex;
      if (rgbInput) rgbInput.value = rgb;
      if (hslInput) hslInput.value = hsl;
    }

    function pickColor(x, y) {
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) return;
      const pixel = ctx.getImageData(x, y, 1, 1).data;
      updateSelectedColor(pixel[0], pixel[1], pixel[2]);
    }

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return {
        x: Math.round((e.clientX - rect.left) * scaleX),
        y: Math.round((e.clientY - rect.top) * scaleY)
      };
    }

    canvas.addEventListener('mousemove', e => {
      const { x, y } = getCoords(e);
      pickColor(x, y);

      if (loupe) {
        loupe.style.display = 'block';
        loupe.style.left = (e.clientX + 15) + 'px';
        loupe.style.top = (e.clientY + 15) + 'px';
        if (hexInput) loupe.textContent = hexInput.value;
        if (hexInput) loupe.style.backgroundColor = hexInput.value;
      }
    });

    canvas.addEventListener('mouseleave', () => {
      if (loupe) loupe.style.display = 'none';
    });

    canvas.addEventListener('click', e => {
      const { x, y } = getCoords(e);
      pickColor(x, y);
      if (hexInput) {
        navigator.clipboard.writeText(hexInput.value).then(() => {
          if (TK && TK.toast) TK.toast(`Selected ${hexInput.value}`);
        });
      }
    });

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    document.querySelectorAll('.cp-copy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input) {
          navigator.clipboard.writeText(input.value).then(() => {
            const old = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => (btn.textContent = old), 1500);
          });
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
