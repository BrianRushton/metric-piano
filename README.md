# metric-piano
Piano keyboard with 10 half-steps per octave (now "septave"!) instead of 12

A weird project by [Brian Rushton](http://brianrushton.blogspot.com/)
Based on [Musical Keyboard](https://keithwhor.com/music/) by [Keith William Horwood](https://keithwhor.com/) © 2013

## Explanation
The musical scale used by just about everything is divided into octaves, each of which contains 12 "half-steps". On a piano, some are white and some are black, but the intervals are all 2^(1/12) times the one below it, so that each note has a frequency of twice that of the one an octave below.

One might ask how we decided on 12 half-steps. I don't know (although it seems there are some handy math reasons), but I wondered what would happen if we only used 10. You know, like the metric system! This project is an investigation into that question. My hypothesis is that everything will sound... just terrible. This might be an absolute abomination.

### Details
I rounded Middle C's frequency to the nearest whole number and used that as the basis for the other notes. The others are created by multiplying 2^(1/10) times the frequency of the note below it.
I kept "C" as the name of the first note, but I figured letters would be confusing for the others, since they're not really related to the notes you're used to. So I used M1 through M9 for those. (C is essentially M0.)

The decision of where to put the black keys is tricky. On a real piano, the groups of 3 and 5 white keys have a mathematical basis, since major thirds and fifths relate to each other with nice proportions. I haven't seen anything like that on this metric scale. The least impactful change might have been to keep the first group the same and remove the last black and white key (A# and B). But then you'd get two groups of two black keys, and that would be hard to tell them apart. So I went with one group of one and one of three. I'm open to other suggestions, especially if there's a meaningful mathematical reason for it.
But let's face it: No matter what we do, these intervals are going to sound off.

### How could I get a real-live version of this amazing piano?
Pianos are expensive to make, but you could definitely tune a piano to the metric notes, and just ignore two notes in every octave. (You could duplicate M1 and M2 for D# and E, or maybe even just disconnect those strings.) I guess tuning a stringed instrument would be eaiser.

## How to Use
If you download this project, you can just double click piano.html to open the piano in your browser. (It isn't currently published to the web.)

**For science!**
