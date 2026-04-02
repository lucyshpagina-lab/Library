'use client';

import { useRouter } from 'next/navigation';
import { useReaderStore } from '@/stores/readerStore';
import { ArrowLeft, Sun, Moon, Minus, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReaderToolbarProps {
  title: string;
  progress: number;
}

export default function ReaderToolbar({ title, progress }: ReaderToolbarProps) {
  const router = useRouter();
  const { fontSize, theme, setFontSize, setTheme } = useReaderStore();

  const isNight = theme === 'night';
  const btnClass = cn(
    'p-2 rounded-lg transition-colors',
    isNight ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-text-secondary',
  );

  return (
    <div className={cn(
      'sticky top-0 z-50 border-b',
      isNight ? 'bg-[#1a1a2e] border-gray-700' : 'bg-white border-gray-200',
    )}>
      {/* Progress bar */}
      <div className="h-0.5 bg-gray-200">
        <div
          className="h-full bg-pink-accent transition-all duration-300"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-12 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        <button
          onClick={() => router.back()}
          className={cn('flex items-center gap-1.5 text-sm flex-shrink-0', btnClass)}
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <h1 className={cn(
          'text-xs sm:text-sm font-medium truncate flex-1 text-center',
          isNight ? 'text-gray-200' : 'text-text-primary',
        )}>
          {title}
        </h1>

        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={() => setFontSize(fontSize - 2)}
            className={btnClass}
            aria-label="Decrease font size"
          >
            <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className={cn(
            'text-xs w-6 sm:w-8 text-center hidden sm:inline',
            isNight ? 'text-gray-300' : 'text-text-secondary',
          )}>
            {fontSize}
          </span>
          <button
            onClick={() => setFontSize(fontSize + 2)}
            className={btnClass}
            aria-label="Increase font size"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <div className={cn('w-px h-5 mx-1', isNight ? 'bg-gray-600' : 'bg-gray-200')} />

          <button
            onClick={() => setTheme(isNight ? 'day' : 'night')}
            className={btnClass}
            aria-label={isNight ? 'Switch to day mode' : 'Switch to night mode'}
          >
            {isNight ? <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>

          <span className={cn(
            'text-xs ml-1 tabular-nums',
            isNight ? 'text-gray-400' : 'text-text-secondary',
          )}>
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
