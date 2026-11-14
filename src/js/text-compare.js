// Text Compare
(function(){
  var aEl = document.getElementById('tcaInput');
  var bEl = document.getElementById('tcbInput');
  var compareBtn = document.getElementById('tcCompare');
  var statsEl = document.getElementById('tcStats');
  var diffEl = document.getElementById('tcDiff');

  if(!compareBtn) return;

  compareBtn.addEventListener('click', function(){
    var linesA = aEl.value.split('\n');
    var linesB = bEl.value.split('\n');
    var setA = new Set(linesA);
    var setB = new Set(linesB);

    var onlyA = linesA.filter(function(l){ return !setB.has(l); });
    var onlyB = linesB.filter(function(l){ return !setA.has(l); });
    var common = linesA.filter(function(l){ return setB.has(l); });

    if(statsEl){
      statsEl.innerHTML =
        '<span>Lines A: <strong>' + linesA.length + '</strong></span>' +
        '<span>Lines B: <strong>' + linesB.length + '</strong></span>' +
        '<span>Matches: <strong>' + common.length + '</strong></span>' +
        '<span>Differences: <strong>' + (onlyA.length + onlyB.length) + '</strong></span>';
    }

    if(diffEl){
      var html = '';
      var allLines = [];
      linesA.forEach(function(l){ allLines.push({line: l, side:'A'}); });
      linesB.forEach(function(l){ allLines.push({line: l, side:'B'}); });

      // Show green for only-A, red for only-B, grey for common (deduplicated display)
      var shown = new Set();
      var parts = [];

      // Build merged display: common first sorted, then unique-A, unique-B
      var setCommon = new Set(common);
      var setOnlyA = new Set(onlyA);
      var setOnlyB = new Set(onlyB);

      // Show in order of appearance in A then B
      var seen = new Set();
      linesA.concat(linesB).forEach(function(l){
        if(seen.has(l)) return;
        seen.add(l);
        var cls = setCommon.has(l) ? 'diff-common' : (setOnlyA.has(l) ? 'diff-a' : 'diff-b');
        parts.push('<div class="' + cls + '">' + escHtml(l) + '</div>');
      });

      diffEl.innerHTML = parts.join('') || '<p class="hint">No content to compare.</p>';
    }
  });

  function escHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
})();
