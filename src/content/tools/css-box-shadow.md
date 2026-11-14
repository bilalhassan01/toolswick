## Why Client-Side Matters

A good shadow is what makes a card, button, or modal look like it floats above the page instead of lying flat on it — but guessing box-shadow values by hand means endless tweaks and refreshes. Many shadow tools are buried inside heavy design apps or send your work to a server. This generator runs entirely in your browser: move a slider, watch the preview card change instantly, and copy clean CSS when it looks right. Nothing is uploaded, nothing is stored, and your design stays yours.

## Step-by-Step Guide

Designing a shadow takes a minute. First, drag the X and Y offset sliders to place the shadow — sideways, below, or above the card. Second, adjust the blur radius for softness and the spread radius to grow or shrink the shadow's size. Third, pick a shadow colour, set the opacity, and switch on the inset toggle if you want the shadow inside the card instead of outside it. The preview card updates with every change. Finally, click Copy CSS and paste the finished box-shadow declaration into your stylesheet.

## Feature Deep Dive

Every part of a box-shadow declaration is covered by a control. The X offset moves the shadow left or right, up to 50 pixels in either direction, and the Y offset moves it up or down. Blur radius, from 0 to 100 pixels, controls how soft the edge is — zero gives a hard, flat edge, while a large blur gives a gentle, floating glow. Spread radius, from minus 50 to plus 50, expands or shrinks the shadow before blur is applied, so a negative spread makes a tight shadow that hugs the card. Opacity is applied through an rgba colour, which blends the shadow realistically with whatever sits behind it instead of painting a flat grey block. The inset toggle flips the shadow inside the element for a pressed or sunken look, useful for inputs and inner panels. The preview card shows the result live, so what you see is what your CSS will produce.

## Use Cases

Front-end developers design elevation for cards, modals, dropdowns, and buttons without guessing numbers. Designers prototype a neumorphic or soft-UI look and hand exact values to developers. Bloggers and small business owners style a call-to-action box or pricing card to make it stand out. Students learning CSS see how each value changes the result in real time. Anyone polishing a personal site can lift a flat layout into something with depth in a few minutes, then reuse the same shadow values across the whole site for a consistent feel.

## Frequently Asked Questions

**Why does my shadow look too dark or harsh?**

High opacity with low blur is the usual cause. Try dropping the opacity to around 10 to 15 percent and raising the blur to 20 or 30 pixels — soft, light shadows look far more realistic than dark, sharp ones.

**Can I use more than one shadow on the same element?**

Yes. CSS allows several shadows separated by commas in one declaration, so you can layer a small sharp shadow with a large soft one for a more natural depth effect.

**When should I use a negative spread?**

A negative spread shrinks the shadow so it stays close to the element, which suits small cards and buttons. A positive spread makes the shadow bigger than the element, which works for large panels and hero sections.

**Does the generated CSS work in all browsers?**

Yes. The box-shadow property is supported by all modern browsers, and the generated declaration uses standard syntax with rgba colours, so it works without any special prefixes.
