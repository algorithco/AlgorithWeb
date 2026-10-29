import { type RefObject, useEffect } from "react";

/**
 * Keeps a line drawing's strokes and labels the same size on screen at any
 * width: sets --k on the SVG to viewBox units per CSS pixel, and the styles
 * multiply stroke widths and font sizes by it.
 */
export function useDrawingScale(
  ref: RefObject<SVGSVGElement | null>,
  viewWidth: number,
) {
  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      if (width > 0) {
        svg.style.setProperty("--k", (viewWidth / width).toFixed(3));
      }
    });
    observer.observe(svg);
    return () => observer.disconnect();
  }, [ref, viewWidth]);
}
