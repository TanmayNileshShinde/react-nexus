# System Architecture — React Nexus Arcade Hub

This document details the modular arcade architecture, game loop ticks, state machines, and leaderboard synchronization.

## Architecture Overview

```text
[ Arcade Shell (React 19) ]
         |
         +---> [ Game Engine Loop (60 FPS requestAnimationFrame) ]
         |            |
         |            +---> [ Collision Detection / Physics ]
         |            +---> [ Audio Synth Subsystem ]
         |
         +---> [ Cloud Leaderboard Sync (Firebase Firestore) ]
```

### Components
1. **Game Controller Layer:** Manages high-frequency input dispatchers (Keyboard, Touch D-Pad, Gamepad API).
2. **Audio Synthesizer Engine:** Uses Web Audio API dynamic wave synthesis for responsive sound playback.
3. **State Machine:** Isolates game state ticks from React render cycles for zero-latency 60 FPS gameplay.
