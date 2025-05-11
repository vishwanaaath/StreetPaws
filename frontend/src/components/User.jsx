import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileLoader from "./ProfileLoader";
import "./Profile.css"; 

const User = () => {
  const [showProfilePic, setShowProfilePic] = useState(false);
  const { isLoading, error } = useAuth0();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null); 
  const [selectedDog, setSelectedDog] = useState(null);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [selectedDogImage, setSelectedDogImage] = useState(null);

  const navigate = useNavigate();  
  const isDeveloper = currentUser?.email == "vishwanathgowda951@gmail.com";
 
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setShowCopiedNotification(true);
    setTimeout(() => setShowCopiedNotification(false), 1000);
  };
 
  useEffect(() => {
    const fetchUserDogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/by-ids`,
          {
            params: {
              ids: currentUser.dogsListed.join(","),
            },
          }
        );
 
        const sortedDogs = response.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        setDogsData(sortedDogs);
        console.log(sortedDogs);

        setFetchError(null);
      } catch (err) {
        setFetchError(err.response?.data?.message || "Error fetching dogs");
        console.error("Fetch dogs error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDogs();
  }, [currentUser]);

  const timeSinceListed = (createdAt) => {
    const listedDate = new Date(createdAt);
    const now = new Date();
    const diffInMs = now - listedDate;

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);

    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 31) return `${days}d ago`;
    if (months < 12) return `${months}m ago`;
    return `${years}y ago`;
  };

  if (isLoading) {
    return <ProfileLoader />;
  }

  if (error) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading profile: {error.message}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="text-center p-8 text-gray-600">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div
      className={`  ${showProfilePic ? "sm:p-0" : "sm:pt-6"} 
      ${showProfilePic ? "p-0" : "p-1"}`}
      style={{
        maxHeight: showProfilePic ? "100vh" : "auto",
        overflow: showProfilePic ? "hidden" : "auto",
      }}>

      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 -z-1 pointer-events-none" />

      {showProfilePic && currentUser.dp_url && (
        <div className="absolute z-10 backdrop-blur-2xl backdrop-brightness-80 overflow-hidden w-full flex justify-center items-center min-h-screen min-w-screen">
          <div className="relative">
            <img
              src={
                currentUser.dp_url ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              className="sm:w-88 sm:h-88 cursor-pointer object-cover special-shadow w-58 h-58 rounded-full"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
          </div>
        </div>
      )}

      {selectedDogImage && (
        <div className="fixed inset-0 z-50 backdrop-blur-2xl backdrop-brightness-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedDogImage}
              className="cursor-pointer object-contain rounded-lg max-w-[90vw] max-h-[90vh] m-auto"
              alt="Dog fullscreen"
              onClick={() => setSelectedDogImage(null)}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto bg-pink-700  h-full">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-6 p-2.5 ">
          <div className="flex flex-col md:flex-row items-start md:items-center sm:gap-6 gap-1 sm:mb-8 mb-4">
            <div
              className={`w-26 h-26 ml-0.5 mt-2 sm:mb-0 mb-2 sm:mt-0 card rounded-full  bg-gray-200 overflow-hidden
              }`}>
              <img
                src={
                  currentUser.dp_url ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt="Profile"
                className="w-full h-full cursor-pointer object-cover"
                onClick={() => setShowProfilePic(true)}
              />
            </div>

            <div>
              <div className="flex items-center sm:mb-2 mb-0 gap-2">
                <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] sm:max-w-none">
                  {currentUser.username}
                </h1>
                {isDeveloper && (
                  <div className="group relative">
                    <img
                      src="./images/developer-badge.svg"
                      className="w-7 h-7 flex-shrink-0 animate-pulse cursor-help"
                    />
                    <div className="absolute hidden group-hover:block -top-8 right-0 bg-violet-600 text-white px-2 py-1 rounded text-xs">
                      Site Creator
                    </div>
                  </div>
                )}
              </div>

              {isDeveloper ? (
                <a href="https://streetpaws.onrender.com">
                  <p className="text-gray-600 sm:mt-2 mt-0">
                    Creator & Caretaker of{"    "}
                    <span className="font-bold text-[18px] text-violet-500">
                      {" "}
                      StreetPaws
                    </span>
                  </p>
                </a>
              ) : (
                <p className="text-gray-600 sm:mt-2 mt-0">
                  Member Since{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 sm:gap-6 gap-2">
            <div className=" sm:p-4 p-2 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-700 text-base">
                Dogs Listed
              </h3>
              <p className="text-3xl font-bold text-violet-500">
                {currentUser.dogsListed.length}
              </p>
            </div>

            <div className=" sm:p-4 p-2 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-700 text-base">
                Contact Info
              </h3>

              <div className="flex relative items-center gap-2 group mb-1 sm:mb-2">
                {showCopiedNotification && (
                  <div className=" absolute bottom-20 right-0 bg-violet-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up">
                    Copied {copiedText} <br /> to clipboard!
                  </div>
                )}
                <div className="flex-1 min-w-0 sm:mt-1">
                  <p
                    className="text-gray-600 truncate hover:text-clip text-[14px]  hover:min-w-fit"
                    title={currentUser.email}
                    style={{
                      maxWidth: "200px",
                      transition: "max-width 0.2s ease-in-out",
                    }}>
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(currentUser.email)}
                  className="text-violet-500 cursor-pointer hover:text-violet-700 transition-colors"
                  aria-label="Copy email">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>

              <div className="flex items-center gap-2 group">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-600 truncate text-[14px] hover:text-clip hover:min-w-fit"
                    title={currentUser.phoneNumber}
                    style={{
                      maxWidth: "200px",
                      transition: "max-width 0.2s ease-in-out",
                    }}>
                    {currentUser.phoneNumber}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(currentUser.phoneNumber)}
                  className="text-violet-500 cursor-pointer hover:text-violet-700 transition-colors"
                  aria-label="Copy phone number">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div className="sm:mt-8 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="sm:text-xl text-lg font-bold text-gray-800">
                Recent Listings
              </h2>
              <div
                className="sm:hidden cursor-pointer p-2"
                onClick={() => setIsSingleColumn(!isSingleColumn)}>
                <svg
                  className={`w-6 h-6 ${
                    isSingleColumn ? "text-gray-400" : "text-violet-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <rect
                    x="3"
                    y="3"
                    width="8"
                    height="5"
                    rx="1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    rx="1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="8"
                    height="10"
                    rx="1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="6"
                    rx="1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>

            {loading ? (
              <div
                className={`${
                  isSingleColumn ? "columns-1" : "columns-2"
                } sm:columns-2 lg:columns-3 sm:gap-2 gap-2 space-y-3 sm:space-y-4`}>
                {[...Array(6)].map((_, index) => {
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
                          className={`w-full bg-gray-200 rounded-xl ${ratios[index].class}`}
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
              <div className=" p-4 text-center">No dogs posted so far.</div>
            ) : dogsData.length === 0 ? (
              <div className="text-gray-500 p-4 text-center">
                No dogs posted so far.
              </div>
            ) : (
              <div
                className={`${
                  isSingleColumn ? "columns-1" : "columns-2"
                } sm:columns-2 lg:columns-3 sm:gap-2 gap-2 space-y-3 sm:space-y-4`}>
                {dogsData.map((dog) => (
                  <div key={dog._id} className="break-inside-avoid mb-2">
                    <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-auto object-cover"
                      />

                      <div
                        onClick={() =>
                          setSelectedDogImage(
                            `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`
                          )
                        }
                        className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-70"></div>
                      <div className="absolute bottom-0 left-0 right-0 sm:p-4 p-2">
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="sm:text-sm text-white text-[10px]">
                              {dog.createdAt
                                ? timeSinceListed(dog.createdAt)
                                : "New listing"}
                            </p>
                          </div>
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
        </div>{" "}
      </div>
    </div>
  );
};

export default User;
