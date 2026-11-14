/* Toolswick Image Processing Web Worker
   Executes image transformation off the main thread with Transferable Objects. */
"use strict";

self.onmessage = async function (e) {
  var data = e.data;
  var runId = data.runId;
  var id = data.id;
  var buffer = data.buffer;
  var mimeType = data.mimeType;
  var outFmt = data.outFmt;
  var quality = data.quality;
  var maxW = data.maxW || 0;
  var maxH = data.maxH || 0;
  var enlarge = !!data.enlarge;

  var MIME = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };

  try {
    var blob = new Blob([buffer], { type: mimeType });
    var bmp = await createImageBitmap(blob);
    var origW = bmp.width;
    var origH = bmp.height;

    var scale = Infinity;
    if (maxW > 0) scale = Math.min(scale, maxW / origW);
    if (maxH > 0) scale = Math.min(scale, maxH / origH);
    if (scale === Infinity) scale = 1;
    if (!enlarge) scale = Math.min(scale, 1);

    var tw = Math.max(1, Math.round(origW * scale));
    var th = Math.max(1, Math.round(origH * scale));

    var targetMime = MIME[outFmt] || "image/jpeg";
    var canvas = new OffscreenCanvas(tw, th);
    var ctx = canvas.getContext("2d");

    if (outFmt === "jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, tw, th);
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, tw, th);

    // Close the bitmap immediately to reclaim memory
    bmp.close();

    var q = outFmt === "png" ? undefined : quality;
    var outBlob = await canvas.convertToBlob({ type: targetMime, quality: q });
    if (!outBlob) {
      throw new Error("Canvas encoding failed in worker.");
    }

    var outBuffer = await outBlob.arrayBuffer();
    self.postMessage(
      {
        success: true,
        runId: runId,
        id: id,
        tw: tw,
        th: th,
        origW: origW,
        origH: origH,
        outBuffer: outBuffer,
        outMime: targetMime,
        outFmt: outFmt
      },
      [outBuffer]
    );
  } catch (err) {
    self.postMessage({
      success: false,
      runId: runId,
      id: id,
      error: err.message || "Failed to process image in worker."
    });
  }
};
