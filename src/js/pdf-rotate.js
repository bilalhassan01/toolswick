/* Toolswick Rotate PDF Tool - 100% Client-Side.
   Rotates PDF pages permanently in browser memory with pdf-lib. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$;
  var cur = null;
  var pageRotations = []; // Array of angles (0, 90, 180, 270)

  function show() {
    var panel = $("#panel");
    if (panel) panel.hidden = !cur;
    if (!cur) return;

    var fileInfo = $("#fileinfo");
    if (fileInfo) {
      fileInfo.textContent = cur.name + " · " + cur.pages + (cur.pages === 1 ? " page" : " pages") + " · " + TK.bytes(cur.size);
    }
    renderGrid();
  }

  function renderGrid() {
    var grid = $("#pageGrid");
    if (!grid || !cur) return;

    grid.innerHTML = pageRotations.map(function (rot, idx) {
      var displayAngle = rot % 360;
      var rotClass = "rot-" + displayAngle;
      return (
        '<div class="pdf-page-card">' +
          '<div class="page-visual ' + rotClass + '" aria-hidden="true">' +
            '<span class="page-num-indicator">' + (idx + 1) + "</span>" +
            '<span class="page-aspect-line"></span>' +
          "</div>" +
          '<div class="page-details">' +
            "<strong>Page " + (idx + 1) + "</strong>" +
            '<span class="page-angle-tag">' + displayAngle + "°</span>" +
          "</div>" +
          '<div class="page-rotate-actions">' +
            '<button type="button" class="btn ghost small" data-act="ccw" data-i="' + idx + '" title="Rotate 90° counter-clockwise">↺ -90°</button>' +
            '<button type="button" class="btn ghost small" data-act="cw" data-i="' + idx + '" title="Rotate 90° clockwise">↻ +90°</button>' +
          "</div>" +
        "</div>"
      );
    }).join("");
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
      var rotations = [];
      for (var i = 0; i < count; i++) {
        var page = doc.getPage(i);
        var existingAngle = 0;
        try {
          existingAngle = page.getRotation().angle || 0;
        } catch (ignore) {}
        rotations.push(existingAngle % 360);
      }

      cur = {
        name: TK.sanitizeFileName(f.name || "document.pdf", "pdf"),
        file: f,
        size: f.size,
        pages: count
      };
      pageRotations = rotations;
      var errEl = $("#err");
      if (errEl) errEl.textContent = "";
    } catch (e) {
      cur = null;
      pageRotations = [];
      TK.toast("Could not open " + (f.name || "file") + ". It may be encrypted or corrupted.", "error");
    }
    show();
  }

  // Handle individual page rotation clicks
  var grid = $("#pageGrid");
  if (grid) {
    grid.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var idx = parseInt(btn.dataset.i, 10);
      var act = btn.dataset.act;
      if (act === "cw") {
        pageRotations[idx] = (pageRotations[idx] + 90) % 360;
      } else if (act === "ccw") {
        pageRotations[idx] = (pageRotations[idx] + 270) % 360;
      }
      renderGrid();
    });
  }

  // Bulk rotation controls
  var rotateCwAll = $("#rotateCwAll");
  if (rotateCwAll) {
    rotateCwAll.addEventListener("click", function () {
      if (!cur) return;
      pageRotations = pageRotations.map(function (deg) { return (deg + 90) % 360; });
      renderGrid();
    });
  }

  var rotateCcwAll = $("#rotateCcwAll");
  if (rotateCcwAll) {
    rotateCcwAll.addEventListener("click", function () {
      if (!cur) return;
      pageRotations = pageRotations.map(function (deg) { return (deg + 270) % 360; });
      renderGrid();
    });
  }

  var rotate180All = $("#rotate180All");
  if (rotate180All) {
    rotate180All.addEventListener("click", function () {
      if (!cur) return;
      pageRotations = pageRotations.map(function (deg) { return (deg + 180) % 360; });
      renderGrid();
    });
  }

  var resetRotation = $("#resetRotation");
  if (resetRotation) {
    resetRotation.addEventListener("click", function () {
      if (!cur) return;
      pageRotations = pageRotations.map(function () { return 0; });
      renderGrid();
    });
  }

  var saveBtn = $("#saveBtn");
  if (saveBtn) {
    saveBtn.addEventListener("click", async function () {
      if (!cur) return;
      var btn = this;
      var origText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Saving rotated PDF…";

      try {
        var buf = await cur.file.arrayBuffer();
        var doc = await window.PDFLib.PDFDocument.load(buf);
        var count = doc.getPageCount();

        for (var i = 0; i < count; i++) {
          var targetAngle = pageRotations[i] % 360;
          var page = doc.getPage(i);
          page.setRotation(window.PDFLib.degrees(targetAngle));
        }

        var outBytes = await doc.save();
        var base = TK.baseName(cur.name);
        var blob = new Blob([outBytes], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);
        var dlSection = $("#downloadSection");
        var dlLink = $("#downloadLink");
        if (dlLink) {
          dlLink.href = url;
          dlLink.download = base + "-rotated.pdf";
          dlLink.className = "btn btn-primary";
          dlLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download Rotated PDF (' + TK.bytes(outBytes.length) + ')';
          dlLink.click();
        }
        if (dlSection) dlSection.hidden = false;
        TK.toast("Rotated PDF downloaded successfully.", "success");
      } catch (err) {
        TK.toast(err.message || "Could not apply rotation to PDF.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = origText;
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      cur = null;
      pageRotations = [];
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
