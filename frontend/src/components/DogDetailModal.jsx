import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Heart, Share2, MapPin } from "lucide-react";
import { useSwipeable } from "react-swipeable";

const DogDetailModal = ({
  isOpen,
  onClose,
  dog,
  onLike,
  filteredDogs = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const startIndex = Array.isArray(filteredDogs)
    ? filteredDogs.findIndex((d) => d?._id === dog?._id)
    : -1;

  useEffect(() => {
    if (dog && Array.isArray(filteredDogs) && filteredDogs.length > 0) {
      const index = filteredDogs.findIndex((d) => d?._id === dog?._id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [dog, filteredDogs]);

  const safeCurrentIndex = Math.min(
    Math.max(0, currentIndex),
    filteredDogs.length - 1
  );

  const navigateToDog = (direction) => {
    if (!Array.isArray(filteredDogs) || filteredDogs.length === 0) return;

    if (direction === "next" && currentIndex < filteredDogs.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (direction === "prev" && currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToDog("next"),
    onSwipedRight: () => navigateToDog("prev"),
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 50,
    swipeDuration: 500,
  });

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!dog || !Array.isArray(filteredDogs) || filteredDogs.length === 0)
    return null;

  const currentDog = filteredDogs[safeCurrentIndex];
  if (!currentDog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <div {...handlers} className="relative w-full h-full">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-20 text-white p-2 rounded-full hover:bg-white/10"
              aria-label="Close modal">
              <X size={24} />
            </button>

            {/* Main Dog Content */}
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
                className="absolute inset-0 flex flex-col">
                {/* Fullscreen Image */}
                <img
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                  alt={currentDog.type}
                  className="w-full h-full object-cover"
                />

                {/* Bottom Overlay */}
                <div className="absolute bottom-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent text-white p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <img
                      src={currentDog.lister?.dp_url || "/default-avatar.png"}
                      alt="Lister"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium">
                        {currentDog.lister?.username || "Unknown"}
                      </p>
                      {currentDog.location?.coordinates && (
                        <div className="flex items-center text-sm text-gray-300">
                          <MapPin size={14} className="mr-1" />
                          Location available
                        </div>
                      )}
                    </div>
                  </div>

                  <h2 className="text-xl font-bold">{currentDog.name}</h2>
                  <p className="text-sm text-gray-300">{currentDog.type}</p>
                  {currentDog.description && (
                    <p className="text-sm mt-2 text-gray-200">
                      {currentDog.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-2">
                    Posted{" "}
                    {format(new Date(currentDog.createdAt), "MMM dd, yyyy")}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-4 mt-3">
                    <button
                      onClick={() => onLike(currentDog._id)}
                      className="flex items-center gap-2 hover:text-violet-400">
                      <Heart
                        size={20}
                        className={
                          currentDog.isLiked
                            ? "fill-violet-400 text-violet-400"
                            : ""
                        }
                      />
                      Like
                    </button>
                    <button className="flex items-center gap-2 hover:text-violet-400">
                      <Share2 size={20} />
                      Share
                    </button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DogDetailModal;
