import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, MapPin, Clock, User } from "lucide-react";
import { useSwipeable } from "react-swipeable";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
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
        "Nearby area"
      );
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Nearby area";
    }
  };

  const formatPostedDate = (dateString) => {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isToday(date)) {
      return `Today at ${format(date, "h:mm a")}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, "h:mm a")}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const logSwipe = (direction) => {
    console.log(`Swiped ${direction}`);
    navigateToDog(direction);
  };

  if (!currentDog) return null;

  const isTallImage = imageAspectRatio !== null && imageAspectRatio <= 9 / 16;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          ref={modalRef}>
          <div className="min-h-full w-full" ref={contentRef} {...handlers}>
            {/* Enhanced Close Button */}
            <button
              onClick={onClose}
              className="fixed top-6 left-6 z-50 p-3 bg-white/95 backdrop-blur-sm 
                         rounded-full shadow-xl border border-gray-100
                         hover:bg-white hover:scale-105 transition-all duration-200">
              <X size={20} className="text-gray-700" />
            </button>

            <div className="w-full">
              {/* Enhanced Image Section */}
              <div
                className={`w-full ${
                  isTallImage ? "h-[75vh]" : "h-auto"
                } relative bg-gradient-to-br from-gray-50 to-gray-100`}>
                <motion.img
                  key={currentDog._id}
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                  alt={currentDog.type}
                  className="w-full h-full object-cover"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  style={{ objectPosition: "center" }}
                />

                {/* Gradient Overlay for better text readability */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-32 
                              bg-gradient-to-t from-black/30 via-transparent to-transparent"
                />

                {/* Navigation Areas */}
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

              {/* Enhanced Content Section */}
              <div className="px-6 py-6 bg-white">
                {/* Main Info Row */}
                <div className="flex justify-between items-start mb-4">
                  {/* Left Content */}
                  <div className="flex-1 pr-6">
                    {/* Dog Name/Type */}
                    <motion.h1
                      className="text-2xl font-bold text-gray-900 mb-2 capitalize tracking-tight"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}>
                      {currentDog.type}
                    </motion.h1>

                    {/* Dog Details */}
                    <motion.div
                      className="flex items-center gap-4 mb-3 text-gray-600"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}>
                      <span className="font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {currentDog.gender}
                      </span>
                      <span className="font-semibold capitalize bg-gray-100 px-3 py-1 rounded-full text-sm">
                        {currentDog.age}
                      </span>
                    </motion.div>

                    {/* Location */}
                    <motion.div
                      className="flex items-center gap-2 mb-3"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}>
                      <MapPin
                        size={18}
                        className="text-violet-600 flex-shrink-0"
                      />
                      <span className="font-medium text-gray-700 text-sm">
                        {currentDog.placeName ||
                          placeName ||
                          "Location not available"}
                      </span>
                    </motion.div>

                    {/* Posted Date */}
                    {currentDog.createdAt && (
                      <motion.div
                        className="flex items-center gap-2 text-gray-500"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}>
                        <Clock size={16} className="flex-shrink-0" />
                        <span className="text-sm font-medium">
                          {formatPostedDate(currentDog.createdAt)}
                        </span>
                      </motion.div>
                    )}
                  </div>

                  {/* Lister Profile */}
                  <motion.div
                    className="flex flex-col items-center gap-3"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.6 }}>
                    <div className="relative">
                      <img
                        src={currentDog.lister?.dp_url || "/default-avatar.png"}
                        alt="Lister"
                        className="w-16 h-16 rounded-full object-cover border-3 border-white shadow-lg"
                      />
                      <div
                        className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 
                                    rounded-full border-2 border-white"
                      />
                    </div>
                    {currentDog.lister?.name && (
                      <span className="text-xs font-semibold text-gray-600 text-center max-w-20 leading-tight">
                        {currentDog.lister.name.split(" ")[0]}
                      </span>
                    )}
                  </motion.div>
                </div>

                {/* Action Bar */}
                <motion.div
                  className="flex items-center justify-between pt-4 border-t border-gray-100"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7 }}>
                  {/* Like Button */}
                  <button
                    onClick={() => onLike(currentDog._id)}
                    className={`flex items-center gap-3 px-6 py-3 rounded-full font-semibold
                               transition-all duration-300 transform hover:scale-105 ${
                                 currentDog.isLiked
                                   ? "bg-pink-50 text-pink-600 border-2 border-pink-200"
                                   : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200"
                               }`}>
                    <Heart
                      size={20}
                      className={currentDog.isLiked ? "fill-current" : ""}
                    />
                    <span>{currentDog.isLiked ? "Liked" : "Like"}</span>
                  </button>

                  {/* Contact Button */}
                  <button
                    className="flex items-center gap-3 px-6 py-3 bg-violet-600 text-white 
                                   rounded-full font-semibold hover:bg-violet-700 
                                   transition-all duration-300 transform hover:scale-105 shadow-lg">
                    <User size={18} />
                    <span>Contact</span>
                  </button>
                </motion.div>

                {/* Additional Info */}
                {currentDog.description && (
                  <motion.div
                    className="mt-6 pt-6 border-t border-gray-100"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}>
                    <h3 className="font-semibold text-gray-900 mb-2">About</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {currentDog.description}
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DogDetailModal;
