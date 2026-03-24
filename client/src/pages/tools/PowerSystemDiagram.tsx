
import type { WireCircuit } from "./power-system-compute";

// ─── Power System Block Diagram (SVG) ──────────────────────────────
// Simplified block diagram — not a full schematic.
// Color-coded by voltage drop: green ≤3%, amber 3-5%, red >5%.

interface PowerSystemDiagramProps {
  circuits: WireCircuit[];
  hasSolar: boolean;
  totalBankAh: number;
}

const COLORS = {
  pass: "#10B981",    // green
  warn: "#F59E0B",    // amber
  fail: "#EF4444",    // red
  block: "#374151",   // dark gray fill
  blockStroke: "#6B7280",
  text: "#F5F5F0",
  label: "#9CA3AF",
  wire: "#6B7280",
};

function statusColor(pct: number): string {
  if (pct <= 3) return COLORS.pass;
  if (pct <= 5) return COLORS.warn;
  return COLORS.fail;
}

function Block({
  x, y, w, h, label, hasWarning,
}: {
  x: number; y: number; w: number; h: number; label: string; hasWarning?: boolean;
}) {
  return (
    <g>
      <rect
        x={x} y={y} width={w} height={h} rx={6}
        fill={COLORS.block}
        stroke={hasWarning ? COLORS.fail : COLORS.blockStroke}
        strokeWidth={hasWarning ? 2 : 1}
        strokeDasharray={hasWarning ? "6 3" : undefined}
      />
      <text
        x={x + w / 2} y={y + h / 2}
        textAnchor="middle" dominantBaseline="central"
        fill={COLORS.text} fontSize={11} fontWeight={600}
      >
        {label}
      </text>
    </g>
  );
}

function WireLabel({
  x, y, awg, fuse, dropPct,
}: {
  x: number; y: number; awg: string; fuse: number; dropPct: number;
}) {
  const color = statusColor(dropPct);
  return (
    <g>
      <text x={x} y={y - 4} textAnchor="middle" fill={color} fontSize={9} fontWeight={700}>
        {awg} AWG
      </text>
      {fuse > 0 && (
        <text x={x} y={y + 8} textAnchor="middle" fill={COLORS.label} fontSize={8}>
          {fuse}A fuse
        </text>
      )}
    </g>
  );
}

function HLine({
  x1, x2, y, awg, fuse, dropPct,
}: {
  x1: number; x2: number; y: number; awg: string; fuse: number; dropPct: number;
}) {
  const color = statusColor(dropPct);
  const midX = (x1 + x2) / 2;
  return (
    <g>
      <line x1={x1} y1={y} x2={x2} y2={y} stroke={color} strokeWidth={2} />
      <WireLabel x={midX} y={y - 2} awg={awg} fuse={fuse} dropPct={dropPct} />
    </g>
  );
}

function VLine({
  x, y1, y2, color,
}: {
  x: number; y1: number; y2: number; color: string;
}) {
  return <line x1={x} y1={y1} x2={x} y2={y2} stroke={color} strokeWidth={2} />;
}

export default function PowerSystemDiagram({ circuits, hasSolar, totalBankAh }: PowerSystemDiagramProps) {
  const circuitMap = new Map(circuits.map((c) => [c.id, c]));
  const starterToDcDc = circuitMap.get("starter-to-dcdc");
  const dcdcToAux = circuitMap.get("dcdc-to-aux");
  const solarToCtrl = circuitMap.get("solar-to-controller");
  const auxToPanel = circuitMap.get("aux-to-panel");
  const branchCircuits = circuits.filter((c) => c.id.startsWith("branch-"));

  // Layout constants
  const svgW = 700;
  const blockW = 130;
  const blockH = 40;
  const branchBlockW = 110;
  const branchBlockH = 32;
  const maxVisibleBranches = 8;
  const visibleBranches = branchCircuits.slice(0, maxVisibleBranches);
  const branchCount = visibleBranches.length || 1;

  // Calculate SVG height based on content
  const topRowY = 30;
  const auxBankY = topRowY;
  const fusePanelY = auxBankY + blockH + 60;
  const branchY = fusePanelY + blockH + 50;
  const solarRowY = hasSolar ? topRowY + blockH + 50 : 0;
  const svgH = branchY + branchBlockH + 55;

  // Horizontal positions
  const starterX = 20;
  const dcdcX = starterX + blockW + 60;
  const auxX = dcdcX + blockW + 60;
  const solarX = hasSolar ? 20 : 0;
  const ctrlX = hasSolar ? solarX + blockW + 60 : 0;
  const fusePanelX = auxX;

  // Branch spacing
  const totalBranchW = branchCount * branchBlockW + (branchCount - 1) * 12;
  const branchStartX = fusePanelX + blockW / 2 - totalBranchW / 2;

  return (
    <div className="w-full overflow-x-auto bg-muted border border-border rounded-lg p-4">
      <h4 className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-3">
        System Wiring Diagram
      </h4>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        width="100%"
        preserveAspectRatio="xMidYMin meet"
        role="img"
        aria-label="12V power system wiring diagram"
        className="max-w-full"
      >
        {/* ─── Top Row: Starter → DC-DC → Aux Bank ─── */}
        <Block x={starterX} y={topRowY} w={blockW} h={blockH} label="Starter Battery" />

        {starterToDcDc && (
          <HLine
            x1={starterX + blockW}
            x2={dcdcX}
            y={topRowY + blockH / 2}
            awg={starterToDcDc.recommendedAwg}
            fuse={starterToDcDc.fuseAmps}
            dropPct={starterToDcDc.actualDropPct}
          />
        )}

        <Block x={dcdcX} y={topRowY} w={blockW} h={blockH} label="DC-DC Charger" />

        {dcdcToAux && (
          <HLine
            x1={dcdcX + blockW}
            x2={auxX}
            y={topRowY + blockH / 2}
            awg={dcdcToAux.recommendedAwg}
            fuse={dcdcToAux.fuseAmps}
            dropPct={dcdcToAux.actualDropPct}
          />
        )}

        <Block
          x={auxX} y={auxBankY} w={blockW} h={blockH}
          label={`Aux Bank (${totalBankAh}Ah)`}
          hasWarning={totalBankAh > 255}
        />

        {/* ─── Solar Row (if configured) ─── */}
        {hasSolar && solarToCtrl && (
          <>
            <Block x={solarX} y={solarRowY} w={blockW} h={blockH} label="Solar Panel(s)" />
            <HLine
              x1={solarX + blockW}
              x2={ctrlX}
              y={solarRowY + blockH / 2}
              awg={solarToCtrl.recommendedAwg}
              fuse={solarToCtrl.fuseAmps}
              dropPct={solarToCtrl.actualDropPct}
            />
            <Block x={ctrlX} y={solarRowY} w={blockW} h={blockH} label="Charge Controller" />

            {/* Controller → Aux Bank (vertical + horizontal) */}
            <VLine
              x={ctrlX + blockW / 2}
              y1={solarRowY}
              y2={auxBankY + blockH / 2}
              color={COLORS.wire}
            />
            <line
              x1={ctrlX + blockW / 2}
              y1={auxBankY + blockH / 2}
              x2={auxX}
              y2={auxBankY + blockH / 2}
              stroke={COLORS.wire}
              strokeWidth={1.5}
              strokeDasharray="4 2"
            />
          </>
        )}

        {/* ─── Aux Bank → Fuse Panel ─── */}
        {auxToPanel && (
          <>
            <VLine
              x={auxX + blockW / 2}
              y1={auxBankY + blockH}
              y2={fusePanelY}
              color={statusColor(auxToPanel.actualDropPct)}
            />
            <text
              x={auxX + blockW / 2 + 8}
              y={(auxBankY + blockH + fusePanelY) / 2 - 4}
              fill={statusColor(auxToPanel.actualDropPct)}
              fontSize={9} fontWeight={700}
            >
              {auxToPanel.recommendedAwg} AWG
            </text>
            <text
              x={auxX + blockW / 2 + 8}
              y={(auxBankY + blockH + fusePanelY) / 2 + 8}
              fill={COLORS.label} fontSize={8}
            >
              {auxToPanel.fuseAmps}A main fuse
            </text>
          </>
        )}

        <Block x={fusePanelX} y={fusePanelY} w={blockW} h={blockH} label="Fuse Panel" />

        {/* ─── Branch Circuits ─── */}
        {visibleBranches.map((branch, i) => {
          const bx = branchStartX + i * (branchBlockW + 12);
          const bCenterX = bx + branchBlockW / 2;
          const panelCenterX = fusePanelX + blockW / 2;
          const color = statusColor(branch.actualDropPct);

          // Short label
          const shortLabel = branch.label
            .replace("Branch: ", "")
            .replace(/\([^)]*\)/, "")
            .trim()
            .slice(0, 14);

          return (
            <g key={branch.id}>
              {/* Vertical line from fuse panel */}
              <line
                x1={panelCenterX} y1={fusePanelY + blockH}
                x2={bCenterX} y2={branchY}
                stroke={color} strokeWidth={1.5}
              />
              <Block
                x={bx} y={branchY} w={branchBlockW} h={branchBlockH}
                label={shortLabel}
                hasWarning={branch.status === "fail"}
              />
              <text
                x={bCenterX} y={branchY + branchBlockH + 12}
                textAnchor="middle" fill={color} fontSize={8} fontWeight={600}
              >
                {branch.recommendedAwg} AWG / {branch.fuseAmps}A
              </text>
            </g>
          );
        })}

        {branchCircuits.length > maxVisibleBranches && (
          <text
            x={branchStartX + totalBranchW + 20}
            y={branchY + branchBlockH / 2}
            fill={COLORS.label} fontSize={10}
          >
            +{branchCircuits.length - maxVisibleBranches} more
          </text>
        )}

        {/* ─── Legend ─── */}
        <g transform={`translate(${svgW - 180}, ${svgH - 22})`}>
          <circle cx={0} cy={0} r={4} fill={COLORS.pass} />
          <text x={8} y={3} fill={COLORS.label} fontSize={8}>≤3% drop</text>
          <circle cx={60} cy={0} r={4} fill={COLORS.warn} />
          <text x={68} y={3} fill={COLORS.label} fontSize={8}>3-5%</text>
          <circle cx={108} cy={0} r={4} fill={COLORS.fail} />
          <text x={116} y={3} fill={COLORS.label} fontSize={8}>&gt;5%</text>
        </g>
      </svg>
    </div>
  );
}
