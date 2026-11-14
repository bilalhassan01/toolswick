// UUID v4 Generator
(function(){
  var countInp = document.getElementById('uuidCount');
  var upperCb = document.getElementById('uuidUpper');
  var noHyphensCb = document.getElementById('uuidNoHyphens');
  var out = document.getElementById('uuidOutput');
  var genBtn = document.getElementById('uuidGenerate');
  var copyBtn = document.getElementById('uuidCopy');
  var clearBtn = document.getElementById('uuidClear');

  function generateUUID(){
    if(window.crypto && window.crypto.randomUUID){
      return window.crypto.randomUUID();
    }
    // Fallback for older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  function generate(){
    if(!out || !countInp) return;
    var count = Math.min(50, Math.max(1, parseInt(countInp.value, 10) || 1));
    var isUpper = upperCb && upperCb.checked;
    var noHyphens = noHyphensCb && noHyphensCb.checked;

    var uuids = [];
    for(var i=0; i<count; i++){
      var u = generateUUID();
      if(noHyphens) u = u.replace(/-/g, '');
      if(isUpper) u = u.toUpperCase();
      uuids.push(u);
    }

    out.value = uuids.join('\n');
  }

  if(genBtn) genBtn.addEventListener('click', generate);
  if(countInp) countInp.addEventListener('change', generate);
  if(upperCb) upperCb.addEventListener('change', generate);
  if(noHyphensCb) noHyphensCb.addEventListener('change', generate);

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy All'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(out) out.value = '';
  });

  generate();
})();
