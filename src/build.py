#!/usr/bin/env python3

"""Toolswick Static Site Generator & Build Pipeline.

   Builds the entire 100% client-side privacy tool suite into ../dist/

   Enforces strict security checks, file isolation, and generates Cloudflare Pages headers.

"""

import json, shutil, datetime, html, os, sys, re



# ----------------------------------------------------------------------------

# CONFIGURATION

# ----------------------------------------------------------------------------

SITE_NAME = "Toolswick"

SITE_URL = "https://toolswick.com"

CONTACT_EMAIL = "bilalpunjutha@gmail.com"

ADSENSE_CLIENT = ""  # Set ca-pub-XXXXX when ready

GA4_MEASUREMENT_ID = "G-4MNTMKV6S9"  # Google Analytics 4 web stream for toolswick.com



HERE = os.path.dirname(os.path.abspath(__file__))

DIST = os.path.join(HERE, "..", "dist")

TODAY = datetime.date.today()

e = html.escape



# ----------------------------------------------------------------------------

# PRIVACY & SECURITY GUARDRAILS (PRIORITY 1 & 2)

# ----------------------------------------------------------------------------

FORBIDDEN_BUILD_EXTENSIONS = {

    ".jpg", ".jpeg", ".png", ".pdf", ".webp", ".heic", ".tiff",

    ".bmp", ".zip", ".tar", ".gz", ".doc", ".docx", ".xls", ".xlsx",

    ".csv", ".tmp", ".bak", ".log"

}



ALLOWED_BUILD_EXTENSIONS = {

    ".html", ".css", ".js", ".svg", ".xml", ".txt", ".json", ".ico", ""

}



def verify_file_isolation(directory):

    """Audits directory to guarantee zero user documents or binary test files exist."""

    exposed_files = []

    for root, dirs, files in os.walk(directory):

        for f in files:

            name_lower = f.lower()

            _, ext = os.path.splitext(name_lower)

            # Allow favicon.svg

            if f == "favicon.svg":

                continue

            if ext in FORBIDDEN_BUILD_EXTENSIONS:

                exposed_files.append(os.path.join(root, f))

    if exposed_files:

        raise RuntimeError(

            f"CRITICAL PRIVACY VIOLATION: Exposed user files or test documents detected in build output:\n"

            + "\n".join(exposed_files)

            + "\nBuild aborted immediately to prevent accidental deployment of private assets."

        )



# ----------------------------------------------------------------------------

# WIDGET DEFINITIONS (22 TOOLS TOTAL)

# ----------------------------------------------------------------------------



# 1. IMAGE PROCESSOR (Compress, Convert, Resize)

IMAGE_WIDGET = """

<div class="layout">

  <section class="panel" aria-label="Settings">

    <fieldset>

      <legend>Output format</legend>

      <div class="seg seg4" role="radiogroup" aria-label="Output format">

        <label><input type="radio" name="fmt" value="keep">Original</label>

        <label><input type="radio" name="fmt" value="jpeg">JPG</label>

        <label><input type="radio" name="fmt" value="png">PNG</label>

        <label><input type="radio" name="fmt" value="webp">WebP</label>

      </div>

    </fieldset>

    <fieldset>

      <legend>Quality <output id="qv" for="q">80</output></legend>

      <input type="range" id="q" min="10" max="100" value="80" step="1" aria-label="Quality">

      <div class="chips" id="targetSizeChips" style="margin-top:8px">

        <button type="button" class="chip target-size-btn" data-target-kb="20">Compress to 20KB</button>

        <button type="button" class="chip target-size-btn" data-target-kb="50">Compress to 50KB</button>

        <button type="button" class="chip target-size-btn" data-target-kb="100">Compress to 100KB</button>

        <button type="button" class="chip target-size-btn" data-target-kb="200">Compress to 200KB</button>

      </div>

      <p class="hint" id="qhint">Quality 75–85 provides an optimal balance between quality and file size.</p>

    </fieldset>

    <fieldset>

      <legend>Fit within (px)</legend>

      <div class="dims">

        <input type="number" id="mw" min="1" max="16000" inputmode="numeric" placeholder="Width" aria-label="Maximum width in pixels">

        <span aria-hidden="true">×</span>

        <input type="number" id="mh" min="1" max="16000" inputmode="numeric" placeholder="Height" aria-label="Maximum height in pixels">

      </div>

      <div class="chips" id="chips">

        <button type="button" class="chip" data-w="1920" aria-pressed="false">1920px</button>

        <button type="button" class="chip" data-w="1280" aria-pressed="false">1280px</button>

        <button type="button" class="chip" data-w="800" aria-pressed="false">800px</button>

        <button type="button" class="chip" data-w="512" aria-pressed="false">512px</button>

        <button type="button" class="chip" data-w="" aria-pressed="false">Original</button>

      </div>

      <label class="check" style="margin-top:6px"><input type="checkbox" id="enlarge">Allow enlarging small images</label>

      <p class="hint">Aspect ratio is strictly preserved. Leave empty for no limit on that axis.</p>

    </fieldset>

  </section>

  <section class="right" aria-label="Images workspace">

    <label class="drop" id="drop">

      <input type="file" id="file" accept="image/*" multiple>

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" fill="currentColor" fill-opacity="0.18"/>

          <path d="M12 12v9m0-9l-3 3m3-3l3 3" stroke-width="2.2"/>

        </svg>

      </div>

      <strong>Drop images here or click to browse</strong>

      <span>Supports JPG, PNG, WebP, GIF, BMP, and AVIF. Paste from clipboard supported.</span>

      <span class="drop-browse-btn">Browse Files</span>

    </label>

    <div class="summary" id="summary" hidden>

      <div class="totals" id="totals"></div>

      <div class="btns">

        <button type="button" class="btn" id="zipBtn" hidden>Download All as ZIP</button>

        <button type="button" class="btn ghost" id="clearBtn">Clear All</button>

      </div>

    </div>

    <ul class="list" id="list"></ul>

  </section>

</div>

"""



# 2. PDF MERGE WIDGET

PDF_MERGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="application/pdf,.pdf" multiple>

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <path d="M12 11v8m0-8l-2.5 2.5m2.5-2.5l2.5 2.5" stroke-width="2.2"/>

      </svg>

    </div>

    <strong>Drop PDF files here or click to browse</strong>

    <span>Select 2 or more PDF documents. You can reorder pages before merging.</span>

    <span class="drop-browse-btn">Choose PDFs</span>

  </label>

  <div class="summary" id="summary" hidden>

    <div class="totals" id="totals"></div>

    <div class="btns">

      <button type="button" class="btn" id="mergeBtn" disabled>Add at least two PDFs</button>

      <button type="button" class="btn ghost" id="clearBtn">Clear All</button>

    </div>

  </div>

  <div id="downloadSection" class="download-box" hidden>

    <a id="downloadLink" class="btn btn-primary" download>Download Merged PDF</a>

  </div>

  <ul class="list" id="list"></ul>

</div>

"""



# 3. PDF SPLIT WIDGET

PDF_SPLIT_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <line x1="8" y1="14" x2="16" y2="14" stroke-width="2.2"/>

      </svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Choose a PDF to extract custom page ranges or split into separate documents.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <section class="card-box" id="panel" hidden>

    <p class="name" id="fileinfo"></p>

    <fieldset>

      <legend>Splitting Mode</legend>

      <label class="check"><input type="radio" name="mode" value="extract" checked>Extract specific pages into a single new PDF</label>

      <label class="check"><input type="radio" name="mode" value="all">Split every page into its own individual PDF (ZIP archive)</label>

    </fieldset>

    <div class="field" id="rangeBox">

      <label for="ranges">Pages to Extract (e.g. 1-3, 5, 8-10)</label>

      <input type="text" id="ranges" autocomplete="off" placeholder="e.g. 1-3, 5, 8-10">

      <p class="hint">Use commas and hyphens. Pages will be merged in the exact order you specify.</p>

    </div>

    <p class="bad" id="err" role="alert"></p>

    <div class="btns">

      <button type="button" class="btn" id="goBtn">Extract & Download PDF</button>

      <button type="button" class="btn ghost" id="clearBtn">Choose Another File</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download PDF</a>

    </div>

  </section>

</div>

"""



# 4. IMAGE TO PDF WIDGET



# 3b. COMPRESS PDF WIDGET

COMPRESS_PDF_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="compressPdfDrop">

    <input type="file" id="compressPdfFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <path d="M12 18v-6m-3 3l3-3 3 3" stroke-width="2.2"/>

        <circle cx="12" cy="15" r="4.5" fill="currentColor" fill-opacity="0.2"/>

      </svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Client-side compression optimizes object streams and metadata without quality loss.</span>

    <span class="drop-browse-btn">Choose PDF File</span>

  </label>



  <div id="compressPdfOptions" hidden style="margin-top:16px;">

    <div class="card" style="padding:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;">

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">

        <div>

          <span style="font-weight:700;font-size:15px;color:var(--ink);" id="compressPdfFileInfo">document.pdf</span>

          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Zero server file upload &bull; 100% private in browser memory</div>

        </div>

        <div style="display:flex;align-items:center;gap:10px;">

          <label for="compressPdfLevel" style="font-size:13px;font-weight:600;color:var(--ink-secondary);">Compression:</label>

          <select id="compressPdfLevel" class="field" style="width:auto;padding:6px 12px;font-size:13px;">

            <option value="standard" selected>Standard (Fast & Lossless)</option>

            <option value="high">High (Maximum File Reduction)</option>

          </select>

        </div>

      </div>

      <div style="margin-top:14px;display:flex;gap:10px;align-items:center;">

        <button type="button" class="btn" id="compressPdfActionBtn">Compress PDF Now</button>

        <span id="compressPdfStatus" style="font-size:13px;color:var(--muted);font-weight:500;"></span>

      </div>

    </div>

  </div>



  <div id="compressPdfDownloadSection" hidden class="download-box">

    <div id="compressPdfSavings" style="font-size:14px;"></div>

    <a id="compressPdfDownloadBtn" class="btn btn-primary" download role="button">

      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>

      Download Compressed PDF

    </a>

  </div>

</div>

"""



# 3c. PDF TO IMAGE WIDGET

PDF_TO_IMAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="pdfImgDrop">

    <input type="file" id="pdfImgFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <circle cx="9" cy="14" r="1.5" fill="currentColor"/>

        <polyline points="16 17 13 13 8 18" stroke-width="1.8"/>

      </svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Convert every PDF page into high-definition JPG or PNG images.</span>

    <span class="drop-browse-btn">Choose PDF File</span>

  </label>



  <div id="pdfImgOptions" hidden style="margin-top:16px;">

    <div class="card" style="padding:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;">

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">

        <div>

          <span style="font-weight:700;font-size:15px;color:var(--ink);" id="pdfImgFileInfo">document.pdf</span>

          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Rendered directly on canvas &bull; Zero server file upload</div>

        </div>

        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;">

          <div style="display:flex;align-items:center;gap:6px;">

            <label for="pdfImgFormat" style="font-size:13px;font-weight:600;color:var(--ink-secondary);">Format:</label>

            <select id="pdfImgFormat" class="field" style="width:auto;padding:6px 10px;font-size:13px;">

              <option value="jpeg" selected>JPG (Standard Web)</option>

              <option value="png">PNG (Lossless)</option>

            </select>

          </div>

          <div style="display:flex;align-items:center;gap:6px;">

            <label for="pdfImgScale" style="font-size:13px;font-weight:600;color:var(--ink-secondary);">Resolution:</label>

            <select id="pdfImgScale" class="field" style="width:auto;padding:6px 10px;font-size:13px;">

              <option value="1.0">Standard (72-96 DPI)</option>

              <option value="1.5" selected>Crisp HD (150 DPI)</option>

              <option value="2.0">Ultra HD (300 DPI)</option>

            </select>

          </div>

        </div>

      </div>

      <div style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">

        <button type="button" class="btn" id="pdfImgActionBtn">Convert Pages to Images</button>

        <button type="button" class="btn ghost" id="pdfImgZipBtn" hidden>

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>

          Download All Pages as ZIP

        </button>

        <span id="pdfImgStatus" style="font-size:13px;color:var(--muted);font-weight:500;"></span>

      </div>

      <div id="pdfImgProgress" hidden style="margin-top:12px;width:100%;height:6px;background:var(--line);border-radius:9999px;overflow:hidden;">

        <div id="pdfImgProgressBar" style="width:0%;height:100%;background:var(--primary);transition:width 0.2s;"></div>

      </div>

    </div>

  </div>



  <div id="pdfImgResultsGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:14px;margin-top:18px;"></div>

</div>

"""



# 3d. HEIC TO JPG WIDGET

HEIC_TO_JPG_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="heicDrop">

    <input type="file" id="heicFile" accept=".heic,.heif,image/heic,image/heif" multiple>

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fill-opacity="0.18"/>

        <circle cx="12" cy="12" r="3.5" fill="currentColor" fill-opacity="0.3"/>

        <path d="M7 8h.01M17 8h.01"/>

      </svg>

    </div>

    <strong>Drop Apple iPhone HEIC/HEIF photos here or click to browse</strong>

    <span>Convert iOS HEIC pictures to widely supported JPG or PNG images directly in your browser.</span>

    <span class="drop-browse-btn">Choose HEIC Photos</span>

  </label>



  <div id="heicOptions" hidden style="margin-top:16px;">

    <div class="card" style="padding:16px;background:var(--surface);border:1px solid var(--line);border-radius:12px;">

      <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">

        <div>

          <span style="font-weight:700;font-size:15px;color:var(--ink);" id="heicFilesList">0 HEIC photos selected</span>

          <div style="font-size:12px;color:var(--muted);margin-top:2px;">Private WebAssembly decoding &bull; Zero server upload</div>

        </div>

        <div style="display:flex;flex-wrap:wrap;align-items:center;gap:12px;">

          <div style="display:flex;align-items:center;gap:6px;">

            <label for="heicFormat" style="font-size:13px;font-weight:600;color:var(--ink-secondary);">Target:</label>

            <select id="heicFormat" class="field" style="width:auto;padding:6px 10px;font-size:13px;">

              <option value="image/jpeg" selected>JPG (Standard Photo)</option>

              <option value="image/png">PNG (Lossless)</option>

            </select>

          </div>

          <div style="display:flex;align-items:center;gap:6px;">

            <label for="heicQuality" style="font-size:13px;font-weight:600;color:var(--ink-secondary);">Quality:</label>

            <select id="heicQuality" class="field" style="width:auto;padding:6px 10px;font-size:13px;">

              <option value="0.95">Maximum (95%)</option>

              <option value="0.90" selected>High (90%)</option>

              <option value="0.80">Medium (80%)</option>

            </select>

          </div>

        </div>

      </div>

      <div style="margin-top:14px;display:flex;gap:12px;align-items:center;flex-wrap:wrap;">

        <button type="button" class="btn" id="heicActionBtn">Convert to JPG</button>

        <button type="button" class="btn ghost" id="heicZipBtn" hidden>

          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>

          Download All as ZIP

        </button>

        <span id="heicStatus" style="font-size:13px;color:var(--muted);font-weight:500;"></span>

      </div>

    </div>

  </div>



  <div id="heicResults" hidden style="margin-top:18px;">

    <div id="heicResultsGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(200px, 1fr));gap:14px;"></div>

  </div>

</div>

"""



IMG2PDF_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="image/*" multiple>

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/>

        <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>

        <path d="M21 15l-5-5L5 21" fill="currentColor" fill-opacity="0.25"/>

        <path d="M12 11v7m0-7l-2 2m2-2l2 2" stroke-width="2.2"/>

      </svg>

    </div>

    <strong>Drop images here or click to browse</strong>

    <span>Convert multiple JPG, PNG, or WebP images into a single organized PDF.</span>

    <span class="drop-browse-btn">Select Images</span>

  </label>

  <div class="card-box">

    <div class="grid2">

      <div class="field">

        <label for="pagesize">Page Size</label>

        <select id="pagesize">

          <option value="fit">Fit to Image (No Margins)</option>

          <option value="a4" selected>Standard A4 Paper</option>

          <option value="letter">US Letter Paper</option>

        </select>

      </div>

      <label class="check" style="align-self:end; margin-bottom:8px">

        <input type="checkbox" id="landscape" checked>Auto-orient landscape images on A4/Letter

      </label>

    </div>

  </div>

  <div class="summary" id="summary" hidden>

    <div class="totals" id="totals"></div>

    <div class="btns">

      <button type="button" class="btn" id="goBtn" disabled>Create PDF</button>

      <button type="button" class="btn ghost" id="clearBtn">Clear All</button>

    </div>

  </div>

  <div id="downloadSection" class="download-box" hidden>

    <a id="downloadLink" class="btn btn-primary" download>Download PDF</a>

  </div>

  <ul class="list" id="list"></ul>

</div>

"""



# 5. ROTATE PDF WIDGET (NEW TOOL 1)

PDF_ROTATE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" fill-opacity="0.18"/>

        <path d="M21 8A9 9 0 0 0 6.3 5.3L4 7.5" stroke-width="2.2"/>

        <polyline points="4 3 4 8 9 8" fill="currentColor" stroke-width="2"/>

        <circle cx="12" cy="12" r="2" fill="currentColor"/>

      </svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Rotate all pages or individual pages permanently in your browser.</span>

    <span class="drop-browse-btn">Select PDF</span>

  </label>

  <section class="card-box" id="panel" hidden>

    <div class="summary" style="background:var(--surface)">

      <div>

        <p class="name" id="fileinfo"></p>

        <p class="hint">Click page buttons to rotate individual pages, or use global controls below.</p>

      </div>

      <div class="btns">

        <button type="button" class="btn ghost small" id="rotateCwAll">↻ Rotate All +90°</button>

        <button type="button" class="btn ghost small" id="rotateCcwAll">↺ Rotate All -90°</button>

        <button type="button" class="btn ghost small" id="rotate180All">⇅ Rotate All 180°</button>

        <button type="button" class="btn ghost small" id="resetRotation">Reset</button>

      </div>

    </div>

    <div class="pdf-grid" id="pageGrid"></div>

    <div class="btns" style="margin-top:16px">

      <button type="button" class="btn" id="saveBtn">Apply Rotation & Download PDF</button>

      <button type="button" class="btn ghost" id="clearBtn">Choose Another File</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Rotated PDF</a>

    </div>

  </section>

</div>

"""



# 6. DELETE PDF PAGES WIDGET (NEW TOOL 2)

PDF_DELETE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <circle cx="12" cy="15" r="4.5" fill="currentColor" fill-opacity="0.25"/>

        <line x1="9.5" y1="15" x2="14.5" y2="15" stroke-width="2.5"/>

      </svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Select pages to remove permanently from your document.</span>

    <span class="drop-browse-btn">Select PDF</span>

  </label>

  <section class="card-box" id="panel" hidden>

    <div class="summary" style="background:var(--surface)">

      <div>

        <p class="name" id="fileinfo"></p>

        <p class="hint" id="deleteStatus">Click on pages to toggle deletion or type page numbers below.</p>

      </div>

      <div class="btns">

        <button type="button" class="btn ghost small" id="selectNoneBtn">Clear Selection</button>

        <button type="button" class="btn ghost small" id="selectEvenBtn">Even Pages</button>

        <button type="button" class="btn ghost small" id="selectOddBtn">Odd Pages</button>

        <button type="button" class="btn ghost small" id="invertBtn">Invert</button>

      </div>

    </div>

    <div class="field" style="margin-block:12px">

      <label for="deleteInput">Pages to Delete (comma-separated or ranges)</label>

      <input type="text" id="deleteInput" placeholder="e.g. 1, 3-5, 8">

    </div>

    <div class="pdf-grid" id="pageDeleteGrid"></div>

    <div class="btns" style="margin-top:16px">

      <button type="button" class="btn danger" id="delBtn" disabled>Select pages to delete</button>

      <button type="button" class="btn ghost" id="clearBtn">Choose Another File</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Cleaned PDF</a>

    </div>

  </section>

</div>

"""



# 7. SVG TO PNG WIDGET (NEW TOOL 3)

SVG2PNG_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="image/svg+xml,.svg">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fill-opacity="0.22"/>

        <path d="M2 17l10 5 10-5"/>

        <path d="M2 12l10 5 10-5"/>

        <circle cx="12" cy="7" r="1.8" fill="currentColor"/>

      </svg>

    </div>

    <strong>Drop SVG file here or click to browse</strong>

    <span>Client-side sanitized vector rendering with customizable resolution.</span>

    <span class="drop-browse-btn">Select SVG</span>

  </label>

  <section class="card-box" id="panel" hidden>

    <div class="grid3">

      <div class="field">

        <label for="scaleSelect">Resolution Scale</label>

        <select id="scaleSelect">

          <option value="1">1x Standard</option>

          <option value="2" selected>2x High DPI (Retina)</option>

          <option value="4">4x Ultra HD</option>

          <option value="8">8x Print Quality</option>

        </select>

      </div>

      <div class="field">

        <label for="bgSelect">Background</label>

        <select id="bgSelect">

          <option value="transparent" selected>Transparent</option>

          <option value="white">Solid White</option>

          <option value="black">Solid Black</option>

          <option value="custom">Custom Color…</option>

        </select>

      </div>

      <div class="field" id="customBgBox" hidden>

        <label for="customBgColor">Pick Color</label>

        <input type="color" id="customBgColor" value="#ffffff">

      </div>

    </div>

    <div class="grid2" style="margin-top:10px">

      <div class="field">

        <label for="customW">Custom Width (px, optional)</label>

        <input type="number" id="customW" placeholder="Auto">

      </div>

      <div class="field">

        <label for="customH">Custom Height (px, optional)</label>

        <input type="number" id="customH" placeholder="Auto">

      </div>

    </div>

    <div style="text-align:center; margin-block:16px; overflow:auto">

      <p class="hint" id="dimInfo" style="margin-bottom:8px"></p>

      <canvas id="previewCanvas" style="max-width:100%; height:auto; border:1px solid var(--line); border-radius:8px; background:repeating-conic-gradient(#80808020 0% 25%, transparent 0% 50%) 50% / 16px 16px"></canvas>

    </div>

    <div class="btns">

      <button type="button" class="btn" id="downloadPngBtn" disabled>Download Crisp PNG</button>

      <button type="button" class="btn ghost" id="clearBtn">Choose Another File</button>

    </div>

  </section>

</div>

"""



# 8. BASE64 TOOL WIDGET (NEW TOOL 4)

BASE64_WIDGET = """

<div class="tool-workspace">

  <div class="b64-mode-tabs" role="tablist">

    <button type="button" class="b64-mode-tab active" data-mode="modeText" role="tab" aria-selected="true">Text ↔ Base64</button>

    <button type="button" class="b64-mode-tab" data-mode="modeFileToB64" role="tab" aria-selected="false">File → Base64</button>

    <button type="button" class="b64-mode-tab" data-mode="modeB64ToFile" role="tab" aria-selected="false">Base64 → File Download</button>

  </div>



  <!-- Tab 1: Text -->

  <div class="b64-mode-panel" id="modeText">

    <div class="two">

      <div class="field">

        <label for="textIn">Input Text or Base64 String</label>

        <textarea id="textIn" placeholder="Type or paste text or Base64 string here…">Hello, Toolswick! 🚀 100% Client-Side Privacy.</textarea>

      </div>

      <div class="field">

        <label for="textOut">Result</label>

        <textarea id="textOut" readonly placeholder="Output will appear here…"></textarea>

      </div>

    </div>

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:14px">

      <label class="check"><input type="checkbox" id="urlSafeCheck">URL-safe format (- and _)</label>

      <div class="btns">

        <button type="button" class="btn" id="encodeTextBtn">Encode to Base64</button>

        <button type="button" class="btn" id="decodeTextBtn">Decode to Text</button>

        <button type="button" class="btn ghost" id="copyTextBtn">Copy Result</button>

      </div>

    </div>

    <p id="textMsg" class="hint" style="margin-top:10px"></p>

  </div>



  <!-- Tab 2: File to Base64 -->

  <div class="b64-mode-panel" id="modeFileToB64" hidden>

    <label class="drop" id="fileDrop">

      <input type="file" id="b64FileInputPicker">

      <svg class="drop-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>

      <strong>Drop any file here or click to browse</strong>

      <span>Images, PDFs, audio, documents — converts to Data URI or raw Base64.</span>

      <span class="drop-browse-btn">Choose File</span>

    </label>

    <div class="card-box" style="margin-top:14px">

      <div class="field">

        <label for="fileBase64Out">Generated Base64 Data URI</label>

        <textarea id="fileBase64Out" readonly style="min-height:160px" placeholder="Base64 encoded file string will appear here…"></textarea>

      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-top:10px">

        <label class="check"><input type="checkbox" id="rawB64Only">Raw Base64 only (strip data:mime;base64, prefix)</label>

        <div class="btns">

          <button type="button" class="btn" id="copyFileB64Btn">Copy Base64</button>

        </div>

      </div>

      <p id="fileMetaOut" class="hint" style="margin-top:8px"></p>

    </div>

  </div>



  <!-- Tab 3: Base64 to File Download -->

  <div class="b64-mode-panel" id="modeB64ToFile" hidden>

    <div class="field">

      <label for="b64FileInput">Paste Data URI or Raw Base64 String</label>

      <textarea id="b64FileInput" placeholder="Paste data:image/png;base64,iVBORw0KGgoAAAANSUhEUg... or raw Base64 here"></textarea>

    </div>

    <div class="btns" style="margin-top:14px">

      <button type="button" class="btn" id="b64ToFileBtn">Decode & Download File</button>

    </div>

  </div>

</div>

"""



# 9. EXIF METADATA REMOVER WIDGET (NEW TOOL 5)

EXIF_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="drop">

    <input type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.2"/>

        <circle cx="12" cy="10" r="3" fill="currentColor" fill-opacity="0.3"/>

        <line x1="9" y1="15" x2="15" y2="15" stroke-width="2"/>

      </svg>

    </div>

    <strong>Drop photo here or click to browse</strong>

    <span>Inspect and eliminate GPS geotags, camera serials, and timestamps.</span>

    <span class="drop-browse-btn">Select Photo</span>

  </label>

  <section class="card-box" id="panel" hidden>

    <p class="name" id="fileinfo"></p>

    <div id="metadataReport" style="margin-block:12px"></div>

    <div class="btns">

      <button type="button" class="btn" id="stripBtn">Strip Metadata & Download Clean Image</button>

      <button type="button" class="btn ghost" id="clearBtn">Choose Another Photo</button>

    </div>

  </section>

</div>

"""



# 11. PERCENTAGE CALCULATOR WIDGET

PERCENT_WIDGET = """

<div class="grid3">

  <div class="card-box">

    <h3>What is X% of Y?</h3>

    <div class="inline">What is <input type="number" id="p1a" value="15" step="any" aria-label="Percent"> % of <input type="number" id="p1b" value="240" step="any" aria-label="Number"> ?</div>

    <p class="result" id="p1r">—</p>

  </div>

  <div class="card-box">

    <h3>X is what percent of Y?</h3>

    <div class="inline"><input type="number" id="p2a" value="45" step="any" aria-label="Part"> is what % of <input type="number" id="p2b" value="180" step="any" aria-label="Whole"> ?</div>

    <p class="result" id="p2r">—</p>

  </div>

  <div class="card-box">

    <h3>Percentage Change</h3>

    <div class="inline">From <input type="number" id="p3a" value="80" step="any" aria-label="Old value"> to <input type="number" id="p3b" value="100" step="any" aria-label="New value"></div>

    <p class="result" id="p3r">—</p>

  </div>

</div>

"""



# 12. AGE CALCULATOR WIDGET

AGE_WIDGET = """

<div class="card-box" style="max-width:680px; margin-inline:auto">

  <div class="grid2">

    <div class="field"><label for="dob">Date of Birth</label><input type="date" id="dob"></div>

    <div class="field"><label for="asof">Age At Date</label><input type="date" id="asof"></div>

  </div>

  <div id="ageOut" aria-live="polite" style="margin-top:20px"></div>

</div>

"""



# 13. BMI CALCULATOR WIDGET

BMI_WIDGET = """

<div class="card-box" style="max-width:680px; margin-inline:auto">

  <fieldset>

    <legend>Measurement System</legend>

    <div class="seg" style="grid-template-columns:repeat(2,1fr);max-width:280px">

      <label><input type="radio" name="units" value="metric" checked>Metric (cm / kg)</label>

      <label><input type="radio" name="units" value="imperial">Imperial (ft / lb)</label>

    </div>

  </fieldset>

  <div id="metricBox" class="grid2" style="margin-top:16px">

    <div class="field"><label for="cm">Height (cm)</label><input type="number" id="cm" value="170" min="0" step="any"></div>

    <div class="field"><label for="kg">Weight (kg)</label><input type="number" id="kg" value="65" min="0" step="any"></div>

  </div>

  <div id="imperialBox" class="grid2" style="margin-top:16px" hidden>

    <div class="field"><label for="ft">Height (feet)</label><input type="number" id="ft" value="5" min="0" step="1"></div>

    <div class="field"><label for="inch">Height (inches)</label><input type="number" id="inch" value="7" min="0" step="any"></div>

    <div class="field"><label for="lb">Weight (pounds)</label><input type="number" id="lb" value="150" min="0" step="any"></div>

  </div>

  <div id="bmiOut" aria-live="polite" style="margin-top:20px"></div>

</div>

"""



# 14. LOAN CALCULATOR WIDGET

LOAN_WIDGET = """

<div class="card-box">

  <div class="grid2">

    <div class="field"><label for="amount">Loan Amount</label><input type="number" id="amount" value="250000" min="0" step="any"></div>

    <div class="field">

      <label for="cur">Currency</label>

      <select id="cur">

        <option value="USD">USD ($) - US Dollar</option>

        <option value="EUR">EUR (€) - Euro</option>

        <option value="GBP">GBP (£) - British Pound</option>

        <option value="CAD">CAD (CA$) - Canadian Dollar</option>

        <option value="AUD">AUD (A$) - Australian Dollar</option>

        <option value="INR">INR (₹) - Indian Rupee</option>

        <option value="PKR">PKR (₨) - Pakistani Rupee</option>

        <option value="SAR">SAR (﷼) - Saudi Riyal</option>

        <option value="AED">AED (د.إ) - UAE Dirham</option>

      </select>

    </div>

    <div class="field"><label for="rate">Annual Interest Rate (%)</label><input type="number" id="rate" value="6.5" min="0" step="any"></div>

    <div class="field">

      <label for="term">Loan Term</label>

      <div class="inline" style="flex-wrap:nowrap">

        <input type="number" id="term" value="30" min="1" step="1" style="width:100%">

        <select id="termUnit" style="width:auto"><option value="years">years</option><option value="months">months</option></select>

      </div>

    </div>

  </div>

  <div id="loanOut" aria-live="polite" style="margin-top:24px"></div>

</div>

"""



# 15. WORD COUNTER WIDGET

WORD_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="text">Type or Paste Your Text</label>

    <textarea id="text" placeholder="Type or paste your text here to get instant word, character, sentence, and paragraph counts…" style="min-height:280px"></textarea>

  </div>

  <dl class="stats">

    <div><dt>Words</dt><dd id="v-w">0</dd></div>

    <div><dt>Characters</dt><dd id="v-c">0</dd></div>

    <div><dt>Without Spaces</dt><dd id="v-cs">0</dd></div>

    <div><dt>Sentences</dt><dd id="v-s">0</dd></div>

    <div><dt>Paragraphs</dt><dd id="v-p">0</dd></div>

    <div><dt>Reading Time</dt><dd id="v-rt">0 sec</dd></div>

    <div><dt>Speaking Time</dt><dd id="v-st">0 sec</dd></div>

  </dl>

  <div class="btns">

    <label for="wordFileInput" class="btn ghost" id="wordUploadBtn" style="cursor:pointer">Upload File</label>

    <input type="file" id="wordFileInput" accept=".txt,.md,.text,text/plain,*" style="display:none">

    <button type="button" class="btn ghost" id="clearBtn">Clear Text</button>

  </div>

</div>

"""



# 16. JSON FORMATTER WIDGET

JSON_WIDGET = """

<div class="tool-workspace">

  <div class="card-box">

    <div class="grid3" style="align-items:end">

      <div class="field">

        <label for="indent">Indentation</label>

        <select id="indent">

          <option value="2">2 spaces</option>

          <option value="4">4 spaces</option>

          <option value="tab">Tab</option>

        </select>

      </div>

      <label class="check" style="margin-bottom:10px">

        <input type="checkbox" id="sort">Sort keys alphabetically (A-Z)

      </label>

      <div class="btns">

        <button type="button" class="btn" id="fmtBtn">Beautify JSON</button>

        <button type="button" class="btn ghost" id="minBtn">Minify JSON</button>

      </div>

    </div>

    <p id="msg" class="hint" role="status" style="margin-top:10px"></p>

  </div>

  <div class="two" style="margin-top:16px">

    <div class="field">

      <label for="in">Input JSON</label>

      <textarea id="in" spellcheck="false">{"platform":"Toolswick","privacyGuarantee":{"zeroUploads":true,"browserSandbox":true},"tools":["image","pdf","dev","calculators"]}</textarea>

    </div>

    <div class="field">

      <label for="out">Formatted Result</label>

      <textarea id="out" readonly spellcheck="false"></textarea>

    </div>

  </div>

  <div class="btns" style="margin-top:14px">

    <label for="jsonFileInput" class="btn ghost" style="cursor:pointer">Upload File</label>

    <input type="file" id="jsonFileInput" accept=".json,application/json" style="display:none">

    <button type="button" class="btn" id="copyBtn">Copy Result</button>

    <button type="button" class="btn ghost" id="clearBtn">Clear All</button>

  </div>

</div>

"""



# 17. QR CODE GENERATOR WIDGET

QR_WIDGET = """

<div class="tool-workspace">

  <div class="two">

    <div class="card-box">

      <div style="display:flex;gap:6px;margin-bottom:12px;flex-wrap:wrap;">

        <button type="button" class="btn qr-mode-tab active sm" data-mode="url">URL / Text</button>

        <button type="button" class="btn ghost qr-mode-tab sm" data-mode="wifi">Wi-Fi</button>

        <button type="button" class="btn ghost qr-mode-tab sm" data-mode="vcard">vCard</button>

        <button type="button" class="btn ghost qr-mode-tab sm" data-mode="email">Email</button>

        <button type="button" class="btn ghost qr-mode-tab sm" data-mode="sms">SMS</button>

      </div>

      <div id="qrPanel_url" class="qr-tab-panel">

        <div class="field">

          <label for="qtext">Website URL or Text</label>

          <textarea id="qtext" style="min-height:90px">https://toolswick.com</textarea>

        </div>

      </div>

      <div id="qrPanel_wifi" class="qr-tab-panel" style="display:none;">

        <div class="field"><label for="qrWifiSsid">Network Name (SSID)</label><input type="text" id="qrWifiSsid" placeholder="e.g. Home_Network"></div>

        <div class="grid2" style="margin-top:8px;">

          <div class="field"><label for="qrWifiPass">Password</label><input type="text" id="qrWifiPass" placeholder="Network password"></div>

          <div class="field"><label for="qrWifiEnc">Encryption</label><select id="qrWifiEnc"><option value="WPA" selected>WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">None (Open)</option></select></div>

        </div>

        <label class="check" style="font-size:0.85rem;margin-top:8px;"><input type="checkbox" id="qrWifiHidden"> Hidden Network</label>

      </div>

      <div id="qrPanel_vcard" class="qr-tab-panel" style="display:none;">

        <div class="field"><label for="qrVcName">Full Name</label><input type="text" id="qrVcName" placeholder="e.g. Sarah Jenkins"></div>

        <div class="grid2" style="margin-top:8px;">

          <div class="field"><label for="qrVcTel">Phone Number</label><input type="text" id="qrVcTel" placeholder="+1 (555) 019-2834"></div>

          <div class="field"><label for="qrVcEmail">Email Address</label><input type="email" id="qrVcEmail" placeholder="sarah@example.com"></div>

        </div>

        <div class="field" style="margin-top:8px;"><label for="qrVcOrg">Organization / Company</label><input type="text" id="qrVcOrg" placeholder="Acme Global Inc."></div>

      </div>

      <div id="qrPanel_email" class="qr-tab-panel" style="display:none;">

        <div class="field"><label for="qrEmailTo">Recipient Email</label><input type="email" id="qrEmailTo" placeholder="support@example.com"></div>

        <div class="field" style="margin-top:8px;"><label for="qrEmailSubj">Subject</label><input type="text" id="qrEmailSubj" placeholder="Inquiry about services"></div>

        <div class="field" style="margin-top:8px;"><label for="qrEmailBody">Body Message</label><textarea id="qrEmailBody" rows="3" placeholder="Type your email body..."></textarea></div>

      </div>

      <div id="qrPanel_sms" class="qr-tab-panel" style="display:none;">

        <div class="field"><label for="qrSmsNum">Phone Number</label><input type="text" id="qrSmsNum" placeholder="+1 (555) 019-2834"></div>

        <div class="field" style="margin-top:8px;"><label for="qrSmsMsg">Pre-filled SMS Message</label><textarea id="qrSmsMsg" rows="3" placeholder="Hello, I would like to..."></textarea></div>

      </div>

      <div class="grid2">

        <div class="field">

          <label for="qsize">Pixel Dimension</label>

          <select id="qsize">

            <option value="256">256 × 256 px</option>

            <option value="512" selected>512 × 512 px</option>

            <option value="1024">1024 × 1024 px</option>

            <option value="2048">2048 × 2048 px</option>

          </select>

        </div>

        <div class="field">

          <label for="qec">Error Correction</label>

          <select id="qec">

            <option value="L">Low (7%)</option>

            <option value="M" selected>Medium (15%)</option>

            <option value="Q">Quartile (25%)</option>

            <option value="H">High (30%)</option>

          </select>

        </div>

        <div class="field">

          <label for="qfg">Pattern Color</label>

          <input type="color" id="qfg" value="#000000">

        </div>

        <div class="field">

          <label for="qbg">Background Color</label>

          <input type="color" id="qbg" value="#ffffff">

        </div>

      </div>

      <p class="hint" id="qmsg" role="status" style="margin-top:8px"></p>

    </div>

    <div class="card-box" style="align-items:center; justify-content:center; text-align:center">

      <canvas id="qcanvas" width="512" height="512" aria-label="Generated QR Code Preview" style="max-width:280px; width:100%; height:auto; border:1px solid var(--line); border-radius:8px"></canvas>

      <div class="btns" style="margin-top:16px; justify-content:center">

        <button type="button" class="btn" id="qpng">Download PNG</button>

        <button type="button" class="btn ghost" id="qsvg">Download Scalable SVG</button>

      </div>

    </div>

  </div>

</div>

"""



# ----------------------------------------------------------------------------

# BATCH 1: TEXT & WRITING TOOLS (10 TOOLS)

# ----------------------------------------------------------------------------



# 1. TEXT CASE CONVERTER

TEXT_CASE_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="tcInput">Enter Text to Convert</label>

    <textarea id="tcInput" placeholder="Type or paste text here to convert case…" style="min-height:160px"></textarea>

  </div>

  <div class="btns" style="flex-wrap:wrap; gap:8px; margin: 12px 0;">

    <button type="button" class="btn" id="tcUpper">UPPERCASE</button>

    <button type="button" class="btn" id="tcLower">lowercase</button>

    <button type="button" class="btn" id="tcTitle">Title Case</button>

    <button type="button" class="btn" id="tcSentence">Sentence case</button>

    <button type="button" class="btn ghost" id="tcCamel">camelCase</button>

    <button type="button" class="btn ghost" id="tcPascal">PascalCase</button>

    <button type="button" class="btn ghost" id="tcSnake">snake_case</button>

    <button type="button" class="btn ghost" id="tcKebab">kebab-case</button>

  </div>

  <div class="field">

    <label for="tcOutput">Converted Output</label>

    <textarea id="tcOutput" readonly placeholder="Converted text will appear here…" style="min-height:160px"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="tcCopy">Copy Output</button>

    <button type="button" class="btn ghost" id="tcClear">Clear</button>

  </div>

</div>

"""



# 2. TEXT TOOLS — MULTI-FUNCTION

TEXT_TOOLS_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist">

    <button type="button" class="tt-tab active" data-mode="duplicates" role="tab" aria-selected="true">Remove Duplicates</button>

    <button type="button" class="tt-tab" data-mode="sort" role="tab" aria-selected="false">Sort Lines</button>

    <button type="button" class="tt-tab" data-mode="spaces" role="tab" aria-selected="false">Remove Spaces</button>

    <button type="button" class="tt-tab" data-mode="blank" role="tab" aria-selected="false">Remove Blank Lines</button>

    <button type="button" class="tt-tab" data-mode="reverse" role="tab" aria-selected="false">Reverse Text</button>

    <button type="button" class="tt-tab" data-mode="formatting" role="tab" aria-selected="false">Remove Formatting</button>

  </div>

  <div id="ttSortOpts" style="display:none; align-items:center; gap:16px; margin-bottom:12px;" class="card-box">

    <span style="font-weight:600">Sort Direction:</span>

    <label class="check" style="margin:0"><input type="radio" name="ttSortDir" value="az" checked> A to Z (Ascending)</label>

    <label class="check" style="margin:0"><input type="radio" name="ttSortDir" value="za"> Z to A (Descending)</label>

  </div>

  <div class="two">

    <div class="field">

      <label for="ttInput">Input Text</label>

      <textarea id="ttInput" placeholder="Enter text here to process…" style="min-height:220px"></textarea>

    </div>

    <div class="field">

      <label for="ttOutput">Processed Result</label>

      <textarea id="ttOutput" readonly placeholder="Processed text will appear here…" style="min-height:220px"></textarea>

    </div>

  </div>

  <div class="btns" style="margin-top:14px">

    <button type="button" class="btn" id="ttProcess">Process Text</button>

    <button type="button" class="btn ghost" id="ttCopy">Copy Result</button>

    <button type="button" class="btn ghost" id="ttClear">Clear</button>

  </div>

</div>

"""



# 3. FIND AND REPLACE

FIND_REPLACE_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="frInput">Source Text</label>

    <textarea id="frInput" placeholder="Paste your text here…" style="min-height:160px"></textarea>

  </div>

  <div class="card-box" style="margin: 14px 0">

    <div class="grid2">

      <div class="field">

        <label for="frFind">Find</label>

        <input type="text" id="frFind" placeholder="Text to find…">

      </div>

      <div class="field">

        <label for="frReplace">Replace with</label>

        <input type="text" id="frReplace" placeholder="Replacement text…">

      </div>

    </div>

    <div style="display:flex; gap:20px; align-items:center; margin-top:10px; flex-wrap:wrap">

      <label class="check"><input type="checkbox" id="frCase"> Case Sensitive</label>

      <label class="check"><input type="checkbox" id="frRegex"> Regular Expression (Regex)</label>

      <button type="button" class="btn" id="frReplaceBtn" style="margin-left:auto">Replace All</button>

    </div>

  </div>

  <div class="field">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

      <label for="frOutput" style="margin:0">Result</label>

      <span id="frMatchCount" class="hint" style="font-weight:600"></span>

    </div>

    <textarea id="frOutput" readonly placeholder="Modified text will appear here…" style="min-height:160px"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="frCopy">Copy Result</button>

  </div>

</div>

"""



# 4. TEXT COMPARE

TEXT_COMPARE_WIDGET = """

<div class="tool-workspace">

  <style>

    .diff-container { border:1px solid var(--line); border-radius:8px; padding:12px; background:var(--surface); font-family:monospace; font-size:13px; max-height:400px; overflow-y:auto; line-height:1.6; }

    .diff-common { padding:3px 8px; color:var(--muted); border-left:3px solid transparent; }

    .diff-a { padding:3px 8px; background:rgba(34,197,94,0.12); color:#15803d; border-left:3px solid #22c55e; }

    .diff-b { padding:3px 8px; background:rgba(239,68,68,0.12); color:#b91c1c; border-left:3px solid #ef4444; }

    .diff-stats { display:flex; gap:20px; flex-wrap:wrap; padding:10px 14px; background:var(--surface); border-radius:6px; margin:14px 0; font-size:14px; }

  </style>

  <div class="grid2">

    <div class="field">

      <label for="tcaInput">Original Text (A)</label>

      <textarea id="tcaInput" placeholder="Paste original text here…" style="min-height:220px"></textarea>

    </div>

    <div class="field">

      <label for="tcbInput">Modified Text (B)</label>

      <textarea id="tcbInput" placeholder="Paste changed text here…" style="min-height:220px"></textarea>

    </div>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="tcCompare">Compare Texts</button>

  </div>

  <div id="tcStats" class="diff-stats" style="display:flex;"></div>

  <div class="field">

    <label>Line Comparison View (Green = Only in A, Red = Only in B, Grey = Common)</label>

    <div id="tcDiff" class="diff-container">

      <p class="hint">Enter text in Text A and Text B above and click "Compare Texts".</p>

    </div>

  </div>

</div>

"""



# 5. LOREM IPSUM GENERATOR

LOREM_IPSUM_WIDGET = """

<div class="tool-workspace">

  <div class="card-box">

    <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center">

      <fieldset style="border:none; padding:0; margin:0; display:flex; gap:14px; align-items:center">

        <legend style="font-weight:600; margin-bottom:4px">Generate</legend>

        <label class="check" style="margin:0"><input type="radio" name="liMode" value="paragraphs" checked> Paragraphs</label>

        <label class="check" style="margin:0"><input type="radio" name="liMode" value="sentences"> Sentences</label>

        <label class="check" style="margin:0"><input type="radio" name="liMode" value="words"> Words</label>

      </fieldset>

      <div class="field" style="margin:0; width:120px">

        <label for="liAmount">Amount (1-50)</label>

        <input type="number" id="liAmount" min="1" max="50" value="3">

      </div>

      <button type="button" class="btn" id="liGenerate" style="margin-top:auto">Generate Lorem Ipsum</button>

    </div>

  </div>

  <div class="field" style="margin-top:14px">

    <label for="liOutput">Generated Placeholder Text</label>

    <textarea id="liOutput" readonly placeholder="Generated text will appear here…" style="min-height:220px"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="liCopy">Copy to Clipboard</button>

  </div>

</div>

"""



# 6. URL SLUG GENERATOR

SLUG_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="slugInput">Enter Title or String</label>

    <input type="text" id="slugInput" placeholder="Enter a title or phrase (e.g. 10 Best Practices for Clean Code)…" style="font-size:16px">

  </div>

  <div class="card-box" style="margin: 14px 0">

    <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center">

      <fieldset style="border:none; padding:0; margin:0; display:flex; gap:14px; align-items:center">

        <legend style="font-weight:600; margin-bottom:4px">Separator</legend>

        <label class="check" style="margin:0"><input type="radio" name="slugSep" value="-" checked> Hyphen (-)</label>

        <label class="check" style="margin:0"><input type="radio" name="slugSep" value="_"> Underscore (_)</label>

      </fieldset>

      <label class="check" style="margin:0"><input type="checkbox" id="slugStopWords" checked> Remove common stop words (a, the, in, …)</label>

      <button type="button" class="btn" id="slugGenerate" style="margin-left:auto">Generate Slug</button>

    </div>

  </div>

  <div class="field">

    <label for="slugOutput">Generated URL Slug</label>

    <input type="text" id="slugOutput" readonly placeholder="generated-url-slug" style="font-family:monospace; font-size:16px">

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="slugCopy">Copy Slug</button>

  </div>

</div>

"""



# 7. MARKDOWN EDITOR

MARKDOWN_EDITOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="align-items:stretch">

    <div class="field" style="margin:0; display:flex; flex-direction:column">

      <label for="mdInput">Markdown Editor</label>

      <textarea id="mdInput" placeholder="Type Markdown here…" style="min-height:420px; flex:1; font-family:monospace; line-height:1.5"># Hello Markdown!



Toolswick markdown editor parses your text **locally** and renders live HTML.



### Features

- Instant preview with debounce

- Supports **bold**, *italic*, and `code`

- Lists, blockquotes, and [links](https://toolswick.com)



> Everything is private and client-side!

</textarea>

    </div>

    <div class="field" style="margin:0; display:flex; flex-direction:column">

      <label for="mdPreview">Live HTML Preview</label>

      <iframe id="mdPreview" sandbox="allow-same-origin allow-scripts" style="width:100%; min-height:420px; flex:1; border:1px solid var(--line); background:#ffffff; border-radius:8px" aria-label="Markdown Preview"></iframe>

    </div>

  </div>

  <div class="btns" style="margin-top:14px">

    <button type="button" class="btn" id="mdCopyMd">Copy Markdown</button>

    <button type="button" class="btn ghost" id="mdCopyHtml">Copy HTML</button>

  </div>

</div>

"""



# 8. EXTRACT EMAILS & LINKS

EXTRACT_EMAILS_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="extractInput">Paste Raw Text, Log, or Code</label>

    <textarea id="extractInput" placeholder="Paste unstructured content containing emails (e.g. contact@example.com) or web links (e.g. https://example.com)…" style="min-height:180px"></textarea>

  </div>

  <div class="btns" style="margin: 12px 0">

    <button type="button" class="btn" id="extractBtn">Extract Emails &amp; Links</button>

    <button type="button" class="btn ghost" id="extractClear">Clear</button>

  </div>

  <div class="grid2">

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="emailOut" style="margin:0">Email Addresses Found <span id="emailCount" style="color:var(--accent); font-weight:700">(0)</span></label>

        <button type="button" class="btn ghost small" id="copyEmails" style="padding:2px 8px; font-size:12px">Copy Emails</button>

      </div>

      <textarea id="emailOut" readonly placeholder="Extracted email addresses will appear here (one per line)…" style="min-height:200px; font-family:monospace"></textarea>

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="urlOut" style="margin:0">URLs Found <span id="urlCount" style="color:var(--accent); font-weight:700">(0)</span></label>

        <button type="button" class="btn ghost small" id="copyUrls" style="padding:2px 8px; font-size:12px">Copy URLs</button>

      </div>

      <textarea id="urlOut" readonly placeholder="Extracted URLs will appear here (one per line)…" style="min-height:200px; font-family:monospace"></textarea>

    </div>

  </div>

</div>

"""



# 9. MORSE CODE TRANSLATOR

MORSE_CODE_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:14px">

    <fieldset style="border:none; padding:0; margin:0; display:flex; gap:20px; align-items:center">

      <legend style="font-weight:600; margin-bottom:4px">Translation Direction</legend>

      <label class="check" style="margin:0"><input type="radio" name="mcMode" id="modeTextToMorse" value="text-to-morse" checked> Text &rarr; Morse Code</label>

      <label class="check" style="margin:0"><input type="radio" name="mcMode" id="modeMorseToText" value="morse-to-text"> Morse Code &rarr; Text</label>

    </fieldset>

  </div>

  <div class="field">

    <label for="mcInput">Input</label>

    <textarea id="mcInput" placeholder="Enter plain text here…" style="min-height:140px"></textarea>

  </div>

  <div class="btns" style="margin:12px 0">

    <button type="button" class="btn" id="mcTranslate">Translate</button>

    <button type="button" class="btn ghost" id="mcPlay">&#9654; Play Audio</button>

    <button type="button" class="btn ghost" id="mcClear">Clear</button>

  </div>

  <div class="field">

    <label for="mcOutput">Translated Output</label>

    <textarea id="mcOutput" readonly placeholder="Morse code / decoded text will appear here…" style="min-height:140px; font-family:monospace; font-size:15px"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="mcCopy">Copy Output</button>

  </div>

</div>

"""



# 10. WORD FREQUENCY COUNTER

WORD_FREQUENCY_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="wfInput">Enter or Paste Text</label>

    <textarea id="wfInput" placeholder="Paste your article, essay, or speech to analyze word frequencies…" style="min-height:180px"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; flex-wrap:wrap; gap:20px; align-items:center">

      <label class="check" style="margin:0"><input type="checkbox" id="wfStopWords" checked> Ignore common stop words (a, the, is, …)</label>

      <div class="field" style="margin:0; width:140px">

        <label for="wfMinLength">Min word length</label>

        <input type="number" id="wfMinLength" min="1" max="20" value="2">

      </div>

      <button type="button" class="btn" id="wfAnalyze" style="margin-left:auto">Analyze Frequency</button>

      <button type="button" class="btn ghost" id="wfClear">Clear</button>

    </div>

  </div>

  <div id="wfStats" class="diff-stats" style="display:none; gap:24px; font-size:15px; background:var(--surface); padding:10px 16px; border-radius:6px; margin:14px 0">

    <div>Total Analyzed Words: <strong id="wfTotal">0</strong></div>

    <div>Unique Words: <strong id="wfUnique">0</strong></div>

  </div>

  <div id="wfTableContainer" style="display:none; margin-top:16px">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px">

      <h3 style="margin:0">Word Frequency Table</h3>

      <button type="button" class="btn" id="wfDownloadCsv">Download CSV</button>

    </div>

    <div style="max-height:450px; overflow-y:auto; border:1px solid var(--line); border-radius:8px">

      <table style="width:100%; border-collapse:collapse; font-size:14px; text-align:left">

        <thead style="background:var(--surface); position:sticky; top:0">

          <tr>

            <th style="padding:8px 12px; border-bottom:2px solid var(--line); width:60px">#</th>

            <th style="padding:8px 12px; border-bottom:2px solid var(--line)">Word</th>

            <th style="padding:8px 12px; border-bottom:2px solid var(--line); width:100px">Count</th>

            <th style="padding:8px 12px; border-bottom:2px solid var(--line); width:120px">Frequency %</th>

          </tr>

        </thead>

        <tbody id="wfTableBody"></tbody>

      </table>

    </div>

  </div>

</div>

"""



# ----------------------------------------------------------------------------

# BATCH 2: DEVELOPER, DATA & TEXT TOOLS (19 TOOLS)

# ----------------------------------------------------------------------------



# 1. TEXT TO BINARY & BINARY TO TEXT

BINARY_TEXT_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist" style="display:flex; gap:6px; margin-bottom:14px">

    <button type="button" class="btn active" id="tabT2B" role="tab" aria-selected="true">Text &rarr; Binary</button>

    <button type="button" class="btn ghost" id="tabB2T" role="tab" aria-selected="false">Binary &rarr; Text</button>

  </div>

  <div class="field">

    <label for="btInput">Input</label>

    <textarea id="btInput" placeholder="Enter text to convert to binary…" style="min-height:160px"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap">

      <fieldset style="border:none; padding:0; margin:0; display:flex; gap:14px; align-items:center">

        <legend style="font-weight:600; margin-bottom:4px">Delimiter</legend>

        <label class="check" style="margin:0"><input type="radio" name="btDelim" id="btDelimSpace" value="space" checked> Space-separated bytes</label>

        <label class="check" style="margin:0"><input type="radio" name="btDelim" id="btDelimNone" value="none"> No delimiter</label>

      </fieldset>

      <button type="button" class="btn" id="btConvert" style="margin-left:auto">Convert</button>

      <button type="button" class="btn ghost" id="btClear">Clear</button>

    </div>

  </div>

  <div class="field">

    <label for="btOutput">Output</label>

    <textarea id="btOutput" readonly placeholder="Binary output / decoded text will appear here…" style="min-height:160px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="btCopy">Copy Output</button>

  </div>

</div>

"""



# 2. HTML TO TEXT & TEXT TO HTML

HTML_TEXT_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist" style="display:flex; gap:6px; margin-bottom:14px">

    <button type="button" class="btn active" id="tabH2T" role="tab" aria-selected="true">HTML &rarr; Plain Text</button>

    <button type="button" class="btn ghost" id="tabT2H" role="tab" aria-selected="false">Plain Text &rarr; HTML</button>

  </div>

  <div class="field">

    <label for="htInput">Input Content</label>

    <textarea id="htInput" placeholder="Paste HTML here to convert to clean text…" style="min-height:180px"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:16px; align-items:center">

      <span id="htOptParagraphs" style="display:none">

        <label class="check" style="margin:0"><input type="checkbox" id="htWrapP" checked> Wrap paragraphs in &lt;p&gt; tags</label>

      </span>

      <button type="button" class="btn" id="htConvert" style="margin-left:auto">Convert Content</button>

      <button type="button" class="btn ghost" id="htClear">Clear</button>

    </div>

  </div>

  <div class="field">

    <label for="htOutput">Converted Result</label>

    <textarea id="htOutput" readonly placeholder="Converted output will appear here…" style="min-height:180px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="htCopy">Copy Output</button>

  </div>

</div>

"""



# 3. URL ENCODER & DECODER

URL_ENCODER_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist" style="display:flex; gap:6px; margin-bottom:14px">

    <button type="button" class="btn active" id="tabUrlEnc" role="tab" aria-selected="true">URL Encode</button>

    <button type="button" class="btn ghost" id="tabUrlDec" role="tab" aria-selected="false">URL Decode</button>

  </div>

  <div class="field">

    <label for="urlInput">Input String or URL</label>

    <textarea id="urlInput" placeholder="Enter text or URL to encode…" style="min-height:160px"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:16px; align-items:center">

      <label class="check" style="margin:0"><input type="checkbox" id="urlFull"> Encode full URL (preserve protocol and slashes)</label>

      <button type="button" class="btn ghost" id="urlClear" style="margin-left:auto">Clear</button>

    </div>

  </div>

  <div class="field">

    <label for="urlOutput">Encoded / Decoded Output</label>

    <textarea id="urlOutput" readonly placeholder="Result will appear here…" style="min-height:160px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="urlCopy">Copy Output</button>

  </div>

</div>

"""



# 4. HTML ENTITY ENCODER & DECODER

HTML_ENCODER_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist" style="display:flex; gap:6px; margin-bottom:14px">

    <button type="button" class="btn active" id="tabHtmlEnc" role="tab" aria-selected="true">Encode Entities</button>

    <button type="button" class="btn ghost" id="tabHtmlDec" role="tab" aria-selected="false">Decode Entities</button>

  </div>

  <div class="field">

    <label for="heInput">Input Content</label>

    <textarea id="heInput" placeholder="Paste raw characters or markup to encode into HTML entities…" style="min-height:180px"></textarea>

  </div>

  <div class="btns" style="margin: 12px 0">

    <button type="button" class="btn ghost" id="heClear">Clear</button>

  </div>

  <div class="field">

    <label for="heOutput">Converted Entities Output</label>

    <textarea id="heOutput" readonly placeholder="Output will appear here…" style="min-height:180px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="heCopy">Copy Output</button>

  </div>

</div>

"""



# 5. CSV TO JSON & JSON TO CSV

CSV_JSON_WIDGET = """

<div class="tool-workspace">

  <div class="tt-tabs" role="tablist" style="display:flex; gap:6px; margin-bottom:14px">

    <button type="button" class="btn active" id="tabC2J" role="tab" aria-selected="true">CSV &rarr; JSON</button>

    <button type="button" class="btn ghost" id="tabJ2C" role="tab" aria-selected="false">JSON &rarr; CSV</button>

  </div>

  <div class="field">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

      <label for="cjInput" style="margin:0">Input Data</label>

      <label for="cjFile" class="btn ghost small" style="cursor:pointer; font-size:12px; padding:2px 8px">Upload File</label>

      <input type="file" id="cjFile" accept=".csv,.tsv,.txt" style="display:none">

    </div>

    <textarea id="cjInput" placeholder="Paste CSV data here or upload file…" style="min-height:180px; font-family:monospace"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap">

      <div class="field" style="margin:0; width:160px">

        <label for="cjDelim">Delimiter</label>

        <select id="cjDelim">

          <option value="comma">Comma (,)</option>

          <option value="semicolon">Semicolon (;)</option>

          <option value="tab">Tab (\\t)</option>

        </select>

      </div>

      <label class="check" style="margin:0"><input type="checkbox" id="cjPretty" checked> Pretty JSON (indent)</label>

      <button type="button" class="btn" id="cjConvert" style="margin-left:auto">Convert Data</button>

      <button type="button" class="btn ghost" id="cjClear">Clear</button>

    </div>

    <p id="cjErr" class="bad" role="alert" style="margin-top:8px"></p>

  </div>

  <div class="field">

    <label for="cjOutput">Converted Output</label>

    <textarea id="cjOutput" readonly placeholder="Converted data will appear here…" style="min-height:200px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="cjCopy">Copy Result</button>

    <button type="button" class="btn ghost" id="cjDownload">Download File</button>

  </div>

</div>

"""



# 6. XML FORMATTER & VALIDATOR

XML_FORMATTER_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

      <label for="xmlInput" style="margin:0">Input XML</label>

      <label for="xmlFile" class="btn ghost small" style="cursor:pointer; font-size:12px; padding:2px 8px">Upload XML</label>

      <input type="file" id="xmlFile" accept=".xml,application/xml" style="display:none">

    </div>

    <textarea id="xmlInput" placeholder="Paste XML markup here or upload an XML file…" style="min-height:200px; font-family:monospace"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap">

      <button type="button" class="btn" id="xmlFormat">Beautify XML</button>

      <button type="button" class="btn ghost" id="xmlMinify">Minify XML</button>

      <button type="button" class="btn ghost" id="xmlClear" style="margin-left:auto">Clear</button>

    </div>

    <p id="xmlStatus" class="hint" role="status" style="margin-top:8px"></p>

  </div>

  <div class="field">

    <label for="xmlOutput">Formatted XML Result</label>

    <textarea id="xmlOutput" readonly placeholder="Formatted XML will appear here…" style="min-height:220px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="xmlCopy">Copy XML</button>

  </div>

</div>

"""



# 7. SQL FORMATTER

SQL_FORMATTER_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="sqlInput">Raw SQL Query</label>

    <textarea id="sqlInput" placeholder="Paste your messy SQL query here (e.g. select u.id, u.name from users u where u.active=1 order by u.created_at desc)..." style="min-height:180px; font-family:monospace"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0">

    <div style="display:flex; gap:16px; align-items:center; flex-wrap:wrap">

      <button type="button" class="btn" id="sqlFormat">Format SQL</button>

      <button type="button" class="btn ghost" id="sqlMinify">Minify SQL</button>

      <button type="button" class="btn ghost" id="sqlClear" style="margin-left:auto">Clear</button>

    </div>

  </div>

  <div class="field">

    <label for="sqlOutput">Formatted SQL Output</label>

    <textarea id="sqlOutput" readonly placeholder="Cleanly indented SQL will appear here…" style="min-height:220px; font-family:monospace"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="sqlCopy">Copy SQL</button>

  </div>

</div>

"""



# 8. REGEX TESTER

REGEX_TESTER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:14px">

    <div class="grid2">

      <div class="field">

        <label for="rxPattern">Regular Expression Pattern</label>

        <input type="text" id="rxPattern" placeholder="e.g. ([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})" value="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" style="font-family:monospace">

      </div>

      <div class="field">

        <label>RegExp Flags</label>

        <div style="display:flex; gap:16px; align-items:center; margin-top:8px">

          <label class="check" style="margin:0"><input type="checkbox" id="rxFlagG" checked> <code>g</code> (global)</label>

          <label class="check" style="margin:0"><input type="checkbox" id="rxFlagI"> <code>i</code> (ignore case)</label>

          <label class="check" style="margin:0"><input type="checkbox" id="rxFlagM"> <code>m</code> (multiline)</label>

          <label class="check" style="margin:0"><input type="checkbox" id="rxFlagS"> <code>s</code> (dotAll)</label>

        </div>

      </div>

    </div>

    <p id="rxErr" class="bad" role="alert" style="margin-top:6px"></p>

  </div>

  <div class="field">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

      <label for="rxText" style="margin:0">Test String</label>

      <span id="rxCount" class="hint" style="font-weight:700">0 matches</span>

    </div>

    <textarea id="rxText" placeholder="Enter test string here to match against regex..." style="min-height:140px; font-family:monospace">Contact us at support@toolswick.com or sales@example.org for questions.</textarea>

  </div>

  <div class="field" style="margin-top:14px">

    <label>Live Match Highlighting</label>

    <div id="rxHighlight" style="min-height:80px; padding:12px; background:var(--surface); border:1px solid var(--line); border-radius:8px; font-family:monospace; font-size:14px; line-height:1.6; white-space:pre-wrap; word-break:break-all"></div>

  </div>

  <div class="field" style="margin-top:14px">

    <label>Extracted Match Groups</label>

    <div id="rxMatches" style="max-height:260px; overflow-y:auto"></div>

  </div>

</div>

"""



# 9. PASSWORD GENERATOR

PASSWORD_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div class="card-box">

    <div class="field">

      <label for="pwLength">Password Length: <strong id="pwLengthVal">16</strong> characters</label>

      <input type="range" id="pwLength" min="4" max="64" value="16" step="1">

    </div>

    <div style="display:flex; gap:20px; flex-wrap:wrap; margin-top:12px">

      <label class="check"><input type="checkbox" id="pwUpper" checked> Uppercase (A-Z)</label>

      <label class="check"><input type="checkbox" id="pwLower" checked> Lowercase (a-z)</label>

      <label class="check"><input type="checkbox" id="pwNum" checked> Numbers (0-9)</label>

      <label class="check"><input type="checkbox" id="pwSym" checked> Symbols (!@#$%...)</label>

      <label class="check"><input type="checkbox" id="pwAmb"> Exclude Ambiguous (l, 1, O, 0)</label>

    </div>

  </div>

  <div class="field" style="margin-top:16px">

    <label for="pwOutput">Generated Strong Password</label>

    <div style="display:flex; gap:10px">

      <input type="text" id="pwOutput" readonly style="font-family:monospace; font-size:18px; font-weight:600; letter-spacing:1px; flex:1">

      <button type="button" class="btn" id="pwGenerate">Generate</button>

      <button type="button" class="btn ghost" id="pwCopy">Copy</button>

    </div>

  </div>

  <div style="margin-top:14px">

    <div style="display:flex; justify-content:space-between; font-size:13px; margin-bottom:4px">

      <span>Password Security Strength:</span>

      <strong id="pwStrengthText">Very Strong</strong>

    </div>

    <div style="width:100%; height:8px; background:var(--line); border-radius:4px; overflow:hidden">

      <div id="pwStrengthBar" style="width:100%; height:100%; background:#22c55e; transition:width 0.3s, background-color 0.3s"></div>

    </div>

  </div>

</div>

"""



# 10. UUID GENERATOR

UUID_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div class="card-box">

    <div style="display:flex; gap:20px; align-items:center; flex-wrap:wrap">

      <div class="field" style="margin:0; width:130px">

        <label for="uuidCount">Quantity (1-50)</label>

        <input type="number" id="uuidCount" min="1" max="50" value="5">

      </div>

      <label class="check" style="margin:0"><input type="checkbox" id="uuidUpper"> Uppercase</label>

      <label class="check" style="margin:0"><input type="checkbox" id="uuidNoHyphens"> Remove Hyphens</label>

      <button type="button" class="btn" id="uuidGenerate" style="margin-left:auto">Generate UUIDs</button>

    </div>

  </div>

  <div class="field" style="margin-top:14px">

    <label for="uuidOutput">Generated Version-4 UUIDs</label>

    <textarea id="uuidOutput" readonly style="min-height:180px; font-family:monospace; font-size:15px; line-height:1.6"></textarea>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="uuidCopy">Copy All UUIDs</button>

    <button type="button" class="btn ghost" id="uuidClear">Clear</button>

  </div>

</div>

"""



# 11. SHA-256 HASH GENERATOR & CHECKSUM

HASH_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:14px;">

    <div class="tt-tabs" role="tablist" style="display:flex; gap:6px;">

      <button type="button" class="btn active" id="tabHashText" role="tab" aria-selected="true">Text Hash</button>

      <button type="button" class="btn ghost" id="tabHashFile" role="tab" aria-selected="false">File Checksum</button>

    </div>

    <div style="display:flex; align-items:center; gap:8px;">

      <label for="hashAlgo" style="font-weight:600; font-size:0.9rem;">Algorithm:</label>

      <select id="hashAlgo" class="field" style="width:130px; padding:6px 10px;">

        <option value="SHA-256" selected>SHA-256</option>

        <option value="MD5">MD5</option>

        <option value="SHA-1">SHA-1</option>

        <option value="SHA-384">SHA-384</option>

        <option value="SHA-512">SHA-512</option>

      </select>

    </div>

  </div>

  <div id="secHashText">

    <div class="field">

      <label for="hashTextInput">Input Text (Calculates in real time)</label>

      <textarea id="hashTextInput" placeholder="Enter text to generate cryptographic digest..." style="min-height:140px"></textarea>

    </div>

    <div class="field" style="margin-top:14px">

      <label for="hashOutput"><span id="hashAlgoLabel">SHA-256</span> Digest (Hexadecimal)</label>

      <div style="display:flex; gap:10px">

        <input type="text" id="hashOutput" readonly style="font-family:monospace; font-size:15px; flex:1">

        <button type="button" class="btn" id="hashCopy">Copy Hash</button>

      </div>

    </div>

  </div>

  <div id="secHashFile" style="display:none">

    <label class="drop" id="hashDrop">

      <input type="file" id="hashFileInput">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.18"/>

          <path d="M9 12l2 2 4-4" stroke-width="2.2"/>

        </svg>

      </div>

      <strong>Drop any file here or click to browse</strong>

      <span id="hashFileName">Hashes calculate 100% in local memory with zero file transmission.</span>

      <span class="drop-browse-btn">Select File</span>

    </label>

    <div class="field" style="margin-top:14px">

      <label for="hashFileOutput">Calculated File <span id="hashFileAlgoLabel">SHA-256</span> Checksum</label>

      <div style="display:flex; gap:10px">

        <input type="text" id="hashFileOutput" readonly placeholder="File hash will appear here..." style="font-family:monospace; font-size:15px; flex:1">

        <button type="button" class="btn" id="hashFileCopy">Copy Hash</button>

      </div>

    </div>

    <div class="card-box" style="margin-top:14px">

      <div class="field">

        <label for="hashCompareInput">Verify Against Expected Checksum</label>

        <input type="text" id="hashCompareInput" placeholder="Paste expected hash to compare..." style="font-family:monospace">

      </div>

      <p id="hashCompareResult" style="font-weight:600; margin-top:8px"></p>

    </div>

  </div>

</div>

"""



# 12. JWT DECODER

JWT_DECODER_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="jwtInput">Encoded JWT (JSON Web Token)</label>

    <textarea id="jwtInput" placeholder="Paste your token here (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)" style="min-height:120px; font-family:monospace; font-size:13px"></textarea>

  </div>

  <div class="card-box" style="margin: 12px 0; display:flex; gap:16px; align-items:center; flex-wrap:wrap">

    <span id="jwtStatus" style="font-weight:600"></span>

    <span id="jwtAlg" class="hint" style="font-weight:600"></span>

    <span id="jwtExp" class="hint"></span>

    <button type="button" class="btn ghost small" id="jwtClear" style="margin-left:auto">Clear Token</button>

  </div>

  <div class="grid2">

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">

        <label for="jwtHeader" style="margin:0;">Header (Algorithm &amp; Token Type)</label>

        <button type="button" class="btn ghost small" id="jwtCopyHeader">Copy Header</button>

      </div>

      <textarea id="jwtHeader" readonly placeholder="Decoded header..." style="min-height:220px; font-family:monospace"></textarea>

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">

        <label for="jwtPayload" style="margin:0;">Payload (Claims &amp; Data)</label>

        <button type="button" class="btn ghost small" id="jwtCopyPayload">Copy Payload</button>

      </div>

      <textarea id="jwtPayload" readonly placeholder="Decoded payload..." style="min-height:220px; font-family:monospace"></textarea>

    </div>

  </div>

  <p class="hint" style="margin-top:10px">Security Notice: Tokens are parsed purely client-side via JavaScript. No tokens, secrets, or payloads are ever sent across the network.</p>

</div>

"""



# 13. UNIX TIMESTAMP CONVERTER

TIMESTAMP_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:14px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px">

    <div>

      <span style="font-size:14px; color:var(--muted)">Current Unix Timestamp:</span>

      <strong id="tsCurrentClock" style="font-size:22px; font-family:monospace; margin-left:8px">0</strong>

    </div>

    <button type="button" class="btn ghost small" id="tsCopyCurrent">Copy Current</button>

  </div>

  <div class="grid2">

    <div class="card-box">

      <h3 style="margin-top:0">Timestamp &rarr; Human Date</h3>

      <div class="field">

        <label for="tsInput">Unix Timestamp</label>

        <input type="text" id="tsInput" placeholder="e.g. 1700000000" style="font-family:monospace">

      </div>

      <div style="display:flex; gap:16px; margin: 8px 0">

        <label class="check" style="margin:0"><input type="radio" name="tsUnit" id="tsUnitSec" value="s" checked> Seconds</label>

        <label class="check" style="margin:0"><input type="radio" name="tsUnit" id="tsUnitMs" value="ms"> Milliseconds</label>

      </div>

      <div class="field" style="margin-top:12px">

        <label for="tsUtcOut">UTC Format</label>

        <input type="text" id="tsUtcOut" readonly style="font-family:monospace">

      </div>

      <div class="field" style="margin-top:10px">

        <label for="tsLocalOut">Local Timezone</label>

        <textarea id="tsLocalOut" readonly rows="2" style="font-family:monospace;resize:none;"></textarea>

      </div>

      <p id="tsRelOut" class="hint" style="margin-top:8px"></p>

    </div>

    <div class="card-box">

      <h3 style="margin-top:0">Human Date &rarr; Timestamp</h3>

      <div class="field">

        <label for="tsDateInput">Select Date and Time</label>

        <input type="datetime-local" id="tsDateInput" step="1">

      </div>

      <div class="field" style="margin-top:12px">

        <label for="tsDateOutSec">Unix Timestamp (Seconds)</label>

        <input type="text" id="tsDateOutSec" readonly style="font-family:monospace">

      </div>

      <div class="field" style="margin-top:10px">

        <label for="tsDateOutMs">Unix Timestamp (Milliseconds)</label>

        <input type="text" id="tsDateOutMs" readonly style="font-family:monospace">

      </div>

    </div>

  </div>

</div>

"""



# 14. CRON EXPRESSION GENERATOR & EXPLAINER

CRON_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div class="card-box">

    <h3 style="margin-top:0">Build Cron Schedule</h3>

    <div class="grid3" style="gap:14px">

      <div class="field">

        <label for="cronMin">Minute</label>

        <select id="cronMin">

          <option value="*" selected>Every minute (*)</option>

          <option value="*/5">Every 5 minutes (*/5)</option>

          <option value="*/10">Every 10 minutes (*/10)</option>

          <option value="*/15">Every 15 minutes (*/15)</option>

          <option value="*/30">Every 30 minutes (*/30)</option>

          <option value="0">At minute 0 (0)</option>

          <option value="30">At minute 30 (30)</option>

        </select>

      </div>

      <div class="field">

        <label for="cronHour">Hour</label>

        <select id="cronHour">

          <option value="*" selected>Every hour (*)</option>

          <option value="*/2">Every 2 hours (*/2)</option>

          <option value="*/4">Every 4 hours (*/4)</option>

          <option value="*/6">Every 6 hours (*/6)</option>

          <option value="0">At midnight (0)</option>

          <option value="9">At 9 AM (9)</option>

          <option value="12">At noon (12)</option>

          <option value="18">At 6 PM (18)</option>

        </select>

      </div>

      <div class="field">

        <label for="cronDom">Day of Month</label>

        <select id="cronDom">

          <option value="*" selected>Every day (*)</option>

          <option value="1">1st of the month (1)</option>

          <option value="15">15th of the month (15)</option>

          <option value="L">Last day of month (L)</option>

        </select>

      </div>

      <div class="field">

        <label for="cronMonth">Month</label>

        <select id="cronMonth">

          <option value="*" selected>Every month (*)</option>

          <option value="1">January (1)</option>

          <option value="3">March (3)</option>

          <option value="6">June (6)</option>

          <option value="9">September (9)</option>

          <option value="12">December (12)</option>

        </select>

      </div>

      <div class="field">

        <label for="cronDow">Day of Week</label>

        <select id="cronDow">

          <option value="*" selected>Every day of week (*)</option>

          <option value="1-5">Monday to Friday (1-5)</option>

          <option value="0,6">Weekends only (0,6)</option>

          <option value="1">Monday only (1)</option>

          <option value="5">Friday only (5)</option>

        </select>

      </div>

    </div>

  </div>

  <div class="field" style="margin-top:16px">

    <label for="cronOutput">Generated Cron Expression</label>

    <div style="display:flex; gap:10px">

      <input type="text" id="cronOutput" readonly style="font-family:monospace; font-size:18px; font-weight:700; flex:1">

      <button type="button" class="btn" id="cronCopy">Copy Cron</button>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px">

    <div class="field">

      <label for="cronExplainIn">Explain Any Cron Expression (Human English)</label>

      <input type="text" id="cronExplainIn" placeholder="e.g. */15 * * * *" style="font-family:monospace">

    </div>

    <div style="margin-top:10px; padding:10px 14px; background:var(--surface); border-radius:6px">

      <span style="color:var(--muted); font-size:13px">Human Translation:</span>

      <p id="cronExplainOut" style="margin:4px 0 0; font-weight:600; font-size:15px"></p>

    </div>

  </div>

</div>

"""



# 15. JSON TO TYPESCRIPT INTERFACE

JSON_TO_TYPESCRIPT_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:14px">

    <div style="display:flex; gap:16px; align-items:center">

      <div class="field" style="margin:0; width:220px">

        <label for="tsRootName">Root Interface Name</label>

        <input type="text" id="tsRootName" value="RootObject">

      </div>

      <button type="button" class="btn" id="tsGenerate" style="margin-left:auto">Generate TypeScript</button>

      <button type="button" class="btn ghost" id="tsClear">Clear</button>

    </div>

    <p id="tsErr" class="bad" role="alert" style="margin-top:6px"></p>

  </div>

  <div class="two">

    <div class="field">

      <label for="tsJsonInput">Input JSON Payload</label>

      <textarea id="tsJsonInput" placeholder="Paste JSON here…" style="min-height:260px; font-family:monospace">{

  "id": 101,

  "name": "Jane Doe",

  "active": true,

  "roles": ["admin", "developer"],

  "address": {

    "city": "San Francisco",

    "country": "USA"

  }

}</textarea>

    </div>

    <div class="field">

      <label for="tsOutput">Generated TypeScript Interfaces</label>

      <textarea id="tsOutput" readonly placeholder="TypeScript definitions will appear here…" style="min-height:260px; font-family:monospace"></textarea>

    </div>

  </div>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn" id="tsCopy">Copy TypeScript</button>

  </div>

</div>

"""



# 16. COLOR CONVERTER

COLOR_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="display:flex; gap:20px; align-items:center; flex-wrap:wrap">

    <div>

      <label for="colPicker" style="display:block; font-weight:600; margin-bottom:6px">Pick Color</label>

      <input type="color" id="colPicker" value="#3b82f6" style="width:72px; height:44px; border:none; cursor:pointer; border-radius:6px">

    </div>

    <div style="flex:1">

      <div id="colSwatch" style="width:100%; height:44px; border-radius:6px; background:#3b82f6; border:1px solid var(--line)"></div>

    </div>

  </div>

  <div class="grid3" style="margin-top:16px; gap:16px">

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="colHex" style="margin:0">HEX Color</label>

        <button type="button" class="btn ghost small copy-col-btn" data-target="colHex" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="colHex" value="#3b82f6" style="font-family:monospace; font-size:15px">

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="colRgb" style="margin:0">RGB Color</label>

        <button type="button" class="btn ghost small copy-col-btn" data-target="colRgb" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="colRgb" value="rgb(59, 130, 246)" style="font-family:monospace; font-size:15px">

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="colHsl" style="margin:0">HSL Color</label>

        <button type="button" class="btn ghost small copy-col-btn" data-target="colHsl" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="colHsl" value="hsl(217, 91%, 60%)" style="font-family:monospace; font-size:15px">

    </div>

  </div>

</div>

"""



# 17. CSS GRADIENT GENERATOR

CSS_GRADIENT_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div style="display:flex; gap:16px; margin-bottom:12px">

        <label class="check" style="margin:0"><input type="radio" name="gradType" id="gradTypeLinear" value="linear" checked> Linear Gradient</label>

        <label class="check" style="margin:0"><input type="radio" name="gradType" id="gradTypeRadial" value="radial"> Radial Gradient</label>

      </div>

      <div class="field" id="gradAngleGroup" style="margin-bottom:12px">

        <label for="gradAngle">Angle: <strong id="gradAngleVal">90°</strong></label>

        <input type="range" id="gradAngle" min="0" max="360" value="90" step="1">

      </div>

      <div style="display:flex; gap:16px; align-items:center; margin-bottom:10px">

        <div>

          <label for="gradCol1" style="font-size:12px; font-weight:600">Color 1</label>

          <input type="color" id="gradCol1" value="#3b82f6" style="width:50px; height:36px; border:none; cursor:pointer">

        </div>

        <div>

          <label for="gradCol2" style="font-size:12px; font-weight:600">Color 2</label>

          <input type="color" id="gradCol2" value="#9333ea" style="width:50px; height:36px; border:none; cursor:pointer">

        </div>

        <div>

          <label for="gradCol3" style="font-size:12px; font-weight:600">Color 3</label>

          <input type="color" id="gradCol3" value="#ec4899" style="width:50px; height:36px; border:none; cursor:pointer">

        </div>

        <label class="check" style="margin-top:16px"><input type="checkbox" id="gradCol3Enable"> Enable Stop 3</label>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; align-items:stretch">

      <div id="gradPreview" style="flex:1; min-height:160px; border-radius:8px; border:1px solid var(--line)"></div>

    </div>

  </div>

  <div class="field" style="margin-top:14px">

    <label for="gradCssOut">Generated CSS Code</label>

    <div style="display:flex; gap:10px">

      <input type="text" id="gradCssOut" readonly style="font-family:monospace; font-size:14px; flex:1">

      <button type="button" class="btn" id="gradCopy">Copy CSS</button>

    </div>

  </div>

</div>

"""



# 18. CSS BOX SHADOW GENERATOR

CSS_BOX_SHADOW_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="bsX">X Offset: <strong id="bsXVal">0px</strong></label>

        <input type="range" id="bsX" min="-50" max="50" value="0" step="1">

      </div>

      <div class="field" style="margin-top:8px">

        <label for="bsY">Y Offset: <strong id="bsYVal">10px</strong></label>

        <input type="range" id="bsY" min="-50" max="50" value="10" step="1">

      </div>

      <div class="field" style="margin-top:8px">

        <label for="bsBlur">Blur Radius: <strong id="bsBlurVal">25px</strong></label>

        <input type="range" id="bsBlur" min="0" max="100" value="25" step="1">

      </div>

      <div class="field" style="margin-top:8px">

        <label for="bsSpread">Spread Radius: <strong id="bsSpreadVal">-5px</strong></label>

        <input type="range" id="bsSpread" min="-50" max="50" value="-5" step="1">

      </div>

      <div style="display:flex; gap:20px; align-items:center; margin-top:10px">

        <div>

          <label for="bsColor" style="font-size:12px; font-weight:600">Shadow Color</label>

          <input type="color" id="bsColor" value="#000000" style="width:50px; height:34px; border:none; cursor:pointer">

        </div>

        <div class="field" style="flex:1; margin:0">

          <label for="bsOpacity">Opacity: <strong id="bsOpacityVal">15%</strong></label>

          <input type="range" id="bsOpacity" min="0" max="100" value="15" step="1">

        </div>

        <label class="check" style="margin-top:16px"><input type="checkbox" id="bsInset"> Inset Shadow</label>

      </div>

    </div>

    <div class="card-box" style="display:flex; align-items:center; justify-content:center; background:var(--surface)">

      <div id="bsPreviewCard" style="width:160px; height:120px; background:var(--bg,#ffffff); border-radius:10px; display:flex; align-items:center; justify-content:center; font-weight:600; color:var(--text); border:1px solid var(--line)">Preview Card</div>

    </div>

  </div>

  <div class="field" style="margin-top:14px">

    <label for="bsCssOut">Generated CSS</label>

    <div style="display:flex; gap:10px">

      <input type="text" id="bsCssOut" readonly style="font-family:monospace; font-size:14px; flex:1">

      <button type="button" class="btn" id="bsCopy">Copy CSS</button>

    </div>

  </div>

</div>

"""



# 19. NUMBER BASE CONVERTER

NUMBER_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="nbDec" style="margin:0">Decimal (Base 10)</label>

        <button type="button" class="btn ghost small copy-nb-btn" data-target="nbDec" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="nbDec" placeholder="e.g. 42" style="font-family:monospace; font-size:15px">

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="nbBin" style="margin:0">Binary (Base 2)</label>

        <button type="button" class="btn ghost small copy-nb-btn" data-target="nbBin" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="nbBin" placeholder="e.g. 101010" style="font-family:monospace; font-size:15px">

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="nbHex" style="margin:0">Hexadecimal (Base 16)</label>

        <button type="button" class="btn ghost small copy-nb-btn" data-target="nbHex" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="nbHex" placeholder="e.g. 2A" style="font-family:monospace; font-size:15px">

    </div>

    <div class="field">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px">

        <label for="nbOct" style="margin:0">Octal (Base 8)</label>

        <button type="button" class="btn ghost small copy-nb-btn" data-target="nbOct" style="font-size:12px; padding:2px 8px">Copy</button>

      </div>

      <input type="text" id="nbOct" placeholder="e.g. 52" style="font-family:monospace; font-size:15px">

    </div>

  </div>

  <p id="nbErr" class="bad" role="alert" style="margin-top:10px"></p>

  <div class="btns" style="margin-top:12px">

    <button type="button" class="btn ghost" id="nbClear">Clear All</button>

  </div>

</div>

"""





# ----------------------------------------------------------------------------

# BATCH 3 CALCULATORS & CONVERTERS WIDGETS (22 TOOLS)

# ----------------------------------------------------------------------------



LENGTH_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="lenVal">Enter Value</label>

        <input type="number" id="lenVal" value="1" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="lenFrom">From Unit</label>

          <select id="lenFrom" class="field"><option value="m" selected>Meters (m)</option><option value="km">Kilometers (km)</option><option value="cm">Centimeters (cm)</option><option value="mm">Millimeters (mm)</option><option value="mi">Miles (mi)</option><option value="yd">Yards (yd)</option><option value="ft">Feet (ft)</option><option value="in">Inches (in)</option><option value="nmi">Nautical Miles (nmi)</option></select>

        </div>

        <button type="button" class="btn ghost" id="lenSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="lenTo">To Unit</label>

          <select id="lenTo" class="field"><option value="ft" selected>Feet (ft)</option><option value="m">Meters (m)</option><option value="km">Kilometers (km)</option><option value="cm">Centimeters (cm)</option><option value="mm">Millimeters (mm)</option><option value="mi">Miles (mi)</option><option value="yd">Yards (yd)</option><option value="in">Inches (in)</option><option value="nmi">Nautical Miles (nmi)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Result</span>

      <div id="lenResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="lenFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="lenCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Length Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Value</th>

          </tr>

        </thead>

        <tbody id="lenAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



WEIGHT_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="wtVal">Enter Value</label>

        <input type="number" id="wtVal" value="1" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="wtFrom">From Unit</label>

          <select id="wtFrom" class="field"><option value="kg" selected>Kilograms (kg)</option><option value="g">Grams (g)</option><option value="mg">Milligrams (mg)</option><option value="lb">Pounds (lb)</option><option value="oz">Ounces (oz)</option><option value="t">Metric Tons (t)</option><option value="st">Stone (st)</option></select>

        </div>

        <button type="button" class="btn ghost" id="wtSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="wtTo">To Unit</label>

          <select id="wtTo" class="field"><option value="lb" selected>Pounds (lb)</option><option value="kg">Kilograms (kg)</option><option value="g">Grams (g)</option><option value="mg">Milligrams (mg)</option><option value="oz">Ounces (oz)</option><option value="t">Metric Tons (t)</option><option value="st">Stone (st)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Result</span>

      <div id="wtResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="wtFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="wtCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Weight & Mass Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Value</th>

          </tr>

        </thead>

        <tbody id="wtAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



TEMPERATURE_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="tempVal">Enter Temperature</label>

        <input type="number" id="tempVal" value="25" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="tempFrom">From Scale</label>

          <select id="tempFrom" class="field"><option value="C" selected>Celsius (°C)</option><option value="F">Fahrenheit (°F)</option><option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option></select>

        </div>

        <button type="button" class="btn ghost" id="tempSwap" title="Swap scales" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="tempTo">To Scale</label>

          <select id="tempTo" class="field"><option value="F" selected>Fahrenheit (°F)</option><option value="C">Celsius (°C)</option><option value="K">Kelvin (K)</option><option value="R">Rankine (°R)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Temperature</span>

      <div id="tempResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="tempFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="tempCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Temperature Scales</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Scale</th>

            <th style="padding:6px; text-align:right;">Temperature</th>

          </tr>

        </thead>

        <tbody id="tempAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



AREA_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="areaVal">Enter Area Value</label>

        <input type="number" id="areaVal" value="100" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="areaFrom">From Unit</label>

          <select id="areaFrom" class="field"><option value="sq m" selected>Square Meters (m²)</option><option value="sq km">Square Kilometers (km²)</option><option value="sq ft">Square Feet (ft²)</option><option value="sq yd">Square Yards (yd²)</option><option value="sq mi">Square Miles (mi²)</option><option value="acre">Acres (ac)</option><option value="ha">Hectares (ha)</option></select>

        </div>

        <button type="button" class="btn ghost" id="areaSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="areaTo">To Unit</label>

          <select id="areaTo" class="field"><option value="sq ft" selected>Square Feet (ft²)</option><option value="sq m">Square Meters (m²)</option><option value="sq km">Square Kilometers (km²)</option><option value="sq yd">Square Yards (yd²)</option><option value="sq mi">Square Miles (mi²)</option><option value="acre">Acres (ac)</option><option value="ha">Hectares (ha)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Area</span>

      <div id="areaResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="areaFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="areaCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Area Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Area</th>

          </tr>

        </thead>

        <tbody id="areaAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



VOLUME_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="volVal">Enter Volume / Capacity</label>

        <input type="number" id="volVal" value="1" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="volFrom">From Unit</label>

          <select id="volFrom" class="field"><option value="l" selected>Liters (L)</option><option value="ml">Milliliters (ml)</option><option value="m³">Cubic Meters (m³)</option><option value="gal">US Gallons (gal)</option><option value="gal_uk">Imperial Gallons (gal)</option><option value="fl oz">Fluid Ounces (fl oz)</option><option value="cup">US Cups (cup)</option><option value="pt">US Pints (pt)</option><option value="tbsp">Tablespoons (tbsp)</option></select>

        </div>

        <button type="button" class="btn ghost" id="volSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="volTo">To Unit</label>

          <select id="volTo" class="field"><option value="gal" selected>US Gallons (gal)</option><option value="l">Liters (L)</option><option value="ml">Milliliters (ml)</option><option value="m³">Cubic Meters (m³)</option><option value="gal_uk">Imperial Gallons (gal)</option><option value="fl oz">Fluid Ounces (fl oz)</option><option value="cup">US Cups (cup)</option><option value="pt">US Pints (pt)</option><option value="tbsp">Tablespoons (tbsp)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Volume</span>

      <div id="volResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="volFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="volCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Volume & Liquid Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Volume</th>

          </tr>

        </thead>

        <tbody id="volAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



SPEED_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="speedVal">Enter Speed</label>

        <input type="number" id="speedVal" value="60" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="speedFrom">From Unit</label>

          <select id="speedFrom" class="field"><option value="km/h" selected>Kilometers/hour (km/h)</option><option value="mph">Miles/hour (mph)</option><option value="m/s">Meters/second (m/s)</option><option value="knot">Knots (kn)</option><option value="ft/s">Feet/second (ft/s)</option></select>

        </div>

        <button type="button" class="btn ghost" id="speedSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="speedTo">To Unit</label>

          <select id="speedTo" class="field"><option value="mph" selected>Miles/hour (mph)</option><option value="km/h">Kilometers/hour (km/h)</option><option value="m/s">Meters/second (m/s)</option><option value="knot">Knots (kn)</option><option value="ft/s">Feet/second (ft/s)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Velocity</span>

      <div id="speedResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="speedFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="speedCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Velocity Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Speed</th>

          </tr>

        </thead>

        <tbody id="speedAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



DATA_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="dataVal">Enter Data Size</label>

        <div style="display:flex; gap:16px; margin:8px 0 10px 0; font-size:0.85rem;">

          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="dataBase" id="dataBase1024" checked> Binary (1024 - RAM/OS)</label>

          <label style="display:flex; align-items:center; gap:6px; cursor:pointer;"><input type="radio" name="dataBase" id="dataBase1000"> Decimal (1000 - Hard Drives)</label>

        </div>

        <input type="number" id="dataVal" value="1024" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="dataFrom">From Unit</label>

          <select id="dataFrom" class="field"><option value="MB" selected>Megabytes (MB)</option><option value="KB">Kilobytes (KB)</option><option value="GB">Gigabytes (GB)</option><option value="TB">Terabytes (TB)</option><option value="B">Bytes (B)</option><option value="PB">Petabytes (PB)</option><option value="Mbit">Megabits (Mb)</option><option value="Gbit">Gigabits (Gb)</option></select>

        </div>

        <button type="button" class="btn ghost" id="dataSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="dataTo">To Unit</label>

          <select id="dataTo" class="field"><option value="GB" selected>Gigabytes (GB)</option><option value="MB">Megabytes (MB)</option><option value="KB">Kilobytes (KB)</option><option value="TB">Terabytes (TB)</option><option value="B">Bytes (B)</option><option value="PB">Petabytes (PB)</option><option value="Mbit">Megabits (Mb)</option><option value="Gbit">Gigabits (Gb)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Storage</span>

      <div id="dataResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="dataFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="dataCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Data Storage & Memory Units</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Size</th>

          </tr>

        </thead>

        <tbody id="dataAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



TIME_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="timeVal">Enter Time Duration</label>

        <input type="number" id="timeVal" value="24" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="timeFrom">From Unit</label>

          <select id="timeFrom" class="field"><option value="h" selected>Hours (h)</option><option value="min">Minutes (min)</option><option value="s">Seconds (s)</option><option value="d">Days (d)</option><option value="wk">Weeks (wk)</option><option value="mo">Months (mo)</option><option value="yr">Years (yr)</option><option value="ms">Milliseconds (ms)</option></select>

        </div>

        <button type="button" class="btn ghost" id="timeSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="timeTo">To Unit</label>

          <select id="timeTo" class="field"><option value="min" selected>Minutes (min)</option><option value="h">Hours (h)</option><option value="s">Seconds (s)</option><option value="d">Days (d)</option><option value="wk">Weeks (wk)</option><option value="mo">Months (mo)</option><option value="yr">Years (yr)</option><option value="ms">Milliseconds (ms)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Duration</span>

      <div id="timeResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="timeFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="timeCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Time Unit Conversions</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Duration</th>

          </tr>

        </thead>

        <tbody id="timeAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



PRESSURE_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="pressVal">Enter Pressure</label>

        <input type="number" id="pressVal" value="1" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="pressFrom">From Unit</label>

          <select id="pressFrom" class="field"><option value="bar" selected>Bar (bar)</option><option value="psi">Pounds/sq inch (psi)</option><option value="Pa">Pascals (Pa)</option><option value="kPa">Kilopascals (kPa)</option><option value="MPa">Megapascals (MPa)</option><option value="atm">Standard Atmospheres (atm)</option><option value="torr">Torr / mmHg</option></select>

        </div>

        <button type="button" class="btn ghost" id="pressSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="pressTo">To Unit</label>

          <select id="pressTo" class="field"><option value="psi" selected>Pounds/sq inch (psi)</option><option value="bar">Bar (bar)</option><option value="Pa">Pascals (Pa)</option><option value="kPa">Kilopascals (kPa)</option><option value="MPa">Megapascals (MPa)</option><option value="atm">Standard Atmospheres (atm)</option><option value="torr">Torr / mmHg</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Pressure</span>

      <div id="pressResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="pressFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="pressCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Pressure Units</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Pressure</th>

          </tr>

        </thead>

        <tbody id="pressAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



ENERGY_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="field" style="max-width:300px; margin-bottom:16px;">

    <label for="enType">Quantity Type</label>

    <select id="enType" class="field">

      <option value="energy" selected>Energy & Work (Joules, Calories, kWh)</option>

      <option value="power">Power (Watts, Horsepower, kW)</option>

    </select>

  </div>

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="enVal">Enter Value</label>

        <input type="number" id="enVal" value="1" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="enFrom">From Unit</label>

          <select id="enFrom" class="field"><option value="kJ" selected>Kilojoules (kJ)</option><option value="J">Joules (J)</option><option value="cal">Calories (cal)</option><option value="kcal">Kilocalories (kcal)</option><option value="kWh">Kilowatt-hours (kWh)</option><option value="Wh">Watt-hours (Wh)</option><option value="Btu">BTU</option><option value="eV">Electronvolts (eV)</option></select>

        </div>

        <button type="button" class="btn ghost" id="enSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="enTo">To Unit</label>

          <select id="enTo" class="field"><option value="kcal" selected>Kilocalories (kcal)</option><option value="kJ">Kilojoules (kJ)</option><option value="J">Joules (J)</option><option value="cal">Calories (cal)</option><option value="kWh">Kilowatt-hours (kWh)</option><option value="Wh">Watt-hours (Wh)</option><option value="Btu">BTU</option><option value="eV">Electronvolts (eV)</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Output</span>

      <div id="enResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="enFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="enCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Energy & Power Units</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Value</th>

          </tr>

        </thead>

        <tbody id="enAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



ANGLE_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="field" style="max-width:300px; margin-bottom:16px;">

    <label for="angType">Conversion Type</label>

    <select id="angType" class="field">

      <option value="angle" selected>Plane Angle (Degrees, Radians, Gradians)</option>

      <option value="frequency">Frequency (Hz, kHz, MHz, RPM)</option>

    </select>

  </div>

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="angVal">Enter Value</label>

        <input type="number" id="angVal" value="180" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="angFrom">From Unit</label>

          <select id="angFrom" class="field"><option value="deg" selected>Degrees (°)</option><option value="rad">Radians (rad)</option><option value="grad">Gradians (grad)</option><option value="turn">Turns / Rotations</option></select>

        </div>

        <button type="button" class="btn ghost" id="angSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="angTo">To Unit</label>

          <select id="angTo" class="field"><option value="rad" selected>Radians (rad)</option><option value="deg">Degrees (°)</option><option value="grad">Gradians (grad)</option><option value="turn">Turns / Rotations</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.5px;">Converted Value</span>

      <div id="angResult" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

      <div id="angFormula" style="font-size:0.85rem; color:var(--muted); font-family:monospace; margin-bottom:12px;">--</div>

      <div>

        <button type="button" class="btn small" id="angCopy">Copy Result</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">All Angle & Frequency Units</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px; text-align:left;">Unit</th>

            <th style="padding:6px; text-align:right;">Value</th>

          </tr>

        </thead>

        <tbody id="angAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



DISCOUNT_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="discPrice">Original Price</label>

        <div style="display:flex; gap:8px;">

          <select id="discCur" class="field" style="flex:0 0 75px;">

            <option value="$">$</option>

            <option value="€">€</option>

            <option value="£">£</option>

            <option value="¥">¥</option>

            <option value="₹">₹</option>

          </select>

          <input type="number" id="discPrice" value="100" min="0" step="any" class="field" style="flex:1;">

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="discPct">Discount Percentage (%)</label>

        <input type="number" id="discPct" value="20" min="0" max="100" step="any" class="field">

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="10">10%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="15">15%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="20">20%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="25">25%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="30">30%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="50">50%</button>

          <button type="button" class="btn ghost small disc-preset-btn" data-pct="70">70%</button>

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="discTax">Optional Sales Tax (%)</label>

        <input type="number" id="discTax" value="0" min="0" max="100" step="any" class="field">

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Final Discounted Price</span>

      <div id="discFinalPrice" style="font-size:2.2rem; font-weight:700; color:#10b981; margin:8px 0;">$ 80.00</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:10px 0; border-top:1px solid var(--border,#333); padding-top:10px;">

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Total You Save</span>

          <div id="discSavings" style="font-size:1.1rem; font-weight:600; color:#38bdf8;">$ 20.00</div>

        </div>

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Tax Amount</span>

          <div id="discTaxAmt" style="font-size:1.1rem; font-weight:600;">$ 0.00</div>

        </div>

      </div>

      <div style="margin-top:8px;">

        <button type="button" class="btn small" id="discCopyBtn">Copy Breakdown</button>

      </div>

    </div>

  </div>

</div>

"""



TAX_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div style="display:flex; gap:16px; margin-bottom:12px;">

        <label class="check" style="margin:0;"><input type="radio" name="taxMode" id="taxModeAdd" checked> Add Tax (Net &rarr; Gross)</label>

        <label class="check" style="margin:0;"><input type="radio" name="taxMode" id="taxModeRemove"> Remove Tax (Gross &rarr; Net)</label>

      </div>

      <div class="field">

        <label for="taxAmount">Amount</label>

        <div style="display:flex; gap:8px;">

          <select id="taxCur" class="field" style="flex:0 0 75px;">

            <option value="$">$</option>

            <option value="€">€</option>

            <option value="£">£</option>

            <option value="¥">¥</option>

            <option value="₹">₹</option>

          </select>

          <input type="number" id="taxAmount" value="100" min="0" step="any" class="field" style="flex:1;">

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="taxRate">Tax / VAT Rate (%)</label>

        <input type="number" id="taxRate" value="10" min="0" max="100" step="any" class="field">

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">

          <button type="button" class="btn ghost small tax-preset-btn" data-rate="5">5%</button>

          <button type="button" class="btn ghost small tax-preset-btn" data-rate="10">10%</button>

          <button type="button" class="btn ghost small tax-preset-btn" data-rate="15">15%</button>

          <button type="button" class="btn ghost small tax-preset-btn" data-rate="20">20%</button>

          <button type="button" class="btn ghost small tax-preset-btn" data-rate="25">25%</button>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border,#333);">

        <span id="taxNetLabel" style="color:var(--muted);">Net Amount (Excl. Tax)</span>

        <strong id="taxNetRes" style="font-size:1.1rem;">$ 100.00</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border,#333);">

        <span style="color:var(--muted);">Calculated Tax / VAT</span>

        <strong id="taxTaxRes" style="font-size:1.1rem; color:#f59e0b;">$ 10.00</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:8px 0; margin-top:4px;">

        <span id="taxGrossLabel" style="font-weight:600;">Gross Amount (Incl. Tax)</span>

        <strong id="taxGrossRes" style="font-size:1.4rem; color:#10b981;">$ 110.00</strong>

      </div>

      <div style="margin-top:14px;">

        <button type="button" class="btn small" id="taxCopyBtn">Copy Calculation</button>

      </div>

    </div>

  </div>

</div>

"""



INTEREST_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="intMode">Interest Type</label>

        <select id="intMode" class="field">

          <option value="compound" selected>Compound Interest</option>

          <option value="simple">Simple Interest</option>

        </select>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="intPrincipal">Initial Principal Amount</label>

        <div style="display:flex; gap:8px;">

          <select id="intCur" class="field" style="flex:0 0 75px;">

            <option value="$">$</option>

            <option value="€">€</option>

            <option value="£">£</option>

            <option value="¥">¥</option>

            <option value="₹">₹</option>

          </select>

          <input type="number" id="intPrincipal" value="5000" min="0" step="any" class="field" style="flex:1;">

        </div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="intRate">Annual Interest Rate (%)</label>

        <input type="number" id="intRate" value="6.5" min="0" step="0.01" class="field">

      </div>

      <div class="grid2" style="margin-top:10px; gap:10px;">

        <div class="field" style="margin:0;">

          <label for="intYears">Years</label>

          <input type="number" id="intYears" value="5" min="0" max="100" class="field">

        </div>

        <div class="field" style="margin:0;">

          <label for="intMonths">Months</label>

          <input type="number" id="intMonths" value="0" min="0" max="11" class="field">

        </div>

      </div>

      <div class="field" id="intFreqRow" style="margin-top:10px;">

        <label for="intFreq">Compound Frequency</label>

        <select id="intFreq" class="field">

          <option value="365">Daily (365/yr)</option>

          <option value="12" selected>Monthly (12/yr)</option>

          <option value="4">Quarterly (4/yr)</option>

          <option value="2">Semi-Annually (2/yr)</option>

          <option value="1">Annually (1/yr)</option>

        </select>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Final Balance (Future Value)</span>

      <div id="intFinalBal" style="font-size:2rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:10px 0; border-top:1px solid var(--border,#333); padding-top:10px;">

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Total Interest Earned</span>

          <div id="intTotalInt" style="font-size:1.1rem; font-weight:600; color:#38bdf8;">--</div>

        </div>

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Effective APY</span>

          <div id="intApy" style="font-size:1.1rem; font-weight:600;">--</div>

        </div>

      </div>

      <div style="margin-top:6px;">

        <button type="button" class="btn small" id="intCopyBtn">Copy Summary</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">Year-by-Year Growth Schedule</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px 10px; text-align:left;">Year</th>

            <th style="padding:6px 10px; text-align:right;">Year Interest</th>

            <th style="padding:6px 10px; text-align:right;">Total Interest</th>

            <th style="padding:6px 10px; text-align:right;">Ending Balance</th>

          </tr>

        </thead>

        <tbody id="intScheduleBody"></tbody>

      </table>

    </div>

  </div>

</div>

"""



FUEL_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="fuelUnit">Measurement System</label>

        <select id="fuelUnit" class="field">

          <option value="metric" selected>Metric (Kilometers, L/100km, $/L)</option>

          <option value="imperial">Imperial (Miles, MPG, $/Gal)</option>

        </select>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="fuelDist">Trip Distance (<span id="fuelDistUnit">km</span>)</label>

        <input type="number" id="fuelDist" value="350" min="0" step="any" class="field">

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="fuelEcon" id="fuelEconLabel">Fuel Economy (L/100km)</label>

        <input type="number" id="fuelEcon" value="7.5" min="0.1" step="any" class="field">

      </div>

      <div class="grid2" style="margin-top:10px; gap:10px;">

        <div class="field" style="margin:0;">

          <label for="fuelPrice" id="fuelPriceUnit">Price per Liter</label>

          <div style="display:flex; gap:6px;">

            <select id="fuelCur" class="field" style="flex:0 0 65px;">

              <option value="$">$</option>

              <option value="€">€</option>

              <option value="£">£</option>

              <option value="¥">¥</option>

              <option value="₹">₹</option>

            </select>

            <input type="number" id="fuelPrice" value="1.65" min="0" step="any" class="field" style="flex:1;">

          </div>

        </div>

        <div class="field" style="margin:0;">

          <label for="fuelPass">Passengers Sharing</label>

          <input type="number" id="fuelPass" value="1" min="1" max="50" class="field">

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Total Trip Fuel Cost</span>

      <div id="fuelTotalCost" style="font-size:2rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:10px 0; border-top:1px solid var(--border,#333); padding-top:10px;">

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Total Fuel Volume</span>

          <div id="fuelTotalFuel" style="font-size:1.05rem; font-weight:600;">--</div>

        </div>

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Cost Per Person</span>

          <div id="fuelCostPass" style="font-size:1.05rem; font-weight:600; color:#38bdf8;">--</div>

        </div>

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Cost Per Distance</span>

          <div id="fuelCostDist" style="font-size:1.05rem; font-weight:600;">--</div>

        </div>

        <div>

          <span style="font-size:0.8rem; color:var(--muted);">Equivalent Economy</span>

          <div id="fuelEquivEcon" style="font-size:1.05rem; font-weight:600;">--</div>

        </div>

      </div>

      <div style="margin-top:6px;">

        <button type="button" class="btn small" id="fuelCopyBtn">Copy Trip Summary</button>

      </div>

    </div>

  </div>

</div>

"""



SALARY_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="salType">Calculate From</label>

        <select id="salType" class="field">

          <option value="hourly" selected>Hourly Wage</option>

          <option value="annual">Annual Salary</option>

        </select>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="salAmount">Pay Rate / Amount</label>

        <div style="display:flex; gap:8px;">

          <select id="salCur" class="field" style="flex:0 0 75px;">

            <option value="$">$</option>

            <option value="€">€</option>

            <option value="£">£</option>

            <option value="¥">¥</option>

            <option value="₹">₹</option>

          </select>

          <input type="number" id="salAmount" value="30" min="0" step="any" class="field" style="flex:1;">

        </div>

      </div>

      <div class="grid3" style="margin-top:10px; gap:8px;">

        <div class="field" style="margin:0;">

          <label for="salHours">Hours / Wk</label>

          <input type="number" id="salHours" value="40" min="1" max="168" class="field">

        </div>

        <div class="field" style="margin:0;">

          <label for="salDays">Days / Wk</label>

          <input type="number" id="salDays" value="5" min="1" max="7" class="field">

        </div>

        <div class="field" style="margin:0;">

          <label for="salWeeks">Weeks / Yr</label>

          <input type="number" id="salWeeks" value="52" min="1" max="52" class="field">

        </div>

      </div>

      <div style="margin-top:14px; padding-top:10px; border-top:1px solid var(--border,#333);">

        <strong style="font-size:0.9rem; display:block; margin-bottom:8px;">Overtime (Optional)</strong>

        <div class="grid2" style="gap:8px;">

          <div class="field" style="margin:0;">

            <label for="salOtHours">OT Hours / Week</label>

            <input type="number" id="salOtHours" value="0" min="0" step="0.5" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="salOtMult">OT Multiplier</label>

            <select id="salOtMult" class="field">

              <option value="1.5" selected>1.5x (Time & Half)</option>

              <option value="2.0">2.0x (Double Time)</option>

              <option value="1.0">1.0x (Straight Time)</option>

            </select>

          </div>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Annual Gross Salary</span>

      <div id="salResAnnual" style="font-size:2rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Hourly Rate</span>

        <strong id="salResHourly">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Daily Pay</span>

        <strong id="salResDaily">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Weekly Pay</span>

        <strong id="salResWeekly">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Bi-Weekly Pay (26/yr)</span>

        <strong id="salResBiweekly">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Semi-Monthly (24/yr)</span>

        <strong id="salResSemimonthly">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Monthly Pay (12/yr)</span>

        <strong id="salResMonthly">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Overtime Total</span>

        <strong id="salResOtTotal">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:6px 0; margin-top:4px; font-size:0.95rem;">

        <span style="font-weight:600; color:#38bdf8;">With Overtime Total</span>

        <strong id="salResGrandTotal" style="color:#38bdf8;">--</strong>

      </div>

      <div style="margin-top:10px;">

        <button type="button" class="btn small" id="salCopyBtn">Copy Breakdown</button>

      </div>

    </div>

  </div>

</div>

"""



MORTGAGE_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="mortPrice">Home Purchase Price</label>

        <div style="display:flex; gap:8px;">

          <select id="mortCur" class="field" style="flex:0 0 75px;">

            <option value="$">$</option>

            <option value="€">€</option>

            <option value="£">£</option>

            <option value="¥">¥</option>

            <option value="₹">₹</option>

          </select>

          <input type="number" id="mortPrice" value="350000" min="0" step="any" class="field" style="flex:1;">

        </div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="mortDown">Down Payment</label>

        <div style="display:flex; gap:8px;">

          <input type="number" id="mortDown" value="20" min="0" step="any" class="field" style="flex:1;">

          <select id="mortDownType" class="field" style="flex:0 0 75px;">

            <option value="%" selected>%</option>

            <option value="$">$</option>

          </select>

        </div>

      </div>

      <div class="grid2" style="margin-top:10px; gap:8px;">

        <div class="field" style="margin:0;">

          <label for="mortTerm">Loan Term</label>

          <select id="mortTerm" class="field">

            <option value="30" selected>30 Years</option>

            <option value="20">20 Years</option>

            <option value="15">15 Years</option>

            <option value="10">10 Years</option>

          </select>

        </div>

        <div class="field" style="margin:0;">

          <label for="mortRate">Interest Rate (%)</label>

          <input type="number" id="mortRate" value="6.75" min="0.1" step="0.01" class="field">

        </div>

      </div>

      <div class="grid3" style="margin-top:10px; gap:8px;">

        <div class="field" style="margin:0;">

          <label for="mortTax">Property Tax/Yr</label>

          <input type="number" id="mortTax" value="3500" min="0" class="field">

        </div>

        <div class="field" style="margin:0;">

          <label for="mortIns">Insurance/Yr</label>

          <input type="number" id="mortIns" value="1200" min="0" class="field">

        </div>

        <div class="field" style="margin:0;">

          <label for="mortHoa">HOA / Month</label>

          <input type="number" id="mortHoa" value="0" min="0" class="field">

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Total Estimated Monthly Payment</span>

      <div id="mortMonthlyTotal" style="font-size:2rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Principal & Interest</span>

        <strong id="mortMonthlyPI">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Total Loan Principal</span>

        <strong id="mortLoanAmount">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Total Interest Over Term</span>

        <strong id="mortTotalInt" style="color:#f59e0b;">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:5px 0; font-size:0.9rem;">

        <span style="color:var(--muted);">Total Overall Repaid</span>

        <strong id="mortTotalCost">--</strong>

      </div>

      <div style="margin-top:10px;">

        <button type="button" class="btn small" id="mortCopyBtn">Copy Mortgage Quote</button>

      </div>

    </div>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">Annual Amortization Schedule</h3>

    <div style="max-height:220px; overflow-y:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa);">

            <th style="padding:6px 10px; text-align:left;">Year</th>

            <th style="padding:6px 10px; text-align:right;">Principal Paid</th>

            <th style="padding:6px 10px; text-align:right;">Interest Paid</th>

            <th style="padding:6px 10px; text-align:right;">Ending Balance</th>

          </tr>

        </thead>

        <tbody id="mortAmortBody"></tbody>

      </table>

    </div>

  </div>

</div>

"""



DATE_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="seg" style="margin-bottom:16px;">

    <button type="button" id="dateTabDiff" class="btn active">Difference Between Dates</button>

    <button type="button" id="dateTabAdd" class="btn ghost">Add / Subtract Days</button>

  </div>

  <div id="datePanelDiff">

    <div class="grid2">

      <div class="card-box">

        <div class="field">

          <div style="display:flex; justify-content:space-between; align-items:center;">

            <label for="dateStart" style="margin:0;">Start Date</label>

            <button type="button" class="btn ghost small" id="dateTodayStart" style="padding:2px 8px; font-size:12px;">Today</button>

          </div>

          <input type="date" id="dateStart" class="field" style="margin-top:4px;">

        </div>

        <div class="field" style="margin-top:12px;">

          <div style="display:flex; justify-content:space-between; align-items:center;">

            <label for="dateEnd" style="margin:0;">End Date</label>

            <button type="button" class="btn ghost small" id="dateTodayEnd" style="padding:2px 8px; font-size:12px;">Today</button>

          </div>

          <input type="date" id="dateEnd" class="field" style="margin-top:4px;">

        </div>

        <label class="check" style="margin-top:12px;">

          <input type="checkbox" id="dateIncEnd"> Include end date in calculation (+1 day)

        </label>

      </div>

      <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

        <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Total Days Difference</span>

        <div id="dateResDays" style="font-size:2rem; font-weight:700; color:#38bdf8; margin:6px 0;">--</div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Years, Months, Days</span>

          <strong id="dateResYMD">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Weeks & Days</span>

          <strong id="dateResWeeks">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Business Days</span>

          <strong id="dateResBizDays" style="color:#10b981;">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.9rem;">

          <span style="color:var(--muted);">Total Hours</span>

          <strong id="dateResHours">--</strong>

        </div>

      </div>

    </div>

  </div>

  <div id="datePanelAdd" style="display:none;">

    <div class="grid2">

      <div class="card-box">

        <div class="field">

          <div style="display:flex; justify-content:space-between; align-items:center;">

            <label for="dateAddBase" style="margin:0;">Start Date</label>

            <button type="button" class="btn ghost small" id="dateTodayBase" style="padding:2px 8px; font-size:12px;">Today</button>

          </div>

          <input type="date" id="dateAddBase" class="field" style="margin-top:4px;">

        </div>

        <div class="field" style="margin-top:10px;">

          <label for="dateAddOp">Operation</label>

          <select id="dateAddOp" class="field">

            <option value="add" selected>+ Add to date</option>

            <option value="sub">- Subtract from date</option>

          </select>

        </div>

        <div class="grid2" style="margin-top:10px; gap:8px;">

          <div class="field" style="margin:0;">

            <label for="dateAddY">Years</label>

            <input type="number" id="dateAddY" value="0" min="0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="dateAddM">Months</label>

            <input type="number" id="dateAddM" value="0" min="0" class="field">

          </div>

        </div>

        <div class="grid2" style="margin-top:8px; gap:8px;">

          <div class="field" style="margin:0;">

            <label for="dateAddW">Weeks</label>

            <input type="number" id="dateAddW" value="0" min="0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="dateAddD">Days</label>

            <input type="number" id="dateAddD" value="30" min="0" class="field">

          </div>

        </div>

        <label class="check" style="margin-top:12px;">

          <input type="checkbox" id="dateAddBizOnly"> Count business days only (skip weekends)

        </label>

      </div>

      <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

        <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Calculated Target Date</span>

        <div id="dateResTargetDate" style="font-size:1.8rem; font-weight:700; color:#10b981; margin:8px 0;">--</div>

        <div id="dateResTargetDay" style="font-size:1.1rem; color:var(--muted); font-family:monospace;">--</div>

      </div>

    </div>

  </div>

</div>

"""



RATIO_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="seg" style="margin-bottom:16px;">

    <button type="button" id="ratioTabSolve" class="btn active">Proportion Solver (A:B = C:D)</button>

    <button type="button" id="ratioTabAspect" class="btn ghost">Aspect Ratio Scaler</button>

    <button type="button" id="ratioTabSimplify" class="btn ghost">Simplify Ratio</button>

  </div>

  <div id="ratioPanelSolve">

    <div class="card-box">

      <p class="hint" style="margin-top:0;">Enter any 3 values and leave <strong>one blank</strong> to solve for the missing variable.</p>

      <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin:20px 0; flex-wrap:wrap;">

        <input type="number" id="ratioA" value="1920" class="field" placeholder="A" style="width:100px; text-align:center; font-size:1.1rem;">

        <span style="font-size:1.4rem; font-weight:700;">:</span>

        <input type="number" id="ratioB" value="1080" class="field" placeholder="B" style="width:100px; text-align:center; font-size:1.1rem;">

        <span style="font-size:1.4rem; font-weight:700;">=</span>

        <input type="number" id="ratioC" value="1280" class="field" placeholder="C" style="width:100px; text-align:center; font-size:1.1rem;">

        <span style="font-size:1.4rem; font-weight:700;">:</span>

        <input type="number" id="ratioD" value="" class="field" placeholder="X (Blank)" style="width:110px; text-align:center; font-size:1.1rem; border-color:#38bdf8;">

      </div>

      <div id="ratioResSolve" style="text-align:center; font-size:1.2rem; color:#10b981; padding:10px; background:var(--surface); border-radius:8px;">Result will appear here</div>

    </div>

  </div>

  <div id="ratioPanelAspect" style="display:none;">

    <div class="grid2">

      <div class="card-box">

        <label style="font-weight:600; display:block; margin-bottom:6px;">Original Dimensions</label>

        <div style="display:flex; gap:10px; align-items:center;">

          <input type="number" id="ratioArW1" value="1920" class="field" placeholder="Width">

          <span>&times;</span>

          <input type="number" id="ratioArH1" value="1080" class="field" placeholder="Height">

        </div>

        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">

          <button type="button" class="btn ghost small ratio-preset-btn" data-w="16" data-h="9">16:9</button>

          <button type="button" class="btn ghost small ratio-preset-btn" data-w="4" data-h="3">4:3</button>

          <button type="button" class="btn ghost small ratio-preset-btn" data-w="1" data-h="1">1:1</button>

          <button type="button" class="btn ghost small ratio-preset-btn" data-w="21" data-h="9">21:9</button>

          <button type="button" class="btn ghost small ratio-preset-btn" data-w="9" data-h="16">9:16 (Reels)</button>

        </div>

        <div id="ratioResAspectDesc" style="margin-top:12px; font-size:0.9rem; color:#38bdf8; font-weight:600;">--</div>

      </div>

      <div class="card-box" style="background:var(--surface);">

        <label style="font-weight:600; display:block; margin-bottom:6px;">Scaled New Dimensions</label>

        <div style="display:flex; gap:10px; align-items:center;">

          <input type="number" id="ratioArW2" value="800" class="field" placeholder="New Width">

          <span>&times;</span>

          <input type="number" id="ratioArH2" value="450" class="field" placeholder="New Height">

        </div>

        <p class="hint" style="margin-top:8px;">Changing either New Width or New Height automatically recalculates the other dimension while preserving aspect ratio.</p>

      </div>

    </div>

  </div>

  <div id="ratioPanelSimplify" style="display:none;">

    <div class="card-box">

      <div style="display:flex; align-items:center; justify-content:center; gap:12px; margin:16px 0;">

        <input type="number" id="ratioSimA" value="3840" class="field" placeholder="Number A" style="width:140px; text-align:center; font-size:1.1rem;">

        <span style="font-size:1.4rem; font-weight:700;">:</span>

        <input type="number" id="ratioSimB" value="2160" class="field" placeholder="Number B" style="width:140px; text-align:center; font-size:1.1rem;">

      </div>

      <div style="text-align:center; padding:16px; background:var(--surface); border-radius:8px;">

        <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Simplified Whole Ratio</span>

        <div id="ratioResSimResult" style="font-size:2rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

        <div id="ratioResSimDec" style="font-size:0.9rem; color:var(--muted);">--</div>

      </div>

    </div>

  </div>

</div>

"""



GPA_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box" style="flex:2;">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">

        <h3 style="margin:0; font-size:1.05rem;">Semester Courses</h3>

        <button type="button" class="btn small" id="gpaAddRowBtn">+ Add Course</button>

      </div>

      <table style="width:100%; border-collapse:collapse;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333); color:var(--muted,#aaa); font-size:0.85rem;">

            <th style="padding:6px; text-align:left;">Course Name</th>

            <th style="padding:6px; text-align:left; width:130px;">Grade</th>

            <th style="padding:6px; text-align:left; width:80px;">Credits</th>

            <th style="padding:6px; width:40px;"></th>

          </tr>

        </thead>

        <tbody id="gpaTableBody"></tbody>

      </table>

      <div style="margin-top:14px; display:flex; justify-content:space-between;">

        <button type="button" class="btn ghost small" id="gpaClearBtn">Reset Form</button>

      </div>

      <div style="margin-top:16px; padding-top:12px; border-top:1px solid var(--border,#333);">

        <strong style="font-size:0.9rem; display:block; margin-bottom:8px;">Prior Cumulative Standing (Optional)</strong>

        <div class="grid2" style="gap:10px;">

          <div class="field" style="margin:0;">

            <label for="gpaCurrGpa">Current Cumulative GPA</label>

            <input type="number" id="gpaCurrGpa" placeholder="e.g. 3.45" step="0.01" min="0" max="4.0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="gpaCurrCredits">Total Prior Credits</label>

            <input type="number" id="gpaCurrCredits" placeholder="e.g. 45" step="1" min="0" class="field">

          </div>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Semester GPA</span>

      <div id="gpaResGpa" style="font-size:2.4rem; font-weight:700; color:#10b981; margin:6px 0;">--</div>

      <div id="gpaResStatus" style="font-size:0.9rem; font-weight:600; margin-bottom:10px;">--</div>

      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Total Cumulative GPA</span>

        <strong id="gpaResCumGpa" style="color:#38bdf8;">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Total Credit Hours</span>

        <strong id="gpaResCredits">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

        <span style="color:var(--muted);">Quality Points</span>

        <strong id="gpaResPoints">--</strong>

      </div>

      <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.9rem;">

        <span style="color:var(--muted);">Letter Equivalent</span>

        <strong id="gpaResLetter">--</strong>

      </div>

    </div>

  </div>

</div>

"""



WORLD_CLOCK_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; flex-wrap:wrap; gap:10px;">

    <div>

      <h3 style="margin:0; font-size:1.1rem;">Live Global Clocks</h3>

      <span style="font-size:0.85rem; color:var(--muted);">Instant synchronization across major international timezones</span>

    </div>

    <button type="button" class="btn small active" id="worldClockLiveBtn">● Live Syncing</button>

  </div>

  <div class="card-box" id="worldClockPlanner" style="margin-bottom:16px; padding:12px; background:var(--surface); border:1px dashed var(--border,#444);">

    <strong style="font-size:0.9rem; display:block; margin-bottom:8px;">Timezone Meeting Planner & Converter</strong>

    <div class="grid3" style="gap:10px;">

      <div class="field" style="margin:0;">

        <label for="worldPlanDate">Base Date</label>

        <input type="date" id="worldPlanDate" class="field">

      </div>

      <div class="field" style="margin:0;">

        <label for="worldPlanTime">Base Time</label>

        <input type="time" id="worldPlanTime" class="field">

      </div>

      <div class="field" style="margin:0;">

        <label for="worldPlanZone">Base Timezone / City</label>

        <select id="worldPlanZone" class="field"></select>

      </div>

    </div>

  </div>

  <div class="grid3" id="worldClockGrid" style="gap:12px;"></div>

</div>

"""



STOPWATCH_WIDGET = """

<div class="tool-workspace">

  <div class="seg" style="margin-bottom:16px;">

    <button type="button" id="timerTabStopwatch" class="btn active">Stopwatch</button>

    <button type="button" id="timerTabCountdown" class="btn ghost">Countdown Timer</button>

  </div>

  <div id="timerPanelStopwatch">

    <div class="card-box" style="text-align:center; padding:30px 20px; background:var(--surface);">

      <div id="swDisplay" style="font-size:3.5rem; font-weight:800; font-variant-numeric:tabular-nums; color:#38bdf8; margin-bottom:20px;">00:00:00.00</div>

      <div style="display:flex; justify-content:center; gap:12px; flex-wrap:wrap;">

        <button type="button" class="btn" id="swStartBtn" style="min-width:110px;">Start</button>

        <button type="button" class="btn ghost" id="swLapBtn" disabled style="min-width:110px;">Lap</button>

        <button type="button" class="btn ghost" id="swResetBtn" style="min-width:110px;">Reset</button>

      </div>

    </div>

    <div class="card-box" style="margin-top:16px;">

      <h3 style="margin-top:0; margin-bottom:10px; font-size:1rem;">Recorded Laps</h3>

      <div id="swLapList" style="max-height:200px; overflow-y:auto;">

        <div style="color:var(--muted,#888); padding:10px; text-align:center;">No laps recorded yet.</div>

      </div>

    </div>

  </div>

  <div id="timerPanelCountdown" style="display:none;">

    <div class="card-box" style="text-align:center; padding:25px 20px; background:var(--surface);">

      <div id="cdDisplay" style="font-size:3.5rem; font-weight:800; font-variant-numeric:tabular-nums; color:#38bdf8; margin-bottom:14px;">00:00:00</div>

      <div style="width:100%; height:8px; background:var(--bg,#111); border-radius:4px; overflow:hidden; margin-bottom:20px;">

        <div id="cdProgressBar" style="width:100%; height:100%; background:#10b981; transition:width 1s linear;"></div>

      </div>

      <div style="display:flex; justify-content:center; gap:10px; align-items:center; margin-bottom:16px;">

        <div style="display:flex; flex-direction:column; align-items:center;">

          <input type="number" id="cdHours" value="0" min="0" max="99" class="field" style="width:65px; text-align:center; font-size:1.1rem;">

          <span style="font-size:0.75rem; color:var(--muted);">Hours</span>

        </div>

        <span style="font-size:1.4rem; font-weight:700;">:</span>

        <div style="display:flex; flex-direction:column; align-items:center;">

          <input type="number" id="cdMins" value="5" min="0" max="59" class="field" style="width:65px; text-align:center; font-size:1.1rem;">

          <span style="font-size:0.75rem; color:var(--muted);">Minutes</span>

        </div>

        <span style="font-size:1.4rem; font-weight:700;">:</span>

        <div style="display:flex; flex-direction:column; align-items:center;">

          <input type="number" id="cdSecs" value="0" min="0" max="59" class="field" style="width:65px; text-align:center; font-size:1.1rem;">

          <span style="font-size:0.75rem; color:var(--muted);">Seconds</span>

        </div>

      </div>

      <div style="display:flex; justify-content:center; gap:6px; flex-wrap:wrap; margin-bottom:16px;">

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="1">1m</button>

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="3">3m</button>

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="5">5m</button>

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="10">10m</button>

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="15">15m</button>

        <button type="button" class="btn ghost small cd-preset-btn" data-mins="25">25m (Pomodoro)</button>

      </div>

      <div style="display:flex; justify-content:center; gap:12px; align-items:center;">

        <button type="button" class="btn" id="cdStartBtn" style="min-width:110px;">Start</button>

        <button type="button" class="btn ghost" id="cdResetBtn" style="min-width:110px;">Reset</button>

        <label class="check" style="margin:0; font-size:0.85rem;">

          <input type="checkbox" id="cdSoundCheck" checked> Play Sound

        </label>

      </div>

    </div>

  </div>

</div>

"""





# ----------------------------------------------------------------------------

# BATCH 4 & 5 IMAGE & PHOTO TOOLS WIDGETS (14 TOOLS)

# ----------------------------------------------------------------------------



CROP_IMAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="cropDrop">

    <input type="file" id="cropFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2"/></svg>

    </div>

    <strong>Drop photo here or click to browse</strong>

    <span>Supports JPG, PNG, WebP, GIF, and BMP. Free interactive canvas cropper.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div id="cropWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">

      <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center;">

        <span style="font-size:0.85rem; font-weight:600; margin-right:4px;">Aspect Ratio:</span>

        <button type="button" class="btn ghost small crop-preset-btn active" data-ratio="free">Free</button>

        <button type="button" class="btn ghost small crop-preset-btn" data-ratio="1:1">1:1 Square</button>

        <button type="button" class="btn ghost small crop-preset-btn" data-ratio="16:9">16:9 Landscape</button>

        <button type="button" class="btn ghost small crop-preset-btn" data-ratio="4:3">4:3 Standard</button>

        <button type="button" class="btn ghost small crop-preset-btn" data-ratio="9:16">9:16 Story</button>

      </div>

      <div style="display:flex; gap:10px; align-items:center;">

        <span id="cropDims" style="font-size:0.9rem; font-weight:600; color:#38bdf8;">-- × -- px</span>

        <select id="cropFmt" class="field" style="padding:4px 8px; font-size:0.85rem;">

          <option value="png" selected>PNG (Lossless)</option>

          <option value="jpg">JPG (Photo)</option>

        </select>

        <button type="button" class="btn small" id="cropDownloadBtn">Crop & Download</button>

        <button type="button" class="btn ghost small" id="cropResetBtn">Reset</button>

      </div>

    </div>

    <div style="text-align:center; overflow:auto; background:var(--surface,#18181b); border-radius:10px; padding:16px; border:1px solid var(--border,#333);">

      <canvas id="cropCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5); cursor:crosshair;"></canvas>

    </div>

  </div>

</div>

"""



ROTATE_IMAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="rotDrop">

    <input type="file" id="rotFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>

    </div>

    <strong>Drop image here or click to browse</strong>

    <span>Rotate by 90°, 180°, or mirror horizontally and vertically.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div id="rotWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px; display:flex; gap:10px; flex-wrap:wrap; align-items:center; justify-content:space-between;">

      <div style="display:flex; gap:6px; flex-wrap:wrap;">

        <button type="button" class="btn ghost small" id="rotCwBtn">⟳ Rotate 90° CW</button>

        <button type="button" class="btn ghost small" id="rotCcwBtn">⟲ Rotate 90° CCW</button>

        <button type="button" class="btn ghost small" id="rot180Btn">180°</button>

        <button type="button" class="btn ghost small" id="flipHBtn">⇄ Flip Horizontal</button>

        <button type="button" class="btn ghost small" id="flipVBtn">⇅ Flip Vertical</button>

      </div>

      <div style="display:flex; gap:10px; align-items:center;">

        <select id="rotFmt" class="field" style="padding:4px 8px; font-size:0.85rem;">

          <option value="png" selected>PNG</option>

          <option value="jpg">JPG</option>

        </select>

        <button type="button" class="btn small" id="rotDownloadBtn">Download Transformed</button>

        <button type="button" class="btn ghost small" id="rotResetBtn">Reset</button>

      </div>

    </div>

    <div id="rotDimsInfo" style="font-size:0.85rem; color:var(--muted); margin-bottom:10px;"></div>

    <div style="text-align:center; overflow:auto; background:var(--surface,#18181b); border-radius:10px; padding:16px; border:1px solid var(--border,#333);">

      <canvas id="rotCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

    </div>

  </div>

</div>

"""



WATERMARK_IMAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="wmDrop">

    <input type="file" id="wmFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>

    </div>

    <strong>Drop photo here to add watermark</strong>

    <span>Overlay customized text watermarks and copyright notices.</span>

    <span class="drop-browse-btn">Choose Photo</span>

  </label>

  <div id="wmWorkspace" style="display:none;">

    <div class="grid2" style="margin-bottom:16px;">

      <div class="card-box">

        <div class="field">

          <label for="wmText">Watermark Text</label>

          <input type="text" id="wmText" value="" placeholder="Enter watermark text" class="field">

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="wmFont">Font Family</label>

            <select id="wmFont" class="field">

              <option value="sans-serif" selected>Sans-Serif</option>

              <option value="serif">Serif (Times)</option>

              <option value="monospace">Monospace</option>

              <option value="Impact">Impact (Bold)</option>

            </select>

          </div>

          <div class="field" style="margin:0;">

            <label for="wmColor">Text Color</label>

            <input type="color" id="wmColor" value="#ffffff" style="width:100%; height:38px; border:none; cursor:pointer;">

          </div>

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="wmSize">Size: <span id="wmSizeVal">32px</span></label>

            <input type="range" id="wmSize" min="14" max="96" value="32" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="wmOpacity">Opacity: <span id="wmOpacityVal">75%</span></label>

            <input type="range" id="wmOpacity" min="10" max="100" value="75" class="field">

          </div>

        </div>

        <div class="field" style="margin-top:12px;">

          <label style="display:block; margin-bottom:6px;">Watermark Position</label>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:4px; max-width:240px;">

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="top-left">↖ Top L</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="top-center">↑ Top C</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="top-right">↗ Top R</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="middle-left">← Mid L</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="middle-center">● Center</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="middle-right">→ Mid R</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="bottom-left">↙ Bot L</button>

            <button type="button" class="btn ghost small wm-pos-btn" data-pos="bottom-center">↓ Bot C</button>

            <button type="button" class="btn ghost small wm-pos-btn active" data-pos="bottom-right">↘ Bot R</button>

          </div>

        </div>

        <div style="margin-top:16px; display:flex; gap:10px; align-items:center;">

          <select id="wmFmt" class="field" style="padding:6px 10px; width:90px;">

            <option value="png" selected>PNG</option>

            <option value="jpg">JPG</option>

          </select>

          <button type="button" class="btn" id="wmDownloadBtn">Download Watermarked</button>

        </div>

      </div>

      <div class="card-box" style="display:flex; align-items:center; justify-content:center; background:var(--surface,#18181b); overflow:auto;">

        <canvas id="wmCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

      </div>

    </div>

  </div>

</div>

"""



EXIF_VIEWER_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="exifDrop">

    <input type="file" id="exifFile" accept="image/jpeg,image/jpg">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19 4h-1.5l-1.5-2H8L6.5 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/></svg>

    </div>

    <strong>Drop photo here to inspect EXIF metadata</strong>

    <span>Extract camera make, lens, exposure, timestamps, and GPS tags directly in browser RAM.</span>

    <span class="drop-browse-btn">Choose Photo</span>

  </label>

  <div id="exifResult" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box" style="text-align:center;">

        <img id="exifThumb" style="max-width:100%; max-height:240px; border-radius:8px; object-fit:contain; background:#111; margin-bottom:10px;" alt="Photo thumbnail">

        <strong id="exifFileName" style="display:block; word-break:break-all;">--</strong>

        <span id="exifFileSize" style="font-size:0.8rem; color:var(--muted);">--</span>

      </div>

      <div class="card-box">

        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">

          <h3 style="margin:0; font-size:1.05rem;">Camera & EXIF Tags</h3>

          <div style="display:flex; gap:6px;">

            <button type="button" class="btn ghost small" id="exifCopyBtn">Copy Details</button>

            <button type="button" class="btn ghost small" id="exifJsonBtn">Export JSON</button>

          </div>

        </div>

        <p id="exifEmptyMsg" style="color:var(--muted); display:none;">No embedded EXIF metadata detected in this image.</p>

        <table style="width:100%; border-collapse:collapse;">

          <tbody id="exifTableBody"></tbody>

        </table>

      </div>

    </div>

  </div>

</div>

"""



IMAGE_BASE64_WIDGET = """

<div class="tool-workspace">

  <div class="seg" style="margin-bottom:16px;">

    <button type="button" id="b64TabImg2B64" class="btn active">Image &rarr; Base64</button>

    <button type="button" id="b64TabB642Img" class="btn ghost">Base64 &rarr; Image</button>

  </div>

  <div id="b64PanelImg2B64">

    <label class="drop" id="b64Drop">

      <input type="file" id="b64File" accept="image/*">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>

      </div>

      <strong>Drop image here to convert to Base64</strong>

      <span>Generates Data URI string, HTML img tag, and CSS background code.</span>

      <span class="drop-browse-btn">Choose Image</span>

    </label>

    <div id="b64ResultBox" style="display:none; margin-top:16px;">

      <div class="grid2">

        <div class="card-box" style="text-align:center;">

          <img id="b64Thumb" style="max-width:100%; max-height:200px; border-radius:8px; object-fit:contain; background:#111; margin-bottom:8px;" alt="Image preview">

          <div id="b64LengthInfo" style="font-size:0.85rem; color:var(--muted);">--</div>

        </div>

        <div class="card-box">

          <div class="field">

            <label for="b64Output">Base64 Data URI</label>

            <textarea id="b64Output" readonly style="font-family:monospace; font-size:12px; min-height:120px;"></textarea>

          </div>

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:10px;">

            <button type="button" class="btn small" id="b64CopyRaw">Copy Base64</button>

            <button type="button" class="btn ghost small" id="b64CopyHtml">Copy HTML &lt;img&gt;</button>

            <button type="button" class="btn ghost small" id="b64CopyCss">Copy CSS url()</button>

          </div>

        </div>

      </div>

    </div>

  </div>

  <div id="b64PanelB642Img" style="display:none;">

    <div class="card-box">

      <div class="field">

        <label for="b64InputText">Paste Base64 String or Data URI</label>

        <textarea id="b64InputText" placeholder="Paste data:image/png;base64,... or raw Base64 string here…" style="font-family:monospace; font-size:12px; min-height:120px;"></textarea>

      </div>

      <div style="margin-top:10px;">

        <button type="button" class="btn" id="b64DecodeBtn">Decode to Image</button>

      </div>

      <p id="b64DecodeError" class="bad" role="alert" style="display:none; margin-top:10px;"></p>

    </div>

    <div id="b64DecodeResult" class="card-box" style="display:none; margin-top:16px; text-align:center;">

      <h3 style="margin-top:0; margin-bottom:12px;">Decoded Image Preview</h3>

      <div style="overflow:auto; max-height:400px; margin-bottom:14px; background:#111; padding:10px; border-radius:8px;">

        <canvas id="b64PreviewCanvas" style="max-width:100%; height:auto;"></canvas>

      </div>

      <div style="display:flex; gap:10px; justify-content:center;">

        <button type="button" class="btn small" id="b64DownloadPng">Download PNG</button>

        <button type="button" class="btn ghost small" id="b64DownloadJpg">Download JPG</button>

      </div>

    </div>

  </div>

</div>

"""



COLOR_PICKER_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="cpDrop">

    <input type="file" id="cpFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 0-.61-.23-1.2-.64-1.67-.08-.1-.13-.21-.13-.33 0-.28.22-.5.5-.5H16c3.31 0 6-2.69 6-6 0-4.96-4.49-9-10-9z"/></svg>

    </div>

    <strong>Drop image here to pick colors & extract palette</strong>

    <span>Hover and click anywhere to sample pixel colors in HEX, RGB, and HSL.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div id="cpWorkspace" style="display:none;">

    <div class="grid2" style="margin-bottom:16px;">

      <div class="card-box">

        <h3 style="margin-top:0; margin-bottom:12px; font-size:1.05rem;">Selected Color</h3>

        <div style="display:flex; gap:14px; align-items:center; margin-bottom:14px;">

          <div id="cpSwatch" style="width:70px; height:70px; border-radius:10px; background:#3b82f6; box-shadow:0 2px 10px rgba(0,0,0,0.3); border:2px solid var(--border,#444);"></div>

          <div style="flex:1;">

            <div class="field" style="margin-bottom:6px;">

              <div style="display:flex; justify-content:space-between;">

                <label for="cpHex" style="margin:0; font-size:0.8rem;">HEX</label>

                <button type="button" class="btn ghost small cp-copy-btn" data-target="cpHex" style="font-size:11px; padding:1px 6px;">Copy</button>

              </div>

              <input type="text" id="cpHex" readonly value="#3b82f6" style="font-family:monospace; padding:4px 8px; font-size:0.9rem;">

            </div>

            <div class="field" style="margin-bottom:6px;">

              <div style="display:flex; justify-content:space-between;">

                <label for="cpRgb" style="margin:0; font-size:0.8rem;">RGB</label>

                <button type="button" class="btn ghost small cp-copy-btn" data-target="cpRgb" style="font-size:11px; padding:1px 6px;">Copy</button>

              </div>

              <input type="text" id="cpRgb" readonly value="rgb(59, 130, 246)" style="font-family:monospace; padding:4px 8px; font-size:0.9rem;">

            </div>

            <div class="field" style="margin:0;">

              <div style="display:flex; justify-content:space-between;">

                <label for="cpHsl" style="margin:0; font-size:0.8rem;">HSL</label>

                <button type="button" class="btn ghost small cp-copy-btn" data-target="cpHsl" style="font-size:11px; padding:1px 6px;">Copy</button>

              </div>

              <input type="text" id="cpHsl" readonly value="hsl(217, 91%, 60%)" style="font-family:monospace; padding:4px 8px; font-size:0.9rem;">

            </div>

          </div>

        </div>

        <div style="border-top:1px solid var(--border,#333); padding-top:12px;">

          <label style="font-size:0.85rem; font-weight:600; display:block; margin-bottom:8px;">Dominant Color Palette (Top 6)</label>

          <div id="cpPalette" style="display:flex; gap:6px;"></div>

        </div>

      </div>

      <div class="card-box" style="position:relative; text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px;">

        <canvas id="cpCanvas" style="max-width:100%; height:auto; cursor:crosshair; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

        <div id="cpLoupe" style="display:none; position:fixed; z-index:99; pointer-events:none; padding:4px 8px; border-radius:4px; font-size:11px; font-family:monospace; color:#fff; text-shadow:0 1px 2px #000; box-shadow:0 2px 6px rgba(0,0,0,0.4);">#000000</div>

      </div>

    </div>

  </div>

</div>

"""



FAVICON_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="favDrop">

    <input type="file" id="favFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="4"/><rect x="8" y="8" width="8" height="8" rx="2"/></svg>

    </div>

    <strong>Drop logo or image here to generate favicons</strong>

    <span>Creates 16x16, 32x32, 48x48, 180x180 (Apple Touch), and 192x192 Android icons.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div id="favWorkspace" style="display:none;">

    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; flex-wrap:wrap; gap:10px;">

      <h3 style="margin:0; font-size:1.1rem;">Generated Multi-Size Favicons</h3>

      <button type="button" class="btn" id="favZipBtn">Download All (ZIP)</button>

    </div>

    <div id="favGrid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:12px; margin-bottom:16px;"></div>

    <div class="card-box">

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">

        <label for="favHtmlCode" style="margin:0; font-weight:600;">HTML Header Code</label>

        <button type="button" class="btn ghost small" id="favCopyHtml">Copy Code</button>

      </div>

      <textarea id="favHtmlCode" readonly style="font-family:monospace; font-size:12px; min-height:90px;"></textarea>

    </div>

  </div>

</div>

"""



PHOTO_COLLAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="colDrop">

    <input type="file" id="colFile" accept="image/*" multiple>

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>

    </div>

    <strong>Drop 2 to 4 photos here to build a collage</strong>

    <span>Select 2, 3, or 4 images to combine into side-by-side or grid layouts.</span>

    <span class="drop-browse-btn">Choose Photos</span>

  </label>

  <div id="colWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap; margin-bottom:10px;">

        <div class="field" style="margin:0; flex:1; min-width:140px;">

          <label for="colLayout">Layout Style</label>

          <select id="colLayout" class="field">

            <option value="auto" selected>Grid / Side-by-Side</option>

            <option value="stacked">Stacked Rows</option>

          </select>

        </div>

        <div class="field" style="margin:0; width:140px;">

          <label for="colSpacing">Border: <span id="colSpacingVal">12px</span></label>

          <input type="range" id="colSpacing" min="0" max="40" value="12" class="field">

        </div>

        <div class="field" style="margin:0; width:80px;">

          <label for="colColor">Color</label>

          <input type="color" id="colColor" value="#18181b" style="width:100%; height:38px; border:none; cursor:pointer;">

        </div>

        <div style="margin-left:auto; display:flex; gap:8px;">

          <button type="button" class="btn small" id="colDownloadBtn">Download Collage</button>

          <button type="button" class="btn ghost small" id="colResetBtn">Clear</button>

        </div>

      </div>

      <div style="display:flex; gap:8px; align-items:center;">

        <span style="font-size:0.8rem; color:var(--muted);">Selected Photos:</span>

        <div id="colThumbList" style="display:flex; gap:8px;"></div>

      </div>

    </div>

    <div style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px; border-radius:10px; border:1px solid var(--border,#333);">

      <canvas id="colCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

    </div>

  </div>

</div>

"""



MEME_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="memeDrop">

    <input type="file" id="memeFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 15s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>

    </div>

    <strong>Drop meme template image here or click to browse</strong>

    <span>Create bold Impact memes with customizable captions. Or choose a sample below.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div style="display:flex; gap:8px; align-items:center; margin-top:8px;">

    <span style="font-size:0.85rem; color:var(--muted);">Quick Starter Templates:</span>

    <button type="button" class="btn ghost small meme-sample-btn" data-sample="cat">🐱 Cat Template</button>

    <button type="button" class="btn ghost small meme-sample-btn" data-sample="rocket">🚀 Rocket Template</button>

  </div>

  <div id="memeWorkspace" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box">

        <div class="field">

          <label for="memeTopText">Top Caption Text</label>

          <input type="text" id="memeTopText" value="WHEN THE CODE FINALLY COMPILES" class="field">

        </div>

        <div class="field" style="margin-top:10px;">

          <label for="memeBottomText">Bottom Caption Text</label>

          <input type="text" id="memeBottomText" value="ON THE FIRST TRY" class="field">

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px; align-items:center;">

          <div class="field" style="margin:0;">

            <label for="memeSize">Text Size: <span id="memeSizeVal">38px</span></label>

            <input type="range" id="memeSize" min="20" max="72" value="38" class="field">

          </div>

          <label class="check" style="margin:0; margin-top:14px;">

            <input type="checkbox" id="memeCaps" checked> ALL CAPS TEXT

          </label>

        </div>

        <div style="margin-top:16px; display:flex; gap:10px;">

          <button type="button" class="btn" id="memeDownloadBtn">Download Meme</button>

          <button type="button" class="btn ghost" id="memeResetBtn">Reset</button>

        </div>

      </div>

      <div class="card-box" style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px;">

        <canvas id="memeCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

      </div>

    </div>

  </div>

</div>

"""



SOCIAL_RESIZER_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="socDrop">

    <input type="file" id="socFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>

    </div>

    <strong>Drop graphic here to resize for social media</strong>

    <span>Fit posts, banners, stories, and thumbnails without cutting off key subjects.</span>

    <span class="drop-browse-btn">Choose Graphic</span>

  </label>

  <div id="socWorkspace" style="display:none; margin-top:16px;">

    <div class="card-box" style="margin-bottom:14px;">

      <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">

        <div class="field" style="margin:0; flex:1; min-width:180px;">

          <label for="socPreset">Social Platform & Format</label>

          <select id="socPreset" class="field">

            <option value="ig-post" selected>Instagram Square Post (1080 × 1080)</option>

            <option value="ig-portrait">Instagram Portrait Post (1080 × 1350)</option>

            <option value="ig-story">Instagram Story / Reel (1080 × 1920)</option>

            <option value="fb-post">Facebook Shared Link/Post (1200 × 630)</option>

            <option value="yt-thumb">YouTube Video Thumbnail (1280 × 720)</option>

            <option value="x-post">Twitter / X Post (1200 × 675)</option>

            <option value="x-header">Twitter / X Header Banner (1500 × 500)</option>

            <option value="li-post">LinkedIn Feed Post (1200 × 627)</option>

          </select>

        </div>

        <div class="field" style="margin:0; width:160px;">

          <label for="socFillMode">Background Fill</label>

          <select id="socFillMode" class="field">

            <option value="blur" selected>Blurred Image</option>

            <option value="color">Solid Color</option>

            <option value="crop">Crop to Fill</option>

          </select>

        </div>

        <div class="field" style="margin:0; width:65px;">

          <label for="socColor">Color</label>

          <input type="color" id="socColor" value="#000000" style="width:100%; height:38px; border:none; cursor:pointer;">

        </div>

        <div style="margin-left:auto;">

          <button type="button" class="btn" id="socDownloadBtn">Download Graphic</button>

        </div>

      </div>

      <div id="socDimsBadge" style="font-size:0.85rem; color:#38bdf8; margin-top:8px; font-weight:600;"></div>

    </div>

    <div style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px; border-radius:10px; border:1px solid var(--border,#333);">

      <canvas id="socCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

    </div>

  </div>

</div>

"""



IMAGE_EFFECTS_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="effDrop">

    <input type="file" id="effFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>

    </div>

    <strong>Drop photo here to apply effects & filters</strong>

    <span>Add borders, rounded corners, blur, pixelate, grayscale, and adjustments.</span>

    <span class="drop-browse-btn">Choose Photo</span>

  </label>

  <div id="effWorkspace" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box">

        <h3 style="margin-top:0; margin-bottom:12px; font-size:1.05rem;">Filter Controls</h3>

        <div class="grid2" style="gap:10px;">

          <div class="field" style="margin:0;">

            <label for="effBorder">Border: <span id="effBorderVal">0px</span></label>

            <input type="range" id="effBorder" min="0" max="40" value="0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="effBorderColor">Border Color</label>

            <input type="color" id="effBorderColor" value="#ffffff" style="width:100%; height:38px; border:none; cursor:pointer;">

          </div>

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="effRadius">Corners: <span id="effRadiusVal">0px</span></label>

            <input type="range" id="effRadius" min="0" max="100" value="0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="effGray">Grayscale: <span id="effGrayVal">0%</span></label>

            <input type="range" id="effGray" min="0" max="100" value="0" class="field">

          </div>

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="effBright">Brightness: <span id="effBrightVal">100%</span></label>

            <input type="range" id="effBright" min="50" max="150" value="100" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="effContrast">Contrast: <span id="effContrastVal">100%</span></label>

            <input type="range" id="effContrast" min="50" max="150" value="100" class="field">

          </div>

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="effBlur">Blur: <span id="effBlurVal">0px</span></label>

            <input type="range" id="effBlur" min="0" max="20" value="0" class="field">

          </div>

          <div class="field" style="margin:0;">

            <label for="effPixel">Pixelate: <span id="effPixelVal">1x</span></label>

            <input type="range" id="effPixel" min="1" max="15" value="1" class="field">

          </div>

        </div>

        <div style="margin-top:16px; display:flex; gap:10px;">

          <button type="button" class="btn" id="effDownloadBtn">Download Filtered</button>

          <button type="button" class="btn ghost" id="effResetBtn">Reset All</button>

        </div>

      </div>

      <div class="card-box" style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px;">

        <canvas id="effCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

      </div>

    </div>

  </div>

</div>

"""



IMAGE_INFO_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="infoDrop">

    <input type="file" id="infoFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>

    </div>

    <strong>Drop image here to inspect resolution & size</strong>

    <span>Check pixel dimensions, megapixels, aspect ratio, print size, and memory footprint.</span>

    <span class="drop-browse-btn">Choose Image</span>

  </label>

  <div id="infoResult" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box" style="text-align:center;">

        <img id="infoThumb" style="max-width:100%; max-height:220px; border-radius:8px; object-fit:contain; background:#111; margin-bottom:10px;" alt="Image preview">

        <div style="margin-top:6px;">

          <button type="button" class="btn small" id="infoCopyBtn">Copy Specifications</button>

        </div>

      </div>

      <div class="card-box">

        <h3 style="margin-top:0; margin-bottom:12px; font-size:1.05rem;">Image Specifications</h3>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Dimensions (W × H)</span>

          <strong id="infoDims" style="color:#38bdf8;">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Total Megapixels</span>

          <strong id="infoMp">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Aspect Ratio</span>

          <strong id="infoAspect">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">File Size</span>

          <strong id="infoSize">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">MIME Type</span>

          <strong id="infoType">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; border-bottom:1px solid var(--border,#333); font-size:0.9rem;">

          <span style="color:var(--muted);">Print Size @ 300 DPI</span>

          <strong id="infoPrint">--</strong>

        </div>

        <div style="display:flex; justify-content:space-between; padding:6px 0; font-size:0.9rem;">

          <span style="color:var(--muted);">Decoded RAM Size</span>

          <strong id="infoRam" style="color:#f59e0b;">--</strong>

        </div>

      </div>

    </div>

  </div>

</div>

"""



PASSPORT_PHOTO_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="passDrop">

    <input type="file" id="passFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>

    </div>

    <strong>Drop headshot photo here or click to browse</strong>

    <span>Crop to standard US 2x2 inch, UK/Schengen 35x45mm, or generate 4x6 inch printable sheets.</span>

    <span class="drop-browse-btn">Choose Headshot</span>

  </label>

  <div id="passWorkspace" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box">

        <div class="field">

          <label for="passCountry">Passport / Visa Standard</label>

          <select id="passCountry" class="field">

            <option value="us" selected>US Passport / Visa (2×2 inch / 51×51mm)</option>

            <option value="eu">UK & Schengen & Europe (35×45mm)</option>

            <option value="cn">China Visa (33×48mm)</option>

            <option value="ca">Canada Passport (50×70mm)</option>

          </select>

        </div>

        <div class="field" style="margin-top:10px;">

          <label for="passZoom">Headshot Zoom: <span id="passZoomVal">100%</span></label>

          <input type="range" id="passZoom" min="60" max="200" value="100" class="field">

          <p class="hint" style="margin-top:4px;">Drag the image on the right canvas to center your head within the guide oval.</p>

        </div>

        <div style="margin-top:12px; display:flex; flex-direction:column; gap:8px;">

          <label class="check" style="margin:0;">

            <input type="checkbox" id="passGuide" checked> Show Biometric Head Positioning Oval

          </label>

          <label class="check" style="margin:0;">

            <input type="checkbox" id="passSheetMode"> Generate Printable 4×6 inch Sheet (6 Photos)

          </label>

        </div>

        <div style="margin-top:16px;">

          <button type="button" class="btn" id="passDownloadBtn">Download Passport Photo</button>

        </div>

      </div>

      <div class="card-box" style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px;">

        <canvas id="passCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5); cursor:grab;"></canvas>

      </div>

    </div>

  </div>

</div>

"""



ADD_TEXT_IMAGE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="txtDrop">

    <input type="file" id="txtFile" accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>

    </div>

    <strong>Drop photo here to add caption or text banner</strong>

    <span>Overlay styled typography, titles, and highlight banners onto photos.</span>

    <span class="drop-browse-btn">Choose Photo</span>

  </label>

  <div id="txtWorkspace" style="display:none; margin-top:16px;">

    <div class="grid2">

      <div class="card-box">

        <div class="field">

          <label for="txtInput">Caption Text</label>

          <textarea id="txtInput" placeholder="Enter caption text (supports multiple lines)…" style="min-height:80px;">Summer Adventures</textarea>

        </div>

        <div class="grid2" style="gap:10px; margin-top:10px;">

          <div class="field" style="margin:0;">

            <label for="txtFont">Font Family</label>

            <select id="txtFont" class="field">

              <option value="sans-serif" selected>Modern Sans-Serif</option>

              <option value="Georgia, serif">Classic Serif (Georgia)</option>

              <option value="Impact">Bold Headline (Impact)</option>

              <option value="Courier New, monospace">Monospace</option>

            </select>

          </div>

          <div class="field" style="margin:0;">

            <label for="txtSize">Font Size: <span id="txtSizeVal">36px</span></label>

            <input type="range" id="txtSize" min="16" max="96" value="36" class="field">

          </div>

        </div>

        <div class="grid3" style="gap:8px; margin-top:10px; align-items:center;">

          <div class="field" style="margin:0;">

            <label for="txtColor">Text Color</label>

            <input type="color" id="txtColor" value="#ffffff" style="width:100%; height:36px; border:none; cursor:pointer;">

          </div>

          <div class="field" style="margin:0;">

            <label for="txtAlign">Alignment</label>

            <select id="txtAlign" class="field">

              <option value="center" selected>Center</option>

              <option value="left">Left</option>

              <option value="right">Right</option>

            </select>

          </div>

          <div class="field" style="margin:0;">

            <label for="txtPos">Placement</label>

            <select id="txtPos" class="field">

              <option value="bottom" selected>Bottom</option>

              <option value="center">Center</option>

              <option value="top">Top</option>

            </select>

          </div>

        </div>

        <div style="margin-top:12px; display:flex; gap:12px; align-items:center;">

          <label class="check" style="margin:0;">

            <input type="checkbox" id="txtBgCheck" checked> Dark Highlight Banner

          </label>

          <input type="color" id="txtBgColor" value="#000000" style="width:36px; height:30px; border:none; cursor:pointer;">

        </div>

        <div style="margin-top:16px;">

          <button type="button" class="btn" id="txtDownloadBtn">Download Captioned Photo</button>

        </div>

      </div>

      <div class="card-box" style="text-align:center; overflow:auto; background:var(--surface,#18181b); padding:16px;">

        <canvas id="txtCanvas" style="max-width:100%; height:auto; box-shadow:0 4px 20px rgba(0,0,0,0.5);"></canvas>

      </div>

    </div>

  </div>

</div>

"""





REORDER_PDF_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="reorderDrop">

    <input type="file" id="reorderFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Reorder, duplicate, delete or add blank pages to your PDF.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="reorderWorkspace" class="card-box" style="display:none;margin-top:16px;">

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">

      <p class="name" id="reorderFileInfo" style="margin:0;"></p>

      <div style="display:flex;gap:8px;">

        <button type="button" class="btn ghost sm" id="reorderAddBlank">+ Blank Page</button>

        <button type="button" class="btn ghost sm" id="reorderReverse">Reverse</button>

        <button type="button" class="btn ghost sm" id="reorderReset">Reset</button>

      </div>

    </div>

    <div id="reorderGrid" style="display:grid;grid-template-columns:repeat(auto-fill, minmax(130px, 1fr));gap:12px;max-height:460px;overflow-y:auto;padding:8px;background:var(--bg);border-radius:8px;"></div>

    <div style="margin-top:16px;text-align:right;">

      <button type="button" class="btn primary" id="reorderSaveBtn">Save Reordered PDF</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Processed PDF</a>

    </div>

  </div>

</div>

"""





PDF_PAGE_NUMBERS_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="numDrop">

    <input type="file" id="numFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h7"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Add clean page numbers with custom position, format, and margins.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="numWorkspace" class="card-box" style="display:none;margin-top:16px;">

    <p class="name" id="numFileInfo" style="margin-bottom:12px;"></p>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

      <div class="field">

        <label for="numFormat">Numbering Style</label>

        <select id="numFormat">

          <option value="page-of" selected>Page X of Y (Page 1 of 10…)</option>

          <option value="page-n">Page X (Page 1, Page 2…)</option>

          <option value="num">Single Number (1, 2, 3…)</option>

        </select>

      </div>

      <div class="field">

        <label for="numPos">Position on Page</label>

        <select id="numPos">

          <option value="bottom-center" selected>Bottom Center</option>

          <option value="bottom-right">Bottom Right</option>

          <option value="bottom-left">Bottom Left</option>

          <option value="top-center">Top Center</option>

          <option value="top-right">Top Right</option>

          <option value="top-left">Top Left</option>

        </select>

      </div>

      <div class="field">

        <label for="numStart">Start Numbering At</label>

        <input type="number" id="numStart" value="1" min="1" max="10000">

      </div>

      <div class="field">

        <label for="numSize">Font Size (pt)</label>

        <input type="number" id="numSize" value="11" min="8" max="36">

      </div>

      <div class="field">

        <label for="numMargin">Edge Margin (pt)</label>

        <input type="number" id="numMargin" value="30" min="5" max="100">

      </div>

      <div class="field">

        <label for="numColor">Text Color</label>

        <input type="color" id="numColor" value="#333333" style="height:38px;padding:2px;cursor:pointer;">

      </div>

    </div>

    <div style="margin-top:16px;text-align:right;">

      <button type="button" class="btn primary" id="numApplyBtn">Add Page Numbers</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Processed PDF</a>

    </div>

  </div>

</div>

"""





PDF_WATERMARK_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="wmPdfDrop">

    <input type="file" id="wmPdfFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Stamp confidentiality or draft watermarks across all PDF pages.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="wmPdfWorkspace" class="card-box" style="display:none;margin-top:16px;">

    <p class="name" id="wmPdfFileInfo" style="margin-bottom:12px;"></p>

    <div class="field">

      <label for="wmPdfText">Watermark Text</label>

      <input type="text" id="wmPdfText" value="CONFIDENTIAL" placeholder="e.g. DRAFT, CONFIDENTIAL, SAMPLE">

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">

      <div class="field">

        <label for="wmPdfSize">Font Size: <span id="wmPdfSizeVal">54pt</span></label>

        <input type="range" id="wmPdfSize" min="20" max="100" value="54">

      </div>

      <div class="field">

        <label for="wmPdfOpacity">Opacity: <span id="wmPdfOpacityVal">25%</span></label>

        <input type="range" id="wmPdfOpacity" min="5" max="90" value="25">

      </div>

      <div class="field">

        <label for="wmPdfColor">Watermark Color</label>

        <input type="color" id="wmPdfColor" value="#d90429" style="height:38px;padding:2px;cursor:pointer;">

      </div>

      <div class="field">

        <label for="wmPdfAngle">Rotation Angle</label>

        <select id="wmPdfAngle">

          <option value="45" selected>Diagonal (45°)</option>

          <option value="0">Horizontal (0°)</option>

          <option value="-45">Reverse Diagonal (-45°)</option>

          <option value="90">Vertical (90°)</option>

        </select>

      </div>

    </div>

    <div style="margin-top:16px;text-align:right;">

      <button type="button" class="btn primary" id="wmPdfApplyBtn">Apply Watermark</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Processed PDF</a>

    </div>

  </div>

</div>

"""





PDF_INFO_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="infoPdfDrop">

    <input type="file" id="infoPdfFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Inspect page count, document title, author, software, and dimensions.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="infoPdfResult" class="card-box" style="display:none;margin-top:16px;">

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">

      <div>

        <h3 style="margin:0;font-size:1.1rem;">PDF Metadata & Properties</h3>

        <p id="infoPdfFileName" style="margin:4px 0 0;color:var(--muted);font-size:0.9rem;"></p>

      </div>

      <div style="display:flex;gap:8px;">

        <button type="button" class="btn ghost sm" id="infoPdfCopyBtn">Copy Metadata</button>

        <button type="button" class="btn ghost sm" id="infoPdfJsonBtn">Export JSON</button>

      </div>

    </div>

    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">

      <tbody id="infoPdfTable"></tbody>

    </table>

  </div>

</div>

"""



PDF_TEXT_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="pdfTextDrop">

    <input type="file" id="pdfTextFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Add text annotations, headers, footers, or labels onto your PDF.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="pdfTextWorkspace" class="card-box" style="display:none;margin-top:16px;">

    <p class="name" id="pdfTextFileInfo" style="margin-bottom:12px;"></p>

    <div class="field">

      <label for="pdfTextInput">Text to Insert</label>

      <input type="text" id="pdfTextInput" placeholder="e.g. Confidential · Prepared for Internal Review">

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">

      <div class="field">

        <label for="pdfTextPosition">Position</label>

        <select id="pdfTextPosition">

          <option value="header-left">Header Left</option>

          <option value="header-center" selected>Header Center</option>

          <option value="header-right">Header Right</option>

          <option value="footer-left">Footer Left</option>

          <option value="footer-center">Footer Center</option>

          <option value="footer-right">Footer Right</option>

          <option value="center">Center of Page</option>

        </select>

      </div>

      <div class="field">

        <label for="pdfTextFont">Font Family</label>

        <select id="pdfTextFont">

          <option value="Helvetica" selected>Helvetica (Standard)</option>

          <option value="HelveticaBold">Helvetica Bold</option>

          <option value="TimesRoman">Times New Roman</option>

          <option value="TimesRomanBold">Times New Roman Bold</option>

          <option value="Courier">Courier Monospace</option>

          <option value="CourierBold">Courier Bold</option>

        </select>

      </div>

      <div class="field">

        <label for="pdfTextSize">Font Size (pt)</label>

        <input type="number" id="pdfTextSize" value="12" min="6" max="72">

      </div>

      <div class="field">

        <label for="pdfTextColor">Text Color</label>

        <input type="color" id="pdfTextColor" value="#000000" style="height:38px;padding:2px;cursor:pointer;">

      </div>

      <div class="field">

        <label for="pdfTextMargin">Edge Margin (pt)</label>

        <input type="number" id="pdfTextMargin" value="36" min="5" max="150">

      </div>

      <div class="field">

        <label for="pdfTextPages">Target Pages</label>

        <select id="pdfTextPages">

          <option value="all" selected>All Pages</option>

          <option value="first">First Page Only</option>

          <option value="last">Last Page Only</option>

          <option value="custom">Custom Page Range</option>

        </select>

      </div>

    </div>

    <div class="field" id="pdfTextCustomPagesBox" style="display:none;margin-top:12px;">

      <label for="pdfTextCustomPages">Custom Pages (e.g. 1-3, 5)</label>

      <input type="text" id="pdfTextCustomPages" placeholder="e.g. 1-3, 5">

    </div>

    <div style="margin-top:16px;text-align:right;">

      <button type="button" class="btn primary" id="pdfTextApplyBtn">Add Text to PDF</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Processed PDF</a>

    </div>

  </div>

</div>

"""





PDF_CROP_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="cropPdfDrop">

    <input type="file" id="cropPdfFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2v14a2 2 0 0 0 2 2h14"/><path d="M18 22V8a2 2 0 0 0-2-2H2"/></svg>

    </div>

    <strong>Drop a PDF file here or click to browse</strong>

    <span>Crop margins and trim white borders from PDF pages.</span>

    <span class="drop-browse-btn">Choose PDF</span>

  </label>

  <div id="cropPdfWorkspace" class="card-box" style="display:none;margin-top:16px;">

    <p class="name" id="cropPdfFileInfo" style="margin-bottom:12px;"></p>

    <div class="field" style="margin-bottom:12px;">

      <label for="cropPdfUnit">Measurement Unit</label>

      <select id="cropPdfUnit">

        <option value="mm" selected>Millimeters (mm)</option>

        <option value="pt">Points (pt, 72 pt = 1 inch)</option>

      </select>

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

      <div class="field">

        <label for="cropPdfTop">Crop Top</label>

        <input type="number" id="cropPdfTop" value="10" min="0" step="1">

      </div>

      <div class="field">

        <label for="cropPdfBottom">Crop Bottom</label>

        <input type="number" id="cropPdfBottom" value="10" min="0" step="1">

      </div>

      <div class="field">

        <label for="cropPdfLeft">Crop Left</label>

        <input type="number" id="cropPdfLeft" value="10" min="0" step="1">

      </div>

      <div class="field">

        <label for="cropPdfRight">Crop Right</label>

        <input type="number" id="cropPdfRight" value="10" min="0" step="1">

      </div>

    </div>

    <div class="field" style="margin-top:12px;">

      <label for="cropPdfPages">Target Pages</label>

      <select id="cropPdfPages">

        <option value="all" selected>All Pages</option>

        <option value="custom">Custom Page Range</option>

      </select>

    </div>

    <div class="field" id="cropPdfCustomPagesBox" style="display:none;margin-top:12px;">

      <label for="cropPdfCustomPages">Custom Pages (e.g. 1-3, 5)</label>

      <input type="text" id="cropPdfCustomPages" placeholder="e.g. 1-3, 5">

    </div>

    <div style="margin-top:16px;text-align:right;">

      <button type="button" class="btn primary" id="cropPdfApplyBtn">Crop PDF Pages</button>

    </div>

    <div id="downloadSection" class="download-box" hidden>

      <a id="downloadLink" class="btn btn-primary" download>Download Processed PDF</a>

    </div>

  </div>

</div>

"""





PDF_TO_TEXT_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="pdfToTextDrop">

    <input type="file" id="pdfToTextInput" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/>

        <polyline points="14 2 14 8 20 8"/>

        <line x1="16" y1="13" x2="8" y2="13"/>

        <line x1="16" y1="17" x2="8" y2="17"/>

        <polyline points="10 9 9 9 8 9"/>

      </svg>

    </div>

    <strong>Drop PDF document here or click to browse</strong>

    <span>Extract plain text and content streams instantly in your browser with zero uploads.</span>

    <span class="drop-browse-btn">Select PDF</span>

  </label>

  <div id="pdfToTextWorkspace" style="display:none;">

    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">

      <div style="display:flex; gap:12px; font-size:0.9rem; color:var(--muted);">

        <span id="pdfTextPageCount" style="font-weight:600; color:var(--fg);">0 pages</span>

        <span id="pdfTextWordCount">0 words</span>

        <span id="pdfTextCharCount">0 characters</span>

      </div>

      <div style="display:flex; gap:8px;">

        <button type="button" class="btn small" id="pdfTextCopyBtn">Copy Text</button>

        <button type="button" class="btn small primary" id="pdfTextDownloadBtn">Download .txt</button>

        <button type="button" class="btn small ghost" id="pdfTextResetBtn">New File</button>

      </div>

    </div>

    <div class="field">

      <label for="pdfExtractedText" id="pdfToTextStatus" style="font-weight:600;">Extracted Plain Text</label>

      <textarea id="pdfExtractedText" rows="18" style="width:100%; font-family:monospace; font-size:0.9rem; box-sizing:border-box; line-height:1.6;" placeholder="Extracted text will appear here..."></textarea>

    </div>

  </div>

</div>

"""





# ==========================================

# ROUND 3 NEW & EXPANDED TOOLS WIDGETS

# ==========================================



HTML_FORMATTER_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">

    <div style="display:flex;align-items:center;gap:8px;">

      <label for="htmlFmtIndent" style="font-size:0.9rem;font-weight:600;">Indentation:</label>

      <select id="htmlFmtIndent" style="padding:4px 8px;font-size:0.9rem;">

        <option value="2" selected>2 Spaces</option>

        <option value="4">4 Spaces</option>

      </select>

    </div>

    <div style="display:flex;gap:8px;">

      <button type="button" class="btn primary" id="htmlFmtFormatBtn">Format HTML</button>

      <button type="button" class="btn ghost" id="htmlFmtMinifyBtn">Minify HTML</button>

      <button type="button" class="btn ghost" id="htmlFmtClearBtn">Clear</button>

    </div>

  </div>

  <div class="grid2">

    <div class="field">

      <label for="htmlFmtInput">Input Dirty / Minified HTML</label>

      <textarea id="htmlFmtInput" rows="16" placeholder="Paste unformatted HTML code here..." style="font-family:monospace;font-size:0.85rem;line-height:1.5;"></textarea>

    </div>

    <div class="field">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">

        <label for="htmlFmtOutput" style="margin:0;">Formatted HTML Output</label>

        <button type="button" class="btn small" id="htmlFmtCopyBtn">Copy Code</button>

      </div>

      <textarea id="htmlFmtOutput" rows="16" readonly placeholder="Formatted clean HTML will appear here..." style="font-family:monospace;font-size:0.85rem;line-height:1.5;"></textarea>

    </div>

  </div>

</div>

"""



CSS_FORMATTER_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px;">

    <div style="display:flex;align-items:center;gap:8px;">

      <label for="cssFmtIndent" style="font-size:0.9rem;font-weight:600;">Indentation:</label>

      <select id="cssFmtIndent" style="padding:4px 8px;font-size:0.9rem;">

        <option value="2" selected>2 Spaces</option>

        <option value="4">4 Spaces</option>

      </select>

    </div>

    <div style="display:flex;gap:8px;">

      <button type="button" class="btn primary" id="cssFmtFormatBtn">Beautify CSS</button>

      <button type="button" class="btn ghost" id="cssFmtMinifyBtn">Minify CSS</button>

      <button type="button" class="btn ghost" id="cssFmtClearBtn">Clear</button>

    </div>

  </div>

  <div class="grid2">

    <div class="field">

      <label for="cssFmtInput">Input Raw CSS Stylesheet</label>

      <textarea id="cssFmtInput" rows="16" placeholder="Paste CSS rules here..." style="font-family:monospace;font-size:0.85rem;line-height:1.5;"></textarea>

    </div>

    <div class="field">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">

        <label for="cssFmtOutput" style="margin:0;">Beautified CSS Output</label>

        <button type="button" class="btn small" id="cssFmtCopyBtn">Copy CSS</button>

      </div>

      <textarea id="cssFmtOutput" rows="16" readonly placeholder="Beautified CSS output..." style="font-family:monospace;font-size:0.85rem;line-height:1.5;"></textarea>

    </div>

  </div>

</div>

"""



JSON_TREE_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

        <label for="jsonTreeInput" style="font-weight:600;margin:0;">Raw JSON Input</label>

        <button type="button" class="btn small ghost" id="jsonTreeClearBtn">Clear</button>

      </div>

      <textarea id="jsonTreeInput" rows="18" placeholder="Paste JSON text here..." style="font-family:monospace;font-size:0.85rem;line-height:1.5;"></textarea>

      <div style="margin-top:10px;display:flex;gap:8px;">

        <button type="button" class="btn primary" id="jsonTreeParseBtn">Build Tree View</button>

      </div>

      <p id="jsonTreeError" style="display:none;color:#ef4444;font-size:0.85rem;margin-top:8px;"></p>

    </div>

    <div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

        <span style="font-weight:600;">Interactive Tree Structure</span>

        <div style="display:flex;gap:6px;">

          <button type="button" class="btn small ghost" id="jsonTreeExpandBtn">Expand All</button>

          <button type="button" class="btn small ghost" id="jsonTreeCollapseBtn">Collapse All</button>

        </div>

      </div>

      <div style="margin-bottom:8px;">

        <input type="text" id="jsonTreeSearch" placeholder="🔍 Search keys or values in real time..." style="width:100%;padding:8px 12px;font-size:13px;border-radius:6px;border:1px solid var(--border);">

      </div>

      <div id="jsonTreeContainer" style="background:var(--surface,#1e1e24);padding:14px;border:1px solid var(--border,#333);border-radius:8px;height:380px;overflow-y:auto;font-family:monospace;font-size:0.85rem;"></div>

      <span id="jsonTreeStats" style="font-size:0.8rem;color:var(--muted);display:block;margin-top:6px;"></span>

    </div>

  </div>

</div>

"""



TIP_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="tipBillInput">Bill Total</label>

        <div style="display:flex;gap:8px;">

          <select id="tipCur" style="flex:0 0 75px;"><option value="$">$</option><option value="€">€</option><option value="£">£</option><option value="¥">¥</option><option value="₹">₹</option></select>

          <input type="number" id="tipBillInput" value="65.00" min="0" step="any" style="flex:1;font-size:1.1rem;font-weight:600;">

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="tipPctInput">Tip Percentage (%)</label>

        <input type="number" id="tipPctInput" value="18" min="0" max="100" step="1">

        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">

          <button type="button" class="btn ghost small tip-preset-btn" data-pct="10">10%</button>

          <button type="button" class="btn ghost small tip-preset-btn" data-pct="15">15%</button>

          <button type="button" class="btn ghost small tip-preset-btn" data-pct="18">18%</button>

          <button type="button" class="btn ghost small tip-preset-btn" data-pct="20">20%</button>

          <button type="button" class="btn ghost small tip-preset-btn" data-pct="25">25%</button>

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="tipSplitInput">Split Among People</label>

        <input type="number" id="tipSplitInput" value="2" min="1" max="100">

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Total Per Person</span>

      <div id="tipPerPersonDisplay" style="font-size:2.2rem;font-weight:700;color:#10b981;margin:8px 0;">$ 38.35</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">

        <div><span style="font-size:0.8rem;color:var(--muted);">Total Tip</span><div id="tipAmountDisplay" style="font-size:1.15rem;font-weight:600;color:#38bdf8;">$ 11.70</div></div>

        <div><span style="font-size:0.8rem;color:var(--muted);">Bill + Tip Total</span><div id="tipTotalDisplay" style="font-size:1.15rem;font-weight:600;">$ 76.70</div></div>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn small" id="tipCopyBtn">Copy Breakdown</button></div>

    </div>

  </div>

</div>

"""



SPLIT_BILL_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="splitBillInput">Total Bill Amount</label>

        <div style="display:flex;gap:8px;">

          <select id="splitCur" style="flex:0 0 75px;"><option value="$">$</option><option value="€">€</option><option value="£">£</option><option value="¥">¥</option><option value="₹">₹</option></select>

          <input type="number" id="splitBillInput" value="120.00" min="0" step="any" style="flex:1;font-size:1.1rem;font-weight:600;">

        </div>

      </div>

      <div class="grid2" style="margin-top:12px;">

        <div class="field"><label for="splitTipPct">Tip (%)</label><input type="number" id="splitTipPct" value="15" min="0"></div>

        <div class="field"><label for="splitTaxPct">Tax (%)</label><input type="number" id="splitTaxPct" value="8.5" min="0"></div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="splitPeopleCount">Number of Diners / People</label>

        <input type="number" id="splitPeopleCount" value="4" min="1" max="100">

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Each Person Owes</span>

      <div id="splitPerPersonAmount" style="font-size:2.2rem;font-weight:700;color:#10b981;margin:8px 0;">$ 37.05</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;font-size:0.9rem;padding:3px 0;"><span style="color:var(--muted);">Total Tip:</span><strong id="splitTipAmount">$ 18.00</strong></div>

        <div style="display:flex;justify-content:space-between;font-size:0.9rem;padding:3px 0;"><span style="color:var(--muted);">Total Tax:</span><strong id="splitTaxAmount">$ 10.20</strong></div>

        <div style="display:flex;justify-content:space-between;font-size:0.95rem;padding:4px 0;border-top:1px dashed var(--border,#444);margin-top:4px;"><span style="font-weight:600;">Grand Total:</span><strong id="splitTotalBill" style="color:#38bdf8;">$ 148.20</strong></div>

      </div>

      <div style="margin-top:12px;"><button type="button" class="btn small" id="splitCopyBtn">Copy Breakdown</button></div>

    </div>

  </div>

</div>

"""



VAT_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:8px;margin-bottom:14px;">

    <button type="button" class="btn active" id="vatModeAdd">Add VAT (Net → Gross)</button>

    <button type="button" class="btn ghost" id="vatModeRemove">Remove VAT (Gross → Net)</button>

  </div>

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="vatAmountInput">Amount</label>

        <div style="display:flex;gap:8px;">

          <select id="vatCur" style="flex:0 0 75px;"><option value="€">€</option><option value="£">£</option><option value="$">$</option><option value="₹">₹</option></select>

          <input type="number" id="vatAmountInput" value="100.00" min="0" step="any" style="flex:1;font-size:1.1rem;font-weight:600;">

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="vatRateInput">VAT Rate (%)</label>

        <input type="number" id="vatRateInput" value="20" min="0" max="100" step="any">

        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">

          <button type="button" class="btn ghost small vat-rate-btn" data-rate="5">5% (Reduced)</button>

          <button type="button" class="btn ghost small vat-rate-btn" data-rate="10">10%</button>

          <button type="button" class="btn ghost small vat-rate-btn" data-rate="19">19% (DE)</button>

          <button type="button" class="btn ghost small vat-rate-btn" data-rate="20">20% (UK/FR)</button>

          <button type="button" class="btn ghost small vat-rate-btn" data-rate="21">21% (NL/ES)</button>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Gross Total (Inc. VAT)</span>

      <div id="vatGrossDisplay" style="font-size:2.2rem;font-weight:700;color:#10b981;margin:8px 0;">€ 120.00</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;display:grid;grid-template-columns:1fr 1fr;gap:10px;">

        <div><span style="font-size:0.8rem;color:var(--muted);">Net (Pre-VAT)</span><div id="vatNetDisplay" style="font-size:1.15rem;font-weight:600;">€ 100.00</div></div>

        <div><span style="font-size:0.8rem;color:var(--muted);">VAT Amount</span><div id="vatTaxDisplay" style="font-size:1.15rem;font-weight:600;color:#38bdf8;">€ 20.00</div></div>

      </div>

      <div style="margin-top:12px;"><button type="button" class="btn small" id="vatCopyBtn">Copy Calculation</button></div>

    </div>

  </div>

</div>

"""



GRADE_CALCULATOR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div>

      <table style="width:100%;border-collapse:collapse;font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:1px solid var(--border,#333);color:var(--muted);">

            <th style="text-align:left;padding:6px;">Assignment / Exam</th>

            <th style="text-align:left;padding:6px;width:90px;">Grade (%)</th>

            <th style="text-align:left;padding:6px;width:90px;">Weight (%)</th>

            <th style="padding:6px;width:40px;"></th>

          </tr>

        </thead>

        <tbody id="gradeRowsBody"></tbody>

      </table>

      <div style="margin-top:12px;display:flex;gap:8px;">

        <button type="button" class="btn small primary" id="gradeAddRowBtn">+ Add Assessment</button>

        <button type="button" class="btn small ghost" id="gradeResetBtn">Reset</button>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);text-align:center;">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Overall Weighted Average</span>

      <div id="gradeFinalScore" style="font-size:2.8rem;font-weight:800;color:#10b981;margin:8px 0;">91.55%</div>

      <div id="gradeLetterDisplay" style="font-size:1.3rem;font-weight:700;color:#38bdf8;">Grade: A-</div>

      <div id="gradeWeightTotal" style="font-size:0.85rem;margin-top:8px;font-weight:600;">Total Weight: 100%</div>

      <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--line);text-align:left;">

        <h4 style="margin:0 0 8px 0;font-size:0.9rem;">Final Exam Target Calculator</h4>

        <div class="grid2">

          <div class="field"><label for="gradeTargetInput" style="font-size:0.8rem;">Target Grade (%)</label><input type="number" id="gradeTargetInput" value="90" min="0" max="100"></div>

          <div class="field"><label for="gradeExamWeightInput" style="font-size:0.8rem;">Exam Weight (%)</label><input type="number" id="gradeExamWeightInput" value="20" min="1" max="99"></div>

        </div>

        <div style="margin-top:8px;font-size:0.85rem;font-weight:600;color:var(--muted);">

          Score Needed: <strong id="gradeNeededScoreDisplay" style="color:#10b981;font-size:1.05rem;">--</strong>

        </div>

      </div>

    </div>

  </div>

</div>

"""



TIMEZONE_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <div class="grid2">

      <div class="field">

        <label for="tzTimeInput">Local Time</label>

        <input type="time" id="tzTimeInput" value="12:00" style="font-size:1.2rem;font-weight:600;">

      </div>

      <div class="field">

        <label for="tzDateInput">Date</label>

        <input type="date" id="tzDateInput">

      </div>

    </div>

    <div style="display:flex;gap:12px;align-items:flex-end;margin-top:12px;flex-wrap:wrap;">

      <div class="field" style="flex:1;min-width:200px;margin:0;">

        <label for="tzFromSelect">Origin Time Zone</label>

        <select id="tzFromSelect" class="field">

          <option value="Asia/Karachi" selected>Karachi, Pakistan (PKT, UTC+5)</option>

          <option value="Europe/London">London, UK (GMT / BST)</option>

          <option value="America/New_York">New York, USA (EST / EDT)</option>

          <option value="UTC">UTC (Coordinated Universal Time)</option>

          <option value="Asia/Dubai">Dubai, UAE (GST, UTC+4)</option>

          <option value="Asia/Kolkata">India / Mumbai (IST, UTC+5:30)</option>

          <option value="Asia/Dhaka">Dhaka, Bangladesh (BST, UTC+6)</option>

          <option value="America/Chicago">Chicago, USA (CST / CDT)</option>

          <option value="America/Los_Angeles">Los Angeles, USA (PST / PDT)</option>

          <option value="America/Denver">Denver, USA (MST / MDT)</option>

          <option value="Europe/Paris">Paris, France (CET / CEST)</option>

          <option value="Europe/Berlin">Berlin, Germany (CET / CEST)</option>

          <option value="Africa/Cairo">Cairo, Egypt (EEST / EET)</option>

          <option value="Asia/Singapore">Singapore (SGT, UTC+8)</option>

          <option value="Asia/Tokyo">Tokyo, Japan (JST, UTC+9)</option>

          <option value="Australia/Sydney">Sydney, Australia (AEST / AEDT)</option>

          <option value="Pacific/Auckland">Auckland, New Zealand (NZST / NZDT)</option>

          <option value="America/Sao_Paulo">São Paulo, Brazil (BRT, UTC-3)</option>

        </select>

      </div>

      <button type="button" class="btn ghost" id="tzSwapBtn" title="Swap zones" style="padding:10px 14px;margin-bottom:2px;">⇄</button>

      <div class="field" style="flex:1;min-width:200px;margin:0;">

        <label for="tzToSelect">Destination Time Zone</label>

        <select id="tzToSelect" class="field">

          <option value="Europe/London" selected>London, UK (GMT / BST)</option>

          <option value="Asia/Karachi">Karachi, Pakistan (PKT, UTC+5)</option>

          <option value="America/New_York">New York, USA (EST / EDT)</option>

          <option value="UTC">UTC (Coordinated Universal Time)</option>

          <option value="Asia/Dubai">Dubai, UAE (GST, UTC+4)</option>

          <option value="Asia/Kolkata">India / Mumbai (IST, UTC+5:30)</option>

          <option value="Asia/Dhaka">Dhaka, Bangladesh (BST, UTC+6)</option>

          <option value="America/Chicago">Chicago, USA (CST / CDT)</option>

          <option value="America/Los_Angeles">Los Angeles, USA (PST / PDT)</option>

          <option value="America/Denver">Denver, USA (MST / MDT)</option>

          <option value="Europe/Paris">Paris, France (CET / CEST)</option>

          <option value="Europe/Berlin">Berlin, Germany (CET / CEST)</option>

          <option value="Africa/Cairo">Cairo, Egypt (EEST / EET)</option>

          <option value="Asia/Singapore">Singapore (SGT, UTC+8)</option>

          <option value="Asia/Tokyo">Tokyo, Japan (JST, UTC+9)</option>

          <option value="Australia/Sydney">Sydney, Australia (AEST / AEDT)</option>

          <option value="Pacific/Auckland">Auckland, New Zealand (NZST / NZDT)</option>

          <option value="America/Sao_Paulo">São Paulo, Brazil (BRT, UTC-3)</option>

        </select>

      </div>

      <button type="button" class="btn ghost" id="tzNowBtn" style="padding:10px 14px;margin-bottom:2px;">Now</button>

    </div>

  </div>

  <div class="card-box" style="text-align:center;padding:24px;background:var(--surface);">

    <span id="tzDiffDisplay" style="font-size:0.9rem;color:var(--muted);">Converted Destination Time</span>

    <div id="tzResultTime" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">--:--</div>

    <div id="tzResultDate" style="font-size:1.1rem;color:var(--fg);font-weight:600;">--</div>

    <div style="margin-top:14px;"><button type="button" class="btn small" id="tzCopyBtn">Copy Converted Time</button></div>

  </div>

</div>

"""



COUNTDOWN_TIMER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <div class="grid3">

      <div class="field">

        <label for="countTitleInput">Event Title</label>

        <input type="text" id="countTitleInput" value="New Year's Eve" placeholder="e.g. Wedding, Launch...">

      </div>

      <div class="field">

        <label for="countTargetDate">Target Date</label>

        <input type="date" id="countTargetDate">

      </div>

      <div class="field">

        <label for="countTargetTime">Target Time</label>

        <input type="time" id="countTargetTime" value="00:00">

      </div>

    </div>

    <div style="margin-top:12px;display:flex;gap:8px;">

      <button type="button" class="btn primary" id="countStartBtn">Start Countdown</button>

      <button type="button" class="btn ghost" id="countResetBtn">Reset</button>

    </div>

  </div>

  <div class="card-box" style="text-align:center;padding:32px;background:var(--surface);">

    <h3 id="countBannerTitle" style="margin:0 0 16px 0;font-size:1.4rem;">Event Countdown</h3>

    <div style="display:flex;justify-content:center;gap:16px;flex-wrap:wrap;">

      <div style="background:var(--bg);border:1px solid var(--border,#333);border-radius:8px;padding:12px;min-width:75px;"><div id="countDaysDisplay" style="font-size:2.5rem;font-weight:800;color:#10b981;">00</div><span style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;">Days</span></div>

      <div style="background:var(--bg);border:1px solid var(--border,#333);border-radius:8px;padding:12px;min-width:75px;"><div id="countHoursDisplay" style="font-size:2.5rem;font-weight:800;color:#38bdf8;">00</div><span style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;">Hours</span></div>

      <div style="background:var(--bg);border:1px solid var(--border,#333);border-radius:8px;padding:12px;min-width:75px;"><div id="countMinsDisplay" style="font-size:2.5rem;font-weight:800;color:#f59e0b;">00</div><span style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;">Mins</span></div>

      <div style="background:var(--bg);border:1px solid var(--border,#333);border-radius:8px;padding:12px;min-width:75px;"><div id="countSecsDisplay" style="font-size:2.5rem;font-weight:800;color:#ef4444;">00</div><span style="font-size:0.75rem;color:var(--muted);text-transform:uppercase;">Secs</span></div>

    </div>

    <p id="countStatusMsg" style="margin-top:16px;font-size:0.9rem;color:var(--muted);"></p>

  </div>

</div>

"""



WIFI_QR_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="wifiSsidInput">Network Name (SSID)</label>

        <input type="text" id="wifiSsidInput" value="Toolswick-Guest-WiFi" placeholder="Enter WiFi SSID...">

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="wifiPassInput">WiFi Password</label>

        <input type="text" id="wifiPassInput" value="welcome2026" placeholder="Enter WiFi network password...">

      </div>

      <div class="grid2" style="margin-top:12px;">

        <div class="field">

          <label for="wifiEncSelect">Security Type</label>

          <select id="wifiEncSelect">

            <option value="WPA" selected>WPA / WPA2 / WPA3</option>

            <option value="WEP">WEP</option>

            <option value="nopass">None (Open Network)</option>

          </select>

        </div>

        <div class="field" style="display:flex;align-items:flex-end;">

          <label class="check" style="margin-bottom:8px;"><input type="checkbox" id="wifiHiddenCheck"> Hidden SSID</label>

        </div>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="wifiGenerateBtn">Update QR Code</button></div>

    </div>

    <div class="card-box" style="text-align:center;padding:24px;background:var(--surface);">

      <canvas id="wifiQrCanvas" style="max-width:240px;height:auto;border-radius:8px;box-shadow:0 4px 14px rgba(0,0,0,0.15);"></canvas>

      <div style="margin-top:16px;display:flex;justify-content:center;gap:10px;">

        <button type="button" class="btn primary" id="wifiDownloadPngBtn">Download PNG</button>

        <button type="button" class="btn ghost" id="wifiPrintCardBtn">🖨️ Print Card</button>

      </div>

    </div>

  </div>

</div>

"""



BATCH_RESIZE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="batchResizeDrop">

    <input type="file" id="batchResizeFile" multiple accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M15 3h6v6m-6 0l6-6"/><path d="M9 21H3v-6m6 0l-6 6"/></svg>

    </div>

    <strong>Drop multiple images here or click to browse</strong>

    <span>Resize dozens of JPG, PNG, or WebP photos simultaneously in browser memory.</span>

    <span class="drop-browse-btn">Choose Multiple Images</span>

  </label>

  <div id="batchResizeWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div class="grid3">

        <div class="field"><label for="batchResizeWidth">Target Width (px)</label><input type="number" id="batchResizeWidth" value="1200" min="10"></div>

        <div class="field"><label for="batchResizeHeight">Target Height (px)</label><input type="number" id="batchResizeHeight" value="800" min="10"></div>

        <div class="field">

          <label for="batchResizeMode">Scaling Mode</label>

          <select id="batchResizeMode">

            <option value="width" selected>Scale by Width (Keep Aspect)</option>

            <option value="height">Scale by Height (Keep Aspect)</option>

            <option value="exact">Exact Width & Height (Stretch/Fit)</option>

          </select>

        </div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="batchResizeFmt">Export Format</label>

        <select id="batchResizeFmt" style="max-width:240px;">

          <option value="original" selected>Keep Original Format</option>

          <option value="jpg">Convert All to JPG</option>

          <option value="png">Convert All to PNG</option>

          <option value="webp">Convert All to WebP</option>

        </select>

      </div>

      <div style="margin-top:12px;display:flex;gap:10px;align-items:center;">

        <button type="button" class="btn primary" id="batchResizeProcessBtn">Resize All Images</button>

        <button type="button" class="btn" id="batchResizeDownloadZipBtn" style="display:none;background:#10b981;color:#fff;">Download All as ZIP</button>

      </div>

      <p id="batchResizeStatus" style="font-size:0.9rem;margin-top:10px;font-weight:600;"></p>

    </div>

    <div class="card-box"><h4 style="margin:0 0 10px 0;">Selected Files</h4><div id="batchResizeFileList" style="max-height:220px;overflow-y:auto;"></div></div>

  </div>

</div>

"""



BATCH_CONVERT_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="batchConvDrop">

    <input type="file" id="batchConvFile" multiple accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><circle cx="12" cy="13" r="3.5"/><polyline points="14 2 14 8 20 8"/></svg>

    </div>

    <strong>Drop images to convert in bulk</strong>

    <span>Convert multiple PNG, JPG, and WebP files in a single pass with ZIP packaging.</span>

    <span class="drop-browse-btn">Select Images</span>

  </label>

  <div id="batchConvWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div class="grid2">

        <div class="field">

          <label for="batchConvTargetFmt">Target Output Format</label>

          <select id="batchConvTargetFmt">

            <option value="webp" selected>WebP (Smallest file size)</option>

            <option value="jpg">JPG / JPEG (Universal compatibility)</option>

            <option value="png">PNG (Lossless transparency)</option>

          </select>

        </div>

        <div class="field">

          <label for="batchConvQuality">Compression Quality (1 - 100)</label>

          <input type="number" id="batchConvQuality" value="85" min="10" max="100">

        </div>

      </div>

      <div style="margin-top:12px;display:flex;gap:10px;align-items:center;">

        <button type="button" class="btn primary" id="batchConvProcessBtn">Convert All Images</button>

        <button type="button" class="btn" id="batchConvDownloadZipBtn" style="display:none;background:#10b981;color:#fff;">Download All as ZIP</button>

      </div>

      <p id="batchConvStatus" style="font-size:0.9rem;margin-top:10px;font-weight:600;"></p>

    </div>

    <div class="card-box"><h4 style="margin:0 0 10px 0;">Selected Files</h4><div id="batchConvFileList" style="max-height:220px;overflow-y:auto;"></div></div>

  </div>

</div>

"""



BATCH_COMPRESS_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="batchCompDrop">

    <input type="file" id="batchCompFile" multiple accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M4 14h6m0 0v6m0-6L3 21"/><path d="M20 10h-6m0 0V4m0 6l7-7"/></svg>

    </div>

    <strong>Drop multiple images to compress in bulk</strong>

    <span>Select target size (20KB, 50KB, 100KB, 200KB) and compress batches without uploading.</span>

    <span class="drop-browse-btn">Select Photos</span>

  </label>

  <div id="batchCompWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div class="field">

        <label for="batchCompTargetKb">Target Maximum File Size (KB)</label>

        <input type="number" id="batchCompTargetKb" value="100" min="10" max="5000">

        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">

          <button type="button" class="btn ghost small comp-target-preset-btn" data-kb="20">Compress to 20 KB</button>

          <button type="button" class="btn ghost small comp-target-preset-btn" data-kb="50">Compress to 50 KB</button>

          <button type="button" class="btn ghost small comp-target-preset-btn active" data-kb="100">Compress to 100 KB</button>

          <button type="button" class="btn ghost small comp-target-preset-btn" data-kb="200">Compress to 200 KB</button>

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="batchCompMaxDim">Maximum Dimension (px)</label>

        <input type="number" id="batchCompMaxDim" value="1600" min="300" max="6000" style="max-width:240px;">

      </div>

      <div style="margin-top:14px;display:flex;gap:10px;align-items:center;">

        <button type="button" class="btn primary" id="batchCompProcessBtn">Compress All Photos</button>

        <button type="button" class="btn" id="batchCompDownloadZipBtn" style="display:none;background:#10b981;color:#fff;">Download All as ZIP</button>

      </div>

      <p id="batchCompStatus" style="font-size:0.9rem;margin-top:10px;font-weight:600;"></p>

    </div>

    <div class="card-box"><h4 style="margin:0 0 10px 0;">Selected Files</h4><div id="batchCompFileList" style="max-height:220px;overflow-y:auto;"></div></div>

  </div>

</div>

"""



PDF_DUPLICATE_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="dupPdfDrop">

    <input type="file" id="dupPdfFile" accept="application/pdf,.pdf">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="12" y1="10" x2="12" y2="16"/></svg>

    </div>

    <strong>Drop PDF document to duplicate pages</strong>

    <span>Duplicate specific pages or the entire PDF document multiple times offline.</span>

    <span class="drop-browse-btn">Select PDF</span>

  </label>

  <div id="dupPdfWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div class="grid2">

        <div class="field">

          <label for="dupPdfPageSelect">Select Page to Duplicate</label>

          <select id="dupPdfPageSelect"><option value="all">Duplicate All Pages</option></select>

        </div>

        <div class="field">

          <label for="dupPdfCopies">Number of Extra Copies</label>

          <input type="number" id="dupPdfCopies" value="1" min="1" max="50">

        </div>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="dupPdfApplyBtn">Duplicate Pages</button></div>

      <p id="dupPdfStatus" style="font-size:0.9rem;margin-top:10px;font-weight:600;"></p>

      <div id="dupPdfDownloadSection" class="download-box" hidden>

        <a id="dupPdfDownloadLink" class="btn btn-primary" download>Download Duplicated PDF</a>

      </div>

    </div>

  </div>

</div>

"""



SCIENTIFIC_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box" style="padding:16px;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <button type="button" class="btn ghost small sci-btn" id="sciDegRadBtn" data-action="mode" style="font-weight:700;color:#10b981;">DEG</button>

        <span style="font-size:0.8rem;color:var(--muted);">Click DEG to toggle Angle Mode</span>

      </div>

      <div style="background:var(--bg);border:1px solid var(--border,#333);border-radius:8px;padding:12px;text-align:right;margin-bottom:12px;">

        <div id="sciExpr" style="font-size:0.85rem;color:var(--muted);min-height:18px;font-family:monospace;"></div>

        <div id="sciDisplay" style="font-size:2.2rem;font-weight:700;color:#10b981;font-family:monospace;overflow-x:auto;">0</div>

      </div>

      <div style="display:grid;grid-template-columns:repeat(5, 1fr);gap:6px;">

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="sin">sin</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="cos">cos</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="tan">tan</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="ln">ln</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="log">log</button>



        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="sqrt">√</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="square">x²</button>

        <button type="button" class="btn ghost small sci-btn" data-action="op" data-val="^">^</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="pi">π</button>

        <button type="button" class="btn ghost small sci-btn" data-action="clear" style="color:#ef4444;">AC</button>



        <button type="button" class="btn small sci-btn" data-action="num" data-val="7">7</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="8">8</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="9">9</button>

        <button type="button" class="btn ghost small sci-btn" data-action="op" data-val="÷">÷</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="factorial">n!</button>



        <button type="button" class="btn small sci-btn" data-action="num" data-val="4">4</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="5">5</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="6">6</button>

        <button type="button" class="btn ghost small sci-btn" data-action="op" data-val="×">×</button>

        <button type="button" class="btn ghost small sci-btn" data-action="func" data-val="e">e</button>



        <button type="button" class="btn small sci-btn" data-action="num" data-val="1">1</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="2">2</button>

        <button type="button" class="btn small sci-btn" data-action="num" data-val="3">3</button>

        <button type="button" class="btn ghost small sci-btn" data-action="op" data-val="-">−</button>

        <button type="button" class="btn ghost small sci-btn" data-action="sign">±</button>



        <button type="button" class="btn small sci-btn" data-action="num" data-val="0">0</button>

        <button type="button" class="btn small sci-btn" data-action="dot">.</button>

        <button type="button" class="btn ghost small sci-btn" data-action="op" data-val="+">+</button>

        <button type="button" class="btn primary small sci-btn" data-action="equal" style="grid-column:span 2;">=</button>

      </div>

    </div>

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <h4 style="margin:0;font-size:0.95rem;">Calculation History</h4>

        <button type="button" class="btn small ghost" id="sciClearHistoryBtn">Clear</button>

      </div>

      <div id="sciHistoryList" style="max-height:300px;overflow-y:auto;font-family:monospace;"></div>

    </div>

  </div>

</div>

"""



RANDOM_NUMBER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field"><label for="rngMinInput">Min Range</label><input type="number" id="rngMinInput" value="1"></div>

        <div class="field"><label for="rngMaxInput">Max Range</label><input type="number" id="rngMaxInput" value="100"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="rngCountInput">How Many Numbers?</label><input type="number" id="rngCountInput" value="5" min="1" max="1000"></div>

        <div class="field">

          <label for="rngSortSelect">Sorting</label>

          <select id="rngSortSelect">

            <option value="none" selected>Do Not Sort</option>

            <option value="asc">Ascending (Low to High)</option>

            <option value="desc">Descending (High to Low)</option>

          </select>

        </div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label class="check"><input type="checkbox" id="rngUniqueCheck" checked> No duplicates (Unique numbers only)</label>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="rngGenerateBtn">Generate Random Numbers</button></div>

    </div>

    <div class="card-box" style="text-align:center;padding:24px;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Generated Numbers</span>

      <div id="rngResultsGrid" style="margin:16px 0;min-height:80px;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;"></div>

      <button type="button" class="btn small" id="rngCopyBtn">Copy Numbers</button>

    </div>

  </div>

</div>

"""



POMODORO_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:540px;margin:0 auto;text-align:center;padding:32px;">

    <div class="tt-tabs" style="display:flex;justify-content:center;gap:8px;margin-bottom:16px;">

      <button type="button" class="btn active" id="pomoTabWork">Focus (25m)</button>

      <button type="button" class="btn ghost" id="pomoTabShort">Short Break (5m)</button>

      <button type="button" class="btn ghost" id="pomoTabLong">Long Break (15m)</button>

    </div>

    <span id="pomoModeBadge" style="display:inline-block;padding:3px 12px;border-radius:12px;font-size:0.8rem;background:var(--surface,#222);font-weight:600;margin-bottom:12px;color:#38bdf8;">Focus Session</span>

    <div id="pomoTimeDisplay" style="font-size:5rem;font-weight:800;color:#10b981;font-family:monospace;letter-spacing:2px;margin:10px 0;">25:00</div>

    <div style="display:flex;justify-content:center;gap:12px;margin-top:20px;">

      <button type="button" class="btn primary" id="pomoStartPauseBtn" style="padding:12px 28px;font-size:1.1rem;font-weight:700;">Start</button>

      <button type="button" class="btn ghost" id="pomoSkipBtn">Skip</button>

      <button type="button" class="btn ghost" id="pomoResetBtn">Reset</button>

    </div>

    <div style="border-top:1px solid var(--border,#333);margin-top:24px;padding-top:16px;display:flex;justify-content:center;gap:16px;font-size:0.85rem;flex-wrap:wrap;">

      <div><label for="pomoWorkMins">Work: </label><input type="number" id="pomoWorkMins" value="25" min="1" max="90" style="width:55px;"></div>

      <div><label for="pomoShortMins">Short: </label><input type="number" id="pomoShortMins" value="5" min="1" max="30" style="width:55px;"></div>

      <div><label for="pomoLongMins">Long: </label><input type="number" id="pomoLongMins" value="15" min="1" max="60" style="width:55px;"></div>

    </div>

    <div style="border-top:1px solid var(--border,#333);margin-top:16px;padding-top:12px;display:flex;justify-content:center;align-items:center;gap:12px;font-size:0.85rem;flex-wrap:wrap;">

      <label for="pomoSoundSelect" style="font-weight:600;">Alarm Tone:</label>

      <select id="pomoSoundSelect" style="padding:4px 8px;font-size:0.85rem;">

        <option value="chime" selected>Zen Chime (Gentle)</option>

        <option value="digital">Digital Alarm Beep</option>

        <option value="bell">Temple Bell</option>

        <option value="mute">Mute (Silent)</option>

      </select>

      <button type="button" class="btn ghost small" id="pomoTestSoundBtn" style="padding:4px 10px;font-size:0.8rem;">Test Sound</button>

    </div>

  </div>

</div>

"""



TEXT_TO_SPEECH_WIDGET = """

<div class="tool-workspace">

  <div class="field">

    <label for="ttsInput">Enter Text to Read Aloud</label>

    <textarea id="ttsInput" rows="7" placeholder="Type or paste any text here..." style="font-size:1rem;line-height:1.6;">Hello and welcome to Toolswick! All speech synthesis is processed natively in your browser with zero audio uploads.</textarea>

  </div>

  <div class="grid3" style="margin-top:12px;">

    <div class="field">

      <label for="ttsVoiceSelect">Voice & Language</label>

      <select id="ttsVoiceSelect"></select>

    </div>

    <div class="field">

      <label for="ttsRateInput">Speed: <span id="ttsRateValue">1x</span></label>

      <input type="range" id="ttsRateInput" min="0.5" max="2" step="0.1" value="1">

    </div>

    <div class="field">

      <label for="ttsPitchInput">Pitch: <span id="ttsPitchValue">1</span></label>

      <input type="range" id="ttsPitchInput" min="0.5" max="1.5" step="0.1" value="1">

    </div>

  </div>

  <div style="margin-top:14px;display:flex;gap:10px;align-items:center;">

    <button type="button" class="btn primary" id="ttsSpeakBtn">▶ Play Speech</button>

    <button type="button" class="btn ghost" id="ttsPauseBtn">Pause</button>

    <button type="button" class="btn ghost" id="ttsStopBtn">Stop</button>

    <button type="button" class="btn ghost" id="ttsClearBtn">Clear</button>

    <span id="ttsStatus" style="font-size:0.85rem;color:var(--muted);margin-left:8px;"></span>

  </div>

</div>

"""



RANDOM_PICKER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="pickerListInput">Items / Contestants (One per line)</label>

        <textarea id="pickerListInput" rows="10" placeholder="Paste list of names or items..."></textarea>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="pickerCountInput">Winners to Pick</label>

        <input type="number" id="pickerCountInput" value="1" min="1" max="50">

      </div>

      <div style="margin-top:12px;display:flex;gap:8px;">

        <button type="button" class="btn primary" id="pickerPickBtn">🎯 Pick Random Winner</button>

        <button type="button" class="btn ghost" id="pickerShuffleBtn">Shuffle List</button>

      </div>

    </div>

    <div class="card-box" style="text-align:center;padding:24px;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Selected Winner</span>

      <div id="pickerWinnerDisplay" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:24px 0;min-height:60px;display:flex;align-items:center;justify-content:center;">Ready to pick!</div>

      <div style="border-top:1px solid var(--border,#333);margin-top:16px;padding-top:12px;text-align:left;">

        <h4 style="margin:0 0 8px 0;font-size:0.9rem;">Previous Picks</h4>

        <div id="pickerHistoryList" style="max-height:160px;overflow-y:auto;font-size:0.85rem;"></div>

      </div>

    </div>

  </div>

</div>

"""



DICE_ROLLER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid3">

        <div class="field">

          <label for="diceTypeSelect">Die Type</label>

          <select id="diceTypeSelect">

            <option value="4">d4 (4 sides)</option>

            <option value="6" selected>d6 (6 sides)</option>

            <option value="8">d8 (8 sides)</option>

            <option value="10">d10 (10 sides)</option>

            <option value="12">d12 (12 sides)</option>

            <option value="20">d20 (20 sides)</option>

            <option value="100">d100 (100 sides)</option>

          </select>

        </div>

        <div class="field"><label for="diceCountInput">Number of Dice</label><input type="number" id="diceCountInput" value="2" min="1" max="20"></div>

        <div class="field"><label for="diceModifierInput">Modifier (+/-)</label><input type="number" id="diceModifierInput" value="0"></div>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="diceRollBtn" style="padding:10px 24px;font-weight:700;">🎲 Roll Dice</button></div>

    </div>

    <div class="card-box" style="text-align:center;padding:24px;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Total Roll</span>

      <div id="diceTotalDisplay" style="font-size:3.5rem;font-weight:800;color:#10b981;margin:8px 0;">--</div>

      <div id="diceBreakdownDisplay" style="font-size:1rem;color:var(--muted);font-family:monospace;"></div>

      <div style="border-top:1px solid var(--border,#333);margin-top:16px;padding-top:12px;text-align:left;">

        <h4 style="margin:0 0 6px 0;font-size:0.85rem;">Roll History</h4>

        <div id="diceHistoryList" style="max-height:140px;overflow-y:auto;"></div>

      </div>

    </div>

  </div>

</div>

"""



COIN_FLIP_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:480px;margin:0 auto;text-align:center;padding:32px;">

    <div style="perspective:800px;width:120px;height:120px;margin:0 auto 20px auto;">

      <div id="coinVisual" style="width:120px;height:120px;position:relative;transform-style:preserve-3d;-webkit-transform-style:preserve-3d;transition:transform 1s cubic-bezier(0.2, 0.8, 0.3, 1);">

        <!-- HEADS FACE -->

        <div id="coinHeads" style="position:absolute;inset:0;width:100%;height:100%;border-radius:50%;backface-visibility:hidden;-webkit-backface-visibility:hidden;display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 35%, #fef08a 0%, #eab308 60%, #ca8a04 100%);border:4px solid #fef08a;box-shadow:inset 0 0 10px rgba(0,0,0,0.3), 0 8px 24px rgba(234,179,8,0.35);color:#713f12;user-select:none;">

          <svg width="42" height="42" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">

            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"/>

          </svg>

          <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.1em;margin-top:2px;">HEADS</span>

        </div>

        <!-- TAILS FACE -->

        <div id="coinTails" style="position:absolute;inset:0;width:100%;height:100%;border-radius:50%;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform:rotateY(180deg);-webkit-transform:rotateY(180deg);display:flex;flex-direction:column;align-items:center;justify-content:center;background:radial-gradient(circle at 35% 35%, #e0f2fe 0%, #38bdf8 60%, #0284c7 100%);border:4px solid #bae6fd;box-shadow:inset 0 0 10px rgba(0,0,0,0.3), 0 8px 24px rgba(56,189,248,0.35);color:#082f49;user-select:none;">

          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">

            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>

          </svg>

          <span style="font-size:0.75rem;font-weight:900;letter-spacing:0.1em;margin-top:2px;">TAILS</span>

        </div>

      </div>

    </div>

    <div id="coinResultDisplay" style="font-size:1.85rem;font-weight:800;min-height:48px;margin-bottom:16px;">Click Flip Coin</div>

    <button type="button" class="btn primary" id="coinFlipBtn" style="padding:12px 32px;font-size:1.1rem;font-weight:700;">Flip Coin</button>

    <div style="border-top:1px solid var(--border,#333);margin-top:24px;padding-top:16px;display:flex;justify-content:space-around;flex-wrap:wrap;gap:8px 16px;font-size:0.9rem;">

      <div><span style="color:var(--muted);">Heads:</span> <strong id="coinHeadsCount" style="color:#eab308;">0</strong></div>

      <div><span style="color:var(--muted);">Tails:</span> <strong id="coinTailsCount" style="color:#38bdf8;">0</strong></div>

      <div><span style="color:var(--muted);">Total Flips:</span> <strong id="coinTotalCount">0</strong></div>

    </div>

    <div style="margin-top:14px;"><button type="button" class="btn small ghost" id="coinResetBtn">Reset Counter</button></div>

  </div>

</div>

"""



CALORIE_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field">

          <label for="calGender">Biological Sex</label>

          <select id="calGender"><option value="male" selected>Male</option><option value="female">Female</option></select>

        </div>

        <div class="field"><label for="calAge">Age (Years)</label><input type="number" id="calAge" value="28" min="15" max="100"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="calWeight">Weight (kg / lbs)</label><input type="number" id="calWeight" value="75" min="30"></div>

        <div class="field"><label for="calHeight">Height (cm / in)</label><input type="number" id="calHeight" value="178" min="100"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field">

          <label for="calUnit">Unit Standard</label>

          <select id="calUnit"><option value="metric" selected>Metric (kg, cm)</option><option value="imperial">Imperial (lbs, in)</option></select>

        </div>

        <div class="field">

          <label for="calActivity">Activity Level</label>

          <select id="calActivity">

            <option value="1.2" selected>Sedentary (Little or no exercise)</option>

            <option value="1.375">Light (Exercise 1-3 days/wk)</option>

            <option value="1.55">Moderate (Exercise 3-5 days/wk)</option>

            <option value="1.725">Heavy (Hard exercise 6-7 days/wk)</option>

          </select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Daily Maintenance Energy (TDEE)</span>

      <div id="calTdeeDisplay" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">-- kcal / day</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--muted);">Basal Metabolic Rate (BMR):</span><strong id="calBmrDisplay">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#38bdf8;">Weight Loss Deficit (-500 kcal):</span><strong id="calCutDisplay" style="color:#38bdf8;">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:#f59e0b;">Muscle Gain Surplus (+300 kcal):</span><strong id="calBulkDisplay" style="color:#f59e0b;">--</strong></div>

      </div>

    </div>

  </      <div class="card-box" style="margin-top:14px;background:var(--surface);">

        <h4 style="margin:0 0 10px 0;font-size:0.95rem;">Macronutrient Splits (Maintenance)</h4>

        <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:10px;text-align:center;">

          <div style="padding:10px;border:1px solid var(--line);border-radius:8px;">

            <span style="font-size:0.8rem;color:var(--muted);display:block;">Protein (30%)</span>

            <strong id="calProteinDisplay" style="font-size:1.15rem;color:#10b981;">--</strong>

          </div>

          <div style="padding:10px;border:1px solid var(--line);border-radius:8px;">

            <span style="font-size:0.8rem;color:var(--muted);display:block;">Carbs (40%)</span>

            <strong id="calCarbsDisplay" style="font-size:1.15rem;color:#38bdf8;">--</strong>

          </div>

          <div style="padding:10px;border:1px solid var(--line);border-radius:8px;">

            <span style="font-size:0.8rem;color:var(--muted);display:block;">Fats (30%)</span>

            <strong id="calFatDisplay" style="font-size:1.15rem;color:#f59e0b;">--</strong>

          </div>

        </div>

      </div>

    </div>\n  </div>\n</div>"""



TYPING_SPEED_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:14px;padding:20px;">

    <div id="typingPrompt" style="font-size:1.15rem;line-height:1.7;font-family:monospace;min-height:80px;background:var(--bg);padding:14px;border-radius:6px;border:1px solid var(--border,#333);"></div>

    <div class="field" style="margin-top:14px;">

      <textarea id="typingInput" rows="3" placeholder="Start typing the passage above here..." style="font-size:1.1rem;font-family:monospace;"></textarea>

    </div>

    <div style="margin-top:10px;display:flex;gap:10px;align-items:center;">

      <button type="button" class="btn primary" id="typingRestartBtn">Restart Test</button>

      <span id="typingTimer" style="font-size:1.2rem;font-weight:700;color:#f59e0b;margin-left:auto;">60s</span>

    </div>

  </div>

  <div class="grid2">

    <div class="card-box" style="text-align:center;"><span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Speed</span><div id="typingWpm" style="font-size:2.8rem;font-weight:800;color:#10b981;">0 WPM</div></div>

    <div class="card-box" style="text-align:center;"><span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Accuracy</span><div id="typingAcc" style="font-size:2.8rem;font-weight:800;color:#38bdf8;">100%</div></div>

  </div>

</div>

"""



BODY_FAT_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field"><label for="bfGender">Sex</label><select id="bfGender"><option value="male" selected>Male</option><option value="female">Female</option></select></div>

        <div class="field"><label for="bfUnit">Units</label><select id="bfUnit"><option value="metric" selected>Metric (cm)</option><option value="imperial">Imperial (inches)</option></select></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="bfHeight">Height</label><input type="number" id="bfHeight" value="178"></div>

        <div class="field"><label for="bfNeck">Neck Circumference</label><input type="number" id="bfNeck" value="40"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="bfWaist">Waist Circumference</label><input type="number" id="bfWaist" value="86"></div>

        <div class="field"><label for="bfWeight">Body Weight (<span id="bfWeightUnitLabel">kg</span>)</label><input type="number" id="bfWeight" value="75"></div>

      </div>

      <div class="field" id="bfHipRow" style="display:none;margin-top:10px;">

        <label for="bfHip">Hip Circumference (Women)</label>

        <input type="number" id="bfHip" value="96">

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);text-align:center;">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">US Navy Body Fat Estimate</span>

      <div id="bfResultPct" style="font-size:3.2rem;font-weight:800;color:#10b981;margin:8px 0;">--%</div>

      <div id="bfCategoryDisplay" style="font-size:1.1rem;font-weight:600;color:#38bdf8;">Classification: --</div>

      <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--line);"><span style="font-size:0.85rem;color:var(--muted);display:block;">Estimated Lean Body Mass:</span><strong id="bfLeanMassDisplay" style="font-size:1.3rem;color:var(--ink);">--</strong></div>

    </div>

  </div>

</div>

"""



SLEEP_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:560px;margin:0 auto;padding:24px;">

    <div style="display:flex;gap:8px;margin-bottom:14px;">

      <button type="button" class="btn active" id="sleepModeWake">I want to wake up at...</button>

      <button type="button" class="btn ghost" id="sleepModeBed">I am going to sleep at...</button>

    </div>

    <div class="field">

      <label for="sleepTimeInput">Target Time</label>

      <input type="time" id="sleepTimeInput" value="07:00" style="font-size:1.3rem;font-weight:700;">

    </div>

    <div style="margin-top:12px;"><button type="button" class="btn primary" id="sleepCalcBtn">Calculate Sleep Cycles</button></div>

    <div style="margin-top:20px;">

      <h4 id="sleepHeading" style="margin:0 0 10px 0;font-size:0.95rem;">Optimal Bedtimes (90-min Sleep Cycles):</h4>

      <div id="sleepResultsList"></div>

    </div>

  </div>

</div>

"""



PREGNANCY_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="pregLmpDate">First Day of Last Menstrual Period (LMP)</label>

        <input type="date" id="pregLmpDate" style="font-size:1.1rem;font-weight:600;">

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="pregCycleLength">Average Cycle Length (Days)</label>

        <input type="number" id="pregCycleLength" value="28" min="20" max="45">

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="pregCalcBtn">Calculate Due Date</button></div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Estimated Due Date</span>

      <div id="pregDueDateDisplay" style="font-size:1.8rem;font-weight:800;color:#10b981;margin:8px 0;">--</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Current Stage:</span><strong id="pregCurrentWeekDisplay">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Trimester:</span><strong id="pregTrimesterDisplay" style="color:#38bdf8;">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Days Left:</span><strong id="pregDaysRemaining">--</strong></div>

      </div>

    </div>

  </div>

</div>

"""



FRACTION_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div style="display:flex;align-items:center;gap:12px;justify-content:center;">

        <div style="text-align:center;">

          <input type="number" id="fracNum1" value="3" style="width:65px;text-align:center;font-weight:700;">

          <div style="border-top:2px solid var(--fg);margin:4px 0;"></div>

          <input type="number" id="fracDen1" value="4" style="width:65px;text-align:center;font-weight:700;">

        </div>

        <select id="fracOp" style="font-size:1.3rem;font-weight:700;padding:4px 10px;">

          <option value="+">+</option>

          <option value="-">−</option>

          <option value="×">×</option>

          <option value="÷">÷</option>

        </select>

        <div style="text-align:center;">

          <input type="number" id="fracNum2" value="2" style="width:65px;text-align:center;font-weight:700;">

          <div style="border-top:2px solid var(--fg);margin:4px 0;"></div>

          <input type="number" id="fracDen2" value="5" style="width:65px;text-align:center;font-weight:700;">

        </div>

      </div>

    </div>

    <div class="card-box" style="text-align:center;display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Simplified Result</span>

      <div id="fracResultDisplay" style="font-size:2.8rem;font-weight:800;color:#10b981;margin:8px 0;">23 / 20</div>

      <div id="fracDecimalDisplay" style="font-size:1.1rem;color:#38bdf8;font-weight:600;">Decimal: 1.15</div>

      <div id="fracMixedDisplay" style="font-size:0.95rem;color:var(--muted);margin-top:4px;">Mixed: 1 3/20</div>

      <div id="fracStepsDisplay" style="font-size:0.85rem;color:var(--muted);margin-top:8px;border-top:1px dashed var(--line);padding-top:8px;">Common Denominator: (3×5 + 2×4) / (4×5) = 23/20</div>

    </div>

  </div>

</div>

"""



SPEED_DISTANCE_TIME_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="sdtSolveFor">What do you want to solve for?</label>

        <select id="sdtSolveFor">

          <option value="speed" selected>Speed (Distance ÷ Time)</option>

          <option value="distance">Distance (Speed × Time)</option>

          <option value="time">Travel Time (Distance ÷ Speed)</option>

        </select>

      </div>

      <div class="grid3" style="margin-top:12px;">

        <div class="field"><label for="sdtSpeed">Speed</label><input type="number" id="sdtSpeed" value="60"></div>

        <div class="field"><label for="sdtDistance">Distance</label><input type="number" id="sdtDistance" value="150"></div>

        <div class="field"><label for="sdtTime">Time (Hours)</label><input type="number" id="sdtTime" value="2.5" step="any"></div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);text-align:center;">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Computed Result</span>

      <div id="sdtResultValue" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">--</div>

      <div id="sdtFormulaDisplay" style="font-size:0.9rem;color:var(--muted);font-family:monospace;">--</div>

    </div>

  </div>

</div>

"""



INVESTMENT_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field">

          <label for="invtInitAmount">Initial Principal</label>

          <div style="display:flex;gap:8px;"><select id="invtCur" style="flex:0 0 75px;"><option value="$">$</option><option value="€">€</option><option value="£">£</option><option value="₹">₹</option></select><input type="number" id="invtInitAmount" value="5000" style="flex:1;min-width:0;"></div>

        </div>

        <div class="field"><label for="invtMonthlyContrib">Monthly Contribution</label><input type="number" id="invtMonthlyContrib" value="250"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="invtAnnualRate">Annual Return Rate (%)</label><input type="number" id="invtAnnualRate" value="8" step="0.1"></div>

        <div class="field"><label for="invtYears">Investment Horizon (Years)</label><input type="number" id="invtYears" value="15"></div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Estimated Future Balance</span>

      <div id="invtTotalDisplay" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">$ 0.00</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Total Contributed:</span><strong id="invtTotalContributed">$ 0.00</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:#38bdf8;">Compound Growth / Interest:</span><strong id="invtTotalInterest" style="color:#38bdf8;">$ 0.00</strong></div>

      </div>

      <div style="margin-top:12px;"><button type="button" class="btn small" id="invtCopyBtn">Copy Forecast</button></div>

    </div>

  </div>

</div>

"""



RETIREMENT_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field"><label for="retCurrentAge">Current Age</label><input type="number" id="retCurrentAge" value="32"></div>

        <div class="field"><label for="retRetireAge">Target Retirement Age</label><input type="number" id="retRetireAge" value="65"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field">

          <label for="retCurrentSavings">Current Savings</label>

          <div style="display:flex;gap:8px;"><select id="retCur" style="flex:0 0 75px;"><option value="$">$</option><option value="€">€</option><option value="£">£</option><option value="₹">₹</option></select><input type="number" id="retCurrentSavings" value="25000" style="flex:1;min-width:0;"></div>

        </div>

        <div class="field"><label for="retMonthlySavings">Monthly Savings</label><input type="number" id="retMonthlySavings" value="500"></div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="retReturnRate">Estimated Annual Return (%)</label>

        <input type="number" id="retReturnRate" value="7" step="0.5" placeholder="0">

        <span style="font-size:0.75rem;color:var(--muted);display:block;margin-top:3px;">Leave empty or 0% for linear principal contributions only ($36,000).</span>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Projected Retirement Nest Egg</span>

      <div id="retNestEggDisplay" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">$ 0</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;">

        <span style="font-size:0.85rem;color:var(--muted);">Estimated Sustainable Withdrawal:</span>

        <div id="retMonthlyIncomeDisplay" style="font-size:1.2rem;font-weight:700;color:#38bdf8;margin-top:4px;">$ 0 / month (4% Rule)</div>

      </div>

    </div>

  </div>

</div>

"""



ZAKAT_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field">

          <label for="zakatCash">Cash & Bank Balances</label>

          <div style="display:flex;gap:8px;"><select id="zakatCur" style="flex:0 0 75px;"><option value="$">$</option><option value="£">£</option><option value="€">€</option><option value="₹">₹</option></select><input type="number" id="zakatCash" value="8000" style="flex:1;min-width:0;"></div>

        </div>

        <div class="field"><label for="zakatGold">Gold & Silver Value</label><input type="number" id="zakatGold" value="3000"></div>

      </div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="zakatInvest">Investments & Shares</label><input type="number" id="zakatInvest" value="4000"></div>

        <div class="field"><label for="zakatDebts">Debts / Liabilities Due</label><input type="number" id="zakatDebts" value="1000"></div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="zakatNisab">Nisab Threshold (Silver / Gold Benchmark)</label>

        <input type="number" id="zakatNisab" value="500">

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Zakat Payable (2.5%)</span>

      <div id="zakatDueDisplay" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">$ 0.00</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Net Zakat-Eligible Wealth:</span><strong id="zakatTotalWealth">$ 0.00</strong></div>

        <p id="zakatStatusDisplay" style="margin:8px 0 0 0;font-size:0.85rem;font-weight:600;"></p>

      </div>

    </div>

  </div>

</div>

"""



ELECTRICITY_BILL_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field"><label for="elecWatts">Appliance Power (Watts)</label><input type="number" id="elecWatts" value="1500" min="1"></div>

        <div class="field"><label for="elecHoursPerDay">Usage (Hours / Day)</label><input type="number" id="elecHoursPerDay" value="4" min="0.1" max="24" step="0.5"></div>

      </div>

      <div class="field" style="margin-top:10px;">

        <label for="elecRatePerKwh">Electricity Rate per kWh</label>

        <div style="display:flex;gap:8px;"><select id="elecCur" style="flex:0 0 75px;"><option value="$">$</option><option value="€">€</option><option value="£">£</option><option value="₹">₹</option></select><input type="number" id="elecRatePerKwh" value="0.16" step="0.01" style="flex:1;min-width:0;"></div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Estimated Monthly Cost (30 Days)</span>

      <div id="elecMonthlyCost" style="font-size:2.4rem;font-weight:800;color:#10b981;margin:8px 0;">$ 0.00</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Daily Cost:</span><strong id="elecDailyCost">$ 0.00</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Daily Consumption:</span><strong id="elecDailyKwh" style="color:#38bdf8;">-- kWh</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Annual Cost:</span><strong id="elecYearlyCost">$ 0.00</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Monthly Energy Consumption:</span><strong id="elecMonthlyKwh" style="color:#38bdf8;">-- kWh</strong></div>

      </div>

    </div>

  </div>

</div>

"""



STATISTICS_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div>

      <div class="field">

        <label for="statInput">Enter Numbers (Separated by commas, spaces, or lines)</label>

        <textarea id="statInput" rows="7" placeholder="e.g. 10, 15, 20, 25, 30, 35..."></textarea>

      </div>

      <div style="margin-top:10px;display:flex;gap:8px;">

        <button type="button" class="btn primary" id="statCalcBtn">Calculate Statistics</button>

        <button type="button" class="btn ghost" id="statClearBtn">Clear</button>

      </div>

    </div>

    <div class="card-box" style="background:var(--surface);">

      <h4 style="margin:0 0 12px 0;">Statistical Summary</h4>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:0.9rem;">

        <div><span style="color:var(--muted);">Sample Size (N):</span> <strong id="statCount">--</strong></div>

        <div><span style="color:var(--muted);">Sum:</span> <strong id="statSum">--</strong></div>

        <div><span style="color:var(--muted);">Mean (Average):</span> <strong id="statMean" style="color:#10b981;">--</strong></div>

        <div><span style="color:var(--muted);">Median:</span> <strong id="statMedian" style="color:#38bdf8;">--</strong></div>

        <div><span style="color:var(--muted);">Mode:</span> <strong id="statMode">--</strong></div>

        <div><span style="color:var(--muted);">Sample Std Dev (s):</span> <strong id="statStdDev">--</strong></div>

        <div><span style="color:var(--muted);">Sample Variance (s²):</span> <strong id="statVariance">--</strong></div>

        <div><span style="color:var(--muted);">Pop. Std Dev (σ):</span> <strong id="statPopStdDev">--</strong></div>

        <div><span style="color:var(--muted);">Pop. Variance (σ²):</span> <strong id="statPopVariance">--</strong></div>

        <div><span style="color:var(--muted);">Range:</span> <strong id="statRange">--</strong></div>

        <div><span style="color:var(--muted);">Minimum:</span> <strong id="statMin">--</strong></div>

        <div><span style="color:var(--muted);">Maximum:</span> <strong id="statMax">--</strong></div>

        <div><span style="color:var(--muted);">First Quartile (Q1):</span> <strong id="statQ1">--</strong></div>

        <div><span style="color:var(--muted);">Third Quartile (Q3):</span> <strong id="statQ3">--</strong></div>

        <div><span style="color:var(--muted);">Interquartile Range:</span> <strong id="statIqr">--</strong></div>

      </div>

    </div>

  </div>

</div>

"""



NUMBER_TO_WORDS_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="numWordsInput">Enter Number</label>

        <input type="number" id="numWordsInput" value="1250.75" step="any" style="font-size:1.2rem;font-weight:700;">

      </div>

      <div class="grid2" style="margin-top:12px;">

        <div class="field">

          <label for="numWordsCurrency">Currency Format</label>

          <select id="numWordsCurrency"><option value="USD" selected>US Dollars ($)</option><option value="EUR">Euros (€)</option><option value="GBP">British Pounds (£)</option><option value="INR">Indian Rupees (₹)</option></select>

        </div>

        <div class="field">

          <label for="numWordsCase">Letter Case</label>

          <select id="numWordsCase"><option value="title" selected>Title Case</option><option value="upper">UPPERCASE</option><option value="lower">lowercase</option></select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">English Words</span>

      <div id="numWordsDisplay" style="font-size:1.4rem;font-weight:700;color:#10b981;margin:10px 0;line-height:1.4;">--</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <span style="font-size:0.8rem;color:var(--muted);">Check / Formal Format:</span>

        <div id="numWordsCheckDisplay" style="font-size:0.95rem;font-weight:600;color:#38bdf8;margin-top:4px;">--</div>

      </div>

      <div style="margin-top:12px;"><button type="button" class="btn small" id="numWordsCopyBtn">Copy Words</button></div>

    </div>

  </div>

</div>

"""



REACTION_TIME_WIDGET = """

<div class="tool-workspace">

  <div id="reactionBox" style="width:100%;min-height:300px;border-radius:12px;background:#3b82f6;color:#ffffff;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;padding:24px;box-sizing:border-box;box-shadow:0 6px 24px rgba(0,0,0,0.2);">

    <h2 id="reactionMsg" style="font-size:2.4rem;margin:0;font-weight:800;">Click to Start</h2>

    <p id="reactionSub" style="font-size:1.1rem;margin:10px 0 0 0;opacity:0.9;">When red turns GREEN, click as fast as you can!</p>

  </div>

  <div class="card-box" style="margin-top:16px;">

    <h4 style="margin:0 0 8px 0;">Reaction Time History</h4>

    <div id="reactionHistory" style="max-height:150px;overflow-y:auto;font-size:0.9rem;"></div>

  </div>

</div>

"""



CLICK_SPEED_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div>

      <div id="cpsClickArea" style="width:100%;min-height:260px;background:#10b981;color:#ffffff;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;user-select:none;padding:20px;box-sizing:border-box;box-shadow:0 6px 20px rgba(16,185,129,0.3);">

        <h2 style="font-size:2.2rem;margin:0;font-weight:800;">CLICK HERE</h2>

        <span style="font-size:1rem;margin-top:6px;opacity:0.9;">Click as fast as possible!</span>

      </div>

      <div style="margin-top:12px;display:flex;gap:10px;align-items:center;">

        <select id="cpsDurationSelect" style="width:160px;">

          <option value="1">1 Second Test</option>

          <option value="5" selected>5 Seconds Test</option>

          <option value="10">10 Seconds Test</option>

          <option value="30">30 Seconds Test</option>

        </select>

        <button type="button" class="btn ghost" id="cpsRestartBtn">Reset</button>

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);text-align:center;">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Time Remaining</span>

      <div id="cpsTimerDisplay" style="font-size:2.5rem;font-weight:800;color:#f59e0b;margin:4px 0;">5s</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:10px;">

        <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Clicks</span>

        <div id="cpsScoreDisplay" style="font-size:2.8rem;font-weight:800;color:#38bdf8;margin:4px 0;">0</div>

        <div id="cpsCurrentCps" style="font-size:1.2rem;font-weight:700;color:#10b981;margin-top:4px;">0.0 CPS</div>

      </div>

    </div>

  </div>

</div>

"""



PASSWORD_STRENGTH_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:580px;margin:0 auto;padding:24px;">

    <div class="field">

      <label for="pwStrengthInput">Enter Password to Analyze</label>

      <div style="display:flex;gap:8px;">

        <input type="password" id="pwStrengthInput" placeholder="Type password..." style="font-size:1.1rem;flex:1;">

        <button type="button" class="btn ghost" id="pwToggleVisibility">👁 Show</button>

      </div>

    </div>

    <div style="margin-top:14px;">

      <div style="height:10px;background:var(--border,#333);border-radius:5px;overflow:hidden;">

        <div id="pwStrengthBar" style="height:100%;width:0%;transition:all 0.3s;background:#ef4444;"></div>

      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">

        <strong id="pwStrengthLabel" style="font-size:1.1rem;color:#ef4444;">Too Short</strong>

        <span id="pwEntropyBits" style="font-size:0.9rem;font-family:monospace;color:var(--muted);">0 bits</span>

      </div>

    </div>

    <div style="border-top:1px solid var(--border,#333);margin-top:16px;padding-top:14px;">

      <span style="font-size:0.85rem;color:var(--muted);">Estimated Brute Force Crack Time:</span>

      <div id="pwCrackTime" style="font-size:1.3rem;font-weight:700;color:#10b981;margin:4px 0 14px 0;">Instant</div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:0.85rem;">

        <div id="pwCheckLen">● At least 12 characters</div>

        <div id="pwCheckUpper">● Uppercase letters (A-Z)</div>

        <div id="pwCheckLower">● Lowercase letters (a-z)</div>

        <div id="pwCheckNum">● Numbers (0-9)</div>

        <div id="pwCheckSym">● Special symbols (!@#$)</div>

      </div>

    </div>

  </div>

</div>

"""



RANDOM_NAME_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field"><label for="nameGenderSelect">Gender</label><select id="nameGenderSelect"><option value="both" selected>Any / Both Genders</option><option value="male">Male</option><option value="female">Female</option></select></div>

      <div class="field" style="margin-top:10px;"><label for="nameStyleSelect">Origin / Style</label><select id="nameStyleSelect"><option value="all" selected>All Origins / Global</option><option value="anglo">English / American</option><option value="euro">European</option><option value="asian">Asian</option><option value="hispanic">Hispanic</option></select></div>

      <div class="field" style="margin-top:10px;"><label for="nameCountInput">Quantity of Names</label><input type="number" id="nameCountInput" value="8" min="1" max="50"></div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="nameGenerateBtn">Generate Names</button></div>

    </div>

    <div class="card-box" style="background:var(--surface);">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">

        <h4 style="margin:0;">Generated Personas</h4>

        <button type="button" class="btn small" id="nameCopyBtn">Copy List</button>

      </div>

      <div id="nameResultsList"></div>

    </div>

  </div>

</div>

"""



LOVE_CALC_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:520px;margin:0 auto;text-align:center;padding:28px;">

    <div class="grid2" style="text-align:left;">

      <div class="field"><label for="loveName1">Your Name</label><input type="text" id="loveName1" placeholder="First Name"></div>

      <div class="field"><label for="loveName2">Partner / Crush Name</label><input type="text" id="loveName2" placeholder="Second Name"></div>

    </div>

    <div style="margin-top:16px;"><button type="button" class="btn primary" id="loveCalcBtn" style="padding:10px 28px;font-weight:700;">💖 Calculate Love Match</button></div>

    <div style="margin-top:24px;border-top:1px solid var(--border,#333);padding-top:16px;">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Compatibility Score</span>

      <div id="loveScoreDisplay" style="font-size:3.5rem;font-weight:800;color:#ec4899;margin:8px 0;">--%</div>

      <p id="loveMessageDisplay" style="font-size:1.05rem;font-weight:600;color:var(--fg);margin:0;"></p>

    </div>

  </div>

</div>

"""



TEXT_REPEATER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field"><label for="repTextInput">Text to Repeat</label><textarea id="repTextInput" rows="5" placeholder="Enter text to multiply..."></textarea></div>

      <div class="grid2" style="margin-top:10px;">

        <div class="field"><label for="repCountInput">Repetitions</label><input type="number" id="repCountInput" value="20" min="1" max="10000"></div>

        <div class="field">

          <label for="repSeparator">Separator</label>

          <select id="repSeparator"><option value="newline" selected>New Line</option><option value="space">Space</option><option value="comma">Comma (, )</option><option value="none">None</option></select>

        </div>

      </div>

      <div style="margin-top:14px;display:flex;gap:8px;">

        <button type="button" class="btn primary" id="repRepeatBtn">Repeat Text</button>

        <button type="button" class="btn ghost" id="repClearBtn">Clear</button>

      </div>

    </div>

    <div class="field">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

        <label for="repOutput" style="margin:0;">Repeated Result</label>

        <button type="button" class="btn small" id="repCopyBtn">Copy Text</button>

      </div>

      <textarea id="repOutput" rows="14" readonly style="font-family:monospace;font-size:0.85rem;"></textarea>

    </div>

  </div>

</div>

"""



ALARM_CLOCK_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:500px;margin:0 auto;text-align:center;padding:28px;">

    <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Current Time</span>

    <div id="alarmCurrentClock" style="font-size:3.5rem;font-weight:800;color:#10b981;font-family:monospace;letter-spacing:2px;margin:8px 0 16px 0;">--:--:--</div>

    <div class="grid2" style="text-align:left;">

      <div class="field"><label for="alarmTimeInput">Set Alarm Time</label><input type="time" id="alarmTimeInput" style="font-size:1.2rem;font-weight:700;"></div>

      <div class="field"><label for="alarmLabelInput">Alarm Label</label><input type="text" id="alarmLabelInput" value="Wake Up"></div>

    </div>

    <div style="margin-top:16px;display:flex;justify-content:center;gap:10px;">

      <button type="button" class="btn primary" id="alarmSetBtn">Set Alarm</button>

      <button type="button" class="btn ghost" id="alarmTestBtn">Test Audio</button>

      <button type="button" class="btn" id="alarmStopBtn" style="display:none;background:#ef4444;color:#fff;">Stop Ringing Alarm</button>

    </div>

    <p id="alarmStatusText" style="margin-top:14px;font-size:0.9rem;color:var(--muted);"></p>

  </div>

</div>

"""



METRONOME_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:480px;margin:0 auto;text-align:center;padding:28px;">

    <div id="metroVisualDot" style="width:24px;height:24px;border-radius:50%;background:var(--muted);margin:0 auto 16px auto;transition:all 0.08s;"></div>

    <div id="metroBpmDisplay" style="font-size:3.8rem;font-weight:800;color:#10b981;font-family:monospace;margin-bottom:8px;">120 BPM</div>

    <div style="display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;">

      <button type="button" class="btn ghost small" id="metroDecreaseBtn" style="font-size:1.2rem;width:40px;">−</button>

      <input type="range" id="metroBpmSlider" min="30" max="250" value="120" style="flex:1;max-width:260px;">

      <button type="button" class="btn ghost small" id="metroIncreaseBtn" style="font-size:1.2rem;width:40px;">+</button>

    </div>

    <div class="field" style="max-width:200px;margin:0 auto 16px auto;text-align:left;">

      <label for="metroBeatsSelect">Time Signature</label>

      <select id="metroBeatsSelect"><option value="4" selected>4/4 (Common Time)</option><option value="3">3/4 (Waltz)</option><option value="2">2/4</option><option value="6">6/8</option></select>

    </div>

    <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">

      <button type="button" class="btn primary" id="metroStartStopBtn" style="padding:12px 28px;font-size:1.1rem;font-weight:700;">Start Metronome</button>

      <button type="button" class="btn ghost" id="metroTapBtn" style="padding:12px 24px;font-size:1.1rem;font-weight:700;">🥁 Tap Tempo</button>

    </div>

  </div>

</div>

"""



VOICE_RECORDER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:620px;margin:0 auto;text-align:center;padding:28px;">

    <div id="recTimerDisplay" style="font-size:3.5rem;font-weight:800;color:var(--ink);font-family:monospace;letter-spacing:2px;margin-bottom:8px;">00:00</div>

    <p id="recStatusText" style="color:var(--muted);font-size:0.95rem;margin:0 0 16px 0;">Click Start Recording to record audio directly from your microphone.</p>

    <div style="background:var(--surface);padding:8px;border:1.5px solid var(--line);border-radius:10px;margin-bottom:20px;">

      <canvas id="recWaveform" width="560" height="70" style="width:100%;height:70px;border-radius:6px;display:block;"></canvas>

    </div>

    <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;">

      <button type="button" class="btn primary" id="recStartBtn" style="padding:12px 28px;font-size:1.05rem;background:#ef4444;border-color:#ef4444;color:#fff;">🎙️ Start Recording</button>

      <button type="button" class="btn" id="recStopBtn" disabled style="padding:12px 28px;font-size:1.05rem;background:#3b82f6;border-color:#3b82f6;color:#fff;opacity:0.4;cursor:not-allowed;">⏹️ Stop Recording</button>

      <button type="button" class="btn btn-primary" id="recDownloadBtn" disabled style="padding:12px 28px;font-size:1.05rem;background:#0d9488;border-color:#0d9488;color:#fff;opacity:0.4;cursor:not-allowed;">💾 Download Audio</button>

    </div>

    <audio id="recAudioPlayer" controls style="width:100%;margin-top:24px;opacity:0.5;" disabled></audio>

  </div>

</div>"""



SCREEN_RECORDER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:640px;margin:0 auto;text-align:center;padding:28px;">

    <div id="scrTimerDisplay" style="font-size:3.5rem;font-weight:800;color:var(--ink);font-family:monospace;letter-spacing:2px;margin-bottom:8px;">00:00</div>

    <p id="scrStatusText" style="font-size:0.95rem;color:var(--muted);margin:0 0 16px 0;">Capture full monitor, window, or specific browser tab. Zero software install.</p>

    <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-bottom:16px;">

      <button type="button" class="btn primary" id="scrStartBtn" style="padding:12px 28px;font-weight:700;">📹 Start Screen Recording</button>

      <button type="button" class="btn" id="scrStopBtn" disabled style="padding:12px 28px;background:#ef4444;border-color:#ef4444;color:#fff;opacity:0.4;cursor:not-allowed;">⏹️ Stop Recording</button>

      <button type="button" class="btn btn-primary" id="scrDownloadBtn" disabled style="padding:12px 28px;background:#0d9488;border-color:#0d9488;color:#fff;opacity:0.4;cursor:not-allowed;">💾 Download Video</button>

    </div>

    <video id="scrVideoPreview" controls style="width:100%;max-height:360px;margin-top:16px;border-radius:8px;background:#000;opacity:0.5;" disabled></video>

  </div>

</div>"""



TONE_GENERATOR_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="max-width:540px;margin:0 auto;padding:24px;">

    <div class="grid2">

      <div class="field">

        <label for="toneWaveSelect">Waveform</label>

        <select id="toneWaveSelect"><option value="sine" selected>Sine Wave (Smooth)</option><option value="square">Square Wave (Retro / Rich)</option><option value="sawtooth">Sawtooth Wave (Buzzy)</option><option value="triangle">Triangle Wave (Mellow)</option></select>

      </div>

      <div class="field">

        <label for="toneFreqInput">Frequency (Hz)</label>

        <input type="number" id="toneFreqInput" value="440" min="20" max="20000" style="font-size:1.1rem;font-weight:700;">

      </div>

    </div>

    <div class="field" style="margin-top:12px;">

      <label for="toneFreqSlider">Frequency Slider</label>

      <input type="range" id="toneFreqSlider" min="20" max="2000" value="440" style="width:100%;">

      <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">

        <button type="button" class="btn ghost small tone-preset-btn" data-hz="261.63">C4 (261.6 Hz)</button>

        <button type="button" class="btn ghost small tone-preset-btn" data-hz="440">A4 Concert (440 Hz)</button>

        <button type="button" class="btn ghost small tone-preset-btn" data-hz="528">528 Hz (Solfeggio)</button>

        <button type="button" class="btn ghost small tone-preset-btn" data-hz="1000">1000 Hz (Test Tone)</button>

      </div>

    </div>

    <div class="field" style="margin-top:12px;">

      <label for="toneVolSlider">Volume</label>

      <input type="range" id="toneVolSlider" min="0" max="1" step="0.05" value="0.2">

    </div>

    <div style="margin-top:16px;text-align:center;"><button type="button" class="btn primary" id="tonePlayBtn" style="padding:12px 32px;font-size:1.1rem;font-weight:700;">Play Tone</button></div>

  </div>

</div>

"""



AUDIO_CUTTER_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="audioCutDrop">

    <input type="file" id="audioCutFile" accept="audio/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>

    </div>

    <strong>Drop audio file here or click to browse</strong>

    <span>Trim MP3, WAV, or AAC audio in browser memory with visual waveform visualizer.</span>

    <span class="drop-browse-btn">Select Audio File</span>

  </label>

  <div id="audioCutWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;padding:20px;">

      <h4 style="margin:0 0 10px 0;font-size:0.95rem;">Interactive Audio Waveform</h4>

      <div style="background:var(--surface);padding:10px;border:1px solid var(--border,#333);border-radius:8px;margin-bottom:14px;">

        <canvas id="audioWaveformCanvas" width="600" height="120" style="width:100%;height:120px;border-radius:6px;display:block;"></canvas>

      </div>



      <div style="margin-bottom:16px;">

        <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:0.85rem;font-weight:600;">

          <span>Start Slice Position</span>

          <span>End Slice Position</span>

        </div>

        <div style="display:flex;gap:12px;align-items:center;">

          <input type="range" id="audioCutStartSlider" min="0" max="100" value="0" step="0.1" style="flex:1;">

          <input type="range" id="audioCutEndSlider" min="0" max="100" value="100" step="0.1" style="flex:1;">

        </div>

      </div>



      <div class="grid2">

        <div class="field"><label for="audioCutStart">Start Cut (Seconds)</label><input type="number" id="audioCutStart" value="0" min="0" step="0.01"></div>

        <div class="field"><label for="audioCutEnd">End Cut (Seconds)</label><input type="number" id="audioCutEnd" value="30" min="0.1" step="0.01"></div>

      </div>



      <div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">

        <button type="button" class="btn ghost sm" id="audioCutPreviewBtn">▶ Preview Selection</button>

        <button type="button" class="btn primary sm" id="audioCutProcessBtn">Trim & Download Audio</button>

        <button type="button" class="btn btn-primary sm" id="audioCutDownloadBtn" style="display:none;background:#0d9488;color:#fff;">Download WAV</button>

      </div>

      <p id="audioCutStatus" style="font-size:0.9rem;margin-top:12px;font-weight:600;color:var(--primary);"></p>

    </div>

  </div>

</div>

"""



WEBP_TO_PNG_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="w2pDrop">

    <input type="file" id="w2pFile" accept="image/webp,.webp">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="8" r="2"/><path d="M21 15l-5-5L5 21"/></svg>

    </div>

    <strong>Drop WebP image here or click to browse</strong>

    <span>Convert WebP images to lossless PNG format with transparency preserved.</span>

    <span class="drop-browse-btn">Select WebP File</span>

  </label>

  <div id="w2pWorkspace" style="display:none;">

    <div class="card-box" style="text-align:center;padding:20px;">

      <img id="w2pPreview" style="max-width:100%;max-height:360px;border-radius:6px;box-shadow:0 4px 14px rgba(0,0,0,0.15);margin-bottom:14px;" alt="PNG Output">

      <div id="w2pInfo" style="font-size:0.9rem;color:var(--muted);margin-bottom:14px;"></div>

      <div style="display:flex;justify-content:center;gap:10px;">

        <button type="button" class="btn primary" id="w2pDownloadBtn">Download PNG</button>

        <button type="button" class="btn ghost" id="w2pResetBtn">Convert Another</button>

      </div>

    </div>

  </div>

</div>

"""



MERGE_IMAGES_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="mergeImgDrop">

    <input type="file" id="mergeImgFile" multiple accept="image/*">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><line x1="12" y1="3" x2="12" y2="21"/></svg>

    </div>

    <strong>Drop multiple images to combine into one</strong>

    <span>Stitch photos vertically or horizontally into a single composite image.</span>

    <span class="drop-browse-btn">Choose 2 or More Images</span>

  </label>

  <div id="mergeImgWorkspace" style="display:none;">

    <div class="card-box" style="margin-bottom:14px;">

      <div class="grid3">

        <div class="field">

          <label for="mergeImgDirection">Alignment Direction</label>

          <select id="mergeImgDirection"><option value="vertical" selected>Vertical (Stacked on top)</option><option value="horizontal">Horizontal (Side-by-side)</option></select>

        </div>

        <div class="field"><label for="mergeImgSpacing">Spacing / Margin (px)</label><input type="number" id="mergeImgSpacing" value="12" min="0" max="100"></div>

        <div class="field">

          <label for="mergeImgBg">Background Color</label>

          <select id="mergeImgBg"><option value="#ffffff" selected>Solid White</option><option value="#000000">Solid Black</option><option value="transparent">Transparent</option></select>

        </div>

      </div>

      <div style="margin-top:12px;display:flex;gap:10px;align-items:center;">

        <button type="button" class="btn primary" id="mergeImgProcessBtn">Update Stitching</button>

        <button type="button" class="btn" id="mergeImgDownloadBtn" style="display:none;background:#10b981;color:#fff;">Download Merged Image</button>

      </div>

      <p id="mergeImgStatus" style="font-size:0.9rem;margin-top:8px;font-weight:600;"></p>

    </div>

    <div class="card-box" style="text-align:center;overflow:auto;max-height:480px;padding:16px;">

      <canvas id="mergeImgCanvas" style="max-width:100%;height:auto;border-radius:4px;box-shadow:0 4px 14px rgba(0,0,0,0.15);"></canvas>

    </div>

  </div>

</div>

"""



COLOR_CONTRAST_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="grid2">

        <div class="field">

          <label for="contrastFgColor">Text Color</label>

          <div style="display:flex;gap:8px;"><input type="color" id="contrastFgColor" value="#10b981" style="height:38px;width:50px;cursor:pointer;"><input type="text" id="contrastFgHex" value="#10B981" style="flex:1;font-family:monospace;"></div>

        </div>

        <div class="field">

          <label for="contrastBgColor">Background Color</label>

          <div style="display:flex;gap:8px;"><input type="color" id="contrastBgColor" value="#18181b" style="height:38px;width:50px;cursor:pointer;"><input type="text" id="contrastBgHex" value="#18181B" style="flex:1;font-family:monospace;"></div>

        </div>

      </div>

      <div style="margin-top:12px;"><button type="button" class="btn ghost small" id="contrastSwapBtn">⇄ Swap Colors</button></div>

      <div id="contrastPreviewBox" style="margin-top:16px;padding:24px;border-radius:8px;text-align:center;border:1px solid var(--border,#333);font-size:1.1rem;font-weight:600;">

        The quick brown fox jumps over the lazy dog.

      </div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">WCAG Contrast Ratio</span>

      <div id="contrastRatioDisplay" style="font-size:3rem;font-weight:800;color:#10b981;margin:8px 0;">-- : 1</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:12px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--muted);">WCAG AA Normal Text (≥ 4.5:1):</span><span id="contrastAaNormal">--</span></div>

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--muted);">WCAG AA Large Text (≥ 3:1):</span><span id="contrastAaLarge">--</span></div>

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--muted);">WCAG AAA Normal Text (≥ 7:1):</span><span id="contrastAaaNormal">--</span></div>

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span style="color:var(--muted);">WCAG AAA Large Text (≥ 4.5:1):</span><span id="contrastAaaLarge">--</span></div>

      </div>

    </div>

  </div>

</div>

"""



COLOR_PALETTE_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px;">

    <div><button type="button" class="btn primary" id="paletteGenerateBtn">✨ Generate New Palette</button><span style="margin-left:8px;font-size:0.85rem;color:var(--muted);">(or press Spacebar)</span></div>

    <button type="button" class="btn small" id="paletteCopyAllBtn">Copy All Hex Codes</button>

  </div>

  <div id="paletteContainer" style="display:flex;gap:12px;flex-wrap:wrap;min-height:220px;"></div>

</div>

"""



PERIOD_TRACKER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="periodLastDate">First Day of Last Period</label>

        <input type="date" id="periodLastDate" style="font-size:1.1rem;font-weight:600;">

      </div>

      <div class="grid2" style="margin-top:12px;">

        <div class="field"><label for="periodCycleLength">Cycle Length (Days)</label><input type="number" id="periodCycleLength" value="28" min="21" max="45"></div>

        <div class="field"><label for="periodDaysLength">Period Duration (Days)</label><input type="number" id="periodDaysLength" value="5" min="2" max="10"></div>

      </div>

      <div style="margin-top:14px;"><button type="button" class="btn primary" id="periodCalcBtn">Calculate Cycle Dates</button></div>

    </div>

    <div class="card-box" style="display:flex;flex-direction:column;justify-content:center;background:var(--surface);">

      <span style="font-size:0.85rem;color:var(--muted);text-transform:uppercase;">Next Predicted Period</span>

      <div id="periodNextDateDisplay" style="font-size:2rem;font-weight:800;color:#ec4899;margin:8px 0;">--</div>

      <div style="border-top:1px solid var(--border,#333);padding-top:10px;margin-top:8px;">

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Estimated Ovulation:</span><strong id="periodOvulationDate">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Fertile Window:</span><strong id="periodFertileWindow" style="color:#38bdf8;">--</strong></div>

        <div style="display:flex;justify-content:space-between;padding:3px 0;"><span style="color:var(--muted);">Status:</span><strong id="periodDaysUntil">--</strong></div>

      </div>

    </div>

  </div>

</div>

"""





POWER_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="pwrVal">Enter Power Value</label>

        <input type="number" id="pwrVal" value="10" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="pwrFrom">From Unit</label>

          <select id="pwrFrom" class="field">

            <option value="kw" selected>Kilowatts (kW)</option>

            <option value="w">Watts (W)</option>

            <option value="mw">Megawatts (MW)</option>

            <option value="hp">Mechanical Horsepower (hp)</option>

            <option value="ps">Metric Horsepower (PS)</option>

            <option value="btuh">BTU/hour (Btu/h)</option>

            <option value="ftlbs">Foot-Pounds/sec (ft-lb/s)</option>

            <option value="cals">Calories/sec (cal/s)</option>

          </select>

        </div>

        <button type="button" class="btn ghost" id="pwrSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="pwrTo">To Unit</label>

          <select id="pwrTo" class="field">

            <option value="hp" selected>Mechanical Horsepower (hp)</option>

            <option value="w">Watts (W)</option>

            <option value="kw">Kilowatts (kW)</option>

            <option value="mw">Megawatts (MW)</option>

            <option value="ps">Metric Horsepower (PS)</option>

            <option value="btuh">BTU/hour (Btu/h)</option>

            <option value="ftlbs">Foot-Pounds/sec (ft-lb/s)</option>

            <option value="cals">Calories/sec (cal/s)</option>

          </select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Converted Result</span>

      <div id="pwrResult" style="font-size:2.4rem; font-weight:800; color:#10b981; margin:8px 0;">13.41 hp</div>

      <div style="border-top:1px solid var(--border,#333); padding-top:10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">

        <span id="pwrFormula" style="font-size:0.85rem; color:var(--muted);">Multiply Kilowatts by 1.34102 to get Mechanical Horsepower</span>

        <button type="button" class="btn ghost small" id="pwrCopyBtn" style="padding:3px 10px; font-size:12px;">Copy</button>

      </div>

    </div>

  </div>

  <div style="margin-top:24px;">

    <h3 style="font-size:1.1rem; margin-bottom:12px;">Power Conversion Comparison Table</h3>

    <div style="overflow-x:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:2px solid var(--border,#333); color:var(--muted); text-align:left;">

            <th style="padding:8px 10px;">Unit</th>

            <th style="padding:8px 10px;">Equivalent Value</th>

          </tr>

        </thead>

        <tbody id="pwrAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""



FREQUENCY_CONVERTER_WIDGET = """

<div class="tool-workspace">

  <div class="grid2">

    <div class="card-box">

      <div class="field">

        <label for="freqVal">Enter Frequency Value</label>

        <input type="number" id="freqVal" value="1000" step="any" style="font-size:1.1rem; font-weight:600;">

      </div>

      <div style="display:flex; gap:10px; align-items:flex-end; margin-top:12px;">

        <div class="field" style="flex:1; margin:0;">

          <label for="freqFrom">From Unit</label>

          <select id="freqFrom" class="field">

            <option value="khz" selected>Kilohertz (kHz)</option>

            <option value="hz">Hertz (Hz)</option>

            <option value="mhz">Megahertz (MHz)</option>

            <option value="ghz">Gigahertz (GHz)</option>

            <option value="thz">Terahertz (THz)</option>

            <option value="rpm">Revolutions/Min (RPM)</option>

            <option value="rads">Radians/sec (rad/s)</option>

            <option value="degs">Degrees/sec (°/s)</option>

          </select>

        </div>

        <button type="button" class="btn ghost" id="freqSwap" title="Swap units" style="padding:10px 14px; margin-bottom:2px;">⇄</button>

        <div class="field" style="flex:1; margin:0;">

          <label for="freqTo">To Unit</label>

          <select id="freqTo" class="field">

            <option value="hz" selected>Hertz (Hz)</option>

            <option value="khz">Kilohertz (kHz)</option>

            <option value="mhz">Megahertz (MHz)</option>

            <option value="ghz">Gigahertz (GHz)</option>

            <option value="thz">Terahertz (THz)</option>

            <option value="rpm">Revolutions/Min (RPM)</option>

            <option value="rads">Radians/sec (rad/s)</option>

            <option value="degs">Degrees/sec (°/s)</option>

          </select>

        </div>

      </div>

    </div>

    <div class="card-box" style="display:flex; flex-direction:column; justify-content:center; background:var(--surface);">

      <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase;">Converted Result</span>

      <div id="freqResult" style="font-size:2.4rem; font-weight:800; color:#10b981; margin:8px 0;">1,000,000 Hz</div>

      <div style="border-top:1px solid var(--border,#333); padding-top:10px; margin-top:8px; display:flex; justify-content:space-between; align-items:center;">

        <span id="freqFormula" style="font-size:0.85rem; color:var(--muted);">Multiply Kilohertz by 1,000 to get Hertz</span>

        <button type="button" class="btn ghost small" id="freqCopyBtn" style="padding:3px 10px; font-size:12px;">Copy</button>

      </div>

    </div>

  </div>

  <div style="margin-top:24px;">

    <h3 style="font-size:1.1rem; margin-bottom:12px;">Frequency Conversion Comparison Table</h3>

    <div style="overflow-x:auto;">

      <table style="width:100%; border-collapse:collapse; font-size:0.9rem;">

        <thead>

          <tr style="border-bottom:2px solid var(--border,#333); color:var(--muted); text-align:left;">

            <th style="padding:8px 10px;">Unit</th>

            <th style="padding:8px 10px;">Equivalent Value</th>

          </tr>

        </thead>

        <tbody id="freqAllTable"></tbody>

      </table>

    </div>

  </div>

</div>

"""





GIF_MAKER_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <label class="drop" id="gifDropZone">

      <input type="file" id="gifFileInput" multiple accept="image/png,image/jpeg,image/webp,image/gif">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/>

          <path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4M10 12l4-2.5v5L10 12z"/>

        </svg>

      </div>

      <strong>Drop multiple photos or images here, or click to browse</strong>

      <span>Supports JPG, PNG, and WebP frames. Frames combine into an animated GIF.</span>

      <span class="drop-browse-btn">Select Frames</span>

    </label>

    <div style="margin-top:16px;">

      <h4 style="font-size:0.95rem; margin-bottom:8px;">Frame Sequence:</h4>

      <div id="gifFrameList" style="display:flex; gap:10px; flex-wrap:wrap; min-height:80px; padding:10px; background:var(--surface); border:1px dashed var(--border,#333); border-radius:8px;">

        <span style="color:var(--muted); font-size:0.85rem; align-self:center;">No frames loaded yet. Upload 2 or more images above.</span>

      </div>

    </div>

    <div class="grid3" style="align-items:end; margin-top:16px;">

      <div class="field" style="margin:0;">

        <label for="gifDelayInput">Frame Delay: <span id="gifDelayVal" style="font-weight:700; color:#10b981;">300 ms</span></label>

        <input type="range" id="gifDelayInput" min="50" max="1500" value="300" step="25">

      </div>

      <div class="field" style="margin:0;">

        <label for="gifWidthSelect">Output Width</label>

        <select id="gifWidthSelect" class="field">

          <option value="320">320 px (Small / Fast)</option>

          <option value="480" selected>480 px (Medium / Standard)</option>

          <option value="640">640 px (Large / Crisp)</option>

        </select>

      </div>

      <button type="button" class="btn" id="gifGenerateBtn" disabled style="padding:10px 16px;">Upload at least 2 frames</button>

    </div>

  </div>

  <div id="gifOutputContainer" class="card-box" style="display:none; text-align:center; padding:20px; background:var(--surface);">

    <h3 style="font-size:1.1rem; margin-bottom:12px;">Animated GIF Ready</h3>

    <div style="margin:12px auto; max-width:500px; border-radius:8px; overflow:hidden; border:1px solid var(--border,#333); background:#000;">

      <img id="gifResultImg" src="" alt="Generated Animated GIF" style="max-width:100%; display:block; margin:0 auto;">

    </div>

    <p id="gifResultMeta" style="font-size:0.85rem; color:var(--muted); margin:8px 0 16px;"></p>

    <button type="button" class="btn" id="gifDownloadBtn">Download Animated GIF</button>

  </div>

</div>

"""



EQUATION_SOLVER_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">

    <div class="tt-tabs" role="tablist" style="display:flex; gap:6px;">

      <button type="button" class="btn active" id="eqTabQuad" data-mode="quad" role="tab" aria-selected="true">Quadratic Equation</button>

      <button type="button" class="btn ghost" id="eqTabLin" data-mode="lin" role="tab" aria-selected="false">Linear Equation</button>

      <button type="button" class="btn ghost" id="eqTabSys" data-mode="sys" role="tab" aria-selected="false">2x2 Linear System</button>

    </div>

  </div>



  <div class="card-box" style="margin-bottom:16px;">

    <!-- Quadratic Section -->

    <div id="eqSecQuad">

      <p style="font-size:0.95rem; margin-bottom:12px; color:var(--muted);">Standard Quadratic Form: <b>ax² + bx + c = 0</b></p>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:1.1rem; font-weight:700;">

        <input type="number" id="quadA" class="field eq-input" value="1" step="any" style="width:75px; text-align:center;">

        <span>x² +</span>

        <input type="number" id="quadB" class="field eq-input" value="-5" step="any" style="width:75px; text-align:center;">

        <span>x +</span>

        <input type="number" id="quadC" class="field eq-input" value="6" step="any" style="width:75px; text-align:center;">

        <span>= 0</span>

      </div>

    </div>



    <!-- Linear Section -->

    <div id="eqSecLin" style="display:none;">

      <p style="font-size:0.95rem; margin-bottom:12px; color:var(--muted);">Linear Form: <b>ax + b = c</b></p>

      <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:1.1rem; font-weight:700;">

        <input type="number" id="linA" class="field eq-input" value="3" step="any" style="width:75px; text-align:center;">

        <span>x +</span>

        <input type="number" id="linB" class="field eq-input" value="5" step="any" style="width:75px; text-align:center;">

        <span>=</span>

        <input type="number" id="linC" class="field eq-input" value="20" step="any" style="width:75px; text-align:center;">

      </div>

    </div>



    <!-- 2x2 System Section -->

    <div id="eqSecSys" style="display:none;">

      <p style="font-size:0.95rem; margin-bottom:12px; color:var(--muted);">2x2 Linear System: <b>a₁x + b₁y = c₁</b> and <b>a₂x + b₂y = c₂</b></p>

      <div style="display:flex; flex-direction:column; gap:10px;">

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:1.1rem; font-weight:700;">

          <input type="number" id="sysA1" class="field eq-input" value="2" step="any" style="width:70px; text-align:center;">

          <span>x +</span>

          <input type="number" id="sysB1" class="field eq-input" value="3" step="any" style="width:70px; text-align:center;">

          <span>y =</span>

          <input type="number" id="sysC1" class="field eq-input" value="13" step="any" style="width:70px; text-align:center;">

        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; font-size:1.1rem; font-weight:700;">

          <input type="number" id="sysA2" class="field eq-input" value="1" step="any" style="width:70px; text-align:center;">

          <span>x -</span>

          <input type="number" id="sysB2" class="field eq-input" value="-1" step="any" style="width:70px; text-align:center;">

          <span>y =</span>

          <input type="number" id="sysC2" class="field eq-input" value="1" step="any" style="width:70px; text-align:center;">

        </div>

      </div>

    </div>

  </div>



  <div id="eqResultBox" class="card-box" style="background:var(--surface); padding:20px;">

    <span style="font-size:0.85rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.05em;">Calculated Solution</span>

    <div id="eqSolutionSummary" style="font-size:1.6rem; font-weight:800; color:#10b981; margin:8px 0 16px;"></div>

    <div style="border-top:1px solid var(--border,#333); padding-top:14px;">

      <h4 style="font-size:0.95rem; margin-bottom:8px;">Step-by-Step Mathematical Derivation:</h4>

      <ol id="eqStepList" style="padding-left:20px; font-size:0.9rem; line-height:1.6; color:var(--ink-secondary);"></ol>

    </div>

  </div>

</div>

"""



FILE_INFO_WIDGET = """

<div class="tool-workspace">

  <label class="drop" id="fiFileDrop">

    <input type="file" id="fiFileInput">

    <div class="drop-icon-box" aria-hidden="true">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>

    </div>

    <strong>Drop any file here or click to browse</strong>

    <span>Inspect exact byte size, MIME type, SHA-256 hash, and binary hex dump.</span>

    <span class="drop-browse-btn">Choose File</span>

  </label>

  <div id="fiResults" class="card-box" style="display:none;margin-top:16px;">

    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">

      <h3 style="margin:0;font-size:1.1rem;">File Details & Metadata</h3>

      <div style="display:flex;gap:8px;">

        <button type="button" class="btn ghost sm" id="fiCopyHashBtn">Copy Hash</button>

        <button type="button" class="btn ghost sm" id="fiCopySummaryBtn">Copy Summary</button>

      </div>

    </div>

    <table style="width:100%;border-collapse:collapse;font-size:0.9rem;margin-bottom:16px;">

      <tbody>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;width:150px;">File Name</td><td style="padding:8px;" id="fiName"></td></tr>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;">Extension</td><td style="padding:8px;" id="fiExt"></td></tr>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;">Exact Size</td><td style="padding:8px;" id="fiSizeBytes"></td></tr>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;">Human Size</td><td style="padding:8px;" id="fiSizeFmt"></td></tr>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;">MIME Type</td><td style="padding:8px;" id="fiType"></td></tr>

        <tr style="border-bottom:1px solid var(--border);"><td style="padding:8px;font-weight:600;">Last Modified</td><td style="padding:8px;" id="fiDate"></td></tr>

        <tr><td style="padding:8px;font-weight:600;">SHA-256 Hash</td><td style="padding:8px;font-family:monospace;word-break:break-all;" id="fiSha256"></td></tr>

      </tbody>

    </table>

    <h4 style="margin:0 0 8px 0;font-size:0.95rem;">First 64 Bytes Hex & ASCII Dump</h4>

    <pre id="fiHexDump" style="background:var(--bg);padding:12px;border-radius:6px;font-size:0.8rem;overflow-x:auto;font-family:monospace;line-height:1.4;margin:0;"></pre>

  </div>

</div>

"""



CSV_VIEWER_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:12px;">

    <label class="drop" id="csvDropZone" style="flex:1;min-width:240px;padding:20px;">

      <input type="file" id="csvFileInput" accept=".csv,.tsv,.txt">

      <div class="drop-icon-box" aria-hidden="true" style="width:36px;height:36px;margin-bottom:6px;">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/></svg>

      </div>

      <strong>Drop CSV or click to browse</strong>

      <span class="drop-browse-btn" style="margin-top:6px;">Select CSV</span>

    </label>

    <div style="flex:2;min-width:300px;">

      <textarea id="csvPasteInput" placeholder="Or paste CSV data here..." rows="6" style="width:100%;height:100%;min-height:110px;font-family:monospace;font-size:0.85rem;box-sizing:border-box;"></textarea>

    </div>

  </div>

  <div class="card-box" style="margin-bottom:12px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;">

    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">

      <div style="display:flex;align-items:center;gap:6px;">

        <label for="csvDelimiter" style="font-size:0.85rem;">Delimiter:</label>

        <select id="csvDelimiter" style="padding:4px 8px;font-size:0.85rem;">

          <option value="auto" selected>Auto Detect</option>

          <option value=",">Comma (,)</option>

          <option value="	">Tab (	)</option>

          <option value=";">Semicolon (;)</option>

        </select>

      </div>

      <label class="check" style="font-size:0.85rem;"><input type="checkbox" id="csvHeaderCheck" checked> First row is header</label>

    </div>

    <div style="display:flex;gap:8px;">

      <button type="button" class="btn primary sm" id="csvParseBtn">Parse & View</button>

      <button type="button" class="btn ghost sm" id="csvClearBtn">Clear</button>

    </div>

  </div>

  <div id="csvTableArea" class="card-box" style="display:none;">

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:12px;">

      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">

        <input type="text" id="csvSearchInput" placeholder="Search table..." style="padding:6px 10px;font-size:0.85rem;width:200px;">

        <span id="csvStats" style="font-size:0.85rem;color:var(--muted,#888);"></span>

      </div>

      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">

        <label for="csvPageSize" style="font-size:0.85rem;">Show:</label>

        <select id="csvPageSize" style="padding:4px 8px;font-size:0.85rem;">

          <option value="10">10</option>

          <option value="25" selected>25</option>

          <option value="50">50</option>

          <option value="100">100</option>

          <option value="all">All</option>

        </select>

        <button type="button" class="btn ghost sm" id="csvExportCsvBtn">Export CSV</button>

        <button type="button" class="btn ghost sm" id="csvExportJsonBtn">Export JSON</button>

      </div>

    </div>

    <div style="overflow-x:auto;max-height:480px;border:1px solid var(--border);border-radius:6px;">

      <table id="csvTable" style="width:100%;border-collapse:collapse;font-size:0.85rem;"></table>

    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:12px;flex-wrap:wrap;gap:8px;">

      <span id="csvPageInfo" style="font-size:0.85rem;color:var(--muted,#888);"></span>

      <div style="display:flex;gap:6px;">

        <button type="button" class="btn ghost sm" id="csvPrevBtn">Previous</button>

        <button type="button" class="btn ghost sm" id="csvNextBtn">Next</button>

      </div>

    </div>

  </div>

</div>

"""



TSV_CSV_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:8px;margin-bottom:12px;">

    <button type="button" class="btn tsv-csv-mode active" data-mode="tsv-to-csv">TSV to CSV</button>

    <button type="button" class="btn ghost tsv-csv-mode" data-mode="csv-to-tsv">CSV to TSV</button>

  </div>

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <label for="tsvCsvInput" style="font-weight:600;font-size:0.9rem;">Input Data</label>

        <input type="file" id="tsvCsvFile" accept=".tsv,.csv,.txt" style="display:none;">

        <button type="button" class="btn ghost sm" id="tsvCsvOpenBtn">Open File</button>

      </div>

      <textarea id="tsvCsvInput" rows="12" placeholder="Paste tab-separated or comma-separated values..." style="width:100%;font-family:monospace;font-size:0.85rem;box-sizing:border-box;"></textarea>

    </div>

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <label for="tsvCsvOutput" style="font-weight:600;font-size:0.9rem;">Converted Output</label>

        <div style="display:flex;gap:6px;">

          <button type="button" class="btn ghost sm" id="tsvCsvCopyBtn">Copy</button>

          <button type="button" class="btn ghost sm" id="tsvCsvDownloadBtn">Download</button>

        </div>

      </div>

      <textarea id="tsvCsvOutput" rows="12" readonly placeholder="Output appears here..." style="width:100%;font-family:monospace;font-size:0.85rem;box-sizing:border-box;background:var(--bg);"></textarea>

    </div>

  </div>

  <div class="card-box" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">

    <div style="display:flex;align-items:center;gap:12px;">

      <label class="check" style="font-size:0.85rem;"><input type="checkbox" id="tsvCsvTrim" checked> Trim whitespace around cells</label>

      <span id="tsvCsvStats" style="font-size:0.85rem;color:var(--muted,#888);"></span>

    </div>

    <div style="display:flex;gap:8px;">

      <button type="button" class="btn primary sm" id="tsvCsvConvertBtn">Convert</button>

      <button type="button" class="btn ghost sm" id="tsvCsvClearBtn">Clear</button>

    </div>

  </div>

</div>

"""



GZIP_TOOL_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:8px;margin-bottom:16px;">

    <button type="button" class="btn gzip-mode-tab active" data-mode="compress">Compress to .gz</button>

    <button type="button" class="btn ghost gzip-mode-tab" data-mode="decompress">Extract .gz Archive</button>

  </div>

  <div id="gzipCompressSection">

    <label class="drop" id="gzipCompDrop">

      <input type="file" id="gzipCompFile">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>

      </div>

      <strong>Drop any file to compress into GZIP (.gz)</strong>

      <span>In-browser streaming compression with native CompressionStream.</span>

      <span class="drop-browse-btn">Choose File</span>

    </label>

    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">

      <span id="gzipCompFileInfo" style="font-size:0.9rem;font-weight:500;"></span>

      <button type="button" class="btn primary" id="gzipCompBtn" disabled>Compress to .gz</button>

    </div>

    <div id="gzipCompResults" class="card-box" style="display:none;margin-top:16px;text-align:center;">

      <p id="gzipCompStats" style="font-size:1rem;margin-bottom:12px;"></p>

      <button type="button" class="btn primary" id="gzipCompDownloadBtn">Download Compressed .gz File</button>

    </div>

  </div>

  <div id="gzipDecompressSection" style="display:none;">

    <label class="drop" id="gzipDecompDrop">

      <input type="file" id="gzipDecompFile" accept=".gz,application/gzip">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>

      </div>

      <strong>Drop a .gz archive to decompress</strong>

      <span>Extract compressed GZIP files directly in your browser.</span>

      <span class="drop-browse-btn">Choose .gz File</span>

    </label>

    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">

      <span id="gzipDecompFileInfo" style="font-size:0.9rem;font-weight:500;"></span>

      <button type="button" class="btn primary" id="gzipDecompBtn" disabled>Extract GZIP Archive</button>

    </div>

    <div id="gzipDecompResults" class="card-box" style="display:none;margin-top:16px;text-align:center;">

      <p id="gzipDecompStats" style="font-size:1rem;margin-bottom:12px;"></p>

      <button type="button" class="btn primary" id="gzipDecompDownloadBtn">Download Extracted File</button>

    </div>

  </div>

</div>

"""



DATA_URI_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:8px;margin-bottom:16px;">

    <button type="button" class="btn data-uri-tab active" data-mode="encode">Generate Data URI</button>

    <button type="button" class="btn ghost data-uri-tab" data-mode="decode">Decode Data URI</button>

  </div>

  <div id="dataUriEncodeSec">

    <label class="drop" id="dataUriDrop">

      <input type="file" id="dataUriFile">

      <div class="drop-icon-box" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>

      </div>

      <strong>Drop any image, icon, font, or file to encode</strong>

      <span>Generates standard RFC 2397 Data URI scheme strings.</span>

      <span class="drop-browse-btn">Choose File</span>

    </label>

    <div class="field" style="margin-top:12px;">

      <label for="dataUriMime">MIME Type Override (optional)</label>

      <input type="text" id="dataUriMime" placeholder="e.g. image/svg+xml or leave empty for auto-detect">

    </div>

    <div id="dataUriPreview" style="display:none;margin-top:12px;text-align:center;"></div>

    <p id="dataUriStats" style="font-size:0.85rem;color:var(--muted,#888);margin-top:8px;"></p>

    <div class="card-box" style="margin-top:12px;">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

        <label for="dataUriOutput" style="font-weight:600;font-size:0.9rem;">Raw Data URI</label>

        <button type="button" class="btn ghost sm" id="dataUriCopyUriBtn">Copy URI</button>

      </div>

      <textarea id="dataUriOutput" rows="4" readonly placeholder="data:image/png;base64,..." style="width:100%;font-family:monospace;font-size:0.8rem;box-sizing:border-box;background:var(--bg);"></textarea>

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">

      <div class="card-box">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

          <label for="dataUriHtmlImg" style="font-weight:600;font-size:0.85rem;">HTML &lt;img&gt; Tag</label>

          <button type="button" class="btn ghost sm" id="dataUriCopyImgBtn">Copy HTML</button>

        </div>

        <textarea id="dataUriHtmlImg" rows="3" readonly style="width:100%;font-family:monospace;font-size:0.8rem;box-sizing:border-box;background:var(--bg);"></textarea>

      </div>

      <div class="card-box">

        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">

          <label for="dataUriCssBg" style="font-weight:600;font-size:0.85rem;">CSS background-image</label>

          <button type="button" class="btn ghost sm" id="dataUriCopyCssBtn">Copy CSS</button>

        </div>

        <textarea id="dataUriCssBg" rows="3" readonly style="width:100%;font-family:monospace;font-size:0.8rem;box-sizing:border-box;background:var(--bg);"></textarea>

      </div>

    </div>

  </div>

  <div id="dataUriDecodeSec" style="display:none;">

    <div class="field">

      <label for="dataUriDecInput">Paste Data URI to Decode</label>

      <textarea id="dataUriDecInput" rows="5" placeholder="data:image/png;base64,iVBORw0KGgo..." style="width:100%;font-family:monospace;font-size:0.85rem;box-sizing:border-box;"></textarea>

    </div>

    <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">

      <button type="button" class="btn primary" id="dataUriDecBtn">Decode Data URI</button>

      <button type="button" class="btn primary" id="dataUriDecDownloadBtn" style="display:none;">Download Decoded File</button>

    </div>

    <div id="dataUriDecInfo" class="card-box" style="display:none;margin-top:12px;font-size:0.9rem;"></div>

    <div id="dataUriDecPreview" style="display:none;margin-top:12px;text-align:center;"></div>

  </div>

</div>

"""





BARCODE_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <div class="field">

      <label for="barcodeInput">Barcode Content (Text or Numbers)</label>

      <input type="text" id="barcodeInput" value="TOOLSWICK-2026" placeholder="Enter alphanumeric text or numbers...">

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px;">

      <div class="field">

        <label for="barcodeType">Barcode Standard</label>

        <select id="barcodeType">

          <option value="code128" selected>Code 128 (Universal)</option>

          <option value="code39">Code 39 (Alphanumeric)</option>

        </select>

      </div>

      <div class="field">

        <label for="barcodeHeight">Bar Height (px)</label>

        <input type="number" id="barcodeHeight" value="80" min="40" max="200" step="5">

      </div>

      <div class="field">

        <label for="barcodeWidth">Bar Scale / Width</label>

        <select id="barcodeWidth">

          <option value="1">1x (Compact)</option>

          <option value="2" selected>2x (Standard)</option>

          <option value="3">3x (Large)</option>

          <option value="4">4x (High-Res)</option>

        </select>

      </div>

      <div class="field">

        <label for="barcodeFgColor">Bar Color</label>

        <input type="color" id="barcodeFgColor" value="#000000" style="height:38px;padding:2px;cursor:pointer;">

      </div>

      <div class="field">

        <label for="barcodeBgColor">Background Color</label>

        <input type="color" id="barcodeBgColor" value="#ffffff" style="height:38px;padding:2px;cursor:pointer;">

      </div>

    </div>

    <div style="margin-top:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">

      <label class="check"><input type="checkbox" id="barcodeShowText" checked> Show human-readable text label</label>

      <p id="barcodeError" class="bad" style="margin:0;font-size:0.85rem;"></p>

    </div>

  </div>

  <div class="card-box" style="text-align:center;padding:24px;background:var(--bg);border-radius:8px;">

    <canvas id="barcodeCanvas" style="max-width:100%;height:auto;background:#fff;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"></canvas>

    <div style="margin-top:16px;display:flex;justify-content:center;gap:10px;">

      <button type="button" class="btn primary" id="barcodeDownloadPng">Download PNG</button>

      <button type="button" class="btn ghost" id="barcodeDownloadSvg">Download SVG</button>

    </div>

  </div>

</div>

"""



INVOICE_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:8px;">

    <div style="display:flex;align-items:center;gap:8px;">

      <label for="invLogoInput" class="btn ghost small" style="cursor:pointer;white-space:nowrap;">📷 Add Logo</label>

      <input type="file" id="invLogoInput" accept="image/*" style="display:none;">

      <img id="invLogoPreview" style="display:none;max-height:40px;border-radius:4px;" alt="Logo Preview">

      <label for="invCurrency" style="font-size:0.9rem;font-weight:600;">Currency:</label>

      <select id="invCurrency" style="padding:4px 8px;font-size:0.9rem;">

        <option value="$" selected>USD ($)</option>

        <option value="€">EUR (€)</option>

        <option value="£">GBP (£)</option>

        <option value="¥">JPY / CNY (¥)</option>

        <option value="₹">INR (₹)</option>

        <option value="C$">CAD (C$)</option>

        <option value="A$">AUD (A$)</option>

      </select>

    </div>

    <button type="button" class="btn primary" id="invPrintBtn">🖨️ Print / Save as PDF</button>

  </div>

  <div class="card-box" id="invoiceSheet" style="background:#ffffff;color:#18181b;padding:32px;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);">

    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;margin-bottom:24px;border-bottom:2px solid #e4e4e7;padding-bottom:16px;">

      <div style="flex:1;min-width:240px;">

        <input type="text" id="invSenderName" value="Acme Digital Studios LLC" style="font-size:1.4rem;font-weight:bold;border:none;background:transparent;width:100%;margin-bottom:4px;color:#09090b;">

        <input type="text" id="invSenderAddr" value="100 Innovation Blvd, Suite 300, Austin, TX" style="font-size:0.85rem;border:none;background:transparent;width:100%;color:#71717a;">

        <input type="text" id="invSenderEmail" value="billing@acmestudios.com" style="font-size:0.85rem;border:none;background:transparent;width:100%;color:#71717a;">

      </div>

      <div style="text-align:right;">

        <h2 style="margin:0;font-size:2rem;color:#4f46e5;letter-spacing:1px;">INVOICE</h2>

        <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;margin-top:4px;">

          <span style="font-size:0.85rem;color:#71717a;">Invoice #:</span>

          <input type="text" id="invNumber" value="INV-2026-0042" style="font-weight:600;font-size:0.85rem;border:1px solid #d4d4d8;border-radius:4px;padding:2px 6px;width:120px;text-align:right;">

        </div>

        <div style="display:flex;gap:6px;align-items:center;justify-content:flex-end;margin-top:4px;">

          <span style="font-size:0.85rem;color:#71717a;">Date:</span>

          <input type="date" id="invDate" style="font-size:0.85rem;border:1px solid #d4d4d8;border-radius:4px;padding:2px 6px;">

        </div>

      </div>

    </div>

    <div style="margin-bottom:24px;">

      <span style="font-size:0.85rem;font-weight:600;color:#71717a;text-transform:uppercase;letter-spacing:0.5px;">Billed To:</span>

      <input type="text" id="invClientName" value="Starlight Enterprise Inc." style="font-size:1.1rem;font-weight:600;border:none;background:transparent;width:100%;margin-top:2px;color:#09090b;">

      <input type="text" id="invClientAddr" value="500 Broadway, 12th Floor, New York, NY" style="font-size:0.85rem;border:none;background:transparent;width:100%;color:#71717a;">

    </div>

    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">

      <thead>

        <tr style="background:#f4f4f5;border-bottom:2px solid #e4e4e7;">

          <th style="text-align:left;padding:8px;font-size:0.85rem;color:#52525b;">Item Description</th>

          <th style="text-align:center;padding:8px;width:70px;font-size:0.85rem;color:#52525b;">Qty</th>

          <th style="text-align:right;padding:8px;width:100px;font-size:0.85rem;color:#52525b;">Rate</th>

          <th style="text-align:right;padding:8px;width:100px;font-size:0.85rem;color:#52525b;">Amount</th>

          <th style="width:40px;"></th>

        </tr>

      </thead>

      <tbody id="invItemsBody"></tbody>

    </table>

    <button type="button" class="btn ghost sm" id="invAddItemBtn" style="margin-bottom:20px;">+ Add Line Item</button>

    <div style="display:flex;justify-content:flex-end;">

      <div style="width:260px;font-size:0.9rem;">

        <div style="display:flex;justify-content:space-between;padding:4px 0;"><span>Subtotal:</span><strong id="invSubtotal">$0.00</strong></div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">

          <span>Tax (%):</span>

          <div style="display:flex;align-items:center;gap:6px;">

            <input type="number" id="invTaxRate" value="8" min="0" step="0.5" style="width:65px;text-align:right;padding:2px 4px;border:1px solid #d4d4d8;border-radius:4px;">

            <span id="invTaxAmount" style="width:60px;text-align:right;">$0.00</span>

          </div>

        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">

          <span>Discount:</span>

          <div style="display:flex;align-items:center;gap:6px;">

            <input type="number" id="invDiscount" value="0" min="0" step="10" style="width:65px;text-align:right;padding:2px 4px;border:1px solid #d4d4d8;border-radius:4px;">

            <span id="invDiscountAmount" style="width:60px;text-align:right;">-$0.00</span>

          </div>

        </div>

        <div style="display:flex;justify-content:space-between;align-items:center;padding:4px 0;">

          <span>Shipping:</span>

          <div style="display:flex;align-items:center;gap:6px;">

            <input type="number" id="invShipping" value="0" min="0" step="5" style="width:65px;text-align:right;padding:2px 4px;border:1px solid #d4d4d8;border-radius:4px;">

            <span id="invShippingAmount" style="width:60px;text-align:right;">$0.00</span>

          </div>

        </div>

        <div style="display:flex;justify-content:space-between;padding:8px 0;border-top:2px solid #18181b;font-size:1.15rem;margin-top:6px;">

          <strong>Total:</strong><strong id="invGrandTotal" style="color:#4f46e5;">$0.00</strong>

        </div>

      </div>

    </div>

    <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e4e4e7;font-size:0.85rem;color:#71717a;">

      <p style="margin:0;"><strong>Payment Terms:</strong> Due within 30 days of receipt. Bank Wire or Credit Card.</p>

    </div>

  </div>

</div>

"""



RECEIPT_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Receipt Configuration</h3>

      <div class="field"><label for="rcCurrency">Currency Symbol</label><select id="rcCurrency"><option value="$" selected>USD ($)</option><option value="€">EUR (€)</option><option value="£">GBP (£)</option><option value="¥">JPY (¥)</option><option value="₹">INR (₹)</option></select></div>

      <div class="field" style="margin-top:8px;"><label for="rcStoreName">Store / Business Name</label><input type="text" id="rcStoreName" value="CORNER COFFEE ROASTERS"></div>

      <div class="field" style="margin-top:8px;"><label for="rcStoreAddr">Address & City</label><input type="text" id="rcStoreAddr" value="452 Elm Street, Portland, OR"></div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="rcStorePhone">Phone</label><input type="text" id="rcStorePhone" value="(503) 555-0199"></div>

        <div class="field"><label for="rcReceiptNum">Receipt #</label><input type="text" id="rcReceiptNum" value="84920"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="rcCashier">Cashier Name</label><input type="text" id="rcCashier" value="Emma W."></div>

        <div class="field"><label for="rcTaxRate">Tax Rate (%)</label><input type="number" id="rcTaxRate" value="7.5" min="0" step="0.5"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="rcPayMethod">Payment Method</label><select id="rcPayMethod"><option value="card" selected>Credit Card</option><option value="cash">Cash</option></select></div>

        <div class="field"><label for="rcCardLast4">Card Last 4 Digits</label><input type="text" id="rcCardLast4" value="8832"></div>

      </div>

      <div class="field" style="margin-top:8px;"><label for="rcFooterMsg">Footer Message</label><input type="text" id="rcFooterMsg" value="THANK YOU FOR VISITING! HAVE A GREAT DAY."></div>

      <h4 style="margin:16px 0 8px 0;font-size:0.95rem;">Purchased Items</h4>

      <table style="width:100%;border-collapse:collapse;margin-bottom:8px;">

        <thead><tr style="border-bottom:1px solid var(--border);"><th style="text-align:left;padding:4px;font-size:0.85rem;">Item</th><th style="padding:4px;width:60px;font-size:0.85rem;">Qty</th><th style="padding:4px;width:90px;font-size:0.85rem;">Price</th><th></th></tr></thead>

        <tbody id="rcItemsBody"></tbody>

      </table>

      <button type="button" class="btn ghost sm" id="rcAddItemBtn">+ Add Item</button>

    </div>

    <div>

      <div class="card-box" style="background:#fffdfa;color:#18181b;font-family:monospace;padding:24px;border-radius:6px;box-shadow:0 4px 15px rgba(0,0,0,0.1);max-width:340px;margin:0 auto;border:1px dashed #d4d4d8;">

        <div style="text-align:center;">

          <h3 id="pvStore" style="margin:0 0 4px 0;font-size:1.15rem;letter-spacing:1px;">STORE NAME</h3>

          <p id="pvAddr" style="margin:0;font-size:0.8rem;color:#52525b;"></p>

          <p id="pvPhone" style="margin:0;font-size:0.8rem;color:#52525b;"></p>

          <div style="margin:8px 0;border-bottom:1px dashed #71717a;"></div>

          <div style="display:flex;justify-content:space-between;font-size:0.75rem;color:#52525b;">

            <span id="pvNum"></span>

            <span id="pvDate"></span>

          </div>

          <div style="text-align:left;font-size:0.75rem;color:#52525b;margin-top:2px;" id="pvCashier"></div>

          <div style="margin:8px 0;border-bottom:1px dashed #71717a;"></div>

        </div>

        <div id="pvItems" style="font-size:0.85rem;line-height:1.4;"></div>

        <div style="margin:8px 0;border-bottom:1px dashed #71717a;"></div>

        <div style="font-size:0.85rem;">

          <div style="display:flex;justify-content:space-between;"><span>SUBTOTAL:</span><span id="pvSubtotal"></span></div>

          <div style="display:flex;justify-content:space-between;"><span>SALES TAX:</span><span id="pvTax"></span></div>

          <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:1rem;margin-top:4px;"><span>TOTAL:</span><span id="pvTotal"></span></div>

        </div>

        <div style="margin:8px 0;border-bottom:1px dashed #71717a;"></div>

        <div id="pvPayment" style="font-size:0.75rem;text-align:center;color:#52525b;"></div>

        <div id="pvFooter" style="font-size:0.75rem;text-align:center;margin-top:12px;color:#71717a;letter-spacing:0.5px;"></div>

      </div>

      <div style="text-align:center;margin-top:16px;">

        <button type="button" class="btn primary" id="rcPrintBtn">🖨️ Print Thermal Receipt</button>

      </div>

    </div>

  </div>

</div>

"""



RESUME_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1.1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box" style="max-height:85vh;overflow-y:auto;padding-right:12px;">

      <h3 style="margin-top:0;font-size:1.05rem;">Resume Details</h3>

      <div class="grid2">

        <div class="field"><label for="resName">Full Name</label><input type="text" id="resName" value="Johnathan Doe"></div>

        <div class="field" style="grid-column:1 / -1;"><label for="resTitle">Professional Title</label><input type="text" id="resTitle" value="Lead Cloud Solutions Architect"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="resEmail">Email</label><input type="email" id="resEmail" value="j.doe@example.com"></div>

        <div class="field"><label for="resPhone">Phone</label><input type="text" id="resPhone" value="+1 (555) 234-8901"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="resLocation">Location</label><input type="text" id="resLocation" value="San Francisco, CA"></div>

        <div class="field"><label for="resWebsite">Website / LinkedIn</label><input type="text" id="resWebsite" value="linkedin.com/in/johndoe"></div>

      </div>

      <div class="field" style="margin-top:8px;">

        <label for="resSummary">Executive Summary</label>

        <textarea id="resSummary" rows="3"></textarea>

      </div>

      <h4 style="margin:16px 0 8px 0;font-size:0.95rem;">Work Experience</h4>

      <div id="resExpList"></div>

      <button type="button" class="btn ghost sm" id="resAddExpBtn" style="margin-bottom:12px;">+ Add Position</button>

      <h4 style="margin:16px 0 8px 0;font-size:0.95rem;">Education</h4>

      <div id="resEduList"></div>

      <button type="button" class="btn ghost sm" id="resAddEduBtn" style="margin-bottom:12px;">+ Add Degree</button>

      <div class="field" style="margin-top:8px;">

        <label for="resSkills">Key Skills (comma-separated)</label>

        <textarea id="resSkills" rows="2" style="resize:vertical;"></textarea>

      </div>

    </div>

    <div>

      <div class="card-box" id="resumePreview" style="background:#ffffff;color:#18181b;padding:28px;border-radius:6px;box-shadow:0 4px 20px rgba(0,0,0,0.15);font-size:0.85rem;">

        <div style="border-bottom:2px solid #4f46e5;padding-bottom:12px;margin-bottom:16px;">

          <h2 id="pvResName" style="margin:0;font-size:1.6rem;color:#09090b;"></h2>

          <p id="pvResTitle" style="margin:2px 0 6px 0;font-weight:600;color:#4f46e5;font-size:0.95rem;"></p>

          <p id="pvResContact" style="margin:0;font-size:0.8rem;color:#71717a;"></p>

        </div>

        <div style="margin-bottom:14px;">

          <h4 style="margin:0 0 4px 0;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;font-size:0.85rem;border-bottom:1px solid #e4e4e7;padding-bottom:2px;">Summary</h4>

          <p id="pvResSummary" style="margin:0;line-height:1.4;color:#3f3f46;"></p>

        </div>

        <div style="margin-bottom:14px;">

          <h4 style="margin:0 0 6px 0;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;font-size:0.85rem;border-bottom:1px solid #e4e4e7;padding-bottom:2px;">Experience</h4>

          <div id="pvResExp"></div>

        </div>

        <div style="margin-bottom:14px;">

          <h4 style="margin:0 0 6px 0;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;font-size:0.85rem;border-bottom:1px solid #e4e4e7;padding-bottom:2px;">Education</h4>

          <div id="pvResEdu"></div>

        </div>

        <div>

          <h4 style="margin:0 0 6px 0;color:#09090b;text-transform:uppercase;letter-spacing:0.5px;font-size:0.85rem;border-bottom:1px solid #e4e4e7;padding-bottom:2px;">Core Competencies</h4>

          <div id="pvResSkills"></div>

        </div>

      </div>

      <div style="text-align:center;margin-top:16px;">

        <button type="button" class="btn primary" id="resPrintBtn">🖨️ Print / Save Resume as PDF</button>

      </div>

    </div>

  </div>

</div>

"""



BUSINESS_CARD_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Card Details</h3>

      <div class="field">

        <label for="bcTheme">Design Theme</label>

        <select id="bcTheme">

          <option value="dark" selected>Modern Minimal (Dark)</option>

          <option value="blue">Executive Navy</option>

          <option value="white">Clean Studio (White)</option>

          <option value="gold">Luxury Gold & Charcoal</option>

        </select>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="bcCompany">Company Name</label><input type="text" id="bcCompany" value="ACME GLOBAL"></div>

        <div class="field"><label for="bcTagline">Tagline</label><input type="text" id="bcTagline" value="INNOVATION & INTEGRITY"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="bcName">Full Name</label><input type="text" id="bcName" value="Alexander Vance"></div>

        <div class="field"><label for="bcTitle">Job Title</label><input type="text" id="bcTitle" value="Chief Technology Officer"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="bcPhone">Phone</label><input type="text" id="bcPhone" value="+1 (555) 234-5678"></div>

        <div class="field" style="grid-column:1 / -1;"><label for="bcEmail">Email</label><input type="email" id="bcEmail" value="alex.vance@acmeglobal.com"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="bcWebsite">Website</label><input type="text" id="bcWebsite" value="www.acmeglobal.com"></div>

        <div class="field"><label for="bcAddress">Address / Location</label><input type="text" id="bcAddress" value="San Francisco, CA"></div>

      </div>

    </div>

    <div style="text-align:center;">

      <h4 style="margin:0 0 6px 0;font-size:0.9rem;">Front Side (3.5" × 2")</h4>

      <canvas id="bcFrontCanvas" style="max-width:100%;height:auto;border-radius:6px;box-shadow:0 4px 15px rgba(0,0,0,0.2);margin-bottom:12px;"></canvas>

      <h4 style="margin:0 0 6px 0;font-size:0.9rem;">Back Side</h4>

      <canvas id="bcBackCanvas" style="max-width:100%;height:auto;border-radius:6px;box-shadow:0 4px 15px rgba(0,0,0,0.2);margin-bottom:16px;"></canvas>

      <div style="display:flex;justify-content:center;gap:8px;flex-wrap:wrap;">

        <button type="button" class="btn primary sm" id="bcDlFrontBtn">Download Front PNG</button>

        <button type="button" class="btn primary sm" id="bcDlBackBtn">Download Back PNG</button>

        <button type="button" class="btn ghost sm" id="bcPrintBtn">🖨️ Print</button>

      </div>

    </div>

  </div>

</div>

"""



CERTIFICATE_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">

      <div class="field">

        <label for="certType">Certificate Type</label>

        <select id="certType">

          <option value="CERTIFICATE OF COMPLETION" selected>Certificate of Completion</option>

          <option value="CERTIFICATE OF ACHIEVEMENT">Certificate of Achievement</option>

          <option value="CERTIFICATE OF APPRECIATION">Certificate of Appreciation</option>

          <option value="CERTIFICATE OF EXCELLENCE">Certificate of Excellence</option>

        </select>

      </div>

      <div class="field">

        <label for="certTheme">Ornamental Theme</label>

        <select id="certTheme">

          <option value="gold" selected>Imperial Gold</option>

          <option value="blue">Royal Sapphire</option>

          <option value="emerald">Emerald Prestige</option>

          <option value="black">Classic Formal</option>

        </select>

      </div>

      <div class="field">

        <label for="certRecipient">Recipient Full Name</label>

        <input type="text" id="certRecipient" value="Eleanor Vance">

      </div>

      <div class="field">

        <label for="certTitle">Course or Award Title</label>

        <input type="text" id="certTitle" value="Advanced Machine Learning & AI Engineering">

      </div>

      <div class="field">

        <label for="certOrg">Organization / Academy</label>

        <input type="text" id="certOrg" value="Global Technology Academy">

      </div>

      <div class="field">

        <label for="certPresenter">Instructor / Presenter Name & Title</label>

        <input type="text" id="certPresenter" value="Dr. Robert Sterling, Dean of Engineering">

      </div>

      <div class="field">

        <label for="certDate">Issue Date</label>

        <input type="text" id="certDate" placeholder="e.g. November 12, 2026">

      </div>

      <div class="field">

        <label for="certDesc">Presentation Text</label>

        <input type="text" id="certDesc" value="has successfully fulfilled all curriculum requirements, practical examinations, and project milestones.">

      </div>

    </div>

  </div>

  <div class="card-box" style="text-align:center;padding:16px;background:var(--bg);border-radius:8px;">

    <canvas id="certCanvas" style="max-width:100%;height:auto;border-radius:4px;box-shadow:0 4px 20px rgba(0,0,0,0.2);"></canvas>

    <div style="margin-top:16px;display:flex;justify-content:center;gap:10px;">

      <button type="button" class="btn primary" id="certDownloadBtn">Download Certificate (PNG)</button>

      <button type="button" class="btn ghost" id="certPrintBtn">🖨️ Print Certificate</button>

    </div>

  </div>

</div>

"""



SIGNATURE_WIDGET = """

<div class="tool-workspace">

  <div style="display:flex;gap:8px;margin-bottom:16px;">

    <button type="button" class="btn sig-mode-tab active" data-mode="draw">Draw Signature</button>

    <button type="button" class="btn ghost sig-mode-tab" data-mode="type">Type Signature</button>

  </div>

  <div id="sigDrawSec">

    <div class="card-box" style="margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">

      <div style="display:flex;align-items:center;gap:12px;">

        <label for="sigColor" style="font-size:0.85rem;white-space:nowrap;">Pen Color:</label>

        <select id="sigColor" style="padding:4px 8px;font-size:0.85rem;">

          <option value="#000000" selected>Black</option>

          <option value="#1e3a8a">Navy Blue</option>

          <option value="#b91c1c">Red</option>

        </select>

        <label for="sigWidth" style="font-size:0.85rem;margin-left:8px;white-space:nowrap;">Stroke Width:</label>

        <input type="range" id="sigWidth" min="1" max="8" value="3" style="width:100px;">

      </div>

      <div style="display:flex;gap:6px;">

        <button type="button" class="btn ghost sm" id="sigUndoBtn">Undo</button>

        <button type="button" class="btn ghost sm" id="sigClearBtn">Clear</button>

      </div>

    </div>

    <div class="card-box" style="text-align:center;padding:16px;background:#ffffff;border-radius:12px;border:2px solid #cbd5e1;box-shadow:0 4px 15px rgba(0,0,0,0.08);">

      <canvas id="sigCanvas" style="max-width:100%;height:auto;background:#ffffff;border:2px dashed #94a3b8;border-radius:6px;cursor:crosshair;"></canvas>

      <p class="hint" style="margin:8px 0 0 0;color:#64748b;">Draw with your mouse, finger, or stylus. Transparent PNG export.</p>

      <div style="margin-top:16px;">

        <button type="button" class="btn primary" id="sigDlDrawBtn">Download Signature (Transparent PNG)</button>

      </div>

    </div>

  </div>

  <div id="sigTypeSec" style="display:none;">

    <div class="card-box" style="margin-bottom:12px;">

      <div class="grid2">

        <div class="field">

          <label for="sigTypeInp">Type Your Name</label>

          <input type="text" id="sigTypeInp" value="Alexander Vance">

        </div>

        <div class="field">

          <label for="sigFontSel">Calligraphy Style</label>

          <select id="sigFontSel">

            <option value="cursive" selected>Elegant Cursive</option>

            <option value="'Brush Script MT', cursive">Brush Script</option>

            <option value="'Lucida Handwriting', cursive">Handwriting</option>

            <option value="'Segoe Script', cursive">Segoe Script</option>

          </select>

        </div>

      </div>

    </div>

    <div class="card-box" style="text-align:center;padding:16px;background:#ffffff;border-radius:12px;border:2px solid #cbd5e1;box-shadow:0 4px 15px rgba(0,0,0,0.08);">

      <canvas id="sigTypeCanvas" style="max-width:100%;height:auto;background:#ffffff;border:2px dashed #94a3b8;border-radius:6px;"></canvas>

      <div style="margin-top:16px;">

        <button type="button" class="btn primary" id="sigDlTypeBtn">Download Typed Signature (PNG)</button>

      </div>

    </div>

  </div>

</div>

"""



SOCIAL_POST_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Post Details</h3>

      <div class="grid2">

        <div class="field"><label for="spName">Display Name</label><input type="text" id="spName" value="Sarah Connor"></div>

        <div class="field"><label for="spHandle">Handle</label><input type="text" id="spHandle" value="@sarahconnor"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field">

          <label for="spBg">Background Theme</label>

          <select id="spBg">

            <option value="purple" selected>Electric Indigo</option>

            <option value="sunset">Sunset Orange</option>

            <option value="ocean">Ocean Cyan</option>

            <option value="dark">Stealth Dark</option>

            <option value="midnight">Deep Midnight</option>

          </select>

        </div>

        <div class="field">

          <label for="spTime">Timestamp</label>

          <input type="text" id="spTime" value="10:42 AM · Nov 12, 2026">

        </div>

      </div>

      <div class="field" style="margin-top:8px;">

        <label for="spText">Quote / Post Text</label>

        <textarea id="spText" rows="4">The secret of building impactful tools is radical simplicity: eliminate latency, protect privacy, and build for the user first.</textarea>

      </div>

      <div class="field" style="margin-top:8px;">

        <label for="spAvatarInput">Custom Avatar Image (optional)</label>

        <input type="file" id="spAvatarInput" accept="image/*">

      </div>

      <label class="check" style="margin-top:8px;font-size:0.85rem;"><input type="checkbox" id="spVerified" checked> Show verified checkmark badge</label>

    </div>

    <div style="text-align:center;">

      <canvas id="spCanvas" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 8px 30px rgba(0,0,0,0.3);"></canvas>

      <div style="margin-top:16px;">

        <button type="button" class="btn primary" id="spDlBtn">Download Social Card (PNG)</button>

      </div>

    </div>

  </div>

</div>

"""



OG_IMAGE_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Open Graph Card Config</h3>

      <div class="field"><label for="ogTitle">Social Title</label><input type="text" id="ogTitle" value="Free Online Web Utilities & High-Performance Tools"></div>

      <div class="field" style="margin-top:8px;"><label for="ogDesc">Subtitle / Short Pitch</label><textarea id="ogDesc" rows="2">Fast, private, client-side tools for documents, images, and developer datasets.</textarea></div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="ogCategory">Badge / Category</label><input type="text" id="ogCategory" value="DEVELOPER TOOLS"></div>

        <div class="field"><label for="ogBrand">Brand / Domain</label><input type="text" id="ogBrand" value="toolswick.com"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field">

          <label for="ogTheme">Color Scheme</label>

          <select id="ogTheme">

            <option value="dark" selected>Modern Dark (#09090b)</option>

            <option value="light">Crisp White (#ffffff)</option>

            <option value="gradient">Deep Navy Gradient</option>

          </select>

        </div>

        <div class="field"><label for="ogAccent">Accent Color</label><input type="color" id="ogAccent" value="#6366f1" style="height:38px;padding:2px;cursor:pointer;"></div>

      </div>

    </div>

    <div style="text-align:center;">

      <canvas id="ogCanvas" style="max-width:100%;height:auto;border-radius:8px;box-shadow:0 6px 25px rgba(0,0,0,0.25);"></canvas>

      <p class="hint" style="margin:8px 0 0 0;">Standard 1200 × 630 px Open Graph / Twitter Card social share preview.</p>

      <div style="margin-top:16px;">

        <button type="button" class="btn primary" id="ogDlBtn">Download OG Image (PNG)</button>

      </div>

    </div>

  </div>

</div>

"""



SEARCH_PREVIEW_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">SEO Snippet Fields</h3>

      <div class="field">

        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">

          <label for="spvTitle">Meta Title</label>

          <span id="spvTitleCount" style="font-size:0.8rem;color:var(--muted,#888);">0 / 60</span>

        </div>

        <input type="text" id="spvTitle" value="Toolswick - Free Client-Side Web Utilities & Image Tools">

      </div>

      <div style="margin-top:8px;">

        <div style="display:flex;justify-content:space-between;font-size:0.8rem;color:var(--muted,#888);margin-bottom:2px;">

          <span>Google Desktop Width:</span>

          <span id="spvPixelWidth">0px / ~600px</span>

        </div>

        <div style="width:100%;height:6px;background:var(--border);border-radius:3px;overflow:hidden;">

          <div id="spvPixelBar" style="height:100%;width:0%;background:var(--accent,#6366f1);transition:width 0.2s;"></div>

        </div>

      </div>

      <div class="field" style="margin-top:12px;">

        <label for="spvUrl">Destination URL</label>

        <input type="text" id="spvUrl" value="https://toolswick.com/tools/image-cropper">

      </div>

      <div class="field" style="margin-top:12px;">

        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">

          <label for="spvDesc">Meta Description</label>

          <span id="spvDescCount" style="font-size:0.8rem;color:var(--muted,#888);">0 / 160</span>

        </div>

        <textarea id="spvDesc" rows="3">Fast, secure, and private browser-based utilities. Crop photos, reorder PDFs, and inspect files with zero uploads and total client-side privacy.</textarea>

      </div>

      <div style="margin-top:16px;">

        <button type="button" class="btn ghost sm" id="spvCopyBtn">Copy HTML &lt;title&gt; & &lt;meta&gt; Tags</button>

      </div>

    </div>

    <div>

      <div style="display:flex;gap:8px;margin-bottom:12px;">

        <button type="button" class="btn serp-tab active sm" data-mode="desktop">Desktop Preview</button>

        <button type="button" class="btn ghost serp-tab sm" data-mode="mobile">Mobile Preview</button>

      </div>

      <div id="serpDesktop" class="card-box" style="background:#ffffff;color:#1f1f1f;padding:18px;border-radius:8px;box-shadow:0 2px 10px rgba(0,0,0,0.1);font-family:Arial,sans-serif;">

        <div id="dSerpUrl" style="font-size:0.8rem;color:#202124;margin-bottom:4px;word-break:break-all;"></div>

        <h3 id="dSerpTitle" style="margin:0 0 4px 0;font-size:1.25rem;color:#1a0dab;font-weight:normal;line-height:1.3;cursor:pointer;text-decoration:none;"></h3>

        <p id="dSerpDesc" style="margin:0;font-size:0.88rem;color:#4d5156;line-height:1.4;word-break:break-word;"></p>

      </div>

      <div id="serpMobile" class="card-box" style="display:none;background:#ffffff;color:#1f1f1f;padding:16px;border-radius:12px;box-shadow:0 2px 10px rgba(0,0,0,0.1);max-width:360px;margin:0 auto;font-family:Arial,sans-serif;">

        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">

          <div style="width:20px;height:20px;background:#f1f3f4;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;">🔍</div>

          <div id="mSerpUrl" style="font-size:0.75rem;color:#202124;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"></div>

        </div>

        <h3 id="mSerpTitle" style="margin:0 0 6px 0;font-size:1.15rem;color:#1a0dab;font-weight:normal;line-height:1.3;"></h3>

        <p id="mSerpDesc" style="margin:0;font-size:0.85rem;color:#4d5156;line-height:1.4;"></p>

      </div>

    </div>

  </div>

</div>

"""



KEYWORD_DENSITY_WIDGET = """

<div class="tool-workspace">

  <div class="card-box" style="margin-bottom:16px;">

    <div class="field">

      <label for="kdInput">Paste Article, Blog Post, or Content to Analyze</label>

      <textarea id="kdInput" rows="7" placeholder="Paste your article text here..."></textarea>

    </div>

    <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-top:12px;">

      <div style="display:flex;align-items:center;gap:12px;">

        <label class="check" style="font-size:0.85rem;"><input type="checkbox" id="kdStopWords" checked> Ignore Stop Words (the, and, of...)</label>

        <div style="display:flex;align-items:center;gap:6px;">

          <label for="kdMinLen" style="font-size:0.85rem;">Min Length:</label>

          <input type="number" id="kdMinLen" value="3" min="1" max="10" style="width:50px;padding:3px 6px;">

        </div>

      </div>

      <div style="display:flex;gap:8px;">

        <button type="button" class="btn primary sm" id="kdAnalyzeBtn">Analyze Keywords</button>

        <button type="button" class="btn ghost sm" id="kdClearBtn">Clear</button>

      </div>

    </div>

  </div>

  <div id="kdResults" style="display:none;">

    <div class="grid2" style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:16px;">

      <div class="card-box" style="text-align:center;padding:12px;"><span style="font-size:0.85rem;color:var(--muted,#888);">Total Words</span><h3 id="kdTotalWords" style="margin:4px 0 0 0;font-size:1.5rem;">0</h3></div>

      <div class="card-box" style="text-align:center;padding:12px;"><span style="font-size:0.85rem;color:var(--muted,#888);">Unique Words</span><h3 id="kdUniqueWords" style="margin:4px 0 0 0;font-size:1.5rem;">0</h3></div>

      <div class="card-box" style="text-align:center;padding:12px;"><span style="font-size:0.85rem;color:var(--muted,#888);">Reading Time</span><h3 id="kdReadTime" style="margin:4px 0 0 0;font-size:1.5rem;">0</h3></div>

    </div>

    <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:16px;">

      <div class="card-box">

        <h4 style="margin:0 0 8px 0;font-size:0.95rem;">Top Single Words</h4>

        <table id="kdTable1" style="width:100%;border-collapse:collapse;font-size:0.85rem;"></table>

      </div>

      <div class="card-box">

        <h4 style="margin:0 0 8px 0;font-size:0.95rem;">Top 2-Word Phrases</h4>

        <table id="kdTable2" style="width:100%;border-collapse:collapse;font-size:0.85rem;"></table>

      </div>

      <div class="card-box">

        <h4 style="margin:0 0 8px 0;font-size:0.95rem;">Top 3-Word Phrases</h4>

        <table id="kdTable3" style="width:100%;border-collapse:collapse;font-size:0.85rem;"></table>

      </div>

    </div>

    <div style="text-align:right;">

      <button type="button" class="btn ghost sm" id="kdExportBtn">Export Top Keywords (CSV)</button>

    </div>

  </div>

</div>

"""



ROBOTS_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Crawl Rules & Permissions</h3>

      <div class="field">

        <label for="robDefaultPolicy">Default Access (All Robots *)</label>

        <select id="robDefaultPolicy">

          <option value="allow" selected>Allow All (Recommended)</option>

          <option value="disallow">Disallow All</option>

        </select>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="robCrawlDelay">Crawl-delay (seconds, optional)</label><input type="number" id="robCrawlDelay" placeholder="e.g. 10" min="1" max="120"></div>

        <div class="field"><label for="robSitemap">Sitemap XML URL</label><input type="url" id="robSitemap" placeholder="https://example.com/sitemap.xml"></div>

      </div>

      <h4 style="margin:16px 0 6px 0;font-size:0.95rem;">Disallowed Paths</h4>

      <div style="display:flex;gap:6px;margin-bottom:8px;">

        <input type="text" id="robNewPath" placeholder="e.g. /admin/ or /cgi-bin/" style="flex:1;">

        <button type="button" class="btn ghost sm" id="robAddPathBtn">+ Add Path</button>

      </div>

      <div id="robPathsList" style="margin-bottom:16px;"></div>

      <h4 style="margin:16px 0 6px 0;font-size:0.95rem;">Specific Search Engine Bots</h4>

      <div class="grid2">

        <div class="field"><label for="robGoogle">Googlebot</label><select id="robGoogle"><option value="default" selected>Same as Default</option><option value="disallow">Disallow</option></select></div>

        <div class="field"><label for="robBing">Bingbot</label><select id="robBing"><option value="default" selected>Same as Default</option><option value="disallow">Disallow</option></select></div>

        <div class="field"><label for="robBaidu">Baiduspider</label><select id="robBaidu"><option value="default" selected>Same as Default</option><option value="disallow">Disallow</option></select></div>

        <div class="field"><label for="robYandex">Yandex</label><select id="robYandex"><option value="default" selected>Same as Default</option><option value="disallow">Disallow</option></select></div>

      </div>

    </div>

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <h3 style="margin:0;font-size:1.05rem;">Generated robots.txt</h3>

        <div style="display:flex;gap:6px;">

          <button type="button" class="btn ghost sm" id="robCopyBtn">Copy</button>

          <button type="button" class="btn primary sm" id="robDlBtn">Download robots.txt</button>

        </div>

      </div>

      <textarea id="robOutput" rows="16" readonly style="width:100%;font-family:monospace;font-size:0.85rem;background:var(--bg);box-sizing:border-box;"></textarea>

    </div>

  </div>

</div>

"""



SITEMAP_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box">

      <h3 style="margin-top:0;font-size:1.05rem;">Sitemap Settings</h3>

      <div class="field"><label for="smBaseUrl">Base Website URL (optional prefix)</label><input type="url" id="smBaseUrl" placeholder="https://example.com"></div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field">

          <label for="smChangeFreq">Change Frequency</label>

          <select id="smChangeFreq">

            <option value="daily">Daily</option>

            <option value="weekly" selected>Weekly</option>

            <option value="monthly">Monthly</option>

            <option value="yearly">Yearly</option>

            <option value="none">Omit</option>

          </select>

        </div>

        <div class="field">

          <label for="smPriority">Priority</label>

          <select id="smPriority">

            <option value="1.0">1.0 (Highest)</option>

            <option value="0.8" selected>0.8 (Standard)</option>

            <option value="0.5">0.5 (Neutral)</option>

            <option value="0.3">0.3 (Low)</option>

            <option value="none">Omit</option>

          </select>

        </div>

      </div>

      <label class="check" style="font-size:0.85rem;margin:8px 0;"><input type="checkbox" id="smIncludeDate" checked> Include today's lastmod timestamp</label>

      <div class="field" style="margin-top:8px;">

        <label for="smUrls">List of URLs or Paths (one per line)</label>

        <textarea id="smUrls" rows="10" placeholder="https://example.com/&#10;https://example.com/about&#10;https://example.com/contact"></textarea>

      </div>

      <div style="margin-top:12px;text-align:right;">

        <button type="button" class="btn primary sm" id="smGenerateBtn">Generate XML</button>

      </div>

    </div>

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <div><h3 style="margin:0;font-size:1.05rem;">sitemap.xml Output</h3><span id="smCount" style="font-size:0.8rem;color:var(--muted,#888);"></span></div>

        <div style="display:flex;gap:6px;">

          <button type="button" class="btn ghost sm" id="smCopyBtn">Copy</button>

          <button type="button" class="btn primary sm" id="smDlBtn">Download sitemap.xml</button>

        </div>

      </div>

      <textarea id="smOutput" rows="18" readonly style="width:100%;font-family:monospace;font-size:0.8rem;background:var(--bg);box-sizing:border-box;"></textarea>

    </div>

  </div>

</div>

"""



META_TAGS_WIDGET = """

<div class="tool-workspace">

  <div class="grid2" style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

    <div class="card-box" style="max-height:85vh;overflow-y:auto;padding-right:10px;">

      <h3 style="margin-top:0;font-size:1.05rem;">Metadata Attributes</h3>

      <div class="field"><label for="metaTitle">Page Title</label><input type="text" id="metaTitle" value="Toolswick - Free Online Client-Side Web Utilities"></div>

      <div class="field" style="margin-top:8px;"><label for="metaDesc">Meta Description</label><textarea id="metaDesc" rows="2">Fast, secure, and private browser-based utilities for images, PDFs, and developer data.</textarea></div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="metaKeywords">Keywords</label><input type="text" id="metaKeywords" placeholder="tools, pdf, images, developer"></div>

        <div class="field"><label for="metaAuthor">Author</label><input type="text" id="metaAuthor" value="Toolswick Team"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="metaCanonical">Canonical URL</label><input type="url" id="metaCanonical" value="https://toolswick.com"></div>

        <div class="field"><label for="metaRobots">Robots Directive</label><select id="metaRobots"><option value="index, follow" selected>index, follow</option><option value="noindex, follow">noindex, follow</option><option value="noindex, nofollow">noindex, nofollow</option></select></div>

      </div>

      <h4 style="margin:16px 0 6px 0;font-size:0.95rem;">Open Graph & Social Cards</h4>

      <div class="grid2">

        <div class="field"><label for="metaOgType">OG Type</label><select id="metaOgType"><option value="website" selected>website</option><option value="article">article</option><option value="product">product</option></select></div>

        <div class="field"><label for="metaOgImage">OG Image URL</label><input type="url" id="metaOgImage" value="https://toolswick.com/og-image.png"></div>

      </div>

      <div class="grid2" style="margin-top:8px;">

        <div class="field"><label for="metaTwCard">Twitter Card</label><select id="metaTwCard"><option value="summary_large_image" selected>summary_large_image</option><option value="summary">summary</option></select></div>

        <div class="field"><label for="metaTwHandle">Twitter @Handle</label><input type="text" id="metaTwHandle" placeholder="@toolswick"></div>

      </div>

    </div>

    <div class="card-box">

      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">

        <h3 style="margin:0;font-size:1.05rem;">Generated &lt;head&gt; HTML</h3>

        <button type="button" class="btn primary sm" id="metaCopyBtn">Copy Meta Tags</button>

      </div>

      <textarea id="metaOutput" rows="18" readonly style="width:100%;font-family:monospace;font-size:0.8rem;background:var(--bg);box-sizing:border-box;"></textarea>

    </div>

  </div>

</div>

"""



# Privacy Disclaimers for Tool Pages

IMG_PRIVACY = "100% Client-Side Privacy: Your images never leave your computer or phone. Processing runs completely in local browser memory via WebAssembly and Canvas APIs. No file data, filenames, or metadata are ever transmitted."

PDF_PRIVACY = "100% Client-Side Privacy: Your documents stay strictly within your device. PDF manipulations execute in-memory using pdf-lib. Zero bytes leave your browser, ensuring absolute confidentiality for financial, legal, or personal files."



# ----------------------------------------------------------------------------

# COMPLETE PAGES INVENTORY (22 TOOLS)

# ----------------------------------------------------------------------------

# Tool data now lives in data/tools.json (Argon migration step 2).
# PAGES is loaded from it; the rest of the generator is untouched.
_TOOLS_JSON_PATH = os.path.join(HERE, "data", "tools.json")
with open(_TOOLS_JSON_PATH, encoding="utf-8") as _toolswick_tools_file:
    PAGES = json.load(_toolswick_tools_file)



CATS = ["Image Tools", "PDF Tools", "Calculators", "Developer & Data", "Text & Writing", "Time & Date", "Audio Tools", "Productivity"]

BY_SLUG = {p["slug"]: p for p in PAGES}


# Phase 4: tool chains (next-step cross-links) loaded from data/tool_chains.json.
_CHAINS_JSON_PATH = os.path.join(HERE, "data", "tool_chains.json")
with open(_CHAINS_JSON_PATH, encoding="utf-8") as _toolswick_chains_file:
    CHAINS = json.load(_toolswick_chains_file)


# Phase 4: clean URL slugs for the 8 category landing pages.
# cat_id() keeps '&' in two names ("developer-&-data") — unsuitable for URLs.
CAT_SLUG = {
    "Image Tools": "image-tools",
    "PDF Tools": "pdf-tools",
    "Calculators": "calculators",
    "Developer & Data": "developer-data",
    "Text & Writing": "text-writing",
    "Time & Date": "time-date",
    "Audio Tools": "audio-tools",
    "Productivity": "productivity",
}


# Phase 4: curated footer tool-map clusters (Argon Phase 4).
FOOTER_CLUSTERS = [
    ("Top PDF Tools", ["merge-pdf", "split-pdf", "compress-pdf", "pdf-to-image", "jpg-to-pdf", "pdf-to-text"]),
    ("Popular Image Tools", ["compress-image", "resize-image", "crop-image", "convert-to-webp", "png-to-jpg", "image-base64"]),
    ("Developer Essentials", ["json-formatter", "base64-tool", "qr-code-generator", "regex-tester", "password-generator", "word-counter"]),
    ("Popular Calculators", ["percentage-calculator", "age-calculator", "bmi-calculator", "loan-calculator", "scientific-calculator", "tax-calculator"]),
]


def _footer_map_html():
    cols = []
    for title, slugs in FOOTER_CLUSTERS:
        links = "".join(f'<a href="/{s}/">{e(BY_SLUG[s]["label"])}</a>' for s in slugs if s in BY_SLUG)
        cols.append(f'<div class="footer-col"><h4>{e(title)}</h4><div class="footer-links-list">{links}</div></div>')
    nav = '<nav class="footer-content footer-map" aria-label="Browse tools by category">' + "".join(cols) + "</nav>"
    all_link = f'<p style="text-align:center;margin:0 0 14px;"><a href="/sitemap/">Browse all {len(PAGES)} free tools &rarr;</a></p>'
    return nav + "\n    " + all_link


FOOTER_MAP_HTML = _footer_map_html()



# ----------------------------------------------------------------------------

# HTML TEMPLATE & GENERATION

# ----------------------------------------------------------------------------

def abs_url(path):

    return SITE_URL.rstrip("/") + path



THEME_INIT_SCRIPT = """<script>

(function(){

  try {

    var t = localStorage.getItem('toolswick_theme');

    if (!t && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) t = 'dark';

    if (t) document.documentElement.setAttribute('data-theme', t);

  } catch(e){}

})();

</script>"""



CRITICAL_SEARCH_CSS = """
<style>
/* Toolswick Critical Search & Input Layout - Zero Overlap Guarantee */
.search-wrapper{width:100%;max-width:680px;margin:10px auto 0;position:relative}
.search-input-box{position:relative;width:100%;display:block}
.search-icon{position:absolute!important;left:16px!important;top:50%!important;transform:translateY(-50%)!important;width:20px!important;height:20px!important;color:#64748b!important;pointer-events:none!important;z-index:3!important;display:block!important}
input#toolSearch.search-input,.search-input{width:100%!important;height:52px!important;font-family:inherit!important;font-size:15px!important;font-weight:500!important;background:#ffffff!important;color:#0f172a!important;border:1.5px solid #cbd5e1!important;border-radius:10px!important;padding:12px 50px 12px 48px!important;padding-left:48px!important;padding-right:50px!important;box-shadow:0 1px 2px rgba(0,0,0,0.05)!important;box-sizing:border-box!important;line-height:normal!important;-webkit-appearance:none!important;appearance:none!important}
input#toolSearch::-webkit-search-decoration,input#toolSearch::-webkit-search-cancel-button,input#toolSearch::-webkit-search-results-button,input#toolSearch::-webkit-search-results-decoration{-webkit-appearance:none!important;display:none!important}
.search-shortcut{position:absolute!important;right:16px!important;top:50%!important;transform:translateY(-50%)!important;background:#f1f5f9!important;border:1px solid #e2e8f0!important;color:#64748b!important;font-family:monospace!important;font-size:11.5px!important;font-weight:600!important;padding:2px 7px!important;border-radius:4px!important;pointer-events:none!important;z-index:2!important}
[data-theme="dark"] input#toolSearch.search-input{background:#1e293b!important;color:#f8fafc!important;border-color:#334155!important}
[data-theme="dark"] .search-icon{color:#94a3b8!important}
[data-theme="dark"] .search-shortcut{background:#0f172a!important;border-color:#334155!important;color:#94a3b8!important}
</style>
"""

def head(title, desc, path, extra_ld=None, robots=None):
    org_ld = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_NAME,
        "url": abs_url("/"),
        "logo": abs_url("/favicon.svg")
    }
    all_ld = [org_ld] + (list(extra_ld) if extra_ld else [])
    ld = "".join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False) for x in all_ld)

    ads = ""
    if ADSENSE_CLIENT:
        ads = '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=%s" crossorigin="anonymous"></script>' % e(ADSENSE_CLIENT)

    ga = ""
    if GA4_MEASUREMENT_ID:
        ga = ('<script async src="https://www.googletagmanager.com/gtag/js?id=%s"></script>'
              '<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}'
              "gtag('js',new Date());gtag('config','%s');</script>") % (GA4_MEASUREMENT_ID, GA4_MEASUREMENT_ID)

    rb = f'<meta name="robots" content="{e(robots)}">' if robots else ""
    rel_dot = "." if path == "/" else ".."

    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title>
<meta name="description" content="{e(desc)}">
<link rel="canonical" href="{e(abs_url(path))}">
{rb}
<meta property="og:type" content="website">
<meta property="og:site_name" content="{e(SITE_NAME)}">
<meta property="og:title" content="{e(title)}">
<meta property="og:description" content="{e(desc)}">
<meta property="og:url" content="{e(abs_url(path))}">
<meta property="og:image" content="{e(abs_url('/favicon.svg'))}">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="{e(title)}">
<meta name="twitter:description" content="{e(desc)}">
<meta name="twitter:image" content="{e(abs_url('/favicon.svg'))}">
<meta name="theme-color" content="#0d9488">
<link rel="icon" href="{rel_dot}/favicon.svg" type="image/svg+xml">
{THEME_INIT_SCRIPT}
{CRITICAL_SEARCH_CSS}
<link rel="stylesheet" href="/css/site.v2.css">
<link rel="stylesheet" href="{rel_dot}/css/site.v2.css">
<link rel="stylesheet" href="/css/site.css">
{ld}
{ads}
{ga}
</head>"""

def header():
    return f"""<body>
<a class="skip" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="wrap">
    <div class="header-left">
      <a class="logo" href="/" aria-label="{e(SITE_NAME)} Homepage">
        <svg class="logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#0d9488"/>
          <rect x="7" y="7" width="8" height="8" rx="2" fill="#ffffff"/>
          <rect x="17" y="7" width="8" height="8" rx="2" fill="#99f6e4"/>
          <rect x="17" y="17" width="8" height="8" rx="2" fill="#ffffff"/>
          <rect x="7" y="17" width="8" height="8" rx="2" fill="#99f6e4"/>
        </svg>
        <span class="logo-text">{e(SITE_NAME)}<b>.</b></span>
      </a>
    </div>
    <nav class="site-nav" aria-label="Main Navigation">
      <a href="/#image-tools">Image Tools</a>
      <a href="/#pdf-tools">PDF</a>
      <a href="/#calculators">Calculators</a>
      <a href="/#developer-&-data">Developer & Data</a>
      <a href="/#text-&-writing">Text & Writing</a>
      <a href="/#time-&-date">Time & Date</a>
      <a href="/#audio-tools">Audio Tools</a>
      <a href="/#productivity">Productivity</a>
    </nav>
    <div class="header-right">
      <button type="button" class="theme-toggle-btn" id="themeToggle" aria-label="Toggle light/dark theme" title="Toggle theme">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="currentColor" fill-opacity="0.25"/></svg>
        <span class="theme-label">Theme</span>
      </button>
    </div>
  </div>
</header>
"""


def footer():
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div class="footer-brand" style="display:flex;justify-content:center;align-items:center;margin-bottom:8px;">
      <a class="logo" href="/" aria-label="{e(SITE_NAME)} Homepage">
        <svg class="logo-icon" width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect width="32" height="32" rx="8" fill="#0d9488"/>
          <rect x="7" y="7" width="8" height="8" rx="2" fill="#ffffff"/>
          <rect x="17" y="7" width="8" height="8" rx="2" fill="#99f6e4"/>
          <rect x="17" y="17" width="8" height="8" rx="2" fill="#ffffff"/>
          <rect x="7" y="17" width="8" height="8" rx="2" fill="#99f6e4"/>
        </svg>
        <span class="logo-text">{e(SITE_NAME)}<b>.</b></span>
      </a>
    </div>
    <p class="footer-tagline" style="text-align:center;color:var(--muted);margin:0 0 14px;">Free online tools that run entirely in your browser — no sign-up, no uploads, your files never leave your device.</p>
    <div class="footer-links" style="display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:18px 28px;margin-bottom:14px;">
      <a href="/about/">About Us</a>
      <a href="/contact/">Contact Us</a>
      <a href="/privacy/">Privacy Policy</a>
      <a href="/terms/">Terms of Service</a>
      <a href="/cookies/">Cookie Policy</a>
      <a href="/disclaimer/">Disclaimer</a>
    </div>
    {FOOTER_MAP_HTML}
    <div class="footer-bottom" style="text-align:center;">
      <p>&copy; {TODAY.year} {e(SITE_NAME)}. All rights reserved. 100% Free &amp; Private Client-Side Tools.</p>
    </div>
  </div>
  <button type="button" class="back-to-top-btn" id="backToTopBtn" aria-label="Back to top" title="Back to top" style="display:none;position:fixed;bottom:24px;right:24px;z-index:99;width:44px;height:44px;border-radius:50%;background:var(--primary);color:#fff;border:none;box-shadow:0 4px 14px rgba(0,0,0,0.25);cursor:pointer;align-items:center;justify-content:center;transition:opacity 0.2s ease,transform 0.2s ease;">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M18 15l-6-6-6 6"/></svg>
  </button>
  <script>
    (function(){{
      var btn = document.getElementById('backToTopBtn');
      if (!btn) return;
      window.addEventListener('scroll', function(){{
        if (window.scrollY > 300) {{
          btn.style.display = 'flex';
        }} else {{
          btn.style.display = 'none';
        }}
      }});
      btn.addEventListener('click', function(){{
        window.scrollTo({{ top: 0, behavior: 'smooth' }});
      }});
    }})();
  </script>
</footer>"""


def cat_id(c):
    return c.lower().replace(" ", "-")

def card_cat_class(cat):

    c = cat.lower()

    if "pdf" in c:

        return "cat-pdf"

    elif "image" in c:

        return "cat-image"

    elif "calc" in c:

        return "cat-calc"

    else:

        return "cat-dev"



def tool_icon(slug):

    icons = {

        # Image Tools (Teal/Emerald)

        "compress-image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M4 14h6m0 0v6m0-6L3 21" stroke-width="2.2"/><path d="M20 10h-6m0 0V4m0 6l7-7" stroke-width="2.2"/><circle cx="15.5" cy="15.5" r="2" fill="currentColor"/></svg>',

        "png-to-jpg": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="8.5" r="2" fill="currentColor"/><path d="M21 15l-5-5L5 21" fill="currentColor" fill-opacity="0.25"/><path d="M14 6l4 3-4 3" stroke-width="2.2"/></svg>',

        "jpg-to-png": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M3 15l5-5 4 4 3-3 6 6" fill="currentColor" fill-opacity="0.25"/><circle cx="16" cy="8" r="2" fill="currentColor"/><path d="M10 6L6 9l4 3" stroke-width="2.2"/></svg>',

        "webp-to-jpg": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>',

        "convert-to-webp": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><polygon points="13 3 4 14 11 14 10 22 20 11 13 11 13 3" fill="currentColor" fill-opacity="0.4" stroke-width="1.8"/></svg>',

        "resize-image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M15 3h6v6m-6 0l6-6" stroke-width="2.2"/><path d="M9 21H3v-6m6 0l-6 6" stroke-width="2.2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',



        # PDF Tools (Red/Rose)

                "compress-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6m-3 3l3-3 3 3" stroke-width="2.2"/><circle cx="12" cy="15" r="4.5" fill="currentColor" fill-opacity="0.2"/></svg>',

        "pdf-to-image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><circle cx="9" cy="14" r="1.5" fill="currentColor"/><polyline points="16 17 13 13 8 18" stroke-width="1.8"/></svg>',


        "merge-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 3 14 8 19 8"/><circle cx="12" cy="15" r="4" fill="currentColor" fill-opacity="0.25"/><path d="M12 13v4m-2-2h4" stroke-width="2.2"/></svg>',

        "split-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><circle cx="9" cy="14" r="2" fill="currentColor"/><circle cx="9" cy="18" r="2" fill="currentColor"/><path d="M16 12L11 15m5 5l-5-3" stroke-width="2"/></svg>',

        "rotate-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="4" width="14" height="16" rx="2" fill="currentColor" fill-opacity="0.18"/><path d="M21 8A9 9 0 0 0 6.3 5.3L4 7.5" stroke-width="2.2"/><polyline points="4 3 4 8 9 8" fill="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',

        "delete-pdf-pages": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="4.5" fill="currentColor" fill-opacity="0.25"/><line x1="9.5" y1="15" x2="14.5" y2="15" stroke-width="2.5"/></svg>',

        "jpg-to-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><circle cx="9.5" cy="13.5" r="1.5" fill="currentColor"/><path d="M16 18l-3-3-4 3" fill="currentColor" fill-opacity="0.3"/></svg>',

        "pdf-to-text": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13" stroke-width="2.2"/><line x1="16" y1="17" x2="8" y2="17" stroke-width="2.2"/><polyline points="10 9 9 9 8 9" stroke-width="2.2"/></svg>',



        # Calculators (Amber/Orange)

        "percentage-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fill-opacity="0.18"/><line x1="18" y1="6" x2="6" y2="18" stroke-width="2.5"/><circle cx="8" cy="8" r="2.2" fill="currentColor"/><circle cx="16" cy="16" r="2.2" fill="currentColor"/></svg>',

        "age-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M3 9h18" stroke-width="2"/><path d="M8 2v4M16 2v4" stroke-width="2.2"/><circle cx="12" cy="15" r="3.5" fill="currentColor" fill-opacity="0.3"/><polyline points="12 13.5 12 15 13.5 15" stroke-width="1.8"/></svg>',

        "bmi-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1 7.8 7.8 7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" fill="currentColor" fill-opacity="0.22"/><polyline points="3.5 12 7.5 12 10 8 13.5 16 16 12 20.5 12" stroke-width="2"/></svg>',

        "loan-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="2" width="16" height="20" rx="3" fill="currentColor" fill-opacity="0.18"/><rect x="7" y="5" width="10" height="4" rx="1" fill="currentColor" fill-opacity="0.3"/><circle cx="8" cy="13" r="1.2" fill="currentColor"/><circle cx="12" cy="13" r="1.2" fill="currentColor"/><circle cx="16" cy="13" r="1.2" fill="currentColor"/><circle cx="8" cy="17" r="1.2" fill="currentColor"/><circle cx="12" cy="17" r="1.2" fill="currentColor"/><circle cx="16" cy="17" r="1.2" fill="currentColor"/></svg>',



        # Dev & Text Tools (Indigo/Violet)

        "svg-to-png": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" fill-opacity="0.22"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/><circle cx="12" cy="7" r="1.8" fill="currentColor"/></svg>',

        "base64-tool": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M7 8l-3 4 3 4M17 8l3 4-3 4" stroke-width="2.2"/><circle cx="10.5" cy="12" r="1.2" fill="currentColor"/><circle cx="13.5" cy="12" r="1.2" fill="currentColor"/></svg>',

        "remove-exif": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.2"/><circle cx="12" cy="10" r="3" fill="currentColor" fill-opacity="0.3"/><line x1="9" y1="15" x2="15" y2="15" stroke-width="2"/></svg>',

        "word-counter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="currentColor" fill-opacity="0.18"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13" stroke-width="2.2"/><line x1="8" y1="17" x2="13" y2="17" stroke-width="2.2"/><rect x="8" y="9" width="3" height="1.8" rx="0.5" fill="currentColor"/></svg>',

        "json-formatter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M8 8c-1.5 0-2 .8-2 2v1c0 .8-.5 1.5-1 1.5.5 0 1 .7 1 1.5v1c0 1.2.5 2 2 2" stroke-width="2"/><path d="M16 8c1.5 0 2 .8 2 2v1c0 .8.5 1.5 1 1.5-.5 0-1 .7-1 1.5v1c0 1.2-.5 2-2 2" stroke-width="2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>',

        "qr-code-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.25"/><rect x="5" y="5" width="3" height="3" fill="currentColor"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.25"/><rect x="16" y="5" width="3" height="3" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor" fill-opacity="0.25"/><rect x="5" y="16" width="3" height="3" fill="currentColor"/><rect x="14" y="14" width="3" height="3" fill="currentColor"/><rect x="18" y="18" width="3" height="3" fill="currentColor"/><rect x="14" y="18" width="2" height="2" fill="currentColor"/><rect x="18" y="14" width="2" height="2" fill="currentColor"/></svg>',



        # Batch 1: Text & Writing Tools

        "text-case-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 7H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2m0-10v10m0-10h6m0 10H9m6 0h2a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2m0 10V7"/></svg>',

        "text-tools": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h7"/></svg>',

        "find-replace": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',

        "text-compare": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h4m6-18h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4m-3-9H9"/></svg>',

        "lorem-ipsum": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 6h16M4 10h16M4 14h8"/></svg>',

        "slug-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',

        "markdown-editor": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 1 2-2v-7"/></svg>',

        "extract-emails": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"/></svg>',

        "morse-code": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 19V6l12-3v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/></svg>',

        "word-frequency": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2v-4M9 21H5a2 2 0 0 1-2-2v-4m0 0h18"/></svg>',



        # Round 3 New Tools Icons

        "html-formatter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 9l-3 3 3 3"/><path d="M16 9l3 3-3 3"/><path d="M13 7l-2 10"/></svg>',

        "css-formatter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 7h8M8 12h5M8 17h8"/><circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="5" cy="17" r="1" fill="currentColor"/></svg>',

        "json-tree-viewer": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="7" cy="7" r="2" fill="currentColor"/><circle cx="17" cy="7" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 7h6M7 9v8h8"/></svg>',

        "tip-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 7v10M9 9h6M9 15h6"/><circle cx="12" cy="12" r="3" fill="currentColor" fill-opacity="0.25"/></svg>',

        "split-bill-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 3v18M7 8l-3 3 3 3M17 8l3 3-3 3"/></svg>',

        "vat-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M6 8l4 8 4-8"/><path d="M16 12h4M18 10v4"/></svg>',

        "grade-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M9 12l2 2 4-4M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>',

        "timezone-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 6v6l4 2"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><path d="M2 12h3M19 12h3"/></svg>',

        "countdown-timer": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.18"/><path d="M12 9v4l3 2"/><path d="M10 2h4M5 5l2 2M19 5l-2 2"/></svg>',

        "wifi-qr-code-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M5 12.5a10 10 0 0114 0"/><path d="M8.5 15.5a5 5 0 017 0"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>',

        "resize-multiple-images": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="6" width="14" height="14" rx="2" fill="currentColor" fill-opacity="0.18"/><path d="M8 2h12a2 2 0 012 2v12"/><path d="M5 13l3-3 4 4"/></svg>',

        "convert-multiple-images": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 7h8l-2-2m2 2l-2 2"/><path d="M16 17H8l2 2m-2-2l2-2"/></svg>',

        "compress-multiple-images": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M4 10h5m0 0V5m0 5L3 4"/><path d="M20 14h-5m0 0v5m0-5l6 6"/></svg>',

        "duplicate-pdf-pages": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="11" height="14" rx="2" fill="currentColor" fill-opacity="0.18"/><rect x="9" y="8" width="11" height="14" rx="2"/></svg>',

        "scientific-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="7" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="8" r="1" fill="currentColor"/><circle cx="17" cy="8" r="1" fill="currentColor"/><path d="M7 14l3 4m0-4l-3 4M14 14h4M14 18h4"/></svg>',

        "random-number-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M16 8h4v4m0-4l-6 6M8 16H4v-4m0 4l6-6"/></svg>',

        "pomodoro-timer": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.18"/><path d="M12 9v4l2 2"/><path d="M12 5V2M10 2h4M8 4l2 1M16 4l-2 1"/></svg>',

        "text-to-speech": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 9H5v6h3l5 4V5L8 9z"/><path d="M16 9a4 4 0 010 6M18 7a7 7 0 010 10"/></svg>',

        "random-picker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 4l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "dice-roller": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="16" cy="8" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="8" cy="16" r="1.5" fill="currentColor"/><circle cx="16" cy="16" r="1.5" fill="currentColor"/></svg>',

        "coin-flip": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><circle cx="12" cy="12" r="6"/><path d="M12 9v6M10 10h4"/></svg>',

        "calorie-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 4c2 3 5 5 5 9a5 5 0 01-10 0c0-4 3-6 5-9z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "typing-speed-test": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M6 10h2M10 10h2M14 10h2M18 10h0M7 14h10"/></svg>',

        "body-fat-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="6" r="3" fill="currentColor" fill-opacity="0.18"/><path d="M6 21v-4a6 6 0 0112 0v4M4 14h16"/></svg>',

        "sleep-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" fill-opacity="0.18"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="19" cy="5" r="0.8" fill="currentColor"/></svg>',

        "pregnancy-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 7a4 4 0 00-4 4c0 3 4 6 4 6s4-3 4-6a4 4 0 00-4-4z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "fraction-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M6 12h12M9 7h2M13 17h2"/><circle cx="10" cy="7" r="1.5" fill="currentColor"/><circle cx="14" cy="17" r="1.5" fill="currentColor"/></svg>',

        "speed-distance-time": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 12l4-4M6 12a6 6 0 0112 0"/></svg>',

        "investment-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 16l4-4 3 3 5-6M19 9v4h-4"/></svg>',

        "retirement-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 6v6l3 3M8 3l1 2M16 3l-1 2"/></svg>',

        "zakat-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "electricity-bill-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M13 3L6 14h6l-1 7 8-11h-6l1-7z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "statistics-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 17v-4M12 17v-8M17 17v-6M4 19h16"/></svg>',

        "number-to-words": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 9h2v6M14 9h3v6h-3M14 12h2"/></svg>',

        "reaction-time-test": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M13 7l-4 6h5l-2 5"/></svg>',

        "click-speed-test": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="3" width="14" height="18" rx="7" fill="currentColor" fill-opacity="0.18"/><path d="M12 3v6M12 6h4"/></svg>',

        "password-strength-checker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="10" width="16" height="11" rx="2" fill="currentColor" fill-opacity="0.18"/><path d="M8 10V7a4 4 0 118 0v3M12 14v3"/></svg>',

        "random-name-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="7" r="4" fill="currentColor" fill-opacity="0.18"/><path d="M5 21v-2a7 7 0 0114 0v2M17 11l2 2 4-4"/></svg>',

        "love-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "text-repeater": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 8h10M7 12h10M7 16h6M17 14l2 2-2 2"/></svg>',

        "alarm-clock": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.18"/><path d="M12 9v4l2.5 1.5M4 4l3 3M20 4l-3 3M12 4V2"/></svg>',

        "metronome": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21l4-17h4l4 17H6z" fill="currentColor" fill-opacity="0.18"/><path d="M12 17l4-9M12 21v-4"/></svg>',



        "tone-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M5 12c2.5-6 4.5-6 7 0s4.5 6 7 0"/></svg>',

        "audio-cutter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="6" cy="18" r="2"/><circle cx="6" cy="6" r="2"/><path d="M8 7.5l10 9M8 16.5l10-9"/></svg>',

        "webp-to-png": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M4 14l5-5 4 4 3-3 4 4"/><circle cx="9" cy="8" r="1.5" fill="currentColor"/></svg>',

        "merge-images": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="8" height="16" rx="2" fill="currentColor" fill-opacity="0.18"/><rect x="13" y="4" width="8" height="16" rx="2"/><path d="M7 11h2M17 11h2"/></svg>',

        "color-contrast-checker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 3v18a9 9 0 000-18z" fill="currentColor"/></svg>',

        "color-palette-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="7" cy="8" r="2" fill="currentColor"/><circle cx="12" cy="8" r="2"/><circle cx="17" cy="8" r="2"/><circle cx="9.5" cy="15" r="2"/><circle cx="14.5" cy="15" r="2"/></svg>',

        "period-tracker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="12" cy="15" r="2" fill="currentColor"/></svg>',





        # Missing Icons Fixed

        "reorder-pdf": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><path d="M9 13l2-2 2 2M11 11v6M15 15l-2 2-2-2"/></svg>',

        "pdf-page-numbers": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><rect x="8" y="13" width="8" height="5" rx="1.5" fill="currentColor" fill-opacity="0.25"/><path d="M10 16h4"/></svg>',

        "pdf-watermark": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><rect x="6" y="11" width="12" height="5" rx="1" transform="rotate(-15 12 13.5)" stroke-dasharray="2 2" fill="currentColor" fill-opacity="0.2"/></svg>',

        "pdf-info": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><circle cx="12" cy="15" r="3" fill="currentColor" fill-opacity="0.25"/><path d="M12 14v2M12 12h.01"/></svg>',

        "pdf-text": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></svg>',

        "pdf-crop": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill="currentColor" fill-opacity="0.18"/><path d="M14 2v6h6"/><path d="M9 11v6h6" stroke-dasharray="2 1"/><path d="M8 13h8"/></svg>',

        "file-info": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="11" cy="11" r="4"/><path d="M14 14l5 5"/></svg>',

        "csv-viewer": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',

        "tsv-csv": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 7h8l-2-2m2 2l-2 2M16 17H8l2 2m-2-2l2-2"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>',

        "gzip-tool": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 8v13H3V8" fill="currentColor" fill-opacity="0.18"/><path d="M1 3h22v5H1z"/><path d="M10 12h4v3h-4z"/></svg>',

        "data-uri": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 8l-3 4 3 4M17 8l3 4-3 4M13 7l-2 10"/></svg>',

        "barcode-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M6 7v10M9 7v10M12 7v10M14 7v10M17 7v10M18 7v10"/></svg>',

        "invoice-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fill-opacity="0.18"/><path d="M8 7h8M8 11h8M8 15h4M15 15h1"/></svg>',

        "receipt-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 2v20l3-2 3 2 3-2 3 2 4-2V2H4z" fill="currentColor" fill-opacity="0.18"/><path d="M8 7h8M8 11h6M8 15h8"/></svg>',

        "resume-builder": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="3" width="16" height="18" rx="2" fill="currentColor" fill-opacity="0.18"/><circle cx="9" cy="8" r="2" fill="currentColor"/><path d="M13 7h4M13 10h4M7 14h10M7 17h8"/></svg>',

        "business-card": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="11" r="2" fill="currentColor"/><path d="M12 9h6M12 13h4"/></svg>',

        "certificate-maker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2" fill="currentColor" fill-opacity="0.18"/><circle cx="12" cy="11" r="3" fill="currentColor" fill-opacity="0.25"/><path d="M10 14l-1 4 3-2 3 2-1-4"/></svg>',

        "signature-maker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 4l-4 4-9 9-4 1 1-4 9-9 4-4a2.8 2.8 0 114 4z" fill="currentColor" fill-opacity="0.18"/><path d="M3 21c3-2 5-1 8-3"/></svg>',

        "social-post-maker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="9" r="2" fill="currentColor"/><path d="M12 9h5M6 14h12"/></svg>',

        "og-image-maker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="3" fill="currentColor" fill-opacity="0.18"/><circle cx="8" cy="10" r="2" fill="currentColor"/><path d="M21 16l-5-5-4 4-2-2-7 7"/></svg>',

        "search-preview": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="currentColor" fill-opacity="0.18"/><path d="M20 20l-4-4M8 11h6M8 8h3"/></svg>',

        "keyword-density": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" fill="currentColor" fill-opacity="0.18"/><circle cx="7" cy="7" r="2" fill="currentColor"/></svg>',

        "robots-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="8" width="16" height="12" rx="3" fill="currentColor" fill-opacity="0.18"/><circle cx="9" cy="13" r="1.5" fill="currentColor"/><circle cx="15" cy="13" r="1.5" fill="currentColor"/><path d="M12 4v4M9 4h6M10 17h4"/></svg>',

        "sitemap-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="3" width="6" height="4" rx="1" fill="currentColor" fill-opacity="0.25"/><rect x="3" y="15" width="5" height="4" rx="1"/><rect x="10" y="15" width="5" height="4" rx="1"/><rect x="17" y="15" width="5" height="4" rx="1"/><path d="M12 7v4M5 11h14v4M5 15v-4M12 15v-4M19 15v-4"/></svg>',

        "meta-tags-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 9l-3 3 3 3M16 9l3 3-3 3M13 7l-2 10"/></svg>',





        "power-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "frequency-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M2 12c3-8 5-8 8 0s5 8 8 0 3-8 4-8"/></svg>',





        "webp-to-jpg": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 15l3-3 2 2 4-4"/><path d="M17 14v4h-4"/></svg>',

        "timezone-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 7v5l3 2"/><path d="M3 12h18M12 3a15.3 15.3 0 014 9 15.3 15.3 0 01-4 9 15.3 15.3 0 01-4-9 15.3 15.3 0 014-9z"/></svg>',

        "coin-flip": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 7v10M9 9.5a3 3 0 016 0c0 2-3 2.5-3 4.5"/></svg>',

        "speed-distance-time": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 12l4-4M8 12a4 4 0 018 0"/><path d="M6 18h12"/></svg>',

        "retirement-calculator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M7 14l3-3 3 2 4-5M17 8h-4"/></svg>',

        "reaction-time-test": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M13 3L4 14h7l-1 7 9-11h-7l1-7z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "color-contrast-checker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 3v18a9 9 0 000-18z" fill="currentColor" fill-opacity="0.3"/></svg>',



        "text-tools": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 8h10M7 12h7M7 16h4"/></svg>',

        "binary-text": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><rect x="6" y="7" width="4" height="10" rx="2"/><path d="M15 7v10M13 9l2-2"/></svg>',

        "sql-formatter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="5" rx="8" ry="3" fill="currentColor" fill-opacity="0.18"/><path d="M4 5v14c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 12c0 1.66 3.58 3 8 3s8-1.34 8-3"/><path d="M12 15l2 2 4-4"/></svg>',

        "uuid-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><rect x="7" y="7" width="3" height="3"/><rect x="14" y="7" width="3" height="3"/><rect x="7" y="14" width="3" height="3"/><path d="M14 14h3v3h-3z"/></svg>',

        "find-replace": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="6" fill="currentColor" fill-opacity="0.18"/><path d="M14.5 14.5L20 20M7 9h6l-2-2m2 2l-2 2M13 11H7l2 2m-2-2l2-2"/></svg>',

        "regex-tester": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 6v12M17 6v12M12 8v8M9.5 10.5l5 3M9.5 13.5l5-3"/></svg>',

        "slug-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" fill="currentColor" fill-opacity="0.18"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71M9 12h6"/></svg>',

        "html-text-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 8l-3 4 3 4M13 10h6M13 14h4"/></svg>',

        "url-encoder": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M9 15L15 9"/><circle cx="9.5" cy="9.5" r="1.5" fill="currentColor"/><circle cx="14.5" cy="14.5" r="1.5" fill="currentColor"/></svg>',

        "markdown-editor": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M6 15V9l3 3 3-3v6M17 12l-2 3-2-3M15 9v6"/></svg>',

        "html-encoder": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13 7l-2 10"/></svg>',

        "word-frequency": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M7 17v-4M12 17v-8M17 17v-11"/></svg>',

        "csv-json": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5h8v14H3z" fill="currentColor" fill-opacity="0.18"/><path d="M3 10h8M3 14h8M7 5v14M16 8c-1 0-1.5-.5-1.5-1.5V5M16 16c-1 0-1.5.5-1.5 1.5V19M19 12h-4"/></svg>',

        "number-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M9 8h6M9 12h6M9 16h6M8 8l-1 8M17 8l-1 8"/></svg>',

        "password-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M8 11V7a4 4 0 018 0v4M12 15v2"/></svg>',

        "hash-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.18"/><path d="M9 12l2 2 4-4"/></svg>',

        "jwt-decoder": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><circle cx="9" cy="10" r="2"/><path d="M15 8h3M15 12h3M6 16h12"/></svg>',

        "timestamp-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="currentColor" fill-opacity="0.18"/><path d="M12 9v4l2.5 2M10 2h4M12 2v3"/></svg>',

        "cron-generator": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="17" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M12 14a2.5 2.5 0 102.5 2.5"/></svg>',

        "json-to-typescript": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M6 9h6M9 9v8M14 15c.5.7 1.2 1 2 1s1.5-.4 1.5-1-.5-.9-1.5-1.2l-.5-.2c-1.3-.4-2-1-2-2.1 0-1.3 1-2.2 2.5-2.2 1 0 1.8.4 2.3 1"/></svg>',

        "css-box-shadow": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="8" width="13" height="13" rx="2" fill="currentColor" fill-opacity="0.18" stroke-dasharray="2 2"/><rect x="3" y="3" width="13" height="13" rx="2" fill="currentColor" fill-opacity="0.3"/></svg>',

        "color-converter": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/><path d="M12 3a9 9 0 019 9h-9V3z" fill="currentColor" fill-opacity="0.35"/><circle cx="12" cy="12" r="3"/></svg>',

        "css-gradient": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M3 15l12-12M3 21l18-18M9 21l12-12"/></svg>',

        "image-base64": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M14 13l2-2 4 4M3 17l5-5 4 4"/></svg>',

        "add-text-image": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M8 9h8M12 9v8M10 17h4"/></svg>',

        "gif-maker": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="3" fill="currentColor" fill-opacity="0.18"/><path d="M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4M10 12l4-2.5v5L10 12z" fill="currentColor" fill-opacity="0.25"/></svg>',

        "equation-solver": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3.5" fill="currentColor" fill-opacity="0.18"/><path d="M4 12h16M12 4v16"/><path d="M7 16c2-8 3-8 5 0s3 8 5 0"/></svg>',



    }

    if slug in icons:

        return icons[slug]

    if slug in BY_SLUG and BY_SLUG[slug].get("icon"):

        return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="{BY_SLUG[slug]["icon"]}"/></svg>'

    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.18"/></svg>'



def card(p):

    badge = f'<span class="card-badge new">{e(p["badge"])}</span>' if p.get("badge") else f'<span class="card-badge">{e(p["cat"].split()[0])}</span>'

    cat_cls = card_cat_class(p["cat"])

    icon_svg = tool_icon(p["slug"])

    return f"""<a class="card {cat_cls}" href="/{p['slug']}/" data-category="{cat_id(p['cat'])}">

  <div class="card-top-row">

    <div class="card-icon-box {cat_cls}" aria-hidden="true">

      {icon_svg}

    </div>

    {badge}

  </div>

  <strong>{e(p['label'])}</strong>

  <span>{e(p['blurb'])}</span>

</a>"""



# ----------------------------------------------------------------------------
# TIER 1 LONG-FORM CONTENT (Argon Phase 2)
# ----------------------------------------------------------------------------
# Optional per-tool Markdown files live in content/tools/<slug>.md. When one
# exists, its sections render on that tool's page; tools without a file render
# exactly as before.

CONTENT_DIR = os.path.join(HERE, "content", "tools")


def _md_inline(text):
    """Escape HTML, then render **bold** inline."""
    out = e(text)
    out = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", out)
    return out


def _md_blocks(text):
    """Render a small Markdown subset (paragraphs, **bold**, - lists, 1. lists)."""
    parts = []
    lines = text.split("\n")
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        if not line.strip():
            i += 1
            continue
        if line.startswith("- "):
            items = []
            while i < len(lines) and lines[i].strip().startswith("- "):
                items.append("<li>" + _md_inline(lines[i].strip()[2:].strip()) + "</li>")
                i += 1
            parts.append("<ul>" + "".join(items) + "</ul>")
            continue
        if re.match(r"^\d+\.\s", line):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i].strip()):
                items.append("<li>" + _md_inline(re.sub(r"^\d+\.\s", "", lines[i].strip())) + "</li>")
                i += 1
            parts.append("<ol>" + "".join(items) + "</ol>")
            continue
        buf = [line.strip()]
        i += 1
        while i < len(lines) and lines[i].strip() and not lines[i].strip().startswith("- ") and not re.match(r"^\d+\.\s", lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        parts.append("<p>" + _md_inline(" ".join(buf)) + "</p>")
    return "".join(parts)


def _parse_faq_section(text):
    """Parse a FAQ section: a **Question?** paragraph followed by its answer."""
    entries = []
    paras = [p.strip() for p in re.split(r"\n\s*\n", text.strip()) if p.strip()]
    j = 0
    while j < len(paras):
        m = re.fullmatch(r"\*\*(.+?)\*\*", paras[j], flags=re.S)
        if m and j + 1 < len(paras):
            entries.append((m.group(1).strip(), paras[j + 1]))
            j += 2
        else:
            j += 1
    return entries


def load_longform(slug):
    """Return (sections, faq_entries) for a tool, or ([], []) when no .md exists."""
    path = os.path.join(CONTENT_DIR, slug + ".md")
    if not os.path.isfile(path):
        return [], []
    with open(path, encoding="utf-8") as f:
        text = f.read()
    chunks = re.split(r"(?m)^##\s+(.+)$", text)
    sections = []
    faq_entries = []
    for k in range(1, len(chunks) - 1, 2):
        heading = chunks[k].strip()
        body = chunks[k + 1]
        if heading.lower().startswith("frequently asked"):
            faq_entries = _parse_faq_section(body)
        else:
            sections.append((heading, _md_blocks(body)))
    return sections, faq_entries


def tool_page(p):

    path = f"/{p['slug']}/"

    url = abs_url(path)

    cat_cls = card_cat_class(p["cat"])

    icon_svg = tool_icon(p["slug"])

    longform_sections, longform_faqs = load_longform(p["slug"])

    all_faqs = list(p["faqs"]) + longform_faqs

    faq_ld = {

        "@context": "https://schema.org",

        "@type": "FAQPage",

        "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in all_faqs]

    }

    app_ld = {

        "@context": "https://schema.org",

        "@type": "WebApplication",

        "name": p["title"],

        "url": url,

        "description": p["desc"],

        "applicationCategory": p["cat"],

        "operatingSystem": "Any",

        "browserRequirements": "Requires JavaScript",

        "offers": {"@type": "Offer", "price": 0, "priceCurrency": "USD"}

    }

    crumb_ld = {

        "@context": "https://schema.org",

        "@type": "BreadcrumbList",

        "itemListElement": [

            {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("/")},

            {"@type": "ListItem", "position": 2, "name": p["cat"], "item": abs_url("/" + CAT_SLUG[p["cat"]] + "/")},

            {"@type": "ListItem", "position": 3, "name": p["h1"], "item": url}

        ]

    }

    howto_ld = {

        "@context": "https://schema.org",

        "@type": "HowTo",

        "name": f"How to use {p['label']}",

        "description": p["desc"],

        "step": [{"@type": "HowToStep", "position": i + 1, "name": f"Step {i + 1}", "text": step} for i, step in enumerate(p["steps"])]

    }

    d = p.get("defaults")

    defaults_js = '<script>window.TOOL_DEFAULTS=%s;</script>' % json.dumps(d) if d else ""

    vendor = ""

    if p.get("pdf"):

        vendor += '<script src="/vendor/pdf-lib.min.js" defer></script>'

    if "image.js" in p["scripts"] or p["slug"] in ["split-pdf"]:

        vendor += '<script src="/vendor/jszip.min.js" defer></script>'

    for v in p.get("extra_vendor", []):

        vendor += f'<script src="/vendor/{v}" defer></script>'

    scripts = '<script src="/js/common.v2.js" defer></script>' + vendor + "".join(f'<script src="/js/{s.replace(".js", ".v2.js")}" defer></script>' for s in p["scripts"])

    if p.get("autorun"):

        scripts += '<script defer>addEventListener("DOMContentLoaded",function(){setTimeout(function(){var b=document.getElementById("%s");if(b)b.click()},0)});</script>' % p["autorun"]



    steps = "".join(f"<li>{e(s)}</li>" for s in p["steps"])

    about = "".join(f"<p>{e(a)}</p>" for a in p["about"])

    faqs = "".join(f"<details><summary>{e(q)}</summary><p>{e(a)}</p></details>" for q, a in all_faqs)

    longform = "".join("<div><h2>" + e(h) + "</h2>" + html + "</div>" for h, html in longform_sections)

    related = "".join(card(BY_SLUG[s]) for s in p["related"] if s in BY_SLUG)

    chain_slugs = [s for s in CHAINS.get(p["slug"], []) if s in BY_SLUG and s != p["slug"]][:3]
    if len(chain_slugs) < 2:
        chain_slugs = [s for s in p["related"] if s in BY_SLUG and s != p["slug"]][:3]
    if chain_slugs:
        chain_links = ' <span class="chain-arrow" aria-hidden="true">&rarr;</span> '.join(f'<a href="/{s}/">{e(BY_SLUG[s]["label"])}</a>' for s in chain_slugs)
        chain_section = f"""<section class="tool-chain-section" aria-label="Next steps">
  <h2>Next Step</h2>
  <p>Finished with {e(p["label"])}? Continue your workflow:</p>
  <nav class="tool-chain">{chain_links}</nav>
</section>"""
    else:
        chain_section = ""




    extra_ld = [app_ld] + ([faq_ld] if all_faqs else []) + [crumb_ld, howto_ld]

    return head(p["title"], p["desc"], path, extra_ld) + header() + f"""

<main id="main" class="wrap">

  <nav class="crumbs" aria-label="Breadcrumb">

    <a href="/">Home</a> <span>&rsaquo;</span>

    <a href="/{CAT_SLUG[p['cat']]}/">{e(p['cat'])}</a> <span>&rsaquo;</span>

    <span>{e(p['h1'])}</span>

  </nav>



  <div class="tool-header">

    <div class="tool-header-title-row">

      <div class="tool-header-icon-box {cat_cls}" aria-hidden="true">

        {icon_svg}

      </div>

      <div>

        <h1>{e(p['h1'])}</h1>

        <p class="lead">{e(p['lead'])}</p>

      </div>

    </div>

  </div>



  <section class="tool-section" aria-label="{e(p['h1'])} Workspace">

    {p['widget']}

  </section>



  <section class="prose">

    <div>

      <h2>How to Use {e(p['label'])}</h2>

      <ol>{steps}</ol>

    </div>

    <div>

      <h2>Technical Specifications & How It Works</h2>

      {about}

    </div>{longform}

    <div>

      <h2>Frequently Asked Questions</h2>

      {faqs}

    </div>

  </section>



{chain_section}

  <section class="tool-category-section">

    <h2>More Free Browser Tools</h2>

    <div class="cards">{related}</div>

  </section>

</main>

{footer()}

{defaults_js}{scripts}

</body></html>

"""



def hub_page():

    path = "/"

    secs = ""

    for c in CATS:

        category_cards = "".join(card(p) for p in PAGES if p["cat"] == c)

        c_count = len([p for p in PAGES if p["cat"] == c])

        secs += f"""<section class="tool-category-section" id="{cat_id(c)}">

  <h2><span>{e(c)}</span> <span class="category-count">{c_count}</span></h2>

  <div class="cards">{category_cards}</div>

</section>"""



    title = f"{SITE_NAME} - 100% Free, Private Browser Tools: PDF, Image, Calculators & Dev"

    desc = "Free online tools that run 100% in your browser. Compress images, edit PDFs, and format code with zero uploads and total privacy."

    site_ld = {

        "@context": "https://schema.org",

        "@type": "WebSite",

        "inLanguage": "en",

        "name": SITE_NAME,

        "url": abs_url("/"),

        "description": desc,

        "potentialAction": {

            "@type": "SearchAction",

            "target": abs_url("/?q={search_term_string}"),

            "query-input": "required name=search_term_string"

        }

    }



    popular_slugs = [

        "compress-image", "merge-pdf", "split-pdf", "compress-pdf",

        "qr-code-generator", "scientific-calculator", "json-formatter",

        "word-counter", "audio-cutter", "tone-generator",

        "resume-builder", "base64-tool"

    ]

    popular_cards = "".join(card(BY_SLUG[s]) for s in popular_slugs if s in BY_SLUG)

    popular_section = f"""<section class="tool-category-section popular-tools-section" id="popular-tools">

  <h2><span>⭐ Popular Tools</span> <span class="category-count">{len(popular_slugs)}</span></h2>

  <div class="cards">{popular_cards}</div>

</section>"""

    return head(title, desc, path, [site_ld]) + header() + f"""

<main id="main" class="wrap home-main">

  <div class="hero">

    <div class="privacy-counter-pill">

      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.22"/><path d="M9 12l2 2 4-4" stroke-width="2.2"/></svg>

      <span><strong>{len(PAGES)} Free Tools</strong> &bull; <strong>100% Private</strong> &bull; <strong>No Registration Required</strong></span>

    </div>

    <h1>Free Online Tools. 100% Private.</h1>

    <p class="lead">Every tool runs directly in your browser memory &mdash; no uploads, no servers, no sign-up.</p>



    <!-- Real-time search bar -->

    <div class="search-wrapper">

      <div class="search-input-box">

        <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7" fill="currentColor" fill-opacity="0.18"/><line x1="21" y1="21" x2="16" y2="16" stroke-width="2.2"/></svg>

        <input type="search" id="toolSearch" class="search-input" placeholder="Search {len(PAGES)} free browser tools (e.g. compress, merge pdf, json, qr code)…" aria-label="Search tools">

        <span class="search-shortcut" title="Press / to search">/</span>

      </div>

      <div class="filter-pills-bar" role="tablist" aria-label="Filter by tool category">

        <button type="button" class="filter-pill active" data-filter="all" role="tab" aria-selected="true">All Tools ({len(PAGES)})</button>

        {"".join(f'<button type="button" class="filter-pill" data-filter="{cat_id(c)}" role="tab" aria-selected="false">{e(c)} ({len([p for p in PAGES if p["cat"] == c])})</button>' for c in CATS)}

      </div>

    </div>

  </div>



  <div id="noSearchResults" hidden>

    <p><strong>No tools found matching your search.</strong></p>

    <p>Try searching for "pdf", "image", "convert", or "calculator".</p>

  </div>



  {popular_section}



  {secs}



  <section class="trust-grid" aria-label="Toolswick Privacy & Technology Guarantees">

    <div class="trust-card trust-card-shield">

      <div class="trust-icon-box trust-shield" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="currentColor" fill-opacity="0.2"/>

          <path d="M9 12l2 2 4-4" stroke-width="2.2"/>

        </svg>

      </div>

      <h3>100% Client-Side Sandbox</h3>

      <p>All file manipulation executes in your browser's private memory sandbox via WebAssembly and Canvas. Zero bytes are uploaded.</p>

    </div>

    <div class="trust-card trust-card-lock">

      <div class="trust-icon-box trust-lock" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <rect x="3" y="11" width="18" height="11" rx="3" fill="currentColor" fill-opacity="0.2"/>

          <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke-width="2.2"/>

          <circle cx="12" cy="16" r="1.5" fill="currentColor"/>

        </svg>

      </div>

      <h3>Zero-Data Collection</h3>

      <p>No tracking scripts, no session recorders, no tracking cookies, and no registration forms. Complete peace of mind.</p>

    </div>

    <div class="trust-card trust-card-perf">

      <div class="trust-icon-box trust-perf" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="currentColor" fill-opacity="0.25" stroke-width="2"/>

        </svg>

      </div>

      <h3>Web Worker Performance</h3>

      <p>Multi-threaded background workers handle heavy image and document workloads with zero UI stutter or latency.</p>

    </div>

    <div class="trust-card trust-card-free">

      <div class="trust-icon-box trust-free" aria-hidden="true">

        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

          <circle cx="12" cy="12" r="9" fill="currentColor" fill-opacity="0.2"/>

          <polygon points="12 4 14.5 9 20 9.8 16 13.7 17 19.2 12 16.5 7 19.2 8 13.7 4 9.8 9.5 9" fill="currentColor" fill-opacity="0.35" stroke-width="1.8"/>

        </svg>

      </div>

      <h3>Zero-Investment & 100% Free</h3>

      <p>Every tool is free for personal and commercial usage with no subscription paywalls, daily limits, or watermarks.</p>

    </div>

  </section>

</main>

{footer()}

<script src="/js/common.v2.js" defer></script>

</body></html>

"""



def simple_page(slug, title, h1, desc, body):

    path = f"/{slug}/"

    return head(title, desc, path) + header() + f"""

<main id="main" class="wrap">

  <div class="hero">

    <h1>{e(h1)}</h1>

  </div>

  <section class="prose" style="margin-inline:auto">

    {body}

  </section>

</main>

{footer()}

<script src="/js/common.v2.js" defer></script>

</body></html>

"""



def load_category_intro(slug):
    """Return rendered HTML intro for a category, or '' when no .md exists."""
    path = os.path.join(HERE, "content", "categories", slug + ".md")
    if not os.path.isfile(path):
        return ""
    with open(path, encoding="utf-8") as f:
        text = f.read()
    lines = [ln for ln in text.split("\n") if not ln.strip().startswith("#")]
    return _md_blocks("\n".join(lines))


def category_page(cat):
    slug = CAT_SLUG[cat]
    path = f"/{slug}/"
    tools = [p for p in PAGES if p["cat"] == cat]
    cards = "".join(card(p) for p in tools)
    intro = load_category_intro(slug)
    intro_section = f'<section class="prose">{intro}</section>' if intro else ""
    title = f"{cat} - Free & 100% Private - Toolswick"
    desc = f"Free {cat.lower()} that run 100% in your browser. No uploads, no sign-up, no watermarks."
    crumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("/")},
            {"@type": "ListItem", "position": 2, "name": cat, "item": abs_url(path)},
        ],
    }
    return head(title, desc, path, [crumb_ld]) + header() + f"""
<main id="main" class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> <span>&rsaquo;</span>
    <span>{e(cat)}</span>
  </nav>
  <div class="hero">
    <h1>{e(cat)}</h1>
    <p class="lead">{e(desc)}</p>
  </div>
{intro_section}
  <section class="tool-category-section">
    <h2><span>{e(cat)}</span> <span class="category-count">{len(tools)}</span></h2>
    <div class="cards">{cards}</div>
  </section>
</main>
{footer()}
<script src="/js/common.v2.js" defer></script>
</body></html>
"""


def sitemap_page():
    path = "/sitemap/"
    secs = ""
    for c in CATS:
        items = "".join(f'<li><a href="/{p["slug"]}/">{e(p["label"])}</a></li>' for p in PAGES if p["cat"] == c)
        count = len([p for p in PAGES if p["cat"] == c])
        secs += f'<section class="tool-category-section"><h2><span>{e(c)}</span> <span class="category-count">{count}</span></h2><ul class="sitemap-list">{items}</ul></section>'
    title = f"Sitemap - All {len(PAGES)} Free Tools - Toolswick"
    desc = f"Browse all {len(PAGES)} free Toolswick tools by category. Every tool runs 100% in your browser — no uploads, no sign-up."
    crumb_ld = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("/")},
            {"@type": "ListItem", "position": 2, "name": "Sitemap", "item": abs_url(path)},
        ],
    }
    return head(title, desc, path, [crumb_ld]) + header() + f"""
<main id="main" class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a> <span>&rsaquo;</span>
    <span>Sitemap</span>
  </nav>
  <div class="hero">
    <h1>All {len(PAGES)} Free Tools</h1>
    <p class="lead">Every Toolswick tool, grouped by category. All free, all private, all running in your browser.</p>
  </div>
{secs}
</main>
{footer()}
<script src="/js/common.v2.js" defer></script>
</body></html>
"""


def about_body():

    return f"""<p><strong>{e(SITE_NAME)}</strong> is an independent, zero-investment platform offering modern utilities for everyday file manipulation, document editing, and calculations without server dependencies.</p>

<h2>The Client-Side Difference</h2>

<p>Most traditional web converters upload your confidential bank statements, tax forms, family photos, and proprietary documents to unfamiliar remote cloud servers. Once uploaded, you have no technical verification of where your files are stored, how long they persist, or who has access.</p>

<p><strong>Toolswick completely flips this architecture.</strong> Every single tool runs directly inside your local browser using modern client-side standards: WebAssembly, Web Workers, OffscreenCanvas, and typed binary streams. Your files never cross the network boundary.</p>

<h2>Our Core Commitments</h2>

<ul>

  <li><strong>Zero Server Uploads:</strong> 100% in-browser sandboxed processing.</li>

  <li><strong>Zero Tracking & Profiling:</strong> We collect zero personal information, set no tracking cookies, and use no telemetry.</li>

  <li><strong>Free Forever:</strong> No premium tiers, no watermarks, and no sign-ups.</li>

</ul>

<p>Questions or suggestions? Feel free to <a href="/contact/">contact our team</a>.</p>"""



def privacy_body():

    return f"""<p class="hint">Effective Date: {TODAY.strftime('%B %d, %Y').replace(' 0', ' ')}</p>

<h2>1. Absolute Client-Side Privacy Guarantee</h2>

<p>At <strong>{e(SITE_NAME)}</strong>, we operate under a strict <strong>Zero-Data Collection Architecture</strong>. When you use any tool on this website—including compressing images, merging or splitting PDFs, stripping EXIF metadata, or formatting code—<strong>your files never leave your device</strong>.</p>

<p>All file decoding, manipulation, and rendering execute exclusively in temporary volatile memory (RAM) within your web browser sandbox. Once you close the tab or clear your workspace, all in-memory references and Object URLs are immediately revoked.</p>



<h2>2. Complete Absence of Network File Transmission</h2>

<p>Our code contains zero network upload hooks. We do not use <code>fetch</code>, <code>XMLHttpRequest</code>, <code>FormData</code>, <code>WebSocket</code>, or <code>sendBeacon</code> to transmit your documents, images, filenames, or file contents. You can inspect your browser's Network Activity tab at any time to verify that zero bytes of your uploaded files are sent over the internet.</p>



<h2>3. Zero Persistent Client Storage of Files</h2>

<p>Toolswick never persists user files or document contents into persistent client-side storage mechanisms, including <code>localStorage</code>, <code>sessionStorage</code>, <code>IndexedDB</code>, or the Service Worker Cache API.</p>



<h2>4. Server Infrastructure & Edge Logs</h2>

<p>Toolswick is hosted statically on Cloudflare Pages. As with standard internet protocols, Cloudflare's edge CDN servers may automatically log standard connection metadata (such as your IP address, browser user-agent, and requested static URLs like <code>/css/site.css</code>) strictly for network routing, security filtering, and DDoS prevention. Because your documents are processed strictly client-side, Cloudflare edge servers never receive or handle your file data.</p>



<h2>5. Cookies and Local Storage</h2>

<p>The site sets no advertising or tracking cookies. We utilize client-side <code>localStorage</code> solely for two benign user preferences:

<ul>

  <li><code>toolswick_theme</code>: Saves your preferred light or dark mode selection.</li>

  <li><code>toolswick_ops_count</code>: Locally tallies your successful tool uses to power the privacy counter.</li>

  </ul>

These values contain zero personally identifiable information (PII) or device fingerprints.</p>



<h2>6. Advertising Partners</h2>

<p>In the event that Google AdSense is enabled, Google and its advertising partners may use cookies and web beacons to serve non-personalized or personalized ads in accordance with your consent preferences and regional regulations (such as GDPR in the EEA and UK). You may manage your Google ad settings at <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">adssettings.google.com</a>.</p>



<h2>7. Questions & Contact</h2>

<p>If you have any questions or security inquiries regarding our privacy architecture, please contact us at <a href="/contact/">{e(CONTACT_EMAIL)}</a>.</p>"""



def terms_body():

    return f"""<p class="hint">Last Updated: {TODAY.strftime('%B %d, %Y').replace(' 0', ' ')}</p>

<p>By accessing or utilizing <strong>{e(SITE_NAME)}</strong>, you agree to these Terms of Service.</p>

<h2>1. Permitted Use</h2>

<p>Toolswick is provided free of charge for personal, educational, and commercial purposes. You agree not to attempt to reverse engineer, bypass security controls, or launch denial-of-service attacks against the infrastructure.</p>

<h2>2. Disclaimer of Warranties</h2>

<p>All tools, utilities, and calculators are provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind. Financial, currency, loan, and health calculators provide estimates for informational purposes only and do not constitute certified professional, legal, tax, or medical advice.</p>

<h2>3. Limitation of Liability</h2>

<p>To the fullest extent permitted by law, Toolswick and its maintainers shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use of or inability to use this platform.</p>"""



def contact_body():

    return f"""<p>We welcome bug reports, tool suggestions, feedback, and partnership inquiries. Toolswick is committed to providing prompt support to our users worldwide.</p>

<div class="card-box" style="margin-block:20px; display:flex; flex-direction:column; gap:12px">

  <h3 style="margin:0; font-size:16px; color:var(--ink)">Direct Contact Information</h3>

  <p style="margin:0"><strong>Support & Feedback:</strong> <a href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a></p>

  <p style="margin:0"><strong>Privacy & Security Inquiries:</strong> <a href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a></p>

  <p style="margin:0"><strong>Response Time:</strong> We review all messages and typically respond within 24 to 48 business hours.</p>

</div>

<h2>Submitting a Bug Report or Tool Request</h2>

<p>To help us reproduce and fix any issue promptly, please include:</p>

<ul>

  <li>The specific tool you were using (e.g. PDF Splitter, Image Compressor).</li>

  <li>Your operating system (e.g. Windows, macOS, Android, iOS).</li>

  <li>Your browser and version (e.g. Chrome 124, Safari 17, Firefox 125).</li>

  <li>A brief description of what happened versus what you expected.</li>

</ul>

<p>Because Toolswick is 100% private and does not store files, please do not attach confidential personal files to your email.</p>"""



def cookies_body():

    return f"""<p class="hint">Effective Date: {TODAY.strftime('%B %d, %Y').replace(' 0', ' ')}</p>

<p>This Cookie Policy explains how <strong>{e(SITE_NAME)}</strong> ("we", "us", or "our") uses cookies and client-side browser storage when you visit our website.</p>



<h2>1. What Are Cookies?</h2>

<p>Cookies are small text files stored on your computer or mobile device when you browse websites. They are commonly used to remember preferences, ensure efficient site navigation, and enable third-party advertising services.</p>



<h2>2. How Toolswick Uses Local Browser Storage</h2>

<p>Because Toolswick operates on a strict client-side privacy architecture, we do not use cookies to track your personal browsing habits across the web. We use lightweight browser <code>localStorage</code> strictly for benign, non-tracking user preferences:</p>

<ul>

  <li><strong>Theme Selection (<code>toolswick_theme</code>):</strong> Remembers whether you selected Light or Dark mode.</li>

  <li><strong>Privacy Counter (<code>toolswick_ops_count</code>):</strong> Keeps a local count of files processed on your device.</li>

  </ul>



<h2>3. Google AdSense & Third-Party Advertising Cookies</h2>

<p>To keep our online tools 100% free for everyone without subscription paywalls, we may display advertisements served by Google AdSense and its advertising partners:</p>

<ul>

  <li>Third-party vendors, including Google, use cookies to serve ads based on your prior visits to this website or other websites on the internet.</li>

  <li>Google's use of advertising cookies enables it and its partners to serve ads to you based on your visits to Toolswick and other sites.</li>

  <li>You may opt out of personalized advertising by visiting <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</li>

  <li>Alternatively, you can opt out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">aboutads.info</a>.</li>

</ul>



<h2>4. Managing and Disabling Cookies</h2>

<p>You can choose to disable or selectively turn off cookies in your browser settings at any time. Please note that disabling local storage may cause visual settings (like Dark Mode) to reset on page reload.</p>



<h2>5. Questions & Contact</h2>

<p>If you have any questions regarding our cookie practices, please contact us via our <a href="/contact/">Contact Us</a> page or email <a href="mailto:{e(CONTACT_EMAIL)}">{e(CONTACT_EMAIL)}</a>.</p>"""



def disclaimer_body():

    return f"""<p class="hint">Last Updated: {TODAY.strftime('%B %d, %Y').replace(' 0', ' ')}</p>

<p>The information, utilities, converters, and calculation tools provided on <strong>{e(SITE_NAME)}</strong> are offered in good faith for general informational, educational, and convenience purposes only.</p>



<h2>1. General Information Only</h2>

<p>While we make every reasonable effort to ensure that our algorithms, mathematical models, and conversion libraries operate accurately and reflect current standards, Toolswick makes no representations or warranties of any kind—express or implied—regarding the completeness, accuracy, validity, reliability, or availability of any calculated results or file transformations.</p>



<h2>2. No Financial, Health, or Professional Advice</h2>

<p>The financial, loan, and health calculators (such as the Loan Calculator, Percentage Calculator, and BMI Calculator) provide estimates based solely on the mathematical formulas and inputs you provide. They do not constitute financial, legal, investment, tax, or medical advice. Always consult a licensed and qualified professional before making significant financial, medical, or legal decisions.</p>



<h2>3. User Responsibility & File Integrity</h2>

<p>All file processing operations—including image compression, PDF merging, page extraction, format conversions, and EXIF metadata stripping—are executed 100% locally on your machine. Toolswick does not keep or back up copies of your documents. Users are strongly encouraged to retain unaltered backup copies of important files prior to performing destructive operations (such as page deletion or lossy compression).</p>



<h2>4. Third-Party Links & Advertisements</h2>

<p>Toolswick may display advertisements or links to third-party websites (such as Google AdSense). We do not control, endorse, or assume responsibility for the content, privacy policies, or practices of any third-party websites.</p>



<h2>5. Contact Us</h2>

<p>If you identify any discrepancy or error in our calculations or tool results, please let us know via our <a href="/contact/">Contact Page</a>.</p>"""



def not_found():

    return head("Page Not Found (404) - Toolswick", "The requested page does not exist.", "/404.html", robots="noindex") + header() + f"""

<main id="main" class="wrap" style="text-align:center; padding-block:64px">

  <div class="hero">

    <h1>Page Not Found (404)</h1>

    <p class="lead">The page or tool you are looking for does not exist. Browse our free tools below.</p>

  </div>

  <section class="tool-category-section" style="margin-top:24px">

    <div class="cards">{''.join(card(p) for p in PAGES)}</div>

  </section>

</main>

{footer()}

<script src="/js/common.v2.js" defer></script>

</body></html>

"""



# ----------------------------------------------------------------------------

# CLOUDFLARE PAGES HTTP SECURITY HEADERS (_headers)

# ----------------------------------------------------------------------------

def generate_headers_file():

    """Generates production-grade HTTP security headers for Cloudflare Pages."""

    csp_directives = [

        "default-src 'self'",

        "script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com https://*.google.com https://*.googlesyndication.com",

        "style-src 'self' 'unsafe-inline'",

        "img-src 'self' data: blob: https:",

        "font-src 'self'",

        "worker-src 'self' blob:",

        "child-src 'self' blob:",

        "frame-src 'self' blob: https://*.google.com https://*.googlesyndication.com",

        "connect-src 'self' https://*.google.com https://*.googlesyndication.com",

        "object-src 'none'",

        "frame-ancestors 'none'",

        "base-uri 'self'",

        "form-action 'self'"

    ]

    csp_header = "; ".join(csp_directives)



    permissions_policy = (

        "accelerometer=(), autoplay=(), camera=(self), display-capture=(self), "

        "fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), "

        "microphone=(self), midi=(), payment=(), screen-wake-lock=(), usb=()"

    )



    headers_content = f"""/*

  X-Content-Type-Options: nosniff

  X-Frame-Options: DENY

  Referrer-Policy: strict-origin-when-cross-origin

  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

  Permissions-Policy: {permissions_policy}

  Content-Security-Policy: {csp_header}



/css/*

  Cache-Control: public, max-age=14400, must-revalidate



/js/*

  Cache-Control: public, max-age=14400, must-revalidate



/vendor/*

  Cache-Control: public, max-age=31536000, immutable

"""

    return headers_content



# ----------------------------------------------------------------------------

# BUILD EXECUTION PIPELINE

# ----------------------------------------------------------------------------

def write(rel, content):

    full = os.path.join(DIST, rel)

    os.makedirs(os.path.dirname(full), exist_ok=True)

    with open(full, "w", encoding="utf-8") as f:

        f.write(content)



def main():

    print("=" * 60)

    print("TOOLSWICK BUILD PIPELINE: Starting production build...")

    print("=" * 60)



    # 1. Clean dist directory

    if os.path.isdir(DIST):

        shutil.rmtree(DIST)

    os.makedirs(DIST)



    # 2. Copy static source assets

    shutil.copytree(os.path.join(HERE, "js"), os.path.join(DIST, "js"))

    for f in os.listdir(os.path.join(HERE, "js")):

        if f.endswith(".js") and not f.endswith(".v2.js"):

            shutil.copy(os.path.join(HERE, "js", f), os.path.join(DIST, "js", f.replace(".js", ".v2.js")))

    shutil.copytree(os.path.join(HERE, "vendor"), os.path.join(DIST, "vendor"))

    os.makedirs(os.path.join(DIST, "css"))

    shutil.copy(os.path.join(HERE, "site.css"), os.path.join(DIST, "css", "site.css"))
    shutil.copy(os.path.join(HERE, "site.css"), os.path.join(DIST, "css", "site.v2.css"))



    # 3. Write Cloudflare Pages security headers

    write("_headers", generate_headers_file())



    # 4. Generate core hub and tool pages

    write("index.html", hub_page())

    for p in PAGES:

        write(f"{p['slug']}/index.html", tool_page(p))



    # 5. Generate information pages

    write("about/index.html", simple_page("about", f"About {SITE_NAME} - 100% Private Browser Tools", f"About {SITE_NAME}", f"Learn about {SITE_NAME}'s client-side privacy architecture and zero-data collection guarantee.", about_body()))

    write("privacy/index.html", simple_page("privacy", f"Privacy Policy - {SITE_NAME}", "Privacy Policy", f"How {SITE_NAME} guarantees 100% client-side privacy, zero server storage, and zero data tracking.", privacy_body()))

    write("terms/index.html", simple_page("terms", f"Terms of Service - {SITE_NAME}", "Terms of Service", f"Terms and conditions for utilizing {SITE_NAME} browser utilities.", terms_body()))

    write("contact/index.html", simple_page("contact", f"Contact Us - {SITE_NAME}", "Contact Toolswick", f"Get in touch with {SITE_NAME} for inquiries, suggestions, and bug reports.", contact_body()))

    write("cookies/index.html", simple_page("cookies", f"Cookie Policy - {SITE_NAME}", "Cookie Policy", f"Information regarding cookies and local storage usage on {SITE_NAME}.", cookies_body()))

    write("disclaimer/index.html", simple_page("disclaimer", f"Disclaimer - {SITE_NAME}", "Disclaimer", f"Important disclaimers and limitations of liability regarding {SITE_NAME} tools.", disclaimer_body()))

    write("404.html", not_found())

    # 5b. Generate Phase 4 category landing pages + HTML sitemap page
    for c in CATS:
        write(f"{CAT_SLUG[c]}/index.html", category_page(c))
    write("sitemap/index.html", sitemap_page())



    # 6. Generate Favicon SVG (modern, clean Toolswick icon)

    write("favicon.svg", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#0d9488"/><rect x="7" y="7" width="8" height="8" rx="2" fill="#ffffff"/><rect x="17" y="7" width="8" height="8" rx="2" fill="#99f6e4"/><rect x="17" y="17" width="8" height="8" rx="2" fill="#ffffff"/><rect x="7" y="17" width="8" height="8" rx="2" fill="#99f6e4"/></svg>')



    # 7. Generate SEO XML Sitemap & robots.txt

    urls = ["/"] + [f"/{p['slug']}/" for p in PAGES] + [f"/{CAT_SLUG[c]}/" for c in CATS] + ["/sitemap/"] + ["/about/", "/contact/", "/privacy/", "/terms/", "/cookies/", "/disclaimer/"]

    sm_items = []

    for u in urls:

        priority = "1.0" if u == "/" else "0.8" if u.count("/") == 2 and not any(x in u for x in ["about", "privacy", "terms", "contact"]) else "0.5"

        sm_items.append(f"  <url>\n    <loc>{e(abs_url(u))}</loc>\n    <lastmod>{TODAY.isoformat()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>{priority}</priority>\n  </url>\n")



    sm = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(sm_items) + "</urlset>\n"

    write("sitemap.xml", sm)

    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {abs_url('/sitemap.xml')}\n")



    if ADSENSE_CLIENT:

        write("ads.txt", f"google.com, {ADSENSE_CLIENT.replace('ca-', '')}, DIRECT, f08c47fec0942fa0\n")



    # 8. Post-Build Strict File Isolation & Privacy Audit

    verify_file_isolation(DIST)



    # 9. Automatic Production ZIP Packaging for Cloudflare Pages Direct Upload

    import zipfile

    zip_dest = os.path.join(HERE, "..", "toolswick-production.zip")

    if os.path.exists(zip_dest):

        os.remove(zip_dest)

    with zipfile.ZipFile(zip_dest, "w", zipfile.ZIP_DEFLATED) as zf:

        for root, dirs, files in os.walk(DIST):

            for f in files:

                full_path = os.path.join(root, f)

                rel_path = os.path.relpath(full_path, DIST).replace("\\", "/")

                zf.write(full_path, rel_path)



    total_pages = len(PAGES) + 1 + 5  # 22 tools + Hub + 4 info pages + 404

    print(f"✓ Production build successfully compiled: {len(PAGES)} tool pages + hub + info pages.")

    print(f"✓ Cloudflare Pages _headers security configuration generated.")

    print(f"✓ Post-build privacy audit passed: 0 exposed files in {os.path.abspath(DIST)}")

    print(f"✓ Deployment package created: {os.path.abspath(zip_dest)} ({len(zf.namelist())} files)")

    print("=" * 60)



if __name__ == "__main__":

    main()

