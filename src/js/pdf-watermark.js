// pdf-watermark.js - Pure client-side PDF Watermarking with pdf-lib
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

  function init() {
    const fileInput = document.getElementById('wmPdfFile');
    const dropZone = document.getElementById('wmPdfDrop');
    const workspace = document.getElementById('wmPdfWorkspace');

    const textInput = document.getElementById('wmPdfText');
    const sizeInput = document.getElementById('wmPdfSize');
    const sizeVal = document.getElementById('wmPdfSizeVal');
    const opacityInput = document.getElementById('wmPdfOpacity');
    const opacityVal = document.getElementById('wmPdfOpacityVal');
    const colorInput = document.getElementById('wmPdfColor');
    const angleSelect = document.getElementById('wmPdfAngle');
    const applyBtn = document.getElementById('wmPdfApplyBtn');
    const fileInfo = document.getElementById('wmPdfFileInfo');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput) return;

    let originalBuffer = null;
    let fileName = 'watermarked-document.pdf';

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      fileName = file.name.replace(/\.pdf$/i, '') + '-watermarked.pdf';
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

    if (sizeInput) {
      sizeInput.addEventListener('input', () => {
        if (sizeVal) sizeVal.textContent = sizeInput.value + 'pt';
      });
    }

    if (opacityInput) {
      opacityInput.addEventListener('input', () => {
        if (opacityVal) opacityVal.textContent = opacityInput.value + '%';
      });
    }

    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        if (!originalBuffer) return;
        applyBtn.disabled = true;
        applyBtn.textContent = 'Applying Watermarks…';

        try {
          const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const font = await doc.embedFont(window.PDFLib.StandardFonts.HelveticaBold);
          const totalPages = doc.getPageCount();

          const text = textInput ? textInput.value || 'CONFIDENTIAL' : 'CONFIDENTIAL';
          const fontSize = parseInt(sizeInput ? sizeInput.value : 50, 10) || 50;
          const opacity = (parseInt(opacityInput ? opacityInput.value : 35, 10) || 35) / 100;
          const hex = colorInput ? colorInput.value : '#ef4444';
          const rgb = hexToRgb(hex);
          const angleDeg = parseInt(angleSelect ? angleSelect.value : 45, 10) || 45;

          for (let i = 0; i < totalPages; i++) {
            const page = doc.getPage(i);
            const { width, height } = page.getSize();
            const textWidth = font.widthOfTextAtSize(text, fontSize);
            const textHeight = font.heightAtSize(fontSize);

            // Center of page
            const centerX = width / 2;
            const centerY = height / 2;

            page.drawText(text, {
              x: centerX - (textWidth / 2) * Math.cos((angleDeg * Math.PI) / 180),
              y: centerY - (textWidth / 2) * Math.sin((angleDeg * Math.PI) / 180),
              size: fontSize,
              font,
              color: window.PDFLib.rgb(rgb.r, rgb.g, rgb.b),
              opacity,
              rotate: window.PDFLib.degrees(angleDeg)
            });
          }

          const pdfBytes = await doc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Watermarked PDF (${(pdfBytes.byteLength / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }
          if (downloadSection) {
            downloadSection.hidden = false;
            downloadSection.scrollIntoView({ behavior: 'smooth' });
          }
          if (window.TK && TK.toast) TK.toast('Watermark applied successfully!');
        } catch (err) {
          if (window.TK && TK.toast) TK.toast('Failed to apply watermark: ' + err.message, 'error');
        } finally {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Apply Watermark & Download';
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
