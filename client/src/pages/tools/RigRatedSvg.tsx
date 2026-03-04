
import type { UTVBodyType } from "./rigrated-machines";

interface RigRatedSvgProps {
  bodyType: UTVBodyType;
  machineId?: string;
  showRoof: boolean;
  showWindshield: boolean;
  showDoors: boolean;
  showFrontBumper: boolean;
  showRearBumper: boolean;
  showWinch: boolean;
  showRack: boolean;
  showLightBar: boolean;
  showRtt: boolean;
  loadStatus: "green" | "yellow" | "orange" | "red";
}

// ─── Per-model silhouette paths (29 UTVs) ────────────────────────────────
// ViewBox: 0 0 420 200. Ground at y=178. Wheel cutouts via evenodd at y=152, r=26.
// Angular geometric shapes — flat rooflines, steep windshields, distinct cab/bed.

interface SilhouetteData {
  path: string;
  frontWheel: number;
  rearWheel: number;
}

const MODEL_SILHOUETTES: Record<string, SilhouetteData> = {
  // ── Polaris (10) ─────────────────────────────────────────────────
  // RZR XP 1000 — 2-seat sport, base model
  "polaris-rzr-xp-1000": {
    path: "M 60 178 L 60 140 L 66 130 L 72 120 L 106 114 L 130 66 L 140 60 L 238 60 L 248 64 L 258 78 L 266 100 L 274 110 L 316 114 L 338 132 L 356 156 L 366 170 L 374 178 L 374 186 L 60 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  // RZR XP Turbo R — 2-seat sport, wider and lower
  "polaris-rzr-xp-turbo-r": {
    path: "M 56 178 L 56 138 L 62 126 L 70 116 L 104 110 L 128 62 L 138 56 L 244 56 L 254 60 L 266 76 L 274 98 L 282 108 L 322 112 L 344 130 L 362 156 L 372 170 L 380 178 L 380 186 L 56 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 118, rearWheel: 304,
  },
  // RZR Pro XP — 2-seat sport, wider track
  "polaris-rzr-pro-xp": {
    path: "M 58 178 L 58 138 L 64 128 L 72 118 L 108 112 L 132 64 L 142 58 L 240 58 L 250 62 L 262 78 L 270 100 L 278 110 L 318 114 L 340 132 L 358 158 L 368 170 L 376 178 L 376 186 L 58 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  // RZR Pro R — 2-seat sport, widest and most aggressive
  "polaris-rzr-pro-r": {
    path: "M 54 178 L 54 136 L 60 124 L 68 114 L 106 108 L 130 60 L 140 54 L 250 54 L 260 58 L 274 76 L 282 98 L 290 108 L 326 112 L 348 130 L 366 156 L 376 170 L 384 178 L 384 186 L 54 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  // Ranger XP 1000 — 2-seat utility, cab + bed
  "polaris-ranger-xp-1000": {
    path: "M 44 178 L 44 138 L 50 126 L 58 116 L 96 110 L 120 60 L 132 54 L 228 54 L 236 58 L 244 72 L 248 90 L 248 98 L 340 98 L 370 100 L 392 116 L 404 142 L 410 164 L 414 178 L 414 186 L 44 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  // Ranger Crew XP 1000 — crew-cab utility, long cab + short bed
  "polaris-ranger-crew-xp-1000": {
    path: "M 22 178 L 22 136 L 28 124 L 36 112 L 78 106 L 106 56 L 118 50 L 290 50 L 298 54 L 308 68 L 312 86 L 312 96 L 366 96 L 392 98 L 406 114 L 414 138 L 418 160 L 420 178 L 420 186 L 22 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 308 152 m 26 0 A 26 26 0 1 0 282 152 A 26 26 0 1 0 334 152 Z",
    frontWheel: 112, rearWheel: 308,
  },
  // General XP 1000 — 2-seat utility, sport-utility crossover
  "polaris-general-xp-1000": {
    path: "M 48 178 L 48 138 L 54 126 L 62 116 L 100 110 L 124 62 L 136 56 L 234 56 L 242 60 L 250 74 L 254 92 L 254 100 L 320 100 L 348 102 L 370 118 L 384 142 L 392 164 L 396 178 L 396 186 L 48 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  // General XP 4 1000 — 4-seat utility, longer cab + bed
  "polaris-general-xp-4-1000": {
    path: "M 30 178 L 30 138 L 36 126 L 44 116 L 84 110 L 110 62 L 122 56 L 266 56 L 274 60 L 284 74 L 288 92 L 288 100 L 356 100 L 384 102 L 402 118 L 412 142 L 418 164 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  // Xpedition XP — 2-seat utility, adventure
  "polaris-xpedition-xp": {
    path: "M 38 178 L 38 136 L 44 124 L 52 114 L 92 108 L 118 58 L 130 52 L 238 52 L 246 56 L 256 72 L 260 90 L 260 98 L 348 98 L 376 100 L 396 116 L 408 142 L 414 164 L 418 178 L 418 186 L 38 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  // Xpedition XP 5 — 4-seat utility, extended adventure
  "polaris-xpedition-xp-5": {
    path: "M 22 178 L 22 136 L 28 124 L 36 114 L 78 108 L 106 58 L 118 52 L 278 52 L 286 56 L 296 72 L 300 90 L 300 98 L 366 98 L 392 100 L 408 116 L 416 140 L 420 162 L 420 178 L 420 186 L 22 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 112, rearWheel: 314,
  },

  // ── Can-Am (5) ───────────────────────────────────────────────────
  // Maverick X3 XRS Turbo RR — 2-seat sport, wide aggressive
  "canam-maverick-x3-xrs-turbo-rr": {
    path: "M 56 178 L 56 134 L 64 122 L 72 114 L 108 108 L 132 60 L 142 54 L 248 54 L 258 58 L 270 74 L 280 96 L 288 108 L 326 112 L 350 132 L 368 158 L 378 172 L 386 178 L 386 186 L 56 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  // Maverick R — 2-seat sport, newest, very low and wide
  "canam-maverick-r": {
    path: "M 52 178 L 52 132 L 60 120 L 68 112 L 106 106 L 130 58 L 140 52 L 254 52 L 264 56 L 278 74 L 286 96 L 294 106 L 332 110 L 356 130 L 374 156 L 384 172 L 392 178 L 392 186 L 52 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  // Defender HD9 — 2-seat utility, boxy workhorse
  "canam-defender-hd9": {
    path: "M 42 178 L 42 136 L 48 124 L 56 114 L 94 108 L 120 58 L 132 52 L 230 52 L 238 56 L 248 72 L 252 90 L 252 98 L 338 98 L 368 100 L 390 116 L 402 140 L 410 162 L 414 178 L 414 186 L 42 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  // Defender HD10 — 2-seat utility, slightly wider
  "canam-defender-hd10": {
    path: "M 38 178 L 38 136 L 44 124 L 52 114 L 92 108 L 118 58 L 130 52 L 234 52 L 242 56 L 252 72 L 256 90 L 256 98 L 344 98 L 374 100 L 394 116 L 406 142 L 414 164 L 418 178 L 418 186 L 38 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  // Defender MAX HD10 — 4-seat utility, extended crew
  "canam-defender-max-hd10": {
    path: "M 20 178 L 20 136 L 26 124 L 34 114 L 76 108 L 104 58 L 116 52 L 274 52 L 282 56 L 292 72 L 296 90 L 296 98 L 362 98 L 390 100 L 406 116 L 414 140 L 418 162 L 420 178 L 420 186 L 20 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 110, rearWheel: 314,
  },

  // ── Honda (4) ────────────────────────────────────────────────────
  // Pioneer 1000 — 2-seat utility, reliable workhorse
  "honda-pioneer-1000": {
    path: "M 46 178 L 46 138 L 52 126 L 60 116 L 98 110 L 124 60 L 136 54 L 230 54 L 238 58 L 248 74 L 252 92 L 252 100 L 332 100 L 362 102 L 384 118 L 396 142 L 404 164 L 408 178 L 408 186 L 46 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  // Pioneer 1000-5 — 4-seat utility, 5-passenger
  "honda-pioneer-1000-5": {
    path: "M 26 178 L 26 136 L 32 124 L 40 114 L 82 108 L 108 58 L 120 52 L 270 52 L 278 56 L 288 72 L 292 90 L 292 98 L 358 98 L 386 100 L 404 116 L 414 142 L 418 164 L 420 178 L 420 186 L 26 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  // Talon 1000R — 2-seat sport, narrow and tall
  "honda-talon-1000r": {
    path: "M 62 178 L 62 142 L 68 132 L 74 122 L 108 116 L 132 68 L 142 62 L 236 62 L 246 66 L 256 80 L 264 102 L 272 112 L 314 116 L 336 134 L 354 158 L 364 172 L 372 178 L 372 186 L 62 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  // Talon 1000X — 2-seat sport, wider live-valve
  "honda-talon-1000x": {
    path: "M 58 178 L 58 140 L 64 130 L 72 120 L 108 114 L 132 66 L 142 60 L 242 60 L 252 64 L 264 80 L 272 102 L 280 112 L 320 116 L 342 134 L 360 158 L 370 172 L 378 178 L 378 186 L 58 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },

  // ── Kawasaki (4) ─────────────────────────────────────────────────
  // Teryx KRX 1000 — 2-seat sport, boxy Kawasaki style
  "kawasaki-teryx-krx-1000": {
    path: "M 58 178 L 58 140 L 64 128 L 72 118 L 108 112 L 134 64 L 144 58 L 242 58 L 252 62 L 264 78 L 272 100 L 280 110 L 320 114 L 342 132 L 360 156 L 370 170 L 378 178 L 378 186 L 58 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  // Teryx KRX 1000 2026 — 2-seat sport, updated model
  "kawasaki-teryx-krx-1000-2026": {
    path: "M 56 178 L 56 138 L 62 126 L 70 116 L 108 110 L 134 62 L 144 56 L 246 56 L 256 60 L 268 76 L 278 98 L 286 108 L 326 112 L 350 132 L 368 158 L 378 172 L 388 178 L 388 186 L 56 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  // Teryx KRX4 1000 — 4-seat sport, long wheelbase
  "kawasaki-teryx-krx4-1000": {
    path: "M 42 178 L 42 140 L 48 128 L 56 118 L 96 112 L 122 64 L 132 58 L 264 58 L 274 62 L 286 78 L 294 100 L 302 110 L 340 114 L 362 132 L 380 156 L 390 170 L 400 178 L 400 186 L 42 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },
  // Mule PRO-FXT — crew-cab utility, biggest crew cab
  "kawasaki-mule-pro-fxt": {
    path: "M 16 178 L 16 134 L 22 122 L 30 110 L 74 104 L 102 54 L 114 48 L 298 48 L 306 52 L 316 66 L 320 84 L 320 94 L 370 94 L 396 96 L 410 112 L 416 136 L 420 160 L 420 178 L 420 186 L 16 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 112, rearWheel: 310,
  },

  // ── Yamaha (3) ───────────────────────────────────────────────────
  // YXZ1000R — 2-seat sport, pure sport compact
  "yamaha-yxz1000r": {
    path: "M 62 178 L 62 142 L 68 130 L 76 120 L 108 114 L 132 66 L 142 60 L 234 60 L 244 64 L 254 78 L 262 100 L 270 110 L 312 114 L 334 132 L 352 156 L 362 170 L 370 178 L 370 186 L 62 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  // Wolverine RMAX 1000 — 2-seat utility, adventure
  "yamaha-wolverine-rmax-1000": {
    path: "M 46 178 L 46 136 L 52 124 L 60 114 L 98 108 L 124 58 L 136 52 L 232 52 L 240 56 L 250 72 L 254 90 L 254 98 L 338 98 L 368 100 L 390 116 L 402 142 L 410 164 L 414 178 L 414 186 L 46 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  // Wolverine RMAX4 1000 — 4-seat utility
  "yamaha-wolverine-rmax4-1000": {
    path: "M 24 178 L 24 136 L 30 124 L 38 114 L 80 108 L 106 58 L 118 52 L 272 52 L 280 56 L 290 72 L 294 90 L 294 98 L 362 98 L 390 100 L 406 116 L 416 142 L 420 164 L 420 178 L 420 186 L 24 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },

  // ── CFMoto (3) ───────────────────────────────────────────────────
  // ZForce 950 — 2-seat sport
  "cfmoto-zforce-950": {
    path: "M 60 178 L 60 140 L 66 128 L 74 118 L 108 112 L 132 64 L 142 58 L 238 58 L 248 62 L 260 78 L 268 100 L 276 110 L 316 114 L 338 132 L 356 158 L 366 172 L 374 178 L 374 186 L 60 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  // UForce 1000 — 2-seat utility
  "cfmoto-uforce-1000": {
    path: "M 40 178 L 40 138 L 46 126 L 54 116 L 94 110 L 120 60 L 132 54 L 232 54 L 240 58 L 250 74 L 254 92 L 254 100 L 342 100 L 372 102 L 394 118 L 406 142 L 414 164 L 418 178 L 418 186 L 40 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  // UForce 1000 XL — 4-seat utility, extended
  "cfmoto-uforce-1000-xl": {
    path: "M 20 178 L 20 136 L 26 124 L 34 114 L 76 108 L 104 58 L 116 52 L 272 52 L 280 56 L 290 72 L 294 90 L 294 98 L 364 98 L 392 100 L 408 116 L 416 142 L 420 164 L 420 178 L 420 186 L 20 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 110, rearWheel: 316,
  },
};

// ─── Fallback generic body-type paths (for manual entry) ─────────────────
// Reuses representative per-model silhouettes for each body type.

const GENERIC_SILHOUETTES: Record<UTVBodyType, SilhouetteData> = {
  "2-seat-sport":    MODEL_SILHOUETTES["polaris-rzr-xp-1000"],
  "4-seat-sport":    MODEL_SILHOUETTES["kawasaki-teryx-krx4-1000"],
  "2-seat-utility":  MODEL_SILHOUETTES["polaris-ranger-xp-1000"],
  "4-seat-utility":  MODEL_SILHOUETTES["polaris-general-xp-4-1000"],
  "crew-cab-utility": MODEL_SILHOUETTES["kawasaki-mule-pro-fxt"],
};

// ─── Resolve silhouette: per-model > generic body type ───────────────────

function getSilhouette(machineId: string | undefined, bodyType: UTVBodyType): SilhouetteData {
  if (machineId && MODEL_SILHOUETTES[machineId]) return MODEL_SILHOUETTES[machineId];
  return GENERIC_SILHOUETTES[bodyType] || GENERIC_SILHOUETTES["2-seat-utility"];
}

// ─── Accessory layer positioning ─────────────────────────────────────────
// Sport: roof y=56-66, utility cab roof y=52-58, bed y=94-100
// Positions are relative to body-type proportions.

function RoofLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 132 : 140) : isCrew ? 114 : is4 ? 122 : 132;
  const w = isSport ? (is4 ? 132 : 98) : isCrew ? 184 : is4 ? 144 : 96;
  const y = isSport ? (is4 ? 56 : 58) : isCrew ? 46 : is4 ? 50 : 52;
  return <rect x={x} y={y} width={w} height={4} rx={2} fill="#777" opacity={0.7}><title>Roof</title></rect>;
}

function WindshieldLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const isCrew = bodyType === "crew-cab-utility";
  // Windshield line from hood to roof edge
  const x1 = isSport ? 108 : isCrew ? 78 : 96;
  const y1 = isSport ? 114 : isCrew ? 106 : 110;
  const x2 = isSport ? 134 : isCrew ? 106 : 122;
  const y2 = isSport ? 62 : isCrew ? 52 : 56;
  return (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#88CCEE" strokeWidth={2.5} opacity={0.6}>
      <title>Windshield</title>
    </line>
  );
}

function DoorsLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 122 : 134) : isCrew ? 106 : is4 ? 116 : 126;
  const w = isSport ? (is4 ? 140 : 100) : isCrew ? 184 : is4 ? 148 : 102;
  const y = isSport ? (is4 ? 62 : 64) : isCrew ? 54 : is4 ? 56 : 58;
  const h = isSport ? 78 : isCrew ? 88 : is4 ? 82 : 80;
  return (
    <rect x={x} y={y} width={w} height={h} rx={3} fill="none" stroke="#888" strokeWidth={1.5} opacity={0.5}>
      <title>Doors</title>
    </rect>
  );
}

function FrontBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 38 : 54) : isCrew ? 12 : is4 ? 26 : 38;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Front Bumper</title></rect>;
}

function RearBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 390 : 364) : isCrew ? 410 : is4 ? 410 : 402;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Rear Bumper</title></rect>;
}

function WinchLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 38 : 54) : isCrew ? 12 : is4 ? 26 : 38;
  return (
    <g>
      <rect x={x} y={138} width={12} height={10} rx={2} fill="#C45D2C" opacity={0.8}><title>Winch</title></rect>
      <line x1={x} y1={143} x2={x - 8} y2={143} stroke="#C45D2C" strokeWidth={1.5} />
    </g>
  );
}

function RackLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  // Rack sits in the bed area
  const x = isCrew ? 320 : is4 ? 290 : 254;
  const w = isCrew ? 46 : is4 ? 62 : 82;
  const y = isCrew ? 90 : is4 ? 94 : 94;
  return (
    <g>
      <rect x={x} y={y} width={w} height={3} rx={1} fill="#555" opacity={0.8}><title>Cargo Rack</title></rect>
      <rect x={x + 4} y={y + 3} width={3} height={5} fill="#555" opacity={0.6} />
      <rect x={x + w - 7} y={y + 3} width={3} height={5} fill="#555" opacity={0.6} />
    </g>
  );
}

function LightBarLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 150 : 160) : isCrew ? 140 : is4 ? 140 : 150;
  const w = isSport ? (is4 ? 100 : 80) : isCrew ? 130 : is4 ? 110 : 80;
  const y = isSport ? (is4 ? 54 : 56) : isCrew ? 44 : is4 ? 48 : 50;
  return <rect x={x} y={y} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}><title>Light Bar</title></rect>;
}

function RttLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  // RTT mounts on bed area, above the rack
  const x = isCrew ? 316 : is4 ? 286 : 250;
  const w = isCrew ? 54 : is4 ? 70 : 90;
  const y = isCrew ? 78 : is4 ? 82 : 82;
  return <rect x={x} y={y} width={w} height={12} rx={3} fill="#C45D2C" opacity={0.8}><title>Rooftop Tent</title></rect>;
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function RigRatedSvg({
  bodyType, machineId, showRoof, showWindshield, showDoors,
  showFrontBumper, showRearBumper, showWinch,
  showRack, showLightBar, showRtt, loadStatus,
}: RigRatedSvgProps) {
  const sil = getSilhouette(machineId, bodyType);

  const statusColor =
    loadStatus === "red" ? "#EF4444" :
    loadStatus === "orange" ? "#F97316" :
    loadStatus === "yellow" ? "#EAB308" :
    "#10B981";

  return (
    <div className="bg-muted border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Rig Visualization
        </span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: statusColor }} />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {loadStatus === "red" ? "Over Limit" :
             loadStatus === "orange" ? "Caution" :
             loadStatus === "yellow" ? "Near Margin" : "Good"}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 420 200" className="w-full max-w-lg mx-auto" role="img" aria-label={`${bodyType} UTV with accessories`}>
        {/* Ground line */}
        <line x1={10} y1={178} x2={410} y2={178} stroke="var(--border)" strokeWidth={1} />

        {/* Vehicle silhouette (evenodd with wheel cutouts) */}
        <path
          d={sil.path}
          fill="var(--card)"
          fillRule="evenodd"
          stroke={statusColor}
          strokeWidth={2.5}
          className="transition-colors duration-500"
        />

        {/* Wheels (drawn inside cutouts) */}
        {[sil.frontWheel, sil.rearWheel].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={152} r={24} fill="#222" stroke="#444" strokeWidth={2.5} />
            <circle cx={cx} cy={152} r={18} fill="none" stroke="#333" strokeWidth={1} />
            <circle cx={cx} cy={152} r={8} fill="#555" stroke="#666" strokeWidth={1} />
          </g>
        ))}

        {/* Accessory layers (bottom to top) */}
        {showDoors && <DoorsLayer bodyType={bodyType} />}
        {showFrontBumper && <FrontBumperLayer bodyType={bodyType} />}
        {showRearBumper && <RearBumperLayer bodyType={bodyType} />}
        {showWinch && <WinchLayer bodyType={bodyType} />}
        {showWindshield && <WindshieldLayer bodyType={bodyType} />}
        {showRoof && <RoofLayer bodyType={bodyType} />}
        {showRack && <RackLayer bodyType={bodyType} />}
        {showLightBar && <LightBarLayer bodyType={bodyType} />}
        {showRtt && <RttLayer bodyType={bodyType} />}
      </svg>
    </div>
  );
}
