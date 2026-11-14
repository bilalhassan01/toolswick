/* Toolswick QR Code Generator - 100% Client-Side. */
(function () {
  "use strict";

  var $ = TK.$;
  if (window.qrcode && qrcode.stringToBytesFuncs) {
    qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
  }

  var qr = null;
  var currentMode = "url";

  function updateContentFromTabs() {
    var qtext = $("#qtext");
    if (!qtext) return;

    if (currentMode === "wifi") {
      var ssid = ($("#qrWifiSsid") ? $("#qrWifiSsid").value : "").trim();
      var pass = ($("#qrWifiPass") ? $("#qrWifiPass").value : "");
      var enc = $("#qrWifiEnc") ? $("#qrWifiEnc").value : "WPA";
      var hidden = $("#qrWifiHidden") && $("#qrWifiHidden").checked;
      if (ssid) {
        qtext.value = "WIFI:S:" + ssid + ";T:" + enc + ";P:" + pass + ";" + (hidden ? "H:true;" : "") + ";";
      }
    } else if (currentMode === "vcard") {
      var fn = ($("#qrVcName") ? $("#qrVcName").value : "").trim();
      var tel = ($("#qrVcTel") ? $("#qrVcTel").value : "").trim();
      var email = ($("#qrVcEmail") ? $("#qrVcEmail").value : "").trim();
      var org = ($("#qrVcOrg") ? $("#qrVcOrg").value : "").trim();
      if (fn || tel || email) {
        qtext.value = "BEGIN:VCARD\nVERSION:3.0\nFN:" + fn + "\nORG:" + org + "\nTEL:" + tel + "\nEMAIL:" + email + "\nEND:VCARD";
      }
    } else if (currentMode === "email") {
      var to = ($("#qrEmailTo") ? $("#qrEmailTo").value : "").trim();
      var subj = ($("#qrEmailSubj") ? $("#qrEmailSubj").value : "").trim();
      var body = ($("#qrEmailBody") ? $("#qrEmailBody").value : "").trim();
      if (to) {
        var params = [];
        if (subj) params.push("subject=" + encodeURIComponent(subj));
        if (body) params.push("body=" + encodeURIComponent(body));
        qtext.value = "mailto:" + to + (params.length ? "?" + params.join("&") : "");
      }
    } else if (currentMode === "sms") {
      var num = ($("#qrSmsNum") ? $("#qrSmsNum").value : "").trim();
      var msg = ($("#qrSmsMsg") ? $("#qrSmsMsg").value : "").trim();
      if (num) {
        qtext.value = "smsto:" + num + ":" + msg;
      }
    }
  }

  function build() {
    updateContentFromTabs();
    var qtext = $("#qtext");
    var qmsg = $("#qmsg");
    var text = qtext ? qtext.value : "";

    if (!text.trim()) {
      qr = null;
      if (qmsg) qmsg.textContent = "Enter text or details to generate a QR code.";
      draw();
      return;
    }

    try {
      var ec = $("#qec") ? $("#qec").value : "M";
      var q = window.qrcode(0, ec);
      q.addData(text);
      q.make();
      qr = q;
      if (qmsg) qmsg.textContent = "";
    } catch (e) {
      qr = null;
      if (qmsg) qmsg.textContent = "Content is too long for this error correction level. Shorten the text or choose 'Low'.";
    }
    draw();
  }

  function draw() {
    var c = $("#qcanvas");
    if (!c) return;
    var ctx = c.getContext("2d");
    var size = parseInt($("#qsize") ? $("#qsize").value : "512", 10) || 512;
    var bg = $("#qbg") ? $("#qbg").value : "#ffffff";
    var fg = $("#qfg") ? $("#qfg").value : "#000000";

    var qpng = $("#qpng");
    var qsvg = $("#qsvg");
    if (qpng) qpng.disabled = !qr;
    if (qsvg) qsvg.disabled = !qr;

    c.width = c.height = size;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, size, size);

    if (!qr) return;

    var n = qr.getModuleCount();
    var quiet = 4;
    var cell = size / (n + quiet * 2);
    ctx.fillStyle = fg;

    for (var r = 0; r < n; r++) {
      for (var k = 0; k < n; k++) {
        if (qr.isDark(r, k)) {
          ctx.fillRect(
            Math.floor((k + quiet) * cell),
            Math.floor((r + quiet) * cell),
            Math.ceil(cell),
            Math.ceil(cell)
          );
        }
      }
    }
  }

  function generateSvg() {
    if (!qr) return "";
    var bg = $("#qbg") ? $("#qbg").value : "#ffffff";
    var fg = $("#qfg") ? $("#qfg").value : "#000000";
    var n = qr.getModuleCount();
    var quiet = 4;
    var totalCells = n + quiet * 2;
    var pathD = "";

    for (var r = 0; r < n; r++) {
      for (var k = 0; k < n; k++) {
        if (qr.isDark(r, k)) {
          pathD += "M" + (k + quiet) + " " + (r + quiet) + "h1v1h-1z";
        }
      }
    }

    return (
      '<?xml version="1.0" encoding="UTF-8"?>\n' +
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + totalCells + " " + totalCells + '" shape-rendering="crispEdges">\n' +
      '  <rect width="' + totalCells + '" height="' + totalCells + '" fill="' + bg + '"/>\n' +
      '  <path d="' + pathD + '" fill="' + fg + '"/>\n' +
      "</svg>"
    );
  }

  // Setup mode tabs
  var tabs = TK.$$(".qr-mode-tab");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); });
      tab.classList.add("active");
      currentMode = tab.dataset.mode || "url";

      TK.$$(".qr-tab-panel").forEach(function (p) { p.style.display = "none"; });
      var activePanel = $("#qrPanel_" + currentMode);
      if (activePanel) activePanel.style.display = "block";

      build();
    });
  });

  TK.$$("input,select,textarea").forEach(function (i) {
    i.addEventListener("input", build);
    i.addEventListener("change", build);
  });

  var qpngBtn = $("#qpng");
  if (qpngBtn) {
    qpngBtn.addEventListener("click", function () {
      var c = $("#qcanvas");
      if (!c) return;
      c.toBlob(function (blob) {
        if (blob) {
          TK.save("toolswick-qr-code.png", blob);
          TK.toast("QR Code PNG downloaded.", "success");
        }
      }, "image/png");
    });
  }

  var qsvgBtn = $("#qsvg");
  if (qsvgBtn) {
    qsvgBtn.addEventListener("click", function () {
      if (!qr) return;
      var rawSvg = generateSvg();
      var safeSvg = TK.sanitizeSvg(rawSvg);
      var blob = new Blob([safeSvg], { type: "image/svg+xml;charset=utf-8" });
      TK.save("toolswick-qr-code.svg", blob);
      TK.toast("QR Code SVG downloaded.", "success");
    });
  }

  build();
})();
