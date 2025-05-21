import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Heart, Share2, MoreHorizontal, MapPin } from "lucide-react";
import { useSwipeable } from "react-swipeable";

const DogDetailModal = ({ isOpen, onClose, dog, onLike, filteredDogs }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const modalRef = useRef(null);
  const startIndex = filteredDogs.findIndex((d) => d._id === dog?._id);

  // Initialize current index when dog changes
  useEffect(() => {
    if (dog && filteredDogs) {
      const index = filteredDogs.findIndex((d) => d._id === dog._id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [dog, filteredDogs]);

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentIndex < filteredDogs.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    },
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
    delta: 30,
  });

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  if (!dog || !filteredDogs || filteredDogs.length === 0) return null;

  const currentDog = filteredDogs[currentIndex];

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-90"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <div
            {...handlers}
            className="h-full w-full relative overflow-hidden"
            ref={modalRef}>
            {/* Navigation Dots */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
              {filteredDogs.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentIndex ? "bg-white" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 text-white p-2 rounded-full hover:bg-white/10"
              aria-label="Close modal">
              <X size={24} />
            </button>

            {/* Content Container */}
            <div className="h-full w-full flex">
              <AnimatePresence initial={false} custom={currentIndex}>
                <motion.div
                  key={currentIndex}
                  custom={currentIndex}
                  initial={{
                    opacity: 0,
                    x: currentIndex > startIndex ? 100 : -100,
                  }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{
                    opacity: 0,
                    x: currentIndex > startIndex ? -100 : 100,
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-full w-full flex flex-col md:flex-row">
                  {/* Image Section */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full bg-black relative">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                      alt={currentDog.type}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Details Section */}
                  <div className="w-full md:w-1/2 h-1/2 md:h-full bg-white p-4 md:p-6 overflow-y-auto">
                    {/* User Info */}
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={currentDog.lister?.dp_url || "/default-avatar.png"}
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
