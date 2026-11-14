// og-image-maker.js - 1200x630 Open Graph & Social Share Image Generator
(function () {
  'use strict';

  function init() {
    const titleInp = document.getElementById('ogTitle');
    const descInp = document.getElementById('ogDesc');
    const categoryInp = document.getElementById('ogCategory');
    const brandInp = document.getElementById('ogBrand');
    const themeSel = document.getElementById('ogTheme');
    const accentInp = document.getElementById('ogAccent');

    const canvas = document.getElementById('ogCanvas');
    const dlBtn = document.getElementById('ogDlBtn');

    if (!canvas) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    function wrapText(context, text, x, y, maxWidth, lineHeight) {
      const words = text.split(' ');
      let line = '';
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          context.fillText(line, x, y);
          line = words[n] + ' ';
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
      return y + lineHeight;
    }

    function render() {
      const theme = themeSel ? themeSel.value : 'dark';
      const accent = accentInp ? accentInp.value : '#6366f1';

      const title = (titleInp && titleInp.value) || 'Free Online Web Utilities & High-Performance Tools';
      const desc = (descInp && descInp.value) || 'Fast, private, client-side tools for documents, images, and developer datasets.';
      const cat = (categoryInp && categoryInp.value) || 'DOCUMENTATION & TOOLS';
      const brand = (brandInp && brandInp.value) || 'toolswick.com';

      // Background
      if (theme === 'dark') {
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, W, H);
      } else if (theme === 'light') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
      } else {
        // Gradient
        const grad = ctx.createLinearGradient(0, 0, W, H);
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e1b4b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);
      }

      // Decorative ambient glow / accent bar
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, 8); // Top border stripe

      // Category Pill
      const pillX = 80;
      const pillY = 90;
      ctx.font = 'bold 16px sans-serif';
      const pillW = ctx.measureText(cat.toUpperCase()).width + 32;
      const pillH = 36;

      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 18);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(cat.toUpperCase(), pillX + pillW / 2, pillY + 23);
      ctx.textAlign = 'left';

      // Title
      ctx.fillStyle = theme === 'light' ? '#09090b' : '#f4f4f5';
      ctx.font = 'bold 54px sans-serif';
      const afterTitleY = wrapText(ctx, title, 80, 200, W - 160, 68);

      // Description / Subtitle
      ctx.fillStyle = theme === 'light' ? '#4b5563' : '#a1a1aa';
      ctx.font = '24px sans-serif';
      wrapText(ctx, desc, 80, Math.min(afterTitleY + 16, 420), W - 160, 36);

      // Bottom bar with brand / domain
      const bottomY = H - 80;
      ctx.strokeStyle = theme === 'light' ? '#e5e7eb' : '#27272a';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(80, bottomY - 30);
      ctx.lineTo(W - 80, bottomY - 30);
      ctx.stroke();

      // Brand text
      ctx.fillStyle = theme === 'light' ? '#111827' : '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(brand, 80, bottomY + 10);

      // Privacy badge
      ctx.fillStyle = accent;
      ctx.font = '600 18px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText('⚡ 100% Client-Side Privacy', W - 80, bottomY + 10);
      ctx.textAlign = 'left';
    }

    [titleInp, descInp, categoryInp, brandInp, themeSel, accentInp].forEach(inp => {
      if (inp) inp.addEventListener('input', render);
    });

    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = 'og-image.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
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
