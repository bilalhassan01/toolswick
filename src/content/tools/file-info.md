## Why Client-Side Matters

A file's name and icon can lie. A document renamed to .pdf may really be something else, a download may be corrupted, and a file's true size may differ from what a listing claims. The only way to know is to inspect the file itself — but uploading a private document to a website just to check it is a bad trade. This inspector reads your file entirely in your browser's memory. No data is transmitted, nothing is stored, and the results appear instantly, even for files you would never send to a stranger's server.

## Step-by-Step Guide

Inspecting a file takes seconds. First, drag and drop any file onto the page, or click to browse and select it. Second, read the results table: file name, extension, exact size in bytes, a human-readable size, MIME type, and last modified date. Third, check the SHA-256 hash to compare against a published checksum, or open the hex dump to see the file's first 64 bytes in hexadecimal alongside their ASCII characters. You can copy the hash or a full summary with one click.

## Feature Deep Dive

The exact byte size settles arguments that rounded sizes cannot — whether two files are truly identical, or whether a download finished completely. The MIME type is detected from the file's actual content rather than its extension, so a mislabelled file is exposed. The SHA-256 hash is a 64-character fingerprint computed with the browser's hardware-accelerated Web Crypto API; change even one byte and the hash changes completely, which is why checksums are the standard way to verify downloads. The hex dump shows the first 64 bytes, including the magic number — the short signature at the start of a file that identifies its real format, such as the bytes that mark a genuine PDF or PNG. Together, these details tell you what a file really is, how big it really is, and whether it matches the original.

## Use Cases

Developers verify a downloaded installer or library against its published checksum before running it. Support teams check a customer's file to see its true format when an upload fails. Researchers confirm that a dataset downloaded completely and was not truncated. Photographers and designers check the exact size and format of an image before sending it to a client. Anyone who has received a suspicious attachment can inspect it safely — the file is only read, never opened or executed — and confirm what it really contains.

## Frequently Asked Questions

**What is a magic number, and why does it matter?**

A magic number is a short byte signature at the start of a file that identifies its real format. It matters because extensions can be renamed, but the magic number cannot be faked by renaming — it reveals what the file truly is.

**Can I inspect a file without opening it?**

Yes. The inspector only reads the file's bytes to display details and a hash. It never opens, runs, or renders the file, so inspecting a suspicious download is safe.

**Why does the size here differ from what my computer shows?**

Computers often round sizes to kilobytes or megabytes, which hides the exact count. This tool shows the precise byte count, so small differences between two files become visible.

**Does the inspector work with any file type?**

Yes. Any file can be inspected — documents, images, videos, archives, executables, and data files. The results table, hash, and hex dump work the same way for all of them.
