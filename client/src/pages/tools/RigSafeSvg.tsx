
import type { BodyType } from "./vehicle-types";

interface RigSafeSvgProps {
  bodyType: BodyType;
  vehicleKey?: string;
  showTonneau: boolean;
  showRack: boolean;
  showTent: boolean;
  showAnnex: boolean;
  showAwning: boolean;
  awningSide: "driver" | "passenger" | "rear";
  annexSide: "driver" | "passenger" | "rear";
  loadStatus: "green" | "yellow" | "red";
  totalHeightIn: number;
  vehicleHeightIn: number;
}

// ─── Per-model silhouette paths (52 vehicles) ──────────────────────────────
// ViewBox: 0 0 420 200. Ground at y=178. Wheel cutouts via evenodd at y=152, r=26.
// All silhouettes share identical wheel geometry: front x=120, rear x=300.

const WHEEL_CUTOUT_FRONT = "M 120 152 m 26 0 A 26 26 0 1 0 94 152 A 26 26 0 1 0 146 152 Z";
const WHEEL_CUTOUT_REAR = "M 300 152 m 26 0 A 26 26 0 1 0 274 152 A 26 26 0 1 0 326 152 Z";

const MODEL_SILHOUETTES: Record<string, string> = {
  // ── CREW-CAB-SHORT (10) ────────────────────────────────────────────
  "toyota-tundra-sr5":
    "M 24 178 L 44 168 L 66 142 L 100 124 L 190 118 L 250 118 L 286 122 L 302 126 L 310 126 L 330 126 L 346 126 L 388 134 L 406 150 L 416 170 L 420 178 L 420 186 L 24 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-tundra-trd-pro":
    "M 22 178 L 42 168 L 64 140 L 102 122 L 194 116 L 252 116 L 292 122 L 312 128 L 338 128 L 392 136 L 410 154 L 418 172 L 420 178 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-f150-xlt":
    "M 26 178 L 46 168 L 70 142 L 106 124 L 196 118 L 256 118 L 292 122 L 306 126 L 340 126 L 392 134 L 410 150 L 418 170 L 420 178 L 420 186 L 26 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-f150-raptor":
    "M 22 178 L 42 166 L 66 138 L 110 120 L 202 114 L 262 114 L 304 120 L 328 128 L 356 128 L 398 136 L 414 154 L 420 174 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-silverado-1500-lt":
    "M 24 178 L 44 168 L 68 142 L 104 124 L 194 118 L 254 118 L 290 122 L 308 126 L 340 126 L 392 134 L 410 150 L 418 170 L 420 178 L 420 186 L 24 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-silverado-trail-boss":
    "M 22 178 L 42 166 L 66 140 L 106 122 L 198 116 L 260 116 L 304 122 L 332 130 L 362 130 L 402 138 L 416 156 L 420 174 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-silverado-zr2":
    "M 20 178 L 40 166 L 66 138 L 112 120 L 204 114 L 266 114 L 310 120 L 342 130 L 374 130 L 408 140 L 418 158 L 420 176 L 420 186 L 20 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-sierra-1500-sle":
    "M 26 178 L 46 168 L 70 142 L 108 124 L 198 118 L 258 118 L 294 122 L 312 126 L 344 126 L 394 134 L 410 150 L 418 170 L 420 178 L 420 186 L 26 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-sierra-1500-at4":
    "M 22 178 L 42 166 L 68 140 L 110 122 L 204 116 L 266 116 L 310 122 L 340 130 L 368 130 L 404 138 L 416 156 L 420 174 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-sierra-1500-at4x":
    "M 20 178 L 40 166 L 68 138 L 114 120 L 208 114 L 270 114 L 316 120 L 348 132 L 378 132 L 410 142 L 418 160 L 420 176 L 420 186 L 20 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── CREW-CAB-STANDARD (3) ─────────────────────────────────────────
  "ford-f250-xlt":
    "M 20 178 L 40 166 L 66 138 L 106 120 L 204 114 L 266 114 L 312 120 L 334 126 L 366 126 L 412 134 L 420 148 L 420 186 L 20 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-sierra-2500-hd":
    "M 18 178 L 38 166 L 66 138 L 110 120 L 210 114 L 274 114 L 322 120 L 348 128 L 382 128 L 416 136 L 420 150 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ram-2500":
    "M 18 178 L 36 166 L 64 138 L 110 120 L 214 114 L 278 114 L 328 120 L 356 130 L 394 130 L 418 140 L 420 154 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── MID-TRUCK (10) ────────────────────────────────────────────────
  "toyota-tacoma-trd-off-road":
    "M 34 178 L 54 168 L 80 144 L 114 126 L 190 120 L 238 120 L 268 124 L 286 128 L 304 128 L 366 134 L 398 148 L 412 168 L 420 178 L 420 186 L 34 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-tacoma-trd-pro":
    "M 32 178 L 52 166 L 80 142 L 118 124 L 196 118 L 244 118 L 278 122 L 306 130 L 332 130 L 388 138 L 410 154 L 418 172 L 420 178 L 420 186 L 32 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "jeep-gladiator-rubicon":
    "M 30 178 L 50 166 L 76 140 L 110 122 L 178 118 L 230 118 L 260 122 L 276 122 L 296 126 L 372 132 L 404 150 L 418 172 L 420 178 L 420 186 L 30 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-ranger":
    "M 34 178 L 54 168 L 80 144 L 114 126 L 192 120 L 240 120 L 270 124 L 288 128 L 306 128 L 368 134 L 400 148 L 414 168 L 420 178 L 420 186 L 34 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-maverick":
    "M 40 178 L 60 170 L 86 148 L 122 132 L 204 126 L 254 126 L 284 130 L 312 136 L 340 136 L 388 142 L 410 156 L 418 172 L 420 178 L 420 186 L 40 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-colorado-z71":
    "M 34 178 L 54 168 L 82 144 L 118 126 L 198 120 L 246 120 L 278 124 L 298 128 L 320 128 L 378 134 L 404 148 L 416 166 L 420 178 L 420 186 L 34 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-colorado-zr2":
    "M 30 178 L 50 166 L 80 142 L 122 124 L 204 118 L 254 118 L 290 122 L 322 132 L 350 132 L 396 140 L 414 156 L 420 172 L 420 186 L 30 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-canyon-at4":
    "M 32 178 L 52 166 L 80 142 L 120 124 L 202 118 L 252 118 L 288 122 L 318 132 L 346 132 L 392 140 L 412 156 L 420 172 L 420 186 L 32 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "rivian-r1t":
    "M 34 178 L 56 170 L 86 148 L 128 132 L 212 126 L 264 126 L 302 132 L 334 140 L 364 140 L 402 146 L 414 160 L 420 172 L 420 186 L 34 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "hyundai-santa-cruz":
    "M 42 178 L 64 170 L 94 150 L 134 136 L 216 132 L 266 132 L 302 138 L 332 146 L 358 146 L 398 152 L 412 166 L 420 176 L 420 186 L 42 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── SUV-5DOOR (16) ────────────────────────────────────────────────
  "toyota-4runner-trd-off-road":
    "M 28 178 L 50 168 L 76 142 L 112 124 L 206 116 L 270 116 L 312 124 L 342 130 L 374 134 L 404 150 L 418 170 L 420 178 L 420 186 L 28 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-4runner-trd-pro":
    "M 26 178 L 48 166 L 76 140 L 116 122 L 212 114 L 278 114 L 324 124 L 358 134 L 392 138 L 412 154 L 420 172 L 420 186 L 26 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-land-cruiser":
    "M 24 178 L 48 168 L 74 142 L 112 124 L 216 116 L 286 116 L 336 126 L 372 136 L 402 142 L 416 156 L 420 172 L 420 186 L 24 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-sequoia":
    "M 18 178 L 42 168 L 70 140 L 114 122 L 222 114 L 300 114 L 354 124 L 392 136 L 414 146 L 420 158 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "toyota-rav4-trd":
    "M 40 178 L 62 170 L 90 148 L 128 132 L 218 126 L 272 126 L 310 132 L 344 142 L 372 144 L 404 154 L 416 168 L 420 176 L 420 186 L 40 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "jeep-grand-cherokee-trailhawk":
    "M 28 178 L 52 168 L 80 144 L 120 126 L 224 120 L 290 120 L 336 128 L 370 140 L 398 148 L 414 162 L 420 174 L 420 186 L 28 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "jeep-grand-cherokee-l":
    "M 18 178 L 42 168 L 72 142 L 116 124 L 230 118 L 308 118 L 362 128 L 398 140 L 416 150 L 420 162 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-expedition":
    "M 14 178 L 38 168 L 68 140 L 116 122 L 238 114 L 320 114 L 378 124 L 412 138 L 420 152 L 420 186 L 14 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-tahoe-z71":
    "M 18 178 L 42 168 L 72 142 L 116 124 L 232 118 L 310 118 L 366 126 L 402 140 L 416 154 L 420 166 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-tahoe-rst":
    "M 20 178 L 44 170 L 74 146 L 116 130 L 234 124 L 312 124 L 368 132 L 404 144 L 418 158 L 420 170 L 420 186 L 20 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "chevy-suburban":
    "M 10 178 L 34 168 L 66 140 L 116 122 L 244 114 L 332 114 L 394 124 L 418 140 L 420 156 L 420 186 L 10 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "gmc-yukon":
    "M 18 178 L 42 168 L 72 142 L 116 124 L 234 118 L 312 118 L 368 126 L 404 140 L 418 154 L 420 166 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "lexus-gx-550":
    "M 22 178 L 46 168 L 74 142 L 116 124 L 226 118 L 300 118 L 352 126 L 388 138 L 410 152 L 420 170 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "lexus-gx-460":
    "M 24 178 L 48 168 L 76 142 L 116 124 L 224 118 L 296 118 L 346 126 L 380 138 L 404 154 L 414 170 L 420 178 L 420 186 L 24 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "land-rover-defender-110":
    "M 22 178 L 44 168 L 70 140 L 112 122 L 222 116 L 296 116 L 350 124 L 388 136 L 412 152 L 420 170 L 420 186 L 22 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── SUV-3DOOR (5) ─────────────────────────────────────────────────
  "jeep-wrangler-rubicon-2dr":
    "M 40 178 L 62 168 L 88 142 L 124 124 L 210 118 L 262 118 L 300 124 L 334 134 L 368 144 L 396 162 L 410 174 L 420 178 L 420 186 L 40 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "jeep-wrangler-unlimited-4dr":
    "M 28 178 L 50 168 L 76 142 L 114 124 L 222 118 L 290 118 L 336 126 L 372 140 L 404 154 L 416 170 L 420 178 L 420 186 L 28 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-bronco-base-2dr":
    "M 38 178 L 60 168 L 86 142 L 124 124 L 214 118 L 268 118 L 308 126 L 346 140 L 378 152 L 402 168 L 414 176 L 420 178 L 420 186 L 38 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-bronco-badlands-4dr":
    "M 26 178 L 48 168 L 76 142 L 116 124 L 226 118 L 296 118 L 346 128 L 386 144 L 410 160 L 418 172 L 420 178 L 420 186 L 26 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "land-rover-defender-90":
    "M 42 178 L 64 168 L 90 140 L 128 122 L 216 116 L 270 116 L 312 124 L 350 138 L 384 154 L 404 170 L 416 176 L 420 178 L 420 186 L 42 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── CROSSOVER (7) ─────────────────────────────────────────────────
  "ford-bronco-sport":
    "M 44 178 L 66 170 L 92 148 L 130 132 L 222 126 L 280 126 L 324 134 L 362 146 L 392 160 L 410 172 L 420 178 L 420 186 L 44 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "subaru-outback":
    "M 42 178 L 66 172 L 96 154 L 138 140 L 236 136 L 296 136 L 342 144 L 380 156 L 408 168 L 418 176 L 420 178 L 420 186 L 42 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "subaru-outback-wilderness":
    "M 40 178 L 64 170 L 96 150 L 140 136 L 240 132 L 302 132 L 350 140 L 390 154 L 414 168 L 420 176 L 420 186 L 40 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "subaru-forester":
    "M 46 178 L 68 170 L 94 148 L 132 132 L 226 126 L 286 126 L 332 134 L 370 146 L 400 160 L 414 172 L 420 178 L 420 186 L 46 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "subaru-crosstrek":
    "M 48 178 L 70 172 L 98 154 L 138 140 L 230 136 L 288 136 L 334 144 L 372 156 L 402 168 L 416 176 L 420 178 L 420 186 L 48 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "honda-passport-trailsport":
    "M 38 178 L 62 170 L 90 148 L 130 132 L 226 126 L 290 126 L 340 134 L 380 148 L 410 164 L 420 174 L 420 186 L 38 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "kia-telluride":
    "M 30 178 L 54 168 L 84 144 L 124 128 L 232 122 L 304 122 L 360 132 L 402 148 L 418 164 L 420 174 L 420 186 L 30 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,

  // ── VAN (2) ───────────────────────────────────────────────────────
  "mercedes-benz-sprinter":
    "M 16 178 L 34 164 L 56 140 L 92 124 L 216 116 L 330 116 L 398 122 L 418 132 L 420 144 L 420 186 L 16 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
  "ford-transit":
    "M 18 178 L 36 164 L 58 140 L 94 124 L 220 116 L 334 116 L 402 122 L 418 132 L 420 144 L 420 186 L 18 186 Z " + WHEEL_CUTOUT_FRONT + " " + WHEEL_CUTOUT_REAR,
};

// ─── Fallback generic body-type paths (for manual entry / unmapped vehicles) ─
// Same evenodd format with wheel cutouts so rendering is consistent.

const GENERIC_SILHOUETTES: Record<BodyType, string> = {
  "crew-cab-short":    MODEL_SILHOUETTES["chevy-silverado-1500-lt"],
  "crew-cab-standard": MODEL_SILHOUETTES["ford-f250-xlt"],
  "crew-cab-long":     MODEL_SILHOUETTES["gmc-sierra-2500-hd"],
  "mid-truck":         MODEL_SILHOUETTES["chevy-colorado-z71"],
  "suv-5door":         MODEL_SILHOUETTES["chevy-tahoe-z71"],
  "suv-3door":         MODEL_SILHOUETTES["jeep-wrangler-unlimited-4dr"],
  crossover:           MODEL_SILHOUETTES["subaru-outback"],
  van:                 MODEL_SILHOUETTES["ford-transit"],
};

// ─── Map database vehicle → silhouette key ──────────────────────────────────
// Uses make + model + trim keywords. Falls through to null for generic fallback.

export function vehicleToSilhouetteId(
  make: string, model: string, trim: string,
): string | undefined {
  const m = make.toLowerCase();
  const mod = model.toLowerCase();
  const t = trim.toLowerCase();

  // Toyota
  if (m === "toyota") {
    if (mod === "tundra") return t.includes("trd pro") ? "toyota-tundra-trd-pro" : "toyota-tundra-sr5";
    if (mod === "tacoma") return t.includes("trd pro") ? "toyota-tacoma-trd-pro" : "toyota-tacoma-trd-off-road";
    if (mod === "4runner") return t.includes("trd pro") ? "toyota-4runner-trd-pro" : "toyota-4runner-trd-off-road";
    if (mod === "land cruiser") return "toyota-land-cruiser";
    if (mod === "sequoia") return "toyota-sequoia";
    if (mod === "rav4") return "toyota-rav4-trd";
  }

  // Jeep
  if (m === "jeep") {
    if (mod === "wrangler") return t.includes("2-door") || t.includes("2dr") || t.includes("sport") ? "jeep-wrangler-rubicon-2dr" : "jeep-wrangler-unlimited-4dr";
    if (mod === "gladiator") return "jeep-gladiator-rubicon";
    if (mod === "grand cherokee l") return "jeep-grand-cherokee-l";
    if (mod === "grand cherokee") return "jeep-grand-cherokee-trailhawk";
  }

  // Ford
  if (m === "ford") {
    if (mod === "f-150") return t.includes("tremor") || t.includes("raptor") ? "ford-f150-raptor" : "ford-f150-xlt";
    if (mod === "f-250") return "ford-f250-xlt";
    if (mod === "ranger") return "ford-ranger";
    if (mod === "maverick") return "ford-maverick";
    if (mod === "bronco sport") return "ford-bronco-sport";
    if (mod === "bronco") return t.includes("2-door") || t.includes("2dr") || t.includes("base") ? "ford-bronco-base-2dr" : "ford-bronco-badlands-4dr";
    if (mod === "expedition") return "ford-expedition";
    if (mod === "transit") return "ford-transit";
  }

  // Chevrolet
  if (m === "chevrolet") {
    if (mod === "colorado") return t.includes("zr2") ? "chevy-colorado-zr2" : "chevy-colorado-z71";
    if (mod === "silverado 1500") return t.includes("zr2") ? "chevy-silverado-zr2" : t.includes("trail boss") ? "chevy-silverado-trail-boss" : "chevy-silverado-1500-lt";
    if (mod === "tahoe") return t.includes("rst") ? "chevy-tahoe-rst" : "chevy-tahoe-z71";
    if (mod === "suburban") return "chevy-suburban";
  }

  // GMC
  if (m === "gmc") {
    if (mod === "canyon") return "gmc-canyon-at4";
    if (mod === "sierra 1500") return t.includes("at4x") ? "gmc-sierra-1500-at4x" : t.includes("at4") ? "gmc-sierra-1500-at4" : "gmc-sierra-1500-sle";
    if (mod.includes("sierra 2500") || mod.includes("sierra 2500 hd")) return "gmc-sierra-2500-hd";
    if (mod === "yukon") return "gmc-yukon";
  }

  // Ram
  if (m === "ram") {
    if (mod === "2500") return "ram-2500";
  }

  // Land Rover
  if (m === "land rover") {
    if (mod === "defender") return t.includes("90") ? "land-rover-defender-90" : "land-rover-defender-110";
  }

  // Lexus
  if (m === "lexus") {
    if (mod === "gx") return t.includes("460") ? "lexus-gx-460" : "lexus-gx-550";
  }

  // Subaru
  if (m === "subaru") {
    if (mod === "outback") return t.includes("wilderness") ? "subaru-outback-wilderness" : "subaru-outback";
    if (mod === "forester") return "subaru-forester";
    if (mod === "crosstrek") return "subaru-crosstrek";
  }

  // Honda
  if (m === "honda") {
    if (mod === "passport") return "honda-passport-trailsport";
  }

  // Hyundai
  if (m === "hyundai") {
    if (mod === "santa cruz") return "hyundai-santa-cruz";
  }

  // Kia
  if (m === "kia") {
    if (mod === "telluride") return "kia-telluride";
  }

  // Rivian
  if (m === "rivian") {
    if (mod === "r1t") return "rivian-r1t";
  }

  // Mercedes
  if (m === "mercedes-benz") {
    if (mod === "sprinter") return "mercedes-benz-sprinter";
  }

  // Nissan — no specific silhouettes, fall through to generic
  return undefined;
}

// ─── Resolve silhouette: vehicleKey > generic body type ─────────────────────

function getSilhouette(vehicleKey: string | undefined, bodyType: BodyType): string {
  if (vehicleKey && MODEL_SILHOUETTES[vehicleKey]) return MODEL_SILHOUETTES[vehicleKey];
  return GENERIC_SILHOUETTES[bodyType] || GENERIC_SILHOUETTES["crew-cab-short"];
}

// ─── Body detail helpers (updated for new silhouette geometry) ───────────────

function getBedRange(bodyType: BodyType): { x: number; w: number } | null {
  switch (bodyType) {
    case "crew-cab-short":    return { x: 250, w: 130 };
    case "crew-cab-standard": return { x: 260, w: 140 };
    case "crew-cab-long":     return { x: 260, w: 150 };
    case "mid-truck":         return { x: 240, w: 120 };
    default: return null;
  }
}

function getRoofRange(bodyType: BodyType): { x: number; w: number; y: number } {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  if (isTruck) {
    const bed = getBedRange(bodyType)!;
    return { x: bed.x, w: bed.w, y: 118 };
  }
  switch (bodyType) {
    case "suv-5door":  return { x: 150, w: 220, y: 112 };
    case "suv-3door":  return { x: 160, w: 180, y: 116 };
    case "crossover":  return { x: 170, w: 170, y: 124 };
    case "van":        return { x: 140, w: 240, y: 114 };
    default:           return { x: 150, w: 220, y: 112 };
  }
}

// ─── Layer components ───────────────────────────────────────────────────

function TonneauLayer({ bodyType }: { bodyType: BodyType }) {
  const bed = getBedRange(bodyType);
  if (!bed) return null;
  return <rect x={bed.x} y={124} width={bed.w} height={4} rx={1} fill="#8B7355" opacity={0.7}><title>Tonneau Cover</title></rect>;
}

function RackLayer({ bodyType }: { bodyType: BodyType }) {
  const r = getRoofRange(bodyType);
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const y = isTruck ? 116 : r.y - 6;
  return (
    <g>
      <rect x={r.x} y={y} width={r.w} height={3} rx={1} fill="#555" opacity={0.8}><title>Rack</title></rect>
      <rect x={r.x + 5} y={y + 3} width={3} height={8} fill="#555" opacity={0.6} />
      <rect x={r.x + r.w - 8} y={y + 3} width={3} height={8} fill="#555" opacity={0.6} />
    </g>
  );
}

function TentLayer({ bodyType }: { bodyType: BodyType }) {
  const r = getRoofRange(bodyType);
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const y = isTruck ? 102 : r.y - 20;
  return <rect x={r.x + 5} y={y} width={r.w - 10} height={13} rx={3} fill="#C45D2C" opacity={0.8}><title>Rooftop Tent (closed)</title></rect>;
}

function AnnexLayer({ bodyType, side }: { bodyType: BodyType; side: string }) {
  const r = getRoofRange(bodyType);
  return (
    <rect x={r.x + r.w - 40} y={r.y - 10} width={35} height={75} rx={2}
      fill="none" stroke="#C45D2C" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5}>
      <title>Annex ({side} side)</title>
    </rect>
  );
}

function AwningLayer({ bodyType, side }: { bodyType: BodyType; side: string }) {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const startX = isTruck ? 80 : 85;
  const topY = isTruck ? 112 : 110;
  return (
    <g opacity={0.4}>
      <path d={`M ${startX + 50} ${topY} L ${startX + 50} 168 L ${startX - 10} 168 Z`} fill="#10B981" stroke="#10B981" strokeWidth={1}>
        <title>Awning ({side} side)</title>
      </path>
      <line x1={startX - 10} y1={168} x2={startX - 10} y2={178} stroke="#666" strokeWidth={2} />
    </g>
  );
}

// ─── Height dimension line ──────────────────────────────────────────────

function HeightDimension({ totalHeightIn }: { totalHeightIn: number }) {
  return (
    <g>
      <line x1={385} y1={80} x2={385} y2={178} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 2" />
      <line x1={380} y1={80} x2={390} y2={80} stroke="var(--muted)" strokeWidth={1} />
      <line x1={380} y1={178} x2={390} y2={178} stroke="var(--muted)" strokeWidth={1} />
      <text x={393} y={129} className="fill-muted-foreground" style={{ fontSize: 10 }} transform="rotate(90, 393, 129)" textAnchor="middle">
        {totalHeightIn > 0 ? `${totalHeightIn}"` : ""}
      </text>
    </g>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function RigSafeSvg({
  bodyType, vehicleKey, showTonneau, showRack, showTent, showAnnex, showAwning,
  awningSide, annexSide, loadStatus, totalHeightIn,
}: RigSafeSvgProps) {
  const bodyPath = getSilhouette(vehicleKey, bodyType);

  const statusColor =
    loadStatus === "red" ? "#EF4444" :
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
            {loadStatus === "red" ? "Over Limit" : loadStatus === "yellow" ? "Caution" : "Good"}
          </span>
        </div>
      </div>

      <svg viewBox="0 0 420 200" className="w-full max-w-lg mx-auto" role="img"
        aria-label={`${bodyType} vehicle with ${showTent ? "rooftop tent" : "no tent"}`}>

        {/* Ground line */}
        <line x1={10} y1={178} x2={410} y2={178} stroke="var(--border)" strokeWidth={1} />

        {/* Awning (behind body) */}
        {showAwning && <AwningLayer bodyType={bodyType} side={awningSide} />}

        {/* Vehicle silhouette (evenodd with wheel cutouts) */}
        <path
          d={bodyPath}
          fill="var(--card)"
          fillRule="evenodd"
          stroke={statusColor}
          strokeWidth={2.5}
          className="transition-colors duration-500"
        />

        {/* Wheels (drawn inside cutouts) */}
        {[120, 300].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={152} r={24} fill="#222" stroke="#444" strokeWidth={2.5} />
            <circle cx={cx} cy={152} r={18} fill="none" stroke="#333" strokeWidth={1} />
            <circle cx={cx} cy={152} r={8} fill="#555" stroke="#666" strokeWidth={1} />
          </g>
        ))}

        {/* Tonneau */}
        {showTonneau && <TonneauLayer bodyType={bodyType} />}

        {/* Rack */}
        {showRack && <RackLayer bodyType={bodyType} />}

        {/* Tent */}
        {showTent && <TentLayer bodyType={bodyType} />}

        {/* Annex */}
        {showAnnex && <AnnexLayer bodyType={bodyType} side={annexSide} />}

        {/* Height dimension */}
        {(showRack || showTent) && <HeightDimension totalHeightIn={totalHeightIn} />}
      </svg>
    </div>
  );
}
