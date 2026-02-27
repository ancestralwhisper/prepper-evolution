import { Link } from "wouter";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  categorySlug?: string | null;
}

function buildHref(basePath: string, page: number, categorySlug?: string | null): string {
  const params = new URLSearchParams();
  if (categorySlug) params.set("category", categorySlug);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "ellipsis")[] = [1];

  if (current > 3) pages.push("ellipsis");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

export default function Pagination({ currentPage, totalPages, basePath, categorySlug }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <nav aria-label="Article pagination" className="flex justify-center items-center gap-1.5 mt-14" data-testid="pagination">
      {currentPage > 1 && (
        <Link
          href={buildHref(basePath, currentPage - 1, categorySlug)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-md hover:border-primary/30 transition-all"
          aria-label="Previous page"
          data-testid="pagination-prev"
        >
          <ChevronLeft className="w-4 h-4" /> Prev
        </Link>
      )}

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`e${i}`} className="px-2 text-muted-foreground select-none">
            &hellip;
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(basePath, p, categorySlug)}
            className={`inline-flex items-center justify-center w-10 h-10 text-sm font-bold rounded-md transition-all ${
              p === currentPage
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground border border-border hover:border-primary/30 hover:text-primary"
            }`}
            aria-current={p === currentPage ? "page" : undefined}
            data-testid={`pagination-page-${p}`}
          >
            {p}
          </Link>
        ),
      )}

      {currentPage < totalPages && (
        <Link
          href={buildHref(basePath, currentPage + 1, categorySlug)}
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary border border-border rounded-md hover:border-primary/30 transition-all"
          aria-label="Next page"
          data-testid="pagination-next"
        >
          Next <ChevronRight className="w-4 h-4" />
        </Link>
      )}
    </nav>
  );
}
