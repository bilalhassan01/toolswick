/* Toolswick SVG to PNG Converter - 100% Client-Side.
   Renders sanitized SVG to high-resolution PNG in browser memory. Zero uploads. */
(function () {
  "use strict";

  var $ = TK.$;
  var curSvgText = null;
  var curFileName = "graphic.svg";
  var naturalW = 300;
  var naturalH = 300;

  function show() {
    var panel = $("#panel");
    if (panel) panel.hidden = !curSvgText;
  }

  async function parseAndRender() {
    if (!curSvgText) return;
    var canvas = $("#previewCanvas");
    if (!canvas) return;

    var sanitized = TK.sanitizeSvg(curSvgText);
    var parser = new DOMParser();
    var doc = parser.parseFromString(sanitized, "image/svg+xml");
    var svgEl = doc.documentElement;

    var viewBox = svgEl.getAttribute("viewBox");
    var widthAttr = parseFloat(svgEl.getAttribute("width"));
    var heightAttr = parseFloat(svgEl.getAttribute("height"));

    if (viewBox) {
      var parts = viewBox.split(/[\s,]+/).map(parseFloat).filter(function (n) { return !isNaN(n); });
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        naturalW = Math.round(parts[2]);
        naturalH = Math.round(parts[3]);
      }
    } else if (widthAttr > 0 && heightAttr > 0) {
      naturalW = Math.round(widthAttr);
      naturalH = Math.round(heightAttr);
    }

    var scale = parseFloat($("#scaleSelect") ? $("#scaleSelect").value : "2") || 2;
    var customW = parseInt($("#customW") ? $("#customW").value : "0", 10) || 0;
    var customH = parseInt($("#customH") ? $("#customH").value : "0", 10) || 0;

    var targetW = customW > 0 ? customW : Math.round(naturalW * scale);
    var targetH = customH > 0 ? customH : Math.round(naturalH * scale);

    canvas.width = targetW;
    canvas.height = targetH;
    var ctx = canvas.getContext("2d");

    // Background color
    var bgChoice = $("#bgSelect") ? $("#bgSelect").value : "transparent";
    var customBg = $("#customBgColor") ? $("#customBgColor").value : "#ffffff";

    ctx.clearRect(0, 0, targetW, targetH);
    if (bgChoice === "white") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (bgChoice === "black") {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, targetW, targetH);
    } else if (bgChoice === "custom") {
      ctx.fillStyle = customBg;
      ctx.fillRect(0, 0, targetW, targetH);
    }

    // Render SVG into Image
    var blob = new Blob([sanitized], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var img = new Image();

    img.onload = function () {
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(url);
      var infoEl = $("#dimInfo");
      if (infoEl) {
        infoEl.textContent = targetW + " × " + targetH + " px (Original: " + naturalW + "×" + naturalH + ")";
      }
      var dlBtn = $("#downloadPngBtn");
      if (dlBtn) dlBtn.disabled = false;
    };

    img.onerror = function () {
      URL.revokeObjectURL(url);
      TK.toast("Failed to render SVG image.", "error");
    };

    img.src = url;
  }

  async function loadFiles(files) {
    var f = files[0];
    if (!f) return;
    try {
      var text = await f.text();
      // Sanitize immediately
      var cleanSvg = TK.sanitizeSvg(text);
      curSvgText = cleanSvg;
      curFileName = f.name || "vector.svg";
      show();
      parseAndRender();
      TK.toast("SVG loaded and sanitized successfully.", "success");
    } catch (e) {
      curSvgText = null;
      TK.toast("Invalid or dangerous SVG file: " + e.message, "error");
    }
  }

  var scaleSelect = $("#scaleSelect");
  if (scaleSelect) scaleSelect.addEventListener("change", parseAndRender);

  var bgSelect = $("#bgSelect");
  if (bgSelect) {
    bgSelect.addEventListener("change", function () {
      var customBgBox = $("#customBgBox");
      if (customBgBox) customBgBox.hidden = bgSelect.value !== "custom";
      parseAndRender();
    });
  }

  var customBgColor = $("#customBgColor");
  if (customBgColor) customBgColor.addEventListener("input", parseAndRender);

  var customW = $("#customW");
  if (customW) customW.addEventListener("input", parseAndRender);

  var customH = $("#customH");
  if (customH) customH.addEventListener("input", parseAndRender);

  var downloadPngBtn = $("#downloadPngBtn");
  if (downloadPngBtn) {
    downloadPngBtn.addEventListener("click", function () {
      var canvas = $("#previewCanvas");
      if (!canvas) return;
      canvas.toBlob(function (blob) {
        if (!blob) {
          TK.toast("Failed to export PNG.", "error");
          return;
        }
        var base = TK.baseName(curFileName);
        TK.save(base + ".png", blob);
        TK.toast("High-resolution PNG downloaded.", "success");
      }, "image/png");
    });
  }

  var clearBtn = $("#clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", function () {
      curSvgText = null;
      show();
    });
  }

  var drop = $("#drop");
  if (drop) {
    TK.dropzone(drop, loadFiles, function (f) {
      return f.type === "image/svg+xml" || /\.svg$/i.test(f.name);
    });
  }

  show();
})();
