import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-block px-2.5 py-0.5 text-xs font-medium rounded-full bg-pink-light text-pink-accent',
      className,
    )}>
      {children}
    </span>
  );
}
