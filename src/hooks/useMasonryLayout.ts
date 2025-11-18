import { useEffect, useRef, useCallback } from "react";

interface MasonryOptions {
  columns: number;
  gap: number;
}

export const useMasonryLayout = (items: any[], options?: MasonryOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Determinar columnas según ancho de pantalla
  const getResponsiveColumns = () => {
    const width = window.innerWidth;
    if (width >= 1200) return 2; // Pantallas grandes
    return 1; // Pantallas medianas y pequeñas
  };

  const { gap = 24 } = options || {};

  const calculateLayout = useCallback(() => {
    if (!containerRef.current || items.length === 0) return;

    const container = containerRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    if (children.length === 0) {
      container.style.height = "auto";
      container.style.minHeight = "200px";
      return;
    }

    // Recalcular columnas dinámicamente
    const currentColumns = getResponsiveColumns();

    children.forEach((child) => {
      child.style.position = "absolute";
      child.style.top = "0";
      child.style.left = "0";
      child.style.width = `calc(${100 / currentColumns}% - ${gap / 2}px)`;
      child.style.height = "auto";
      child.style.opacity = "0";
    });

    const waitForImages = (): Promise<void> => {
      return new Promise((resolve) => {
        const images = container.querySelectorAll("img");

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

        images.forEach((img) => {
          if (img.complete && img.naturalHeight !== 0) {
            checkComplete();
          } else {
            img.addEventListener("load", checkComplete);
            img.addEventListener("error", checkComplete);
          }
        });
      });
    };

    const positionCards = async () => {
      await waitForImages();

      setTimeout(() => {
        const currentColumns = getResponsiveColumns();
        const columnHeights = new Array(currentColumns).fill(0);
        const columnWidth = 100 / currentColumns;

        children.forEach((child) => {
          const shortestColumnIndex = columnHeights.indexOf(
            Math.min(...columnHeights)
          );
          const x = shortestColumnIndex * columnWidth;
          const y = columnHeights[shortestColumnIndex];

          child.style.left = `${x}%`;
          child.style.top = `${y}px`;
          child.style.opacity = "1";

          columnHeights[shortestColumnIndex] += child.offsetHeight + gap;
        });

        const maxHeight = Math.max(...columnHeights);
        container.style.height = `${maxHeight}px`;
      }, 100);
    };

    positionCards();
  }, [items, gap]);

  useEffect(() => {
    calculateLayout();
  }, [calculateLayout]);

  useEffect(() => {
    const handleResize = () => {
      calculateLayout();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [calculateLayout]);

  return containerRef;
};
