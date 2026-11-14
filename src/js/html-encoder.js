// HTML Entity Encoder & Decoder
(function(){
  var tabEnc = document.getElementById('tabHtmlEnc');
  var tabDec = document.getElementById('tabHtmlDec');
  var inp = document.getElementById('heInput');
  var out = document.getElementById('heOutput');
  var copyBtn = document.getElementById('heCopy');
  var clearBtn = document.getElementById('heClear');

  var mode = 'encode';

  function setMode(m){
    mode = m;
    if(tabEnc && tabDec){
      tabEnc.classList.toggle('active', mode === 'encode');
      tabDec.classList.toggle('active', mode === 'decode');
      tabEnc.setAttribute('aria-selected', mode === 'encode');
      tabDec.setAttribute('aria-selected', mode === 'decode');
    }
    if(inp) inp.placeholder = (mode === 'encode') ? 'Paste raw characters or markup to encode into HTML entities...' : 'Paste HTML entities (e.g. &amp;, &lt;, &#x2F;) to decode...';
    process();
  }

  if(tabEnc) tabEnc.addEventListener('click', function(){ setMode('encode'); });
  if(tabDec) tabDec.addEventListener('click', function(){ setMode('decode'); });

  function encodeEntities(str){
    return str.replace(/[&<>"']/g, function(c){
      switch(c){
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        case "'": return '&#039;';
        default: return c;
      }
    });
  }

  function decodeEntities(str){
    var textarea = document.createElement('textarea');
    textarea.innerHTML = str;
    return textarea.value;
  }

  function process(){
    if(!inp || !out) return;
    var val = inp.value;
    if(!val){ out.value = ''; return; }
    out.value = (mode === 'encode') ? encodeEntities(val) : decodeEntities(val);
  }

  if(inp) inp.addEventListener('input', process);

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
