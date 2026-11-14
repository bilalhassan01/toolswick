// Cron Expression Generator & Explainer
(function(){
  'use strict';

  var selMin = document.getElementById('cronMin');
  var selHour = document.getElementById('cronHour');
  var selDom = document.getElementById('cronDom');
  var selMonth = document.getElementById('cronMonth');
  var selDow = document.getElementById('cronDow');

  var cronOut = document.getElementById('cronOutput');
  var cronCopyBtn = document.getElementById('cronCopy');

  var explainIn = document.getElementById('cronExplainIn');
  var explainOut = document.getElementById('cronExplainOut');

  function updateGenerator(){
    if(!cronOut) return;
    var m = selMin ? selMin.value : '*';
    var h = selHour ? selHour.value : '*';
    var dom = selDom ? selDom.value : '*';
    var mon = selMonth ? selMonth.value : '*';
    var dow = selDow ? selDow.value : '*';

    var expr = m + ' ' + h + ' ' + dom + ' ' + mon + ' ' + dow;
    cronOut.value = expr;

    if(explainIn && (!explainIn.value || explainIn.dataset.sync === 'true')){
      explainIn.value = expr;
      explainIn.dataset.sync = 'true';
      explainCron(expr);
    }
  }

  var DOW_MAP = {
    '0': 'Sunday', '1': 'Monday', '2': 'Tuesday', '3': 'Wednesday',
    '4': 'Thursday', '5': 'Friday', '6': 'Saturday', '7': 'Sunday',
    'SUN': 'Sunday', 'MON': 'Monday', 'TUE': 'Tuesday', 'WED': 'Wednesday',
    'THU': 'Thursday', 'FRI': 'Friday', 'SAT': 'Saturday'
  };

  function formatDayName(token) {
    var up = (token + '').trim().toUpperCase();
    return DOW_MAP[up] || token;
  }

  function explainCron(expr){
    if(!explainOut) return;
    var parts = expr.trim().split(/\s+/);
    if(parts.length !== 5){
      explainOut.textContent = 'Please enter a standard 5-part cron expression (Minute Hour Day-of-Month Month Day-of-Week).';
      return;
    }
    var m = parts[0], h = parts[1], dom = parts[2], mon = parts[3], dow = parts[4];

    var desc = 'Runs ';

    // Minute / Hour
    if(m === '*' && h === '*'){
      desc += 'every minute';
    } else if(m.startsWith('*/')){
      desc += 'every ' + m.slice(2) + ' minutes';
      if(h !== '*') desc += ' past hour ' + h;
    } else if(h === '*'){
      desc += 'at minute ' + m + ' of every hour';
    } else {
      desc += 'at ' + ('0' + h).slice(-2) + ':' + ('0' + m).slice(-2);
    }

    // Day of month
    if(dom !== '*'){
      desc += ' on day ' + dom + ' of the month';
    }

    // Month
    if(mon !== '*'){
      var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      var monNum = parseInt(mon, 10);
      var monName = (!isNaN(monNum) && monNum >= 1 && monNum <= 12) ? months[monNum-1] : mon;
      desc += ' in ' + monName;
    }

    // Day of week
    if(dow !== '*'){
      var dowClean = dow.trim();
      if(dowClean === '1-5' || dowClean.toUpperCase() === 'MON-FRI'){
        desc += ' on Monday through Friday';
      } else if(dowClean === '0,6' || dowClean === '6,0' || dowClean === '7,6' || dowClean === '6,7' || dowClean.toUpperCase() === 'SAT,SUN'){
        desc += ' on Saturday and Sunday';
      } else if(dowClean.indexOf('-') !== -1){
        var rangeParts = dowClean.split('-');
        desc += ' on ' + formatDayName(rangeParts[0]) + ' through ' + formatDayName(rangeParts[1]);
      } else if(dowClean.indexOf(',') !== -1){
        var listParts = dowClean.split(',').map(formatDayName);
        desc += ' on ' + listParts.join(', ');
      } else if(dowClean.startsWith('*/')){
        desc += ' every ' + dowClean.slice(2) + ' days of the week';
      } else {
        desc += ' on ' + formatDayName(dowClean);
      }
    }

    desc += '.';
    explainOut.textContent = desc;
  }

  [selMin, selHour, selDom, selMonth, selDow].forEach(function(s){
    if(s) s.addEventListener('change', updateGenerator);
  });

  if(explainIn){
    explainIn.addEventListener('input', function(){
      explainIn.dataset.sync = 'false';
      explainCron(explainIn.value);
    });
  }

  if(cronCopyBtn){
    cronCopyBtn.addEventListener('click', function(){
      if(!cronOut || !cronOut.value) return;
      navigator.clipboard.writeText(cronOut.value).then(function(){
        cronCopyBtn.textContent = 'Copied!';
        setTimeout(function(){ cronCopyBtn.textContent = 'Copy Cron'; }, 1500);
      });
    });
  }

  updateGenerator();
})();
