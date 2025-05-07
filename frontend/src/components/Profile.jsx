import React from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileLoader from "./ProfileLoader";
import "./Profile.css";
import UploadDPModal from "./UploadDPModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const Profile = () => {
  const [showProfilePic, setShowProfilePic] = useState(false);
  const { isLoading, error } = useAuth0();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
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

  const navigate = useNavigate(); // Add navigate function
  const isDeveloper = currentUser?.email == "vishwanathgowda951@gmail.com";

  // Add error logging to handleDeleteDog
  // Frontend delete handler
  // Add this copy handler function
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

      // Update both dogsData AND currentUser
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

  // Update the dogsData sorting in your useEffect
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

        // Sort dogs by createdAt date (newest first)
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
      className={`${showProfilePic ? "p-0" : "p-5"}`}
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

      {/* Background Animation */}
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
            <img
              onClick={() => setShowUploadModal(true)}
              src="./images/new-dp.svg"
              alt="edit"
              className={`absolute bottom-6 right-6 bg-white p-2 rounded-full 
               w-10 h-10 sm:w-11 sm:h-11 sm:bottom-12 sm:right-12
               transform translate-x-1/4 translate-y-1/4 cursor-pointer`}
            />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {" "}
        <Link
          to="/map"
          className="inline-flex items-center mb-4 text-violet-500 hover:text-violet-700">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 "
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-6 p-4 ">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div
              className={`w-24 h-24 card rounded-full  bg-gray-200 overflow-hidden
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

            {/* ////////////// */}
            <div>
              <div className="flex items-center mb-2 gap-2">
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
                <a href="http://localhost:5173">
                  <p className="text-gray-600">
                    Creator & Caretaker of{"    "}
                    <span className="font-bold text-[18px] text-violet-500">
                      {" "}
                      StreetPaws
                    </span>
                  </p>
                </a>
              ) : (
                // In your Profile component's JSX, add this where you want the member since date
                <p className="text-gray-600 mt-2">
                  Member Since{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>

          {/* {isDeveloper && (
            <div className="mt-6 mb-6 p-4 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-violet-700 mb-2">
                Developer Dashboard
              </h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-violet-600">Total Users:</span>
                  <span className="ml-2">{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-violet-600">Total Listings:</span>
                  <span className="ml-2">{currentUser.username}</span>
                </div>
                <div>
                  <span className="text-violet-600">System Health:</span>
                  <span className="ml-2">🟢 Optimal</span>
                </div>
              </div>
            </div>
          )} */}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className=" p-4 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-700 mb-2">Dogs Listed</h3>
              <p className="text-3xl font-bold text-violet-500">
                {currentUser.dogsListed.length}
              </p>
            </div>

            <div className=" p-4 bg-violet-50 rounded-lg border border-violet-200">
              <h3 className="font-medium text-gray-700 mb-2">Contact Info</h3>

              <div className="flex relative items-center gap-2 group mb-2">
                {showCopiedNotification && (
                  <div className=" absolute bottom-20 right-0 bg-violet-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up">
                    Copied {copiedText} <br /> to clipboard!
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-900 truncate hover:text-clip   hover:min-w-fit"
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

              {/* Phone Number */}
              <div className="flex items-center gap-2 group">
                <div className="flex-1 min-w-0">
                  <p
                    className="text-gray-900 truncate hover:text-clip hover:min-w-fit"
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

            <div className="flex items-center gap-4 p-4 cursor-pointer bg-violet-50 rounded-lg border border-violet-200">
              <img src="./images/map.svg" className="w-8 h-8" alt="Map Icon" />
              <h3 className="font-medium text-gray-700 text-base">
                See all dogs listed, on map.
              </h3>
            </div>
          </div>
          <div className="mt-8">
            <h2 className="sm:text-xl text-lg font-bold text-gray-800 mb-4">
              Recent Listings
            </h2>

            {loading ? (
              <div className="text-center p-4">Loading listings...</div>
            ) : fetchError ? (
              <div className=" p-4 text-center">
                No dogs posted so far. Hopefully, it's because there aren’t any
                strays near them. Hopefully.
              </div>
            ) : dogsData.length === 0 ? (
              <div className="text-gray-500 p-4 text-center">
                No dogs posted so far. Hopefully, it's because there aren’t any
                strays near them. Hopefully.
              </div>
            ) : (
              <div className="columns-1  sm:columns-2 lg:columns-3 sm:gap-4 gap-3 sm:space-y-4">
                {dogsData.map((dog) => (
                  <div
                    key={dog._id}
                    onClick={() =>
                      navigate("/map", {
                        state: {
                          selectedDog: {
                            id: dog._id,
                            lat: dog.location.coordinates[1], // Correct here
                            lng: dog.location.coordinates[0],
                          },
                        },
                      })
                    }
                    className="break-inside-avoid mb-4">
                    <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-auto object-cover"
                      />

                      <img
                        className="absolute top-2 right-2 z-5 sm:w-7 sm:h-7 w-6 h-6 p-1 hover:bg-white/40 bg-white/20 rounded-full opacity-60 hover:opacity-100 hover:scale-110 transition-transform cursor-pointer"
                        src="./images/delete.svg"
                        alt="Delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDog(dog);
                          setShowDeleteModal(true);
                        }}
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                      <div className="absolute bottom-0 left-0 sm:p-4 p-2 text-white">
                        <h3 className="font-bold text-[22px] sm:text-lg">
                          {dog.type}
                        </h3>
                        <p className="sm:text-sm text-[20px]">
                          {dog.createdAt
                            ? timeSinceListed(dog.createdAt)
                            : "New listing"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* /////// */}
        </div>{" "}
      </div>
    </div>
  );
};

export default Profile;
