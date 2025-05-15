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
      <div className="flex items-center justify-center h-screen text-gray-800">
        Error loading profile: {error.message}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-600">
        Please log in to view your profile
      </div>
    );
  }

  return (
    <div
      className={`${showProfilePic ? "sm:p-0" : "sm:pt-8"} 
      ${showProfilePic ? "p-0" : "px-4"}`}
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

      {showProfilePic && currentUser.dp_url && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <img
              src={
                currentUser.dp_url ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              className="w-64 h-64 sm:w-80 sm:h-80 cursor-pointer object-cover rounded-full border-4 border-white/20"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-6 right-6 bg-white/90 hover:bg-white p-2 rounded-full 
               w-10 h-10 sm:w-11 sm:h-11 sm:bottom-8 sm:right-8
               transform translate-x-1/4 translate-y-1/4 cursor-pointer transition-all duration-200 hover:scale-110">
              <img
                src="./images/new-dp.svg"
                alt="edit"
                className="w-full h-full"
              />
            </button>
          </div>
        </div>
      )}

      {selectedDogImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedDogImage}
              className="cursor-pointer object-contain rounded-lg max-w-[90vw] max-h-[90vh] m-auto"
              alt="Dog fullscreen"
              onClick={() => setSelectedDogImage(null)}
            />
            <button
              className="absolute top-6 right-6 z-50 sm:w-10 sm:h-10 w-8 h-8 p-2 bg-white/90 hover:bg-white rounded-full transition-all hover:scale-110 cursor-pointer flex items-center justify-center"
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
              <img
                src="./images/trash.png"
                alt="Delete"
                className="w-full h-full"
              />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8">
          {/* Profile Picture */}
          <div className="relative">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-gray-100 to-gray-200 overflow-hidden flex-shrink-0 border-2 border-white shadow-lg">
              <img
                src={
                  currentUser.dp_url ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt="Profile"
                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setShowProfilePic(true)}
              />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow-md hover:scale-110 transition-transform">
              <svg
                className="w-4 h-4 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
            </button>
          </div>

          {/* Profile Info */}
          <div className="flex-1 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                {currentUser.username}
              </h1>
              {isDeveloper && (
                <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 20 20">
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

            {/* Stats - Mobile */}
            <div className="flex sm:hidden gap-6 mb-4">
              <div className="text-center">
                <p className="text-lg font-semibold text-gray-900">
                  {currentUser.dogsListed.length}
                </p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">
                  Posts
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="mb-4">
              {isDeveloper ? (
                <p className="text-gray-700">
                  Creator & Caretaker of{" "}
                  <span className="font-semibold text-violet-600">
                    StreetPaws
                  </span>
                </p>
              ) : (
                <p className="text-gray-600">
                  Member since{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center group">
              <p className="text-gray-700 truncate max-w-[200px] sm:max-w-none">
                {currentUser.email}
              </p>
              <button
                onClick={() => handleCopy(currentUser.email)}
                className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Stats - Desktop */}
          <div className="hidden sm:flex gap-8">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                {currentUser.dogsListed.length}
              </p>
              <p className="text-sm text-gray-500 uppercase tracking-wider">
                Posts
              </p>
            </div>
          </div>
        </div>

        {/* Posts Section */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Your Posts</h2>
            <button
              className="sm:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setIsSingleColumn(!isSingleColumn)}>
              <svg
                className={`w-6 h-6 ${
                  isSingleColumn ? "text-gray-400" : "text-gray-600"
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
            </button>
          </div>

          {loading ? (
            <div
              className={`grid ${
                isSingleColumn ? "grid-cols-1" : "grid-cols-2"
              } sm:grid-cols-3 gap-4`}>
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : fetchError ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-4 text-gray-300"
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
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  Couldn't load posts
                </h3>
                <p className="text-gray-500 text-sm">
                  There was an error fetching your posts. Please try again.
                </p>
              </div>
            </div>
          ) : dogsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-md mx-auto">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-4 text-gray-300"
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
                <h3 className="text-lg font-medium text-gray-700 mb-1">
                  No posts yet
                </h3>
                <p className="text-gray-500 text-sm">
                  When you post dogs, they'll appear here.
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`grid ${
                isSingleColumn ? "grid-cols-1" : "grid-cols-2"
              } sm:grid-cols-3 gap-4`}>
              {dogsData.map((dog) => (
                <div key={dog._id} className="relative group">
                  <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                      alt={dog.type}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 cursor-pointer"
                      onClick={() =>
                        setSelectedDogImage(
                          `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`
                        )
                      }
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                    <div className="w-full flex justify-between items-end">
                      <span className="text-xs text-white">
                        {dog.createdAt
                          ? timeSinceListed(dog.createdAt)
                          : "Just now"}
                      </span>
                      <button
                        className="text-white hover:text-gray-200"
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
                          className="w-5 h-5"
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
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Copied Notification */}
      {showCopiedNotification && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm shadow-lg flex items-center">
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default Profile;
