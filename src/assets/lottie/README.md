# NyaNudge — Lottie Asset Specification

This document details the core Mochi cat character animations used across the app, including their triggers, durations, and visual descriptions from the motion spec.

## Core Animations

| File | Duration | Type | What Happens |
|---|---|---|---|
| `cat_idle.json` | 2.5 s | **Loop** | Sine-wave body float, eye blink at 1.7 s, tail sways -15° → +15° |
| `cat_water.json` | 1.8 s | Once | Head tilts left curiously, teardrop falls and bounces, ripple ring appears |
| `cat_meal.json` | 2.0 s | Once | Two anticipation head bobs, food bowl with 3 staggered steam wisps |
| `cat_exercise.json` | 2.2 s | Once | Two squash-and-stretch jumps with paw pump + burst energy lines |
| `cat_bathroom.json` | 1.6 s | Once | Left-right head tilt ("huh?"), door + knob + arrow fade in |
| `cat_medicine.json` | 2.0 s | Once | Double approval nod, pill capsule spins in and bounces, sparkle crosses |
| `cat_celebrate.json` | 3.0 s | Once | Big exaggerated jump, 5 rotating gold stars burst radially, exclamation mark |
| `cat_sleep.json` | 4.0 s | **Loop** | Slow full-body rock, sleepy half-closed eyes, 3 ZZZ rise and fade, crescent moon |

## Usage
These animations are vector-based and stored in JSON format for use with `lottie-web`. They are registered in `src/shared/animations/registry.ts`.
