// CSV to JSON & JSON to CSV Converter
(function(){
  var tabC2J = document.getElementById('tabC2J');
  var tabJ2C = document.getElementById('tabJ2C');
  var inp = document.getElementById('cjInput');
  var out = document.getElementById('cjOutput');
  var fileIn = document.getElementById('cjFile');
  var delimSel = document.getElementById('cjDelim');
  var prettyCb = document.getElementById('cjPretty');
  var convertBtn = document.getElementById('cjConvert');
  var copyBtn = document.getElementById('cjCopy');
  var downloadBtn = document.getElementById('cjDownload');
  var clearBtn = document.getElementById('cjClear');
  var errEl = document.getElementById('cjErr');

  var mode = 'c2j';

  function setMode(m){
    mode = m;
    if(tabC2J && tabJ2C){
      tabC2J.classList.toggle('active', mode === 'c2j');
      tabJ2C.classList.toggle('active', mode === 'j2c');
      tabC2J.setAttribute('aria-selected', mode === 'c2j');
      tabJ2C.setAttribute('aria-selected', mode === 'j2c');
    }
    if(prettyCb) prettyCb.parentElement.style.display = (mode === 'c2j') ? 'inline-flex' : 'none';
    if(fileIn) fileIn.accept = (mode === 'c2j') ? '.csv,.tsv,.txt' : '.json';
    if(inp) inp.placeholder = (mode === 'c2j') ? 'Paste CSV data here or upload file...' : 'Paste JSON array here (e.g. [{"name":"Alice","age":30}])...';
  }

  if(tabC2J) tabC2J.addEventListener('click', function(){ setMode('c2j'); });
  if(tabJ2C) tabJ2C.addEventListener('click', function(){ setMode('j2c'); });

  function getDelimiter(){
    var val = delimSel ? delimSel.value : 'comma';
    if(val === 'semicolon') return ';';
    if(val === 'tab') return '\t';
    return ',';
  }

  function parseCSV(text, delim){
    var lines = [];
    var row = [];
    var cur = '';
    var inQuotes = false;
    for(var i=0; i<text.length; i++){
      var c = text[i];
      var next = text[i+1];
      if(c === '"'){
        if(inQuotes && next === '"'){ cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if(c === delim && !inQuotes){
        row.push(cur); cur = '';
      } else if((c === '\r' || c === '\n') && !inQuotes){
        if(c === '\r' && next === '\n') i++;
        row.push(cur); lines.push(row); row = []; cur = '';
      } else {
        cur += c;
      }
    }
    if(cur || row.length > 0){ row.push(cur); lines.push(row); }
    return lines.filter(function(r){ return r.some(function(cell){ return cell.trim(); }); });
  }

  function csvToJson(csv, delim, pretty){
    var rows = parseCSV(csv, delim);
    if(rows.length < 1) return '[]';
    var headers = rows[0].map(function(h){ return h.trim(); });
    var items = [];
    for(var i=1; i<rows.length; i++){
      var r = rows[i];
      var obj = {};
      for(var j=0; j<headers.length; j++){
        var val = r[j] !== undefined ? r[j] : '';
        // Try parsing number or boolean
        if(!isNaN(val) && val.trim() !== '') obj[headers[j]] = Number(val);
        else if(val.toLowerCase() === 'true') obj[headers[j]] = true;
        else if(val.toLowerCase() === 'false') obj[headers[j]] = false;
        else obj[headers[j]] = val;
      }
      items.push(obj);
    }
    return pretty ? JSON.stringify(items, null, 2) : JSON.stringify(items);
  }

  function jsonToCsv(jsonStr, delim){
    var data = JSON.parse(jsonStr);
    if(!Array.isArray(data)){
      if(typeof data === 'object') data = [data];
      else throw new Error('Expected JSON array of objects');
    }
    if(data.length === 0) return '';
    var keys = [];
    data.forEach(function(item){
      if(typeof item === 'object' && item !== null){
        Object.keys(item).forEach(function(k){
          if(keys.indexOf(k) === -1) keys.push(k);
        });
      }
    });

    function escCsv(val){
      if(val === null || val === undefined) return '';
      var s = (typeof val === 'object') ? JSON.stringify(val) : String(val);
      if(s.indexOf(delim) !== -1 || s.indexOf('"') !== -1 || s.indexOf('\n') !== -1){
        return '"' + s.replace(/"/g, '""') + '"';
      }
      return s;
    }

    var lines = [keys.map(escCsv).join(delim)];
    data.forEach(function(item){
      var row = keys.map(function(k){
        return escCsv(item[k]);
      });
      lines.push(row.join(delim));
    });
    return lines.join('\n');
  }

  function convert(){
    if(!inp || !out) return;
    if(errEl) errEl.textContent = '';
    var text = inp.value.trim();
    if(!text){ out.value = ''; return; }
    var delim = getDelimiter();
    var pretty = prettyCb ? prettyCb.checked : true;
    try {
      if(mode === 'c2j'){
        out.value = csvToJson(text, delim, pretty);
      } else {
        out.value = jsonToCsv(text, delim);
      }
    } catch(e) {
      if(errEl) errEl.textContent = 'Conversion error: ' + e.message;
    }
  }

  if(convertBtn) convertBtn.addEventListener('click', convert);

  if(fileIn){
    fileIn.addEventListener('change', function(e){
      var f = e.target.files && e.target.files[0];
      if(!f) return;
      var reader = new FileReader();
      reader.onload = function(evt){
        inp.value = evt.target.result;
        convert();
      };
      reader.readAsText(f);
    });
  }

  if(copyBtn) copyBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    navigator.clipboard.writeText(out.value).then(function(){
      copyBtn.textContent = 'Copied!';
      setTimeout(function(){ copyBtn.textContent = 'Copy Result'; }, 1500);
    });
  });

  if(downloadBtn) downloadBtn.addEventListener('click', function(){
    if(!out || !out.value) return;
    var ext = (mode === 'c2j') ? 'json' : 'csv';
    var mime = (mode === 'c2j') ? 'application/json' : 'text/csv';
    var blob = new Blob([out.value], {type: mime + ';charset=utf-8;'});
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'converted.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  });

  if(clearBtn) clearBtn.addEventListener('click', function(){
    if(inp) inp.value = '';
    if(out) out.value = '';
    if(errEl) errEl.textContent = '';
    if(inp) inp.focus();
  });
})();
