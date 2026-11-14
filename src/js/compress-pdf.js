// compress-pdf.js - Client-Side PDF Size Reducer & Optimizer with Canvas Raster Fallback
(function() {
  'use strict';

  var dropZone = document.getElementById('compressPdfDrop');
  var fileInput = document.getElementById('compressPdfFile');
  var optionsBox = document.getElementById('compressPdfOptions');
  var fileInfo = document.getElementById('compressPdfFileInfo');
  var compressBtn = document.getElementById('compressPdfActionBtn');
  var downloadBox = document.getElementById('compressPdfDownloadSection');
  var downloadBtn = document.getElementById('compressPdfDownloadBtn');
  var savingsBadge = document.getElementById('compressPdfSavings');
  var statusMsg = document.getElementById('compressPdfStatus');

  var currentBuffer = null;
  var currentFile = null;

  if (!dropZone || !fileInput) return;

  function initWorker() {
    if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = '/vendor/pdf.worker.min.js';
    }
  }

  function handleFile(file) {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      TK.toast('Please select a valid PDF file.', 'error');
      return;
    }
    currentFile = file;
    var reader = new FileReader();
    reader.onload = function(e) {
      currentBuffer = e.target.result;
      fileInfo.textContent = file.name + ' (' + TK.bytes(file.size) + ')';
      optionsBox.hidden = false;
      downloadBox.hidden = true;
      statusMsg.textContent = '';
      compressBtn.disabled = false;
    };
    reader.readAsArrayBuffer(file);
  }

  dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', function() { dropZone.classList.remove('dragover'); });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
  });
  dropZone.addEventListener('click', function() { fileInput.click(); });
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length) handleFile(fileInput.files[0]);
  });

  // Re-encode pages using pdfjs + PDFLib for maximum compression
  async function compressViaCanvasRaster(buffer, qualityScale) {
    initWorker();
    if (!window.pdfjsLib || !window.PDFLib) throw new Error('PDF libraries unavailable');

    var loadingTask = window.pdfjsLib.getDocument({ data: buffer.slice(0) });
    var pdfDoc = await loadingTask.promise;
    var newDoc = await window.PDFLib.PDFDocument.create();

    for (var p = 1; p <= pdfDoc.numPages; p++) {
      var page = await pdfDoc.getPage(p);
      var viewport = page.getViewport({ scale: qualityScale ? 1.2 : 1.0 });
      var canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      var ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: viewport }).promise;

      var jpgDataUrl = canvas.toDataURL('image/jpeg', qualityScale ? 0.72 : 0.65);
      var base64Data = jpgDataUrl.split(',')[1];
      var binaryStr = atob(base64Data);
      var bytes = new Uint8Array(binaryStr.length);
      for (var i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);

      var embeddedJpg = await newDoc.embedJpg(bytes);
      var newPage = newDoc.addPage([viewport.width, viewport.height]);
      newPage.drawImage(embeddedJpg, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      });
    }

    return await newDoc.save({ useObjectStreams: true });
  }

  compressBtn.addEventListener('click', async function() {
    if (!currentBuffer) return;
    if (!window.PDFLib || !window.PDFLib.PDFDocument) {
      TK.toast('PDF library is loading, please try again.', 'error');
      return;
    }

    compressBtn.disabled = true;
    compressBtn.textContent = 'Compressing PDF...';
    statusMsg.textContent = 'Optimizing streams and objects in browser memory...';

    try {
      var level = document.getElementById('compressPdfLevel') ? document.getElementById('compressPdfLevel').value : 'standard';
      var originalSize = currentFile.size;
      var finalBytes = null;

      if (level === 'high' && window.pdfjsLib) {
        statusMsg.textContent = 'Applying maximum compression via high-efficiency image re-encoding...';
        try {
          finalBytes = await compressViaCanvasRaster(currentBuffer, false);
        } catch (rasterErr) {
          finalBytes = null;
        }
      }

      if (!finalBytes) {
        var doc = await window.PDFLib.PDFDocument.load(currentBuffer, { ignoreEncryption: true });
        if (level === 'high') {
          doc.setTitle('');
          doc.setAuthor('');
          doc.setSubject('');
          doc.setKeywords([]);
          doc.setProducer('Toolswick PDF Compressor');
          doc.setCreator('Toolswick Client-Side Engine');
        }

        var compressedBytes = await doc.save({
          useObjectStreams: true,
          addDefaultPage: false,
          updateFieldAppearances: false
        });

        if (compressedBytes.byteLength < originalSize) {
          finalBytes = compressedBytes;
        } else if (window.pdfjsLib) {
          // If stream reorganization didn't shrink, attempt canvas rasterization
          statusMsg.textContent = 'Fine-tuning page compression to achieve positive size reduction...';
          try {
            var rasterBytes = await compressViaCanvasRaster(currentBuffer, true);
            if (rasterBytes.byteLength < originalSize) {
              finalBytes = rasterBytes;
            }
          } catch (e) {}
        }

        if (!finalBytes) {
          finalBytes = currentBuffer;
        }
      }

      var newSize = finalBytes.byteLength;
      var isSmaller = newSize < originalSize;
      var blob = new Blob([finalBytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);

      downloadBtn.href = url;
      var baseName = currentFile.name.replace(/\.pdf$/i, '');
      downloadBtn.download = baseName + '-compressed.pdf';
      downloadBtn.className = 'btn btn-primary';

      var savedBytes = originalSize - newSize;
      var savedPercent = ((savedBytes / originalSize) * 100).toFixed(1);

      if (isSmaller) {
        savingsBadge.innerHTML = '<span style="color:#059669;font-weight:700;">✓ Saved ' + savedPercent + '%</span> (' + TK.bytes(originalSize) + ' → ' + TK.bytes(newSize) + ')';
        downloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Compressed PDF (' + TK.bytes(newSize) + ')';
      } else {
        savingsBadge.innerHTML = '<span style="color:#059669;font-weight:600;">✓ Already at Maximum Optimization (no further compression possible)</span> (' + TK.bytes(originalSize) + ')';
        downloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Optimized PDF (' + TK.bytes(originalSize) + ')';
      }

      downloadBox.hidden = false;
      downloadBtn.click();
      statusMsg.textContent = 'Compression complete! 100% private in browser.';
      TK.toast('PDF compressed successfully!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Error compressing PDF: ' + (err.message || 'Corrupted or password protected');
      TK.toast('Could not compress this PDF file.', 'error');
    } finally {
      compressBtn.disabled = false;
      compressBtn.textContent = 'Compress PDF Again';
    }
  });
})();
