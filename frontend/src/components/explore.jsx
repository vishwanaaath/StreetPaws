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
  const containerRef = useRef(null);
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });

  // Swipe handlers
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === "Left" || e.dir === "Right") {
        setSwipeDirection(e.dir === "Left" ? "left" : "right");
      }
    },
    onSwiped: (e) => {
      if (e.dir !== "Left" && e.dir !== "Right") return; // Ignore vertical swipes

      const currentIndex = colorFilters.indexOf(selectedColor);
      const dir = e.dir === "Left" ? "left" : "right";
      const newIndex =
        dir === "left"
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
        setDogsData(
          response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
        );
      } catch (err) {
        setFetchError(err.response?.data?.message || "Error fetching dogs");
      } finally {
        setLoading(false);
      }
    };
    fetchDogs();
  }, []);

  // Update underline position
  useEffect(() => {
    const selectedBtn = containerRef.current?.querySelector(
      `[data-color="${selectedColor}"]`
    );
    if (selectedBtn) {
      const { offsetLeft, offsetWidth } = selectedBtn;
      setUnderlineProps({ left: offsetLeft, width: offsetWidth });
    }
  }, [selectedColor]);

  const filteredDogs = dogsData.filter(
    (dog) => selectedColor === "All" || dog.type === selectedColor
  );

  const swipeVariants = {
    enter: (direction) => ({
      x: direction === "left" ? 100 : -100,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === "left" ? -100 : 100,
      opacity: 0,
    }),
  };

  return (
    <div {...handlers} className="p-2 sm:p-4">
      {/* Filter Header with animated underline */}
      <div className="sticky top-0 z-20 bg-white pb-2 sm:pb-4 ">
        <div
          ref={containerRef}
          className="relative flex space-x-4 cursor-pointer overflow-x-auto hide-scrollbar">
          {colorFilters.map((color) => (
            <button
              key={color}
              data-color={color}
              onClick={() => {
                const newIndex = colorFilters.indexOf(color);
                setSwipeDirection(
                  newIndex > prevIndexRef.current ? "left" : "right"
                );
                prevIndexRef.current = colorFilters.indexOf(selectedColor);
                setSelectedColor(color);
              }}
              className={`relative whitespace-nowrap py-1.5 px-3 text-base ${
                selectedColor === color
                  ? "text-violet-600 font-extrabold"
                  : "text-gray-500 font-bold hover:text-gray-600"
              }`}>
              {color}
            </button>
          ))}

          {/* Sliding underline */}
          <motion.div
            className="absolute bottom-0 h-0.5 bg-violet-600 rounded"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ left: underlineProps.left, width: underlineProps.width }}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="columns-2 sm:columns-3 lg:columns-3  custom-column-gap animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid h-48 image-item bg-gray-200 rounded-xl"
            />
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
            className="columns-2 sm:columns-3 lg:columns-3 space-y-2 custom-column-gap">
            {filteredDogs.map((dog) => (
              <div key={dog._id} className="break-inside-avoid image-item">
                <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                  <img
                    src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                    alt={dog.type}
                    className="w-full h-auto object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 sm:p-4 p-2">
                    <div className="flex justify-end items-end">
                      <button
                        onClick={() =>
                          navigate("/map", {
                            state: {
                              selectedDog: {
                                id: dog._id,
                                lat: dog.location.coordinates[1],
                                lng: dog.location.coordinates[0],
                              },
                            },
                          })
                        }
                        className="text-white cursor-pointer hover:text-violet-100 transition-colors">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
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
