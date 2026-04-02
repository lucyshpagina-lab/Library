'use client';

import Button from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-2"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-text-secondary">...</span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onPageChange(p)}
            className="px-3 min-w-[36px]"
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-2"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
