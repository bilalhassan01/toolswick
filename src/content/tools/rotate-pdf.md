## Why Client-Side Matters

Scanned documents and phone photos saved as PDF often come out sideways or upside down, and a sideways contract or certificate is hard to read and embarrassing to send. Most online rotation tools ask you to upload the file to a server you do not control, where a copy can sit in storage or pass through logs. This tool works differently. Your PDF is rotated entirely inside your own browser using the pdf-lib engine, in memory, on your device. Nothing is uploaded, nothing is stored on a server, and nothing remains behind after you close the tab.

## Step-by-Step Guide

Fixing a rotated PDF here takes less than a minute, and every step happens on the same page. First, drop your PDF into the workspace, or click to browse and select it from your computer or phone. The tool shows a card for every page, so you can see exactly which pages are turned the wrong way. Second, rotate the pages that need it: click the rotation controls on an individual page card, or use the global buttons to rotate all pages by 90 degrees clockwise, 90 degrees counter-clockwise, or 180 degrees. If you change your mind, the Reset button returns every page to its original orientation. Third, click "Apply Rotation & Download PDF" to save the corrected file to your device.

## Feature Deep Dive

The rotation engine is pdf-lib, an open-source library that runs in your browser and edits the PDF document directly. Rotating a page updates the rotation angle recorded in the PDF itself — the content is never turned into an image and drawn again, so text stays selectable, images stay sharp, and there is no quality loss. The change is permanent: the downloaded file opens the right way up in any reader, on any device, without needing the tool again.

You can rotate by 90, 180, or 270 degrees in either direction, which covers every way a scan can come out wrong. Individual page controls fix a document with only a few sideways pages, while the rotate-all buttons fix a whole file scanned upside down in one click. There is no server-imposed file or page limit — the only practical limit is your device's browser memory. Once the page has loaded, no network is used at all, and your original file is never changed: the tool always produces a new download.
## Use Cases

Sideways scans are one of the most common PDF annoyances. People photographing paper documents with a phone often end up with pages turned 90 degrees, and flatbed scanners just as often produce upside-down pages when the paper goes in the wrong way round. Students and researchers deal with journal articles and book chapters where a few pages — usually the ones with wide tables or landscape figures — were scanned sideways while the rest are fine. Office workers receive contracts, invoices, and certificates that open the wrong way up and need fixing before they can be forwarded.

It is also the last step before a document goes somewhere formal. A CV, a visa application, or a set of signed forms must open the right way up for whoever receives it, and a sideways file looks careless even when the content is perfect. Because the rotation is written into the PDF itself rather than remembered by a viewer, the fix travels with the file — it stays correct when emailed, uploaded to a portal, or opened on someone else's computer.
## Frequently Asked Questions

**Will the rotation stay in place when I send the file to someone else?**

Yes. The rotation is saved into the PDF file itself, not into a viewer setting, so the document opens the right way up in any PDF reader, on any device, for anyone who receives it.

**Can I rotate just one page in a long document?**

Yes. Every page gets its own card with rotation controls, so you can turn a single sideways page without touching the rest of the document.

**Which button fixes a page that is upside down?**

Use the 180-degree rotation. The "Rotate All 180°" button turns every page the right way up, or use the controls on a single page card if only one page is flipped.

**Do I have to rotate each page one by one?**

No. If the whole document is turned the same way, the rotate-all buttons fix every page in a single click — plus 90 degrees, minus 90 degrees, or 180 degrees.

**Can I undo a rotation before downloading?**

Yes. The Reset button returns all pages to their original orientation at any point before you download. And since your original file is never modified, you can always start again from it.
