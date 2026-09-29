# mobile-ar — Phase 1 Setup Guide

This folder is a real Unity project skeleton (`Packages/manifest.json`,
`ProjectSettings/ProjectVersion.txt`, and the `Assets/Scripts` you'll wire up
below). Open it directly in Unity Hub — Hub will read `ProjectVersion.txt` and
offer to install 6000.0.71f1 LTS if you don't have it.

A few things (XR Plug-in Management config, Android Player Settings, and the
scene hierarchy) are Editor-generated ScriptableObjects/binary scene data that
are unsafe to hand-write outside the Editor — doing it there takes 10 minutes
and avoids a corrupted project. Follow these steps once, in order.

## 1. Open the project

- Unity Hub → Open → select the `mobile-ar` folder.
- Let it install 6000.0.71f1 LTS (with **Android Build Support** module
  checked — including the Android SDK & NDK Tools and OpenJDK sub-modules) if
  prompted.
- Unity will resolve `Packages/manifest.json` automatically on first open —
  this pulls in AR Foundation 6.2.0, ARCore XR Plugin 6.2.1, and Input System
  1.11.2. First resolve can take a few minutes.

## 2. Switch build target to Android

`File > Build Profiles > Android > Switch Platform`

## 3. Enable ARCore in XR Plug-in Management

`Edit > Project Settings > XR Plug-in Management`
- Install XR Plug-in Management if prompted.
- Under the **Android** tab, check **Google ARCore**.

## 4. Player Settings (Android tab, still in Project Settings)

- **Active Input Handling**: `Project Settings > Player > Other Settings` → set to **Both**.
- **Scripting Backend**: IL2CPP
- **Target Architectures**: ARM64 only (uncheck ARMv7)
- **Minimum API Level**: Android 7.0 'Nougat' (API 24)
- **Target API Level**: Automatic (highest installed) — this will resolve to
  API 36, matching what ARCore XR Plugin 6.2.1 expects anyway.
- **Application Entry Point** (under Other Settings): check `Activity`,
  uncheck `GameActivity` — required by the current ARCore Extensions guidance
  for AR Foundation 6.
- Under **Configuration**: set **Camera Usage Description** (required by
  Android for camera permission prompts) — e.g. "Used for AR safety training
  scenarios."

## 5. Build the demo scene

Create `Assets/Scenes/ARDemo.unity` with this hierarchy:

```
ARDemo (scene)
├── XR Origin (AR Rig)          [add via GameObject > XR > XR Origin (AR)]
│   ├── Camera Offset
│   │   └── Main Camera          (has ARCameraManager, ARCameraBackground)
│   └── (auto-added by XR Origin)
├── AR Session                   [GameObject > XR > AR Session]
│   └── add component: ARSessionManager (our script)
├── AR Plane Manager object      — actually add ARPlaneManager + ARRaycastManager
│   components directly on the XR Origin GameObject (standard AR Foundation setup)
│   └── also add: PlaneDetectionManager, ARPlacementManager (our scripts)
├── Canvas (Screen Space - Overlay)
│   ├── ScanPromptPanel  (Text: "Move your phone to scan a surface")
│   ├── TapToPlacePanel  (Text: "Tap the highlighted surface to place")
│   ├── PlacedConfirmPanel (Text: "Scenario placed!")
│   └── StatusText
│       └── add component: ARScanUIController (our script), wire up the
│           four references above in the Inspector
└── EventSystem                  [auto-created with Canvas, or GameObject > UI > Event System]
```

For the plane visualization prefab, use AR Foundation's built-in
`ARFeatheredPlaneMeshVisualizer` prefab (found via Package Manager samples for
AR Foundation, or create your own — a simple semi-transparent quad works for
Phase 1) assigned to the `ARPlaneManager.planePrefab` field.

For `scenarioPrefabToPlace` on `ARPlacementManager`: for Phase 1, use any
placeholder (e.g. a 20cm cube) — the real fire/gas-leak environment prefabs
arrive in Phase 2/3.

## 6. Build & test on your Android phone

- Connect phone via USB with Developer Options + USB Debugging enabled.
- `File > Build Profiles > Android > Build And Run`.
- Grant camera permission when prompted.
- Expected behavior: point camera at floor/table, move phone slowly until a
  plane highlight appears, tap it, cube spawns and stays anchored.

## Testing checklist for Phase 1

- [ ] App launches without crash on a mid-range Android 10+ device
- [ ] Camera permission prompt appears and works
- [ ] Device without ARCore support: `ARSessionManager` reports `Unsupported`
      (test on an unsupported device or emulator if available)
- [ ] Plane detected within ~5 seconds of normal scanning motion
- [ ] Tap places object exactly at the tapped point, not offset
- [ ] Object stays anchored when you walk around it
- [ ] Planes disappear after placement (no visual clutter)
- [ ] App backgrounded and resumed — AR session recovers without crash

Once this is solid on real hardware, we move to **Phase 2 (Fire Scenario)**.
