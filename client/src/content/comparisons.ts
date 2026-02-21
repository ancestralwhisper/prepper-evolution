export interface Comparison {
  id: string;
  slug: string;
  title: string;
  description: string;
  products: string[]; // Slugs of products compared
  verdict: string;
}

export const mockComparisons: Comparison[] = [
  {
    id: "1",
    slug: "best-gravity-water-filters-2025",
    title: "The Best Gravity Water Filters of 2025: Head-to-Head",
    description: "We tested the top 5 gravity water filters in back-country conditions to see which one actually delivers.",
    products: ["pro-gravity-water-filter"],
    verdict: "The Pro-Gravity takes the top spot for overall flow rate and durability."
  }
];
