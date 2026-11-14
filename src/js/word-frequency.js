// Word Frequency Counter
(function(){
  var inp = document.getElementById('wfInput');
  var stopWordsCb = document.getElementById('wfStopWords');
  var minLengthInp = document.getElementById('wfMinLength');
  var analyzeBtn = document.getElementById('wfAnalyze');
  var clearBtn = document.getElementById('wfClear');
  var statsBar = document.getElementById('wfStats');
  var totalWordsEl = document.getElementById('wfTotal');
  var uniqueWordsEl = document.getElementById('wfUnique');
  var tableBody = document.getElementById('wfTableBody');
  var tableContainer = document.getElementById('wfTableContainer');
  var downloadCsvBtn = document.getElementById('wfDownloadCsv');

  var currentFrequencies = [];

  var STOP_WORDS = new Set([
    'a','about','above','after','again','against','all','am','an','and','any','are','aren\'t',
    'as','at','be','because','been','before','being','below','between','both','but','by','can',
    'can\'t','cannot','could','couldn\'t','did','didn\'t','do','does','doesn\'t','doing','don\'t',
    'down','during','each','few','for','from','further','had','hadn\'t','has','hasn\'t','have',
    'haven\'t','having','he','he\'d','he\'ll','he\'s','her','here','here\'s','hers','herself',
    'him','himself','his','how','how\'s','i','i\'d','i\'ll','i\'m','i\'ve','if','in','into','is',
    'isn\'t','it','it\'s','its','itself','let\'s','me','more','most','mustn\'t','my','myself',
    'no','nor','not','of','off','on','once','only','or','other','ought','our','ours','ourselves',
    'out','over','own','same','shan\'t','she','she\'d','she\'ll','she\'s','should','shouldn\'t',
    'so','some','such','than','that','that\'s','the','their','theirs','them','themselves','then',
    'there','there\'s','these','they','they\'d','they\'ll','they\'re','they\'ve','this','those',
    'through','to','too','under','until','up','very','was','wasn\'t','we','we\'d','we\'ll','we\'re',
    'we\'ve','were','weren\'t','what','what\'s','when','when\'s','where','where\'s','which','while',
    'who','who\'s','whom','why','why\'s','with','won\'t','would','wouldn\'t','you','you\'d',
    'you\'ll','you\'re','you\'ve','your','yours','yourself','yourselves'
  ]);

  function escHtml(s){
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function analyze(){
    if(!inp) return;
    var text = inp.value;
    var ignoreStop = stopWordsCb ? stopWordsCb.checked : false;
    var minLen = parseInt(minLengthInp ? minLengthInp.value : '2') || 1;

    // Match all alphanumeric words (handling contractions and accents)
    var tokens = text.toLowerCase().match(/\b[a-z0-9]+(?:'[a-z0-9]+)?\b/g) || [];

    var filtered = [];
    tokens.forEach(function(tok){
      if(tok.length < minLen) return;
      if(ignoreStop && STOP_WORDS.has(tok)) return;
      filtered.push(tok);
    });

    var totalFiltered = filtered.length;
    var counts = {};
    filtered.forEach(function(w){
      counts[w] = (counts[w] || 0) + 1;
    });

    var sorted = Object.keys(counts).map(function(w){
      return {
        word: w,
        count: counts[w],
        pct: totalFiltered > 0 ? ((counts[w] / totalFiltered) * 100).toFixed(2) : '0.00'
      };
    }).sort(function(a,b){
      return b.count - a.count || a.word.localeCompare(b.word);
    });

    currentFrequencies = sorted;

    if(totalWordsEl) totalWordsEl.textContent = totalFiltered;
    if(uniqueWordsEl) uniqueWordsEl.textContent = sorted.length;
    if(statsBar) statsBar.style.display = 'flex';

    if(tableBody){
      var rowsHtml = sorted.map(function(item, idx){
        var isTop20 = idx < 20;
        var rowClass = isTop20 ? 'class="wf-top20"' : '';
        return '<tr ' + rowClass + '>' +
          '<td>' + (idx + 1) + '</td>' +
          '<td><strong>' + escHtml(item.word) + '</strong>' + (isTop20 ? ' <span class="pill-top" style="font-size:11px;padding:1px 6px;border-radius:10px;background:var(--accent,#2563eb);color:#fff;margin-left:6px">Top ' + (idx + 1) + '</span>' : '') + '</td>' +
          '<td>' + item.count + '</td>' +
          '<td>' + item.pct + '%</td>' +
          '</tr>';
      }).join('');
      tableBody.innerHTML = rowsHtml || '<tr><td colspan="4" style="text-align:center;padding:16px;">No words found matching criteria.</td></tr>';
    }

    if(tableContainer) tableContainer.style.display = sorted.length > 0 ? 'block' : 'none';
  }

  function downloadCsv(){
    if(!currentFrequencies || currentFrequencies.length === 0) return;
    var csv = ['Rank,Word,Count,Percentage'];
    currentFrequencies.forEach(function(item, idx){
      csv.push((idx + 1) + ',"' + item.word.replace(/"/g, '""') + '",' + item.count + ',' + item.pct + '%');
    });
    var blob = new Blob([csv.join('\n')], {type: 'text/csv;charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'word-frequency.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }

  if(analyzeBtn) analyzeBtn.addEventListener('click', analyze);
  if(downloadCsvBtn) downloadCsvBtn.addEventListener('click', downloadCsv);

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    currentFrequencies = [];
    if(totalWordsEl) totalWordsEl.textContent = '0';
    if(uniqueWordsEl) uniqueWordsEl.textContent = '0';
    if(tableBody) tableBody.innerHTML = '';
    if(tableContainer) tableContainer.style.display = 'none';
    if(statsBar) statsBar.style.display = 'none';
    if(inp) inp.focus();
  });
})();
