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
  stats.forEach((stat, i) => {
    const cx = 15 + colW * i + colW / 2;

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...hexToRgb(MUTED));
    doc.text(stat.label.toUpperCase(), cx, y + 7, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...hexToRgb(DARK));
    doc.text(stat.value, cx, y + 16, { align: "center" });

    if (stat.sub) {
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...hexToRgb(MUTED));
      doc.text(stat.sub, cx, y + 22, { align: "center" });
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
      doc.text(rec.url, 22, y + 3.5);
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
      doc.text(ps.url, 19, y + 9);

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
      doc.text(panel.url, 19, y + 9);

      y += 17;
    }
  }

  // Footer on last page
  addFooter(doc, pageW);

  doc.save("prepper-evolution-solar-power.pdf");
}
