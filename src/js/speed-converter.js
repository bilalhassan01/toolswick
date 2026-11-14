// Speed & Velocity Unit Converter
(function(){
  function init(){
  var valIn = document.getElementById('speedVal');
  var fromSel = document.getElementById('speedFrom');
  var toSel = document.getElementById('speedTo');
  var resultEl = document.getElementById('speedResult');
  var formulaEl = document.getElementById('speedFormula');
  var tableBody = document.getElementById('speedAllTable');
  var swapBtn = document.getElementById('speedSwap');
  var copyBtn = document.getElementById('speedCopy');

  var UNITS = {
    'm/s':  { name: 'Meters per second (m/s)', factor: 1 },
    'km/h': { name: 'Kilometers per hour (km/h)', factor: 0.2777777777777778 },
    'mph':  { name: 'Miles per hour (mph)', factor: 0.44704 },
    'knot': { name: 'Knots (kn)', factor: 0.5144444444444445 },
    'ft/s': { name: 'Feet per second (ft/s)', factor: 0.3048 }
  };

  function formatNum(n){
    if(isNaN(n)) return '0';
    if(Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4);
    return parseFloat(n.toFixed(4)).toLocaleString(undefined, {maximumFractionDigits: 4});
  }

  function convert(){
    if(!valIn || !fromSel || !toSel || !resultEl) return;
    var val = parseFloat(valIn.value);
    if(isNaN(val)){
      resultEl.textContent = '0';
      if(formulaEl) formulaEl.textContent = '';
      if(tableBody) tableBody.innerHTML = '';
      return;
    }
    var fromU = fromSel.value;
    var toU = toSel.value;
    var inMs = val * UNITS[fromU].factor;
    var res = inMs / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inMs / UNITS[u].factor;
        return '<tr>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line)">' + UNITS[u].name + '</td>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600">' + formatNum(converted) + '</td>' +
          '</tr>';
      }).join('');
      tableBody.innerHTML = rows;
    }
  }

  if(swapBtn){
    swapBtn.addEventListener('click', function(){
      var tmp = fromSel.value;
      fromSel.value = toSel.value;
      toSel.value = tmp;
      convert();
    });
  }

  if(copyBtn && resultEl){
    copyBtn.addEventListener('click', function(){
      navigator.clipboard.writeText(resultEl.textContent).then(function(){
        copyBtn.textContent = 'Copied!';
        setTimeout(function(){ copyBtn.textContent = 'Copy Result'; }, 1500);
      });
    });
  }

  [valIn, fromSel, toSel].forEach(function(el){
    if(el) el.addEventListener('input', convert);
    if(el) el.addEventListener('change', convert);
  });

  
  function populateUnits(){
    if(!fromSel || !toSel) return;
    var keys = Object.keys(UNITS);
    fromSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'km/h' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'mph' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }
  populateUnits();

  convert();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
