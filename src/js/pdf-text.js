// pdf-text.js - Pure client-side Add Text to PDF with pdf-lib
(function () {
  'use strict';

  function hexToRgb(hex) {
    const c = hex.replace('#', '');
    const num = parseInt(c, 16);
    return {
      r: ((num >> 16) & 255) / 255,
      g: ((num >> 8) & 255) / 255,
      b: (num & 255) / 255
    };
  }

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
    const fileInput = document.getElementById('pdfTextFile');
    const dropZone = document.getElementById('pdfTextDrop');
    const workspace = document.getElementById('pdfTextWorkspace');
    const fileInfo = document.getElementById('pdfTextFileInfo');

    const textInput = document.getElementById('pdfTextInput');
    const posSelect = document.getElementById('pdfTextPosition');
    const fontSelect = document.getElementById('pdfTextFont');
    const sizeInput = document.getElementById('pdfTextSize');
    const colorInput = document.getElementById('pdfTextColor');
    const pagesSelect = document.getElementById('pdfTextPages');
    const customPagesBox = document.getElementById('pdfTextCustomPagesBox');
    const customPagesInput = document.getElementById('pdfTextCustomPages');
    const marginInput = document.getElementById('pdfTextMargin');
    const applyBtn = document.getElementById('pdfTextApplyBtn');

    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput) return;

    let originalBuffer = null;
    let fileName = 'annotated-document.pdf';
    let totalPdfPages = 0;

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      fileName = file.name.replace(/\.pdf$/i, '') + '-annotated.pdf';
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
        const text = (textInput ? textInput.value : '').trim();
        if (!text) {
          if (window.TK && TK.toast) TK.toast('Please enter text to add.', 'warning');
          return;
        }

        applyBtn.disabled = true;
        applyBtn.textContent = 'Processing PDF…';

        try {
          const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const totalPages = doc.getPageCount();

          // Font selection
          let fontChoice = window.PDFLib.StandardFonts.Helvetica;
          const fontVal = fontSelect ? fontSelect.value : 'Helvetica';
          if (fontVal === 'HelveticaBold') fontChoice = window.PDFLib.StandardFonts.HelveticaBold;
          else if (fontVal === 'TimesRoman') fontChoice = window.PDFLib.StandardFonts.TimesRoman;
          else if (fontVal === 'TimesRomanBold') fontChoice = window.PDFLib.StandardFonts.TimesRomanBold;
          else if (fontVal === 'Courier') fontChoice = window.PDFLib.StandardFonts.Courier;
          else if (fontVal === 'CourierBold') fontChoice = window.PDFLib.StandardFonts.CourierBold;

          const font = await doc.embedFont(fontChoice);
          const fontSize = parseFloat(sizeInput ? sizeInput.value : 12) || 12;
          const margin = parseFloat(marginInput ? marginInput.value : 36) || 36;
          const pos = posSelect ? posSelect.value : 'header-center';
          const rgb = hexToRgb(colorInput ? colorInput.value : '#000000');
          const pdfRgb = window.PDFLib.rgb(rgb.r, rgb.g, rgb.b);

          // Target pages
          let targetPages = [];
          const scope = pagesSelect ? pagesSelect.value : 'all';
          if (scope === 'first') {
            targetPages = [0];
          } else if (scope === 'last') {
            targetPages = [totalPages - 1];
          } else if (scope === 'custom') {
            targetPages = parsePageRange(customPagesInput ? customPagesInput.value : '', totalPages);
          } else {
            targetPages = Array.from({ length: totalPages }, (_, i) => i);
          }

          if (targetPages.length === 0) {
            targetPages = Array.from({ length: totalPages }, (_, i) => i);
          }

          const textWidth = font.widthOfTextAtSize(text, fontSize);
          const textHeight = font.heightAtSize(fontSize);

          for (const pageIdx of targetPages) {
            if (pageIdx < 0 || pageIdx >= totalPages) continue;
            const page = doc.getPage(pageIdx);
            const { width, height } = page.getSize();

            let x = margin;
            let y = margin;

            switch (pos) {
              case 'header-left':
                x = margin;
                y = height - margin - textHeight;
                break;
              case 'header-center':
                x = Math.max(margin, (width - textWidth) / 2);
                y = height - margin - textHeight;
                break;
              case 'header-right':
                x = Math.max(margin, width - margin - textWidth);
                y = height - margin - textHeight;
                break;
              case 'footer-left':
                x = margin;
                y = margin;
                break;
              case 'footer-center':
                x = Math.max(margin, (width - textWidth) / 2);
                y = margin;
                break;
              case 'footer-right':
                x = Math.max(margin, width - margin - textWidth);
                y = margin;
                break;
              case 'center':
                x = Math.max(margin, (width - textWidth) / 2);
                y = (height - textHeight) / 2;
                break;
            }

            page.drawText(text, {
              x: x,
              y: y,
              size: fontSize,
              font: font,
              color: pdfRgb
            });
          }

          const pdfBytes = await doc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Annotated PDF (${(blob.size / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }

          if (downloadSection) downloadSection.hidden = false;
          if (window.TK && TK.toast) TK.toast('Text added to PDF successfully!', 'success');
        } catch (err) {
          console.error(err);
          if (window.TK && TK.toast) TK.toast('Failed to modify PDF: ' + err.message, 'error');
        } finally {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Add Text to PDF';
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
