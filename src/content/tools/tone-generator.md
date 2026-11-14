## Why Client-Side Matters

A pure tone at an exact frequency is a surprisingly useful thing — it tests a speaker, checks your hearing, tunes an instrument, or demonstrates how sound works. Many tone generators are buried inside apps that want an account or play ads between tones. This one runs entirely in your browser, synthesising sound live with the Web Audio API's oscillator. Nothing is installed, nothing is uploaded, and the tone starts the moment you press play.

## Step-by-Step Guide

Generating a tone takes seconds. First, set your frequency in Hertz — 440 Hz is concert pitch A, the standard tuning note, and the range runs from 20 Hz to 20,000 Hz. Second, choose a waveform: Sine for a smooth, pure tone; Square for a buzzy, hollow sound; Sawtooth for a bright, harsh edge; or Triangle for a soft tone somewhere between sine and square. Third, adjust the volume slider to a comfortable level, and the stereo balance if your device supports it. Finally, click "Play Tone" to start the sound and "Stop" when you are done — you can change the frequency and waveform while it plays.

## Feature Deep Dive

The generator covers the full range of human hearing, from a deep 20 Hz rumble to a piercing 20,000 Hz whistle, with every frequency in between available. The four waveforms each sound different at the same frequency, because they carry different harmonics: a sine wave is a single pure frequency with no overtones, which makes it ideal for hearing tests and speaker checks; a square wave sounds buzzy and is easy to hear at low volumes; a sawtooth wave is bright and cutting, close to the sound of a bowed string; and a triangle wave is mellow, like a soft flute. The volume and balance controls adjust smoothly in real time, so you can sweep the frequency up and down while listening for gaps, rattles, or dead spots in a speaker, or for the point where a high tone fades from your hearing.

## Use Cases

Tone generators are used by audio engineers testing speakers and headphones, who sweep through frequencies to find rattles, distortion, or dead spots. Musicians use the 440 Hz concert pitch to tune instruments, and singers use it to find their starting note. Teachers demonstrate sound and frequency in science lessons, letting students hear how pitch rises with frequency and how waveforms change the character of a sound. It is also used for simple hearing checks — finding the highest frequency you can still hear — and for testing room acoustics, where a steady tone reveals echoes and resonances that music would hide.

## Frequently Asked Questions

**What frequency should I use to test my speakers?**

Sweep slowly from low to high and listen for buzzing, rattling, or sudden drops in volume. A clean speaker sounds smooth all the way through; rattles usually show up at specific low frequencies.

**Why do the waveforms sound different at the same frequency?**

Because each waveform carries different overtones on top of the main frequency. A sine wave has none, so it sounds pure; square and sawtooth waves add harmonics, which make them sound buzzy or bright.

**Is it safe to play very loud tones?**

Keep the volume moderate, especially with headphones and at high frequencies. Loud pure tones can be uncomfortable and, at high volumes, can damage hearing — start quiet and raise it slowly.

**Can I use this to tune my instrument?**

Yes. Play the 440 Hz sine tone and tune your A string or note to match it, then tune the rest of the instrument from there.
