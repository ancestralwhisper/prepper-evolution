import { Link } from "wouter";
import * as icons from "lucide-react";
import type { LucideProps } from "lucide-react";
import { categoryAccent, FILTER_ACTIVE, FILTER_HOVER } from "@/lib/categoryColors";

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const LucideIcon = (icons as any)[name];
  if (!LucideIcon) return null;
  return <LucideIcon {...props} />;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryFilterProps {
  categories: readonly Category[];
  activeCategory: string | null;
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  return (
    <nav aria-label="Filter by category" className="flex flex-wrap justify-center gap-2.5 mb-12">
      <Link
        href="/articles"
        className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all border ${
          !activeCategory
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card border-border text-muted-foreground hover:border-primary hover:text-primary hover:shadow-sm"
        }`}
        data-testid="filter-all"
      >
        All
      </Link>
      {categories.map((cat) => {
        const accent = categoryAccent(cat.id);
        const isActive = activeCategory === cat.id;
        return (
          <Link
            key={cat.id}
            href={`/articles?category=${cat.id}`}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-medium transition-all border ${
              isActive
                ? FILTER_ACTIVE[accent]
                : `bg-card border-border text-muted-foreground ${FILTER_HOVER[accent]}`
            }`}
            data-testid={`filter-category-${cat.id}`}
          >
            <DynamicIcon name={cat.icon} className="w-4 h-4" />
            {cat.name}
          </Link>
        );
      })}
    </nav>
  );
}
