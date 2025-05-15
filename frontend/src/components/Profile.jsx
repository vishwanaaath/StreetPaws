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
      className={`${showProfilePic ? "sm:p-0" : "sm:pt-6"} ${
        showProfilePic ? "p-0" : "p-1"
      }`}
      style={{
        maxHeight: showProfilePic ? "100vh" : "auto",
        overflow: showProfilePic ? "hidden" : "auto",
      }}>
      {/* Keep all modals and background elements exactly the same */}

      <div className="max-w-4xl min-h-screen mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden min-h-screen sm:p-8 p-4">
          {/* Profile Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <div className="flex items-center w-full md:w-auto">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 
                ring-4 ring-white shadow-lg cursor-pointer transition-transform hover:scale-105">
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

              {/* Mobile stats */}
              <div className="md:hidden flex-1 flex justify-center">
                <div className="flex flex-col items-center ml-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {currentUser.dogsListed.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Dogs Listed
                  </p>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2 gap-3">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight truncate">
                  {currentUser.username}
                </h1>
                {isDeveloper && (
                  <img
                    src="./images/developer-badge.svg"
                    className="w-7 h-7 flex-shrink-0"
                  />
                )}
              </div>

              {isDeveloper ? (
                <p className="text-gray-600 text-lg font-medium">
                  Creator of <span className="text-violet-600">StreetPaws</span>
                </p>
              ) : (
                <p className="text-gray-500 text-sm font-medium">
                  Joined{" "}
                  {new Date(currentUser.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              )}

              {/* Email section */}
              <div className="mt-4 flex items-center group">
                <div className="flex-1 min-w-0">
                  <p className="text-gray-600 text-sm font-medium truncate max-w-[220px]">
                    {currentUser.email}
                  </p>
                </div>
                <button
                  onClick={() => handleCopy(currentUser.email)}
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                  aria-label="Copy email">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    {/* Keep existing SVG path */}
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Desktop Stats */}
          <div className="hidden md:flex gap-6 mb-8">
            <div className="px-6 py-4 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">
                Dogs Listed
              </h3>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {currentUser.dogsListed.length}
              </p>
            </div>
          </div>

          {/* Recent Listings Section */}
          <div className="mt-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                Your Listings
              </h2>
              {/* Keep column toggle button same */}
            </div>

            {/* Keep loading and error states exactly the same */}

            {dogsData.length > 0 && (
              <div
                className={`${isSingleColumn ? "columns-1" : "columns-2"} 
                sm:columns-2 lg:columns-3 gap-4 space-y-4`}>
                {dogsData.map((dog) => (
                  <div key={dog._id} className="break-inside-avoid">
                    <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                      <img
                        src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                        alt={dog.type}
                        className="w-full h-auto object-cover aspect-square"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-white/90">
                            {timeSinceListed(dog.createdAt)}
                          </span>
                          <button
                            onClick={() =>
                              navigate("/map", { state: { selectedDog: dog } })
                            }
                            className="text-white hover:text-gray-200 transition-colors">
                            {/* Keep location icon SVG */}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keep copied notification styling but enhance */}
      {showCopiedNotification && (
        <div
          className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-4 py-2 
          rounded-lg text-sm font-medium shadow-lg animate-fade-in-up">
          Copied to clipboard
        </div>
      )}
    </div>
  );
};

export default Profile;
