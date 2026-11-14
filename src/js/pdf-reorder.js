// pdf-reorder.js - Pure client-side PDF Page Reordering & Organizing with pdf-lib
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('reorderFile');
    const dropZone = document.getElementById('reorderDrop');
    const workspace = document.getElementById('reorderWorkspace');
    const grid = document.getElementById('reorderGrid');
    const addBlankBtn = document.getElementById('reorderAddBlank');
    const reverseBtn = document.getElementById('reorderReverse');
    const resetBtn = document.getElementById('reorderReset');
    const saveBtn = document.getElementById('reorderSaveBtn');
    const fileInfo = document.getElementById('reorderFileInfo');
    const downloadSection = document.getElementById('downloadSection');
    const downloadLink = document.getElementById('downloadLink');

    if (!fileInput) return;

    let originalBuffer = null;
    let fileName = 'document.pdf';
    let pagesOrder = []; // array of items: { type: 'orig', origIdx: 0 } or { type: 'blank' }

    async function handleFile(file) {
      if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
        if (window.TK && TK.toast) TK.toast('Please select a valid PDF file.', 'error');
        return;
      }
      fileName = file.name.replace(/\.pdf$/i, '') + '-reordered.pdf';
      try {
        originalBuffer = await file.arrayBuffer();
        const doc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
        const count = doc.getPageCount();

        pagesOrder = [];
        for (let i = 0; i < count; i++) {
          pagesOrder.push({ type: 'orig', origIdx: i });
        }

        if (fileInfo) {
          fileInfo.textContent = `${file.name} · ${count} pages · ${(file.size / 1024).toFixed(1)} KB`;
        }

        renderGrid();
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

    function renderGrid() {
      if (!grid) return;
      grid.innerHTML = '';

      pagesOrder.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'card-box';
        card.style.cssText = 'padding:10px;text-align:center;background:var(--surface,#18181b);border:1px solid var(--border,#333);border-radius:8px;position:relative;';

        const label = item.type === 'blank' ? 'Blank Page' : `Original Page ${item.origIdx + 1}`;
        const visualBg = item.type === 'blank' ? 'background:rgba(255,255,255,0.05);' : 'background:rgba(13,148,136,0.15);';

        card.innerHTML = `
          <div style="width:100%;height:100px;border-radius:6px;${visualBg}display:flex;align-items:center;justify-content:center;margin-bottom:8px;border:1px dashed var(--border,#444);">
            <strong style="font-size:1.5rem;color:var(--text);">${index + 1}</strong>
          </div>
          <div style="font-size:0.8rem;color:var(--muted,#aaa);margin-bottom:8px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${label}</div>
          <div style="display:flex;gap:4px;justify-content:center;flex-wrap:wrap;">
            <button type="button" class="btn ghost small move-left-btn" ${index === 0 ? 'disabled' : ''} style="padding:2px 8px;font-size:11px;" title="Move earlier">◀</button>
            <button type="button" class="btn ghost small move-right-btn" ${index === pagesOrder.length - 1 ? 'disabled' : ''} style="padding:2px 8px;font-size:11px;" title="Move later">▶</button>
            <button type="button" class="btn ghost small dup-btn" style="padding:2px 6px;font-size:11px;" title="Duplicate page">⎘</button>
            <button type="button" class="btn ghost small del-btn" style="padding:2px 6px;font-size:11px;color:#f87171;" title="Remove page">&times;</button>
          </div>
        `;

        card.querySelector('.move-left-btn').addEventListener('click', () => {
          if (index > 0) {
            const temp = pagesOrder[index];
            pagesOrder[index] = pagesOrder[index - 1];
            pagesOrder[index - 1] = temp;
            renderGrid();
          }
        });

        card.querySelector('.move-right-btn').addEventListener('click', () => {
          if (index < pagesOrder.length - 1) {
            const temp = pagesOrder[index];
            pagesOrder[index] = pagesOrder[index + 1];
            pagesOrder[index + 1] = temp;
            renderGrid();
          }
        });

        card.querySelector('.dup-btn').addEventListener('click', () => {
          pagesOrder.splice(index + 1, 0, Object.assign({}, item));
          renderGrid();
        });

        card.querySelector('.del-btn').addEventListener('click', () => {
          if (pagesOrder.length > 1) {
            pagesOrder.splice(index, 1);
            renderGrid();
          } else {
            if (window.TK && TK.toast) TK.toast('A PDF document must have at least one page.', 'error');
          }
        });

        grid.appendChild(card);
      });
    }

    if (addBlankBtn) {
      addBlankBtn.addEventListener('click', () => {
        pagesOrder.push({ type: 'blank' });
        renderGrid();
      });
    }

    if (reverseBtn) {
      reverseBtn.addEventListener('click', () => {
        pagesOrder.reverse();
        renderGrid();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (!originalBuffer) return;
        window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true }).then(doc => {
          const count = doc.getPageCount();
          pagesOrder = [];
          for (let i = 0; i < count; i++) {
            pagesOrder.push({ type: 'orig', origIdx: i });
          }
          renderGrid();
        });
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', async () => {
        if (!originalBuffer || pagesOrder.length === 0) return;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Organizing PDF…';

        try {
          const srcDoc = await window.PDFLib.PDFDocument.load(originalBuffer, { ignoreEncryption: true });
          const newDoc = await window.PDFLib.PDFDocument.create();

          for (const item of pagesOrder) {
            if (item.type === 'orig') {
              const [copiedPage] = await newDoc.copyPages(srcDoc, [item.origIdx]);
              newDoc.addPage(copiedPage);
            } else {
              // Add standard A4 blank page (595.28 x 841.89 points)
              newDoc.addPage([595.28, 841.89]);
            }
          }

          const pdfBytes = await newDoc.save();
          const blob = new Blob([pdfBytes], { type: 'application/pdf' });
          const url = URL.createObjectURL(blob);

          if (downloadLink) {
            downloadLink.href = url;
            downloadLink.download = fileName;
            downloadLink.className = 'btn btn-primary';
            downloadLink.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Reordered PDF (${(pdfBytes.byteLength / 1024).toFixed(1)} KB)`;
            downloadLink.click();
          }
          if (downloadSection) {
            downloadSection.hidden = true;
          }
          if (window.TK && TK.toast) TK.toast('PDF reordered successfully!');
        } catch (err) {
          if (window.TK && TK.toast) TK.toast('Failed to reorder PDF: ' + err.message, 'error');
        } finally {
          saveBtn.disabled = false;
          saveBtn.textContent = 'Save & Download PDF';
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
