'use client';

import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md';
}

export default function RatingStars({ value, onChange, size = 'md' }: RatingProps) {
  const interactive = !!onChange;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(star)}
          className={cn(
            'transition-colors',
            interactive && 'cursor-pointer hover:scale-110',
            !interactive && 'cursor-default',
          )}
        >
          <Star
            className={cn(
              size === 'sm' ? 'w-4 h-4' : 'w-5 h-5',
              star <= value ? 'fill-pink-accent text-pink-accent' : 'fill-none text-gray-300',
            )}
          />
        </button>
      ))}
    </div>
  );
}
