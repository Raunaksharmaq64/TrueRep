# CombatForm: Comprehensive Feature Specification & Platform Architecture

> **Platform Tagline:** *"Don't just count reps. Prove them. Then fight for the map."*  
> **Core Mission:** Transforming solo, repetitive, easily faked workouts into an objective, AI-verified, competitive multiplayer e-sport and campus territory conquest platform. Accessible on any smartphone or PC browser with zero required hardware and zero app store barriers.

---

## 1. Feature Architecture Overview

CombatForm is structured into **6 integrated feature pillars**:

```
                       ┌──────────────────────────────────────────────┐
                       │           COMBATFORM PLATFORM CORE           │
                       └──────────────────────┬───────────────────────┘
                                              │
         ┌──────────────────┬─────────────────┼─────────────────┬──────────────────┐
         ▼                  ▼                 ▼                 ▼                  ▼
   [ Pillar 1 ]       [ Pillar 2 ]      [ Pillar 3 ]      [ Pillar 4 ]       [ Pillar 5 ]
   Solo Workout       Post-Workout      Real-Time 1v1     RPG Avatar &       Campus & Gym
   & AI Coach         Biometrics        Battle Arena      Gamification       Turf War
```

---

## 2. Pillar 1: AI-Powered Solo Workout Suite ("Ghost Coach")

Designed for daily training, calisthenics progression, and personal milestone tracking with strict anti-cheat verification.

### 2.1 Instant Target & Timed Challenges
* **Target Challenges (e.g., 50 Push-Up Blitz):**
  * The user selects a target (e.g., 20, 50, or 100 reps).
  * An ultra-precise stopwatch tracks total time to completion.
  * Only reps that meet 100% geometric form criteria count toward the total.
* **Timed Deathmatch (e.g., 60-Second Push-Up / Squat Sprint):**
  * Fixed 60-second countdown clock.
  * Tracks maximum verified reps performed under pressure.
* **Isometric Endurance (e.g., Iron Plank Hold):**
  * Tracks elapsed seconds while maintaining a rigid spinal angle ($\ge 160^\circ$).
  * The clock auto-pauses the moment hips sag below the threshold or hike upward into a pike.

### 2.2 Live Tactical Augmented HUD
* **Skeletal Joint Overlay:** High-contrast, neon-glowing skeletal lines connecting all 33 keypoints in real time.
* **Real-Time Color-Coded Kinematics:**
  * **Neon Emerald Green:** Joint is in valid range ($\le 90^\circ$ elbow/knee angle, flat spine).
  * **Amber Yellow Warning:** Incomplete range of motion (e.g., elbow reached $115^\circ$ and reversed early).
  * **Crimson Red Hazard:** Form break (e.g., hip sag $< 150^\circ$, knee valgus cave-in).
* **Live Angle Badges:** Floating digital degree readouts anchored directly to joints (e.g., `88° - Valid Depth`).

### 2.3 Holographic "Ghost Silhouette" (AR Alignment Mirror)
* **The Problem:** Beginners often set the phone down at an odd angle and don't know where to position their hands, knees, or feet.
* **The Solution:** Before the challenge begins, a translucent green holographic body outline appears on screen.
* **Interactive Lock-In:** The user positions their body inside the silhouette. Once MediaPipe confirms keypoints match the silhouette boundary, the HUD flashes green: *"Body Locked. Starting in 3... 2... 1..."*.

### 2.4 Hands-Free Browser Voice Coach (Native Web Speech API)
* **The Problem:** Looking down at a phone screen during push-ups or planks strains the neck and breaks form.
* **The Solution:** Real-time audio coaching spoken directly through the device speakers:
  * *"Lockout ready... descend!"*
  * *"Good depth! Push up!"*
  * *"Warning: Raise your hips!"*
  * *"Halfway there, 25 reps locked!"*
  * *"Final 5 reps, finish strong!"*
* **Zero Cost / Zero Delay:** Powered by the browser's native `window.speechSynthesis`—runs 100% offline with zero cloud audio API costs.

### 2.5 Smart "Rest-Pause" Detector & Auto-Timer
* During high-volume sets (like 50 push-ups), athletes naturally fatigue and drop to their knees to catch their breath.
* Traditional apps assume the workout ended or count resting fidgets as fake reps.
* **CombatForm Intelligence:** 
  * Detects when knees contact the floor and arms disengage.
  * Automatically pauses the rep cycle and displays a **15-Second Rest-Pause HUD** with deep-breathing animations.
  * Counts down: *"Breathe... Resuming in 5, 4, 3, 2, 1... Back in plank!"*.

---

## 3. Pillar 2: Post-Workout Analytics & Biometric Visualizer

After completing a session, the user is presented with an elite diagnostic dashboard rather than a simple number.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        WORKOUT SUMMARY: 50 PUSH-UPS                    │
│   Time: 1m 42s    |    Clean Reps: 50    |    Rejected Reps: 4         │
│   Accuracy: 92.6% (Rank: S-TIER)         |    Form Violations: 4       │
├────────────────────────────────────────────────────────────────────────┤
│  [ FATIGUE & VELOCITY CURVE ]                                          │
│  Rep Speed (s)                                                         │
│  2.5s │                                              ╭─── Shallow Rep  │
│  2.0s │                                     ╭────────╯                 │
│  1.5s │                             ╭───────╯                          │
│  1.0s │ ────────────────────────────╯                                  │
│  0.5s │                                                                │
│       └─────────────────────────────────────────────────────────────   │
│        Rep 10        Rep 20        Rep 30        Rep 40        Rep 50  │
├────────────────────────────────────────────────────────────────────────┤
│  [ FORM FAULT BREAKDOWN ]                                              │
│  • Clean Lockout Reps:  50  (92.6%) [████████████████████████░]        │
│  • Shallow Depth:        3   (5.5%) [██░░░░░░░░░░░░░░░░░░░░░░]        │
│  • Hip Sag / Core Break: 1   (1.9%) [█░░░░░░░░░░░░░░░░░░░░░░░]        │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.1 Kinematic Fatigue & Rep-Velocity Curve
* Visualizes the duration (in seconds) of each repetition from rep 1 to rep 50.
* Pinpoints the exact rep number where muscular endurance began to degrade and form started breaking down.

### 3.2 Categorized Fault Breakdown
* Displays exact counts and timestamps for:
  1. **Shallow Depth:** Elbows failed to cross the $90^\circ$ threshold.
  2. **Incomplete Lockout:** Starting the next repetition before arms hit $\ge 160^\circ$.
  3. **Hip Sag:** Spinal angle dropped below $155^\circ$ during ascent.
  4. **Pike Fault:** Buttocks lifted excessively into the air to reduce pectoral load.

### 3.3 Shareable "Proof-of-Workout" Certificate
* Generates a sleek, high-resolution visual card with a cryptographic or verification hash:
  * User Avatar & Name
  * Verified Rep Count & Duration
  * Form Accuracy Score & Grade Badge
* One-click share to WhatsApp, Instagram Stories, or direct export for personal trainers.

---

## 4. Pillar 3: Real-Time 1v1 Battle Arena (Multiplayer Duels)

The flagship competitive mode that transforms solo physical exertion into a live synchronized e-sport.

### 4.1 Duel Entry Modes
* **Private 4-Digit Room Code:**
  * Player A creates a match and receives a code (e.g., `FIT-402`).
  * Player B enters the code on their phone or clicks a shared link to enter the lobby immediately.
* **Quick Match (Ranked Matchmaking):**
  * Auto-queues players into skill-based matchmaking based on their global ELO rank.
* **The "Ghost Bot" Fallback (Zero-Wait Guarantee):**
  * If no opponent is found within 4 seconds, the system seamlessly pairs the player with an **AI Ghost Competitor** (e.g., *"Spartan_AI"*).
  * The bot generates dynamic reps with human-like variability and fatigue curves, ensuring the user (and hackathon judges) never wait on a loading screen.

### 4.2 Live Match HUD & Real-Time Sync
* **Synchronized 60-Second Match Clock:** Server-authoritative countdown timer broadcast over low-latency WebSockets.
* **Live Split-Screen / Progress Gauges:**
  * Dual rep meters showing your count vs. your opponent's live count.
  * Real-time lead indicator: `+3 Reps Ahead` (green) or `-2 Reps Behind` (red).
* **Momentum & Combo Multiplier:**
  * Performing 3 consecutive reps with $> 95\%$ form accuracy triggers a **Flame Combo Aura** ($1.5\times$ XP bonus).
  * Breaking form or shallow bouncing resets the combo streak to zero.
* **Audio-Visual Urgency Warnings:**
  * *"Opponent is on a 5-rep streak!"*
  * *"Lead changed! Push harder!"*
  * *"Final 10 seconds!"*
* **Sudden Death / Tiebreaker:**
  * If reps are tied when the timer hits 0:00, the match enters a 15-second Sudden Death overtime: first player to complete 3 perfect-form reps wins.

---

## 5. Pillar 4: RPG Gamification & Dynamic Avatar Evolution

Players earn experience points (XP) and unlock visual status symbols solely through physical performance.

### 5.1 Dynamic Multi-Tier Avatar Evolution
The player's character dynamically upgrades as they hit cumulative rep and accuracy milestones:

```
[ TIER 1: NOVICE INITIATE ]
  - Level 1 - 5
  - Basic training gear, neutral aura
  - Unlocked at: First completed workout

           ▼ (Earn 1,000 Verified Reps + 85% Avg Form)

[ TIER 2: GYM GLADIATOR ]
  - Level 6 - 15
  - Tactical fitness apparel, glowing neon wrist wraps, animated stance
  - Unlocked at: 500 clean reps in 1v1 duels

           ▼ (Earn 5,000 Verified Reps + 92% Avg Form)

[ TIER 3: CYBER SPARTAN / IRON TITAN ]
  - Level 16+
  - Holographic armor plating, flaming trail aura, animated victory banner
  - Unlocked at: Winning 25 campus territory duels
```

### 5.2 Streaks, Daily Bounties & Badges
* **Daily Bounties:**
  * *"Morning Strike:"* Complete 30 push-ups before 10:00 AM.
  * *"Iron Discipline:"* Finish a 60s duel with $100\%$ form accuracy.
* **Honor Badges:**
  * **"Steel Spine":** Completed 50 push-ups with zero hip sags.
  * **"Ass-to-Grass":** 50 consecutive squats hitting $\le 80^\circ$ deep depth.
  * **"Turf Warlord":** Captured 3 campus zones in a single week.

---

## 6. Pillar 5: Campus & Commercial Gym "Turf War" (Territory Conquest)

Inspired by geofenced territory battles, CombatForm turns college campuses and local gym networks into interactive battlegrounds.

### 6.1 3D Campus Map (MapLibre GL JS)
* Renders an interactive 3D map of the user's college campus or neighborhood.
* Key buildings are designated as **Capture Zones**:
  * *Zone A:* Central Campus Library
  * *Zone B:* Sports Complex / Gym
  * *Zone C:* Mechanical Engineering Department
  * *Zone D:* Student Activity Center / Canteen

### 6.2 Faction Warfare (Blue vs. Red / Inter-Department Battles)
* Students join a faction (e.g., Blue Faction vs. Red Faction, or Computer Science vs. Mechanical).
* When a user wins a 1v1 duel or completes a verified challenge near or dedicated to a campus zone, their faction earns **Influence Points**.
* **Dynamic Polygon Shading:**
  * Zones controlled by Blue Faction glow translucent blue.
  * Zones under dispute pulse in warning amber.
  * Weekly leaderboard resets crown the champion department/faction with campus bragging rights.

---

## 7. Pillar 6: Gym Kiosk Mode & Trainer Ecosystem

Expanding CombatForm from a personal app into a B2B platform for commercial gyms and fitness coaches.

### 7.1 "Gym Kiosk Mode" via QR Codes (Zero-Install Access)
* Commercial gyms stick QR codes on squat racks, calisthenics rigs, or front desk screens:
  * *"Scan to enter Gold's Gym Monthly Squat Challenge"*.
* A gym member points their standard smartphone camera at the QR code.
* The web app opens instantly in the mobile browser with zero app installation.
* The member performs their set; their verified score is instantly published to the gym's live lobby TV leaderboard.

### 7.2 Personal Trainer "Remote Verification Portal"
* **The Trainer's Dilemma:** Coaches assign client homework ("Do 40 squats every morning"), but clients either skip or do sloppy, injury-prone reps.
* **The CombatForm Solution:**
  * The trainer sends a challenge link to the client.
  * The client completes the set in front of their phone.
  * The trainer receives an automated verification report showing exact rep count, form faults, and the fatigue curve.

---

## 8. Privacy, Performance & Technical Integrity

1. **100% On-Device Privacy:** Video streams are processed entirely within the browser's local WebAssembly sandbox. No video is recorded, saved, or uploaded to any server.
2. **Zero App Store Barrier:** Built as a Progressive Web App (PWA). Works immediately on Chrome, Safari, Edge, Android, iOS, Windows, and Mac via a single web URL.
3. **Low-Bandwidth Resilience:** During live multiplayer duels, only lightweight 32-byte JSON delta packets are transmitted over WebSockets, allowing the platform to run seamlessly even on 2G/3G mobile data connections.

---

## 9. Next Steps & Development Scope

This feature specification serves as the master blueprint for CombatForm's development and hackathon presentation.

> **Note:** *Many features will be added while building.*
