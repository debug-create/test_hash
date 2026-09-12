# FABLE — Insider Threat Intelligence Platform

> **"Insider threats never look like attacks. They look like work."**

FABLE is a high-conviction insider-threat detection and intent-mapping platform. Rather than monitoring solely for traditional malware signatures or flooding SOC teams with noisy anomaly blips, FABLE continuously correlates organizational context, identity drift, and access authorization to isolate true high-risk incidents.

---

## Key Features

### 1. Cinematic 3D Hero Experience
- **Interactive 3D Horizon**: Powered by React Three Fiber, Drei, and Three.js with custom procedural particle fields, lunar terrain contours, and subtle mouse-following parallax.
- **Dynamic Typographic Swap**: Staggered character entrance transitions with blur-to-sharp focus and atmospheric terracotta glows (`#C6613F`).
- **One-Click SOC Handoff**: Direct routing into the live detection suite via the "Check it out" interactive call to action.

### 2. Global Threat & Intercept Map (`/product`)
- **Geographic Anomaly Radar**: Real-time world map built using `d3-geo`, `topojson-client`, and `world-atlas` with a custom dot-matrix continent aesthetic.
- **Global Office Hubs**: Tracks monitored personnel across worldwide tech centers (Bangalore, London, San Francisco, New York, Singapore, Berlin, Stockholm, and Sydney).
- **Radar Signatures & Egress Arcs**: Animated multi-phase radar pings (`#E8342A`) and curved Bézier telemetry streams highlighting active data movement.
- **Human-Confirmed Action Flow**: Dual immediate actions ("Investigate" and "Revoke Access") available directly from any open case without sequential prerequisites, backed by explicit human confirmation and blast-radius verification before revoking active sessions.

### 3. Organization Topology & Continuous Intent Graph
- **Strict Alert-Budget Design**: Baseline operational activity remains calm, while minor elevated events stay quietly contextualized without triggering notification alerts.
- **Symmetric Comparison Strip**: Quick side-by-side comparison of resolved, escalated, and in-review profiles (Priya Raman, Devraj Malhotra, Arjun Chen).
- **Timed Escalation Toast & Bell Pulse**: Fires a high-priority alert 1.2s into the demo session, driving focus directly to active threats.
- **Contextualized Review Drawer**: Filterable ledger of quiet anomalies to prevent alert fatigue.

### 4. Slide-In Forensic Case Dossier (`CaseDetailDrawer`)
- **Three-Number Risk Calculus**: Breaks down **Raw Deviation Score**, **Context Coverage**, and resulting **Residual Risk Score**.
- **Shift Map Evidence Graph (`ShiftMapGraph`)**: Time-axis causal graph correlating identities, ingress devices, bastions, resources, and destinations with visual edge telemetry and change-point detection.
- **Counterfactual Risk Waterfall (`CounterfactualWaterfall`)**: Stepped factor reduction waterfall illustrating simulated risk attenuation for each counterfactual condition.
- **Per-Event Forensic Timeline**: Chronological telemetry stream of authenticated actions, including automated Tier 2 session containment log entries.
- **Context Ledger**: Verification matrix against approved RFCs, on-call schedules, and manager attestations with resource-level hold indicators.
- **Terminal-Capable Status Model**: Seamless workflow supporting `Open` (Escalated) → `Reviewing` → `Cleared` or `Access Revoked` (terminal states).
- **Autonomous System Reopen Engine**: Automatic case re-escalation when post-clearance activity drifts beyond the temporal or operational scope of approving RFCs.
- **Autonomous Protective Action & Resource Protective Hold**: Immediate automated session privilege reduction upon residual risk crossing 70/100, and non-disruptive protective export holds on sensitive assets.
- **Indeterminate Classification Handling**: Dedicated treatment for entities with sparse baseline history (< 96 hours), distinguishing "we don't know yet" from confirmed malicious behavior.

---

## Tech Stack

- **Framework**: [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/) + [@react-three/fiber](https://r3f.docs.pmnd.rs/) + [@react-three/drei](https://github.com/pmndrs/drei)
- **Geographic Data & Maps**: [d3-geo](https://d3js.org/d3-geo) + [topojson-client](https://github.com/topojson/topojson-client) + [world-atlas](https://github.com/topojson/world-atlas)
- **Animation**: [Motion](https://motion.dev/) + [GSAP](https://gsap.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## Project Structure

```
├── components/
│   └── ui/
│       ├── fable-hero.tsx          # 3D interactive hero section & canvas
│       └── demo.tsx                # Reference design playground
├── src/
│   ├── components/
│   │   ├── ThreatMap.tsx           # Global geographic threat map with radar pings
│   │   ├── OrgOverview.tsx         # SOC console, view switcher & entity grid
│   │   ├── ComparisonStrip.tsx     # Symmetric comparative profile strip
│   │   ├── CaseDetailDrawer.tsx    # Slide-in forensic dossier & action sidebar
│   │   ├── ContextualizedDrawer.tsx# Silent blip & under-review drawer
│   │   ├── EscalationToast.tsx     # Timed incident notification banner
│   │   └── StatusBadge.tsx         # Color-coded risk status badges
│   ├── types.ts                    # Shared TypeScript interfaces & types
│   ├── data.ts                     # Mock enterprise personnel & office hubs
│   ├── caseData.ts                 # Forensic evidence & counterfactual engine
│   ├── useEntities.ts              # State management hook for case updates
│   ├── App.tsx                     # Top-level routing & layout orchestration
│   └── index.css                   # Tailwind theme, keyframe pulses & radar styling
├── index.html                      # HTML entry point with metadata tags
└── package.json                    # Project configuration & dependencies
```

---

## Getting Started

### Prerequisites

- Node.js 18+ or later
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd fable
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Build & Quality Checks

- **Run linter / typecheck**:
  ```bash
  npm run lint
  ```

- **Build for production**:
  ```bash
  npm run build
  ```

- **Preview production build**:
  ```bash
  npm run preview
  ```

---

## Backend Note

The `location: { city, country, lat, lng }` field on the `Entity` interface is currently provided as a structured frontend mock for demonstration purposes. In production deployments, this field should be bound to your identity provider (IdP) directory and active cloud telemetry geolocations.
