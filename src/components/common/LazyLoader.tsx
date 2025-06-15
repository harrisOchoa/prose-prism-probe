
import React, { Suspense, memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBoundary from './ErrorBoundary';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="space-y-4">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 gap-4 mt-6">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const LazyLoader: React.FC<LazyLoaderProps> = memo(({ 
  children, 
  fallback = <DefaultSkeleton />,
  className = ""
}) => {
  return (
    <div className={className}>
      <ErrorBoundary>
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
});

LazyLoader.displayName = "LazyLoader";

export default LazyLoader;
