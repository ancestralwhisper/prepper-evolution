export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  date: string;
  imageUrl: string;
}

export const mockArticles: Article[] = [
  {
    id: "1",
    slug: "winter-overlanding-10-critical-upgrades",
    title: "Winter Overlanding: 10 Critical Upgrades",
    excerpt: "Don't let the cold stop you. These 10 essential upgrades will keep your rig moving through the worst winter weather.",
    content: "<h2>1. Auxiliary Heating Systems</h2><p>When the temperature drops...</p><h2>2. Tire Chains & Recovery Gear</h2><p>Proper traction is non-negotiable...</p>",
    category: "Overlanding",
    author: "Tactical Tom",
    date: "2025-10-15",
    imageUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09"
  },
  {
    id: "2",
    slug: "comms-down-building-local-radio-network",
    title: "Comms Down: Building a Local Radio Network",
    excerpt: "When cellular networks fail, ham and GMRS radios are your lifeline. Learn how to set up a resilient local network.",
    content: "<h2>Understanding Radio Frequencies</h2><p>VHF vs UHF...</p><h2>Choosing Your Hardware</h2><p>Base stations vs handhelds...</p>",
    category: "Skills & Strategy",
    author: "Comms Charlie",
    date: "2025-11-02",
    imageUrl: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca"
  }
];
