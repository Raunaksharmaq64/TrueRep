# TrueRep Design System Specification

## Overview & Brand Identity
**TrueRep** is an edge-AI athletic referee and posture coaching platform built with a **warm minimalist health OS aesthetic**. It prioritizes high legibility, clean bento grid layouts, human-centric copy, and ultra-smooth motion feedback.

---

## 🎨 1. Color Palette Tokens

### Primary Base & Surface Colors
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Base Background** | `#F4F1EA` | Soft warm cream background across the entire application |
| **Bento Surface** | `#FFFFFF` | Crisp white bento cards, containers, and elevated surfaces |
| **Dark Charcoal Surface** | `#1E222A` | Primary action buttons, dark accent cards, and floating capsules |
| **Card Border** | `#E2E8F0` | Subtle neutral border for bento cards (`border border-[#E2E8F0]`) |
| **Inner Card Background** | `#F8F6F0` | Soft off-white nested pill background for statistics and rows |

### Accent & Feedback Colors
| Token Name | Hex Code | Purpose / Usage |
| :--- | :--- | :--- |
| **Primary Highlight Accent**| `#EAB308` | Amber yellow for skeleton bones, progress highlights, and badges |
| **Text Primary** | `#18181B` | High-contrast charcoal text for headers and body copy |
| **Text Muted** | `#64748B` | Secondary slate grey text for captions and metadata |
| **Success / Valid Form** | `#10B981` | Emerald green for clean form posture indicators and valid rep counts |
| **Warning / Form Fault** | `#F59E0B` | Warning amber for depth guidance and posture alerts |
| **Danger / Reset** | `#EF4444` | Crimson red for error boundaries and emergency stop alerts |

---

## 🔤 2. Typography System

The typography hierarchy pairs **Premis Regular** for home hero headlines with **Outfit** for section display headers and **Plus Jakarta Sans** for body interface copy.

### Font Families
- **Home Hero Section (`font-premis`)**: `'Premis', 'Premis Regular', 'Outfit', 'Space Grotesk', sans-serif`
- **Display & Headings (`font-display`, `font-heading`)**: `'Outfit', 'Plus Jakarta Sans', sans-serif`
- **Body & Numerical Data (`font-sans`, `font-body`)**: `'Plus Jakarta Sans', -apple-system, sans-serif`
- **Telemetry & Counters (`font-mono`)**: `'JetBrains Mono', monospace`

### Heading Hierarchy
```css
/* Home Screen Hero Section */
.font-premis {
  font-family: 'Premis', 'Premis Regular', 'Outfit', 'Space Grotesk', sans-serif;
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* Dashboard Headings */
h1 {
  font-family: 'Outfit', sans-serif;
  font-weight: 800;
  letter-spacing: -0.025em;
  color: #18181B;
}

h2, h3 {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #18181B;
}
```

### Font Size Ramp
- **Hero Title**: `text-6xl` to `text-8xl` (`3.75rem` – `6rem`, `leading-[0.92]`)
- **Card Header**: `text-lg` to `text-2xl` (`1.125rem` – `1.5rem`)
- **Body Text**: `text-xs` to `text-sm` (`0.75rem` – `0.875rem`)
- **Micro Badge Label**: `text-[9px]` to `text-[10px]` with `uppercase font-bold tracking-widest`

---

## 📐 3. Bento Grid & Layout Rules

### Bento Card Container
All major dashboard elements are organized inside rounded bento cards:
```html
<div className="bg-white border border-[#E2E8F0] rounded-3xl p-5 sm:p-7 shadow-sm text-[#18181B]">
  <!-- Content -->
</div>
```

### Dark Charcoal Accent Card
Used for emphasis (e.g. Hero Discipline Card, Athlete Hero Card, Main Action Box):
```html
<div className="bg-[#1E222A] text-white border border-[#1E222A] rounded-3xl p-6 shadow-sm">
  <!-- Content -->
</div>
```

### Nested Inner Pill Card
Used inside bento cards for structured stat rows and metric splits:
```html
<div className="bg-[#F8F6F0] border border-[#E2E8F0] p-3.5 rounded-2xl flex items-center justify-between">
  <!-- Inner Stat -->
</div>
```

---

## ✦ 4. Iconography Standards

Iconography relies on **lucide-react** outline icons with `1.5px` – `2.0px` stroke widths for lightweight consistency.

### Primary Mapped Icons
- **Brand Header Logo**: Image asset (`logo.png`)
- **Overview Nav**: `LayoutGrid`
- **AI Coach Nav**: `Activity`
- **1v1 Duels Nav**: `Swords`
- **Profile Nav**: `User`
- **Actions & Highlights**: `Sparkles`, `ArrowRight`, `Play`, `Pause`, `RotateCcw`, `Plus`
- **Metrics**: `Target`, `ShieldCheck`, `Zap`, `Scale`, `Wind`, `Flame`, `Footprints`, `Gauge`

---

## 🎬 5. Motion & Transition System

### 1. Tab Entrance Animation
- **Class**: `.animate-page-enter`
- **Easing**: `cubic-bezier(0.16, 1, 0.3, 1)`
- **Duration**: `0.35s`
- **Effect**: Fade in from `opacity: 0` with `translateY(12px)` and `scale(0.995)` to `scale(1)`.

### 2. Window Switch Transition Overlay
- **Duration**: `1.4s` (1400ms)
- **Overlay Blur**: `.animate-blur-overlay` (`backdrop-filter: blur(8px)` with soft ease-in-out fade).
- **Dumbbell 360° Spin**: `.animate-dumbbell-spin` (Scale up from `scale(0.3)` to `scale(1)`, rotate `0deg` → `360deg`, and fade out gracefully).

---

## ⚙️ 6. Tailwind Configuration Snippet (`tailwind.config.js`)

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        'base-cream': '#F4F1EA',
        'surface-white': '#FFFFFF',
        'dark-charcoal': '#1E222A',
        'border-slate': '#E2E8F0',
        'highlight-amber': '#EAB308',
        'text-main': '#18181B',
        'text-muted': '#64748B',
      },
      fontFamily: {
        premis: ['"Premis"', '"Premis Regular"', '"Outfit"', '"Space Grotesk"', 'sans-serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'sans-serif'],
        display: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        heading: ['"Outfit"', '"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      }
    },
  },
  plugins: [],
}
```
