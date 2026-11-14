// random-name.js - Client-Side Random Name & Persona Generator
(function () {
  'use strict';

  function init() {
    const genderSel = document.getElementById('nameGenderSelect');
    const styleSel = document.getElementById('nameStyleSelect');
    const countInp = document.getElementById('nameCountInput');
    const generateBtn = document.getElementById('nameGenerateBtn');
    const resultsContainer = document.getElementById('nameResultsList');
    const copyBtn = document.getElementById('nameCopyBtn');

    if (!generateBtn || !resultsContainer) return;

    const MALE_FIRST = ["James", "Alexander", "Liam", "Ethan", "Noah", "Oliver", "Lucas", "Benjamin", "Henry", "Sebastian", "Julian", "Marcus", "Gabriel", "Samuel", "Daniel"];
    const FEMALE_FIRST = ["Emma", "Sophia", "Olivia", "Ava", "Isabella", "Mia", "Amelia", "Harper", "Evelyn", "Abigail", "Emily", "Charlotte", "Ella", "Scarlett", "Grace"];
    const SURNAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin"];

    function generate() {
      const gender = genderSel ? genderSel.value : 'both';
      const count = Math.max(1, Math.min(50, parseInt(countInp ? countInp.value : 5, 10) || 5));

      let pool = [];
      if (gender === 'male') pool = MALE_FIRST;
      else if (gender === 'female') pool = FEMALE_FIRST;
      else pool = MALE_FIRST.concat(FEMALE_FIRST);

      const names = [];
      for (let i = 0; i < count; i++) {
        const first = pool[Math.floor(Math.random() * pool.length)];
        const last = SURNAMES[Math.floor(Math.random() * SURNAMES.length)];
        names.push(`${first} ${last}`);
      }

      resultsContainer.innerHTML = names.map(n =>
        `<div style="display:inline-block;padding:8px 16px;margin:4px;background:var(--surface,#222);border:1px solid var(--border,#333);border-radius:20px;font-weight:600;color:var(--fg);">${n}</div>`
      ).join('');

      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(names.join('\n')).then(() => {
            const old = copyBtn.textContent;
            copyBtn.textContent = 'Copied!';
            setTimeout(() => (copyBtn.textContent = old), 1500);
          });
        };
      }
    }

    generateBtn.addEventListener('click', generate);
    generate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
