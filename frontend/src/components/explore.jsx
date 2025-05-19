import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import "./Profile.css";

const colorFilters = [
  "All",
  "Brown",
  "Black",
  "White",
  "Brown and White",
  "Black and White",
  "Unique",
];

const Explore = () => {
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("All");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const navigate = useNavigate();
  const prevIndexRef = useRef(0);

  // Improved swipe handling
  const handlers = useSwipeable({
    onSwiping: (e) => {
      setSwipeDirection(e.dir === "Left" ? "left" : "right");
    },
    onSwiped: (e) => {
      const currentIndex = colorFilters.indexOf(selectedColor);
      const dir = e.dir === "Left" ? "left" : "right";
      
      let newIndex = dir === "left" 
        ? (currentIndex + 1) % colorFilters.length
        : (currentIndex - 1 + colorFilters.length) % colorFilters.length;

      setSelectedColor(colorFilters[newIndex]);
      prevIndexRef.current = currentIndex;
    },
    delta: 50,
    preventScrollOnSwipe: true,
    trackTouch: true,
    trackMouse: false,
  });

  // Fetch dogs data
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/`
        );
        setDogsData(response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        ));
      } catch (err) {
        setFetchError(err.response?.data?.message || "Error fetching dogs");
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  // Filter dogs based on selected color
  const filteredDogs = dogsData.filter(
    (dog) => selectedColor === "All" || dog.type === selectedColor
  );

  // Animation variants
  const swipeVariants = {
    enter: (direction) => ({
      x: direction === "left" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction) => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div {...handlers} className="p-2 sm:p-4">
      {/* Filter Header */}
      <div className="sticky top-0 z-20 bg-white pb-2 sm:pb-4 shadow-sm">
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {colorFilters.map((color) => (
            <button
              key={color}
              onClick={() => {
                const newIndex = colorFilters.indexOf(color);
                setSwipeDirection(newIndex > prevIndexRef.current ? "left" : "right");
                prevIndexRef.current = colorFilters.indexOf(selectedColor);
                setSelectedColor(color);
              }}
              className={`whitespace-nowrap py-1.5 px-3 text-base transition-colors ${
                selectedColor === color
                  ? "text-violet-600 font-bold border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-gray-600"
              }`}>
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="columns-2 sm:columns-2 lg:columns-3 gap-2 space-y-4 animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="break-inside-avoid mb-2 h-48 bg-gray-200 rounded-xl" />
          ))}
        </div>
      ) : fetchError ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="font-semibold">{fetchError}</p>
          <p>Please try again later.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait" custom={swipeDirection}>
          <motion.div
            key={selectedColor}
            custom={swipeDirection}
            variants={swipeVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="columns-2 sm:columns-2 lg:columns-3 gap-2 space-y-3 sm:space-y-4"
          >
            {filteredDogs.map((dog) => (
              <div key={dog._id} className="break-inside-avoid mb-2">
                <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                  <img
                    src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                    alt={dog.type}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 sm:p-4 p-2">
                    <div className="flex justify-end items-end">
                      <button
                        onClick={() => navigate("/map", {
                          state: { selectedDog: {
                            id: dog._id,
                            lat: dog.location.coordinates[1],
                            lng: dog.location.coordinates[0],
                          }}
                        })}
                        className="text-white hover:text-violet-100 transition-colors"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Explore;