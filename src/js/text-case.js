// Text Case Converter
(function(){
  var inp = document.getElementById('tcInput');
  var out = document.getElementById('tcOutput');
  var copyBtn = document.getElementById('tcCopy');
  var clearBtn = document.getElementById('tcClear');

  function toTitleCase(s){
    return s.replace(/\w\S*/g, function(w){ return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); });
  }
  function toSentenceCase(s){
    return s.replace(/(^\s*\w|[.!?]\s+\w)/g, function(c){ return c.toUpperCase(); }).replace(/(^\s*\w)/g, function(c){ return c.toUpperCase(); });
  }
  function toCamelCase(s){
    return s.replace(/[^a-zA-Z0-9]+(.)/g, function(_, c){ return c.toUpperCase(); }).replace(/^./, function(c){ return c.toLowerCase(); });
  }
  function toPascalCase(s){
    return s.replace(/[^a-zA-Z0-9]+(.)/g, function(_, c){ return c.toUpperCase(); }).replace(/^./, function(c){ return c.toUpperCase(); });
  }
  function toSnakeCase(s){
    return s.trim().replace(/[^a-zA-Z0-9]+/g, '_').replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().replace(/^_|_$/g,'');
  }
  function toKebabCase(s){
    return s.trim().replace(/[^a-zA-Z0-9]+/g, '-').replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase().replace(/^-|-$/g,'');
  }

  var transforms = {
    'tcUpper': function(s){ return s.toUpperCase(); },
    'tcLower': function(s){ return s.toLowerCase(); },
    'tcTitle': toTitleCase,
    'tcSentence': toSentenceCase,
    'tcCamel': toCamelCase,
    'tcPascal': toPascalCase,
    'tcSnake': toSnakeCase,
    'tcKebab': toKebabCase
  };

  Object.keys(transforms).forEach(function(id){
    var btn = document.getElementById(id);
    if(btn) btn.addEventListener('click', function(){
      out.value = transforms[id](inp.value);
    });
  });

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy Output'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    inp.value = '';
    out.value = '';
    inp.focus();
  });
})();
