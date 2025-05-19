import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useSwipeable } from "react-swipeable";
import "./Profile.css"; 
const Explore = () => {
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [isSingleColumn] = useState(false);
  const [selectedColor, setSelectedColor] = useState("All");
  const navigate = useNavigate(); 
  const [animationDirection, setAnimationDirection] = useState(null);
  const previousColorRef = useRef(selectedColor);

  const colorFilters = [
    "All",
    "Brown",
    "Black",
    "White",
    "Brown and White",
    "Black and White",
    "Unique",
  ];

  const filteredDogs = dogsData.filter(
    (dog) => selectedColor === "All" || dog.type === selectedColor
  );

  useEffect(() => {
    const prevIndex = colorFilters.indexOf(previousColorRef.current);
    const newIndex = colorFilters.indexOf(selectedColor);

    if (prevIndex !== newIndex) {
      setAnimationDirection(newIndex > prevIndex ? "left" : "right");
      previousColorRef.current = selectedColor;
    }
  }, [selectedColor]);


  const handleSwipe = (dir) => {
    const currentIndex = colorFilters.indexOf(selectedColor);
    if (dir === "left") {
      const nextIndex = (currentIndex + 1) % colorFilters.length;
      setSelectedColor(colorFilters[nextIndex]);
    } else if (dir === "right") {
      const prevIndex =
        (currentIndex - 1 + colorFilters.length) % colorFilters.length;
      setSelectedColor(colorFilters[prevIndex]);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleSwipe("left"),
    onSwipedRight: () => handleSwipe("right"),
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
        console.log(dogsData);

        setFetchError(null);
      } catch (err) {
        setFetchError(err.response?.data?.message || "Error fetching dogs");
        console.error("Fetch dogs error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDogs();
  }, []);

  return (
    <div {...swipeHandlers} className="p-2 sm:p-4">
      {/* Filter Header */}
      <div className="sticky top-0 bg-white z-20 pb-2 sm:pb-4 shadow-sm">
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {colorFilters.map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`whitespace-nowrap py-1.5 px-3 transition-colors text-base ${
                selectedColor === color
                  ? "text-violet-600 font-bold border-b-2 border-violet-600"
                  : "text-gray-500 hover:text-gray-600"
              }`}>
              {color}
            </button>
          ))}
        </div>
      </div>

   

      {loading ? (
        <div
          className={`${
            isSingleColumn ? "columns-1" : "columns-2"
          } sm:columns-2 lg:columns-3 sm:gap-2 gap-1 space-y-3 sm:space-y-4`}>
          {[...Array(12)].map((_, index) => {
            const ratios = [
              { class: "aspect-square" },
              { class: "aspect-[3/4]" },
              { class: "aspect-[3/2]" },
              { class: "aspect-square" },
              { class: "aspect-[3/4]" },
              { class: "aspect-[3/2]" },
            ];

            return (
              <div key={index} className="break-inside-avoid mb-2">
                <div className="relative overflow-hidden special-shadow-1 rounded-xl group animate-pulse">
                  <div
                    className={`w-full bg-gray-200 rounded-xl ${
                      ratios[index % 6].class
                    }`}
                  />
                  <div className="absolute bottom-0 left-0 right-0 sm:p-4 p-2">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <div className="h-3 w-16 bg-gray-300 rounded" />
                      </div>
                      <div className="h-6 w-6 bg-gray-300 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : fetchError ? (
        <div className="flex flex-col flex-grow min-h-[30vh] sm:min-h-[50vh] items-center justify-center p-4">
          <div className="text-center text-gray-500 bg-violet-50 rounded-xl w-full max-w-sm mx-auto p-8 shadow-inner border border-violet-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-violet-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium">{fetchError}</p>
            <p className="text-sm mt-1 text-gray-500">Please try again later</p>
          </div>
        </div>
      ) : filteredDogs.length === 0 ? (
        <div className="flex flex-col flex-grow min-h-[30vh] sm:min-h-[50vh] items-center justify-center p-4">
          <div className="text-center text-gray-500 bg-violet-50 rounded-xl w-full max-w-sm mx-auto p-8 shadow-inner border border-violet-100">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mx-auto mb-4 text-violet-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-gray-600 font-medium">
              No {selectedColor.toLowerCase()} dogs posted yet
            </p>
            <p className="text-sm mt-1 text-gray-500">
              Try selecting a different color type
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`${
            isSingleColumn ? "columns-1" : "columns-2"
          } sm:columns-2 lg:columns-3 sm:gap-2 gap-1 space-y-2 sm:space-y-4
        ${animationDirection ? `slide-${animationDirection}` : ""}`}>
          {filteredDogs.map((dog) => (
            <div key={dog._id} className="break-inside-avoid mb-2">
              <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                <img
                  src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                  alt={dog.type}
                  className="w-full h-auto object-cover"
                />

                {/* <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div> */}
                <div className="absolute bottom-0 left-0 right-0 sm:p-4 p-2">
                  <div className="flex justify-between items-end">
                    <svg
                      className="w-5 h-5 z-5 text-white cursor-pointer mb-1 mr-1"
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
        </div>
      )}
    </div>
  );
};

export default Explore;
