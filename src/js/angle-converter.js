// angle-converter.js - Plane Angle & Frequency Unit Converter
(function(){
  'use strict';

  function init(){
    var typeSel = document.getElementById('angType');
    var valIn = document.getElementById('angVal');
    var fromSel = document.getElementById('angFrom');
    var toSel = document.getElementById('angTo');
    var resultEl = document.getElementById('angResult');
    var formulaEl = document.getElementById('angFormula');
    var tableBody = document.getElementById('angAllTable');
    var swapBtn = document.getElementById('angSwap');
    var copyBtn = document.getElementById('angCopy');

    var ANGLE_UNITS = {
      'deg':    { name: 'Degrees (°)', factor: 1 },
      'rad':    { name: 'Radians (rad)', factor: 180 / Math.PI },
      'grad':   { name: 'Gradians (grad)', factor: 0.9 },
      'turn':   { name: 'Turns / Rotations', factor: 360 },
      'arcmin': { name: 'Arcminutes (′)', factor: 1 / 60 },
      'arcsec': { name: 'Arcseconds (″)', factor: 1 / 3600 }
    };

    var FREQ_UNITS = {
      'Hz':  { name: 'Hertz (Hz)', factor: 1 },
      'kHz': { name: 'Kilohertz (kHz)', factor: 1000 },
      'MHz': { name: 'Megahertz (MHz)', factor: 1000000 },
      'GHz': { name: 'Gigahertz (GHz)', factor: 1000000000 },
      'RPM': { name: 'Revolutions per minute (RPM)', factor: 1 / 60 }
    };

    function getDict(){
      var mode = (typeSel && typeSel.value === 'frequency') ? 'frequency' : 'angle';
      return mode === 'frequency' ? FREQ_UNITS : ANGLE_UNITS;
    }

    function populateDropdowns(){
      if(!fromSel || !toSel) return;
      var dict = getDict();
      var keys = Object.keys(dict);
      var curFrom = fromSel.value;
      var curTo = toSel.value;

      fromSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '">' + dict[k].name + '</option>';
      }).join('');
      toSel.innerHTML = keys.map(function(k){
        return '<option value="' + k + '">' + dict[k].name + '</option>';
      }).join('');

      if(dict[curFrom]) fromSel.value = curFrom;
      else fromSel.selectedIndex = 0;

      if(dict[curTo] && curTo !== fromSel.value) toSel.value = curTo;
      else toSel.selectedIndex = Math.min(1, keys.length - 1);
    }

    function formatNum(n){
      if(isNaN(n)) return '0';
      if(Math.abs(n) < 0.000001 && n !== 0) return n.toExponential(4);
      return parseFloat(n.toFixed(6)).toLocaleString(undefined, {maximumFractionDigits: 6});
    }

    function convert(){
      if(!valIn || !fromSel || !toSel || !resultEl) return;
      var val = parseFloat(valIn.value);
      var dict = getDict();

      if(isNaN(val)){
        resultEl.textContent = '0';
        if(formulaEl) formulaEl.textContent = '--';
        if(tableBody) tableBody.innerHTML = '';
        return;
      }

      var fromU = fromSel.value;
      var toU = toSel.value;
      if(!dict[fromU] || !dict[toU]) return;

      var inBase = val * dict[fromU].factor;
      var res = inBase / dict[toU].factor;

      resultEl.textContent = formatNum(res) + ' ' + toU;
      if(formulaEl){
        var ratio = dict[fromU].factor / dict[toU].factor;
        formulaEl.textContent = '1 ' + fromU + ' = ' + formatNum(ratio) + ' ' + toU;
      }

      if(tableBody){
        var rows = Object.keys(dict).map(function(u){
          var converted = inBase / dict[u].factor;
          return '<tr>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-size:13px;">' + dict[u].name + '</td>' +
            '<td style="padding:7px 10px; border-bottom:1px solid var(--line); font-family:monospace; font-weight:600; text-align:right; font-size:13px; color:var(--primary);">' + formatNum(converted) + '</td>' +
            '</tr>';
        }).join('');
        tableBody.innerHTML = rows;
      }
    }

    if(typeSel){
      typeSel.addEventListener('change', function(){
        populateDropdowns();
        convert();
      });
    }

    if(swapBtn){
      swapBtn.addEventListener('click', function(){
        var tmp = fromSel.value;
        fromSel.value = toSel.value;
        toSel.value = tmp;
        convert();
      });
    }

    if(copyBtn){
      copyBtn.addEventListener('click', function(){
        var txt = resultEl ? resultEl.textContent.trim() : '';
        if(txt && txt !== '--'){
          navigator.clipboard.writeText(txt).then(function(){
            var old = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(function(){ copyBtn.textContent = old; }, 1500);
          });
        }
      });
    }

    [valIn, fromSel, toSel].forEach(function(el){
      if(el){
        el.addEventListener('input', convert);
        el.addEventListener('change', convert);
      }
    });

    populateDropdowns();
    convert();
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
