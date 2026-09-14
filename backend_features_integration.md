# TrueRep - Backend Architecture & Frontend Integration Roadmap

This document details all technical backend services, API endpoints, database schemas, WebSocket event specifications, and Edge-AI verification pipelines required to power the **TrueRep** competitive fitness esport platform.

---

## System Architecture Diagram Overview

```
 ┌─────────────────────────────────────────────────────────────────────────┐
 │                            REACT + VITE FRONTEND                        │
 │   [Hero View] ── [AI Coach Dashboard] ── [1v1 Duels] ── [Profile Page]  │
 └─────────────────────────────────────────────────────────────────────────┘
        │                            │                             │
  WebSockets (Sub-200ms)       MediaPipe WASM             REST APIs & PostGIS
        │                        (Local Pose)                      │
 ┌──────▼────────────────────────────▼─────────────────────────────▼───────┐
 │                             SUPABASE BACKEND                            │
 │  ┌─────────────────┐   ┌──────────────────────┐  ┌───────────────────┐  │
 │  │ Supabase Auth   │   │  Realtime WebSockets │  │ PostGIS Spatial DB│  │
 │  └─────────────────┘   └──────────────────────┘  └───────────────────┘  │
 └─────────────────────────────────────────────────────────────────────────┘
```

---

## Module 1: User Authentication & Profile Management System

### **Backend Specifications:**
- **Database Tables**:
  - `profiles`: `id (uuid, FK)`, `username (text)`, `avatar_url (text)`, `elo_rating (int, default 1200)`, `tier (text)`, `faction_id (uuid, FK)`, `created_at (timestamp)`
  - `user_cosmetics`: `user_id (uuid)`, `equipped_visor (text)`, `equipped_skeleton_skin (text)`, `equipped_title (text)`
- **Authentication Protocol**: Supabase Auth (OAuth 2.0 / Web3 Wallet Sign-in + JWT Session Tokens).
- **Security**: Row Level Security (RLS) enforcing read-all public profiles, write-only own profile.

### **Frontend Integration Points:**
- **Component**: `src/components/ProfilePage.jsx` & `src/components/Navbar.jsx`
- **Connected Actions**:
  - Fetch user profile metrics (Elo: `2,510`, Tier: `Tier III`, Verified Reps: `14,820`, Win Rate: `78.4%`).
  - Toggle equipped skins (`Cyber-Titan Visor HUD`, `Neon Skeleton Overlay`).
  - Copy Athlete ID (`TR-8842-CYBER`) linked to public user handle.

---

## Module 2: Edge-AI Pose Telemetry & Cryptographic Verification Engine

### **Backend Specifications:**
- **Database Tables**:
  - `rep_logs`: `id (uuid)`, `match_id (uuid)`, `user_id (uuid)`, `exercise_type (enum)`, `joint_angle_series (jsonb)`, `confidence_score (float)`, `nonce_signature (text)`, `timestamp (timestamp)`
- **Verification Engine**:
  - Client calculates joint angles ($\theta = |\text{atan2}(y_3-y_2, x_3-x_2) - \text{atan2}(y_1-y_2, x_1-x_2)| \times \frac{180}{\pi}$).
  - State Machine Transition: Lockout ($\ge 160^\circ$) $\rightarrow$ Depth Flexion ($\le 90^\circ$).
  - **Cryptographic Attestation**: Client signs timestamped keypoint frames with Web Crypto API (`HMAC-SHA256`) using an ephemeral session nonce issued by the backend at match start.
- **Anti-Cheat Velocity Guard**: Rejects timestamps where joint angular velocity exceeds human biomechanical limits ($\ge 1800^\circ/\text{sec}$).

### **Frontend Integration Points:**
- **Component**: `src/components/AICoachPage.jsx` & `src/components/Hero.jsx`
- **Connected Actions**:
  - Broadcasts verified rep increments (`+1 VALID REP`) to WebSocket channel.
  - Receives server-side validation ACK before adding rep to ranked match total.

---

## Module 3: Real-Time 1v1 Matchmaking & WebSocket Duel State Engine

### **Backend Specifications:**
- **Database Tables**:
  - `duels`: `id (uuid)`, `player_1_id (uuid)`, `player_2_id (uuid)`, `p1_reps (int)`, `p2_reps (int)`, `winner_id (uuid)`, `elo_delta (int)`, `status (enum: queued, locked, active, completed)`
  - `duel_rooms`: `room_code (text, unique)`, `access_passphrase (text)`, `created_by (uuid)`
- **Matchmaking Engine**:
  - Elo Pairing Queue: Pairs clients with $|\text{Elo}_1 - \text{Elo}_2| \le 150$ in sub-200ms queues.
  - WebSocket Channels: `duels:match_id` broadcasting sub-second rep state, time remaining, and match lock status (`Bout in 03s`).
- **Elo Rating Calculation**:
  $$\Delta R = K \cdot (S - E_A), \quad E_A = \frac{1}{1 + 10^{(\text{Elo}_B - \text{Elo}_A)/400}}$$

### **Frontend Integration Points:**
- **Component**: `src/components/DuelsPage.jsx`
- **Connected Actions**:
  - Interactive Queue (`Quick Ranked Match`, `Cancel Queue`, `Instant Fill`).
  - Tactical Radar Display: Fetches nearby rivals (`Elena Vance`, `Chloé L.`, `Marcus T.`) with distance and ping latency.
  - Private Duel Rooms: Generate/Copy passphrases (`FIT-4029`) and share instant WhatsApp invite links.

---

## Module 4: Geospatial Campus & City Turf Wars (PostGIS Layer)

### **Backend Specifications:**
- **Database Tables**:
  - `territory_zones`: `id (uuid)`, `zone_name (text)`, `boundary_polygon (geometry(Polygon, 4326))`, `controlling_faction_id (uuid)`, `influence_points (int)`, `last_captured_at (timestamp)`
- **Spatial Queries (PostgreSQL PostGIS)**:
  - `ST_Contains(boundary_polygon, ST_MakePoint(user_lon, user_lat))` to assign duel rep scores to local zones (e.g., *RGPV Civil Engineering Block*).
  - Daily Territory Decay Rate Cron Job: Uncontested zones lose 5% influence per day.

### **Frontend Integration Points:**
- **Component**: `src/components/ProfilePage.jsx` & Mapbox Layer
- **Connected Actions**:
  - Displays user's active faction territory (`RGPV Civil Engineering Block`).
  - Displays territory control stats (`4 Zones Held`, `4,850 Faction Score`).

---

## Module 5: Leaderboards, XP Progression & Rewards Engine

### **Backend Specifications:**
- **Database Tables**:
  - `leaderboards`: `user_id (uuid)`, `global_rank (int)`, `campus_rank (int)`, `weekly_xp (int)`, `streak_days (int)`
  - `rewards`: `id (uuid)`, `user_id (uuid)`, `item_name (text)`, `unlocked_at (timestamp)`
- **XP Multiplier Logic**:
  - $\text{Total XP} = \text{Base Rep XP} \times (1 + 0.15 \cdot \text{Streak Active})$.
  - Day 14 Streak: $+15\%$ XP Multiplier. Day 15 Milestone: `Cyber-Titan Visor Skin`.

### **Frontend Integration Points:**
- **Component**: `src/components/AICoachPage.jsx` & `src/components/ProfilePage.jsx`
- **Connected Actions**:
  - 14-Day Streak calendar rendering (M–S completion checks).
  - Conditioning Rank Level bar (`Level 48`, `3,480 / 4,000 XP to Tier III`).

---

## Module 6: Biometric Hardware Sync & Sensor Telemetry Pipeline

### **Backend Specifications:**
- **Database Tables**:
  - `biometric_telemetry`: `match_id (uuid)`, `user_id (uuid)`, `heart_rate_bpm (int)`, `hrv_ms (int)`, `lactate_threshold (float)`, `wattage_series (int[])`
- **Hardware Integration Protocols**:
  - Web Bluetooth API & Web USB for local ANT+ / Bluetooth Low Energy (BLE) heart rate monitors and ergometer power sensors.
- **Power Output Math**:
  $$\text{Mean Dynamic Work} = \frac{\sum \text{Joules}}{\text{Total Reps}}$$

### **Frontend Integration Points:**
- **Component**: `src/components/AICoachPage.jsx` & `src/components/DuelsPage.jsx`
- **Connected Actions**:
  - Displays live telemetry (`168 BPM`, `72 ms HRV`, `3.8 mmol/L Lactate Threshold`).
  - Displays per-set wattage output bars (`380W (S1)`, `410W (S2)`, `425W (S3)`).

---

## Module 7: Atlas AI Voice Referee & Feedback Engine

### **Backend Specifications:**
- **Speech Pipeline**:
  - Client-side Web Speech Synthesis / Edge TTS endpoint streaming low-bitrate audio clips.
  - Real-time kinematic prompt generator evaluating thoracic extension, hip drive, and cadence.

### **Frontend Integration Points:**
- **Component**: `src/components/AICoachPage.jsx`
- **Connected Actions**:
  - Plays voice feedback: *"Atlas AI: Perfect hip drive on rep 32. Keep thoracic extension tight during transition."*
  - Animates `VOICE FEED 98%` audio wave visualizer bar.

---

## Summary Matrix of Frontend Components & Backend Integrations

| Frontend Component | Active View | Primary Backend Services Connected |
| :--- | :--- | :--- |
| [`Hero.jsx`](file:///Users/abhaysharma/all_codes/TrueRep/src/components/Hero.jsx) | `Home` | Brand Landing, App Download API, Hero Showcase |
| [`AICoachPage.jsx`](file:///Users/abhaysharma/all_codes/TrueRep/src/components/AICoachPage.jsx) | `AI Coach` | MediaPipe Pose WASM, Cryptographic HMAC-SHA256 Attestation, Atlas TTS Engine, Wattage/Form Metrics |
| [`DuelsPage.jsx`](file:///Users/abhaysharma/all_codes/TrueRep/src/components/DuelsPage.jsx) | `1v1 Duels` | Supabase Realtime WebSockets, Elo Rating Matchmaker, Private Room Passphrases, Sensor Sync |
| [`ProfilePage.jsx`](file:///Users/abhaysharma/all_codes/TrueRep/src/components/ProfilePage.jsx) | `Profile` | Supabase Auth, User Profile Metrics, PostGIS Territory Conquest, Cosmetic Loadout Store |
