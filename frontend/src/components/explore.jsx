import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { throttle } from "lodash";
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
  const [activeOverlay, setActiveOverlay] = useState(null);
  const [buttonStates, setButtonStates] = useState({});
  const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });
  const [errorMessage, setErrorMessage] = useState(null);

  const { getAccessTokenSilently } = useAuth0();

  // Refs and navigation
  const navigate = useNavigate();
  const prevIndexRef = useRef(0);
  const containerRef = useRef(null);
  const buttonsRef = useRef({});
  const touchTimer = useRef(null);
  const lastActiveButtonRef = useRef({});
  const colorButtonsRef = useRef({});

  // Fetch dogs data with improved error handling
  useEffect(() => {
    const fetchDogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/`
        );

        if (response.data && Array.isArray(response.data)) {
          const sortedData = response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setDogsData(sortedData);
          console.log(`Fetched ${sortedData.length} dogs`);

          // Initialize refs for all dogs
          sortedData.forEach((dog) => {
            if (!lastActiveButtonRef.current[dog._id]) {
              lastActiveButtonRef.current[dog._id] = null;
            }
          });
        } else {
          throw new Error("Invalid data format received from API");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setFetchError(
          err.response?.data?.message ||
            "Error fetching dogs. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDogs();
  }, []);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (touchTimer.current) {
        clearTimeout(touchTimer.current);
      }
    };
  }, []);

  // Update button measurement
  const measureButtonPositions = useCallback((dogId) => {
    const profileBtn = document.querySelector(`#profile-btn-${dogId}`);
    const locationBtn = document.querySelector(`#location-btn-${dogId}`);

    if (profileBtn && locationBtn) {
      buttonsRef.current[dogId] = {
        profile: profileBtn.getBoundingClientRect(),
        location: locationBtn.getBoundingClientRect(),
      };
    }
  }, []);

  useEffect(() => {
    if (activeOverlay) {
      // Add small delay to ensure DOM update
      requestAnimationFrame(() => {
        measureButtonPositions(activeOverlay);
      });
    }
  }, [activeOverlay, measureButtonPositions]);

  // Initialize and update color filter button refs
  useEffect(() => {
    colorFilters.forEach((color) => {
      const button = document.querySelector(`[data-color="${color}"]`);
      if (button) {
        colorButtonsRef.current[color] = button;
      }
    });

    // Initial underline positioning
    updateUnderlinePosition();
  }, []);

  // Update underline position function
  const updateUnderlinePosition = useCallback(() => {
    const button = colorButtonsRef.current[selectedColor];
    if (button && containerRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();

      setUnderlineProps({
        left:
          buttonRect.left -
          containerRect.left +
          containerRef.current.scrollLeft,
        width: buttonRect.width,
      });
    }
  }, [selectedColor]);

  // Color filter handlers with improved position calculation
  const handleColorChange = useCallback(
    (newColor, direction) => {
      const currentIndex = colorFilters.indexOf(selectedColor);
      setSelectedColor(newColor);
      prevIndexRef.current = currentIndex;

      // Scroll to center the selected button
      setTimeout(() => {
        const container = containerRef.current;
        const button = colorButtonsRef.current[newColor];

        if (container && button) {
          const containerWidth = container.offsetWidth;
          const buttonLeft = button.offsetLeft;
          const buttonWidth = button.offsetWidth;
          const scrollLeft =
            buttonLeft - (containerWidth / 2 - buttonWidth / 2);

          container.scrollTo({ left: scrollLeft, behavior: "smooth" });

          // Update underline position after scrolling
          setTimeout(updateUnderlinePosition, 300);
        }
      }, 50);
    },
    [selectedColor, updateUnderlinePosition]
  );

  // Update underline position when selected color changes
  useEffect(() => {
    updateUnderlinePosition();
  }, [selectedColor, updateUnderlinePosition]);

  // Also update underline position on scroll
  useEffect(() => {
    const handleScroll = throttle(() => {
      updateUnderlinePosition();
    }, 100);

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [updateUnderlinePosition]);

  // Update underline position on window resize
  useEffect(() => {
    const handleResize = throttle(() => {
      updateUnderlinePosition();
    }, 100);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateUnderlinePosition]);

  // Improved swipe handlers with better sensitivity
  const handlers = useSwipeable({
    onSwiped: (e) => {
      if (!["Left", "Right"].includes(e.dir)) return;

      const currentIndex = colorFilters.indexOf(selectedColor);
      const newIndex =
        e.dir === "Left"
          ? Math.min(currentIndex + 1, colorFilters.length - 1)
          : Math.max(currentIndex - 1, 0);

      if (newIndex !== currentIndex) {
        handleColorChange(colorFilters[newIndex], e.dir.toLowerCase());
      }
    },
    delta: 50, // Swipe distance threshold
    preventDefaultTouchmoveEvent: true,
    trackTouch: true,
    trackMouse: false,
    rotationAngle: 0,
  });

  // Touch interactions
  const handleTouchStart = (dogId, e) => {
    touchTimer.current = setTimeout(() => {
      setActiveOverlay(dogId);
    }, 300);
  };

  // Optimized button proximity check with throttling
  const checkButtonProximity = useCallback(
    throttle((dogId, x, y) => {
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

      // Trigger haptic feedback if newly hovering a button
      if (activeButton && activeButton !== lastActiveButtonRef.current[dogId]) {
        try {
          if (navigator.vibrate) navigator.vibrate(10); // Haptic feedback
          lastActiveButtonRef.current[dogId] = activeButton;
        } catch (e) {
          // Vibration API not supported or permission denied
          console.log("Vibration not supported");
        }
      }

      setButtonStates((prev) => ({
        ...prev,
        [dogId]: { activeButton, scale: maxScale },
      }));
    }, 50),
    []
  );

  const handleTouchMove = (dogId, e) => {
    if (!activeOverlay) return;
    const touch = e.touches[0];
    checkButtonProximity(dogId, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (dog) => {
    clearTimeout(touchTimer.current);

    // Execute action if a button is active
    if (buttonStates[dog._id]?.activeButton) {
      if (buttonStates[dog._id].activeButton === "profile") {
        handleProfileAction(dog.listerId);
      } else if (buttonStates[dog._id].activeButton === "location") {
        handleLocationAction(dog);
      }
    }

    setActiveOverlay(null);
    setButtonStates((prev) => ({ ...prev, [dog._id]: null }));
  };

  // Keyboard handling
  const handleKeyDown = (dog, e) => {
    if (e.key === "Enter") {
      setActiveOverlay(dog._id);
    } else if (e.key === "Escape" && activeOverlay === dog._id) {
      setActiveOverlay(null);
    } else if (activeOverlay === dog._id) {
      if (e.key === "p") {
        handleProfileAction(dog.listerId);
        setActiveOverlay(null);
      } else if (e.key === "l") {
        handleLocationAction(dog);
        setActiveOverlay(null);
      }
    }
  };

  // Action handlers
  const handleProfileAction = async (listerId) => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/mongo/${listerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/user", { state: { user: response.data } });
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (error.response?.status === 401) {
        setErrorMessage("You need to log in to view this profile");
        setTimeout(() => setErrorMessage(null), 3000);
      } else {
        setErrorMessage(
          "Could not load profile information. Please try again."
        );
        setTimeout(() => setErrorMessage(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationAction = (dog) => {
    if (!dog.location || !dog.location.coordinates) {
      setErrorMessage("Location information not available for this dog");
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

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

  // Filter dogs based on selected color with fallback
  const filteredDogs = dogsData.filter(
    (dog) => selectedColor === "All" || dog.type === selectedColor
  );

  return (
    <div className="p-2 sm:p-4" {...handlers}>
      {/* Error Message Toast */}
      {errorMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
          {errorMessage}
        </div>
      )}

      {/* Filter Header */}
      <div className="sticky top-0 z-20 bg-white pb-2 sm:pb-4">
        <div
          ref={containerRef}
          className="relative flex space-x-4 overflow-x-auto hide-scrollbar swipe-container"
          {...handlers}>
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
              aria-pressed={selectedColor === color}
              aria-label={`Filter by ${color} color`}
              className={`relative whitespace-nowrap py-1.5 px-3 text-base font-semibold ${
                selectedColor === color
                  ? "text-violet-600 font-extrabold"
                  : "text-black"
              }`}>
              {color}
            </button>
          ))}
          {/* Improved underline animation */}
          <motion.div
            className="absolute bottom-0 h-1 bg-violet-600 rounded"
            initial={false}
            animate={{
              left: `${underlineProps.left}px`,
              width: `${underlineProps.width}px`,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="columns-2 sm:columns-3 lg:columns-3 custom-column-gap">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="break-inside-avoid image-item animate-pulse mb-2">
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
      ) : filteredDogs.length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          <p className="font-semibold">No dogs found for this filter</p>
          <p>Try selecting a different color filter</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-3 gap-2 custom-column-gap">
          {filteredDogs.map((dog) => (
            <div
              key={dog._id}
              style={{
                zIndex: activeOverlay === dog._id ? 10 : "auto",
                marginBottom: "8px", // Ensure consistent spacing
              }}
              className="break-inside-avoid relative group"
              onTouchStart={(e) => handleTouchStart(dog._id, e)}
              onTouchMove={(e) => handleTouchMove(dog._id, e)}
              onTouchEnd={() => handleTouchEnd(dog)}
              onContextMenu={(e) => e.preventDefault()}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(dog, e)}
              role="button"
              aria-pressed={activeOverlay === dog._id}>
              {/* Dog Image */}
              <img
                src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                alt={dog.type || "Dog"}
                loading="lazy"
                className="z-0 w-full h-auto rounded-xl select-none touch-auto filter blur-sm transition-all duration-500 group-hover:blur-0"
                onLoad={(e) => {
                  e.target.classList.remove("blur-sm");
                  if (e.target.parentElement) {
                    e.target.parentElement.style.aspectRatio = `${e.target.naturalWidth}/${e.target.naturalHeight}`;
                  }
                }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x400?text=Image+Not+Found";
                  e.target.classList.remove("blur-sm");
                }}
              />

              {/* Overlay with Buttons */}
              <AnimatePresence>
                {activeOverlay === dog._id && (
                  <motion.div
                    className="z-10 absolute inset-0 bg-black/40 flex items-end justify-between p-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    {/* Profile Button with keyboard shortcut hint */}
                    <motion.div
                      id={`profile-btn-${dog._id}`}
                      className="relative z-20"
                      animate={{
                        scale:
                          buttonStates[dog._id]?.activeButton === "profile"
                            ? buttonStates[dog._id]?.scale
                            : 1,
                      }}
                      role="button"
                      aria-label="View profile (press P)">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-white overflow-hidden">
                        <img
                          src={
                            dog.lister?.dp_url ||
                            "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                          }
                          className="w-full h-full object-cover"
                          alt="Profile"
                          onError={(e) => {
                            e.target.src =
                              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
                          }}
                        />
                      </div>
                    </motion.div>

                    {/* Location Button with keyboard shortcut hint */}
                    <motion.div
                      id={`location-btn-${dog._id}`}
                      className="relative z-20"
                      animate={{
                        scale:
                          buttonStates[dog._id]?.activeButton === "location"
                            ? buttonStates[dog._id]?.scale
                            : 1,
                      }}
                      role="button"
                      aria-label="View location (press L)">
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

      {/* Debug info (remove in production) */}
      {/* <div className="fixed bottom-0 left-0 bg-white p-2 text-xs opacity-50">
        Dogs: {dogsData.length}, Filtered: {filteredDogs.length}, Type: {selectedColor}
      </div> */}
    </div>
  );
};

export default Explore;
