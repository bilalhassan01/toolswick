// crop-image.js - Pure client-side Canvas-based image cropper
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('cropFile');
    const dropZone = document.getElementById('cropDrop');
    const canvas = document.getElementById('cropCanvas');
    const presetBtns = document.querySelectorAll('.crop-preset-btn');
    const downloadBtn = document.getElementById('cropDownloadBtn');
    const resetBtn = document.getElementById('cropResetBtn');
    const cropDims = document.getElementById('cropDims');
    const fmtSelect = document.getElementById('cropFmt');
    const workspace = document.getElementById('cropWorkspace');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');

    let img = null;
    let currentAspectRatio = null; // null = free
    let cropBox = { x: 50, y: 50, w: 200, h: 200 };
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = '';
    let dragStart = { x: 0, y: 0 };
    const HANDLE_SIZE = 12;

    function handleFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      const url = URL.createObjectURL(file);
      const tempImg = new Image();
      tempImg.onload = function () {
        img = tempImg;
        URL.revokeObjectURL(url);
        initCropBox();
        draw();
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

    function initCropBox() {
      if (!img) return;
      const maxW = 680;
      const scale = img.width > maxW ? maxW / img.width : 1;
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      let initW = canvas.width;
      let initH = canvas.height;
      if (currentAspectRatio) {
        if (canvas.width / canvas.height > currentAspectRatio) {
          initH = canvas.height;
          initW = Math.round(initH * currentAspectRatio);
        } else {
          initW = canvas.width;
          initH = Math.round(initW / currentAspectRatio);
        }
      }

      cropBox = {
        x: Math.round((canvas.width - initW) / 2),
        y: Math.round((canvas.height - initH) / 2),
        w: Math.round(initW),
        h: Math.round(initH)
      };
      updateDims();
    }

    function updateDims() {
      if (!cropDims || !img) return;
      const naturalW = img.naturalWidth || img.width;
      const naturalH = img.naturalHeight || img.height;
      const scaleX = naturalW / canvas.width;
      const scaleY = naturalH / canvas.height;
      const origW = Math.round(cropBox.w * scaleX);
      const origH = Math.round(cropBox.h * scaleY);
      cropDims.textContent = `${origW} × ${origH} px`;
    }

    function draw() {
      if (!img) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Clear crop box to show original bright image
      ctx.clearRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);
      ctx.drawImage(
        img,
        (cropBox.x / canvas.width) * img.width,
        (cropBox.y / canvas.height) * img.height,
        (cropBox.w / canvas.width) * img.width,
        (cropBox.h / canvas.height) * img.height,
        cropBox.x,
        cropBox.y,
        cropBox.w,
        cropBox.h
      );

      // Border & Grid
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.strokeRect(cropBox.x, cropBox.y, cropBox.w, cropBox.h);

      // Rule of thirds lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cropBox.x + cropBox.w / 3, cropBox.y);
      ctx.lineTo(cropBox.x + cropBox.w / 3, cropBox.y + cropBox.h);
      ctx.moveTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y);
      ctx.lineTo(cropBox.x + (cropBox.w * 2) / 3, cropBox.y + cropBox.h);
      ctx.moveTo(cropBox.x, cropBox.y + cropBox.h / 3);
      ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + cropBox.h / 3);
      ctx.moveTo(cropBox.x, cropBox.y + (cropBox.h * 2) / 3);
      ctx.lineTo(cropBox.x + cropBox.w, cropBox.y + (cropBox.h * 2) / 3);
      ctx.stroke();

      // Handles
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 2;

      const handles = getHandles();
      for (const key in handles) {
        const h = handles[key];
        ctx.fillRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
        ctx.strokeRect(h.x, h.y, HANDLE_SIZE, HANDLE_SIZE);
      }
    }

    function getHandles() {
      const half = HANDLE_SIZE / 2;
      return {
        tl: { x: cropBox.x - half, y: cropBox.y - half },
        tr: { x: cropBox.x + cropBox.w - half, y: cropBox.y - half },
        bl: { x: cropBox.x - half, y: cropBox.y + cropBox.h - half },
        br: { x: cropBox.x + cropBox.w - half, y: cropBox.y + cropBox.h - half }
      };
    }

    function getCanvasCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function onPointerDown(e) {
      if (!img) return;
      const pos = getCanvasCoords(e);
      const handles = getHandles();

      for (const key in handles) {
        const h = handles[key];
        if (pos.x >= h.x && pos.x <= h.x + HANDLE_SIZE && pos.y >= h.y && pos.y <= h.y + HANDLE_SIZE) {
          isResizing = true;
          resizeHandle = key;
          dragStart = pos;
          return;
        }
      }

      if (pos.x >= cropBox.x && pos.x <= cropBox.x + cropBox.w && pos.y >= cropBox.y && pos.y <= cropBox.y + cropBox.h) {
        isDragging = true;
        dragStart = { x: pos.x - cropBox.x, y: pos.y - cropBox.y };
      }
    }

    function onPointerMove(e) {
      if (!img) return;
      const pos = getCanvasCoords(e);

      if (isDragging) {
        let nx = pos.x - dragStart.x;
        let ny = pos.y - dragStart.y;
        nx = Math.max(0, Math.min(nx, canvas.width - cropBox.w));
        ny = Math.max(0, Math.min(ny, canvas.height - cropBox.h));
        cropBox.x = nx;
        cropBox.y = ny;
        draw();
        return;
      }

      if (isResizing) {
        let nw = cropBox.w;
        let nh = cropBox.h;

        if (resizeHandle === 'br') {
          nw = Math.max(40, pos.x - cropBox.x);
          nh = currentAspectRatio ? nw / currentAspectRatio : Math.max(40, pos.y - cropBox.y);
        } else if (resizeHandle === 'bl') {
          const right = cropBox.x + cropBox.w;
          nw = Math.max(40, right - pos.x);
          cropBox.x = right - nw;
          nh = currentAspectRatio ? nw / currentAspectRatio : Math.max(40, pos.y - cropBox.y);
        } else if (resizeHandle === 'tr') {
          nw = Math.max(40, pos.x - cropBox.x);
          const bottom = cropBox.y + cropBox.h;
          nh = currentAspectRatio ? nw / currentAspectRatio : Math.max(40, bottom - pos.y);
          cropBox.y = bottom - nh;
        } else if (resizeHandle === 'tl') {
          const right = cropBox.x + cropBox.w;
          const bottom = cropBox.y + cropBox.h;
          nw = Math.max(40, right - pos.x);
          cropBox.x = right - nw;
          nh = currentAspectRatio ? nw / currentAspectRatio : Math.max(40, bottom - pos.y);
          cropBox.y = bottom - nh;
        }

        if (cropBox.x + nw <= canvas.width) cropBox.w = nw;
        if (cropBox.y + nh <= canvas.height) cropBox.h = nh;

        updateDims();
        draw();
      }
    }

    function onPointerUp() {
      isDragging = false;
      isResizing = false;
    }

    canvas.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        presetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const ratioStr = btn.getAttribute('data-ratio');
        if (ratioStr === 'free') {
          currentAspectRatio = null;
        } else {
          const [rw, rh] = ratioStr.split(':').map(Number);
          currentAspectRatio = rw / rh;
          cropBox.h = cropBox.w / currentAspectRatio;
          if (cropBox.y + cropBox.h > canvas.height) {
            cropBox.h = canvas.height - cropBox.y;
            cropBox.w = cropBox.h * currentAspectRatio;
          }
        }
        updateDims();
        draw();
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        img = null;
        if (fileInput) fileInput.value = '';
        if (workspace) workspace.style.display = 'none';
        if (dropZone) dropZone.style.display = 'block';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!img) return;
        const naturalW = img.naturalWidth || img.width;
        const naturalH = img.naturalHeight || img.height;
        const scaleX = naturalW / canvas.width;
        const scaleY = naturalH / canvas.height;
        const sx = Math.max(0, Math.round(cropBox.x * scaleX));
        const sy = Math.max(0, Math.round(cropBox.y * scaleY));
        const sw = Math.min(naturalW - sx, Math.round(cropBox.w * scaleX));
        const sh = Math.min(naturalH - sy, Math.round(cropBox.h * scaleY));

        const outCanvas = document.createElement('canvas');
        outCanvas.width = sw;
        outCanvas.height = sh;
        const outCtx = outCanvas.getContext('2d');
        outCtx.imageSmoothingEnabled = true;
        outCtx.imageSmoothingQuality = 'high';
        outCtx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

        const fmt = fmtSelect ? fmtSelect.value : 'png';
        const mime = fmt === 'jpg' ? 'image/jpeg' : 'image/png';
        const ext = fmt === 'jpg' ? 'jpg' : 'png';

        outCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `cropped-photo-${sw}x${sh}.${ext}`;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, mime, 0.95);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
