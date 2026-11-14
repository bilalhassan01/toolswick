// wifi-qr.js - Client-Side WiFi QR Code Generator
(function () {
  'use strict';

  function init() {
    var ssidInp = document.getElementById('wifiSsidInput');
    var passInp = document.getElementById('wifiPassInput');
    var encSel = document.getElementById('wifiEncSelect');
    var hiddenCheck = document.getElementById('wifiHiddenCheck');
    var generateBtn = document.getElementById('wifiGenerateBtn');
    var canvas = document.getElementById('wifiQrCanvas');
    var downloadPngBtn = document.getElementById('wifiDownloadPngBtn');
    var printBtn = document.getElementById('wifiPrintCardBtn');

    if (!ssidInp || !canvas) return;

    if (window.qrcode && qrcode.stringToBytesFuncs) {
      qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];
    }

    function escapeWifiString(str) {
      return (str || '').replace(/\\/g, '\\\\')
                        .replace(/;/g, '\\;')
                        .replace(/,/g, '\\,')
                        .replace(/:/g, '\\:')
                        .replace(/"/g, '\\"');
    }

    function generateWifiString() {
      var ssid = escapeWifiString(ssidInp.value.trim());
      var pass = escapeWifiString(passInp ? passInp.value : '');
      var enc = encSel ? encSel.value : 'WPA';
      var isHidden = hiddenCheck && hiddenCheck.checked;

      // Standard WiFi QR format: WIFI:S:MySSID;T:WPA;P:MyPassword;H:false;;
      return 'WIFI:S:' + ssid + ';T:' + enc + ';P:' + pass + ';' + (isHidden ? 'H:true;' : '') + ';';
    }

    function renderQr() {
      if (typeof window.qrcode !== 'function') return;
      var text = generateWifiString();
      if (!ssidInp.value.trim()) return;

      var ctx = canvas.getContext('2d');
      var size = 360;
      var margin = 4;

      try {
        var qr = window.qrcode(0, 'M');
        qr.addData(text);
        qr.make();

        var count = qr.getModuleCount();
        var total = count + (margin * 2);
        var tile = size / total;

        canvas.width = size;
        canvas.height = size;

        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.fillStyle = '#000000';

        for (var r = 0; r < count; r++) {
          for (var c = 0; c < count; c++) {
            if (qr.isDark(r, c)) {
              ctx.fillRect((c + margin) * tile, (r + margin) * tile, tile + 0.6, tile + 0.6);
            }
          }
        }
      } catch (e) {
        console.error('Error rendering WiFi QR', e);
      }
    }

    if (generateBtn) generateBtn.addEventListener('click', renderQr);
    [ssidInp, passInp, encSel, hiddenCheck].forEach(function (el) {
      if (el) {
        el.addEventListener('input', renderQr);
        el.addEventListener('change', renderQr);
      }
    });

    if (downloadPngBtn) {
      downloadPngBtn.addEventListener('click', function () {
        var url = canvas.toDataURL('image/png');
        var a = document.createElement('a');
        a.href = url;
        a.download = 'wifi-qr-' + (ssidInp.value.trim() || 'network') + '.png';
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { document.body.removeChild(a); }, 500);
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', function () {
        window.print();
      });
    }

    setTimeout(renderQr, 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
