import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import {
  X,
  Heart,
  Share2,
  MoreHorizontal,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSwipeable } from "react-swipeable";

const DogDetailModal = ({
  isOpen,
  onClose,
  dog,
  onLike,
  filteredDogs = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef(null);
  const startIndex = Array.isArray(filteredDogs)
    ? filteredDogs.findIndex((d) => d?._id === dog?._id)
    : -1;

  // Initialize current index when dog changes
  useEffect(() => {
    if (dog && Array.isArray(filteredDogs) && filteredDogs.length > 0) {
      const index = filteredDogs.findIndex((d) => d?._id === dog?._id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [dog, filteredDogs]);

  // Make sure currentIndex is valid
  const safeCurrentIndex = Math.min(
    Math.max(0, currentIndex),
    filteredDogs.length - 1
  );

  // Navigate to next/previous dog
  const navigateToDog = (direction) => {
    if (!Array.isArray(filteredDogs) || filteredDogs.length === 0) return;

    if (direction === "next" && currentIndex < filteredDogs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Enhanced swipe handlers with better sensitivity
  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToDog("next"),
    onSwipedRight: () => navigateToDog("prev"),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 50, // Swipe distance threshold
    swipeDuration: 500, // Maximum time in ms to detect a swipe
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen) {
        if (e.key === "ArrowRight") navigateToDog("next");
        else if (e.key === "ArrowLeft") navigateToDog("prev");
        else if (e.key === "Escape") onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, safeCurrentIndex, filteredDogs, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!dog || !Array.isArray(filteredDogs) || filteredDogs.length === 0)
    return null;

  const currentDog = filteredDogs[safeCurrentIndex];
  if (!currentDog) return null;

  const hasNext = safeCurrentIndex < filteredDogs.length - 1;
  const hasPrev = safeCurrentIndex > 0;

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <div
            {...handlers}
            className="h-full w-full relative overflow-hidden"
            ref={modalRef}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-20 text-white p-2 rounded-full hover:bg-white/10"
              aria-label="Close modal">
              <X size={24} />
            </button>

            {/* Navigation Controls */}
            <div className="absolute top-1/2 z-20 w-full flex justify-between transform -translate-y-1/2 px-4 pointer-events-none">
              {hasPrev && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToDog("prev");
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 pointer-events-auto">
                  <ChevronLeft size={24} />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateToDog("next");
                  }}
                  className="p-2 rounded-full bg-black/50 text-white hover:bg-black/70 pointer-events-auto">
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Navigation Dots */}
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {Array.isArray(filteredDogs) &&
                filteredDogs.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === safeCurrentIndex ? "bg-white" : "bg-gray-500"
                    }`}
                  />
                ))}
            </div>

            {/* Content Container */}
            <div className="h-full w-full flex flex-col">
              <AnimatePresence initial={false} custom={currentIndex}>
                <motion.div
                  key={safeCurrentIndex}
                  custom={safeCurrentIndex}
                  initial={{
                    opacity: 0,
                    x: safeCurrentIndex > startIndex ? 100 : -100,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: safeCurrentIndex > startIndex ? -100 : 100,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full flex flex-col">
                  {/* Image Section - Takes full height on mobile, 60% on desktop */}
                  <div className="w-full h-1/2 md:h-3/5 bg-black relative flex items-center justify-center">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                      alt={currentDog.type}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details Section - Scrollable */}
                  <div className="w-full h-1/2 md:h-2/5 bg-white p-4 md:p-6 overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            currentDog.lister?.dp_url || "/default-avatar.png"
                          }
                          alt="Lister"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold">
                            {currentDog.lister?.username || "Unknown user"}
                          </p>
                          {currentDog.location?.coordinates && (
                            <div className="flex items-center text-sm text-gray-500">
                              <MapPin size={14} className="mr-1" />
                              <span>Location available</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <MoreHorizontal className="text-gray-500" />
                    </div>

                    {/* Dog Details */}
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold">
                        {currentDog.name || "Unnamed Dog"}
                      </h2>

                      <div className="grid grid-cols-2 gap-3">
                        <DetailItem label="Type" value={currentDog.type} />
                        <DetailItem label="Age" value={currentDog.age} />
                        <DetailItem label="Gender" value={currentDog.gender} />
                        <DetailItem label="Size" value={currentDog.size} />
                      </div>

                      {currentDog.description && (
                        <p className="text-gray-700">
                          {currentDog.description}
                        </p>
                      )}

                      <p className="text-sm text-gray-500">
                        Posted{" "}
                        {format(new Date(currentDog.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4 mt-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => onLike(currentDog._id)}
                        className="flex items-center gap-2 hover:text-violet-600">
                        <Heart
                          size={20}
                          className={
                            currentDog.isLiked
                              ? "fill-violet-600 text-violet-600"
                              : ""
                          }
                        />
                        Like
                      </button>
                      <button className="flex items-center gap-2 hover:text-violet-600">
                        <Share2 size={20} />
                        Share
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailItem = ({ label, value }) => (
  <div className="py-2">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium">{value || "Unknown"}</p>
  </div>
);

export default DogDetailModal;
