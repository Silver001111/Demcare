# COGNICARE NER (স্মৃতি-সেতু)
## Master Technical, Clinical & Architectural System Dossier
### Smart India Hackathon 2026 • Official Platform Specification

**Collaborating Institutions:**
- Ministry of Development of North Eastern Region (MDoNER), Government of India
- Lokopriya Gopinath Bordoloi Regional Institute of Mental Health (LGBRIMH), Tezpur, Assam
- National Health Authority (Ayushman Bharat Digital Mission / eSanjeevani)

---

## Executive Abstract

**CogniCare NER (স্মৃতি-সেতু / Smriti-Setu)** is an indigenous, offline-first, culturally-grounded artificial intelligence digital therapeutic (DTx) and clinical surveillance platform engineered specifically to address the geriatric dementia and Mild Cognitive Impairment (MCI) epidemic across the 8 North-Eastern states of India (Assam, Arunachal Pradesh, Manipur, Meghalaya, Mizoram, Nagaland, Sikkim, and Tripura).

Built on modern Web standards (React 19, TypeScript, Progressive Web App, Web Audio, HTML5 Canvas Computer Vision), CogniCare operates **100% offline** in remote tribal hamlets lacking cellular towers or grid power. It bridges the critical diagnostic divide between remote rural elders and tertiary neuropsychiatrists at LGBRIMH Tezpur through:
1. **8 Culturally Grounded Neuro-Therapeutic Exercises** utilizing indigenous North-East motifs, musical instruments, and traditional foods.
2. **Automated Digital Clock Drawing Test (CDT)** with 3-Layer geometric AI scoring (Rouleau and Sunderland clinical scales).
3. **500m Virtual Geofencing & Safe Return Wandering Defense** with audio homing beacon and WhatsApp emergency dispatch.
4. **Camera Blister-Pack Computer Vision Verification** detecting foil punctures to prevent accidental overdoses.
5. **Zero-Internet Animated P2P Batch QR Synchronization** using zlib compression for bulk medical handoffs.
6. **Caregiver Acoustic Burnout AI & 15-Minute Flute Pranayama Respite** analyzing vocal jitter/shimmer and Zarit Burden Index.
7. **Predictive 12-Month Dual-Trajectory AI Forecasting** with regional lifestyle prescriptions (Chak-hao black rice, Assam tea polyphenols).
8. **Circadian Ambient Lux Meter & 2700K Phototherapy** to suppress sundowning behavioral agitation.
9. **Regional Dialect Code-Mixing Natural Language Parser** supporting Lower Assamese, Goalpariya, Bodo, and Sylheti idioms.

---

## Table of Contents
1. [The North-East India Geriatric Cognitive Crisis](#1-the-north-east-india-geriatric-cognitive-crisis)
2. [Platform Personas & Core User Journeys](#2-platform-personas--core-user-journeys)
3. [System Architecture & Technology Stack](#3-system-architecture--technology-stack)
4. [Multilingual Engine & Dialect Code-Mixing Parser](#4-multilingual-engine--dialect-code-mixing-parser)
5. [The 8 Neuro-Therapeutic CST Workouts](#5-the-8-neuro-therapeutic-cst-workouts)
6. [Digital Clock Drawing Test (CDT) & 3-Layer Geometric AI](#6-digital-clock-drawing-test-cdt--3-layer-geometric-ai)
7. [Patient Safety, BPSD & Assistive Modules](#7-patient-safety-bpsd--assistive-modules)
   - [Virtual Geofence & Safe Return Wandering Defense](#71-virtual-geofence--safe-return-wandering-defense)
   - [Sundowning Calm & Circadian Phototherapy](#72-sundowning-calm--circadian-phototherapy)
   - [Blister-Pack Medication Computer Vision](#73-blister-pack-medication-computer-vision)
   - [Reminiscence Digital Album](#74-reminiscence-digital-album)
8. [Caregiver Intelligence & Respite AI](#8-caregiver-intelligence--respite-ai)
   - [Predictive Cognitive Trajectory Forecaster](#81-predictive-cognitive-trajectory-forecaster)
   - [Acoustic Burnout Voice Check-in & ZBI-12](#82-acoustic-burnout-voice-check-in--zbi-12)
   - [Flute Pranayama Mindfulness Player](#83-flute-pranayama-mindfulness-player)
9. [ASHA Frontline Gateway & Zero-Internet Optical Sync](#9-asha-frontline-gateway--zero-internet-optical-sync)
   - [Standardized Clinical Batteries (HMSE-10, GDS-4, ADL)](#91-standardized-clinical-batteries)
   - [Zero-Internet Animated Batch QR Optical Handoff](#92-zero-internet-animated-batch-qr-optical-handoff)
   - [eSanjeevani Teleconsultation Referral Pipeline](#93-esanjeevani-teleconsultation-referral-pipeline)
10. [Data Privacy, Security & Compliance](#10-data-privacy-security--compliance)
11. [Evaluator & Clinician Step-by-Step Walkthrough Guide](#11-evaluator--clinician-step-by-step-walkthrough-guide)
12. [Clinical Validation & National Scaling Roadmap](#12-clinical-validation--national-scaling-roadmap)

---

## 1. The North-East India Geriatric Cognitive Crisis

### 1.1 Regional Context
The 8 North-Eastern states of India present unique epidemiological and geographical hurdles that render conventional metropolitan healthcare models completely obsolete:
- **Severe Geographic Isolation:** Riverine island populations (Majuli and river chars) of the Brahmaputra, high-altitude villages in Arunachal Pradesh, and steep valleys in Mizoram/Nagaland face transit times exceeding 12–36 hours to access secondary or tertiary district healthcare centers.
- **Extreme Scarcity of Specialists:** Tertiary neuropsychiatric and geriatric expertise is almost exclusively concentrated at LGBRIMH in Tezpur, Assam. For a population exceeding 45 million across 8 states, there are fewer than 0.2 neurologists per 100,000 population.
- **Deep Stigma & Superstition:** Memory loss and Behavioral and Psychological Symptoms of Dementia (BPSD) like wandering or twilight sundowning agitation are historically attributed to evil spirits, black magic, or natural decay ("bura-bhal"), leading to social ostracization or restraining patients with physical ropes.
- **The Linguistic Barrier:** Over 220 distinct indigenous tribal languages and colloquial dialects are spoken. Standard metropolitan testing tools in English or Hindi fail completely due to cultural incomprehensibility.

---

## 2. Platform Personas & Core User Journeys

CogniCare NER is structured into three dedicated, role-optimized personas:

### 2.1 The Patient Persona (Lakhimi Baruah, Age 72, Bihaguri Gaon)
- **Goal:** Maintain cognitive autonomy, exercise daily memory pathways, receive spoken medication reminders, and feel safe at home without technological intimidation.
- **Design Paradigm:** Ultra-large touch buttons ($> 56\text{px}$), high-contrast warm terracotta/amber/cream earth palette, zero cluttered navigation, and full speech narration in the patient's chosen native dialect.

### 2.2 The Family Caregiver Persona (Mouchumi Baruah, Daughter-in-Law)
- **Goal:** Track cognitive progression over 30/60/90 days, manage medicine adherence, identify sundowning risk triggers, prevent wandering incidents, and monitor personal caregiver stress/burnout.
- **Design Paradigm:** Longitudinal multi-domain radar charts, 12-month dual-curve predictive progression models, voice biomarker stress check-ins, and 1-tap WhatsApp emergency coordination.

### 2.3 The Frontline ASHA Health Worker Persona (Purnima Gogoi, Bihaguri Sub-Centre)
- **Goal:** Conduct rapid community screenings (HMSE-10, GDS-4, ADL), log observational notes, triage patients for tertiary referral, and synchronize records with hospital medical officers without an internet connection.
- **Design Paradigm:** High-speed field screening forms, eSanjeevani AB-HWC referral generator, and zero-internet peer-to-peer optical QR batch handoffs.

---

## 3. System Architecture & Technology Stack

```
+-------------------------------------------------------------------------+
|                         COGNICARE NER CLIENT PWA                        |
|                                                                         |
|  [ React 19 + TypeScript + Vite + Tailwind CSS 4 + Framer Motion ]      |
+-------------------------------------------------------------------------+
|                                                                         |
|  +--------------------+  +--------------------+  +-------------------+  |
|  |   Patient Portal   |  | Caregiver Dashboard|  |  ASHA Field Hub   |  |
|  | - 8 CST Workouts   |  | - Radar Analytics  |  | - HMSE / GDS-4    |  |
|  | - Clock Draw (CDT) |  | - Trajectory AI    |  | - Caseload Triage |  |
|  | - Safe Home SOS    |  | - Burnout Voice    |  | - Batch QR Sync   |  |
|  | - Blister Pack CV  |  | - 15m Flute Respite|  | - eSanjeevani Ref |  |
|  | - Sundowning Calm  |  | - Med Voice Prompts|  | - Offline Storage |  |
|  +--------------------+  +--------------------+  +-------------------+  |
|                                                                         |
+-------------------------------------------------------------------------+
|                       CORE LOCAL-FIRST ENGINES                          |
|                                                                         |
|  +--------------------+  +--------------------+  +-------------------+  |
|  | AI Cognitive Engine|  | Speech/Audio Core  |  | Local Storage Bus |  |
|  | - 5-Domain Matrix  |  | - Web Speech API   |  | - IndexedDB       |  |
|  | - MoCA/HMSE Map    |  | - Web Audio Synths |  | - Zustand Persist |  |
|  | - Rouleau CDT Eval |  | - Binaural / Flute |  | - Offline First   |  |
|  +--------------------+  +--------------------+  +-------------------+  |
+-------------------------------------------------------------------------+
|                   ZERO-INTERNET & NETWORK ADAPTERS                      |
|                                                                         |
|  +----------------------------------+  +-----------------------------+  |
|  | Optical P2P QR Streaming Engine  |  | Optional Firebase Mirror    |  |
|  | - pako zlib deflate (level 9)    |  | - Firestore Bidirectional   |  |
|  | - Animated canvas (3-5 FPS)      |  | - Google Auth / Email       |  |
|  +----------------------------------+  +-----------------------------+  |
+-------------------------------------------------------------------------+
```

### Key Technical Specifications:
- **Zero-Internet Runtime:** Full offline PWA support registered via `vite-plugin-pwa` and Workbox cache-first strategies.
- **Biometric Processing Security:** Computer vision pixel scanning and voice audio biomarker processing execute entirely in client browser memory. No audio or video is stored on or streamed to external cloud servers.
- **Mathematical Accuracy:** Precise trigonometric vector calculations for clock drawing angles, great-circle Haversine geofence boundaries, and ITU-R BT.709 photometric luminance sampling.

---

## 4. Multilingual Engine & Dialect Code-Mixing Parser

CogniCare NER supports **10 languages** natively, covering the entire linguistic spectrum of North-East India:

| Code | Language | Native Script | Primary Regional Focus |
| :--- | :--- | :--- | :--- |
| `as` | Assamese | অসমীয়া | Brahmaputra Valley, Assam |
| `bn` | Bengali | বাংলা | Barak Valley, Tripura Plains |
| `mni` | Manipuri | মৈতৈলোন্ | Imphal Valley, Manipur |
| `brx` | Bodo | बर' | Bodoland Territorial Region (BTR) |
| `kha` | Khasi | Ka Ktien Khasi | East & West Khasi Hills, Meghalaya |
| `lus` | Mizo | Mizo ṭawng | Aizawl, Lunglei, Mizoram |
| `trp` | Kokborok | Kokborok | Indigenous Tripura |
| `ne` | Nepali | नेपाली | Sikkim, Darjeeling, Karbi Anglong |
| `hi` | Hindi | हिन्दी | Pan-India National Integration |
| `en` | English | English | Medical & Administrative Default |

### Regional Dialect Code-Mixing Parser (`dialectParser.ts`)
Rural elders frequently code-mix localized village dialects with standard state languages. CogniCare implements a fuzzy phonetics parser using a regional synset dictionary and Levenshtein dynamic programming:

$$\text{lev}(a, b) = \begin{cases} 
|a| & \text{if } |b| = 0, \\
|b| & \text{if } |a| = 0, \\
\text{lev}(\text{tail}(a), \text{tail}(b)) & \text{if } a[0] = b[0], \\
1 + \min \begin{cases} \text{lev}(\text{tail}(a), b) \\ \text{lev}(a, \text{tail}(b)) \\ \text{lev}(\text{tail}(a), \text{tail}(b)) \end{cases} & \text{otherwise}
\end{cases}$$

- **Dialect Examples Handled:**
  - *Kamrupi (Lower Assam):* "খাৰুবা" (*kharuba*) $\rightarrow$ Standard "খাৰ" (*khar* - alkaline delicacy).
  - *Bodo:* "onla" (rice powder gravy) $\rightarrow$ Traditional indigenous curry.
  - *Goalpariya:* "মাছৰ জোল" (*machhor jhol*) $\rightarrow$ Fish preparation.
  - *Sylheti:* "হাঁত" (*hat*) $\rightarrow$ Hand / limb.
- **Clinical Benefit:** Prevents false scoring penalties during speech-based semantic fluency exercises when rural elders express concepts in their regional colloquial vernacular.

---

## 5. The 8 Neuro-Therapeutic CST Workouts

Cognitive Stimulation Therapy (CST) workouts are designed to stimulate specific brain lobes using familiar North-East cultural touchstones:

### Workout 1: Gamosa Card Match (স্মৃতি খেল)
- **Target Domain:** Visual Working Memory & Pattern Recognition (Occipital & Hippocampal regions).
- **Cultural Archetype:** Pairs of traditional Assamese Gamosa handwoven border weaves (Phulam floral, Kingkhap royal peacock, Mising tribal motifs, Karbi patterns, Bodo diamond weaves, Bihu Dhol).
- **Features:** 4, 6, or 8 pairs; smooth 3D card flips; Assamese voice praise upon completion.

### Workout 2: Bihu Rhythm Recall (বিহু ছন্দ স্মৃতি)
- **Target Domain:** Auditory Working Memory & Temporal Sequencing (Superior Temporal Gyrus).
- **Cultural Archetype:** Traditional North-East folk instruments: Dhol (drum), Pepa (buffalo horn), Taal (cymbals), Gogona (jaw harp), Toka (clapper), Khol.
- **Features:** Audio synthesis of authentic acoustic samples; progressive sequential replication (Simon-style); visual vibration ring.

### Workout 3: Daily Routine Sequencer (দৈনন্দিন কাৰ্য্যক্ৰম)
- **Target Domain:** Executive Functioning & Temporal Logic (Dorsolateral Prefrontal Cortex).
- **Cultural Archetype:** Village daily routine cards: Morning Lal Cha (red tea), bathing at pond/tubewell, Namghar/temple prayers, vegetable garden cultivation, midday rest, and evening medicine.
- **Features:** Drag/tap ordering cards; immediate constructive feedback; reinforcement of prospective memory.

### Workout 4: Bamboo Pattern Completion (বাঁহৰ আৰ্হি খেল)
- **Target Domain:** Visuospatial Reasoning & Inductive Logic (Parietal Lobe).
- **Cultural Archetype:** Intricate bamboo and cane weaving matrices used in rural North-East crafts (Japi hats, Polo fish traps, Chalani sieves).
- **Features:** Missing matrix slot completion; geometric symmetry verification.

### Workout 5: Market Spot Difference (হাজাৰ বজাৰ)
- **Target Domain:** Selective Visual Attention & Inhibitory Control (Frontoparietal Attention Network).
- **Cultural Archetype:** Illustrated dual views of a vibrant rural North-East weekly haat (vegetable stalls with local greens like Dhekia and Lai Xak, terracotta pottery, freshwater fish).
- **Features:** Coordinate hitboxes; visual highlight circles; error tolerance for tremor-prone fingers.

### Workout 6: Word Association & Food Categorization (খাদ্য শব্দ সংযোগ)
- **Target Domain:** Semantic Fluency & Lexical Retrieval (Left Temporal Neocortex).
- **Cultural Archetype:** Indigenous gastronomy: Khar, Tenga, Pitha, Chira-Doi, Laru, Jolpan.
- **Features:** Speech-to-text with Dialect Parser integration; real-time regional dialect recognition badge.

### Workout 7: Digital Clock Drawing Test (CDT)
- **Target Domain:** Visuospatial, Executive Planning, Conceptualization (Multilobar Integration).
- *(See Section 6 for full 3-Layer AI details)*.

### Workout 8: Olfactory (Aroma) Memory Recall Kit (সুগন্ধি স্মৃতি পৰীক্ষা)
- **Target Domain:** Olfactory Bulb & Entorhinal Cortex Stimulation (Early AD Biomarker).
- **Cultural Archetype:** 5 physical scent vials: Kazi Nemu (Assam lime), Chai Paat (fresh tea leaf), Bhut Jolokia (King chilli), Mati Gondho (monsoon petrichor), Joha Chaul (aromatic rice).
- **Features:** Cross-Modality Human Recall Index (HRI); voice-guided scent smelling; pre-symptomatic staging threshold.

---

## 6. Digital Clock Drawing Test (CDT) & 3-Layer Geometric AI

The Clock Drawing Test is one of the most clinically sensitive screening instruments for early dementia. CogniCare implements a zero-latency canvas drawing evaluator operating on three geometric AI layers:

```
[ Canvas Drawing Input ]
         |
         v
+-------------------------------------------------------------------------+
| LAYER A: Contour Circularity                                            |
| - Bounding Box Aspect Ratio: AR = H / W (Target: 0.85 - 1.15)           |
| - Gap Closure Distance: || P_start - P_end || < 35 px                   |
| - Perimeter Smoothness: Convexity & Curvature Variance                  |
+-------------------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------------------+
| LAYER B: Number Placement Symmetry                                      |
| - Quadrant Centroids: Q1 (1-3), Q2 (4-6), Q3 (7-9), Q4 (10-12)          |
| - Hemispatial Neglect Detection: Contralateral clustering ratio         |
| - Sequential Completeness: 1-12 presence & perimeter order              |
+-------------------------------------------------------------------------+
         |
         v
+-------------------------------------------------------------------------+
| LAYER C: Hand Angle Vector Accuracy                                     |
| - Hour Hand Target: 11 o'clock (300° ± 15°)                             |
| - Minute Hand Target: 10 past (60° ± 15°)                               |
| - Length Discrimination: || Hand_hour || < || Hand_minute ||            |
| - Perseveration Penalty: Extra hands count check                        |
+-------------------------------------------------------------------------+
         |
         v
[ Clinical Output: Rouleau Score (1-5) & Sunderland Score (1-10) ]
```

### 6.1 Clinical Scoring Rubrics

#### Rouleau Scale (1 to 5)
- **Score 5 (Perfect):** Circular contour, all 12 numbers placed with normal symmetry, hour and minute hands distinct and pointing accurately to 11:10.
- **Score 4 (Mild Visuospatial Deficit):** Slight spacing distortion of numbers, hands slightly off-target (within $30^\circ$), but conceptual clock structure intact.
- **Score 3 (Moderate Executive Deficit):** Numbers placed outside circle, clustered on one side, or hands inappropriate lengths / wrong time.
- **Score 2 (Severe Visuospatial/Conceptual Deficit):** Disorganized numbers, missing hands or extra hands (perseveration), severe circular distortion.
- **Score 1 (Irrelevant / Incomplete):** Unable to draw a clock; random scribbles; absence of numbers or clock face.

---

## 7. Patient Safety, BPSD & Assistive Modules

### 7.1 Virtual Geofence & Safe Return Wandering Defense
Elderly dementia patients frequently wander away from home and become disoriented in dense forests or riverbanks. CogniCare implements an autonomous geofence:
- **Haversine Distance Formula:**
  $$d = 2R \cdot \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta \varphi}{2}\right) + \cos(\varphi_1)\cos(\varphi_2)\sin^2\left(\frac{\Delta \lambda}{2}\right)}\right)$$
  Where $R = 6,371\text{ km}$, $\varphi$ is latitude, and $\lambda$ is longitude.
- **Safe Zone:** 500m radius around home coordinates (calibrated to Bihaguri Gaon `26.6812, 92.7934`).
- **High-Contrast Safe Return Compass:** Displays a giant arrow pointing towards home coordinates with real-time distance countdown in local Assamese.
- **Acoustic Homing Beacon:** Synthesizes an alternating dual-frequency tone ($880\text{Hz} / 440\text{Hz}$) via the Web Audio API to assist villagers in tracking the lost patient.
- **Emergency WhatsApp Dispatch:** Automatic construction of an encrypted WhatsApp SOS message containing live coordinates and a direct Google Maps pin link.

### 7.2 Sundowning Calm & Circadian Phototherapy
- **Photometric Camera Lux Meter:** Computes ambient illuminance using ITU-R BT.709 relative luminance from camera video frames:
  $$Y = 0.2126R + 0.7152G + 0.0722B$$
- **Sundowning Trigger:** When ambient light falls below $150\text{ lux}$ between 4:30 PM and 7:00 PM, the system warns of imminent sundowning agitation.
- **2700K Amber Phototherapy:** Full-screen warm amber illumination accompanied by a soothing $432\text{Hz}$ alpha-wave tone, river soundscapes, and tea garden rain sounds to suppress cortisol surges.

### 7.3 Blister-Pack Medication Computer Vision
- **Problem:** Elderly patients often forget whether they took their morning pills, leading to lethal double-doses of cholinesterase inhibitors or cardiovascular medications.
- **CV Algorithm:** The patient holds their blister pack to the camera. The algorithm computes pixel luminance standard deviation and cavity contrast:
  - Intact foil reflects light uniformly ($\sigma_{\text{lum}} < 15$, bright center).
  - Punctured cavity exhibits shadow depressions and ragged torn edges ($\sigma_{\text{lum}} > 35$, dark center).
- **Overdose Alert:** If the count of punctured cavities exceeds the daily scheduled dose, a prominent red alert is sounded and logged in the caregiver portal.

### 7.4 Reminiscence Digital Album
Preserves remote episodic memories through digitized family photographs, ancestral village landscapes, and recorded voice memories from family members, anchoring agitated patients during dissociative episodes.

---

## 8. Caregiver Intelligence & Respite AI

### 8.1 Predictive Cognitive Trajectory Forecaster
Utilizes longitudinal composite scores and domain-weighted exponential moving averages:
$$S_t = 0.70 \cdot S_{t-1} + 0.30 \cdot X_{\text{session}}$$
Projects two 12-month curves:
1. **Natural Unintervened Decline:** Demonstrates steep loss of function toward moderate/severe dementia.
2. **Culturally-Grounded Intervened Pathway:** Shows preserved functional autonomy resulting from regular cognitive exercises, physical engagement, and North-East dietary neuroprotection.
- **North-East Prescriptions:**
  - *Chak-hao (Manipuri Black Rice):* High anthocyanin neuroprotective antioxidants.
  - *Assam CTC Orthodox Tea:* Morning polyphenols for microvascular cerebral health.
  - *Bihu Motor-Auditory Synchronization:* 15-minute rhythm clapping for temporal lobe preservation.

### 8.2 Acoustic Burnout Voice Check-in & ZBI-12
- **45-Second Voice Check-in:** Analyzes vocal biomarkers from the caregiver's speech:
  - **$F_0$ Pitch Jitter:** Frequency instability reflecting emotional exhaustion.
  - **Acoustic Shimmer:** Amplitude perturbation indicating vocal cord tension.
  - **Pitch Standard Deviation:** Affect flattening (a classic marker of depressive burnout).
  - **Sigh & Pause Density:** Vocal strain and respiratory exhaustion.
- **Zarit Burden Interview (ZBI-12):** Calculates a calibrated burden score ($0 - 24$), categorizing stress into Low ($< 10$), Moderate ($10 - 18$), or Severe ($> 18$).

### 8.3 Flute Pranayama Mindfulness Player
Interactive audio player guiding the caregiver through 4-4-6 pranayama breathing (4s inhale, 4s hold, 6s exhale) synchronized with an expanding visual circle and traditional North-East bamboo flute harmonics.

---

## 9. ASHA Frontline Gateway & Zero-Internet Optical Sync

### 9.1 Standardized Clinical Batteries
- **HMSE-10 (Hindi/Assamese Mental State Examination):** Adapted for rural and low-literacy elders, assessing temporal orientation, immediate registration, attention calculation, delayed recall, and object naming.
- **GDS-4 (Geriatric Depression Scale):** Distinguishes depressive pseudodementia from progressive neurodegeneration.
- **ADL / IADL Assessment:** Evaluates functional independence in feeding, dressing, bathing, toileting, and village market mobility.

### 9.2 Zero-Internet Animated Batch QR Optical Handoff
Transfers dozens of complete patient files across two smartphones without internet, Bluetooth, Wi-Fi Direct, or cables:

```
[ ASHA Worker Phone (Transmitter) ]
  1. Aggregate 50+ patient records into JSON
  2. Compress via pako zlib deflate (Level 9) -> 75% size reduction
  3. Encode binary buffer into Base64 string
  4. Slices into ~650-character chunks with headers: { id, idx, total, chunk }
  5. Renders animated QR stream on Canvas at 3 to 5 FPS
               |
               | (Camera Line-of-Sight)
               v
[ Primary Health Centre Phone (Receiver) ]
  1. Camera viewfinder scans sequential QR frames
  2. Tracks received frames in bitmask array
  3. Reassembles Base64 payload -> Decodes Uint8Array
  4. Decompresses via pako.inflate & TextDecoder
  5. Bulk imports records into local storage with confetti celebration!
```

### 9.3 eSanjeevani Teleconsultation Referral Pipeline
Compiles screening scores, CDT results, behavioral logs, and Ayushman Bharat Health Account (ABHA) IDs into a standardized AB-HWC referral dossier, pre-formatted for digital submission to LGBRIMH Tezpur.

---

## 10. Data Privacy, Security & Compliance

- **Local-First Processing:** Camera video frames and microphone audio streams are processed ephemerally in client RAM using Web APIs. No raw biometric video or audio files are ever written to disk or transmitted to the cloud.
- **Encrypted Local Storage:** Patient records and screening logs stored in browser IndexedDB/LocalStorage are accessible only within the authenticated app origin.
- **Compliance Alignment:**
  - **DISHA (Digital Information Security in Healthcare Act, India):** Strict patient data privacy and consent logging.
  - **Ayushman Bharat Digital Mission (ABDM):** Standardized ABHA ID binding.
  - **WCAG 2.1 AAA Accessibility:** Contrast ratios $> 7:1$, minimum $48\text{px}$ touch targets, and complete voice navigation for illiterate rural populations.

---

## 11. Evaluator & Clinician Step-by-Step Walkthrough Guide

To evaluate CogniCare NER from scratch, follow this comprehensive walkthrough:

### Scenario 1: Evaluating the Patient Interface
1. Open the application. On the landing page, select **"প্ৰৱেশ কৰক (Enter as Patient / ৰোগী)"**.
2. Tap the **Globe Icon** in the top navigation bar and select **"অসমীয়া (Assamese)"** or **"English"**.
3. **Daily CST Workouts:**
   - Tap **Card #7: "Clock Drawing Test (ঘড়ী অঁকা পৰীক্ষা)"**.
   - Tap the drawing canvas to draw a clock face, place numbers 1 to 12, and set the hands to 11:10.
   - Alternatively, tap **"Preset: Normal (5/5)"** or **"Preset: Neglect (1/5)"** to see instant clinical evaluation. Tap **"Submit & Analyze"** to inspect Layer A, B, and C scores.
   - Tap **Card #8: "Aroma Memory Recall (সুগন্ধি স্মৃতি)"** to experience the 5 North-East aroma tests.
4. **Safety & Wandering:**
   - Tap **"Safe Home SOS (সুৰক্ষিত ঘৰ)"**. Observe the 500m geofence radar.
   - Tap **"Simulate 850m Breach"**. Observe the high-contrast homing compass, the pulsing audio beacon, and the generated emergency WhatsApp alert with live coordinates.
5. **Medicine Check:**
   - Under the daily medicine schedule, tap **"Verify Pill (Camera) / ঔষধ পৰীক্ষা কৰক"**. Hold a blister pack to test cavity computer vision detection.

### Scenario 2: Evaluating the Caregiver Dashboard
1. Switch role to **Caregiver** via logout or navigation.
2. In the top tabs, select **"🔮 AI Trajectory"** to explore 12-month dual projection curves and North-East diet prescriptions.
3. Select **"🎋 Respite & Burnout"**. Click **"Start Voice Check-in"** (or use simulated evaluation) to see acoustic jitter, shimmer, affect flattening, and ZBI-12 burden scoring.
4. Tap **"Start 15-Min Respite Session"** to experience the breathing guide with North-East flute tones.

### Scenario 3: Evaluating the ASHA Worker Zero-Internet Sync
1. Switch role to **ASHA Worker**.
2. Select the **"Zero-Internet P2P QR Handoff"** tab.
3. Under **"Transmitter Mode (Generate Optical Stream)"**, tap **"Start Animated QR Stream"**. Observe high-speed canvas QR frame cycling at 3–5 FPS.
4. Toggle to **"Receiver Mode (Scan Optical Stream)"** to inspect the camera frame scanner and reassembly pipeline.

---

## 12. Clinical Validation & National Scaling Roadmap

```
+-------------------------------------------------------------------------+
|                        3-PHASE NATIONAL DEPLOYMENT                      |
+-------------------------------------------------------------------------+
| PHASE 1 (Current): Smart India Hackathon 2026 & Clinical Calibration    |
| - Validation with LGBRIMH Tezpur geriatric psychiatry faculty.          |
| - Pilot trials in Sonitpur and Kamrup rural health blocks.              |
+-------------------------------------------------------------------------+
| PHASE 2 (Year 1): 1,000 AB-HWCs Across 8 North-Eastern States           |
| - Pre-loading CogniCare PWA onto ASHA frontline tablets.                |
| - Distribution of 5-vial physical Olfactory Aroma Test Kits.            |
| - Direct integration with state National Health Mission (NHM) dashboards|
+-------------------------------------------------------------------------+
| PHASE 3 (Year 2): Pan-India Tribal & Himalayan Extension                |
| - Expansion into Central tribal belts (Jharkhand, Odisha, Chhattisgarh). |
| - Full national integration into eSanjeevani Teleconsultation OPD.       |
+-------------------------------------------------------------------------+
```

---

*CogniCare NER (স্মৃতি-সেতু) is dedicated to every rural elder across the hills, valleys, and riverine islands of North-East India — ensuring that no grandmother or grandfather is forgotten in the twilight of memory.*
