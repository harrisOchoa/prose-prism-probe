
/**
 * Animation utility functions and constants for consistent animations throughout the app
 */

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  extraSlow: 800
};

export const ANIMATION_TYPES = {
  fadeIn: 'animate-fade-in',
  fadeOut: 'animate-fade-out',
  scaleIn: 'animate-scale-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse-subtle',
};

/**
 * Get animation classes based on state
 */
export const getAnimationForState = (status: string): string => {
  switch (status) {
    case 'loading':
      return 'animate-pulse-subtle';
    case 'rate_limited':
      return 'animate-pulse text-amber-500';
    case 'error':
      return 'animate-shake text-red-500';
    case 'success':
      return 'animate-scale-in text-green-500';
    case 'idle':
    default:
      return '';
  }
};

/**
 * Helper to combine multiple animation classes
 */
export const combineAnimations = (...classes: string[]): string => {
  return classes.filter(Boolean).join(' ');
};
