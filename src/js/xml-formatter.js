// XML Formatter & Validator
(function(){
  var inp = document.getElementById('xmlInput');
  var out = document.getElementById('xmlOutput');
  var fileIn = document.getElementById('xmlFile');
  var fmtBtn = document.getElementById('xmlFormat');
  var minBtn = document.getElementById('xmlMinify');
  var copyBtn = document.getElementById('xmlCopy');
  var clearBtn = document.getElementById('xmlClear');
  var statusEl = document.getElementById('xmlStatus');

  function formatXml(xml){
    var reg = /(>)(<)(\/*)/g;
    var w = xml.replace(reg, '$1\r\n$2$3');
    var pad = 0;
    var formatted = '';
    var lines = w.split('\r\n');
    lines.forEach(function(node){
      var indent = 0;
      if(node.match(/.+<\/\w[^>]*>$/)){
        indent = 0;
      } else if(node.match(/^<\/\w/)){
        if(pad !== 0) pad -= 1;
      } else if(node.match(/^<\w[^>]*[^\/]>.*$/)){
        indent = 1;
      } else {
        indent = 0;
      }
      var padding = '';
      for(var i=0; i<pad; i++) padding += '  ';
      formatted += padding + node.trim() + '\r\n';
      pad += indent;
    });
    return formatted.trim();
  }

  function minifyXml(xml){
    return xml.replace(/>\s+</g, '><').replace(/<!--[\s\S]*?-->/g, '').trim();
  }

  function validate(xml){
    var parser = new DOMParser();
    var doc = parser.parseFromString(xml, 'application/xml');
    var err = doc.querySelector('parsererror');
    if(err){
      return { valid: false, message: err.textContent.replace(/Below is a rendering of the page.*$/s, '').trim() };
    }
    return { valid: true };
  }

  function run(isMinify){
    if(!inp || !out) return;
    var text = inp.value.trim();
    if(!text){
      out.value = '';
      if(statusEl) statusEl.textContent = '';
      return;
    }
    var res = validate(text);
    if(!res.valid){
      if(statusEl){
        statusEl.className = 'bad';
        statusEl.textContent = '✗ XML Syntax Error: ' + res.message;
      }
      out.value = '';
      return;
    }
    if(statusEl){
      statusEl.className = 'ok';
      statusEl.textContent = '✓ Valid XML structure';
    }
    out.value = isMinify ? minifyXml(text) : formatXml(text);
  }

  if(fmtBtn) fmtBtn.addEventListener('click', function(){ run(false); });
  if(minBtn) minBtn.addEventListener('click', function(){ run(true); });

  if(fileIn){
    fileIn.addEventListener('change', function(e){
      var f = e.target.files && e.target.files[0];
      if(!f) return;
      var reader = new FileReader();
      reader.onload = function(evt){
        inp.value = evt.target.result;
        run(false);
      };
      reader.readAsText(f);
    });
  }

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
    if(statusEl) statusEl.textContent = '';
    if(inp) inp.focus();
  });
})();
