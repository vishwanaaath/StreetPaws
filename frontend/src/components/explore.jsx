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
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("All");
  const [animationDirection, setAnimationDirection] = useState("left");
  const navigate = useNavigate();
  const previousColorRef = useRef("All");

  const filteredDogs = dogsData.filter(
    (dog) => selectedColor === "All" || dog.type === selectedColor
  );

  // Detect swipe gesture
  const handleSwipe = (dir) => {
    const currentIndex = colorFilters.indexOf(selectedColor);
    let newIndex;
    if (dir === "left") {
      newIndex = (currentIndex + 1) % colorFilters.length;
      setAnimationDirection("left");
    } else if (dir === "right") {
      newIndex = (currentIndex - 1 + colorFilters.length) % colorFilters.length;
      setAnimationDirection("right");
    }
    setSelectedColor(colorFilters[newIndex]);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
    delta: 30,
    trackTouch: true,
    trackMouse: true,
  });

  useEffect(() => {
    const fetchUserDogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/`
        );
        const sortedDogs = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDogsData(sortedDogs);
      } catch (err) {
        setFetchError(err.response?.data?.message || "Error fetching dogs");
      } finally {
        setLoading(false);
      }
    };
    fetchUserDogs();
  }, []);

  return (
    <div {...swipeHandlers} className="p-2 sm:p-4">
      {/* Swipeable Filter Header */}
      <div className="sticky top-0 z-20 bg-white pb-2 sm:pb-4">
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {colorFilters.map((color) => (
            <button
              key={color}
              onClick={() => {
                setAnimationDirection(
                  colorFilters.indexOf(color) >
                    colorFilters.indexOf(selectedColor)
                    ? "left"
                    : "right"
                );
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

      {/* Loading or Error or Empty */}
      {loading ? (
        <div className="columns-2 sm:columns-2 lg:columns-3 gap-2 space-y-4 animate-pulse">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid mb-2 h-48 bg-gray-200 rounded-xl"
            />
          ))}
        </div>
      ) : fetchError ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="font-semibold">{fetchError}</p>
          <p>Please try again later.</p>
        </div>
      ) : filteredDogs.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p>No {selectedColor.toLowerCase()} dogs posted yet.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={selectedColor}
            initial={{
              x: animationDirection === "left" ? 200 : -200,
              opacity: 0,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animationDirection === "left" ? -200 : 200, opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="columns-2 sm:columns-2 lg:columns-3 gap-2 space-y-3 sm:space-y-4">
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
                      <svg
                        className="w-5 h-5 text-white cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
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
                        }>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
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
