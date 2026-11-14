// business-card.js - Client-Side Business Card Designer with PNG Download & Print
(function () {
  'use strict';

  function init() {
    const compInp = document.getElementById('bcCompany');
    const tagInp = document.getElementById('bcTagline');
    const nameInp = document.getElementById('bcName');
    const titleInp = document.getElementById('bcTitle');
    const phoneInp = document.getElementById('bcPhone');
    const emailInp = document.getElementById('bcEmail');
    const webInp = document.getElementById('bcWebsite');
    const addrInp = document.getElementById('bcAddress');
    const themeSel = document.getElementById('bcTheme');

    const frontCanvas = document.getElementById('bcFrontCanvas');
    const backCanvas = document.getElementById('bcBackCanvas');
    const dlFrontBtn = document.getElementById('bcDlFrontBtn');
    const dlBackBtn = document.getElementById('bcDlBackBtn');
    const printBtn = document.getElementById('bcPrintBtn');

    if (!frontCanvas || !backCanvas) return;

    // Standard 3.5" x 2" at 300 DPI = 1050 x 600 px (scaled to 700 x 400 for canvas display)
    const W = 700;
    const H = 400;
    frontCanvas.width = W;
    frontCanvas.height = H;
    backCanvas.width = W;
    backCanvas.height = H;

    const ctxF = frontCanvas.getContext('2d');
    const ctxB = backCanvas.getContext('2d');

    const THEMES = {
      dark: { bg: '#18181b', fg: '#ffffff', accent: '#6366f1', sub: '#e4e4e7' },
      blue: { bg: '#0f172a', fg: '#ffffff', accent: '#38bdf8', sub: '#e2e8f0' },
      white: { bg: '#ffffff', fg: '#09090b', accent: '#2563eb', sub: '#1e293b' },
      gold: { bg: '#1c1917', fg: '#fef08a', accent: '#eab308', sub: '#f5f5f4' }
    };

    function render() {
      const themeKey = themeSel ? themeSel.value : 'dark';
      const theme = THEMES[themeKey] || THEMES.dark;

      const comp = (compInp && compInp.value) || 'ACME GLOBAL';
      const tag = (tagInp && tagInp.value) || 'INNOVATION & INTEGRITY';
      const name = (nameInp && nameInp.value) || 'Alexander Vance';
      const title = (titleInp && titleInp.value) || 'Chief Technology Officer';
      const phone = (phoneInp && phoneInp.value) || '+1 (555) 234-5678';
      const email = (emailInp && emailInp.value) || 'alex.vance@acmeglobal.com';
      const web = (webInp && webInp.value) || 'www.acmeglobal.com';
      const addr = (addrInp && addrInp.value) || '100 Silicon Way, Suite 400, San Francisco, CA';

      // --- Front Canvas ---
      ctxF.fillStyle = theme.bg;
      ctxF.fillRect(0, 0, W, H);

      // Accent stripe / geometry
      ctxF.fillStyle = theme.accent;
      ctxF.fillRect(0, 0, 16, H);
      ctxF.fillRect(0, H - 12, W, 12);

      // Person Name & Title
      ctxF.fillStyle = theme.fg;
      ctxF.font = 'bold 32px sans-serif';
      ctxF.fillText(name, 50, 95);

      ctxF.fillStyle = theme.accent;
      ctxF.font = '700 16px sans-serif';
      ctxF.fillText(title.toUpperCase(), 50, 125);

      // Divider line
      ctxF.fillStyle = theme.sub;
      ctxF.fillRect(50, 145, 260, 2);

      // High-contrast, easily readable contact lines (16.5px, bold slate / light)
      ctxF.font = '500 16.5px sans-serif';
      ctxF.fillStyle = theme.sub;
      let y = 185;
      ctxF.fillText('Phone:  ' + phone, 50, y);
      y += 32;
      ctxF.fillText('Email:  ' + email, 50, y);
      y += 32;
      ctxF.fillText('Web:    ' + web, 50, y);
      y += 32;
      ctxF.fillText('Office: ' + addr, 50, y);

      // Small logo/brand text on front top-right
      ctxF.textAlign = 'right';
      ctxF.fillStyle = theme.fg;
      ctxF.font = 'bold 22px sans-serif';
      ctxF.fillText(comp, W - 40, 65);
      ctxF.textAlign = 'left';

      // --- Back Canvas (Enhanced High-End Design) ---
      ctxB.fillStyle = theme.bg;
      ctxB.fillRect(0, 0, W, H);

      // Luxury double border
      ctxB.strokeStyle = theme.accent;
      ctxB.lineWidth = 4;
      ctxB.strokeRect(24, 24, W - 48, H - 48);

      ctxB.strokeStyle = theme.sub;
      ctxB.lineWidth = 1;
      ctxB.strokeRect(32, 32, W - 64, H - 64);

      // Geometric Logo Badge in center
      const cx = W / 2;
      const cy = H / 2 - 40;

      ctxB.fillStyle = theme.accent;
      ctxB.beginPath();
      ctxB.arc(cx, cy, 32, 0, Math.PI * 2);
      ctxB.fill();

      // Inner logo monogram
      ctxB.fillStyle = theme.bg;
      ctxB.font = 'bold 26px sans-serif';
      ctxB.textAlign = 'center';
      ctxB.textBaseline = 'middle';
      ctxB.fillText(comp.charAt(0) || 'A', cx, cy);

      // Prominent Brand Name
      ctxB.fillStyle = theme.fg;
      ctxB.font = 'bold 36px sans-serif';
      ctxB.fillText(comp, cx, cy + 65);

      // Elegant Tagline
      ctxB.fillStyle = theme.accent;
      ctxB.font = '600 15px sans-serif';
      ctxB.fillText(tag.toUpperCase(), cx, cy + 98);

      // Official Website at bottom
      ctxB.fillStyle = theme.sub;
      ctxB.font = '500 14px sans-serif';
      ctxB.fillText(web, cx, H - 55);

      // Reset alignment
      ctxB.textAlign = 'left';
      ctxB.textBaseline = 'alphabetic';
    }

    [compInp, tagInp, nameInp, titleInp, phoneInp, emailInp, webInp, addrInp].forEach(inp => {
      if (inp) inp.addEventListener('input', render);
    });

    if (themeSel) themeSel.addEventListener('change', render);

    if (dlFrontBtn) {
      dlFrontBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = 'business-card-front.png';
        a.href = frontCanvas.toDataURL('image/png');
        a.click();
      });
    }

    if (dlBackBtn) {
      dlBackBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = 'business-card-back.png';
        a.href = backCanvas.toDataURL('image/png');
        a.click();
      });
    }

    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
