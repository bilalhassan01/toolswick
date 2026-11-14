## Why Client-Side Matters

A robots.txt file tells search engines which parts of your site they may crawl, and writing one means listing your private paths: admin areas, staging folders, and internal tools. Pasting that map of your site into an online generator that stores submissions would hand a stranger a guided tour of the places you want hidden. This tool generates the file entirely in your browser. Your domain, your paths, and your crawler rules never leave your device, and the finished file is yours to place on your server.

## Step-by-Step Guide

Begin by choosing your default policy: Allow All if most of your site should be crawled, or Disallow All if the site is private or still in staging. Next, add the paths you want to exclude, one per line — for example /admin/, /private/, or /tmp/. You can also set rules for individual crawlers, such as Googlebot, Bingbot, Baiduspider, or Yandex, giving each one its own allow or disallow list. If you have a sitemap, enter its full URL so it is declared at the bottom of the file. When the file looks right, copy the text or download it as robots.txt, ready to upload to your site.

## Feature Deep Dive

The generator builds a standard, well-formed robots.txt from your choices. The default policy sets the tone for every crawler, and per-bot rules let you treat individual search engines differently — blocking one crawler entirely while letting others in, for instance. Disallow paths support the usual patterns, so you can block a whole folder or a single file. The sitemap line is appended at the end of the file, which is where crawlers expect to find it, and it tells them exactly where your index of pages lives. The output is plain text with correct syntax throughout, so you can paste it onto your server with confidence. A crawl-delay directive is also available for slowing down polite crawlers that fetch too aggressively.

## Use Cases

New sites use it on launch day, publishing a robots.txt that welcomes crawlers and points them at the sitemap. Staging and development sites use Disallow All so unfinished pages never appear in search results. Shop owners block admin, checkout, and account pages that should never be indexed. Site owners with large media libraries block image folders from crawlers they do not want. It is also the fix when a search engine keeps crawling a private area: add the path, re-upload the file, and the crawler is told to stay out.

## Frequently Asked Questions

**Does robots.txt hide pages from Google?**

No, not really. It asks crawlers not to fetch a page, but anyone who knows the URL can still open it, and a link from elsewhere can still reveal it exists. For genuine privacy, use a password or a noindex tag; robots.txt is a request, not a lock.

**What is crawl-delay for?**

It asks a polite crawler to pause between requests so it does not hammer a small server. Not every crawler honours it, and the major search engines largely ignore it, but it can help with smaller bots on a slow host.

**Can I allow one folder but block a file inside it?**

Yes. Add an Allow rule for the folder and a Disallow rule for the specific file. Crawlers read the more specific rule first, so the file stays blocked while the rest of the folder remains open.

**Do I need robots.txt if I want everything indexed?**

Not strictly — without one, crawlers simply crawl everything they can find. Even so, a short Allow All file is worth having, because it gives you a place to declare your sitemap and set rules later without changing anything else.
