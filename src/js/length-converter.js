// Length & Distance Unit Converter
(function(){
  function init(){
  var valIn = document.getElementById('lenVal');
  var fromSel = document.getElementById('lenFrom');
  var toSel = document.getElementById('lenTo');
  var resultEl = document.getElementById('lenResult');
  var formulaEl = document.getElementById('lenFormula');
  var tableBody = document.getElementById('lenAllTable');
  var swapBtn = document.getElementById('lenSwap');

  var UNITS = {
    'mm': { name: 'Millimeters (mm)', factor: 0.001 },
    'cm': { name: 'Centimeters (cm)', factor: 0.01 },
    'm':  { name: 'Meters (m)', factor: 1 },
    'km': { name: 'Kilometers (km)', factor: 1000 },
    'in': { name: 'Inches (in)', factor: 0.0254 },
    'ft': { name: 'Feet (ft)', factor: 0.3048 },
    'yd': { name: 'Yards (yd)', factor: 0.9144 },
    'mi': { name: 'Miles (mi)', factor: 1609.344 },
    'nmi':{ name: 'Nautical Miles (nmi)', factor: 1852 }
  };

  function formatNum(n){
    if(isNaN(n)) return '0';
    if(Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4);
    return parseFloat(n.toFixed(6)).toLocaleString(undefined, {maximumFractionDigits: 6});
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
    var inMeters = val * UNITS[fromU].factor;
    var res = inMeters / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inMeters / UNITS[u].factor;
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

  [valIn, fromSel, toSel].forEach(function(el){
    if(el) el.addEventListener('input', convert);
    if(el) el.addEventListener('change', convert);
  });

  
  function populateUnits(){
    if(!fromSel || !toSel) return;
    var keys = Object.keys(UNITS);
    fromSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'm' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'ft' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }
  populateUnits();


  var copyBtn = document.getElementById('lenCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var resEl = document.getElementById('lenResult');
      var txt = resEl ? resEl.textContent.trim() : '';
      if (txt && txt !== '--') {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(txt);
        }
        if (window.TK && TK.toast) TK.toast('Copied result to clipboard!', 'success');
      }
    });
  }

  convert();
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
