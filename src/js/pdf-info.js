// pdf-info.js - Pure client-side PDF Metadata & Specs Inspector with pdf-lib
(function () {
  'use strict';

  function identifyPaperSize(wPt, hPt) {
    const sw = Math.min(wPt, hPt);
    const sh = Math.max(wPt, hPt);

    if (Math.abs(sw - 595.28) < 4 && Math.abs(sh - 841.89) < 4) return 'ISO A4 (210 × 297 mm)';
    if (Math.abs(sw - 612.0) < 4 && Math.abs(sh - 792.0) < 4) return 'US Letter (8.5 × 11 in)';
    if (Math.abs(sw - 612.0) < 4 && Math.abs(sh - 1008.0) < 4) return 'US Legal (8.5 × 14 in)';
    if (Math.abs(sw - 841.89) < 4 && Math.abs(sh - 1190.55) < 4) return 'ISO A3 (297 × 420 mm)';
    if (Math.abs(sw - 419.53) < 4 && Math.abs(sh - 595.28) < 4) return 'ISO A5 (148 × 210 mm)';
    return 'Custom Dimensions';
  }

  function init() {
    const fileInput = document.getElementById('infoPdfFile');
    const dropZone = document.getElementById('infoPdfDrop');
    const tableBody = document.getElementById('infoPdfTable');
    const resultBox = document.getElementById('infoPdfResult');
    const copyBtn = document.getElementById('infoPdfCopyBtn');
    const jsonBtn = document.getElementById('infoPdfJsonBtn');
    const fileNameEl = document.getElementById('infoPdfFileName');

    if (!fileInput) return;
    let extractedData = null;

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      try {
        const buf = await file.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
        const count = doc.getPageCount();

        let wPt = 0, hPt = 0;
        if (count > 0) {
          const firstPage = doc.getPage(0);
          const size = firstPage.getSize();
          wPt = size.width;
          hPt = size.height;
        }

        const wMm = (wPt * 0.352778).toFixed(1);
        const hMm = (hPt * 0.352778).toFixed(1);
        const paper = identifyPaperSize(wPt, hPt);

        // Detect PDF version from first 10 bytes
        const headerSlice = new Uint8Array(buf.slice(0, 15));
        let versionStr = '1.7';
        let rawHeader = String.fromCharCode.apply(null, headerSlice);
        const match = rawHeader.match(/%PDF-(\d\.\d)/);
        if (match) versionStr = match[1];

        extractedData = {
          fileName: file.name,
          fileSize: `${(file.size / 1024).toFixed(1)} KB (${file.size.toLocaleString()} bytes)`,
          pageCount: count,
          pdfVersion: `PDF ${versionStr}`,
          title: doc.getTitle() || 'None specified',
          author: doc.getAuthor() || 'None specified',
          subject: doc.getSubject() || 'None specified',
          creator: doc.getCreator() || 'None specified',
          producer: doc.getProducer() || 'None specified',
          creationDate: doc.getCreationDate() ? doc.getCreationDate().toLocaleString() : 'Not recorded',
          modDate: doc.getModificationDate() ? doc.getModificationDate().toLocaleString() : 'Not recorded',
          paperSize: paper,
          dimensions: `${wPt.toFixed(1)} × ${hPt.toFixed(1)} pt (${wMm} × ${hMm} mm)`
        };

        if (fileNameEl) fileNameEl.textContent = file.name;
        renderTable(extractedData);
        if (resultBox) resultBox.style.display = 'block';
      } catch (e) {
        if (window.TK && TK.toast) TK.toast('Failed to inspect PDF: ' + e.message, 'error');
      }
    }

    function renderTable(data) {
      if (!tableBody) return;
      const rows = [
        { label: 'File Name', val: data.fileName },
        { label: 'File Size', val: data.fileSize },
        { label: 'Total Page Count', val: `${data.pageCount} ${data.pageCount === 1 ? 'page' : 'pages'}` },
        { label: 'PDF Specification Version', val: data.pdfVersion },
        { label: 'Document Title', val: data.title },
        { label: 'Document Author', val: data.author },
        { label: 'Subject', val: data.subject },
        { label: 'Application Creator', val: data.creator },
        { label: 'PDF Producer', val: data.producer },
        { label: 'Creation Date', val: data.creationDate },
        { label: 'Standard Paper Size', val: data.paperSize },
        { label: 'Page 1 Dimensions', val: data.dimensions }
      ];

      tableBody.innerHTML = rows.map(r => `
        <tr style="border-bottom:1px solid var(--border,#333);">
          <td style="padding:8px 10px;font-weight:600;color:var(--muted,#aaa);width:200px;">${r.label}</td>
          <td style="padding:8px 10px;font-family:monospace;font-size:0.95rem;">${r.val}</td>
        </tr>
      `).join('');
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

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!extractedData) return;
        let str = 'PDF Specifications:\n';
        for (const [k, v] of Object.entries(extractedData)) {
          str += `${k}: ${v}\n`;
        }
        navigator.clipboard.writeText(str).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (jsonBtn) {
      jsonBtn.addEventListener('click', () => {
        if (!extractedData) return;
        const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pdf-metadata.json';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
