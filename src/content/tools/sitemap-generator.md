## Why Client-Side Matters

A sitemap is a complete map of your website: every page, its address, and how it fits together. Generating one means handing over your full site structure, including pages you may not want public yet. Doing that on a server-based tool means a stranger holds a copy of your map. This tool builds the XML file entirely in your browser. Your URLs and site structure never leave your device, and the finished sitemap.xml is yours to upload to your own server and submit to search engines yourself.

## Step-by-Step Guide

Paste your list of URLs or paths into the box, one per line — full addresses like https://yoursite.com/about, or paths if the tool adds the domain for you. Next, set the defaults: how often each page changes, a priority weight between 0.0 and 1.0, and whether to include lastmod dates showing when each page was last updated. The tool builds a valid XML sitemap as you type. When it looks right, copy the XML or download it as sitemap.xml, upload it to the root of your website, and submit its address through Google Search Console.

## Feature Deep Dive

The output follows the standard XML sitemap format that Google, Bing, and other search engines expect. A single sitemap file supports up to 50,000 URLs or 50MB uncompressed, which covers all but the largest sites. The priority tag is a relative signal: a value of 1.0 marks your most important pages, and lower values mark supporting pages, all relative to your own site rather than to other websites. Change frequency tells crawlers whether a page changes daily, weekly, or rarely, and the lastmod toggle adds the date each page was last modified, which helps crawlers focus on what is new. The generator validates the structure as it builds, so the file you download is well-formed XML that search engines can read without errors.

## Use Cases

New websites submit a sitemap on launch day so search engines discover every page at once instead of finding them slowly through links. Sites that publish often use it after a big content update, pointing crawlers at the new pages. Large blogs and shops with hundreds of pages rely on it because crawlers can miss deep pages that are several clicks from the homepage. It is also the standard step after a redesign or a move to a new domain, when old URLs change and search engines need a fresh map. Anyone running a site with pages that have no incoming links uses a sitemap to make sure those pages are found at all.

## Frequently Asked Questions

**What is changefreq for?**

It is a hint to crawlers about how often a page is updated — daily for a news homepage, monthly for an about page, and so on. It is only a hint, not an instruction, and crawlers will still visit on their own schedule, but an honest value helps them spend their crawl budget wisely.

**Should I include pages I don't want indexed?**

No. A sitemap should list only pages you want search engines to find and index, using their canonical URLs. Login pages, admin areas, and duplicate versions belong in robots.txt exclusions, not in your sitemap.

**What is lastmod and should I include it?**

Lastmod is the date a page was last changed. Include it when the dates are accurate, because crawlers use it to prioritise fresh content. If your dates are wrong or always set to today, leave it off — misleading dates are worse than none.

**Do I need a sitemap if my site is small?**

It is helpful but not essential. Crawlers can find a small site by following links from the homepage. Even so, a sitemap costs nothing to make, guarantees every page is listed, and speeds up discovery after you publish something new.
