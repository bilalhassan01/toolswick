// URL Slug Generator
(function(){
  var inp = document.getElementById('slugInput');
  var out = document.getElementById('slugOutput');
  var copyBtn = document.getElementById('slugCopy');
  var genBtn = document.getElementById('slugGenerate');
  var stopWordsCb = document.getElementById('slugStopWords');

  var STOP_WORDS = new Set([
    'a','an','the','and','or','but','in','on','at','to','for','of','with',
    'by','from','up','about','into','through','during','is','are','was',
    'were','be','been','being','have','has','had','do','does','did','will',
    'would','could','should','may','might','must','can','this','that','these',
    'those','it','its','as','if','than'
  ]);

  function generateSlug(text){
    var sep = document.querySelector('input[name="slugSep"]:checked');
    var separator = sep ? sep.value : '-';

    var slug = text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .split(/\s+/);

    if(stopWordsCb && stopWordsCb.checked){
      var filtered = slug.filter(function(w){ return !STOP_WORDS.has(w) && w.length > 0; });
      slug = filtered.length > 0 ? filtered : slug;
    }

    return slug.filter(Boolean).join(separator);
  }

  function update(){
    if(!inp || !out) return;
    out.value = generateSlug(inp.value);
  }

  if(inp) inp.addEventListener('input', update);
  if(genBtn) genBtn.addEventListener('click', update);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1500);
    });
  });

  // Also trigger when separator changes
  document.querySelectorAll('input[name="slugSep"]').forEach(function(r){
    r.addEventListener('change', update);
  });
  if(stopWordsCb) stopWordsCb.addEventListener('change', update);
})();
