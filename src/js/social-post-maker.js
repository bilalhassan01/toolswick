// social-post-maker.js - Social Post & Quote Card Creator with Canvas Export
(function () {
  'use strict';

  function init() {
    const nameInp = document.getElementById('spName');
    const handleInp = document.getElementById('spHandle');
    const verifiedCheck = document.getElementById('spVerified');
    const textInp = document.getElementById('spText');
    const timeInp = document.getElementById('spTime');
    const bgSelect = document.getElementById('spBg');
    const avatarInput = document.getElementById('spAvatarInput');

    const canvas = document.getElementById('spCanvas');
    const dlBtn = document.getElementById('spDlBtn');

    if (!canvas) return;

    const W = 1080;
    const H = 720;
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');

    let avatarImg = null;

    const GRADIENTS = {
      purple: ['#4f46e5', '#9333ea'],
      sunset: ['#ea580c', '#db2777'],
      ocean: ['#0284c7', '#0d9488'],
      dark: ['#18181b', '#09090b'],
      midnight: ['#0f172a', '#1e1b4b']
    };

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
      const bgKey = bgSelect ? bgSelect.value : 'purple';
      const colors = GRADIENTS[bgKey] || GRADIENTS.purple;

      // Draw background gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, colors[0]);
      grad.addColorStop(1, colors[1]);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Card geometry (centered frosted glass card)
      const cX = 100;
      const cY = 90;
      const cW = W - 200;
      const cH = H - 180;
      const radius = 24;

      // Draw rounded rectangle card with shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
      ctx.shadowBlur = 35;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 15;

      ctx.fillStyle = 'rgba(24, 24, 27, 0.92)';
      ctx.beginPath();
      ctx.roundRect(cX, cY, cW, cH, radius);
      ctx.fill();

      // Reset shadow
      ctx.shadowColor = 'transparent';

      // Card border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cX, cY, cW, cH, radius);
      ctx.stroke();

      // Avatar circle
      const avX = cX + 50;
      const avY = cY + 50;
      const avR = 36;

      ctx.save();
      ctx.beginPath();
      ctx.arc(avX + avR, avY + avR, avR, 0, Math.PI * 2);
      ctx.clip();

      if (avatarImg) {
        ctx.drawImage(avatarImg, avX, avY, avR * 2, avR * 2);
      } else {
        ctx.fillStyle = '#6366f1';
        ctx.fillRect(avX, avY, avR * 2, avR * 2);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const initial = (nameInp && nameInp.value ? nameInp.value[0] : 'T').toUpperCase();
        ctx.fillText(initial, avX + avR, avY + avR);
      }
      ctx.restore();

      // Name & Handle
      const name = (nameInp && nameInp.value) || 'Sarah Connor';
      const handle = (handleInp && handleInp.value) || '@sarahconnor';
      const verified = verifiedCheck ? verifiedCheck.checked : true;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 28px sans-serif';
      ctx.fillText(name, avX + avR * 2 + 18, avY + 28);

      if (verified) {
        const nameW = ctx.measureText(name).width;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(avX + avR * 2 + 18 + nameW + 16, avY + 20, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✓', avX + avR * 2 + 18 + nameW + 16, avY + 24);
        ctx.textAlign = 'left';
      }

      ctx.fillStyle = '#a1a1aa';
      ctx.font = '20px sans-serif';
      ctx.fillText(handle, avX + avR * 2 + 18, avY + 58);

      // Post text
      const text = (textInp && textInp.value) || 'The secret of building impactful tools is radical simplicity: eliminate latency, protect privacy, and build for the user first.';
      ctx.fillStyle = '#f4f4f5';
      ctx.font = '28px sans-serif';
      const endY = wrapText(ctx, text, cX + 50, cY + 160, cW - 100, 42);

      // Timestamp at bottom
      const timeStr = (timeInp && timeInp.value) || '10:42 AM · Nov 12, 2026 · Toolswick Web';
      ctx.fillStyle = '#71717a';
      ctx.font = '18px sans-serif';
      ctx.fillText(timeStr, cX + 50, cH + cY - 40);
    }

    [nameInp, handleInp, verifiedCheck, textInp, timeInp, bgSelect].forEach(inp => {
      if (inp) inp.addEventListener('input', render);
    });

    if (avatarInput) {
      avatarInput.addEventListener('change', e => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = ev => {
            avatarImg = new Image();
            avatarImg.onload = render;
            avatarImg.src = ev.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
        }
      });
    }

    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = 'social-post-card.png';
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
