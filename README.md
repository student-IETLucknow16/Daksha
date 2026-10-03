# SIH26041 — AR Industrial Safety Training App

Monorepo for Smart India Hackathon 2026, PS 26041: AR-Based Vocational Training
Simulator for Industrial Safety in Jharkhand's Mining & Manufacturing Sector.

## Structure

```
SIH26041/
├── mobile-ar/          Unity AR project (Android build target)
├── backend/            Node.js + Express + MongoDB API
├── admin-dashboard/    React + Tailwind admin panel (plain JS, no TS)
└── docs/               Architecture notes, API contracts, decisions
```

## Verified Version Matrix (checked live, Sept 2026)

| Component              | Version           | Notes |
|-------------------------|--------------------|-------|
| Unity Editor             | 6000.0.71f1 LTS   | Free-tier LTS line. **Do not use 2022.3 LTS** — its post-2025 patches are Enterprise/Industry-license only. |
| AR Foundation            | 6.2.0              | Matches Unity 6000.0+ |
| Google ARCore XR Plugin  | 6.2.1              | ARCore SDK 1.48 internally, verified against Android 16 |
| Input System             | 1.11.2             | Required — AR Foundation 6.x depends on `TrackedPoseDriver` |
| Active Input Handling    | **Both**            | Set in Project Settings > Player. AR Foundation needs new Input System; some ARCore sample/legacy code paths expect the old Input Manager. |
| Scripting Backend         | IL2CPP              | Mandatory for ARCore on Android in modern Unity |
| Target Architecture       | ARM64 only          | Standard for ARCore-required apps |
| Android minSdkVersion     | 24                  | Floor for install; ARCore availability is checked and handled at runtime regardless |
| Android targetSdkVersion  | 36                  | Matches ARCore XR Plugin 6.2.1's own target; set explicitly in Player Settings or ARCore's manifest merge will set it anyway |

## Current Status: Phase 1 (Unity AR Prototype) — in progress

Goal: user opens the app, scans a surface, taps it, and places a virtual object.
See `mobile-ar/README.md` for the manual Unity Editor setup steps that could not
be generated as raw files (XR Plug-in Management, Android Player Settings, scene
hierarchy) and must be done once inside the Editor.

Scripts implemented so far:
- `Assets/Scripts/AR/ARSessionManager.cs` — session lifecycle, ARCore availability/install
- `Assets/Scripts/AR/PlaneDetectionManager.cs` — plane detection state, freeze/hide on placement
- `Assets/Scripts/AR/ARPlacementManager.cs` — tap-to-place raycast logic
- `Assets/Scripts/UI/ARScanUIController.cs` — scan/place UI state (presentational only)

Not yet started: Fire scenario (Phase 2), Gas Leak scenario (Phase 3), Assessment
(Phase 4), Backend (Phase 5), Offline (Phase 6), Localization (Phase 7),
Certificates (Phase 8), Admin Dashboard (Phase 9), Integration (Phase 10).



 API KEY : alch_KeRstLg95fPuEC68wOnfO
 Etherium Endpoint :  https://eth-mainnet.g.alchemy.com/v2/alch_KeRstLg95fPuEC68wOnfO