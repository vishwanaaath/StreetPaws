import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Heart, Share2, MoreHorizontal, MapPin } from "lucide-react";
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

  useEffect(() => {
    if (dog && Array.isArray(filteredDogs) && filteredDogs.length > 0) {
      const index = filteredDogs.findIndex((d) => d?._id === dog?._id);
      setCurrentIndex(index >= 0 ? index : 0);
    }
  }, [dog, filteredDogs]);

  const handlers = useSwipeable({
    onSwipedLeft: () => navigateToDog("next"),
    onSwipedRight: () => navigateToDog("prev"),
    preventScrollOnSwipe: true,
    trackTouch: true,
    delta: 50,
  });

  const navigateToDog = (direction) => {
    if (!Array.isArray(filteredDogs) || filteredDogs.length === 0) return;

    setCurrentIndex((prev) => {
      if (direction === "next" && prev < filteredDogs.length - 1)
        return prev + 1;
      if (direction === "prev" && prev > 0) return prev - 1;
      return prev;
    });
  };

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
  }, [isOpen, currentIndex, filteredDogs, onClose]);

  if (!dog || !Array.isArray(filteredDogs) || filteredDogs.length === 0)
    return null;

  const currentDog = filteredDogs[currentIndex];
  if (!currentDog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-white overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}>
          <div {...handlers} className="min-h-full w-full" ref={modalRef}>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="fixed top-4 right-4 z-20 p-2 hover:bg-gray-100 rounded-full bg-white shadow-lg"
              aria-label="Close modal">
              <X size={28} />
            </button>

            {/* Image Section - Original Size */}
            <div className="w-full flex justify-center items-start">
              <img
                src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${currentDog.imageUrl}`}
                alt={currentDog.type}
                className="w-auto h-auto max-w-full object-contain"
              />
            </div>

            {/* Content Section */}
            <div className="p-6 max-w-2xl mx-auto w-full">
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
              <div className="flex gap-4 border-t pt-6">
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
