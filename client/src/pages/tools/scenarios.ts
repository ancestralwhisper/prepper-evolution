// ─── SHTF Scenario Simulator — Scenario Data ───
// Branching choose-your-own-adventure scenarios with educational outcomes

export interface GearRecommendation {
  name: string;
  reason: string;
  url: string;
}

export interface Choice {
  text: string;
  consequence: string;
  scoreImpact: number;
  nextNodeId: string | "end";
}

export interface ScenarioNode {
  id: string;
  situation: string;
  emoji: string;
  choices: Choice[];
}

export interface EndResult {
  id: string;
  finalScore: number;
  rating: "Thrived" | "Survived" | "Barely Made It" | "Didn't Make It";
  summary: string;
  didRight: string[];
  couldImprove: string[];
  gearRecommendations: GearRecommendation[];
}

export interface Scenario {
  id: string;
  name: string;
  icon: string;
  difficulty: "Moderate" | "Hard" | "Extreme";
  description: string;
  startingNodeId: string;
  nodes: ScenarioNode[];
  endResults: EndResult[];
  totalNodes: number;
}

// ─── Affiliate Gear URLs ───
const GEAR = {
  sawyerSqueeze: {
    name: "Sawyer Squeeze Water Filter",
    url: "https://www.amazon.com/dp/B00B1OSU4W?tag=prepperevo-20",
  },
  rush72: {
    name: "5.11 RUSH72 Backpack",
    url: "https://www.amazon.com/dp/B0D9R239MT?tag=prepperevo-20",
  },
  garminInreach: {
    name: "Garmin inReach Mini 3 Plus",
    url: "https://www.amazon.com/dp/B0G4RST8LV?tag=prepperevo-20",
  },
  goalZeroYeti: {
    name: "Goal Zero Yeti 1000 Core",
    url: "https://www.amazon.com/dp/B096ST3VMS?tag=prepperevo-20",
  },
  esee4: {
    name: "ESEE 4 Fixed Blade Knife",
    url: "https://www.amazon.com/dp/B0848RXQ1W?tag=prepperevo-20",
  },
  jackery1000: {
    name: "Jackery Explorer 1000 Plus",
    url: "https://www.amazon.com/dp/B0CFVBGWBT?tag=prepperevo-20",
  },
  ecoflowDelta3: {
    name: "EcoFlow DELTA 3 Plus",
    url: "https://www.amazon.com/dp/B0GQBJ2SCT?tag=prepperevo-20",
  },
  ecoflowDelta2: {
    name: "EcoFlow DELTA 2",
    url: "https://www.amazon.com/dp/B0B9XB57XM?tag=prepperevo-20",
  },
  renogy200w: {
    name: "Renogy 200W Solar Panel",
    url: "https://www.amazon.com/dp/B0CNPHD4VY?tag=prepperevo-20",
  },
  mountainHouse: {
    name: "Mountain House Meals (14-Day Supply)",
    url: "https://www.amazon.com/dp/B00955DUHQ?tag=prepperevo-20",
  },
  midlandGXT1000: {
    name: "Midland GXT1000VP4 Walkie Talkies",
    url: "https://www.amazon.com/dp/B001WMFYH4?tag=prepperevo-20",
  },
  solBivvy: {
    name: "SOL Escape Bivvy",
    url: "https://www.amazon.com/dp/B0CYJX3QCL?tag=prepperevo-20",
  },
  ankerSolix: {
    name: "Anker SOLIX C1000 Power Station",
    url: "https://www.amazon.com/dp/B0C5C89QKZ?tag=prepperevo-20",
  },
  katadynBeFree: {
    name: "Katadyn BeFree 1L Water Filter",
    url: "https://www.amazon.com/dp/B0BFQMMJVS?tag=prepperevo-20",
  },
  bioliteHeadlamp: {
    name: "BioLite HeadLamp 200",
    url: "https://www.amazon.com/dp/B07T25LMYB?tag=prepperevo-20",
  },
  gerberStrongarm: {
    name: "Gerber Strongarm Fixed Blade",
    url: "https://www.amazon.com/dp/B00U0ILXGC?tag=prepperevo-20",
  },
  midlandT77: {
    name: "Midland T77VP5 GMRS Radio",
    url: "https://www.amazon.com/dp/B01LVUBPPA?tag=prepperevo-20",
  },
  readyWise: {
    name: "ReadyWise Emergency Food Supply",
    url: "https://www.amazon.com/dp/B0CR5DCFTJ?tag=prepperevo-20",
  },
  survivalTabs: {
    name: "Survival Tabs 15-Day Supply",
    url: "https://www.amazon.com/dp/B008DEYAZ6?tag=prepperevo-20",
  },
  aquamiraDrops: {
    name: "Aquamira Water Treatment Drops",
    url: "https://www.amazon.com/dp/B0078SA5SE?tag=prepperevo-20",
  },
  baofengUV5R: {
    name: "Baofeng UV-5R Ham Radio",
    url: "https://www.amazon.com/dp/B074XPB313?tag=prepperevo-20",
  },
  dakotaAlert: {
    name: "Dakota Alert MURS Wireless Motion Sensor",
    url: "https://www.amazon.com/dp/B003CLKIV4?tag=prepperevo-20",
  },
  reliance5gal: {
    name: "Reliance Aqua-Tainer 7-Gallon Water Container",
    url: "https://www.amazon.com/dp/B001QC31G6?tag=prepperevo-20",
  },
  luciLight: {
    name: "Luci Solar Inflatable Lantern",
    url: "https://www.amazon.com/dp/B00BXUKM4W?tag=prepperevo-20",
  },
  faradayBag: {
    name: "Mission Darkness Faraday Bag",
    url: "https://www.amazon.com/dp/B07F9RL3NB?tag=prepperevo-20",
  },
  kellyKettle: {
    name: "Kelly Kettle Base Camp Stainless Steel",
    url: "https://www.amazon.com/dp/B001QDIPY6?tag=prepperevo-20",
  },
  augason30day: {
    name: "Augason Farms 30-Day Food Supply",
    url: "https://www.amazon.com/dp/B00B194TKU?tag=prepperevo-20",
  },
};

// ═══════════════════════════════════════════════════════
// SCENARIO 1: POWER GRID FAILURE
// ═══════════════════════════════════════════════════════
const powerGridFailure: Scenario = {
  id: "power-grid-failure",
  name: "Power Grid Failure",
  icon: "zap-off",
  difficulty: "Moderate",
  description:
    "A massive cyberattack takes down the power grid across three states. No electricity, no cell towers, no internet. Your neighborhood goes dark at 9 PM on a Tuesday in January. What do you do?",
  startingNodeId: "pg-1",
  totalNodes: 5,
  nodes: [
    {
      id: "pg-1",
      emoji: "🔌",
      situation:
        "The lights cut out mid-evening. Your phone still has 68% battery but there is no cell signal. Through the window, the entire neighborhood is dark. The temperature outside is 28 degrees F and dropping. Your furnace runs on natural gas but needs electricity for the blower. You have about 4 hours before the house starts getting seriously cold.",
      choices: [
        {
          text: "Fire up the portable power station you keep charged in the garage",
          consequence:
            "Smart move. A charged power station means you can run the furnace blower, keep phones charged, and power a radio for news. You buy yourself 12-18 hours of critical heat and information. Preparation pays off immediately.",
          scoreImpact: 25,
          nextNodeId: "pg-2a",
        },
        {
          text: "Grab flashlights and blankets, hunker down, and wait for power to come back",
          consequence:
            "Not a bad instinct — conserve energy, stay warm. But without information, you are flying blind. You do not know if this is a 2-hour outage or a 2-week event. By morning, the house is 45 degrees F and your phone is dead.",
          scoreImpact: 5,
          nextNodeId: "pg-2b",
        },
        {
          text: "Drive to a friend's house across town that might still have power",
          consequence:
            "You head out into the dark. Traffic lights are out, intersections are chaos. Without cell service, you cannot confirm your friend even has power. You burn a quarter tank of gas and find their neighborhood is dark too. Now you have wasted fuel and time you could have spent preparing your own home.",
          scoreImpact: -10,
          nextNodeId: "pg-2b",
        },
      ],
    },
    {
      id: "pg-2a",
      emoji: "📻",
      situation:
        "Your power station is running the furnace blower and you have tuned into an AM radio station. The news is grim: coordinated cyberattack, power could be out for 5-10 days. Stores will not be open. The water utility says pressure will drop within 24 hours as pump stations lose backup power. Your neighbors are knocking on doors, confused and cold.",
      choices: [
        {
          text: "Fill every container in the house with water NOW, then check on the neighbors",
          consequence:
            "Filling bathtubs, pots, bottles, and coolers while pressure still exists is critical thinking. You net about 80 gallons before pressure drops the next morning. Checking on neighbors builds community and you learn one has a wood stove — potential warming station for the block. Information and water are your two most valuable assets right now.",
          scoreImpact: 25,
          nextNodeId: "pg-3a",
        },
        {
          text: "Focus on conserving your power station battery — it needs to last 10 days",
          consequence:
            "Conservation is wise, but you are prioritizing the wrong resource. Electricity matters less than water when the taps go dry. By the time you think about water, pressure has already dropped. You manage to fill a few pots but miss the window for bulk storage. You have power but limited water — a rough trade.",
          scoreImpact: 10,
          nextNodeId: "pg-3b",
        },
      ],
    },
    {
      id: "pg-2b",
      emoji: "❄️",
      situation:
        "Morning comes and the power is still out. The house is cold — you can see your breath. A neighbor with a battery radio shares the news: this could last a week or more. Water pressure is already dropping. You realize this is not a normal outage.",
      choices: [
        {
          text: "Immediately fill every container with water and start rationing food",
          consequence:
            "Good recovery. You managed to get about 30 gallons before pressure died completely. You are behind the curve but acting decisively. Rationing food early is smart — most people do not think about calories until day 3.",
          scoreImpact: 15,
          nextNodeId: "pg-3b",
        },
        {
          text: "Head to the store to buy supplies before everyone else does",
          consequence:
            "You are not the only one with this idea. The parking lot is packed, people are tense, and the store is already running low on water and batteries. You manage to grab a few cans and a case of water, but the drive cost you more gas and the scene was uncomfortable. Shopping during a crisis is a last resort, not a first move.",
          scoreImpact: 0,
          nextNodeId: "pg-3b",
        },
      ],
    },
    {
      id: "pg-3a",
      emoji: "🤝",
      situation:
        "Day 3. You have water, some heat via the neighbor's wood stove, and radio updates. But your food situation is getting thin — you did not have much beyond a week of normal groceries. The radio mentions National Guard distribution points, but they are 15 miles away and gas stations are not pumping. Your vehicle has half a tank.",
      choices: [
        {
          text: "Ration what you have and stay put — drive only if you reach day 5 with no improvement",
          consequence:
            "Discipline wins here. Burning gas to chase a rumored distribution point is risky. You stretch your food with careful rationing, eating calorie-dense items first (peanut butter, rice, canned goods). By day 6, a partial grid restoration begins in your area. Your half tank of gas becomes invaluable for resupply runs when stores reopen. Patience saved you.",
          scoreImpact: 20,
          nextNodeId: "pg-4a",
        },
        {
          text: "Drive to the distribution point — you need food and your car can make it",
          consequence:
            "The 15-mile drive takes over an hour because every other route is clogged. The distribution point has a 4-hour line. You get MREs and water but burn most of your remaining gas. If this lasts another week, you are now stranded without transportation. Sometimes the smart move is staying put.",
          scoreImpact: 5,
          nextNodeId: "pg-4b",
        },
        {
          text: "Organize a neighborhood resource-sharing system",
          consequence:
            "This is leadership. You coordinate with 8 nearby households: one has a generator, one has a deep freezer full of meat (that needs to be eaten before it spoils anyway), one is a nurse, one has camping gear. By pooling resources, everyone eats better and stays warmer than they would alone. Community is the ultimate survival tool.",
          scoreImpact: 25,
          nextNodeId: "pg-4a",
        },
      ],
    },
    {
      id: "pg-3b",
      emoji: "🥫",
      situation:
        "Day 3. Your water supply is limited — maybe 2-3 days' worth with strict rationing. The house is cold and morale is low. You have some canned food but no way to cook without electricity. A neighbor mentions they are driving to a relative's place 100 miles away. Another says the National Guard is setting up nearby.",
      choices: [
        {
          text: "Stay home, melt snow for water if needed, and eat cold canned food",
          consequence:
            "Not glamorous, but functional. Cold canned food is still calories. Melting snow works but it is slow and you need a lot of it (roughly 10 gallons of snow for 1 gallon of water). You tough it out. By day 5, partial power returns and you have survived the worst of it. Could have been easier with more prep, but you made it.",
          scoreImpact: 10,
          nextNodeId: "pg-4b",
        },
        {
          text: "Bug out to the relative's place with the neighbor — 100 miles is better than here",
          consequence:
            "Evacuating into the unknown with limited gas is a gamble. The roads are bad, gas stations are down, and 100 miles might as well be 500 in these conditions. You make it, barely, running on fumes. But you left behind everything you had prepared. Bugging out should be a last resort, not a knee-jerk reaction.",
          scoreImpact: -5,
          nextNodeId: "pg-4b",
        },
      ],
    },
    {
      id: "pg-4a",
      emoji: "⚡",
      situation:
        "Day 7. Partial power is being restored sector by sector. Your neighborhood is still dark but the radio says your grid section is next. You have managed your resources well — still have water, some food, and gas in the tank. The question now is: what do you do differently next time?",
      choices: [
        {
          text: "Invest in a proper solar and battery setup so you never depend on the grid again",
          consequence:
            "The number one lesson from any extended blackout: energy independence is not paranoia, it is insurance. A solar panel and battery system pays for itself the first time the grid goes down for more than 24 hours. Paired with your existing preps, you would have sailed through this with minimal stress.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Stock 30 days of freeze-dried food and double your water storage",
          consequence:
            "Food and water are always the bottleneck. Freeze-dried meals last 25 years, weigh almost nothing, and just need hot water. With a proper supply, the psychological pressure of an extended outage drops to nearly zero. You eat well while everyone else is fighting over grocery store scraps.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "pg-4b",
      emoji: "💡",
      situation:
        "Day 7. Power is slowly coming back in some areas. You made it through, but it was rough. Cold nights, limited food, stress about water. Looking back, you can see exactly where better preparation would have made the difference.",
      choices: [
        {
          text: "Time to get a power station, solar panels, and emergency food supply",
          consequence:
            "The best time to prepare was before the crisis. The second best time is right after one. A portable power station with solar panels would have kept your furnace running and phones charged. A 14-day emergency food supply would have eliminated the biggest stressor. These are not luxury purchases — they are insurance policies.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Focus on water storage and filtration first — that was the biggest gap",
          consequence:
            "You identified the right priority. A gravity water filter and 15 gallons of stored water per person would have removed your single biggest vulnerability. Combine that with water purification tablets as a backup, and water stress disappears even in a multi-week event. Start with what almost killed you.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "pg-thrived",
      finalScore: 80,
      rating: "Thrived",
      summary:
        "You handled a week-long grid failure like someone who has thought about this before. You had power, water, community, and discipline. Most people were panicking by day 3 — you were organizing the neighborhood. This is what real preparedness looks like.",
      didRight: [
        "Had a charged power station ready to deploy immediately",
        "Filled water containers before pressure dropped — critical window",
        "Built community connections for resource sharing",
        "Rationed fuel and food instead of making panic decisions",
      ],
      couldImprove: [
        "A solar panel would have extended your power station indefinitely",
        "30 days of freeze-dried food removes the biggest psychological stressor",
        "A hand-crank or solar radio eliminates battery dependency for information",
      ],
      gearRecommendations: [
        {
          name: GEAR.renogy200w.name,
          reason:
            "Pairs with any power station to create indefinite energy. In a 5-10 day blackout, solar is the difference between rationing and comfort.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "14-day supply for one person. Just add hot water. 25-year shelf life means you buy it once and forget it until you need it.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "When cell towers are down, satellite communication is the only game in town. Send and receive texts via Iridium satellites from anywhere.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.midlandGXT1000.name,
          reason:
            "Walkie talkies for coordinating with neighbors during extended blackouts. No cell towers or internet required — just press and talk.",
          url: GEAR.midlandGXT1000.url,
        },
        {
          name: GEAR.ankerSolix.name,
          reason:
            "1,056Wh portable power station that handles serious loads. Run your furnace blower, fridge, and charge devices simultaneously.",
          url: GEAR.ankerSolix.url,
        },
      ],
    },
    {
      id: "pg-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You made it through, but it was harder than it needed to be. Some good decisions mixed with some reactive ones. The biggest takeaway: the things that would have made this easy are not expensive or complicated — they just need to be in place before the crisis hits.",
      didRight: [
        "Stayed calm and made decisions instead of freezing",
        "Managed to secure some water and food",
        "Recognized the severity of the situation (eventually)",
      ],
      couldImprove: [
        "A power station would have given you heat, light, and information from hour one",
        "Pre-staged water storage eliminates the scramble when pressure drops",
        "Having 2 weeks of food on hand means you never need to leave the house during a crisis",
        "Community relationships should be built before the emergency, not during it",
      ],
      gearRecommendations: [
        {
          name: GEAR.ecoflowDelta3.name,
          reason:
            "1,024Wh of power in a portable package. Run a furnace blower, charge phones, and power a radio for days. This is your first buy.",
          url: GEAR.ecoflowDelta3.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Filters 100,000 gallons. If the taps go dry, this turns any freshwater source into drinking water. Weighs 3 oz. No excuse not to have one.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "14-day food supply that takes zero thought. When the grocery stores are empty, this is the difference between eating and not eating.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.katadynBeFree.name,
          reason:
            "Fast-flow water filter in a collapsible flask. Fill it from any freshwater source and drink immediately — no squeezing required.",
          url: GEAR.katadynBeFree.url,
        },
        {
          name: GEAR.bioliteHeadlamp.name,
          reason:
            "Rechargeable headlamp for hands-free lighting during extended outages. Lightweight and moisture-wicking for comfort.",
          url: GEAR.bioliteHeadlamp.url,
        },
      ],
    },
    {
      id: "pg-barely",
      finalScore: 25,
      rating: "Barely Made It",
      summary:
        "You survived, but just barely. Cold house, limited food, no information, and a lot of stress. The good news: you lived and you learned. Everything that went wrong is fixable with some basic preparation that does not cost much or take much space.",
      didRight: [
        "You did not give up — mental toughness counts",
        "You eventually took action instead of waiting for rescue",
      ],
      couldImprove: [
        "A portable power station is the single biggest upgrade for grid-down scenarios",
        "Water storage should be your first prep — fill containers before every storm season",
        "Food beyond normal groceries: even a case of MREs changes the calculus",
        "An AM/FM radio with batteries gives you information when everything else is dead",
        "Gas tank should never drop below half — treat the half mark as empty",
      ],
      gearRecommendations: [
        {
          name: GEAR.jackery1000.name,
          reason:
            "1,264Wh of clean, quiet power. Enough to run your furnace blower, charge devices, and power a radio for 2-3 days. Recharge with solar.",
          url: GEAR.jackery1000.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Pair this with the Jackery and you have indefinite power as long as the sun comes up. 200W in a foldable, portable package.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Your biggest vulnerability was water. This filter weighs almost nothing and turns any freshwater source into safe drinking water.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Freeze-dried meals that last 25 years. Just add hot water. When the stores are empty, this keeps you fed without thinking about it.",
          url: GEAR.mountainHouse.url,
        },
      ],
    },
    {
      id: "pg-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "This one got away from you. Reactive decisions, wasted resources, and a rough week that could have been much easier. But here is the thing — now you know. Every mistake in this simulation is one you do not have to make in real life. That is the whole point.",
      didRight: [
        "You ran the simulation — most people do not even think about this stuff",
      ],
      couldImprove: [
        "Start with the basics: power station, water filter, 2 weeks of food",
        "Never bug out unless staying is more dangerous than moving",
        "Gas tank stays above half — always",
        "Build community before you need it, not during a crisis",
        "Information is survival — have a battery-powered radio at minimum",
      ],
      gearRecommendations: [
        {
          name: GEAR.goalZeroYeti.name,
          reason:
            "1,516Wh power station. Run your furnace, charge everything, power a radio. This single item would have changed your entire experience.",
          url: GEAR.goalZeroYeti.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Solar panel to recharge the power station. Together, these two items give you indefinite energy independence from the grid.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Filters 100,000 gallons. Weighs 3 ounces. Costs less than a dinner out. There is zero reason not to own one.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "14 days of food in a bucket. 25-year shelf life. This alone eliminates the number one stressor in any extended emergency.",
          url: GEAR.mountainHouse.url,
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 2: HURRICANE EVACUATION
// ═══════════════════════════════════════════════════════
const hurricaneEvacuation: Scenario = {
  id: "hurricane-evacuation",
  name: "Hurricane Evacuation",
  icon: "cloud-lightning",
  difficulty: "Hard",
  description:
    "A Category 4 hurricane is bearing down on your coastal city. Mandatory evacuation order just dropped. You have 12 hours before conditions deteriorate. 2.5 million people are trying to leave at the same time. Go.",
  startingNodeId: "he-1",
  totalNodes: 5,
  nodes: [
    {
      id: "he-1",
      emoji: "🌀",
      situation:
        "The evacuation order hits at 6 AM. Category 4, 145 mph winds, expected landfall tomorrow evening. The interstate is already backing up. Your family of four needs to move. Your vehicle has three-quarters of a tank. You have a bug out bag in the closet but it has not been touched in 8 months. What is your first move?",
      choices: [
        {
          text: "Grab the pre-packed bags, load the car with critical documents and water, and hit the road within 90 minutes",
          consequence:
            "This is what preparation looks like in action. While your neighbors are scrambling to find suitcases and arguing about what to bring, you are on the road. You beat the worst of the traffic because you did not waste time deciding — you had a plan. Every hour of delay adds 3-4 hours of gridlock.",
          scoreImpact: 25,
          nextNodeId: "he-2a",
        },
        {
          text: "Take a few hours to pack thoroughly — clothes for a week, food, important items, board up the windows",
          consequence:
            "Thorough, but costly. By the time you leave at noon, the interstate is a parking lot. What should be a 4-hour drive to your destination becomes 10+ hours of crawling traffic. You packed well, but you forgot the most important thing to pack: time. Boarding windows is smart if you have someone else doing it while you pack the car.",
          scoreImpact: 5,
          nextNodeId: "he-2b",
        },
        {
          text: "Stay and ride it out — you have a concrete block house and supplies",
          consequence:
            "A Cat 4 with 145 mph winds does not care about your concrete blocks. Storm surge is the real killer — if you are in a surge zone, staying is potentially fatal. Even if your house survives structurally, you will be without power, water, and emergency services for weeks. Mandatory evacuations exist because people die when they ignore them.",
          scoreImpact: -15,
          nextNodeId: "he-2c",
        },
      ],
    },
    {
      id: "he-2a",
      emoji: "🚗",
      situation:
        "You are on the road by 7:30 AM. Traffic is building but still moving. Your destination is your brother's place 280 miles inland. You have three-quarters of a tank, bags packed, water and snacks for the family, and important documents in a waterproof bag. Two hours in, you hit a decision point: the main interstate is starting to slow down. A back road route adds 40 miles but avoids the highway.",
      choices: [
        {
          text: "Take the back roads — avoid the herd",
          consequence:
            "The back road route is longer on paper but faster in practice. While the interstate is bumper-to-bumper for the next 8 hours, you are cruising two-lane county roads at 45 mph. You arrive at your brother's place by early afternoon. This is why having alternate routes planned matters — the obvious path is always the most congested.",
          scoreImpact: 20,
          nextNodeId: "he-3a",
        },
        {
          text: "Stick with the interstate — it is the most direct route",
          consequence:
            "The interstate grinds to a halt about 30 miles ahead. You spend 6 hours covering 50 miles. Gas is burning, the kids are restless, and every rest stop is packed. You eventually make it, but you arrive exhausted and having burned far more fuel than planned. Next time, have two or three route options mapped out before you leave.",
          scoreImpact: 5,
          nextNodeId: "he-3a",
        },
      ],
    },
    {
      id: "he-2b",
      emoji: "🚧",
      situation:
        "You are stuck in traffic. What should be mile 60 is mile 20 after 4 hours. The gas gauge is dropping faster than expected — stop-and-go traffic kills fuel economy. You pass a gas station with a line stretching down the block. Your GPS shows the interstate is red for the next 100 miles.",
      choices: [
        {
          text: "Exit and find an alternate route on county roads",
          consequence:
            "Smart pivot. The county roads are not empty but they are moving. You lose 30 minutes finding the right route, but the next 3 hours of progress make up for it. You have enough gas to reach your destination but just barely. The lesson: always have Plan B and Plan C routes preloaded in your GPS or on a paper map.",
          scoreImpact: 15,
          nextNodeId: "he-3a",
        },
        {
          text: "Wait in the gas line — you need fuel before anything else",
          consequence:
            "The gas line takes 90 minutes. By the time you are back on the road, traffic is even worse. But at least you have a full tank. You eventually make it to safety, arriving well after dark, exhausted and stressed. Lesson: keep your tank above three-quarters during hurricane season. Fueling up is a pre-storm task, not an evacuation task.",
          scoreImpact: 5,
          nextNodeId: "he-3b",
        },
      ],
    },
    {
      id: "he-2c",
      emoji: "🌊",
      situation:
        "You decide to ride it out. The storm hits harder and earlier than forecast. By midnight, the wind is screaming and water is rising in the street. Your neighborhood is in a storm surge zone — something you did not fully appreciate when you made the call to stay. Water is coming in under the doors.",
      choices: [
        {
          text: "Move to the second floor with supplies and wait it out",
          consequence:
            "The right call given your situation. You bring water, food, a radio, flashlights, and your important documents upstairs. The first floor floods with 3 feet of water. You are safe on the second floor but trapped for 36 hours until water recedes enough for rescue boats. You survive, but it is the worst 36 hours of your life. Do not ignore mandatory evacuations.",
          scoreImpact: 10,
          nextNodeId: "he-3c",
        },
        {
          text: "Try to drive out now before conditions get worse",
          consequence:
            "Driving into a hurricane is one of the most dangerous things a person can do. Visibility is near zero, the roads are flooding, and debris is flying. You make it two blocks before the road is impassable. You abandon the car and wade back home through rising water. You are soaked, cold, and now your vehicle is destroyed. You should have left 12 hours ago.",
          scoreImpact: -10,
          nextNodeId: "he-3c",
        },
      ],
    },
    {
      id: "he-3a",
      emoji: "🏠",
      situation:
        "You have made it to your brother's place safely. The hurricane hits your hometown 18 hours later. Watching the news, you see your neighborhood taking significant damage — downed trees, flooding, no power. Recovery will take weeks. Your family is safe but you realize the next phase is just beginning: insurance, cleanup, and rebuilding. How do you prepare for the return?",
      choices: [
        {
          text: "Use the wait time to document everything for insurance, file claims remotely, and plan your return with supplies",
          consequence:
            "Proactive and smart. You pull up photos of your home for documentation, file a preliminary insurance claim online, and start a supply list for the return trip: tarps, tools, cleaning supplies, personal protective equipment. When you finally go back, you are organized and efficient while your neighbors are still on hold with their insurance company.",
          scoreImpact: 20,
          nextNodeId: "he-4a",
        },
        {
          text: "Rush back as soon as the roads are clear to assess damage",
          consequence:
            "Understandable but premature. Roads are littered with debris, downed power lines are everywhere, and emergency services are stretched thin. You arrive to find your home damaged but standing. However, without supplies or a plan, you are just standing in a disaster zone unable to do much. Emotional decisions in the aftermath waste time.",
          scoreImpact: 5,
          nextNodeId: "he-4b",
        },
      ],
    },
    {
      id: "he-3b",
      emoji: "🏨",
      situation:
        "You made it to safety, but just barely. Hotel rooms are all booked within 200 miles. You find a Red Cross shelter at a high school. Your family is safe but sleeping on cots in a gym with 300 other people. The hurricane hits your city hard. You have no idea what your house looks like.",
      choices: [
        {
          text: "Make the best of it — rest, connect with aid workers, and plan your next steps",
          consequence:
            "Good headspace. You charge your phone at the shelter, connect with FEMA representatives, and start the insurance process. The shelter has food and water. It is not comfortable, but it is safe. You learn that your neighborhood has significant flooding. You focus on what you can control and build a return plan.",
          scoreImpact: 15,
          nextNodeId: "he-4b",
        },
        {
          text: "Try to find a hotel further out — the shelter is too chaotic",
          consequence:
            "Everything within 300 miles is booked or price-gouged. You spend hours calling and driving, burning gas. You finally find a room at 3x the normal rate. Your family sleeps better, but you have spent money and fuel you might need later. Sometimes the uncomfortable option is the right option.",
          scoreImpact: 5,
          nextNodeId: "he-4b",
        },
      ],
    },
    {
      id: "he-3c",
      emoji: "🆘",
      situation:
        "The storm passes after 14 hours of hell. Your first floor is destroyed — furniture floating, appliances ruined, the car outside is submerged. But your family is alive on the second floor. No power, no water service, no cell signal. You can see rescue boats in the distance.",
      choices: [
        {
          text: "Signal for rescue and evacuate — this house is no longer safe to stay in",
          consequence:
            "Right call. Floodwater is contaminated with sewage, chemicals, and debris. The structural integrity of your home is questionable. You flag down a rescue boat and evacuate to a shelter. You lost almost everything material, but your family is alive. Never wait out a mandatory evacuation again.",
          scoreImpact: 10,
          nextNodeId: "he-4c",
        },
        {
          text: "Stay in the house until water recedes — you have enough supplies upstairs",
          consequence:
            "Risky but survivable. The water takes 2 more days to recede. You ration your upstairs supplies carefully. When you finally walk out, the neighborhood looks like a war zone. You have survived, but the emotional and physical toll is enormous. The supplies you had upstairs saved you — imagine if you had not moved them up.",
          scoreImpact: 5,
          nextNodeId: "he-4c",
        },
      ],
    },
    {
      id: "he-4a",
      emoji: "📋",
      situation:
        "Two weeks later, you return home with a truck full of supplies, a solid insurance claim already in progress, and a clear plan. Your house has roof damage and some flooding, but it is recoverable. Your neighbors are overwhelmed and just starting the process you finished a week ago. You reflect on what worked and what to improve.",
      choices: [
        {
          text: "Upgrade the bug out bags and create a detailed family evacuation plan with multiple routes and rally points",
          consequence:
            "Perfect takeaway. A written evacuation plan with multiple routes, pre-identified fuel stops, and a rally point means next time you are out the door in 30 minutes, not 90. Include a list of what goes in the car (documents, water, food, meds) so you do not have to think under pressure.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Invest in home hardening — impact windows, flood barriers, and a whole-home generator",
          consequence:
            "Investing in your home's resilience is a strong long-term play. Impact windows handle Category 4 debris. Flood barriers protect against moderate surge. And a generator means you are the house on the block with power. But remember: hardening your home supplements evacuation planning — it does not replace it.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "he-4b",
      emoji: "🔄",
      situation:
        "Weeks later, you are back home dealing with the aftermath. It has been exhausting. The insurance process is a nightmare, the cleanup is overwhelming, and you keep thinking about how differently this could have gone. What is the biggest change you make for next time?",
      choices: [
        {
          text: "Keep bug out bags ready and the car above three-quarters of a tank during hurricane season",
          consequence:
            "Simple changes, massive impact. A ready bag saves you 2-3 hours of packing chaos. A full tank means you do not waste precious evacuation time in gas lines. Add a laminated card in the bag with your evacuation routes and rally points, and you have cut your departure time by 75%.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Build a network of inland contacts so you always have a place to go",
          consequence:
            "Relationships are infrastructure. Having a confirmed place to go — with the person expecting you — eliminates the shelter and hotel scramble. Exchange keys with inland friends or family. Know exactly how to get there. This social network is worth more than any gear you own.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "he-4c",
      emoji: "🏗️",
      situation:
        "You are in a shelter with hundreds of other displaced families. Everything you own that was not on the second floor is gone. Insurance will help eventually, but the process takes months. You have time to think about what you would do differently.",
      choices: [
        {
          text: "Never ignore a mandatory evacuation again — and build a go-bag that is always ready",
          consequence:
            "The single most important lesson. A mandatory evacuation for a Cat 4 hurricane is not optional. The people who left early arrived safely with minimal stress. The people who stayed risked their lives and lost everything anyway. A pre-packed bag and a full gas tank are the difference between a calm departure and a life-threatening ordeal.",
          scoreImpact: 5,
          nextNodeId: "end",
        },
        {
          text: "Relocate further from the coast when rebuilding",
          consequence:
            "An honest assessment of risk. If you live in a storm surge zone and you just experienced what that means firsthand, relocating is not running — it is strategic. Even moving 10 miles inland dramatically reduces surge risk. Sometimes the best preparation is choosing not to need it.",
          scoreImpact: 5,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "he-thrived",
      finalScore: 75,
      rating: "Thrived",
      summary:
        "Textbook evacuation. You were packed and on the road while most people were still checking the weather app. Alternate routes, pre-packed bags, and a calm head under pressure made this a controlled retreat instead of a panicked flight. Your family was safe and comfortable throughout.",
      didRight: [
        "Departed within 90 minutes of the evacuation order",
        "Had pre-packed bug out bags ready to grab",
        "Used alternate routes to avoid gridlock",
        "Proactively managed the insurance and return process",
      ],
      couldImprove: [
        "Have 3 evacuation routes memorized and on paper (not just GPS)",
        "Pre-identify fuel stops and rest points along each route",
        "Keep a waterproof document bag with copies of IDs, insurance, and deeds",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "The gold standard bug out bag. 72 hours of gear capacity, MOLLE webbing for customization, and built to last through exactly this kind of scenario.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Satellite communication when cell towers are down. Send your location to family, call for help, and stay connected when infrastructure fails.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Clean water on the road or at your destination. Evacuations can take 2-3x longer than planned — do not depend on finding bottled water.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.midlandT77.name,
          reason:
            "GMRS radios with 38-mile range and NOAA weather alerts. Coordinate with your convoy and monitor storm updates when cell service drops.",
          url: GEAR.midlandT77.url,
        },
        {
          name: GEAR.readyWise.name,
          reason:
            "Emergency food supply for the road and the days after landfall. Lightweight, shelf-stable, and feeds your family when restaurants and stores are shuttered.",
          url: GEAR.readyWise.url,
        },
      ],
    },
    {
      id: "he-survived",
      finalScore: 45,
      rating: "Survived",
      summary:
        "You got out, but it was messier and more stressful than it needed to be. The delays cost you time, fuel, and peace of mind. The good news: your family is safe and you now have a crystal-clear picture of what to do differently.",
      didRight: [
        "Made the decision to evacuate (the right call)",
        "Adapted when the plan was not working",
        "Kept your family together and safe",
      ],
      couldImprove: [
        "Departure speed is everything — have bags pre-packed and car ready",
        "Gas tank should be full before hurricane season, not during evacuation",
        "Have 2-3 alternate routes planned on paper before you need them",
        "Know your destination before the order comes — do not figure it out on the road",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "A pre-packed 72-hour bag cuts your departure time from hours to minutes. Pack it once, check it quarterly, and grab it when the order comes.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water on an evacuation route is never guaranteed. This filter gives you options no matter where you end up.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Shelf-stable meals for the road and for the days after. When restaurants are closed and stores are empty, this feeds your family without question.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.solBivvy.name,
          reason:
            "Breathable emergency shelter you can actually sleep in. If you end up in a shelter or sleeping in the car, this keeps you warm and dry.",
          url: GEAR.solBivvy.url,
        },
        {
          name: GEAR.gerberStrongarm.name,
          reason:
            "Full-tang fixed blade with a pommel striker. Cuts seatbelts, clears debris, and handles any task during evacuation and aftermath.",
          url: GEAR.gerberStrongarm.url,
        },
      ],
    },
    {
      id: "he-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "You made some dangerous calls and paid the price. Staying during a Cat 4 mandatory evacuation is never the right play. You survived through luck and last-minute decisions. Use this experience as the wake-up call it is.",
      didRight: [
        "Ultimately survived — that counts for something",
        "Made the second-floor move when you realized the danger",
      ],
      couldImprove: [
        "Mandatory evacuation means mandatory. Full stop.",
        "Pre-packed bags and a full gas tank eliminate the excuses for staying",
        "Storm surge kills more people than wind — know your flood zone",
        "Have an inland destination locked in before hurricane season starts",
        "The time to prepare is before the storm is named, not after",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "Having a packed bag removes the biggest excuse for not evacuating. Everything you need for 72 hours, ready to grab in 60 seconds.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "When you are trapped with no cell signal, satellite SOS is your lifeline. This would have gotten rescue to you hours faster.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Floodwater is contaminated. Even if you have buckets of water around you, none of it is drinkable without filtration. This is a survival essential.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.jackery1000.name,
          reason:
            "Power for communication, lighting, and charging during extended post-storm outages. Recharge with solar when the sun comes back.",
          url: GEAR.jackery1000.url,
        },
      ],
    },
    {
      id: "he-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "This was rough from start to finish. Staying through a Cat 4, attempting to drive during the storm — these are decisions that get people killed in real life. The simulation let you walk away. Real hurricanes do not. Take this seriously and build an evacuation plan today.",
      didRight: [
        "You completed the simulation — awareness is the first step",
      ],
      couldImprove: [
        "Never ride out a Category 4 hurricane in a surge zone — period",
        "Never attempt to drive during a hurricane",
        "Pre-packed bug out bags eliminate the packing excuse for staying",
        "Keep gas tank full during hurricane season",
        "Know your flood zone and evacuation zone — check FEMA maps today",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "Step one: pack a bag and leave it by the door during hurricane season. Make evacuation a grab-and-go operation.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water filtration is non-negotiable in any emergency. Especially post-hurricane when municipal water is contaminated.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Satellite SOS when you are trapped. This device has literally saved lives during hurricanes when cell towers were destroyed.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Emergency food that requires no refrigeration. Whether you are on the road or in a shelter, you eat.",
          url: GEAR.mountainHouse.url,
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 3: CIVIL UNREST
// ═══════════════════════════════════════════════════════
const civilUnrest: Scenario = {
  id: "civil-unrest",
  name: "Civil Unrest",
  icon: "alert-triangle",
  difficulty: "Hard",
  description:
    "A controversial court ruling sparks protests that escalate into widespread civil unrest. Stores are being looted, fires are burning downtown, and police are overwhelmed. Your neighborhood is 3 miles from the epicenter. It is spreading. What is your play?",
  startingNodeId: "cu-1",
  totalNodes: 5,
  nodes: [
    {
      id: "cu-1",
      emoji: "🔥",
      situation:
        "It started with protests downtown, but it has escalated fast. You can hear sirens constantly and see smoke from your backyard. Social media is a mess of conflicting reports. Your neighborhood is quiet for now, but there are reports of looting spreading outward. Your spouse is worried. Your neighbor just texted asking if you have seen what is happening. The kids are watching TV like nothing is wrong. It is 4 PM.",
      choices: [
        {
          text: "Lock down the house, gather information from reliable sources, and quietly prepare to leave if needed",
          consequence:
            "Controlled and measured. You lock doors and windows, turn off exterior lights, pull cars into the garage, and tune into a police scanner app and local news. You quietly pack the car with your bug out bags, water, and important documents — not because you are leaving yet, but because the option to leave fast should always be on the table. Information first, action second.",
          scoreImpact: 25,
          nextNodeId: "cu-2a",
        },
        {
          text: "Drive downtown to see how bad it really is",
          consequence:
            "Curiosity in a crisis can get you killed. You drive toward the disturbance and run into a roadblock — not a police one. A crowd has blocked the road and your car is now surrounded. You reverse out and make it home, shaken. You just put yourself in danger for zero useful information. Everything you needed to know was available from your living room.",
          scoreImpact: -15,
          nextNodeId: "cu-2b",
        },
        {
          text: "Go buy supplies and extra food before things get worse",
          consequence:
            "Not a terrible instinct, but the timing is bad. The grocery store is chaotic — people are panic-buying and tensions are high. An argument breaks out in the parking lot. You grab some basics but the experience is stressful and took you away from your home and family for 2 hours during an evolving situation. Pre-stocked shelves would have kept you home.",
          scoreImpact: 0,
          nextNodeId: "cu-2b",
        },
      ],
    },
    {
      id: "cu-2a",
      emoji: "📱",
      situation:
        "Night falls. The scanner is active — police are stretched thin, focused on the downtown core. Your neighborhood watch group chat is active. A house 6 blocks away had a window broken and someone tried to enter — the family called 911 but response time is 45 minutes. Your block is still quiet, but the perimeter is shrinking. A neighbor asks if he should sit on his porch with a rifle.",
      choices: [
        {
          text: "Coordinate with neighbors for a quiet watch rotation — eyes and communication, not confrontation",
          consequence:
            "This is community security done right. You set up 2-hour shifts where one person per house stays awake and monitors the block with a walkie-talkie. No confrontation, no posturing — just situational awareness and rapid communication. If something approaches, everyone knows instantly. Neighborhoods that organize are neighborhoods that stay safe.",
          scoreImpact: 25,
          nextNodeId: "cu-3a",
        },
        {
          text: "Stay inside with lights off and do not engage — keep a low profile",
          consequence:
            "Low profile is smart. Drawing no attention to your home is the first line of defense. But without coordinating with neighbors, you are isolated. If something happens to the house next door, you would not know until it is at your door. Individual security is harder than collective security. You make it through the night, but alone and anxious.",
          scoreImpact: 10,
          nextNodeId: "cu-3b",
        },
      ],
    },
    {
      id: "cu-2b",
      emoji: "🌙",
      situation:
        "Night falls and things are getting worse. You can see the glow of fires from downtown. The power flickered once already. Your phone is blowing up with alerts and rumors. Your family is scared. You are home but feel unprepared. A neighbor knocks on the door — they are thinking about leaving town. What do you do?",
      choices: [
        {
          text: "Stay put and secure the house — leaving at night during unrest is too risky",
          consequence:
            "Good call. Driving through an unpredictable situation in the dark dramatically increases your risk. You lock everything down, bring valuables upstairs, and keep the house dark from the outside. Your neighbor leaves and ends up stranded on the highway behind a roadblock for 3 hours. Staying put in a secure structure is almost always safer than moving through chaos.",
          scoreImpact: 15,
          nextNodeId: "cu-3b",
        },
        {
          text: "Leave now with the neighbor — get the family somewhere safe",
          consequence:
            "Moving at night during active unrest is risky. You encounter roadblocks, detours, and one very tense moment at an intersection. You eventually make it to a relative's house 40 miles out, but the drive was harrowing. Your home ends up being fine — sometimes the safer play was the one you left behind.",
          scoreImpact: 0,
          nextNodeId: "cu-3c",
        },
      ],
    },
    {
      id: "cu-3a",
      emoji: "🔦",
      situation:
        "Day 2. The watch rotation worked — your block had zero incidents while blocks without coordination had break-ins. But the situation citywide is not improving. Stores are closed, gas stations are shuttered, and there is a rumor of a curfew starting tonight. Your food supply is solid for a week. The group chat is discussing whether to stay or go.",
      choices: [
        {
          text: "Stay and maintain the neighborhood watch — this is working and your supplies are good",
          consequence:
            "The system is working. Your block is a pocket of stability in a chaotic city. By day 4, the National Guard arrives and things begin to normalize. Your neighborhood comes through with zero break-ins and builds bonds that last well beyond the crisis. Community defense without confrontation — textbook.",
          scoreImpact: 20,
          nextNodeId: "cu-4a",
        },
        {
          text: "Evacuate to a friend's place outside the city while things are still calm enough to drive",
          consequence:
            "A reasonable decision, especially if you have family members who are struggling with the stress. The drive out is tense but uneventful because you leave during daylight hours. Your house stays safe because your neighbors continue the watch. Having options — and using them calmly — is what preparation provides.",
          scoreImpact: 15,
          nextNodeId: "cu-4a",
        },
      ],
    },
    {
      id: "cu-3b",
      emoji: "🏠",
      situation:
        "Day 2. You made it through the night but barely slept. The situation is still tense. Stores remain closed. You have about 3-4 days of food if you are careful. The power has gone out in parts of the city. Your block still has power but who knows for how long. The police scanner is nonstop.",
      choices: [
        {
          text: "Start rationing food, fill containers with water, and connect with neighbors for mutual support",
          consequence:
            "Good recovery. You are catching up on steps you should have taken yesterday, but doing them now is better than not at all. Your neighbors are glad someone is taking initiative. Within a few hours, you have a loose communication network and shared resources. By day 4, the situation stabilizes. Your block made it through because someone (you) finally organized it.",
          scoreImpact: 15,
          nextNodeId: "cu-4b",
        },
        {
          text: "Hunker down alone and wait it out — do not trust anyone right now",
          consequence:
            "Paranoia is understandable during civil unrest, but isolation makes you more vulnerable, not less. You spend 3 anxious days alone, rationing food and jumping at every noise. You make it through, but the psychological toll is real. Your neighbors, who worked together, came through calmer and with more resources. Trust (with verification) is a survival tool.",
          scoreImpact: 5,
          nextNodeId: "cu-4b",
        },
      ],
    },
    {
      id: "cu-3c",
      emoji: "🛣️",
      situation:
        "You made it to your relative's place 40 miles out. The drive was rough but you are safe. News shows your neighborhood is still tense but your house appears to be okay on security cameras. You are following events from a distance. After 4 days, things are calming down. Time to think about what comes next.",
      choices: [
        {
          text: "Return home carefully and start building a community security plan for next time",
          consequence:
            "Returning calmly once the situation stabilizes is smart. Your home is intact. The biggest lesson: community security organized before a crisis is 10x more effective than scrambling during one. Start a neighborhood preparedness group now — not when the smoke is in the air.",
          scoreImpact: 10,
          nextNodeId: "cu-4b",
        },
        {
          text: "Stay away a few more days until everything is completely normal",
          consequence:
            "Extra caution is not wrong. You return a week later to a fully stabilized situation. The extra time away cost you nothing but gave you peace of mind. Sometimes waiting is the hardest part but also the wisest.",
          scoreImpact: 10,
          nextNodeId: "cu-4b",
        },
      ],
    },
    {
      id: "cu-4a",
      emoji: "✅",
      situation:
        "The crisis subsides after about a week. Your neighborhood came through in better shape than most because of coordination and calm decision-making. Now is the time to lock in the lessons. What is your top priority going forward?",
      choices: [
        {
          text: "Formalize the neighborhood watch and build a community preparedness plan",
          consequence:
            "The relationships you built during the crisis are your most valuable prep. A formal neighborhood plan with communication channels, supply inventories, and watch protocols means you are even more prepared next time. This is how resilient communities are built — not in calm times, but from the lessons of hard ones.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Stock deeper supplies — food, water, medical, and communication gear",
          consequence:
            "Supplies are the foundation everything else is built on. Two weeks of food and water per person, a medical kit that can handle real injuries, and communication gear (radios, satellite messenger) that works when cell towers are overloaded. You never want to be the person at the grocery store during a crisis.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "cu-4b",
      emoji: "📝",
      situation:
        "The situation normalizes over the next week. Looking back, some things went well and some did not. The biggest realization: you were less prepared for this type of event than you thought. What is the most impactful change you can make?",
      choices: [
        {
          text: "Build a 2-week supply of food, water, and essentials so you never need to leave the house during a crisis",
          consequence:
            "This eliminates the single biggest vulnerability: needing to go out for supplies during dangerous conditions. Two weeks of food, stored water, and basic medical supplies means you can lock the door and not open it until things are safe. That is the ultimate advantage in civil unrest — the ability to simply not engage.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Get a reliable communication setup — police scanner, two-way radios, and a satellite messenger",
          consequence:
            "Information is the currency of every crisis. A police scanner tells you what is actually happening (not what social media thinks is happening). Two-way radios let you coordinate with neighbors without cell networks. A satellite messenger works when everything else is down. The person with the best information makes the best decisions.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "cu-thrived",
      finalScore: 75,
      rating: "Thrived",
      summary:
        "You played this like a chess game: gather information, secure position, build alliances, and wait. Zero panic, zero unnecessary movement, and your neighborhood came through because you stepped up to lead. This is what community-based preparedness looks like.",
      didRight: [
        "Locked down and gathered information before acting",
        "Organized community watch — collective security over individual paranoia",
        "Kept supplies stocked so you never needed to leave",
        "Made decisions based on information, not emotion",
      ],
      couldImprove: [
        "Formalize the neighborhood plan before the next event",
        "Have two-way radios pre-distributed to key neighbors",
        "Build a communication plan that does not depend on cell service",
      ],
      gearRecommendations: [
        {
          name: GEAR.garminInreach.name,
          reason:
            "When cell towers are overloaded or down, satellite messaging is the only reliable communication. Coordinate with family anywhere, anytime.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Two weeks of food means two weeks of not leaving your house. In civil unrest, the safest place is usually behind your locked door.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.esee4.name,
          reason:
            "A reliable fixed-blade knife is a multi-purpose tool for any emergency. The ESEE 4 is tough enough for any task and backed by a lifetime warranty.",
          url: GEAR.esee4.url,
        },
        {
          name: GEAR.midlandGXT1000.name,
          reason:
            "Pre-distribute walkie talkies to key neighbors for your watch rotation. When cell networks are overloaded, direct radio communication keeps your block coordinated.",
          url: GEAR.midlandGXT1000.url,
        },
        {
          name: GEAR.survivalTabs.name,
          reason:
            "15-day supply of compact survival nutrition. Takes almost no space and provides enough calories to sustain you during extended shelter-in-place scenarios.",
          url: GEAR.survivalTabs.url,
        },
      ],
    },
    {
      id: "cu-survived",
      finalScore: 40,
      rating: "Survived",
      summary:
        "You made it through with some good instincts and some missteps. The biggest lesson: staying home and staying informed beats moving through chaos almost every time. Build your supplies so you never need to leave during the next event.",
      didRight: [
        "Ultimately stayed safe and kept your family together",
        "Adapted to the situation as it evolved",
      ],
      couldImprove: [
        "Stock supplies beforehand — shopping during a crisis is dangerous",
        "Coordinate with neighbors before things escalate, not after",
        "Never drive toward a disturbance to see what is happening",
        "Have a police scanner app and battery radio ready to go",
      ],
      gearRecommendations: [
        {
          name: GEAR.mountainHouse.name,
          reason:
            "14 days of food means 14 days of staying behind your locked door. The number one survival strategy in civil unrest is simply not engaging.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "If water service is disrupted during extended unrest, you need filtration. Rain, pool water, and other sources become viable with the right filter.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.jackery1000.name,
          reason:
            "Power for communication devices, charging, and light during extended outages. Quiet operation means no attention drawn to your house.",
          url: GEAR.jackery1000.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Satellite communication when cell networks are overwhelmed. Contact family, call for help, and share location — all via satellite.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.readyWise.name,
          reason:
            "Emergency food supply that keeps you fed for days without leaving the house. When stores are closed and streets are dangerous, this is your pantry backup.",
          url: GEAR.readyWise.url,
        },
        {
          name: GEAR.bioliteHeadlamp.name,
          reason:
            "Rechargeable headlamp for navigating a dark house during power outages. Hands-free lighting lets you work, cook, and secure your home.",
          url: GEAR.bioliteHeadlamp.url,
        },
      ],
    },
    {
      id: "cu-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Some risky decisions and a lack of supplies made this harder than it needed to be. The core lesson: in civil unrest, the winning move is usually to not move at all. Stay home, stay quiet, stay informed. Build the supplies that make that possible.",
      didRight: [
        "You survived — and now you know what you need to change",
      ],
      couldImprove: [
        "Never drive toward danger — all information is available remotely",
        "Stock 2 weeks of food and water so you can shelter in place",
        "Build neighbor relationships now, not during a crisis",
        "Get a police scanner app — social media is mostly noise",
        "Keep vehicles fueled and ready to go at all times",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "If you need to evacuate, a pre-packed bag means you are out the door in 60 seconds. No scrambling, no forgetting essentials.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Emergency food that requires no refrigeration or cooking. Shelter in place with confidence knowing your family eats for 2 weeks.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water backup when municipal systems are compromised. Compact, reliable, and filters 100,000 gallons.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Emergency communication that works independently of cell towers and internet. SOS button contacts search and rescue worldwide.",
          url: GEAR.garminInreach.url,
        },
      ],
    },
    {
      id: "cu-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "Driving into danger, leaving home at the worst time, no supplies on hand — this was a cascade of decisions that put you at serious risk. In a real scenario, any one of those choices could have had permanent consequences. The good news: every one of these mistakes is preventable with basic preparation.",
      didRight: [
        "You ran the simulation — awareness is where preparation begins",
      ],
      couldImprove: [
        "Never drive toward a disturbance — ever",
        "Stock food and water so you can shelter in place for 2 weeks minimum",
        "If you must evacuate, do it during daylight on planned routes",
        "Build community relationships before you need them",
        "Get real information sources — police scanner, local news, AM radio",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "Start here. A packed bag ready to go means evacuation is a calm, 60-second decision instead of a chaotic scramble.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Two weeks of food in a bucket. When you do not need to leave the house, you do not need to face the danger outside.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Clean water regardless of what happens to the city water system. A 3-ounce insurance policy.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.esee4.name,
          reason:
            "A versatile fixed-blade tool for everything from opening cans to cutting cordage. Lifetime warranty. Build it into your go-bag.",
          url: GEAR.esee4.url,
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 4: WINTER STORM
// ═══════════════════════════════════════════════════════
const winterStorm: Scenario = {
  id: "winter-storm",
  name: "Winter Storm",
  icon: "snowflake",
  difficulty: "Moderate",
  description:
    "A historic winter storm drops 30 inches of snow with ice underneath. Power lines are down across the region, roads are impassable, and the temperature is dropping to -10 degrees F. Your family is snowed in with whatever you have right now.",
  startingNodeId: "ws-1",
  totalNodes: 5,
  nodes: [
    {
      id: "ws-1",
      emoji: "🌨️",
      situation:
        "The storm hit harder than forecast. It is 6 AM and there is 2 feet of snow outside with more falling. The power just went out. Your all-electric home (heat pump, electric stove, electric water heater) is now completely without heat or the ability to cook. Inside temp is 65 degrees F but dropping fast. Wind chill outside is -15 degrees F. The roads are impassable and plows will not reach your neighborhood for at least 48 hours.",
      choices: [
        {
          text: "Deploy the power station and space heater to keep one room warm, start melting snow for water",
          consequence:
            "Exactly right. You designate the smallest bedroom as the warm room, run a space heater off your power station, and close the door. The room stays at 55 degrees F — cool but safe. You start melting snow on the power station's outlet (using an electric kettle) for drinking water since the electric pump is down. Controlled, efficient, and sustainable for days.",
          scoreImpact: 25,
          nextNodeId: "ws-2a",
        },
        {
          text: "Bundle everyone in blankets and sleeping bags and wait for the power to come back",
          consequence:
            "Layering up is smart, but passive survival has limits. Without any heat source, the house temperature drops to 40 degrees F by noon and keeps falling. Pipes are at risk of freezing. Your family is uncomfortable and the kids are cold. You are surviving but not in control of the situation — you are just reacting to it.",
          scoreImpact: 5,
          nextNodeId: "ws-2b",
        },
        {
          text: "Try to drive to a hotel or warming shelter",
          consequence:
            "Two feet of snow with ice underneath means your car is going exactly nowhere. You spend 45 minutes shoveling to get out of the driveway, make it 200 yards, and get stuck. Now you have wasted an hour of energy and body heat, and you need to walk back through the cold. The time you spent outside has chilled you to the core. Stay home.",
          scoreImpact: -10,
          nextNodeId: "ws-2b",
        },
      ],
    },
    {
      id: "ws-2a",
      emoji: "🔥",
      situation:
        "Your warm room strategy is working. The power station is keeping the space heater running but the battery is draining — maybe 10 hours left at this rate. The storm is supposed to last another 24 hours, and power restoration could be 3-5 days. You need to think about extending your resources.",
      choices: [
        {
          text: "Rotate the heater — 2 hours on, 1 hour off — and use body heat and insulation to maintain temperature",
          consequence:
            "Smart resource management. By cycling the heater, you triple your battery life. During off hours, everyone stays in sleeping bags and the room stays above 45 degrees F from residual heat and body warmth. You have now extended your power from 10 hours to potentially 30+ hours. If the sun comes out, your solar panel can recharge. Discipline wins.",
          scoreImpact: 20,
          nextNodeId: "ws-3a",
        },
        {
          text: "Keep the heater running full blast — comfort is important for morale",
          consequence:
            "The room is nice and warm at 60 degrees F, but your power station dies by midnight. Now you have no heat and no way to melt snow for water. The temperature in the room drops rapidly. You scramble for blankets and sleeping bags — the same strategy you avoided earlier but now with a dead battery. Comfort today created a crisis tonight.",
          scoreImpact: 0,
          nextNodeId: "ws-3b",
        },
      ],
    },
    {
      id: "ws-2b",
      emoji: "🥶",
      situation:
        "It is noon and the house is 42 degrees F. Everyone is layered up but the cold is seeping in. The pipes are groaning — they are at risk of freezing and bursting, which would mean a flooded house on top of everything else. You can see your breath inside. The kids are miserable.",
      choices: [
        {
          text: "Open cabinets under sinks to let warm air circulate around pipes, and drip the faucets",
          consequence:
            "Good save. Opening cabinets exposes pipes to the warmer interior air, and a slight drip keeps water moving — moving water freezes much slower than still water. You also drain the pipes you can access into containers (free water storage). This might save you from a burst pipe disaster. Not everyone thinks about the pipes — you did.",
          scoreImpact: 15,
          nextNodeId: "ws-3b",
        },
        {
          text: "Focus all energy on keeping the family warm — build a blanket fort in the smallest room",
          consequence:
            "The blanket fort is creative and works for body heat. Sealing off one small room and piling in with every blanket, sleeping bag, and comforter raises the temperature a few degrees from body heat alone. But you forgot about the pipes. By the next morning, a pipe bursts in the bathroom. Water everywhere. Now you have cold AND water damage.",
          scoreImpact: 5,
          nextNodeId: "ws-3b",
        },
      ],
    },
    {
      id: "ws-3a",
      emoji: "☀️",
      situation:
        "Day 2. The storm has passed and the sun is out. It is still bitterly cold but the solar panel you set up in the window is trickling charge back into the power station. The roads are still buried. You have food (canned and dry goods), water (melted snow), and a sustainable heat cycle going. Your neighbor texts — they are out of food and their pipes burst.",
      choices: [
        {
          text: "Share some food and help them shut off their water main to stop the flooding",
          consequence:
            "This is the right thing to do and it is also strategic. A neighbor you help today becomes an ally tomorrow. You share canned goods (you have plenty), help them find and close the water main, and show them the warm-room strategy. Your preparedness just improved two families' outcomes instead of one.",
          scoreImpact: 20,
          nextNodeId: "ws-4a",
        },
        {
          text: "Conserve your supplies — you do not know how long this will last",
          consequence:
            "Understandable instinct, but cold calculus. Your supplies are solid for 5+ more days. Your neighbor has nothing and a flooded house. Helping them costs you little and builds a relationship that pays dividends long after the storm. Extreme hoarding when you have abundance is not preparedness — it is fear.",
          scoreImpact: 5,
          nextNodeId: "ws-4a",
        },
      ],
    },
    {
      id: "ws-3b",
      emoji: "🧊",
      situation:
        "Day 2. The storm has passed but the cold has not. Power is still out. You are running low on easy-to-eat food (anything that does not require cooking). Water is a challenge — the taps are either frozen or dry. You are tired, cold, and hungry. A plow finally comes through the main road but your street is still blocked.",
      choices: [
        {
          text: "Bundle up and walk to the main road to see if any stores or aid stations are open",
          consequence:
            "A half-mile walk in deep snow and -5 degrees F is brutal but doable if you are dressed for it. You find a church has set up a warming station with hot food and water. You fill your bags and trek back. The walk nearly does you in, but you return with food, water, and information about when power might return. Necessity drove the mission.",
          scoreImpact: 10,
          nextNodeId: "ws-4b",
        },
        {
          text: "Stay home and ration what you have — someone will come eventually",
          consequence:
            "Eventually is the key word, and it ends up being another 2 days. You survive on crackers, peanut butter, and melted snow, but it is miserable. When help finally arrives, you are dehydrated and exhausted. Waiting for rescue should be the backup plan, not the primary plan.",
          scoreImpact: 0,
          nextNodeId: "ws-4b",
        },
      ],
    },
    {
      id: "ws-4a",
      emoji: "⛅",
      situation:
        "Day 4. Power is restored to most neighborhoods including yours. The heat comes on and it has never felt so good. Roads are being cleared. Looking back on the last 96 hours, you handled it well but can see exactly where upgrades would help.",
      choices: [
        {
          text: "Invest in a bigger power station with solar, and stock propane as a backup heat source",
          consequence:
            "Energy independence is the theme. A power station with solar kept you alive this time, but a bigger one with a propane heater backup would have made the whole event comfortable instead of survivable. Propane works in any temperature and stores indefinitely. Redundancy in heating is non-negotiable in cold climates.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Focus on insulation and pipe protection — winterize the house properly",
          consequence:
            "Prevention beats reaction. Pipe insulation, window film, weatherstripping, and a heat cable on vulnerable pipes cost a few hundred dollars and prevent thousands in damage. A well-insulated house holds heat 3x longer during a power outage. The best prep for a winter storm happens in October, not January.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "ws-4b",
      emoji: "🔌",
      situation:
        "Day 5. Power finally comes back. You made it, but it was genuinely dangerous at points. The cold, the lack of food and water, the isolation — this was harder than any scenario you had imagined. What is your first investment for next time?",
      choices: [
        {
          text: "A portable power station with a solar panel — electricity was the single point of failure",
          consequence:
            "Nailed it. An all-electric home with no backup power is a single point of failure. One power station with a solar panel gives you heat (space heater), water (electric kettle to melt snow), cooking (hot plate), and communication (phone charger). It transforms a life-threatening situation into an inconvenience.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Stock emergency food, water, and a non-electric heat source like a propane heater",
          consequence:
            "Diversifying away from grid dependence is the right lesson. A Mr. Heater Buddy with propane tanks works regardless of electricity. Stored water and canned food mean you eat and drink without leaving the house. These items sit in a closet for years and then save your life when you need them.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "ws-thrived",
      finalScore: 80,
      rating: "Thrived",
      summary:
        "You turned a potentially deadly winter storm into a manageable inconvenience. Power station, warm-room strategy, resource management, and community support — textbook cold weather survival. Your family was safe, warm enough, and fed throughout.",
      didRight: [
        "Had a power station ready and deployed it immediately",
        "Used the warm-room strategy to concentrate heat",
        "Cycled the heater to extend battery life intelligently",
        "Helped neighbors — building community resilience",
      ],
      couldImprove: [
        "A larger battery or propane backup would eliminate the rationing",
        "Pre-staged pipe insulation prevents burst pipe disasters",
        "A non-electric cooking method (camp stove, propane) adds redundancy",
      ],
      gearRecommendations: [
        {
          name: GEAR.goalZeroYeti.name,
          reason:
            "1,516Wh gives you 2-3x the runtime for space heaters and cooking. Paired with solar, it is indefinite power in a winter storm.",
          url: GEAR.goalZeroYeti.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Even in winter, a 200W panel produces meaningful charge on sunny days. The difference between running out of power on day 2 and lasting a week.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Hot meals during a cold emergency are a massive morale boost. Just add hot water from your kettle. Shelf-stable for 25 years.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.solBivvy.name,
          reason:
            "Breathable emergency bivvy that retains body heat. Slip into this inside your sleeping bag and stay warm even when the house hits 30 degrees F.",
          url: GEAR.solBivvy.url,
        },
        {
          name: GEAR.midlandGXT1000.name,
          reason:
            "Walkie talkies for neighbor-to-neighbor communication when the power is out and cell towers are down. Check on elderly neighbors without walking through the snow.",
          url: GEAR.midlandGXT1000.url,
        },
      ],
    },
    {
      id: "ws-survived",
      finalScore: 45,
      rating: "Survived",
      summary:
        "You got through it, but there were some cold, uncomfortable, and stressful stretches. The all-electric home with no backup power is the lesson here — one failure point took out heat, cooking, and water all at once. Address that and next time is completely different.",
      didRight: [
        "Stayed home instead of risking the roads",
        "Took steps to protect pipes (or learned why you should)",
        "Made it through without anyone getting hurt",
      ],
      couldImprove: [
        "A portable power station is the single most impactful purchase for winter preparedness",
        "Always have a non-electric heat source as backup (propane, wood, kerosene)",
        "Store 3 gallons of water per person and a way to melt snow",
        "Keep easy-to-eat food that does not require cooking",
      ],
      gearRecommendations: [
        {
          name: GEAR.ecoflowDelta3.name,
          reason:
            "1,024Wh of portable power. Run a space heater, electric kettle, and charge devices. This single item changes everything in a winter power outage.",
          url: GEAR.ecoflowDelta3.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Recharge your power station from the sun. Even in winter, clear days after storms give you enough solar to extend your battery indefinitely.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Hot food when the stove does not work. Just add hot water. These meals are lightweight, compact, and last 25 years on the shelf.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Melted snow should be filtered before drinking. This weighs 3 ounces and removes 99.99% of bacteria and protozoa.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.ankerSolix.name,
          reason:
            "1,056Wh power station with enough juice to run a space heater in cycles for days. Pairs with solar for indefinite off-grid power during winter storms.",
          url: GEAR.ankerSolix.url,
        },
        {
          name: GEAR.survivalTabs.name,
          reason:
            "Compact emergency nutrition that lasts 25 years. When cooking is impossible and you just need calories to keep warm, these deliver.",
          url: GEAR.survivalTabs.url,
        },
      ],
    },
    {
      id: "ws-barely",
      finalScore: 20,
      rating: "Barely Made It",
      summary:
        "This one was rough. Cold house, no food, limited water, and a miserable few days. The all-electric home with zero backup is a critical vulnerability that nearly cost you. The good news: fixing this is straightforward and not expensive.",
      didRight: [
        "You toughed it out and survived",
        "Eventually took action to find resources",
      ],
      couldImprove: [
        "A power station with solar panels is priority number one",
        "Non-electric heat source (propane heater) is priority number two",
        "Store water and shelf-stable food for at least 5 days",
        "Pipe insulation and heat cables prevent burst pipe disasters",
        "Never try to drive in a winter storm with 2 feet of snow on the roads",
      ],
      gearRecommendations: [
        {
          name: GEAR.jackery1000.name,
          reason:
            "Your lifeline in a winter power outage. Heat, cooking, phone charging, and lighting — all from one portable battery.",
          url: GEAR.jackery1000.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Solar recharging for the power station. Buy once, never worry about running out of power during an extended outage.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "14 days of food that just needs hot water. When the stove is dead and the roads are impassable, this feeds your family.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Turn melted snow into clean drinking water. Essential when the taps are frozen and you have no stored water.",
          url: GEAR.sawyerSqueeze.url,
        },
      ],
    },
    {
      id: "ws-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "Driving in a blizzard, no backup power, no food stores, no heat plan — this was a cascade of failures that put your family at real risk. In the 2021 Texas winter storm, 246 people died from exactly this scenario. Take this seriously. The fix is simple and affordable.",
      didRight: [
        "You ran the simulation — now you know exactly what to fix",
      ],
      couldImprove: [
        "Never attempt to drive in a severe winter storm",
        "A portable power station is the single most important investment",
        "Non-electric heat source: propane heater with extra fuel",
        "Water: store 3 gallons per person, know how to melt and filter snow",
        "Food: 2 weeks of shelf-stable meals that require minimal preparation",
        "Pipe protection: insulation, heat cables, and knowing where your shutoff valve is",
      ],
      gearRecommendations: [
        {
          name: GEAR.goalZeroYeti.name,
          reason:
            "1,516Wh of power. This is the difference between a cold, dangerous house and one with heat, light, and hot food. Non-negotiable for cold climates.",
          url: GEAR.goalZeroYeti.url,
        },
        {
          name: GEAR.renogy200w.name,
          reason:
            "Solar panel to recharge the battery. Even in winter, a clear day after a storm provides enough charge to keep your essentials running.",
          url: GEAR.renogy200w.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Hot meals in a crisis save morale and calories. Just add hot water. Store it in a closet and forget it until you need it.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water filtration for melted snow and questionable water sources. Three ounces of insurance that fits in your pocket.",
          url: GEAR.sawyerSqueeze.url,
        },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 5: WILDFIRE EVACUATION
// ═══════════════════════════════════════════════════════
const wildfireEvacuation: Scenario = {
  id: "wildfire-evacuation",
  name: "Wildfire Evacuation",
  icon: "flame",
  difficulty: "Extreme",
  description:
    "A wildfire 15 miles away has exploded overnight due to high winds. It is moving toward your rural subdivision at 40 mph. You just received a Level 3 evacuation order: LEAVE NOW. The sky is orange, ash is falling, and you can smell smoke. You have minutes, not hours.",
  startingNodeId: "wf-1",
  totalNodes: 4,
  nodes: [
    {
      id: "wf-1",
      emoji: "🔥",
      situation:
        "It is 3 AM. The Level 3 (GO NOW) alert just hit your phone. Through the window, the ridgeline to the west is glowing orange. Ash is landing on your car. The wind is howling. Your family is waking up confused and scared. You have maybe 20-30 minutes before conditions on the road become dangerous. What happens in the next 5 minutes determines everything.",
      choices: [
        {
          text: "Grab the pre-packed go-bags, important docs from the fireproof safe, load the family, and leave in under 10 minutes",
          consequence:
            "This is what preparation is FOR. While your neighbors are running around their houses grabbing photo albums and loading TVs, you are on the road in 8 minutes. Go-bags, documents, family, keys. That is the list. Everything else is replaceable. You are already a mile down the road before most of your neighbors have started their cars. Time is the only thing that matters when fire moves at 40 mph.",
          scoreImpact: 30,
          nextNodeId: "wf-2a",
        },
        {
          text: "Spend 15 minutes packing essentials — clothes, photos, laptop, medications, pet supplies",
          consequence:
            "Every item you grab costs you time, and time is burning. Literally. You get out in about 20 minutes, which feels okay until you hit the evacuation road. Traffic is now heavy, visibility is dropping from smoke, and embers are landing on cars ahead of you. Those extra 10 minutes of packing put you in a significantly more dangerous driving window. Some things are not worth 10 minutes.",
          scoreImpact: 5,
          nextNodeId: "wf-2b",
        },
        {
          text: "Quickly soak the roof with a garden hose to protect the house, then leave",
          consequence:
            "Your house does not matter right now. YOU matter. People die in wildfires because they prioritize property over escape. The garden hose against a wildfire generating 2,000 degree F temperatures is like spitting at a volcano. You waste 10 critical minutes and the water pressure is already failing because the neighborhood is draining the lines. Get out.",
          scoreImpact: -15,
          nextNodeId: "wf-2b",
        },
      ],
    },
    {
      id: "wf-2a",
      emoji: "🚗",
      situation:
        "You are on the road heading east, away from the fire. Traffic is moderate but moving. Visibility is reduced from smoke — maybe a quarter mile. Your pre-planned evacuation route takes you on a two-lane road away from the main highway. 10 minutes into the drive, you see headlights coming toward you — someone is trying to go back to get their dog.",
      choices: [
        {
          text: "Keep driving your planned route — you cannot help them and stopping risks your family",
          consequence:
            "Cold but correct. In a wildfire evacuation, stopping on the road creates obstacles and puts your family at risk. The person heading back is making a dangerous choice, but it is their choice. Your responsibility is the lives in your car. You note their vehicle description in case you can report it later, and you keep moving. Fifteen minutes later, you clear the smoke zone.",
          scoreImpact: 20,
          nextNodeId: "wf-3a",
        },
        {
          text: "Flash your lights and yell that they need to turn around",
          consequence:
            "Quick warning without stopping — good balance of compassion and safety. You slow down, honk, and gesture wildly for them to turn around. They might listen, they might not. But you did not stop and you did not lose more than 30 seconds. You continue on your route and clear the danger zone. Sometimes all you can offer is information.",
          scoreImpact: 15,
          nextNodeId: "wf-3a",
        },
      ],
    },
    {
      id: "wf-2b",
      emoji: "💨",
      situation:
        "You are on the road but conditions are bad. Smoke has reduced visibility to 100 feet. Embers are blowing across the road. The car ahead of you swerves around something — a downed tree across one lane. Your heart is pounding. The temperature outside feels like you are driving past an open oven. The main evacuation route is gridlocked ahead.",
      choices: [
        {
          text: "Take the side road you know from daily commutes — it parallels the main route through farmland",
          consequence:
            "Local knowledge saves lives. The side road is clear because most evacuees do not know it exists. You drive through a mile of heavy smoke that is terrifying but survivable with windows up and recirculate on. You clear the worst of it and merge back to the highway well ahead of the gridlock. Knowing your local roads — not just the GPS route — is an evacuation essential.",
          scoreImpact: 15,
          nextNodeId: "wf-3a",
        },
        {
          text: "Stay on the main route — it is wider and must be safer",
          consequence:
            "The main route is gridlocked. You sit in smoke-filled traffic for 25 minutes, eyes burning, family coughing. Emergency vehicles are trying to get through and there is nowhere to pull over. You eventually crawl through, but you inhale far more smoke than you should have. The wider road was not safer — it was just where more people went.",
          scoreImpact: 0,
          nextNodeId: "wf-3b",
        },
      ],
    },
    {
      id: "wf-3a",
      emoji: "🏕️",
      situation:
        "You have cleared the evacuation zone and the air is clearer. You are heading to your pre-determined rally point — a relative's house 60 miles east. The adrenaline is fading and the reality is setting in: your home might be gone. But your family is alive and together. You pull over at a gas station to catch your breath and assess.",
      choices: [
        {
          text: "Continue to your rally point, contact insurance from there, and document everything you remember about the house",
          consequence:
            "Executing the plan. You reach the rally point, settle the family, and immediately start a home inventory from memory and phone photos. Insurance claims for fire are massive — the more documentation you have, the faster and more complete the recovery. Your pre-scanned important documents in cloud storage make the process 10x easier. This is why you prep.",
          scoreImpact: 20,
          nextNodeId: "wf-4a",
        },
        {
          text: "Find a hotel nearby and monitor the fire from social media and news",
          consequence:
            "Reasonable, but a hotel during an evacuation is hard to find and expensive. You end up 90 miles from home in a motel room, glued to your phone. The news is grim — your neighborhood took a direct hit. But you are safe and you have everything that matters: your family. Stuff can be replaced.",
          scoreImpact: 10,
          nextNodeId: "wf-4a",
        },
      ],
    },
    {
      id: "wf-3b",
      emoji: "😷",
      situation:
        "You made it out, but barely. The smoke exposure has given everyone headaches and the baby was coughing for an hour. You are at a Red Cross shelter 50 miles east. The fire burned through your neighborhood — early reports say most homes are gone. You are alive, but your home and nearly everything in it is likely destroyed.",
      choices: [
        {
          text: "Focus on family health first — get checked for smoke inhalation, then start the recovery process",
          consequence:
            "Right priority. Smoke inhalation can cause delayed respiratory issues. Getting checked at the medical tent is quick and important, especially for young kids. Once cleared, you start the insurance process and contact FEMA. The recovery from a wildfire is a marathon, not a sprint. Starting with health ensures you have the energy for the long road ahead.",
          scoreImpact: 10,
          nextNodeId: "wf-4b",
        },
        {
          text: "Start calling insurance immediately — you need to get the claim process going",
          consequence:
            "Proactive but your family's health comes first. The insurance claim is important but it will process the same whether you call today or tomorrow. Meanwhile, your daughter's persistent cough needs attention. Take care of the people first, the paperwork second.",
          scoreImpact: 5,
          nextNodeId: "wf-4b",
        },
      ],
    },
    {
      id: "wf-4a",
      emoji: "📋",
      situation:
        "A week later, the fire is contained. Your home sustained damage but is still standing — you were one of the lucky ones. Many of your neighbors lost everything. The community is rallying but the recovery will take months. What is the biggest lesson?",
      choices: [
        {
          text: "Go-bags, pre-planned routes, and important documents in the cloud — speed saves everything",
          consequence:
            "The people who left fast with pre-packed bags are the ones who left calm, safe, and with their critical documents. The people who spent 20 minutes packing left panicked, in worse conditions, and forgot half of what they needed anyway. Wildfire prep is about shaving minutes off your departure time. Every minute counts.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Defensible space and fire-resistant landscaping — protect the home before the fire comes",
          consequence:
            "This is the long-game answer and it is just as important. Cal Fire data shows that homes with 100 feet of defensible space survive 85% of the time even in direct wildfire contact. Metal roofs, fire-resistant siding, cleared gutters, and gravel instead of mulch within 5 feet of the house. Your home survived partly because of the work you did before fire season.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "wf-4b",
      emoji: "🏗️",
      situation:
        "The fire is contained. Your home is gone. The insurance process is underway but it will be months before you see a check. You are staying with family and trying to rebuild your life. What changes do you make going forward?",
      choices: [
        {
          text: "Prep go-bags and a fire safe with documents so the next evacuation takes 5 minutes, not 20",
          consequence:
            "The single biggest upgrade. A pre-packed go-bag per family member, a fire safe with originals, and a cloud backup of all documents means the next evacuation order triggers a 5-minute departure. No scrambling, no forgetting, no dangerous delays. Your home can be rebuilt. Your family cannot.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Rebuild with fire-resistant materials and create defensible space",
          consequence:
            "Smart rebuilding. When you rebuild, use metal roofing, fiber cement siding, tempered glass windows, and ember-resistant vents. Create 100 feet of defensible space with fire-resistant landscaping. The home that replaces the one you lost will be built to survive what destroyed it. Learn from the fire, do not just rebuild the same vulnerability.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "wf-thrived",
      finalScore: 80,
      rating: "Thrived",
      summary:
        "Under 10 minutes from alert to road. That is elite-level evacuation performance. Pre-packed bags, known routes, documents secured, family first — you executed flawlessly under extreme pressure. The fire may have taken property, but it never had a chance at taking your family.",
      didRight: [
        "Departed in under 10 minutes with pre-packed go-bags",
        "Used alternate routes to avoid gridlock and danger",
        "Had important documents accessible and backed up",
        "Prioritized family safety over property every single time",
      ],
      couldImprove: [
        "Have digital copies of all important documents in cloud storage",
        "Keep a home video inventory for insurance purposes",
        "Pre-identify two rally points at different distances and directions",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "The bag that was ready when you needed it. Pre-packed with 72 hours of essentials, this is your wildfire insurance policy.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Satellite communication when smoke knocks out cell towers. Send your location to family and call for help from anywhere.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.esee4.name,
          reason:
            "Reliable fixed blade for cutting seatbelts, breaking windows, clearing brush — the kind of tasks that come up in wildfire evacuations.",
          url: GEAR.esee4.url,
        },
        {
          name: GEAR.midlandT77.name,
          reason:
            "GMRS radio with NOAA weather alerts. Monitor fire updates and communicate with family when smoke knocks out cell towers.",
          url: GEAR.midlandT77.url,
        },
        {
          name: GEAR.katadynBeFree.name,
          reason:
            "Collapsible water filter in a soft flask. Evacuations last longer than planned — clean water from any source keeps you going.",
          url: GEAR.katadynBeFree.url,
        },
      ],
    },
    {
      id: "wf-survived",
      finalScore: 40,
      rating: "Survived",
      summary:
        "You got out alive and that is what matters. But the extra time spent packing or the wrong route choice put you in real danger. Wildfire evacuations are measured in minutes, and the minutes you lost made conditions significantly worse. The fix is simple: pack before fire season, know your routes cold.",
      didRight: [
        "Made the decision to leave immediately",
        "Got your family out of the danger zone",
        "Adapted when the primary route was compromised",
      ],
      couldImprove: [
        "Pre-packed go-bags cut departure time from 20 minutes to 5",
        "Know 3 evacuation routes — the one everyone takes is always gridlocked",
        "Do not waste time on the house — the house is insured, you are not",
        "Keep gas tank above three-quarters during fire season",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "Pack it once, check it quarterly, and grab it in 60 seconds when the alert comes. This bag saves 15 minutes of packing chaos.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Evacuation can take you to unexpected places. Clean water from any source keeps you hydrated and healthy no matter where you end up.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "When smoke takes out cell towers, satellite is the only communication. Send location updates, receive messages, and trigger SOS if needed.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Shelf-stable meals for the evacuation period and beyond. When you are in a shelter or with family, these meals feed you without burdening your hosts.",
          url: GEAR.mountainHouse.url,
        },
        {
          name: GEAR.gerberStrongarm.name,
          reason:
            "Full-tang fixed blade with a pommel striker. Clear debris, cut through obstacles, and handle the rough tasks that come with wildfire aftermath.",
          url: GEAR.gerberStrongarm.url,
        },
        {
          name: GEAR.solBivvy.name,
          reason:
            "Breathable emergency shelter for when you are displaced. Weighs 8 ounces and fits in your go-bag — sleep anywhere during extended evacuation.",
          url: GEAR.solBivvy.url,
        },
      ],
    },
    {
      id: "wf-barely",
      finalScore: 10,
      rating: "Barely Made It",
      summary:
        "You made it out alive, but the margin was dangerously thin. Heavy smoke exposure, gridlocked evacuation, and near-miss conditions are not scenarios you want to repeat. Every minute you spent not leaving was a minute you spent in increasing danger. The preparation needed is minimal — the impact is everything.",
      didRight: [
        "You left. Many people in wildfires die because they did not leave at all.",
      ],
      couldImprove: [
        "5-minute departure: go-bags packed, documents ready, routes memorized",
        "Never waste time on the house during a Level 3 evacuation",
        "Know 3 routes and take the one nobody else is taking",
        "Gas tank stays full during fire season — period",
        "N95 masks in the car for smoke protection during evacuation",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "This bag eliminates the biggest time-waster in a wildfire evacuation: packing. Pre-packed and ready to grab.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "SOS button that contacts search and rescue via satellite. When you are trapped in smoke with no cell signal, this saves your life.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water filtration for unknown situations. Evacuation can last days and take you to places without clean water access.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.esee4.name,
          reason:
            "Emergency cutting tool for seatbelts, brush, and debris. A fixed blade does not fold under pressure.",
          url: GEAR.esee4.url,
        },
      ],
    },
    {
      id: "wf-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "Wasting time on the house, staying on gridlocked routes, and delayed departure are the exact factors that lead to wildfire fatalities. The Paradise fire in 2018 killed 85 people — many of them were people who left late or took the wrong route. This simulator lets you make these mistakes safely. Real fires do not. Prepare now.",
      didRight: [
        "You completed the simulation — now build the plan that prevents this outcome",
      ],
      couldImprove: [
        "Go-bags packed and by the door during fire season",
        "Leave IMMEDIATELY on Level 3 — do not touch the house",
        "3 evacuation routes known by heart and on paper in the car",
        "Gas tank never below three-quarters during fire season",
        "Important documents in a fire safe AND in cloud storage",
        "N95 masks, eye protection, and water in the car at all times",
      ],
      gearRecommendations: [
        {
          name: GEAR.rush72.name,
          reason:
            "One bag per family member, packed and ready. This is the difference between a 5-minute departure and a fatal delay.",
          url: GEAR.rush72.url,
        },
        {
          name: GEAR.garminInreach.name,
          reason:
            "Satellite SOS when smoke takes out cell towers. This device has saved lives in exactly this scenario.",
          url: GEAR.garminInreach.url,
        },
        {
          name: GEAR.sawyerSqueeze.name,
          reason:
            "Water filtration when you are displaced and do not know where clean water is. Compact, reliable, and weighs nothing.",
          url: GEAR.sawyerSqueeze.url,
        },
        {
          name: GEAR.mountainHouse.name,
          reason:
            "Food for the evacuation period and the days after. When everything you own is gone, at least your family eats.",
          url: GEAR.mountainHouse.url,
        },
      ],
    },
  ],
};

// ─── Export all scenarios ───
// ═══════════════════════════════════════════════════════
// SCENARIO 6: COORDINATED INFRASTRUCTURE ATTACK
// ═══════════════════════════════════════════════════════
const infrastructureAttack: Scenario = {
  id: "infrastructure-attack",
  name: "Coordinated Infrastructure Attack",
  icon: "shield-alert",
  difficulty: "Extreme",
  description:
    "A coordinated attack on critical infrastructure hits your region over six days. Water, fuel, communications, and emergency services go down in sequence. This is not a single event — it is a cascading failure designed to overwhelm. Each day gets worse. How long can you hold?",
  startingNodeId: "ia-1",
  totalNodes: 6,
  nodes: [
    {
      id: "ia-1",
      emoji: "🚰",
      situation:
        "Day 1. You turn on the kitchen faucet and get a brownish trickle. By afternoon, nothing comes out at all. Your neighbor is already on the phone with the water company — busy signal. Local news says municipal pump stations lost power in an apparent cyberattack. There is no timeline for restoration. You have a family of four, two dogs, and whatever water is in your house right now. The grocery store still has bottled water but the lines are growing.",
      choices: [
        {
          text: "Inventory every drop of water in the house, fill bathtubs and every container you own, and start rationing immediately",
          consequence:
            "Good instincts. You find 6 gallons of bottled water, fill both bathtubs (about 80 gallons each), fill every pot, pitcher, and bucket. You set a strict ration: 1 gallon per person per day for drinking and cooking, bathtub water reserved for flushing and hygiene. You also pull the water heater drain — another 40 gallons of clean water most people forget about. You just bought your family 10+ days.",
          scoreImpact: 25,
          nextNodeId: "ia-2a",
        },
        {
          text: "Drive to the store and buy as much bottled water as you can get",
          consequence:
            "You are not the only one with this idea. The store is packed, tempers are short, and there is a two-case limit. You get 4 gallons after waiting 45 minutes. Meanwhile, your bathtubs are sitting empty and your water heater has 40 gallons you never thought about. The store run was not wrong, but it should not have been step one.",
          scoreImpact: 5,
          nextNodeId: "ia-2b",
        },
        {
          text: "This will be fixed in a day or two — use what you have and do not overreact",
          consequence:
            "Maybe. But this is not a water main break. This is a deliberate attack on pump infrastructure. By evening, social media is full of reports that multiple pump stations across the region were hit simultaneously. This is coordinated. And you just burned a full day without filling a single container. The bathtubs are dry, the water heater is still sealed, and your stored water is whatever was in the fridge. You are already behind.",
          scoreImpact: -10,
          nextNodeId: "ia-2b",
        },
      ],
    },
    {
      id: "ia-2a",
      emoji: "⛽",
      situation:
        "Day 3. You wake up to a new problem. Overnight, someone hit a bridge on the main freight corridor and a rail switching station 40 miles south. Diesel is not flowing. Gas stations are running dry. The grocery store got its last delivery yesterday. Your neighbor — a single mom with two kids — knocks on your door. She saw you filling containers on Day 1. She is asking if you can spare some water. Her kids are thirsty.",
      choices: [
        {
          text: "Give her 2 gallons and help her identify water sources she can filter — build the alliance",
          consequence:
            "Two gallons is not going to break your supply, and you just gained something more valuable: a trusted neighbor. You show her how to drain her water heater, and lend her a filter bottle. She has skills too — she is an ER nurse. In a prolonged crisis, that is worth more than 100 gallons. Communities survive. Lone wolves do not.",
          scoreImpact: 20,
          nextNodeId: "ia-3a",
        },
        {
          text: "Tell her you are sorry but you barely have enough for your own family",
          consequence:
            "Not unreasonable. Your first responsibility is your family. But she leaves upset and now she knows you have supplies and you are not sharing. That information spreads fast in a neighborhood under stress. You have not made an enemy, but you have not made an ally either. Two gallons would have been cheap insurance.",
          scoreImpact: 5,
          nextNodeId: "ia-3b",
        },
        {
          text: "Pretend you are not home",
          consequence:
            "She saw your car in the driveway and your lights on last night. She knows you are home. Now she also knows you are the kind of person who hides from a mom with thirsty kids. That reputation travels fast on a block with no internet to distract people. Trust is a survival resource and you just burned yours.",
          scoreImpact: -10,
          nextNodeId: "ia-3b",
        },
      ],
    },
    {
      id: "ia-2b",
      emoji: "⛽",
      situation:
        "Day 3. Bad news stacking on bad news. A bridge on the main freight route was physically sabotaged overnight, and a rail switching station 40 miles south is destroyed. Diesel supply is cut. Gas stations are running out. The grocery store shelves are thinning fast. Your water situation is already tight, and now you are watching the fuel gauge in your car drop toward half a tank.",
      choices: [
        {
          text: "Conserve fuel — do not drive unless it is an emergency. Focus on water: drain the water heater, filter what you can, and lock down food rationing",
          consequence:
            "You are thinking in terms of days now, not hours. Good. You drain 40 gallons from the water heater — clean, drinkable water that most people have no idea is sitting in their house. You set food rationing to stretch what you have. The car stays parked — that half tank might be your evacuation ticket later.",
          scoreImpact: 15,
          nextNodeId: "ia-3b",
        },
        {
          text: "Take the car and drive out of the area while you still have fuel — this is only going to get worse",
          consequence:
            "Not a bad read on the situation, but where are you going? The attacks hit regionally — the next county over has the same problems. You drive 60 miles before you see the same gas lines and empty shelves. You turn around, now with a quarter tank and nothing to show for it. Sometimes the best move is to hold your position.",
          scoreImpact: -5,
          nextNodeId: "ia-3b",
        },
      ],
    },
    {
      id: "ia-3a",
      emoji: "📡",
      situation:
        "Day 4. Cell service is gone. Not spotty — gone. The towers are either down or the backup generators ran out of diesel. AM radio is a mess of conflicting reports and rumors. Your brother is 200 miles away and you have no way to tell him your family is okay. The isolation is getting to people. You hear a domestic argument three houses down that never would have happened with working internet and TV.",
      choices: [
        {
          text: "Break out the ham radio or GMRS radios and reach out on local frequencies to build an information network",
          consequence:
            "If you have a Baofeng or GMRS radio, this is its moment. You scan local frequencies and find a ham operator 8 miles away who has been aggregating real information: the attacks are regional, not national. FEMA is staging but 3-5 days out. National Guard is mobilizing. Just knowing that help is coming changes your mental state entirely. Information is oxygen in a crisis.",
          scoreImpact: 25,
          nextNodeId: "ia-4a",
        },
        {
          text: "Walk the neighborhood and check on people — face-to-face communication and information sharing",
          consequence:
            "Old school and effective. You knock on doors and share what you know. The retired guy two blocks over has a weather radio picking up NOAA alerts. The family on the corner has a generator and is charging phones for anyone who needs it. You organize a nightly meeting at the end of the cul-de-sac to share information. No radio, but you built a network anyway.",
          scoreImpact: 15,
          nextNodeId: "ia-4a",
        },
        {
          text: "Stay home and conserve energy — going out is a risk now",
          consequence:
            "The logic is not wrong — conserving resources matters. But information deprivation in a crisis leads to bad decisions. Without knowing what is happening, your mind fills in the worst case. By Day 5, you are making choices based on fear instead of facts. Your neighbor with the radio knows help is 3 days out. You do not. That gap in knowledge will cost you.",
          scoreImpact: 0,
          nextNodeId: "ia-4b",
        },
      ],
    },
    {
      id: "ia-3b",
      emoji: "📡",
      situation:
        "Day 4. You pick up your phone out of habit and it hits you — no signal at all. Not one bar. Not searching. Dead. Cell towers are either destroyed or out of fuel. AM radio is a mess of panicked callers and conflicting reports. Your parents are 150 miles away and have no idea if you are alive. The neighborhood feels like an island.",
      choices: [
        {
          text: "Try to find anyone with a ham radio, CB, or GMRS radio — information is survival",
          consequence:
            "Smart priority. You walk the block asking if anyone has a radio. Three houses down, a guy has a CB that reaches about 10 miles. A trucker 8 miles out confirms the attacks are regional, National Guard is mobilizing, and FEMA is staging. Knowing that help exists — even if it is days away — changes everything.",
          scoreImpact: 15,
          nextNodeId: "ia-4b",
        },
        {
          text: "Hunker down and wait — someone will come eventually",
          consequence:
            "Eventually is doing a lot of heavy lifting in that sentence. Day 4 turns into Day 5 with zero new information. You do not know if help is coming in hours or weeks. That uncertainty eats at your morale and your decision-making. When you finally hear from a neighbor that the National Guard is 48 hours out, you have already spent two days making fear-based choices.",
          scoreImpact: -5,
          nextNodeId: "ia-4b",
        },
      ],
    },
    {
      id: "ia-4a",
      emoji: "🔥",
      situation:
        "Day 5. 2 AM. You smell smoke. Through the window, you can see flames in the industrial park half a mile away. Then another fire starts at the strip mall. This is arson — coordinated, deliberate. You dial 911 — busy signal. You are your own first responder now. The fires are not heading your way yet, but the wind could shift.",
      choices: [
        {
          text: "Organize 4-hour security watch rotations with neighbors, set up a fire watch, and prepare evacuation kits in case the wind shifts",
          consequence:
            "This is leadership when it matters. You split the block into 2-person watch teams, 4 hours on, 8 hours off. One watches the fire line, one watches the street. Everyone has a walkie-talkie or whistle. You designate a rally point if evacuation becomes necessary. Cars are backed in, go-bags are by the door. You are not reacting anymore. You are managing a security operation.",
          scoreImpact: 25,
          nextNodeId: "ia-5a",
        },
        {
          text: "Load the car and evacuate right now — fires mean it is time to go",
          consequence:
            "The instinct to run from fire is natural. But where? The roads are dark, gas stations are dry, and you do not know what is burning or where. You drive 10 miles in the dark and find another neighborhood in the same situation. The fires were contained to the industrial area. You left a prepared position for an unknown one. Sometimes holding is harder than running, but it is the right call.",
          scoreImpact: -5,
          nextNodeId: "ia-5b",
        },
      ],
    },
    {
      id: "ia-4b",
      emoji: "🔥",
      situation:
        "Day 5. The smell of smoke wakes you at 3 AM. Two fires are burning — one at the industrial park, one at a warehouse complex. The glow is visible from your windows. You hear a single fire truck siren, then nothing. 911 is a busy signal. The fires are not close enough to threaten your house yet, but you have no way to know if they will spread. The wind is picking up.",
      choices: [
        {
          text: "Stay alert but stay put — monitor the fires from your roof and prepare to leave if they get closer",
          consequence:
            "Level-headed. You post up on the second floor with binoculars and a radio. The fires are burning hot but not spreading toward residential areas — the wind is pushing them east into empty lots. You stay dressed with shoes on and the car loaded just in case. By dawn, the fires are burning themselves out. You held your nerve when panic would have burned fuel and exposed your family to dark roads.",
          scoreImpact: 10,
          nextNodeId: "ia-5b",
        },
        {
          text: "Pack the car and drive away from the fires — anywhere is better than here",
          consequence:
            "You are driving blind on dark roads with no cell service and almost no fuel. You pass two other fires on the way out. You end up parked in a school parking lot 15 miles away, scared, tired, and with an eighth of a tank. The fires near your house burned out by morning. You left a defensible position, burned critical fuel, and spent the night in a car. Fear made the decision for you.",
          scoreImpact: -10,
          nextNodeId: "ia-5b",
        },
      ],
    },
    {
      id: "ia-5a",
      emoji: "🦠",
      situation:
        "Day 6. Six days without running water. The toilet stopped being an option on Day 3. People are using storm drains and backyards. The smell is getting bad. A kid on the next block has diarrhea and a fever — probably waterborne. Your stored water is holding but it will not last forever. This is the quiet killer no one talks about in prepping.",
      choices: [
        {
          text: "Set up a designated sanitation area, establish waste protocols for the block, and break out water treatment supplies",
          consequence:
            "This is the unsexy side of survival that saves lives. You designate a spot downwind and downhill from living areas for waste. You distribute trash bags for toilet liners and set up a lime or cat litter station. You teach neighbors how to use water treatment drops. The nurse neighbor confirms that controlling sanitation is the single most important thing you can do right now. Disease kills more people than violence in grid-down scenarios.",
          scoreImpact: 25,
          nextNodeId: "end",
        },
        {
          text: "Focus on your own family's hygiene — you cannot manage the whole block",
          consequence:
            "Your family stays healthy with hand sanitizer, treated water, and a bucket toilet with bags. But the neighborhood sanitation situation is a time bomb. Flies are breeding in exposed waste. Two more people are sick by evening. Disease does not respect property lines. Your clean house sits in the middle of a public health crisis. Individual hygiene matters, but community sanitation is what prevents an outbreak.",
          scoreImpact: 5,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "ia-5b",
      emoji: "🦠",
      situation:
        "Day 6. No running water for almost a week. The sanitation situation is deteriorating fast. People are relieving themselves wherever they can. Three people on your block are sick — vomiting, diarrhea, fever. Classic waterborne illness. Flies are everywhere. Your water supply is getting low. This is how epidemics start.",
      choices: [
        {
          text: "Boil or chemically treat every drop of water, set up a waste containment area, and help sick neighbors stay hydrated",
          consequence:
            "Better late than never. You set up a rolling boil station using your camp stove — any water that touches your lips has been at a rolling boil for at least one minute. You dig a latrine trench in the backyard, away from any water collection points. You bring treated water to the sick neighbors — dehydration from diarrhea kills faster than most people realize. It is grim, unglamorous work. But this is real survival.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Seal up the house and avoid contact with anyone who is sick",
          consequence:
            "Isolation has limits when you share a water table and a storm drain system with 30 other houses. You stay healthy for another day, but the contamination is spreading through groundwater and flies. By Day 7, someone in your family has symptoms. You do not have oral rehydration salts, you do not have enough clean water, and the nearest hospital has no power. Sanitation infrastructure is invisible until it fails, and when it fails, it becomes the primary threat.",
          scoreImpact: -5,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "ia-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "Six days of cascading infrastructure failure and you held it together. Water stockpiled before the panic, community built when it mattered, communications maintained through radios, security organized against the arson threat, and sanitation managed before disease could spread. You did not just survive this — you kept your block alive.",
      didRight: [
        "Secured water immediately — bathtubs, water heater, rationing from Day 1",
        "Built neighborhood alliances instead of going it alone",
        "Maintained communication through radio when cell networks died",
        "Organized security watches during the arson phase",
        "Addressed sanitation before disease spread",
      ],
      couldImprove: [
        "Pre-staged water storage containers would have made Day 1 easier",
        "A ham radio license and equipment should be in place before an event",
        "Motion sensors and perimeter alerts reduce the human cost of 24-hour watches",
      ],
      gearRecommendations: [
        { name: GEAR.reliance5gal.name, reason: "Stackable, durable, 7 gallons of clean water. Four of these gives a family a week of drinking water without touching the bathtub supply.", url: GEAR.reliance5gal.url },
        { name: GEAR.baofengUV5R.name, reason: "When cell towers die, this is your connection to the outside world. Dual-band, programmable, and under $30. Get your ham license before you need it.", url: GEAR.baofengUV5R.url },
        { name: GEAR.dakotaAlert.name, reason: "Wireless motion sensors on your perimeter mean you sleep while technology watches. MURS frequency, half-mile range, no subscription.", url: GEAR.dakotaAlert.url },
        { name: GEAR.aquamiraDrops.name, reason: "Two-part chemical water treatment that kills what filters miss — viruses, bacteria, protozoa. Treats 60 gallons with a 5-year shelf life.", url: GEAR.aquamiraDrops.url },
        { name: GEAR.ecoflowDelta3.name, reason: "Power for radios, medical devices, lights, and communication gear. Solar recharge keeps it running indefinitely.", url: GEAR.ecoflowDelta3.url },
      ],
    },
    {
      id: "ia-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You made it through six days of infrastructure collapse. Some decisions were solid, some cost you. The water situation got tight, communication was spotty, and the arson night was rough. But your family is alive and you learned what matters: water storage, community, radios, and sanitation.",
      didRight: [
        "Recognized the severity of the situation before it was too late",
        "Made efforts to connect with neighbors and share information",
        "Kept your family safe through the worst nights",
      ],
      couldImprove: [
        "Water storage should be in place before an event — bathtubs are a backup, not a plan",
        "A GMRS or ham radio eliminates the communication blackout entirely",
        "Security is a community job — organize watch rotations before threats arrive",
        "Sanitation planning is not optional — disease kills more than violence in grid-down events",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Filters 100,000 gallons from any freshwater source. When the taps stop, this turns creek water, rainwater, and pool water into drinking water.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.midlandGXT1000.name, reason: "GMRS radios with 36-mile range. No license hassle, rechargeable, and they work when everything else is dead.", url: GEAR.midlandGXT1000.url },
        { name: GEAR.reliance5gal.name, reason: "Pre-filled water storage ready before the crisis hits. Stack four in the garage and your family has drinking water for a week.", url: GEAR.reliance5gal.url },
        { name: GEAR.mountainHouse.name, reason: "14 days of food that requires only boiled water. When supply chains collapse, this keeps your family fed.", url: GEAR.mountainHouse.url },
        { name: GEAR.renogy200w.name, reason: "Solar panel that recharges your power station indefinitely. When diesel stops flowing, solar is the only power source that does not run out.", url: GEAR.renogy200w.url },
      ],
    },
    {
      id: "ia-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Six days of chaos and you scraped through by the skin of your teeth. Water ran low, you were flying blind without communications, the arson night nearly broke you, and the sanitation situation put your family at risk. You made it, but barely. Every gap in your preparation was a gap that almost killed you.",
      didRight: [
        "You kept going when things got dark — mental toughness counts",
        "You recognized mistakes and adapted, even if it was late",
      ],
      couldImprove: [
        "Water storage and filtration are the foundation — you had neither ready",
        "Community relationships need to be built before the crisis, not during it",
        "A radio is not a luxury — it is a survival tool",
        "Sanitation is the number one killer in grid-down scenarios — plan for it",
        "Do not burn fuel on panic drives — assess, then act",
      ],
      gearRecommendations: [
        { name: GEAR.reliance5gal.name, reason: "Start here. Fill four and store them in the garage. That is 28 gallons of clean water ready before anything happens.", url: GEAR.reliance5gal.url },
        { name: GEAR.aquamiraDrops.name, reason: "Chemical water treatment that kills pathogens filters can miss. Weighs 3 ounces and treats 60 gallons.", url: GEAR.aquamiraDrops.url },
        { name: GEAR.baofengUV5R.name, reason: "A $25 radio that connects you to the world when cell towers die. Get the radio, get the license, learn the local repeater frequencies.", url: GEAR.baofengUV5R.url },
        { name: GEAR.luciLight.name, reason: "Solar-charged inflatable lantern. No batteries, no fuel, no noise. Charge it in a window during the day, light your room at night.", url: GEAR.luciLight.url },
        { name: GEAR.katadynBeFree.name, reason: "Fast-flow water filter you can drink from directly. Pair it with chemical treatment drops for a two-stage system.", url: GEAR.katadynBeFree.url },
      ],
    },
    {
      id: "ia-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "This went bad early and never recovered. No water stored, no community built, no communications, no security plan, and sanitation turned into a health crisis. In a simulation, you get to try again. In real life, every single failure point here is fixable right now, today, before it matters.",
      didRight: [
        "You ran the simulation — that puts you ahead of 95% of people who never think about this",
      ],
      couldImprove: [
        "Store water NOW — 1 gallon per person per day, minimum 2 weeks",
        "Get a water filter AND chemical treatment drops — two-stage purification",
        "Buy a radio and learn to use it before cell towers are the only thing you rely on",
        "Meet your neighbors — in a real crisis, the block survives together or not at all",
        "Sanitation planning: bucket toilet, trash bags, lime, hand sanitizer — unsexy but life-saving",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Step one. This $30 filter turns any freshwater source into drinking water. 100,000 gallon capacity. Put it in your kit today.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Step two. Buy four, fill them, store them. That is 28 gallons of clean water ready before anything happens.", url: GEAR.reliance5gal.url },
        { name: GEAR.midlandT77.name, reason: "GMRS radio that works when cell towers do not. Rechargeable, weather alerts built in.", url: GEAR.midlandT77.url },
        { name: GEAR.readyWise.name, reason: "Emergency food supply that lasts 25 years on the shelf. When grocery stores are empty, this stands between your family and hunger.", url: GEAR.readyWise.url },
        { name: GEAR.jackery1000.name, reason: "Portable power for radios, lights, medical devices, and phone charging. Pair with a solar panel for indefinite power.", url: GEAR.jackery1000.url },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 7: EMP STRIKE
// ═══════════════════════════════════════════════════════
const empStrike: Scenario = {
  id: "emp-strike",
  name: "EMP Strike",
  icon: "radio-tower",
  difficulty: "Extreme",
  description:
    "A high-altitude electromagnetic pulse detonates 250 miles above Kansas. In one second, the electrical grid, every unshielded computer chip, every modern vehicle's ECU, and the entire communications infrastructure across the continental US goes dark. No phones. No internet. No cars built after 2000. No recovery timeline. Welcome to year zero.",
  startingNodeId: "emp-1",
  totalNodes: 6,
  nodes: [
    {
      id: "emp-1",
      emoji: "⚡",
      situation:
        "3:14 PM on a Thursday. A bright flash in the sky — not lightning, something different. Your phone is dead. Not out of battery — dead. The microwave clock is blank. Your car will not start. The neighbor's car will not start. Nothing with a circuit board works. The only sound is dogs barking and people stepping outside looking confused. You have about 6 hours of daylight left. Nobody knows what happened yet, but you have read enough to have a guess.",
      choices: [
        {
          text: "Immediately secure water, pull out your analog gear, and start filling every container in the house before the water pressure dies",
          consequence:
            "You are thinking clearly while everyone else is still tapping dead phone screens. Municipal water pumps run on electricity — when the backup generators run dry in 12-24 hours, the taps stop. You fill bathtubs, pots, coolers, and the kids' inflatable pool. You pull out the hand-crank radio, the manual can opener, and the water filter you bought three years ago. While neighbors are trying to restart their cars, you are buying your family survival time.",
          scoreImpact: 25,
          nextNodeId: "emp-2a",
        },
        {
          text: "Walk to the neighbor's house to compare notes and figure out what happened",
          consequence:
            "Community information is valuable, but the clock is ticking on resources you cannot get back. You spend two hours knocking on doors and discussing theories. By the time you think about water, the pressure is already dropping in some areas. You get some containers filled but miss the window for bulk storage. You know more about what happened, but you acted on the wrong priority first.",
          scoreImpact: 5,
          nextNodeId: "emp-2b",
        },
        {
          text: "Try to get your car started — maybe it just needs a jump or a reset",
          consequence:
            "You spend the rest of the daylight trying to troubleshoot a vehicle whose entire electrical system was fried by electromagnetic energy traveling at the speed of light. The battery is fine. The engine is fine. Every computer chip that controls fuel injection, ignition timing, and transmission is permanently destroyed. Modern cars are rolling computers, and computers do not survive EMPs. You just wasted your most valuable resource — the first hours — on a dead machine.",
          scoreImpact: -10,
          nextNodeId: "emp-2b",
        },
      ],
    },
    {
      id: "emp-2a",
      emoji: "📻",
      situation:
        "Day 2. Your hand-crank radio picks up a faint AM broadcast from a station running on a backup generator 60 miles away. The news is devastating: electromagnetic pulse, likely a high-altitude nuclear detonation. The entire grid east of the Rockies is down. No timeline for restoration — the transformers that step down high-voltage transmission lines are custom-built overseas and take 18-24 months to manufacture. This is not a week-long event. This could be months. Maybe longer. Your neighbor has a 1987 Ford F-150 that actually starts — no computer chips to fry. He is talking about driving to his family 300 miles away. He offers you a ride.",
      choices: [
        {
          text: "Stay put. You have water, supplies, and your home is your best asset. Offer to help organize the block instead.",
          consequence:
            "Correct call. In a long-duration event, mobility is less important than established shelter, stored resources, and community. Your house has insulation, storage, tools, and defensive advantages a truck cab does not. You let the neighbor go and start organizing: the retired guy on the corner has a woodstove, the teacher three doors down has a huge garden, and you just became the block's planning hub. Shelter in place is almost always the right call unless staying will kill you.",
          scoreImpact: 25,
          nextNodeId: "emp-3a",
        },
        {
          text: "Go with him — 300 miles to family and a rural area with well water is better than suburbia",
          consequence:
            "Rural well water and family support are real advantages. But 300 miles in a post-EMP landscape is not a Sunday drive. Gas stations are dead — you need fuel cans. Roads will have stalled vehicles everywhere. And you are leaving behind everything you prepared at home. You make it after two days of slow driving and siphoning gas from dead cars, but you arrive with nothing but what you could carry. Starting over is expensive even when the world is working.",
          scoreImpact: 5,
          nextNodeId: "emp-3b",
        },
      ],
    },
    {
      id: "emp-2b",
      emoji: "💧",
      situation:
        "Day 2. Reality is setting in hard. The water pressure died overnight. Your phone is a brick. No TV, no internet, no way to know what happened or how long it will last. A neighbor with an old transistor radio picks up a faint broadcast: EMP event, entire eastern grid destroyed, no restoration timeline. People are starting to get scared. The family across the street has a diabetic teenager whose insulin needs refrigeration — it has been at room temperature for 24 hours. Three houses down, an elderly couple has not come outside since yesterday.",
      choices: [
        {
          text: "Check on the elderly couple, then organize a neighborhood meeting to pool information and resources",
          consequence:
            "The elderly couple is okay but frightened and confused. The husband is on oxygen — the concentrator is dead. You help them move to the neighbor's house where there is a woodstove for warmth. At the neighborhood meeting, you discover useful skills: a nurse, a mechanic who knows pre-computer engines, a woman with a huge pantry. The diabetic teen's insulin is still viable for about 28 days at room temperature — not ideal but not a death sentence yet. Organizing now saves lives later.",
          scoreImpact: 15,
          nextNodeId: "emp-3b",
        },
        {
          text: "Focus on your own family — you did not prepare enough to help everyone else",
          consequence:
            "Understandable instinct, but in a months-long event, you cannot survive alone. The family with the garden is not going to share tomatoes with the neighbor who would not share water. The mechanic is not going to fix that pre-computer truck for someone who shut their door. Survival is a community sport, especially when the timeline stretches past two weeks. You are fed for now but isolated, and isolation has a cost that compounds daily.",
          scoreImpact: 0,
          nextNodeId: "emp-3b",
        },
      ],
    },
    {
      id: "emp-3a",
      emoji: "🏘️",
      situation:
        "Day 5. You have organized the block into a functioning unit. Water is being collected from a creek a quarter mile away and filtered. The woodstove house is the warming and cooking station. People are eating through their freezers first — all that meat is thawing and needs to be cooked or smoked now or it is wasted. But the real problem is arriving on foot: refugees from the city 20 miles east. Hungry, thirsty, some desperate. A group of eight adults just walked into your neighborhood asking for water. They look rough. Behind them, you can see more people on the road.",
      choices: [
        {
          text: "Offer water and a meal, but be honest about your limits. Ask what skills they bring and whether they want to contribute to the community.",
          consequence:
            "Compassion with boundaries. You give them water and a hot meal from the thawing freezer supply. Two of them are useful — a paramedic and a guy who ran a machine shop. The others are office workers who have never built anything, but they are willing to learn and work. You set ground rules: everyone contributes, everyone rations equally, security watches are shared. You just grew your community's capability. The paramedic alone is worth fifty cans of beans.",
          scoreImpact: 20,
          nextNodeId: "emp-4a",
        },
        {
          text: "Set up a perimeter checkpoint — control who comes in and who does not. No free rides.",
          consequence:
            "Security matters and you are not wrong to control access. But a hard perimeter this early creates an us-vs-them dynamic. The group moves on, including the paramedic and the machinist you never knew about. Word spreads on the walking trails that your block is hostile. Future travelers with valuable skills bypass you entirely. Security is essential, but it needs to be paired with a gate, not just a wall.",
          scoreImpact: 10,
          nextNodeId: "emp-4b",
        },
      ],
    },
    {
      id: "emp-3b",
      emoji: "🚶",
      situation:
        "Day 7. One week without electricity, vehicles, phones, or running water. The grocery stores were cleaned out by Day 3. Walking refugees from the nearest city are passing through — some asking for help, some not asking. Your food supply is getting thin. You hear gunshots at night now, maybe a mile away. The veneer of civilization is peeling back faster than anyone expected. A neighbor suggests raiding an abandoned big box store two miles away for supplies.",
      choices: [
        {
          text: "Organize a scavenging team with a plan — go in numbers, take only essentials, and fortify your position for the long haul",
          consequence:
            "Scavenging is not looting when the supply chain is dead and the store's inventory will rot on the shelves. You go with four neighbors, armed with tools and a plan. You prioritize: canned goods, water containers, first aid supplies, hand tools, seeds, and propane. You leave luxury items alone. You haul back enough to extend your neighborhood's food supply by two weeks. The trip teaches your group to move as a team, communicate, and watch each other's backs. Those skills matter more than the beans.",
          scoreImpact: 15,
          nextNodeId: "emp-4b",
        },
        {
          text: "Stay home and ration harder. Going out there right now is too dangerous.",
          consequence:
            "Caution is not cowardice, but resources do not appear from thin air. Your current food supply lasts maybe 5 more days with strict rationing. After that, you are making the same trip but weaker, hungrier, and with fewer supplies left on the shelves. Sometimes the safer choice in the short term is the more dangerous one in the long term. Timing matters — and waiting too long is a decision too.",
          scoreImpact: 0,
          nextNodeId: "emp-4b",
        },
      ],
    },
    {
      id: "emp-4a",
      emoji: "🌱",
      situation:
        "Day 14. Two weeks post-EMP. Your community has stabilized: water filtration running, firewood rotation organized, security watches set, and the paramedic has treated three injuries and one infection. But the long game is staring you in the face. Stored food is finite. You need to start producing calories. The teacher's garden has seedlings. The machinist thinks he can rig a hand pump for the abandoned well on the vacant lot. The question is not whether to start — it is what to prioritize.",
      choices: [
        {
          text: "Water infrastructure first — get that well hand-pump operational. Food grows slow but dehydration kills fast.",
          consequence:
            "The right priority. The machinist fabricates a hand pump from pipe fittings and a check valve scavenged from a hardware store. It takes three days of work and a lot of trial and error, but on Day 17 you have a hand-pumped well producing 5 gallons per minute of clean groundwater. Your community just became water-independent. The garden goes in simultaneously — the teacher has seeds for fast-growing crops: radishes in 25 days, lettuce in 30, beans in 60. You are building something that lasts.",
          scoreImpact: 20,
          nextNodeId: "end",
        },
        {
          text: "Food production is the bottleneck. Get every square foot of soil planted NOW — water can be hauled from the creek.",
          consequence:
            "Planting is essential and you are not wrong about the urgency. But hauling water from a creek a quarter mile away burns calories you cannot afford to spend, and creek water needs filtering every single time. Within a week, the water hauling is exhausting your people and cutting into the labor available for everything else. The garden is growing but the community is burning out. You eventually get the well pump built, but the delay cost you three weeks of easier water access. Sequence matters.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "emp-4b",
      emoji: "🔥",
      situation:
        "Day 14. Two weeks in and the reality of long-term survival is hitting hard. Food is running low across the neighborhood. The nightly gunshots are closer now. Two houses on the next block were broken into last night. Your group — however large or small it is — needs to make a decision about the future. Stay and build, or pack what you can carry and walk toward the rural areas where food might be growing and population density is lower.",
      choices: [
        {
          text: "Stay and build. Fortify your position, start growing food, and make this block your long-term base.",
          consequence:
            "Bugging out on foot with your family into an uncertain landscape is almost always worse than defending a known position with shelter, tools, and community. You organize a garden using seeds from the hardware store scavenging run. You set up rain catchment. Security watches get tighter. It is hard, it is scary, and some nights are long. But by Day 30, you have food growing, water systems working, and a community that has each other's backs. This is what rebuilding looks like.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Bug out toward rural farmland — cities and suburbs will eat themselves alive. Time to move.",
          consequence:
            "Walking 50+ miles with limited food and water, through territory where desperate people are also walking, carrying everything you own on your back — this is not a hiking trip. You make it 30 miles in three days before exhaustion forces a stop. You find a small town that is already suspicious of outsiders. They let you stay but you are starting from zero: no shelter, no stored food, no garden, no community trust. You traded a bad situation for a different bad situation, except now you are exhausted and have nothing.",
          scoreImpact: -5,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "emp-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "An EMP that sent most of the country back to the 1800s and you built a functioning community in two weeks. Water secured before the taps died, analog gear ready to go, community organized, refugees integrated with boundaries, and long-term food and water infrastructure started. You did not just survive the EMP — you became the foundation of what comes next.",
      didRight: [
        "Secured water immediately — understood that pumps need electricity",
        "Had analog gear ready: hand-crank radio, manual tools, water filter",
        "Chose shelter-in-place over panic mobility",
        "Built community instead of building walls",
        "Prioritized long-term infrastructure: well pump, gardens, security",
      ],
      couldImprove: [
        "A Faraday bag for critical electronics would have preserved radios and a spare phone for stored information",
        "Pre-positioned seeds and gardening tools for exactly this scenario",
        "A pre-computer vehicle (pre-1980) would have given your community critical mobility",
      ],
      gearRecommendations: [
        { name: GEAR.faradayBag.name, reason: "Store your ham radio, a spare phone loaded with survival guides, and a solar charger inside this. If an EMP hits, you pull out working electronics while everyone else has bricks.", url: GEAR.faradayBag.url },
        { name: GEAR.baofengUV5R.name, reason: "Stored inside a Faraday bag, this radio becomes your only link to the outside world post-EMP. Ham operators will be the new internet. Get licensed now.", url: GEAR.baofengUV5R.url },
        { name: GEAR.sawyerSqueeze.name, reason: "When municipal water dies permanently, this filter turns any freshwater source into drinking water. 100,000 gallon capacity. No electricity required.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.kellyKettle.name, reason: "Boils water using nothing but twigs and small sticks. No fuel canisters, no electricity, no moving parts. Works when everything else is dead.", url: GEAR.kellyKettle.url },
        { name: GEAR.mountainHouse.name, reason: "25-year shelf life freeze-dried food bridges the gap between Day 1 and when your garden starts producing. Just add boiled water.", url: GEAR.mountainHouse.url },
      ],
    },
    {
      id: "emp-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You made it through the first two weeks of a civilization-ending event. Some solid decisions mixed with some costly delays. The water scramble was tighter than it needed to be and community building started later than ideal, but your family is alive, fed, and part of a group. The hard part is not over — it is just beginning. But you are still standing.",
      didRight: [
        "Eventually recognized the severity and adapted",
        "Made community connections even if they came late",
        "Kept your family together and functional through extreme stress",
      ],
      couldImprove: [
        "Water storage and filtration need to be in place before an event — the window after an EMP is hours, not days",
        "Analog backups for everything: hand-crank radio, manual tools, paper maps, physical books",
        "A Faraday bag with protected electronics is cheap insurance for exactly this scenario",
        "Community relationships built before a crisis are ten times more effective than ones built during it",
      ],
      gearRecommendations: [
        { name: GEAR.reliance5gal.name, reason: "Pre-filled water storage. Four containers gives your family a week of drinking water with zero effort when the taps die.", url: GEAR.reliance5gal.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Long-term water independence. Filters creek water, rain water, pond water. No electricity, no pumps, no moving parts.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.faradayBag.name, reason: "A $30 bag that protects your radio, phone, and solar charger from electromagnetic pulse. The cheapest insurance you will ever buy.", url: GEAR.faradayBag.url },
        { name: GEAR.readyWise.name, reason: "Emergency food supply with a 25-year shelf life. When supply chains die permanently, this is your bridge to self-sufficiency.", url: GEAR.readyWise.url },
        { name: GEAR.renogy200w.name, reason: "If your solar panel and charge controller survive inside a Faraday cage, you have the only reliable power source left on the continent.", url: GEAR.renogy200w.url },
      ],
    },
    {
      id: "emp-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Two weeks into a permanent grid-down event and you are running on fumes. Late to secure water, slow to build community, and the food situation is dire. You survived the initial shock but the next two weeks will be harder than the first two. The good news: you are alive and you learned more in 14 days than most people learn in a lifetime. Use that.",
      didRight: [
        "You did not quit — mental toughness is real survival currency",
        "You eventually took action instead of waiting for a rescue that is not coming",
      ],
      couldImprove: [
        "The first 6 hours after an EMP are the most valuable hours of your life — do not waste them on dead electronics",
        "Water, water, water. Fill everything before the pressure dies. Then get a filter for what comes after.",
        "Community is not optional in a long-duration event. Lone wolves die tired.",
        "Analog gear: hand tools, manual can openers, crank radios, paper maps, physical reference books",
        "Stored food is the difference between rational decisions and desperate ones",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Your most critical purchase. When taps die forever, this turns any freshwater into drinking water. 100,000 gallons. Three ounces. No excuse.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.augason30day.name, reason: "30-day food supply for one person. In a permanent grid-down, this is the bridge between panic and planning. Buy it, store it, forget it until you need it.", url: GEAR.augason30day.url },
        { name: GEAR.faradayBag.name, reason: "Put a radio, a phone loaded with survival PDFs, and a small solar charger in this bag. If an EMP ever hits, you will be one of the only people with working electronics.", url: GEAR.faradayBag.url },
        { name: GEAR.aquamiraDrops.name, reason: "Chemical water treatment that kills what filters might miss. Lightweight, long shelf life, treats 60 gallons.", url: GEAR.aquamiraDrops.url },
        { name: GEAR.kellyKettle.name, reason: "Boil water with twigs. No gas, no electricity, no fuel canisters. When infrastructure is gone permanently, simplicity wins.", url: GEAR.kellyKettle.url },
      ],
    },
    {
      id: "emp-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "An EMP is the hardest scenario in this simulator for a reason — it removes everything modern life depends on in one second. You spent critical hours on dead technology, missed the water window, and isolation left you vulnerable when the social fabric tore. In a simulation, you restart. In reality, the preparations you make today are the only ones that count.",
      didRight: [
        "You ran the hardest scenario in the simulator — that curiosity is the first step toward real preparation",
      ],
      couldImprove: [
        "Accept that modern vehicles and electronics are dead — do not waste hours on them",
        "Water is the first priority. Always. Fill everything within the first hour.",
        "Get a hand-crank radio and a water filter. These two items change everything.",
        "Store food: 30 days minimum. When grocery stores are permanently closed, there is no backup plan.",
        "Build community NOW. Meet your neighbors. Know who has skills. An EMP is not survivable alone.",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Start here. A $30 water filter that works without electricity. When the taps die forever, this keeps you alive.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.mountainHouse.name, reason: "14 days of food. Just add hot water. When the grocery stores are permanently empty, this is the difference between eating and starving.", url: GEAR.mountainHouse.url },
        { name: GEAR.faradayBag.name, reason: "Store a radio and solar charger in this before an EMP hits. After the flash, you will have working electronics when no one else does.", url: GEAR.faradayBag.url },
        { name: GEAR.reliance5gal.name, reason: "Fill four of these and put them in your garage. That is 28 gallons of water ready before anything happens.", url: GEAR.reliance5gal.url },
        { name: GEAR.baofengUV5R.name, reason: "A ham radio stored in a Faraday bag is your only connection to the outside world after an EMP. Get the radio, get the license, learn the frequencies.", url: GEAR.baofengUV5R.url },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 8: ECONOMIC COLLAPSE
// ═══════════════════════════════════════════════════════
const economicCollapse: Scenario = {
  id: "economic-collapse",
  name: "Economic Collapse",
  icon: "trending-down",
  difficulty: "Hard",
  description:
    "Monday morning. Your bank app shows an error. Then the news breaks: a cascading failure in the banking system has triggered a federal bank holiday. ATMs are offline. Credit cards are declined everywhere. Cash is king — and you have whatever is in your wallet. This is not 2008. This is Argentina 2001. This is Lebanon 2020. And it is happening here.",
  startingNodeId: "ec-1",
  totalNodes: 5,
  nodes: [
    {
      id: "ec-1",
      emoji: "🏦",
      situation:
        "The bank holiday was supposed to last 48 hours. It is now Day 3 and the government just extended it indefinitely. ATMs are dark. Credit card terminals show 'NETWORK ERROR.' Your mortgage auto-pay bounced. You have $127 in cash in your wallet and whatever is in the junk drawer. The gas station on the corner just switched to cash-only and jacked prices 40%. The grocery store has a line around the block.",
      choices: [
        {
          text: "Use your cash strategically — buy shelf-stable food and fuel NOW before prices go higher. Pay with small bills only.",
          consequence:
            "Smart money management under pressure. You hit the grocery store first and buy rice, beans, canned goods, and peanut butter — calorie-dense, shelf-stable, and still at semi-normal prices. You fill the car's tank and your two gas cans. You pay with small bills and keep your twenties hidden — making change becomes a problem when registers are down. Within 48 hours, prices will triple and cash-only stores will start refusing bills they cannot break. You just bought at the bottom.",
          scoreImpact: 25,
          nextNodeId: "ec-2a",
        },
        {
          text: "Sit tight — this happened in 2008 and everything was fine after a few days",
          consequence:
            "In 2008, ATMs still worked. Credit cards still processed. Banks reopened in days. This is different — the settlement system itself is broken. By the time you realize this is not 2008, the stores are stripped. The cash in your wallet buys half what it did two days ago because prices are climbing by the hour. Normalcy bias — the belief that things will return to normal because they always have — is the most expensive cognitive error in a crisis.",
          scoreImpact: -5,
          nextNodeId: "ec-2b",
        },
        {
          text: "Pull cash from every hiding spot — couch cushions, car console, piggy bank — and take a full inventory of every supply in the house",
          consequence:
            "Inventory first is a solid move. You find $83 more in scattered cash, bringing your total to $210. More importantly, you catalog what you actually have: 10 days of normal food, cleaning supplies, a full medicine cabinet, half a tank of gas, and a bunch of stuff in the garage that might become barter currency. Knowledge of your assets is the foundation of every decision that follows. Now you can spend smart instead of spending scared.",
          scoreImpact: 15,
          nextNodeId: "ec-2a",
        },
      ],
    },
    {
      id: "ec-2a",
      emoji: "💸",
      situation:
        "Week 2. Prices are unrecognizable. A gallon of milk is $14. Gas hit $12 a gallon and some stations have stopped selling entirely. Your employer sent an email — from a personal account, since corporate systems are down — saying payroll is frozen until the banks reopen. No paycheck this Friday. Your landlord calls and says rent is still due. The pharmacy says your kid's inhaler refill is $380 cash and they cannot process insurance. Barter is starting to happen in your neighborhood — eggs for labor, gas for firewood.",
      choices: [
        {
          text: "Start bartering with what you have. Trade surplus supplies for things you need. Build a reputation as someone who deals fair.",
          consequence:
            "You trade two bottles of laundry detergent for a dozen eggs. A spare phone charger cable for three cans of soup (the neighbor has a generator). A bottle of bourbon you never opened for a full tank of gas from a guy who works at the refinery. Fair trades build trust, and trust becomes the new currency. Within days, people are coming to you first because you do not gouge. That reputation is worth more than cash right now.",
          scoreImpact: 20,
          nextNodeId: "ec-3a",
        },
        {
          text: "Hoard everything. Do not trade, do not share. Ride it out on what you have.",
          consequence:
            "Your supplies last longer, but you are burning through food with no way to replenish it. The neighbor who offered eggs for labor stops knocking. The guy with the generator stops sharing power. You are fed for now, but you are building a wall around yourself when you need a network. In an economic collapse, relationships are more valuable than inventory. You cannot eat a stockpile forever.",
          scoreImpact: 5,
          nextNodeId: "ec-3b",
        },
      ],
    },
    {
      id: "ec-2b",
      emoji: "🏪",
      situation:
        "Week 2. You waited too long and the prices caught up with you. The $127 in your wallet now buys what $40 would have bought last week. The grocery store is rationing — two of any item per customer, cash only. Your fridge has maybe 4 days of food left. Gas is $12 a gallon and you are at a quarter tank. No paycheck coming. The pharmacy cannot process your insurance and prescriptions are cash-only at prices that make your eyes water.",
      choices: [
        {
          text: "Get creative — offer labor for food, check with neighbors, and start identifying what in your house has barter value",
          consequence:
            "Desperation is a teacher. You offer to help the elderly neighbor with yard work and she sends you home with a bag of potatoes and canned vegetables from a pantry she has been stocking for decades. You realize your garage has barter goldmines: tools, batteries, duct tape, rope, and that bottle of Tylenol everyone needs but nobody bought enough of. You are behind the curve but adapting. The people who adapt survive. The people who wait for normal do not.",
          scoreImpact: 10,
          nextNodeId: "ec-3b",
        },
        {
          text: "Drive to the next county where prices might be better and banks might be open",
          consequence:
            "You burn a quarter tank of irreplaceable gas to find the exact same situation 30 miles away. Banks are closed everywhere. Prices are the same or worse. Gas stations have lines. You come home with less fuel and the same empty fridge. In an economic collapse, the crisis is systemic — there is no neighboring county that is still normal. You cannot outrun a banking failure.",
          scoreImpact: -10,
          nextNodeId: "ec-3b",
        },
      ],
    },
    {
      id: "ec-3a",
      emoji: "🤝",
      situation:
        "Week 3. The utilities company announced rolling blackouts — they cannot pay their fuel suppliers either. Your electricity is on 8 hours a day, unpredictably. The landlord is threatening eviction but the courts are closed so it is an empty threat for now. Good news: your barter network is solid. You have food, relationships, and a reputation. Bad news: some neighbors are getting desperate. Someone broke into a house on the next block while the family was at a food distribution line. Security is becoming a real concern.",
      choices: [
        {
          text: "Organize a neighborhood watch and rotate security shifts. Pool resources for the most vulnerable families.",
          consequence:
            "Community defense is not about being tough — it is about being organized. You set up two-person watch shifts, establish a whistle system for alerts, and make sure the single mom, the elderly couple, and the disabled vet on the block are included in the resource pool. Desperation drives crime, and visible community cohesion is the best deterrent. The break-ins stop on your block because thieves target isolation, not organization.",
          scoreImpact: 20,
          nextNodeId: "ec-4a",
        },
        {
          text: "Quietly increase your own home security. Motion lights, locked gates, keep a low profile about your supplies.",
          consequence:
            "Individually smart but collectively limited. Your house is more secure, but the block is still vulnerable. The single mom two doors down gets her food stolen. The elderly couple's medication disappears from their mailbox. Crime is rising and your secure house sits in an insecure neighborhood. Eventually, your house becomes the obvious target because it is the only one that looks like it has something worth protecting.",
          scoreImpact: 5,
          nextNodeId: "ec-4b",
        },
      ],
    },
    {
      id: "ec-3b",
      emoji: "⚖️",
      situation:
        "Week 3. Things are getting raw. Power is intermittent — 8 hours on, 16 off, and you never know when. Your food is stretching thin. The neighborhood mood is tense. A local church opened a food bank but the line is four hours long and they run out before everyone gets through. Your kid needs that inhaler refill and the pharmacy wants $380 you do not have. A neighbor offers to trade you a full inhaler — his kid outgrew the same prescription — for your power drill and a case of bottled water.",
      choices: [
        {
          text: "Take the inhaler trade — your kid's breathing is worth more than any tool. Then figure out the rest.",
          consequence:
            "No hesitation. A power drill is replaceable. Your kid's ability to breathe is not. You make the trade and your kid has a full inhaler for the next month. This is what barter looks like when it matters — not haggling over fair value but understanding what is actually important. The drill was sitting in the garage. The inhaler sits in your kid's pocket. That trade was the easiest decision you made all month.",
          scoreImpact: 15,
          nextNodeId: "ec-4b",
        },
        {
          text: "Try to negotiate a better deal — a power drill is worth more than one inhaler. Ask for the inhaler plus food.",
          consequence:
            "You push for more and the neighbor walks away. He trades with someone else on the block. Now your kid still needs the inhaler, you still have the drill, and you have a reputation as someone who plays hardball when kids' health is on the table. In a week you find another inhaler source but it costs you more than the drill and the water combined. Negotiation has its place, but when your kid cannot breathe, speed beats margin.",
          scoreImpact: -5,
          nextNodeId: "ec-4b",
        },
      ],
    },
    {
      id: "ec-4a",
      emoji: "📈",
      situation:
        "Week 4. The government announces a partial banking restoration — limited withdrawals, $300 per day per person. It will take weeks for the full system to recover, but the worst is over. Prices are still inflated but starting to stabilize. Your neighborhood is intact: no one went hungry, no one lost their home to break-ins, and the barter network you built is still functioning. The question now is what you learned.",
      choices: [
        {
          text: "Keep 30 days of cash at home, build a deep pantry, and maintain the neighborhood network even after things normalize",
          consequence:
            "The number one lesson from every economic collapse in history: cash at home, food on shelves, and relationships with your neighbors. Argentina, Greece, Lebanon, Venezuela — the pattern is identical every time. Banks close, prices spike, supply chains break, and the people who had physical resources and community survived. The people who had everything in digital accounts learned the hardest lesson there is.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Focus on financial diversification — multiple banks, precious metals, cryptocurrency, emergency fund",
          consequence:
            "Financial preparedness is real preparedness. Multiple bank accounts mean one closure does not wipe you out. Physical cash at home covers the first 2-4 weeks. Precious metals hold value when currency does not. But do not forget the basics — all the gold in the world does not matter if you do not have food in the pantry and neighbors who trust you. Financial prep AND physical prep. Both.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "ec-4b",
      emoji: "🔄",
      situation:
        "Week 4. Partial banking restoration is announced. Limited withdrawals starting next week. It is not over, but the end is visible. Your neighborhood is battered — some families lost a lot. The grocery stores are slowly restocking but prices are still 2-3x normal. You made it through, but it was ugly in spots. Looking back, you can see exactly what would have made this easier.",
      choices: [
        {
          text: "Build a 30-day emergency cash fund, stock a deep pantry, and never be this vulnerable again",
          consequence:
            "Every economic collapse in modern history follows the same pattern: banks close, prices spike, digital money becomes inaccessible, and physical resources become everything. Having $2,000 in small bills at home, 30 days of food in the pantry, and a full medicine cabinet is not paranoia — it is insurance against a scenario that has happened in dozens of countries in your lifetime. You lived it. Now prepare for the next one.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Focus on barter skills and community — relationships saved you more than money did",
          consequence:
            "You are not wrong. The neighbor who traded you eggs, the elderly woman who shared her pantry, the watch rotation that kept your block safe — none of that required a bank account. Skills, relationships, and reputation are inflation-proof assets. But combine that with physical cash, a stocked pantry, and stored medications, and you have a system that handles anything the financial system throws at you.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "ec-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "Banks closed, prices tripled, paychecks stopped, and you navigated all of it. Early action on cash and supplies, a functioning barter network, community security, and the discipline not to panic. Most people were blindsided. You were buying rice while they were refreshing their bank apps.",
      didRight: [
        "Acted on cash and supplies immediately — before prices spiked",
        "Built a barter network based on fair dealing and trust",
        "Organized community security before crime became a problem",
        "Managed resources strategically instead of hoarding or panicking",
        "Understood that relationships are the most inflation-proof asset",
      ],
      couldImprove: [
        "Pre-positioned emergency cash at home eliminates the Day 1 scramble entirely",
        "A deep pantry with 30+ days of food removes the grocery store dependency",
        "Stored prescription medications beyond the current month's supply",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "25-year shelf life, no refrigeration needed. When grocery stores are cash-only at triple prices, your pantry is your paycheck.", url: GEAR.mountainHouse.url },
        { name: GEAR.readyWise.name, reason: "Emergency food supply that sits on a shelf until you need it. In an economic collapse, food is more valuable than currency.", url: GEAR.readyWise.url },
        { name: GEAR.sawyerSqueeze.name, reason: "If utilities shut off because the water company cannot pay its bills, this filter turns any water source into drinking water.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.ecoflowDelta3.name, reason: "When rolling blackouts hit, a power station keeps your fridge running, your phones charged, and your food from spoiling. Pair with solar for indefinite power.", url: GEAR.ecoflowDelta3.url },
        { name: GEAR.renogy200w.name, reason: "Solar panel that recharges your power station for free. When you cannot afford the electric bill, the sun does not send invoices.", url: GEAR.renogy200w.url },
      ],
    },
    {
      id: "ec-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You made it through a month of economic chaos. Some good moves, some expensive lessons. The delayed action on supplies cost you purchasing power, and community building started later than ideal. But your family ate, your home is secure, and you learned what matters when the financial system breaks.",
      didRight: [
        "Adapted to the barter economy when cash became scarce",
        "Prioritized family needs over material possessions",
        "Recognized the situation's severity before it was too late",
      ],
      couldImprove: [
        "Emergency cash at home — at least $2,000 in small bills — eliminates the first-week scramble",
        "A stocked pantry means you do not compete with panicked crowds at the grocery store",
        "Prescription medications: keep a 90-day supply when possible, not 30",
        "Community relationships should be built before the banks close, not after",
      ],
      gearRecommendations: [
        { name: GEAR.augason30day.name, reason: "30-day food supply per person. When grocery prices triple, you eat from the pantry instead of the bank account.", url: GEAR.augason30day.url },
        { name: GEAR.sawyerSqueeze.name, reason: "If utilities companies go bankrupt and water stops flowing, this filter is your independence.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.jackery1000.name, reason: "Portable power for rolling blackouts. Keep the fridge running, phones charged, and medical devices powered.", url: GEAR.jackery1000.url },
        { name: GEAR.midlandGXT1000.name, reason: "Communication with neighbors when cell networks degrade. Coordinate security watches, resource sharing, and community info.", url: GEAR.midlandGXT1000.url },
        { name: GEAR.luciLight.name, reason: "Solar-charged lantern for rolling blackouts. No batteries, no fuel, no ongoing cost. Charge in the window, light your house at night.", url: GEAR.luciLight.url },
      ],
    },
    {
      id: "ec-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "A month of financial chaos and you scraped through on fumes. Late to act on supplies, thin on food, behind on barter networks, and a few decisions that cost you dearly. Your family is okay, but it was close. The silver lining: you now understand exactly what an economic collapse looks like, and it is 100% survivable with basic preparation.",
      didRight: [
        "You kept your family together through a genuinely scary situation",
        "You eventually adapted to the barter economy",
      ],
      couldImprove: [
        "Cash at home. Not in the bank. Physical bills in a fireproof box. This is non-negotiable.",
        "Food storage: even two weeks of canned goods changes the entire equation",
        "Do not burn gas chasing normalcy in the next county — economic collapses are systemic",
        "Build relationships with neighbors before you need to trade with them",
        "Keep a 90-day supply of critical medications — pharmacies fail fast in economic crises",
      ],
      gearRecommendations: [
        { name: GEAR.readyWise.name, reason: "Emergency food that sits on a shelf until the banks close. When they do, you eat while everyone else is standing in line.", url: GEAR.readyWise.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Water independence. If the utility company goes under, your family still drinks clean water.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Pre-filled water storage. When utilities threaten shutoffs, you already have 28 gallons staged.", url: GEAR.reliance5gal.url },
        { name: GEAR.bioliteHeadlamp.name, reason: "Rechargeable hands-free light for rolling blackouts. No batteries to buy at inflated prices.", url: GEAR.bioliteHeadlamp.url },
        { name: GEAR.survivalTabs.name, reason: "Compact emergency nutrition. 15-day supply fits in a drawer. When money is worthless and shelves are empty, calories are king.", url: GEAR.survivalTabs.url },
      ],
    },
    {
      id: "ec-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "The banks closed and you were caught flat-footed. No cash, no stored food, no community network, and normalcy bias burned your most valuable days. This scenario has played out in Argentina, Greece, Lebanon, and Venezuela — the pattern is always the same. But every gap that hurt you is fixable today, right now, before it matters.",
      didRight: [
        "You ran the scenario — that means you are thinking about this, which puts you ahead of most people",
      ],
      couldImprove: [
        "Keep $2,000+ in small bills at home. Not in a bank. In your house. Tomorrow.",
        "Stock 30 days of food that does not need refrigeration. Canned goods, rice, beans, freeze-dried meals.",
        "Fill prescriptions at the 90-day maximum, not 30. Pharmacies are among the first businesses to fail.",
        "Normalcy bias kills — when something unprecedented happens, do not assume it will resolve quickly",
        "Your neighbors are your safety net. Introduce yourself before you need to trade with them.",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "Step one. 14 days of food per person that lasts 25 years on the shelf. Buy it, store it, forget it until the banks close.", url: GEAR.mountainHouse.url },
        { name: GEAR.sawyerSqueeze.name, reason: "If utilities companies shut off water, this $30 filter is your family's water independence. 100,000 gallons.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Prefilled water containers. When everything is falling apart, you already have a week of water.", url: GEAR.reliance5gal.url },
        { name: GEAR.ecoflowDelta2.name, reason: "Power station for rolling blackouts. Keeps your fridge running, food from spoiling, and devices charged.", url: GEAR.ecoflowDelta2.url },
        { name: GEAR.luciLight.name, reason: "Solar lantern. No batteries, no fuel cost, no electricity needed. Free light forever.", url: GEAR.luciLight.url },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 9: SEVERE PANDEMIC
// ═══════════════════════════════════════════════════════
const severePandemic: Scenario = {
  id: "severe-pandemic",
  name: "Severe Pandemic",
  icon: "heart-pulse",
  difficulty: "Hard",
  description:
    "A novel respiratory pathogen with a 5% case fatality rate is spreading globally. Not COVID — worse. Hospitals are full within two weeks. Your workplace closes. Schools shut down. Amazon stops delivering to your zone because warehouse workers are sick. This is what a serious pandemic looks like when the supply chain buckles.",
  startingNodeId: "sp-1",
  totalNodes: 5,
  nodes: [
    {
      id: "sp-1",
      emoji: "🏥",
      situation:
        "Week 1. The WHO declared a pandemic four days ago. Your state just announced a stay-at-home order. Schools are closed starting tomorrow. Your employer says work from home indefinitely. The grocery store is a war zone — toilet paper is gone, canned goods are thinning, and the checkout line wraps around the building. Your family of four has maybe 8 days of normal food. You have a few boxes of cold medicine and a half-empty bottle of Tylenol. The hospitals in your county are already at 90% capacity.",
      choices: [
        {
          text: "Order a 30-day grocery delivery immediately, pull out the emergency food supply from the garage, and set up a quarantine zone in your house",
          consequence:
            "If you already have a stored food supply, this is your moment. You supplement it with a large delivery order placed before the system overloads. You designate the guest room as a quarantine room — if someone gets sick, they isolate there with their own bathroom. You set up a disinfection station at the front door: shoes off, hands sanitized, groceries wiped down. Overkill? Ask the families in 1918 who took it seriously. They survived at twice the rate of their neighbors.",
          scoreImpact: 25,
          nextNodeId: "sp-2a",
        },
        {
          text: "Go to the store early tomorrow morning and stock up on everything you can get",
          consequence:
            "You are in the store at 6 AM with 200 other people who had the same idea. The mask situation is sketchy — half the people are not wearing them and the ones who are keep touching their faces. You get some canned goods, pasta, and medicine, but the exposure risk in that crowded store was real. You spent 90 minutes in the highest-risk environment possible: an indoor space packed with anxious people breathing hard. The supplies help, but the trip might cost you more than it bought.",
          scoreImpact: 5,
          nextNodeId: "sp-2b",
        },
        {
          text: "This will peak in a few weeks and pass. Stay home, use what you have, and do not overreact.",
          consequence:
            "A 5% CFR pathogen with a 2-week hospital filling time is not something that peaks and passes in a few weeks. The 1918 pandemic lasted over two years with multiple waves. By the time you realize this is not blowing over, delivery slots are booked 3 weeks out and the stores are genuinely empty — not just low, empty. Your 8 days of food is now 5 days of food and you are starting from behind.",
          scoreImpact: -10,
          nextNodeId: "sp-2b",
        },
      ],
    },
    {
      id: "sp-2a",
      emoji: "📦",
      situation:
        "Week 2. The supply chain is cracking. Amazon's delivery window went from 2 days to 2 weeks. Your regular grocery delivery service is showing 'no available slots.' The delivery drivers are sick. The warehouse workers are sick. The truckers are still running but at reduced capacity. Your food supply is solid but fresh produce and dairy are becoming hard to get. Your neighbor, a nurse, comes home in tears — the hospital is running out of PPE and they are reusing N95s for three days straight. She asks if you have any masks or gloves.",
      choices: [
        {
          text: "Give her a box of N95s and gloves. Set up a decontamination area for her at your door. She is your neighborhood's lifeline.",
          consequence:
            "A nurse who lives on your block during a pandemic is the most valuable neighbor you could have. Those N95s cost you $20 at the hardware store last year. The value of having a medical professional who trusts you, shares real-time hospital information, and can advise your family if someone gets sick? Priceless. You set up a boot wash station and a change area in your garage for her. She tells you the hospital strain is mutating — something the news will not report for another week. Information advantage.",
          scoreImpact: 20,
          nextNodeId: "sp-3a",
        },
        {
          text: "You would help but you need to keep your PPE for your own family. Offer to help in other ways.",
          consequence:
            "Protecting your family's supply is logical but shortsighted. The nurse goes to work without proper PPE and within a week she is symptomatic. Now your neighborhood has lost its only medical resource and there is an active infection on your block. The masks you kept might protect you from the virus, but they cannot replace the medical knowledge and hospital intel you just lost. Sometimes giving something away is the smartest investment.",
          scoreImpact: 5,
          nextNodeId: "sp-3b",
        },
      ],
    },
    {
      id: "sp-2b",
      emoji: "🏠",
      situation:
        "Week 2. You are locked down at home and the supply situation is getting real. Delivery services are overwhelmed. The store trips feel increasingly risky — a woman in the checkout line yesterday was coughing into her hand. Your kid's school is doing remote learning but the internet is slowing down as everyone in the neighborhood streams and video calls all day. Your spouse is anxious. The kid is restless. You are watching the food supply shrink. A local community group is organizing a shared grocery run — one person goes for five families.",
      choices: [
        {
          text: "Join the shared grocery run system. One person takes the risk instead of five families each making separate trips.",
          consequence:
            "Collective action reduces exposure for everyone. You rotate the shopping duty — one trip per week, one person wearing proper PPE, buying for five families from a shared list. Total exposure: one person for 45 minutes versus five people for 45 minutes each. You also reduce crowding at the store, which is better for everyone in the community. This is not communism — it is common sense risk management.",
          scoreImpact: 15,
          nextNodeId: "sp-3b",
        },
        {
          text: "Do your own shopping. You do not trust someone else to pick your food and you do not want group entanglements.",
          consequence:
            "Independence has value, but five trips to a crowded store expose you five times more than necessary. You spend an hour and a half each time in a high-risk environment — unmasked strangers, recycled air, shared cart handles. By Week 3, the cumulative exposure risk is significant. You are buying the same food you could have gotten through a coordinated system, but accepting five times the risk to do it. That math does not work.",
          scoreImpact: 0,
          nextNodeId: "sp-3b",
        },
      ],
    },
    {
      id: "sp-3a",
      emoji: "🤒",
      situation:
        "Week 3. Your teenager comes home from the garage where she was talking to a friend through the fence and says she feels hot. Temperature: 101.4. Sore throat. Dry cough starting. Your heart drops into your stomach. The hospital is not taking anyone unless they cannot breathe. The nurse neighbor says it sounds consistent with the pathogen. You have a family of four in a three-bedroom house. Your other kid is 9. Your spouse has mild asthma.",
      choices: [
        {
          text: "Activate the quarantine room. Isolate her immediately. Separate bathroom, meals delivered to the door, everyone else masks up full-time inside the house.",
          consequence:
            "This is exactly why you set up the quarantine room in Week 1. Your teen moves into the guest room with a dedicated bathroom. You deliver meals and fluids to the door. You wear N95s inside your own house, which feels insane but is correct. The nurse neighbor checks on her daily through the window, monitoring oxygen levels with a pulse oximeter she brought from the hospital. By Day 5, the fever breaks. By Day 10, she is recovering. No one else in the family gets sick. That quarantine room was the most important decision you made.",
          scoreImpact: 25,
          nextNodeId: "sp-4a",
        },
        {
          text: "Keep her comfortable but you cannot really isolate in a 3-bedroom house. Mask up and hope for the best.",
          consequence:
            "Partial measures get partial results. You mask up and open windows, but she is still using the shared bathroom and eating in the same kitchen. By Day 4, your spouse develops a cough. Then the 9-year-old. The asthmatic spouse has it worst — oxygen levels dip to 91 on the pulse oximeter and you spend a terrifying night deciding whether the ER is worth the exposure risk. She recovers, but three out of four family members got sick because true isolation was not implemented. A guest room with a door and its own bathroom would have contained it.",
          scoreImpact: 0,
          nextNodeId: "sp-4b",
        },
      ],
    },
    {
      id: "sp-3b",
      emoji: "🤒",
      situation:
        "Week 3. Your kid develops symptoms. Fever of 101, dry cough, fatigue. The hospitals are full and turning people away unless they need a ventilator. The emergency number has a 4-hour callback time. You are on your own for medical care unless things get critical. You have basic cold medicine, Tylenol, and a thermometer. Your spouse is starting to feel run down too.",
      choices: [
        {
          text: "Set up the best isolation you can — dedicated room, door closed, separate bathroom if possible. Treat symptoms aggressively with what you have.",
          consequence:
            "You clear out the bedroom, move the sick kid in, and close the door. Temperature checks every 4 hours. Tylenol for fever. Fluids constantly — the kid does not want to drink but dehydration is the silent killer with respiratory illness. You keep a log of symptoms and temperature that you can share with a doctor if things go south. It is not hospital care, but it is structured, disciplined home care that keeps the situation manageable. Your spouse gets mild symptoms but fights it off in a few days.",
          scoreImpact: 15,
          nextNodeId: "sp-4b",
        },
        {
          text: "Drive to the ER. A sick kid with a 101 fever needs a doctor, not home remedies.",
          consequence:
            "The ER has a 9-hour wait, most of it in a hallway full of coughing patients. The doctor confirms it is the virus, tells you to manage it at home with Tylenol and fluids, and sends you back. You spent 10 hours in the highest viral-load environment in the county, exposed your family to more concentrated virus, and got the exact same advice you could have found on the CDC website. ER visits are for breathing emergencies, not 101 fevers. You did not need a doctor — you needed information you already had.",
          scoreImpact: -10,
          nextNodeId: "sp-4b",
        },
      ],
    },
    {
      id: "sp-4a",
      emoji: "🌤️",
      situation:
        "Week 4. Your teen is recovered. No one else in the family got sick. The community infection rate is finally dropping — the peak seems to have passed. But the economic damage is massive. Your spouse's company announced layoffs. Grocery stores are restocking but slowly. Schools will not reopen for months. You are standing on the other side of the worst of it. What sticks with you?",
      choices: [
        {
          text: "Build a permanent pandemic prep kit: N95s, pulse oximeter, quarantine supplies, 30-day food and medicine stockpile",
          consequence:
            "The best pandemic prep is boring: masks, gloves, a pulse oximeter, a thermometer, a month of food, and a 90-day supply of every medication your family uses. Add a designated quarantine room plan and decontamination procedures, and you are ready for the next one. Because there will be a next one. The families who had this kit on Day 1 barely noticed the disruption. You can be that family next time.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Focus on supply chain independence — garden, bulk food storage, water filtration, solar power",
          consequence:
            "The supply chain failure scared you more than the virus itself, and you are right to focus there. A garden, a chest freezer full of meat, bulk rice and beans, and a water filter make you independent of the grocery delivery slot that never came. Add solar to keep the freezer running during rolling blackouts, and you have a house that can sustain itself through any disruption. This is not doomsday prepping — it is resilient living.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "sp-4b",
      emoji: "🔄",
      situation:
        "Week 4. The worst seems to be over. Your family is recovering — everyone is tired and run down, but alive. The infection rate in your area is dropping. Grocery stores are slowly restocking. Looking back over the past month, the gaps in your preparation were painful and obvious. What changes?",
      choices: [
        {
          text: "Stock a pandemic kit: masks, gloves, pulse oximeter, OTC medications, and 30 days of food that does not need a supply chain",
          consequence:
            "Everything that hurt you this month is fixable with about $300 and a trip to Amazon and Costco before the next event. A box of N95s, nitrile gloves, a $25 pulse oximeter, a thermometer, extra Tylenol and cold medicine, and a 30-day food supply. Add a quarantine room plan — who goes where, how meals are delivered, which bathroom is dedicated. None of this is exotic. All of it is the difference between crisis and inconvenience.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Invest in community relationships — the shared grocery runs and the nurse neighbor made the biggest difference",
          consequence:
            "You identified the real force multiplier. The shared grocery system reduced everyone's exposure. The nurse neighbor provided medical intelligence and guidance. The community group chat kept everyone informed. In a pandemic, community is not a luxury — it is infrastructure. Build those relationships, exchange skills, set up communication systems, and establish mutual aid agreements before the next pathogen arrives.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "sp-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "A severe pandemic with overrun hospitals and a broken supply chain, and your family came through it healthier than most. You had food stored, quarantine protocols ready, community relationships active, and the discipline to execute when it mattered. When your kid got sick, the quarantine room you set up in Week 1 kept the rest of the family healthy. That is not luck — that is preparation.",
      didRight: [
        "Had emergency food supply ready before the rush",
        "Set up quarantine room and decontamination protocols early",
        "Shared PPE with the nurse neighbor — invested in the community's most valuable asset",
        "Isolated the sick family member effectively, preventing household spread",
        "Managed stress and maintained discipline over four weeks",
      ],
      couldImprove: [
        "A pulse oximeter and home medical kit should be pre-staged, not acquired during the event",
        "90-day prescription supplies eliminate the pharmacy scramble",
        "Delivery-independent food storage means you never need to enter a crowded store",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "30-day food independence. No grocery runs, no delivery slots, no exposure. Just add hot water and eat.", url: GEAR.mountainHouse.url },
        { name: GEAR.sawyerSqueeze.name, reason: "If water utility workers get sick and treatment fails, this filter is your backup water supply.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.ecoflowDelta3.name, reason: "Power station for keeping medical devices, phones, and a mini-fridge running during rolling blackouts caused by sick grid workers.", url: GEAR.ecoflowDelta3.url },
        { name: GEAR.midlandGXT1000.name, reason: "Communicate with your shared grocery group, check on elderly neighbors, and coordinate without face-to-face contact.", url: GEAR.midlandGXT1000.url },
        { name: GEAR.renogy200w.name, reason: "Solar recharge for your power station. Indefinite electricity when the grid gets unreliable.", url: GEAR.renogy200w.url },
      ],
    },
    {
      id: "sp-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You made it through a serious pandemic, but the gaps showed. The food scramble was stressful, the illness hit multiple family members, and some decisions added risk that did not need to be there. Your family is alive and recovering, and you now know exactly what a real pandemic looks like — not the mild version, the ugly one.",
      didRight: [
        "Took the threat seriously and adjusted behavior",
        "Worked with community resources when they were available",
        "Managed home medical care when the hospitals could not help",
      ],
      couldImprove: [
        "Stored food eliminates the most dangerous activity in a pandemic: going to the store",
        "A true quarantine room requires a dedicated bathroom and a door that stays closed",
        "PPE stockpile: N95s, gloves, hand sanitizer, disinfectant — buy before the panic",
        "Home medical kit: pulse oximeter, thermometer, OTC medications, electrolyte packets",
      ],
      gearRecommendations: [
        { name: GEAR.readyWise.name, reason: "Emergency food supply that eliminates grocery store exposure. Shelf-stable for 25 years. Buy it before the next pandemic.", url: GEAR.readyWise.url },
        { name: GEAR.aquamiraDrops.name, reason: "Water purification drops as a backup. If water treatment plants run short-staffed, you want a second line of defense.", url: GEAR.aquamiraDrops.url },
        { name: GEAR.jackery1000.name, reason: "Power for medical devices, phones, and a mini-fridge if rolling blackouts hit. Essential when the grid gets shaky.", url: GEAR.jackery1000.url },
        { name: GEAR.bioliteHeadlamp.name, reason: "Rechargeable headlamp for nighttime care of sick family members without waking the rest of the house.", url: GEAR.bioliteHeadlamp.url },
        { name: GEAR.luciLight.name, reason: "Solar lantern for power outages during the pandemic. No batteries to find at stripped stores.", url: GEAR.luciLight.url },
      ],
    },
    {
      id: "sp-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Four weeks of a severe pandemic and your family scraped through. Multiple family members got sick, food ran short, and at least one trip to a crowded store or ER added unnecessary risk. The good news: everyone is alive and you now have a crystal-clear picture of what works and what does not in a pandemic.",
      didRight: [
        "You took care of your family through illness without hospital support",
        "You eventually connected with community resources",
      ],
      couldImprove: [
        "Food storage is pandemic prep number one — every grocery trip is an exposure event",
        "Quarantine means truly separate: room, bathroom, airflow. Not just the same house with masks.",
        "Do not go to the ER for a 101 fever — call first, save the trip for breathing emergencies",
        "PPE before the pandemic, not during it. N95s, gloves, sanitizer — buy a case now.",
        "90-day prescription supply prevents the pharmacy nightmare",
      ],
      gearRecommendations: [
        { name: GEAR.augason30day.name, reason: "30 days of food per person. No store trips, no delivery waits, no exposure. This is pandemic prep step one.", url: GEAR.augason30day.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Backup water filtration if water treatment gets disrupted by sick workers.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Stored water ready before disruptions. Four containers gives you a week of independence.", url: GEAR.reliance5gal.url },
        { name: GEAR.ecoflowDelta2.name, reason: "Keep medical devices, phones, and a mini-fridge running when the power gets spotty.", url: GEAR.ecoflowDelta2.url },
        { name: GEAR.midlandT77.name, reason: "GMRS radio for contact-free communication with neighbors. Coordinate shared grocery runs without meeting face to face.", url: GEAR.midlandT77.url },
      ],
    },
    {
      id: "sp-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "The pandemic hit and you were caught without stored food, without medical supplies, without quarantine plans, and with normalcy bias that cost you the critical first days. Multiple family members got sick from avoidable exposure. This is not a judgment — it is a blueprint. Every single thing that went wrong is fixable before the next pandemic arrives.",
      didRight: [
        "You ran the scenario and now you know what a real pandemic demands — that knowledge is the first prep",
      ],
      couldImprove: [
        "Store 30 days of food NOW. Every grocery trip during a pandemic is Russian roulette.",
        "Buy N95 masks, gloves, and hand sanitizer BEFORE the panic buying starts",
        "Set up a quarantine room plan: who goes where, which bathroom, how food is delivered",
        "A pulse oximeter costs $25 and tells you whether to go to the ER or stay home. Buy one.",
        "Fill prescriptions for 90 days, not 30. Pharmacies collapse fast in pandemics.",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "Food that does not require a grocery trip. 25-year shelf life. Buy it now, open it when the pandemic hits.", url: GEAR.mountainHouse.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Backup water supply when infrastructure workers get sick. This filter works without electricity or plumbing.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Stored water ready before anything happens. Fill four, put them in the garage, forget about them until you need them.", url: GEAR.reliance5gal.url },
        { name: GEAR.survivalTabs.name, reason: "Compact emergency calories. 15-day supply fits in a drawer. When delivery stops and stores are empty, this keeps you fed.", url: GEAR.survivalTabs.url },
        { name: GEAR.luciLight.name, reason: "Solar lantern for power disruptions. No store trip needed, no batteries, just sunlight.", url: GEAR.luciLight.url },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 10: CASCADING NATURAL DISASTER
// ═══════════════════════════════════════════════════════
const cascadingDisaster: Scenario = {
  id: "cascading-disaster",
  name: "Cascading Natural Disaster",
  icon: "mountain-snow",
  difficulty: "Extreme",
  description:
    "2:47 AM. Your bed is shaking. Not vibrating — violently shaking. A 7.7 magnitude earthquake on the New Madrid fault just ripped through the central US. Within 48 hours, an upstream dam will fail, flooding the valley. The power grid collapses across three counties. Earthquake plus flood plus blackout. FEMA calls this a cascading failure scenario. They war-game it every year. Now it is real.",
  startingNodeId: "cd-1",
  totalNodes: 6,
  nodes: [
    {
      id: "cd-1",
      emoji: "🏚️",
      situation:
        "The shaking lasted 45 seconds but it felt like ten minutes. You hear glass breaking, shelves falling, car alarms going off everywhere. The power is out. Your phone has 54% battery and one bar of signal — the towers are overloaded. In the dark, you can smell gas. Not strong, but it is there. Your family is awake and scared. The house feels structurally okay but you have not checked yet. Aftershock could come any minute.",
      choices: [
        {
          text: "Get the family outside immediately. Shut off the gas main at the meter. Grab the emergency bag on the way out.",
          consequence:
            "Gas smell after an earthquake means ruptured lines, and ruptured gas lines plus aftershocks equals fire or explosion. Getting outside is the right call. You shut off the gas at the meter using the wrench you keep zip-tied to the pipe — a detail that takes 10 seconds during an emergency and 2 hours to figure out if you did not plan it. The emergency bag has flashlights, a radio, first aid, and water. Your family is outside, safe, and equipped while the neighbors are stumbling around in the dark looking for their shoes.",
          scoreImpact: 25,
          nextNodeId: "cd-2a",
        },
        {
          text: "Do a quick safety check of the house — check for structural cracks, water leaks, and gas leaks before deciding whether to stay or leave",
          consequence:
            "Assessing before acting is reasonable, but you are searching a dark house that smells like gas while aftershocks are imminent. You find some cracked drywall and a broken water pipe under the kitchen sink. The gas smell is coming from the stove — the pilot light blew out and gas is seeping. You shut the stove off but the main line might have issues too. By the time you get outside, an aftershock hits and knocks more items off shelves. The house check gave you information, but the risk of being inside a compromised structure during aftershocks was high.",
          scoreImpact: 5,
          nextNodeId: "cd-2b",
        },
        {
          text: "Stay inside — the house is still standing and it is safer than being outside in the dark with downed power lines",
          consequence:
            "The gas smell should have overridden everything. A 5.2 aftershock hits 18 minutes later and the damaged gas line behind the wall ruptures further. The smell gets worse fast. Now you are evacuating in the dark, in a panic, during an aftershock, without your emergency gear. Two neighbors' houses already have small fires from ruptured lines that ignited. Staying in a structure with a gas leak after a major earthquake is one of the most dangerous decisions you can make.",
          scoreImpact: -15,
          nextNodeId: "cd-2b",
        },
      ],
    },
    {
      id: "cd-2a",
      emoji: "📻",
      situation:
        "Dawn. Your family spent the night in the car with the emergency bag. Aftershocks hit three more times, the worst at 5.2. Your house has cracks but is standing. Several houses on the block are not — one has a collapsed garage, another has a chimney through the roof. No one is seriously hurt on your block, but you can hear sirens everywhere. Your hand-crank radio picks up an emergency broadcast: 7.7 earthquake, major structural damage across four counties, and — here is the bad news — the Clearwater Dam 30 miles upstream is compromised. Army Corps of Engineers is assessing. If it fails, the valley below floods with 2-4 feet of water. You are in the valley.",
      choices: [
        {
          text: "Start loading the car with essentials NOW. If that dam fails, you need to be above the flood line before it hits. Identify high ground within 5 miles.",
          consequence:
            "You do not wait for an official evacuation order — by the time they issue one, the roads will be clogged. You pack water, food, the emergency bag, important documents, medications, and pet supplies. You know a ridge 3 miles west that sits 200 feet above the valley floor. You drive there, park, and set up a temporary camp. Six hours later, the dam fails. The valley floods with 3 feet of muddy water. Your house takes water damage but you and your family are dry, fed, and safe on the ridge. The people who waited for the official order are sitting in 2 hours of gridlock when the water arrives.",
          scoreImpact: 25,
          nextNodeId: "cd-3a",
        },
        {
          text: "Wait for the official evacuation order — the dam might hold and you do not want to abandon your house unnecessarily",
          consequence:
            "The dam holds for 20 more hours while the Corps tries emergency repairs. Then it does not hold. The evacuation order comes 4 hours before the breach, but 50,000 people are trying to leave at the same time on roads already damaged by the earthquake. You get out, but barely — water is lapping at the road behind you as you climb to higher ground. You packed in a rush and forgot medications, important documents, and half your food supply. You are alive but starting from zero on a hilltop.",
          scoreImpact: 5,
          nextNodeId: "cd-3b",
        },
      ],
    },
    {
      id: "cd-2b",
      emoji: "🌊",
      situation:
        "Morning. The earthquake damage is significant — cracked walls, broken pipes, no power. A neighbor with a battery radio shares the emergency broadcast: major earthquake damage region-wide and the Clearwater Dam upstream is under stress. If it fails, the valley floods. You are in the valley. No official evacuation order yet, but the Army Corps is 'monitoring the situation.' Your car has half a tank. The roads have some debris but seem passable.",
      choices: [
        {
          text: "Do not wait for the order. Load the car and get to high ground now. You have enough gas to get 3 miles uphill.",
          consequence:
            "Your instincts override the lack of official guidance and that saves your family. You pack what you can in 30 minutes and drive to the ridge west of town. It is not a comfortable camp, but it is above the flood line. When the dam fails 18 hours later, you watch from safety as the valley fills with brown water. Your house takes flood damage. Your family does not. The official evacuation order came 4 hours before the breach — those who waited are now in traffic as water rises.",
          scoreImpact: 15,
          nextNodeId: "cd-3b",
        },
        {
          text: "Stay put and prepare the house — move valuables upstairs, sandbag the doors, and ride it out on the second floor",
          consequence:
            "Sandbagging against a dam failure is like putting a band-aid on a bullet wound. When the dam goes, 3 feet of water carrying mud, debris, and sewage pours through your first floor. You are trapped on the second floor with whatever you carried up. No car — it is underwater in the driveway. No way out until the water recedes in 3-5 days. You are alive, but you are stuck in a damaged house surrounded by contaminated floodwater with dwindling food and no clean water. Rescue boats may come. Eventually.",
          scoreImpact: -10,
          nextNodeId: "cd-3b",
        },
      ],
    },
    {
      id: "cd-3a",
      emoji: "⛺",
      situation:
        "Day 3. You are on the ridge above the flooded valley. Your camp is basic but functional: car, emergency supplies, some food and water. The floodwater below is receding but the valley is a disaster zone — mud, debris, contaminated water everywhere. Power is out across three counties with no restoration timeline. Cell towers are down. Your hand-crank radio says FEMA is staging relief but it is 3-5 days out. You have maybe 4 days of food and 2 days of water. A family you do not know has set up camp 200 yards from you with two small kids and almost nothing.",
      choices: [
        {
          text: "Share food and water, then organize both families into a functioning camp. Pool resources, set watch shifts, and plan a foraging trip to the ridge's water source.",
          consequence:
            "The family has nothing but the clothes on their backs and a diaper bag. You share a day's worth of food and water — not reckless, but enough to stabilize them. The father is a plumber and immediately helps you rig a rainwater collection system from a tarp and some buckets. The mother finds a spring-fed creek a quarter mile along the ridge. Your water filter turns it into clean drinking water. Two families, pooled skills, shared security. You just doubled your capability while only reducing your supplies by 25%. That is the math of community.",
          scoreImpact: 20,
          nextNodeId: "cd-4a",
        },
        {
          text: "Help them with directions to the nearest shelter or relief staging area. You cannot support two families on your supplies.",
          consequence:
            "Not cruel, but a missed opportunity. The family walks toward town, through chest-deep floodwater in some areas, with two small kids. You do not know if they made it. Meanwhile, you sit alone on a ridge with dwindling water and no one to help you if something goes wrong. The plumber's skills, the spring the mother would have found — those assets walk away with them. Sometimes generosity is not charity — it is survival math.",
          scoreImpact: 5,
          nextNodeId: "cd-4b",
        },
      ],
    },
    {
      id: "cd-3b",
      emoji: "🚁",
      situation:
        "Day 3. You are on higher ground — either the ridge or a shelter — and the valley below is still flooded. The scope of the disaster is becoming clear: earthquake damage plus flood damage plus no electricity across three counties. Roads are impassable in most areas. Helicopters are buzzing overhead but they are focused on rooftop rescues. Your food is getting thin and clean water is becoming a problem. Contaminated floodwater is everywhere and drinking it is a guaranteed ticket to dysentery. You hear there is a creek on the ridge but you have no way to filter it.",
      choices: [
        {
          text: "Find the creek, boil the water using a campfire before drinking it. Ration food strictly and start looking for edible plants, canned goods in abandoned cars, anything useful.",
          consequence:
            "You find the creek and build a small fire. A rolling boil for one minute kills bacteria, viruses, and parasites. It is slow work — boiling enough water for a family takes hours — but it is safe water. You scavenge a case of canned food from a car that washed up against a tree line. Not glamorous, but you are hydrated, fed, and stable. A water filter would have made this ten times easier, but fire and knowledge work too.",
          scoreImpact: 15,
          nextNodeId: "cd-4b",
        },
        {
          text: "Wait for rescue. FEMA and the National Guard are staging — they will reach your area soon.",
          consequence:
            "FEMA is staging for 50,000+ displaced people across four counties after a triple disaster. Your ridge is not a priority when there are people on rooftops in the flood zone. Day 3 becomes Day 4. Day 4 becomes Day 5. You are dehydrated and your family is getting weak. On Day 6, a National Guard truck reaches your ridge and evacuates you to a shelter. You made it, but three days of dehydration in children is dangerous — your youngest needs IV fluids at the field hospital. Waiting for rescue is a valid strategy only if you can sustain yourself while waiting.",
          scoreImpact: -5,
          nextNodeId: "cd-4b",
        },
      ],
    },
    {
      id: "cd-4a",
      emoji: "🔧",
      situation:
        "Day 5. Your two-family camp is functioning: filtered water from the creek, rationed food supplemented by scavenged supplies, security watches at night. FEMA helicopters are getting closer — you can see them working the valley floor. A relief convoy is reportedly 24 hours away. Your house in the valley is flood-damaged but still standing. The water is receding. You have a decision: wait for relief or start the recovery yourself.",
      choices: [
        {
          text: "Start recovering now. Wade down carefully, assess your home, salvage what you can, and start drying it out before mold sets in.",
          consequence:
            "Mold starts growing in flooded structures within 24-48 hours. Every hour you wait, the recovery gets more expensive and more dangerous. You wade down in boots (never barefoot in floodwater — the contamination is no joke), open every window and door, pull out wet drywall and carpet, and start airing the structure. The plumber neighbor helps you cap the broken water lines. By the time FEMA arrives on Day 7, you have already started the hardest part of recovery. Insurance adjusters will later tell you that the early gutting saved your house.",
          scoreImpact: 20,
          nextNodeId: "end",
        },
        {
          text: "Wait for the relief convoy. You need proper supplies, clean water, and probably a tetanus shot before wading through contaminated flood mud.",
          consequence:
            "Medically cautious and not wrong — floodwater carries sewage, chemicals, and sharp debris. The convoy arrives on Day 7 with clean water, MREs, and medical support. But your house has been sitting in moisture for five days. By the time you start gutting it, mold is established in the walls. The remediation cost doubles. Waiting was not a bad call for your health, but the house paid the price. In recovery, speed and safety are in constant tension.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "cd-4b",
      emoji: "🏗️",
      situation:
        "Day 5. You have made it through the worst: earthquake, dam failure, and five days without power or clean water. FEMA relief is arriving in your area — trucks, water, MREs, and medical teams. Your house in the valley is flood-damaged. The water is receding but the destruction is massive. You are exhausted, your family is shaken, but alive. Recovery starts now.",
      choices: [
        {
          text: "Register with FEMA, get medical checks for the family, and start documenting damage for insurance. Build a recovery plan.",
          consequence:
            "The boring work is the important work. You photograph every piece of damage before cleaning up — insurance requires documentation. FEMA registration gets you in the system for assistance. Medical checks confirm everyone is healthy but dehydrated. The recovery will take months, but you are approaching it systematically instead of emotionally. The families who documented first recovered fastest. The ones who started cleaning before photographing lost thousands in uncovered claims.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Start cleaning and repairing immediately — you want your home back and waiting for bureaucracy will take forever",
          consequence:
            "The motivation is understandable but the execution costs you. You gut the flooded first floor without documenting the damage first. When the insurance adjuster arrives a week later, half the evidence is in a dumpster. Your claim gets reduced because you cannot prove the full extent of damage. FEMA assistance requires registration that you delayed. Emotion drove the timeline when process should have. Clean up with a camera in one hand — always.",
          scoreImpact: 0,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "cd-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "Earthquake, dam failure, and regional blackout — the triple disaster FEMA war-games as a worst case — and you navigated all three. Gas shut off immediately, evacuated before the flood order, built a functional camp on high ground, integrated refugees into your group, and started recovery before FEMA arrived. This is what preparation looks like when it is tested by everything at once.",
      didRight: [
        "Shut off gas and evacuated immediately — the smell was enough, did not wait for confirmation",
        "Moved to high ground before the dam failed, not after the evacuation order",
        "Had an emergency bag ready to grab on the way out the door",
        "Built community on the ridge — shared resources, pooled skills, organized camp",
        "Started recovery early to prevent mold and maximize insurance documentation",
      ],
      couldImprove: [
        "Pre-identified flood zones and high ground routes before an earthquake — FEMA flood maps are free",
        "A comprehensive vehicle emergency kit would have made the ridge camp more comfortable",
        "Water filtration in the emergency bag eliminates the need to find fuel for boiling",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "In a flood scenario, clean water is everywhere but drinkable water is nowhere. This filter turns creek water, rainwater, and even murky sources into safe drinking water. Weighs 3 ounces.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.rush72.name, reason: "72-hour go bag that lives by your door. Earthquake hits at 3 AM, you grab this on the way out. Flashlight, radio, water, food, first aid — all pre-packed.", url: GEAR.rush72.url },
        { name: GEAR.garminInreach.name, reason: "When cell towers are down and you need to tell family you are alive, satellite messaging works when nothing else does.", url: GEAR.garminInreach.url },
        { name: GEAR.solBivvy.name, reason: "Emergency shelter for ridge camping after evacuation. Reflects 90% of body heat. Weighs 8 ounces. Fits in your go bag.", url: GEAR.solBivvy.url },
        { name: GEAR.aquamiraDrops.name, reason: "Chemical water treatment for when you cannot boil. Kills everything in contaminated water. Treats 60 gallons.", url: GEAR.aquamiraDrops.url },
      ],
    },
    {
      id: "cd-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "Triple disaster and you made it through with your family intact. Some decisions were sharp, others cost you time and comfort. The earthquake response was decent, the flood evacuation was tight, and the camp situation was rough but manageable. You learned what it feels like when three disasters stack on top of each other — and that knowledge is worth everything.",
      didRight: [
        "Got your family to safety — the details were messy but the outcome was right",
        "Recognized the dam threat and acted on it (even if the timing was tight)",
        "Managed to find water and food during extended displacement",
      ],
      couldImprove: [
        "A pre-packed go bag by the door eliminates the scramble during a 3 AM earthquake",
        "Know your flood zone and high ground routes before the earthquake hits",
        "A water filter weighing 3 ounces would have eliminated the biggest stressor on the ridge",
        "Gas shutoff wrench should be attached to the meter — you will never find a wrench at 3 AM in the dark",
        "Document damage before cleanup — insurance requires evidence",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Your biggest vulnerability was clean water. This filter goes in your emergency bag and turns any water source into safe drinking water.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.rush72.name, reason: "Pre-packed 72-hour bag. Earthquake hits, you grab it and go. No packing, no deciding, no wasting time.", url: GEAR.rush72.url },
        { name: GEAR.ecoflowDelta3.name, reason: "Portable power for your vehicle camp. Charge phones, run a radio, power lights. Solar recharge extends it indefinitely.", url: GEAR.ecoflowDelta3.url },
        { name: GEAR.mountainHouse.name, reason: "Freeze-dried food for your go bag and vehicle kit. Just add hot water. Weighs almost nothing, lasts 25 years.", url: GEAR.mountainHouse.url },
        { name: GEAR.gerberStrongarm.name, reason: "Fixed blade knife for camp tasks, scavenging, and emergency situations. Full tang, bombproof construction.", url: GEAR.gerberStrongarm.url },
      ],
    },
    {
      id: "cd-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Earthquake, flood, and blackout — and you survived by the thinnest margin. Delayed evacuation, dehydration, and waiting for rescue instead of self-rescuing made this far harder than it needed to be. Your family is alive, but the experience was traumatic. Every gap in preparation was a gap that nearly broke you.",
      didRight: [
        "You kept your family alive through a triple disaster — do not minimize that",
        "You made decisions under extreme stress and did not freeze",
      ],
      couldImprove: [
        "When you smell gas after an earthquake, you leave. Immediately. No assessment needed.",
        "Do not wait for evacuation orders when a dam upstream is compromised — move to high ground NOW",
        "A water filter in your emergency kit eliminates the dehydration risk entirely",
        "Rescue may come, but it might take a week. Be able to sustain yourself for 7 days minimum.",
        "Pre-pack a go bag. At 3 AM during an earthquake is not the time to decide what to bring.",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Clean water was your biggest crisis. A 3-ounce filter that handles 100,000 gallons. Put one in your bag today.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.rush72.name, reason: "A pre-packed go bag. Everything you need for 72 hours in one pack. Grab it at 3 AM and you are equipped.", url: GEAR.rush72.url },
        { name: GEAR.katadynBeFree.name, reason: "Fast-flow water filter in a collapsible bottle. Drink directly from streams, puddles, or any freshwater source.", url: GEAR.katadynBeFree.url },
        { name: GEAR.solBivvy.name, reason: "Emergency shelter that fits in your pocket. Reflective interior retains 90% of body heat. Sleeping on a ridge in January without this is miserable.", url: GEAR.solBivvy.url },
        { name: GEAR.survivalTabs.name, reason: "Emergency calories that fit in a jacket pocket. 15-day supply. When you evacuated with nothing, this would have kept you fed.", url: GEAR.survivalTabs.url },
      ],
    },
    {
      id: "cd-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "A triple disaster — earthquake, dam failure, and regional blackout — overwhelmed you at every stage. Delayed evacuation, gas leak exposure, dehydration, and reliance on rescue that came too late. In a simulation, you try again. In real life, a go bag by the door, a water filter in your pocket, and knowledge of your flood zone are the difference between this outcome and a completely different one.",
      didRight: [
        "You ran the hardest natural disaster scenario in the simulator — now you know what cascading failure looks like",
      ],
      couldImprove: [
        "Gas smell = leave. No exceptions. Shut it off at the meter if you can, but GET OUT.",
        "Know your flood zone. Know the high ground. Know the route. Before the earthquake.",
        "A go bag by the door is not optional — it is the difference between equipped and empty-handed",
        "Water filter. Pocket-sized, 3 ounces, 100,000 gallons. This is the single most important piece of gear.",
        "Do not wait for rescue to sustain you. Sustain yourself and let rescue accelerate your recovery.",
      ],
      gearRecommendations: [
        { name: GEAR.sawyerSqueeze.name, reason: "Buy this first. Before anything else. A $30 water filter that turns any freshwater into drinking water. Dehydration was your biggest enemy.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.rush72.name, reason: "Pack this bag tonight and put it by your front door. Flashlight, radio, water, food, first aid, documents. Grab it at 3 AM and GO.", url: GEAR.rush72.url },
        { name: GEAR.solBivvy.name, reason: "Emergency shelter in your go bag. When you are on a ridge with nothing, this keeps you warm and alive.", url: GEAR.solBivvy.url },
        { name: GEAR.mountainHouse.name, reason: "Freeze-dried food for your go bag. Just add hot water. Weighs almost nothing. Feeds you for days when you evacuated with nothing.", url: GEAR.mountainHouse.url },
        { name: GEAR.garminInreach.name, reason: "Satellite messenger. When cell towers are destroyed, this sends your location and status to family via satellite. They know you are alive.", url: GEAR.garminInreach.url },
      ],
    },
  ],
};

// ═══════════════════════════════════════════════════════
// SCENARIO 11: SUPPLY CHAIN SIEGE
// ═══════════════════════════════════════════════════════
const supplyChainSiege: Scenario = {
  id: "supply-chain-siege",
  name: "Supply Chain Siege",
  icon: "container",
  difficulty: "Moderate",
  description:
    "No explosions. No disaster sirens. Just a slow squeeze. A major port strike combined with a trucking fuel dispute has disrupted deliveries across the eastern US. The news says it is temporary. The shelves say otherwise. This is the scenario that does not make the movies but affects more people than any earthquake — a 30-day supply chain disruption.",
  startingNodeId: "sc-1",
  totalNodes: 5,
  nodes: [
    {
      id: "sc-1",
      emoji: "🏬",
      situation:
        "Day 4. The port strike started Monday and the trucking dispute hit Wednesday. The news keeps saying 'negotiations are ongoing.' But you went to the grocery store this morning and the produce section is half empty. The canned goods aisle has gaps. The pharmacy says your blood pressure medication refill is delayed — 'supply chain issue, maybe next week.' Your neighbor posted on the neighborhood app that the Costco gas line was 45 minutes long. This feels different from the normal 'temporarily out of stock' signs.",
      choices: [
        {
          text: "Top off the gas tank, buy 2-3 weeks of shelf-stable food, refill prescriptions early, and quietly prepare for a month-long disruption",
          consequence:
            "You read the signals correctly. The produce gaps and pharmacy delays are early indicators, not temporary blips. You fill the car and your gas cans — $180 total but gas prices will climb 30% within a week. You buy rice, beans, pasta, canned goods, peanut butter, and oats — boring food that stores forever and costs $120 for three weeks' worth. You call the pharmacy and push your refill forward by the maximum allowed days. Total prep cost: under $400. Total stress reduction over the next month: immeasurable.",
          scoreImpact: 25,
          nextNodeId: "sc-2a",
        },
        {
          text: "Keep an eye on it but do not overreact — supply disruptions happen all the time and they always resolve",
          consequence:
            "They do resolve. Usually in 3-5 days. But this one involves a port strike AND a fuel dispute simultaneously, which is different. By Day 10, the grocery store is rationing eggs, milk, and bread. Gas is up 35%. Your pharmacy still does not have your medication and now three other medications are on backorder too. The window for easy, calm preparation closed while you were waiting for normal to reassert itself. You can still act, but it will cost more and the selection is worse.",
          scoreImpact: 0,
          nextNodeId: "sc-2b",
        },
        {
          text: "Stock up aggressively — buy everything you can afford. Fill the garage with supplies.",
          consequence:
            "The instinct is right but the execution is excessive. You spend $800 in a single day at three different stores, buying way more than you need — 50 pounds of rice, 40 cans of soup, 10 gallons of milk (that will spoil), and enough toilet paper for a year. The aggressive buying actually contributes to the local shortage — when everyone panic-buys, the shelves empty faster than the disruption warrants. You are well-stocked but you also just accelerated the problem for your neighbors. Smart prepping is steady and strategic, not a shopping spree.",
          scoreImpact: 10,
          nextNodeId: "sc-2a",
        },
      ],
    },
    {
      id: "sc-2a",
      emoji: "⛽",
      situation:
        "Week 2. The disruption is deepening. Gas stations are implementing purchase limits — $40 max per customer. Grocery stores have formal rationing: two of any single item per visit. Baby formula is completely gone. Fresh produce is a memory. Your employer announces work-from-home because the office building's cafeteria supplier cannot deliver. Schools are going remote because there is no fuel for the buses. Your pantry is solid but your neighbor — a single dad with an infant — is standing in his driveway looking stressed. He cannot find formula anywhere.",
      choices: [
        {
          text: "Help him find alternatives — check with other parents in the neighborhood for spare formula, breast milk banks, or pediatrician-approved substitutes. Offer food from your pantry for his older kid.",
          consequence:
            "This is community in action. You post on the neighborhood app (while the internet still works) and within an hour, two families respond with partial cans of the same formula brand. A mom three streets over has a full unopened can she bought before her baby transitioned to whole milk. You facilitate the connections and send him home with the formula and a bag of groceries for his 5-year-old. Total cost to you: two cans of soup and an hour of your time. The trust and goodwill you just built is worth a hundred cans.",
          scoreImpact: 20,
          nextNodeId: "sc-3a",
        },
        {
          text: "Sympathize but stay out of it. You prepared for your family. He should have prepared for his.",
          consequence:
            "True in the abstract, wrong in practice. A single dad with an infant has different constraints than a two-parent household. Judging his preparation level while his baby needs formula is not a survival strategy — it is a character failure. The neighborhood notices who helped and who did not during a crisis. When this resolves (and it will), your reputation is set. Communities have long memories.",
          scoreImpact: 0,
          nextNodeId: "sc-3b",
        },
      ],
    },
    {
      id: "sc-2b",
      emoji: "💊",
      situation:
        "Week 2. The shelves are noticeably bare now. Not empty — but the variety is gone. Five types of pasta sauce reduced to one. Meat section is hit or miss. Gas is up 35% and stations are limiting purchases. Your medication is still on backorder. You have 6 days left on your current supply. The pharmacy says they 'hope' to have it next week. Your boss announced work-from-home because the office cafeteria closed. Schools just went remote — no bus fuel.",
      choices: [
        {
          text: "Call every pharmacy in a 30-mile radius for your medication. Switch pharmacies if needed. Then stock up on whatever food is still available.",
          consequence:
            "Persistence pays. The sixth pharmacy you call has your medication — different manufacturer, same drug, same dosage. You drive 22 miles to pick it up and get a 90-day supply while it is available. On the way back, you stop at a grocery store in that town that is better stocked than yours. You fill the cart with shelf-stable staples. The gas cost hurts but you have medication for three months and food for two weeks. When critical needs are at stake, expand your search radius.",
          scoreImpact: 15,
          nextNodeId: "sc-3b",
        },
        {
          text: "Wait for your regular pharmacy to restock. Stretch your current supply by cutting pills in half.",
          consequence:
            "Some medications can be safely split. Others absolutely cannot — time-release capsules, blood thinners, and seizure medications can be dangerous at half doses. You did not check with a doctor first. Your blood pressure creeps up over the next week on the reduced dose. The pharmacy gets a partial shipment on Day 12 but it is first-come, first-served and you miss the window. By Week 3, you are out completely and your BP is 160/100. A 22-mile drive a week ago would have prevented all of this.",
          scoreImpact: -10,
          nextNodeId: "sc-3b",
        },
      ],
    },
    {
      id: "sc-3a",
      emoji: "🚗",
      situation:
        "Week 3. Gas rationing is official now. Even-odd license plate days at the pump, $30 limit. Your work-from-home situation is fine but your spouse's employer is demanding a return to office — 25 miles each way. Schools are still remote, so someone needs to stay home with the kids. Grocery deliveries are 10+ days out. The neighborhood has started an informal food-sharing network — people are trading what they have for what they need. Eggs for flour. Canned goods for fresh milk from a family that keeps chickens three blocks away.",
      choices: [
        {
          text: "Dive into the barter network. Offer your surplus staples for fresh items you need. Coordinate with the neighborhood to maximize everyone's supplies.",
          consequence:
            "The barter economy is already more efficient than the broken supply chain. The chicken family has eggs and milk. The guy with the backyard garden has fresh greens. You have rice, beans, and canned protein in surplus. Within days, you have a weekly swap system running on the neighborhood app. No money changes hands. Everyone eats better than they would alone. This is how communities have operated for thousands of years — the grocery store was a 70-year experiment and it just hit a wall.",
          scoreImpact: 20,
          nextNodeId: "sc-4a",
        },
        {
          text: "Keep using what you stored. The disruption will end soon and you do not want to trade away supplies you might need.",
          consequence:
            "Conservation is not wrong, but opportunity cost is real. Your stored rice and beans are solid but your family is craving variety after two weeks of the same meals. The barter network is offering fresh eggs, greens, and milk — nutrients your family needs — in exchange for bulk staples you have plenty of. Hoarding depreciating assets (your pantry gets less appetizing every day) while declining appreciating ones (fresh food when the store has none) is bad economics even in a crisis.",
          scoreImpact: 5,
          nextNodeId: "sc-4b",
        },
      ],
    },
    {
      id: "sc-3b",
      emoji: "📱",
      situation:
        "Week 3. The internet is slowing to a crawl — not because of infrastructure failure but because everyone is home streaming, gaming, and video calling. Your work-from-home meetings keep freezing. Gas rationing is in effect. The grocery store gets a shipment every 3-4 days now instead of daily, and there is a line before they open. Your family is getting bored, restless, and tired of canned food. Morale is the new scarcity.",
      choices: [
        {
          text: "Get creative with meals — learn to bake bread, cook from scratch with what you have. Get the family involved. Pull out board games. Make this a challenge, not a punishment.",
          consequence:
            "Morale is a survival resource and you just started investing in it. Your kid learns to make bread from flour, water, salt, and yeast — a skill that has been useful for about 10,000 years. Your spouse discovers that rice and beans with different spice combinations can be a different meal every night. Board games replace screens during the slow internet hours. The disruption is still real but your family's psychological state shifts from 'enduring' to 'adapting.' That shift is everything.",
          scoreImpact: 15,
          nextNodeId: "sc-4b",
        },
        {
          text: "Push through. It is temporary. Keep meals simple, keep routines normal, and wait for resolution.",
          consequence:
            "Routine has value but three weeks of monotony without an end date grinds people down. The kids are fighting more. Your spouse is snapping over small things. You are eating the same pasta three nights a week and no one is excited about dinner anymore. The disruption might last two more weeks — can your family's morale hold? Sometimes the 'soft' skills — cooking creativity, family engagement, psychological resilience — matter more than the stockpile.",
          scoreImpact: 5,
          nextNodeId: "sc-4b",
        },
      ],
    },
    {
      id: "sc-4a",
      emoji: "📰",
      situation:
        "Week 4. The news breaks: port strike settled, trucking fuel dispute resolved. Full deliveries resume in 7-10 days. The worst is over, but recovery takes time. The stores will be restocked gradually. Gas rationing will lift next week. Your neighborhood barter network is still running and people are talking about keeping it going even after the stores are full again. You made it through 30 days of supply chain disruption without a single panic moment.",
      choices: [
        {
          text: "Keep the neighborhood network alive, build a deeper pantry, and establish a 90-day supply baseline for your family",
          consequence:
            "The best prep is the one you build after learning what you actually needed. You know now: 30 days of shelf-stable food, 90-day medication supply, gas cans topped off, and a neighborhood network that can function independently of the supply chain. None of this is expensive. None of it takes much space. And the neighborhood relationships you built over the last month are worth more than anything on a shelf. You do not just survive the next disruption — you barely notice it.",
          scoreImpact: 15,
          nextNodeId: "end",
        },
        {
          text: "Get back to normal ASAP. Restock the pantry, fill the gas tank, and be glad it is over.",
          consequence:
            "Normal feels great after a month of rationing. But normal is what left you vulnerable in the first place. Restocking is step one. The question is whether you restock to a 3-day supply (what most families have) or a 30-day supply (what you now know you need). The supply chain will disrupt again — ports, weather, pandemics, fuel disputes, labor actions. The only variable is whether you are ready next time.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
    {
      id: "sc-4b",
      emoji: "🔔",
      situation:
        "Week 4. Resolution is announced: port strike settled, fuel dispute resolved. Deliveries resume in 7-10 days. Gas rationing lifts next week. You made it through, though some weeks were rougher than others. The stores will slowly fill back up. Life will return to 'normal.' But you just lived through a scenario that most people think only happens in other countries. What changes?",
      choices: [
        {
          text: "Build a 30-day food supply, keep a 90-day medication buffer, and maintain relationships with neighbors who shared resources",
          consequence:
            "You lived the lesson. A 30-day food supply costs about $150-200 per person in shelf-stable staples. A 90-day medication supply just requires asking your doctor for the extended prescription and filling it at the right time. Gas cans in the garage cost $50 and hold enough fuel for a week of driving. Total investment: under $500 per person. Total protection: everything you needed this month and did not have. This is not prepping — it is adulting.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
        {
          text: "Focus on reducing supply chain dependency long-term — garden, chickens, solar, well water, local food sources",
          consequence:
            "The long game. A backyard garden produces fresh food for 6+ months of the year. A few chickens produce more eggs than a family can eat. A rain barrel reduces water dependency. Solar panels reduce grid dependency. A relationship with a local farm reduces grocery dependency. None of these are free or easy, but each one removes a link in the chain that just choked your family for a month. The supply chain is a convenience, not a guarantee.",
          scoreImpact: 10,
          nextNodeId: "end",
        },
      ],
    },
  ],
  endResults: [
    {
      id: "sc-thrived",
      finalScore: 90,
      rating: "Thrived",
      summary:
        "A 30-day supply chain disruption — no dramatic disaster, just a slow squeeze — and you handled it like it was a mild inconvenience. Early action on food and fuel, community network activated, barter system running, and your family ate well the entire time. This is the most realistic scenario in the simulator and you aced it.",
      didRight: [
        "Read the early signals and acted before the shelves emptied",
        "Topped off gas and stocked shelf-stable food at pre-disruption prices",
        "Pushed medication refills forward before pharmacy backorders hit",
        "Built a neighborhood barter and sharing network",
        "Maintained family morale through creativity and engagement",
      ],
      couldImprove: [
        "A standing 30-day pantry means you never need to react to Day 1 signals — you are already set",
        "A 90-day medication supply should be standard, not a crisis response",
        "Gas cans in the garage eliminate the need to hit the pump during rationing",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "Long-term food insurance. 25-year shelf life, just add water. When the shelves are bare, your pantry is full.", url: GEAR.mountainHouse.url },
        { name: GEAR.readyWise.name, reason: "Emergency food supply that doubles as camping food. Rotate it through your outdoor adventures so nothing goes to waste.", url: GEAR.readyWise.url },
        { name: GEAR.ecoflowDelta3.name, reason: "If rolling blackouts accompany the supply disruption, a power station keeps your fridge running and food from spoiling.", url: GEAR.ecoflowDelta3.url },
        { name: GEAR.renogy200w.name, reason: "Solar panel to recharge the power station. When fuel is rationed, solar is the only power source that does not need deliveries.", url: GEAR.renogy200w.url },
        { name: GEAR.sawyerSqueeze.name, reason: "If the disruption extends to water treatment chemicals, a water filter is your independence. Works without electricity or supply chains.", url: GEAR.sawyerSqueeze.url },
      ],
    },
    {
      id: "sc-survived",
      finalScore: 50,
      rating: "Survived",
      summary:
        "You got through a month of supply chain disruption. Some smart moves mixed with some costly delays. The medication situation got tighter than it needed to be and the food monotony ground your family down. But everyone is fed, healthy, and wiser. The biggest takeaway: the most likely disaster is not an earthquake or an EMP — it is this. A slow squeeze that lasts longer than your pantry.",
      didRight: [
        "Eventually adapted to the disruption and found creative solutions",
        "Helped neighbors when it mattered",
        "Kept your family functional through a stressful month",
      ],
      couldImprove: [
        "Early action on stocking saves money and stress — waiting costs you both",
        "A 90-day prescription supply should be standard practice, not a crisis scramble",
        "Gas cans in the garage are cheap insurance against rationing",
        "Community networks work better when they exist before the crisis",
      ],
      gearRecommendations: [
        { name: GEAR.augason30day.name, reason: "30-day food supply per person. When the shelves are bare, you eat from the pantry instead of standing in line.", url: GEAR.augason30day.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Water independence if the disruption affects treatment chemicals. Works without electricity or any supply chain.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.jackery1000.name, reason: "Power station to keep your fridge running if rolling blackouts hit. Food spoilage during a supply disruption doubles your problem.", url: GEAR.jackery1000.url },
        { name: GEAR.reliance5gal.name, reason: "Stored water. Four containers in the garage. If the disruption extends to water treatment, you have a week's supply ready.", url: GEAR.reliance5gal.url },
        { name: GEAR.luciLight.name, reason: "Solar lantern for potential power disruptions. No batteries to buy at inflated prices. Free light from sunlight.", url: GEAR.luciLight.url },
      ],
    },
    {
      id: "sc-barely",
      finalScore: 15,
      rating: "Barely Made It",
      summary:
        "Thirty days of thinning shelves, gas rationing, and medication shortages — and you white-knuckled through it. The delayed response cost you money (higher prices), stress (scrambling for medication), and family morale (three weeks of monotonous meals). The good news: this is the most fixable scenario in the simulator. Everything you needed costs less than a weekend trip.",
      didRight: [
        "You made it through a month without a catastrophic failure",
        "You eventually found solutions for critical needs like medication",
      ],
      couldImprove: [
        "React to Day 1 signals, not Day 10 shortages. The early bird gets the normal-priced rice.",
        "A 30-day food pantry costs $150-200 per person. Build it this weekend.",
        "Medication: ask your doctor for 90-day prescriptions. Fill them. Always.",
        "Gas cans: two 5-gallon cans in the garage. Rotate them every 6 months. $50 total.",
        "Know your neighbors. Trade surplus for variety. A can of beans for three fresh eggs is a good deal for everyone.",
      ],
      gearRecommendations: [
        { name: GEAR.readyWise.name, reason: "Emergency food supply that eliminates the grocery store scramble. On the shelf when you need it, ignored when you do not.", url: GEAR.readyWise.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Water filter as insurance. Supply chain disruptions can affect water treatment chemicals. This is your backup.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Prefilled water containers. When uncertainty is high, knowing you have a week of water reduces the baseline stress.", url: GEAR.reliance5gal.url },
        { name: GEAR.survivalTabs.name, reason: "Emergency nutrition in a bottle. 15-day supply. Fits in a kitchen drawer. When meals get thin, these keep you functional.", url: GEAR.survivalTabs.url },
        { name: GEAR.bioliteHeadlamp.name, reason: "Rechargeable headlamp. If the supply disruption cascades to power, you have hands-free light without buying batteries at 3x markup.", url: GEAR.bioliteHeadlamp.url },
      ],
    },
    {
      id: "sc-didnt",
      finalScore: 0,
      rating: "Didn't Make It",
      summary:
        "A 30-day supply chain disruption — the most common and most survivable scenario in this simulator — and it overwhelmed you. No stored food, no medication buffer, no gas reserves, and normalcy bias that cost you the entire first week. But here is the thing: this is the cheapest scenario to prepare for. Everything you needed this month fits in one closet and costs less than a car payment.",
      didRight: [
        "You ran a scenario most people never think about — that awareness is step one",
      ],
      couldImprove: [
        "Build a 30-day pantry this weekend. Rice, beans, canned goods, pasta, peanut butter. Under $200.",
        "Medication: 90-day supply. Talk to your doctor tomorrow. This is non-negotiable.",
        "Two gas cans in the garage. Fill them. Rotate every 6 months. $50.",
        "When the news says 'temporary disruption,' assume 30 days and act accordingly.",
        "Meet your neighbors. Know who has chickens, who has a garden, who has skills. Community is free.",
      ],
      gearRecommendations: [
        { name: GEAR.mountainHouse.name, reason: "Step one. 14 days of food per person. Sits on a shelf for 25 years. When the stores are rationing, your family eats.", url: GEAR.mountainHouse.url },
        { name: GEAR.readyWise.name, reason: "More food variety in your emergency pantry. Different meals, different flavors. Morale matters when you are eating from a stockpile.", url: GEAR.readyWise.url },
        { name: GEAR.sawyerSqueeze.name, reason: "Water filter. If the disruption extends to water treatment, a $30 filter is your family's safety net.", url: GEAR.sawyerSqueeze.url },
        { name: GEAR.reliance5gal.name, reason: "Water storage containers. Fill them now, store them in the garage. One less thing to worry about.", url: GEAR.reliance5gal.url },
        { name: GEAR.ankerSolix.name, reason: "Power station for if the supply disruption cascades to the grid. Keep your fridge running and food from spoiling.", url: GEAR.ankerSolix.url },
      ],
    },
  ],
};


export const scenarios: Scenario[] = [
  powerGridFailure,
  hurricaneEvacuation,
  civilUnrest,
  winterStorm,
  wildfireEvacuation,
  infrastructureAttack,
  empStrike,
  economicCollapse,
  severePandemic,
  cascadingDisaster,
  supplyChainSiege,
];

// ─── Helper to determine end result based on accumulated score ───
export function getEndResult(scenario: Scenario, score: number): EndResult {
  const sorted = [...scenario.endResults].sort(
    (a, b) => b.finalScore - a.finalScore,
  );
  for (const result of sorted) {
    if (score >= result.finalScore) return result;
  }
  return sorted[sorted.length - 1];
}

// ─── Get a node by ID ───
export function getNode(
  scenario: Scenario,
  nodeId: string,
): ScenarioNode | undefined {
  return scenario.nodes.find((n) => n.id === nodeId);
}
