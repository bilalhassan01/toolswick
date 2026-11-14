// photo-collage.js - Pure client-side Photo Collage Maker
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('colFile');
    const dropZone = document.getElementById('colDrop');
    const canvas = document.getElementById('colCanvas');
    const workspace = document.getElementById('colWorkspace');

    const layoutSelect = document.getElementById('colLayout');
    const spacingInput = document.getElementById('colSpacing');
    const spacingVal = document.getElementById('colSpacingVal');
    const colorInput = document.getElementById('colColor');
    const downloadBtn = document.getElementById('colDownloadBtn');
    const resetBtn = document.getElementById('colResetBtn');
    const thumbList = document.getElementById('colThumbList');

    if (!canvas || !fileInput) return;
    const ctx = canvas.getContext('2d');

    let loadedImages = [];

    function handleFiles(files) {
      if (!files || !files.length) return;
      Array.from(files).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        if (loadedImages.length >= 4) return;

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = function () {
          loadedImages.push({ img, url, name: file.name });
          updateThumbs();
          render();
          if (workspace) workspace.style.display = 'block';
        };
        img.src = url;
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', e => {
        if (e.target.files) handleFiles(e.target.files);
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
      });
      dropZone.addEventListener('click', () => fileInput.click());
    }

    function updateThumbs() {
      if (!thumbList) return;
      thumbList.innerHTML = '';
      loadedImages.forEach((item, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'position:relative;width:60px;height:60px;border-radius:6px;overflow:hidden;border:1px solid var(--border,#444);';
        div.innerHTML = `
          <img src="${item.url}" style="width:100%;height:100%;object-fit:cover;" />
          <button type="button" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,0.7);color:#f87171;border:none;border-radius:50%;width:18px;height:18px;font-size:12px;line-height:1;cursor:pointer;">&times;</button>
        `;
        div.querySelector('button').addEventListener('click', e => {
          e.stopPropagation();
          URL.revokeObjectURL(item.url);
          loadedImages.splice(idx, 1);
          updateThumbs();
          render();
          if (loadedImages.length === 0 && workspace) workspace.style.display = 'none';
        });
        thumbList.appendChild(div);
      });
    }

    function drawCover(targetCtx, image, x, y, w, h) {
      const imgRatio = image.width / image.height;
      const targetRatio = w / h;
      let sx, sy, sw, sh;

      if (imgRatio > targetRatio) {
        sh = image.height;
        sw = sh * targetRatio;
        sx = (image.width - sw) / 2;
        sy = 0;
      } else {
        sw = image.width;
        sh = sw / targetRatio;
        sx = 0;
        sy = (image.height - sh) / 2;
      }
      targetCtx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
    }

    function render(targetCanvas = canvas) {
      if (loadedImages.length === 0) return;

      const targetW = 1200;
      const targetH = 1200;
      targetCanvas.width = targetW;
      targetCanvas.height = targetH;
      const targetCtx = targetCanvas.getContext('2d');

      const spacing = parseInt(spacingInput ? spacingInput.value : 12, 10) || 12;
      const bgColor = colorInput ? colorInput.value : '#18181b';
      const layout = layoutSelect ? layoutSelect.value : 'auto';

      targetCtx.fillStyle = bgColor;
      targetCtx.fillRect(0, 0, targetW, targetH);

      const n = loadedImages.length;

      if (n === 1) {
        drawCover(targetCtx, loadedImages[0].img, spacing, spacing, targetW - spacing * 2, targetH - spacing * 2);
      } else if (n === 2) {
        if (layout === 'stacked') {
          const h = (targetH - spacing * 3) / 2;
          drawCover(targetCtx, loadedImages[0].img, spacing, spacing, targetW - spacing * 2, h);
          drawCover(targetCtx, loadedImages[1].img, spacing, spacing * 2 + h, targetW - spacing * 2, h);
        } else {
          // Side-by-side
          const w = (targetW - spacing * 3) / 2;
          drawCover(targetCtx, loadedImages[0].img, spacing, spacing, w, targetH - spacing * 2);
          drawCover(targetCtx, loadedImages[1].img, spacing * 2 + w, spacing, w, targetH - spacing * 2);
        }
      } else if (n === 3) {
        // 1 big left + 2 stacked right
        const w1 = (targetW - spacing * 3) * 0.55;
        const w2 = (targetW - spacing * 3) * 0.45;
        const hRight = (targetH - spacing * 3) / 2;

        drawCover(targetCtx, loadedImages[0].img, spacing, spacing, w1, targetH - spacing * 2);
        drawCover(targetCtx, loadedImages[1].img, spacing * 2 + w1, spacing, w2, hRight);
        drawCover(targetCtx, loadedImages[2].img, spacing * 2 + w1, spacing * 2 + hRight, w2, hRight);
      } else if (n >= 4) {
        // 2x2 grid
        const w = (targetW - spacing * 3) / 2;
        const h = (targetH - spacing * 3) / 2;

        drawCover(targetCtx, loadedImages[0].img, spacing, spacing, w, h);
        drawCover(targetCtx, loadedImages[1].img, spacing * 2 + w, spacing, w, h);
        drawCover(targetCtx, loadedImages[2].img, spacing, spacing * 2 + h, w, h);
        drawCover(targetCtx, loadedImages[3].img, spacing * 2 + w, spacing * 2 + h, w, h);
      }
    }

    if (spacingInput) {
      spacingInput.addEventListener('input', () => {
        if (spacingVal) spacingVal.textContent = spacingInput.value + 'px';
        render();
      });
    }

    if (colorInput) colorInput.addEventListener('input', () => render());
    if (layoutSelect) layoutSelect.addEventListener('change', () => render());

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        loadedImages.forEach(i => URL.revokeObjectURL(i.url));
        loadedImages = [];
        updateThumbs();
        if (workspace) workspace.style.display = 'none';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (loadedImages.length === 0) return;
        const exportCanvas = document.createElement('canvas');
        render(exportCanvas);

        exportCanvas.toBlob(blob => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'photo-collage.jpg';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 1000);
        }, 'image/jpeg', 0.94);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
