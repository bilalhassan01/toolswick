// certificate-maker.js - High-Resolution Certificate Generator & Print Tool
(function () {
  'use strict';

  function init() {
    const certTypeSel = document.getElementById('certType');
    const recipientInp = document.getElementById('certRecipient');
    const titleInp = document.getElementById('certTitle');
    const descInp = document.getElementById('certDesc');
    const orgInp = document.getElementById('certOrg');
    const presenterInp = document.getElementById('certPresenter');
    const dateInp = document.getElementById('certDate');
    const themeSel = document.getElementById('certTheme');

    const canvas = document.getElementById('certCanvas');
    const downloadBtn = document.getElementById('certDownloadBtn');
    const printBtn = document.getElementById('certPrintBtn');

    if (!canvas) return;

    const W = 1200;
    const H = 840;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    const THEMES = {
      gold: { bg: '#fffdf5', border: '#d97706', inner: '#b45309', text: '#1f2937', sub: '#4b5563', seal: '#f59e0b' },
      blue: { bg: '#f8fafc', border: '#1e3a8a', inner: '#2563eb', text: '#0f172a', sub: '#475569', seal: '#3b82f6' },
      emerald: { bg: '#f0fdf4', border: '#064e3b', inner: '#059669', text: '#064e3b', sub: '#374151', seal: '#10b981' },
      black: { bg: '#fafafa', border: '#18181b', inner: '#52525b', text: '#18181b', sub: '#71717a', seal: '#3f3f46' }
    };

    function render() {
      const themeKey = themeSel ? themeSel.value : 'gold';
      const theme = THEMES[themeKey] || THEMES.gold;

      const certType = (certTypeSel && certTypeSel.value) || 'CERTIFICATE OF COMPLETION';
      const recipient = (recipientInp && recipientInp.value) || 'Eleanor Vance';
      const award = (titleInp && titleInp.value) || 'Advanced Machine Learning & AI Engineering';
      const desc = (descInp && descInp.value) || 'has successfully fulfilled all curriculum requirements, practical examinations, and project milestones with distinguished academic excellence.';
      const org = (orgInp && orgInp.value) || 'Global Technology Academy';
      const presenter = (presenterInp && presenterInp.value) || 'Dr. Robert Sterling, Dean of Engineering';
      const dateStr = (dateInp && dateInp.value) || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

      // Background
      ctx.fillStyle = theme.bg;
      ctx.fillRect(0, 0, W, H);

      // Outer border
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 12;
      ctx.strokeRect(30, 30, W - 60, H - 60);

      // Inner thin border
      ctx.strokeStyle = theme.inner;
      ctx.lineWidth = 2;
      ctx.strokeRect(46, 46, W - 92, H - 92);

      // Corner ornaments
      const corners = [
        [46, 46], [W - 46, 46], [46, H - 46], [W - 46, H - 46]
      ];
      ctx.fillStyle = theme.border;
      corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.arc(cx, cy, 14, 0, Math.PI * 2);
        ctx.fill();
      });

      // Issuer / Organization at top
      ctx.textAlign = 'center';
      ctx.fillStyle = theme.sub;
      ctx.font = '600 18px sans-serif';
      ctx.letterSpacing = '2px';
      ctx.fillText(org.toUpperCase(), W / 2, 120);

      // Main Certificate Header
      ctx.fillStyle = theme.border;
      ctx.font = 'bold 38px serif';
      ctx.fillText(certType, W / 2, 185);

      // Sub-heading
      ctx.fillStyle = theme.sub;
      ctx.font = 'italic 20px serif';
      ctx.fillText('This is proudly presented to', W / 2, 240);

      // Recipient Name
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 46px serif';
      ctx.fillText(recipient, W / 2, 310);

      // Decorative underline under name
      ctx.fillStyle = theme.inner;
      ctx.fillRect(W / 2 - 200, 325, 400, 3);

      // Award / Course title
      ctx.fillStyle = theme.border;
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('FOR COMPLETION OF', W / 2, 380);

      ctx.fillStyle = theme.text;
      ctx.font = 'bold 30px serif';
      ctx.fillText(award, W / 2, 425);

      // Presentation description text (wrapped)
      ctx.fillStyle = theme.sub;
      ctx.font = '18px sans-serif';
      ctx.fillText(desc, W / 2, 480);

      // Signatures & Date area
      const sigY = 680;

      // Date column (Left)
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 18px serif';
      ctx.fillText(dateStr, 250, sigY - 15);
      ctx.fillStyle = theme.inner;
      ctx.fillRect(130, sigY, 240, 2);
      ctx.fillStyle = theme.sub;
      ctx.font = '14px sans-serif';
      ctx.fillText('DATE ISSUED', 250, sigY + 25);

      // Seal in center
      ctx.beginPath();
      ctx.arc(W / 2, sigY - 20, 48, 0, Math.PI * 2);
      ctx.fillStyle = theme.seal;
      ctx.fill();
      ctx.strokeStyle = theme.border;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('OFFICIAL', W / 2, sigY - 25);
      ctx.fillText('SEAL', W / 2, sigY - 10);

      // Presenter column (Right)
      ctx.fillStyle = theme.text;
      ctx.font = 'bold 18px serif';
      ctx.fillText(presenter, W - 250, sigY - 15);
      ctx.fillStyle = theme.inner;
      ctx.fillRect(W - 370, sigY, 240, 2);
      ctx.fillStyle = theme.sub;
      ctx.font = '14px sans-serif';
      ctx.fillText('AUTHORIZED SIGNATURE', W - 250, sigY + 25);
    }

    [certTypeSel, recipientInp, titleInp, descInp, orgInp, presenterInp, dateInp].forEach(inp => {
      if (inp) inp.addEventListener('input', render);
    });

    if (themeSel) themeSel.addEventListener('change', render);

    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        const cleanName = (recipientInp && recipientInp.value ? recipientInp.value.replace(/[^a-zA-Z0-9]/g, '_') : 'certificate');
        a.download = `certificate-${cleanName}.png`;
        a.href = canvas.toDataURL('image/png');
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
