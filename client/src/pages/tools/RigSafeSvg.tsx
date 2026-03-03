
import type { BodyType } from "./vehicle-types";

interface RigSafeSvgProps {
  bodyType: BodyType;
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

// ─── Side-profile SVG paths for 8 body types ────────────────────────
// Viewbox: 0 0 420 200. Ground at y=178.
// Trucks have cab + bed separation. SUVs have continuous roofline.
// All paths include wheel-well arches.

const BODY_PATHS: Record<BodyType, string> = {
  "crew-cab-short":
    // Full-size crew cab, short bed (F-150, Sierra, Silverado)
    // Front wheel 95, rear 290
    "M 50 152 L 48 120 L 52 105 L 62 88 L 78 76 L 92 72 L 178 72 L 184 72 L 186 84 L 310 84 L 318 86 L 325 100 L 330 120 L 335 152 L 308 152 A 18 12 0 0 1 272 152 L 113 152 A 18 12 0 0 1 77 152 Z",

  "crew-cab-standard":
    // Full-size crew cab, standard bed (Super Duty, HD)
    // Front wheel 90, rear 300
    "M 45 152 L 43 120 L 47 105 L 57 88 L 73 76 L 87 72 L 173 72 L 179 72 L 181 84 L 335 84 L 342 86 L 348 100 L 352 120 L 355 152 L 318 152 A 18 12 0 0 1 282 152 L 108 152 A 18 12 0 0 1 72 152 Z",

  "crew-cab-long":
    // Crew cab, 8-foot bed (heavy duty)
    // Front wheel 85, rear 310
    "M 40 152 L 38 120 L 42 105 L 52 88 L 68 76 L 82 72 L 162 72 L 168 72 L 170 84 L 355 84 L 360 86 L 364 100 L 367 120 L 370 152 L 328 152 A 18 12 0 0 1 292 152 L 103 152 A 18 12 0 0 1 67 152 Z",

  "mid-truck":
    // Mid-size truck (Tacoma, Ranger, Canyon, Gladiator)
    // Front wheel 100, rear 280
    "M 60 152 L 58 122 L 62 108 L 72 92 L 86 80 L 100 76 L 178 76 L 184 76 L 186 88 L 298 88 L 304 90 L 308 104 L 312 122 L 318 152 L 298 152 A 18 12 0 0 1 262 152 L 118 152 A 18 12 0 0 1 82 152 Z",

  "suv-5door":
    // Full-size 5-door SUV (4Runner, Tahoe, Expedition, Defender 110)
    // Front wheel 100, rear 280 — continuous roofline
    "M 55 152 L 52 118 L 56 102 L 66 86 L 82 76 L 96 72 L 175 72 Q 185 70 300 70 L 308 72 L 315 82 L 322 100 L 328 118 L 332 152 L 298 152 A 18 12 0 0 1 262 152 L 118 152 A 18 12 0 0 1 82 152 Z",

  "suv-3door":
    // Shorter SUV (Bronco, Wrangler 4-door, Defender 90)
    // Front wheel 108, rear 268
    "M 65 152 L 62 118 L 67 105 L 76 90 L 90 80 L 104 76 L 175 76 Q 185 74 265 74 L 272 76 L 278 88 L 286 105 L 290 118 L 295 152 L 286 152 A 18 12 0 0 1 250 152 L 126 152 A 18 12 0 0 1 90 152 Z",

  crossover:
    // Compact crossover (Outback, Forester, RAV4, Crosstrek)
    // Front wheel 110, rear 268
    "M 70 152 L 68 122 L 72 110 L 80 96 L 94 86 L 108 82 L 172 82 Q 182 80 268 80 L 274 82 L 280 92 L 286 108 L 290 122 L 294 152 L 282 152 A 14 10 0 0 1 254 152 L 124 152 A 14 10 0 0 1 96 152 Z",

  van:
    // Cargo/camper van (Transit, Sprinter, Promaster)
    // Front wheel 120, rear 310
    "M 55 152 L 52 60 Q 55 48 70 46 L 140 46 L 148 48 L 155 62 L 160 80 L 345 80 L 348 82 L 350 90 L 352 152 L 328 152 A 18 12 0 0 1 292 152 L 138 152 A 18 12 0 0 1 102 152 Z",
};

// ─── Wheel positions ────────────────────────────────────────────────────

function getWheels(bodyType: BodyType) {
  switch (bodyType) {
    case "crew-cab-short":    return { front: 95,  rear: 290, y: 162, r: 16 };
    case "crew-cab-standard": return { front: 90,  rear: 300, y: 162, r: 16 };
    case "crew-cab-long":     return { front: 85,  rear: 310, y: 162, r: 16 };
    case "mid-truck":         return { front: 100, rear: 280, y: 162, r: 16 };
    case "suv-5door":         return { front: 100, rear: 280, y: 162, r: 16 };
    case "suv-3door":         return { front: 108, rear: 268, y: 162, r: 16 };
    case "crossover":         return { front: 110, rear: 268, y: 164, r: 14 };
    case "van":               return { front: 120, rear: 310, y: 162, r: 16 };
  }
}

// ─── Body detail helpers ────────────────────────────────────────────────

function getBedRange(bodyType: BodyType): { x: number; w: number } | null {
  switch (bodyType) {
    case "crew-cab-short":    return { x: 188, w: 120 };
    case "crew-cab-standard": return { x: 183, w: 148 };
    case "crew-cab-long":     return { x: 172, w: 180 };
    case "mid-truck":         return { x: 188, w: 108 };
    default: return null;
  }
}

function getRoofRange(bodyType: BodyType): { x: number; w: number; y: number } {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  if (isTruck) {
    const bed = getBedRange(bodyType)!;
    return { x: bed.x, w: bed.w, y: 76 };
  }
  switch (bodyType) {
    case "suv-5door":  return { x: 100, w: 200, y: 64 };
    case "suv-3door":  return { x: 108, w: 155, y: 68 };
    case "crossover":  return { x: 115, w: 150, y: 74 };
    case "van":        return { x: 160, w: 180, y: 74 };
    default:           return { x: 100, w: 200, y: 64 };
  }
}

// ─── Layer components ───────────────────────────────────────────────────

function TonneauLayer({ bodyType }: { bodyType: BodyType }) {
  const bed = getBedRange(bodyType);
  if (!bed) return null;
  return <rect x={bed.x} y={82} width={bed.w} height={4} rx={1} fill="#8B7355" opacity={0.7}><title>Tonneau Cover</title></rect>;
}

function RackLayer({ bodyType }: { bodyType: BodyType }) {
  const r = getRoofRange(bodyType);
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const y = isTruck ? 76 : r.y - 6;
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
  const y = isTruck ? 62 : r.y - 20;
  return <rect x={r.x + 5} y={y} width={r.w - 10} height={13} rx={3} fill="#C45D2C" opacity={0.8}><title>Rooftop Tent (closed)</title></rect>;
}

function AnnexLayer({ bodyType, side }: { bodyType: BodyType; side: string }) {
  const r = getRoofRange(bodyType);
  return (
    <rect x={r.x + r.w - 40} y={r.y - 10} width={35} height={95} rx={2}
      fill="none" stroke="#C45D2C" strokeWidth={1.5} strokeDasharray="4 3" opacity={0.5}>
      <title>Annex ({side} side)</title>
    </rect>
  );
}

function AwningLayer({ bodyType, side }: { bodyType: BodyType; side: string }) {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const startX = isTruck ? 60 : 65;
  const topY = isTruck ? 70 : 68;
  return (
    <g opacity={0.4}>
      <path d={`M ${startX + 50} ${topY} L ${startX + 50} 148 L ${startX - 10} 148 Z`} fill="#10B981" stroke="#10B981" strokeWidth={1}>
        <title>Awning ({side} side)</title>
      </path>
      <line x1={startX - 10} y1={148} x2={startX - 10} y2={162} stroke="#666" strokeWidth={2} />
    </g>
  );
}

// ─── Height dimension line ──────────────────────────────────────────────

function HeightDimension({ totalHeightIn }: { totalHeightIn: number }) {
  return (
    <g>
      <line x1={385} y1={40} x2={385} y2={162} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 2" />
      <line x1={380} y1={40} x2={390} y2={40} stroke="var(--muted)" strokeWidth={1} />
      <line x1={380} y1={162} x2={390} y2={162} stroke="var(--muted)" strokeWidth={1} />
      <text x={393} y={101} className="fill-muted-foreground" style={{ fontSize: 10 }} transform="rotate(90, 393, 101)" textAnchor="middle">
        {totalHeightIn > 0 ? `${totalHeightIn}"` : ""}
      </text>
    </g>
  );
}

// ─── Main Component ────────────────────────────────────────────────────

export default function RigSafeSvg({
  bodyType, showTonneau, showRack, showTent, showAnnex, showAwning,
  awningSide, annexSide, loadStatus, totalHeightIn,
}: RigSafeSvgProps) {
  const bodyPath = BODY_PATHS[bodyType] || BODY_PATHS["crew-cab-short"];
  const wheels = getWheels(bodyType);
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const isVan = bodyType === "van";

  const statusColor =
    loadStatus === "red" ? "#EF4444" :
    loadStatus === "yellow" ? "#EAB308" :
    "#10B981";

  // Headlight / taillight positions
  const hlX = isVan ? 58 : isTruck ? 52 : 58;
  const hlY = isVan ? 65 : 108;
  const tlX = isVan ? 350 : isTruck ? (bodyType === "crew-cab-long" ? 366 : bodyType === "crew-cab-standard" ? 352 : 332) : bodyType === "suv-5door" ? 328 : bodyType === "suv-3door" ? 290 : bodyType === "crossover" ? 290 : 350;
  const tlY = isVan ? 88 : 108;

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
        <line x1={20} y1={178} x2={400} y2={178} stroke="var(--border)" strokeWidth={1} />

        {/* Awning (behind body) */}
        {showAwning && <AwningLayer bodyType={bodyType} side={awningSide} />}

        {/* Vehicle body */}
        <path d={bodyPath} fill="var(--card)" stroke={statusColor} strokeWidth={2.5} className="transition-colors duration-500" />

        {/* Headlight + taillight */}
        <circle cx={hlX} cy={hlY} r={3} fill="#FFE066" opacity={0.6} />
        <circle cx={tlX} cy={tlY} r={3} fill="#EF4444" opacity={0.5} />

        {/* Bed floor line (trucks only) */}
        {isTruck && (() => {
          const bed = getBedRange(bodyType);
          return bed ? <line x1={bed.x} y1={135} x2={bed.x + bed.w - 5} y2={135} stroke="var(--border)" strokeWidth={1} opacity={0.3} /> : null;
        })()}

        {/* Wheels */}
        {[wheels.front, wheels.rear].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={wheels.y} r={wheels.r} fill="#222" stroke="#444" strokeWidth={2.5} />
            <circle cx={cx} cy={wheels.y} r={wheels.r - 3} fill="none" stroke="#333" strokeWidth={1} />
            <circle cx={cx} cy={wheels.y} r={wheels.r * 0.35} fill="#555" stroke="#666" strokeWidth={1} />
          </g>
        ))}

        {/* Windows */}
        {!isVan && (
          <path
            d={isTruck
              ? "M 66 98 Q 76 80 96 76 L 174 74 L 178 82 Z"
              : bodyType === "suv-5door"
              ? "M 66 98 Q 76 80 96 76 L 280 72 L 300 74 L 308 80 Z"
              : bodyType === "suv-3door"
              ? "M 76 100 Q 84 84 104 80 L 240 76 L 258 78 L 268 86 Z"
              : "M 80 104 Q 88 92 108 86 L 240 82 L 258 84 L 268 90 Z"}
            fill="var(--muted)" opacity={0.4}
          />
        )}
        {isVan && <rect x={60} y={50} width={75} height={22} rx={3} fill="var(--muted)" opacity={0.4} />}

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
