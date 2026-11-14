// resume-builder.js - Client-Side Resume Builder with Live Preview & Print to PDF
(function () {
  'use strict';

  function init() {
    const nameInp = document.getElementById('resName');
    const titleInp = document.getElementById('resTitle');
    const emailInp = document.getElementById('resEmail');
    const phoneInp = document.getElementById('resPhone');
    const locInp = document.getElementById('resLocation');
    const webInp = document.getElementById('resWebsite');
    const summaryInp = document.getElementById('resSummary');
    const skillsInp = document.getElementById('resSkills');

    const expList = document.getElementById('resExpList');
    const addExpBtn = document.getElementById('resAddExpBtn');
    const eduList = document.getElementById('resEduList');
    const addEduBtn = document.getElementById('resAddEduBtn');
    const printBtn = document.getElementById('resPrintBtn');

    // Preview elements
    const pvName = document.getElementById('pvResName');
    const pvTitle = document.getElementById('pvResTitle');
    const pvContact = document.getElementById('pvResContact');
    const pvSummary = document.getElementById('pvResSummary');
    const pvExp = document.getElementById('pvResExp');
    const pvEdu = document.getElementById('pvResEdu');
    const pvSkills = document.getElementById('pvResSkills');

    if (!nameInp || !pvName) return;

    function updatePreview() {
      if (pvName) pvName.textContent = (nameInp.value || '').trim() || 'Johnathan Doe';

      const rawTitle = titleInp ? titleInp.value.trim() : '';
      if (pvTitle) pvTitle.textContent = rawTitle || 'Senior Software Engineer';

      const contactItems = [];
      if (emailInp && emailInp.value.trim()) contactItems.push(emailInp.value.trim());
      if (phoneInp && phoneInp.value.trim()) contactItems.push(phoneInp.value.trim());
      if (locInp && locInp.value.trim()) contactItems.push(locInp.value.trim());
      if (webInp && webInp.value.trim()) contactItems.push(webInp.value.trim());
      if (pvContact) pvContact.textContent = contactItems.filter(Boolean).join(' · ');

      if (pvSummary) {
        pvSummary.textContent = (summaryInp.value || '').trim();
      }

      // Work Experience
      if (pvExp && expList) {
        let expHtml = '';
        const items = expList.querySelectorAll('.res-exp-item');
        items.forEach(item => {
          const role = (item.querySelector('.res-exp-role').value || '').trim();
          const comp = (item.querySelector('.res-exp-comp').value || '').trim();
          const dates = (item.querySelector('.res-exp-dates').value || '').trim();
          const desc = (item.querySelector('.res-exp-desc').value || '').trim();

          if (role || comp) {
            let roleCompany = '';
            if (role && comp) roleCompany = `${role} — ${comp}`;
            else if (role) roleCompany = role;
            else roleCompany = comp;

            expHtml += `
              <div style="margin-bottom:14px;">
                <div style="display:flex;justify-content:space-between;align-items:baseline;font-weight:600;font-size:0.95rem;gap:12px;">
                  <span style="color:#09090b;">${roleCompany}</span>
                  <span style="font-weight:normal;color:#71717a;white-space:nowrap;font-size:0.85rem;flex-shrink:0;">${dates}</span>
                </div>
                ${desc ? `<p style="margin:4px 0 0 0;font-size:0.85rem;line-height:1.45;color:#3f3f46;white-space:pre-line;">${desc}</p>` : ''}
              </div>
            `;
          }
        });
        pvExp.innerHTML = expHtml || '<p style="color:var(--muted,#888);font-size:0.85rem;">No experience added yet.</p>';
      }

      // Education
      if (pvEdu && eduList) {
        let eduHtml = '';
        const items = eduList.querySelectorAll('.res-edu-item');
        items.forEach(item => {
          const degree = (item.querySelector('.res-edu-degree').value || '').trim();
          const school = (item.querySelector('.res-edu-school').value || '').trim();
          const year = (item.querySelector('.res-edu-year').value || '').trim();

          if (degree || school) {
            let eduTitle = '';
            if (degree && school) {
              eduTitle = `<strong>${degree}</strong>, ${school}`;
            } else if (degree) {
              eduTitle = `<strong>${degree}</strong>`;
            } else {
              eduTitle = `<strong>${school}</strong>`;
            }

            eduHtml += `
              <div style="display:flex;justify-content:space-between;align-items:baseline;font-size:0.9rem;margin-bottom:6px;gap:12px;">
                <span style="color:#09090b;">${eduTitle}</span>
                <span style="color:#71717a;white-space:nowrap;font-size:0.85rem;flex-shrink:0;">${year}</span>
              </div>
            `;
          }
        });
        pvEdu.innerHTML = eduHtml || '<p style="color:var(--muted,#888);font-size:0.85rem;">No education added yet.</p>';
      }

      // Skills
      if (pvSkills && skillsInp) {
        const skills = skillsInp.value.split(',').map(s => s.trim()).filter(Boolean);
        if (skills.length) {
          pvSkills.innerHTML = skills.map(s => `<span style="display:inline-block;background:#f1f5f9;color:#0f172a;border:1px solid #cbd5e1;padding:3px 10px;border-radius:12px;font-size:0.8rem;font-weight:600;margin:2px;">${s}</span>`).join(' ');
        } else {
          pvSkills.innerHTML = '<span style="color:var(--muted,#888);font-size:0.85rem;">e.g. JavaScript, Python, Docker, React, AWS</span>';
        }
      }
    }

    function addExp(role = '', comp = '', dates = '', desc = '') {
      const div = document.createElement('div');
      div.className = 'res-exp-item card-box';
      div.style.cssText = 'padding:14px;margin-bottom:12px;background:var(--surface);border:1px solid var(--line);border-radius:8px;';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Position Details</strong>
          <button type="button" class="btn ghost sm res-exp-del" style="color:#ef4444;padding:2px 8px;font-size:12px;" title="Remove this position">✕ Remove</button>
        </div>
        <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
          <div><label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Job Title</label><input type="text" class="res-exp-role" placeholder="e.g. Lead Cloud Architect" value="${role}" style="width:100%;box-sizing:border-box;"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Company</label><input type="text" class="res-exp-comp" placeholder="e.g. Acme Global Tech" value="${comp}" style="width:100%;box-sizing:border-box;"></div>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Dates / Period</label>
          <input type="text" class="res-exp-dates" placeholder="e.g. 2022 - Present" value="${dates}" style="width:100%;box-sizing:border-box;">
        </div>
        <div>
          <label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Key Achievements & Responsibilities</label>
          <textarea class="res-exp-desc" rows="3" placeholder="Key responsibilities and achievements..." style="width:100%;font-size:0.85rem;box-sizing:border-box;">${desc}</textarea>
        </div>
      `;

      div.querySelectorAll('input,textarea').forEach(inp => inp.addEventListener('input', updatePreview));
      div.querySelector('.res-exp-del').addEventListener('click', () => {
        div.remove();
        updatePreview();
      });

      expList.appendChild(div);
      updatePreview();
    }

    function addEdu(degree = '', school = '', year = '') {
      const div = document.createElement('div');
      div.className = 'res-edu-item card-box';
      div.style.cssText = 'padding:14px;margin-bottom:12px;background:var(--surface);border:1px solid var(--line);border-radius:8px;';
      div.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
          <strong style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;letter-spacing:0.5px;">Degree / Education</strong>
          <button type="button" class="btn ghost sm res-edu-del" style="color:#ef4444;padding:2px 8px;font-size:12px;" title="Remove this degree">✕ Remove</button>
        </div>
        <div style="margin-bottom:8px;">
          <label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Degree / Certificate</label>
          <input type="text" class="res-edu-degree" placeholder="e.g. B.S. in Computer Science" value="${degree}" style="width:100%;box-sizing:border-box;">
        </div>
        <div class="grid2" style="display:grid;grid-template-columns:2fr 1fr;gap:8px;">
          <div><label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">School / University</label><input type="text" class="res-edu-school" placeholder="e.g. University of California, Berkeley" value="${school}" style="width:100%;box-sizing:border-box;"></div>
          <div><label style="font-size:11px;font-weight:600;color:var(--muted);display:block;margin-bottom:2px;">Graduation Year</label><input type="text" class="res-edu-year" placeholder="e.g. 2019" value="${year}" style="width:100%;box-sizing:border-box;"></div>
        </div>
      `;

      div.querySelectorAll('input').forEach(inp => inp.addEventListener('input', updatePreview));
      div.querySelector('.res-edu-del').addEventListener('click', () => {
        div.remove();
        updatePreview();
      });

      eduList.appendChild(div);
      updatePreview();
    }

    [nameInp, titleInp, emailInp, phoneInp, locInp, webInp, summaryInp, skillsInp].forEach(inp => {
      if (inp) inp.addEventListener('input', updatePreview);
    });

    if (addExpBtn) addExpBtn.addEventListener('click', () => addExp());
    if (addEduBtn) addEduBtn.addEventListener('click', () => addEdu());

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    // Default sample data
    addExp('Lead Cloud Architect', 'Acme Global Tech', '2022 - Present', '• Architected zero-downtime multi-region Kubernetes deployments.\n• Mentored 12 mid-level engineers and spearheaded ISO 27001 compliance.');
    addExp('Senior Backend Engineer', 'Starlight Data Corp', '2019 - 2022', '• Reduced API latency by 45% via caching layers and query optimizations.\n• Designed automated data processing pipelines handling 2TB+ daily records.');
    addEdu('B.S. in Computer Science', 'University of California, Berkeley', '2019');

    if (skillsInp) skillsInp.value = 'TypeScript, Python, Kubernetes, PostgreSQL, React, AWS, Go, Microservices';
    updatePreview();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
