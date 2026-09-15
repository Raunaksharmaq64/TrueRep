# CombatForm: Phase-Wise Implementation Blueprint & Engineering Roadmap

> **Target Audience:** Engineering team, mentors, and hackathon judges.  
> **Objective:** A step-by-step, production-grade implementation roadmap for building **CombatForm** from scratch using industry best practices. This roadmap covers everything from the initial repository scaffold to the live AI pose engine, real-time multiplayer backend, campus turf war, and demo day fail-safes.

---

## 1. Project Directory Architecture

To keep the frontend and real-time backend organized, maintain a clean modular architecture:

```
FITREP-SIH/
├── client/                          # Frontend Web Application (React + Vite + PWA)
│   ├── public/
│   │   ├── models/                  # MediaPipe BlazePose .task model files
│   │   ├── sounds/                  # Pre-decoded AudioBuffers (chimes, alerts)
│   │   └── data/campus_zones.json   # Local GeoJSON campus boundaries
│   ├── src/
│   │   ├── ai/                      # Computer Vision & Kinematics Engine
│   │   │   ├── MediaPipeManager.ts  # Wasm initialization & frame loop
│   │   │   ├── KinematicsMath.ts    # Trigonometric vector angles & EMA smoothing
│   │   │   ├── PushUpFSM.ts         # Push-up rep state machine & error latching
│   │   │   └── SquatFSM.ts          # Squat rep state machine & valgus detector
│   │   ├── components/              # UI Components
│   │   │   ├── HUD/                 # Tactical HUD, Gauges, Angle Badges
│   │   │   ├── Camera/              # Video ingestion & Canvas overlay
│   │   │   ├── Duel/                # 1v1 Arena, Opponent Meter, Ghost Bot
│   │   │   ├── Map/                 # MapLibre 3D Campus Turf Map
│   │   │   └── Analytics/           # Fatigue curves, fault graphs, certificates
│   │   ├── hooks/                   # Custom React Hooks
│   │   │   ├── useWebSpeech.ts      # Browser voice coach
│   │   │   ├── useSocketDuel.ts     # Micro-payload WebSocket synchronization
│   │   │   └── useAudioEngine.ts    # Web Audio API instant playback
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── server/                          # Real-Time Multiplayer Backend (Fastify)
│   ├── src/
│   │   ├── socket/                  # WebSocket Matchmaker & Room Store
│   │   │   ├── RoomManager.ts       # In-Memory Active Match Store
│   │   │   └── MatchLoop.ts         # 60-Second Authoritative Clock
│   │   ├── db/                      # Supabase Client & PgBouncer queries
│   │   │   └── matchPersistence.ts  # Batched single INSERT at match end
│   │   └── server.ts                # Fastify bootstrap
│   ├── package.json
│   └── tsconfig.json
│
└── docs/                            # Technical Specifications (SIH Submission)
```

---

## 2. Phase-Wise Implementation Roadmap

```
  Phase 0 ──► Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5 ──► Phase 6
  Scaffold    Computer     Tactical     Real-Time   Campus       Database     Hardening
  & Tooling   Vision       HUD & Solo   1v1 Duels   Turf War     & Profiles   & Demo Day
              Engine       Analytics    (Sockets)   (MapLibre)   (Supabase)   Resilience
```

---

### Phase 0: Project Setup & Tooling Foundation (Hours 1–2)

**Goal:** Establish clean repository scaffolding, install high-performance dependencies, and configure build tools.

#### Key Steps:
1. **Frontend Initialization:**
   ```bash
   npm create vite@latest client -- --template react-ts
   cd client
   npm install @mediapipe/tasks-vision lucide-react tailwindcss maplibre-gl socket.io-client
   ```
2. **Backend Initialization:**
   ```bash
   mkdir server && cd server
   npm init -y
   npm install fastify socket.io @supabase/supabase-js dotenv
   npm install -D typescript @types/node tsx
   ```
3. **Asset Pre-Caching:**
   - Download the MediaPipe `pose_landmarker_lite.task` model into `client/public/models/` for offline-capable inference.
   - Place sound effects (`rep_valid.wav`, `warning.wav`, `match_start.wav`) into `client/public/sounds/`.

---

### Phase 1: The Core Computer Vision & Kinematics Engine (Hours 3–7)

**Goal:** Ingest the camera feed, extract 33 skeletal landmarks at 30–60 FPS, calculate joint angles, and implement the rep state machine.

#### Key Steps:
1. **Camera Ingestion:** Access device hardware via HTML5 `navigator.mediaDevices.getUserMedia()` with facing-mode toggle (`user` vs `environment`).
2. **MediaPipe Task-Vision Integration:** Initialize `PoseLandmarker` with `RunningMode.VIDEO` and WebGL GPU acceleration.
3. **Trigonometric Kinematics Engine (`KinematicsMath.ts`):**
   - Calculate joint angles using 2D/3D vector dot products and `atan2`:
     $$\theta = \arccos\left(\frac{\vec{u} \cdot \vec{v}}{\|\vec{u}\| \|\vec{v}\|}\right)$$
   - Apply Exponential Moving Average (EMA) smoothing ($\alpha = 0.65$) to eliminate camera jitter.
4. **Hierarchical Finite State Machine (`PushUpFSM.ts`):**
   - States: `TOP_LOCKOUT` $\rightarrow$ `DESCENDING` $\rightarrow$ `IN_DEPTH` $\rightarrow$ `ASCENDING`.
   - Depth requirement: Elbow angle $\le 90^\circ$.
   - Form integrity rule: Spine angle $\ge 155^\circ$.
   - **Irreversible Error Latch:** If spine drops below $155^\circ$ at any frame during the rep, latch `formValid = false` until the user returns to full lockout.
5. **Decoupled HTML5 Canvas Overlay:**
   - Render skeleton joints and connecting vectors directly to a `<canvas>` inside `requestAnimationFrame`.
   - **Critical Rule:** Never call React `setState()` on every frame; only dispatch state updates when a rep or form alert occurs.

---

### Phase 2: Tactical HUD, Voice Coaching & Solo Challenge Mode (Hours 8–12)

**Goal:** Build an engaging, gamified interface with hands-free audio guidance and deep post-workout analytics.

#### Key Steps:
1. **Tactical Glassmorphic HUD:**
   - Floating degree badges anchored to joints (e.g., `88° - Depth Valid`).
   - Circular progress ring for target rep count (e.g., 50 Push-Up Blitz).
   - High-contrast color coding: Emerald Green (Valid), Yellow (Warning), Red (Fault).
2. **AR Holographic Ghost Silhouette:**
   - Translucent SVG outline displayed on screen before workout starts.
   - Bounding-box coordinate check to ensure the user is properly positioned before countdown begins.
3. **Browser Voice Coach (`useWebSpeech.ts`):**
   - Utilize native `window.speechSynthesis` for real-time, zero-delay voice coaching:
     - *"Good depth, push up!"*
     - *"Warning: Keep back flat!"*
     - *"10 reps remaining!"*
4. **Smart Rest-Pause Auto-Detection:**
   - Detect when knees touch the floor and arms disengage.
   - Automatically pause the workout stopwatch and pop up a 15-second rest countdown timer.
5. **Post-Workout Analytics Visualizer:**
   - **Fatigue / Rep-Velocity Curve:** Graph showing repetition duration from rep 1 to rep 50.
   - **Fault Categorization:** Pie/bar chart breakdown (Clean Reps vs Shallow Depth vs Hip Sag).
   - **Shareable Proof-of-Workout Certificate:** HTML5 canvas snapshot for trainers or social media.

---

### Phase 3: High-Performance Real-Time Multiplayer (1v1 Duels) (Hours 13–17)

**Goal:** Implement synchronized head-to-head multiplayer battles with sub-30ms latency.

#### Key Steps:
1. **Fastify + Socket.IO Server:**
   - Initialize Fastify server configured with `transports: ['websocket']` (disabling HTTP long-polling).
   - Set ping interval to 5 seconds and timeout to 10 seconds to maintain stable connections.
2. **In-Memory Room Manager (`RoomManager.ts`):**
   - Manage active rooms in server RAM (`Map<roomId, RoomState>`)—**zero database writes during matches**.
   - Synchronized 60-second countdown clock ticking on the server.
3. **Micro-Payload Delta Protocol:**
   - Client sends only 32-byte JSON packets on rep changes or throttled at 5Hz:
     ```json
     { "r": 14, "f": 96.2, "c": 3 }
     ```
4. **The 4-Second "Ghost Bot" Fallback:**
   - If no human opponent connects within 4 seconds, automatically match the user with an AI Ghost Competitor (`Spartan_AI`) with dynamic rep pacing.
   - **Guarantee:** Eliminates awkward waiting periods in front of hackathon evaluators.
5. **1v1 Arena Split HUD:**
   - Real-time opponent progress gauge with lead/lag indicators (`+2 Reps Ahead` / `-1 Rep Behind`).
   - Flame combo multiplier: 3+ perfect-form reps trigger a $1.5\times$ XP multiplier.

---

### Phase 4: Campus & Gym Turf War (Territory Conquest) (Hours 18–21)

**Goal:** Create a 3D campus map where fitness duels translate into faction territory control.

#### Key Steps:
1. **MapLibre GL JS Integration:**
   - Embed MapLibre with custom vector or OpenStreetMap raster tiles (100% open-source, no billing/credit card limits).
2. **Campus Geofencing Definition (`campus_zones.json`):**
   - Create local GeoJSON polygons defining 3–5 key campus zones:
     - Central Library
     - Campus Gymnasium / Sports Ground
     - Computer Science Block
     - Student Activity Center / Canteen
3. **Faction Assignment & Turf Logic:**
   - Users select **Blue Faction** or **Red Faction**.
   - Winning duels near or dedicated to a zone adds influence points to the player's faction.
   - Dynamically shade zone polygons (Blue = Controlled by Blue, Red = Controlled by Red, Amber = Contested).

---

### Phase 5: Database Persistence & User Identity (Hours 22–24)

**Goal:** Securely persist player progression, match histories, and turf war states without introducing latency.

#### Key Steps:
1. **Supabase PostgreSQL Schema Setup:**
   - Execute the optimized DDL: `profiles`, `match_records`, and `territory_zones` tables.
   - Apply compact data types (`SMALLINT`, `REAL`, `ENUM`) and B-Tree indexes on `total_xp`.
2. **Single Batched Persistence Strategy:**
   - When the match countdown reaches 0:00, the Fastify server executes **one single batched `INSERT`** to write match results.
3. **Anonymous Guest Mode:**
   - Generate ephemeral client-side UUIDs (`Guest_492`) so judges can test without registering with an email or password.

---

### Phase 6: Hardening, PWA Setup & Demo Resilience (Final Polish)

**Goal:** Ensure the application is responsive, works offline, and executes smoothly under presentation conditions.

#### Key Steps:
1. **Progressive Web App (PWA) Manifest:**
   - Add `manifest.json` and service worker so the app can be installed to home screens with one tap.
2. **Venue WiFi Firewall Bypass:**
   - Run the backend locally on the presentation laptop (`http://localhost:4000`).
   - Expose the port via a secure tunnel:
     ```bash
     npx localtunnel --port 4000
     # or
     cloudflared tunnel --url http://localhost:4000
     ```
   - Connect the mobile test phone directly to the tunnel URL to prevent venue network firewalls from blocking WebSocket ports.
3. **Edge Case Verification:**
   - Test low lighting conditions (confidence threshold gating).
   - Test rapid phone rotation (portrait vs landscape auto-detection).

---

## 3. Best Practices Checklist for Engineers

| Category | Best Practice | Anti-Pattern (DO NOT DO) |
|---|---|---|
| **Computer Vision** | Decouple canvas rendering from React state. | Calling `setState()` on every 60 FPS frame. |
| **Networking** | Send tiny 32-byte JSON delta packets over WebSockets. | Streaming video or sending 33 keypoints to server. |
| **Database** | Keep live game state in server RAM; write once at 0:00. | Running SQL `UPDATE` on every single rep. |
| **Audio** | Use Web Audio API with pre-decoded AudioBuffers. | Using standard HTML `<audio>` tags with 200ms lag. |
| **Mapping** | Use MapLibre GL JS with local GeoJSON. | Using proprietary maps that risk rate-limiting demos. |
| **Matchmaking** | 4-second timeout to an AI Ghost Bot fallback. | Letting matchmaking spin indefinitely. |

---

## 4. Phase-Wise Execution Timeline

```
Day 1:
├── 09:00 - 11:00: Phase 0 (Scaffold, packages, audio/model assets)
├── 11:00 - 16:00: Phase 1 (MediaPipe, kinematics vector math, rep state machines)
├── 16:00 - 21:00: Phase 2 (Tactical HUD, voice coach, solo challenge, analytics)
└── 21:00 - 01:00: Phase 3 (Fastify Socket.IO server, 1v1 duels, Ghost Bot)

Day 2:
├── 08:00 - 11:00: Phase 4 (MapLibre campus map, geofencing, territory conquest)
├── 11:00 - 13:00: Phase 5 (Supabase schema, batched persistence, guest mode)
├── 13:00 - 15:00: Phase 6 (PWA manifest, local tunnel setup, edge case testing)
└── 15:00 onwards: Pitch preparation and live judge demonstration!
```
