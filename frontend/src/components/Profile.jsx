import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Pencil } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileLoader from "./ProfileLoader";
import "./Profile.css";
import UploadDPModal from "./UploadDPModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import DogDetailModal from "./DogDetailModal"; // Import the DogDetailModal

const Profile = () => {
  const [showProfilePic, setShowProfilePic] = useState(false);
  const { isLoading, error } = useAuth0();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  console.log(currentUser);
  
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { user } = useAuth0();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [copiedText, setCopiedText] = useState("");
  const [isSingleColumn, setIsSingleColumn] = useState(false);

  // Replace selectedDogImage with dog modal states
  const [showDogModal, setShowDogModal] = useState(false);
  const [selectedDogForModal, setSelectedDogForModal] = useState(null);

  // Long press states
  const [longPressTimer, setLongPressTimer] = useState(null);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const longPressRef = useRef(null);

  const navigate = useNavigate();
  const isDeveloper = currentUser?.email === "vishwanathgowda951@gmail.com";

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setShowCopiedNotification(true);
    setTimeout(() => setShowCopiedNotification(false), 1000);
  };

  const handleDeleteDog = async () => {
    setIsDeleting(true);
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/dogs/${selectedDog._id}`
      );

      setDogsData((prev) => prev.filter((d) => d._id !== selectedDog._id));
      setCurrentUser((prevUser) => ({
        ...prevUser,
        dogsListed: prevUser.dogsListed.filter((id) => id !== selectedDog._id),
      }));

      setIsDeleting(false);
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Delete error:", err.response?.data);
      alert(`Delete failed: ${err.response?.data?.message || err.message}`);
    }
  };

  // Handle dog selection for modal
  const handleDogClick = (dog) => {
    // Only open modal if not long pressing
    if (!isLongPressing) {
      setSelectedDogForModal(dog);
      setShowDogModal(true);
    }
  };

  // Handle like functionality (placeholder - implement as needed)
  const handleLike = (dogId) => {
    // Implement like functionality here 
  };

  // Long press handlers
  const handleLongPressStart = (dog, event) => {
    event.preventDefault();
    setIsLongPressing(false);

    const timer = setTimeout(() => {
      setIsLongPressing(true);
      setSelectedDog(dog);
      setShowDeleteModal(true);

      // Add haptic feedback for mobile devices
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }, 500); // 500ms for long press

    setLongPressTimer(timer);
  };

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }

    // Reset long press state after a small delay to prevent click from firing
    setTimeout(() => {
      setIsLongPressing(false);
    }, 100);
  };

  const handleLongPressCancel = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
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

  // Cleanup long press timer on unmount
  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

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
      className={`${showProfilePic ? "sm:p-0" : "sm:pt-6"} 
      ${showProfilePic ? "p-0" : "p-0"}`}
      style={{
        maxHeight: showProfilePic ? "100vh" : "auto",
        overflow: showProfilePic ? "hidden" : "auto",
      }}>
      {showDeleteModal && (
        <DeleteConfirmationModal
          dogName={selectedDog?.type}
          isDeleting={isDeleting}
          onConfirm={handleDeleteDog}
          onCancel={() => {
            setShowDeleteModal(false);
            setSelectedDog(null);
          }}
        />
      )}

      {showUploadModal && (
        <UploadDPModal
          currentUser={currentUser}
          onClose={() => setShowUploadModal(false)}
          onUpdate={(updatedUser) => {
            setCurrentUser(updatedUser);
            setShowUploadModal(false);
          }}
        />
      )}

      {/* Dog Detail Modal */}
      <DogDetailModal
        isOpen={showDogModal}
        onClose={() => {
          setShowDogModal(false);
          setSelectedDogForModal(null);
        }}
        dog={selectedDogForModal}
        onLike={handleLike}
        filteredDogs={dogsData}
      />

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
            <Pencil
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5
                   w-12 h-12 sm:w-14 sm:h-14
                   p-3 sm:p-3.5
                   backdrop-blur-md rounded-full
                   bg-white/90 text-gray-700 cursor-pointer
                   hover:bg-white hover:scale-105
                   transition-all duration-200
                   shadow-lg border border-white/20"
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl min-h-screen mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-screen sm:p-6 p-2 ">
          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center sm:gap-6 sm:mb-8 mb-2">
            <div className="flex items-center w-full md:w-auto mt-2 gap-0">
              {/* Profile Picture */}
              <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full ml-2 bg-gray-200 overflow-hidden">
                <img
                  src={
                    currentUser.dp_url ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setShowProfilePic(true)}
                />
              </div>
            </div>

            <div className="w-full md:w-auto">
              <div className="flex flex-col mt-2">
                <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] sm:max-w-none leading-tight">
                  {currentUser.username}
                </h1>
                {isDeveloper ? (
                  <p className="text-gray-500 text-base sm:text-[17px] leading-tight mt-[2px]">
                    Creator & Caretaker of{" "}
                    <span className="font-bold text-[18px] text-violet-600">
                      StreetPaws
                    </span>
                    <br />
                  </p>
                ) : (
                  <p className="text-gray-500 text-base sm:text-[17px] leading-tight mt-[2px]">
                    Member since{" "}
                    <span className="text-gray-700">
                      {new Date(currentUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          year: "numeric",
                        }
                      )}
                    </span>
                  </p>
                )}
              </div>

              {/* Email section - simplified for mobile */}
              <div className="mt-2 md:mt-4 flex items-center group">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-600  hover:text-clip text-sm"
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
                  className="text-violet-500 cursor-pointer hover:text-violet-700 transition-colors ml-2"
                  aria-label="Copy email">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
            <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-700 text-base">
                Dogs Listed
              </h3>
              <p className="text-3xl font-bold text-violet-500">
                {currentUser.dogsListed.length}
              </p>
            </div>
          </div>

          {/* Recent Listings Section */}
          <div className="sm:mt-8 mt-4">
            <div className="flex justify-between items-center mb-2">
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
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="13"
                    y="3"
                    width="8"
                    height="8"
                    rx="1"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="3"
                    y="11"
                    width="8"
                    height="10"
                    rx="1"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <rect
                    x="13"
                    y="13"
                    width="8"
                    height="6"
                    rx="1"
                    strokeWidth="1"
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
                } sm:columns-3 lg:columns-3 sm:gap-2 custom-column-gap`}>
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
                    <div key={index} className="break-inside-avoid image-item ">
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
                    No dogs posted yet
                  </p>
                  <p className="text-sm mt-1 text-gray-500">
                    Your future posts will appear here
                  </p>
                </div>
              </div>
            ) : dogsData.length === 0 ? (
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
                    No dogs posted yet
                  </p>
                  <p className="text-sm mt-1 text-gray-500">
                    Your future posts will appear here
                  </p>
                </div>
              </div>
            ) : (
              <div
                className={`${
                  isSingleColumn ? "columns-1" : "columns-2"
                } sm:columns-3 lg:columns-3 sm:gap-2 custom-column-gap`}>
                {dogsData.map((dog) => (
                  <div key={dog._id} className="break-inside-avoid image-item ">
                    <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-auto object-cover cursor-pointer select-none"
                        onClick={() => handleDogClick(dog)}
                        onMouseDown={(e) => handleLongPressStart(dog, e)}
                        onMouseUp={handleLongPressEnd}
                        onMouseLeave={handleLongPressCancel}
                        onTouchStart={(e) => handleLongPressStart(dog, e)}
                        onTouchEnd={handleLongPressEnd}
                        onTouchMove={handleLongPressCancel}
                        onContextMenu={(e) => e.preventDefault()} // Prevent right-click menu
                        style={{
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          msUserSelect: "none",
                          userSelect: "none",
                          WebkitTouchCallout: "none",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
