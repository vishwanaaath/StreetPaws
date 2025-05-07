import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth0 } from "@auth0/auth0-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ProfileLoader from "./ProfileLoader";
import "./Profile.css";
import UploadDPModal from "./UploadDPModal";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const Profile = () => {
  const [showProfilePic, setShowProfilePic] = useState(false);
  const [showDogImage, setShowDogImage] = useState(false);
  const [fullImageUrl, setFullImageUrl] = useState("");
  const [isGrid, setIsGrid] = useState(true);
  const { isLoading, error, user } = useAuth0();
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedDog, setSelectedDog] = useState(null);
  const [showCopiedNotification, setShowCopiedNotification] = useState(false);
  const [copiedText, setCopiedText] = useState("");
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
      setCurrentUser((prev) => ({
        ...prev,
        dogsListed: prev.dogsListed.filter((id) => id !== selectedDog._id),
      }));
      setShowDeleteModal(false);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUserDogs = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/by-ids`,
          { params: { ids: currentUser.dogsListed.join(",") } }
        );
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDogsData(sorted);
        setFetchError(null);
      } catch (err) {
        console.error(err);
        setFetchError(err.response?.data?.message || "Error fetching dogs");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser) fetchUserDogs();
  }, [currentUser]);

  const timeSinceListed = (date) => {
    const diff = Date.now() - new Date(date);
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 60) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (isLoading) return <ProfileLoader />;
  if (error)
    return (
      <div className="text-center text-red-500 p-4">Error: {error.message}</div>
    );
  if (!currentUser) return <div className="text-center p-4">Please log in</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* DP and Info */}
      <div className="flex items-center space-x-4 py-4">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
          <img
            src={currentUser.dp_url}
            alt="Profile"
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setShowProfilePic(true)}
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold truncate w-64">
            {currentUser.username}
          </h1>
          {!isDeveloper && (
            <p className="text-gray-600">
              Member since{" "}
              {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* modals */}
      {showProfilePic && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img
            src={currentUser.dp_url}
            alt="Profile Full"
            className="max-w-xs max-h-xs rounded-full"
            onClick={() => setShowProfilePic(false)}
          />
        </div>
      )}
      {showDogImage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <img
            src={fullImageUrl}
            alt="Dog Full"
            className="max-w-xl max-h-xl"
            onClick={() => setShowDogImage(false)}
          />
        </div>
      )}
      {showUploadModal && (
        <UploadDPModal
          currentUser={currentUser}
          onClose={() => setShowUploadModal(false)}
          onUpdate={(u) => {
            setCurrentUser(u);
            setShowUploadModal(false);
          }}
        />
      )}
      {showDeleteModal && (
        <DeleteConfirmationModal
          dogName={selectedDog?.type}
          isDeleting={isDeleting}
          onConfirm={handleDeleteDog}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}

      {/* Stats and Contact */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
        <div className="p-4 bg-violet-50 rounded-lg">
          <h3 className="text-gray-700">Dogs Listed</h3>
          <p className="text-violet-500 text-3xl font-bold">
            {currentUser.dogsListed.length}
          </p>
        </div>
        <div className="p-4 bg-violet-50 rounded-lg">
          <h3 className="text-gray-700">Contact Info</h3>
          <p
            className="truncate max-w-xs"
            onClick={() => handleCopy(currentUser.email)}>
            {currentUser.email}
          </p>
        </div>
        <div
          className="flex items-center justify-center p-4 bg-violet-50 rounded-lg cursor-pointer"
          onClick={() => navigate("/map")}>
          <svg className="w-6 h-6 mr-2" /* grid icon here? */>
            {/* icon content */}
          </svg>
          <span>View Map</span>
        </div>
      </div>

      {/* Recent Listings Header */}
      <div className="flex items-center justify-between py-2">
        <h2 className="text-xl font-bold">Recent Listings</h2>
        <svg
          onClick={() => setIsGrid(!isGrid)}
          className="w-6 h-6 cursor-pointer"
          viewBox="0 0 24 24"
          fill="currentColor">
          {/* toggle grid/list icon */}
        </svg>
      </div>

      {/* Listings */}
      {loading ? (
        <p>Loading...</p>
      ) : fetchError ? (
        <p>No listings found</p>
      ) : (
        <div
          className={`${
            isGrid ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : ""
          }`}>
          {dogsData.map((dog) => (
            <div
              key={dog._id}
              className="relative group rounded-lg overflow-hidden special-shadow">
              <img
                src={`https://.../${dog.imageUrl}`}
                alt={dog.type}
                className="w-full h-auto object-cover cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullImageUrl(`https://.../${dog.imageUrl}`);
                  setShowDogImage(true);
                }}
              />
              <button
                className="absolute bottom-2 right-2 bg-white p-1 rounded-full"
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
                <img src="./images/map.svg" className="w-5 h-5" alt="Map" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
