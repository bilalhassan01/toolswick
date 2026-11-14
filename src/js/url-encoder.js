// URL Encoder & Decoder
(function(){
  var tabEnc = document.getElementById('tabUrlEnc');
  var tabDec = document.getElementById('tabUrlDec');
  var inp = document.getElementById('urlInput');
  var out = document.getElementById('urlOutput');
  var fullUrlCb = document.getElementById('urlFull');
  var copyBtn = document.getElementById('urlCopy');
  var clearBtn = document.getElementById('urlClear');

  var mode = 'encode';

  function setMode(m){
    mode = m;
    if(tabEnc && tabDec){
      tabEnc.classList.toggle('active', mode === 'encode');
      tabDec.classList.toggle('active', mode === 'decode');
      tabEnc.setAttribute('aria-selected', mode === 'encode');
      tabDec.setAttribute('aria-selected', mode === 'decode');
    }
    if(fullUrlCb) fullUrlCb.parentElement.style.display = (mode === 'encode') ? 'inline-flex' : 'none';
    if(inp) inp.placeholder = (mode === 'encode') ? 'Enter text or URL to encode...' : 'Enter percent-encoded URL string to decode...';
    process();
  }

  if(tabEnc) tabEnc.addEventListener('click', function(){ setMode('encode'); });
  if(tabDec) tabDec.addEventListener('click', function(){ setMode('decode'); });

  function process(){
    if(!inp || !out) return;
    var val = inp.value;
    if(!val){ out.value = ''; return; }
    try {
      if(mode === 'encode'){
        var isFull = fullUrlCb && fullUrlCb.checked;
        out.value = isFull ? encodeURI(val) : encodeURIComponent(val);
      } else {
        out.value = decodeURIComponent(val.replace(/\+/g, ' '));
      }
    } catch(e) {
      out.value = 'Error: ' + e.message;
    }
  }

  if(inp) inp.addEventListener('input', process);
  if(fullUrlCb) fullUrlCb.addEventListener('change', process);

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
