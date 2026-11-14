// pdf-duplicate.js - Client-Side PDF Page Duplicator
(function () {
  'use strict';

  function init() {
    const fileInp = document.getElementById('dupPdfFile');
    const dropZone = document.getElementById('dupPdfDrop');
    const workspace = document.getElementById('dupPdfWorkspace');
    const pageSel = document.getElementById('dupPdfPageSelect');
    const copiesInp = document.getElementById('dupPdfCopies');
    const applyBtn = document.getElementById('dupPdfApplyBtn');
    const statusText = document.getElementById('dupPdfStatus');
    const downloadSec = document.getElementById('dupPdfDownloadSection');
    const downloadLink = document.getElementById('dupPdfDownloadLink');

    if (!fileInp || !dropZone) return;

    let originalBuffer = null;
    let totalPdfPages = 0;
    let originalName = 'document.pdf';

    async function handleFile(file) {
      if (!file || file.type !== 'application/pdf') return;
      originalName = file.name;
      dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';
      if (statusText) statusText.textContent = 'Loading PDF pages...';

      try {
        originalBuffer = await file.arrayBuffer();
        if (!window.PDFLib || !window.PDFLib.PDFDocument) throw new Error('PDFLib loading');
        const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
        totalPdfPages = doc.getPageCount();

        if (pageSel) {
          pageSel.innerHTML = `
            <option value="all">Duplicate All Pages</option>
            ${Array.from({ length: totalPdfPages }, (_, i) => `<option value="${i}">Page ${i + 1}</option>`).join('')}
          `;
        }

        if (statusText) statusText.textContent = `PDF loaded with ${totalPdfPages} pages.`;
      } catch (e) {
        if (statusText) statusText.textContent = 'Error loading PDF: ' + e.message;
      }
    }

    fileInp.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('dragover'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });
    dropZone.addEventListener('click', () => fileInp.click());

    if (applyBtn) {
      applyBtn.addEventListener('click', async () => {
        if (!originalBuffer) return;
        applyBtn.disabled = true;
        applyBtn.textContent = 'Duplicating pages...';

        try {
          const srcDoc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const newDoc = await window.PDFLib.PDFDocument.create();

          const target = pageSel ? pageSel.value : 'all';
          const copies = Math.max(1, parseInt(copiesInp ? copiesInp.value : 1, 10) || 1);

          for (let i = 0; i < totalPdfPages; i++) {
            const [copiedPage] = await newDoc.copyPages(srcDoc, [i]);
            newDoc.addPage(copiedPage);

            // If this page should be duplicated
            if (target === 'all' || target === String(i)) {
              for (let c = 0; c < copies; c++) {
                const [extraPage] = await newDoc.copyPages(srcDoc, [i]);
                newDoc.addPage(extraPage);
              }
            }
          }

          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = originalName.replace(/\.[^/.]+$/, '') + '-duplicated.pdf';
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Duplicated PDF (${(pdfBytes.byteLength / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }
          if (downloadSec) downloadSec.hidden = false;
          if (statusText) statusText.textContent = `✓ Duplicated PDF generated successfully! New page count: ${newDoc.getPageCount()}`;
        } catch (err) {
          if (statusText) statusText.textContent = 'Error duplicating: ' + err.message;
        } finally {
          applyBtn.disabled = false;
          applyBtn.textContent = 'Duplicate Pages';
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
