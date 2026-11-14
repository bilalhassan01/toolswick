// Find and Replace
(function(){
  var inp = document.getElementById('frInput');
  var find = document.getElementById('frFind');
  var replace = document.getElementById('frReplace');
  var caseCb = document.getElementById('frCase');
  var regexCb = document.getElementById('frRegex');
  var out = document.getElementById('frOutput');
  var matchCount = document.getElementById('frMatchCount');
  var replaceBtn = document.getElementById('frReplaceBtn');
  var copyBtn = document.getElementById('frCopy');

  function doReplace(){
    var text = inp.value;
    var needle = find.value;
    if(!needle){ out.value = text; if(matchCount) matchCount.textContent = ''; return; }
    var flags = 'g' + (caseCb && !caseCb.checked ? 'i' : '');
    var rx;
    if(regexCb && regexCb.checked){
      try { rx = new RegExp(needle, flags); }
      catch(e){ if(matchCount) matchCount.textContent = 'Invalid regex: ' + e.message; return; }
    } else {
      rx = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags);
    }
    var count = 0;
    var result = text.replace(rx, function(m){ count++; return replace.value; });
    out.value = result;
    if(matchCount) matchCount.textContent = count + ' match' + (count !== 1 ? 'es' : '') + ' replaced';
  }

  if(replaceBtn) replaceBtn.addEventListener('click', doReplace);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1500);
    });
  });
})();
