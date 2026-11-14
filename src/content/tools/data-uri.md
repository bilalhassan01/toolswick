## Why Client-Side Matters

A Data URI packs a whole file — an icon, a logo, a font, a small image — directly into a line of HTML or CSS, so the browser never has to fetch it separately. That is useful for tiny assets, but the encoding step usually means uploading the file to a converter site, which is the wrong place for a company logo or a private document. This tool encodes and decodes Data URIs entirely in your browser. Your files stay on your device, and the ready-to-paste snippets appear instantly.

## Step-by-Step Guide

Creating a Data URI takes seconds. First, choose Generate Data URI mode and drop a file onto the page — any image, icon, font, or file. The tool detects its MIME type automatically, or you can override it by typing one in, such as image/svg+xml. Second, copy the raw data URI, or grab the ready-made HTML img tag or CSS background-image snippet instead. To go the other way, switch to Decode Data URI mode, paste a data: string, and download the original file back out.

## Feature Deep Dive

A Data URI follows the RFC 2397 format: the word data:, a MIME type such as image/png, the base64 marker, and then the file's contents encoded as base64 text. Because the file travels inside the page itself, the browser makes one fewer HTTP request, which can speed up pages that use many tiny icons. The tool generates three outputs at once — the raw URI, an HTML img tag, and a CSS background-image declaration — so you can paste the form your code actually needs. Decoding reverses the process: it reads the MIME type from the string, rebuilds the original binary data, and offers it as a download, with a preview when the content is an image. All MIME types are supported, from PNG, JPEG, SVG, and WebP to PDF, fonts, and plain text.

## Use Cases

Front-end developers inline small icons and logos to cut HTTP requests on a landing page. Email developers embed images directly in HTML emails, where external images are often blocked. Designers turn an SVG logo into a snippet they can paste into a stylesheet. Developers decode a Data URI received from an API back into a file they can open and check. Anyone working with single-file HTML documents — a report, a resume, an invoice template — can embed the images so the file works on its own, anywhere.

## Frequently Asked Questions

**When should I not use a Data URI?**

Avoid them for large files. Base64 encoding makes data about a third bigger, so a large photo becomes a much larger page. Data URIs suit small assets — icons, logos, and tiny images — not full-size photographs.

**Can I use a Data URI in an email?**

Yes, and that is one of their best uses. Images embedded as Data URIs display inside the email itself, instead of being blocked as external downloads by strict mail clients.

**What if the tool detects the wrong MIME type?**

Type the correct one into the MIME override field before encoding, for example image/svg+xml for an SVG file. The generated URI will then carry the type you specified.

**Does decoding work with any Data URI?**

Yes, as long as the string is a valid data: URI with base64 content. The decoder reads the MIME type, rebuilds the original file, and lets you download it with its proper format.
