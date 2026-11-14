/* Toolswick Image Processing Engine: 100% Client-Side.
   Powered by Web Workers & OffscreenCanvas with main-thread fallback. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$, esc = TK.esc, bytes = TK.bytes;
  var D = window.TOOL_DEFAULTS || {};
  var MIME = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  var EXT = { jpeg: "jpg", png: "png", webp: "webp" };

  var state = {
    fmt: D.fmt || "keep",
    q: typeof D.q === "number" ? D.q : 80,
    mw: "",
    mh: "",
    enlarge: false,
    items: [],
    nextId: 1,
    run: 0,
    isProcessing: false
  };

  var debounceTimer;

  // Detect WebP export support
  var webpOk = (function () {
    try {
      return document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0;
    } catch (e) {
      return false;
    }
  })();

  if (!webpOk) {
    var webpRadio = document.querySelector('input[name="fmt"][value="webp"]');
    if (webpRadio) {
      webpRadio.disabled = true;
      if (webpRadio.parentNode) {
        webpRadio.parentNode.title = "Your browser cannot export WebP files";
      }
    }
  }

  // Detect Web Worker & OffscreenCanvas support
  var hasWorkerSupport = (function () {
    return typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";
  })();

  var workerInstance = null;
  if (hasWorkerSupport) {
    try {
      workerInstance = new Worker("/js/worker-image.js");
      workerInstance.onmessage = function (e) {
        var res = e.data;
        if (!res || res.runId !== state.run) return; // Discard stale jobs
        var it = state.items.find(function (item) { return item.id === res.id; });
        if (!it) return;

        if (res.success) {
          if (it.url) {
            try { URL.revokeObjectURL(it.url); } catch (ignore) {}
          }
          var blob = new Blob([res.outBuffer], { type: res.outMime });
          it.out = blob;
          it.ow = res.tw;
          it.oh = res.th;
          it.w = res.origW || it.w;
          it.h = res.origH || it.h;
          it.url = URL.createObjectURL(blob);
          it.outFmt = res.outFmt;
          it.outName = outName(it, res.outFmt);
          it.err = null;
        } else {
          it.err = res.error || "Processing failed";
        }
        render();
      };
    } catch (err) {
      workerInstance = null;
    }
  }

  function fmtFor(it) {
    if (state.fmt !== "keep") return state.fmt;
    if (it.type === "image/png") return "png";
    if (it.type === "image/webp" && webpOk) return "webp";
    return "jpeg";
  }

  function outName(it, fmt) {
    var base = TK.baseName(it.name);
    var ext = EXT[fmt] || "jpg";
    var dot = it.name.lastIndexOf(".");
    var orig = dot > 0 ? it.name.slice(dot + 1).toLowerCase().replace("jpeg", "jpg") : "";
    var suffix = orig === ext ? "-optimized" : "";
    return TK.sanitizeFileName(base + suffix + "." + ext, ext);
  }

  // Fallback main-thread image processing
  async function processItemMainThread(it, run) {
    var scale = Infinity;
    var mw = Math.max(0, parseInt(state.mw, 10) || 0);
    var mh = Math.max(0, parseInt(state.mh, 10) || 0);
    if (mw > 0) scale = Math.min(scale, mw / it.w);
    if (mh > 0) scale = Math.min(scale, mh / it.h);
    if (scale === Infinity) scale = 1;
    if (!state.enlarge) scale = Math.min(scale, 1);

    var tw = Math.max(1, Math.round(it.w * scale));
    var th = Math.max(1, Math.round(it.h * scale));
    var fmt = fmtFor(it);

    var canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    var ctx = canvas.getContext("2d");

    if (fmt === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tw, th);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    var bmp = null;
    try {
      bmp = await createImageBitmap(it.file);
      ctx.drawImage(bmp, 0, 0, tw, th);
    } finally {
      if (bmp && typeof bmp.close === "function") {
        bmp.close();
      }
    }

    var q = fmt === "png" ? undefined : state.q / 100;
    var blob = await new Promise(function (resolve) {
      canvas.toBlob(resolve, MIME[fmt], q);
    });

    if (state.targetKb && blob) {
      var targetBytes = state.targetKb * 1024;
      var outMime = fmt === "png" ? "image/jpeg" : MIME[fmt];
      var bestBlob = blob;

            // Iteratively search quality to hit target size
      var lowQ = 0.05, highQ = 0.95;
      for (var iter = 0; iter < 8; iter++) {
        var testQ = (lowQ + highQ) / 2;
        var testBlob = await new Promise(function (res) { canvas.toBlob(res, outMime, testQ); });
        if (testBlob) {
          if (testBlob.size <= targetBytes) {
            bestBlob = testBlob;
            lowQ = testQ; // try higher quality that still fits
          } else {
            highQ = testQ; // too large, reduce quality
            if (bestBlob.size > targetBytes && testBlob.size < bestBlob.size) {
              bestBlob = testBlob;
            }
          }
        }
      }

      // If quality reduction alone is insufficient, downscale resolution
      if (bestBlob && bestBlob.size > targetBytes) {
        var curW = tw;
        var curH = th;
        var downCanvas = canvas;
        while (bestBlob && bestBlob.size > targetBytes && curW > 60 && curH > 60) {
          var ratio = Math.min(0.85, Math.sqrt(targetBytes / bestBlob.size) * 0.95);
          curW = Math.max(60, Math.floor(curW * ratio));
          curH = Math.max(60, Math.floor(curH * ratio));
          var nextCanvas = document.createElement("canvas");
          nextCanvas.width = curW;
          nextCanvas.height = curH;
          var nctx = nextCanvas.getContext("2d");
          nctx.fillStyle = "#ffffff";
          nctx.fillRect(0, 0, curW, curH);
          nctx.imageSmoothingEnabled = true;
          nctx.imageSmoothingQuality = "high";
          nctx.drawImage(canvas, 0, 0, curW, curH);
          downCanvas = nextCanvas;

          var qSteps = [0.70, 0.50, 0.30, 0.15, 0.05];
          for (var si = 0; si < qSteps.length; si++) {
            var stepBlob = await new Promise(function (res) { downCanvas.toBlob(res, outMime, qSteps[si]); });
            if (stepBlob) {
              if (stepBlob.size <= targetBytes) {
                bestBlob = stepBlob;
                tw = curW;
                th = curH;
                break;
              } else if (stepBlob.size < bestBlob.size) {
                bestBlob = stepBlob;
                tw = curW;
                th = curH;
              }
            }
          }
        }
      }
      if (bestBlob) blob = bestBlob;
    }

    if (run !== state.run) return;
    if (!blob) {
      it.err = "Could not export this image.";
      return;
    }

    if (it.url) {
      try { URL.revokeObjectURL(it.url); } catch (ignore) {}
    }

    it.err = null;
    it.out = blob;
    it.ow = tw;
    it.oh = th;
    it.url = URL.createObjectURL(blob);
    it.outFmt = fmt;
    it.outName = outName(it, fmt);
  }

  async function processAll() {
    var run = ++state.run;
    state.isProcessing = true;
    render();

    var mw = Math.max(0, parseInt(state.mw, 10) || 0);
    var mh = Math.max(0, parseInt(state.mh, 10) || 0);

    for (var i = 0; i < state.items.length; i++) {
      var it = state.items[i];
      if (run !== state.run) return;

      var fmt = fmtFor(it);
      var q = state.q / 100;

      if (workerInstance && !state.targetKb) {
        try {
          var buf = await it.file.arrayBuffer();
          // Pass buffer copy as transferable to worker
          workerInstance.postMessage(
            {
              runId: run,
              id: it.id,
              buffer: buf,
              mimeType: it.type,
              outFmt: fmt,
              quality: q,
              maxW: mw,
              maxH: mh,
              enlarge: state.enlarge
            },
            [buf]
          );
        } catch (e) {
          // Fall back to main thread for this item
          await processItemMainThread(it, run);
        }
      } else {
        await processItemMainThread(it, run);
        if (run !== state.run) return;
        render();
      }
    }

    state.isProcessing = false;
    render();
  }

  async function addFiles(files) {
    var failed = 0;
    for (var i = 0; i < files.length; i++) {
      var f = files[i];
      try {
        var bmp = await createImageBitmap(f);
        var w = bmp.width;
        var h = bmp.height;
        bmp.close(); // Immediate memory release

        state.items.push({
          id: state.nextId++,
          name: f.name || "pasted-image.png",
          file: f,
          type: f.type || "image/png",
          orig: f.size,
          w: w,
          h: h,
          out: null,
          url: null,
          err: null
        });
      } catch (e) {
        failed++;
      }
    }

    if (failed) {
      TK.toast(failed + (failed === 1 ? " file" : " files") + " could not be opened. Unsupported format or damaged file.", "error");
    }

    render();
    processAll();
  }

  function render() {
    var list = $("#list");
    if (!list) return;

    var items = state.items;
    list.innerHTML = items.map(function (it) {
      var thumb = it.url
        ? '<img class="thumb" src="' + it.url + '" alt="Preview of ' + esc(it.name) + '">'
        : '<span class="thumb empty" aria-hidden="true"></span>';

      var dims = it.out
        ? it.w + "×" + it.h + (it.w !== it.ow || it.h !== it.oh ? " → <b>" + it.ow + "×" + it.oh + "</b>" : "")
        : it.w + "×" + it.h;

      var sizes;
      if (it.err) {
        sizes = '<span class="badge bad">' + esc(it.err) + "</span>";
      } else if (!it.out) {
        sizes = '<span class="from working"><span class="spinner" aria-hidden="true"></span> Processing…</span>';
      } else {
        var pct = Math.round((1 - it.out.size / it.orig) * 100);
        var badge = it.out.size < it.orig
          ? '<span class="badge good">−' + pct + "%</span>"
          : '<span class="badge warn">+' + Math.abs(pct) + "%</span>";
        sizes = '<span class="from">' + bytes(it.orig) + '</span><span class="arrow">→</span><strong>' + bytes(it.out.size) + "</strong>" + badge;
      }

      var saveBtn = it.out
        ? '<button type="button" class="btn small" data-act="save" data-id="' + it.id + '">Download ' + (EXT[it.outFmt] || "FILE").toUpperCase() + "</button>"
        : "";

      return (
        '<li class="row">' +
          thumb +
          '<div class="meta">' +
            '<p class="name">' + esc(it.name) + '</p>' +
            '<p class="sub">' + dims + '</p>' +
          '</div>' +
          '<div class="sizes">' + sizes + '</div>' +
          '<div class="actions">' +
            saveBtn +
            '<button type="button" class="btn danger small" data-act="remove" data-id="' + it.id + '" aria-label="Remove ' + esc(it.name) + '">✕ Remove</button>' +
          '</div>' +
        '</li>'
      );
    }).join("");

    var done = items.filter(function (i) { return i.out; });
    var summaryEl = $("#summary");
    if (summaryEl) {
      summaryEl.hidden = !items.length;
    }

    var totalsEl = $("#totals");
    if (totalsEl) {
      if (done.length) {
        var origTotal = done.reduce(function (s, i) { return s + i.orig; }, 0);
        var outTotal = done.reduce(function (s, i) { return s + i.out.size; }, 0);
        var savedPct = Math.round((1 - outTotal / origTotal) * 100);
        totalsEl.innerHTML =
          done.length + (done.length === 1 ? " image ready" : " images ready") + " · " +
          bytes(origTotal) + " → <strong>" + bytes(outTotal) + "</strong>" +
          (outTotal < origTotal ? ' · <span class="badge good">Saved ' + savedPct + '%</span>' : "");
      } else if (items.length) {
        totalsEl.innerHTML = '<span class="spinner" aria-hidden="true"></span> Processing images in browser…';
      }
    }

    var zipBtn = $("#zipBtn");
    if (zipBtn) {
      zipBtn.hidden = !(window.JSZip && done.length > 1);
    }

    var isPng = state.fmt === "png";
    var qInput = $("#q");
    if (qInput) {
      qInput.disabled = isPng;
    }
    var qHint = $("#qhint");
    if (qHint) {
      qHint.textContent = isPng
        ? "PNG uses lossless compression. Use Fit Within to resize, or choose WebP / JPG for smaller files."
        : state.fmt === "keep"
        ? "Quality 70–85 yields pristine visual fidelity with significantly smaller file size."
        : "Lower quality produces smaller file sizes. 75–85 provides an optimal balance.";
    }
    var qVal = $("#qv");
    if (qVal) {
      qVal.textContent = isPng ? "Lossless" : state.q;
    }

    TK.$$(".chip").forEach(function (c) {
      var isMatch = String(state.mw) === c.dataset.w && !state.mh;
      c.setAttribute("aria-pressed", String(isMatch));
    });
  }

  function schedule() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(processAll, 200);
  }

  // Action listeners
  var list = $("#list");
  if (list) {
    list.addEventListener("click", function (e) {
      var btn = e.target.closest("button[data-act]");
      if (!btn) return;
      var id = +btn.dataset.id;
      var it = state.items.find(function (i) { return i.id === id; });
      if (!it) return;

      if (btn.dataset.act === "remove") {
        if (it.url) {
          try { URL.revokeObjectURL(it.url); } catch (ignore) {}
        }
        state.items = state.items.filter(function (i) { return i.id !== id; });
        render();
      } else if (btn.dataset.act === "save" && it.out) {
        TK.save(it.outName, it.out);
      }
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      state.items.forEach(function (i) {
        if (i.url) {
          try { URL.revokeObjectURL(i.url); } catch (ignore) {}
        }
      });
      state.items = [];
      state.run++;
      render();
    });
  }

  var zipBtn = $("#zipBtn");
  if (zipBtn) {
    zipBtn.addEventListener("click", async function () {
      var done = state.items.filter(function (i) { return i.out; });
      if (!done.length) return;
      zipBtn.disabled = true;
      zipBtn.textContent = "Packaging ZIP…";

      try {
        var zip = new window.JSZip();
        var usedNames = {};
        for (var i = 0; i < done.length; i++) {
          var it = done[i];
          var name = it.outName;
          var k = 1;
          while (usedNames[name]) {
            name = it.outName.replace(/(\.[^.]+)$/, "-" + (++k) + "$1");
          }
          usedNames[name] = 1;
          zip.file(name, it.out);
        }
        var zipBlob = await zip.generateAsync({ type: "blob" });
        TK.save("toolswick-images.zip", zipBlob);
        TK.toast("Downloaded ZIP with " + done.length + " images.");
      } catch (err) {
        TK.toast("Failed to build ZIP archive.", "error");
      } finally {
        zipBtn.disabled = false;
        zipBtn.textContent = "Download All as ZIP";
      }
    });
  }

  // Form controls
  var initialFmt = TK.$('input[name="fmt"][value="' + state.fmt + '"]');
  if (initialFmt) initialFmt.checked = true;

  var qInput = $("#q");
  if (qInput) qInput.value = state.q;

  TK.$$('input[name="fmt"]').forEach(function (r) {
    r.addEventListener("change", function () {
      state.fmt = r.value;
      render();
      schedule();
    });
  });

  if (qInput) {
    qInput.addEventListener("input", function (e) {
      state.q = +e.target.value;
      state.targetKb = null;
      TK.$$(".target-size-btn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      render();
      schedule();
    });
  }

  // Target-size quick presets (Strictly enforced target file sizes)
  document.querySelectorAll(".target-size-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".target-size-btn").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
      btn.setAttribute("aria-pressed", "true");
      var kb = parseInt(btn.dataset.targetKb, 10);
      state.targetKb = kb;
      render();
      schedule();
      if (window.TK && TK.toast) TK.toast("Target size set to " + kb + "KB.", "info");
    });
  });

  // Dimension and enlarge inputs
  var mwInput = $("#mw");
  if (mwInput) {
    mwInput.addEventListener("input", function (e) {
      state.mw = e.target.value;
      render();
      schedule();
    });
  }

  var mhInput = $("#mh");
  if (mhInput) {
    mhInput.addEventListener("input", function (e) {
      state.mh = e.target.value;
      render();
      schedule();
    });
  }

  var enlargeInput = $("#enlarge");
  if (enlargeInput) {
    enlargeInput.addEventListener("change", function (e) {
      state.enlarge = e.target.checked;
      render();
      schedule();
    });
  }

  var chipsBox = $("#chips");
  if (chipsBox) {
    chipsBox.addEventListener("click", function (e) {
      var btn = e.target.closest("button.chip");
      if (!btn) return;
      var w = btn.dataset.w || "";
      state.mw = w;
      state.mh = "";
      if (mwInput) mwInput.value = w;
      if (mhInput) mhInput.value = "";
      render();
      schedule();
    });
  }

  // Connect dropzone and file input across all image pages
  var drop = $("#drop");
  if (drop) {
    TK.dropzone(drop, addFiles, function (f) {
      return f.type.startsWith("image/") || /\.(jpe?g|png|webp|svg|gif|bmp|avif)$/i.test(f.name);
    });
  } else {
    var fileInp = $("#file");
    if (fileInp) {
      fileInp.addEventListener("change", function () {
        if (fileInp.files && fileInp.files.length) {
          addFiles(fileInp.files);
          fileInp.value = "";
        }
      });
    }
  }

  render();
})();
