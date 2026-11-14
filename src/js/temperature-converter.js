// Temperature Converter (Celsius, Fahrenheit, Kelvin, Rankine)
(function(){
  'use strict';

  function init(){
    var valIn = document.getElementById('tempVal');
    var fromSel = document.getElementById('tempFrom');
    var toSel = document.getElementById('tempTo');
    var resultEl = document.getElementById('tempResult');
    var formulaEl = document.getElementById('tempFormula');
    var tableBody = document.getElementById('tempAllTable');
    var swapBtn = document.getElementById('tempSwap');
    var copyBtn = document.getElementById('tempCopy');

    var UNITS = {
      'C': { name: 'Celsius (°C)', sym: '°C' },
      'F': { name: 'Fahrenheit (°F)', sym: '°F' },
      'K': { name: 'Kelvin (K)', sym: 'K' },
      'R': { name: 'Rankine (°R)', sym: '°R' }
    };

    function toCelsius(val, from){
      if(from === 'C') return val;
      if(from === 'F') return (val - 32) * (5/9);
      if(from === 'K') return val - 273.15;
      if(from === 'R') return (val - 491.67) * (5/9);
      return val;
    }

    function fromCelsius(c, to){
      if(to === 'C') return c;
      if(to === 'F') return (c * (9/5)) + 32;
      if(to === 'K') return c + 273.15;
      if(to === 'R') return (c + 273.15) * (9/5);
      return c;
    }

    function formatNum(n){
      if(isNaN(n)) return '0';
      return parseFloat(n.toFixed(2)).toLocaleString(undefined, {maximumFractionDigits: 2});
    }

    function populateUnits(){
      if(!fromSel || !toSel) return;
      var curFrom = fromSel.value || 'C';
      var curTo = toSel.value || 'F';
      var keys = Object.keys(UNITS);

      fromSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '"' + (k === curFrom ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
      }).join('');
      toSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '"' + (k === curTo ? ' selected' : '') + '>' + UNITS[k].name + '</option>';
      }).join('');
    }

    function convert(){
      if(!valIn || !fromSel || !toSel || !resultEl) return;
      var val = parseFloat(valIn.value);
      if(isNaN(val)){
        resultEl.textContent = '0';
        if(formulaEl) formulaEl.textContent = '--';
        if(tableBody) tableBody.innerHTML = '';
        return;
      }
      var from = fromSel.value;
      var to = toSel.value;
      var c = toCelsius(val, from);
      var res = fromCelsius(c, to);

      var sym = UNITS[to] ? UNITS[to].sym : to;
      resultEl.textContent = formatNum(res) + ' ' + sym;

      if(formulaEl){
        var fText = '';
        if(from === 'C' && to === 'F') fText = '(' + val + '°C × 9/5) + 32 = ' + formatNum(res) + '°F';
        else if(from === 'F' && to === 'C') fText = '(' + val + '°F − 32) × 5/9 = ' + formatNum(res) + '°C';
        else if(from === 'C' && to === 'K') fText = val + '°C + 273.15 = ' + formatNum(res) + ' K';
        else if(from === 'K' && to === 'C') fText = val + ' K − 273.15 = ' + formatNum(res) + '°C';
        else if(from === 'F' && to === 'K') fText = '(' + val + '°F − 32) × 5/9 + 273.15 = ' + formatNum(res) + ' K';
        else if(from === 'K' && to === 'F') fText = '(' + val + ' K − 273.15) × 9/5 + 32 = ' + formatNum(res) + '°F';
        else if(from === 'R' && to === 'F') fText = val + '°R − 459.67 = ' + formatNum(res) + '°F';
        else if(from === 'F' && to === 'R') fText = val + '°F + 459.67 = ' + formatNum(res) + '°R';
        else if(from === 'K' && to === 'R') fText = val + ' K × 1.8 = ' + formatNum(res) + '°R';
        else if(from === 'R' && to === 'K') fText = val + '°R / 1.8 = ' + formatNum(res) + ' K';
        else fText = val + ' ' + (UNITS[from] ? UNITS[from].sym : from) + ' = ' + formatNum(res) + ' ' + sym;
        formulaEl.textContent = 'Formula: ' + fText;
      }

      if(tableBody){
        var list = [
          { name: 'Celsius (°C)', val: formatNum(fromCelsius(c, 'C')) + ' °C' },
          { name: 'Fahrenheit (°F)', val: formatNum(fromCelsius(c, 'F')) + ' °F' },
          { name: 'Kelvin (K)', val: formatNum(fromCelsius(c, 'K')) + ' K' },
          { name: 'Rankine (°R)', val: formatNum(fromCelsius(c, 'R')) + ' °R' }
        ];
        tableBody.innerHTML = list.map(function(item){
          return '<tr>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-size:13px;">' + item.name + '</td>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600; text-align:right; font-size:13px; color:var(--primary);">' + item.val + '</td>' +
            '</tr>';
        }).join('');
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

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var txt = resultEl ? resultEl.textContent.trim() : '';
        if (txt && txt !== '--') {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(txt).then(function() {
              var old = copyBtn.textContent;
              copyBtn.textContent = 'Copied!';
              if (window.TK && TK.toast) TK.toast('Copied result to clipboard!', 'success');
              setTimeout(function(){ copyBtn.textContent = old; }, 1500);
            });
          }
        }
      });
    }

    [valIn, fromSel, toSel].forEach(function(el){
      if(el) el.addEventListener('input', convert);
      if(el) el.addEventListener('change', convert);
    });

    populateUnits();
    convert();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
