// pdf-crop.js - Pure client-side PDF Cropper with pdf-lib
(function () {
  'use strict';

  const MM_TO_PT = 72 / 25.4;

  function parsePageRange(rangeStr, totalPages) {
    if (!rangeStr || rangeStr.trim() === '') {
      return Array.from({ length: totalPages }, (_, i) => i);
    }
    const pages = new Set();
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [startStr, endStr] = trimmed.split('-');
        const start = parseInt(startStr, 10);
        const end = parseInt(endStr, 10);
        if (!isNaN(start) && !isNaN(end)) {
          for (let p = Math.max(1, start); p <= Math.min(totalPages, end); p++) {
            pages.add(p - 1);
          }
        }
      } else {
        const p = parseInt(trimmed, 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pages.add(p - 1);
        }
      }
    }
    return Array.from(pages).sort((a, b) => a - b);
  }

  function init() {
    const fileInput = document.getElementById('cropPdfFile');
    const dropZone = document.getElementById('cropPdfDrop');
    const workspace = document.getElementById('cropPdfWorkspace');
    const fileInfo = document.getElementById('cropPdfFileInfo');

    const topInput = document.getElementById('cropPdfTop');
    const bottomInput = document.getElementById('cropPdfBottom');
    const leftInput = document.getElementById('cropPdfLeft');
    const rightInput = document.getElementById('cropPdfRight');
    const unitSelect = document.getElementById('cropPdfUnit');
    const pagesSelect = document.getElementById('cropPdfPages');
    const customPagesBox = document.getElementById('cropPdfCustomPagesBox');
    const customPagesInput = document.getElementById('cropPdfCustomPages');
    const applyBtn = document.getElementById('cropPdfApplyBtn');

    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput) return;

    let originalBuffer = null;
    let fileName = 'cropped-document.pdf';
    let totalPdfPages = 0;

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      fileName = file.name.replace(/\.pdf$/i, '') + '-cropped.pdf';
      try {
        originalBuffer = await file.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
        totalPdfPages = doc.getPageCount();

        if (fileInfo) {
          fileInfo.textContent = `${file.name} · ${totalPdfPages} page${totalPdfPages > 1 ? 's' : ''} · ${(file.size / 1024).toFixed(1)} KB`;
        }

        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
        if (downloadSection) downloadSection.hidden = true;
      } catch (e) {
        if (window.TK && TK.toast) TK.toast('Failed to load PDF. It may be encrypted or corrupted.', 'error');
      }
    }

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

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

    if (pagesSelect && customPagesBox) {
      pagesSelect.addEventListener('change', () => {
        customPagesBox.style.display = pagesSelect.value === 'custom' ? 'block' : 'none';
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        if (!originalBuffer) return;

        const unit = unitSelect ? unitSelect.value : 'mm';
        const factor = unit === 'mm' ? MM_TO_PT : 1;

        const topVal = (parseFloat(topInput ? topInput.value : 0) || 0) * factor;
        const bottomVal = (parseFloat(bottomInput ? bottomInput.value : 0) || 0) * factor;
        const leftVal = (parseFloat(leftInput ? leftInput.value : 0) || 0) * factor;
        const rightVal = (parseFloat(rightInput ? rightInput.value : 0) || 0) * factor;

        if (topVal === 0 && bottomVal === 0 && leftVal === 0 && rightVal === 0) {
          if (window.TK && TK.toast) TK.toast('Please set at least one margin to crop.', 'warning');
          return;
        }

        applyBtn.disabled = true;
        applyBtn.textContent = 'Cropping PDF Pages…';

        try {
          const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const totalPages = doc.getPageCount();

          let targetPages = [];
          const scope = pagesSelect ? pagesSelect.value : 'all';
          if (scope === 'custom') {
            targetPages = parsePageRange(customPagesInput ? customPagesInput.value : '', totalPages);
          } else {
            targetPages = Array.from({ length: totalPages }, (_, i) => i);
          }

          if (targetPages.length === 0) {
            targetPages = Array.from({ length: totalPages }, (_, i) => i);
          }

          for (const pageIdx of targetPages) {
            if (pageIdx < 0 || pageIdx >= totalPages) continue;
            const page = doc.getPage(pageIdx);
            const box = page.getCropBox() || page.getMediaBox();

            const curX = box.x || 0;
            const curY = box.y || 0;
            const curW = box.width;
            const curH = box.height;

            const newX = curX + leftVal;
            const newY = curY + bottomVal;
            const newW = curW - leftVal - rightVal;
            const newH = curH - topVal - bottomVal;

            if (newW <= 20 || newH <= 20) {
              throw new Error(`Crop margins are too large for page ${pageIdx + 1} (${curW.toFixed(0)}x${curH.toFixed(0)}pt).`);
            }

            page.setCropBox(newX, newY, newW, newH);
            page.setMediaBox(newX, newY, newW, newH);
          }

          const pdfBytes = await doc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Cropped PDF (${(blob.size / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }

          if (downloadSection) downloadSection.hidden = false;
          if (window.TK && TK.toast) TK.toast('PDF cropped successfully!', 'success');
        } catch (err) {
          console.error(err);
          if (window.TK && TK.toast) TK.toast(err.message, 'error');
        } finally {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Crop PDF Pages';
        }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
