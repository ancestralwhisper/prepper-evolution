import { useState } from "react";

interface LegalHeatMapProps {
  statuses: { stateCode: string; status: "green" | "yellow" | "red" }[];
  view: "unregistered" | "plated" | "non-resident";
  onViewChange: (view: "unregistered" | "plated" | "non-resident") => void;
  selectedStates: string[];
  onStateToggle: (code: string) => void;
}

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas",
  CA: "California", CO: "Colorado", CT: "Connecticut", DE: "Delaware",
  FL: "Florida", GA: "Georgia", HI: "Hawaii", ID: "Idaho",
  IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada",
  NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico", NY: "New York",
  NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah",
  VT: "Vermont", VA: "Virginia", WA: "Washington", WV: "West Virginia",
  WI: "Wisconsin", WY: "Wyoming",
};

const STATE_PATHS: Record<string, string> = {
  WA: "M 95,30 L 170,25 L 185,30 L 190,55 L 195,80 L 185,95 L 130,95 L 105,90 L 90,75 L 80,55 Z",
  OR: "M 80,95 L 130,95 L 185,95 L 195,110 L 195,155 L 185,170 L 100,170 L 80,155 L 70,130 Z",
  CA: "M 70,170 L 100,170 L 110,195 L 115,230 L 120,270 L 125,310 L 120,340 L 105,360 L 85,370 L 70,350 L 60,310 L 55,270 L 60,230 L 65,195 Z",
  NV: "M 120,170 L 185,170 L 190,195 L 185,230 L 175,270 L 165,310 L 130,310 L 125,270 L 120,230 L 115,195 Z",
  ID: "M 195,60 L 230,55 L 245,70 L 250,95 L 245,130 L 240,165 L 220,180 L 195,180 L 195,155 L 195,110 Z",
  UT: "M 175,195 L 240,195 L 245,230 L 245,290 L 240,310 L 175,310 L 170,270 L 170,230 Z",
  AZ: "M 130,320 L 240,320 L 245,355 L 245,395 L 240,420 L 230,425 L 140,425 L 125,415 L 115,390 L 115,360 Z",
  MT: "M 240,35 L 370,30 L 380,40 L 385,70 L 380,100 L 370,110 L 250,110 L 245,95 L 240,70 Z",
  WY: "M 250,120 L 370,120 L 375,155 L 375,195 L 370,210 L 250,210 L 245,195 L 245,155 Z",
  CO: "M 255,220 L 380,220 L 385,255 L 385,295 L 380,310 L 255,310 L 250,295 L 250,255 Z",
  NM: "M 250,320 L 375,320 L 380,355 L 380,400 L 375,430 L 370,440 L 255,440 L 250,425 L 245,395 L 245,355 Z",
  ND: "M 385,40 L 490,38 L 495,60 L 495,90 L 490,100 L 385,105 L 380,90 L 380,60 Z",
  SD: "M 385,110 L 495,108 L 500,130 L 500,165 L 495,175 L 385,178 L 380,165 L 380,130 Z",
  NE: "M 385,185 L 505,182 L 510,205 L 510,230 L 505,240 L 390,245 L 385,235 L 380,210 Z",
  KS: "M 395,250 L 510,248 L 515,275 L 515,305 L 510,315 L 395,318 L 390,305 L 390,275 Z",
  OK: "M 395,325 L 520,322 L 525,345 L 525,365 L 510,375 L 460,378 L 445,395 L 420,398 L 395,395 L 390,370 L 390,345 Z",
  TX: "M 395,405 L 445,400 L 465,385 L 515,382 L 530,380 L 545,400 L 555,430 L 550,470 L 540,505 L 520,530 L 490,540 L 460,535 L 430,520 L 410,500 L 395,470 L 390,440 Z",
  MN: "M 500,42 L 570,40 L 580,55 L 580,120 L 575,145 L 565,155 L 510,158 L 505,145 L 500,110 L 500,70 Z",
  IA: "M 515,165 L 585,162 L 590,185 L 590,220 L 585,235 L 520,238 L 515,225 L 510,200 Z",
  MO: "M 525,245 L 600,242 L 605,265 L 610,290 L 610,325 L 600,340 L 575,345 L 545,340 L 530,335 L 525,310 L 520,275 Z",
  AR: "M 535,350 L 600,348 L 605,370 L 605,400 L 600,415 L 540,418 L 535,400 L 530,375 Z",
  LA: "M 540,425 L 605,422 L 610,445 L 620,465 L 615,485 L 600,490 L 580,495 L 560,490 L 545,475 L 540,450 Z",
  WI: "M 585,60 L 640,55 L 650,65 L 660,85 L 660,120 L 655,145 L 640,155 L 590,155 L 585,130 L 585,95 Z",
  IL: "M 595,165 L 640,162 L 645,190 L 650,225 L 650,260 L 645,295 L 640,310 L 620,318 L 600,310 L 600,275 L 595,230 Z",
  MI: "M 665,65 L 695,60 L 715,65 L 725,80 L 725,100 L 720,115 L 705,130 L 690,145 L 680,155 L 665,160 L 660,145 L 660,120 L 665,95 Z",
  IN: "M 650,170 L 690,168 L 695,195 L 695,240 L 692,270 L 688,295 L 660,298 L 655,275 L 650,240 L 650,200 Z",
  OH: "M 700,165 L 740,160 L 750,170 L 755,200 L 752,240 L 748,270 L 740,280 L 700,282 L 695,260 L 695,220 L 698,190 Z",
  KY: "M 650,305 L 745,290 L 755,300 L 760,315 L 750,335 L 730,340 L 670,340 L 650,335 L 645,320 Z",
  TN: "M 620,345 L 760,340 L 768,350 L 768,370 L 760,382 L 625,388 L 618,375 L 615,360 Z",
  MS: "M 575,395 L 615,392 L 620,415 L 620,455 L 618,480 L 610,490 L 590,492 L 578,480 L 575,450 L 575,420 Z",
  AL: "M 625,395 L 670,392 L 675,420 L 678,455 L 678,485 L 670,492 L 640,495 L 628,488 L 625,455 L 622,420 Z",
  GA: "M 680,395 L 730,390 L 738,410 L 740,445 L 738,475 L 730,490 L 700,495 L 685,490 L 680,460 L 678,425 Z",
  FL: "M 700,498 L 740,492 L 755,500 L 765,520 L 770,545 L 760,570 L 740,585 L 720,580 L 710,560 L 705,540 L 698,520 Z",
  SC: "M 740,390 L 780,380 L 800,392 L 805,415 L 795,435 L 770,440 L 745,435 L 738,420 Z",
  NC: "M 748,345 L 850,335 L 860,345 L 862,365 L 850,378 L 810,382 L 775,385 L 748,380 L 740,365 Z",
  VA: "M 755,300 L 845,285 L 858,295 L 860,315 L 855,335 L 835,340 L 775,345 L 760,340 L 755,320 Z",
  WV: "M 745,270 L 770,265 L 785,275 L 790,295 L 785,315 L 775,325 L 758,328 L 750,318 L 748,295 Z",
  PA: "M 758,195 L 840,185 L 848,195 L 850,220 L 848,250 L 840,260 L 758,265 L 755,245 L 755,220 Z",
  NY: "M 800,105 L 855,95 L 870,105 L 878,120 L 880,150 L 875,175 L 860,185 L 810,188 L 790,182 L 775,175 L 770,155 L 775,130 Z",
  NJ: "M 852,210 L 868,205 L 875,215 L 878,235 L 875,260 L 868,275 L 855,272 L 850,250 L 850,230 Z",
  CT: "M 870,165 L 895,160 L 900,170 L 900,185 L 895,192 L 872,192 L 870,180 Z",
  RI: "M 902,168 L 915,165 L 918,175 L 916,188 L 908,192 L 902,185 Z",
  MA: "M 878,148 L 920,140 L 930,148 L 928,158 L 918,165 L 895,162 L 880,160 Z",
  VT: "M 860,80 L 878,76 L 882,90 L 882,120 L 878,135 L 862,138 L 858,120 L 858,95 Z",
  NH: "M 882,78 L 898,74 L 903,88 L 903,118 L 900,135 L 885,138 L 882,120 L 882,95 Z",
  ME: "M 902,30 L 930,22 L 940,35 L 942,65 L 938,90 L 928,100 L 915,105 L 905,100 L 900,80 L 900,55 Z",
  DE: "M 855,248 L 870,245 L 874,255 L 874,275 L 868,282 L 856,280 L 854,265 Z",
  MD: "M 800,265 L 850,258 L 855,265 L 858,280 L 855,292 L 845,295 L 808,298 L 800,290 L 798,278 Z",
  AK: "M 70,460 L 130,450 L 165,455 L 180,470 L 175,495 L 155,510 L 120,515 L 85,510 L 65,495 L 60,480 Z",
  HI: "M 250,490 L 270,485 L 285,490 L 295,500 L 290,515 L 275,520 L 260,518 L 248,508 L 245,498 Z",
};

const LEGEND_LABELS: Record<string, { green: string; yellow: string; red: string }> = {
  unregistered: {
    green: "Legal -- no title/plate needed",
    yellow: "Legal with restrictions (age, trails, permits)",
    red: "Illegal on public land / heavy restrictions",
  },
  plated: {
    green: "Street-legal plating available",
    yellow: "Plating possible with modifications",
    red: "No UTV plating pathway",
  },
  "non-resident": {
    green: "Non-residents welcome, no extra permits",
    yellow: "Temporary permit / fee required",
    red: "Non-resident access heavily restricted",
  },
};

const VIEW_OPTIONS: { value: "unregistered" | "plated" | "non-resident"; label: string }[] = [
  { value: "unregistered", label: "Unregistered" },
  { value: "plated", label: "Plated" },
  { value: "non-resident", label: "Non-Resident" },
];

const STATUS_COLORS: Record<string, string> = {
  green: "#10B981",
  yellow: "#EAB308",
  red: "#EF4444",
};

export default function LegalHeatMap({
  statuses,
  view,
  onViewChange,
  selectedStates,
  onStateToggle,
}: LegalHeatMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const statusMap = new Map(statuses.map((s) => [s.stateCode, s.status]));

  const getFill = (code: string): string => {
    const status = statusMap.get(code);
    if (!status) return "var(--muted)";
    return STATUS_COLORS[status];
  };

  const getHoverFill = (code: string): string => {
    const status = statusMap.get(code);
    if (!status) return "var(--border)";
    switch (status) {
      case "green":  return "#34D399";
      case "yellow": return "#FACC15";
      case "red":    return "#F87171";
      default:       return "var(--border)";
    }
  };

  const legend = LEGEND_LABELS[view] ?? LEGEND_LABELS.unregistered;

  return (
    <div className="bg-muted border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          OHV Legal Status Map
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {VIEW_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onViewChange(opt.value)}
            className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md border transition-colors ${
              view === opt.value
                ? "bg-primary text-white border-primary"
                : "bg-muted border-border text-muted-foreground hover:border-primary/40"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <svg
          viewBox="0 0 960 600"
          className="w-full"
          role="img"
          aria-label="US map showing OHV legal status by state"
        >
          <rect width="960" height="600" fill="transparent" />

          <line x1="40" y1="445" x2="200" y2="445" stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
          <line x1="230" y1="475" x2="310" y2="475" stroke="var(--border)" strokeWidth={1} strokeDasharray="4 3" />
          <text x="70" y="440" fill="var(--muted-foreground)" fontSize="9" fontFamily="sans-serif">AK</text>
          <text x="250" y="473" fill="var(--muted-foreground)" fontSize="9" fontFamily="sans-serif">HI</text>

          {Object.entries(STATE_PATHS).map(([code, d]) => {
            const isSelected = selectedStates.includes(code);
            const isHovered = hoveredState === code;
            const fill = isHovered ? getHoverFill(code) : getFill(code);

            return (
              <path
                key={code}
                id={code}
                d={d}
                fill={fill}
                stroke={isSelected ? "#C45D2C" : "var(--border)"}
                strokeWidth={isSelected ? 2 : 0.75}
                className="cursor-pointer transition-colors duration-150"
                onClick={() => onStateToggle(code)}
                onMouseEnter={() => setHoveredState(code)}
                onMouseLeave={() => setHoveredState(null)}
              >
                <title>{STATE_NAMES[code] ?? code}</title>
              </path>
            );
          })}

          {Object.entries(STATE_PATHS).map(([code, d]) => {
            const nums = d.match(/[\d.]+/g)?.map(Number) ?? [];
            let cx = 0, cy = 0, count = 0;
            for (let i = 0; i < nums.length - 1; i += 2) {
              cx += nums[i]; cy += nums[i + 1]; count++;
            }
            if (count > 0) { cx /= count; cy /= count; }
            const tinyStates = ["CT", "RI", "DE", "NH", "VT", "MA", "NJ", "MD"];
            if (tinyStates.includes(code)) return null;
            return (
              <text
                key={`label-${code}`}
                x={cx}
                y={cy + 3}
                textAnchor="middle"
                fill="var(--foreground)"
                fontSize="9"
                fontWeight="bold"
                fontFamily="sans-serif"
                pointerEvents="none"
                opacity={0.7}
              >
                {code}
              </text>
            );
          })}
        </svg>

        {hoveredState && (
          <div className="absolute top-2 right-2 bg-background border border-border rounded-md px-3 py-1.5 shadow-lg pointer-events-none">
            <span className="text-xs font-bold text-foreground">
              {STATE_NAMES[hoveredState] ?? hoveredState}
            </span>
            {statusMap.has(hoveredState) && (
              <span
                className="inline-block w-2.5 h-2.5 rounded-full ml-2 align-middle"
                style={{ backgroundColor: STATUS_COLORS[statusMap.get(hoveredState)!] }}
              />
            )}
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {(["green", "yellow", "red"] as const).map((status) => (
          <div key={status} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-sm flex-shrink-0"
              style={{ backgroundColor: STATUS_COLORS[status] }}
            />
            <span className="text-[11px] text-muted-foreground leading-tight">
              {legend[status]}
            </span>
          </div>
        ))}
      </div>

      {selectedStates.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedStates.map((code) => (
            <button
              key={code}
              onClick={() => onStateToggle(code)}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border transition-colors"
              style={{ borderColor: "#C45D2C", color: "#C45D2C" }}
            >
              {code}
              <span className="text-[9px] opacity-60">&times;</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-[10px] text-muted-foreground leading-relaxed">
        <strong>Disclaimer:</strong> OHV/UTV laws change frequently and vary by county, trail
        system, and land-management agency (BLM, USFS, state parks). This map is a general
        reference only &mdash; always verify current regulations with your state&rsquo;s DMV or
        OHV office before riding. Prepper Evolution is not liable for fines or legal issues
        resulting from outdated information.
      </p>
    </div>
  );
}
