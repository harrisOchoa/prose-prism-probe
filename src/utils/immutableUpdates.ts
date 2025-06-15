
/**
 * Immutable update utilities to replace deep copying
 */

export const createImmutableUpdate = <T>(original: T, updates: Partial<T>): T => {
  if (!original || typeof original !== 'object') {
    return { ...updates } as T;
  }
  
  return {
    ...original,
    ...updates
  };
};

export const createDeepUpdate = <T>(original: T, path: string[], value: any): T => {
  if (path.length === 0) return value;
  
  const [head, ...tail] = path;
  const currentValue = (original as any)?.[head];
  
  return {
    ...original,
    [head]: tail.length === 0 ? value : createDeepUpdate(currentValue || {}, tail, value)
  } as T;
};

export const mergeAssessmentData = <T extends Record<string, any>>(
  original: T, 
  updates: Partial<T>
): T => {
  // Special handling for arrays that shouldn't be overwritten with empty arrays
  const filteredUpdates = Object.entries(updates).reduce((acc, [key, value]) => {
    if (Array.isArray(value) && value.length === 0 && Array.isArray(original[key]) && original[key].length > 0) {
      // Don't overwrite existing array with empty array
      return acc;
    }
    if (value !== null && value !== undefined && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {} as any);

  return createImmutableUpdate(original, filteredUpdates);
};
