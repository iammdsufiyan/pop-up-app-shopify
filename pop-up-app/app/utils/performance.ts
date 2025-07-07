// 🚀 PERFORMANCE OPTIMIZATION UTILITIES

import { useCallback, useRef, useEffect, useState } from "react";

// 🚀 OPTIMIZATION: Debounce hook for API calls
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    }) as T,
    [callback, delay]
  );
}

// 🚀 OPTIMIZATION: Throttle hook for frequent events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef(Date.now());
  
  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
}

// 🚀 OPTIMIZATION: Local storage with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing to localStorage key "${key}":`, error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }
};

// 🚀 OPTIMIZATION: Performance monitoring
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();
  
  static start(label: string): void {
    this.marks.set(label, performance.now());
  }
  
  static end(label: string): number {
    const startTime = this.marks.get(label);
    if (!startTime) {
      console.warn(`Performance mark "${label}" not found`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    console.log(`⚡ ${label}: ${duration.toFixed(2)}ms`);
    this.marks.delete(label);
    return duration;
  }
  
  static measure(label: string, fn: () => void): number {
    this.start(label);
    fn();
    return this.end(label);
  }
}

// 🚀 OPTIMIZATION: Error boundary utility
export interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export const logError = (error: Error, errorInfo?: any): void => {
  const errorData: ErrorInfo = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
  };
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('🚨 Error logged:', errorData, errorInfo);
  }
  
  // In production, you might want to send to an error tracking service
  // Example: Sentry, LogRocket, etc.
};

// 🚀 OPTIMIZATION: Memory usage monitoring
export const getMemoryUsage = (): string => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return `Used: ${(memory.usedJSHeapSize / 1048576).toFixed(2)}MB / Total: ${(memory.totalJSHeapSize / 1048576).toFixed(2)}MB`;
  }
  return 'Memory info not available';
};

// 🚀 OPTIMIZATION: Network status monitoring
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  return isOnline;
}

// 🚀 OPTIMIZATION: Intersection Observer hook for lazy loading
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    
    observer.observe(element);
    
    return () => observer.disconnect();
  }, [elementRef, options]);
  
  return isIntersecting;
}