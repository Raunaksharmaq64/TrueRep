# CombatForm: Data Privacy, Zero-Storage Security & High-Efficiency Database Architecture

> **Purpose:** This document defines how **CombatForm** enforces absolute user data privacy (ensuring zero video or biometric storage) and implements a high-throughput, low-latency database architecture that prevents server crashes, connection exhaustion, and excessive cloud costs.

---

## 1. Executive Summary

| Requirement | CombatForm Solution | Hackathon / Enterprise Impact |
|---|---|---|
| **Camera Privacy** | **Zero-Storage Ephemeral Pipeline** | Video frames never touch a hard disk or server; processed in browser RAM only. |
| **Regulatory Compliance** | **Privacy-by-Design (DPDP Act 2023 / GDPR)** | No biometric facial identification; strictly anonymous guest session tokens. |
| **Database Performance** | **Three-Tier Storage Model** | Active workouts run 100% in RAM; zero SQL queries during active exercise. |
| **Connection Scaling** | **PgBouncer Connection Pooling** | Thousands of concurrent players supported on modest database instances. |

---

## 2. Part 1: Data Privacy & Zero-Storage Architecture

In fitness applications, camera privacy is the primary user concern. Under data protection regulations (such as India's **Digital Personal Data Protection Act, 2023** and **GDPR**), recording video inside private bedrooms or living spaces requires rigorous data protection protocols.

CombatForm solves this by adhering to the principle of **Zero-Knowledge Data Ingestion**:

```
[ Camera Sensor ]
        │
        ▼ (Raw Video Frames)
[ Browser In-Memory Sandbox (RAM) ]
        │
        ▼ (WebGL Texture Direct Ingestion)
[ MediaPipe Pose (WebAssembly Engine) ] ────► 33 Coordinate Numbers [x, y, z]
        │                                                │
        ▼                                                ▼
 [ Video Buffer Garbage Collected ]            [ Kinematics Math Engine ]
  (DELETED IMMEDIATELY FROM RAM)                         │
                                                         ▼
                                               Derived Scalars Only:
                                               { reps: 14, accuracy: 96% }
                                                         │
                                                         ▼ (Lightweight WebSocket)
                                                 [ Backend Server ]
```

### 2.1 Ephemeral In-Memory Video Streams (No Disk Storage)
1. **HTML5 `MediaStream` Ingestion:** When a user initiates an exercise, the camera feed is accessed via `navigator.mediaDevices.getUserMedia()`.
2. **Volatile Buffer Only:** The frames stream directly into an HTML5 `<video>` texture held exclusively in the browser's dynamic volatile memory (RAM).
3. **Zero Persistent Storage:**
   - **No Disk Writes:** Video is never written to the user's hard drive, mobile storage, IndexedDB, or browser cache.
   - **No Cloud Upload:** Neither raw video, compressed MP4 files, nor frame snapshots are ever uploaded to Amazon S3, Google Cloud Storage, or Firebase.
4. **Immediate Garbage Collection:** The moment the user stops the workout or navigates away, `stream.getTracks().forEach(track => track.stop())` terminates hardware camera access, and the in-memory video buffer is instantly purged by the browser's garbage collector.

### 2.2 Edge-Native Processing (The Golden Privacy Rule)
* **The Rule:** *The camera feed never leaves the device.*
* All computer vision inference, joint detection, angle calculations, and rep state tracking occur locally on the user's phone or computer using WebAssembly and WebGL shaders.
* Only numeric event updates (e.g., `{"reps": 15, "form_score": 94}`) travel across the network.

### 2.3 No Facial Recognition or Biometric Identity Storage
* Standard AI surveillance systems extract facial embeddings to identify individuals.
* CombatForm explicitly disables facial recognition:
  - MediaPipe's facial keypoints (landmarks `0` through `10`) are discarded after initial body posture verification.
  - The system tracks only anonymous skeletal kinematics (elbows, shoulders, hips, knees).
  - No biometric facial profiles, iris signatures, or identifiable facial vectors are generated or stored.

### 2.4 Anonymous Guest Mode (Zero Personally Identifiable Information - PII)
* Users can compete in duels and track workouts without submitting an email address, phone number, real name, or password.
* The application issues an ephemeral session token: `Guest_784` tied to a temporary client-side UUID.
* No personal contact information exists in the database to be leaked, breached, or sold.

---

## 3. Part 2: High-Efficiency Database Architecture

A critical failure point in live hackathon demos is treating relational databases (PostgreSQL/MySQL) like real-time variables. Executing an `UPDATE users SET reps = reps + 1` on every push-up creates severe I/O bottlenecks and connection pool exhaustion.

CombatForm implements a **Three-Tier Storage Model**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. HOT STATE (In-Memory RAM / Redis)                                    │
│    - Active 60-second matches, live rep counts, current combo streak    │
│    - Latency: < 1 millisecond                                           │
│    - Database Read/Write Queries: ZERO                                  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ (Written ONCE when match hits 0:00)
┌─────────────────────────────────────────────────────────────────────────┐
│ 2. WARM STATE (PostgreSQL via Connection Pooler)                        │
│    - Match history summaries, verified XP, player rank, user profiles   │
│    - Single batched transaction per completed match                     │
│    - Latency: 15 - 30 milliseconds                                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │
                                     ▼ (Periodically refreshed / indexed)
┌─────────────────────────────────────────────────────────────────────────┐
│ 3. COLD / ANALYTIC STATE (Materialized Views & Indexes)                 │
│    - Global leaderboards, campus territory control zones                │
│    - Cached in memory or refreshed on a 60-second schedule              │
└─────────────────────────────────────────────────────────────────────────┘
```

---

### 3.1 Database Optimization Rules

#### Rule 1: Zero Database Writes During Active Workouts
* Active 60-second battles are managed exclusively in Node.js Fastify server memory:
  ```javascript
  // In-Memory RAM Store: Instant access, 0ms DB overhead
  const activeRooms = new Map();
  activeRooms.set('room_402', { p1_reps: 12, p2_reps: 10, timeLeft: 45 });
  ```
* **Only when the match countdown reaches 0:00** does the server write **one single batched row** to PostgreSQL:
  ```sql
  INSERT INTO match_records (
    match_id, winner_id, p1_id, p1_reps, p1_form, p2_id, p2_reps, p2_form, duration_seconds
  ) VALUES (
    'match_402', 'user_alpha', 'user_alpha', 18, 96.4, 'user_bravo', 15, 91.2, 60
  );
  ```
  *(Reduces database write operations from ~100+ per match down to exactly 1).*

#### Rule 2: Compact Data Types (Minimizing Disk & Index Footprint)
Every byte matters when scaling. CombatForm enforces minimal data types:

| Column Name | Inefficient Type | Optimized Type | Footprint Savings |
|---|---|---|---|
| `reps_completed` | `BIGINT` (8 bytes) | `SMALLINT` (2 bytes) | **75% reduction** (reps fit in 0–32,767) |
| `accuracy_score` | `DOUBLE PRECISION` (8 bytes) | `REAL` (4 bytes) | **50% reduction** (stores $94.2\%$ precision) |
| `faction` | `VARCHAR(100)` (variable) | `ENUM('BLUE', 'RED')` (1 byte) | **90% reduction** + faster index lookups |
| `match_duration` | `INTEGER` (4 bytes) | `SMALLINT` (2 bytes) | **50% reduction** (durations fit in seconds) |

#### Rule 3: Connection Pooling via PgBouncer (Transaction Mode)
* By default, PostgreSQL spawns an operating system process per client connection. Under high concurrent user traffic, PostgreSQL exhausts its connection limit (`max_connections`) and rejects new requests.
* CombatForm connects via **PgBouncer** in **Transaction Pooling Mode**:
  - WebSockets do **not** hold open PostgreSQL connections.
  - The server borrows a database connection from the pool only for the 2–3 milliseconds required to execute the final match `INSERT`, and immediately releases it back to the pool.

#### Rule 4: Atomic Leaderboards (No Full-Table `SUM()` Scans)
* **The Performance Bottleneck:** Scanning entire match history tables on every request:
  ```sql
  -- ❌ AVOID: Full table scan that slows down as data grows
  SELECT user_id, SUM(p1_reps) FROM match_records GROUP BY user_id ORDER BY SUM(p1_reps) DESC LIMIT 10;
  ```
* **The Solution:** An indexed `profiles` table holding rolling summary counters:
  ```sql
  -- ✅ OPTIMAL: Instant index scan on top ranked players
  SELECT id, username, total_xp, total_reps, rank_tier 
  FROM profiles 
  ORDER BY total_xp DESC 
  LIMIT 10;
  ```
* Accompanied by a dedicated B-tree descending index:
  ```sql
  CREATE INDEX idx_profiles_xp_desc ON profiles (total_xp DESC);
  ```

---

## 4. Production Database Schema (PostgreSQL / Supabase DDL)

Below is the optimized schema structure:

```sql
-- 1. Faction Enumeration
CREATE TYPE faction_type AS ENUM ('BLUE', 'RED', 'NEUTRAL');

-- 2. User Profiles Table (Persistent Hot Attributes)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(32) NOT NULL UNIQUE,
  faction faction_type DEFAULT 'NEUTRAL',
  total_reps INTEGER DEFAULT 0 CHECK (total_reps >= 0),
  total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
  rank_tier VARCHAR(20) DEFAULT 'NOVICE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for instant global leaderboard queries
CREATE INDEX idx_profiles_leaderboard ON profiles (total_xp DESC, total_reps DESC);

-- 3. Match Records Table (Single Row Per Concluded Match)
CREATE TABLE match_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id VARCHAR(64),
  winner_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  p1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  p1_reps SMALLINT NOT NULL CHECK (p1_reps >= 0),
  p1_form REAL NOT NULL CHECK (p1_form >= 0 AND p1_form <= 100),
  p2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  p2_reps SMALLINT NOT NULL CHECK (p2_reps >= 0),
  p2_form REAL NOT NULL CHECK (p2_form >= 0 AND p2_form <= 100),
  duration_seconds SMALLINT NOT NULL DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for user match history queries
CREATE INDEX idx_matches_users ON match_records (p1_id, p2_id, created_at DESC);

-- 4. Campus Turf Zones Table (Territory Control)
CREATE TABLE territory_zones (
  zone_id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  controlling_faction faction_type DEFAULT 'NEUTRAL',
  influence_score INTEGER DEFAULT 0 CHECK (influence_score >= 0),
  capture_threshold INTEGER DEFAULT 2000,
  coordinates JSONB NOT NULL, -- GeoJSON polygon definition
  last_captured_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. Judge Presentation Script: Privacy & Database Scalability

When presenting to SIH technical evaluators, use these concise technical responses:

### On Privacy & Compliance:
> *"CombatForm uses a 100% on-device, privacy-preserving architecture. Camera video streams are ingested as temporary WebGL textures in browser RAM and are immediately garbage-collected after BlazePose extracts skeletal joint coordinates. Zero video or raw images are ever saved to disk or transmitted over the internet, complying fully with India's DPDP Act 2023 and GDPR guidelines."*

### On Database Efficiency:
> *"To support real-time 1v1 duels without database exhaustion, we employ a three-tier architecture. High-frequency rep updates and match timers run strictly in server RAM during active play, resulting in zero database read/writes during workouts. A single batched insert occurs only at match conclusion via PgBouncer connection pooling and indexed leaderboards, ensuring ultra-low latency and scalable performance."*
