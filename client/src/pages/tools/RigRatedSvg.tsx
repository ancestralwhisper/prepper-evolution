
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
// Silhouettes are type-accurate proportions (sport/utility/crew/expedition).

interface SilhouetteData {
  path: string;
  frontWheel: number;
  rearWheel: number;
}

const MODEL_SILHOUETTES: Record<string, SilhouetteData> = {
  // ── Polaris (10) ─────────────────────────────────────────────────
  "polaris-rzr-xp-1000": {
    path: "M 50 178 L 75 170 L 95 150 L 120 132 L 150 120 L 190 112 L 230 112 L 255 120 L 280 128 L 302 128 L 322 132 L 345 148 L 360 165 L 372 176 L 392 178 L 392 186 L 50 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 298 152 m 26 0 A 26 26 0 1 0 272 152 A 26 26 0 1 0 324 152 Z",
    frontWheel: 118, rearWheel: 298,
  },
  "polaris-rzr-turbo": {
    path: "M 46 178 L 72 169 L 92 145 L 120 126 L 158 112 L 210 106 L 248 108 L 274 118 L 295 122 L 312 122 L 336 130 L 360 150 L 378 172 L 396 178 L 396 186 L 46 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 118, rearWheel: 304,
  },
  "polaris-rzr-pro-xp": {
    path: "M 48 178 L 76 170 L 100 148 L 132 126 L 172 112 L 222 108 L 256 110 L 284 120 L 306 124 L 330 130 L 352 146 L 372 168 L 390 178 L 390 186 L 48 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "polaris-rzr-pro-r": {
    path: "M 44 178 L 72 168 L 98 142 L 136 120 L 186 106 L 238 104 L 272 110 L 302 122 L 330 128 L 354 144 L 378 170 L 398 178 L 398 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "polaris-ranger-xp-1000": {
    path: "M 38 178 L 60 168 L 82 142 L 110 126 L 160 120 L 210 120 L 240 126 L 260 126 L 300 124 L 350 132 L 386 146 L 404 170 L 412 178 L 412 186 L 38 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  "polaris-ranger-crew-xp-1000": {
    path: "M 26 178 L 50 168 L 76 140 L 110 124 L 190 118 L 250 118 L 290 124 L 320 124 L 360 130 L 396 144 L 414 168 L 420 178 L 420 186 L 26 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 308 152 m 26 0 A 26 26 0 1 0 282 152 A 26 26 0 1 0 334 152 Z",
    frontWheel: 112, rearWheel: 308,
  },
  "polaris-general-xp-1000": {
    path: "M 44 178 L 70 169 L 96 146 L 126 126 L 170 116 L 228 116 L 258 122 L 284 122 L 316 126 L 346 142 L 372 166 L 392 178 L 392 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "polaris-general-xp-4-1000": {
    path: "M 30 178 L 56 168 L 84 142 L 120 124 L 210 116 L 270 116 L 308 122 L 340 124 L 370 136 L 398 158 L 416 176 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  "polaris-xpedition-xp": {
    path: "M 34 178 L 58 168 L 80 142 L 112 124 L 182 116 L 236 116 L 268 124 L 298 128 L 338 128 L 374 140 L 402 162 L 416 178 L 416 186 L 34 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "polaris-xpedition-xp-5": {
    path: "M 22 178 L 48 168 L 74 140 L 110 122 L 210 114 L 270 114 L 308 122 L 340 128 L 376 132 L 404 150 L 418 170 L 420 178 L 420 186 L 22 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 112, rearWheel: 314,
  },

  // ── Can-Am (5) ───────────────────────────────────────────────────
  "can-am-maverick-x3": {
    path: "M 46 178 L 74 170 L 98 146 L 130 124 L 176 112 L 232 110 L 266 116 L 292 126 L 314 128 L 342 136 L 366 156 L 386 176 L 396 178 L 396 186 L 46 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "can-am-maverick-r": {
    path: "M 44 178 L 72 168 L 98 140 L 140 118 L 196 106 L 252 106 L 290 116 L 320 126 L 350 140 L 376 164 L 396 178 L 396 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  "can-am-defender-hd9": {
    path: "M 36 178 L 58 168 L 82 140 L 112 124 L 176 120 L 236 120 L 272 126 L 308 126 L 354 132 L 390 146 L 408 170 L 416 178 L 416 186 L 36 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  "can-am-defender-hd10": {
    path: "M 34 178 L 58 168 L 84 140 L 116 124 L 184 118 L 244 118 L 284 124 L 316 124 L 360 132 L 396 148 L 414 170 L 420 178 L 420 186 L 34 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "can-am-defender-max": {
    path: "M 22 178 L 48 168 L 76 140 L 114 122 L 210 116 L 276 116 L 318 124 L 350 128 L 382 134 L 408 152 L 418 170 L 420 178 L 420 186 L 22 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 314 152 m 26 0 A 26 26 0 1 0 288 152 A 26 26 0 1 0 340 152 Z",
    frontWheel: 110, rearWheel: 314,
  },

  // ── Honda (4) ────────────────────────────────────────────────────
  "honda-pioneer-1000": {
    path: "M 40 178 L 62 168 L 86 142 L 118 126 L 178 122 L 234 122 L 270 128 L 308 128 L 356 134 L 392 148 L 410 172 L 418 178 L 418 186 L 40 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z",
    frontWheel: 120, rearWheel: 300,
  },
  "honda-pioneer-1000-5": {
    path: "M 28 178 L 52 168 L 80 142 L 116 126 L 210 120 L 270 120 L 310 128 L 346 130 L 382 138 L 408 154 L 418 172 L 420 178 L 420 186 L 28 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  "honda-talon-1000r": {
    path: "M 52 178 L 78 170 L 102 148 L 130 128 L 172 114 L 224 112 L 256 118 L 286 126 L 314 128 L 342 138 L 366 156 L 386 176 L 396 178 L 396 186 L 52 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "honda-talon-1000x": {
    path: "M 50 178 L 76 170 L 102 148 L 134 126 L 180 114 L 232 112 L 264 118 L 292 126 L 318 130 L 346 142 L 370 162 L 388 176 L 398 178 L 398 186 L 50 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },

  // ── Kawasaki (4) ─────────────────────────────────────────────────
  "kawasaki-teryx-krx-1000": {
    path: "M 44 178 L 70 168 L 96 142 L 134 122 L 188 110 L 242 110 L 276 116 L 306 126 L 332 130 L 356 144 L 378 166 L 396 178 L 396 186 L 44 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 120, rearWheel: 306,
  },
  "kawasaki-teryx-krx-1000-2026": {
    path: "M 42 178 L 68 168 L 96 140 L 138 118 L 198 106 L 254 106 L 292 116 L 322 128 L 350 142 L 372 164 L 392 178 L 392 186 L 42 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 120, rearWheel: 310,
  },
  "kawasaki-teryx-krx4-1000": {
    path: "M 28 178 L 54 168 L 82 142 L 122 122 L 220 112 L 282 112 L 322 120 L 352 128 L 380 142 L 404 162 L 418 176 L 420 178 L 420 186 L 28 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },
  "kawasaki-mule-pro-fxt": {
    path: "M 30 178 L 52 168 L 76 140 L 106 124 L 186 120 L 252 120 L 294 126 L 330 126 L 372 134 L 404 150 L 418 172 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 112, rearWheel: 310,
  },

  // ── Yamaha (3) ───────────────────────────────────────────────────
  "yamaha-yxz1000r": {
    path: "M 54 178 L 80 170 L 104 148 L 134 128 L 178 114 L 230 112 L 262 118 L 292 126 L 318 128 L 346 138 L 370 156 L 390 176 L 398 178 L 398 186 L 54 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "yamaha-wolverine-rmax-1000": {
    path: "M 46 178 L 72 169 L 98 146 L 130 126 L 176 116 L 234 116 L 266 122 L 292 126 L 320 132 L 346 146 L 372 168 L 392 178 L 392 186 L 46 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "yamaha-wolverine-rmax4-1000": {
    path: "M 30 178 L 56 168 L 84 144 L 120 126 L 212 118 L 276 118 L 316 124 L 346 130 L 374 140 L 398 156 L 414 172 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 112, rearWheel: 316,
  },

  // ── CFMoto (3) ───────────────────────────────────────────────────
  "cfmoto-zforce-950": {
    path: "M 50 178 L 76 170 L 102 148 L 134 126 L 182 114 L 236 112 L 270 118 L 300 128 L 326 132 L 350 146 L 372 166 L 392 178 L 392 186 L 50 186 Z M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z M 304 152 m 26 0 A 26 26 0 1 0 278 152 A 26 26 0 1 0 330 152 Z",
    frontWheel: 120, rearWheel: 304,
  },
  "cfmoto-uforce-1000": {
    path: "M 36 178 L 58 168 L 84 140 L 116 124 L 190 120 L 250 120 L 288 126 L 322 126 L 366 132 L 398 146 L 414 168 L 420 178 L 420 186 L 36 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 306 152 m 26 0 A 26 26 0 1 0 280 152 A 26 26 0 1 0 332 152 Z",
    frontWheel: 118, rearWheel: 306,
  },
  "cfmoto-uforce-1000-xl": {
    path: "M 22 178 L 48 168 L 76 140 L 114 122 L 214 118 L 282 118 L 324 124 L 356 128 L 386 134 L 410 150 L 418 168 L 420 178 L 420 186 L 22 186 Z M 110 152 m 26 0 A 26 26 0 1 0 84 152 A 26 26 0 1 0 136 152 Z M 316 152 m 26 0 A 26 26 0 1 0 290 152 A 26 26 0 1 0 342 152 Z",
    frontWheel: 110, rearWheel: 316,
  },
};

// ─── Fallback generic body-type paths (for manual entry) ─────────────────
// Same evenodd format with wheel cutouts so rendering is consistent.

const GENERIC_SILHOUETTES: Record<UTVBodyType, SilhouetteData> = {
  "2-seat-sport": {
    path: "M 50 178 L 75 170 L 95 150 L 120 132 L 150 120 L 190 112 L 230 112 L 255 120 L 280 128 L 302 128 L 322 132 L 345 148 L 360 165 L 372 176 L 392 178 L 392 186 L 50 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 298 152 m 26 0 A 26 26 0 1 0 272 152 A 26 26 0 1 0 324 152 Z",
    frontWheel: 118, rearWheel: 298,
  },
  "4-seat-sport": {
    path: "M 30 178 L 56 168 L 84 142 L 120 124 L 210 116 L 270 116 L 308 122 L 340 124 L 370 136 L 398 158 L 416 176 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 312 152 m 26 0 A 26 26 0 1 0 286 152 A 26 26 0 1 0 338 152 Z",
    frontWheel: 112, rearWheel: 312,
  },
  "2-seat-utility": {
    path: "M 38 178 L 60 168 L 82 142 L 110 126 L 160 120 L 210 120 L 240 126 L 260 126 L 300 124 L 350 132 L 386 146 L 404 170 L 412 178 L 412 186 L 38 186 Z M 118 152 m 26 0 A 26 26 0 1 0 92 152 A 26 26 0 1 0 144 152 Z M 302 152 m 26 0 A 26 26 0 1 0 276 152 A 26 26 0 1 0 328 152 Z",
    frontWheel: 118, rearWheel: 302,
  },
  "4-seat-utility": {
    path: "M 26 178 L 50 168 L 76 140 L 110 124 L 190 118 L 250 118 L 290 124 L 320 124 L 360 130 L 396 144 L 414 168 L 420 178 L 420 186 L 26 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 308 152 m 26 0 A 26 26 0 1 0 282 152 A 26 26 0 1 0 334 152 Z",
    frontWheel: 112, rearWheel: 308,
  },
  "crew-cab-utility": {
    path: "M 30 178 L 52 168 L 76 140 L 106 124 L 186 120 L 252 120 L 294 126 L 330 126 L 372 134 L 404 150 L 418 172 L 420 178 L 420 186 L 30 186 Z M 112 152 m 26 0 A 26 26 0 1 0 86 152 A 26 26 0 1 0 138 152 Z M 310 152 m 26 0 A 26 26 0 1 0 284 152 A 26 26 0 1 0 336 152 Z",
    frontWheel: 112, rearWheel: 310,
  },
};

// ─── Resolve silhouette: per-model > generic body type ───────────────────

function getSilhouette(machineId: string | undefined, bodyType: UTVBodyType): SilhouetteData {
  if (machineId && MODEL_SILHOUETTES[machineId]) return MODEL_SILHOUETTES[machineId];
  return GENERIC_SILHOUETTES[bodyType] || GENERIC_SILHOUETTES["2-seat-utility"];
}

// ─── Accessory layer positioning (still driven by body type) ─────────────

function RoofLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 140 : 160) : isCrew ? 130 : is4 ? 140 : 150;
  const w = isSport ? (is4 ? 140 : 100) : isCrew ? 140 : is4 ? 120 : 100;
  return <rect x={x} y={100} width={w} height={4} rx={2} fill="#777" opacity={0.7}><title>Roof</title></rect>;
}

function WindshieldLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x1 = isSport ? (is4 ? 100 : 120) : isCrew ? 80 : is4 ? 86 : 100;
  const x2 = isSport ? (is4 ? 120 : 140) : isCrew ? 100 : is4 ? 106 : 120;
  return (
    <line x1={x1} y1={130} x2={x2} y2={102} stroke="#88CCEE" strokeWidth={2.5} opacity={0.6}>
      <title>Windshield</title>
    </line>
  );
}

function DoorsLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 130 : 148) : isCrew ? 110 : is4 ? 118 : 130;
  const w = isSport ? (is4 ? 90 : 60) : isCrew ? 130 : is4 ? 100 : 60;
  return (
    <rect x={x} y={108} width={w} height={isSport ? 42 : 40} rx={3} fill="none" stroke="#888" strokeWidth={1.5} opacity={0.5}>
      <title>Doors</title>
    </rect>
  );
}

function FrontBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 26 : 44) : isCrew ? 24 : is4 ? 22 : 32;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Front Bumper</title></rect>;
}

function RearBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 392 : 380) : isCrew ? 408 : is4 ? 406 : 398;
  return <rect x={x} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Rear Bumper</title></rect>;
}

function WinchLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 26 : 44) : isCrew ? 24 : is4 ? 22 : 32;
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
  const x = isCrew ? 270 : is4 ? 260 : 230;
  const w = isCrew ? 98 : is4 ? 100 : 110;
  return (
    <g>
      <rect x={x} y={114} width={w} height={3} rx={1} fill="#555" opacity={0.8}><title>Cargo Rack</title></rect>
      <rect x={x + 5} y={117} width={3} height={5} fill="#555" opacity={0.6} />
      <rect x={x + w - 8} y={117} width={3} height={5} fill="#555" opacity={0.6} />
    </g>
  );
}

function LightBarLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 170 : 180) : isCrew ? 160 : is4 ? 165 : 170;
  const w = isSport ? (is4 ? 80 : 60) : isCrew ? 80 : is4 ? 70 : 60;
  return <rect x={x} y={98} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}><title>Light Bar</title></rect>;
}

function RttLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  const x = isCrew ? 272 : is4 ? 264 : 234;
  const w = isCrew ? 90 : is4 ? 92 : 100;
  return <rect x={x} y={96} width={w} height={12} rx={3} fill="#C45D2C" opacity={0.8}><title>Rooftop Tent</title></rect>;
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
