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
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 }); // Track touch position
  const [isInteracting, setIsInteracting] = useState(false); // Track active interaction

  const { getAccessTokenSilently } = useAuth0();

  // Refs and navigation
  const navigate = useNavigate();
  const prevIndexRef = useRef(0);
  const containerRef = useRef(null);
  const buttonsRef = useRef({});
  const touchTimer = useRef(null);
  const lastActiveButtonRef = useRef({});
  const colorButtonsRef = useRef({});
  const viewportWidth = useRef(window.innerWidth);
  const viewportHeight = useRef(window.innerHeight);
  const scrollPositionRef = useRef(0);
  const swipeLockedRef = useRef(false); // Reference to track if swipe is locked

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

  // Set viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      viewportWidth.current = window.innerWidth;
      viewportHeight.current = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent scrolling when overlay is active
  useEffect(() => {
    const handleScroll = (e) => {
      if (activeOverlay || isInteracting) {
        // Store scroll position before preventing default
        scrollPositionRef.current = window.scrollY;
        window.scrollTo(0, scrollPositionRef.current);
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const disableTouchMove = (e) => {
      if (activeOverlay || isInteracting) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const options = { passive: false };

    if (activeOverlay || isInteracting) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.top = `-${scrollPositionRef.current}px`;

      window.addEventListener("scroll", handleScroll, options);
      window.addEventListener("touchmove", disableTouchMove, options);

      // Lock swipe functionality when overlay is active
      swipeLockedRef.current = true;
    } else {
      if (document.body.style.position === "fixed") {
        const scrollY = parseInt(document.body.style.top || "0", 10) * -1;
        document.body.style.position = "";
        document.body.style.width = "";
        document.body.style.top = "";
        document.body.style.overflow = "";
        document.body.style.touchAction = "";
        window.scrollTo(0, scrollY);
      }

      // Unlock swipe functionality when overlay is inactive
      swipeLockedRef.current = false;
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.top = "";
      window.removeEventListener("scroll", handleScroll, options);
      window.removeEventListener("touchmove", disableTouchMove, options);
    };
  }, [activeOverlay, isInteracting]);

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
      // Don't process swipes if locked (during overlay or long press)
      if (swipeLockedRef.current) return;

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
    delta: 30, // Lower swipe distance threshold for better sensitivity
    preventDefaultTouchmoveEvent: false,
    trackTouch: true,
    trackMouse: false,
    rotationAngle: 0,
  });

  // Touch interactions
  const handleTouchStart = (dogId, e) => {
    // Save touch position to determine which side of the screen the image is on
    if (e.touches && e.touches[0]) {
      const touch = e.touches[0];
      setTouchPosition({
        x: touch.clientX,
        y: touch.clientY,
      });

      // Prevent default to avoid unintended scrolling during long press
      e.preventDefault();
      e.stopPropagation();
      setIsInteracting(true);

      // Lock swipe functionality during long press detection
      swipeLockedRef.current = true;
    }

    touchTimer.current = setTimeout(() => {
      setActiveOverlay(dogId);
      // Store current scroll position
      scrollPositionRef.current = window.scrollY;
    }, 700);
  };

  // Optimized button proximity check with throttling
  const checkButtonProximity = useCallback(
    throttle((dogId, x, y) => {
      const buttons = buttonsRef.current[dogId];
      if (!buttons) return;

      const activationRadius = 60; // Increased activation radius
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
    if (!activeOverlay) {
      // If we're in the process of determining a long press, prevent scrolling
      if (touchTimer.current) {
        e.preventDefault();
        e.stopPropagation();
      }
      return;
    }

    // Prevent default to stop scrolling
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    checkButtonProximity(dogId, touch.clientX, touch.clientY);
  };

  const handleTouchEnd = (dog, e) => {
    clearTimeout(touchTimer.current);
    setIsInteracting(false);

    // Unlock swipe functionality
    setTimeout(() => {
      swipeLockedRef.current = false;
    }, 100);

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

  // Calculate button positions based on touch position
  // Now placing buttons at fixed positions relative to the touch point (3cm in each direction)
  const calculateButtonPositions = (touchX, touchY) => {
    const screenCenter = viewportWidth.current / 2;
    const isRightSide = touchX > screenCenter;

    // Setup button positions based on which side of the screen the touch is on
    // For right side of screen: buttons on left side of touch
    // For left side of screen: buttons on right side of touch

    let profileX, profileY, locationX, locationY;

    if (isRightSide) {
      // Right side touch - buttons appear at 10 and 11 o'clock
      profileX = touchX - 40; // 10 o'clock position
      profileY = touchY - 90;

      locationX = touchX - 100; // 11 o'clock position
      locationY = touchY - 30;
    } else {
      // Left side touch - buttons appear at 1 and 2 o'clock
      profileX = touchX + 40; // 2 o'clock position
      profileY = touchY - 120;

      locationX = touchX + 100; // 1 o'clock position
      locationY = touchY - 60;
    }

    // Determine if buttons are in top half or bottom half of screen
    const isTopHalf = touchY < viewportHeight.current / 2;

    return {
      isRightSide,
      isTopHalf,
      buttons: [
        { x: profileX, y: profileY, index: 0 }, // Profile button
        { x: locationX, y: locationY, index: 1 }, // Location button
      ],
    };
  };

  return (
    <div className="p-2 sm:p-4">
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
              onTouchEnd={(e) => handleTouchEnd(dog, e)}
              onContextMenu={(e) => e.preventDefault()}
              tabIndex={0}
              onKeyDown={(e) => handleKeyDown(dog, e)}
              role="button"
              aria-pressed={activeOverlay === dog._id}>
              {/* Dog Image - Increased z-index when overlay is active */}
              <img
                src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                alt={dog.type || "Dog"}
                loading="lazy"
                className="z-0 w-full h-auto rounded-xl select-none touch-auto transition-all duration-500 group-hover:blur-0"
                style={{
                  zIndex: activeOverlay === dog._id ? 50 : 0, // Higher z-index than the blur overlay (which is 40)
                  filter: activeOverlay === dog._id ? "none" : "", // Ensure no blur on the active image
                }}
                onLoad={(e) => {
                  e.target.classList.remove("blur-sm");
                  if (e.target.parentElement) {
                    e.target.parentElement.style.aspectRatio = `${e.target.naturalWidth}/${e.target.naturalHeight}`;
                  }
                }}
                onError={(e) => {
                  e.target.src = "/default-dog.png"; // Fallback image
                  e.target.classList.remove("blur-sm");
                }}
              />

              {/* Overlay when long-pressed */}
              <AnimatePresence>
                {activeOverlay === dog._id && (
                  <>
                    {/* Blur overlay - z-index 40 */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.7 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-md"
                      style={{ zIndex: 40 }}
                    />

                    {/* Button overlay - z-index higher than blur overlay */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 pointer-events-none"
                      style={{ zIndex: 60 }}>
                      {/* Get button positions based on touch point */}
                      {(() => {
                        const { isRightSide, isTopHalf, buttons } =
                          calculateButtonPositions(
                            touchPosition.x,
                            touchPosition.y
                          );

                        return (
                          <>
                            {/* Large text indicators for buttons - position based on button location */}
                            <div
                              className="fixed text-black font-bold text-4xl pointer-events-none"
                              style={{
                                left: isRightSide ? "5%" : "auto",
                                right: isRightSide ? "auto" : "5%",
                                top: isTopHalf ? "65%" : "auto", // If buttons are at top, text at bottom
                                bottom: isTopHalf ? "auto" : "55%", // If buttons are at bottom, text at top
                                transform: "translateY(-50%)",
                                opacity:
                                  buttonStates[dog._id]?.activeButton ===
                                  "profile"
                                    ? 1
                                    : 0.3,
                                transition: "opacity 0.2s ease",
                              }}>
                              LISTER'S PROFILE
                            </div>

                            <div
                              className="fixed text-black font-bold text-4xl pointer-events-none"
                              style={{
                                left: isRightSide ? "5%" : "auto",
                                right: isRightSide ? "auto" : "5%",
                                top: isTopHalf ? "75%" : "auto", // If buttons are at top, text at bottom
                                bottom: isTopHalf ? "auto" : "65%", // If buttons are at bottom, text at top
                                transform: "translateY(-50%)",
                                opacity:
                                  buttonStates[dog._id]?.activeButton ===
                                  "location"
                                    ? 1
                                    : 0.3,
                                transition: "opacity 0.2s ease",
                              }}>
                              TAKE ME THERE
                            </div>

                            {/* Buttons */}
                            {buttons.map((btn, index) => {
                              const isProfile = index === 0;
                              const isActive =
                                buttonStates[dog._id]?.activeButton ===
                                (isProfile ? "profile" : "location");
                              const buttonScale = isActive
                                ? buttonStates[dog._id]?.scale || 1
                                : 1;

                              return (
                                <motion.button
                                  key={`${dog._id}-${index}`}
                                  id={`${
                                    isProfile ? "profile" : "location"
                                  }-btn-${dog._id}`}
                                  className={`absolute rounded-full text-sm font-medium text-white shadow-lg pointer-events-auto
                                      bg-white`}
                                  style={{
                                    left: btn.x,
                                    top: btn.y,
                                    width: 60,
                                    height: 60,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    transform: `scale(${buttonScale})`,
                                    transition: "transform 0.2s ease",
                                  }}
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0 }}
                                  transition={{ delay: index * 0.05 }}>
                                  <span className="sr-only">
                                    {isProfile
                                      ? "View Lister's Profile"
                                      : "View Location"}
                                  </span>
                                  {isProfile ? (
                                    <img
                                      src={
                                        dog.lister?.dp_url ||
                                        "/default-profile.png"
                                      }
                                      alt="User DP"
                                      className="w-full h-full object-cover rounded-full"
                                    />
                                  ) : (
                                    <svg
                                      className="w-5 h-5 text-violet-600"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24">
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
                                  )}
                                </motion.button>
                              );
                            })}
                          </>
                        );
                      })()}
                    </motion.div>
                  </>
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
