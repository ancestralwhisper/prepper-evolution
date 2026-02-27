interface Segment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: Segment[];
  totalLabel: string;
  totalValue: string;
  size?: number;
}

export default function DonutChart({ segments, totalLabel, totalValue, size = 200 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-muted-foreground text-sm">Add gear to see breakdown</p>
      </div>
    );
  }

  const strokeWidth = 28;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let offset = 0;
  const arcs = segments
    .filter((s) => s.value > 0)
    .map((segment) => {
      const pct = segment.value / total;
      const dashLength = pct * circumference;
      const dashOffset = -offset;
      offset += dashLength;

      return {
        ...segment,
        pct,
        dashArray: `${dashLength} ${circumference - dashLength}`,
        dashOffset,
      };
    });

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`Weight breakdown chart: ${totalValue}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-border"
          opacity={0.3}
        />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={strokeWidth}
            strokeDasharray={arc.dashArray}
            strokeDashoffset={arc.dashOffset}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-500"
          >
            <title>{`${arc.label}: ${arc.value.toFixed(1)} oz (${(arc.pct * 100).toFixed(0)}%)`}</title>
          </circle>
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-display font-bold text-foreground">{totalValue}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wide">{totalLabel}</span>
      </div>
    </div>
  );
}

export function ChartLegend({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const active = segments.filter((s) => s.value > 0).sort((a, b) => b.value - a.value);

  if (active.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-4">
      {active.map((s) => (
        <div key={s.label} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-sm shrink-0"
            style={{ backgroundColor: s.color }}
            aria-hidden="true"
          />
          <span className="text-muted-foreground truncate">{s.label}</span>
          <span className="text-foreground font-medium ml-auto">
            {total > 0 ? `${((s.value / total) * 100).toFixed(0)}%` : "0%"}
          </span>
        </div>
      ))}
    </div>
  );
}
