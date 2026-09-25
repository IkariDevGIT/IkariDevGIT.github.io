---
title: How i watch everything in 3d
description: How i watch anime, movies and series these days, and the setup behind it.
tags: [ai, vr]
---

<kao>( ˶ˆ ᗜ ˆ˶ )</kao>

I watch anime, movies and series in a pretty weird way. Nobody asked about it, but i wanna talk about it anyway, maybe theres something in here worth stealing for your own setup.

TLDR; everything gets turned into 3d in real time and thrown onto a huge virtual screen, while i lay in bed and a subwoofer at the foot of it shakes the bed frame.

## The setup

The thing everything else is built around is [iw3](https://github.com/nagadomi/nunif/blob/master/iw3/README.md), which is part of nagadomi's nunif project. You give it flat 2d video, it gives you SBS (side by side) 3d back. Nothing has to be made for 3d, thats the entire point, it just works on whatever you throw at it. Im using [desktop mode](https://github.com/nagadomi/nunif/blob/master/iw3/docs/desktop.md), which converts whatever is on your screen live instead of converting a file first, and i use the local viewer, not the wifi streaming thing it can also do.

From there its two screens and the headset:

- screen 2 has my browser with the anime or series playing
- iw3 grabs that screen and converts it to 3d in real time
- screen 1 has the local iw3 viewer with the SBS output on it
- the quest 3 sees screen 1 through Virtual Desktop, an app that streams your pc to the headset over wifi, in desktop mode with the SBS option on so it reads the two halves as one 3d image

So the video path is screen 2 -> iw3 -> screen 1 -> quest 3.

For the audio, the quest is connected to my surround setup over bluetooth, so it goes pc -> quest -> surround. Sounds like that should be a latency nightmare but its actually fine considering iw3 also adds a bit of latency, it basically cancels itself out.

That surround setup is 4 speakers, a center and a subwoofer. Pretty normal so far. The less normal part is that i have a second subwoofer, which is pushed right against the wooden frame at the foot of my bed. Wood carries low end really well, so the whole bed turns into part of the speaker. Explosions, swords hitting each other, doors getting kicked in, someone getting launched through a wall, you feel all of it through the mattress. Its incredibly immersive!

For the headset itself, the stock quest 3 strap is not made for laying around for hours, so i use a [BOBOVR M3 Pro](https://www.bobovr.com/products/bobovr-m3-pro) instead. Its a halo strap, which means the weight sits on top of your head instead of getting pressed into your face. Because of that i also took the facecover off the quest completely, so nothing touches my face, no sweat and no pressure marks and stuff like that. The not so nice thing about that is that light gets in from everywhere once the facecover is gone, which is why i only watch stuff at night. Im also plugged into the outlet the whole time, so battery is just not something i have to think about.

Then i lay down, turn the fan on, put the headset on, and watch the thing. <picture><source srcset="/images/badges/nightperson.webp" type="image/webp" /><img class="inline-blinkie" src="/images/badges/nightperson.gif" alt="Night person" width="150" height="20" loading="lazy" /></picture>

What comes out of all that:

- the screen is as big as i want it. not "big tv" big, more like sitting in a cinema big
- everything is in 3d!
- the audio has actual physical impact behind it because of the bed subwoofer
- im half sitting half laying, with the back of the headstrap leaning against the wall behind my bed, so my neck doesnt have to hold the headset up at all

The 3d is what surprises people the most when i explain it. Youd expect a model guessing depth out of a flat image to look pretty bad, and it really doesnt. Its also not as 3d as an actual 3d movie, but thats a good thing, you have to balance it so its immersive without going over the top or being hard on your eyes. Ive adjusted the values so much by now that i can confidently say im incredibly happy with it.

Scenes get actual depth instead of stuff flying at your face. Backgrounds sit back, characters sit in front of them, rooms feel like actual rooms. Once you get used to it, going back to flat video feels kinda wrong.

## The technical details

iw3 runs a depth estimation model on every single frame. The model looks at the picture and estimates how far away everything in it is, mostly from perspective and from how objects overlap each other. You can pick between a bunch of depth models, ZoeDepth, Depth-Anything v1 and v2, Depth Pro and Video-Depth-Anything, and they all trade quality against speed a bit differently.

For the second eye it just takes the frame you already have and shifts the pixels sideways based on the depth map. Close stuff shifts a lot and far stuff barely moves, which is basically what your two eyes see anyway. iw3 has a few different methods for that, the naive fast ones ghost around the edges of objects and the ML based ones handle edges way better and even fill in the gaps that show up behind them.

Theres a bunch of settings that change how the 3d actually looks, stuff like divergence, convergence, IPD (interpupillary distance) offset and foreground scale. Im not gonna go through all of them here, the [iw3 readme](https://github.com/nagadomi/nunif/blob/master/iw3/README.md) explains them way better than i could and has example pictures for most of them.

Performance was a real problem at first. Everything runs on a 3090, and it took a good amount of tuning before the iw3 output landed where it is now, around 20-24 fps. Written down that sounds rough, i know, but cinema has been running at 24 fps since the late 1920s. It started as a [compromise between the speeds theaters were already using](https://en.wikipedia.org/wiki/Frame_rate) when sound came in, but people connect it with cinema now and its still nice to look at.

Its also doing a lot per frame, a depth model and then the warp into a second view, all in real time while the pc is also decoding video and streaming a whole desktop to a headset. The docs default desktop mode to 15 fps, so 20-24 is doing alright.

For anime it also matters way less than you'd think, since a lot of it isnt animated on ones (a new drawing every frame) to begin with. Fast action scenes you notice it, everything else you really dont. And even then it doesnt bother me much, the rest of the setup easily makes up for a few missing frames.

Also, if anyone is curious, i dont run the original nunif. I use [my own fork](https://github.com/IkariDevGIT/nunif/tree/opinionated) on the opinionated branch, which is behind upstream by a bit but has two things i wanted for myself. One is fullscreen display mode switching in the local viewer, so hitting F11 switches the monitor the viewer sits on to a bigger display mode and puts it back when you leave fullscreen. The other is a fix for how iw3.desktop hands frames over when you capture with wc_cuda. Nothing huge, but i use both every single day.

That branch isnt really meant for anyone else, its just my own thing that i keep around because i need it. You can absolutely try it anyway, or just steal the idea and build it into your own setup, all welcome lol.

And this is what i actually start it with:

```
python -X faulthandler -m iw3.desktop --local-viewer-fullscreen-display-mode --monitor-index 1 --disable-draw-cursor --synthetic-view both --compile --foreground-scale 0.5 --screenshot wc_cuda --full-sbs --stream-fps 60 --depth-model VDA_Stream_B --scene-detect --divergence 1 --convergence 2 --edge-dilation 2 --method row_flow_v3 --stream-height 1080 --ema-decay 0.99 --ema-buffer 2 --ema-normalize --stream-quality 100 --local-viewer
```

## Future stuff

Ive tried a few more things on top of all this, most of them didnt make it.

### Frame generation

This was the big one. The idea was to stop running depth estimation on every single frame and instead reuse or interpolate the depth from the frame before it, which frees up a lot of performance. Theres a [whole issue about it](https://github.com/nagadomi/nunif/issues/619) where me and nagadomi went back and forth on it. My early testing looked really promising, i went from around 23 fps to 42 with frameskip 1, and even frameskip 4 didnt look awful at around 70. Doing it properly is the hard part though, you need the depth map itself moved along with the motion, and most frame interpolation just hands you a middle frame instead, which isnt the same thing at all. Between that and a few reasons of my own, i failed and scrapped the idea.

#### A simpler idea

Writing this post got me thinking about it again. What if the skipped frames just blend the depth map from before and the one after, nothing clever, no optical flow. It would probably look bad at something like frameskip 6, but at frameskip 4 it might be completely fine.

The nice thing is that only the depth is a guess. The image you actually look at is still the real frame, so the risk is wrong parallax and not a made up picture. Calm scenes should be fine. Moving edges are where it would wobble, since an outline would sit at some in between depth for a frame or two, and edges are what your eyes are pickiest about.

Maybe i should pick this back up at some point though. Ive grown a lot as a dev since i last touched it.

### Live upscaling and restoration

Cleaning up h264 artifacts and grain while its playing. I decided against that one pretty fast. I dont wanna sit there and watch slopified anime, and stacking that on top of iw3 doesnt look viable performance wise either.

### Image enhancing

This is the one i still actually like. Filters and color correction, so stuff like pushing bloom a bit harder or giving a scene more atmospheric depth. My test implementation had performance problems and im not good at color correction, so i scrapped it too, but the idea itself still seems very doable.

## "Thats not how its meant to be watched"

Some people are gonna say im overdoing it, or that this isnt how the creators wanted their work to be seen.

The "as intended" version doesnt exist at home anyway. Stuff gets rescaled, recompressed and reframed, and most people are watching on a phone, or on a tv with motion smoothing still switched on, in a bright room, through whatever speakers came in the box. If we want to be strict about intent then nobody is watching anything correctly.

I want to watch Saga of Tanya the Evil like im standing in the middle of it, and thats reason enough.

## Should you do this

Its a pile of things duct taped together that were never designed to work as one system, and it somehow ended up being the comfiest way i've ever watched anything. Old shows that never got a 3d release, random stuff in a browser tab, doesnt matter, it all comes out the other end in 3d on a cinema sized screen.

Not all of it is great though. iw3 isnt super stable, at least on my machine it likes to crash after a couple of hours and i have to restart it, which i can thankfully do from inside the headset. Everything also has to be connected and running before i can start watching anything. And the quest 3 does its own weird things sometimes, a controller not connecting, Virtual Desktop refusing to connect, stuff like that.

So it comes down to whether youre willing to go the mile, set all of this up and buy the hardware for it. I got lucky and did it the other way around, i already had all of this stuff sitting here anyway, so i just optimized the whole thing around what i already had.

If you already own a headset, iw3 is free and you can just try it. The bed subwoofer is optional, but i do recommend it.

## Afterword

This got way longer than i planned, i sat down to write a few paragraphs about how i watch anime.

Big thanks to nagadomi for iw3, none of this works without it, and for putting up with me in that frameskip issue.

If you end up building something like this, or you actually try the subwoofer against the bed thing, id like to hear about it. My contact stuff is on my [about page](/about/).