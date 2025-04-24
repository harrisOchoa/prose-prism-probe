
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a number to ensure it has two digits by adding a leading zero if necessary.
 * @param value The number to format
 * @returns A string representation of the number with at least two digits
 */
export function formatTime(value: number): string {
  return value.toString().padStart(2, '0');
}
