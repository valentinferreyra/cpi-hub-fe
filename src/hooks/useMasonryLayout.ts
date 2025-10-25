import { useEffect, useRef, useCallback } from 'react';

interface MasonryOptions {
  columns: number;
  gap: number;
}

export const useMasonryLayout = (items: any[], options?: MasonryOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { columns = 2, gap = 24 } = options || {};

  const calculateLayout = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    if (children.length === 0) {
      container.style.height = 'auto';
      container.style.minHeight = '200px';
      return;
    }

    // Reset all positions
    children.forEach(child => {
      child.style.position = 'absolute';
      child.style.top = '0';
      child.style.left = '0';
      child.style.width = `calc(${100 / columns}% - ${gap / 2}px)`;
      child.style.height = 'auto';
      child.style.opacity = '0';
    });

    // Wait for all images to load
    const waitForImages = (): Promise<void> => {
      return new Promise((resolve) => {
        const images = container.querySelectorAll('img');
        
        if (images.length === 0) {
          resolve();
          return;
        }

        let loadedCount = 0;
        const totalImages = images.length;

        const checkComplete = () => {
          loadedCount++;
          if (loadedCount === totalImages) {
            resolve();
          }
        };

        images.forEach(img => {
          if (img.complete && img.naturalHeight !== 0) {
            checkComplete();
          } else {
            img.addEventListener('load', checkComplete);
            img.addEventListener('error', checkComplete);
          }
        });
      });
    };

    // Calculate positions after everything is loaded
    const positionCards = async () => {
      await waitForImages();
      
      // Additional delay to ensure layout is stable
      setTimeout(() => {
        const columnHeights = new Array(columns).fill(0);
        const columnWidth = 100 / columns;

        children.forEach((child) => {
          // Find the shortest column
          const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
          const x = shortestColumnIndex * columnWidth;
          const y = columnHeights[shortestColumnIndex];

          // Position the card
          child.style.left = `${x}%`;
          child.style.top = `${y}px`;
          child.style.opacity = '1';

          // Update column height
          columnHeights[shortestColumnIndex] += child.offsetHeight + gap;
        });

        // Set container height to accommodate all cards
        const maxHeight = Math.max(...columnHeights);
        container.style.height = `${maxHeight}px`;
      }, 100);
    };

    positionCards();
  }, [items, columns, gap]);

  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      calculateLayout();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [calculateLayout]);

  return containerRef;
};
