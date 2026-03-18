// Skills & Knowledge Gap Analyzer — Domain and Skill Definitions
// 8 domains, 68 skills total

export type SkillLevel = 0 | 1 | 2 | 3 | 4 | 5;

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  0: "No Knowledge",
  1: "Aware",
  2: "Basic",
  3: "Competent",
  4: "Proficient",
  5: "Expert",
};

export const SKILL_LEVEL_COLORS: Record<SkillLevel, string> = {
  0: "#6B7280", // gray
  1: "#EF4444", // red
  2: "#F97316", // orange
  3: "#EAB308", // yellow
  4: "#22C55E", // green
  5: "#8B5CF6", // purple
};

export interface LearningResource {
  title: string;
  url: string;
  type: "article" | "video" | "course" | "book";
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  whyItMatters: string;
  learningResources: LearningResource[];
  relatedTools?: string[];
  difficulty: "beginner" | "intermediate" | "advanced" | "expert";
  practiceFrequency: string;
  /** Weight multiplier for readiness score (1 = normal, 1.5 = important, 2 = critical) */
  weight: number;
  /** Skill IDs that should be rated 2+ before this skill is useful */
  prerequisites?: string[];
}

export interface SkillDomain {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  skills: Skill[];
}

export const SKILLS_STORAGE_KEY = "pe-skills-assessment";

export interface FamilyMember {
  id: string;
  name: string;
  role: "Spouse" | "Child" | "Parent" | "Sibling" | "Other";
  domainRatings: Record<string, SkillLevel>;
}

export interface Certification {
  id: string;
  name: string;
  dateObtained: string; // ISO date
  expirationDate?: string; // ISO date, optional — some don't expire
  isCustom?: boolean;
}

export interface SkillsAssessmentData {
  ratings: Record<string, SkillLevel>;
  lastAssessed: string; // ISO date
  familyMembers?: FamilyMember[];
  certifications?: Certification[];
}

// ─── PREDEFINED CERTIFICATIONS ─────────────────────────────────────
export const PREDEFINED_CERTIFICATIONS: { name: string; hasExpiration: boolean }[] = [
  { name: "CPR / First Aid (American Red Cross)", hasExpiration: true },
  { name: "Stop the Bleed", hasExpiration: true },
  { name: "Wilderness First Aid (WFA)", hasExpiration: true },
  { name: "Wilderness First Responder (WFR)", hasExpiration: true },
  { name: "HAM Radio Technician License", hasExpiration: true },
  { name: "HAM Radio General License", hasExpiration: true },
  { name: "CERT (Community Emergency Response Team)", hasExpiration: false },
  { name: "Hunter Safety", hasExpiration: false },
  { name: "Concealed Carry Permit", hasExpiration: true },
  { name: "Defensive Driving", hasExpiration: true },
  { name: "FEMA ICS-100", hasExpiration: false },
  { name: "FEMA IS-700", hasExpiration: false },
  { name: "Lifeguard Certification", hasExpiration: true },
  { name: "Food Handler's Permit", hasExpiration: true },
  { name: "Fire Extinguisher Training", hasExpiration: true },
];

// ─── SCENARIO MAPPING ──────────────────────────────────────────────
export interface ScenarioMatch {
  domainId: string;
  scenarioName: string;
  scenarioUrl: string;
  description: string;
}

export const SCENARIO_DOMAIN_MAP: ScenarioMatch[] = [
  { domainId: "water", scenarioName: "Coordinated Infrastructure Attack", scenarioUrl: "/tools/shtf-simulator", description: "Water systems are prime targets in infrastructure attacks. Your water domain gaps leave you vulnerable." },
  { domainId: "medical", scenarioName: "Severe Pandemic", scenarioUrl: "/tools/shtf-simulator", description: "Medical knowledge is the difference between life and death when hospitals are overwhelmed." },
  { domainId: "power", scenarioName: "EMP Strike", scenarioUrl: "/tools/shtf-simulator", description: "An EMP takes out the grid indefinitely. Your power gaps mean darkness and no comms." },
  { domainId: "food", scenarioName: "Supply Chain Siege", scenarioUrl: "/tools/shtf-simulator", description: "When grocery shelves empty and stay empty, food skills become survival skills." },
  { domainId: "security", scenarioName: "Civil Unrest", scenarioUrl: "/tools/shtf-simulator", description: "Security gaps are exploited fastest when social order breaks down." },
  { domainId: "nav-comm", scenarioName: "Power Grid Failure", scenarioUrl: "/tools/shtf-simulator", description: "No grid means no GPS, no cell service, no internet. Can you navigate and communicate analog?" },
  { domainId: "vehicle", scenarioName: "Cascading Natural Disaster", scenarioUrl: "/tools/shtf-simulator", description: "Vehicle and mobility skills determine whether you evacuate or get stuck in the danger zone." },
  { domainId: "shelter", scenarioName: "Winter Storm", scenarioUrl: "/tools/shtf-simulator", description: "Shelter and warmth gaps are lethal when temperatures drop and power stays off." },
];

// ─── BARTER TRADE VALUES ───────────────────────────────────────────
export const DOMAIN_BARTER_VALUES: Record<string, { tradeValue: number; description: string }> = {
  medical: { tradeValue: 9, description: "Highest demand skill in any crisis. People will trade anything to save a life." },
  food: { tradeValue: 8, description: "Growing, preserving, and producing food is a renewable trade asset." },
  power: { tradeValue: 8, description: "Electrical repair and solar setup skills keep communities running." },
  water: { tradeValue: 7, description: "Water purification and well knowledge saves entire neighborhoods." },
  shelter: { tradeValue: 7, description: "Construction and repair skills keep people warm and safe." },
  vehicle: { tradeValue: 7, description: "Mechanical skills keep transportation and generators functional." },
  security: { tradeValue: 6, description: "Security planning and community organization have situational value." },
  "nav-comm": { tradeValue: 5, description: "Navigation and radio skills are valuable but less in constant demand." },
};

// ─── DOMAIN 1: WATER ────────────────────────────────────────────────
const waterSkills: Skill[] = [
  {
    id: "water-source-id",
    name: "Water Source Identification",
    description: "Locate natural water sources — springs, streams, rivers, ponds — and evaluate safety indicators like flow rate, clarity, and upstream contamination risks.",
    whyItMatters: "In any extended emergency, stored water runs out. Knowing how to find water in your environment is the difference between thriving and dehydrating.",
    learningResources: [
      { title: "How to Find Water in the Wild", url: "https://www.youtube.com/watch?v=WfGMYdalClU", type: "video" },
      { title: "USGS Water Resources", url: "https://www.usgs.gov/mission-areas/water-resources", type: "article" },
      { title: "SAS Survival Handbook — John Wiseman", url: "https://www.amazon.com/SAS-Survival-Handbook-Third-Surviving/dp/0062378074", type: "book" },
    ],
    relatedTools: ["water-storage-calculator"],
    difficulty: "beginner",
    practiceFrequency: "Seasonal — practice on hikes and camping trips",
    weight: 1.5,
  },
  {
    id: "water-filtration",
    name: "Water Filtration",
    description: "Operate pump filters, gravity filters (like Berkey or LifeStraw Mission), squeeze filters (Sawyer, Katadyn BeFree), and straw filters for personal use.",
    whyItMatters: "Filtration removes bacteria, protozoa, and sediment from wild water. Without it, drinking from a stream is a gamble with giardia and worse.",
    learningResources: [
      { title: "Best Survival Water Filters", url: "/articles/best-survival-water-filters", type: "article" },
      { title: "Sawyer Squeeze vs Katadyn BeFree", url: "https://www.youtube.com/watch?v=dYSq2eRsZPQ", type: "video" },
      { title: "Berkey Gravity Filter Setup", url: "https://www.youtube.com/watch?v=7hR7SKL3WiM", type: "video" },
    ],
    relatedTools: ["water-storage-calculator"],
    difficulty: "beginner",
    practiceFrequency: "Monthly — backflush and test your filters",
    weight: 2,
  },
  {
    id: "water-purification",
    name: "Water Purification",
    description: "Purify water using chemical treatment (chlorine dioxide, iodine, bleach), UV light (SteriPEN), and boiling. Understand kill times and dosage.",
    whyItMatters: "Filters miss viruses. Purification handles what filtration can't — especially important in flood water or areas with human waste contamination.",
    learningResources: [
      { title: "Water Purification Methods Compared", url: "https://www.youtube.com/watch?v=6sPFate-J4I", type: "video" },
      { title: "EPA Emergency Water Disinfection", url: "https://www.epa.gov/ground-water-and-drinking-water/emergency-disinfection-drinking-water", type: "article" },
      { title: "Aquamira vs Katadyn Micropur", url: "https://www.youtube.com/watch?v=u3GxLzj7Y9k", type: "video" },
    ],
    relatedTools: ["water-storage-calculator"],
    difficulty: "beginner",
    practiceFrequency: "Quarterly — practice different methods",
    weight: 2,
    prerequisites: ["water-filtration"],
  },
  {
    id: "water-storage",
    name: "Water Storage & Rotation",
    description: "Properly store water in food-grade containers, understand shelf life, rotation schedules, and treatment for long-term storage (7+ gallon jugs, WaterBOBs, IBC totes).",
    whyItMatters: "Most people don't have more than 3 days of water at home. Proper storage and rotation means your supply is actually drinkable when you need it.",
    learningResources: [
      { title: "PE Water Storage Calculator", url: "/tools/water-storage-calculator", type: "article" },
      { title: "Long Term Water Storage Guide", url: "https://www.youtube.com/watch?v=aREhJYwMhEk", type: "video" },
      { title: "How to Store Water for Emergencies", url: "/articles/how-to-store-water-for-emergencies", type: "article" },
    ],
    relatedTools: ["water-storage-calculator", "deadstock"],
    difficulty: "beginner",
    practiceFrequency: "Every 6 months — rotate and inspect",
    weight: 2,
  },
  {
    id: "rainwater-harvesting",
    name: "Rainwater Harvesting",
    description: "Design and build rainwater collection systems — gutters, first-flush diverters, storage barrels, and cisterns. Know local legality and treatment requirements.",
    whyItMatters: "Free water that falls from the sky. A good system on a 1,000 sqft roof can collect 600+ gallons per inch of rain.",
    learningResources: [
      { title: "DIY Rainwater Harvesting System", url: "https://www.youtube.com/watch?v=cLWGSk3B3Ag", type: "video" },
      { title: "Rainwater Harvesting Laws by State", url: "https://worldpopulationreview.com/state-rankings/rainwater-collection-laws-by-state", type: "article" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Once then maintain — seasonal gutter cleaning",
    weight: 1,
  },
  {
    id: "well-systems",
    name: "Well Water Systems",
    description: "Install and maintain hand pumps (Simple Pump, Bison), solar-powered well pumps, and understand well depth, flow rate, and aquifer basics.",
    whyItMatters: "If you have a well and the power goes out, a hand or solar pump means you still have water. Without one, your well is just an expensive hole.",
    learningResources: [
      { title: "Simple Pump Installation", url: "https://www.youtube.com/watch?v=dSPk8bFMYhg", type: "video" },
      { title: "Off-Grid Well Pump Options", url: "https://www.youtube.com/watch?v=80fNFLE6dtY", type: "video" },
    ],
    difficulty: "advanced",
    practiceFrequency: "Annually — test backup pump systems",
    weight: 1,
  },
  {
    id: "water-testing",
    name: "Water Testing & Contamination",
    description: "Use test kits and visual/smell indicators to assess water safety — bacteria, heavy metals, pH, turbidity. Know when NOT to drink.",
    whyItMatters: "Clear water isn't always clean water. Knowing how to test saves you from drinking contaminated sources that look fine.",
    learningResources: [
      { title: "How to Test Water Quality at Home", url: "https://www.youtube.com/watch?v=0hIZpREfzHQ", type: "video" },
      { title: "Water Quality Test Kits Compared", url: "https://www.youtube.com/watch?v=CXbL_dqrfnc", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Quarterly — test your stored and sourced water",
    weight: 1,
    prerequisites: ["water-filtration", "water-purification"],
  },
  {
    id: "greywater-management",
    name: "Greywater Management",
    description: "Reuse wash water for irrigation and sanitation. Build simple greywater systems, understand soap selection, and avoid contamination of food crops.",
    whyItMatters: "In a grid-down situation, every gallon counts. Reusing wash water for gardens stretches your clean water supply significantly.",
    learningResources: [
      { title: "Simple Greywater System", url: "https://www.youtube.com/watch?v=K7lKJi_wKqk", type: "video" },
      { title: "Greywater Action Guide", url: "https://greywateraction.org/greywater-codes-and-policy/", type: "article" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Once built, maintain seasonally",
    weight: 0.75,
  },
];

// ─── DOMAIN 2: FOOD ─────────────────────────────────────────────────
const foodSkills: Skill[] = [
  {
    id: "food-storage",
    name: "Food Storage & Preservation",
    description: "Store food for 1-25+ years using canning (water bath, pressure), dehydrating, freeze-drying, Mylar bags with O2 absorbers, and vacuum sealing.",
    whyItMatters: "A pantry with 2 weeks of food is normal life. 3-12 months means you survive disruptions without depending on anyone.",
    learningResources: [
      { title: "PE Food Storage Calculator", url: "/tools/food-storage-calculator", type: "article" },
      { title: "LDS Food Storage Guide", url: "https://www.churchofjesuschrist.org/study/manual/food-storage", type: "article" },
      { title: "Ball Complete Book of Home Preserving", url: "https://www.amazon.com/Ball-Complete-Book-Home-Preserving/dp/0778801314", type: "book" },
    ],
    relatedTools: ["food-storage-calculator", "deadstock"],
    difficulty: "beginner",
    practiceFrequency: "Monthly — rotate stock and check dates",
    weight: 2,
  },
  {
    id: "gardening",
    name: "Gardening",
    description: "Grow food using raised beds, container gardens, in-ground plots, and indoor growing. Understand soil, composting, pest management, and seasonal planting.",
    whyItMatters: "Stored food runs out. A garden is a renewable food source. Even a small balcony garden produces meaningful calories and morale-boosting fresh food.",
    learningResources: [
      { title: "Square Foot Gardening — Mel Bartholomew", url: "https://www.amazon.com/Square-Foot-Gardening-Fourth-Fully/dp/0760383142", type: "book" },
      { title: "Epic Gardening Beginner Series", url: "https://www.youtube.com/watch?v=B0DrWAhNBKM", type: "video" },
      { title: "USDA Plant Hardiness Zones", url: "https://planthardiness.ars.usda.gov/", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Daily during growing season — weekly minimum",
    weight: 1.5,
  },
  {
    id: "seed-saving",
    name: "Seed Saving & Storage",
    description: "Save seeds from open-pollinated and heirloom varieties. Understand isolation distances, drying methods, and long-term seed viability.",
    whyItMatters: "Seeds are the most compact form of future food. A $3 packet of tomato seeds produces 50+ lbs of food. Knowing how to save them means unlimited future harvests.",
    learningResources: [
      { title: "Seed to Seed — Suzanne Ashworth", url: "https://www.amazon.com/Seed-Saving-Growing-Techniques-Vegetables/dp/1882424581", type: "book" },
      { title: "Seed Saving Basics", url: "https://www.youtube.com/watch?v=XxTgLoUxBv8", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — save seeds at end of growing season",
    weight: 1,
    prerequisites: ["gardening"],
  },
  {
    id: "hunting",
    name: "Hunting",
    description: "Harvest game using rifle, shotgun, bow, or trapping. Includes field dressing, butchering, and safe storage of wild game meat.",
    whyItMatters: "Wild game is the densest calorie source available in a long-term disruption. One deer feeds a family for weeks.",
    learningResources: [
      { title: "Hunter's Ed Online Course", url: "https://www.hunter-ed.com/", type: "course" },
      { title: "MeatEater — Hunting for Beginners", url: "https://www.youtube.com/watch?v=dYSq2eRsZPQ", type: "video" },
      { title: "The Complete Guide to Hunting, Butchering, and Cooking Wild Game — Steven Rinella", url: "https://www.amazon.com/Complete-Guide-Hunting-Butchering-Cooking/dp/0812994949", type: "book" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — during hunting season, year-round for marksmanship",
    weight: 1,
  },
  {
    id: "fishing",
    name: "Fishing",
    description: "Catch fish using rod and reel, trotlines, nets, fish traps, and improvised methods. Includes cleaning and preservation.",
    whyItMatters: "Fish are a renewable protein source available in most environments. A trotline or trap works while you do other survival tasks.",
    learningResources: [
      { title: "Fishing 101 — Beginner Basics", url: "https://www.youtube.com/watch?v=NWoHcv_CxYs", type: "video" },
      { title: "Survival Fishing Techniques", url: "https://www.youtube.com/watch?v=dn0llBB3MgA", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly when possible — muscle memory matters",
    weight: 1,
  },
  {
    id: "foraging",
    name: "Foraging & Wild Edibles",
    description: "Identify and safely harvest wild edible plants, mushrooms, nuts, and berries in your region. Know the deadly look-alikes.",
    whyItMatters: "Free food grows everywhere if you know what to look for. But one wrong mushroom can kill you. This skill requires knowledge AND practice.",
    learningResources: [
      { title: "Foraging North America — Sam Thayer", url: "https://www.amazon.com/Foragers-Harvest-Identifying-Harvesting-Preparing/dp/0976626608", type: "book" },
      { title: "Learn Your Land — YouTube", url: "https://www.youtube.com/@LearnYourLand", type: "video" },
      { title: "iNaturalist App for Plant ID", url: "https://www.inaturalist.org/", type: "article" },
    ],
    difficulty: "advanced",
    practiceFrequency: "Weekly during growing season — year-round study",
    weight: 1,
  },
  {
    id: "animal-husbandry",
    name: "Animal Husbandry",
    description: "Raise and maintain small livestock — chickens (eggs and meat), rabbits (meat and pelts), goats (milk and meat). Understand feed, housing, and health.",
    whyItMatters: "Chickens convert scraps into eggs. Rabbits breed fast and produce lean protein. Goats give milk and clear brush. Renewable food on legs.",
    learningResources: [
      { title: "Storey's Guide to Raising Chickens", url: "https://www.amazon.com/Storeys-Guide-Raising-Chickens-4th/dp/1612129307", type: "book" },
      { title: "Justin Rhodes Backyard Chickens", url: "https://www.youtube.com/@JustinRhodes", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Daily — animals need daily care",
    weight: 0.75,
  },
  {
    id: "cooking-no-power",
    name: "Cooking Without Power",
    description: "Prepare meals using camp stoves (propane, liquid fuel, alcohol), rocket stoves, Dakota fire holes, solar ovens, and open fire cooking methods.",
    whyItMatters: "When the power goes out, raw rice and canned beans aren't very useful. The ability to cook transforms your food storage into actual meals.",
    learningResources: [
      { title: "Best Emergency Cooking Methods", url: "/articles/best-camping-stoves-for-emergency-preparedness", type: "article" },
      { title: "Rocket Stove DIY Build", url: "https://www.youtube.com/watch?v=d9Baxgkjvmg", type: "video" },
      { title: "Camp Cooking Basics", url: "https://www.youtube.com/watch?v=lfZsVAqpb7c", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly — cook at least one meal without power",
    weight: 1.5,
    prerequisites: ["fire-starting", "fire-management"],
  },
  {
    id: "food-preservation-adv",
    name: "Smoking, Salting & Fermenting",
    description: "Preserve food using traditional methods — smoking meat and fish, salt curing, making jerky, fermenting vegetables (sauerkraut, kimchi), and making vinegar.",
    whyItMatters: "These methods predate refrigeration by thousands of years. They work without electricity and can preserve food for months to years.",
    learningResources: [
      { title: "The Art of Fermentation — Sandor Katz", url: "https://www.amazon.com/Art-Fermentation-Depth-Exploration-Essential/dp/160358286X", type: "book" },
      { title: "How to Smoke Meat at Home", url: "https://www.youtube.com/watch?v=iic2CrWFxYk", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — practice different preservation methods",
    weight: 1,
    prerequisites: ["hunting", "fishing"],
  },
];

// ─── DOMAIN 3: SHELTER & WARMTH ─────────────────────────────────────
const shelterSkills: Skill[] = [
  {
    id: "tent-tarp-setup",
    name: "Tent & Tarp Setup",
    description: "Set up tents, tarps, and hammock systems quickly and securely. Select campsites for drainage, wind protection, and hazard avoidance (widowmakers, flood zones).",
    whyItMatters: "A poorly pitched tent in a storm is worse than no tent. Site selection and proper setup keep you dry and alive.",
    learningResources: [
      { title: "Campsite Selection Guide", url: "/articles/best-rooftop-tents-for-overlanding", type: "article" },
      { title: "8 Tarp Configurations", url: "https://www.youtube.com/watch?v=DjxAt0Ng5rw", type: "video" },
      { title: "PE Tent Finder", url: "/tools/tent-finder", type: "article" },
    ],
    relatedTools: ["tent-finder", "rigsafe-configurator"],
    difficulty: "beginner",
    practiceFrequency: "Monthly — practice in your yard",
    weight: 1.5,
  },
  {
    id: "emergency-shelter",
    name: "Emergency Shelter Construction",
    description: "Build improvised shelters from natural materials — debris huts, lean-tos, snow caves, and A-frame shelters. Understand insulation from ground and wind.",
    whyItMatters: "If you lose your gear or get separated from your vehicle, building shelter from what's around you can prevent hypothermia death in hours.",
    learningResources: [
      { title: "Bushcraft 101 — Dave Canterbury", url: "https://www.amazon.com/Bushcraft-101-Field-Guide-Wilderness/dp/1440579776", type: "book" },
      { title: "Debris Hut Build", url: "https://www.youtube.com/watch?v=wXKL-f5w-P8", type: "video" },
      { title: "MCQBushcraft Shelter Builds", url: "https://www.youtube.com/@MCQBushcraft", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — build at least 2 shelter types per year",
    weight: 1.5,
  },
  {
    id: "fire-starting",
    name: "Fire Starting",
    description: "Start fires reliably using ferro rods, lighters, matches, magnification, and friction methods (bow drill, hand drill). Prepare tinder bundles in wet conditions.",
    whyItMatters: "Fire provides warmth, water purification, cooking, light, signaling, and morale. It's the single most important wilderness skill after shelter.",
    learningResources: [
      { title: "Fire Starting Methods Ranked", url: "https://www.youtube.com/watch?v=_tqGaOZBjIQ", type: "video" },
      { title: "Ferro Rod Technique", url: "https://www.youtube.com/watch?v=SFEnyJnMJKs", type: "video" },
      { title: "Bow Drill Fire from Scratch", url: "https://www.youtube.com/watch?v=Rr-fcBe88s0", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly — practice in different conditions",
    weight: 2,
  },
  {
    id: "fire-management",
    name: "Fire Management",
    description: "Manage fires for different purposes — cooking (coals, grill), warmth (reflector wall, long log), signaling (green branches for smoke), and fire lay types (teepee, log cabin, star).",
    whyItMatters: "Starting a fire is step one. Managing it efficiently for cooking, warmth, and safety is the real skill.",
    learningResources: [
      { title: "5 Fire Lays You Need to Know", url: "https://www.youtube.com/watch?v=aw96F05BI_0", type: "video" },
      { title: "Campfire Cooking Techniques", url: "https://www.youtube.com/watch?v=B5e7EPSoZ0g", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Every camping trip",
    weight: 1,
    prerequisites: ["fire-starting"],
  },
  {
    id: "insulation-layering",
    name: "Insulation & Layering Systems",
    description: "Understand base layer, insulation layer, and shell layer clothing systems. Know materials (merino, synthetic, down) and when each works best.",
    whyItMatters: "Cotton kills. Knowing how to layer properly prevents hypothermia in cold and overheating in warmth. It's the foundation of outdoor comfort.",
    learningResources: [
      { title: "Layering System Explained", url: "https://www.youtube.com/watch?v=y2xJ-ywXOhY", type: "video" },
      { title: "Best Base Layers for Survival", url: "/articles/best-base-layers-for-overlanding", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Every outdoor trip — learn by doing",
    weight: 1,
  },
  {
    id: "home-weatherproofing",
    name: "Home Weatherproofing",
    description: "Seal windows, insulate pipes, install storm shutters, and prepare your home to retain heat without power (insulated curtains, door sweeps, plastic sheeting).",
    whyItMatters: "Your home is your primary shelter. In a winter power outage, proper weatherproofing can keep one room livable for days.",
    learningResources: [
      { title: "Weatherproofing Your Home for Winter", url: "https://www.youtube.com/watch?v=0eqw5JVOZbE", type: "video" },
      { title: "DOE Weatherization Guide", url: "https://www.energy.gov/energysaver/weatherize", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Annually — before winter",
    weight: 1,
  },
  {
    id: "fortification",
    name: "Home Fortification & Hardening",
    description: "Reinforce doors (3-inch screws, door bars), windows (security film, shutters), and entry points. Understand safe rooms, ballistic protection levels, and CPTED principles.",
    whyItMatters: "In civil unrest or post-disaster scenarios, your home needs to resist forced entry. Most front doors can be kicked in with one boot.",
    learningResources: [
      { title: "Home Security Assessment Guide", url: "https://www.youtube.com/watch?v=9IXkWn-cNLs", type: "video" },
      { title: "Door Reinforcement Kit Installation", url: "https://www.youtube.com/watch?v=JOW55g8bR0c", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Once then maintain — annual inspection",
    weight: 1,
  },
  {
    id: "alt-heating",
    name: "Alternative Heating",
    description: "Heat your home or shelter without grid power — wood stoves, propane heaters (Mr. Buddy), kerosene heaters, and passive solar. Understand CO risks and ventilation.",
    whyItMatters: "Power outages in winter kill more people than most natural disasters. Having a backup heat source and knowing how to use it safely is critical.",
    learningResources: [
      { title: "Mr. Buddy Heater Safety Guide", url: "https://www.youtube.com/watch?v=aCahQC_RWfk", type: "video" },
      { title: "Wood Stove Heating Basics", url: "https://www.youtube.com/watch?v=aHqBvpxVA3M", type: "video" },
      { title: "Best Portable Heaters for Emergencies", url: "/articles/best-portable-heaters-for-camping", type: "article" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — test before cold season",
    weight: 1.5,
  },
];

// ─── DOMAIN 4: MEDICAL & FIRST AID ─────────────────────────────────
const medicalSkills: Skill[] = [
  {
    id: "basic-first-aid",
    name: "Basic First Aid",
    description: "Treat cuts, burns, sprains, insect stings, and minor injuries. Build and stock a proper first aid kit for home, car, and pack.",
    whyItMatters: "95% of emergencies involve minor injuries. Knowing how to handle them quickly prevents infection, reduces pain, and keeps people functional.",
    learningResources: [
      { title: "Red Cross First Aid Course", url: "https://www.redcross.org/take-a-class/first-aid", type: "course" },
      { title: "PE Bug Out Bag Calculator (Medical Category)", url: "/tools/bug-out-bag-calculator", type: "article" },
      { title: "First Aid Kit Essentials", url: "/articles/best-first-aid-kits-for-emergencies", type: "article" },
    ],
    relatedTools: ["bug-out-bag-calculator"],
    difficulty: "beginner",
    practiceFrequency: "Annually — take a refresher class",
    weight: 2,
  },
  {
    id: "wound-closure",
    name: "Wound Closure",
    description: "Close wounds using butterfly strips (Steri-Strips), wound closure strips, tissue adhesive (Dermabond), and field suturing. Know when to close vs. leave open.",
    whyItMatters: "In a grid-down scenario, the ER isn't available. Properly closing a wound prevents infection and promotes healing.",
    learningResources: [
      { title: "Wound Closure Techniques", url: "https://www.youtube.com/watch?v=OyKqV4WjLqQ", type: "video" },
      { title: "Austere Medicine — Hugh Coffee, MD", url: "https://www.amazon.com/Austere-Surgeons-Guide-Providing-Surgical/dp/1734453907", type: "book" },
    ],
    difficulty: "advanced",
    practiceFrequency: "Quarterly — practice on suture pads",
    weight: 1,
    prerequisites: ["basic-first-aid"],
  },
  {
    id: "tourniquet",
    name: "Tourniquet Application",
    description: "Apply a CAT (Combat Application Tourniquet) or SOFT-W tourniquet to stop life-threatening extremity bleeding. Know placement, timing, and when to use.",
    whyItMatters: "Severe bleeding can kill in 3-5 minutes. A properly applied tourniquet buys hours. This is the single highest-value medical skill for immediate life-saving.",
    learningResources: [
      { title: "Stop the Bleed Course", url: "https://www.stopthebleed.org/training/", type: "course" },
      { title: "Tourniquet Application — Skinny Medic", url: "https://www.youtube.com/watch?v=tLsaLBj-JR4", type: "video" },
      { title: "When Seconds Count — Dr. Kotwal", url: "https://www.youtube.com/watch?v=IQ7YfLKS-hA", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly — practice one-handed application",
    weight: 2,
    prerequisites: ["basic-first-aid"],
  },
  {
    id: "cpr-aed",
    name: "CPR & AED",
    description: "Perform CPR (chest compressions, rescue breathing) on adults, children, and infants. Use an AED (automated external defibrillator) and recognize cardiac arrest.",
    whyItMatters: "Cardiac arrest survival drops 10% every minute without CPR. You're the first responder for your family, always.",
    learningResources: [
      { title: "American Heart Association CPR Course", url: "https://cpr.heart.org/en/cpr-courses-and-kits", type: "course" },
      { title: "Hands-Only CPR Video", url: "https://www.youtube.com/watch?v=cosVBV96E2g", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Every 2 years — recertify",
    weight: 2,
    prerequisites: ["basic-first-aid"],
  },
  {
    id: "splinting",
    name: "Splinting & Immobilization",
    description: "Stabilize fractures and dislocations using SAM splints, improvised splints (sticks, trekking poles), and slings. Know how to check circulation after splinting.",
    whyItMatters: "A broken bone that's properly splinted becomes manageable. One that isn't can cut arteries, cause shock, or make evacuation impossible.",
    learningResources: [
      { title: "Wilderness First Aid Splinting", url: "https://www.youtube.com/watch?v=xHE4IxHFxfA", type: "video" },
      { title: "NOLS Wilderness Medicine", url: "https://www.nols.edu/en/coursefinder/courses/wilderness-first-aid-WFA/", type: "course" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Quarterly — practice on training partners",
    weight: 1,
  },
  {
    id: "medication-knowledge",
    name: "Medication Knowledge",
    description: "Understand OTC medications (dosage, interactions, expiration), fish antibiotics (amoxicillin, ciprofloxacin), herbal alternatives, and building a medical cache.",
    whyItMatters: "When pharmacies close, what you have on hand is what you have. Knowing what to stock and how to use it is pharmacy-level preparedness.",
    learningResources: [
      { title: "The Survival Medicine Handbook — Joe Alton MD", url: "https://www.amazon.com/Survival-Medicine-Handbook-Essential-Guide/dp/0988872536", type: "book" },
      { title: "OTC Medication Guide for Preppers", url: "https://www.youtube.com/watch?v=qNxSVn8WKnk", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Every 6 months — audit and rotate stock",
    weight: 1.5,
  },
  {
    id: "dental-emergency",
    name: "Dental Emergency Care",
    description: "Handle tooth fractures, lost fillings, abscesses, and extractions in austere conditions. Stock dental emergency kits (Dentemp, clove oil).",
    whyItMatters: "A dental abscess can become sepsis. A broken tooth becomes an infection vector. Basic dental emergency skills prevent a minor issue from becoming life-threatening.",
    learningResources: [
      { title: "Emergency Dental Kit Guide", url: "https://www.youtube.com/watch?v=c2IFsFJBqww", type: "video" },
      { title: "Where There Is No Dentist — Murray Dickson", url: "https://www.amazon.com/Where-There-No-Dentist-Dickson/dp/0942364058", type: "book" },
    ],
    difficulty: "advanced",
    practiceFrequency: "Once — build kit and study, refresh annually",
    weight: 0.75,
  },
  {
    id: "hypo-hyperthermia",
    name: "Hypothermia & Heat Stroke Treatment",
    description: "Recognize and treat hypothermia (stages, rewarming methods) and heat exhaustion/stroke (cooling techniques, electrolyte management). Know the danger signs.",
    whyItMatters: "Environmental exposure kills more people outdoors than almost anything else. Recognizing early signs and acting fast saves lives.",
    learningResources: [
      { title: "Hypothermia Recognition and Treatment", url: "https://www.youtube.com/watch?v=q-84M-2K-iU", type: "video" },
      { title: "Heat Stroke First Aid", url: "https://www.youtube.com/watch?v=VyDi_TNqHhQ", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Annually — review before extreme weather seasons",
    weight: 1.5,
  },
  {
    id: "natural-remedies",
    name: "Natural Remedies & Herbalism",
    description: "Use medicinal plants and natural remedies — yarrow (bleeding), plantain (stings), willow bark (pain), echinacea (immune), and elderberry (antiviral).",
    whyItMatters: "When the pharmacy is closed permanently, nature's medicine cabinet is still open. Herbal knowledge is a force multiplier for long-term scenarios.",
    learningResources: [
      { title: "Rosemary Gladstar's Medicinal Herbs — A Beginner's Guide", url: "https://www.amazon.com/Rosemary-Gladstars-Medicinal-Herbs-Beginners/dp/1612120059", type: "book" },
      { title: "Herbal Medicine for Preppers", url: "https://www.youtube.com/watch?v=E2lhIgjG_dQ", type: "video" },
    ],
    difficulty: "advanced",
    practiceFrequency: "Seasonal — grow and harvest medicinal herbs",
    weight: 0.75,
  },
];

// ─── DOMAIN 5: NAVIGATION & COMMUNICATION ──────────────────────────
const navCommSkills: Skill[] = [
  {
    id: "map-reading",
    name: "Map Reading",
    description: "Read topographic maps — understand contour lines, scale, grid coordinates, map symbols, and how to correlate terrain features with map markings.",
    whyItMatters: "When GPS dies (and it will), a paper map and the ability to read it is the difference between finding your way home and wandering in circles.",
    learningResources: [
      { title: "How to Read a Topo Map", url: "https://www.youtube.com/watch?v=CoVRrlRsnac", type: "video" },
      { title: "USGS Topo Map Symbols Guide", url: "https://pubs.usgs.gov/gip/TopographicMapSymbols/topomapsymbols.pdf", type: "article" },
      { title: "Land Navigation — Bob Burns", url: "https://www.amazon.com/Wilderness-Navigation-Finding-Your-Using/dp/1680210564", type: "book" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly — navigate a hike with map only",
    weight: 1.5,
  },
  {
    id: "compass-nav",
    name: "Compass Navigation",
    description: "Use a baseplate compass to take bearings, triangulate position, follow an azimuth, and account for declination. Navigate to a point without trails.",
    whyItMatters: "A compass never needs batteries, never loses signal, and works worldwide. Combined with a map, it's the most reliable navigation system that exists.",
    learningResources: [
      { title: "Compass Navigation Complete Guide", url: "https://www.youtube.com/watch?v=0cF0ovA3FtY", type: "video" },
      { title: "Suunto/Silva Compass Basics", url: "https://www.youtube.com/watch?v=8o3SJTm0Gj4", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — practice bearing and triangulation",
    weight: 1.5,
    prerequisites: ["map-reading"],
  },
  {
    id: "gps-nav",
    name: "GPS & Smartphone Navigation",
    description: "Use GPS units (Garmin inReach), onX Maps, Gaia GPS, AllTrails, and Google Maps for navigation. Download offline maps, set waypoints, and track routes.",
    whyItMatters: "GPS is incredibly powerful while it works. Knowing how to use it efficiently (offline maps, waypoints, breadcrumbs) maximizes its value before relying on analog.",
    learningResources: [
      { title: "Gaia GPS Tutorial", url: "https://www.youtube.com/watch?v=fJR3i0FNwt0", type: "video" },
      { title: "onX Offroad App Guide", url: "https://www.youtube.com/watch?v=C3D3k5l0GiQ", type: "video" },
    ],
    relatedTools: ["trail-intel"],
    difficulty: "beginner",
    practiceFrequency: "Every trip — download offline maps before going",
    weight: 1,
    prerequisites: ["map-reading", "compass-nav"],
  },
  {
    id: "ham-radio",
    name: "HAM Radio Operation",
    description: "Operate amateur radio — get your Technician license, program a handheld (Baofeng, Yaesu), find repeaters, and communicate on 2m/70cm. Understand simplex vs. repeater.",
    whyItMatters: "When cell towers go down, HAM radio is the most reliable long-range communication available to civilians. A $30 Baofeng reaches 5-30 miles with a license.",
    learningResources: [
      { title: "Ham Radio Crash Course", url: "https://www.youtube.com/@HamRadioCrashCourse", type: "video" },
      { title: "Technician License Study Guide — ARRL", url: "https://www.amazon.com/ARRL-Ham-Radio-License-Manual/dp/1625951590", type: "book" },
      { title: "HamStudy.org Free Practice", url: "https://hamstudy.org/", type: "course" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Weekly — get on the air and practice",
    weight: 1.5,
    prerequisites: ["gmrs-frs"],
  },
  {
    id: "gmrs-frs",
    name: "GMRS & FRS Radio Use",
    description: "Use GMRS and FRS radios for family and group communication. Understand channel selection, privacy codes, range limitations, and GMRS licensing requirements.",
    whyItMatters: "GMRS radios are the easiest way to keep your group connected. No exam needed, just a $35 FCC license for GMRS, and FRS is license-free.",
    learningResources: [
      { title: "GMRS vs FRS Explained", url: "https://www.youtube.com/watch?v=1dVB14jZlZw", type: "video" },
      { title: "Best GMRS Radios for Overlanding", url: "/articles/best-two-way-radios-for-overlanding", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Monthly — test radios and check batteries",
    weight: 1,
  },
  {
    id: "signal-comm",
    name: "Signal Communication",
    description: "Use visual and auditory signals — signal mirror, whistle (3 blasts = distress), smoke signals, ground-to-air markers, and flashlight signaling.",
    whyItMatters: "When you can't talk or transmit, visual and audio signals can still reach rescuers. A signal mirror can be seen 10+ miles away.",
    learningResources: [
      { title: "Signal Mirror Technique", url: "https://www.youtube.com/watch?v=YFZ4gTalxpM", type: "video" },
      { title: "Ground-to-Air Signal Codes", url: "https://www.youtube.com/watch?v=RnAMDg7IVWs", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Seasonal — practice signaling methods",
    weight: 0.75,
  },
  {
    id: "morse-code",
    name: "Morse Code Basics",
    description: "Send and receive basic Morse code — SOS, common abbreviations, and numbers. Use with flashlight, whistle, radio, or tapping.",
    whyItMatters: "Morse is universal and works across any medium — light, sound, radio. SOS alone could save your life.",
    learningResources: [
      { title: "Learn Morse Code in 10 Minutes", url: "https://www.youtube.com/watch?v=D8tPkb98Fkk", type: "video" },
      { title: "Morse Code Practice App — LCWO", url: "https://lcwo.net/", type: "course" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Weekly — 5 minutes of practice",
    weight: 0.5,
    prerequisites: ["ham-radio"],
  },
  {
    id: "pace-planning",
    name: "PACE Communication Planning",
    description: "Develop a Primary, Alternate, Contingency, Emergency communication plan for your family/group. Pre-assign rally points, frequencies, and check-in schedules.",
    whyItMatters: "If your family is separated during an emergency and cell phones are down, a PACE plan means everyone knows where to go and how to reach each other.",
    learningResources: [
      { title: "PACE Plan for Families", url: "https://www.youtube.com/watch?v=P1b-VPoQFm0", type: "video" },
      { title: "Emergency Communication Planning", url: "https://www.ready.gov/communication-plan", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Quarterly — review and practice with family",
    weight: 1.5,
  },
];

// ─── DOMAIN 6: SECURITY & DEFENSE ───────────────────────────────────
const securitySkills: Skill[] = [
  {
    id: "home-security-assessment",
    name: "Home Security Assessment",
    description: "Evaluate your home's vulnerabilities — entry points, sight lines, lighting, locks, and weak spots. Create a security plan with layers of defense.",
    whyItMatters: "You can't fix what you don't know is broken. Most homes have 3-5 critical vulnerabilities that can be fixed for under $200.",
    learningResources: [
      { title: "Home Security Assessment Checklist", url: "https://www.youtube.com/watch?v=7_UCULwBkjo", type: "video" },
      { title: "CPTED Design Principles", url: "https://www.youtube.com/watch?v=GDPl9i3WV80", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Annually — walk your property with fresh eyes",
    weight: 1.5,
  },
  {
    id: "perimeter-monitoring",
    name: "Perimeter Monitoring",
    description: "Set up motion-sensor lights, trail cameras, driveway alarms, dogs, and low-tech early warning systems (trip wires, gravel paths, thorny landscaping).",
    whyItMatters: "Early warning gives you time to respond. Even 30 seconds of advance notice changes every outcome in your favor.",
    learningResources: [
      { title: "Driveway Alarm Setup", url: "https://www.youtube.com/watch?v=YuQ4rnFaP4c", type: "video" },
      { title: "Trail Camera Security Setup", url: "https://www.youtube.com/watch?v=FrQr1bOKFVY", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — check battery and function",
    weight: 1,
    prerequisites: ["home-security-assessment"],
  },
  {
    id: "situational-awareness",
    name: "Situational Awareness",
    description: "Practice Cooper's Color Code (White, Yellow, Orange, Red). Develop baseline observation, threat recognition, and pre-incident indicator identification.",
    whyItMatters: "Most victims of crime or disaster were caught unaware. Trained awareness gives you the one thing that matters most in any emergency — time.",
    learningResources: [
      { title: "Left of Bang — Patrick Van Horne", url: "https://www.amazon.com/Left-Bang-Marine-Combat-Program/dp/1936891301", type: "book" },
      { title: "Cooper's Color Code Explained", url: "https://www.youtube.com/watch?v=eMVmvE18e1E", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Daily — make it a habit",
    weight: 2,
  },
  {
    id: "conflict-deescalation",
    name: "Conflict De-escalation",
    description: "Manage confrontations verbally — tone, body language, creating distance, giving exits, and recognizing when talking won't work anymore.",
    whyItMatters: "The best fight is the one that never happens. De-escalation keeps you out of jail and out of the hospital.",
    learningResources: [
      { title: "Verbal Judo — George Thompson", url: "https://www.amazon.com/Verbal-Judo-Gentle-Art-Persuasion/dp/0062107704", type: "book" },
      { title: "De-escalation Techniques", url: "https://www.youtube.com/watch?v=4Zz2b3RGFhk", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Ongoing — practice in daily interactions",
    weight: 1.5,
    prerequisites: ["situational-awareness"],
  },
  {
    id: "firearms-safety",
    name: "Firearms Safety & Proficiency",
    description: "Handle firearms safely (4 rules), maintain weapons (cleaning, storage), and shoot accurately under stress. Includes handgun, rifle, and shotgun fundamentals.",
    whyItMatters: "A firearm you can't shoot safely and accurately is more dangerous to your family than to any threat. Training and practice are non-negotiable.",
    learningResources: [
      { title: "NRA Basic Firearms Safety", url: "https://www.youtube.com/watch?v=GjL6gSME3lQ", type: "video" },
      { title: "Appleseed Rifle Marksmanship", url: "https://appleseedinfo.org/", type: "course" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — range time, quarterly — training class",
    weight: 1,
  },
  {
    id: "self-defense",
    name: "Self-Defense Basics",
    description: "Learn fundamental empty-hand defense — creating distance, striking, escaping grabs, and ground defense. Focus on practical techniques that work under stress.",
    whyItMatters: "You won't always have a weapon. Basic self-defense creates options and buys time to escape.",
    learningResources: [
      { title: "Krav Maga Basics", url: "https://www.youtube.com/watch?v=KVpxP3ZZtAc", type: "video" },
      { title: "Hard Target — TFT System", url: "https://www.youtube.com/watch?v=ZhGY7IDcG3g", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Weekly — consistency beats intensity",
    weight: 1,
    prerequisites: ["situational-awareness", "conflict-deescalation"],
  },
  {
    id: "opsec",
    name: "OPSEC (Operational Security)",
    description: "Control information about your preparations — what you share on social media, who knows your supplies, and how to maintain a low profile during emergencies.",
    whyItMatters: "The biggest threat to your prep is people knowing about it. Loose lips sink prepper ships. OPSEC protects everything you've built.",
    learningResources: [
      { title: "OPSEC for Preppers", url: "https://www.youtube.com/watch?v=kkElBzAUG_E", type: "video" },
      { title: "Gray Man Concept", url: "https://www.youtube.com/watch?v=GCWCXCPl0YI", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Constant — it's a mindset, not an activity",
    weight: 1.5,
  },
  {
    id: "neighborhood-watch",
    name: "Community Organization",
    description: "Organize neighborhood watch, mutual aid groups, and community emergency response teams (CERT). Build trust and communication networks before they're needed.",
    whyItMatters: "Nobody survives alone long-term. A connected neighborhood is exponentially more resilient than isolated individuals.",
    learningResources: [
      { title: "CERT Training Program", url: "https://www.ready.gov/cert", type: "course" },
      { title: "Building Community Resilience", url: "https://www.youtube.com/watch?v=iX3b9AqYkJg", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — neighborhood meetings, quarterly drills",
    weight: 1,
    prerequisites: ["home-security-assessment", "perimeter-monitoring"],
  },
  {
    id: "vehicle-security",
    name: "Vehicle Security & Anti-Theft",
    description: "Secure your vehicle — steering wheel locks, kill switches, GPS trackers, dash cams, and defensive parking techniques. Prevent carjacking and theft.",
    whyItMatters: "Your vehicle is your primary evacuation tool. Losing it in a crisis could be catastrophic. A $20 kill switch stops most thieves cold.",
    learningResources: [
      { title: "Vehicle Anti-Theft Measures", url: "https://www.youtube.com/watch?v=7Y_-H9BGK0w", type: "video" },
      { title: "Hidden Kill Switch Installation", url: "https://www.youtube.com/watch?v=XUhXLsrZiE0", type: "video" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Once installed, then as needed",
    weight: 0.75,
  },
];

// ─── DOMAIN 7: POWER & ELECTRICAL ───────────────────────────────────
const powerSkills: Skill[] = [
  {
    id: "solar-setup",
    name: "Solar Panel Setup & Sizing",
    description: "Size and install portable or permanent solar panel systems. Understand wattage, voltage, series vs. parallel wiring, charge controllers (PWM vs. MPPT), and sun-hours by location.",
    whyItMatters: "Solar is free power forever. A properly sized system keeps your batteries charged, phones running, and medical devices powered indefinitely.",
    learningResources: [
      { title: "PE Solar Power Calculator", url: "/tools/solar-power-calculator", type: "article" },
      { title: "Solar Panel Setup for Beginners", url: "https://www.youtube.com/watch?v=9m_K2Yg7wGQ", type: "video" },
      { title: "Will Prowse Solar Guide", url: "https://www.youtube.com/@WillProwse", type: "video" },
    ],
    relatedTools: ["solar-power-calculator", "power-system-builder"],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — clean panels, check connections",
    weight: 1.5,
  },
  {
    id: "battery-systems",
    name: "Battery Bank Systems",
    description: "Build and maintain battery banks — LiFePO4 (preferred), AGM, lithium-ion. Understand capacity (Ah), depth of discharge, BMS, and battery safety.",
    whyItMatters: "Solar without storage is useless at night. A good battery bank provides reliable power through darkness and cloudy days.",
    learningResources: [
      { title: "PE Power System Builder", url: "/tools/power-system-builder", type: "article" },
      { title: "LiFePO4 vs Lead Acid Comparison", url: "https://www.youtube.com/watch?v=LTGP6NnchHY", type: "video" },
      { title: "DIY LiFePO4 Battery Build", url: "https://www.youtube.com/watch?v=vBmMvzCAIjM", type: "video" },
    ],
    relatedTools: ["power-system-builder", "solar-power-calculator"],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — check voltage, connections, and balance",
    weight: 1,
    prerequisites: ["solar-setup"],
  },
  {
    id: "generator-ops",
    name: "Generator Operation & Maintenance",
    description: "Operate portable generators (Honda, Champion, Predator) safely — fuel management, load calculations, grounding, CO safety, and regular maintenance.",
    whyItMatters: "Generators bridge the gap between power outage and solar setup. But misuse causes CO poisoning and house fires. Safe operation is critical.",
    learningResources: [
      { title: "Generator Safety & Setup", url: "https://www.youtube.com/watch?v=w0HW8cABPKs", type: "video" },
      { title: "Generator Load Calculator", url: "/tools/power-station-runtime", type: "article" },
    ],
    relatedTools: ["power-station-runtime"],
    difficulty: "beginner",
    practiceFrequency: "Monthly — run for 15 minutes under load",
    weight: 1,
  },
  {
    id: "12v-wiring",
    name: "12V DC Wiring",
    description: "Wire 12V systems — fuse panels, wire gauge selection (AWG), crimping, busbars, circuit protection, and basic vehicle/RV/cabin electrical circuits.",
    whyItMatters: "12V DC is the backbone of off-grid and vehicle electrical systems. Bad wiring causes fires. Good wiring powers everything reliably.",
    learningResources: [
      { title: "PE Power System Builder", url: "/tools/power-system-builder", type: "article" },
      { title: "12V Wiring for Beginners", url: "https://www.youtube.com/watch?v=e-sM06Bf6FM", type: "video" },
      { title: "Wire Gauge Selection Chart", url: "https://www.youtube.com/watch?v=cBaeFKKvYVc", type: "video" },
    ],
    relatedTools: ["power-system-builder"],
    difficulty: "intermediate",
    practiceFrequency: "As needed — build and wire projects",
    weight: 1,
  },
  {
    id: "inverter-use",
    name: "Inverter Selection & Use",
    description: "Choose and operate inverters — pure sine wave vs. modified sine wave, sizing for loads, surge handling, and efficiency losses.",
    whyItMatters: "An inverter converts your DC battery power to AC so you can run household appliances. Wrong sizing means fried electronics or tripped breakers.",
    learningResources: [
      { title: "Inverter Sizing Guide", url: "https://www.youtube.com/watch?v=RFjGxXBzkHU", type: "video" },
      { title: "Pure Sine vs Modified Sine", url: "https://www.youtube.com/watch?v=3ynGJ-VFNWM", type: "video" },
    ],
    relatedTools: ["power-system-builder", "solar-power-calculator"],
    difficulty: "beginner",
    practiceFrequency: "Once setup — test under actual load",
    weight: 0.75,
    prerequisites: ["solar-setup", "battery-systems"],
  },
  {
    id: "emp-protection",
    name: "EMP Protection Basics",
    description: "Understand EMP threats (solar CME, nuclear EMP), Faraday cage construction (galvanized trash can, ammo can), and what electronics to protect.",
    whyItMatters: "A major EMP event could fry unprotected electronics. A simple Faraday cage protects backup radios, chargers, and critical electronics for pennies.",
    learningResources: [
      { title: "Faraday Cage DIY Build", url: "https://www.youtube.com/watch?v=e31GVhJumqk", type: "video" },
      { title: "EMP Commission Report Summary", url: "https://www.youtube.com/watch?v=nFaMRkFMaXc", type: "video" },
    ],
    difficulty: "intermediate",
    practiceFrequency: "Once built — test with AM radio annually",
    weight: 0.5,
  },
  {
    id: "electrical-safety",
    name: "Electrical Safety",
    description: "Practice safe electrical work — lockout/tagout, proper PPE (insulated gloves, safety glasses), testing for live circuits, and working with high-voltage systems.",
    whyItMatters: "Electricity kills fast and quietly. Knowing safety protocols prevents electrocution, fires, and destroyed equipment.",
    learningResources: [
      { title: "Electrical Safety Fundamentals", url: "https://www.youtube.com/watch?v=fkKBLPkKb3g", type: "video" },
      { title: "OSHA Electrical Safety Guide", url: "https://www.osha.gov/electrical", type: "article" },
    ],
    difficulty: "beginner",
    practiceFrequency: "Every time you work on electrical systems",
    weight: 1,
  },
  {
    id: "alt-energy",
    name: "Alternative Energy Sources",
    description: "Explore wind turbines (micro-wind), micro-hydro, thermoelectric generators (TEGs), and wood gasifiers for off-grid power generation.",
    whyItMatters: "Solar doesn't work in all conditions. Diversifying energy sources — especially hydro if you have flowing water — makes you truly energy independent.",
    learningResources: [
      { title: "Micro-Hydro Power for Off-Grid", url: "https://www.youtube.com/watch?v=O0MkIEkiyZ8", type: "video" },
      { title: "DIY Wind Turbine Build", url: "https://www.youtube.com/watch?v=p2yvSJYVJBc", type: "video" },
    ],
    difficulty: "expert",
    practiceFrequency: "Research and build as conditions allow",
    weight: 0.5,
  },
];

// ─── DOMAIN 8: VEHICLE & MOBILITY ───────────────────────────────────
const vehicleSkills: Skill[] = [
  {
    id: "basic-vehicle-maint",
    name: "Basic Vehicle Maintenance",
    description: "Change oil, replace filters (air, fuel, cabin), check and top fluids (coolant, brake, trans, power steering), replace wipers, and inspect belts/hoses.",
    whyItMatters: "A well-maintained vehicle starts when you need it. Deferred maintenance is the #1 reason vehicles fail during evacuations.",
    learningResources: [
      { title: "ChrisFix Basic Car Maintenance", url: "https://www.youtube.com/@ChrisFix", type: "video" },
      { title: "Vehicle Maintenance Checklist", url: "https://www.youtube.com/watch?v=O1hF25Cowv8", type: "video" },
    ],
    relatedTools: ["vehicle-profile"],
    difficulty: "beginner",
    practiceFrequency: "Per manufacturer schedule — oil every 5-7k miles",
    weight: 1.5,
  },
  {
    id: "tire-change-repair",
    name: "Tire Change & Repair",
    description: "Change a spare tire safely (jack placement, lug nut sequence), use plug kits for field repairs, air up with portable compressors, and read tire ratings.",
    whyItMatters: "A flat tire on a remote trail or evacuating during a storm is not the time to learn this. Practice at home in daylight.",
    learningResources: [
      { title: "How to Change a Tire Properly", url: "https://www.youtube.com/watch?v=joBmbh0AGSQ", type: "video" },
      { title: "Tire Plug Kit Field Repair", url: "https://www.youtube.com/watch?v=v-O0hmUBM70", type: "video" },
    ],
    relatedTools: ["vehicle-profile"],
    difficulty: "beginner",
    practiceFrequency: "Quarterly — practice changing your spare",
    weight: 1.5,
    prerequisites: ["basic-vehicle-maint"],
  },
  {
    id: "vehicle-recovery",
    name: "Vehicle Recovery",
    description: "Recover stuck vehicles using winches (electric and hand), traction boards (MAXTRAX), kinetic recovery ropes, snatch blocks, and proper rigging.",
    whyItMatters: "Getting stuck happens to everyone who goes off-road. Proper recovery technique prevents vehicle damage, injuries, and being stranded.",
    learningResources: [
      { title: "Winch Recovery for Beginners", url: "https://www.youtube.com/watch?v=Mhny1dC0eS0", type: "video" },
      { title: "Best Recovery Gear", url: "/articles/best-vehicle-recovery-gear", type: "article" },
      { title: "PE RigRated UTV Builder", url: "/tools/rigrated-configurator", type: "article" },
    ],
    relatedTools: ["vehicle-profile", "rigrated-configurator"],
    difficulty: "intermediate",
    practiceFrequency: "Seasonal — practice rigging and recovery",
    weight: 1,
    prerequisites: ["basic-vehicle-maint", "tire-change-repair"],
  },
  {
    id: "offroad-driving",
    name: "Off-Road Driving Techniques",
    description: "Drive off-road confidently — 4WD engagement (4H vs 4L), approach/departure/breakover angles, water crossings, rock crawling, sand driving, and hill climbs.",
    whyItMatters: "Your truck's capability means nothing if you don't know how to use it. Bad technique breaks expensive parts and gets you stuck or worse.",
    learningResources: [
      { title: "Off-Road Driving for Beginners", url: "https://www.youtube.com/watch?v=6vY-iVLkYVU", type: "video" },
      { title: "Water Crossing Techniques", url: "https://www.youtube.com/watch?v=38K8HLX8ANo", type: "video" },
      { title: "PE Vehicle Profile (Trail Score)", url: "/tools/vehicle-profile", type: "article" },
    ],
    relatedTools: ["vehicle-profile", "fuel-range-planner"],
    difficulty: "intermediate",
    practiceFrequency: "Monthly when possible — seat time builds skill",
    weight: 1,
  },
  {
    id: "fuel-management",
    name: "Fuel Management & Storage",
    description: "Store fuel safely — proper containers (gas cans, jerry cans), fuel stabilizer (Sta-Bil), rotation schedules, and understanding octane degradation over time.",
    whyItMatters: "Gas stations require electricity. During extended outages, your stored fuel is your mobility. Bad fuel storage means it won't work when you need it.",
    learningResources: [
      { title: "PE Fuel & Range Planner", url: "/tools/fuel-range-planner", type: "article" },
      { title: "Long-Term Fuel Storage Guide", url: "https://www.youtube.com/watch?v=AQBcRLYXdhA", type: "video" },
    ],
    relatedTools: ["fuel-range-planner"],
    difficulty: "beginner",
    practiceFrequency: "Every 6 months — rotate stored fuel",
    weight: 1,
  },
  {
    id: "route-planning",
    name: "Route Planning & Navigation",
    description: "Plan primary and alternate travel routes. Factor in fuel range, terrain, seasonal road closures, and potential hazards. Use multiple mapping sources.",
    whyItMatters: "The highway everyone else takes will be gridlocked. Pre-planned alternate routes using back roads and fire roads keep you moving.",
    learningResources: [
      { title: "PE Trail Intel", url: "/tools/trail-intel", type: "article" },
      { title: "Evacuation Route Planning", url: "https://www.youtube.com/watch?v=VZ2Wy-0SWSE", type: "video" },
      { title: "DeLorme Atlas & Gazetteer", url: "https://www.amazon.com/dp/0899334474", type: "book" },
    ],
    relatedTools: ["trail-intel", "fuel-range-planner"],
    difficulty: "beginner",
    practiceFrequency: "Quarterly — drive alternate routes to learn them",
    weight: 1.5,
  },
  {
    id: "vehicle-load-calc",
    name: "Vehicle Load & Weight Distribution",
    description: "Calculate payload capacity (GVWR - curb weight), tongue weight for trailers (10-15% of trailer weight), and load distribution for safe handling.",
    whyItMatters: "Overloading your vehicle causes brake failure, tire blowouts, and handling loss. Knowing your numbers keeps you safe and legal.",
    learningResources: [
      { title: "PE Vehicle Profile (Payload)", url: "/tools/vehicle-profile", type: "article" },
      { title: "Understanding GVWR and Payload", url: "https://www.youtube.com/watch?v=9CXKABwYMpA", type: "video" },
    ],
    relatedTools: ["vehicle-profile", "rigsafe-configurator"],
    difficulty: "beginner",
    practiceFrequency: "Before every load — check your numbers",
    weight: 1,
  },
  {
    id: "trailer-ops",
    name: "Trailer Operation & Backing",
    description: "Hook up, drive, and back trailers — weight distribution hitches, sway control, turning radius, blind spots, and backing techniques (hand on bottom of wheel).",
    whyItMatters: "Trailers expand your capability enormously but they also add risk. Proper hookup and backing skill prevents accidents and embarrassment.",
    learningResources: [
      { title: "Trailer Backing for Beginners", url: "https://www.youtube.com/watch?v=m2VBQLE4HRA", type: "video" },
      { title: "Weight Distribution Hitch Setup", url: "https://www.youtube.com/watch?v=Y9bXzXhyPbE", type: "video" },
    ],
    relatedTools: ["vehicle-profile"],
    difficulty: "intermediate",
    practiceFrequency: "Monthly — practice backing in an empty lot",
    weight: 0.75,
  },
];

// ─── ASSEMBLED DOMAINS ──────────────────────────────────────────────
export const SKILL_DOMAINS: SkillDomain[] = [
  {
    id: "water",
    name: "Water",
    icon: "Droplets",
    color: "#3B82F6",
    description: "Finding, filtering, purifying, and storing water to sustain life.",
    skills: waterSkills,
  },
  {
    id: "food",
    name: "Food",
    icon: "UtensilsCrossed",
    color: "#22C55E",
    description: "Growing, hunting, foraging, storing, and preparing food without modern infrastructure.",
    skills: foodSkills,
  },
  {
    id: "shelter",
    name: "Shelter & Warmth",
    icon: "Home",
    color: "#F59E0B",
    description: "Building, maintaining, and heating shelter in any condition.",
    skills: shelterSkills,
  },
  {
    id: "medical",
    name: "Medical & First Aid",
    icon: "Heart",
    color: "#EF4444",
    description: "Treating injuries, managing medications, and providing emergency medical care.",
    skills: medicalSkills,
  },
  {
    id: "nav-comm",
    name: "Navigation & Comms",
    icon: "Compass",
    color: "#8B5CF6",
    description: "Finding your way and communicating when modern systems fail.",
    skills: navCommSkills,
  },
  {
    id: "security",
    name: "Security & Defense",
    icon: "Shield",
    color: "#F97316",
    description: "Protecting yourself, your family, and your resources.",
    skills: securitySkills,
  },
  {
    id: "power",
    name: "Power & Electrical",
    icon: "Zap",
    color: "#EAB308",
    description: "Generating, storing, and distributing electrical power off-grid.",
    skills: powerSkills,
  },
  {
    id: "vehicle",
    name: "Vehicle & Mobility",
    icon: "Truck",
    color: "#10B981",
    description: "Maintaining, operating, and recovering vehicles in any terrain.",
    skills: vehicleSkills,
  },
];

// ─── SCORING HELPERS ─────────────────────────────────────────────────

/** Calculate the overall readiness score (0-100) from rated skills */
export function calculateReadinessScore(ratings: Record<string, SkillLevel>): number {
  let weightedSum = 0;
  let totalWeight = 0;

  for (const domain of SKILL_DOMAINS) {
    for (const skill of domain.skills) {
      const level = ratings[skill.id];
      if (level !== undefined) {
        weightedSum += (level / 5) * skill.weight;
        totalWeight += skill.weight;
      }
    }
  }

  if (totalWeight === 0) return 0;
  return Math.round((weightedSum / totalWeight) * 100);
}

/** Calculate per-domain average score (0-5) */
export function calculateDomainScores(ratings: Record<string, SkillLevel>): Record<string, number> {
  const scores: Record<string, number> = {};

  for (const domain of SKILL_DOMAINS) {
    let sum = 0;
    let count = 0;
    for (const skill of domain.skills) {
      const level = ratings[skill.id];
      if (level !== undefined) {
        sum += level;
        count++;
      }
    }
    scores[domain.id] = count > 0 ? sum / count : 0;
  }

  return scores;
}

/** Get critical gaps — beginner or intermediate skills rated 0-1 */
export function getCriticalGaps(ratings: Record<string, SkillLevel>): { skill: Skill; domain: SkillDomain; level: SkillLevel }[] {
  const gaps: { skill: Skill; domain: SkillDomain; level: SkillLevel }[] = [];

  for (const domain of SKILL_DOMAINS) {
    for (const skill of domain.skills) {
      const level = ratings[skill.id];
      if (
        level !== undefined &&
        level <= 1 &&
        (skill.difficulty === "beginner" || skill.difficulty === "intermediate") &&
        skill.weight >= 1
      ) {
        gaps.push({ skill, domain, level });
      }
    }
  }

  // Sort by weight descending (most critical first)
  return gaps.sort((a, b) => b.skill.weight - a.skill.weight);
}

/** Get top-rated skills */
export function getStrongestSkills(ratings: Record<string, SkillLevel>): { skill: Skill; domain: SkillDomain; level: SkillLevel }[] {
  const results: { skill: Skill; domain: SkillDomain; level: SkillLevel }[] = [];

  for (const domain of SKILL_DOMAINS) {
    for (const skill of domain.skills) {
      const level = ratings[skill.id];
      if (level !== undefined && level >= 3) {
        results.push({ skill, domain, level });
      }
    }
  }

  return results.sort((a, b) => b.level - a.level || b.skill.weight - a.skill.weight).slice(0, 5);
}

/** Build a priority training roadmap */
export function getTrainingRoadmap(ratings: Record<string, SkillLevel>): { skill: Skill; domain: SkillDomain; level: SkillLevel; reason: string }[] {
  const roadmap: { skill: Skill; domain: SkillDomain; level: SkillLevel; reason: string; priority: number }[] = [];

  const domainScores = calculateDomainScores(ratings);

  for (const domain of SKILL_DOMAINS) {
    const domainAvg = domainScores[domain.id] || 0;

    for (const skill of domain.skills) {
      const level = ratings[skill.id];
      if (level === undefined) continue;
      if (level >= 4) continue; // Already proficient or expert

      let priority = 0;
      let reason = "";

      // Highest priority: beginner skills you haven't learned
      if (skill.difficulty === "beginner" && level <= 1) {
        priority = 100 + skill.weight * 10;
        reason = "Foundation skill — learn this first";
      }
      // High priority: critical weight skills rated low
      else if (skill.weight >= 1.5 && level <= 2) {
        priority = 80 + skill.weight * 10;
        reason = "High-impact skill worth investing in";
      }
      // Medium: skills one level below next threshold in strong domains
      else if (domainAvg >= 3 && level <= 2) {
        priority = 60 + skill.weight * 5;
        reason = `Weak spot in your strong ${domain.name} domain`;
      }
      // Lower: general improvement opportunities
      else if (level <= 2) {
        priority = 40 + skill.weight * 5;
        reason = "Room for growth";
      }
      // Advanced skills worth leveling up
      else if (level === 3 && skill.weight >= 1) {
        priority = 20 + skill.weight * 5;
        reason = "Take this from good to great";
      }

      if (priority > 0) {
        roadmap.push({ skill, domain, level, reason, priority });
      }
    }
  }

  return roadmap
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 15)
    .map(({ skill, domain, level, reason }) => ({ skill, domain, level, reason }));
}

/** Count total rated skills */
export function countRatedSkills(ratings: Record<string, SkillLevel>): number {
  return Object.keys(ratings).length;
}

/** Get total skill count */
export function getTotalSkillCount(): number {
  return SKILL_DOMAINS.reduce((sum, d) => sum + d.skills.length, 0);
}

/** Find a skill by its ID across all domains */
export function findSkillById(id: string): { skill: Skill; domain: SkillDomain } | null {
  for (const domain of SKILL_DOMAINS) {
    for (const skill of domain.skills) {
      if (skill.id === id) return { skill, domain };
    }
  }
  return null;
}

/** Get unmet prerequisites for a skill */
export function getUnmetPrerequisites(skillId: string, ratings: Record<string, SkillLevel>): { skill: Skill; domain: SkillDomain; currentLevel: SkillLevel | undefined }[] {
  const found = findSkillById(skillId);
  if (!found || !found.skill.prerequisites) return [];

  const unmet: { skill: Skill; domain: SkillDomain; currentLevel: SkillLevel | undefined }[] = [];
  for (const prereqId of found.skill.prerequisites) {
    const prereq = findSkillById(prereqId);
    if (!prereq) continue;
    const level = ratings[prereqId];
    if (level === undefined || level < 2) {
      unmet.push({ skill: prereq.skill, domain: prereq.domain, currentLevel: level });
    }
  }
  return unmet;
}

/** Get prerequisite suggestions — skills where prereqs are met but skill is low */
export function getPrerequisiteSuggestions(ratings: Record<string, SkillLevel>): { skill: Skill; domain: SkillDomain; prereqName: string }[] {
  const suggestions: { skill: Skill; domain: SkillDomain; prereqName: string }[] = [];

  for (const domain of SKILL_DOMAINS) {
    for (const skill of domain.skills) {
      if (!skill.prerequisites || skill.prerequisites.length === 0) continue;
      const level = ratings[skill.id];
      // Only suggest if this skill is rated low or unrated
      if (level !== undefined && level >= 2) continue;

      // Check if any prerequisite is well-rated (3+) but this skill is 0
      for (const prereqId of skill.prerequisites) {
        const prereqLevel = ratings[prereqId];
        if (prereqLevel !== undefined && prereqLevel >= 3 && (level === undefined || level <= 0)) {
          const prereq = findSkillById(prereqId);
          if (prereq) {
            suggestions.push({ skill, domain, prereqName: prereq.skill.name });
          }
        }
      }
    }
  }

  return suggestions.slice(0, 5);
}

/** Get weakest scenarios based on domain scores */
export function getWeakestScenarios(ratings: Record<string, SkillLevel>): ScenarioMatch[] {
  const domainScores = calculateDomainScores(ratings);

  // Get domains with scores below 2.5 (below "Basic" average)
  const weakDomains = SCENARIO_DOMAIN_MAP
    .filter(s => {
      const score = domainScores[s.domainId] || 0;
      return score < 2.5;
    })
    .sort((a, b) => (domainScores[a.domainId] || 0) - (domainScores[b.domainId] || 0));

  return weakDomains.slice(0, 3);
}

/** Generate a 3-month seasonal training plan based on gaps */
export function generateTrainingPlan(ratings: Record<string, SkillLevel>): {
  month: number;
  monthLabel: string;
  skills: {
    skill: Skill;
    domain: SkillDomain;
    currentLevel: SkillLevel;
    targetLevel: SkillLevel;
    actionItems: string[];
    estimatedTime: string;
    seasonalNote?: string;
  }[];
}[] {
  const now = new Date();
  const currentMonth = now.getMonth(); // 0-11
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Get the roadmap items and expand to 9 items
  const roadmap = getTrainingRoadmap(ratings);

  const plan: ReturnType<typeof generateTrainingPlan> = [];

  for (let m = 0; m < 3; m++) {
    const monthIndex = (currentMonth + m) % 12;
    const monthLabel = monthNames[monthIndex];
    const monthSkills = roadmap.slice(m * 3, m * 3 + 3);

    const isColdMonth = monthIndex >= 10 || monthIndex <= 2; // Nov-Feb
    const isWarmMonth = monthIndex >= 4 && monthIndex <= 8; // May-Sep

    const skills = monthSkills.map(({ skill, domain, level }) => {
      const targetLevel = Math.min(5, level + 2) as SkillLevel;
      const actionItems: string[] = [];
      let estimatedTime = "2-3 hours";
      let seasonalNote: string | undefined;

      // Generate action items based on skill difficulty and level
      if (level <= 1) {
        actionItems.push(`Research ${skill.name.toLowerCase()} fundamentals online or through the resources below`);
        if (skill.learningResources.find(r => r.type === "course")) {
          actionItems.push("Enroll in a structured course for hands-on training");
        } else if (skill.learningResources.find(r => r.type === "video")) {
          actionItems.push("Watch instructional videos and take notes on key techniques");
        }
        actionItems.push(`Practice ${skill.name.toLowerCase()} in a safe, controlled environment`);
        estimatedTime = skill.difficulty === "beginner" ? "2-3 hours" : "4-6 hours";
      } else if (level === 2) {
        actionItems.push(`Advance your ${skill.name.toLowerCase()} skills with more challenging scenarios`);
        actionItems.push("Practice with a partner or group for accountability and feedback");
        if (skill.learningResources.find(r => r.type === "book")) {
          actionItems.push("Read a deep-dive book to fill knowledge gaps");
        }
        estimatedTime = "3-5 hours";
      } else {
        actionItems.push(`Teach ${skill.name.toLowerCase()} to a family member or friend — teaching locks in mastery`);
        actionItems.push("Practice under realistic stress conditions (time pressure, weather, fatigue)");
        actionItems.push("Develop a checklist or SOP others can follow");
        estimatedTime = "2-4 hours";
      }

      // Seasonal notes
      if (skill.id.includes("fire") && isColdMonth) {
        seasonalNote = "Great time to practice — cold weather fire starting builds real confidence";
      } else if (skill.id.includes("fire") && isWarmMonth) {
        seasonalNote = "Check local fire restrictions before outdoor practice";
      } else if (skill.id.includes("garden") && isWarmMonth) {
        seasonalNote = "Peak growing season — hands-on practice is most effective now";
      } else if (skill.id.includes("garden") && isColdMonth) {
        seasonalNote = "Plan your spring garden now — seed catalogs and indoor starts";
      } else if (skill.id.includes("water") && isWarmMonth) {
        seasonalNote = "Practice water sourcing and filtration on summer hikes and camping trips";
      } else if ((skill.id.includes("shelter") || skill.id.includes("insulation") || skill.id.includes("heating") || skill.id.includes("weatherproofing")) && isColdMonth) {
        seasonalNote = "Perfect timing — test your shelter and heating skills when it matters most";
      } else if (skill.id.includes("solar") && isWarmMonth) {
        seasonalNote = "Maximum sun hours — ideal for testing and optimizing solar setups";
      }

      return { skill, domain, currentLevel: level, targetLevel, actionItems, estimatedTime, seasonalNote };
    });

    plan.push({ month: m + 1, monthLabel, skills });
  }

  return plan;
}
