import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
}

export const usePerformanceMonitor = () => {
  const metricsRef = useRef<Partial<PerformanceMetrics>>({});

  useEffect(() => {
    // Track page load time
    const loadTime = performance.now();
    metricsRef.current.loadTime = loadTime;

    // Track DOM Content Loaded
    const handleDOMContentLoaded = () => {
      metricsRef.current.domContentLoaded = performance.now();
    };

    // Track First Paint and First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-paint') {
          metricsRef.current.firstPaint = entry.startTime;
        } else if (entry.name === 'first-contentful-paint') {
          metricsRef.current.firstContentfulPaint = entry.startTime;
        } else if (entry.entryType === 'largest-contentful-paint') {
          metricsRef.current.largestContentfulPaint = entry.startTime;
        }
      }
    });

    observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

    document.addEventListener('DOMContentLoaded', handleDOMContentLoaded);

    return () => {
      observer.disconnect();
      document.removeEventListener('DOMContentLoaded', handleDOMContentLoaded);
    };
  }, []);

  const getMetrics = () => metricsRef.current;

  const logMetrics = () => {
    const metrics = getMetrics();
    console.log('Performance Metrics:', metrics);

    // Send to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_performance', {
        custom_map: { metric1: 'load_time' },
        metric1: metrics.loadTime
      });
    }
  };

  return { getMetrics, logMetrics };
};

export default usePerformanceMonitor;
