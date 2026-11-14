## Why Client-Side Matters

A random draw is only fair if the numbers are genuinely unpredictable, and that is harder than it looks. The basic random function built into many web pages produces numbers that are fine for a game but not trustworthy for a giveaway, a lottery, or any draw where money or prizes are at stake. This tool uses the browser's own cryptographic entropy source, the same one your browser relies on for secure connections, so every number is unbiased and impossible to predict. The generation happens entirely on your device, with no server involved and no way for anyone to interfere with the result.

## Step-by-Step Guide

First, set the minimum and maximum values for your range — 1 to 100 for a raffle, 1 to 6 for a die, or any range you need. Next, choose how many numbers to generate in one batch. Then decide on the two options: allow duplicates if repeats are fine, or switch on "No duplicates" when every number must be unique, and turn on sorting if you want the results in order. Click Generate and the numbers appear instantly, ready to copy to your clipboard for your records or your announcement.

## Feature Deep Dive

The engine is window.crypto.getRandomValues, the Web Crypto API's source of cryptographic randomness. Unlike simple pseudo-random functions, it draws on entropy from your device's hardware, which makes the output unbiased: every number in your range has an equal chance of appearing, and no one can predict the next result from the previous ones. The duplicate control matters more than it looks. With duplicates allowed, the tool behaves like rolling a die again and again; with "No duplicates" on, it behaves like drawing names from a hat, where each number can only appear once. The sort toggle orders the results for easy reading, while leaving it off preserves the order the numbers were drawn in. Copying the full batch takes one click.

## Use Cases

Giveaway hosts use it to pick winners transparently, drawing from a numbered list of entrants. Teachers draw numbers for classroom quizzes, teams, and seating plans. Game nights replace lost dice with a quick roll in any range, including unusual ones like a 20-sided die. Developers generate test data — random IDs, sample values, and port numbers — without writing a script. It also works for lottery picks, PIN generation, and deciding who goes first, anywhere a fair, unbiased choice is needed.

## Frequently Asked Questions

**Can I generate numbers in a negative range?**

Yes. The minimum and maximum are yours to set, so a range like -50 to 50 works exactly the same as 1 to 100. The tool treats any whole-number range the same way.

**Why do I sometimes see the same number twice?**

Because duplicates are allowed by default, just like rolling a die can show the same face twice. If you need every number to be unique, switch on the "No duplicates" option before you generate.

**Can I use this for a public giveaway draw?**

Yes. The numbers come from cryptographic entropy, so the draw is unbiased and fair. For transparency, save or screenshot the result and note the range and settings you used, so entrants can see how the winner was chosen.

**Does the order of the results matter?**

Only if you want it to. With sorting off, the numbers appear in the order they were drawn, which is useful for a ranked draw. With sorting on, they appear in ascending order, which is easier to scan and check.
