## Why Client-Side Matters

Keeping steady time is the foundation of playing music well, and a metronome is the simplest way to build that skill — but a physical metronome costs money, and many metronome apps are full of ads or locked behind subscriptions. This one runs entirely in your browser, using the Web Audio API's high-precision clock to schedule each click. Nothing is installed, nothing is uploaded, and the timing stays accurate for as long as you practise.

## Step-by-Step Guide

Starting a practice session takes seconds. First, set your tempo in beats per minute, from 30 to 260 BPM — use the slider, type a number, or tap the "Tap Tempo" button along with a song to match its speed. Second, choose your beats per bar: 2/4, 3/4, 4/4, or 6/8, depending on the time signature of the piece you are playing. Third, click "Start" or press the Spacebar to begin the click track. The first beat of each bar is accented so you can always feel where the bar starts, and a visual flash marks each beat for when you are playing too loudly to hear the click.

## Feature Deep Dive

The metronome's accuracy comes from the Web Audio API, which schedules clicks ahead in hardware time rather than relying on the browser's screen refresh — the result is sub-millisecond precision, far steadier than a timer in a normal web page. The tempo range covers everything from a slow 30 BPM practice crawl to a fast 260 BPM sprint, so the same tool works for a beginner learning their first scales and an advanced player drilling a fast passage. The time signature control changes the accent pattern: the first beat of each bar sounds different from the rest, which trains your ear to feel the bar as well as the beat. Tap Tempo is the most practical feature for real songs — tap along with the music you are listening to and the metronome locks onto its speed, so you can practise at exactly the right tempo.

## Use Cases

A metronome is a daily companion for musicians of every kind. Guitarists and pianists use it to keep scales and exercises even, drummers use it to lock in a groove, and violinists and vocalists use it to hold a steady tempo through a long phrase. Teachers set it running during lessons so students learn to play in time from the start, and bands use it in rehearsal to settle arguments about whether a song is dragging. It is also useful outside music: dancers use it to practise steps at a steady pace, and speakers use a slow tempo to pace their delivery. Anyone learning an instrument will improve faster with a metronome than without one — steady time is a skill that only comes from practising against a steady beat.

## Frequently Asked Questions

**What tempo should I start practising at?**

Start slow — slow enough to play the passage perfectly, even if that feels too easy. Speed up a few BPM at a time only when the slow tempo feels comfortable. Accuracy first, speed second.

**Why does the first beat of each bar sound different?**

That is the accent. It marks the start of the bar so you can feel the time signature, not just a stream of identical clicks. It helps you stay in the right place in the music.

**Can I use the metronome with headphones?**

Yes. The click plays through whatever audio output your device uses, so plug in headphones and the click stays private while you practise.

**Does the metronome keep time if I switch to another tab?**

The audio clock keeps running in the background, so the clicks stay steady. The visual flash may pause when the tab is hidden, but the sound continues.
