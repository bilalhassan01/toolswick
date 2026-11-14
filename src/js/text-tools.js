// Text Tools — Multi-function
(function(){
  var tabs = document.querySelectorAll('.tt-tab');
  var inp = document.getElementById('ttInput');
  var out = document.getElementById('ttOutput');
  var processBtn = document.getElementById('ttProcess');
  var copyBtn = document.getElementById('ttCopy');
  var clearBtn = document.getElementById('ttClear');
  var sortOpts = document.getElementById('ttSortOpts');
  var currentMode = 'duplicates';

  tabs.forEach(function(tab){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t){ t.classList.remove('active'); t.setAttribute('aria-selected','false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected','true');
      currentMode = tab.dataset.mode;
      if(sortOpts) sortOpts.style.display = (currentMode === 'sort') ? 'flex' : 'none';
    });
  });

  function process(text, mode){
    var lines = text.split('\n');
    switch(mode){
      case 'duplicates':
        var seen = new Set();
        return lines.filter(function(l){ if(seen.has(l)) return false; seen.add(l); return true; }).join('\n');
      case 'sort':
        var dir = document.querySelector('input[name="ttSortDir"]:checked');
        var asc = !dir || dir.value === 'az';
        return lines.slice().sort(function(a,b){ return asc ? a.localeCompare(b) : b.localeCompare(a); }).join('\n');
      case 'spaces':
        return lines.map(function(l){ return l.trim().replace(/\s+/g,' '); }).join('\n');
      case 'blank':
        return lines.filter(function(l){ return l.trim().length > 0; }).join('\n');
      case 'reverse':
        return text.split('').reverse().join('');
      case 'formatting':
        return text
          .replace(/[\u00A0\u2007\u202F\u200B\u200C\u200D\uFEFF]/g, ' ')
          .replace(/[\u2018\u2019]/g, "'")
          .replace(/[\u201C\u201D]/g, '"')
          .replace(/[\u2013\u2014]/g, '-')
          .replace(/\r\n/g, '\n')
          .replace(/[ \t]+$/gm, '');
      default:
        return text;
    }
  }

  if(processBtn) processBtn.addEventListener('click', function(){
    out.value = process(inp.value, currentMode);
  });

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy'; }, 1500);
    });
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    inp.value = '';
    out.value = '';
    inp.focus();
  });
})();
