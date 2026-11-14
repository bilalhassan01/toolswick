// Unix Timestamp Converter
(function(){
  var curClock = document.getElementById('tsCurrentClock');
  var copyCurrentBtn = document.getElementById('tsCopyCurrent');

  var tsIn = document.getElementById('tsInput');
  var tsUnitSec = document.getElementById('tsUnitSec');
  var tsUnitMs = document.getElementById('tsUnitMs');
  var tsUtcOut = document.getElementById('tsUtcOut');
  var tsLocalOut = document.getElementById('tsLocalOut');
  var tsRelOut = document.getElementById('tsRelOut');

  var dtIn = document.getElementById('tsDateInput');
  var dtOutSec = document.getElementById('tsDateOutSec');
  var dtOutMs = document.getElementById('tsDateOutMs');

  // Live Clock
  function updateClock(){
    var nowSec = Math.floor(Date.now() / 1000);
    if(curClock) curClock.textContent = nowSec;
  }
  setInterval(updateClock, 1000);
  updateClock();

  if(copyCurrentBtn){
    copyCurrentBtn.addEventListener('click', function(){
      var nowSec = Math.floor(Date.now() / 1000).toString();
      navigator.clipboard.writeText(nowSec).then(function(){
        copyCurrentBtn.textContent = 'Copied!';
        setTimeout(function(){ copyCurrentBtn.textContent = 'Copy Current'; }, 1500);
      });
    });
  }

  function formatRelative(msDiff){
    var sec = Math.round(msDiff / 1000);
    if(Math.abs(sec) < 60) return sec + ' seconds ago';
    var min = Math.round(sec / 60);
    if(Math.abs(min) < 60) return min + ' minutes ago';
    var hr = Math.round(min / 60);
    if(Math.abs(hr) < 24) return hr + ' hours ago';
    var days = Math.round(hr / 24);
    return days + ' days ago';
  }

  function convertTimestamp(){
    if(!tsIn || !tsUtcOut || !tsLocalOut) return;
    var raw = tsIn.value.trim();
    if(!raw){
      tsUtcOut.value = '';
      tsLocalOut.value = '';
      if(tsRelOut) tsRelOut.textContent = '';
      return;
    }
    var num = parseFloat(raw);
    if(isNaN(num)){
      tsUtcOut.value = 'Invalid timestamp number';
      tsLocalOut.value = 'Invalid timestamp number';
      return;
    }
    var isMs = tsUnitMs && tsUnitMs.checked;
    var ms = isMs ? num : num * 1000;
    var d = new Date(ms);
    if(isNaN(d.getTime())){
      tsUtcOut.value = 'Out of range';
      tsLocalOut.value = 'Out of range';
      return;
    }
    tsUtcOut.value = d.toUTCString();
    tsLocalOut.value = d.toString();
    if(tsRelOut){
      var diff = Date.now() - d.getTime();
      tsRelOut.textContent = 'Relative: ' + formatRelative(diff);
    }
  }

  function convertDateTime(){
    if(!dtIn || !dtOutSec || !dtOutMs) return;
    var val = dtIn.value;
    if(!val){
      dtOutSec.value = '';
      dtOutMs.value = '';
      return;
    }
    var d = new Date(val);
    var ms = d.getTime();
    if(isNaN(ms)){
      dtOutSec.value = 'Invalid Date';
      dtOutMs.value = 'Invalid Date';
      return;
    }
    dtOutSec.value = Math.floor(ms / 1000);
    dtOutMs.value = ms;
  }

  if(tsIn) tsIn.addEventListener('input', convertTimestamp);
  if(tsUnitSec) tsUnitSec.addEventListener('change', convertTimestamp);
  if(tsUnitMs) tsUnitMs.addEventListener('change', convertTimestamp);

  if(dtIn) dtIn.addEventListener('input', convertDateTime);

  // Initialize with current time
  if(tsIn && !tsIn.value){
    tsIn.value = Math.floor(Date.now() / 1000);
    convertTimestamp();
  }

  if(dtIn && !dtIn.value){
    var now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    dtIn.value = now.toISOString().slice(0, 16);
    convertDateTime();
  }
})();
