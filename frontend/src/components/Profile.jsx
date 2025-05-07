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
    className={`${showProfilePic ? "p-0" : "p-2 sm:p-5"}`}
    style={{
      maxHeight: showProfilePic ? "100vh" : "auto",
      overflow: showProfilePic ? "hidden" : "auto",
    }}
  >
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

    {/* Fullscreen DP */}
    {showProfilePic && currentUser.dp_url && (
      <div className="absolute z-10 backdrop-blur-2xl backdrop-brightness-80 overflow-hidden w-full flex justify-center items-center min-h-screen">
        <div className="relative">
          <img
            src={
              currentUser.dp_url ||
              "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
            }
            className="sm:w-88 sm:h-88 w-64 h-64 object-cover rounded-full cursor-pointer special-shadow"
            alt="Profile"
            onClick={() => setShowProfilePic(false)}
          />
          <img
            onClick={() => setShowUploadModal(true)}
            src="./images/new-dp.svg"
            alt="edit"
            className="absolute bottom-6 right-6 bg-white p-2 rounded-full w-10 h-10 sm:w-11 sm:h-11 sm:bottom-12 sm:right-12 transform translate-x-1/4 translate-y-1/4 cursor-pointer"
          />
        </div>
      </div>
    )}

    <div className="max-w-4xl mx-auto">
      <Link
        to="/map"
        className="inline-flex items-center mb-4 text-violet-500 hover:text-violet-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-6 p-4">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gray-200 overflow-hidden">
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
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 max-w-[250px] sm:max-w-none truncate">
                {currentUser.username}
              </h1>
              {isDeveloper && (
                <div className="group relative">
                  <img
                    src="./images/developer-badge.svg"
                    className="w-6 h-6 sm:w-7 sm:h-7 animate-pulse cursor-help"
                    alt="Dev Badge"
                  />
                  <div className="absolute hidden group-hover:block -top-8 right-0 bg-violet-600 text-white px-2 py-1 rounded text-xs">
                    Site Creator
                  </div>
                </div>
              )}
            </div>
            {isDeveloper ? (
              <a href="http://localhost:5173">
                <p className="text-sm text-gray-600">
                  Creator & Caretaker of{" "}
                  <span className="font-semibold text-violet-500">StreetPaws</span>
                </p>
              </a>
            ) : (
              <p className="text-sm text-gray-600 mt-1">
                Member Since{" "}
                {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        </div>

        {/* Stats & Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-1">
              Dogs Listed
            </h3>
            <p className="text-2xl sm:text-3xl font-bold text-violet-500">
              {currentUser.dogsListed.length}
            </p>
          </div>

          <div className="p-3 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="text-sm sm:text-base font-medium text-gray-700 mb-1">
              Contact Info
            </h3>

            <div className="flex items-center gap-2 mb-1">
              {showCopiedNotification && (
                <div className="absolute bottom-20 right-0 bg-violet-500 text-white px-3 py-1 rounded-lg shadow-md text-sm animate-slide-up">
                  Copied {copiedText}!
                </div>
              )}
              <p className="text-sm text-gray-900 truncate max-w-[200px]" title={currentUser.email}>
                {currentUser.email}
              </p>
              <button
                onClick={() => handleCopy(currentUser.email)}
                className="text-violet-500 hover:text-violet-700"
              >
                📋
              </button>
            </div>

            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-900 truncate max-w-[200px]" title={currentUser.phoneNumber}>
                {currentUser.phoneNumber}
              </p>
              <button
                onClick={() => handleCopy(currentUser.phoneNumber)}
                className="text-violet-500 hover:text-violet-700"
              >
                📋
              </button>
            </div>
          </div>

          <div
            className="flex items-center gap-3 p-3 bg-violet-50 rounded-lg border border-violet-200 cursor-pointer"
            onClick={() => navigate("/map")}
          >
            <img src="./images/map.svg" className="w-6 h-6 sm:w-8 sm:h-8" alt="Map Icon" />
            <h3 className="text-sm sm:text-base font-medium text-gray-700">
              See all dogs listed, on map.
            </h3>
          </div>
        </div>

        {/* Listings */}
        <div className="mt-6 sm:mt-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Recent Listings</h2>

          {loading ? (
            <div className="text-center text-sm text-gray-500">Loading listings...</div>
          ) : fetchError ? (
            <div className="text-center text-sm text-gray-500">{fetchError}</div>
          ) : dogsData.length === 0 ? (
            <div className="text-center text-sm text-gray-500">
              No dogs posted so far. Hopefully, it's because there aren’t any strays near them. Hopefully.
            </div>
          ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-2 sm:gap-4 space-y-2 sm:space-y-4">
              {dogsData.map((dog) => (
                <div
                  key={dog._id}
                  className="break-inside-avoid mb-4"
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
                  }
                >
                  <div className="relative rounded-xl overflow-hidden special-shadow-1 group">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                      alt={dog.type}
                      className="w-full h-auto object-cover"
                    />
                    <img
                      src="./images/delete.svg"
                      alt="Delete"
                      className="absolute top-2 right-2 w-6 h-6 sm:w-7 sm:h-7 p-1 rounded-full bg-white/20 hover:bg-white/40 opacity-60 hover:opacity-100 hover:scale-110 transition-transform cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDog(dog);
                        setShowDeleteModal(true);
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60" />
                    <div className="absolute bottom-0 left-0 p-2 text-white text-sm sm:text-base font-medium">
                      {dog.type}
                    </div>
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
}

export default Profile;
