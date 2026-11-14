// gpa-calculator.js - Pure client-side GPA & Grade Calculator
(function () {
  'use strict';

  const GRADE_SCALE = {
    'A+': 4.0,
    'A': 4.0,
    'A-': 3.7,
    'B+': 3.3,
    'B': 3.0,
    'B-': 2.7,
    'C+': 2.3,
    'C': 2.0,
    'C-': 1.7,
    'D+': 1.3,
    'D': 1.0,
    'F': 0.0
  };

  function init() {
    const tableBody = document.getElementById('gpaTableBody');
    const addRowBtn = document.getElementById('gpaAddRowBtn');
    const clearBtn = document.getElementById('gpaClearBtn');

    const currGpaEl = document.getElementById('gpaCurrGpa');
    const currCredEl = document.getElementById('gpaCurrCredits');

    const resGpaEl = document.getElementById('gpaResGpa');
    const resCumGpaEl = document.getElementById('gpaResCumGpa');
    const resCreditsEl = document.getElementById('gpaResCredits');
    const resPointsEl = document.getElementById('gpaResPoints');
    const resLetterEl = document.getElementById('gpaResLetter');
    const resStatusEl = document.getElementById('gpaResStatus');

    if (!tableBody) return;

    function createRow(name = '', grade = 'A', credits = 3) {
      const tr = document.createElement('tr');
      tr.className = 'gpa-row';

      let optionsHtml = '';
      for (const [letter, points] of Object.entries(GRADE_SCALE)) {
        const sel = letter === grade ? 'selected' : '';
        optionsHtml += `<option value="${letter}" ${sel}>${letter} (${points.toFixed(1)})</option>`;
      }

      tr.innerHTML = `
        <td style="padding:6px;"><input type="text" class="field gpa-cname" placeholder="e.g. Calculus I" value="${name}" style="padding:6px 10px;font-size:0.9rem;" /></td>
        <td style="padding:6px;">
          <select class="field gpa-grade" style="padding:6px 10px;font-size:0.9rem;">${optionsHtml}</select>
        </td>
        <td style="padding:6px;">
          <input type="number" min="0" max="12" step="0.5" class="field gpa-credits" value="${credits}" style="padding:6px 10px;font-size:0.9rem;" />
        </td>
        <td style="padding:6px;text-align:center;">
          <button type="button" class="btn ghost gpa-del-btn" style="padding:4px 8px;font-size:0.8rem;color:#f87171;" title="Remove course">&times;</button>
        </td>
      `;

      tr.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('input', calculate);
        el.addEventListener('change', calculate);
      });

      tr.querySelector('.gpa-del-btn').addEventListener('click', () => {
        if (tableBody.querySelectorAll('.gpa-row').length > 1) {
          tr.remove();
          calculate();
        } else {
          // Clear inputs if only one row left
          tr.querySelector('.gpa-cname').value = '';
          tr.querySelector('.gpa-credits').value = '3';
          calculate();
        }
      });

      return tr;
    }

    function calculate() {
      const rows = tableBody.querySelectorAll('.gpa-row');
      let semPoints = 0;
      let semCredits = 0;

      rows.forEach(tr => {
        const gradeLetter = tr.querySelector('.gpa-grade').value;
        const credits = parseFloat(tr.querySelector('.gpa-credits').value) || 0;
        const gradePoint = GRADE_SCALE[gradeLetter] !== undefined ? GRADE_SCALE[gradeLetter] : 0;

        semCredits += credits;
        semPoints += gradePoint * credits;
      });

      const semGpa = semCredits > 0 ? semPoints / semCredits : 0;

      // Cumulative
      const prevGpa = parseFloat(currGpaEl ? currGpaEl.value : 0) || 0;
      const prevCredits = parseFloat(currCredEl ? currCredEl.value : 0) || 0;
      const prevPoints = prevGpa * prevCredits;

      const totalCredits = prevCredits + semCredits;
      const totalPoints = prevPoints + semPoints;
      const cumGpa = totalCredits > 0 ? totalPoints / totalCredits : semGpa;

      if (resGpaEl) resGpaEl.textContent = semGpa.toFixed(2);
      if (resCumGpaEl) resCumGpaEl.textContent = cumGpa.toFixed(2);
      if (resCreditsEl) resCreditsEl.textContent = semCredits.toString();
      if (resPointsEl) resPointsEl.textContent = semPoints.toFixed(1);

      // Letter equivalent & status
      let letterEq = 'F';
      if (semGpa >= 3.85) letterEq = 'A';
      else if (semGpa >= 3.5) letterEq = 'A- / B+';
      else if (semGpa >= 3.0) letterEq = 'B';
      else if (semGpa >= 2.5) letterEq = 'B- / C+';
      else if (semGpa >= 2.0) letterEq = 'C';
      else if (semGpa >= 1.0) letterEq = 'D';

      if (resLetterEl) resLetterEl.textContent = letterEq;

      if (resStatusEl) {
        if (semGpa >= 3.5) {
          resStatusEl.textContent = "Dean's List / Honors (>= 3.5)";
          resStatusEl.style.color = '#4ade80';
        } else if (semGpa >= 2.0) {
          resStatusEl.textContent = 'Good Standing (>= 2.0)';
          resStatusEl.style.color = '#38bdf8';
        } else if (semCredits > 0) {
          resStatusEl.textContent = 'Academic Warning (< 2.0)';
          resStatusEl.style.color = '#f87171';
        } else {
          resStatusEl.textContent = '-';
          resStatusEl.style.color = '';
        }
      }
    }

    if (addRowBtn) {
      addRowBtn.addEventListener('click', () => {
        tableBody.appendChild(createRow());
        calculate();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        tableBody.innerHTML = '';
        tableBody.appendChild(createRow('Course 1', 'A', 3));
        tableBody.appendChild(createRow('Course 2', 'B+', 3));
        tableBody.appendChild(createRow('Course 3', 'A-', 4));
        if (currGpaEl) currGpaEl.value = '';
        if (currCredEl) currCredEl.value = '';
        calculate();
      });
    }

    if (currGpaEl) currGpaEl.addEventListener('input', calculate);
    if (currCredEl) currCredEl.addEventListener('input', calculate);

    // Initial 4 rows
    tableBody.innerHTML = '';
    tableBody.appendChild(createRow('Mathematics', 'A', 4));
    tableBody.appendChild(createRow('Physics I', 'B+', 4));
    tableBody.appendChild(createRow('Computer Science', 'A', 3));
    tableBody.appendChild(createRow('English Composition', 'A-', 3));

    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
