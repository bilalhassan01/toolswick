## Why Client-Side Matters

A WiFi QR code is a convenient way to share your network — and it is also a copy of your WiFi password in machine-readable form. Generating that code on a server would mean sending your network name and password to a stranger, which defeats the entire point of having a password. This tool draws the QR code locally on an HTML5 canvas in your browser. Your password never leaves your device, is never stored, and the code you print is yours alone to display where you choose.

## Step-by-Step Guide

Enter your network name, the SSID, exactly as it appears on your router. Select your encryption type: WPA, WPA2, or WPA3 for a modern secured network, WEP for an older one, or Open if the network has no password. Type in the WiFi password, taking care to match it character for character. The QR code appears immediately. Download it as an image or print it directly, and display it where guests can scan it — a framed card in the hallway, a sticker near the front desk, or a page in a guest welcome pack.

## Feature Deep Dive

The QR code encodes the standard WiFi network format, which phones understand natively: the network name, the security type, and the password, in a structure the camera app reads in one scan. WPA, WPA2, and WPA3 are all supported, along with WEP and open networks, so the tool covers everything from a new router to a legacy setup. The code is drawn on a local canvas, which means no part of your credentials ever touches a network request. Guests need no special app: the default camera on iOS and Android recognises WiFi QR codes and offers to join the network with a single tap, no typing required. The downloaded image prints cleanly at any size, from a small card to a wall poster.

## Use Cases

Homeowners print a code for visitors, so guests stop asking for the password and stop typing it wrong. Airbnb hosts put one in the welcome book, letting guests connect the moment they arrive. Cafes, offices, and waiting rooms display one at the counter or on tables. Event organisers print one for a conference venue, and small shops offer it to customers. Anywhere people regularly ask "what's the WiFi password?", a printed QR code answers the question silently.

## Frequently Asked Questions

**Will the QR code still work if I change my WiFi password?**

No. The code contains the password as it was when you generated it. After any password or network name change, generate a fresh code and replace the printed one.

**Can I print the code and stick it on the wall?**

Yes. Print it at a size guests can scan comfortably from a normal distance — a card the size of a postcard works well — and place it where visitors naturally look, such as near the entrance or the reception desk.

**What if my network name has special characters?**

The generator encodes the SSID exactly as you type it, including spaces and punctuation, so most network names work as-is. Double-check the spelling before printing, because a single wrong character means the phone will look for a network that does not exist.

**Is it safe to display the QR code publicly?**

Anyone who can scan it can join your network, so display it where only intended guests can see it. A code in your living room is fine; one on a street-facing window is not. Treat it like writing the password on a card: convenient for guests, but only where guests are.
