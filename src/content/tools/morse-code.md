## Why Client-Side Matters

Morse code has been carrying messages since the days of the telegraph, and it is still used by radio amateurs, scouts, and puzzle fans today. Learning it usually means memorising charts or installing an app, and many online translators send your message to a server. This tool translates text to Morse and Morse back to text entirely inside your browser, and it can even play the code aloud as sound. Nothing is uploaded, nothing is stored, and your message stays on your own device.

## Step-by-Step Guide

Translating a message takes seconds. First, select your direction: Text to Morse or Morse to Text. Second, enter your message — or your Morse string of dots and dashes — into the input box. Third, click "Translate" to see the result instantly. If you want to hear it, click "Play Audio" and the tool will play the message as standard Morse beeps through your speakers. You can translate as many messages as you like, switching direction whenever you need to.

## Feature Deep Dive

The translator uses international Morse code, the standard system where letters and numbers are built from short dots and long dashes. Letters are separated by spaces and words are separated by slashes, which keeps the output readable and makes it easy to decode again later. The audio is synthesised live with the Web Audio API: an oscillator plays at 600 Hz, with dots lasting 80 milliseconds and dashes lasting 240 milliseconds, following the standard timing that radio operators use. That means the sound you hear is not a recording but real Morse timing generated on the spot, so you can practise recognising the rhythm by ear — the skill that matters most if you ever want to use Morse for real.

## Use Cases

Morse code is more alive than most people think. Radio amateurs use it to communicate over long distances with very simple equipment, and scouts and cadets learn it as a traditional signalling skill. Puzzle designers hide Morse messages in escape rooms, treasure hunts, and birthday cards, and teachers use it to show how information can be carried by nothing more than short and long signals. It is also a fun way to send a secret message to a friend — a few dots and dashes that look meaningless to everyone else. For anyone studying for an amateur radio licence, translating and listening every day is one of the quickest ways to learn the code by ear.

## Frequently Asked Questions

**How do I write a space between words in Morse code?**

Words are separated by a slash ( / ), while letters within a word are separated by spaces. So "hi there" becomes a string where the slash marks the gap between the two words.

**Can I use the audio to learn Morse by ear?**

Yes, that is one of the best uses of the tool. Type a word, play the audio, and try to recognise the pattern before looking at the translation. Short daily practice builds recognition quickly.

**Does the translator handle numbers and punctuation?**

Yes. International Morse code includes codes for digits and common punctuation marks, so numbers and simple punctuation translate along with letters, exactly like words do.

**Will the audio play on my phone?**

Yes. The sound is generated with the Web Audio API in your browser, so it plays on phones, tablets, and computers without any download.
