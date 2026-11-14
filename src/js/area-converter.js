// Area Unit Converter
(function(){
  function init(){
  var valIn = document.getElementById('areaVal');
  var fromSel = document.getElementById('areaFrom');
  var toSel = document.getElementById('areaTo');
  var resultEl = document.getElementById('areaResult');
  var formulaEl = document.getElementById('areaFormula');
  var tableBody = document.getElementById('areaAllTable');
  var swapBtn = document.getElementById('areaSwap');

  var UNITS = {
    'sq mm': { name: 'Square Millimeters (mm²)', factor: 0.000001 },
    'sq cm': { name: 'Square Centimeters (cm²)', factor: 0.0001 },
    'sq m':  { name: 'Square Meters (m²)', factor: 1 },
    'sq km': { name: 'Square Kilometers (km²)', factor: 1000000 },
    'sq in': { name: 'Square Inches (in²)', factor: 0.00064516 },
    'sq ft': { name: 'Square Feet (ft²)', factor: 0.09290304 },
    'acre':  { name: 'Acres (ac)', factor: 4046.8564224 },
    'ha':    { name: 'Hectares (ha)', factor: 10000 }
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
    var inSqM = val * UNITS[fromU].factor;
    var res = inSqM / UNITS[toU].factor;

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      formulaEl.textContent = 'Multiply ' + UNITS[fromU].name + ' by ' + formatNum(UNITS[fromU].factor / UNITS[toU].factor) + ' to get ' + UNITS[toU].name;
    }

    if(tableBody){
      var rows = Object.keys(UNITS).map(function(u){
        var converted = inSqM / UNITS[u].factor;
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
      return '<option value="' + k + '"' + (k === 'sq m' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'sq ft' ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
    }).join('');
  }
  populateUnits();


  var copyBtn = document.getElementById('areaCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var resEl = document.getElementById('areaResult');
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
