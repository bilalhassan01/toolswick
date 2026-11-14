// social-resizer.js - Pure client-side Social Media Image Resizer
(function () {
  'use strict';

  const PRESETS = {
    'ig-post': { w: 1080, h: 1080, name: 'Instagram Square (1080×1080)' },
    'ig-portrait': { w: 1080, h: 1350, name: 'Instagram Portrait (1080×1350)' },
    'ig-story': { w: 1080, h: 1920, name: 'Instagram Story / Reel (1080×1920)' },
    'fb-post': { w: 1200, h: 630, name: 'Facebook Post (1200×630)' },
    'yt-thumb': { w: 1280, h: 720, name: 'YouTube Thumbnail (1280×720)' },
    'x-post': { w: 1200, h: 675, name: 'Twitter/X Post (1200×675)' },
    'x-header': { w: 1500, h: 500, name: 'Twitter/X Header (1500×500)' },
    'li-post': { w: 1200, h: 627, name: 'LinkedIn Post (1200×627)' }
  };

  function init() {
    const fileInput = document.getElementById('socFile');
    const dropZone = document.getElementById('socDrop');
    const canvas = document.getElementById('socCanvas');
    const workspace = document.getElementById('socWorkspace');

    const presetSelect = document.getElementById('socPreset');
    const fillModeSelect = document.getElementById('socFillMode');
    const colorInput = document.getElementById('socColor');
    const downloadBtn = document.getElementById('socDownloadBtn');
    const dimsBadge = document.getElementById('socDimsBadge');

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
        render();
        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
      };
      tempImg.src = url;
    }

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

    function renderImageToCanvas(targetCanvas, targetW, targetH) {
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      const tCtx = targetCanvas.getContext('2d');

      const fillMode = fillModeSelect ? fillModeSelect.value : 'blur';
      const bgColor = colorInput ? colorInput.value : '#000000';

      if (fillMode === 'blur') {
        // Draw heavily blurred & zoomed version as background
        tCtx.save();
        tCtx.filter = 'blur(25px) brightness(0.8)';
        // Draw stretched to cover
        tCtx.drawImage(img, -20, -20, targetW + 40, targetH + 40);
        tCtx.restore();
      } else if (fillMode === 'color') {
        tCtx.fillStyle = bgColor;
        tCtx.fillRect(0, 0, targetW, targetH);
      } else if (fillMode === 'crop') {
        // Cover fit
        const imgRatio = img.width / img.height;
        const targetRatio = targetW / targetH;
        let sx, sy, sw, sh;
        if (imgRatio > targetRatio) {
          sh = img.height;
          sw = sh * targetRatio;
          sx = (img.width - sw) / 2;
          sy = 0;
        } else {
          sw = img.width;
          sh = sw / targetRatio;
          sx = 0;
          sy = (img.height - sh) / 2;
        }
        tCtx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
        return;
      }

      // Contain fit main image centered
      const imgRatio = img.width / img.height;
      const targetRatio = targetW / targetH;
      let dw, dh, dx, dy;

      if (imgRatio > targetRatio) {
        dw = targetW;
        dh = targetW / imgRatio;
        dx = 0;
        dy = (targetH - dh) / 2;
      } else {
        dh = targetH;
        dw = targetH * imgRatio;
        dx = (targetW - dw) / 2;
        dy = 0;
      }

      tCtx.drawImage(img, dx, dy, dw, dh);
    }

    function render() {
      if (!img) return;
      const presetKey = presetSelect ? presetSelect.value : 'ig-post';
      const preset = PRESETS[presetKey] || PRESETS['ig-post'];

      const maxPreview = 520;
      const scale = Math.min(maxPreview / preset.w, maxPreview / preset.h);
      const prevW = Math.round(preset.w * scale);
      const prevH = Math.round(preset.h * scale);

      renderImageToCanvas(canvas, prevW, prevH);

      if (dimsBadge) {
        dimsBadge.textContent = `${preset.name} — ${preset.w} × ${preset.h} px`;
      }
    }

    if (presetSelect) presetSelect.addEventListener('change', render);
    if (fillModeSelect) fillModeSelect.addEventListener('change', render);
    if (colorInput) colorInput.addEventListener('input', render);

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const presetKey = presetSelect ? presetSelect.value : 'ig-post';
        const preset = PRESETS[presetKey] || PRESETS['ig-post'];

        const outCanvas = document.createElement('canvas');
        renderImageToCanvas(outCanvas, preset.w, preset.h);

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${presetKey}-${preset.w}x${preset.h}.jpg`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 'image/jpeg', 0.95);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
