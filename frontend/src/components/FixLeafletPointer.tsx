import { useMap } from "react-leaflet";
import { useEffect } from "react";

export function FixLeafletPointerEvents() {
  const map = useMap();

  useEffect(() => {
    const fix = () => {
      const svg = map.getContainer().querySelector("svg");
      if (svg) {
        svg.style.pointerEvents = "auto";
      }

      map
        .getContainer()
        .querySelectorAll(".leaflet-interactive")
        .forEach((el) => {
          (el as HTMLElement).style.pointerEvents = "auto";
        });
    };

    fix();

    // Leaflet re-applies styles after async render steps
    const t1 = setTimeout(fix, 0);
    const t2 = setTimeout(fix, 200);
    const t3 = setTimeout(fix, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [map]);

  return null;
}