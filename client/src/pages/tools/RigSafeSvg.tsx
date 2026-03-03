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

const BODY_PATHS: Record<BodyType, string> = {
  "crew-cab-short":
    "M 50 160 L 50 110 L 55 105 L 60 85 Q 65 70 90 68 L 180 68 L 185 70 L 190 85 L 195 85 L 200 70 L 205 68 L 300 68 L 310 70 L 320 85 L 330 105 L 335 110 L 340 160 Z",

  "crew-cab-standard":
    "M 45 160 L 45 110 L 50 105 L 55 85 Q 60 70 85 68 L 175 68 L 180 70 L 185 85 L 190 85 L 195 70 L 200 68 L 330 68 L 340 70 L 350 85 L 355 105 L 358 110 L 360 160 Z",

  "crew-cab-long":
    "M 40 160 L 40 110 L 45 105 L 50 85 Q 55 70 80 68 L 165 68 L 170 70 L 175 85 L 180 85 L 185 70 L 190 68 L 345 68 L 355 70 L 360 85 L 365 105 L 368 110 L 370 160 Z",

  "mid-truck":
    "M 60 160 L 60 115 L 65 108 L 72 88 Q 78 72 100 70 L 178 70 L 183 72 L 188 88 L 193 88 L 198 72 L 203 70 L 295 70 L 305 72 L 312 88 L 318 108 L 322 115 L 325 160 Z",

  "suv-5door":
    "M 55 160 L 55 110 L 60 105 L 68 85 Q 74 70 95 68 L 175 68 L 185 66 Q 195 65 305 65 L 310 66 L 315 75 L 325 90 L 330 110 L 335 160 Z",

  "suv-3door":
    "M 65 160 L 65 112 L 70 105 L 78 88 Q 84 72 105 70 L 180 70 L 190 68 Q 200 67 280 67 L 285 68 L 290 78 L 298 95 L 305 112 L 308 160 Z",

  crossover:
    "M 70 160 L 70 118 L 75 112 L 82 95 Q 88 80 108 78 L 175 78 L 185 76 Q 195 75 275 75 L 280 76 L 285 82 L 292 98 L 298 118 L 302 160 Z",

  van:
    "M 50 170 L 50 65 Q 52 50 65 48 L 135 48 L 145 50 L 150 60 L 155 75 L 340 75 L 345 78 L 350 85 L 352 170 Z",
};

function TonneauLayer() {
  return (
    <rect x={200} y={65} width={100} height={4} rx={1} fill="#8B7355" opacity={0.7}>
      <title>Tonneau Cover</title>
    </rect>
  );
}

function RackLayer({ bodyType }: { bodyType: BodyType }) {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const x = isTruck ? 195 : 100;
  const w = isTruck ? 110 : 200;
  const y = 58;

  return (
    <g>
      <rect x={x} y={y} width={w} height={3} rx={1} fill="#555" opacity={0.8}>
        <title>Rack</title>
      </rect>
      <rect x={x + 5} y={y + 3} width={3} height={8} fill="#555" opacity={0.6} />
      <rect x={x + w - 8} y={y + 3} width={3} height={8} fill="#555" opacity={0.6} />
    </g>
  );
}

function TentLayer({ bodyType }: { bodyType: BodyType }) {
  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const x = isTruck ? 200 : 110;
  const w = isTruck ? 98 : 180;

  return (
    <rect x={x} y={44} width={w} height={13} rx={3} fill="#C45D2C" opacity={0.8}>
      <title>Rooftop Tent (closed)</title>
    </rect>
  );
}

function AnnexLayer({ side }: { side: "driver" | "passenger" | "rear" }) {
  return (
    <rect
      x={260}
      y={58}
      width={35}
      height={95}
      rx={2}
      fill="none"
      stroke="#C45D2C"
      strokeWidth={1.5}
      strokeDasharray="4 3"
      opacity={0.5}
    >
      <title>Annex ({side} side)</title>
    </rect>
  );
}

function AwningLayer({ side }: { side: "driver" | "passenger" | "rear" }) {
  return (
    <g opacity={0.4}>
      <path
        d="M 100 62 L 100 145 L 40 145 Z"
        fill="#10B981"
        stroke="#10B981"
        strokeWidth={1}
      >
        <title>Awning ({side} side)</title>
      </path>
      <line x1={40} y1={145} x2={40} y2={160} stroke="#666" strokeWidth={2} />
    </g>
  );
}

function HeightDimension({ totalHeightIn }: { totalHeightIn: number }) {
  return (
    <g>
      <line x1={380} y1={40} x2={380} y2={160} stroke="var(--muted)" strokeWidth={1} strokeDasharray="3 2" />
      <line x1={375} y1={40} x2={385} y2={40} stroke="var(--muted)" strokeWidth={1} />
      <line x1={375} y1={160} x2={385} y2={160} stroke="var(--muted)" strokeWidth={1} />
      <text
        x={388}
        y={100}
        className="fill-muted-foreground"
        style={{ fontSize: 10 }}
        transform="rotate(90, 388, 100)"
        textAnchor="middle"
      >
        {totalHeightIn > 0 ? `${totalHeightIn}"` : ""}
      </text>
    </g>
  );
}

export default function RigSafeSvg({
  bodyType,
  showTonneau,
  showRack,
  showTent,
  showAnnex,
  showAwning,
  awningSide,
  annexSide,
  loadStatus,
  totalHeightIn,
}: RigSafeSvgProps) {
  const bodyPath = BODY_PATHS[bodyType] || BODY_PATHS["crew-cab-short"];

  const statusColor =
    loadStatus === "red" ? "#EF4444" :
    loadStatus === "yellow" ? "#EAB308" :
    "#10B981";

  const isTruck = bodyType.includes("cab") || bodyType === "mid-truck";
  const isVan = bodyType === "van";
  const wheelY = 160;
  const frontWheelX = isVan ? 120 : isTruck ? 95 : 110;
  const rearWheelX = isVan ? 310 : isTruck ? 290 : 270;
  const wheelR = isVan ? 18 : 16;

  return (
    <div className="bg-muted border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Rig Visualization
        </span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            {loadStatus === "red" ? "Over Limit" : loadStatus === "yellow" ? "Caution" : "Good"}
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 420 200"
        className="w-full max-w-lg mx-auto"
        role="img"
        aria-label={`${bodyType} vehicle with ${showTent ? "rooftop tent" : "no tent"}`}
      >
        <line x1={20} y1={178} x2={370} y2={178} stroke="var(--border)" strokeWidth={1} />

        {showAwning && <AwningLayer side={awningSide} />}

        <path
          d={bodyPath}
          fill="var(--card)"
          stroke={statusColor}
          strokeWidth={2.5}
          className="transition-colors duration-500"
        />

        <circle cx={frontWheelX} cy={wheelY} r={wheelR} fill="#333" stroke="#555" strokeWidth={2} />
        <circle cx={frontWheelX} cy={wheelY} r={wheelR * 0.45} fill="#555" />
        <circle cx={rearWheelX} cy={wheelY} r={wheelR} fill="#333" stroke="#555" strokeWidth={2} />
        <circle cx={rearWheelX} cy={wheelY} r={wheelR * 0.45} fill="#555" />

        {!isVan && (
          <path
            d={isTruck
              ? "M 72 88 Q 78 74 98 72 L 175 72 L 180 88 Z"
              : "M 78 88 Q 84 74 105 72 L 270 72 L 275 74 L 280 88 Z"}
            fill="var(--muted)"
            opacity={0.4}
          />
        )}
        {isVan && (
          <rect x={60} y={52} width={70} height={20} rx={3} fill="var(--muted)" opacity={0.4} />
        )}

        {showTonneau && isTruck && <TonneauLayer />}

        {showRack && <RackLayer bodyType={bodyType} />}

        {showTent && <TentLayer bodyType={bodyType} />}

        {showAnnex && <AnnexLayer side={annexSide} />}

        {(showRack || showTent) && <HeightDimension totalHeightIn={totalHeightIn} />}
      </svg>
    </div>
  );
}
