## Why Client-Side Matters

Scanned documents rarely arrive in the right order. A page gets fed through the scanner twice, a chapter lands after the appendix, or a contract's signature page ends up in the middle — and the file is useless until the pages are put right. Most online organisers ask you to upload the whole document to a server you do not control, where a copy can sit in storage or pass through logs. This tool works differently. Your PDF is rearranged entirely inside your own browser using WebAssembly and the pdf-lib engine, in memory, on your device. Nothing is uploaded, nothing is stored on a server, and nothing remains behind after you close the tab.

## Step-by-Step Guide

Reordering a PDF here takes less than a minute, and every step happens on the same page. First, drop your PDF into the workspace, or click to browse and select it from your computer or phone. The tool shows a card for every page, so you can see the document's contents at a glance. Second, arrange the pages the way you want them: use the move controls to shift a page left or right, duplicate a page you need twice, delete a page you do not need, or click the blank-page button to insert a clean sheet anywhere in the document. Third, click "Save Reordered PDF" to build the new document and download it to your device.

## Feature Deep Dive

The organiser runs on pdf-lib, an open-source library that works in your browser and rebuilds the PDF from the pages you arrange. When you save, the tool copies every kept page into a new document in exactly the order shown — text stays selectable, links stay intact, and there is no re-rendering or quality loss, because nothing is converted to an image and back. The result is a clean, standard PDF that opens in any reader.

Four operations cover almost every reordering job. Moving a page left or right fixes a mis-scanned sequence one step at a time, and repeated moves can carry a page from the end of a document to the front. Duplicating a page is useful when the same sheet is needed twice, such as a form page that must be filled in for two people. Deleting removes a page outright, and inserting a blank page creates a divider between sections or a fresh sheet where a note or signature will go later. There is no server-imposed limit — the only practical limit is your device's browser memory.
## Use Cases

Fixing page order is a small job that comes up constantly. The most common case is a bad scan: a multi-page contract or a set of lecture notes goes through the feeder in the wrong order, and the file reads like a shuffled deck until the pages are put back. Students and researchers reorder scanned book chapters and journal articles so the document follows the original. Job seekers put the cover page first, then the CV, then the certificates, instead of the order the scanner happened to produce.

It is also the simplest way to assemble a document from parts. A portfolio reads better when the strongest work comes first, and a report reads better when the summary precedes the detail. Duplicating a page covers the case of a form that needs two copies filled in differently, and a blank page inserted between sections works as a divider or as a space for a handwritten signature. Because the pages are copied exactly, the rearranged file is suitable for formal submissions.
## Frequently Asked Questions

**Can I duplicate a page?**

Yes. The duplicate control copies a page so it appears twice in the document — useful for a form page that needs to be filled in for two people, or a sheet you need in two places.

**Does reordering change anything inside the pages?**

No. The pages are copied into the new document exactly as they were, so their text, images, and formatting are untouched. Only the order changes — nothing is re-rendered or compressed.

**Can I delete pages with this tool as well?**

Yes. Each page card has a delete option, so you can remove unwanted pages in the same pass as reordering, without switching to a separate tool.

**Will my original file be changed?**

No. Your original PDF is never modified. The tool builds a brand-new file in the order you set, and you download that while the original stays exactly as it was.

**Can I move a page from the end to the beginning?**

Yes. Use the move controls to shift a page left step by step until it sits where you want it. Repeated moves can carry a page from the end of the document right to the front.
