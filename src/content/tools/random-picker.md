## Why Client-Side Matters

Picking a winner fairly matters — whether it is a raffle, a classroom draw, or who goes first in a game. Drawing names from a hat works, but it is slow, easy to fumble, and hard to prove fair when someone doubts the result. Many online pickers run on servers that record your list. This one picks entirely in your browser, using cryptographic randomness to choose from your list. Your names never leave your device, nothing is stored, and the draw is transparent and fair.

## Step-by-Step Guide

Picking a winner takes a minute. First, enter your candidate names or choices, one per line, in the input box. Second, select how many items or winners to draw — one for a single winner, or two, three, or more for multiple prizes. Third, use "Shuffle List" to reorder the names before drawing, if you want an extra visible mix. Finally, click "Pick Winner" and the result is revealed with a celebratory animation, showing the chosen names clearly.

## Feature Deep Dive

The picker is built on your browser's cryptographic random API, the same kind of randomness used for security keys — which means every name in the list has an exactly equal chance of being picked, with no bias toward the top, the bottom, or the longest entry. The multiple-winner option draws several distinct names at once, so a raffle with three prizes is settled in a single click instead of three separate draws. Shuffling the list before the draw is a visible fairness step: everyone watching can see the order change before the pick is made. The reveal animation adds a small moment of theatre to the draw, which matters more than it sounds — a raffle feels fair when the result is shown openly, not just announced. Because the list stays in your browser, there is no upload, no account, and no record of who was entered.

## Use Cases

Random pickers are used by teachers choosing a student to answer a question, so nobody can say the teacher always picks favourites. Streamers and community managers draw giveaway winners live on screen, where the visible shuffle and reveal make the draw feel honest. Teams use them to assign tasks fairly — who presents first, who takes the next shift, who gets the on-call week — and event organisers draw raffle winners at parties and fundraisers. They are also handy for everyday decisions: pick a restaurant from a list, choose a film from everyone's suggestions, or decide who goes first in a game, without an argument about who chose.

## Frequently Asked Questions

**Can the same person win twice in one draw?**

No. When you draw multiple winners, each name is picked once — the tool draws distinct names, so nobody wins two prizes in the same draw.

**How many names can I enter in the list?**

There is no server limit, because the list lives in your browser. Long lists of hundreds of names work fine, though very large lists depend on your device's memory.

**What is the shuffle for if the pick is already random?**

The pick is random either way, but shuffling visibly reorders the list first, which reassures everyone watching that the draw was fair and not fixed.

**Can I reuse the same list for another draw?**

Yes. Your list stays in the input box, so you can draw again right away — for example, to pick a runner-up after the main winner.
