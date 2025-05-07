import { useMap, useMapEvents } from "react-leaflet";
import { useState } from "react";

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
          className=" sm:mb-15 mb-40 mr-4 sm:mr-3  bg-[#F7F6F1] rounded-full   "
          title="Reset to original view">
          <img
            src="./images/locate.svg"
            className="w-10 p-2 invert-100 cursor-pointer h-10 "
            alt="Reload"
          />
        </button>
      </div>
    </div>
  ) : null;
}

export default ResetViewControl;
