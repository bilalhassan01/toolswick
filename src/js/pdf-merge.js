/* Toolswick PDF Merge Tool - 100% Client-Side.
   Combines multiple PDF documents in browser memory. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$, items = [];

  var listEl = $("#list");
  var draw = TK.orderedList(listEl, items, function (it) {
    return {
      title: it.name,
      sub: it.pages + (it.pages === 1 ? " page" : " pages") + " · " + TK.bytes(it.size)
    };
  }, update);

  function update() {
    var totalPages = items.reduce(function (s, i) { return s + i.pages; }, 0);
    var summaryEl = $("#summary");
    if (summaryEl) summaryEl.hidden = !items.length;

    var totalsEl = $("#totals");
    if (totalsEl) {
      totalsEl.textContent = items.length + (items.length === 1 ? " document" : " documents") + " · " + totalPages + " total pages";
    }

    var mergeBtn = $("#mergeBtn");
    if (mergeBtn) {
      mergeBtn.disabled = items.length < 2;
      mergeBtn.textContent = items.length < 2 ? "Add at least two PDFs to merge" : "Merge " + items.length + " PDFs";
    }
  }

  async function add(files) {
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      try {
        var isPdf = await TK.checkMagicBytes(f, "pdf");
        if (!isPdf && !/\.pdf$/i.test(f.name)) {
          TK.toast("File " + (f.name || "") + " is not a valid PDF.", "error");
          continue;
        }

        var buf = await f.arrayBuffer();
        var doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
        var pageCount = doc.getPageCount();

        items.push({
          name: TK.sanitizeFileName(f.name || "document.pdf", "pdf"),
          file: f,
          size: f.size,
          pages: pageCount
        });
      } catch (e) {
        TK.toast((f.name || "File") + " could not be opened. It may be password-protected or corrupt.", "error");
      }
    }
    draw();
  }

  var mergeBtn = $("#mergeBtn");
  if (mergeBtn) {
    mergeBtn.addEventListener("click", async function () {
      if (items.length < 2) return;
      var btn = this;
      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Merging PDFs…";

      try {
        var mergedDoc = await window.PDFLib.PDFDocument.create();

        for (var i = 0; i < items.length; i++) {
          var buf = await items[i].file.arrayBuffer();
          var srcDoc = await window.PDFLib.PDFDocument.load(buf);
          var indices = srcDoc.getPageIndices();
          var copiedPages = await mergedDoc.copyPages(srcDoc, indices);
          for (var p = 0; p < copiedPages.length; p++) {
            mergedDoc.addPage(copiedPages[p]);
          }
        }

        var mergedBytes = await mergedDoc.save();
        var blob = new Blob([mergedBytes], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);
        var dlSection = $("#downloadSection");
        var dlLink = $("#downloadLink");
        if (dlLink) {
          dlLink.href = url;
          dlLink.download = "toolswick-merged.pdf";
          dlLink.className = "btn btn-primary";
          dlLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Merged PDF (' + TK.bytes(mergedBytes.length) + ')';
          dlLink.click();
        }
        if (dlSection) dlSection.hidden = false;
        TK.toast("Merged PDF ready (" + TK.bytes(mergedBytes.length) + ").", "success");
      } catch (err) {
        TK.toast("An error occurred while merging. Please verify that files are unencrypted.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
        update();
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      items.length = 0;
      var dlSection = $("#downloadSection");
      var dlLink = $("#downloadLink");
      if (dlSection) dlSection.hidden = true;
      if (dlLink) { dlLink.href = ""; }
      draw();
    });
  }

  var drop = $("#drop");
  if (drop) {
    TK.dropzone(drop, add, function (f) {
      return f.type === "application/pdf" || /\.pdf$/i.test(f.name);
    });
  }

  update();
})();
