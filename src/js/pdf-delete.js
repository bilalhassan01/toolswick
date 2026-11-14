/* Toolswick Delete PDF Pages Tool - 100% Client-Side.
   Permanently removes selected pages from a PDF document in browser memory. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$;
  var cur = null;
  var pagesToDelete = new Set(); // Set of 1-based page numbers

  function show() {
    var panel = $("#panel");
    if (panel) panel.hidden = !cur;
    if (!cur) return;

    var fileInfo = $("#fileinfo");
    if (fileInfo) {
      fileInfo.textContent = cur.name + " · " + cur.pages + (cur.pages === 1 ? " page" : " pages") + " · " + TK.bytes(cur.size);
    }
    updateUI();
  }

  function updateUI() {
    if (!cur) return;
    renderGrid();
    syncTextInput();
    updateSummary();
  }

  function renderGrid() {
    var grid = $("#pageDeleteGrid");
    if (!grid || !cur) return;

    var html = [];
    for (var i = 1; i <= cur.pages; i++) {
      var isMarked = pagesToDelete.has(i);
      html.push(
        '<button type="button" class="pdf-delete-card' + (isMarked ? " marked-delete" : "") + '" data-page="' + i + '" aria-pressed="' + isMarked + '">' +
          '<span class="delete-badge">' + (isMarked ? "✕ Delete" : "✓ Keep") + "</span>" +
          '<div class="page-visual-box">' +
            '<span class="page-number">' + i + "</span>" +
          "</div>" +
          '<span class="card-caption">Page ' + i + "</span>" +
        "</button>"
      );
    }
    grid.innerHTML = html.join("");
  }

  function syncTextInput() {
    var input = $("#deleteInput");
    if (!input) return;
    var sorted = Array.from(pagesToDelete).sort(function (a, b) { return a - b; });
    input.value = sorted.join(", ");
  }

  function updateSummary() {
    var toDelete = pagesToDelete.size;
    var remaining = cur.pages - toDelete;
    var status = $("#deleteStatus");
    if (status) {
      status.textContent = toDelete + " of " + cur.pages + " pages marked for removal (" + remaining + " remaining).";
    }

    var delBtn = $("#delBtn");
    if (delBtn) {
      delBtn.disabled = toDelete === 0 || remaining === 0;
      if (remaining === 0) {
        delBtn.textContent = "Cannot delete all pages";
      } else if (toDelete === 0) {
        delBtn.textContent = "Select pages to delete";
      } else {
        delBtn.textContent = "Delete " + toDelete + " " + (toDelete === 1 ? "Page" : "Pages") + " & Download (" + remaining + " remaining)";
      }
    }
  }

  async function load(files) {
    var f = files[0];
    if (!f) return;
    try {
      var isPdf = await TK.checkMagicBytes(f, "pdf");
      if (!isPdf && !/\.pdf$/i.test(f.name)) {
        TK.toast("File is not a valid PDF document.", "error");
        return;
      }
      var buf = await f.arrayBuffer();
      var doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      var count = doc.getPageCount();

      cur = {
        name: TK.sanitizeFileName(f.name || "document.pdf", "pdf"),
        file: f,
        size: f.size,
        pages: count
      };
      pagesToDelete.clear();
      var errEl = $("#err");
      if (errEl) errEl.textContent = "";
    } catch (e) {
      cur = null;
      pagesToDelete.clear();
      TK.toast("Could not open " + (f.name || "file") + ". It may be encrypted or corrupted.", "error");
    }
    show();
  }

  // Click on page card in grid
  var grid = $("#pageDeleteGrid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-page]");
      if (!btn) return;
      var p = parseInt(btn.dataset.page, 10);
      if (pagesToDelete.has(p)) {
        pagesToDelete.delete(p);
      } else {
        pagesToDelete.add(p);
      }
      updateUI();
    });
  }

  // Text input for page deletion
  var input = $("#deleteInput");
  if (input) {
    input.addEventListener("input", function () {
      if (!cur) return;
      pagesToDelete.clear();
      var val = input.value.trim();
      if (val) {
        var parts = val.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
        parts.forEach(function (part) {
          var m = /^(\d+)\s*-\s*(\d+)$/.exec(part);
          if (m) {
            var a = parseInt(m[1], 10);
            var b = parseInt(m[2], 10);
            for (var k = Math.min(a, b); k <= Math.max(a, b); k++) {
              if (k >= 1 && k <= cur.pages) pagesToDelete.add(k);
            }
          } else if (/^\d+$/.test(part)) {
            var n = parseInt(part, 10);
            if (n >= 1 && n <= cur.pages) pagesToDelete.add(n);
          }
        });
      }
      renderGrid();
      updateSummary();
    });
  }

  // Quick select buttons
  var selectNoneBtn = $("#selectNoneBtn");
  if (selectNoneBtn) {
    selectNoneBtn.addEventListener("click", function () {
      pagesToDelete.clear();
      updateUI();
    });
  }

  var selectEvenBtn = $("#selectEvenBtn");
  if (selectEvenBtn) {
    selectEvenBtn.addEventListener("click", function () {
      if (!cur) return;
      pagesToDelete.clear();
      for (var i = 2; i <= cur.pages; i += 2) pagesToDelete.add(i);
      updateUI();
    });
  }

  var selectOddBtn = $("#selectOddBtn");
  if (selectOddBtn) {
    selectOddBtn.addEventListener("click", function () {
      if (!cur) return;
      pagesToDelete.clear();
      for (var i = 1; i <= cur.pages; i += 2) pagesToDelete.add(i);
      updateUI();
    });
  }

  var invertBtn = $("#invertBtn");
  if (invertBtn) {
    invertBtn.addEventListener("click", function () {
      if (!cur) return;
      var newSet = new Set();
      for (var i = 1; i <= cur.pages; i++) {
        if (!pagesToDelete.has(i)) newSet.add(i);
      }
      pagesToDelete = newSet;
      updateUI();
    });
  }

  // Execute deletion
  var delBtn = $("#delBtn");
  if (delBtn) {
    delBtn.addEventListener("click", async function () {
      if (!cur || pagesToDelete.size === 0) return;
      var remainingCount = cur.pages - pagesToDelete.size;
      if (remainingCount <= 0) {
        TK.toast("You cannot delete all pages. At least one page must remain.", "error");
        return;
      }

      var btn = this;
      var origLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Removing pages…";

      try {
        var buf = await cur.file.arrayBuffer();
        var srcDoc = await window.PDFLib.PDFDocument.load(buf);
        var keepIndices = [];
        for (var i = 0; i < cur.pages; i++) {
          if (!pagesToDelete.has(i + 1)) {
            keepIndices.push(i);
          }
        }

        var newDoc = await window.PDFLib.PDFDocument.create();
        var copiedPages = await newDoc.copyPages(srcDoc, keepIndices);
        copiedPages.forEach(function (page) { newDoc.addPage(page); });

        var outBytes = await newDoc.save();
        var base = TK.baseName(cur.name);
        var blob = new Blob([outBytes], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);
        var dlSection = $("#downloadSection");
        var dlLink = $("#downloadLink");
        if (dlLink) {
          dlLink.href = url;
          dlLink.download = base + "-cleaned.pdf";
          dlLink.className = "btn btn-primary";
          dlLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Cleaned PDF (' + TK.bytes(outBytes.length) + ')';
          dlLink.click();
        }
        if (dlSection) dlSection.hidden = false;
        TK.toast("Deleted " + pagesToDelete.size + " pages. New PDF ready (" + remainingCount + " pages).", "success");
      } catch (err) {
        TK.toast(err.message || "Failed to delete pages from PDF.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = origLabel;
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      cur = null;
      pagesToDelete.clear();
      var dlSection = $("#downloadSection");
      var dlLink = $("#downloadLink");
      if (dlSection) dlSection.hidden = false;
      if (dlLink) { dlLink.href = ""; }
      show();
    });
  }

  var drop = $("#drop");
  if (drop) {
    TK.dropzone(drop, load, function (f) {
      return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    });
  }

  show();
})();
