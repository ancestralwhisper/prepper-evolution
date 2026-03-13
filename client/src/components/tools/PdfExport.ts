/**
 * Prepper Evolution — Branded PDF Export Utility
 * Generates downloadable PDFs for the BOB and Solar calculators.
 * Uses jsPDF with PE brand colors, logo, and affiliate links.
 */
import jsPDF from "jspdf";

// ─── PE Brand Colors ───
const ACCENT = "#C45D2C";
const DARK = "#2C2C2C";
const MUTED = "#6B6B6B";
const LIGHT_BG = "#F5F5F0";
const TABLE_BORDER = "#D4D4D4";

// ─── Helpers ───
function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/** Load the PE badge from /pe-badge.png and return as base64 data URL */
async function loadLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/pe-badge.png");
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Draw rounded rect fill */
function roundedRect(doc: jsPDF, x: number, y: number, w: number, h: number, r: number, color: string) {
  const [cr, cg, cb] = hexToRgb(color);
  doc.setFillColor(cr, cg, cb);
  doc.roundedRect(x, y, w, h, r, r, "F");
}

/** Add page footer */
function addFooter(doc: jsPDF, pageW: number) {
  const y = 282;
  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.setLineWidth(0.3);
  doc.line(15, y, pageW - 15, y);
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text("Generated at prepperevolution.com — Affiliate links help support our free tools", pageW / 2, y + 4, { align: "center" });
  doc.text(`Page ${doc.getNumberOfPages()}`, pageW - 15, y + 4, { align: "right" });
}

/** Check if we need a new page, and if so add footer to current + new page */
function checkPage(doc: jsPDF, y: number, needed: number, pageW: number): number {
  if (y + needed > 275) {
    addFooter(doc, pageW);
    doc.addPage();
    return 20;
  }
  return y;
}

function wrappedTextHeight(doc: jsPDF, text: string, maxWidth: number, lineHeightMm: number): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  return lines.length * lineHeightMm;
}

function truncateUrl(doc: jsPDF, url: string, maxWidth: number): string {
  if (doc.getTextWidth(url) <= maxWidth) return url;
  while (url.length > 10 && doc.getTextWidth(url + "...") > maxWidth) {
    url = url.slice(0, -1);
  }
  return url + "...";
}

// ─── BOB PDF Data Interface ───
export interface BobPdfData {
  bodyWeight: number;
  totalLbs: number;
  totalOz: number;
  pctBodyWeight: number;
  statusLabel: string;
  items: {
    name: string;
    category: string;
    catColor: string;
    weightOz: number;
    qty: number;
  }[];
  missingEssentials: string[];
  recommendations: { name: string; url: string }[];
}

// ─── Solar PDF Data Interface ───
export interface SolarPdfData {
  people: number;
  days: number;
  region: string;
  totalDailyWh: number;
  batteryNeeded: number;
  solarNeeded: number;
  peakWatts: number;
  devices: {
    name: string;
    category: string;
    catColor: string;
    watts: number;
    qty: number;
    hours: number;
    dailyWh: number;
  }[];
  stationRecs: { name: string; capacity: string; output: string; price: string; url: string; note: string }[];
  panelRecs: { name: string; watts: number; price: string; url: string; note: string }[];
}

// ─── Shared Header ───
async function drawHeader(doc: jsPDF, title: string, pageW: number): Promise<number> {
  const logo = await loadLogoBase64();

  // Top accent bar
  roundedRect(doc, 0, 0, pageW, 4, 0, ACCENT);

  let y = 14;
  if (logo) {
    try {
      doc.addImage(logo, "PNG", 15, y - 4, 22, 22);
    } catch {
      // Logo failed — skip it
    }
  }

  const textX = logo ? 42 : 15;
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("Prepper Evolution", textX, y + 4);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text(title, textX, y + 11);

  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(MUTED));
  const dateStr = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  doc.text(dateStr, pageW - 15, y + 4, { align: "right" });

  // Divider line under header
  y = 40;
  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setLineWidth(0.5);
  doc.line(15, y, pageW - 15, y);

  return y + 6;
}

// ─── Summary Stats Box ───
function drawSummaryBox(
  doc: jsPDF,
  y: number,
  stats: { label: string; value: string; sub?: string }[],
  pageW: number
): number {
  const boxW = pageW - 30;
  const boxH = 28;
  roundedRect(doc, 15, y, boxW, boxH, 3, LIGHT_BG);

  const colW = boxW / stats.length;
  const colPad = 4;
  const maxTextW = colW - colPad * 2;
  stats.forEach((stat, i) => {
    const cx = 15 + colW * i + colW / 2;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(stat.label.toUpperCase(), cx, y + 7, { align: "center" });

    let valueFontSize = 14;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(valueFontSize);
    while (valueFontSize > 7 && doc.getTextWidth(stat.value) > maxTextW) {
      valueFontSize -= 0.5;
      doc.setFontSize(valueFontSize);
    }
    doc.setTextColor(...hexToRgb(DARK));
    const displayValue = doc.getTextWidth(stat.value) > maxTextW
      ? truncateUrl(doc, stat.value, maxTextW)
      : stat.value;
    doc.text(displayValue, cx, y + 16, { align: "center" });

    if (stat.sub) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      const subMaxW = maxTextW;
      const displaySub = doc.getTextWidth(stat.sub) > subMaxW
        ? truncateUrl(doc, stat.sub, subMaxW)
        : stat.sub;
      doc.text(displaySub, cx, y + 22, { align: "center" });
    }

    // Column divider
    if (i < stats.length - 1) {
      doc.setDrawColor(...hexToRgb(TABLE_BORDER));
      doc.setLineWidth(0.2);
      doc.line(15 + colW * (i + 1), y + 4, 15 + colW * (i + 1), y + boxH - 4);
    }
  });

  return y + boxH + 6;
}

// ─── Table Drawing Helpers ───
function drawTableHeader(doc: jsPDF, y: number, columns: { label: string; x: number; align?: "left" | "center" | "right" }[]): number {
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(MUTED));
  columns.forEach((col) => {
    doc.text(col.label, col.x, y, { align: col.align || "left" });
  });
  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.setLineWidth(0.3);
  doc.line(15, y + 2, 195, y + 2);
  return y + 6;
}

function drawCategoryRow(doc: jsPDF, y: number, catName: string, catColor: string, pageW: number): number {
  // Category dot
  const [cr, cg, cb] = hexToRgb(catColor);
  doc.setFillColor(cr, cg, cb);
  doc.circle(18, y - 1.2, 1.5, "F");

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(catName, 22, y);

  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.setLineWidth(0.1);
  doc.line(15, y + 2, pageW - 15, y + 2);

  return y + 5;
}

// ════════════════════════════════════════════════════════
// BOB PDF GENERATOR
// ════════════════════════════════════════════════════════
export async function generateBobPdf(data: BobPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  let y = await drawHeader(doc, "Bug Out Bag Calculator Results", pageW);

  // Summary stats
  y = drawSummaryBox(doc, y, [
    { label: "Total Weight", value: `${data.totalLbs.toFixed(1)} lbs`, sub: `${data.totalOz.toFixed(0)} oz` },
    { label: "% Body Weight", value: `${data.pctBodyWeight.toFixed(1)}%`, sub: `of ${data.bodyWeight} lbs` },
    { label: "Items", value: `${data.items.length}` },
    { label: "Status", value: data.statusLabel, sub: `Max: ${(data.bodyWeight * 0.25).toFixed(0)} lbs (25%)` },
  ], pageW);

  // ─── Gear Table ───
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("GEAR LIST", 15, y);
  y += 5;

  y = drawTableHeader(doc, y, [
    { label: "ITEM", x: 22 },
    { label: "QTY", x: 130, align: "center" },
    { label: "EACH", x: 157, align: "right" },
    { label: "TOTAL", x: 190, align: "right" },
  ]);

  // Group items by category
  const categoryMap = new Map<string, { catColor: string; items: BobPdfData["items"] }>();
  for (const item of data.items) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, { catColor: item.catColor, items: [] });
    }
    categoryMap.get(item.category)!.items.push(item);
  }

  for (const [catName, group] of categoryMap) {
    y = checkPage(doc, y, 10, pageW);
    y = drawCategoryRow(doc, y, catName, group.catColor, pageW);

    for (const item of group.items) {
      y = checkPage(doc, y, 5, pageW);
      const totalItemOz = item.weightOz * item.qty;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(item.name, 22, y);

      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(item.qty > 1 ? `x${item.qty}` : "", 130, y, { align: "center" });
      doc.text(`${item.weightOz} oz`, 157, y, { align: "right" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(`${totalItemOz} oz`, 190, y, { align: "right" });

      y += 4.5;
    }
  }

  // Total row
  y = checkPage(doc, y, 8, pageW);
  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setLineWidth(0.5);
  doc.line(15, y - 1, 195, y - 1);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("TOTAL", 157, y + 3, { align: "right" });
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text(`${data.totalOz.toFixed(0)} oz (${data.totalLbs.toFixed(1)} lbs)`, 190, y + 3, { align: "right" });
  y += 10;

  // ─── Missing Essentials ───
  if (data.missingEssentials.length > 0) {
    y = checkPage(doc, y, 12 + data.missingEssentials.length * 4, pageW);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(ACCENT));
    doc.text("MISSING ESSENTIALS", 15, y);
    y += 5;

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(DARK));
    for (const name of data.missingEssentials) {
      y = checkPage(doc, y, 5, pageW);
      doc.setFillColor(...hexToRgb(ACCENT));
      doc.circle(18, y - 1, 1, "F");
      doc.text(name, 22, y);
      y += 4;
    }
    y += 4;
  }

  // ─── Recommendations ───
  if (data.recommendations.length > 0) {
    y = checkPage(doc, y, 12 + data.recommendations.length * 8, pageW);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("RECOMMENDED GEAR", 15, y);
    y += 5;

    for (const rec of data.recommendations) {
      y = checkPage(doc, y, 8, pageW);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(rec.name, 22, y);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(ACCENT));
      const bobUrl = truncateUrl(doc, rec.url, pageW - 40);
      doc.text(bobUrl, 22, y + 3.5);
      y += 8;
    }
    y += 2;
  }

  // Footer on last page
  addFooter(doc, pageW);

  doc.save("prepper-evolution-bug-out-bag.pdf");
}

// ════════════════════════════════════════════════════════
// SOLAR PDF GENERATOR
// ════════════════════════════════════════════════════════

function fmtWh(wh: number): string {
  if (wh >= 1000) return `${(wh / 1000).toFixed(1)} kWh`;
  return `${Math.round(wh)} Wh`;
}

function fmtW(w: number): string {
  if (w >= 1000) return `${(w / 1000).toFixed(1)} kW`;
  return `${Math.round(w)} W`;
}

export async function generateSolarPdf(data: SolarPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  let y = await drawHeader(doc, "Solar & Power Calculator Results", pageW);

  // Summary stats
  y = drawSummaryBox(doc, y, [
    { label: "Daily Power Need", value: fmtWh(data.totalDailyWh), sub: "per day" },
    { label: "Battery Needed", value: fmtWh(data.batteryNeeded), sub: "min capacity" },
    { label: "Solar Panels", value: fmtW(data.solarNeeded), sub: data.region },
    { label: "Duration", value: `${data.days} day${data.days !== 1 ? "s" : ""}`, sub: `${data.people} ${data.people === 1 ? "person" : "people"}` },
  ], pageW);

  // ─── Device Table ───
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("DEVICE BREAKDOWN", 15, y);
  y += 5;

  y = drawTableHeader(doc, y, [
    { label: "DEVICE", x: 22 },
    { label: "WATTS", x: 110, align: "center" },
    { label: "QTY", x: 127, align: "center" },
    { label: "HRS/DAY", x: 150, align: "center" },
    { label: "WH/DAY", x: 190, align: "right" },
  ]);

  // Group devices by category
  const categoryMap = new Map<string, { catColor: string; devices: SolarPdfData["devices"] }>();
  for (const device of data.devices) {
    if (!categoryMap.has(device.category)) {
      categoryMap.set(device.category, { catColor: device.catColor, devices: [] });
    }
    categoryMap.get(device.category)!.devices.push(device);
  }

  for (const [catName, group] of categoryMap) {
    y = checkPage(doc, y, 10, pageW);
    y = drawCategoryRow(doc, y, catName, group.catColor, pageW);

    for (const device of group.devices) {
      y = checkPage(doc, y, 5, pageW);

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(device.name, 22, y);

      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(`${device.watts}W`, 110, y, { align: "center" });
      doc.text(device.qty > 1 ? `x${device.qty}` : "1", 127, y, { align: "center" });
      doc.text(`${device.hours}h`, 150, y, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(`${Math.round(device.dailyWh)} Wh`, 190, y, { align: "right" });

      y += 4.5;
    }
  }

  // Total row
  y = checkPage(doc, y, 8, pageW);
  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setLineWidth(0.5);
  doc.line(15, y - 1, 195, y - 1);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("TOTAL DAILY", 150, y + 3, { align: "right" });
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text(fmtWh(data.totalDailyWh), 190, y + 3, { align: "right" });
  y += 10;

  // ─── Power Station Recommendations ───
  if (data.stationRecs.length > 0) {
    y = checkPage(doc, y, 12 + data.stationRecs.length * 12, pageW);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("RECOMMENDED POWER STATIONS", 15, y);
    y += 5;

    for (const ps of data.stationRecs) {
      y = checkPage(doc, y, 12, pageW);

      roundedRect(doc, 15, y - 3, pageW - 30, 14, 2, LIGHT_BG);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(ps.name, 19, y + 1);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(`${ps.capacity} / ${ps.output} — ${ps.price}`, 19, y + 5);

      doc.setFontSize(6.5);
      doc.setTextColor(...hexToRgb(ACCENT));
      const psUrl = truncateUrl(doc, ps.url, pageW - 38);
      doc.text(psUrl, 19, y + 9);

      y += 17;
    }
  }

  // ─── Solar Panel Recommendations ───
  if (data.panelRecs.length > 0) {
    y = checkPage(doc, y, 12 + data.panelRecs.length * 12, pageW);

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("RECOMMENDED SOLAR PANELS", 15, y);
    y += 5;

    for (const panel of data.panelRecs) {
      y = checkPage(doc, y, 12, pageW);

      roundedRect(doc, 15, y - 3, pageW - 30, 14, 2, LIGHT_BG);

      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(panel.name, 19, y + 1);

      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(`${panel.watts}W — ${panel.price}${panel.note ? ` — ${panel.note}` : ""}`, 19, y + 5);

      doc.setFontSize(6.5);
      doc.setTextColor(...hexToRgb(ACCENT));
      const panelUrl = truncateUrl(doc, panel.url, pageW - 38);
      doc.text(panelUrl, 19, y + 9);

      y += 17;
    }
  }

  // Footer on last page
  addFooter(doc, pageW);

  doc.save("prepper-evolution-solar-power.pdf");
}

// ─── RigSafe PDF Data Interface ───
export interface RigSafePdfData {
  vehicleName: string;
  rackName: string;
  tentName: string;
  awningName: string;
  tonneauName: string;
  rackStatic: { used: number; rating: number; pct: number };
  rackOnRoad: { used: number; rating: number; pct: number };
  rackOffRoad: { used: number; rating: number; pct: number };
  vehiclePayload: { used: number; rating: number; pct: number };
  weakestLink: {
    staticLimit: number; staticBottleneck: string;
    dynamicLimit: number; dynamicBottleneck: string;
    offRoadLimit: number; offRoadBottleneck: string;
  };
  totalHeightIn: number;
  garageHeightIn: number;
  garageFits: boolean;
  sleepingTotal: number;
  cgRaiseIn: number;
  stabilityNote: string;
  warnings: { level: string; message: string }[];
  weightBreakdown: { label: string; value: number }[];
  productLinks: { name: string; url: string }[];
}

// ─── RigSafe PDF Generator ───
export async function generateRigSafePdf(data: RigSafePdfData) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();

  let y = await drawHeader(doc, "RigSafe Overland Configurator — Build Sheet", pageW);

  // ─── Safety Disclaimer ───
  roundedRect(doc, 15, y, pageW - 30, 18, 3, "#FEF2F2");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(239, 68, 68);
  doc.text("SAFETY WARNING", 19, y + 5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6);
  doc.setTextColor(...hexToRgb(MUTED));
  const disclaimer = "This tool uses published manufacturer data and conservative estimates. It is for planning and educational purposes only. Always verify with your owner's manual and manufacturer documentation. Prepper Evolution assumes no liability.";
  doc.text(disclaimer, 19, y + 9, { maxWidth: pageW - 38 });
  y += 22;

  // ─── Vehicle & Setup Summary ───
  const summaryStats = [
    { label: "Vehicle", value: data.vehicleName || "Manual Entry" },
    { label: "Rack", value: data.rackName || "Manual Entry" },
    { label: "Tent", value: data.tentName || "None" },
  ];
  y = drawSummaryBox(doc, y, summaryStats, pageW);
  y += 4;

  // ─── Rack Load Budgets ───
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("RACK LOAD BUDGETS", 15, y);
  y += 5;

  const budgets = [
    { label: "Static (Sleeping)", ...data.rackStatic },
    { label: "On-Road Dynamic", ...data.rackOnRoad },
    { label: "Off-Road Dynamic", ...data.rackOffRoad },
    { label: "Vehicle Payload", ...data.vehiclePayload },
  ];

  for (const b of budgets) {
    y = checkPage(doc, y, 12, pageW);
    const barW = pageW - 70;
    const remaining = b.rating - b.used;
    const statusColor = b.pct >= 100 ? "#EF4444" : b.pct >= 85 ? "#F97316" : b.pct >= 70 ? "#EAB308" : "#10B981";
    const statusText = b.pct >= 100 ? "OVER LIMIT" : b.pct >= 85 ? "CAUTION" : b.pct >= 70 ? "NEAR MARGIN" : "GOOD";

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(b.label, 19, y);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(`${b.used} / ${b.rating} lbs (${b.pct}%) — ${remaining >= 0 ? remaining + " lbs remaining" : Math.abs(remaining) + " lbs OVER"}`, 19, y + 4);

    // Draw bar background
    roundedRect(doc, 19, y + 6, barW, 3, 1, "#E5E5E5");
    // Draw bar fill
    const fillW = Math.min(barW, barW * (b.pct / 100));
    if (fillW > 0) roundedRect(doc, 19, y + 6, fillW, 3, 1, statusColor);

    // Status label
    doc.setFontSize(6);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(statusColor));
    doc.text(statusText, pageW - 19, y + 2, { align: "right" });

    y += 13;
  }

  // ─── Weakest Link ───
  y = checkPage(doc, y, 22, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("WEAKEST LINK ANALYSIS", 15, y);
  y += 5;

  roundedRect(doc, 15, y, pageW - 30, 16, 3, LIGHT_BG);
  const wlColW = (pageW - 30) / 3;
  const wlItems = [
    { label: "Static", value: `${data.weakestLink.staticLimit} lbs`, sub: data.weakestLink.staticBottleneck },
    { label: "Dynamic", value: `${data.weakestLink.dynamicLimit} lbs`, sub: data.weakestLink.dynamicBottleneck },
    { label: "Off-Road", value: `${data.weakestLink.offRoadLimit} lbs`, sub: data.weakestLink.offRoadBottleneck },
  ];
  wlItems.forEach((item, i) => {
    const cx = 15 + wlColW * i + wlColW / 2;
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(item.label.toUpperCase(), cx, y + 4, { align: "center" });
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(item.value, cx, y + 9, { align: "center" });
    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(ACCENT));
    doc.text(`Bottleneck: ${item.sub}`, cx, y + 13, { align: "center" });
  });
  y += 22;

  // ─── Clearance & Capacity ───
  y = checkPage(doc, y, 20, pageW);
  const infoStats = [
    { label: "Total Height", value: `${data.totalHeightIn}"`, sub: data.garageFits ? `Fits ${data.garageHeightIn}" garage` : `WON'T FIT ${data.garageHeightIn}" garage` },
    { label: "Sleeping Capacity", value: String(data.sleepingTotal), sub: "total rig capacity" },
    { label: "CG Raise", value: `${data.cgRaiseIn}"`, sub: data.stabilityNote.slice(0, 40) },
  ];
  y = drawSummaryBox(doc, y, infoStats, pageW);
  y += 4;

  // ─── Weight Breakdown ───
  if (data.weightBreakdown.length > 0) {
    y = checkPage(doc, y, 10 + data.weightBreakdown.length * 5, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("WEIGHT BREAKDOWN", 15, y);
    y += 5;

    const totalW = data.weightBreakdown.reduce((s, w) => s + w.value, 0);
    for (const item of data.weightBreakdown) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(item.label, 19, y);
      doc.text(`${item.value} lbs`, 80, y);
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(`${totalW > 0 ? Math.round((item.value / totalW) * 100) : 0}%`, 105, y);
      y += 5;
    }
    y += 3;
  }

  // ─── Warnings ───
  if (data.warnings.length > 0) {
    y = checkPage(doc, y, 10 + data.warnings.length * 10, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("WARNINGS & NOTES", 15, y);
    y += 5;

    for (const w of data.warnings) {
      doc.setFontSize(6);
      const warnH = wrappedTextHeight(doc, w.message, pageW - 44, 3.2) + 2;
      y = checkPage(doc, y, warnH, pageW);
      const icon = w.level === "danger" ? "!!!" : w.level === "warning" ? "!!" : "i";
      const color = w.level === "danger" ? "#EF4444" : w.level === "warning" ? "#EAB308" : "#3B82F6";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(color));
      doc.text(icon, 19, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(w.message, 25, y, { maxWidth: pageW - 44 });
      y += warnH;
    }
  }

  // ─── Product Links ───
  if (data.productLinks.length > 0) {
    y = checkPage(doc, y, 10 + data.productLinks.length * 7, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("PRODUCT LINKS", 15, y);
    y += 5;

    for (const link of data.productLinks) {
      y = checkPage(doc, y, 7, pageW);
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(link.name, 19, y);
      doc.setFontSize(6);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(ACCENT));
      const linkUrl = truncateUrl(doc, link.url, pageW - 38);
      doc.text(linkUrl, 19, y + 4);
      y += 9;
    }
  }

  // Footer
  addFooter(doc, pageW);

  doc.save("prepper-evolution-rigsafe-build-sheet.pdf");
}

// ─── RigRated PDF Data Interface ───
export interface RigRatedPdfData {
  machineLabel: string;
  dryWeight: number;
  gvwr: number;
  payloadCapacity: number;
  payloadUsed: number;
  payloadPct: number;
  remaining: number;
  totalLoaded: number;
  stabilityIndex: number;
  stabilityNote: string;
  fuelRangeMiles: number;
  accessoriesWeight: number;
  occupantWeight: number;
  gearWeight: number;
  fuelWeight: number;
  trailScores: { name: string; status: string }[];
  legalSummary: string;
  certifiedBadge: boolean;
  warnings: { level: string; message: string }[];
  selectedAccessories: string[];
}

export async function generateRigRatedPdf(data: RigRatedPdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();
  let y = 15;

  // Header
  if (logo) {
    doc.addImage(logo, "PNG", 15, y - 5, 15, 15);
  }
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("RigRated Build Sheet", 35, y + 3);
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text(`Generated ${new Date().toLocaleDateString()} at prepperevolution.com`, 35, y + 8);
  y += 20;

  // Disclaimer
  const disclaimerText = "This tool is for planning purposes only. Always verify manufacturer specs, trail conditions, and state laws before riding. Exceeding GVWR voids warranty and risks safety.";
  doc.setFontSize(6);
  const disclaimerH = wrappedTextHeight(doc, disclaimerText, pageW - 42, 3) + 8;
  roundedRect(doc, 15, y, pageW - 30, disclaimerH, 2, "#FEF2F2");
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb("#EF4444"));
  doc.text("SAFETY DISCLAIMER", 19, y + 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text(disclaimerText, 19, y + 8, { maxWidth: pageW - 42 });
  y += disclaimerH + 4;

  // Machine summary
  roundedRect(doc, 15, y, pageW - 30, 22, 2, LIGHT_BG);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(data.machineLabel || "Manual Entry", 19, y + 6);

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  const specs = [
    `Dry: ${data.dryWeight.toLocaleString()} lbs`,
    `GVWR: ${data.gvwr.toLocaleString()} lbs`,
    `Payload Cap: ${data.payloadCapacity} lbs`,
    `Fuel Range: ~${data.fuelRangeMiles} mi`,
    `Stability: ${data.stabilityIndex}/10`,
  ];
  doc.text(specs.join("  |  "), 19, y + 12);

  // Payload bar
  const barY = y + 16;
  const barW = pageW - 42;
  const barH = 3;
  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.setFillColor(230, 230, 225);
  doc.roundedRect(19, barY, barW, barH, 1, 1, "FD");
  const fillW = Math.min(barW, barW * (data.payloadPct / 100));
  const barColor = data.payloadPct >= 100 ? "#EF4444" : data.payloadPct >= 85 ? "#F97316" : data.payloadPct >= 70 ? "#EAB308" : "#10B981";
  doc.setFillColor(...hexToRgb(barColor));
  doc.roundedRect(19, barY, fillW, barH, 1, 1, "F");
  doc.setFontSize(6);
  doc.text(`${data.payloadUsed} / ${data.payloadCapacity} lbs (${data.payloadPct}%)`, 19 + barW + 2, barY + 2.5);
  y += 26;

  // Weight breakdown
  y = checkPage(doc, y, 30, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("WEIGHT BREAKDOWN", 15, y);
  y += 5;

  const breakdown = [
    { label: "Accessories", value: data.accessoriesWeight },
    { label: "Occupants", value: data.occupantWeight },
    { label: "Gear & Supplies", value: data.gearWeight },
    { label: "Fuel (full tank)", value: data.fuelWeight },
  ].filter((b) => b.value > 0);

  for (const item of breakdown) {
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(item.label, 19, y);
    doc.text(`${item.value} lbs`, pageW - 19, y, { align: "right" });
    y += 5;
  }

  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setLineWidth(0.5);
  doc.line(19, y, pageW - 19, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.text("Total Payload Used", 19, y);
  doc.text(`${data.payloadUsed} lbs`, pageW - 19, y, { align: "right" });
  y += 4;
  doc.text("Remaining", 19, y);
  doc.setTextColor(...hexToRgb(data.remaining >= 0 ? "#10B981" : "#EF4444"));
  doc.text(`${data.remaining >= 0 ? data.remaining : `OVER by ${Math.abs(data.remaining)}`} lbs`, pageW - 19, y, { align: "right" });
  y += 8;

  // Trail compatibility
  if (data.trailScores.length > 0) {
    y = checkPage(doc, y, 10 + data.trailScores.length * 6, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("TRAIL COMPATIBILITY", 15, y);
    y += 5;

    for (const trail of data.trailScores) {
      const color = trail.status === "green" ? "#10B981" : trail.status === "yellow" ? "#EAB308" : "#EF4444";
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(color));
      doc.text(trail.status.toUpperCase(), 19, y);
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(trail.name, 35, y);
      y += 5;
    }
    y += 3;
  }

  // 14-Day Badge
  if (data.certifiedBadge) {
    y = checkPage(doc, y, 12, pageW);
    roundedRect(doc, 15, y, pageW - 30, 10, 2, "#ECFDF5");
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb("#10B981"));
    doc.text("14-DAY CERTIFIED", pageW / 2, y + 6, { align: "center" });
    y += 14;
  }

  // Warnings
  if (data.warnings.length > 0) {
    y = checkPage(doc, y, 10 + data.warnings.length * 10, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("WARNINGS", 15, y);
    y += 5;

    for (const w of data.warnings) {
      doc.setFontSize(6);
      const warnH = wrappedTextHeight(doc, w.message, pageW - 44, 3.2) + 2;
      y = checkPage(doc, y, warnH, pageW);
      const color = w.level === "danger" ? "#EF4444" : w.level === "warning" ? "#EAB308" : "#3B82F6";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(color));
      doc.text(w.level === "danger" ? "!!" : w.level === "warning" ? "!" : "i", 19, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(w.message, 25, y, { maxWidth: pageW - 44 });
      y += warnH;
    }
  }

  // Accessories list
  if (data.selectedAccessories.length > 0) {
    y = checkPage(doc, y, 10 + data.selectedAccessories.length * 4, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("INSTALLED ACCESSORIES", 15, y);
    y += 5;

    doc.setFontSize(6);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    for (const acc of data.selectedAccessories) {
      y = checkPage(doc, y, 5, pageW);
      doc.text(`- ${acc}`, 19, y);
      y += 4;
    }
  }

  addFooter(doc, pageW);
  doc.save("prepper-evolution-rigrated-build-sheet.pdf");
}

// ─── Power System PDF Data Interface ───
export interface PowerSystemPdfData {
  totalDailyAh: number;
  totalChargeAhPerDay: number;
  surplusAh: number;
  daysAutonomy: number;
  bankLabel: string;
  recommendedBankAh: number;
  bankAssessment: string;
  circuits: {
    label: string;
    distanceFt: number;
    maxAmps: number;
    awg: string;
    dropPct: number;
    fuseAmps: number;
    fuseType: string;
    status: string;
  }[];
  shoppingList: { category: string; name: string; spec: string }[];
  warnings: { level: string; message: string }[];
  safetyChecklist: { text: string; critical: boolean }[];
}

export async function generatePowerSystemPdf(data: PowerSystemPdfData): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  let y = await drawHeader(doc, "Power System Builder — 12V Aux Electrical Design", pageW);

  // Summary stats
  y = drawSummaryBox(doc, y, [
    { label: "Daily Load", value: `${data.totalDailyAh.toFixed(1)} Ah` },
    { label: "Daily Charge", value: `${data.totalChargeAhPerDay.toFixed(1)} Ah` },
    { label: data.surplusAh >= 0 ? "Surplus" : "Deficit", value: `${Math.abs(data.surplusAh).toFixed(1)} Ah` },
    { label: "Autonomy", value: `${data.daysAutonomy.toFixed(1)} days` },
  ], pageW);

  // Battery Assessment
  y = checkPage(doc, y, 16, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("BATTERY ASSESSMENT", 15, y);
  y += 5;
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text(`Bank: ${data.bankLabel} | Recommended: ${data.recommendedBankAh}Ah | ${data.bankAssessment}`, 19, y);
  y += 8;

  // Warnings
  if (data.warnings.length > 0) {
    y = checkPage(doc, y, 8 + data.warnings.length * 10, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb("#EF4444"));
    doc.text("WARNINGS", 15, y);
    y += 5;
    for (const w of data.warnings) {
      doc.setFontSize(6);
      const psWarnH = wrappedTextHeight(doc, w.message, pageW - 44, 3.2) + 2;
      y = checkPage(doc, y, psWarnH, pageW);
      const color = w.level === "critical" ? "#EF4444" : w.level === "warning" ? "#EAB308" : "#3B82F6";
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb(color));
      doc.text(w.level === "critical" ? "!!" : "!", 19, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(w.message, 25, y, { maxWidth: pageW - 44 });
      y += psWarnH;
    }
    y += 3;
  }

  // Wire Schedule
  y = checkPage(doc, y, 10 + data.circuits.length * 5, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("WIRE GAUGE SCHEDULE", 15, y);
  y += 5;

  y = drawTableHeader(doc, y, [
    { label: "CIRCUIT", x: 19 },
    { label: "DIST", x: 100, align: "center" },
    { label: "AMPS", x: 118, align: "center" },
    { label: "AWG", x: 135, align: "center" },
    { label: "DROP%", x: 155, align: "center" },
    { label: "FUSE", x: 175, align: "center" },
    { label: "STATUS", x: 192, align: "center" },
  ]);

  for (const c of data.circuits) {
    y = checkPage(doc, y, 5, pageW);
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(c.label.slice(0, 40), 19, y);
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(`${c.distanceFt}ft`, 100, y, { align: "center" });
    doc.text(`${c.maxAmps}A`, 118, y, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(c.awg, 135, y, { align: "center" });
    const dropColor = c.status === "pass" ? "#10B981" : c.status === "warn" ? "#EAB308" : "#EF4444";
    doc.setTextColor(...hexToRgb(dropColor));
    doc.text(`${c.dropPct.toFixed(1)}%`, 155, y, { align: "center" });
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(`${c.fuseAmps}A ${c.fuseType}`, 175, y, { align: "center" });
    doc.setTextColor(...hexToRgb(dropColor));
    doc.text(c.status.toUpperCase(), 192, y, { align: "center" });
    y += 4.5;
  }
  y += 4;

  // Shopping List
  y = checkPage(doc, y, 10 + data.shoppingList.length * 5, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("SHOPPING LIST", 15, y);
  y += 5;

  for (const item of data.shoppingList) {
    y = checkPage(doc, y, 5, pageW);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(item.name, 19, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(item.spec, 100, y);
    y += 4.5;
  }
  y += 4;

  // Safety Checklist
  y = checkPage(doc, y, 10 + data.safetyChecklist.length * 7, pageW);
  roundedRect(doc, 15, y - 3, pageW - 30, 6, 2, "#FEF2F2");
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb("#EF4444"));
  doc.text("SAFETY CHECKLIST", 19, y + 1);
  y += 8;

  for (const item of data.safetyChecklist) {
    doc.setFontSize(7);
    const checkH = wrappedTextHeight(doc, item.text, pageW - 44, 3.5) + 1.5;
    y = checkPage(doc, y, checkH, pageW);
    doc.setFont("helvetica", item.critical ? "bold" : "normal");
    doc.setTextColor(...hexToRgb(item.critical ? "#EF4444" : MUTED));
    doc.rect(19, y - 2.5, 3, 3);
    doc.text(item.text, 25, y, { maxWidth: pageW - 44 });
    y += checkH;
  }

  addFooter(doc, pageW);
  doc.save("prepper-evolution-power-system.pdf");
}

// ─── Trip Plan PDF Data Interface ───
export interface TripPlanPdfData {
  tripName: string;
  startDate: string;
  endDate: string;
  trailRoute: string;
  machineLabel: string;
  loadedWeight: number;
  payloadPct: number;
  fuelRange: number;
  roster: { name: string; medical: string; emergencyContact: string; emergencyPhone: string }[];
  commPlan: string;
  checkInSchedule: string;
  satelliteDevice: string;
  waypoints: { name: string; notes: string; isOvernight: boolean }[];
  nearestHospital: string;
  nearestFuel: string;
  nearestTowing: string;
  recoveryCapability: string;
  backupPlan: string;
  leaveBehindName: string;
  leaveBehindPhone: string;
}

export async function generateTripPlanPdf(data: TripPlanPdfData) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();
  let y = 15;

  // Header
  if (logo) {
    doc.addImage(logo, "PNG", 15, y - 5, 12, 12);
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb("#EF4444"));
  doc.text("EMERGENCY TRIP PLAN", 32, y + 2);
  doc.setFontSize(7);
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text("Leave this document with a trusted contact before departure", 32, y + 7);
  y += 16;

  // Trip Info
  roundedRect(doc, 15, y, pageW - 30, 20, 2, LIGHT_BG);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(data.tripName || "Untitled Trip", 19, y + 5);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  doc.text(`Dates: ${data.startDate || "TBD"} to ${data.endDate || "TBD"}`, 19, y + 10);
  doc.text(`Route: ${data.trailRoute || "TBD"}`, 19, y + 14);
  doc.text(`Vehicle: ${data.machineLabel} | Loaded: ${data.loadedWeight} lbs (${data.payloadPct}%) | Range: ~${data.fuelRange} mi`, 19, y + 18);
  y += 24;

  // Group Roster
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("GROUP ROSTER", 15, y);
  y += 5;

  for (const person of data.roster) {
    if (!person.name) continue;
    y = checkPage(doc, y, 12, pageW);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(person.name, 19, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    if (person.medical) doc.text(`Medical: ${person.medical}`, 19, y + 4);
    doc.text(`Emergency: ${person.emergencyContact} ${person.emergencyPhone}`, 19, y + 8);
    y += 12;
  }
  y += 2;

  // Communications
  y = checkPage(doc, y, 18, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("COMMUNICATIONS", 15, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  if (data.commPlan) { doc.text(`Comm Plan: ${data.commPlan}`, 19, y); y += 4; }
  if (data.checkInSchedule) { doc.text(`Check-in: ${data.checkInSchedule}`, 19, y); y += 4; }
  if (data.satelliteDevice) { doc.text(`Satellite: ${data.satelliteDevice}`, 19, y); y += 4; }
  y += 2;

  // Waypoints
  if (data.waypoints.some((w) => w.name)) {
    y = checkPage(doc, y, 10 + data.waypoints.length * 5, pageW);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("WAYPOINTS", 15, y);
    y += 5;

    for (let i = 0; i < data.waypoints.length; i++) {
      const wp = data.waypoints[i];
      if (!wp.name) continue;
      y = checkPage(doc, y, 5, pageW);
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      doc.text(`${i + 1}. ${wp.name}${wp.isOvernight ? " (CAMP)" : ""}`, 19, y);
      if (wp.notes) {
        doc.setTextColor(...hexToRgb(MUTED));
        doc.text(wp.notes, 50, y);
      }
      y += 5;
    }
    y += 2;
  }

  // Emergency Services
  y = checkPage(doc, y, 18, pageW);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text("EMERGENCY SERVICES", 15, y);
  y += 5;
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(MUTED));
  if (data.nearestHospital) { doc.text(`Hospital: ${data.nearestHospital}`, 19, y); y += 4; }
  if (data.nearestFuel) { doc.text(`Fuel: ${data.nearestFuel}`, 19, y); y += 4; }
  if (data.nearestTowing) { doc.text(`Towing: ${data.nearestTowing}`, 19, y); y += 4; }
  if (data.recoveryCapability) { doc.text(`Recovery: ${data.recoveryCapability}`, 19, y); y += 4; }
  if (data.backupPlan) { doc.text(`Backup Plan: ${data.backupPlan}`, 19, y); y += 4; }
  y += 4;

  // Leave-Behind Contact (highlighted)
  y = checkPage(doc, y, 16, pageW);
  roundedRect(doc, 15, y, pageW - 30, 14, 2, "#FEF2F2");
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb("#EF4444"));
  doc.text("IF OVERDUE — CONTACT:", 19, y + 5);
  doc.setFontSize(8);
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(`${data.leaveBehindName || "Not specified"} — ${data.leaveBehindPhone || "No phone"}`, 19, y + 10);

  addFooter(doc, pageW);
  doc.save("prepper-evolution-trip-plan.pdf");
}

// ─── Fuel & Range Planner PDF ──────────────────────────────────

export interface FuelRangePdfData {
  tripName: string;
  vehicleName: string | null;
  baseMpg: number;
  totalFuelGal: number;
  rangeMiles: number | null;
  gasPricePerGal: number;
  jerryCans: number;
  climateZone: string | null;
  segments: {
    name: string;
    terrain: string;
    distanceMiles: number;
    elevationGainFt: number;
    speedMph: number;
    adjustedMpg: number;
    fuelUsedGal: number;
    fuelRemainingGal: number;
    timeFormatted: string;
    isFuelStop: boolean;
    didRefuel: boolean;
    warnings: string[];
  }[];
  totalDistanceMiles: number;
  totalFuelUsedGal: number;
  fuelRemainingGal: number;
  totalTimeFormatted: string;
  totalFuelCost: number;
  outOfFuel: boolean;
  reserveWarning: boolean;
  pointOfNoReturnIdx: number | null;
  refuelStopCount: number;
  cacheGallons: number | null;
  cacheCans: number | null;
}

export async function generateFuelRangePdf(data: FuelRangePdfData): Promise<void> {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const logo = await loadLogoBase64();
  let y = 15;

  if (logo) {
    doc.addImage(logo, "PNG", 15, y, 18, 18);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text("Fuel & Range Plan", 37, y + 7);
    doc.setFontSize(10);
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(data.tripName, 37, y + 13);
  } else {
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(`Fuel & Range Plan: ${data.tripName}`, 15, y + 7);
  }
  y += 26;

  doc.setDrawColor(...hexToRgb(ACCENT));
  doc.setLineWidth(0.8);
  doc.line(15, y, pageW - 15, y);
  y += 6;

  roundedRect(doc, 15, y, pageW - 30, 28, 3, LIGHT_BG);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(MUTED));
  const col1 = 20;
  const col2 = pageW * 0.35;
  const col3 = pageW * 0.65;
  doc.text("VEHICLE", col1, y + 5);
  doc.text("MPG / FUEL", col2, y + 5);
  doc.text("TRIP TOTALS", col3, y + 5);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(data.vehicleName || "Manual / Default", col1, y + 11);
  doc.text(`${data.baseMpg} MPG / ${data.totalFuelGal} gal tank`, col2, y + 11);
  doc.text(`${data.totalDistanceMiles} mi / ${data.totalTimeFormatted}`, col3, y + 11);
  doc.text(data.jerryCans > 0 ? `+${data.jerryCans} jerry can${data.jerryCans > 1 ? "s" : ""} (${data.jerryCans * 5} gal extra)` : "No auxiliary fuel", col1, y + 17);
  doc.text(`Fuel used: ${data.totalFuelUsedGal} gal`, col2, y + 17);
  const remainText = data.outOfFuel ? "EMPTY \u2014 OUT OF FUEL" : `${data.fuelRemainingGal} gal remaining`;
  if (data.outOfFuel) {
    doc.setTextColor(...hexToRgb("#EF4444"));
  } else if (data.reserveWarning) {
    doc.setTextColor(...hexToRgb("#F59E0B"));
  } else {
    doc.setTextColor(...hexToRgb("#10B981"));
  }
  doc.text(remainText, col3, y + 17);
  doc.setTextColor(...hexToRgb(DARK));
  if (data.gasPricePerGal > 0) {
    doc.text(`$${data.gasPricePerGal.toFixed(2)}/gal \u2014 Est. cost: $${data.totalFuelCost.toFixed(2)}`, col1, y + 23);
  }
  if (data.climateZone) {
    doc.text(`Climate: ${data.climateZone}`, col2, y + 23);
  }
  if (data.refuelStopCount > 0) {
    doc.text(`${data.refuelStopCount} fuel stop${data.refuelStopCount > 1 ? "s" : ""} planned`, col3, y + 23);
  }
  y += 34;

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(ACCENT));
  doc.text("SEGMENT BREAKDOWN", 15, y);
  y += 5;

  const headers = ["#", "Segment", "Terrain", "Dist", "MPG", "Fuel", "Left", "Time"];
  const colWidths = [8, 42, 34, 16, 14, 16, 18, 16];
  let cx = 15;
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...hexToRgb(MUTED));
  headers.forEach((h, i) => {
    doc.text(h, cx, y);
    cx += colWidths[i];
  });
  y += 2;
  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.setLineWidth(0.3);
  doc.line(15, y, pageW - 15, y);
  y += 3;

  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");

  data.segments.forEach((seg, idx) => {
    y = checkPage(doc, y, 8, pageW);

    if (seg.didRefuel) {
      doc.setFillColor(219, 234, 254);
      doc.rect(15, y - 3, pageW - 30, 4, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb("#2563EB"));
      doc.text("\u26FD FUEL STOP \u2014 Tank refilled to " + data.totalFuelGal + " gal", 17, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      y += 5;
    }

    const isOut = seg.warnings.some((w) => w.includes("OUT OF FUEL"));
    if (isOut) {
      doc.setFillColor(254, 242, 242);
      doc.rect(15, y - 3, pageW - 30, 4, "F");
    }

    cx = 15;
    doc.setTextColor(...hexToRgb(isOut ? "#EF4444" : DARK));
    const vals = [
      String(idx + 1),
      seg.name.length > 22 ? seg.name.substring(0, 20) + "\u2026" : seg.name,
      seg.terrain.length > 18 ? seg.terrain.substring(0, 16) + "\u2026" : seg.terrain,
      `${seg.distanceMiles} mi`,
      String(seg.adjustedMpg),
      `-${seg.fuelUsedGal}`,
      isOut ? "EMPTY" : `${seg.fuelRemainingGal}`,
      seg.timeFormatted,
    ];
    vals.forEach((v, i) => {
      doc.text(v, cx, y);
      cx += colWidths[i];
    });
    y += 4;

    seg.warnings.forEach((w) => {
      y = checkPage(doc, y, 4, pageW);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...hexToRgb("#EF4444"));
      doc.text(`  \u26A0 ${w}`, 23, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(DARK));
      y += 4;
    });
  });

  y += 2;
  doc.setDrawColor(...hexToRgb(TABLE_BORDER));
  doc.line(15, y, pageW - 15, y);
  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(`TOTAL: ${data.totalDistanceMiles} mi`, 15, y);
  doc.text(`${data.totalFuelUsedGal} gal used`, pageW * 0.4, y);
  if (data.outOfFuel) {
    doc.setTextColor(...hexToRgb("#EF4444"));
    doc.text("EMPTY", pageW * 0.65, y);
  } else {
    doc.setTextColor(...hexToRgb("#10B981"));
    doc.text(`${data.fuelRemainingGal} gal left`, pageW * 0.65, y);
  }
  doc.setTextColor(...hexToRgb(DARK));
  doc.text(data.totalTimeFormatted, pageW - 30, y);
  y += 8;

  if (data.cacheGallons !== null && data.cacheCans !== null) {
    y = checkPage(doc, y, 14, pageW);
    roundedRect(doc, 15, y, pageW - 30, 12, 2, "#FEF2F2");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb("#EF4444"));
    doc.text("FUEL CACHE RECOMMENDATION", 19, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(`Cache ${data.cacheGallons} gallons (${data.cacheCans} jerry cans) to complete trip with 10% reserve.`, 19, y + 9);
    y += 16;
  }

  if (data.pointOfNoReturnIdx !== null) {
    y = checkPage(doc, y, 8, pageW);
    doc.setFontSize(7);
    doc.setTextColor(...hexToRgb("#F59E0B"));
    doc.text(`\u26A0 Point of No Return: Segment ${data.pointOfNoReturnIdx + 1} \u2014 beyond here, you can't retrace your route on remaining fuel.`, 15, y);
    y += 6;
  }

  addFooter(doc, pageW);
  doc.save(`fuel-range-plan-${data.tripName.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
