/* Toolswick PDF Split & Extract Tool - 100% Client-Side.
   Extracts page ranges or splits PDF into separate documents. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$, cur = null;

  function parseRanges(text, maxPages) {
    var out = [], seen = {};
    if (!text || typeof text !== "string") {
      throw new Error("Enter the page numbers to extract, e.g. 1-3, 5, 8-10.");
    }

    var parts = text.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
    if (!parts.length) {
      throw new Error("Enter page numbers or ranges, for example 1-3, 5, 8-10.");
    }

    parts.forEach(function (part) {
      var match = /^(\d+)\s*-\s*(\d+)$/.exec(part);
      var start, end;
      if (match) {
        start = parseInt(match[1], 10);
        end = parseInt(match[2], 10);
      } else if (/^\d+$/.test(part)) {
        start = end = parseInt(part, 10);
      } else {
        throw new Error('"' + part + '" is not a valid page number or range.');
      }

      if (start < 1 || end < 1 || start > maxPages || end > maxPages) {
        throw new Error("Page numbers must be between 1 and " + maxPages + ".");
      }

      var step = start <= end ? 1 : -1;
      for (var n = start; n !== end + step; n += step) {
        if (!seen[n]) {
          seen[n] = true;
          out.push(n - 1); // 0-based index for pdf-lib
        }
      }
    });

    return out;
  }

  function show() {
    var panel = $("#panel");
    if (panel) panel.hidden = !cur;
    if (!cur) return;

    var fileInfo = $("#fileinfo");
    if (fileInfo) {
      fileInfo.textContent = cur.name + " · " + cur.pages + (cur.pages === 1 ? " page" : " pages") + " · " + TK.bytes(cur.size);
    }
    var rangesInput = $("#ranges");
    if (rangesInput) {
      rangesInput.placeholder = "e.g. 1-3, 5, 8-" + Math.max(cur.pages, 8);
    }
  }

  async function load(files) {
    var f = files[0];
    if (!f) return;
    try {
      var isPdf = await TK.checkMagicBytes(f, "pdf");
      if (!isPdf && !/\.pdf$/i.test(f.name)) {
        TK.toast("Selected file is not a valid PDF document.", "error");
        return;
      }
      var buf = await f.arrayBuffer();
      var doc = await window.PDFLib.PDFDocument.load(buf, { ignoreEncryption: true });
      cur = {
        name: TK.sanitizeFileName(f.name || "document.pdf", "pdf"),
        file: f,
        size: f.size,
        pages: doc.getPageCount()
      };
      var errEl = $("#err");
      if (errEl) errEl.textContent = "";
    } catch (e) {
      cur = null;
      TK.toast("Could not open " + (f.name || "file") + ". It may be encrypted or corrupted.", "error");
    }
    show();
  }

  function getMode() {
    var checked = TK.$('input[name="mode"]:checked');
    return checked ? checked.value : "extract";
  }

  TK.$$('input[name="mode"]').forEach(function (r) {
    r.addEventListener("change", function () {
      var rangeBox = $("#rangeBox");
      if (rangeBox) rangeBox.hidden = getMode() !== "extract";
      var goBtn = $("#goBtn");
      if (goBtn) {
        goBtn.textContent = getMode() === "extract" ? "Extract & Download PDF" : "Split All Pages to ZIP";
      }
    });
  });

  var goBtn = $("#goBtn");
  if (goBtn) {
    goBtn.addEventListener("click", async function () {
      if (!cur) return;
      var btn = this;
      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Processing PDF…";
      var errEl = $("#err");
      if (errEl) errEl.textContent = "";

      try {
        var buf = await cur.file.arrayBuffer();
        var srcDoc = await window.PDFLib.PDFDocument.load(buf);
        var base = TK.baseName(cur.name);

        if (getMode() === "extract") {
          var rangesVal = $("#ranges") ? $("#ranges").value : "";
          var indices = parseRanges(rangesVal, cur.pages);
          var outDoc = await window.PDFLib.PDFDocument.create();
          var copiedPages = await outDoc.copyPages(srcDoc, indices);
          copiedPages.forEach(function (p) { outDoc.addPage(p); });

          var outBytes = await outDoc.save();
          var blob = new Blob([outBytes], { type: "application/pdf" });
          var url = URL.createObjectURL(blob);
          var dlSection = $("#downloadSection");
          var dlLink = $("#downloadLink");
          if (dlLink) {
            dlLink.href = url;
            dlLink.download = base + "-extracted.pdf";
            dlLink.className = "btn btn-primary";
            dlLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Extracted PDF (' + TK.bytes(outBytes.length) + ')';
            dlLink.click();
          }
          if (dlSection) dlSection.hidden = false;
          TK.toast("Extracted " + indices.length + (indices.length === 1 ? " page" : " pages") + " successfully.", "success");
        } else {
          // Split every page into its own individual PDF in a ZIP
          if (!window.JSZip) {
            throw new Error("ZIP packaging library is loading. Please retry in a moment.");
          }
          var zip = new window.JSZip();
          var padLength = String(cur.pages).length;

          for (var i = 0; i < cur.pages; i++) {
            var singleDoc = await window.PDFLib.PDFDocument.create();
            var pageCopy = await singleDoc.copyPages(srcDoc, [i]);
            singleDoc.addPage(pageCopy[0]);
            var singleBytes = await singleDoc.save();
            var pageNum = String(i + 1).padStart(padLength, "0");
            zip.file(base + "-page-" + pageNum + ".pdf", singleBytes);
          }

          var zipBlob = await zip.generateAsync({ type: "blob" });
          var zipUrl = URL.createObjectURL(zipBlob);
          var dlSection2 = $("#downloadSection");
          var dlLink2 = $("#downloadLink");
          if (dlLink2) {
            dlLink2.href = zipUrl;
            dlLink2.download = base + "-all-pages.zip";
            dlLink2.className = "btn btn-primary";
            dlLink2.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download ZIP (' + cur.pages + ' pages)';
            dlLink2.click();
          }
          if (dlSection2) dlSection2.hidden = false;
          TK.toast("Split into " + cur.pages + " individual PDF files.", "success");
        }
      } catch (err) {
        if (errEl) errEl.textContent = err.message || "Failed to split PDF.";
        TK.toast(err.message || "Failed to split PDF.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      cur = null;
      var rangesInput = $("#ranges");
      if (rangesInput) rangesInput.value = "";
      var errEl = $("#err");
      if (errEl) errEl.textContent = "";
      var dlSection = $("#downloadSection");
      var dlLink = $("#downloadLink");
      if (dlSection) dlSection.hidden = true;
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
