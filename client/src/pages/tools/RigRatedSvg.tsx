
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
// Silhouettes have proper tall UTV proportions — roofs at y=48-68.

interface SilhouetteData {
  path: string;
  frontWheel: number;
  rearWheel: number;
}

const MODEL_SILHOUETTES: Record<string, SilhouetteData> = {
  // ── Polaris (10) ─────────────────────────────────────────────────
  "polaris-rzr-xp-1000": {
    path: "M 50 178 L 62 170 L 78 148 L 96 120 L 110 96 L 128 78 L 148 66 L 180 62 L 220 62 L 250 64 L 272 72 L 288 86 L 302 104 L 318 126 L 338 148 L 356 166 L 370 176 L 392 178 L 392 186 L 50 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 298 152 m 26 0 A 26 26 0 1 0 272 152 A 26 26 0 1 0 324 152 Z",
    frontWheel: 118, rearWheel: 298,
  },
  "polaris-rzr-xp-turbo-r": {
    path: "M 46 178 L 60 170 L 78 148 L 98 120 L 114 94 L 134 76 L 156 64 L 190 60 L 230 60 L 258 62 L 282 70 L 300 86 L 314 104 L 330 126 L 348 148 L 364 166 L 378 176 L 398 178 L 398 186 L 46 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 118, rearWheel: 304,
  },
  "polaris-rzr-pro-xp": {
    path: "M 48 178 L 62 170 L 82 148 L 102 120 L 118 94 L 140 74 L 164 62 L 198 60 L 238 60 L 266 62 L 290 70 L 308 86 L 324 108 L 340 130 L 356 150 L 372 168 L 386 176 L 392 178 L 392 186 L 48 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "polaris-rzr-pro-r": {
    path: "M 44 178 L 58 170 L 80 146 L 104 116 L 122 90 L 146 70 L 174 60 L 210 58 L 250 58 L 280 60 L 306 70 L 326 88 L 340 110 L 354 132 L 368 152 L 384 170 L 396 178 L 396 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "polaris-ranger-xp-1000": {
    path: "M 38 178 L 52 168 L 68 142 L 86 118 L 100 96 L 118 78 L 148 60 L 190 56 L 220 56 L 238 58 L 248 64 L 252 78 L 252 90 L 300 90 L 340 90 L 370 92 L 390 102 L 404 126 L 412 154 L 416 172 L 420 178 L 420 186 L 38 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  "polaris-ranger-crew-xp-1000": {
    path: "M 22 178 L 38 168 L 58 142 L 80 118 L 98 94 L 120 74 L 150 56 L 210 52 L 262 52 L 292 54 L 308 60 L 316 74 L 316 90 L 346 90 L 374 90 L 396 94 L 408 104 L 416 126 L 420 150 L 420 178 L 420 186 L 22 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 308 152 m 26 0 A 26 26 0 1 0 282 152 A 26 26 0 1 0 334 152 Z",
    frontWheel: 112, rearWheel: 308,
  },
  "polaris-general-xp-1000": {
    path: "M 40 178 L 54 168 L 72 144 L 92 120 L 108 98 L 128 78 L 156 60 L 198 56 L 232 56 L 252 58 L 264 64 L 270 76 L 272 90 L 286 94 L 294 98 L 304 102 L 320 110 L 338 124 L 356 146 L 372 166 L 388 176 L 392 178 L 392 186 L 40 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "polaris-general-xp-4-1000": {
    path: "M 24 178 L 40 168 L 60 142 L 84 118 L 104 94 L 128 72 L 160 54 L 232 50 L 286 50 L 318 52 L 336 58 L 346 72 L 346 90 L 358 92 L 370 94 L 386 100 L 402 114 L 414 136 L 420 162 L 420 178 L 420 186 L 24 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  "polaris-xpedition-xp": {
    path: "M 28 178 L 44 168 L 64 142 L 86 116 L 104 92 L 128 72 L 162 56 L 214 54 L 252 54 L 276 56 L 292 62 L 302 76 L 304 92 L 304 104 L 332 104 L 356 104 L 382 106 L 402 114 L 414 132 L 420 156 L 420 178 L 420 186 L 28 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "polaris-xpedition-xp-5": {
    path: "M 14 178 L 32 168 L 54 142 L 78 116 L 100 92 L 128 70 L 166 52 L 248 48 L 308 48 L 344 50 L 364 56 L 376 70 L 378 90 L 378 110 L 396 110 L 410 114 L 418 126 L 420 146 L 420 178 L 420 186 L 14 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 112, rearWheel: 314,
  },

  // ── Can-Am (5) ───────────────────────────────────────────────────
  "canam-maverick-x3-xrs-turbo-rr": {
    path: "M 48 178 L 62 170 L 82 148 L 104 120 L 120 94 L 142 74 L 166 62 L 200 60 L 238 60 L 266 62 L 292 70 L 314 86 L 332 110 L 346 132 L 360 152 L 374 170 L 390 178 L 390 186 L 48 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "canam-maverick-r": {
    path: "M 46 178 L 60 170 L 84 146 L 110 116 L 130 88 L 156 66 L 186 58 L 222 56 L 260 56 L 292 58 L 320 68 L 342 88 L 356 112 L 368 134 L 380 154 L 394 172 L 404 178 L 404 186 L 46 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  "canam-defender-hd9": {
    path: "M 30 178 L 46 168 L 66 142 L 86 118 L 102 96 L 122 76 L 150 58 L 196 54 L 232 54 L 258 56 L 276 62 L 288 76 L 290 92 L 290 104 L 312 104 L 338 104 L 364 106 L 386 114 L 404 132 L 414 156 L 420 178 L 420 186 L 30 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  "canam-defender-hd10": {
    path: "M 28 178 L 44 168 L 64 142 L 86 118 L 104 94 L 126 74 L 156 56 L 204 54 L 242 54 L 270 56 L 290 62 L 304 76 L 306 94 L 306 106 L 332 106 L 356 106 L 382 108 L 402 116 L 414 136 L 420 160 L 420 178 L 420 186 L 28 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "canam-defender-max-hd10": {
    path: "M 14 178 L 32 168 L 54 142 L 78 116 L 100 92 L 128 70 L 166 52 L 240 50 L 294 50 L 328 52 L 350 58 L 364 72 L 366 92 L 366 108 L 378 108 L 394 110 L 408 118 L 416 134 L 420 154 L 420 178 L 420 186 L 14 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 110, rearWheel: 314,
  },

  // ── Honda (4) ────────────────────────────────────────────────────
  "honda-pioneer-1000": {
    path: "M 34 178 L 50 168 L 70 142 L 90 118 L 106 96 L 126 76 L 154 58 L 198 54 L 232 54 L 256 56 L 272 62 L 282 76 L 284 92 L 284 104 L 304 104 L 332 104 L 358 106 L 384 114 L 404 132 L 414 156 L 420 178 L 420 186 L 34 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "honda-pioneer-1000-5": {
    path: "M 18 178 L 36 168 L 58 142 L 82 118 L 104 94 L 130 72 L 164 54 L 236 50 L 290 50 L 322 52 L 342 58 L 354 72 L 356 92 L 356 108 L 372 108 L 388 110 L 404 118 L 414 136 L 420 160 L 420 178 L 420 186 L 18 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  "honda-talon-1000r": {
    path: "M 52 178 L 64 170 L 84 148 L 104 120 L 120 96 L 140 78 L 162 66 L 194 62 L 230 62 L 258 64 L 282 72 L 300 86 L 316 108 L 332 130 L 348 150 L 366 170 L 386 178 L 386 186 L 52 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "honda-talon-1000x": {
    path: "M 50 178 L 62 170 L 84 148 L 108 120 L 126 94 L 148 76 L 172 64 L 206 60 L 244 60 L 272 62 L 296 70 L 316 86 L 334 110 L 348 132 L 362 152 L 380 172 L 398 178 L 398 186 L 50 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },

  // ── Kawasaki (4) ─────────────────────────────────────────────────
  "kawasaki-teryx-krx-1000": {
    path: "M 44 178 L 58 170 L 80 146 L 104 118 L 124 90 L 150 68 L 180 60 L 216 58 L 252 58 L 282 60 L 308 70 L 330 90 L 346 114 L 360 136 L 372 156 L 386 172 L 398 178 L 398 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "kawasaki-teryx-krx-1000-2026": {
    path: "M 42 178 L 56 170 L 80 146 L 108 116 L 130 88 L 158 66 L 190 58 L 228 56 L 266 56 L 298 58 L 326 68 L 348 88 L 362 112 L 374 134 L 386 154 L 398 172 L 408 178 L 408 186 L 42 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  "kawasaki-teryx-krx4-1000": {
    path: "M 16 178 L 34 168 L 56 142 L 82 118 L 106 94 L 136 70 L 176 54 L 252 50 L 308 50 L 344 52 L 366 58 L 378 72 L 380 92 L 380 110 L 396 110 L 410 114 L 418 126 L 420 146 L 420 178 L 420 186 L 16 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },
  "kawasaki-mule-pro-fxt": {
    path: "M 10 178 L 28 168 L 50 142 L 74 116 L 98 92 L 128 70 L 170 52 L 258 48 L 320 48 L 356 50 L 378 56 L 392 70 L 394 92 L 394 112 L 404 112 L 414 116 L 418 128 L 420 148 L 420 178 L 420 186 L 10 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 112, rearWheel: 310,
  },

  // ── Yamaha (3) ───────────────────────────────────────────────────
  "yamaha-yxz1000r": {
    path: "M 54 178 L 66 170 L 86 148 L 108 120 L 124 96 L 144 78 L 166 66 L 198 62 L 234 62 L 262 64 L 286 72 L 306 88 L 322 110 L 338 132 L 354 152 L 372 172 L 392 178 L 392 186 L 54 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "yamaha-wolverine-rmax-1000": {
    path: "M 40 178 L 54 168 L 74 144 L 96 120 L 114 96 L 136 76 L 166 58 L 212 54 L 246 54 L 270 56 L 286 62 L 296 74 L 298 90 L 300 104 L 322 104 L 348 104 L 374 106 L 396 114 L 412 132 L 420 156 L 420 178 L 420 186 L 40 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "yamaha-wolverine-rmax4-1000": {
    path: "M 18 178 L 36 168 L 58 142 L 82 118 L 104 94 L 132 72 L 168 54 L 244 50 L 300 50 L 334 52 L 356 58 L 370 72 L 372 92 L 372 108 L 386 108 L 402 110 L 414 118 L 418 134 L 420 154 L 420 178 L 420 186 L 18 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },

  // ── CFMoto (3) ───────────────────────────────────────────────────
  "cfmoto-zforce-950": {
    path: "M 50 178 L 62 170 L 84 148 L 108 120 L 126 94 L 148 74 L 172 62 L 206 60 L 244 60 L 272 62 L 296 70 L 316 86 L 332 108 L 346 130 L 360 150 L 378 170 L 396 178 L 396 186 L 50 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "cfmoto-uforce-1000": {
    path: "M 32 178 L 48 168 L 68 142 L 90 118 L 108 94 L 130 74 L 160 56 L 208 54 L 244 54 L 270 56 L 288 62 L 300 76 L 302 94 L 302 106 L 328 106 L 354 106 L 380 108 L 402 116 L 414 136 L 420 160 L 420 178 L 420 186 L 32 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "cfmoto-uforce-1000-xl": {
    path: "M 12 178 L 30 168 L 52 142 L 78 118 L 102 94 L 132 70 L 172 52 L 246 50 L 304 50 L 338 52 L 360 58 L 374 72 L 376 92 L 376 110 L 392 110 L 408 114 L 418 128 L 420 148 L 420 178 L 420 186 L 12 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 110, rearWheel: 316,
  },
};

// ─── Fallback generic body-type paths (for manual entry) ─────────────────
// Reuses representative per-model silhouettes for each body type.

const GENERIC_SILHOUETTES: Record<UTVBodyType, SilhouetteData> = {
  "2-seat-sport":    MODEL_SILHOUETTES["polaris-rzr-xp-1000"],
  "4-seat-sport":    MODEL_SILHOUETTES["polaris-general-xp-4-1000"],
  "2-seat-utility":  MODEL_SILHOUETTES["polaris-ranger-xp-1000"],
  "4-seat-utility":  MODEL_SILHOUETTES["polaris-ranger-crew-xp-1000"],
  "crew-cab-utility": MODEL_SILHOUETTES["kawasaki-mule-pro-fxt"],
};

// ─── Resolve silhouette: per-model > generic body type ───────────────────

function getSilhouette(machineId: string | undefined, bodyType: UTVBodyType): SilhouetteData {
  if (machineId && MODEL_SILHOUETTES[machineId]) return MODEL_SILHOUETTES[machineId];
  return GENERIC_SILHOUETTES[bodyType] || GENERIC_SILHOUETTES["2-seat-utility"];
}

// ─── Accessory layer positioning (adjusted for tall silhouettes) ─────────
// Sport roofs at y=58-66, utility roofs at y=48-56, beds at y=90-112.

function RoofLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 160 : 170) : isCrew ? 170 : is4 ? 150 : 160;
  const w = isSport ? (is4 ? 120 : 80) : isCrew ? 160 : is4 ? 130 : 90;
  const y = isSport ? (is4 ? 48 : 58) : isCrew ? 44 : is4 ? 48 : 52;
  return <rect x={x} y={y} width={w} height={4} rx={2} fill="#777" opacity={0.7}><title>Roof</title></rect>;
}

function WindshieldLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x1 = isSport ? (is4 ? 100 : 110) : isCrew ? 90 : is4 ? 92 : 100;
  const y1 = isSport ? 100 : isCrew ? 88 : 92;
  const x2 = isSport ? (is4 ? 130 : 140) : isCrew ? 120 : is4 ? 122 : 130;
  const y2 = isSport ? (is4 ? 54 : 62) : isCrew ? 50 : is4 ? 54 : 56;
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
  const x = isSport ? (is4 ? 130 : 145) : isCrew ? 120 : is4 ? 125 : 135;
  const w = isSport ? (is4 ? 100 : 70) : isCrew ? 150 : is4 ? 120 : 80;
  const y = isSport ? (is4 ? 56 : 66) : isCrew ? 52 : is4 ? 56 : 60;
  const h = isSport ? 70 : isCrew ? 80 : is4 ? 75 : 70;
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
  const x = isSport ? (is4 ? 20 : 42) : isCrew ? 6 : is4 ? 18 : 30;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Front Bumper</title></rect>;
}

function RearBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 400 : 380) : isCrew ? 408 : is4 ? 406 : 400;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Rear Bumper</title></rect>;
}

function WinchLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 20 : 42) : isCrew ? 6 : is4 ? 18 : 30;
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
  const x = isCrew ? 370 : is4 ? 330 : 270;
  const w = isCrew ? 30 : is4 ? 50 : 80;
  const y = isCrew ? 104 : is4 ? 84 : 84;
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
  const x = isSport ? (is4 ? 180 : 180) : isCrew ? 200 : is4 ? 180 : 180;
  const w = isSport ? (is4 ? 80 : 60) : isCrew ? 100 : is4 ? 80 : 60;
  const y = isSport ? (is4 ? 46 : 56) : isCrew ? 42 : is4 ? 46 : 50;
  return <rect x={x} y={y} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}><title>Light Bar</title></rect>;
}

function RttLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  const x = isCrew ? 366 : is4 ? 326 : 266;
  const w = isCrew ? 38 : is4 ? 58 : 86;
  const y = isCrew ? 92 : is4 ? 72 : 72;
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
