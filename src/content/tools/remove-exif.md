## Why Client-Side Matters

Every photo your phone takes carries hidden data: the exact GPS coordinates of where you stood, the camera model and serial number, and the date and time. Uploading that photo to a server just to strip the metadata defeats the purpose — you would be handing the very location data you want to remove to a stranger first. This tool inspects and cleans your photos entirely inside your browser. The image never leaves your device, the metadata is discarded locally, and the cleaned photo you download has no link back to where or when it was taken.

## Step-by-Step Guide

Drop a photo into the privacy scanner, or click to browse and choose one from your device. The tool reads the file and lists every metadata tag it finds: GPS latitude and longitude, camera model, and the date and time the photo was taken. Read that list first, so you know exactly what was hiding in the file. Then click "Strip Metadata & Download" and the tool saves a clean copy to your device. Your original file is never changed — the cleaned version is a separate download, so you can compare the two or keep the original for yourself.

## Feature Deep Dive

The scanner works with JPEG and PNG photos, the two formats phones and cameras produce most. It detects the full range of EXIF tags, including precise GPS coordinates, camera make and model, serial numbers where recorded, and timestamps. Stripping removes the private header blocks entirely rather than blanking individual fields, so nothing recoverable remains. The image itself is untouched: the pixels are preserved exactly, so there is no quality loss, no recompression, and no visible difference between the original and the cleaned copy. Only the hidden data goes. The cleaned file is a standard image that opens normally anywhere, with no trace of the metadata it once carried.

## Use Cases

Sellers on marketplaces strip location data before posting photos of items at home, so a buyer cannot work out their address. Travellers share holiday photos without broadcasting the hotel they stayed at or the dates they were away. Parents remove location and timestamps from photos of children before posting them publicly. Estate agents and landlords clean photos of properties, and anyone posting to social media, forums, or dating apps can share the picture without sharing the place and time it was taken. Journalists and researchers strip metadata from source photos before publishing, so a picture cannot reveal where a source lives or works.

## Frequently Asked Questions

**Which metadata gets removed?**

GPS coordinates, camera make and model, serial numbers, timestamps, and the other EXIF tags embedded in the file. The strip removes the private header blocks wholesale, so nothing is left behind for someone to recover.

**Does it work on PNGs as well as JPEGs?**

Yes. Both JPEG and PNG photos can be scanned and cleaned. Phones usually save JPEG, while screenshots and exported images are often PNG, and the tool handles either format the same way.

**Can I check what was in my photo before stripping it?**

Yes, and you should. The scanner lists every detected tag — location, camera, date and time — before you strip anything, so you can see exactly what the photo was carrying.

**Will the cleaned photo still open normally?**

Yes. The cleaned file is an ordinary image with the same pixels, just without the metadata headers. It opens in any viewer, uploads anywhere, and looks identical to the original.
