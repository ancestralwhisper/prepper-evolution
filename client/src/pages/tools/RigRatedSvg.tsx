
import type { UTVBodyType } from "./rigrated-machines";
import { RZR_XP1000_PATH } from "./silhouettes/rzr-xp1000";

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

// ─── Silhouette data ─────────────────────────────────────────────────────
// ViewBox: 0 0 420 200. Ground at y=178.
// Wheel wells use A35,35 SVG arcs for clean semicircular openings.
// 4 base body types from verified reference artwork.

interface SilhouetteData {
  path: string;
  frontWheel: number;
  rearWheel: number;
  bodyLeft: number;
  bodyRight: number;
  cabRef: { roofY: number; roofStartX: number; roofEndX: number; hoodY: number; bedY?: number };
}

// ─── 4 base silhouettes (arc-based wheel wells) ──────────────────────────

const SPORT_2SEAT: SilhouetteData = {
  path: "M40,178 L80,178 A35,35 0 0,1 150,178 L270,178 A35,35 0 0,1 340,178 L380,178 L390,140 L350,100 L280,90 L240,50 L120,60 L80,110 L40,130 Z",
  frontWheel: 115, rearWheel: 305,
  bodyLeft: 40, bodyRight: 390,
  cabRef: { roofY: 50, roofStartX: 120, roofEndX: 240, hoodY: 110 },
};

const SPORT_4SEAT: SilhouetteData = {
  path: "M40,178 L80,178 A35,35 0 0,1 150,178 L300,178 A35,35 0 0,1 370,178 L400,178 L410,140 L380,100 L120,100 L110,60 L80,110 L40,130 Z",
  frontWheel: 115, rearWheel: 335,
  bodyLeft: 40, bodyRight: 410,
  cabRef: { roofY: 60, roofStartX: 110, roofEndX: 240, hoodY: 100 },
};

const UTILITY_2SEAT: SilhouetteData = {
  path: "M40,178 L80,178 A35,35 0 0,1 150,178 L270,178 A35,35 0 0,1 340,178 L390,178 L390,90 L300,90 L300,45 L120,45 L70,95 L40,140 Z",
  frontWheel: 115, rearWheel: 305,
  bodyLeft: 40, bodyRight: 390,
  cabRef: { roofY: 45, roofStartX: 120, roofEndX: 300, hoodY: 95, bedY: 90 },
};

const UTILITY_CREW: SilhouetteData = {
  path: "M30,178 L70,178 A35,35 0 0,1 140,178 L310,178 A35,35 0 0,1 380,178 L410,178 L410,90 L320,90 L320,45 L110,45 L60,95 L30,140 Z",
  frontWheel: 105, rearWheel: 345,
  bodyLeft: 30, bodyRight: 410,
  cabRef: { roofY: 45, roofStartX: 110, roofEndX: 320, hoodY: 95, bedY: 90 },
};

// ─── Traced silhouettes (photorealistic SVG from Illustrator) ────────────
// These are full filled silhouettes (include wheels). Map machineId → path string.
const TRACED_SILHOUETTES: Record<string, string> = {
  "polaris-rzr-xp-1000": RZR_XP1000_PATH,
};

// ─── Machine-to-silhouette mapping (29 machines) ─────────────────────────

const MODEL_SILHOUETTES: Record<string, SilhouetteData> = {
  // Polaris — Sport
  "polaris-rzr-xp-1000": SPORT_2SEAT,
  "polaris-rzr-xp-turbo-r": SPORT_2SEAT,
  "polaris-rzr-pro-xp": SPORT_2SEAT,
  "polaris-rzr-pro-r": SPORT_4SEAT,
  // Polaris — Utility
  "polaris-ranger-xp-1000": UTILITY_2SEAT,
  "polaris-ranger-crew-xp-1000": UTILITY_CREW,
  "polaris-general-xp-1000": UTILITY_2SEAT,
  "polaris-general-xp-4-1000": UTILITY_CREW,
  "polaris-xpedition-xp": UTILITY_2SEAT,
  "polaris-xpedition-xp-5": UTILITY_CREW,
  // Can-Am — Sport
  "canam-maverick-x3-xrs-turbo-rr": SPORT_2SEAT,
  "canam-maverick-r": SPORT_2SEAT,
  // Can-Am — Utility
  "canam-defender-hd9": UTILITY_2SEAT,
  "canam-defender-hd10": UTILITY_2SEAT,
  "canam-defender-max-hd10": UTILITY_CREW,
  // Honda
  "honda-pioneer-1000": UTILITY_2SEAT,
  "honda-pioneer-1000-5": UTILITY_2SEAT,
  "honda-talon-1000r": SPORT_2SEAT,
  "honda-talon-1000x": SPORT_2SEAT,
  // Kawasaki
  "kawasaki-teryx-krx-1000": SPORT_2SEAT,
  "kawasaki-teryx-krx-1000-2026": SPORT_2SEAT,
  "kawasaki-teryx-krx4-1000": SPORT_4SEAT,
  "kawasaki-mule-pro-fxt": UTILITY_CREW,
  // Yamaha
  "yamaha-yxz1000r": SPORT_2SEAT,
  "yamaha-wolverine-rmax-1000": SPORT_2SEAT,
  "yamaha-wolverine-rmax4-1000": SPORT_4SEAT,
  // CFMoto
  "cfmoto-zforce-950": SPORT_2SEAT,
  "cfmoto-uforce-1000": UTILITY_2SEAT,
  "cfmoto-uforce-1000-xl": UTILITY_CREW,
};

// ─── Generic fallbacks (manual entry uses bodyType) ──────────────────────

const GENERIC_SILHOUETTES: Record<UTVBodyType, SilhouetteData> = {
  "2-seat-sport": SPORT_2SEAT,
  "4-seat-sport": SPORT_4SEAT,
  "2-seat-utility": UTILITY_2SEAT,
  "4-seat-utility": UTILITY_CREW,
  "crew-cab-utility": UTILITY_CREW,
};

function getSilhouette(machineId: string | undefined, bodyType: UTVBodyType): SilhouetteData {
  if (machineId && MODEL_SILHOUETTES[machineId]) return MODEL_SILHOUETTES[machineId];
  return GENERIC_SILHOUETTES[bodyType] || GENERIC_SILHOUETTES["2-seat-utility"];
}

// ─── Structural detail lines (window glass, pillars, bed rail) ───────────

function CabStructure({ sil, statusColor }: { sil: SilhouetteData; statusColor: string }) {
  const { roofY, roofStartX, roofEndX, hoodY, bedY } = sil.cabRef;
  const isUtility = !!bedY;
  const wsBottomX = roofStartX - 14;

  return (
    <g>
      {/* Window glass fill */}
      <polygon
        points={`${wsBottomX},${hoodY} ${roofStartX},${roofY + 2} ${roofEndX - 8},${roofY + 2} ${roofEndX - 4},${isUtility ? bedY! - 6 : hoodY}`}
        fill="#88CCEE"
        opacity={0.08}
      />
      {/* Windshield line */}
      <line x1={wsBottomX} y1={hoodY} x2={roofStartX} y2={roofY + 2} stroke={statusColor} strokeWidth={1} opacity={0.5} />
      {/* Roof line */}
      <line x1={roofStartX} y1={roofY + 1} x2={roofEndX} y2={roofY + 1} stroke={statusColor} strokeWidth={1} opacity={0.4} />
      {/* B-pillar + bed rail (utility only) */}
      {isUtility && bedY && (
        <>
          <line x1={roofEndX + 4} y1={roofY + 4} x2={roofEndX + 8} y2={bedY} stroke={statusColor} strokeWidth={1.5} opacity={0.5} />
          <line x1={roofEndX + 8} y1={bedY + 1} x2={sil.bodyRight - 8} y2={bedY + 2} stroke={statusColor} strokeWidth={0.8} opacity={0.3} />
        </>
      )}
    </g>
  );
}

// ─── Accessory layers (positioned from silhouette geometry) ──────────────

function RoofLayer({ sil }: { sil: SilhouetteData }) {
  const { roofY, roofStartX, roofEndX } = sil.cabRef;
  return (
    <rect x={roofStartX} y={roofY - 3} width={roofEndX - roofStartX} height={4} rx={2} fill="#777" opacity={0.7}>
      <title>Roof</title>
    </rect>
  );
}

function WindshieldLayer({ sil }: { sil: SilhouetteData }) {
  const { roofY, roofStartX, hoodY } = sil.cabRef;
  return (
    <line x1={roofStartX - 14} y1={hoodY} x2={roofStartX} y2={roofY + 2} stroke="#88CCEE" strokeWidth={2.5} opacity={0.6}>
      <title>Windshield</title>
    </line>
  );
}

function DoorsLayer({ sil }: { sil: SilhouetteData }) {
  const { roofY, roofStartX, roofEndX, hoodY, bedY } = sil.cabRef;
  const x = roofStartX - 14;
  const endX = bedY ? roofEndX + 6 : roofEndX + 12;
  return (
    <rect x={x} y={roofY + 6} width={endX - x} height={hoodY - roofY + 28} rx={3} fill="none" stroke="#888" strokeWidth={1.5} opacity={0.5}>
      <title>Doors</title>
    </rect>
  );
}

function FrontBumperLayer({ sil }: { sil: SilhouetteData }) {
  return (
    <rect x={sil.bodyLeft - 8} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}>
      <title>Front Bumper</title>
    </rect>
  );
}

function RearBumperLayer({ sil }: { sil: SilhouetteData }) {
  return (
    <rect x={sil.bodyRight - 4} y={148} width={14} height={24} rx={3} fill="#555" opacity={0.7}>
      <title>Rear Bumper</title>
    </rect>
  );
}

function WinchLayer({ sil }: { sil: SilhouetteData }) {
  const x = sil.bodyLeft - 6;
  return (
    <g>
      <rect x={x} y={138} width={12} height={10} rx={2} fill="#C45D2C" opacity={0.8}><title>Winch</title></rect>
      <line x1={x} y1={143} x2={x - 8} y2={143} stroke="#C45D2C" strokeWidth={1.5} />
    </g>
  );
}

function RackLayer({ sil }: { sil: SilhouetteData }) {
  const { bedY, roofEndX } = sil.cabRef;
  if (!bedY) return null;
  const x = roofEndX + 12;
  const w = sil.bodyRight - x - 10;
  return (
    <g>
      <rect x={x} y={bedY - 4} width={w} height={3} rx={1} fill="#555" opacity={0.8}><title>Cargo Rack</title></rect>
      <rect x={x + 4} y={bedY - 1} width={3} height={5} fill="#555" opacity={0.6} />
      <rect x={x + w - 7} y={bedY - 1} width={3} height={5} fill="#555" opacity={0.6} />
    </g>
  );
}

function LightBarLayer({ sil }: { sil: SilhouetteData }) {
  const { roofY, roofStartX, roofEndX } = sil.cabRef;
  const x = roofStartX + 10;
  const w = roofEndX - roofStartX - 20;
  return (
    <rect x={x} y={roofY - 5} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}>
      <title>Light Bar</title>
    </rect>
  );
}

function RttLayer({ sil }: { sil: SilhouetteData }) {
  const { bedY, roofEndX } = sil.cabRef;
  if (!bedY) return null;
  const x = roofEndX + 10;
  const w = sil.bodyRight - x - 8;
  return (
    <rect x={x} y={bedY - 14} width={w} height={12} rx={3} fill="#C45D2C" opacity={0.8}>
      <title>Rooftop Tent</title>
    </rect>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────

export default function RigRatedSvg({
  bodyType, machineId, showRoof, showWindshield, showDoors,
  showFrontBumper, showRearBumper, showWinch,
  showRack, showLightBar, showRtt, loadStatus,
}: RigRatedSvgProps) {
  const sil = getSilhouette(machineId, bodyType);
  const tracedPath = machineId ? TRACED_SILHOUETTES[machineId] : undefined;

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

        {tracedPath ? (
          /* Traced photorealistic silhouette (includes wheels in the path) */
          <g transform="translate(0,-2)">
            <path
              d={tracedPath}
              fill="#1a1a1a"
              fillRule="evenodd"
              stroke={statusColor}
              strokeWidth={1}
              strokeLinejoin="round"
              className="transition-colors duration-500"
            />
          </g>
        ) : (
          <>
            {/* Wheels (behind body — visible through arch cutouts) */}
            {[sil.frontWheel, sil.rearWheel].map((cx, i) => (
              <g key={i}>
                <circle cx={cx} cy={152} r={26} fill="#222" stroke="#444" strokeWidth={2.5} />
                <circle cx={cx} cy={152} r={20} fill="none" stroke="#333" strokeWidth={1} />
                <circle cx={cx} cy={152} r={9} fill="#555" stroke="#666" strokeWidth={1} />
              </g>
            ))}

            {/* Vehicle body (A35,35 arcs create wheel well openings) */}
            <path
              d={sil.path}
              fill="var(--card)"
              stroke={statusColor}
              strokeWidth={2.5}
              strokeLinejoin="round"
              className="transition-colors duration-500"
            />

            {/* Structural details (window glass, pillars, bed rail) */}
            <CabStructure sil={sil} statusColor={statusColor} />
          </>
        )}

        {/* Accessory layers */}
        {showDoors && <DoorsLayer sil={sil} />}
        {showFrontBumper && <FrontBumperLayer sil={sil} />}
        {showRearBumper && <RearBumperLayer sil={sil} />}
        {showWinch && <WinchLayer sil={sil} />}
        {showWindshield && <WindshieldLayer sil={sil} />}
        {showRoof && <RoofLayer sil={sil} />}
        {showRack && <RackLayer sil={sil} />}
        {showLightBar && <LightBarLayer sil={sil} />}
        {showRtt && <RttLayer sil={sil} />}
      </svg>
    </div>
  );
}
