"use client";

import Link from "next/link";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PaginatedResult } from "@/types/post";

type ContentPostsPaginationProps = {
  pagination: PaginatedResult<unknown>;
  contentBasePath: string;
  selectedSiteId?: string | null;
  lockSiteFilter?: boolean;
};

function buildContentPageHref(
  contentBasePath: string,
  page: number,
  selectedSiteId: string | null | undefined,
  lockSiteFilter: boolean,
): string {
  const params = new URLSearchParams();

  if (!lockSiteFilter && selectedSiteId) {
    params.set("site", selectedSiteId);
  }

  if (page > 1) {
    params.set("page", String(page));
  }

  const query = params.toString();
  return query ? `${contentBasePath}?${query}` : contentBasePath;
}

function getVisiblePages(currentPage: number, totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: (number | "ellipsis")[] = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);
  return pages;
}

/**
 * URL-driven pagination for the dashboard blog posts table.
 */
export function ContentPostsPagination({
  pagination,
  contentBasePath,
  selectedSiteId,
  lockSiteFilter = false,
}: ContentPostsPaginationProps) {
  const { page, pageSize, total, totalPages } = pagination;

  if (total === 0) {
    return null;
  }

  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const visiblePages = getVisiblePages(page, Math.max(totalPages, 1));

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-muted-foreground text-sm">
        Showing {rangeStart}–{rangeEnd} of {total}
      </p>

      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href={buildContentPageHref(contentBasePath, page - 1, selectedSiteId, lockSiteFilter)}
              aria-disabled={page <= 1}
              className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>

          {visiblePages.map((visiblePage, index) =>
            visiblePage === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={visiblePage}>
                <Link
                  href={buildContentPageHref(
                    contentBasePath,
                    visiblePage,
                    selectedSiteId,
                    lockSiteFilter,
                  )}
                  aria-current={visiblePage === page ? "page" : undefined}
                  className={cn(
                    buttonVariants({
                      variant: visiblePage === page ? "outline" : "ghost",
                      size: "icon",
                    }),
                    "min-w-9",
                  )}
                >
                  {visiblePage}
                </Link>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href={buildContentPageHref(contentBasePath, page + 1, selectedSiteId, lockSiteFilter)}
              aria-disabled={page >= totalPages}
              className={page >= totalPages ? "pointer-events-none opacity-50" : undefined}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
