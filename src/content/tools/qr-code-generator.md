## Why Client-Side Matters

A QR code is a small picture with a big job: it carries a web address, a Wi-Fi password, or someone's contact details. Many QR generators create the code on their servers, or worse, wrap your link in a redirect service that tracks scans and can break or expire. That means your QR code depends on a third party staying in business, and your link passes through their systems. This tool generates standard static QR codes entirely in your browser. The data is encoded directly into the pixel matrix, with no redirect server in between, so the code never expires, never breaks, and never phones home. Nothing you type — not a URL, not a Wi-Fi password, not a phone number — leaves your device.

## Step-by-Step Guide

Creating a QR code takes a minute. First, choose the type: a website URL or plain text, a Wi-Fi network, a vCard contact, an email, or an SMS. Each type shows the right fields — a URL needs just the address, while Wi-Fi asks for the network name, password, and encryption type (WPA/WPA2, WEP, or open), plus whether the network is hidden. A vCard takes a name, phone number, email address, and organization; email takes a recipient, subject, and message; SMS takes a phone number and a pre-filled message. Second, customize the appearance: pick a pixel size (256, 512, 1024, or 2048), an error correction level, and pattern and background colours. Third, download the code as a PNG for screens and messaging, or as a scalable SVG for print, where it stays sharp at any size. Test it with your phone camera before printing a batch.

## Feature Deep Dive

A static QR code is simply your data drawn as a grid of dark and light squares. Because there is no redirect server, the code contains the data itself: a scanner reads the URL, the Wi-Fi credentials, or the contact card directly from the pattern. That is why these codes never expire and never stop working — there is no service to shut down and no link to rot. A printed code from years ago scans exactly as well as one made today.

Error correction is what keeps a code readable when it is imperfect. The four levels — Low at 7 percent, Medium at 15 percent, Quartile at 25 percent, and High at 30 percent — describe how much of the code can be damaged or covered while it still scans. High correction is the right choice for codes printed on packaging, stuck on a wall, or placed where they might get dirty or partially covered; it also lets you place a small logo in the centre. Higher correction makes the pattern denser, so balance it against the size: a small code with high correction can be hard to scan, while a larger code handles it easily. Resolution matters too — 256 pixels suits a screen, 1024 or 2048 suits print — and SVG is the best choice for anything printed, because it scales without losing sharpness.A QR code can hold only so much data, and longer content makes a denser pattern that is harder to scan — a very long URL produces a crowded code that needs a larger print size to read reliably. Keeping the destination short, or using a short link, gives a cleaner code that scans quickly from further away. Print size matters too: a code on a poster viewed from metres away must be far larger than a code on a business card held in the hand. The rule is simple — print it, then test it with a phone from the distance a real person will stand at. If it scans quickly, the size is right.

## Use Cases

QR codes bridge the physical and the digital. A restaurant prints a code on the table that opens its menu. A shop puts one on a receipt that opens its store page. A café shares its Wi-Fi with a code on the counter, so guests connect without typing a long password. A business card carries a vCard code that adds the contact to a phone in one scan. An event poster links to tickets, a product label links to instructions, and a payment counter links to a payment page.

They are just as useful for personal sharing. A code on a wedding invitation links to the gift list. A code in a presentation links to a survey. A code on a parcel links to tracking. Because these codes are static, they are safe to print in bulk — they will still work years later, with no subscription and no service to maintain.They are just as useful for personal sharing. A code on a wedding invitation links to the gift list. A code in a presentation links to a survey. A code on a parcel links to tracking. Because these codes are static, they are safe to print in bulk — they will still work years later, with no subscription and no service to maintain. The same permanence suits payments and tickets: a printed code at a counter or on a ticket works every time, because there is no server in between that could fail or change the destination.

## Frequently Asked Questions

**Can I put a logo in the middle of a QR code?**

Yes, if you use a high error correction level. The code can tolerate the centre being covered, so a small logo fits there while the code still scans reliably.

**What is error correction, and which level should I choose?**

Error correction lets a damaged or partly covered code still scan. Low tolerates 7 percent damage, Medium 15 percent, Quartile 25 percent, and High 30 percent. Use High for printed codes that might get dirty or scuffed.

**Which download format should I use, PNG or SVG?**

PNG suits screens, messaging, and documents. SVG suits anything printed, because it scales to any size without losing sharpness.

**Is the data I enter stored anywhere?**

No. The code is generated entirely in your browser. Your URLs, Wi-Fi passwords, and contact details never leave your device.

**How large should I print a QR code?**

Large enough to scan from the distance a real person will stand at. A code on a business card is scanned up close, while a poster code must be much bigger. Always test the printed code with a phone before printing a batch.
