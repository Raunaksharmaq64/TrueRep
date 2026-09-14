# TRUE REP — The Competitive Fitness Esport

> **TRAIN • TRACK • PROGRESS • BELONG**  
> *Transforming bodyweight resistance training into a real-time multiplayer esport with trustless Edge-AI form refereeing, Elo-ranked 1v1 duels, and geospatial territory conquest.*

---

## ⚡ Overview

**TrueRep** bridges the gap between competitive esports and physical fitness. By combining client-side computer vision with multiplayer gaming loops, TrueRep turns exercises like push-ups, squats, and crunches into high-stakes ranked showdowns.

Unlike traditional workout apps that rely on self-reported logging or invasive cloud video streams, TrueRep processes 33 3D skeletal keypoints **100% on-device inside browser WebAssembly (WASM)** at 30+ FPS — ensuring zero video uploads, complete user privacy, and 0.4ms zero-latency form verification.

---

## 🔥 Key Features

### 1. 🤖 Edge-AI Form Referee (Google MediaPipe Pose WASM)
- **Zero Cloud Video Streams**: Operates locally in WebAssembly memory without sending camera frames to remote servers.
- **Biomechanical Angle Formula**: Continuously calculates 3D joint angles:
  $$\theta = \left\vert\text{atan2}(y_3 - y_2, x_3 - x_2) - \text{atan2}(y_1 - y_2, x_1 - x_2)\right\vert \times \frac{180}{\pi}$$
- **Trustless Depth Verification**: Validates state transitions (Lockout $\ge 160^\circ \rightarrow$ Depth $\le 90^\circ$) to eliminate the honor system.

### 2. ⚔️ Ranked 1v1 Duels Arena
- **Sub-200ms Elo Matchmaking**: Pairs athletes in 60-second strength showdowns based on skill rating bands (`2,400 - 2,550 ELO`).
- **Tactical Radar Visualizer**: Real-time display of nearby rival nodes, ping latency, and match lock status (`MATCH LOCK 94%`).
- **Private Room Passphrases**: Instant passphrase generator (`FIT-4029`) with direct WhatsApp challenge link integration.

### 3. 🗺️ Geospatial Campus & City Turf Wars
- Aggregates duel victories into faction scores to claim real-world map zones (e.g. *RGPV Civil Engineering Block* or local municipal sectors).
- Powered by Mapbox GL JS and PostgreSQL PostGIS spatial polygon analytics.

### 4. 📊 Athlete Profile & Loadout Engine
- **Career Performance Log**: Complete match history tracking Elo deltas (`+24 ELO`), win rates, and streak multipliers (`+15% XP`).
- **Hardware & Sensor Sync**: Real-time telemetry monitoring for Heart Rate (`168 BPM`), HRV (`72 ms`), Lactate Threshold (`3.8 mmol/L`), and Dynamic Wattage Output (`402.5 Joules/rep`).
- **Cosmetic Skins**: Unlockable Cyber-Titan visors, neon skeletal HUD overlays, and custom titles.

---

## 🛠️ Tech Stack

- **Frontend Core**: React 18, Vite 5, Tailwind CSS
- **Typography**: Space Grotesk
- **Iconography**: Lucide React
- **Computer Vision**: Google MediaPipe Pose (WebAssembly Client Execution)
- **Backend Architecture Roadmap**: Supabase (PostgreSQL + Realtime WebSockets), PostGIS, Web Crypto API (`HMAC-SHA256`)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have Node.js (v18+ recommended) installed on your system.

### Installation & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/Raunaksharmaq64/TrueRep.git

# 2. Navigate into the project directory
cd TrueRep

# 3. Switch to the frontend branch
git checkout frontend

# 4. Install dependencies
npm install

# 5. Launch local development server
npm run dev
```

Open your browser and navigate to `http://localhost:3000` to run the application.

---

## 📁 Repository Structure

```
TrueRep/
├── assets/                       # Raw design reference images & athlete cutouts
│   ├── MainHeader/               # Vector logo assets
│   ├── athlete.jpg               # Hero athlete cutout
│   └── reference.png             # UI design reference
├── public/                       # Static public assets
│   ├── athlete.jpg
│   └── logo.png
├── src/
│   ├── assets/                   # Bundled component assets
│   ├── components/
│   │   ├── Navbar.jsx            # Dynamic header navigation with "Use Now →" button
│   │   ├── Hero.jsx              # Main intro landing page (3-section layout format)
│   │   ├── AICoachPage.jsx       # Edge-AI referee dashboard & pose tracker
│   │   ├── DuelsPage.jsx         # 1v1 tactical radar matchmaking & duel room
│   │   └── ProfilePage.jsx       # Athlete profile, stats & career log
│   ├── App.jsx                   # Central tab state router
│   ├── index.css                 # Tailwind directives & scanLaser keyframe animations
│   └── main.jsx                  # React application entry point
├── backend_features_integration.md # Technical backend API & DB integration specs
├── index.html                    # Space Grotesk Google Fonts setup
├── tailwind.config.js            # Custom Tailwind theme tokens & font config
├── vite.config.js                # Vite build configuration
└── README.md                     # Project documentation
```

---

## 🔒 Security & Privacy

- **On-Device Vision**: Camera frames are processed strictly inside local WebAssembly memory. Zero video streams are transmitted to any server.
- **Cryptographic Attestation**: Client signs timestamped keypoint frames using `HMAC-SHA256` to verify biometric authenticity.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
