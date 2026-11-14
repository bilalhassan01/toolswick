## Why Client-Side Matters

Every PDF carries a hidden record: who made it, when it was created, how many pages it has, and what size those pages are. That information decides whether a file will print correctly, whether it is the version you think it is, and what it reveals about its author. Most online inspectors ask you to upload the file to a server you do not control, where a copy can sit in storage or pass through logs. This tool works differently. Your PDF is read entirely inside your own browser using the pdf-lib engine, in memory, on your device. Nothing is uploaded, nothing is stored on a server, and nothing remains behind after you close the tab.

## Step-by-Step Guide

Inspecting a PDF here takes less than a minute, and every step happens on the same page. First, drop your PDF into the workspace, or click to browse and select it from your computer or phone. Second, read the metadata table the tool extracts: page count, page dimensions, author, creator application, PDF producer, and creation and modification dates, along with the file size. Page dimensions are reported as standard formats such as A4 or US Letter, together with exact measurements in points. Third, click "Copy Metadata" to copy all of the properties to your clipboard, ready to paste into a message, a ticket, or your own notes.

## Feature Deep Dive

The inspector runs on pdf-lib, an open-source library that reads the PDF's internal structure directly in your browser. It does not open the document in a viewer or render its pages — it reads the properties the file itself declares. Page dimensions come back as a recognised standard format where one applies, such as A4 or US Letter, plus the exact measurement in points, so you can confirm print specifications without opening design software.

Three groups of information cover most questions. Document properties — author, creator application, PDF producer, and creation and modification timestamps — tell you where the file came from and when it was last touched. Page information — page count and the dimensions of the pages — tells you what you are dealing with structurally, including whether a document mixes page sizes. Reading is strictly read-only: the tool never changes the file, so inspecting a document carries no risk at all. There is no server-imposed limit — the only practical limit is your device's browser memory.
## Use Cases

Checking a PDF's details before you act on it prevents a surprising number of mistakes. Anyone sending a file to a printer wants to confirm the page size first — an A4 document sent to a US Letter print run comes back wrong, and a mixed-size document needs to be spotted before it is printed. People submitting files to portals check the page count and file size against the portal's limits before uploading, rather than finding out after a failed submission.

It is also the quickest way to audit files you received from someone else. A report that claims to be final but carries a modification date from this morning deserves a second look, and a document with no author listed tells you nothing about who produced it. Teams sharing files check the metadata to make sure tracking tags or internal notes are not travelling with the document before it goes to a client. Because the inspection is read-only and entirely local, even sensitive files can be checked safely, with nothing leaving the device.
## Frequently Asked Questions

**Does this tool change my PDF?**

No. The inspector only reads the file — it never modifies it. You can check any document, however sensitive, knowing the file that goes in is exactly the file that stays on your device.

**Can I copy the details to paste elsewhere?**

Yes. The "Copy Metadata" button copies every extracted property to your clipboard in one step, ready to paste into an email, a support ticket, or your own notes.

**What does it show if my PDF has no author listed?**

It shows whatever the file actually contains. If the author field was never filled in, it simply has no author to report — the tool never invents a value, so a blank field means the information is not in the file.

**Can I check the page count of a PDF?**

Yes. The page count is one of the first things in the metadata table, along with the page dimensions and the file size.

**Does it work on scanned PDFs too?**

Yes. Page count, page dimensions, and file information come from the file's own structure rather than from its text, so any standard PDF can be inspected — scanned or not, with or without a text layer.
