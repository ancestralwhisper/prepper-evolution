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

const BODY_PATHS: Record<UTVBodyType, string> = {
  "2-seat-sport":
    "M 80 160 L 80 115 L 90 100 Q 100 80 120 75 L 155 72 L 170 70 L 200 70 L 230 70 L 260 72 L 280 75 L 300 80 L 310 100 L 320 115 L 320 160 Z",

  "4-seat-sport":
    "M 60 160 L 60 115 L 70 100 Q 80 80 100 75 L 135 72 L 170 70 L 200 70 L 240 70 L 280 72 L 310 75 L 330 80 L 340 100 L 350 115 L 350 160 Z",

  "2-seat-utility":
    "M 70 160 L 70 110 L 78 95 Q 85 78 105 75 L 165 72 L 178 72 L 185 80 L 185 80 L 192 72 L 310 72 L 318 78 L 325 95 L 330 110 L 330 160 Z",

  "4-seat-utility":
    "M 55 160 L 55 110 L 63 95 Q 70 78 90 75 L 195 72 L 208 72 L 215 80 L 215 80 L 222 72 L 330 72 L 338 78 L 345 95 L 350 110 L 350 160 Z",

  "crew-cab-utility":
    "M 50 160 L 50 108 L 58 93 Q 65 76 85 73 L 215 70 L 228 70 L 235 78 L 235 78 L 242 70 L 345 70 L 353 76 L 360 93 L 365 108 L 365 160 Z",
};

function getWheels(bodyType: UTVBodyType) {
  switch (bodyType) {
    case "2-seat-sport": return { front: 112, rear: 288, y: 160, r: 17 };
    case "4-seat-sport": return { front: 95, rear: 315, y: 160, r: 17 };
    case "2-seat-utility": return { front: 100, rear: 300, y: 160, r: 15 };
    case "4-seat-utility": return { front: 90, rear: 318, y: 160, r: 15 };
    case "crew-cab-utility": return { front: 85, rear: 330, y: 160, r: 15 };
  }
}

function RoofLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 115 : 85;
  const w = isSport ? 170 : 180;
  return <rect x={x} y={66} width={w} height={4} rx={2} fill="#777" opacity={0.7}><title>Roof</title></rect>;
}

function WindshieldLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x1 = isSport ? 118 : 88;
  const x2 = isSport ? 130 : 100;
  return (
    <line x1={x1} y1={100} x2={x2} y2={70} stroke="#88CCEE" strokeWidth={2.5} opacity={0.6}>
      <title>Windshield</title>
    </line>
  );
}

function DoorsLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 125 : 100;
  const w = isSport ? 80 : 90;
  return (
    <rect x={x} y={80} width={w} height={65} rx={3} fill="none" stroke="#888" strokeWidth={1.5} opacity={0.5}>
      <title>Doors</title>
    </rect>
  );
}

function FrontBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 72 : 62;
  return (
    <rect x={x} y={130} width={18} height={22} rx={3} fill="#555" opacity={0.7}>
      <title>Front Bumper</title>
    </rect>
  );
}

function RearBumperLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 312 : 322;
  return (
    <rect x={x} y={130} width={18} height={22} rx={3} fill="#555" opacity={0.7}>
      <title>Rear Bumper</title>
    </rect>
  );
}

function WinchLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 75 : 65;
  return (
    <g>
      <rect x={x} y={118} width={12} height={10} rx={2} fill="#C45D2C" opacity={0.8}>
        <title>Winch</title>
      </rect>
      <line x1={x} y1={123} x2={x - 8} y2={123} stroke="#C45D2C" strokeWidth={1.5} />
    </g>
  );
}

function RackLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isUtility = bodyType.includes("utility");
  if (!isUtility) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const x = isCrew ? 240 : bodyType === "4-seat-utility" ? 220 : 190;
  const w = isCrew ? 100 : bodyType === "4-seat-utility" ? 110 : 120;
  return (
    <g>
      <rect x={x} y={62} width={w} height={3} rx={1} fill="#555" opacity={0.8}>
        <title>Cargo Rack</title>
      </rect>
      <rect x={x + 5} y={65} width={3} height={7} fill="#555" opacity={0.6} />
      <rect x={x + w - 8} y={65} width={3} height={7} fill="#555" opacity={0.6} />
    </g>
  );
}

function LightBarLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  const x = isSport ? 155 : 130;
  const w = isSport ? 90 : 100;
  return (
    <rect x={x} y={63} width={w} height={3} rx={1.5} fill="#FFD700" opacity={0.7}>
      <title>Light Bar</title>
    </rect>
  );
}

function RttLayer({ bodyType }: { bodyType: UTVBodyType }) {
  const isUtility = bodyType.includes("utility");
  if (!isUtility) return null;
  const isCrew = bodyType === "crew-cab-utility";
  const x = isCrew ? 245 : bodyType === "4-seat-utility" ? 225 : 195;
  const w = isCrew ? 90 : bodyType === "4-seat-utility" ? 100 : 110;
  return (
    <rect x={x} y={48} width={w} height={12} rx={3} fill="#C45D2C" opacity={0.8}>
      <title>Rooftop Tent</title>
    </rect>
  );
}

function RollCage({ bodyType }: { bodyType: UTVBodyType }) {
  const isSport = bodyType.includes("sport");
  if (!isSport) return null;
  const x1 = bodyType === "4-seat-sport" ? 100 : 120;
  const x2 = bodyType === "4-seat-sport" ? 310 : 280;
  return (
    <g opacity={0.35}>
      <line x1={x1 + 15} y1={110} x2={x1 + 25} y2={70} stroke="var(--foreground)" strokeWidth={2} />
      <line x1={x2 - 15} y1={110} x2={x2 - 25} y2={70} stroke="var(--foreground)" strokeWidth={2} />
      <line x1={x1 + 25} y1={70} x2={x2 - 25} y2={70} stroke="var(--foreground)" strokeWidth={2} />
    </g>
  );
}

export default function RigRatedSvg({
  bodyType,
  showRoof,
  showWindshield,
  showDoors,
  showFrontBumper,
  showRearBumper,
  showWinch,
  showRack,
  showLightBar,
  showRtt,
  loadStatus,
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

      <svg
        viewBox="0 0 420 200"
        className="w-full max-w-lg mx-auto"
        role="img"
        aria-label={`${bodyType} UTV with accessories`}
      >
        <line x1={20} y1={178} x2={400} y2={178} stroke="var(--border)" strokeWidth={1} />

        <path
          d={bodyPath}
          fill="var(--card)"
          stroke={statusColor}
          strokeWidth={2.5}
          className="transition-colors duration-500"
        />

        <RollCage bodyType={bodyType} />

        <circle cx={wheels.front} cy={wheels.y} r={wheels.r} fill="#333" stroke="#555" strokeWidth={2} />
        <circle cx={wheels.front} cy={wheels.y} r={wheels.r * 0.45} fill="#555" />
        <circle cx={wheels.rear} cy={wheels.y} r={wheels.r} fill="#333" stroke="#555" strokeWidth={2} />
        <circle cx={wheels.rear} cy={wheels.y} r={wheels.r * 0.45} fill="#555" />

        {bodyType.includes("utility") && (
          <path
            d={bodyType === "crew-cab-utility"
              ? "M 68 93 Q 75 78 95 75 L 210 72 L 215 78 Z"
              : bodyType === "4-seat-utility"
              ? "M 73 95 Q 80 80 100 77 L 200 74 L 205 80 Z"
              : "M 88 95 Q 95 80 115 77 L 168 74 L 173 80 Z"}
            fill="var(--muted)"
            opacity={0.4}
          />
        )}

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
