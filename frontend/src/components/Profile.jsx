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
      ${showProfilePic ? "p-0" : "p-1"}`}
      style={{
        maxHeight: showProfilePic ? "100vh" : "auto",
        overflow: showProfilePic ? "hidden" : "auto",
      }}>
      {/* Delete Confirmation Modal */}
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

      {/* Profile Picture Upload Modal */}
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

      {/* Fullscreen Profile Picture View */}
      {showProfilePic && currentUser.dp_url && (
        <div className="fixed inset-0 z-50 backdrop-blur-2xl backdrop-brightness-80 flex items-center justify-center">
          <div className="relative">
            <img
              src={currentUser.dp_url}
              className="w-88 h-88 cursor-pointer object-cover rounded-full shadow-2xl"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-8 right-8 bg-white/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform">
              <img
                src="./images/edit-icon.svg"
                className="w-6 h-6"
                alt="Edit"
              />
            </button>
          </div>
        </div>
      )}

      {/* Fullscreen Dog Image View */}
      {selectedDogImage && (
        <div className="fixed inset-0 z-50 backdrop-blur-2xl backdrop-brightness-50 flex items-center justify-center p-4">
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={selectedDogImage}
              className="cursor-pointer object-contain rounded-lg max-w-[90vw] max-h-[90vh] m-auto"
              alt="Dog fullscreen"
              onClick={() => setSelectedDogImage(null)}
            />
            <button
              className="absolute top-6 right-6 z-50 w-10 h-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-md transition-all"
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
              <img src="./images/trash.png" alt="Delete" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl min-h-screen mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden min-h-screen sm:p-8 p-4">
          {/* Profile Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="relative group">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 overflow-hidden 
                ring-4 ring-white shadow-xl cursor-pointer transition-transform hover:scale-105">
                <img
                  src={
                    currentUser.dp_url ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onClick={() => setShowProfilePic(true)}
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  {currentUser.username}
                </h1>
                {isDeveloper && (
                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-sm font-medium">
                    Creator
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center">
                  <span className="text-gray-900 font-medium">
                    {currentUser.dogsListed.length}
                  </span>
                  <span className="text-gray-500 ml-1">
                    {currentUser.dogsListed.length === 1 ? "post" : "posts"}
                  </span>
                </div>
                <span className="text-gray-500 text-sm font-medium">
                  Joined{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>

              <div className="mt-4 flex items-center group">
                <span className="text-gray-600 font-medium truncate max-w-[220px]">
                  {currentUser.email}
                </span>
                <button
                  onClick={() => handleCopy(currentUser.email)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors">
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

          {/* Posts Grid */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Listings
              </h2>
              <button
                className="sm:hidden p-2 text-gray-500 hover:text-gray-700"
                onClick={() => setIsSingleColumn(!isSingleColumn)}>
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <rect x="3" y="3" width="8" height="5" rx="1" />
                  <rect x="13" y="3" width="8" height="8" rx="1" />
                  <rect x="3" y="11" width="8" height="10" rx="1" />
                  <rect x="13" y="13" width="8" height="6" rx="1" />
                </svg>
              </button>
            </div>

            {loading ? (
              <div
                className={`${isSingleColumn ? "columns-1" : "columns-2"} 
                sm:columns-2 lg:columns-3 gap-4 space-y-4`}>
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="break-inside-avoid">
                    <div className="bg-gray-200 animate-pulse rounded-xl aspect-[3/4]" />
                  </div>
                ))}
              </div>
            ) : dogsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="text-gray-400 mb-4">🐾</div>
                <p className="text-gray-600 font-medium">No posts yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Your future posts will appear here
                </p>
              </div>
            ) : (
              <div
                className={`${isSingleColumn ? "columns-1" : "columns-2"} 
                sm:columns-2 lg:columns-3 gap-4 space-y-4`}>
                {dogsData.map((dog) => (
                  <div key={dog._id} className="break-inside-avoid">
                    <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-shadow">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-auto object-cover"
                        onClick={() =>
                          setSelectedDogImage(
                            `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`
                          )
                        }
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-white/90">
                            {timeSinceListed(dog.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                navigate("/map", {
                                  state: { selectedDog: dog },
                                })
                              }
                              className="text-white hover:text-gray-200 transition-colors">
                              <svg
                                className="w-5 h-5"
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
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDog(dog);
                                setShowDeleteModal(true);
                              }}
                              className="text-white hover:text-red-300 transition-colors">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
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
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Copied Notification */}
          {showCopiedNotification && (
            <div
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white px-4 py-2 
              rounded-lg text-sm font-medium shadow-xl backdrop-blur-sm transform transition-all
              animate-fade-in-up">
              Copied "{copiedText}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
