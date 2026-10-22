"use client";

import { useEffect, useRef, useState } from "react";

// Shrinks the 794px A4 sheet to fit its container. Printing ignores this (see globals.css).
export default function Fit({ children, pad = 0 }: { children: React.ReactNode; pad?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const update = () => setZoom(Math.min(1, Math.max(0.3, (el.clientWidth - pad) / 794)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [pad]);

  return (
    <div ref={ref} className="frame" style={{ zoom, width: 794, margin: "0 auto" }}>
      {children}
    </div>
  );
}
