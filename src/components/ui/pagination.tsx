// src/components/ui/pagination.tsx
// Simple, reusable pagination controls for client lists
'use client';


interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // Generate a compact page list (1, current-1..current+1, last)
  const pages: (number | 'ellipsis')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== 'ellipsis') {
      pages.push('ellipsis');
    }
  }

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-2 py-3">
      <div className="text-sm text-gray-600">
        Page {page} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
        >
          Prev
        </button>
        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e-${idx}`} className="px-2 text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50 ${
                p === page ? 'border-amber-500 text-amber-700' : ''
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-50 bg-white hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}


