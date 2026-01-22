import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const PageLoadingSkeleton = ({ className }: { className?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className={cn("min-h-screen bg-background", className)}
  >
    {/* Hero Skeleton */}
    <div className="h-screen relative animate-pulse">
      <div className="absolute inset-0 bg-muted" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
      <div className="relative container mx-auto px-6 lg:px-12 pt-40">
        <div className="max-w-2xl space-y-6">
          <div className="h-4 w-32 bg-muted-foreground/20 rounded" />
          <div className="h-16 w-80 bg-muted-foreground/20 rounded" />
          <div className="h-16 w-64 bg-muted-foreground/20 rounded" />
          <div className="h-5 w-96 bg-muted-foreground/20 rounded" />
          <div className="flex gap-4 pt-4">
            <div className="h-12 w-40 bg-muted-foreground/20 rounded" />
            <div className="h-12 w-40 bg-muted-foreground/20 rounded" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

export const SectionLoadingSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("py-24 animate-pulse", className)}>
    <div className="container mx-auto px-6 lg:px-12">
      <div className="text-center mb-16 space-y-4">
        <div className="h-4 w-24 bg-muted mx-auto rounded" />
        <div className="h-10 w-64 bg-muted mx-auto rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4">
            <div className="aspect-[3/4] bg-muted rounded" />
            <div className="h-3 w-20 bg-muted rounded" />
            <div className="h-5 w-32 bg-muted rounded" />
            <div className="h-4 w-24 bg-muted rounded" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ContentLoadingSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4 animate-pulse">
    {Array.from({ length: rows }).map((_, i) => (
      <div 
        key={i} 
        className="h-4 bg-muted rounded" 
        style={{ width: `${Math.random() * 40 + 60}%` }}
      />
    ))}
  </div>
);
