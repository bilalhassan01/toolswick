// pdf-page-numbers.js - Pure client-side PDF Page Numbering with pdf-lib
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('numFile');
    const dropZone = document.getElementById('numDrop');
    const workspace = document.getElementById('numWorkspace');

    const formatSelect = document.getElementById('numFormat');
    const posSelect = document.getElementById('numPos');
    const startInput = document.getElementById('numStart');
    const sizeInput = document.getElementById('numSize');
    const marginInput = document.getElementById('numMargin');
    const colorInput = document.getElementById('numColor');
    const applyBtn = document.getElementById('numApplyBtn');
    const fileInfo = document.getElementById('numFileInfo');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput) return;

    let originalBuffer = null;
    let fileName = 'numbered-document.pdf';

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      fileName = file.name.replace(/\.pdf$/i, '') + '-numbered.pdf';
      try {
        originalBuffer = await file.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
        const count = doc.getPageCount();

        if (fileInfo) {
          fileInfo.textContent = `${file.name} · ${count} pages · ${(file.size / 1024).toFixed(1)} KB`;
        }

        if (workspace) workspace.style.display = 'block';
        if (dropZone) dropZone.style.display = 'none';
        if (downloadSection) downloadSection.hidden = true;
      } catch (e) {
        if (window.TK && TK.toast) TK.toast('Failed to load PDF. It may be encrypted or corrupted.', 'error');
      }
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

    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        if (!originalBuffer) return;
        applyBtn.disabled = true;
        applyBtn.textContent = 'Numbering Pages…';

        try {
          const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const font = await doc.embedFont(window.PDFLib.StandardFonts.Helvetica);
          const totalPages = doc.getPageCount();

          const format = formatSelect ? formatSelect.value : 'page-of';
          const pos = posSelect ? posSelect.value : 'bottom-center';
          const startNum = parseInt(startInput ? startInput.value : 1, 10) || 1;
          const fontSize = parseInt(sizeInput ? sizeInput.value : 10, 10) || 10;
          const margin = parseInt(marginInput ? marginInput.value : 30, 10) || 30;

          let r = 0.2, g = 0.2, b = 0.2;
          if (colorInput && colorInput.value) {
            const hex = colorInput.value.replace('#', '');
            if (hex.length === 6) {
              r = parseInt(hex.substring(0, 2), 16) / 255;
              g = parseInt(hex.substring(2, 4), 16) / 255;
              b = parseInt(hex.substring(4, 6), 16) / 255;
            }
          }

          for (let i = 0; i < totalPages; i++) {
            const page = doc.getPage(i);
            const { width, height } = page.getSize();
            const currentNum = startNum + i;

            let text = `${currentNum}`;
            if (format === 'page-of') {
              text = `Page ${currentNum} of ${startNum + totalPages - 1}`;
            } else if (format === 'page-n') {
              text = `Page ${currentNum}`;
            }

            const textWidth = font.widthOfTextAtSize(text, fontSize);

            let x = (width - textWidth) / 2;
            let y = margin;

            if (pos === 'bottom-left') {
              x = margin;
              y = margin;
            } else if (pos === 'bottom-right') {
              x = width - textWidth - margin;
              y = margin;
            } else if (pos === 'top-center') {
              x = (width - textWidth) / 2;
              y = height - margin - fontSize;
            } else if (pos === 'top-right') {
              x = width - textWidth - margin;
              y = height - margin - fontSize;
            } else if (pos === 'top-left') {
              x = margin;
              y = height - margin - fontSize;
            }

            page.drawText(text, {
              x,
              y,
              size: fontSize,
              font,
              color: window.PDFLib.rgb(r, g, b)
            });
          }

          const pdfBytes = await doc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Numbered PDF (${(pdfBytes.byteLength / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }
          if (downloadSection) {
            downloadSection.hidden = false;
            downloadSection.scrollIntoView({ behavior: 'smooth' });
          }
          if (window.TK && TK.toast) TK.toast('Page numbers applied successfully!');
        } catch (err) {
          if (window.TK && TK.toast) TK.toast('Failed to apply page numbers: ' + err.message, 'error');
        } finally {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Apply Page Numbers';
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
