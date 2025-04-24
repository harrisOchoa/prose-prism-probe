
import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number; color?: string }
>(({ className, value, color, ...props }, ref) => {
  // Ensure value is always defined and between 0-100
  const safeValue = Math.max(0, Math.min(100, value || 0));
  
  return (
    <div
      ref={ref}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={safeValue}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 transition-all"
        style={{ 
          transform: `translateX(-${100 - safeValue}%)`, 
          backgroundColor: color || 'var(--progress-background, var(--primary))',
          width: '100%'
        }}
      />
    </div>
  );
})
Progress.displayName = "Progress"

export { Progress }
