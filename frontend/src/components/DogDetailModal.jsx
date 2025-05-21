import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Heart, Share2, MapPin } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import axios from "axios";

const DogDetailModal = ({
  isOpen,
  onClose,
  dog,
  onLike,
  filteredDogs = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef(null);
  const contentRef = useRef(null);
  const [placeName, setPlaceName] = useState("");
  const [distance, setDistance] = useState(null); // Optional distance calculation

  const currentDog = filteredDogs[currentIndex];

  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToDog("next"),
    onSwipedRight: () => navigateToDog("prev"),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
  });

  useEffect(() => {
    if (dog && filteredDogs?.length) {
      const index = filteredDogs.findIndex((d) => d?._id === dog?._id);
      setCurrentIndex(Math.max(index, 0));
    }
  }, [dog, filteredDogs]);

  const navigateToDog = (direction) => {
    setCurrentIndex((prev) => {
      if (direction === "next")
        return Math.min(prev + 1, filteredDogs.length - 1);
      if (direction === "prev") return Math.max(prev - 1, 0);
      return prev;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") navigateToDog("next");
      if (e.key === "ArrowLeft") navigateToDog("prev");
      if (e.key === "Escape") onClose();
    };

    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const fetchPlace = async () => {
      if (currentDog?.location?.coordinates) {
        const [lng, lat] = currentDog.location.coordinates;
        const name = await getPlaceName(lat, lng);
        setPlaceName(name);
        // Optional: Calculate distance from a fixed point or user location here
      }
    };
    fetchPlace();
  }, [currentDog]);

  const getPlaceName = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            "User-Agent": "StreetPaws/1.0 (vishwanathgowda951@gmail.com)",
          },
        }
      );

      const address = response.data.address;
      return (
        address.neighbourhood ||
        address.suburb ||
        address.village ||
        address.city_district ||
        " "
      );
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Nearby area";
    }
  };

  const logSwipe = (direction) => {
    console.log(`Swiped ${direction}`);
    navigateToDog(direction);
  };

  if (!currentDog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          ref={modalRef}>
          <div className="min-h-full w-full" ref={contentRef} {...handlers}>
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg">
              <X size={28} />
            </button>

            <div className="w-full">
              {/* Image Section */}
              <div className="w-full h-[70vh] relative bg-gray-100">
                <motion.img
                  key={currentDog._id}
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                  alt={currentDog.type}
                  className="w-full h-full rounded-4xl object-cover"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ objectPosition: "center" }}
                />

                <div className="absolute inset-0 flex pointer-events-none">
                  <button
                    className="w-1/2 h-full opacity-0 pointer-events-auto"
                    onClick={() => logSwipe("prev")}
                    aria-label="Previous dog"
                  />
                  <button
                    className="w-1/2 h-full opacity-0 pointer-events-auto"
                    onClick={() => logSwipe("next")}
                    aria-label="Next dog"
                  />
                </div>
              </div>

              {/* Main Content */}
              <div className="p-6 max-w-2xl mx-auto">
                {/* Top Layout: Place + DP */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />
                      <span>{placeName || "Nearby area"}</span>
                      {distance && (
                        <span className="text-sm text-gray-500 ml-2">
                          • {distance} km
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 text-gray-800 text-sm">
                      <span className="font-medium">{currentDog.type}</span>
                      <span>{currentDog.gender}</span>
                      <span>{currentDog.age}</span>
                    </div>
                  </div>

                  {/* DP */}
                  <img
                    src={currentDog.lister?.dp_url || "/default-avatar.png"}
                    alt="Lister"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                </div>

                {/* Description */}
                {currentDog.description && (
                  <p className="text-gray-700 mb-6 leading-relaxed">
                    {currentDog.description}
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 border-t pt-6 pb-12">
                  <button
                    onClick={() => onLike(currentDog._id)}
                    className="flex items-center gap-2 text-gray-600 hover:text-violet-600">
                    <Heart
                      size={24}
                      className={
                        currentDog.isLiked
                          ? "fill-violet-600 text-violet-600"
                          : ""
                      }
                    />
                    Like
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-violet-600">
                    <Share2 size={24} />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="space-y-1">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || "Unknown"}</p>
  </div>
);

export default DogDetailModal;
