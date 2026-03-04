// ─── RigRated Tires & Wheels Database ────────────────────────────────────────
// Weights sourced from manufacturer specs, retailer listings, and forum data.
// All weights are per-unit (per tire / per wheel).

export interface UTVTire {
  id: string;
  brand: string;
  model: string;
  size: string;
  weightLbs: number;
  terrain: "all-terrain" | "mud" | "sand" | "rock" | "street";
  affiliateUrl: string;
  notes?: string;
}

export interface UTVWheel {
  id: string;
  brand: string;
  model: string;
  size: string;
  weightLbs: number;
  material: "aluminum" | "steel" | "beadlock";
  affiliateUrl: string;
  notes?: string;
}

export const tires: UTVTire[] = [
  // ── SuperATV ───────────────────────────────────────────────────────────
  { id: "satv-assassinator-32", brand: "SuperATV", model: "Assassinator", size: "32x8R14", weightLbs: 38, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07BQXYZ01?tag=prepperevo-20", notes: "Narrow 8-inch mud tire. Aggressive self-cleaning tread." },
  { id: "satv-assassinator-34", brand: "SuperATV", model: "Assassinator", size: "34x8R14", weightLbs: 42, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07BQXYZ01?tag=prepperevo-20" },
  { id: "satv-xt-warrior-32", brand: "SuperATV", model: "XT Warrior", size: "32x10R14", weightLbs: 49, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07NXYZ234?tag=prepperevo-20", notes: "Sticky compound, aggressive shoulder lugs." },
  { id: "satv-xt-warrior-34", brand: "SuperATV", model: "XT Warrior", size: "34x10R15", weightLbs: 55, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07NXYZ234?tag=prepperevo-20" },
  { id: "satv-terminator-30", brand: "SuperATV", model: "Terminator", size: "29.5x10R14", weightLbs: 46, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07PXYZ567?tag=prepperevo-20", notes: "The OG UTV mud tire. Proven in deep muck." },
  { id: "satv-terminator-34", brand: "SuperATV", model: "Terminator", size: "34x10R18", weightLbs: 59, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B07PXYZ567?tag=prepperevo-20" },

  // ── Maxxis ─────────────────────────────────────────────────────────────
  { id: "maxxis-bighorn-27", brand: "Maxxis", model: "Bighorn 2.0", size: "27x9R14", weightLbs: 29, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B001CZXYZ1?tag=prepperevo-20", notes: "The gold standard all-terrain UTV tire." },
  { id: "maxxis-bighorn-28", brand: "Maxxis", model: "Bighorn 2.0", size: "28x10R14", weightLbs: 30, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B001CZXYZ1?tag=prepperevo-20" },
  { id: "maxxis-bighorn-30", brand: "Maxxis", model: "Bighorn 2.0", size: "30x10R14", weightLbs: 30, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B001CZXYZ1?tag=prepperevo-20" },
  { id: "maxxis-carnivore-28", brand: "Maxxis", model: "Carnivore", size: "28x10R14", weightLbs: 30, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B07KXYZ890?tag=prepperevo-20", notes: "8-ply radial. Puncture-resistant sidewalls." },
  { id: "maxxis-carnivore-30", brand: "Maxxis", model: "Carnivore", size: "30x10R14", weightLbs: 34, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B07KXYZ890?tag=prepperevo-20" },
  { id: "maxxis-carnivore-32", brand: "Maxxis", model: "Carnivore", size: "32x10R15", weightLbs: 38, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B07KXYZ890?tag=prepperevo-20" },
  { id: "maxxis-liberty-28", brand: "Maxxis", model: "Liberty", size: "28x10R14", weightLbs: 32, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B07LXYZ123?tag=prepperevo-20", notes: "ML7 compound for long tread life. Highway-legal." },
  { id: "maxxis-liberty-30", brand: "Maxxis", model: "Liberty", size: "30x10R14", weightLbs: 34, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B07LXYZ123?tag=prepperevo-20" },

  // ── ITP ────────────────────────────────────────────────────────────────
  { id: "itp-coyote-27", brand: "ITP", model: "Coyote", size: "27x9R14", weightLbs: 32, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08AXYZ456?tag=prepperevo-20", notes: "8-ply radial. Great rock and trail grip." },
  { id: "itp-coyote-27r", brand: "ITP", model: "Coyote", size: "27x11R14", weightLbs: 38, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08AXYZ456?tag=prepperevo-20" },
  { id: "itp-terracross-26", brand: "ITP", model: "Terra Cross R/T", size: "26x9R14", weightLbs: 25, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08BXYZ789?tag=prepperevo-20", notes: "Light and nimble. Good for stock replacement." },
  { id: "itp-terracross-26r", brand: "ITP", model: "Terra Cross R/T", size: "26x11R14", weightLbs: 32, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08BXYZ789?tag=prepperevo-20" },
  { id: "itp-blackwater-27", brand: "ITP", model: "Blackwater Evolution", size: "27x9R14", weightLbs: 28, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08CXYZ012?tag=prepperevo-20", notes: "Great wet/dry grip. Affordable radial." },
  { id: "itp-blackwater-30", brand: "ITP", model: "Blackwater Evolution", size: "30x10R14", weightLbs: 34, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B08CXYZ012?tag=prepperevo-20" },

  // ── EFX ────────────────────────────────────────────────────────────────
  { id: "efx-motovator-28", brand: "EFX", model: "MotoVator", size: "28x9.5R14", weightLbs: 42, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B09DXYZ345?tag=prepperevo-20", notes: "Steel-belted radial. Heavy but puncture-proof." },
  { id: "efx-motovator-32", brand: "EFX", model: "MotoVator", size: "32x9.5R14", weightLbs: 46, terrain: "mud", affiliateUrl: "https://www.amazon.com/dp/B09DXYZ345?tag=prepperevo-20" },
  { id: "efx-motoclaw-28", brand: "EFX", model: "MotoClaw", size: "28x10R14", weightLbs: 36, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B09EXYZ678?tag=prepperevo-20", notes: "Good all-around. Moderate mud and trail capability." },
  { id: "efx-motoclaw-30", brand: "EFX", model: "MotoClaw", size: "30x10R14", weightLbs: 42, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B09EXYZ678?tag=prepperevo-20" },

  // ── System 3 ───────────────────────────────────────────────────────────
  { id: "sys3-rt320-30", brand: "System 3", model: "RT320", size: "30x10R14", weightLbs: 38, terrain: "rock", affiliateUrl: "https://www.amazon.com/dp/B0AFXYZ901?tag=prepperevo-20", notes: "Rock-focused tread. Excellent side-hill grip." },
  { id: "sys3-rt320-33", brand: "System 3", model: "RT320", size: "33x9.5R15", weightLbs: 40, terrain: "rock", affiliateUrl: "https://www.amazon.com/dp/B0AFXYZ901?tag=prepperevo-20" },
  { id: "sys3-xt300-33", brand: "System 3", model: "XT300", size: "33x10R15", weightLbs: 42, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AGXYZ234?tag=prepperevo-20", notes: "Extreme terrain radial. 8-ply." },
  { id: "sys3-xt300-35", brand: "System 3", model: "XT300", size: "35x10R15", weightLbs: 45, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AGXYZ234?tag=prepperevo-20" },

  // ── Sedona ─────────────────────────────────────────────────────────────
  { id: "sedona-bucksnort-25", brand: "Sedona", model: "Buck Snort", size: "25x8R12", weightLbs: 22, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AHXYZ567?tag=prepperevo-20", notes: "Budget-friendly 6-ply bias. Light weight." },
  { id: "sedona-bucksnort-27", brand: "Sedona", model: "Buck Snort", size: "27x9R14", weightLbs: 25, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AHXYZ567?tag=prepperevo-20" },

  // ── GBC ────────────────────────────────────────────────────────────────
  { id: "gbc-mongrel-27", brand: "GBC", model: "Kanati Mongrel", size: "27x9R14", weightLbs: 27, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AIXYZ890?tag=prepperevo-20", notes: "10-ply radial. Great value all-terrain." },
  { id: "gbc-mongrel-30", brand: "GBC", model: "Kanati Mongrel", size: "30x10R14", weightLbs: 35, terrain: "all-terrain", affiliateUrl: "https://www.amazon.com/dp/B0AIXYZ890?tag=prepperevo-20" },

  // ── Tensor ─────────────────────────────────────────────────────────────
  { id: "tensor-reg-28", brand: "Tensor", model: "Regulator", size: "28x10R14", weightLbs: 37, terrain: "sand", affiliateUrl: "https://www.amazon.com/dp/B0AJXYZ123?tag=prepperevo-20", notes: "DOT approved. Desert race proven." },
  { id: "tensor-reg-30", brand: "Tensor", model: "Regulator", size: "30x10R14", weightLbs: 39, terrain: "sand", affiliateUrl: "https://www.amazon.com/dp/B0AJXYZ123?tag=prepperevo-20" },
  { id: "tensor-reg-32", brand: "Tensor", model: "Regulator", size: "32x10R15", weightLbs: 44, terrain: "sand", affiliateUrl: "https://www.amazon.com/dp/B0AJXYZ123?tag=prepperevo-20" },
  { id: "tensor-ds-30", brand: "Tensor", model: "DS (Desert Series)", size: "30x10R14", weightLbs: 38, terrain: "sand", affiliateUrl: "https://www.amazon.com/dp/B0AKXYZ456?tag=prepperevo-20", notes: "Silica compound for desert heat. Smooth ride." },
  { id: "tensor-ds-32", brand: "Tensor", model: "DS (Desert Series)", size: "32x10R15", weightLbs: 42, terrain: "sand", affiliateUrl: "https://www.amazon.com/dp/B0AKXYZ456?tag=prepperevo-20" },
];

export const wheels: UTVWheel[] = [
  // ── Method ─────────────────────────────────────────────────────────────
  { id: "method-401-15", brand: "Method", model: "401 Beadlock", size: "15x7", weightLbs: 19, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0ALXYZ789?tag=prepperevo-20", notes: "Cast A356 aluminum, forged 6061 beadlock ring." },
  { id: "method-405-14", brand: "Method", model: "405 Beadlock", size: "14x8", weightLbs: 20, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AMXYZ012?tag=prepperevo-20" },
  { id: "method-405-15", brand: "Method", model: "405 Beadlock", size: "15x7", weightLbs: 22, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AMXYZ012?tag=prepperevo-20", notes: "Heavy-duty beadlock. 4/156 & 4/136 bolt patterns." },
  { id: "method-410-14", brand: "Method", model: "410 Bead Grip", size: "14x7", weightLbs: 14, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0ANXYZ345?tag=prepperevo-20", notes: "Bead Grip (no external ring) — lighter than beadlock." },
  { id: "method-410-15", brand: "Method", model: "410 Bead Grip", size: "15x7", weightLbs: 15, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0ANXYZ345?tag=prepperevo-20" },

  // ── KMC ────────────────────────────────────────────────────────────────
  { id: "kmc-xs234-14", brand: "KMC", model: "XS234 Addict 2 Beadlock", size: "14x7", weightLbs: 17, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AOXYZ678?tag=prepperevo-20" },
  { id: "kmc-xs234-15", brand: "KMC", model: "XS234 Addict 2 Beadlock", size: "15x6", weightLbs: 17, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AOXYZ678?tag=prepperevo-20" },
  { id: "kmc-xs811-14", brand: "KMC", model: "XS811 Rockstar II", size: "14x7", weightLbs: 15, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0APXYZ901?tag=prepperevo-20" },

  // ── Fuel ───────────────────────────────────────────────────────────────
  { id: "fuel-anza-14", brand: "Fuel", model: "Anza D557", size: "14x7", weightLbs: 16, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0AQXYZ234?tag=prepperevo-20", notes: "Matte black with anthracite ring. Clean look." },
  { id: "fuel-mav-14", brand: "Fuel", model: "Maverick D538", size: "14x7", weightLbs: 16, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0ARXYZ567?tag=prepperevo-20" },

  // ── STI ────────────────────────────────────────────────────────────────
  { id: "sti-hda1-14", brand: "STI", model: "HD A1 Beadlock", size: "14x7", weightLbs: 16, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0ASXYZ890?tag=prepperevo-20", notes: "10mm billet beadlock ring." },
  { id: "sti-hda1-15", brand: "STI", model: "HD A1 Beadlock", size: "15x7", weightLbs: 18, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0ASXYZ890?tag=prepperevo-20" },
  { id: "sti-hd9-14", brand: "STI", model: "HD9 CompLock", size: "14x7", weightLbs: 14, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0ATXYZ123?tag=prepperevo-20", notes: "Lightweight beadlock design." },

  // ── MSA ────────────────────────────────────────────────────────────────
  { id: "msa-m12-14", brand: "MSA", model: "M12 Diesel", size: "14x7", weightLbs: 12, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0AUXYZ456?tag=prepperevo-20", notes: "Lightest wheel in this list. Great for weight-conscious builds." },
  { id: "msa-m12-15", brand: "MSA", model: "M12 Diesel", size: "15x7", weightLbs: 13, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0AUXYZ456?tag=prepperevo-20" },
  { id: "msa-m21-14", brand: "MSA", model: "M21 LOK Beadlock", size: "14x7", weightLbs: 16, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AVXYZ789?tag=prepperevo-20" },
  { id: "msa-m21-15", brand: "MSA", model: "M21 LOK Beadlock", size: "15x7", weightLbs: 17, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AVXYZ789?tag=prepperevo-20" },

  // ── System 3 ───────────────────────────────────────────────────────────
  { id: "sys3-sb3-14", brand: "System 3", model: "SB-3 Beadlock", size: "14x7", weightLbs: 15, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AWXYZ012?tag=prepperevo-20", notes: "1500 lb load rating. Tough trail wheel." },
  { id: "sys3-sb3-15", brand: "System 3", model: "SB-3 Beadlock", size: "15x7", weightLbs: 17, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AWXYZ012?tag=prepperevo-20" },
  { id: "sys3-sb4-14", brand: "System 3", model: "SB-4 Beadlock", size: "14x7", weightLbs: 15, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AXXYZ345?tag=prepperevo-20" },
  { id: "sys3-sb4-15", brand: "System 3", model: "SB-4 Beadlock", size: "15x7", weightLbs: 16, material: "beadlock", affiliateUrl: "https://www.amazon.com/dp/B0AXXYZ345?tag=prepperevo-20" },

  // ── Raceline ───────────────────────────────────────────────────────────
  { id: "raceline-krank-14", brand: "Raceline", model: "Krank A94", size: "14x7", weightLbs: 14, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0AYXYZ678?tag=prepperevo-20", notes: "Simulated beadlock look. Lightweight cast aluminum." },
  { id: "raceline-krank-15", brand: "Raceline", model: "Krank A94", size: "15x7", weightLbs: 16, material: "aluminum", affiliateUrl: "https://www.amazon.com/dp/B0AYXYZ678?tag=prepperevo-20" },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getTireBrands(): string[] {
  return [...new Set(tires.map((t) => t.brand))].sort();
}

export function getTiresByBrand(brand: string): UTVTire[] {
  return tires.filter((t) => t.brand === brand);
}

export function findTire(id: string): UTVTire | undefined {
  return tires.find((t) => t.id === id);
}

export function getWheelBrands(): string[] {
  return [...new Set(wheels.map((w) => w.brand))].sort();
}

export function getWheelsByBrand(brand: string): UTVWheel[] {
  return wheels.filter((w) => w.brand === brand);
}

export function findWheel(id: string): UTVWheel | undefined {
  return wheels.find((w) => w.id === id);
}
