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

  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (e.dir === "Left" || e.dir === "Right") {
        setSwipeDirection(e.dir === "Left" ? "left" : "right");
      }
    },
    onSwiped: (e) => {
      if (e.dir !== "Left" && e.dir !== "Right") return;
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

  return (
    <div {...handlers} className="p-2 sm:p-4">
      {/* Filter Header */}
      <div className="sticky top-0 z-20 bg-white pb-2 sm:pb-4">
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
              className={`relative whitespace-nowrap cursor-pointer py-1.5 px-3 text-base ${
                selectedColor === color
                  ? "text-violet-600 font-extrabold"
                  : "text-black font-semibold"
              }`}>
              {color}
            </button>
          ))}

          <motion.div
            className="absolute bottom-0 h-1 bg-violet-600 rounded"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{ left: underlineProps.left, width: underlineProps.width }}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="columns-2 sm:columns-3 lg:columns-3 custom-column-gap">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid image-item animate-pulse">
              <div className="relative overflow-hidden rounded-xl group">
                {/* Dynamic aspect ratio skeleton */}
                <div
                  className="w-full bg-gray-200 rounded-xl"
                  style={{
                    // Use random realistic aspect ratios (or your most common image ratio)
                    paddingTop: `${Math.random() * 30 + 70}%`, // Generates between 60%-100% aspect ratio
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : fetchError ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="font-semibold">{fetchError}</p>
          <p>Please try again later.</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-3 space-y-2 custom-column-gap">
          {filteredDogs.map((dog) => (
            <div key={dog._id} className="break-inside-avoid image-item">
              <div className="relative overflow-hidden rounded-xl group">
                <img
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                  alt={dog.type}
                  loading="lazy"
                  className="w-full h-auto object-cover filter blur-sm transition-all duration-500 group-hover:blur-0"
                  onLoad={(e) => {
                    e.target.classList.remove("blur-sm");
                    // Optional: Add natural dimensions to maintain layout
                    e.target.parentElement.style.aspectRatio = `${e.target.naturalWidth}/${e.target.naturalHeight}`;
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
