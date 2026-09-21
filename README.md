# 🌿 CogniCare NER (স্মৃতি-সেতু)
### Offline-First Multilingual AI Geriatric Cognitive Care & Clinical Surveillance Ecosystem
**Smart India Hackathon 2026** • Designed for the **Ministry of Development of North Eastern Region (MDoNER)** & **LGBRIMH Tezpur**

---

## ⚡ Quick Start (How to Run in 10 Seconds)

### Option A: 1-Click Launch (Windows)
Double-click the [`start.bat`](start.bat) file in this directory. It will automatically start the dev server and open your browser at `http://localhost:5173`.

### Option B: Terminal (Any OS)
From this root directory, simply run:
```bash
# 1. Start the interactive development server
npm run dev
# (or: npm start)

# 2. Build production-optimized PWA bundle
npm run build

# 3. Regenerate the official master PDF dossier
npm run generate:pdf
```

> **📱 Mobile Testing over Wi-Fi / Hotspot:**
> When the dev server starts, it prints a **Network URL** (e.g. `http://192.168.1.X:5173`). Open this link on your smartphone to test camera computer vision, audio voice check-ins, and touch drawing directly!

---

## 🚀 Key Features Overview

| Feature | Persona | Description |
| :--- | :--- | :--- |
| **8 Culturally Grounded CST Games** | Patient | Gamosa Card Match, Bihu Rhythm Recall, Daily Routine, Bamboo Matrix, Haat Difference, Food Association, Clock Draw, Aroma Recall. |
| **Digital Clock Drawing Test (CDT)** | Patient / Doctor | Canvas stroke tracking with 3-Layer geometric AI scoring (Rouleau 1-5 & Sunderland 1-10 clinical scales). |
| **Virtual Geofence & Safe Return** | Patient | 500m Haversine radius, directional homing compass, Web Audio beacon, and automatic WhatsApp emergency dispatch with GPS link. |
| **Camera Blister-Pack CV Scanner** | Patient | Computer vision cavity luminance analysis to count intact vs empty pills and prevent accidental overdoses. |
| **Sundowning Calm & Phototherapy** | Patient | Photometric camera lux meter (BT.709) triggering 2700K warm amber phototherapy and calming binaural audio. |
| **Regional Dialect Parser** | Patient | Levenshtein phonetic matcher recognizing Kamrupi, Goalpariya, Bodo, and Sylheti vernacular idioms. |
| **Predictive Trajectory AI** | Caregiver | 12-month dual projection curves comparing natural decline vs intervened pathway with North-East diet prescriptions. |
| **Caregiver Acoustic Respite AI** | Caregiver | 45s voice biomarker analysis (pitch jitter, shimmer, affect flattening), ZBI-12 burden index, and 15-min flute pranayama player. |
| **Zero-Internet Batch QR Sync** | ASHA Worker | Zlib-deflated (`pako`) animated QR streaming protocol for bulk medical record handoffs without internet, Bluetooth, or Wi-Fi. |
| **eSanjeevani Teleconsultation** | ASHA Worker | Standardized AB-HWC referral dossier generation pre-filling ABHA IDs and clinical metrics for LGBRIMH Tezpur. |

---

## 📚 Master Documentation & Dossiers

- **Official Publication PDF Dossier:** [`COGNICARE_NER_MASTER_SYSTEM_DOSSIER.pdf`](COGNICARE_NER_MASTER_SYSTEM_DOSSIER.pdf)
- **Full Architectural Markdown Specification:** [`COGNICARE_MASTER_SYSTEM_DOSSIER.md`](COGNICARE_MASTER_SYSTEM_DOSSIER.md)
- **Advanced Features Blueprint:** [`ADVANCED_FEATURES_BLUEPRINT.md`](ADVANCED_FEATURES_BLUEPRINT.md)

---

## 🧪 Architecture & Optimization Highlights

- **Bundle Optimization:** Code-split into lazy-loaded micro-chunks; initial entry bundle reduced from **2.1 MB** to **467 kB** (144 kB gzipped).
- **Zero-Internet First:** Full PWA service worker with offline Workbox caching.
- **Biometric Security:** Client-side in-memory canvas and audio processing; zero raw media uploaded to cloud servers.
- **Languages Supported (10):** Assamese, Bengali, Manipuri, Bodo, Khasi, Mizo, Kokborok, Nepali, Hindi, English.
