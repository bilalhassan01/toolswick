/* Toolswick Image to PDF Converter - 100% Client-Side.
   Combines images into a PDF document without server transmission. */
(function () {
  "use strict";

  var $ = TK.$, items = [];
  var SIZES = { fit: null, a4: [595.28, 841.89], letter: [612, 792] };

  var listEl = $("#list");
  var draw = TK.orderedList(listEl, items, function (it) {
    return {
      title: it.name,
      sub: it.w + "×" + it.h + " px · " + TK.bytes(it.size)
    };
  }, update);

  function update() {
    var summaryEl = $("#summary");
    if (summaryEl) summaryEl.hidden = !items.length;
    var totalsEl = $("#totals");
    if (totalsEl) {
      totalsEl.textContent = items.length + (items.length === 1 ? " image ready" : " images ready") + " → " + items.length + (items.length === 1 ? " page" : " pages");
    }
    var goBtn = $("#goBtn");
    if (goBtn) {
      goBtn.disabled = !items.length;
      goBtn.textContent = items.length ? "Create PDF (" + items.length + " pages)" : "Add images to start";
    }
  }

  async function add(files) {
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      try {
        var bmp = await createImageBitmap(f);
        var w = bmp.width;
        var h = bmp.height;
        bmp.close(); // Immediate memory release

        items.push({
          name: TK.sanitizeFileName(f.name || "image"),
          file: f,
          type: f.type,
          size: f.size,
          w: w,
          h: h
        });
      } catch (e) {
        TK.toast("Failed to read " + (f.name || "file") + " as an image.", "error");
      }
    }
    draw();
  }

  async function embedImage(doc, it) {
    var buf = await it.file.arrayBuffer();
    if (it.type === "image/jpeg" || /\.jpe?g$/i.test(it.name)) {
      return doc.embedJpg(buf);
    }
    if (it.type === "image/png" || /\.png$/i.test(it.name)) {
      return doc.embedPng(buf);
    }

    // For WebP, AVIF, GIF, BMP: draw to canvas and convert to high quality JPEG
    var bmp = null;
    try {
      bmp = await createImageBitmap(it.file);
      var c = document.createElement("canvas");
      c.width = it.w;
      c.height = it.h;
      var ctx = c.getContext("2d");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, it.w, it.h);
      ctx.drawImage(bmp, 0, 0);
      var blob = await new Promise(function (res) {
        c.toBlob(res, "image/jpeg", 0.94);
      });
      var jpegBuf = await blob.arrayBuffer();
      return doc.embedJpg(jpegBuf);
    } finally {
      if (bmp && typeof bmp.close === "function") bmp.close();
    }
  }

  var goBtn = $("#goBtn");
  if (goBtn) {
    goBtn.addEventListener("click", async function () {
      if (!items.length) return;
      var btn = this;
      var originalLabel = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Creating PDF…";

      try {
        if (!window.PDFLib) {
          throw new Error("PDF processing engine is still initializing. Please retry in a moment.");
        }
        var doc = await window.PDFLib.PDFDocument.create();
        var sizeVal = $("#pagesize") ? $("#pagesize").value : "fit";
        var size = SIZES[sizeVal];
        var margin = size ? 24 : 0;
        var landscapeCheck = $("#landscape") ? $("#landscape").checked : true;

        for (var i = 0; i < items.length; i++) {
          var it = items[i];
          var embeddedImg = await embedImage(doc, it);
          var pw = size ? size[0] : it.w * 0.75;
          var ph = size ? size[1] : it.h * 0.75;

          if (size && it.w > it.h && landscapeCheck) {
            pw = size[1];
            ph = size[0];
          }

          var page = doc.addPage([pw, ph]);
          var scale = Math.min((pw - margin * 2) / it.w, (ph - margin * 2) / it.h);
          var dw = it.w * scale;
          var dh = it.h * scale;
          page.drawImage(embeddedImg, {
            x: (pw - dw) / 2,
            y: (ph - dh) / 2,
            width: dw,
            height: dh
          });
        }

        var pdfBytes = await doc.save();
        var blob = new Blob([pdfBytes], { type: "application/pdf" });
        var url = URL.createObjectURL(blob);
        var dlSection = $("#downloadSection");
        var dlLink = $("#downloadLink");
        if (dlLink) {
          dlLink.href = url;
          dlLink.download = "toolswick-images.pdf";
          dlLink.className = "btn btn-primary";
          dlLink.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Download PDF (' + TK.bytes(pdfBytes.length) + ')';
          dlLink.click();
        }
        if (dlSection) dlSection.hidden = false;
        TK.toast("PDF created successfully (" + TK.bytes(pdfBytes.length) + ").", "success");
      } catch (err) {
        TK.toast(err.message || "Could not generate PDF. Please check your images.", "error");
      } finally {
        btn.disabled = false;
        btn.textContent = originalLabel;
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
      return /^image\//i.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|avif)$/i.test(f.name);
    });
  }

  update();
})();
