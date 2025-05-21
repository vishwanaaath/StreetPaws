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

const DogDetailModal = ({
  isOpen,
  onClose,
  dog,
  onLike,
  dogs,
  currentIndex,
  setCurrentIndex,
}) => {
  const modalRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Derived state for navigation
  const hasNext = dogs && currentIndex < dogs.length - 1;
  const hasPrevious = dogs && currentIndex > 0;

  // Handle navigation functions
  const handleNext = () => {
    if (hasNext && setCurrentIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && setCurrentIndex) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Close modal when clicking outside
  useEffect(() => {
    if (isOpen) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };

  // Swipe handling
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && hasNext) {
      handleNext();
    }

    if (isRightSwipe && hasPrevious) {
      handlePrevious();
    }
  };

  if (!dog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}>
          <motion.div
            ref={modalRef}
            className="relative w-full h-full flex flex-col bg-black text-white overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            {/* Navigation indicators */}
            {hasPrevious && (
              <button
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-50 rounded-full p-2"
                aria-label="Previous dog">
                <ChevronLeft size={24} />
              </button>
            )}

            {hasNext && (
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black bg-opacity-50 rounded-full p-2"
                aria-label="Next dog">
                <ChevronRight size={24} />
              </button>
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 z-30 bg-black bg-opacity-50 rounded-full p-2"
              aria-label="Close modal">
              <X size={24} color="white" />
            </button>

            {/* Swipe instruction hint - shows briefly */}
            <motion.div
              className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 bg-black bg-opacity-70 px-4 py-2 rounded-full"
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 0 }}
              transition={{ delay: 1.5, duration: 1 }}>
              <p className="text-sm text-white">Swipe to navigate</p>
            </motion.div>

            {/* Main content */}
            <div className="flex flex-col h-full">
              {/* Image section - takes up most of the screen */}
              <div className="relative w-full flex-1 flex items-center justify-center bg-black">
                <img
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                  alt={dog.type || "Dog"}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.src = "/default-dog.png"; // Fallback image
                  }}
                />
              </div>

              {/* Details sheet at bottom - draggable in a real app */}
              <div className="bg-white text-black rounded-t-3xl w-full p-6 pb-8">
                {/* Dog info header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={dog.lister?.dp_url || "/default-avatar.png"}
                      alt={dog.lister?.username || "User"}
                      className="w-10 h-10 rounded-full object-cover"
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div>
                      <p className="font-semibold">
                        {dog.lister?.username || "Unknown user"}
                      </p>
                      {dog.location && dog.location.coordinates && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1" />
                          <span>Location available</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    {formatDate(dog.createdAt)}
                  </p>
                </div>

                {/* Dog details */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h2 className="text-xl font-bold mb-2">boop</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-gray-500 text-sm">Type</p>
                      <p className="font-medium">{dog.type || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Age</p>
                      <p className="font-medium">{dog.age || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Gender</p>
                      <p className="font-medium">{dog.gender || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Adoption Status</p>
                      <p className="font-medium">
                        {dog.adopted ? "Adopted" : "Available"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLike(dog._id);
                    }}
                    className="flex items-center gap-2 hover:text-violet-600">
                    <Heart
                      size={20}
                      className={
                        dog.isLiked ? "fill-violet-600 text-violet-600" : ""
                      }
                    />
                    <span>Like</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-violet-600">
                    <Share2 size={20} />
                    <span>Share</span>
                  </button>
                  <button className="flex items-center gap-2 hover:text-violet-600">
                    <MoreHorizontal size={20} />
                    <span>More</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DogDetailModal;
