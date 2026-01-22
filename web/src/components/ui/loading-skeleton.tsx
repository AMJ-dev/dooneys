import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Card Skeleton for products, orders, etc.
export const CardSkeleton = ({ className }: { className?: string }) => (
  <div className={cn("bg-background border border-border animate-pulse", className)}>
    <div className="aspect-[3/4] bg-muted" />
    <div className="p-4 space-y-3">
      <div className="h-3 bg-muted rounded w-1/3" />
      <div className="h-4 bg-muted rounded w-2/3" />
      <div className="h-4 bg-muted rounded w-1/4" />
    </div>
  </div>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 5 }: { columns?: number }) => (
  <tr className="border-b border-border animate-pulse">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-muted rounded w-3/4" />
      </td>
    ))}
  </tr>
);

// Stats Card Skeleton
export const StatsSkeleton = () => (
  <div className="bg-background p-5 border border-border animate-pulse">
    <div className="h-3 bg-muted rounded w-1/2 mb-3" />
    <div className="h-8 bg-muted rounded w-3/4 mb-2" />
    <div className="h-3 bg-muted rounded w-2/3" />
  </div>
);

// Page Header Skeleton
export const PageHeaderSkeleton = () => (
  <div className="mb-8 animate-pulse">
    <div className="h-8 bg-muted rounded w-48 mb-2" />
    <div className="h-4 bg-muted rounded w-72" />
  </div>
);

// Product Grid Skeleton
export const ProductGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// Admin Table Skeleton
export const AdminTableSkeleton = ({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) => (
  <div className="bg-background border border-border">
    <div className="p-4 border-b border-border animate-pulse">
      <div className="h-6 bg-muted rounded w-32" />
    </div>
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          {Array.from({ length: columns }).map((_, i) => (
            <th key={i} className="p-4 text-left">
              <div className="h-4 bg-muted rounded w-20 animate-pulse" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRowSkeleton key={i} columns={columns} />
        ))}
      </tbody>
    </table>
  </div>
);

// Animated Skeleton Wrapper with fade in effect
export const AnimatedSkeleton = ({ 
  children, 
  isLoading, 
  className 
}: { 
  children: React.ReactNode; 
  isLoading: boolean;
  className?: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    className={className}
  >
    {isLoading ? children : null}
  </motion.div>
);

export { CardSkeleton as ProductSkeleton };
