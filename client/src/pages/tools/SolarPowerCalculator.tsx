import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Plus, Minus, Sun, Zap, Battery, ChevronDown, ChevronUp,
  ExternalLink, Printer, Share2, MapPin, Users, Clock, AlertTriangle,
  CheckCircle, X, Download, Home, MessageSquarePlus, Send,
} from "lucide-react";
import DonutChart, { ChartLegend } from "@/components/tools/DonutChart";
import { generateSolarPdf, type SolarPdfData } from "@/components/tools/PdfExport";
import PrintQrCode from "@/components/tools/PrintQrCode";
import DataPrivacyNotice from "@/components/tools/DataPrivacyNotice";
import SupportFooter from "@/components/tools/SupportFooter";
import { trackEvent } from "@/lib/analytics";
import InstallButton from "@/components/tools/InstallButton";
import ToolSocialShare from "@/components/tools/ToolSocialShare";
import ZipLookup from "@/components/tools/ZipLookup";
import type { ZipPrefixData } from "@/pages/tools/zip-types";
import {
  deviceCategories,
  allDevices,
  solarRegions,
  powerStations,
  solarPanels,
  SYSTEM_LOSS,
  BATTERY_DOD,
  BUFFER_FACTOR,
  dataSources,
  livingSituations,
  type Device,
  type SolarRegion,
  type PowerStationRec,
  type SolarPanelRec,
  type LivingSituation,
} from "./device-data";
import { useSEO } from "@/hooks/useSEO";

interface SelectedDevices {
  [id: string]: { qty: number; hours: number; watts?: number };
}

type UseCase = "emergency" | "offgrid" | "camping";

const useCaseLabels: Record<UseCase, { name: string; desc: string; living: LivingSituation }> = {
  emergency: { name: "Emergency Backup", desc: "Power outage, natural disaster — keep essentials running at home", living: "house" },
  offgrid: { name: "Off-Grid Living", desc: "Cabin, homestead, or full-time off-grid setup", living: "rural" },
  camping: { name: "Overlanding / Camping", desc: "Portable power for camp, vehicle, or base camp", living: "rv" },
};

const useCasePresets: Record<UseCase, Record<string, { qty: number; hours: number }>> = {
  emergency: {
    "led-bulb": { qty: 3, hours: 6 },
    "phone-charger": { qty: 2, hours: 2 },
    "wifi-router": { qty: 1, hours: 24 },
    "mini-fridge": { qty: 1, hours: 24 },
    "radio-scanner": { qty: 1, hours: 12 },
    "box-fan": { qty: 1, hours: 8 },
    "laptop-charger": { qty: 1, hours: 4 },
  },
  offgrid: {
    "led-bulb": { qty: 4, hours: 6 },
    "phone-charger": { qty: 2, hours: 2 },
    "wifi-router": { qty: 1, hours: 24 },
    "full-fridge": { qty: 1, hours: 24 },
    "laptop-charger": { qty: 1, hours: 4 },
    "water-pump": { qty: 1, hours: 2 },
    "ceiling-fan": { qty: 1, hours: 10 },
    "security-camera": { qty: 1, hours: 24 },
  },
  camping: {
    "12v-fridge": { qty: 1, hours: 24 },
    "camp-lights-12v": { qty: 1, hours: 5 },
    "phone-charger": { qty: 2, hours: 2 },
    "laptop-charger": { qty: 1, hours: 3 },
    "roof-fan": { qty: 1, hours: 8 },
    "ham-radio": { qty: 1, hours: 12 },
  },
};

export default function SolarPowerCalculator() {
  useSEO({
    title: "Solar & Power Calculator",
    description: "Calculate your off-grid solar power needs. Select devices, set hours of use, and get battery and solar panel recommendations for your region.",
  });

  const [people, setPeople] = useState(2);
  const [days, setDays] = useState(3);
  const [region, setRegion] = useState<string>("northeast");
  const [useCase, setUseCase] = useState<UseCase>("emergency");
  const [selected, setSelected] = useState<SelectedDevices>({});
  const [expandedCats, setExpandedCats] = useState<Set<string>>(new Set(["lighting", "communication"]));
  const [showShareToast, setShowShareToast] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const [livingSituation, setLivingSituation] = useState<LivingSituation>("house");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestName, setRequestName] = useState("");
  const [requestBrand, setRequestBrand] = useState("");
  const [requestWattage, setRequestWattage] = useState("");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestCat, setRequestCat] = useState(deviceCategories[0]?.id || "");
  const [requestStatus, setRequestStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    trackEvent("pe_tool_view", { tool: "solar-power" });
    const params = new URLSearchParams(window.location.search);
    const p = params.get("p");
    const d = params.get("d");
    const r = params.get("r");
    const uc = params.get("uc");
    const g = params.get("g");

    if (p) setPeople(Math.max(1, Math.min(10, parseInt(p) || 2)));
    if (d) setDays(Math.max(1, Math.min(30, parseInt(d) || 3)));
    if (r && solarRegions.some((s) => s.id === r)) setRegion(r);
    if (uc && (uc === "emergency" || uc === "offgrid" || uc === "camping")) setUseCase(uc as UseCase);
    if (g) {
      const devices: SelectedDevices = {};
      g.split(",").forEach((entry) => {
        const parts = entry.split(":");
        const [id, qty, hours] = parts;
        const w = parts[3] ? parseInt(parts[3]) : undefined;
        if (id) devices[id] = { qty: parseInt(qty) || 1, hours: parseFloat(hours) || 0, ...(w ? { watts: w } : {}) };
      });
      setSelected(devices);
    }
    const ls = params.get("ls");
    if (ls && livingSituations.some((l) => l.id === ls)) setLivingSituation(ls as LivingSituation);

    if (!g) {
      const activeUc = (uc === "offgrid" || uc === "camping") ? uc as UseCase : "emergency";
      const preset = useCasePresets[activeUc];
      const devices: SelectedDevices = {};
      for (const [id, { qty, hours }] of Object.entries(preset)) {
        const device = allDevices.find((dev) => dev.id === id);
        devices[id] = { qty, hours, watts: device?.watts };
      }
      setSelected(devices);
      if (!ls) setLivingSituation(useCaseLabels[activeUc].living);
      const cats = new Set(Object.keys(preset).map((id) => {
        const d = allDevices.find((dev) => dev.id === id);
        return d?.category || "";
      }).filter(Boolean));
      setExpandedCats(cats);
    }

    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    const data = { people, days, region, useCase, selected, livingSituation, timestamp: Date.now() };
    localStorage.setItem("pe-solar-calculator", JSON.stringify(data));
    setLastSaved(new Date());
  }, [people, days, region, useCase, selected, livingSituation, initialized]);

  const applyUseCase = useCallback((uc: UseCase) => {
    setUseCase(uc);
    setLivingSituation(useCaseLabels[uc].living);
    const preset = useCasePresets[uc];
    const devices: SelectedDevices = {};
    for (const [id, { qty, hours }] of Object.entries(preset)) {
      const device = allDevices.find((d) => d.id === id);
      devices[id] = { qty, hours, watts: device?.watts };
    }
    setSelected(devices);
    const cats = new Set(Object.keys(preset).map((id) => {
      const d = allDevices.find((dev) => dev.id === id);
      return d?.category || "";
    }).filter(Boolean));
    setExpandedCats(cats);
    trackEvent("pe_tool_started", { tool: "solar-power-calculator" });
  }, []);

  const handleZipResult = useCallback((data: ZipPrefixData | null) => {
    if (data) setRegion(data.sr);
  }, []);

  const toggleDevice = useCallback((device: Device) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[device.id]) {
        delete next[device.id];
      } else {
        next[device.id] = { qty: 1, hours: device.defaultHours, watts: device.watts };
      }
      return next;
    });
  }, []);

  const adjustQty = useCallback((id: string, delta: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const newQty = current.qty + delta;
      if (newQty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: { ...current, qty: Math.min(newQty, 20) } };
    });
  }, []);

  const setHours = useCallback((id: string, hours: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, hours: Math.max(0, Math.min(24, hours)) } };
    });
  }, []);

  const setDeviceWatts = useCallback((id: string, watts: number) => {
    setSelected((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, watts: Math.max(1, Math.min(5000, watts)) } };
    });
  }, []);

  const toggleCategory = (catId: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId);
      else next.add(catId);
      return next;
    });
  };

  const calculations = useMemo(() => {
    const selectedRegion = solarRegions.find((r) => r.id === region) || solarRegions[5];
    const peakSunHours = selectedRegion.peakSunHours;

    let totalDailyWh = 0;
    const categoryWh: Record<string, number> = {};
    const deviceBreakdown: { name: string; watts: number; qty: number; hours: number; dailyWh: number; category: string }[] = [];
    let peakWatts = 0;

    for (const cat of deviceCategories) {
      for (const device of cat.devices) {
        const sel = selected[device.id];
        if (!sel) continue;
        const w = sel.watts ?? device.watts;
        const dailyWh = w * sel.hours * sel.qty;
        totalDailyWh += dailyWh;
        categoryWh[cat.id] = (categoryWh[cat.id] || 0) + dailyWh;
        peakWatts += w * sel.qty;
        deviceBreakdown.push({
          name: device.name,
          watts: w,
          qty: sel.qty,
          hours: sel.hours,
          dailyWh,
          category: cat.id,
        });
      }
    }

    const totalWhNeeded = totalDailyWh * days;

    const dailyWhWithLoss = totalDailyWh * (1 + SYSTEM_LOSS);
    const batteryCapacityNeeded = (dailyWhWithLoss / BATTERY_DOD) * BUFFER_FACTOR;

    const solarWattsNeeded = totalDailyWh > 0
      ? (totalDailyWh * BUFFER_FACTOR) / (peakSunHours * (1 - SYSTEM_LOSS))
      : 0;

    const isApartment = livingSituation === "apartment";

    const eligibleStations = isApartment
      ? powerStations.filter((ps) => ps.capacityWh <= 2500)
      : powerStations;

    const matchedStations = eligibleStations
      .filter((ps) => ps.capacityWh >= batteryCapacityNeeded * 0.7)
      .slice(0, 3);

    const stationRecs: PowerStationRec[] = matchedStations.length > 0
      ? matchedStations
      : totalDailyWh > 0
        ? eligibleStations.slice(-2)
        : [];

    const eligiblePanels = isApartment
      ? solarPanels.filter((p) => p.portable && p.watts <= 200)
      : solarPanels;

    const matchedPanels = eligiblePanels
      .filter((p) => p.watts >= solarWattsNeeded * 0.5)
      .slice(0, 3);

    const panelRecs: SolarPanelRec[] = matchedPanels.length > 0
      ? matchedPanels
      : totalDailyWh > 0
        ? eligiblePanels.slice(-2)
        : [];

    const deviceCount = Object.keys(selected).length;

    deviceBreakdown.sort((a, b) => b.dailyWh - a.dailyWh);

    return {
      totalDailyWh,
      totalWhNeeded,
      batteryCapacityNeeded,
      solarWattsNeeded,
      peakWatts,
      categoryWh,
      deviceBreakdown,
      deviceCount,
      stationRecs,
      panelRecs,
      selectedRegion,
    };
  }, [selected, region, days, people, livingSituation]);

  const chartSegments = deviceCategories.map((cat) => ({
    label: cat.name,
    value: calculations.categoryWh[cat.id] || 0,
    color: cat.color,
  }));

  const fmtWh = (wh: number) => {
    if (wh >= 1000) return `${(wh / 1000).toFixed(1)} kWh`;
    return `${Math.round(wh)} Wh`;
  };

  const fmtW = (w: number) => {
    if (w >= 1000) return `${(w / 1000).toFixed(1)} kW`;
    return `${Math.round(w)} W`;
  };

  const getShareUrl = useCallback(() => {
    if (typeof window === "undefined") return "";
    const allDevices = deviceCategories.flatMap((c) => c.devices);
    const gearStr = Object.entries(selected)
      .map(([id, s]) => {
        const base = `${id}:${s.qty}:${s.hours}`;
        const dev = allDevices.find((d) => d.id === id);
        return s.watts != null && dev && s.watts !== dev.watts ? `${base}:${s.watts}` : base;
      })
      .join(",");
    let url = `${window.location.origin}${window.location.pathname}?p=${people}&d=${days}&r=${region}&uc=${useCase}&g=${gearStr}`;
    if (livingSituation !== "house") url += `&ls=${livingSituation}`;
    return url;
  }, [selected, people, days, region, useCase, livingSituation]);

  const shareLink = () => {
    const url = getShareUrl();
    navigator.clipboard.writeText(url).then(() => {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const handlePrint = () => window.print();

  const handleDownloadPdf = async () => {
    const fmtWhPdf = (wh: number) => wh >= 1000 ? `${(wh / 1000).toFixed(1)} kWh` : `${Math.round(wh)} Wh`;
    const fmtWPdf = (w: number) => w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${Math.round(w)} W`;

    const pdfDevices: SolarPdfData["devices"] = [];
    for (const cat of deviceCategories) {
      for (const device of cat.devices) {
        const sel = selected[device.id];
        if (!sel) continue;
        const w = sel.watts ?? device.watts;
        pdfDevices.push({
          name: device.name,
          category: cat.name,
          catColor: cat.color,
          watts: w,
          qty: sel.qty,
          hours: sel.hours,
          dailyWh: w * sel.hours * sel.qty,
        });
      }
    }

    trackEvent("pe_pdf_exported", { tool: "solar-power" });
    await generateSolarPdf({
      people,
      days,
      region: calculations.selectedRegion.name,
      totalDailyWh: calculations.totalDailyWh,
      batteryNeeded: calculations.batteryCapacityNeeded,
      solarNeeded: calculations.solarWattsNeeded,
      peakWatts: calculations.peakWatts,
      devices: pdfDevices,
      stationRecs: calculations.stationRecs.map((ps) => ({
        name: ps.name,
        capacity: fmtWhPdf(ps.capacityWh),
        output: fmtWPdf(ps.maxOutputW),
        price: ps.price,
        url: ps.affiliateUrl,
        note: ps.note,
      })),
      panelRecs: calculations.panelRecs.map((p) => ({
        name: p.name,
        watts: p.watts,
        price: p.price,
        url: p.affiliateUrl,
        note: p.note,
      })),
    });
  };

  const submitDeviceRequest = async () => {
    const name = requestName.trim();
    if (!name || name.length < 2) return;

    setRequestStatus("sending");
    try {
      const res = await fetch("/api/gear-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brand: requestBrand.trim() || undefined,
          weightOz: requestWattage ? parseFloat(requestWattage) : undefined,
          category: requestCat || undefined,
          amazonUrl: requestUrl.trim() || undefined,
          source: "solar",
        }),
      });

      if (res.ok) {
        setRequestStatus("sent");
        setRequestName("");
        setRequestBrand("");
        setRequestWattage("");
        setRequestUrl("");
        setTimeout(() => {
          setRequestStatus("idle");
          setShowRequestForm(false);
        }, 4000);
      } else {
        const data = await res.json();
        console.error("Device request failed:", data.error);
        setRequestStatus("error");
        setTimeout(() => setRequestStatus("idle"), 3000);
      }
    } catch {
      setRequestStatus("error");
      setTimeout(() => setRequestStatus("idle"), 3000);
    }
  };

  const printDevicesByCategory = useMemo(() => {
    const groups: { catName: string; catColor: string; items: { name: string; watts: number; qty: number; hours: number; dailyWh: number }[] }[] = [];

    for (const cat of deviceCategories) {
      const items: typeof groups[0]["items"] = [];
      for (const device of cat.devices) {
        const sel = selected[device.id];
        if (!sel) continue;
        const w = sel.watts ?? device.watts;
        items.push({
          name: device.name,
          watts: w,
          qty: sel.qty,
          hours: sel.hours,
          dailyWh: w * sel.hours * sel.qty,
        });
      }
      if (items.length > 0) groups.push({ catName: cat.name, catColor: cat.color, items });
    }
    return groups;
  }, [selected]);

  return (
    <>
      <div className="print-only">
        <div className="print-header">
          <img src="/pe-badge.png" alt="Prepper Evolution" className="print-logo" />
          <div>
            <h2 className="print-title">Solar &amp; Power Calculator Results</h2>
            <p className="print-date">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          </div>
        </div>

        <div className="print-summary">
          <div className="print-summary-grid">
            <div>
              <span className="print-label">Daily Power Need</span>
              <span className="print-value">{fmtWh(calculations.totalDailyWh)}</span>
              <span className="print-sub">per day</span>
            </div>
            <div>
              <span className="print-label">Battery Needed</span>
              <span className="print-value">{fmtWh(calculations.batteryCapacityNeeded)}</span>
              <span className="print-sub">min capacity</span>
            </div>
            <div>
              <span className="print-label">Solar Panels</span>
              <span className="print-value">{fmtW(calculations.solarWattsNeeded)}</span>
              <span className="print-sub">{calculations.selectedRegion.name}</span>
            </div>
            <div>
              <span className="print-label">Duration</span>
              <span className="print-value">{days} day{days !== 1 ? "s" : ""}</span>
              <span className="print-sub">{people} {people === 1 ? "person" : "people"}</span>
            </div>
          </div>
        </div>

        <table className="print-gear-table">
          <thead>
            <tr>
              <th style={{ width: "35%" }}>Device</th>
              <th style={{ width: "12%", textAlign: "center" }}>Watts</th>
              <th style={{ width: "10%", textAlign: "center" }}>Qty</th>
              <th style={{ width: "15%", textAlign: "center" }}>Hrs/Day</th>
              <th style={{ width: "18%", textAlign: "right" }}>Wh/Day</th>
            </tr>
          </thead>
          <tbody>
            {printDevicesByCategory.map((group) => (
              <tbody key={`print-${group.catName}`}>
                <tr className="print-cat-header">
                  <td colSpan={5}>
                    <span className="print-cat-dot" style={{ backgroundColor: group.catColor }} />
                    {group.catName}
                  </td>
                </tr>
                {group.items.map((item, idx) => (
                  <tr key={`${group.catName}-${idx}`}>
                    <td>{item.name}</td>
                    <td style={{ textAlign: "center" }}>{item.watts}W</td>
                    <td style={{ textAlign: "center" }}>{item.qty > 1 ? `x${item.qty}` : "1"}</td>
                    <td style={{ textAlign: "center" }}>{item.hours}h</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>{Math.round(item.dailyWh)} Wh</td>
                  </tr>
                ))}
              </tbody>
            ))}
            <tr className="print-total-row">
              <td colSpan={4} style={{ textAlign: "right", fontWeight: 700 }}>TOTAL DAILY</td>
              <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtWh(calculations.totalDailyWh)}</td>
            </tr>
          </tbody>
        </table>

        {calculations.stationRecs.length > 0 && (
          <div className="print-missing">
            <h3>Recommended Power Stations</h3>
            <ul>
              {calculations.stationRecs.map((ps) => (
                <li key={ps.id}>{ps.name} — {fmtWh(ps.capacityWh)} / {fmtW(ps.maxOutputW)} — {ps.price}</li>
              ))}
            </ul>
          </div>
        )}

        {calculations.panelRecs.length > 0 && (
          <div className="print-missing">
            <h3>Recommended Solar Panels</h3>
            <ul>
              {calculations.panelRecs.map((p) => (
                <li key={p.id}>{p.name} — {p.watts}W — {p.price}</li>
              ))}
            </ul>
          </div>
        )}

        <PrintQrCode url={getShareUrl()} />

        <p className="print-footer">
          Generated at prepperevolution.com/tools/solar-power-calculator &mdash; {new Date().toLocaleDateString()}
        </p>
      </div>

      <div className="min-h-screen bg-background pt-24 pb-20 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-10">
            <p className="text-primary text-sm font-bold uppercase tracking-widest mb-3" data-testid="text-tool-label">Free Tool</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-4" data-testid="text-page-title">
              Solar &amp; Power <span className="text-primary">Calculator</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed" data-testid="text-page-description">
              Select the devices you need to power, adjust hours of daily use, and get
              personalized battery and solar panel recommendations for your region. All
              recommendations link directly to trusted gear on Amazon.
            </p>
          </div>

          <div className="no-print mb-6">
            {/* Tool Title */}
            <div>
              <p className="text-primary text-sm font-bold uppercase tracking-widest mb-2">Free Tool</p>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl sm:text-3xl font-extrabold">Solar &amp; Power Station <span className="text-primary">Calculator</span></h2>
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* How This Tool Works */}
              <div className="bg-card border-2 border-primary/30 rounded-lg p-5 sm:p-6">
                <h3 className="text-base sm:text-lg font-extrabold mb-3">How This Tool Works</h3>
                <div className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-3">
                  <p>
                    Pick the devices you need running when the grid goes down &mdash; lights, phone charger, fridge, whatever &mdash; adjust the hours per day, and we&apos;ll calculate exactly how much battery and solar you need for your location. Drop in your ZIP code and we factor in your region&apos;s actual sun hours, not some national average.
                  </p>
                  <p>
                    <strong className="text-foreground">Bottom line:</strong> solar setups get expensive fast when you guess wrong. This tool sizes your system to your actual usage so you&apos;re not overspending on panels you don&apos;t need or undersizing a battery that dies by midnight.
                  </p>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-5 space-y-5">
                <h3 className="text-sm font-bold uppercase tracking-wide">Your Setup</h3>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">Use Case <span className="font-normal normal-case">&mdash; pre-loads common devices</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(Object.keys(useCaseLabels) as UseCase[]).map((uc) => (
                      <button
                        key={uc}
                        onClick={() => applyUseCase(uc)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          useCase === uc
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`button-usecase-${uc}`}
                      >
                        <span className="text-sm font-bold block">{useCaseLabels[uc].name}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug">{useCaseLabels[uc].desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                    <Home className="w-3 h-3 inline mr-1" /> Living Situation
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {livingSituations.map((ls) => (
                      <button
                        key={ls.id}
                        onClick={() => setLivingSituation(ls.id)}
                        className={`text-left p-3 rounded-lg border transition-colors ${
                          livingSituation === ls.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/30"
                        }`}
                        data-testid={`button-living-${ls.id}`}
                      >
                        <span className="text-sm font-bold block">{ls.name}</span>
                        <span className="text-[11px] text-muted-foreground leading-snug block mt-0.5">{ls.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <Users className="w-3 h-3 inline mr-1" /> People
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPeople((p) => Math.max(1, p - 1))}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        data-testid="button-people-minus"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-extrabold tabular-nums" data-testid="text-people-count">{people}</span>
                      <button
                        onClick={() => setPeople((p) => Math.min(10, p + 1))}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                        data-testid="button-people-plus"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <Clock className="w-3 h-3 inline mr-1" /> Days Off-Grid
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDays((d) => Math.max(1, d - 1))}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 transition-colors"
                        data-testid="button-days-minus"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-lg font-extrabold tabular-nums" data-testid="text-days-count">{days}</span>
                      <button
                        onClick={() => setDays((d) => Math.min(30, d + 1))}
                        className="w-9 h-9 rounded-md flex items-center justify-center bg-primary text-primary-foreground transition-colors"
                        data-testid="button-days-plus"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <ZipLookup onResult={handleZipResult} showFields={["solar", "hazard"]} compact />

                  <div>
                    <label className="block text-sm font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      <MapPin className="w-3 h-3 inline mr-1" /> Solar Region
                    </label>
                    <select
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                      data-testid="select-region"
                    >
                      {solarRegions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name} ({r.peakSunHours}h)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {calculations.selectedRegion && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Sun className="w-3 h-3 text-primary shrink-0" />
                    {calculations.selectedRegion.note} &mdash; {calculations.selectedRegion.peakSunHours} avg peak sun hours/day
                  </p>
                )}
              </div>

              {deviceCategories.map((cat) => {
                const isExpanded = expandedCats.has(cat.id);
                const catWh = calculations.categoryWh[cat.id] || 0;
                const catCount = cat.devices.filter((d) => selected[d.id]).length;

                return (
                  <div key={cat.id} className="bg-card border border-border rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      aria-expanded={isExpanded}
                      data-testid={`toggle-category-${cat.id}`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-3 h-3 rounded-sm shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="font-bold text-sm uppercase tracking-wide">{cat.name}</span>
                        {catCount > 0 && (
                          <span className="bg-primary/15 text-primary text-sm font-bold px-2 py-0.5 rounded">
                            {catCount} device{catCount !== 1 ? "s" : ""} / {fmtWh(catWh)}
                          </span>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-border">
                        {cat.devices.map((device) => {
                          const sel = selected[device.id];
                          const isSelected = !!sel;
                          const currentWatts = isSelected ? (sel.watts ?? device.watts) : device.watts;
                          const isCustomWatts = isSelected && sel.watts != null && sel.watts !== device.watts;
                          const dailyWh = isSelected ? currentWatts * sel.hours * sel.qty : 0;
                          const wattsStep = currentWatts >= 100 ? 10 : 5;

                          return (
                            <div
                              key={device.id}
                              className={`px-4 py-3 border-b border-border/50 last:border-b-0 transition-colors ${
                                isSelected ? "bg-primary/5" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => toggleDevice(device)}
                                  className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                                    isSelected
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-muted border border-border text-muted-foreground hover:border-primary/50"
                                  }`}
                                  aria-label={isSelected ? `Remove ${device.name}` : `Add ${device.name}`}
                                  data-testid={`toggle-device-${device.id}`}
                                >
                                  {isSelected ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                </button>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={`text-sm font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                                      {device.name}
                                    </span>
                                    {device.essential && (
                                      <span className="text-xs uppercase tracking-wider font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                        Essential
                                      </span>
                                    )}
                                  </div>
                                  {device.note && (
                                    <p className="text-[11px] text-muted-foreground/70 mt-0.5">{device.note}</p>
                                  )}
                                </div>

                                <span className={`text-sm font-mono tabular-nums shrink-0 ${isSelected ? "text-foreground font-bold" : "text-muted-foreground"}`}>
                                  {device.watts}W
                                </span>
                              </div>

                              {isSelected && (
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 ml-11">
                                  <div className="flex items-center gap-1.5">
                                    <Zap className="w-3 h-3 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">W:</span>
                                    <button
                                      onClick={() => setDeviceWatts(device.id, currentWatts - wattsStep)}
                                      className="w-6 h-6 rounded flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 text-sm"
                                      data-testid={`watts-decrease-${device.id}`}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <input
                                      type="number"
                                      min="1"
                                      max="5000"
                                      value={currentWatts}
                                      onChange={(e) => setDeviceWatts(device.id, parseInt(e.target.value) || device.watts)}
                                      className={`w-16 border rounded px-2 py-1 text-sm text-center font-bold focus:outline-none focus:border-primary ${
                                        isCustomWatts
                                          ? "bg-primary/10 border-primary text-primary"
                                          : "bg-background border-border text-foreground"
                                      }`}
                                      data-testid={`input-watts-${device.id}`}
                                    />
                                    <button
                                      onClick={() => setDeviceWatts(device.id, currentWatts + wattsStep)}
                                      className="w-6 h-6 rounded flex items-center justify-center bg-primary text-primary-foreground text-sm"
                                      data-testid={`watts-increase-${device.id}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                    {isCustomWatts && (
                                      <button
                                        onClick={() => setDeviceWatts(device.id, device.watts)}
                                        className="text-xs text-primary hover:underline ml-0.5"
                                        data-testid={`watts-reset-${device.id}`}
                                      >
                                        reset
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">Qty:</span>
                                    <button
                                      onClick={() => adjustQty(device.id, -1)}
                                      className="w-6 h-6 rounded flex items-center justify-center bg-muted border border-border text-muted-foreground hover:border-primary/50 text-sm"
                                      data-testid={`qty-decrease-${device.id}`}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-6 text-center text-sm font-bold tabular-nums">{sel.qty}</span>
                                    <button
                                      onClick={() => adjustQty(device.id, 1)}
                                      className="w-6 h-6 rounded flex items-center justify-center bg-primary text-primary-foreground text-sm"
                                      data-testid={`qty-increase-${device.id}`}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div className="flex items-center gap-1.5 flex-1">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide whitespace-nowrap">Hrs/day:</span>
                                    <input
                                      type="range"
                                      min="0"
                                      max="24"
                                      step="0.5"
                                      value={sel.hours}
                                      onChange={(e) => setHours(device.id, parseFloat(e.target.value))}
                                      className="flex-1 accent-primary h-1.5 max-w-[120px]"
                                      data-testid={`input-hours-slider-${device.id}`}
                                    />
                                    <input
                                      type="number"
                                      min="0"
                                      max="24"
                                      step="0.5"
                                      value={sel.hours}
                                      onChange={(e) => setHours(device.id, parseFloat(e.target.value) || 0)}
                                      className="w-14 bg-background border border-border rounded px-2 py-1 text-sm text-center font-bold text-foreground focus:outline-none focus:border-primary"
                                      data-testid={`input-hours-${device.id}`}
                                    />
                                  </div>

                                  <span className="text-sm font-bold text-primary tabular-nums whitespace-nowrap" data-testid={`text-daily-wh-${device.id}`}>
                                    {Math.round(dailyWh)} Wh/day
                                  </span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="bg-card border border-border rounded-lg p-5 no-print">
                <div className="flex items-start gap-3 mb-4">
                  <Users className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-1">Community Driven</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      This calculator is community-driven. We&apos;re constantly adding devices based on what
                      real preppers use. If your device isn&apos;t listed, let us know and we&apos;ll add it.
                    </p>
                  </div>
                </div>

                {!showRequestForm ? (
                  <button
                    onClick={() => setShowRequestForm(true)}
                    className="w-full flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-primary/5 hover:border-primary/30 transition-colors"
                    data-testid="button-request-device"
                  >
                    <MessageSquarePlus className="w-4 h-4 text-primary" />
                    Don&apos;t See Your Device? Request It
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold uppercase tracking-wide text-primary">Request a Device</h4>
                      <button
                        onClick={() => { setShowRequestForm(false); setRequestStatus("idle"); }}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Close request form"
                        data-testid="button-close-request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {requestStatus === "sent" ? (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
                        <p className="text-sm font-bold text-green-500">Request Submitted!</p>
                        <p className="text-sm text-muted-foreground mt-1">We&apos;ll review it and add it if it fits. Thanks for helping us improve.</p>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={requestName}
                          onChange={(e) => setRequestName(e.target.value)}
                          placeholder="Device name *"
                          maxLength={100}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Device name"
                          data-testid="input-request-name"
                        />

                        <div className="grid grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={requestBrand}
                            onChange={(e) => setRequestBrand(e.target.value)}
                            placeholder="Brand (optional)"
                            maxLength={50}
                            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                            aria-label="Brand name"
                            data-testid="input-request-brand"
                          />
                          <input
                            type="number"
                            value={requestWattage}
                            onChange={(e) => setRequestWattage(e.target.value)}
                            placeholder="Wattage (optional)"
                            min="0.1"
                            max="10000"
                            step="0.1"
                            className="bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                            aria-label="Device wattage"
                            data-testid="input-request-wattage"
                          />
                        </div>

                        <input
                          type="text"
                          value={requestUrl}
                          onChange={(e) => setRequestUrl(e.target.value)}
                          placeholder="Amazon link (optional)"
                          maxLength={200}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary"
                          aria-label="Amazon product link"
                          data-testid="input-request-url"
                        />

                        <select
                          value={requestCat}
                          onChange={(e) => setRequestCat(e.target.value)}
                          className="w-full bg-background border border-border rounded px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary"
                          aria-label="Device category"
                          data-testid="select-request-category"
                        >
                          {deviceCategories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>

                        <button
                          onClick={submitDeviceRequest}
                          disabled={!requestName.trim() || requestName.trim().length < 2 || requestStatus === "sending"}
                          className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-border disabled:text-muted-foreground text-primary-foreground font-bold py-3 rounded text-sm uppercase tracking-wide transition-colors"
                          data-testid="button-submit-request"
                        >
                          {requestStatus === "sending" ? (
                            "Submitting..."
                          ) : requestStatus === "error" ? (
                            "Something went wrong — try again"
                          ) : (
                            <><Send className="w-4 h-4" /> Submit Request</>
                          )}
                        </button>

                        <p className="text-xs text-muted-foreground/50 text-center">
                          All requests are reviewed before being added. We typically update weekly.
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-muted rounded-lg p-5">
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">Data Sources &amp; References</h3>
                <ul className="space-y-1">
                  {dataSources.map((ds) => (
                    <li key={ds.name} className="text-sm text-muted-foreground">
                      {ds.url ? (
                        <a href={ds.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {ds.name}
                        </a>
                      ) : (
                        <span className="font-medium">{ds.name}</span>
                      )}
                      {" "}&mdash; {ds.note}
                    </li>
                  ))}
                </ul>
              </div>

              <DataPrivacyNotice />
              <SupportFooter />
            </div>

            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto scrollbar-none space-y-5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

                <div className="bg-card border border-border rounded-lg p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide">Power Summary</h3>
                    <Zap className="w-4 h-4 text-primary" />
                  </div>

                  {calculations.deviceCount === 0 ? (
                    <div className="text-center py-6">
                      <Sun className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground" data-testid="text-empty-state">Add devices to see your power needs</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-2">
                        <DonutChart
                          segments={chartSegments}
                          totalLabel="Daily"
                          totalValue={fmtWh(calculations.totalDailyWh)}
                          size={180}
                        />
                      </div>
                      <ChartLegend segments={chartSegments} />
                    </>
                  )}

                  {calculations.deviceCount > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-border">
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Daily Need</p>
                        <p className="text-lg font-extrabold" data-testid="text-daily-need">{fmtWh(calculations.totalDailyWh)}</p>
                        <p className="text-sm text-muted-foreground">{calculations.deviceCount} device{calculations.deviceCount !== 1 ? "s" : ""}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">{days}-Day Total</p>
                        <p className="text-lg font-extrabold" data-testid="text-total-need">{fmtWh(calculations.totalWhNeeded)}</p>
                        <p className="text-sm text-muted-foreground">full duration</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Battery Needed</p>
                        <p className="text-lg font-extrabold text-primary" data-testid="text-battery-needed">{fmtWh(calculations.batteryCapacityNeeded)}</p>
                        <p className="text-sm text-muted-foreground">min capacity</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground uppercase">Solar Needed</p>
                        <p className="text-lg font-extrabold text-primary" data-testid="text-solar-needed">{fmtW(calculations.solarWattsNeeded)}</p>
                        <p className="text-sm text-muted-foreground">{calculations.selectedRegion.peakSunHours}h sun/day</p>
                      </div>
                    </div>
                  )}
                </div>

                {calculations.deviceBreakdown.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <h3 className="text-sm font-bold uppercase tracking-wide mb-3">Top Power Draws</h3>
                    <div className="space-y-2">
                      {calculations.deviceBreakdown.slice(0, 5).map((d, i) => {
                        const pct = calculations.totalDailyWh > 0 ? (d.dailyWh / calculations.totalDailyWh) * 100 : 0;
                        return (
                          <div key={`${d.name}-${i}`}>
                            <div className="flex items-center justify-between text-sm mb-0.5">
                              <span className="text-muted-foreground truncate">{d.name}{d.qty > 1 ? ` x${d.qty}` : ""}</span>
                              <span className="font-bold tabular-nums ml-2">{Math.round(d.dailyWh)} Wh</span>
                            </div>
                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-primary transition-all duration-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {calculations.peakWatts > 2000 && (
                  <div className="bg-[#EAB308]/10 border border-[#EAB308]/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-[#EAB308] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">High Peak Wattage</p>
                        <p className="text-sm text-muted-foreground">
                          Your setup could draw up to <strong className="text-foreground">{fmtW(calculations.peakWatts)}</strong> if
                          everything runs simultaneously. Make sure your power station&apos;s inverter can handle the peak load.
                          Stagger high-draw devices to stay safe.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {calculations.stationRecs.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Battery className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-wide">Recommended Power Stations</h3>
                    </div>
                    <div className="space-y-3">
                      {calculations.stationRecs.map((ps) => {
                        const coversPct = Math.min(100, Math.round((ps.capacityWh / calculations.batteryCapacityNeeded) * 100));
                        return (
                          <a
                            key={ps.id}
                            href={ps.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="block p-3 bg-muted rounded-md hover:bg-primary/5 transition-colors group"
                            data-testid={`link-station-${ps.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors block">
                                  {ps.name}
                                </span>
                                <span className="text-sm text-muted-foreground block mt-0.5">
                                  {fmtWh(ps.capacityWh)} / {fmtW(ps.maxOutputW)} &mdash; {ps.price}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${coversPct}%`,
                                    backgroundColor: coversPct >= 100 ? "#22C55E" : coversPct >= 70 ? "#EAB308" : "#EF4444",
                                  }}
                                />
                              </div>
                              <span className="text-xs font-bold tabular-nums">{coversPct}%</span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{ps.note}</p>
                          </a>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-3">
                      Affiliate links &mdash; we earn a commission at no extra cost to you.
                    </p>
                  </div>
                )}

                {calculations.panelRecs.length > 0 && (
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Sun className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-bold uppercase tracking-wide">Recommended Solar Panels</h3>
                    </div>
                    <div className="space-y-3">
                      {calculations.panelRecs.map((panel) => {
                        const coversPct = calculations.solarWattsNeeded > 0
                          ? Math.min(100, Math.round((panel.watts / calculations.solarWattsNeeded) * 100))
                          : 0;
                        return (
                          <a
                            key={panel.id}
                            href={panel.affiliateUrl}
                            target="_blank"
                            rel="noopener noreferrer nofollow"
                            className="block p-3 bg-muted rounded-md hover:bg-primary/5 transition-colors group"
                            data-testid={`link-panel-${panel.id}`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <span className="text-sm font-medium group-hover:text-primary transition-colors block">
                                  {panel.name}
                                </span>
                                <span className="text-sm text-muted-foreground block mt-0.5">
                                  {panel.watts}W {panel.portable ? "Portable" : "Rigid"} &mdash; {panel.price}
                                </span>
                              </div>
                              <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary shrink-0 mt-1" />
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-1">{panel.note}</p>
                          </a>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground/50 mt-3">
                      Affiliate links &mdash; we earn a commission at no extra cost to you.
                    </p>
                  </div>
                )}

                {livingSituation === "apartment" && calculations.deviceCount > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1">Apartment Solar Notes</p>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>&bull; Only portable/foldable panels shown (max 200W) — no rigid rooftop kits.</li>
                          <li>&bull; Check your balcony weight limit before placing panels — most support 60-100 lbs/sqft.</li>
                          <li>&bull; HOA or lease may restrict visible solar panels — foldable panels store when not in use.</li>
                          <li>&bull; A south-facing balcony or window is ideal — even partial sun helps with portable stations.</li>
                          <li>&bull; Power stations under 2.5 kWh are shown — large home backup units are not practical in apartments.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {calculations.deviceCount > 0 && calculations.batteryCapacityNeeded <= 1500 && calculations.peakWatts < 2000 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold mb-1 text-green-500">Manageable Load</p>
                        <p className="text-sm text-muted-foreground">
                          Your power needs are within the range of a single mid-size portable power station.
                          Perfect for {useCase === "camping" ? "overlanding and camping" : useCase === "emergency" ? "emergency backup" : "off-grid setups"}.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleDownloadPdf}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 text-sm font-bold uppercase tracking-wide transition-colors"
                    data-testid="button-download-pdf"
                  >
                    <Download className="w-4 h-4" /> PDF
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                    data-testid="button-print"
                  >
                    <Printer className="w-4 h-4" /> Print
                  </button>
                  <button
                    onClick={shareLink}
                    className="flex-1 flex items-center justify-center gap-2 bg-muted border border-border rounded-lg py-3 text-sm font-bold uppercase tracking-wide hover:bg-card transition-colors"
                    data-testid="button-share"
                  >
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <InstallButton />
                </div>

                {showShareToast && (
                  <div className="bg-green-500/15 border border-green-500/30 text-green-500 text-sm rounded-lg p-3 text-center animate-fade-in-up">
                    Link copied to clipboard!
                  </div>
                )}

                <ToolSocialShare url={getShareUrl()} toolName="Solar Power Calculator" />

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">How We Calculate</h4>
                  <ul className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                    <li>&bull; <strong className="text-foreground">15% system loss</strong> for wiring, inverter efficiency, and temperature</li>
                    <li>&bull; <strong className="text-foreground">80% depth of discharge</strong> to protect battery longevity</li>
                    <li>&bull; <strong className="text-foreground">25% safety buffer</strong> for cloudy days and unexpected draws</li>
                    <li>&bull; Solar hours from <strong className="text-foreground">NREL PVWatts</strong> data by region</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
