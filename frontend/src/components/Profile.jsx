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
      className={`${showProfilePic ? "p-0" : "px-4 py-6"}`}
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

      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 -z-1 pointer-events-none" />

      {showProfilePic && currentUser.dp_url && (
        <div className="fixed inset-0 z-10 bg-black/90 backdrop-blur-sm flex items-center justify-center">
          <div className="relative">
            <img
              src={currentUser.dp_url}
              className="w-64 h-64 cursor-pointer object-cover rounded-full border-4 border-white"
              alt="Profile"
              onClick={() => setShowProfilePic(false)}
            />
            <img
              onClick={() => setShowUploadModal(true)}
              src="./images/new-dp.svg"
              alt="edit"
              className="absolute bottom-6 right-6 bg-white p-2 rounded-full w-10 h-10 cursor-pointer shadow-sm"
            />
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <Link
          to="/map"
          className="inline-flex items-center mb-4 text-violet-600 hover:text-violet-800">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor">
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-6">
            <div className="relative">
              <img
                src={
                  currentUser.dp_url ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt="Profile"
                className="w-20 h-20 cursor-pointer object-cover rounded-full border-2 border-violet-100"
                onClick={() => setShowProfilePic(true)}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl md:text-2xl font-semibold text-gray-800 truncate max-w-[220px]">
                  {currentUser.username}
                </h1>
                {isDeveloper && (
                  <div className="group relative">
                    <img
                      src="./images/developer-badge.svg"
                      className="w-6 h-6 flex-shrink-0 animate-pulse cursor-help"
                    />
                    <div className="absolute hidden group-hover:block -top-8 right-0 bg-violet-600 text-white px-2 py-1 rounded text-xs">
                      Site Creator
                    </div>
                  </div>
                )}
              </div>
              <p className="text-gray-600 text-sm">
                {isDeveloper
                  ? "Creator of StreetPaws"
                  : `Member since ${new Date(
                      currentUser.createdAt
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
              <h3 className="text-sm font-medium text-gray-600 mb-1">
                Dogs Listed
              </h3>
              <p className="text-2xl font-bold text-violet-600">
                {currentUser.dogsListed.length}
              </p>
            </div>

            <div className="p-3 bg-violet-50 rounded-lg border border-violet-100">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Contact
              </h3>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800 truncate">
                    {currentUser.email}
                  </p>
                  <button
                    onClick={() => handleCopy(currentUser.email)}
                    className="text-violet-600 hover:text-violet-700">
                      a
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-800 truncate">
                    {currentUser.phoneNumber}
                  </p>
                  <button
                    onClick={() => handleCopy(currentUser.phoneNumber)}
                    className="text-violet-600 hover:text-violet-700">
                    a
                  </button>
                </div>
              </div>
            </div>

            <div
              className="p-3 bg-violet-50 rounded-lg border border-violet-100 cursor-pointer hover:bg-violet-100 transition-colors"
              onClick={() => navigate("/map")}>
              <div className="flex items-center gap-2">
                <img src="./images/map.svg" className="w-6 h-6" alt="Map" />
                <span className="text-sm font-medium text-gray-700">
                  View Map
                </span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              Recent Listings
            </h2>

            {loading ? (
              <div className="text-center py-4 text-gray-500">
                Loading listings...
              </div>
            ) : fetchError ? (
              <div className="text-center py-4 text-gray-500">
                No dogs posted yet. Hopefully because there are no strays
                nearby.
              </div>
            ) : dogsData.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No listings found. Spread some love by helping a stray!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {dogsData.map((dog) => (
                  <div
                    key={dog._id}
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
                    className="group relative cursor-pointer">
                    <div className="aspect-square rounded-xl overflow-hidden border border-gray-100">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDog(dog);
                        setShowDeleteModal(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white/80 hover:bg-white rounded-full shadow-sm">
                        <img src="./images/delete-dog.svg" alt="" />
                    </button>

                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/40 to-transparent">
                      <h3 className="text-sm font-semibold text-white">
                        {dog.type}
                      </h3>
                      <p className="text-xs text-white/90">
                        {timeSinceListed(dog.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showCopiedNotification && (
        <div className="fixed bottom-4 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          Copied to clipboard!
        </div>
      )}
    </div>
  );
};

export default Profile;
