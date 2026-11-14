## Why Client-Side Matters

Matching a colour from a photo by eye is guesswork. You can spend an hour nudging a swatch closer to the shade in a picture and still be wrong, because screens, lighting, and memory all lie a little. The usual fix is an eyedropper app that needs installing, or an upload site that wants your image on its server first. This tool takes the simpler route: your photo is loaded into your own browser, and the exact pixel colours are sampled from the image data on your device. Nothing is uploaded, nothing is stored, and there is no account to create. The colour you copy is the colour that is actually in the file — not an approximation, and not a copy sitting on someone else's server. That makes it a quick, private way to name any colour you can see in a picture.

## Step-by-Step Guide

Sampling a colour takes seconds. First, upload any photo or illustration into the colour canvas. Second, move your cursor over the image and watch the magnifying loupe, which previews the exact pixel colour under your pointer in real time, along with its coordinates. Third, click anywhere to pin that colour and copy it in HEX, RGB, or HSL format — whichever your design tool or code expects. Fourth, look at the six dominant palette chips the tool extracts from the whole image, and click any chip to copy its code instantly. That is the whole workflow: hover, click, copy, and the colour is ready to paste wherever you need it.

## Feature Deep Dive

Under the surface, the tool reads colour data from 32-bit RGBA canvas buffers directly on your device's processor, so every sample is the true value of the pixel you clicked — not a screenshot of your screen or a compressed preview. The magnifying loupe zooms into the area under your cursor, showing exact pixel coordinates and colours as you move, which makes it possible to pick out a single thread of colour in a busy photograph instead of landing somewhere nearby. The palette extraction works differently: it groups the image's colours into 5-bit buckets using spatial bucket quantization, then ranks those buckets by how often each colour appears across the whole image. The six most frequent colours become the palette chips — a ready-made summary of the image's dominant tones, useful when you need a colour scheme rather than a single shade.

## Use Cases

Designers use it to pull an exact brand colour out of a logo, a product photo, or a client's reference image, instead of guessing from a screenshot. Web developers sample a colour from a mockup or a photograph and paste the HEX code straight into their stylesheet. Painters and decorators match a shade from a fabric swatch, a piece of furniture, or a room photo before buying paint. Artists building a palette from a reference photograph get six dominant colours in one click, which is a faster starting point than choosing swatches from scratch. It also helps anyone who has ever been asked "what colour is that, exactly?" — whether for a presentation, a print job, or a home project — and needed an answer with a code attached, not a vague description.

## Frequently Asked Questions

**What kinds of images work best?**

Any photo or illustration works, but flat areas of solid colour give the cleanest samples. Busy textures and gradients change from pixel to pixel, so hover slowly and use the loupe to land on the exact spot.

**Can I save a palette to use later?**

Each palette chip copies its code with one click, so paste the codes straight into your design tool, stylesheet, or notes while you have the image open.

**Why do two pixels side by side show different colours?**

Photographs are full of tiny variation: compression, gradients, and anti-aliasing blend neighbouring pixels together. The loupe shows the true value of each individual pixel, so nearby pixels can genuinely differ.

**How exact is the sampled colour?**

It is the exact value stored in the image file for that pixel. Bear in mind that screens differ, so the same code can look slightly different on another monitor — the code itself does not change.

**Can I pick a colour from a screenshot?**

Yes. Upload any image, including a screenshot, and sample from it exactly the same way as from a photograph.
