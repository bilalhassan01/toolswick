// grade-calculator.js - Client-Side Weighted Grade & Final Exam Target Calculator
(function () {
  'use strict';

  function init() {
    const tableBody = document.getElementById('gradeRowsBody');
    const addRowBtn = document.getElementById('gradeAddRowBtn');
    const finalScoreEl = document.getElementById('gradeFinalScore');
    const letterGradeEl = document.getElementById('gradeLetterDisplay');
    const weightTotalEl = document.getElementById('gradeWeightTotal');
    const resetBtn = document.getElementById('gradeResetBtn');

    // Final exam goal elements
    const targetInp = document.getElementById('gradeTargetInput');
    const examWeightInp = document.getElementById('gradeExamWeightInput');
    const neededScoreEl = document.getElementById('gradeNeededScoreDisplay');

    if (!tableBody) return;

    function getLetter(score) {
      if (score >= 93) return 'A';
      if (score >= 90) return 'A-';
      if (score >= 87) return 'B+';
      if (score >= 83) return 'B';
      if (score >= 80) return 'B-';
      if (score >= 77) return 'C+';
      if (score >= 73) return 'C';
      if (score >= 70) return 'C-';
      if (score >= 67) return 'D+';
      if (score >= 60) return 'D';
      return 'F';
    }

    function calculate() {
      const rows = tableBody.querySelectorAll('tr');
      let totalWeighted = 0;
      let totalWeight = 0;

      rows.forEach(row => {
        const scoreInp = row.querySelector('.grade-score');
        const weightInp = row.querySelector('.grade-weight');

        const score = parseFloat(scoreInp ? scoreInp.value : 0) || 0;
        const weight = parseFloat(weightInp ? weightInp.value : 0) || 0;

        totalWeighted += score * weight;
        totalWeight += weight;
      });

      const currentGrade = totalWeight > 0 ? totalWeighted / totalWeight : 0;

      if (finalScoreEl) finalScoreEl.textContent = `${currentGrade.toFixed(2)}%`;
      if (letterGradeEl) letterGradeEl.textContent = `Grade: ${getLetter(currentGrade)}`;
      if (weightTotalEl) {
        weightTotalEl.textContent = `Total Weight: ${totalWeight.toFixed(1)}%`;
        weightTotalEl.style.color = totalWeight === 100 ? '#10b981' : '#f59e0b';
      }

      // Final exam score needed
      if (neededScoreEl && targetInp && examWeightInp) {
        const target = parseFloat(targetInp.value) || 90;
        const examWeight = parseFloat(examWeightInp.value) || 20;

        if (examWeight <= 0 || examWeight >= 100) {
          neededScoreEl.textContent = 'Invalid weight';
        } else {
          // Required Final = (Target - (CurrentGrade * (1 - ExamWeight / 100))) / (ExamWeight / 100)
          const examWeightFraction = examWeight / 100;
          const currentWeightFraction = 1 - examWeightFraction;
          const requiredScore = (target - (currentGrade * currentWeightFraction)) / examWeightFraction;

          if (requiredScore <= 0) {
            neededScoreEl.textContent = '0% (Already Achieved!)';
            neededScoreEl.style.color = '#10b981';
          } else if (requiredScore > 100) {
            neededScoreEl.textContent = `${requiredScore.toFixed(1)}% (Needs Extra Credit)`;
            neededScoreEl.style.color = '#ef4444';
          } else {
            neededScoreEl.textContent = `${requiredScore.toFixed(1)}% on Final Exam`;
            neededScoreEl.style.color = '#10b981';
          }
        }
      }
    }

    function addRow(name = 'Assignment', score = 90, weight = 20) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="padding:6px;"><input type="text" class="field grade-name" value="${name}" style="padding:4px 8px;font-size:0.9rem;"></td>
        <td style="padding:6px;"><input type="number" class="field grade-score" value="${score}" min="0" max="100" step="any" style="padding:4px 8px;font-size:0.9rem;width:80px;"></td>
        <td style="padding:6px;"><input type="number" class="field grade-weight" value="${weight}" min="0" max="100" step="any" style="padding:4px 8px;font-size:0.9rem;width:80px;"></td>
        <td style="padding:6px;text-align:center;"><button type="button" class="btn ghost sm grade-del-btn" style="color:#ef4444;padding:2px 6px;">✕</button></td>
      `;

      tr.querySelectorAll('input').forEach(inp => inp.addEventListener('input', calculate));
      tr.querySelector('.grade-del-btn').addEventListener('click', () => {
        tr.remove();
        calculate();
      });

      tableBody.appendChild(tr);
      calculate();
    }

    if (addRowBtn) addRowBtn.addEventListener('click', () => addRow('New Assessment', 85, 10));

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        tableBody.innerHTML = '';
        addRow('Homework & Quizzes', 95, 20);
        addRow('Midterm Exam 1', 88, 25);
        addRow('Midterm Exam 2', 92, 25);
        addRow('Class Participation', 100, 10);
      });
    }

    if (targetInp) targetInp.addEventListener('input', calculate);
    if (examWeightInp) examWeightInp.addEventListener('input', calculate);

    // Initial sample rows
    addRow('Homework & Quizzes', 95, 20);
    addRow('Midterm Exam 1', 88, 25);
    addRow('Midterm Exam 2', 92, 25);
    addRow('Class Participation', 100, 10);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
