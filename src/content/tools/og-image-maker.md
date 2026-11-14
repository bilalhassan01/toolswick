## Why Client-Side Matters

When someone shares your article, the first thing their friends see is not your writing — it is the preview card. A strong card earns the click; a missing or broken one gets scrolled past. Designing that card should not mean uploading your brand assets and headlines to a server you do not control. This tool draws the card entirely in your browser's canvas, using the title, subtitle, and colours you type in. Nothing is uploaded, nothing is stored, and the finished image is a standard file you can host wherever you like.

## Step-by-Step Guide

Start by typing your article title, a short subtitle, a category badge, and your domain name into the form. These four pieces of text are the whole card, so keep the title short and the subtitle to a single line. Next, pick a theme — Dark, Light, or Navy Gradient — and choose an accent colour that matches your site, using the colour picker if your brand has a specific shade. The preview updates as you work, so you can see exactly how the card will look. When you are happy with it, click download to save a PNG file, ready to upload to your host and reference from your page's og:image tag.

## Feature Deep Dive

Every card exports at exactly 1200 by 630 pixels, the standard size for Open Graph images on Facebook and LinkedIn and for large summary cards on X. That size is wide enough for a bold headline and short enough to render cleanly in a feed. Three themes cover the common looks: Dark for a serious, high-contrast card, Light for a clean editorial feel, and Navy Gradient for a richer branded style. The accent colour picker lets you match your site's primary colour rather than settling for a default, and the category badge — a small label such as a topic or section name — tells readers what the article is about before they read a word. The export is a plain PNG, so it works with any host and any platform.

## Use Cases

Bloggers create a fresh card for every article, so each shared link carries its own headline instead of a generic site logo. Small businesses make cards for product launches and announcements, giving a shared link the look of a designed poster. Newsletter writers use them for issue links, event organisers for registration pages, and course creators for lesson pages. It is also the quick fix when a link preview looks bare: a proper card replaces the blank grey box with a title and branding that invite the click.

## Frequently Asked Questions

**Why does my shared link still show the old image?**

Social platforms cache link previews, sometimes for days. After uploading the new image and updating your og:image tag, use the platform's debugger tool to refresh the cached preview — Facebook has the Sharing Debugger and X has the Card Validator — and the new card should appear.

**What should I put in the subtitle?**

One short line that adds a reason to click, such as the key result, the main question the article answers, or who it is for. If the title already says it all, a shorter subtitle, or even a plain domain line, keeps the card clean.

**Does the card work on every platform?**

Yes. The 1200 by 630 size is the shared standard for Facebook, LinkedIn, and X, so the same file serves all three. Some platforms crop the edges slightly on small screens, which is why the title and badge sit well inside the frame.

**Will the text stay readable on a phone screen?**

Yes, as long as the title is short. The headline is set large and bold by design, and the subtitle stays to one line. Aim for under ten words in the title and the card will read clearly even at feed size.
