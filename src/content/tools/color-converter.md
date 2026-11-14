## Why Client-Side Matters

Designers and developers juggle three colour languages every day: HEX in stylesheets, RGB in design tools, and HSL when tweaking a shade. Converting between them by hand means mental arithmetic and easy mistakes, and pasting your brand colours into a random converter site sends your palette to a server you do not control. This converter does every calculation inside your browser. Pick a colour once, and all three formats update together instantly, with nothing uploaded and nothing stored.

## Step-by-Step Guide

Converting a colour takes seconds. First, pick a colour with the colour picker, or type a value into any of the three boxes — HEX, RGB, or HSL. Second, watch the other two formats update in real time, alongside a large preview swatch that shows the exact shade you are working with. Third, click the Copy button next to the format you need, and paste the exact syntax into your stylesheet, design file, or document. You can start from any format and convert in any direction, as many times as you like.

## Feature Deep Dive

HEX is the format most stylesheets use: six characters that pack the red, green, and blue channels into one short code, such as #3b82f6. RGB spells the same colour out as three numbers from 0 to 255, one per channel, which is how screens actually produce light. HSL takes a different approach — hue as an angle from 0 to 360 degrees around the colour wheel, saturation as a percentage, and lightness as a percentage — which makes it the easiest format for adjusting a colour, since raising lightness makes a tint and lowering it makes a shade. The converter handles shorthand three-digit hex codes such as #fff by expanding them to their full six-digit form, and it converts with full floating-point precision, so the values you copy match the colour you picked exactly.

## Use Cases

Front-end developers convert a designer's hex codes into the format a project needs, or translate RGB values from a design file into stylesheet-ready HEX. Designers use HSL to build tints and shades of a brand colour for buttons, hovers, and backgrounds. Email developers check that a colour renders the same way across clients. Teachers and students use the tool to learn how colour models relate to each other, seeing one colour expressed three ways at once. Anyone matching a colour from a screenshot or a brand guide can start from the value they have and get the two they need.

## Frequently Asked Questions

**Can I paste a colour copied from another app?**

Yes. Paste a hex, RGB, or HSL value into the matching box and the other formats will update immediately, so you can move a colour between tools without retyping it.

**Why do my RGB numbers look different in HSL?**

They describe the same colour in different terms. RGB counts light intensity per channel, while HSL describes the colour's position on the wheel plus its saturation and lightness, so the numbers are not meant to match.

**Which format should I use in my stylesheet?**

HEX is the most common choice for CSS and works everywhere. Use HSL when you plan to adjust lightness or build a family of related shades, since it makes those tweaks far easier.

**Does the picker work on mobile?**

Yes. The colour picker and the three input boxes work in a mobile browser, so you can convert a colour on your phone and copy the result straight into your notes or code.
