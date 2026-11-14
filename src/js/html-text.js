// HTML to Text & Text to HTML
(function(){
  var tabH2T = document.getElementById('tabH2T');
  var tabT2H = document.getElementById('tabT2H');
  var inp = document.getElementById('htInput');
  var out = document.getElementById('htOutput');
  var convertBtn = document.getElementById('htConvert');
  var copyBtn = document.getElementById('htCopy');
  var clearBtn = document.getElementById('htClear');
  var optParagraphs = document.getElementById('htOptParagraphs');

  var mode = 'h2t';

  function setMode(m){
    mode = m;
    if(tabH2T && tabT2H){
      tabH2T.classList.toggle('active', mode === 'h2t');
      tabT2H.classList.toggle('active', mode === 't2h');
      tabH2T.setAttribute('aria-selected', mode === 'h2t');
      tabT2H.setAttribute('aria-selected', mode === 't2h');
    }
    if(optParagraphs) optParagraphs.style.display = (mode === 't2h') ? 'inline-flex' : 'none';
    if(inp) inp.placeholder = (mode === 'h2t') ? 'Paste HTML here to convert to clean text...' : 'Paste plain text here to convert to HTML...';
  }

  if(tabH2T) tabH2T.addEventListener('click', function(){ setMode('h2t'); });
  if(tabT2H) tabT2H.addEventListener('click', function(){ setMode('t2h'); });

  function htmlToText(html){
    var doc = new DOMParser().parseFromString(html, 'text/html');
    // Replace br with newline
    var brs = doc.querySelectorAll('br');
    brs.forEach(function(br){ br.replaceWith('\n'); });
    // Replace p and div with newline
    var blocks = doc.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li');
    blocks.forEach(function(b){ b.prepend('\n'); b.append('\n'); });
    var text = doc.body.textContent || "";
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }

  function textToHtml(text){
    var wrapP = document.getElementById('htWrapP') && document.getElementById('htWrapP').checked;
    function esc(s){
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }
    if(wrapP){
      var paras = text.split(/\n\s*\n/).filter(function(p){ return p.trim(); });
      return paras.map(function(p){
        var lines = p.split('\n').map(esc);
        return '<p>' + lines.join('<br>\n') + '</p>';
      }).join('\n\n');
    } else {
      return esc(text).replace(/\n/g, '<br>\n');
    }
  }

  function convert(){
    if(!inp || !out) return;
    if(mode === 'h2t'){
      out.value = htmlToText(inp.value);
    } else {
      out.value = textToHtml(inp.value);
    }
  }

  if(convertBtn) convertBtn.addEventListener('click', convert);
  if(inp) inp.addEventListener('input', convert);

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
