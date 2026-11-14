// Cryptographic Hash Generator & File Checksum (MD5, SHA-1, SHA-256, SHA-384, SHA-512)
(function(){
  'use strict';

  var tabText = document.getElementById('tabHashText');
  var tabFile = document.getElementById('tabHashFile');
  var textSec = document.getElementById('secHashText');
  var fileSec = document.getElementById('secHashFile');
  var algoSel = document.getElementById('hashAlgo');
  var algoLabel = document.getElementById('hashAlgoLabel');
  var fileAlgoLabel = document.getElementById('hashFileAlgoLabel');

  var textIn = document.getElementById('hashTextInput');
  var hashOut = document.getElementById('hashOutput');
  var copyBtn = document.getElementById('hashCopy');

  var fileIn = document.getElementById('hashFileInput');
  var fileDrop = document.getElementById('hashDrop');
  var fileName = document.getElementById('hashFileName');
  var fileHashOut = document.getElementById('hashFileOutput');
  var copyFileBtn = document.getElementById('hashFileCopy');
  var compareIn = document.getElementById('hashCompareInput');
  var compareResult = document.getElementById('hashCompareResult');

  var mode = 'text';
  var currentFile = null;

  // Pure JavaScript MD5 Implementation (RFC 1321 compliant, client-side offline)
  function md5(bytes) {
    if (typeof bytes === 'string') {
      var unencoded = unescape(encodeURIComponent(bytes));
      bytes = new Uint8Array(unencoded.length);
      for (var i = 0; i < unencoded.length; i++) bytes[i] = unencoded.charCodeAt(i);
    } else if (bytes instanceof ArrayBuffer) {
      bytes = new Uint8Array(bytes);
    }
    var len = bytes.length;
    var nwords = ((len + 8) >> 6) + 1;
    var words = new Int32Array(nwords * 16);
    for (var i = 0; i < len; i++) {
      words[i >> 2] |= bytes[i] << ((i % 4) * 8);
    }
    words[len >> 2] |= 0x80 << ((len % 4) * 8);
    words[nwords * 16 - 2] = len * 8;

    function safeAdd(x, y) {
      var lsw = (x & 0xffff) + (y & 0xffff);
      var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
      return (msw << 16) | (lsw & 0xffff);
    }
    function cmn(q, a, b, x, s, t) {
      var res = safeAdd(safeAdd(a, q), safeAdd(x, t));
      return safeAdd((res << s) | (res >>> (32 - s)), b);
    }
    function ff(a, b, c, d, x, s, t) { return cmn((b & c) | ((~b) & d), a, b, x, s, t); }
    function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & (~d)), a, b, x, s, t); }
    function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
    function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | (~d)), a, b, x, s, t); }

    var a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;

    for (var i = 0; i < words.length; i += 16) {
      var olda = a, oldb = b, oldc = c, oldd = d;
      a = ff(a, b, c, d, words[i + 0], 7, -680876936);
      d = ff(d, a, b, c, words[i + 1], 12, -389564586);
      c = ff(c, d, a, b, words[i + 2], 17, 606105819);
      b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
      a = ff(a, b, c, d, words[i + 4], 7, -176418897);
      d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
      c = ff(c, d, a, b, words[i + 6], 17, -1473231341);
      b = ff(b, c, d, a, words[i + 7], 22, -45705983);
      a = ff(a, b, c, d, words[i + 8], 7, 1770035416);
      d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
      c = ff(c, d, a, b, words[i + 10], 17, -42063);
      b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
      a = ff(a, b, c, d, words[i + 12], 7, 1804603682);
      d = ff(d, a, b, c, words[i + 13], 12, -40341101);
      c = ff(c, d, a, b, words[i + 14], 17, -1502002290);
      b = ff(b, c, d, a, words[i + 15], 22, 1236535329);

      a = gg(a, b, c, d, words[i + 1], 5, -165796510);
      d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
      c = gg(c, d, a, b, words[i + 11], 14, 643717713);
      b = gg(b, c, d, a, words[i + 0], 20, -373897302);
      a = gg(a, b, c, d, words[i + 5], 5, -701558691);
      d = gg(d, a, b, c, words[i + 10], 9, 38016083);
      c = gg(c, d, a, b, words[i + 15], 14, -660478335);
      b = gg(b, c, d, a, words[i + 4], 20, -405537848);
      a = gg(a, b, c, d, words[i + 9], 5, 568446438);
      d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
      c = gg(c, d, a, b, words[i + 3], 14, -187363961);
      b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
      a = gg(a, b, c, d, words[i + 13], 5, -1444681467);
      d = gg(d, a, b, c, words[i + 2], 9, -51403784);
      c = gg(c, d, a, b, words[i + 7], 14, 1735328473);
      b = gg(b, c, d, a, words[i + 12], 20, -1926607734);

      a = hh(a, b, c, d, words[i + 5], 4, -378558);
      d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
      c = hh(c, d, a, b, words[i + 11], 16, 1839030562);
      b = hh(b, c, d, a, words[i + 14], 23, -35309556);
      a = hh(a, b, c, d, words[i + 1], 4, -1530992060);
      d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
      c = hh(c, d, a, b, words[i + 7], 16, -155497632);
      b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
      a = hh(a, b, c, d, words[i + 13], 4, 681279174);
      d = hh(d, a, b, c, words[i + 0], 11, -358537222);
      c = hh(c, d, a, b, words[i + 3], 16, -722521979);
      b = hh(b, c, d, a, words[i + 6], 23, 76029189);
      a = hh(a, b, c, d, words[i + 9], 4, -640364487);
      d = hh(d, a, b, c, words[i + 12], 11, -421815835);
      c = hh(c, d, a, b, words[i + 15], 16, 530742520);
      b = hh(b, c, d, a, words[i + 2], 23, -995338651);

      a = ii(a, b, c, d, words[i + 0], 6, -198630844);
      d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
      c = ii(c, d, a, b, words[i + 14], 15, -1416354905);
      b = ii(b, c, d, a, words[i + 5], 21, -57434055);
      a = ii(a, b, c, d, words[i + 12], 6, 1700485571);
      d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
      c = ii(c, d, a, b, words[i + 10], 15, -1051523);
      b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
      a = ii(a, b, c, d, words[i + 8], 6, 1873313359);
      d = ii(d, a, b, c, words[i + 15], 10, -30611744);
      c = ii(c, d, a, b, words[i + 6], 15, -1560198380);
      b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
      a = ii(a, b, c, d, words[i + 4], 6, -145523070);
      d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
      c = ii(c, d, a, b, words[i + 2], 15, 718787259);
      b = ii(b, c, d, a, words[i + 9], 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }

    function rhex(n) {
      var s = '', j;
      for (j = 0; j <= 3; j++) s += ((n >> (j * 8 + 4)) & 0x0f).toString(16) + ((n >> (j * 8)) & 0x0f).toString(16);
      return s;
    }
    return (rhex(a) + rhex(b) + rhex(c) + rhex(d)).toLowerCase();
  }

  function setMode(newMode){
    mode = newMode;
    if(tabText && tabFile){
      tabText.className = mode === 'text' ? 'btn active' : 'btn ghost';
      tabFile.className = mode === 'file' ? 'btn active' : 'btn ghost';
      tabText.setAttribute('aria-selected', mode === 'text');
      tabFile.setAttribute('aria-selected', mode === 'file');
    }
    if(textSec && fileSec){
      textSec.style.display = mode === 'text' ? 'block' : 'none';
      fileSec.style.display = mode === 'file' ? 'block' : 'none';
    }
  }

  if(tabText) tabText.addEventListener('click', function(){ setMode('text'); });
  if(tabFile) tabFile.addEventListener('click', function(){ setMode('file'); });

  function bufToHex(buffer) {
    var byteArray = new Uint8Array(buffer);
    var hexCodes = [];
    for (var i = 0; i < byteArray.length; i++) {
      var hex = byteArray[i].toString(16);
      if (hex.length < 2) hex = '0' + hex;
      hexCodes.push(hex);
    }
    return hexCodes.join('');
  }

  async function calculateHash(algo, dataBuffer) {
    if (algo === 'MD5') {
      return md5(dataBuffer);
    }
    var hashBuffer = await window.crypto.subtle.digest(algo, dataBuffer);
    return bufToHex(hashBuffer);
  }

  async function hashText(){
    if(!textIn || !hashOut) return;
    var str = textIn.value;
    var algo = algoSel ? algoSel.value : 'SHA-256';
    if (algoLabel) algoLabel.textContent = algo;
    if (fileAlgoLabel) fileAlgoLabel.textContent = algo;

    if(!str){
      hashOut.value = '';
      return;
    }
    try {
      var encoder = new TextEncoder();
      var data = encoder.encode(str);
      var hex = await calculateHash(algo, data.buffer);
      hashOut.value = hex;
    } catch(e) {
      hashOut.value = 'Error: ' + e.message;
    }
  }

  async function hashFile(file){
    if(!file || !fileHashOut) return;
    currentFile = file;
    var algo = algoSel ? algoSel.value : 'SHA-256';
    if (algoLabel) algoLabel.textContent = algo;
    if (fileAlgoLabel) fileAlgoLabel.textContent = algo;
    if(fileName) fileName.textContent = file.name + ' (' + (file.size / 1024).toFixed(1) + ' KB)';
    fileHashOut.value = 'Calculating ' + algo + ' hash...';
    try {
      var arrayBuffer = await file.arrayBuffer();
      var hex = await calculateHash(algo, arrayBuffer);
      fileHashOut.value = hex;
      checkCompare();
    } catch(e) {
      fileHashOut.value = 'Error reading file: ' + e.message;
    }
  }

  function checkCompare(){
    if(!compareIn || !compareResult || !fileHashOut) return;
    var expected = compareIn.value.trim().toLowerCase();
    var actual = fileHashOut.value.trim().toLowerCase();
    if(!expected || !actual || actual.startsWith('Error') || actual.startsWith('Calc')){
      compareResult.textContent = '';
      compareResult.className = '';
      return;
    }
    if(expected === actual){
      compareResult.className = 'ok';
      compareResult.style.color = '#10b981';
      compareResult.textContent = '✓ Checksum Match! The file matches the expected hash exactly.';
    } else {
      compareResult.className = 'bad';
      compareResult.style.color = '#ef4444';
      compareResult.textContent = '✗ Checksum Mismatch! File hash differs from the expected hash.';
    }
  }

  if(algoSel) {
    algoSel.addEventListener('change', function(){
      if (algoLabel) algoLabel.textContent = algoSel.value;
      if (fileAlgoLabel) fileAlgoLabel.textContent = algoSel.value;
      if (mode === 'text') {
        hashText();
      } else if (currentFile) {
        hashFile(currentFile);
      }
    });
  }

  if(textIn) textIn.addEventListener('input', hashText);
  if(compareIn) compareIn.addEventListener('input', checkCompare);

  if(fileIn){
    fileIn.addEventListener('change', function(e){
      var f = e.target.files && e.target.files[0];
      if(f) hashFile(f);
    });
  }

  if(fileDrop){
    fileDrop.addEventListener('dragover', function(e){ e.preventDefault(); fileDrop.style.borderColor = 'var(--accent)'; });
    fileDrop.addEventListener('dragleave', function(){ fileDrop.style.borderColor = ''; });
    fileDrop.addEventListener('drop', function(e){
      e.preventDefault();
      fileDrop.style.borderColor = '';
      var f = e.dataTransfer.files && e.dataTransfer.files[0];
      if(f) hashFile(f);
    });
    fileDrop.addEventListener('click', function(){
      if (fileIn) fileIn.click();
    });
  }

  if(copyBtn && hashOut){
    copyBtn.addEventListener('click', function(){
      if(!hashOut.value) return;
      navigator.clipboard.writeText(hashOut.value).then(function(){
        copyBtn.textContent = 'Copied!';
        setTimeout(function(){ copyBtn.textContent = 'Copy Hash'; }, 1500);
      });
    });
  }

  if(copyFileBtn && fileHashOut){
    copyFileBtn.addEventListener('click', function(){
      if(!fileHashOut.value || fileHashOut.value.startsWith('Calc')) return;
      navigator.clipboard.writeText(fileHashOut.value).then(function(){
        copyFileBtn.textContent = 'Copied!';
        setTimeout(function(){ copyFileBtn.textContent = 'Copy Hash'; }, 1500);
      });
    });
  }

  hashText();
})();
