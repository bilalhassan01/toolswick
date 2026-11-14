// passport-photo.js - Pure client-side Passport & Visa Photo Resizer
(function () {
  'use strict';

  const PRESETS = {
    'us': { w: 600, h: 600, label: 'US Passport / Visa (2×2 inch / 51×51mm)', mmW: 51, mmH: 51 },
    'eu': { w: 413, h: 531, label: 'UK & Schengen & EU (35×45mm)', mmW: 35, mmH: 45 },
    'cn': { w: 390, h: 567, label: 'China Visa (33×48mm)', mmW: 33, mmH: 48 },
    'ca': { w: 590, h: 826, label: 'Canada Passport (50×70mm)', mmW: 50, mmH: 70 }
  };

  function init() {
    const fileInput = document.getElementById('passFile');
    const dropZone = document.getElementById('passDrop');
    const canvas = document.getElementById('passCanvas');
    const workspace = document.getElementById('passWorkspace');

    const countrySelect = document.getElementById('passCountry');
    const sheetModeCheck = document.getElementById('passSheetMode');
    const zoomInput = document.getElementById('passZoom');
    const zoomVal = document.getElementById('passZoomVal');
    const guideCheck = document.getElementById('passGuide');
    const downloadBtn = document.getElementById('passDownloadBtn');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');

    let img = null;
    let panOffset = { x: 0, y: 0 };
    let isPanning = false;
    let panStart = { x: 0, y: 0 };

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        URL.revokeObjectURL(url);
        panOffset = { x: 0, y: 0 };
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

    function drawSinglePhoto(targetCtx, tw, th, isPreview = false) {
      targetCtx.fillStyle = '#ffffff';
      targetCtx.fillRect(0, 0, tw, th);

      const zoom = (parseInt(zoomInput ? zoomInput.value : 100, 10) || 100) / 100;
      const baseScale = Math.max(tw / img.width, th / img.height);
      const scale = baseScale * zoom;

      const dw = Math.round(img.width * scale);
      const dh = Math.round(img.height * scale);
      const dx = Math.round((tw - dw) / 2 + panOffset.x);
      const dy = Math.round((th - dh) / 2 + panOffset.y);

      targetCtx.drawImage(img, dx, dy, dw, dh);

      // Biometric oval face guide
      if (isPreview && (!guideCheck || guideCheck.checked)) {
        targetCtx.save();
        targetCtx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        targetCtx.lineWidth = 2;
        targetCtx.setLineDash([6, 6]);

        // Head oval
        targetCtx.beginPath();
        targetCtx.ellipse(tw / 2, th * 0.45, tw * 0.28, th * 0.35, 0, 0, Math.PI * 2);
        targetCtx.stroke();

        // Eye line
        targetCtx.strokeStyle = 'rgba(234, 179, 8, 0.6)';
        targetCtx.beginPath();
        targetCtx.moveTo(tw * 0.25, th * 0.42);
        targetCtx.lineTo(tw * 0.75, th * 0.42);
        targetCtx.stroke();

        targetCtx.restore();
      }
    }

    function render() {
      if (!img) return;
      const presetKey = countrySelect ? countrySelect.value : 'us';
      const preset = PRESETS[presetKey] || PRESETS['us'];

      const isSheet = sheetModeCheck ? sheetModeCheck.checked : false;

      if (!isSheet) {
        // Single photo preview
        const maxPrev = 420;
        const scale = Math.min(maxPrev / preset.w, maxPrev / preset.h);
        canvas.width = Math.round(preset.w * scale);
        canvas.height = Math.round(preset.h * scale);
        drawSinglePhoto(ctx, canvas.width, canvas.height, true);
      } else {
        // 4x6 inch sheet preview (1800 x 1200 at 300 DPI)
        const sheetW = 600;
        const sheetH = 400;
        canvas.width = sheetW;
        canvas.height = sheetH;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sheetW, sheetH);

        // Render 6 passport photos in 3 columns x 2 rows
        const photoPrevW = 140;
        const photoPrevH = Math.round(photoPrevW * (preset.h / preset.w));
        const startX = 35;
        const startY = 40;
        const gapX = 35;
        const gapY = 25;

        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 3; col++) {
            const px = startX + col * (photoPrevW + gapX);
            const py = startY + row * (photoPrevH + gapY);

            ctx.save();
            ctx.beginPath();
            ctx.rect(px, py, photoPrevW, photoPrevH);
            ctx.clip();
            ctx.translate(px, py);
            drawSinglePhoto(ctx, photoPrevW, photoPrevH, false);
            ctx.restore();

            // Border cutting line
            ctx.strokeStyle = '#cccccc';
            ctx.lineWidth = 1;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(px, py, photoPrevW, photoPrevH);
            ctx.setLineDash([]);
          }
        }
      }
    }

    // Interactive panning
    canvas.addEventListener('mousedown', e => {
      isPanning = true;
      panStart = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
    });
    window.addEventListener('mousemove', e => {
      if (!isPanning) return;
      panOffset.x = e.clientX - panStart.x;
      panOffset.y = e.clientY - panStart.y;
      render();
    });
    window.addEventListener('mouseup', () => (isPanning = false));

    if (zoomInput) {
      zoomInput.addEventListener('input', () => {
        if (zoomVal) zoomVal.textContent = zoomInput.value + '%';
        render();
      });
    }

    if (countrySelect) countrySelect.addEventListener('change', render);
    if (sheetModeCheck) sheetModeCheck.addEventListener('change', render);
    if (guideCheck) guideCheck.addEventListener('change', render);

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const presetKey = countrySelect ? countrySelect.value : 'us';
        const preset = PRESETS[presetKey] || PRESETS['us'];
        const isSheet = sheetModeCheck ? sheetModeCheck.checked : false;

        const outCanvas = document.createElement('canvas');

        if (!isSheet) {
          outCanvas.width = preset.w;
          outCanvas.height = preset.h;
          const outCtx = outCanvas.getContext('2d');
          drawSinglePhoto(outCtx, preset.w, preset.h, false);
        } else {
          // Full 300 DPI 4x6 inch sheet (1800 x 1200 px)
          outCanvas.width = 1800;
          outCanvas.height = 1200;
          const outCtx = outCanvas.getContext('2d');
          outCtx.fillStyle = '#ffffff';
          outCtx.fillRect(0, 0, 1800, 1200);

          const pw = preset.w;
          const ph = preset.h;
          const gapX = Math.round((1800 - (pw * 3)) / 4);
          const gapY = Math.round((1200 - (ph * 2)) / 3);

          for (let row = 0; row < 2; row++) {
            for (let col = 0; col < 3; col++) {
              const px = gapX + col * (pw + gapX);
              const py = gapY + row * (ph + gapY);

              outCtx.save();
              outCtx.beginPath();
              outCtx.rect(px, py, pw, ph);
              outCtx.clip();
              outCtx.translate(px, py);
              drawSinglePhoto(outCtx, pw, ph, false);
              outCtx.restore();

              // Light cutting border
              outCtx.strokeStyle = '#dddddd';
              outCtx.lineWidth = 1;
              outCtx.strokeRect(px, py, pw, ph);
            }
          }
        }

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = isSheet ? 'passport-photos-4x6-sheet.jpg' : `passport-photo-${presetKey}.jpg`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 'image/jpeg', 0.98);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
