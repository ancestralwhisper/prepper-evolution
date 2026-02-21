export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  amazonLink: string;
  features: string[];
}

export const mockProducts: Product[] = [
  {
    id: "1",
    slug: "tactical-alpha-72h-pack",
    name: "Tactical Alpha 72h Pack",
    description: "The ultimate 72-hour bug out bag with modular attachments and hydrations bladder compatibility.",
    price: 149.99,
    category: "Preparedness",
    imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62",
    amazonLink: "https://amazon.com/dp/B08XYZ?tag=prepperevo-20",
    features: ["1000D Nylon", "MOLLE compatible", "45L capacity"]
  },
  {
    id: "2",
    slug: "pro-gravity-water-filter",
    name: "Pro-Gravity Water Filter",
    description: "Filters up to 1 gallon per minute using advanced gravity-fed microfiltration.",
    price: 89.99,
    category: "Camping",
    imageUrl: "https://images.unsplash.com/photo-1523362628745-0c100150b504",
    amazonLink: "https://amazon.com/dp/B09ABC?tag=prepperevo-20",
    features: ["0.1 micron filter", "BPA-free", "Collapsible"]
  }
];
