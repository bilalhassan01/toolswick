## Why Client-Side Matters

Every photo from a camera or phone carries a hidden layer of information: the camera model, the shutter speed, the aperture, the ISO, and sometimes the exact GPS coordinates where the picture was taken. Checking those details with a normal online tool means uploading the photo — including its location data — to a server you do not control, which defeats the purpose of inspecting something so private. This tool reads the data a different way. It parses the file's binary data directly in your browser's memory, using DataView, and nothing is uploaded, stored, or transmitted. You can inspect a photo taken in your own home without that photo, or its location, ever leaving your device.

## Step-by-Step Guide

Inspecting a photo takes seconds. First, drop a JPEG photo into the EXIF inspector. Second, browse the extracted details: camera make and model, shutter speed, f-stop aperture, ISO sensitivity, and lens focal length, along with the exposure timestamp. Third, inspect the GPS coordinates and location tags if your camera recorded them — these only appear when location services were enabled when the photo was taken. Finally, click Copy Details to put a summary on your clipboard, or Export JSON to save the full technical record as a file you can keep with your notes. The whole process happens on the same page, and your photo is never sent anywhere.

## Feature Deep Dive

The hidden data lives in the file's APP1 segment, a block of binary metadata written according to the EXIF standard — short for Exchangeable Image File Format — which cameras and phones have followed for years. This tool reads that binary buffer directly in local browser memory, decoding the individual tags one by one: the camera make and model, the exposure settings that produced the shot, the focal length of the lens, the date and time, and the GPS coordinates when they exist. Because the parsing happens on your device, there is no upload delay and no file-size queue; a photo opens and its details appear almost immediately. The Copy Details and Export JSON options turn the reading into a usable record, so you can file the settings alongside a photo, compare shots from different cameras, or keep a technical note of how a particular image was made. The details appear almost immediately because no upload is involved, so checking a whole set of photos is a quick job rather than a slow one.

## Use Cases

Photographers use it to learn from their own work: seeing that a favourite shot was taken at a wide aperture or a fast shutter speed tells them exactly what to repeat next time. Buyers and sellers of used cameras check the details embedded in sample photos to confirm which body and lens produced them. Journalists, researchers, and anyone verifying a picture check the timestamp and camera data to judge whether an image is what it claims to be. It is also a privacy check before sharing: a photo can quietly carry the GPS coordinates of your home, your children's school, or a client's property, and seeing those tags before you post is far better than discovering them afterwards. Finally, it settles friendly arguments about who took a picture, with what camera, and when.

## Frequently Asked Questions

**Which file types can I inspect?**

The inspector is built for JPEG photos, which is the format cameras and phones use for EXIF data. Drop a JPEG into the workspace to see its embedded details.

**What camera details will I actually see?**

Camera make and model, shutter speed, f-stop aperture, ISO sensitivity, lens focal length, and the exposure timestamp — plus GPS coordinates when the camera recorded them.

**Does viewing a photo change or strip its EXIF data?**

No. The viewer only reads the file and displays what it finds. Your original photo is left exactly as it was, with all of its metadata intact.

**Can I export the details to keep with my records?**

Yes. Copy Details puts a summary on your clipboard, and Export JSON saves the full technical record as a file you can store alongside the photo.

**Is it safe to inspect a photo taken at my home?**

Yes. The file is parsed entirely in your browser and never uploaded, so viewing its location tags does not share them with anyone.
