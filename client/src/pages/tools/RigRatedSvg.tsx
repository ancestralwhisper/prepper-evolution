
import type { UTVBodyType } from "./rigrated-machines";

interface RigRatedSvgProps {
  bodyType: UTVBodyType;
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

// ─── Side-profile SVG paths for 5 UTV body types ───────────────────────
// Viewbox: 0 0 420 200. Ground at y=178.
// Paths include wheel-well arches. Sport = low aggressive wedge. Utility = cab + bed.

const BODY_PATHS: Record<UTVBodyType, string> = {
  "2-seat-sport":
    // Low aggressive wedge (RZR, Talon, YXZ) — front wheel 112, rear 288
    "M 78 150 L 72 128 L 78 110 L 92 94 L 108 82 L 122 76 L 268 76 L 282 82 L 298 94 L 312 110 L 320 128 L 324 150 L 312 150 A 24 14 0 0 1 264 150 L 136 150 A 24 14 0 0 1 88 150 Z",

  "4-seat-sport":
    // Stretched sport (RZR 4, Maverick MAX) — front wheel 95, rear 315
    "M 58 150 L 52 128 L 58 110 L 72 94 L 88 82 L 102 76 L 288 76 L 302 82 L 318 94 L 332 110 L 340 128 L 344 150 L 339 150 A 24 14 0 0 1 291 150 L 119 150 A 24 14 0 0 1 71 150 Z",

  "2-seat-utility":
    // Cab + bed mini-truck (Ranger, Pioneer, Defender) — front 100, rear 300
    "M 68 150 L 65 120 L 70 102 L 82 88 L 98 78 L 112 74 L 172 74 L 180 92 L 310 92 L 316 94 L 322 108 L 328 120 L 332 150 L 322 150 A 22 14 0 0 1 278 150 L 122 150 A 22 14 0 0 1 78 150 Z",

  "4-seat-utility":
    // Longer cab + bed (Ranger Crew, Pioneer 1000-5) — front 90, rear 318
    "M 55 150 L 52 120 L 57 102 L 68 88 L 85 78 L 98 74 L 205 74 L 212 92 L 330 92 L 336 94 L 342 108 L 348 120 L 352 150 L 340 150 A 22 14 0 0 1 296 150 L 112 150 A 22 14 0 0 1 68 150 Z",

  "crew-cab-utility":
    // Full crew cab, short bed (Mule PRO-FXT) — front 85, rear 335
    "M 48 150 L 45 118 L 50 100 L 62 86 L 78 78 L 92 74 L 232 74 L 240 92 L 348 92 L 354 94 L 358 108 L 362 118 L 365 150 L 357 150 A 22 14 0 0 1 313 150 L 107 150 A 22 14 0 0 1 63 150 Z",
};

// ─── Wheel positions per body type ──────────────────────────────────────

function getWheels(bodyType: UTVBodyType) {
  switch (bodyType) {
    case "2-seat-sport":     return { front: 112, rear: 288, y: 158, r: 20 };
    case "4-seat-sport":     return { front: 95,  rear: 315, y: 158, r: 20 };
    case "2-seat-utility":   return { front: 100, rear: 300, y: 160, r: 18 };
    case "4-seat-utility":   return { front: 90,  rear: 318, y: 160, r: 18 };
    case "crew-cab-utility": return { front: 85,  rear: 335, y: 160, r: 18 };
  }
}

// ─── Body details ───────────────────────────────────────────────────────

function BodyDetails({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";

  const hlX = isSport ? (is4 ? 56 : 76) : isCrew ? 48 : is4 ? 55 : 68;
  const tlX = isSport ? (is4 ? 340 : 320) : isCrew ? 362 : is4 ? 348 : 328;
  const hlY = isSport ? 114 : 108;

  const bedX1 = isCrew ? 242 : is4 ? 214 : 182;
  const bedX2 = isCrew ? 346 : is4 ? 328 : 308;

  return (
    <g>
      <circle cx={hlX} cy={hlY} r={3} fill="#FFE066" opacity={0.6} />
      <circle cx={tlX} cy={hlY} r={3} fill="#EF4444" opacity={0.5} />
      {bodyType.includes("utility") && (
        <line x1={bedX1} y1={138} x2={bedX2} y2={138} stroke="var(--border)" strokeWidth={1} opacity={0.4} />
      )}
    </g>
  );
}

// ─── Accessory Layers ───────────────────────────────────────────────────

function RoofLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 102 : 122) : isCrew ? 92 : is4 ? 98 : 112;
  const w = isSport ? (is4 ? 186 : 146) : isCrew ? 148 : is4 ? 114 : 68;
  return <rect x={x} y={isSport ? 73 : 71} width={w} height={4} rx={2} fill="#777" opacity={0.7}><title>Roof</title></rect>;
}

function WindshieldLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x1 = isSport ? (is4 ? 88 : 108) : isCrew ? 62 : is4 ? 68 : 82;
  const x2 = isSport ? (is4 ? 102 : 122) : isCrew ? 78 : is4 ? 85 : 98;
  return (
    <line x1={x1} y1={isSport ? 94 : 98} x2={x2} y2={isSport ? 76 : 75} stroke="#88CCEE" strokeWidth={2.5} opacity={0.6}>
      <title>Windshield</title>
    </line>
  );
}

function DoorsLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 108 : 128) : isCrew ? 85 : is4 ? 90 : 108;
  const w = isSport ? (is4 ? 100 : 70) : isCrew ? 145 : is4 ? 115 : 65;
  return (
    <rect x={x} y={isSport ? 82 : 80} width={w} height={isSport ? 50 : 48} rx={3} fill="none" stroke="#888" strokeWidth={1.5} opacity={0.5}>
      <title>Doors</title>
    </rect>
  );
}

function FrontBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 46 : 66) : isCrew ? 38 : is4 ? 46 : 58;
  return <rect x={x} y={118} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Front Bumper</title></rect>;
}

function RearBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 342 : 322) : isCrew ? 363 : is4 ? 350 : 330;
  return <rect x={x} y={118} width={14} height={24} rx={3} fill="#555" opacity={0.7}><title>Rear Bumper</title></rect>;
}

function WinchLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 46 : 66) : isCrew ? 38 : is4 ? 46 : 58;
  return (
    <g>
      <rect x={x} y={108} width={12} height={10} rx={2} fill="#C45D2C" opacity={0.8}><title>Winch</title></rect>
      <line x1={x} y1={113} x2={x - 8} y2={113} stroke="#C45D2C" strokeWidth={1.5} />
    </g>
  );
}

function RackLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  const x = isCrew ? 245 : is4 ? 218 : 185;
  const w = isCrew ? 98 : is4 ? 108 : 120;
  return (
    <g>
      <rect x={x} y={84} width={w} height={3} rx={1} fill="#555" opacity={0.8}><title>Cargo Rack</title></rect>
      <rect x={x + 5} y={87} width={3} height={5} fill="#555" opacity={0.6} />
      <rect x={x + w - 8} y={87} width={3} height={5} fill="#555" opacity={0.6} />
    </g>
  );
}

function LightBarLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const is4 = bodyType.includes("4-seat");
  const isCrew = bodyType === "crew-cab-utility";
  const x = isSport ? (is4 ? 150 : 160) : isCrew ? 130 : is4 ? 125 : 130;
  const w = isSport ? (is4 ? 100 : 80) : isCrew ? 80 : is4 ? 70 : 50;
  return <rect x={x} y={isSport ? 72 : 70} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}><title>Light Bar</title></rect>;
}

function RttLayer({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("utility")) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const is4 = bodyType === "4-seat-utility";
  const x = isCrew ? 248 : is4 ? 222 : 188;
  const w = isCrew ? 90 : is4 ? 100 : 112;
  return <rect x={x} y={70} width={w} height={12} rx={3} fill="#C45D2C" opacity={0.8}><title>Rooftop Tent</title></rect>;
}

// ─── Roll Cage ──────────────────────────────────────────────────────────

function RollCage({ bodyType }: { bodyType: UTVBodyType }) {
  if (!bodyType.includes("sport")) return null;
  const is4 = bodyType === "4-seat-sport";
  const aX = is4 ? 88 : 108;
  const aTop = is4 ? 102 : 122;
  const bX = is4 ? 302 : 282;
  const bTop = is4 ? 288 : 268;
  return (
    <g opacity={0.35}>
      <line x1={aX} y1={104} x2={aTop} y2={76} stroke="var(--foreground)" strokeWidth={2} />
      <line x1={bX} y1={104} x2={bTop} y2={76} stroke="var(--foreground)" strokeWidth={2} />
      <line x1={aTop} y1={76} x2={bTop} y2={76} stroke="var(--foreground)" strokeWidth={2} />
      {is4 && <line x1={195} y1={104} x2={195} y2={76} stroke="var(--foreground)" strokeWidth={1.5} />}
    </g>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function RigRatedSvg({
  bodyType, showRoof, showWindshield, showDoors,
  showFrontBumper, showRearBumper, showWinch,
  showRack, showLightBar, showRtt, loadStatus,
}: RigRatedSvgProps) {
  const bodyPath = BODY_PATHS[bodyType] || BODY_PATHS["2-seat-utility"];
  const wheels = getWheels(bodyType);

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
        <line x1={20} y1={178} x2={400} y2={178} stroke="var(--border)" strokeWidth={1} />

        {/* Vehicle body */}
        <path d={bodyPath} fill="var(--card)" stroke={statusColor} strokeWidth={2.5} className="transition-colors duration-500" />

        {/* Roll cage (sport) */}
        <RollCage bodyType={bodyType} />

        {/* Headlight + taillight + bed floor */}
        <BodyDetails bodyType={bodyType} />

        {/* Wheels */}
        {[wheels.front, wheels.rear].map((cx, i) => (
          <g key={i}>
            <circle cx={cx} cy={wheels.y} r={wheels.r} fill="#222" stroke="#444" strokeWidth={2.5} />
            <circle cx={cx} cy={wheels.y} r={wheels.r - 4} fill="none" stroke="#333" strokeWidth={1} />
            <circle cx={cx} cy={wheels.y} r={wheels.r * 0.35} fill="#555" stroke="#666" strokeWidth={1} />
          </g>
        ))}

        {/* Cab windows (utility only) */}
        {bodyType.includes("utility") && (
          <path
            d={bodyType === "crew-cab-utility"
              ? "M 62 96 Q 70 82 90 78 L 228 75 L 234 80 Z"
              : bodyType === "4-seat-utility"
              ? "M 70 97 Q 78 84 98 79 L 202 76 L 208 80 Z"
              : "M 82 97 Q 90 84 110 79 L 168 76 L 174 80 Z"}
            fill="var(--muted)"
            opacity={0.4}
          />
        )}

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
