// pdf-to-image.js - 100% Client-Side PDF to JPG/PNG Image Converter
(function() {
  'use strict';

  var dropZone = document.getElementById('pdfImgDrop');
  var fileInput = document.getElementById('pdfImgFile');
  var optionsBox = document.getElementById('pdfImgOptions');
  var fileInfo = document.getElementById('pdfImgFileInfo');
  var convertBtn = document.getElementById('pdfImgActionBtn');
  var progressBox = document.getElementById('pdfImgProgress');
  var progressBar = document.getElementById('pdfImgProgressBar');
  var statusMsg = document.getElementById('pdfImgStatus');
  var resultsGrid = document.getElementById('pdfImgResultsGrid');
  var zipDownloadBtn = document.getElementById('pdfImgZipBtn');

  var currentBuffer = null;
  var currentFile = null;
  var renderedPages = [];

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
      resultsGrid.innerHTML = '';
      zipDownloadBtn.hidden = true;
      statusMsg.textContent = '';
      convertBtn.disabled = false;
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

  convertBtn.addEventListener('click', async function() {
    if (!currentBuffer) return;
    if (!window.pdfjsLib) {
      TK.toast('PDF renderer is loading, please try again.', 'error');
      return;
    }
    initWorker();

    var format = document.getElementById('pdfImgFormat') ? document.getElementById('pdfImgFormat').value : 'jpeg';
    var mime = format === 'png' ? 'image/png' : 'image/jpeg';
    var ext = format === 'png' ? 'png' : 'jpg';
    var scale = parseFloat(document.getElementById('pdfImgScale') ? document.getElementById('pdfImgScale').value : '1.5');

    convertBtn.disabled = true;
    progressBox.hidden = false;
    resultsGrid.innerHTML = '';
    renderedPages = [];
    zipDownloadBtn.hidden = true;

    try {
      var loadingTask = window.pdfjsLib.getDocument({ data: new Uint8Array(currentBuffer) });
      var pdf = await loadingTask.promise;
      var totalPages = pdf.numPages;

      statusMsg.textContent = 'Rendering 1 of ' + totalPages + ' pages...';

      for (var pageNum = 1; pageNum <= totalPages; pageNum++) {
        var page = await pdf.getPage(pageNum);
        var viewport = page.getViewport({ scale: scale });

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (mime === 'image/jpeg') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        await page.render({ canvasContext: ctx, viewport: viewport }).promise;

        var blob = await new Promise(function(resolve) {
          canvas.toBlob(resolve, mime, 0.92);
        });

        var baseName = currentFile.name.replace(/\.pdf$/i, '');
        var pageFilename = baseName + '-page-' + pageNum + '.' + ext;
        var pageUrl = URL.createObjectURL(blob);

        renderedPages.push({
          num: pageNum,
          blob: blob,
          url: pageUrl,
          filename: pageFilename,
          width: canvas.width,
          height: canvas.height
        });

        var card = document.createElement('div');
        card.className = 'sample-card';
        card.style.display = 'flex';
        card.style.flexDirection = 'column';
        card.style.gap = '8px';
        card.style.background = 'var(--surface)';
        card.style.border = '1px solid var(--line)';
        card.style.borderRadius = '10px';
        card.style.padding = '12px';
        card.style.alignItems = 'center';

        var imgThumb = document.createElement('img');
        imgThumb.src = pageUrl;
        imgThumb.style.maxWidth = '100%';
        imgThumb.style.maxHeight = '160px';
        imgThumb.style.objectFit = 'contain';
        imgThumb.style.borderRadius = '6px';
        imgThumb.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';

        var lbl = document.createElement('div');
        lbl.style.fontSize = '12px';
        lbl.style.fontWeight = '600';
        lbl.textContent = 'Page ' + pageNum + ' (' + TK.bytes(blob.size) + ')';

        var dlLink = document.createElement('a');
        dlLink.className = 'btn btn-primary';
        dlLink.style.cssText = 'font-size:12px;padding:8px 16px;margin-top:6px;background:#0d9488;color:#ffffff;border-radius:6px;text-decoration:none;font-weight:700;display:inline-flex;align-items:center;gap:6px;box-shadow:0 2px 6px rgba(13,148,136,0.3);';
        dlLink.href = pageUrl;
        dlLink.download = pageFilename;
        dlLink.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ' + ext.toUpperCase();

        card.appendChild(imgThumb);
        card.appendChild(lbl);
        card.appendChild(dlLink);
        resultsGrid.appendChild(card);

        var pct = Math.round((pageNum / totalPages) * 100);
        progressBar.style.width = pct + '%';
        statusMsg.textContent = 'Converted ' + pageNum + ' of ' + totalPages + ' pages (' + pct + '%)...';
      }

      statusMsg.textContent = 'All ' + totalPages + ' pages converted successfully!';
      if (totalPages > 1 && window.JSZip) {
        zipDownloadBtn.hidden = false;
      }
      TK.toast('PDF converted to ' + ext.toUpperCase() + ' images!', 'success');
    } catch (err) {
      console.error(err);
      statusMsg.textContent = 'Error: ' + (err.message || 'Could not convert PDF');
      TK.toast('Error converting PDF to images.', 'error');
    } finally {
      convertBtn.disabled = false;
      progressBox.hidden = true;
    }
  });

  zipDownloadBtn.addEventListener('click', async function() {
    if (!renderedPages.length || !window.JSZip) return;
    zipDownloadBtn.disabled = true;
    zipDownloadBtn.textContent = 'Generating ZIP...';

    try {
      var zip = new window.JSZip();
      for (var i = 0; i < renderedPages.length; i++) {
        var p = renderedPages[i];
        zip.file(p.filename, p.blob);
      }
      var zipBlob = await zip.generateAsync({ type: 'blob' });
      var zipUrl = URL.createObjectURL(zipBlob);
      var baseName = currentFile.name.replace(/\.pdf$/i, '');
      var a = document.createElement('a');
      a.href = zipUrl;
      a.download = baseName + '-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      TK.toast('ZIP file downloaded!', 'success');
    } catch (err) {
      console.error(err);
      TK.toast('Failed to create ZIP file.', 'error');
    } finally {
      zipDownloadBtn.disabled = false;
      zipDownloadBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download All Pages as ZIP';
    }
  });
})();
