# 🌿 CogniCare NER (স্মৃতি-সেতু) — Web Client PWA
### SIH 2026 Problem Statement 26003 • MedTech Platform for Older Persons in North East India

CogniCare NER is an offline-first Progressive Web Application (PWA) built specifically for elder cognitive screening, neuro-therapeutic intervention, and clinical surveillance across the 8 North Eastern states of India.

---

## 🚀 Key Modules & Personas

### 👵 1. Patient Portal
- **8 Culturally Adapted Cognitive CST Workouts:**
  - 🧣 **Gamosa Card Match:** Visuospatial memory & pattern recognition with authentic Assamese weaving motifs.
  - 🥁 **Bihu Rhythm Recall:** Auditory memory & rhythm sequencing using Dhol, Pepa, Gagana, and Taal instruments.
  - ☕ **Daily Routine Sequencing:** Executive function & chronological sorting of daily living tasks.
  - 🎋 **Bamboo Pattern Completion:** Raven's matrix logical reasoning using traditional bamboo weave geometries.
  - 🧺 **Haat Market Spot Difference:** Sustained visual attention and perceptual discrimination in an Assamese local market.
  - 🍲 **Word Association & Vernacular NLP:** Language fluency paired with speech biomarker extraction and local dialect recognition.
  - 🕰️ **Digital Clock Drawing Test (CDT):** 3-Layer geometric stroke analysis with Rouleau 10-point and Sunderland scoring.
  - 👃 **Olfactory (Aroma) Memory Recall:** Sensory stimulation kit testing olfactory identification (cinnamon, tea, camphor, ginger).
- **Patient Safety & Supportive Tools:**
  - 🏞️ **Reminiscence Digital Album:** Cultural photography across Majuli, Kaziranga, Loktak, and Meghalaya root bridges.
  - 🌙 **Sundowning Calm & Phototherapy:** Sensor-assisted lux measurement and 2700K warm amber phototherapy with binaural soundscapes.
  - 🏡 **Safe Home SOS & Virtual Geofence:** 500m Haversine GPS radius, compass homing, and automatic WhatsApp emergency dispatch.
  - 📷 **Blister-Pack Medication CV Scanner:** Camera cavity analysis detecting punctured foil bubbles to verify dose adherence.

### 👨‍👩‍👧 2. Caregiver Portal
- **Cognitive Radar Analytics:** 5-domain radar comparison (Memory, Attention, Executive, Visuospatial, Language) vs 2-week baseline.
- **Predictive Trajectory AI:** 12-month dual-curve projection model comparing natural decline vs active DTx intervention.
- **Acoustic Burnout Voice Check-in:** 45-second speech analysis (pitch jitter, shimmer, affect flattening) and Zarit Burden Interview (ZBI-12).
- **Flute Pranayama Mindfulness Player:** 15-minute guided breathwork player with authentic Indian bamboo flute audio.
- **Clinical PDF Export:** 1-click generation of formal medical progress summaries using `jspdf`.

### 👩‍⚕️ 3. Frontline ASHA Health Worker Portal
- **Rapid Clinical Screening Battery:** 5-minute field assessments covering orientation, recall, attention, sleep, appetite, and mood.
- **Ayushman Bharat Health Account (ABHA ID):** ABDM schema compliance with live formatting, validation, and QR scanner support.
- **Zero-Internet P2P Animated QR Handoff:** Zlib-deflated (`pako`) chunked QR streaming for batch synchronization without internet or bluetooth.
- **e-Sanjeevani Teleconsultation Referral:** MoHFW standardized referral generation directly targeting LGBRIMH Tezpur specialists.
- **Regional Epidemiological Heatmap:** 8-state North East health surveillance matrix tracking MCI prevalence and screening density.

---

## 🛠️ Technology Stack

- **Core:** React 19, TypeScript 6, Vite 8, Tailwind CSS 4
- **State Management:** Zustand 5 (with versioned persistence and offline hydration)
- **Visualizations:** Recharts 3
- **Audio & Speech:** Web Audio API (`AudioContext`, `AnalyserNode`), Web Speech Synthesis API
- **Offline & PWA:** `vite-plugin-pwa`, Workbox service worker precaching (46 entries, 9.3 MB)
- **Cloud Backend:** Google Cloud Firebase v12 (`demcare-95abc` Firestore real-time sync + offline fallback)
- **Computer Vision:** HTML5 Canvas pixel luminance edge convolution / Sobel analysis

---

## 📜 Development Scripts

```bash
# Start development server on localhost and local network
npm run dev

# Run TypeScript type check and production bundle build
npm run build

# Run Oxlint static analysis
npm run lint

# Preview production build locally
npm run preview
```
