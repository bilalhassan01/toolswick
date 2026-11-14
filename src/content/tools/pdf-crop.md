## Why Client-Side Matters

Scanned documents and e-books often arrive with wide white margins, dark scan edges, or a border of empty space that wastes half the screen. On a phone or an e-reader, that empty space shrinks the text to a squint. Most online cropping tools ask you to upload the file to a server you do not control, where a copy can sit in storage or pass through logs. This tool works differently. Your PDF is cropped entirely inside your own browser using the pdf-lib engine, in memory, on your device. Nothing is uploaded, nothing is stored on a server, and nothing remains behind after you close the tab.

## Step-by-Step Guide

Cropping a PDF here takes less than a minute, and every step happens on the same page. First, drop your PDF into the workspace, or click to browse and select it from your computer or phone. Second, enter the trim values for the top, bottom, left, and right margins, in millimetres or points — each side has its own field, so you can trim one edge more than the others. Then choose which pages to crop: all pages, or a custom range such as 1-3, 5. Third, click "Crop PDF Pages" to apply the trim and download the cleanly framed document to your device.

## Feature Deep Dive

The cropping engine is pdf-lib, an open-source library that runs in your browser and adjusts the visible boundary of each page. Cropping updates the page boundary box — the MediaBox and CropBox that tell a reader which part of the page to show — without re-encoding the page content. That means the text stays selectable, the images stay sharp, and nothing is re-rendered or compressed: the content is simply framed more tightly.

Two units are supported, so you can work the way you think. Millimetres suit anyone used to paper sizes and print margins, while points suit anyone working with PDF specifications. Each side gets its own trim value, so a scan with a heavy shadow on the left edge and a clean right edge can be fixed unevenly rather than by cutting the same amount everywhere. Cropping can apply to all pages at once, which suits a document scanned with the same margins throughout, or to a custom page range such as 1-3, 5, which suits a document where only some pages carry the extra border. There is no server-imposed limit — the only practical limit is your device's browser memory — and your original file is never changed.
## Use Cases

Trimming margins is the fastest way to make a document easier to read on a small screen. A scanned book chapter with wide white borders becomes readable on a phone once the empty space is gone, and an e-book with oversized margins fits far more text on an e-reader page after cropping. The same applies to presentations saved as PDF: slides with generous white space around the content look cramped on a tablet until the margins are trimmed.

It is also the simplest way to clean up a bad scan. Flatbed scanners often capture a dark edge, a strip of the scanner lid, or a shadow along one side, and a small trim removes the distraction without touching the content. Documents photographed at an angle pick up uneven borders that a per-side trim can even out. Because the crop only changes the visible boundary, the result is a clean, standard PDF that opens in any reader and prints normally.
## Frequently Asked Questions

**Can I crop each side by a different amount?**

Yes. The top, bottom, left, and right margins each have their own field, so you can trim a heavy shadow on one edge without cutting the clean edges at all.

**Will cropped pages still print normally?**

Yes. Cropping only changes the visible page boundary, and the result is a standard PDF, so it prints like any other document in any PDF reader.

**Can I crop all pages by the same amount?**

Yes. Choose "All Pages" and the same trim values apply to every page, which suits a document scanned with the same margins throughout.

**How do I know how much to trim?**

Start small. The fields begin at 10, a modest trim that removes a typical scan border without risking the content. Check the downloaded file, and if the border is still there, run the original through again with a larger value.

**Can I undo a crop if I trim too much?**

Yes — by starting again from the original. Your original file is never modified, so if a trim cuts into the content, run the original through the tool again with smaller trim values.
