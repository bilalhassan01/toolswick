// Regex Tester
(function(){
  var patternIn = document.getElementById('rxPattern');
  var flagG = document.getElementById('rxFlagG');
  var flagI = document.getElementById('rxFlagI');
  var flagM = document.getElementById('rxFlagM');
  var flagS = document.getElementById('rxFlagS');
  var testIn = document.getElementById('rxText');
  var highlightEl = document.getElementById('rxHighlight');
  var matchesEl = document.getElementById('rxMatches');
  var countEl = document.getElementById('rxCount');
  var errEl = document.getElementById('rxErr');

  function escHtml(s){
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function testRegex(){
    if(!patternIn || !testIn) return;
    if(errEl) errEl.textContent = '';
    var pat = patternIn.value;
    var text = testIn.value;

    if(!pat){
      if(countEl) countEl.textContent = '0 matches';
      if(matchesEl) matchesEl.innerHTML = '<p class="hint">Enter a regular expression above.</p>';
      if(highlightEl) highlightEl.innerHTML = escHtml(text);
      return;
    }

    var flags = '';
    if(flagG && flagG.checked) flags += 'g';
    if(flagI && flagI.checked) flags += 'i';
    if(flagM && flagM.checked) flags += 'm';
    if(flagS && flagS.checked) flags += 's';

    var rx;
    try {
      rx = new RegExp(pat, flags);
    } catch(e) {
      if(errEl) errEl.textContent = 'Invalid RegExp: ' + e.message;
      if(countEl) countEl.textContent = 'Error';
      if(highlightEl) highlightEl.innerHTML = escHtml(text);
      if(matchesEl) matchesEl.innerHTML = '<p class="hint">Fix the pattern to see matches.</p>';
      return;
    }

    var matches = [];
    if(flags.indexOf('g') !== -1){
      var match;
      var lastIdx = 0;
      while((match = rx.exec(text)) !== null){
        matches.push(match);
        if(match.index === rx.lastIndex) rx.lastIndex++; // guard against zero-length matches loop
      }
    } else {
      var single = rx.exec(text);
      if(single) matches.push(single);
    }

    if(countEl) countEl.textContent = matches.length + ' match' + (matches.length === 1 ? '' : 'es');

    // Highlighting
    if(highlightEl){
      var html = '';
      var lastEnd = 0;
      matches.forEach(function(m){
        var start = m.index;
        var end = start + m[0].length;
        html += escHtml(text.slice(lastEnd, start));
        html += '<mark style="background:rgba(234,179,8,0.35); border-radius:3px; padding:1px 2px;">' + escHtml(m[0]) + '</mark>';
        lastEnd = end;
      });
      html += escHtml(text.slice(lastEnd));
      highlightEl.innerHTML = html || '<span class="hint">No text</span>';
    }

    // Match list
    if(matchesEl){
      if(matches.length === 0){
        matchesEl.innerHTML = '<p class="hint">No matches found.</p>';
      } else {
        var listHtml = matches.map(function(m, idx){
          var groups = '';
          if(m.length > 1){
            groups = '<div style="margin-top:4px; font-size:12px; color:var(--muted);">' +
              m.slice(1).map(function(g, gi){ return 'Group ' + (gi+1) + ': <code>' + escHtml(g !== undefined ? g : 'undefined') + '</code>'; }).join(' &bull; ') +
              '</div>';
          }
          return '<div style="padding:8px 12px; border:1px solid var(--line); border-radius:6px; margin-bottom:6px; background:var(--surface);">' +
            '<div><strong>Match ' + (idx + 1) + ':</strong> <code>' + escHtml(m[0]) + '</code> <span class="hint" style="font-size:12px; margin-left:8px;">[Index ' + m.index + ' - ' + (m.index + m[0].length) + ']</span></div>' +
            groups +
            '</div>';
        }).join('');
        matchesEl.innerHTML = listHtml;
      }
    }
  }

  [patternIn, testIn, flagG, flagI, flagM, flagS].forEach(function(el){
    if(el) el.addEventListener('input', testRegex);
    if(el) el.addEventListener('change', testRegex);
  });

  testRegex();
})();
