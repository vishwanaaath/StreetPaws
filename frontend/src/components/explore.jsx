  import React, { useEffect, useState, useRef, useCallback } from "react";
  import { useNavigate } from "react-router-dom";
  import axios from "axios";
  import { useAuth0 } from "@auth0/auth0-react";
  import { useSwipeable } from "react-swipeable";
  import { motion } from "framer-motion";
  import { throttle } from "lodash";
  import "./Profile.css";
  import DogDetailModal from "./DogDetailModal"; // Import the modal component

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
    // State
    const [dogsData, setDogsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    const [selectedColor, setSelectedColor] = useState("All");
    const [underlineProps, setUnderlineProps] = useState({ left: 0, width: 0 });
    const [errorMessage, setErrorMessage] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDog, setSelectedDog] = useState(null);

    const { getAccessTokenSilently } = useAuth0();

    // Refs and navigation
    const navigate = useNavigate();
    const prevIndexRef = useRef(0);
    const containerRef = useRef(null);
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

        const container = containerRef.current;
        const button = colorButtonsRef.current[newColor];

        if (container && button) {
          const containerWidth = container.offsetWidth;
          const buttonLeft = button.offsetLeft;
          const buttonWidth = button.offsetWidth;
          const scrollLeft =
            buttonLeft - (containerWidth / 2 - buttonWidth / 2);

          container.scrollTo({ left: scrollLeft, behavior: "smooth" });

          requestAnimationFrame(() => {
            updateUnderlinePosition(); // More accurate than timeout
          });
        }
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
      delta: 30, // Lower swipe distance threshold for better sensitivity
      preventDefaultTouchmoveEvent: false,
      trackTouch: true,
      trackMouse: false,
      rotationAngle: 0,
    });

    // Filter dogs based on selected color with fallback
    
    const filteredDogs = React.useMemo(() => {
      return dogsData.filter(
        (dog) => selectedColor === "All" || dog.type === selectedColor
      );
    }, [dogsData, selectedColor]); 

    // Handle dog click to open modal
    const handleDogClick = (dog) => {
      setSelectedDog(dog);
      setIsModalOpen(true);
    };

    // Handle modal close
    const handleCloseModal = () => {
      setIsModalOpen(false);
    };

    // Handle like functionality
    // In your Explore component's handleLike function, make these changes:



    const handleLike = async (dogId) => {
      try {
        // Update main dogs data
        setDogsData((prevDogs) =>
          prevDogs.map((dog) =>
            dog._id === dogId ? { ...dog, isLiked: !dog.isLiked } : dog
          )
        );

        // Update selected dog if it's the current one
        setSelectedDog((prev) => {
          if (prev?._id === dogId) {
            return { ...prev, isLiked: !prev.isLiked };
          }
          return prev;
        });
      } catch (error) {
        setErrorMessage("Failed to like dog. Please try again.");
        setTimeout(() => setErrorMessage(null), 3000);
      }
    };

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
            className="relative flex space-x-4 overflow-x-auto hide-scrollbar swipe-container">
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
                className="break-inside-avoid relative group mb-2 cursor-pointer transform transition-transform hover:scale-[0.98]"
                onClick={() => handleDogClick(dog)}>
                <div className="overflow-hidden rounded-xl">
                  <img
                    src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                    alt={dog.type || "Dog"}
                    loading="lazy"
                    className="w-full h-auto rounded-xl select-none touch-auto hover:brightness-90 transition-all"
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
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Dog Detail Modal - FIXED: Added filteredDogs prop */}
        <DogDetailModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          dog={selectedDog}
          onLike={handleLike}
          filteredDogs={filteredDogs} // Pass filtered dogs to the modal
        />
      </div>
    );
  };

  export default Explore;
