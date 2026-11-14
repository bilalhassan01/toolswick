## Why Client-Side Matters

SVG files are powerful because they can contain code as well as graphics — and that is also what makes them risky. A downloaded SVG can hide scripts, event handlers, and external references that run when the file is opened. Converting it on a server means trusting that server with a file that may be hostile, and uploading your brand assets to a stranger's system besides. This tool converts the file inside your browser, and it sanitises the SVG first, stripping out anything executable before it is ever rendered. Your file never leaves your device, and nothing dangerous survives the conversion.

## Step-by-Step Guide

Drop your SVG file into the workspace, or click to browse and select it from your computer. Next, choose the resolution scale: 1x for standard web use, 2x for sharp retina displays, or 4x for print and large formats. Then pick the background mode — transparent, so the image can sit on any background, or a solid colour if the design needs one. Click "Download Crisp PNG" and the tool renders the vector onto a canvas and saves the finished PNG to your device, ready to use anywhere a raster image is needed.

## Feature Deep Dive

The first step is sanitisation. Before rendering, the tool strips `<script>` tags, event handlers such as onload and onerror, and external entities from the SVG, so no code from the file can execute in your browser. Only then is the cleaned vector drawn onto an in-browser canvas and exported as a PNG. The scale control is the key to quality: because SVG is a vector format, it can be rendered at any size without the jagged edges you get from enlarging a raster image, so 2x and 4x exports stay crisp. The background choice matters too. Transparent mode preserves the alpha channel, which keeps logos and icons usable on any colour, while solid mode fills the background for designs that need a flat base.

## Use Cases

Designers convert logos into PNGs for documents, slide decks, and email signatures, where SVG is not supported. Developers export icons at multiple scales for apps and websites. Marketers turn a vector illustration into a social media image. Anyone who downloads an SVG from a stock site or receives one from a designer uses the tool to get a safe, usable PNG without opening the raw file in a desktop app. It is also the safe way to handle an SVG from an unknown source, since sanitisation runs before anything is rendered.

## Frequently Asked Questions

**What scale should I choose?**

Use 1x for ordinary web pages and documents, 2x for retina screens and high-density displays, and 4x for print work or large formats where the image will be shown big. Higher scales make larger files, so match the scale to the use.

**Will transparency survive the export?**

Yes, if you choose the transparent background mode. The PNG keeps its alpha channel, so logos and icons sit cleanly on any background colour without a white box around them.

**Why does my SVG look different as a PNG?**

Text inside an SVG is rendered with the fonts available on your device. If the original used an unusual font that is not installed, the browser falls back to a default, which can change spacing and weight. Converting text to outlines in your design tool before export avoids this.

**Can I convert many SVGs at once?**

The tool handles one file at a time. Convert the first file, download it, then drop in the next. Each conversion takes seconds, so a small batch is still quick work.
