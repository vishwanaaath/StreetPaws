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
  // Update the aspect ratio check
  const isTallImage = imageAspectRatio !== null && imageAspectRatio <= 9 / 16; // 9:16 aspect ratio (0.5625)

  // This will only apply 70vh height to images that are 9:16 or taller
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
              <X size={20} />
            </button>

            <div className="w-full">
              {/* Image Section */}

              <div
                className={`w-full ${
                  isTallImage ? "h-[80vh]" : "h-auto"
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

              {/* Combined Content Section */}
              <div className="flex justify-between items-start px-4 pt-3 pb-2">
                {/* Left Content Group */}
                <div className="flex flex-col gap-1 flex-1">
                  {/* Like and Location Row */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onLike(currentDog._id)}
                      className="flex items-center gap-2 text-black hover:text-pink-500 transition">
                      <Heart
                        size={22}
                        className={
                          currentDog.isLiked
                            ? "fill-pink-500 text-pink-500"
                            : ""
                        }
                      />
                    </button>

                    <div className="flex items-center gap-1 text-black">
                      <MapPin size={20} className="text-violet-600" />
                      <span className="font-semibold text-base">
                        {currentDog.placeName || "no place "}
                      </span>
                    </div>
                  </div>

                  {/* Dog Info - Type on top, gender & age below */}
                  <div className="text-black capitalize">
                    <h2 className="text-[16px] font-extrabold">
                      {currentDog.type}
                    </h2>
                    <div className="flex gap-2 text-[14px] font-bold text-black/70 mt-0.5">
                      <span>{currentDog.gender}</span>
                      <span>{currentDog.age}</span>
                    </div>
                  </div>
                </div>

                {/* Right DP done */}
                <img
                  src={currentDog.lister?.dp_url || "/default-avatar.png"}
                  alt="Lister"
                  className="w-13 h-13 rounded-full object-cover mt-2.5 shadow ml-4"
                />
              </div>

              {/* Removed redundant content section */}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DogDetailModal;
