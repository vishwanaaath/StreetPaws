import React, { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { X, Heart, Share2, MoreHorizontal, MapPin } from "lucide-react";

const DogDetailModal = ({ isOpen, onClose, dog, onLike }) => {
  const modalRef = useRef(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scrolling when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "auto";
    };
  }, [isOpen, onClose]);

  // Format date to be more readable
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy");
    } catch (error) {
      return "Unknown date";
    }
  };

  if (!dog) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}>
          <motion.div
            ref={modalRef}
            className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl overflow-hidden flex flex-col md:flex-row"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 left-3 z-10 bg-white rounded-full p-2 shadow-md"
              aria-label="Close modal">
              <X size={20} />
            </button>

            {/* Image section */}
            <div className="w-full md:w-1/2 h-72 md:h-auto relative">
              <img
                src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                alt={dog.type || "Dog"}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "/default-dog.png"; // Fallback image
                }}
              />
            </div>

            {/* Details section */}
            <div className="w-full md:w-1/2 p-4 md:p-6 overflow-y-auto flex flex-col">
              {/* User info */}
              <div className="flex items-center gap-3 mb-4">
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

              {/* Dog content - title or "boop" */}
              <h2 className="text-2xl font-bold mb-1">boop</h2>

              {/* Dog details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
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

              {/* Posted date */}
              <p className="text-gray-500 text-sm mb-4">
                Posted {formatDate(dog.createdAt)}
              </p>

              {/* Action buttons */}
              <div className="flex justify-between mt-auto pt-4 border-t border-gray-200">
                <button
                  onClick={() => onLike(dog._id)}
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DogDetailModal;
