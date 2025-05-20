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
  // State management
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("All");
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });

  // Refs and navigation
  const navigate = useNavigate();
  const prevIndexRef = useRef(0);
  const containerRef = useRef(null);
  const buttonsRef = useRef({});
  const touchTimer = useRef(null);
  // Add these to your state declarations
  const [touchPosition, setTouchPosition] = useState(null);
  const lastActiveButtonRef = useRef({}); // Add this with other refs

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

  // Update the useEffect for button measurement
  useEffect(() => {
    if (activeOverlay) {
      // Add small delay to ensure DOM update
      requestAnimationFrame(() => {
        measureButtonPositions(activeOverlay);
      });
    }
  }, [activeOverlay]);

  // Color filter handlers
  const handleColorChange = (newColor, direction) => {
    const newIndex = colorFilters.indexOf(newColor);
    const currentIndex = colorFilters.indexOf(selectedColor);

    setSwipeDirection(direction);
    setSelectedColor(newColor);
    prevIndexRef.current = currentIndex;

    setTimeout(() => {
      const container = containerRef.current;
      const selectedBtn = container.querySelector(`[data-color="${newColor}"]`);
      if (selectedBtn) {
        const containerWidth = container.offsetWidth;
        const btnLeft = selectedBtn.offsetLeft;
        const btnWidth = selectedBtn.offsetWidth;
        const scrollLeft = btnLeft - (containerWidth / 2 - btnWidth / 2);
        container.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }, 50);
  };

  // Swipe handlers
  const handlers = useSwipeable({
    onSwiping: (e) => {
      if (["Left", "Right"].includes(e.dir)) {
        setSwipeDirection(e.dir.toLowerCase());
      }
    },
    onSwiped: (e) => {
      if (!["Left", "Right"].includes(e.dir)) return;

      const currentIndex = colorFilters.indexOf(selectedColor);
      const dir = e.dir === "Left" ? "left" : "right";
      const newIndex =
        dir === "left"
          ? Math.min(currentIndex + 1, colorFilters.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (newIndex !== currentIndex) {
        handleColorChange(colorFilters[newIndex], dir);
      }
    },
    delta: 50,
    preventScrollOnSwipe: false, // Changed from true
    trackTouch: false, // Changed from true
    trackMouse: false,
  });

  // Touch interactions
  const handleTouchStart = (dogId, e) => {
    const touch = e.touches[0];
    touchTimer.current = setTimeout(() => {
      setActiveOverlay(dogId); // This triggers re-render and useEffect
    }, 300);
  };

  const handleTouchMove = (dogId, e) => {
    if (!activeOverlay) return;
    const touch = e.touches[0];
    // Remove setTouchPosition() call unless you're using it elsewhere
    checkButtonProximity(dogId, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (dog) => {
    clearTimeout(touchTimer.current);
    if (buttonStates[dog._id]?.activeButton) {
      buttonStates[dog._id].activeButton === "profile"
        ? handleProfileAction(dog.listerId)
        : handleLocationAction(dog);
    }
    setActiveOverlay(null);
    setButtonStates((prev) => ({ ...prev, [dog._id]: null }));
  };

  // Button position tracking
  const measureButtonPositions = (dogId) => {
    const profileBtn = document.querySelector(`#profile-btn-${dogId}`);
    const locationBtn = document.querySelector(`#location-btn-${dogId}`);

    buttonsRef.current[dogId] = {
      profile: profileBtn?.getBoundingClientRect(),
      location: locationBtn?.getBoundingClientRect(),
    };
  };

  const checkButtonProximity = (dogId, x, y) => {
    const buttons = buttonsRef.current[dogId];
    if (!buttons) return;

    const activationRadius = 40;
    let activeButton = null;
    let maxScale = 1;

    Object.entries(buttons).forEach(([key, rect]) => {
      if (!rect) return;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(x - centerX, y - centerY);

      if (distance < activationRadius) {
        const scale = 1 + (1 - distance / activationRadius) * 0.5;
        if (scale > maxScale) {
          maxScale = scale;
          activeButton = key;
        }
      }
    });

    // 🔔 Trigger haptic feedback if newly hovering a button
    if (activeButton && activeButton !== lastActiveButtonRef.current[dogId]) {
      if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback
      lastActiveButtonRef.current[dogId] = activeButton;
    }

    setButtonStates((prev) => ({
      ...prev,
      [dogId]: { activeButton, scale: maxScale },
    }));
  };

  // Action handlers
  const handleProfileAction = async (listerId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/mongo/${listerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/user", { state: { user: response.data } });
    } catch (error) {
      console.error("Error fetching profile:", error);
      alert("Login to view profile");
    }
  };

  const handleLocationAction = (dog) => {
    navigate("/map", {
      state: {
        selectedDog: {
          id: dog._id,
          lat: dog.location.coordinates[1],
          lng: dog.location.coordinates[0],
        },
      },
    });
  };

  // Filter underline position
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
          className="relative flex space-x-4 overflow-x-auto hide-scrollbar">
          {colorFilters.map((color) => (
            <button
              key={color}
              data-color={color}
              onClick={() =>
                handleColorChange(
                  color,
                  colorFilters.indexOf(color) > prevIndexRef.current
                    ? "left"
                    : "right"
                )
              }
              className={`relative whitespace-nowrap py-1.5 px-3 text-base font-semibold ${
                selectedColor === color
                  ? "text-violet-600 font-extrabold"
                  : "text-black"
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
                <div
                  className="w-full bg-gray-200 rounded-xl"
                  style={{ paddingTop: `${Math.random() * 35 + 110}%` }}
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
        <div className="columns-2 sm:columns-3 lg:columns-3 space-y-2 custom-column-gap scroll-container">
          {filteredDogs.map((dog) => (
            <div
              key={dog._id}
              style={{ zIndex: activeOverlay === dog._id ? 1 : "auto" }} // Add this
              className="break-inside-avoid relative group"
              onTouchStart={(e) => handleTouchStart(dog._id, e)}
              onTouchMove={(e) => handleTouchMove(dog._id, e)}
              onTouchEnd={() => handleTouchEnd(dog)}
              onContextMenu={(e) => e.preventDefault()}>
              {/* Dog Image */}

              <img
                src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                alt={dog.type}
                className="z-0 w-full h-auto rounded-xl select-none touch-auto filter blur-sm transition-all duration-500 group-hover:blur-0"
                onLoad={(e) => {
                  e.target.classList.remove("blur-sm");
                  e.target.parentElement.style.aspectRatio = `${e.target.naturalWidth}/${e.target.naturalHeight}`;
                }}
              />

              {/* Overlay with Buttons */}
              <AnimatePresence>
                {activeOverlay === dog._id && (
                  <motion.div
                    className="z-10 absolute inset-0 bg-black/40 flex items-end justify-between p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}>
                    {/* Profile Button */}
                    <motion.div
                      id={`profile-btn-${dog._id}`}
                      className="relative z-20"
                      animate={{
                        scale:
                          buttonStates[dog._id]?.activeButton === "profile"
                            ? buttonStates[dog._id]?.scale
                            : 1,
                      }}>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src={
                            dog.lister?.dp_url ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                          }
                          className="w-full h-full object-cover"
                          alt="Profile"
                        />
                      </div>
                    </motion.div>

                    {/* Location Button */}
                    <motion.div
                      id={`location-btn-${dog._id}`}
                      className="relative z-20"
                      animate={{
                        scale:
                          buttonStates[dog._id]?.activeButton === "location"
                            ? buttonStates[dog._id]?.scale
                            : 1,
                      }}>
                      <div className="p-2 bg-white rounded-full shadow-lg">
                        <svg
                          className="w-6 h-6 text-gray-800"
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
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
