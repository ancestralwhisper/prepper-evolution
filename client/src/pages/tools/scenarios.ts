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
    name: "Garmin inReach Mini 2",
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
    url: "https://www.amazon.com/dp/B0CG5BP68F?tag=prepperevo-20",
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
          name: GEAR.ecoflowDelta2.name,
          reason:
            "1,024Wh of power in a portable package. Run a furnace blower, charge phones, and power a radio for days. This is your first buy.",
          url: GEAR.ecoflowDelta2.url,
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
          name: GEAR.ecoflowDelta2.name,
          reason:
            "1,024Wh of portable power. Run a space heater, electric kettle, and charge devices. This single item changes everything in a winter power outage.",
          url: GEAR.ecoflowDelta2.url,
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
export const scenarios: Scenario[] = [
  powerGridFailure,
  hurricaneEvacuation,
  civilUnrest,
  winterStorm,
  wildfireEvacuation,
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
