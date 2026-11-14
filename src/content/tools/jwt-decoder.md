## Why Client-Side Matters

A JSON Web Token is a bearer credential: anyone holding it can act as the user it belongs to. Pasting one into an online decoder is therefore one of the riskiest things a developer can do — many decoding sites send your token to their servers, where it can be logged, stored, or stolen. This decoder works differently. It splits the token and decodes its base64url segments strictly inside your browser's sandbox. Your token never crosses the network, never touches a server, and is never logged anywhere.

## Step-by-Step Guide

Decoding a token takes seconds. First, paste your encoded JWT into the token input box. Second, read the decoded header and payload, shown as formatted JSON — the header tells you the algorithm and token type, while the payload shows the claims such as user ID, roles, and expiry. Third, check the status readout: the token's expiration, its algorithm, and a validity indicator. Finally, copy the header or payload with one click, or clear the token from the page when you are done.

## Feature Deep Dive

A JWT has three parts, separated by dots: the header, the payload, and the signature. The header names the signing algorithm, such as HS256 or RS256, and the token type. The payload carries the claims — the standard ones include the subject, the issuer, the issued-at time, and the expiry time, plus whatever custom claims your system adds, such as roles or permissions. The signature is what proves the token has not been tampered with, and it is created with a secret or private key. This tool decodes the first two parts so you can read them, and it checks the expiry claim against the current time, so you can see at a glance whether a token is still valid or has already expired. It deliberately does not verify signatures, because that would require your secret key — and a secret key should never be typed into any web tool.

## Use Cases

Developers debug login flows by reading the claims inside a token their API returned. Support engineers check whether a customer's expired token is the reason an app stopped working. Security reviewers inspect tokens during an audit to confirm the right claims are present. Students learning authentication see how a JWT is structured, part by part. Anyone integrating a third-party API can paste a test token and confirm it carries the user ID and roles they expect, without exposing a real credential.

## Frequently Asked Questions

**Can I decode a token that has already expired?**

Yes. Decoding only reads the token's contents, so an expired token decodes just like a valid one. The status readout will flag it as expired, which is often exactly what you are checking.

**What should I do if a token shows an algorithm I do not expect?**

Treat it as a warning sign. If your system issues HS256 tokens and you see a different algorithm, the token may come from another system — or it may have been tampered with. Check with your back-end team before trusting it.

**Is it safe to paste a production token here?**

The decoding runs entirely in your browser and nothing is transmitted, so the risk is far lower than with a server-side decoder. Even so, treat production tokens as sensitive: clear the page when you are done and never share a live token in chat or screenshots.

**Why can't the tool tell me if the signature is valid?**

Verifying a signature needs the secret key or public key that signed the token. Entering that key into a web page would expose it, so the tool leaves verification to your own server, where the key already lives.
