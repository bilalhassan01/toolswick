// signature-maker.js - Smooth Signature Pad (Draw & Type) with Transparent PNG Export
(function () {
  'use strict';

  function init() {
    const tabs = document.querySelectorAll('.sig-mode-tab');
    const drawSec = document.getElementById('sigDrawSec');
    const typeSec = document.getElementById('sigTypeSec');

    const canvas = document.getElementById('sigCanvas');
    const colorSelect = document.getElementById('sigColor');
    const widthInput = document.getElementById('sigWidth');
    const clearBtn = document.getElementById('sigClearBtn');
    const undoBtn = document.getElementById('sigUndoBtn');
    const dlDrawBtn = document.getElementById('sigDlDrawBtn');

    const typeInp = document.getElementById('sigTypeInp');
    const fontSel = document.getElementById('sigFontSel');
    const typeCanvas = document.getElementById('sigTypeCanvas');
    const dlTypeBtn = document.getElementById('sigDlTypeBtn');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 260;
    canvas.style.backgroundColor = '#ffffff';
    if (typeCanvas) typeCanvas.style.backgroundColor = '#ffffff';

    let isDrawing = false;
    let strokes = [];
    let currentStroke = [];

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;

      if (e.touches && e.touches.length > 0) {
        return {
          x: (e.touches[0].clientX - rect.left) * scaleX,
          y: (e.touches[0].clientY - rect.top) * scaleY
        };
      }
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    function redrawStrokes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      strokes.forEach(stroke => {
        if (stroke.points.length < 2) return;
        ctx.strokeStyle = stroke.color;
        ctx.lineWidth = stroke.width;
        ctx.beginPath();
        ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
        }
        ctx.stroke();
      });
    }

    function startDraw(e) {
      e.preventDefault();
      isDrawing = true;
      const pos = getPos(e);
      const color = colorSelect ? colorSelect.value : '#000000';
      const width = parseFloat(widthInput ? widthInput.value : 3) || 3;
      currentStroke = { color, width, points: [pos] };
      strokes.push(currentStroke);
    }

    function moveDraw(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      currentStroke.points.push(pos);

      ctx.strokeStyle = currentStroke.color;
      ctx.lineWidth = currentStroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const pts = currentStroke.points;
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[pts.length - 2].x, pts[pts.length - 2].y);
        ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
        ctx.stroke();
      }
    }

    function endDraw(e) {
      if (!isDrawing) return;
      isDrawing = false;
      redrawStrokes();
    }

    canvas.addEventListener('mousedown', startDraw);
    canvas.addEventListener('mousemove', moveDraw);
    window.addEventListener('mouseup', endDraw);

    canvas.addEventListener('touchstart', startDraw, { passive: false });
    canvas.addEventListener('touchmove', moveDraw, { passive: false });
    window.addEventListener('touchend', endDraw);

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        strokes = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    }

    if (undoBtn) {
      undoBtn.addEventListener('click', () => {
        strokes.pop();
        redrawStrokes();
      });
    }

    // Type signature mode
    if (typeCanvas) {
      typeCanvas.width = 700;
      typeCanvas.height = 260;
      const tCtx = typeCanvas.getContext('2d');

      function renderTyped() {
        tCtx.clearRect(0, 0, typeCanvas.width, typeCanvas.height);
        const name = (typeInp && typeInp.value) || 'Your Signature';
        const color = colorSelect ? colorSelect.value : '#000000';
        const font = fontSel ? fontSel.value : 'cursive';

        tCtx.fillStyle = color;
        tCtx.font = `italic 56px ${font}`;
        tCtx.textAlign = 'center';
        tCtx.textBaseline = 'middle';
        tCtx.fillText(name, typeCanvas.width / 2, typeCanvas.height / 2);
      }

      if (typeInp) typeInp.addEventListener('input', renderTyped);
      if (fontSel) fontSel.addEventListener('change', renderTyped);
      renderTyped();
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const mode = tab.dataset.mode;
        if (mode === 'draw') {
          if (drawSec) drawSec.style.display = 'block';
          if (typeSec) typeSec.style.display = 'none';
        } else {
          if (drawSec) drawSec.style.display = 'none';
          if (typeSec) typeSec.style.display = 'block';
        }
      });
    });

    if (dlDrawBtn) {
      dlDrawBtn.addEventListener('click', () => {
        if (strokes.length === 0) {
          if (window.TK && TK.toast) TK.toast('Please draw a signature first.', 'warning');
          return;
        }
        const a = document.createElement('a');
        a.download = 'signature.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      });
    }

    if (dlTypeBtn && typeCanvas) {
      dlTypeBtn.addEventListener('click', () => {
        const a = document.createElement('a');
        a.download = 'signature-typed.png';
        a.href = typeCanvas.toDataURL('image/png');
        a.click();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
