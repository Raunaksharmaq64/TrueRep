# 🏋️ TrueRep: Core Fundamentals & System Architecture Guide

> **Welcome!** This document explains how **TrueRep** works from the ground up in plain, easy-to-understand language. Whether you are a fitness enthusiast, a coach, a hackathon judge, or completely non-technical, this guide will give you a clear, crystal-clear understanding of how TrueRep tracks your body, calculates repetitions, detects form errors, and acts as your personal AI fitness coach.

---

## 📑 Table of Contents
1. [The Big Picture: What is TrueRep?](#1-the-big-picture-what-is-truerep)
2. [The Technology Stack (What Powers TrueRep)](#2-the-technology-stack-what-powers-truerep)
3. [The Core Philosophy: "The Eye" vs. "The Brain"](#3-the-core-philosophy-the-eye-vs-the-brain)
4. [How TrueRep Tracks Your Body (Step-by-Step)](#4-how-truerep-tracks-your-body-step-by-step)
5. [How TrueRep Calculates Repetitions (No Cheating Allowed!)](#5-how-truerep-calculates-repetitions-no-cheating-allowed)
6. [How TrueRep Evaluates Exercise Form (The 5 Pillars)](#6-how-truerep-evaluates-exercise-form-the-5-pillars)
7. [The Breakthrough: Synthetic Depth Shadows (Solving 2D Webcam Limits)](#7-the-breakthrough-synthetic-depth-shadows-solving-2d-webcam-limits)
8. [How TrueRep Stops Glitches, Noise, and Bad Frames](#8-how-truerep-stops-glitches-noise-and-bad-frames)
9. [Audio & Visual Feedback: Coaching in Real Time](#9-audio--visual-feedback-coaching-in-real-time)
10. [Privacy, Security & Medical Boundaries](#10-privacy-security--medical-boundaries)
11. [Summary Checklist](#11-summary-checklist)

---

## 1. The Big Picture: What is TrueRep?

Imagine having an **Olympic strength coach standing in your room**, watching your every rep, telling you in real time:
- *"Chest lower!"*
- *"Push your knees out!"*
- *"Keep your back flat!"*
- *"Clean rep! +1"*

Usually, to do this with technology, you need expensive motion-capture suits, laser sensors, or dedicated multi-camera studio setups.

**TrueRep achieves this using just the everyday webcam built into your laptop or phone.** It turns your web browser into an ultra-precise, real-time biomechanical analysis station.

---

## 2. The Technology Stack (What Powers TrueRep)

TrueRep was engineered from day one to be **fast, private, and instant**. You don't have to install heavy software, download gigabytes of files, or sign up for cloud services.

| Technology Component | What It Does | Why It Matters for You |
| :--- | :--- | :--- |
| **React 18 & Vite** | The modern user interface engine | Super-smooth, responsive screens, instantaneous navigation, zero lag. |
| **Google MediaPipe Tasks-Vision** | The AI vision model (BlazePose) | Detects **33 3D skeletal landmarks** on your body at 30+ frames per second. |
| **WebAssembly (WASM) & WebGL** | Hardware acceleration inside the browser | Allows the AI to use your computer's graphics card (GPU) directly inside Google Chrome, Edge, Safari, or Firefox without plugins. |
| **Local Offline Bundled AI** | AI models stored right in your browser | Works 100% offline! Even if your internet disconnects mid-workout, tracking never stops. |
| **Web Speech API** | Built-in voice coaching engine | Speaks spoken instructions aloud through your speakers or headphones like a real coach. |
| **Web Audio API** | Real-time audio synthesizer | Plays motivational audio cues (depth dings, rep confirmation chimes, flame combo sound effects) with zero latency. |
| **Tailwind CSS** | Styling & visual system | Sleek, modern, esports-grade dark cyberpunk visual aesthetic. |

---

## 3. The Core Philosophy: "The Eye" vs. "The Brain"

Most basic AI fitness apps make a catastrophic mistake: they assume the camera AI is the coach.

In TrueRep, we strictly separate **The Eye** from **The Brain**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                1. THE EYE (Computer Vision)                 │
 │  MediaPipe AI looks at the video feed and outputs 33 dots.  │
 │  It does NOT know what a squat is. It just sees points.     │
 └──────────────────────────────┬──────────────────────────────┘
                                │
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                2. THE BRAIN (TrueRep Kinematics)            │
 │  TrueRep takes those 33 dots, calculates real-world angles, │
 │  measures body bone proportions, tracks velocity, enforces  │
 │  strict sports-science rules, and grades movement quality.  │
 └─────────────────────────────────────────────────────────────┘
```

By separating them, TrueRep never makes wild guesses. If the Eye is temporarily blinded (e.g. low light or you walk out of the frame), the Brain politely tells you to step back, rather than inventing fake reps or giving you a bogus score.

---

## 4. How TrueRep Tracks Your Body (Step-by-Step)

Every single second you exercise, TrueRep processes approximately **30 to 60 video frames**. Here is the 6-step journey every frame takes:

```
[Webcam Frame] 
      ↓
(1) Camera & Lighting Check: Is the room bright enough? Is the user fully in view?
      ↓
(2) Skeleton Discovery: Detect 33 body points (shoulders, elbows, hips, knees, ankles, toes).
      ↓
(3) Jitter Smoothing: Clean up twitchy dots so the skeleton glides smoothly.
      ↓
(4) Angle Calculation: Measure knee bend, hip drop, elbow angle, and spine straightness.
      ↓
(5) Phase & Rep Engine: Is the user standing, descending, in deep bottom, or pushing up?
      ↓
(6) Feedback & Scoring: Award clean reps, increment combo streaks, or speak a voice tip.
```

### The 33 Landmarks
TrueRep tracks 33 critical anatomical joints:
- **Head**: Nose, eyes, ears (used to detect head tilting and neck strain).
- **Upper Body**: Shoulders, elbows, wrists (used to measure arm bend and elbow flare).
- **Core / Torso**: Left and right hips (used to measure spine tilt and body plank alignment).
- **Lower Body**: Knees, ankles, heels, and toes (used to track squat depth, stance width, and knee caving).

---

## 5. How TrueRep Calculates Repetitions (No Cheating Allowed!)

A common problem with fitness apps is **"cheating"**: bobbing your head, nodding, or doing half-inch mini-movements that trick the computer into counting 50 fake reps.

TrueRep makes cheating impossible using a sports-science concept called a **Finite State Machine (FSM)**. Think of it like a **turnstile at a subway station**: you cannot reach the exit until you push through the turnstile in the exact correct sequence.

### Example: How a Squat Rep is Counted

```
┌──────────────────────────────────────────────────────────────┐
│ STAGE 1: LOCKOUT (Starting Position)                        │
│ • Athlete stands tall.                                       │
│ • Knees and hips are extended (~165°–180°).                  │
│ • System latches: "Athlete is ready to begin descent."       │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Athlete bends knees)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 2: DESCENDING (Controlled Drop)                        │
│ • Knees flex smoothly past 140° → 120° → 100°.              │
│ • System monitors descent speed and knee alignment.          │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Athlete reaches bottom)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 3: IN_DEPTH (The Honest Bottom)                        │
│ • Hip crease drops level with or below top of knee patella.  │
│ • Knee angle reaches ≤ 100° (or deep Olympic ≤ 85°).         │
│ • 🔔 "DING!" chime plays: Depth is officially unlocked!      │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Athlete drives upward)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 4: ASCENDING (The Drive)                               │
│ • Hips and knees extend back upward past 130° → 150°.        │
│ • System checks that athlete doesn't wobble or lean over.    │
└──────────────────────────────┬───────────────────────────────┘
                               │ (Full return to top)
                               ▼
┌──────────────────────────────────────────────────────────────┐
│ STAGE 5: REP COMPLETE! (+1 Rep Added to Total)               │
│ • Athlete returns to full tall lockout (knees ≥ 160°).       │
│ • System calculates rep score (e.g., 96% Elite).             │
│ • Streak increases! Ready for the next rep.                  │
└──────────────────────────────────────────────────────────────┘
```

### Why You Can't Fake It:
1. **Half-Reps Don't Count**: If you only squat halfway down and stand back up, Stage 3 is never reached. No rep is awarded.
2. **Speed Spikes Don't Count**: If you drop down in 0.1 seconds (a camera glitch or falling), the system rejects it as unnatural movement.
3. **No Reset Until Return**: You cannot get another rep until you stand completely back up into Stage 1 lockout.

---

## 6. How TrueRep Evaluates Exercise Form (The 5 Pillars)

TrueRep doesn't just count reps; it grades the **quality** of every single movement on a 100-point scale based on **5 Sports-Science Pillars**:

```
                       ┌─────────────────────────┐
                       │  OVERALL FORM SCORE     │
                       │       (0 - 100%)        │
                       └────────────┬────────────┘
         ┌──────────────┬───────────┴───────────┬──────────────┐
         ▼              ▼                       ▼              ▼
   1. Depth (35%)  2. Alignment (25%)    3. Stability (20%) 4. Symmetry (10%) & Tempo (10%)
```

### 1. Depth & Range of Motion (35% Weight)
* **Squats**: Did your hips drop parallel to your knees?
* **Push-Ups**: Did your chest lower to the virtual floor plane?
* *Why it matters*: Full range of motion builds true muscle strength and protects your joints from tendon imbalances.

### 2. Biomechanical Alignment (25% Weight)
* **Knee Valgus (Knee Caving)**: When squatting, your knees must track in line with your toes. If your knees collapse inward toward each other, TrueRep detects this joint shear stress and cautions you: *"Push knees out!"*
* **Push-Up Spine Sag**: Your body should form a rigid, unbroken plank from shoulders to heels. If your hips sag toward the ground, TrueRep catches it instantly.

### 3. Stability & Smoothness (20% Weight)
* Evaluates whether your movement is steady and controlled or shaky and violent.
* Penalizes sudden erratic jerks or loss of balance.

### 4. Left vs. Right Symmetry (10% Weight)
* Are you pushing 70% with your right leg and only 30% with your left leg?
* TrueRep measures both sides independently to reveal hidden muscular imbalances.

### 5. Tempo & Control (10% Weight)
* Prevents "free-falling" downward or bouncing off your joints.
* Rewarding a controlled 2-second descent and an explosive ascent.

---

## 7. The Breakthrough: Synthetic Depth Shadows (Solving 2D Webcam Limits)

### The Problem Every Other App Faces
Standard webcams only see in flat 2D (pixels left/right and up/down). They have **no depth sensors**. 

If your laptop sits on a desk looking down at you on the floor doing push-ups, the angle makes your elbows look like they're barely bent ($105^\circ$) even when your chest is physically touching the carpet! Naive apps will constantly yell *"Go deeper!"* even when you can't physically go any deeper.

### The TrueRep Solution: The Virtual Ground Plane
TrueRep solves this with an innovative computer vision technique called **Synthetic Depth Shadows**:

```
    [Webcam View]
       O (Shoulder)
      / \
     /   O (Chest / Sternum)
    /     \
   O-------O================================================= [VIRTUAL FLOOR PLANE]
 (Wrist) (Toes)     ▲
                    │ TrueRep tracks normalized distance from Chest to Floor:
                    │ Distance ≤ 38% of arm length = CHEST IS AT FLOOR!
```

1. **Automatic Floor Line Detection**: The system identifies where your hands (wrists) and feet (toes) make physical contact with your room's floor. It draws a mathematical **Virtual Floor Line**.
2. **Normalized Chest-to-Floor Proximity**: It calculates the exact remaining gap between your chest and that floor line, divided by your arm length.
3. **Dual-Condition Unlock**: A push-up is counted if your elbow reaches $95^\circ$ **OR** if your chest touches the virtual floor plane ($38\%$ proximity).
4. **Visual AR Laser Feedback**: A glowing neon depth laser displays under you on the screen, changing from Cyan $\to$ Amber $\to$ Radiant Green `[✓ CHEST AT FLOOR]` the moment you hit full depth!

---

## 8. How TrueRep Stops Glitches, Noise, and Bad Frames

Webcams are noisy. Low light, moving curtains, or baggy clothes can cause AI points to twitch. TrueRep employs **four layers of defensive engineering** so sensor noise never spoils your workout:

### Layer 1: Anatomical Sanity Gating
* Human bones cannot stretch or shrink.
* Your forearm (elbow to wrist) is always the exact same length. If a lighting glitch makes your hand point teleport across the room in 1/30th of a second, TrueRep detects this impossible bone stretch and **rejects the glitch frame completely**.

### Layer 2: Adaptive Temporal Smoothing (The 1€ Filter)
* When you are holding a plank or paused at the bottom of a squat, TrueRep applies heavy smoothing to keep your skeleton rock-solid.
* When you move explosively, it automatically loosens the smoothing so there is **zero lag or delay**.

### Layer 3: Multi-Frame Consensus (The 4-Frame Rule)
* TrueRep **never** shouts an error at you because of one single bad frame.
* A form fault (like knees caving inward) must persist for **at least 4 consecutive frames (over 120 milliseconds)** before the coach speaks up. This eliminates 99% of false alarms.

### Layer 4: Clear Error Debouncing (The Cooldown Rule)
* Nobody likes an annoying coach who repeats the same sentence 20 times in 5 seconds.
* Once TrueRep gives you a voice cue (*"Push your knees out"*), it enters a **3.5-second cooldown timer**, giving you time to correct your posture without being spammed.

---

## 9. Audio & Visual Feedback: Coaching in Real Time

TrueRep provides instant, multi-sensory feedback designed to keep you motivated and focused on your workout:

1. **Esports-Grade Cyberpunk Skeleton**: 
   - **Cyan Bones**: Normal, textbook movement.
   - **Gold / Amber Aura**: You are on a **Flame Combo Streak** of 3+ perfect reps!
   - **Neon Emerald**: Instant flash when you achieve full depth.
   - **Red Laser Warning**: Highlights the exact joint breaking form (e.g. sagging lower back).
2. **Atlas AI Spoken Voice Coach**: 
   - Speaks concise, actionable coaching tips directly through your speakers (*"Drive through your heels"*, *"Keep chest up"*, *"Step back slightly"*).
3. **Audio Ding Chimes**: 
   - A high-frequency pitch chime signals depth attainment without you having to look directly at the screen.
4. **End-of-Session Performance Card**: 
   - Automatically summarizes your total reps, clean reps, average score, maximum combo streak, and your number one area for improvement.

---

## 10. Privacy, Security & Medical Boundaries

### 🔒 100% On-Device Privacy
* **Zero Video Uploads**: TrueRep **NEVER** records, saves, or transmits your video stream to the cloud. All computer vision calculations occur locally inside your device's memory.
* If you disconnect your internet cable after opening the page, TrueRep continues working flawlessly.

### ⚕️ Fitness Coaching vs. Medical Boundary
* TrueRep is an athletic technique and exercise form training assistant.
* It is **not** a medical device and does **not** diagnose musculoskeletal injuries. If an unusual movement pattern is detected, it offers conservative guidance: *"This movement pattern appears unusual. Consider checking your technique with a certified trainer."*

---

## 11. Summary Checklist

| Question | How TrueRep Handles It |
| :--- | :--- |
| **Can I cheat reps?** | **No.** The 5-stage FSM requires full descent to true depth and a complete return to lockout. |
| **Do I need a special camera?** | **No.** Any standard 720p or 1080p webcam works. |
| **What if my laptop is on the floor or desk?** | **Auto-adapted.** Synthetic depth shadows track real floor contact regardless of camera tilt. |
| **Does it lag?** | **No.** Runs hardware-accelerated locally at 30–60 FPS. |
| **Is my video private?** | **100% Private.** The video never leaves your browser. |

---

*TrueRep is built on the belief that fitness technology should not rely on marketing gimmicks or fake claims. By combining rigorous sports-science biomechanics with defensive computer vision engineering, TrueRep delivers honest, measurable, and reliable exercise coaching to everyone.*
