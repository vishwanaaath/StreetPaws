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
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [selectedDogImage, setSelectedDogImage] = useState(null);

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
      <div className="flex items-center justify-center h-screen text-neutral-700">
        Error loading profile: {error.message}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-neutral-600">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div
      className={`bg-white min-h-screen ${
        showProfilePic ? "overflow-hidden" : ""
      }`}>
      {/* Fullscreen profile picture modal */}
      {showProfilePic && currentUser.dp_url && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center">
          <div className="relative max-w-4xl mx-auto">
            <img
              src={currentUser.dp_url}
              className="w-64 h-64 md:w-80 md:h-80 rounded-full object-cover cursor-pointer"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-6 right-6 bg-white/90 hover:bg-white p-2 rounded-full shadow-md transition-all duration-200 hover:scale-110">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-800"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen dog image modal */}
      {selectedDogImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedDogImage}
              className="cursor-pointer object-contain max-w-[90vw] max-h-[90vh] rounded-lg"
              alt="Dog fullscreen"
              onClick={() => setSelectedDogImage(null)}
            />
            <button
              className="absolute top-6 right-6 z-50 w-10 h-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all duration-200 hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedDog(
                  dogsData.find(
                    (dog) =>
                      `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}` ===
                      selectedDogImage
                  )
                );
                setSelectedDogImage(null);
                setShowDeleteModal(true);
              }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-neutral-800"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
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

      {/* Profile picture upload modal */}
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

      {/* Main profile content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Profile header section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-8">
          {/* Profile picture */}
          <div className="relative group">
            <img
              src={
                currentUser.dp_url ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              alt="Profile"
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-white shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setShowProfilePic(true)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md hover:scale-105 transition-transform">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-800"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
            </button>
          </div>

          {/* Profile info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900">
                {currentUser.username}
              </h1>
              {isDeveloper && (
                <span className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3 w-3"
                    viewBox="0 0 20 20"
                    fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Creator
                </span>
              )}
            </div>

            <p className="text-neutral-600 mb-4">
              {isDeveloper
                ? "Creator & Caretaker of StreetPaws"
                : `Member since ${new Date(
                    currentUser.createdAt
                  ).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}`}
            </p>

            {/* Stats */}
            <div className="flex items-center gap-6 mb-4">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-neutral-900">
                  {currentUser.dogsListed.length}
                </span>
                <span className="text-neutral-500">Dogs</span>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center group">
              <p className="text-neutral-600 text-sm truncate max-w-xs">
                {currentUser.email}
              </p>
              <button
                onClick={() => handleCopy(currentUser.email)}
                className="ml-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Copy email">
                <svg
                  className="w-4 h-4"
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

        {/* Divider */}
        <div className="border-t border-neutral-100 my-6"></div>

        {/* Dogs grid section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Your Dogs</h2>
            <button
              className="md:hidden text-neutral-500 hover:text-neutral-700"
              onClick={() => setIsSingleColumn(!isSingleColumn)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                {isSingleColumn ? (
                  <>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                  </>
                ) : (
                  <>
                    <rect x="3" y="3" width="18" height="7" rx="1" />
                    <rect x="3" y="14" width="18" height="7" rx="1" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {loading ? (
            <div
              className={`grid ${
                isSingleColumn ? "grid-cols-1" : "grid-cols-2"
              } sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-neutral-100 rounded-xl animate-pulse"></div>
              ))}
            </div>
          ) : fetchError || dogsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 bg-neutral-50 rounded-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-neutral-300 mb-4"
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
              <p className="text-neutral-500 font-medium mb-1">
                No dogs posted yet
              </p>
              <p className="text-sm text-neutral-400">
                Your future posts will appear here
              </p>
            </div>
          ) : (
            <div
              className={`grid ${
                isSingleColumn ? "grid-cols-1" : "grid-cols-2"
              } sm:grid-cols-2 lg:grid-cols-3 gap-4`}>
              {dogsData.map((dog) => (
                <div
                  key={dog._id}
                  className="relative group overflow-hidden rounded-xl aspect-square cursor-pointer"
                  onClick={() =>
                    setSelectedDogImage(
                      `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`
                    )
                  }>
                  <img
                    src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                    alt={dog.type}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex justify-between items-end">
                      <span className="text-xs text-white bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                        {dog.createdAt
                          ? timeSinceListed(dog.createdAt)
                          : "New listing"}
                      </span>
                      <button
                        className="text-white bg-black/30 backdrop-blur-sm p-1.5 rounded-full hover:bg-black/50 transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/map", {
                            state: {
                              selectedDog: {
                                id: dog._id,
                                lat: dog.location.coordinates[1],
                                lng: dog.location.coordinates[0],
                              },
                            },
                          });
                        }}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor">
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
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Copied notification */}
      {showCopiedNotification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-neutral-800 text-white px-4 py-2 rounded-full text-sm shadow-lg flex items-center gap-2 animate-fade-in-out">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default Profile;
