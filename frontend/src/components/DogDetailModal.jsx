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
  const modalRef = useRef(null);
  const contentRef = useRef(null);

  // Fix: Move currentDog definition here so it's available throughout the component
  const currentDog = filteredDogs[currentIndex];

  // Enhanced swipe handlers with better configuration
  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToDog("next"),
    onSwipedRight: () => navigateToDog("prev"),
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: true,
    delta: 50, // Increased threshold to prevent accidental swipes
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

  // Debug function to verify swipe works
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
          {/* Single scrollable container for the entire modal */}
          <div className="min-h-full w-full" ref={contentRef} {...handlers}>
            {/* Close Button - Fixed position */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-lg">
              <X size={28} />
            </button>

            {/* Content wrapper */}
            <div className="w-full">
              {/* Image Container - Normal flow, will scroll with content */}
              <div className="w-full h-[70vh] relative bg-gray-100">
                <motion.img
                  key={currentDog._id}
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                  alt={currentDog.type}
                  className="w-full h-full object-cover"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  style={{ objectPosition: "center" }}
                />

                {/* Debug swipe overlay - transparent buttons for testing */}
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

              {/* Content Section */}
              <div className="p-6 max-w-2xl mx-auto">
                {/* User Info */}
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={currentDog.lister?.dp_url || "/default-avatar.png"}
                    alt="Lister"
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-lg">
                      {currentDog.lister?.username || "Unknown user"}
                    </p>
                    <p className="text-gray-500 text-sm">
                      {format(new Date(currentDog.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>

                {/* Dog Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <DetailItem label="Name" value={currentDog.name} />
                  <DetailItem label="Type" value={currentDog.type} />
                  <DetailItem label="Age" value={currentDog.age} />
                  <DetailItem label="Gender" value={currentDog.gender} />
                  <DetailItem label="Size" value={currentDog.size} />
                  {currentDog.location?.coordinates && (
                    <div className="col-span-2 flex items-center gap-2 text-gray-600">
                      <MapPin size={18} />
                      <span>Location available</span>
                    </div>
                  )}
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
