// src/lib/performance.ts
// Performance optimization utilities to prevent forced reflows

/**
 * Debounce function to limit the rate of function execution
 * Useful for search inputs and resize handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function execution to once per interval
 * Useful for scroll handlers and animation callbacks
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Request animation frame wrapper for smooth animations
 * Prevents forced reflows by batching DOM updates
 */
export function requestAnimationFrameSafe(callback: () => void): void {
  if (typeof window !== 'undefined' && window.requestAnimationFrame) {
    window.requestAnimationFrame(callback);
  } else {
    setTimeout(callback, 16); // ~60fps fallback
  }
}

/**
 * Batch DOM updates to prevent multiple reflows
 * Collects multiple DOM operations and executes them in a single frame
 */
export class DOMBatcher {
  private pendingUpdates: (() => void)[] = [];
  private scheduled = false;

  add(update: () => void): void {
    this.pendingUpdates.push(update);
    if (!this.scheduled) {
      this.scheduled = true;
      requestAnimationFrameSafe(() => {
        this.flush();
      });
    }
  }

  private flush(): void {
    const updates = this.pendingUpdates;
    this.pendingUpdates = [];
    this.scheduled = false;
    
    updates.forEach(update => update());
  }
}

/**
 * Create a DOM batcher instance
 */
export const domBatcher = new DOMBatcher();

/**
 * Optimize array operations by avoiding unnecessary iterations
 * Returns early if no search query is provided
 */
export function optimizeArrayFilter<T>(
  items: T[],
  searchQuery: string,
  filterFn: (item: T, searchLower: string) => boolean
): T[] {
  if (!searchQuery.trim()) {
    return items;
  }
  
  const searchLower = searchQuery.toLowerCase();
  return items.filter(item => filterFn(item, searchLower));
}

/**
 * Memoize expensive calculations
 * Useful for complex filtering and sorting operations
 */
export function createMemoizedFilter<T>(
  filterFn: (items: T[], ...args: any[]) => T[]
) {
  const cache = new Map<string, T[]>();
  
  return (items: T[], ...args: any[]): T[] => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key)!;
    }
    
    const result = filterFn(items, ...args);
    cache.set(key, result);
    
    // Clear cache if it gets too large
    if (cache.size > 100) {
      cache.clear();
    }
    
    return result;
  };
}

/**
 * Prevent layout thrashing by using CSS containment
 * Applies contain property to elements that don't affect layout
 */
export function applyLayoutContainment(element: HTMLElement): void {
  if (element) {
    element.style.contain = 'layout style paint';
  }
}

/**
 * Use transform3d for hardware acceleration
 * Prevents forced reflows during animations
 */
export function enableHardwareAcceleration(element: HTMLElement): void {
  if (element) {
    element.style.transform = 'translate3d(0, 0, 0)';
    element.style.backfaceVisibility = 'hidden';
    element.style.perspective = '1000px';
  }
}

/**
 * Optimize scroll performance
 * Uses passive event listeners and throttling
 */
export function optimizeScrollPerformance(
  element: HTMLElement,
  callback: (event: Event) => void,
  throttleMs: number = 16
): () => void {
  const throttledCallback = throttle(callback, throttleMs);
  
  element.addEventListener('scroll', throttledCallback, { passive: true });
  
  return () => {
    element.removeEventListener('scroll', throttledCallback);
  };
}

/**
 * Batch state updates to prevent multiple re-renders
 * Useful for complex state management
 */
export function batchStateUpdates<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  updates: Array<(prev: T) => T>
): void {
  setState(prev => {
    return updates.reduce((acc, update) => update(acc), prev);
  });
}

/**
 * Create a stable reference for objects
 * Prevents unnecessary re-renders in React components
 */
export function createStableReference<T extends object>(
  obj: T
): T {
  const ref = { current: obj };
  
  // This would typically be used with useMemo or useCallback
  return ref.current;
}
