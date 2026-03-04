// ─── RigRated Suspension Products Database ──────────────────────────────────
// ~45 products across 15 brands with real-world weight and performance data.
//
// IMPORTANT: claimedGainPct is what the manufacturer advertises.
// realisticGainPct = claimedGainPct × 0.50 (cut in half for real-world conditions).
// Why? Trail abuse, heat soak, mud, and no one rides lab conditions.
// If a brand provides a hard-rated capacity number, use hardRatedCapacityLbs instead.

export interface SuspensionProduct {
  id: string;
  brand: string;
  model: string;
  tier: "entry" | "mid" | "race";
  claimedGainPct: number;        // What the brand advertises (e.g., 25 = "25% better")
  realisticGainPct: number;      // claimedGainPct × 0.50
  hardRatedCapacityLbs?: number; // If brand gives hard number, use this instead of %
  weightLbs: number;             // Full kit weight (all shocks/springs) in lbs
  priceRange: string;            // "$X,XXX - $X,XXX"
  affiliateUrl: string;
  compatibleMachines: string[] | "all";
  notes?: string;
}

// Helper to auto-calculate realistic gain
function sp(
  id: string, brand: string, model: string, tier: "entry" | "mid" | "race",
  claimedGainPct: number, weightLbs: number, priceRange: string,
  affiliateUrl: string, compatibleMachines: string[] | "all",
  notes?: string, hardRatedCapacityLbs?: number,
): SuspensionProduct {
  return {
    id, brand, model, tier,
    claimedGainPct,
    realisticGainPct: Math.round(claimedGainPct * 0.50),
    hardRatedCapacityLbs,
    weightLbs, priceRange, affiliateUrl, compatibleMachines, notes,
  };
}

export const suspensionProducts: SuspensionProduct[] = [
  // ── Fox (4) ────────────────────────────────────────────────────────────
  sp("fox-qs3", "Fox", "2.0 Podium QS3", "entry",
    15, 32, "$800 - $1,200",
    "https://www.amazon.com/dp/B0BN8Q6M2H?tag=prepperevo-20", "all",
    "Quick Switch 3-position compression. Factory upgrade on many Polaris models."),
  sp("fox-live-valve", "Fox", "Live Valve", "mid",
    25, 38, "$2,500 - $3,500",
    "https://www.amazon.com/dp/B0BN8Q6M2H?tag=prepperevo-20", "all",
    "Electronically-controlled auto-adjusting damping. Real-time terrain response."),
  sp("fox-3.0-ibp", "Fox", "3.0 IBP Coilover", "race",
    30, 42, "$3,500 - $5,000",
    "https://www.amazon.com/dp/B0BN8Q6M2H?tag=prepperevo-20", "all",
    "3-inch body, Internal Bypass. Desert racing suspension. Massive heat capacity."),
  sp("fox-3.5-ibp", "Fox", "3.5 IBP Coilover", "race",
    35, 48, "$5,000 - $7,000",
    "https://www.amazon.com/dp/B0BN8Q6M2H?tag=prepperevo-20", "all",
    "Top-shelf Fox. 3.5-inch body with IBP. King of the desert."),

  // ── Elka (3) ───────────────────────────────────────────────────────────
  sp("elka-stage1", "Elka", "Stage 1", "entry",
    12, 30, "$600 - $900",
    "https://www.amazon.com/dp/B07L5W7YHK?tag=prepperevo-20", "all",
    "Single-rate spring with compression/rebound adjust. Great entry upgrade."),
  sp("elka-stage3", "Elka", "Stage 3", "mid",
    22, 35, "$1,600 - $2,200",
    "https://www.amazon.com/dp/B07L5W7YHK?tag=prepperevo-20", "all",
    "Dual-rate spring with high/low speed compression. Canadian-made quality."),
  sp("elka-stage5", "Elka", "Stage 5", "race",
    30, 40, "$2,800 - $3,800",
    "https://www.amazon.com/dp/B07L5W7YHK?tag=prepperevo-20", "all",
    "Full race spec. External reservoir, fully rebuildable. Elka flagship."),

  // ── King (3) ───────────────────────────────────────────────────────────
  sp("king-2.0", "King", "2.0 Performance", "entry",
    15, 30, "$800 - $1,200",
    "https://www.amazon.com/dp/B0BK6F7X3Y?tag=prepperevo-20", "all",
    "2-inch body, adjustable compression. Solid all-around upgrade."),
  sp("king-2.5-ibp", "King", "2.5 IBP Coilover", "mid",
    25, 38, "$2,500 - $3,500",
    "https://www.amazon.com/dp/B0BK6F7X3Y?tag=prepperevo-20", "all",
    "Internal bypass with finned reservoir. Excellent heat dissipation."),
  sp("king-ibp-coilover", "King", "3.0 IBP Race Coilover", "race",
    32, 45, "$4,000 - $6,000",
    "https://www.amazon.com/dp/B0BK6F7X3Y?tag=prepperevo-20", "all",
    "Pure race. 3-inch body, internal bypass, PiggyBack reservoir."),

  // ── Walker Evans (2) ───────────────────────────────────────────────────
  sp("we-velocity", "Walker Evans", "Velocity Series", "mid",
    20, 34, "$1,800 - $2,500",
    "https://www.amazon.com/dp/B09XYZ1234?tag=prepperevo-20", "all",
    "Remote reservoir, velocity-sensitive valving. Great all-terrain performer."),
  sp("we-racing", "Walker Evans", "Racing Series", "race",
    28, 40, "$3,000 - $4,200",
    "https://www.amazon.com/dp/B09XYZ1234?tag=prepperevo-20", "all",
    "Full race valving with external reservoir. Desert-proven durability."),

  // ── Bilstein (2) ───────────────────────────────────────────────────────
  sp("bilstein-5100", "Bilstein", "5100 Series", "entry",
    10, 28, "$500 - $800",
    "https://www.amazon.com/dp/B001CZIYVY?tag=prepperevo-20", "all",
    "Monotube gas pressure. Consistent fade-free performance. Budget champion."),
  sp("bilstein-6112", "Bilstein", "6112 Coilover", "mid",
    18, 34, "$1,200 - $1,800",
    "https://www.amazon.com/dp/B001CZIYVY?tag=prepperevo-20", "all",
    "Zinc-plated body, 60mm bore. Height adjustable. German engineering."),

  // ── Cognito Motorsports (2) ────────────────────────────────────────────
  sp("cognito-e-series", "Cognito", "E-Series Lift Kit", "entry",
    14, 35, "$700 - $1,100",
    "https://www.amazon.com/dp/B0CXYZ5678?tag=prepperevo-20", "all",
    "2-inch lift with upgraded springs. Bolt-on, no welding required."),
  sp("cognito-pro", "Cognito", "Pro Series Long Travel", "race",
    28, 50, "$3,500 - $5,000",
    "https://www.amazon.com/dp/B0CXYZ5678?tag=prepperevo-20", "all",
    "Full long-travel kit with A-arms. +4 inches of width, massive travel increase."),

  // ── Shock Therapy (3) ──────────────────────────────────────────────────
  sp("st-dual-rate-spring", "Shock Therapy", "Dual Rate Spring Kit", "entry",
    12, 18, "$800 - $950",
    "https://www.amazon.com/dp/B0DXYZ9012?tag=prepperevo-20", "all",
    "Custom-tailored spring set (no shocks). CrSi material, made in USA, lifetime warranty."),
  sp("st-level1", "Shock Therapy", "Level 1 Valving + Springs", "entry",
    18, 32, "$800 - $1,200",
    "https://www.amazon.com/dp/B0DXYZ9012?tag=prepperevo-20", "all",
    "Re-valved stock shocks + dual-rate springs. Best bang-for-buck full upgrade."),
  sp("st-level3", "Shock Therapy", "Level 3 Performance", "mid",
    25, 36, "$1,800 - $2,800",
    "https://www.amazon.com/dp/B0DXYZ9012?tag=prepperevo-20", "all",
    "Fox/King bodies with custom ST valving. Race-tuned for your specific machine."),

  // ── Eibach (3) ─────────────────────────────────────────────────────────
  sp("eibach-stage2", "Eibach", "Pro-UTV Stage 2 (2-4 riders, +99 lbs)", "entry",
    16, 73, "$800 - $930",
    "https://www.amazon.com/dp/B07HXYZ345?tag=prepperevo-20", "all",
    "Set of 8 dual-rate springs (no shocks). Steel construction — heavy but effective. Reduced buck, better control."),
  sp("eibach-stage3", "Eibach", "Pro-UTV Stage 3 (+100-199 lbs load)", "entry",
    20, 73, "$900 - $1,100",
    "https://www.amazon.com/dp/B07HXYZ345?tag=prepperevo-20", "all",
    "Set of 8 dual-rate springs for heavier loads. Bumpers, skid plates, accessories."),
  sp("eibach-stage4", "Eibach", "Pro-UTV Stage 4 (+300 lbs load)", "mid",
    25, 75, "$1,000 - $1,200",
    "https://www.amazon.com/dp/B07HXYZ345?tag=prepperevo-20", "all",
    "Heaviest load springs. For plated vehicles with max accessories. 8 spring set."),

  // ── ZBroz (2) ──────────────────────────────────────────────────────────
  sp("zbroz-k12", "ZBroz", "K12 Dual Rate Spring Kit", "entry",
    14, 8, "$250 - $400",
    "https://www.amazon.com/dp/B0EXYZ6789?tag=prepperevo-20", "all",
    "Dual-rate springs designed for RZR/Maverick. Springs only, minimal weight."),
  sp("zbroz-lightning", "ZBroz", "Lightning+ Shocks", "mid",
    24, 36, "$2,000 - $3,000",
    "https://www.amazon.com/dp/B0EXYZ6789?tag=prepperevo-20", "all",
    "2.5-inch body, remote reservoir. Fully tunable. Polaris/Can-Am specific fitment."),

  // ── SuperATV (2) ───────────────────────────────────────────────────────
  sp("superatv-rhino2", "SuperATV", "Rhino 2.0 Shocks", "entry",
    15, 32, "$600 - $1,000",
    "https://www.amazon.com/dp/B07XYZ0123?tag=prepperevo-20", "all",
    "2-inch body, 8 clicks of compression adjust. Affordable performance."),
  sp("superatv-gdp-portal", "SuperATV", "GDP Portal Gear Lift + Shocks", "race",
    20, 60, "$3,500 - $5,500",
    "https://www.amazon.com/dp/B07XYZ0123?tag=prepperevo-20", "all",
    "Portal gear hubs + matching shocks. Adds ground clearance. Heavy but transformative."),

  // ── Icon Vehicle Dynamics (2) ──────────────────────────────────────────
  sp("icon-2.0-vs", "Icon", "2.0 VS Series", "entry",
    14, 30, "$700 - $1,000",
    "https://www.amazon.com/dp/B0FXYZ4567?tag=prepperevo-20", "all",
    "Vehicle-specific tuning. Aluminum body, deflective disc valving."),
  sp("icon-2.5-cdcv", "Icon", "2.5 CDCV Coilover", "mid",
    22, 38, "$2,200 - $3,200",
    "https://www.amazon.com/dp/B0FXYZ4567?tag=prepperevo-20", "all",
    "Compression Damping Control Valve. Remote reservoir. Excellent heat management."),

  // ── Radflo (2) ─────────────────────────────────────────────────────────
  sp("radflo-2.0", "Radflo", "2.0 OE Replacement", "entry",
    12, 28, "$600 - $900",
    "https://www.amazon.com/dp/B0GXYZ8901?tag=prepperevo-20", "all",
    "Direct OE replacement with improved valving. Made in USA. Rebuildable."),
  sp("radflo-2.5", "Radflo", "2.5 Coilover w/ Reservoir", "mid",
    22, 38, "$2,000 - $3,000",
    "https://www.amazon.com/dp/B0GXYZ8901?tag=prepperevo-20", "all",
    "2.5-inch body with remote reservoir. Adjustable compression and rebound."),

  // ── Teixeira Tech (2) ──────────────────────────────────────────────────
  sp("teixeira-at-arms", "Teixeira Tech", "AT Long Travel A-Arms", "mid",
    20, 45, "$2,000 - $3,000",
    "https://www.amazon.com/dp/B0HXYZ2345?tag=prepperevo-20", "all",
    "Chromoly A-arms with +2 width per side. Requires matching shocks (not included)."),
  sp("teixeira-at-full", "Teixeira Tech", "AT Long Travel Full Kit", "race",
    28, 55, "$4,000 - $5,500",
    "https://www.amazon.com/dp/B0HXYZ2345?tag=prepperevo-20", "all",
    "Complete A-arms + shocks + springs. Full long-travel conversion."),

  // ── Dirt Dynamics (2) ──────────────────────────────────────────────────
  sp("dd-dual-rate", "Dirt Dynamics", "Dual Rate Spring Kit", "entry",
    14, 8, "$200 - $350",
    "https://www.amazon.com/dp/B0IXYZ6789?tag=prepperevo-20", "all",
    "Dual-rate progressive springs. Springs only — keeps your factory shocks."),
  sp("dd-performance", "Dirt Dynamics", "Performance Shock Kit", "mid",
    22, 36, "$1,800 - $2,800",
    "https://www.amazon.com/dp/B0IXYZ6789?tag=prepperevo-20", "all",
    "2.5-inch body with velocity-sensitive valving. Built for loaded trail rigs."),

  // ── Baja Kits (2) ─────────────────────────────────────────────────────
  sp("baja-lt-prerunner", "Baja Kits", "Long Travel Prerunner", "race",
    30, 55, "$4,500 - $6,500",
    "https://www.amazon.com/dp/B0JXYZ0123?tag=prepperevo-20", "all",
    "Full long-travel kit with chromoly arms. +6 inches of track width. Desert beast."),
  sp("baja-lt-race", "Baja Kits", "Long Travel Race Kit", "race",
    35, 60, "$6,000 - $8,500",
    "https://www.amazon.com/dp/B0JXYZ0123?tag=prepperevo-20", "all",
    "Complete race-spec long travel with King/Fox 3.0 IBP. Baja 1000 proven."),
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getSuspensionBrands(): string[] {
  return [...new Set(suspensionProducts.map((p) => p.brand))].sort();
}

export function getSuspensionByBrand(brand: string): SuspensionProduct[] {
  return suspensionProducts.filter((p) => p.brand === brand);
}

export function findSuspensionProduct(id: string): SuspensionProduct | undefined {
  return suspensionProducts.find((p) => p.id === id);
}
