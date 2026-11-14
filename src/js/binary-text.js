// Text to Binary & Binary to Text
(function(){
  var tabT2B = document.getElementById('tabT2B');
  var tabB2T = document.getElementById('tabB2T');
  var inp = document.getElementById('btInput');
  var out = document.getElementById('btOutput');
  var delimSpace = document.getElementById('btDelimSpace');
  var delimNone = document.getElementById('btDelimNone');
  var convertBtn = document.getElementById('btConvert');
  var copyBtn = document.getElementById('btCopy');
  var clearBtn = document.getElementById('btClear');

  var mode = 't2b';

  function setMode(m){
    mode = m;
    if(tabT2B && tabB2T){
      tabT2B.classList.toggle('active', mode === 't2b');
      tabB2T.classList.toggle('active', mode === 'b2t');
      tabT2B.setAttribute('aria-selected', mode === 't2b');
      tabB2T.setAttribute('aria-selected', mode === 'b2t');
    }
    if(inp) inp.placeholder = (mode === 't2b') ? 'Enter text to convert to binary...' : 'Enter 8-bit binary digits (e.g. 01001000 01101001)...';
  }

  if(tabT2B) tabT2B.addEventListener('click', function(){ setMode('t2b'); });
  if(tabB2T) tabB2T.addEventListener('click', function(){ setMode('b2t'); });

  function textToBinary(str, delimiter){
    var bytes = new TextEncoder().encode(str);
    var binArr = [];
    for(var i=0; i<bytes.length; i++){
      var b = bytes[i].toString(2);
      while(b.length < 8) b = '0' + b;
      binArr.push(b);
    }
    return binArr.join(delimiter);
  }

  function binaryToText(binStr){
    var cleaned = binStr.replace(/[^01]/g, ' ');
    var chunks = cleaned.trim().split(/\s+/).filter(Boolean);
    var bytes = [];
    chunks.forEach(function(c){
      if(c.length <= 8){
        bytes.push(parseInt(c, 2));
      } else {
        for(var i=0; i<c.length; i+=8){
          var sub = c.slice(i, i+8);
          bytes.push(parseInt(sub, 2));
        }
      }
    });
    try {
      return new TextDecoder().decode(new Uint8Array(bytes));
    } catch(e) {
      return bytes.map(function(b){ return String.fromCharCode(b); }).join('');
    }
  }

  function convert(){
    if(!inp || !out) return;
    var delim = (delimNone && delimNone.checked) ? '' : ' ';
    if(mode === 't2b'){
      out.value = textToBinary(inp.value, delim);
    } else {
      out.value = binaryToText(inp.value);
    }
  }

  if(convertBtn) convertBtn.addEventListener('click', convert);
  if(inp) inp.addEventListener('input', convert);
  if(delimSpace) delimSpace.addEventListener('change', convert);
  if(delimNone) delimNone.addEventListener('change', convert);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy Output'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    if(out) out.value = '';
    if(inp) inp.focus();
  });
})();
