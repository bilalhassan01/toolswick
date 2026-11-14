// date-calculator.js - Pure client-side Date Difference & Calendar Calculator
(function () {
  'use strict';

  function init() {
    const tabDiff = document.getElementById('dateTabDiff');
    const tabAdd = document.getElementById('dateTabAdd');
    const panelDiff = document.getElementById('datePanelDiff');
    const panelAdd = document.getElementById('datePanelAdd');

    // Panel Diff
    const startEl = document.getElementById('dateStart');
    const endEl = document.getElementById('dateEnd');
    const incEndEl = document.getElementById('dateIncEnd');
    const resDays = document.getElementById('dateResDays');
    const resYMD = document.getElementById('dateResYMD');
    const resWeeks = document.getElementById('dateResWeeks');
    const resBizDays = document.getElementById('dateResBizDays');
    const resHours = document.getElementById('dateResHours');
    const todayStartBtn = document.getElementById('dateTodayStart');
    const todayEndBtn = document.getElementById('dateTodayEnd');

    // Panel Add/Sub
    const baseEl = document.getElementById('dateAddBase');
    const opEl = document.getElementById('dateAddOp'); // 'add' or 'sub'
    const addYEl = document.getElementById('dateAddY');
    const addMEl = document.getElementById('dateAddM');
    const addWEl = document.getElementById('dateAddW');
    const addDEl = document.getElementById('dateAddD');
    const addBizOnlyEl = document.getElementById('dateAddBizOnly');
    const resTargetDate = document.getElementById('dateResTargetDate');
    const resTargetDay = document.getElementById('dateResTargetDay');
    const todayBaseBtn = document.getElementById('dateTodayBase');

    function toISODate(d) {
      // Local date components — toISOString() is UTC, which is one day early
      // in timezones ahead of UTC (e.g. PKT UTC+5: local midnight = 19:00 UTC
      // the previous day), so the ISO line showed the wrong date.
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return y + '-' + m + '-' + day;
    }

    const todayStr = toISODate(new Date());
    if (startEl && !startEl.value) startEl.value = todayStr;
    if (endEl && !endEl.value) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      endEl.value = toISODate(nextMonth);
    }
    if (baseEl && !baseEl.value) baseEl.value = todayStr;

    // Tab switching
    if (tabDiff && tabAdd) {
      tabDiff.addEventListener('click', () => {
        tabDiff.classList.add('active');
        tabAdd.classList.remove('active');
        if (panelDiff) panelDiff.style.display = 'block';
        if (panelAdd) panelAdd.style.display = 'none';
      });
      tabAdd.addEventListener('click', () => {
        tabAdd.classList.add('active');
        tabDiff.classList.remove('active');
        if (panelDiff) panelDiff.style.display = 'none';
        if (panelAdd) panelAdd.style.display = 'block';
      });
    }

    if (todayStartBtn) todayStartBtn.addEventListener('click', () => { startEl.value = todayStr; calcDiff(); });
    if (todayEndBtn) todayEndBtn.addEventListener('click', () => { endEl.value = todayStr; calcDiff(); });
    if (todayBaseBtn) todayBaseBtn.addEventListener('click', () => { baseEl.value = todayStr; calcAdd(); });

    function countBizDays(d1, d2) {
      let count = 0;
      const cur = new Date(d1.getTime());
      while (cur <= d2) {
        const day = cur.getDay();
        if (day !== 0 && day !== 6) count++;
        cur.setDate(cur.getDate() + 1);
      }
      return count;
    }

    function calcDiff() {
      if (!startEl.value || !endEl.value) return;
      const d1 = new Date(startEl.value + 'T00:00:00');
      const d2 = new Date(endEl.value + 'T00:00:00');

      let early = d1 <= d2 ? d1 : d2;
      let late = d1 <= d2 ? d2 : d1;
      const incEnd = incEndEl ? incEndEl.checked : false;

      let diffMs = late.getTime() - early.getTime();
      let diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
      if (incEnd) diffDays += 1;

      // Exact Y/M/D
      let y = late.getFullYear() - early.getFullYear();
      let m = late.getMonth() - early.getMonth();
      let d = late.getDate() - early.getDate();

      if (d < 0) {
        m--;
        const prevMonthLast = new Date(late.getFullYear(), late.getMonth(), 0).getDate();
        d += prevMonthLast;
      }
      if (m < 0) {
        y--;
        m += 12;
      }
      if (incEnd) d += 1;

      const weeks = Math.floor(diffDays / 7);
      const remDays = diffDays % 7;
      const bizDays = countBizDays(early, incEnd ? late : new Date(late.getTime() - (early.getTime() === late.getTime() ? 0 : 86400000)));

      if (resDays) resDays.textContent = diffDays.toLocaleString() + ' days';
      if (resYMD) resYMD.textContent = `${y} yr${y !== 1 ? 's' : ''}, ${m} mo${m !== 1 ? 's' : ''}, ${d} day${d !== 1 ? 's' : ''}`;
      if (resWeeks) resWeeks.textContent = `${weeks} week${weeks !== 1 ? 's' : ''} + ${remDays} day${remDays !== 1 ? 's' : ''}`;
      if (resBizDays) resBizDays.textContent = bizDays.toLocaleString() + ' business days';
      if (resHours) resHours.textContent = (diffDays * 24).toLocaleString() + ' hours';
    }

    function calcAdd() {
      if (!baseEl || !baseEl.value) return;
      const base = new Date(baseEl.value + 'T00:00:00');
      const isSub = opEl ? opEl.value === 'sub' : false;
      const sign = isSub ? -1 : 1;

      const y = parseInt(addYEl ? addYEl.value : 0, 10) || 0;
      const m = parseInt(addMEl ? addMEl.value : 0, 10) || 0;
      const w = parseInt(addWEl ? addWEl.value : 0, 10) || 0;
      const d = parseInt(addDEl ? addDEl.value : 0, 10) || 0;
      const bizOnly = addBizOnlyEl ? addBizOnlyEl.checked : false;

      let target = new Date(base.getTime());

      if (bizOnly) {
        let totalDays = (w * 5) + d;
        let added = 0;
        while (added < totalDays) {
          target.setDate(target.getDate() + sign);
          const day = target.getDay();
          if (day !== 0 && day !== 6) {
            added++;
          }
        }
      } else {
        target.setFullYear(target.getFullYear() + (sign * y));
        target.setMonth(target.getMonth() + (sign * m));
        target.setDate(target.getDate() + (sign * (w * 7 + d)));
      }

      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      if (resTargetDate) resTargetDate.textContent = target.toLocaleDateString('en-US', options);
      if (resTargetDay) resTargetDay.textContent = toISODate(target);
    }

    [startEl, endEl, incEndEl].forEach(el => {
      if (el) el.addEventListener('input', calcDiff);
      if (el) el.addEventListener('change', calcDiff);
    });

    [baseEl, opEl, addYEl, addMEl, addWEl, addDEl, addBizOnlyEl].forEach(el => {
      if (el) el.addEventListener('input', calcAdd);
      if (el) el.addEventListener('change', calcAdd);
    });

    calcDiff();
    calcAdd();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
