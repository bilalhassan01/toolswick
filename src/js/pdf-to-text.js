// pdf-to-text.js - Client-Side PDF Text Extraction
(function () {
  'use strict';

  function init() {
    const fileInput = document.getElementById('pdfToTextInput');
    const dropZone = document.getElementById('pdfToTextDrop');
    const workspace = document.getElementById('pdfToTextWorkspace');
    const textArea = document.getElementById('pdfExtractedText');
    const statusText = document.getElementById('pdfToTextStatus');
    const wordCountEl = document.getElementById('pdfTextWordCount');
    const charCountEl = document.getElementById('pdfTextCharCount');
    const pageCountEl = document.getElementById('pdfTextPageCount');
    const copyBtn = document.getElementById('pdfTextCopyBtn');
    const downloadBtn = document.getElementById('pdfTextDownloadBtn');
    const resetBtn = document.getElementById('pdfTextResetBtn');

    if (!fileInput || !dropZone) return;

    let currentFileName = 'extracted-text.txt';

    function cleanPdfString(raw) {
      return raw
        .replace(/\\([0-7]{1,3})/g, (match, oct) => String.fromCharCode(parseInt(oct, 8)))
        .replace(/\\r/g, '\r')
        .replace(/\\n/g, '\n')
        .replace(/\\t/g, '\t')
        .replace(/\\f/g, '\f')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .replace(/\\\\/g, '\\')
        .replace(/\\/g, '');
    }

    function extractTextFromStream(streamStr) {
      const textPieces = [];
      // Match BT (begin text) ... ET (end text) blocks
      const btRegex = /BT\s([\s\S]*?)\sET/g;
      let btMatch;

      while ((btMatch = btRegex.exec(streamStr)) !== null) {
        const block = btMatch[1];

        // Match individual (Text) Tj or ' or "
        const tjRegex = /\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|'|")/g;
        let tjMatch;
        while ((tjMatch = tjRegex.exec(block)) !== null) {
          const cleaned = cleanPdfString(tjMatch[1]);
          if (cleaned.trim()) textPieces.push(cleaned);
        }

        // Match array formatted [(T) 10 (e) 15 (xt)] TJ
        const arrayRegex = /\[((?:[^\[\]\\]|\\.)*)\]\s*TJ/g;
        let arrMatch;
        while ((arrMatch = arrayRegex.exec(block)) !== null) {
          const inner = arrMatch[1];
          const partRegex = /\(((?:[^()\\]|\\.)*)\)/g;
          let partMatch;
          let combined = '';
          while ((partMatch = partRegex.exec(inner)) !== null) {
            combined += cleanPdfString(partMatch[1]);
          }
          if (combined.trim()) textPieces.push(combined);
        }
      }

      // If BT/ET parsing yielded nothing, fallback to extracting parenthesized ASCII strings
      if (textPieces.length === 0) {
        const fallbackRegex = /\(([A-Za-z0-9 .,;:!?'"/\-+=_@#$%&*()]{3,})\)/g;
        let fbMatch;
        while ((fbMatch = fallbackRegex.exec(streamStr)) !== null) {
          textPieces.push(cleanPdfString(fbMatch[1]));
        }
      }

      return textPieces.join(' ').replace(/\s+/g, ' ').trim();
    }

    async function processPdf(file) {
      if (!file) return;
      currentFileName = file.name.replace(/\.[^/.]+$/, '') + '.txt';

      if (statusText) statusText.textContent = 'Parsing PDF document...';
      if (dropZone) dropZone.style.display = 'none';
      if (workspace) workspace.style.display = 'block';

      try {
        const arrayBuffer = await file.arrayBuffer();
        if (!window.PDFLib || !window.PDFLib.PDFDocument) {
          throw new Error('PDF library is loading. Please try again in a moment.');
        }

        const pdfDoc = await window.PDFLib.PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        const pages = pdfDoc.getPages();
        const totalPages = pages.length;

        let fullExtractedText = '';
        let totalWords = 0;

        for (let i = 0; i < totalPages; i++) {
          const page = pages[i];
          let pageText = '';

          try {
            // Read content streams of this page
            const contents = page.node.Contents();
            if (contents) {
              const streams = Array.isArray(contents) ? contents : [contents];
              for (const streamRef of streams) {
                const streamObj = pdfDoc.context.lookup(streamRef);
                if (streamObj && streamObj.contents) {
                  // Decode bytes to text
                  const decoder = new TextDecoder('latin1');
                  const decoded = decoder.decode(streamObj.contents);
                  const extracted = extractTextFromStream(decoded);
                  if (extracted) {
                    pageText += (pageText ? ' ' : '') + extracted;
                  }
                }
              }
            }
          } catch (pageErr) {
            console.warn('Could not parse stream for page ' + (i + 1), pageErr);
          }

          if (pageText.trim()) {
            fullExtractedText += `--- Page ${i + 1} ---\n${pageText.trim()}\n\n`;
          } else {
            fullExtractedText += `--- Page ${i + 1} ---\n[No selectable text found on this page. If this page is a scanned image, it requires OCR.]\n\n`;
          }
        }

        const finalText = fullExtractedText.trim();
        if (textArea) textArea.value = finalText;

        const words = finalText ? finalText.trim().split(/\s+/).filter(Boolean).length : 0;
        const chars = finalText.length;

        if (wordCountEl) wordCountEl.textContent = `${words.toLocaleString()} words`;
        if (charCountEl) charCountEl.textContent = `${chars.toLocaleString()} characters`;
        if (pageCountEl) pageCountEl.textContent = `${totalPages} pages processed`;
        if (statusText) statusText.textContent = `Successfully extracted text from ${totalPages} pages.`;
      } catch (err) {
        if (textArea) textArea.value = `Error extracting text: ${err.message}\n\nPlease verify that the file is a valid unencrypted PDF.`;
        if (statusText) statusText.textContent = 'Error processing file.';
      }
    }

    fileInput.addEventListener('change', e => {
      if (e.target.files && e.target.files[0]) processPdf(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', e => {
      e.preventDefault();
      dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

    dropZone.addEventListener('drop', e => {
      e.preventDefault();
      dropZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) processPdf(e.dataTransfer.files[0]);
    });

    dropZone.addEventListener('click', () => fileInput.click());

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        if (!textArea || !textArea.value) return;
        navigator.clipboard.writeText(textArea.value).then(() => {
          const old = copyBtn.textContent;
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = old), 1500);
        });
      });
    }

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (!textArea || !textArea.value) return;
        const blob = new Blob([textArea.value], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = currentFileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 1000);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (fileInput) fileInput.value = '';
        if (textArea) textArea.value = '';
        if (workspace) workspace.style.display = 'none';
        if (dropZone) dropZone.style.display = 'block';
        if (statusText) statusText.textContent = '';
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
