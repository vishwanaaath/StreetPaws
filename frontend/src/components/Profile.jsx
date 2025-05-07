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
  const [isGridView, setIsGridView] = useState(false);


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
  <div className={`${showProfilePic ? "p-0" : "px-2 py-4"}`}>
    {/* Fullscreen Profile Picture Modal */}
    {showProfilePic && currentUser.dp_url && (
      <div className="fixed inset-0 z-50 backdrop-blur-xl bg-black/80 flex items-start justify-start p-4">
        <div className="relative">
          <img
            src={currentUser.dp_url}
            className="w-72 h-72 rounded-full object-cover cursor-pointer"
            alt="Profile"
            onClick={() => setShowProfilePic(false)}
          />
          <button
            onClick={() => setShowUploadModal(true)}
            className="absolute bottom-4 right-4 bg-white/90 p-2 rounded-full shadow-sm"
          >
            <img src="./images/edit.svg" className="w-5 h-5" alt="Edit" />
          </button>
        </div>
      </div>
    )}

    {/* Fullscreen Dog Image Modal */}
    {selectedDog && (
      <div className="fixed inset-0 z-50 backdrop-blur-xl bg-black/80 flex items-center justify-center">
        <img
          src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${selectedDog.imageUrl}`}
          className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg cursor-pointer"
          alt="Dog"
          onClick={() => setSelectedDog(null)}
        />
      </div>
    )}

    <div className="max-w-4xl mx-auto">
      <Link
        to="/map"
        className="inline-flex items-center mb-3 ml-1 text-violet-600 hover:text-violet-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      <div className="bg-white rounded-xl shadow-sm">
        {/* Profile Header */}
        <div className="flex items-start p-3">
          <div className="relative">
            <img
              src={currentUser.dp_url || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"}
              className="w-20 h-20 rounded-full cursor-pointer object-cover border-2 border-white shadow-sm"
              alt="Profile"
              onClick={() => setShowProfilePic(true)}
            />
            <button
              onClick={() => setShowUploadModal(true)}
              className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow-sm border"
            >
              <img src="./images/camera.svg" className="w-4 h-4" alt="Camera" />
            </button>
          </div>

          <div className="ml-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-semibold">{currentUser.username}</h1>
              {isDeveloper && (
                <img src="./images/verified.svg" className="w-5 h-5" alt="Verified" />
              )}
            </div>
            
            <div className="flex gap-4 mb-2">
              <div>
                <span className="font-medium">{currentUser.dogsListed.length}</span>
                <span className="text-gray-600 ml-1">posts</span>
              </div>
              <div>
                <span className="font-medium">1.2k</span>
                <span className="text-gray-600 ml-1">followers</span>
              </div>
            </div>
            
            <p className="text-sm text-gray-800">
              {currentUser.bio || "Street animal caretaker 🐾"}
            </p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="p-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Contact Information</span>
            <button className="text-violet-600 text-sm">Edit</button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{currentUser.email}</span>
              <button 
                onClick={() => handleCopy(currentUser.email)}
                className="text-violet-600 hover:text-violet-800"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{currentUser.phoneNumber}</span>
              <button 
                onClick={() => handleCopy(currentUser.phoneNumber)}
                className="text-violet-600 hover:text-violet-800"
              >
                <CopyIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Listings */}
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Recent Listings</h2>
            <button
              onClick={() => setIsGridView(!isGridView)}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              {isGridView ? (
                <GridIcon className="w-6 h-6 text-gray-800" />
              ) : (
                <ListIcon className="w-6 h-6 text-gray-800" />
              )}
            </button>
          </div>

          <div className={`grid gap-2 ${isGridView ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {dogsData.map((dog) => (
              <div key={dog._id} className="relative group">
                {/* Clickable Image Area */}
                <div 
                  className="w-full aspect-square cursor-pointer"
                  onClick={() => setSelectedDog(dog)}
                >
                  <img
                    src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                    className="w-full h-full object-cover rounded-lg"
                    alt={dog.type}
                  />
                </div>

                {/* Map Navigation Button */}
                <button
                  onClick={() => navigate("/map", { state: { selectedDog: dog } })}
                  className="absolute bottom-2 right-2 bg-white/90 p-1.5 rounded-full shadow-sm"
                >
                  <MapPinIcon className="w-5 h-5 text-gray-800" />
                </button>

                {/* Image Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 text-white">
                  <p className="text-sm font-medium">{dog.type}</p>
                  <p className="text-xs">{timeSinceListed(dog.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* Copied Notification */}
    {showCopiedNotification && (
      <div className="fixed bottom-20 right-4 bg-violet-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg animate-slide-up">
        Copied {copiedText} to clipboard!
      </div>
    )}
  </div>
);
}

export default Profile;
