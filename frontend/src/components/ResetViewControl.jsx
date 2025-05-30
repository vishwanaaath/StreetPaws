import { useMap, useMapEvents } from "react-leaflet";
import { useState } from "react";
import { LocateFixed } from "lucide-react";

function ResetViewControl({ initialPosition, initialZoom }) {
  const map = useMap();
  const [showReset, setShowReset] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(initialPosition);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  useMapEvents({
    moveend: () => {
      const newCenter = map.getCenter();
      if (
        newCenter.lat !== currentPosition[0] ||
        newCenter.lng !== currentPosition[1]
      ) {
        setShowReset(true);
      }
    },
    zoomend: () => {
      if (map.getZoom() !== currentZoom) {
        setShowReset(true);
      }
    },
  });

  const resetView = () => {
    map.flyTo(initialPosition, initialZoom);
    setShowReset(false);
  };

  return showReset ? (
    <div className="leaflet-bottom leaflet-right">
      <div className="leaflet-control">
        <button
          onClick={resetView}
          className=" sm:mb-15 mb-40 mr-4 sm:mr-3 backdrop-blur-sm bg-white/80 rounded-full   "
          title="Reset to original view">
          <LocateFixed className="w-10 p-2  cursor-pointer h-10 " />
        </button>
      </div>
    </div>
  ) : null;
}

export default ResetViewControl;
