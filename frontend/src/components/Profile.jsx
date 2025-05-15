import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
      await axios.delete(
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8 text-gray-800">
          <p className="text-lg font-medium">Error loading profile</p>
          <p className="text-gray-600 mt-2">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center p-8">
          <p className="text-lg font-medium text-gray-800">
            Please log in to view your profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
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
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative">
            <img
              src={
                currentUser.dp_url ||
                "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
              }
              className="w-64 h-64 sm:w-80 sm:h-80 rounded-full object-cover cursor-pointer"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-6 right-6 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-2 rounded-full transition-all duration-200">
              <img
                src="./images/new-dp.svg"
                alt="edit"
                className="w-6 h-6 invert"
              />
            </button>
          </div>
        </div>
      )}

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
              className="absolute top-6 right-6 bg-white/90 hover:bg-white p-2 rounded-full transition-all duration-200"
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
              <img src="./images/trash.png" alt="Delete" className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white shadow-sm">
          <div className="px-4 sm:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center">
              {/* Profile Picture */}
              <div className="relative mb-4 sm:mb-0 sm:mr-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-2 border-white shadow-md overflow-hidden">
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

                {/* Mobile Stats */}
                <div className="sm:hidden flex justify-center mt-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {currentUser.dogsListed.length}
                    </p>
                    <p className="text-xs text-gray-600 tracking-wider">
                      DOGS LISTED
                    </p>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mr-3">
                    {currentUser.username}
                  </h1>
                  {isDeveloper && (
                    <span className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center">
                      <img
                        src="./images/developer-badge.svg"
                        className="w-4 h-4 mr-1"
                        alt="Developer"
                      />
                      Developer
                    </span>
                  )}
                </div>

                {isDeveloper ? (
                  <p className="text-gray-700 mb-4">
                    Creator of{" "}
                    <span className="font-semibold text-violet-600">
                      StreetPaws
                    </span>
                  </p>
                ) : (
                  <p className="text-gray-600 text-sm mb-4">
                    Member since{" "}
                    {new Date(currentUser.createdAt).toLocaleDateString(
                      "en-US",
                      {
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                )}

                {/* Email */}
                <div className="flex items-center group mb-4">
                  <p className="text-gray-700 text-sm sm:text-base font-medium">
                    {currentUser.email}
                  </p>
                  <button
                    onClick={() => handleCopy(currentUser.email)}
                    className="ml-2 text-gray-400 hover:text-violet-600 transition-colors"
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

                {/* Desktop Stats */}
                <div className="hidden sm:flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-900">
                      {currentUser.dogsListed.length}
                    </p>
                    <p className="text-xs text-gray-600 tracking-wider">
                      DOGS LISTED
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="px-4 sm:px-8 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Listings</h2>
            <button
              className="sm:hidden text-violet-600"
              onClick={() => setIsSingleColumn(!isSingleColumn)}>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {loading ? (
            <div
              className={`${
                isSingleColumn ? "columns-1" : "columns-2"
              } sm:columns-3 gap-4`}>
              {[...Array(6)].map((_, index) => (
                <div key={index} className="mb-4 break-inside-avoid">
                  <div className="bg-gray-200 rounded-xl aspect-square animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : fetchError || dogsData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-center max-w-xs">
                <svg
                  className="w-16 h-16 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {fetchError ? "Error loading listings" : "No dogs posted yet"}
                </h3>
                <p className="mt-2 text-gray-600">
                  {fetchError
                    ? "Please try again later"
                    : "Your future posts will appear here"}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`${
                isSingleColumn ? "columns-1" : "columns-2"
              } sm:columns-3 gap-4`}>
              {dogsData.map((dog) => (
                <div key={dog._id} className="mb-4 break-inside-avoid group">
                  <div className="relative overflow-hidden rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                      alt={dog.type}
                      className="w-full h-auto object-cover cursor-pointer"
                      onClick={() =>
                        setSelectedDogImage(
                          `https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`
                        )
                      }
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end p-3">
                      <div className="w-full">
                        <p className="text-white text-xs font-medium">
                          {dog.createdAt
                            ? timeSinceListed(dog.createdAt)
                            : "New"}
                        </p>
                        <div className="flex justify-between items-center mt-1">
                          <button
                            className="text-white hover:text-violet-200 transition-colors"
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
                              className="w-4 h-4"
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
                        </div>
                      </div>
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
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default Profile;
