// merge-images.js - Client-Side Image Combiner & Photo Stitcher (Vertical & Horizontal)
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('mergeImgFile');
    const dropZone = document.getElementById('mergeImgDrop');
    const workspace = document.getElementById('mergeImgWorkspace');
    const directionSel = document.getElementById('mergeImgDirection');
    const spacingInp = document.getElementById('mergeImgSpacing');
    const bgSel = document.getElementById('mergeImgBg');
    const processBtn = document.getElementById('mergeImgProcessBtn');
    const canvas = document.getElementById('mergeImgCanvas');
    const downloadBtn = document.getElementById('mergeImgDownloadBtn');
    const statusText = document.getElementById('mergeImgStatus');

    if (!fileInp || !dropZone || !canvas) return;

    let loadedImages = [];

    async function handleFiles(files) {
      const imgFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (imgFiles.length < 2) {
        if (statusText) statusText.textContent = 'Please select at least 2 images to combine.';
        return;
      }

      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';
      if (statusText) statusText.textContent = `Loading ${imgFiles.length} images...`;

      loadedImages = [];
      for (const f of imgFiles) {
        const img = new Image();
        const url = URL.createObjectURL(f);
        await new Promise(r => {
          img.onload = () => { URL.revokeObjectURL(url); r(); };
          img.src = url;
        });
        loadedImages.push(img);
      }

      renderMerge();
    }

    function renderMerge() {
      if (loadedImages.length < 2) return;
      const isVertical = directionSel ? directionSel.value === 'vertical' : true;
      const spacing = parseInt(spacingInp ? spacingInp.value : 10, 10) || 0;
      const bg = bgSel ? bgSel.value : '#ffffff';

      let totalW = 0;
      let totalH = 0;

      if (isVertical) {
        totalW = Math.max(...loadedImages.map(img => img.naturalWidth || img.width));
        totalH = loadedImages.reduce((sum, img) => sum + (img.naturalHeight || img.height), 0) + spacing * (loadedImages.length - 1);
      } else {
        totalW = loadedImages.reduce((sum, img) => sum + (img.naturalWidth || img.width), 0) + spacing * (loadedImages.length - 1);
        totalH = Math.max(...loadedImages.map(img => img.naturalHeight || img.height));
      }

      canvas.width = totalW;
      canvas.height = totalH;
      const ctx = canvas.getContext('2d');

      if (bg !== 'transparent') {
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, totalW, totalH);
      } else {
        ctx.clearRect(0, 0, totalW, totalH);
      }

      let currentX = 0;
      let currentY = 0;

      loadedImages.forEach(img => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        if (isVertical) {
          // Center horizontally
          const offsetX = Math.round((totalW - w) / 2);
          ctx.drawImage(img, offsetX, currentY);
          currentY += h + spacing;
        } else {
          // Center vertically
          const offsetY = Math.round((totalH - h) / 2);
          ctx.drawImage(img, currentX, offsetY);
          currentX += w + spacing;
        }
      });

      if (statusText) statusText.textContent = `✓ Combined ${loadedImages.length} images into ${totalW} × ${totalH} px canvas!`;
      if (downloadBtn) downloadBtn.style.display = 'inline-block';
    }

    fileInp.addEventListener('change', e => {
      if (e.target.files && e.target.files.length) handleFiles(e.target.files);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    });
    dropZone.addEventListener('click', () => fileInp.click());

    if (directionSel) directionSel.addEventListener('change', renderMerge);
    if (spacingInp) spacingInp.addEventListener('input', renderMerge);
    if (bgSel) bgSel.addEventListener('change', renderMerge);
    if (processBtn) processBtn.addEventListener('click', renderMerge);

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        canvas.toBlob(blob => {
          if (!blob) return;
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `merged-images-${Date.now()}.png`;
          a.click();
        }, 'image/png');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
