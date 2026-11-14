// batch-compress-images.js - Client-Side Batch Image Compressor with Target-Size Presets & ZIP Export
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('batchCompFile');
    const dropZone = document.getElementById('batchCompDrop');
    const workspace = document.getElementById('batchCompWorkspace');
    const targetKbInp = document.getElementById('batchCompTargetKb');
    const presetBtns = document.querySelectorAll('.comp-target-preset-btn');
    const maxDimInp = document.getElementById('batchCompMaxDim');
    const processBtn = document.getElementById('batchCompProcessBtn');
    const downloadZipBtn = document.getElementById('batchCompDownloadZipBtn');
    const statusText = document.getElementById('batchCompStatus');
    const fileListEl = document.getElementById('batchCompFileList');

    if (!fileInp || !dropZone) return;

    let selectedFiles = [];
    let processedBlobs = [];

    function handleFiles(files) {
      selectedFiles = Array.from(files).filter(f => f.type.startsWith('image/'));
      if (selectedFiles.length === 0) return;

      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';

      if (fileListEl) {
        fileListEl.innerHTML = selectedFiles.map((f, i) =>
          `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--border,#333);font-size:0.85rem;">
            <span>${i + 1}. ${f.name}</span>
            <span style="color:var(--muted);">${(f.size / 1024).toFixed(1)} KB</span>
          </div>`
        ).join('');
      }

      if (statusText) statusText.textContent = `${selectedFiles.length} images queued for compression.`;
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

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const kb = btn.getAttribute('data-kb');
        if (kb && targetKbInp) {
          targetKbInp.value = kb;
          presetBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        }
      });
    });

    async function compressIterative(file, targetKb, maxDim) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = async () => {
          URL.revokeObjectURL(url);
          let w = img.naturalWidth || img.width;
          let h = img.naturalHeight || img.height;

          if (maxDim && (w > maxDim || h > maxDim)) {
            if (w > h) {
              h = Math.round(h * (maxDim / w));
              w = maxDim;
            } else {
              w = Math.round(w * (maxDim / h));
              h = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);

          const targetBytes = targetKb * 1024;
          let minQ = 0.05;
          let maxQ = 0.95;
          let bestBlob = null;

          // Binary search for target quality
          for (let step = 0; step < 6; step++) {
            const midQ = (minQ + maxQ) / 2;
            const blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', midQ));
            if (!blob) break;
            bestBlob = blob;

            if (blob.size > targetBytes) {
              maxQ = midQ;
            } else {
              minQ = midQ;
            }
          }

          resolve(bestBlob || file);
        };
        img.src = url;
      });
    }

    async function processCompression() {
      if (selectedFiles.length === 0) return;
      processedBlobs = [];
      const targetKb = parseInt(targetKbInp ? targetKbInp.value : 100, 10) || 100;
      const maxDim = parseInt(maxDimInp ? maxDimInp.value : 1600, 10) || 1600;

      if (statusText) statusText.textContent = `Compressing images (0 / ${selectedFiles.length})...`;

      let totalBefore = 0;
      let totalAfter = 0;

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        totalBefore += file.size;
        const blob = await compressIterative(file, targetKb, maxDim);
        totalAfter += blob.size;
        const outName = file.name.replace(/\.[^/.]+$/, '') + '-compressed.jpg';
        processedBlobs.push({ name: outName, blob });
        if (statusText) statusText.textContent = `Compressing images (${i + 1} / ${selectedFiles.length})...`;
      }

      const savedPct = Math.round((1 - totalAfter / totalBefore) * 100);
      if (statusText) statusText.textContent = `✓ Compressed ${selectedFiles.length} images! Saved ${savedPct}% (Total: ${(totalAfter / 1024).toFixed(1)} KB)`;
      if (downloadZipBtn) downloadZipBtn.style.display = 'inline-block';
    }

    if (processBtn) processBtn.addEventListener('click', processCompression);

    if (downloadZipBtn) {
      downloadZipBtn.addEventListener('click', async () => {
        if (!window.JSZip || processedBlobs.length === 0) return;
        downloadZipBtn.textContent = 'Packaging ZIP...';
        const zip = new window.JSZip();
        processedBlobs.forEach(item => {
          zip.file(item.name, item.blob);
        });

        const zipBlob = await zip.generateAsync({ type: 'blob' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(zipBlob);
        a.download = `toolswick-compressed-images-${Date.now()}.zip`;
        a.click();
        downloadZipBtn.textContent = 'Download All as ZIP';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
