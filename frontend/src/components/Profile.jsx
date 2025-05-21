import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MapPin } from "lucide-react";
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
  const [distance, setDistance] = useState(null);
  const [imageAspectRatio, setImageAspectRatio] = useState(null);

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
      }
    };
    fetchPlace();
  }, [currentDog]);

  // Add effect to check image dimensions
  useEffect(() => {
    if (currentDog?.imageUrl) {
      const img = new Image();
      img.onload = () => {
        const ratio = img.width / img.height;
        setImageAspectRatio(ratio);
      };
      img.src = `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`;
    }
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

  // Determine if image is tall (aspect ratio < 1 means height > width)
  const isTallImage = imageAspectRatio !== null && imageAspectRatio < 1;

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
              className="fixed top-4 left-4 z-50 p-2 bg-white rounded-full shadow-lg">
              <X size={22} />
            </button>

            <div className="w-full">
              {/* Image Section with conditional height based on aspect ratio */}
              <div
                className={`w-full ${
                  isTallImage ? "h-[70vh]" : "h-auto"
                } relative bg-gray-100`}>
                <motion.img
                  key={currentDog._id}
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                  alt={currentDog.type}
                  className="w-full h-full rounded-2xl object-cover"
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

              {/* Like and Location buttons below image */}
              <div className="flex justify-between items-center px-4 py-3 border-b">
                <div className="flex items-center gap-3">
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
                    <span className="font-medium">Like</span>
                  </button>

                  <button
                    className="flex items-center gap-2 text-gray-600 hover:text-violet-600"
                    onClick={() => {
                      if (currentDog?.location?.coordinates) {
                        // Using the SVG you provided as a component
                        // This would typically be wrapped in a navigation function
                        console.log("Navigate to map with coordinates:", {
                          id: currentDog._id,
                          lat: currentDog.location.coordinates[1],
                          lng: currentDog.location.coordinates[0],
                        });
                      }
                    }}>
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="font-medium">Location</span>
                  </button>
                </div>
              </div>

              {/* Main Content */}
              <div className="p-4 max-w-2xl mx-auto">
                {/* Top Layout: Info + Profile Picture */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex-1 space-y-2">
                    <div className="text-2xl font-bold text-black capitalize">
                      {currentDog.type}
                    </div>

                    <div className="flex gap-4 text-gray-600 text-sm">
                      <span>{currentDog.gender}</span>
                      <span>{currentDog.age}</span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                      <MapPin size={18} />
                      <span className="font-semibold text-gray-800">
                        {placeName || "Nearby area"}
                      </span>
                      {distance && (
                        <span className="text-sm text-gray-500 ml-2">
                          • {distance} km
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Profile Picture */}
                  <img
                    src={currentDog.lister?.dp_url || "/default-avatar.png"}
                    alt="Lister"
                    className="w-12 h-12 rounded-full object-cover shadow-sm"
                  />
                </div>

                {/* Description */}
                {currentDog.description && (
                  <p className="text-gray-700 mb-6 text-base leading-relaxed">
                    {currentDog.description}
                  </p>
                )}
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
