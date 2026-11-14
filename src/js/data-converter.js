// Digital Data Storage Converter (Decimal 1000 & Binary 1024)
(function(){
  function init(){
  var valIn = document.getElementById('dataVal');
  var fromSel = document.getElementById('dataFrom');
  var toSel = document.getElementById('dataTo');
  var base1000 = document.getElementById('dataBase1000');
  var base1024 = document.getElementById('dataBase1024');
  var resultEl = document.getElementById('dataResult');
  var formulaEl = document.getElementById('dataFormula');
  var tableBody = document.getElementById('dataAllTable');
  var swapBtn = document.getElementById('dataSwap');

  var UNIT_POWERS = {
    'b':  { name: 'Bits (b)', power: -1 }, // special handling: 1 byte = 8 bits
    'B':  { name: 'Bytes (B)', power: 0 },
    'KB': { name: 'Kilobytes (KB / KiB)', power: 1 },
    'MB': { name: 'Megabytes (MB / MiB)', power: 2 },
    'GB': { name: 'Gigabytes (GB / GiB)', power: 3 },
    'TB': { name: 'Terabytes (TB / TiB)', power: 4 },
    'PB': { name: 'Petabytes (PB / PiB)', power: 5 }
  };

  function toBytes(val, unit, base){
    if(unit === 'b') return val / 8;
    return val * Math.pow(base, UNIT_POWERS[unit].power);
  }

  function fromBytes(bytes, unit, base){
    if(unit === 'b') return bytes * 8;
    return bytes / Math.pow(base, UNIT_POWERS[unit].power);
  }

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
    var base = (base1024 && base1024.checked) ? 1024 : 1000;
    var fromU = fromSel.value;
    var toU = toSel.value;
    var bytes = toBytes(val, fromU, base);
    var res = fromBytes(bytes, toU, base);

    resultEl.textContent = formatNum(res) + ' ' + toU;
    if(formulaEl){
      var baseStr = base === 1024 ? 'Binary Base (1 KiB = 1024 Bytes)' : 'Decimal SI Base (1 KB = 1000 Bytes)';
      formulaEl.textContent = 'Using ' + baseStr;
    }

    if(tableBody){
      var rows = Object.keys(UNIT_POWERS).map(function(u){
        var converted = fromBytes(bytes, u, base);
        return '<tr>' +
          '<td style="padding:6px 10px; border-bottom:1px solid var(--line)">' + UNIT_POWERS[u].name + '</td>' +
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

  [valIn, fromSel, toSel, base1000, base1024].forEach(function(el){
    if(el) el.addEventListener('input', convert);
    if(el) el.addEventListener('change', convert);
  });

  
  function populateUnits(){
    if(!fromSel || !toSel) return;
    var keys = Object.keys(UNIT_POWERS);
    fromSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'MB' ? ' selected' : '') + '>' + UNIT_POWERS[k].name + '</option>';
    }).join('');
    toSel.innerHTML = keys.map(function(k){
      return '<option value="' + k + '"' + (k === 'GB' ? ' selected' : '') + '>' + UNIT_POWERS[k].name + '</option>';
    }).join('');
  }
  populateUnits();


  var copyBtn = document.getElementById('dataCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var resEl = document.getElementById('dataResult');
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
