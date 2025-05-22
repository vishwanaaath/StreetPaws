import axios from "axios";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProfileLoader from "./ProfileLoader";
import "./Profile.css";
import DogDetailModal from "./DogDetailModal";

const User = () => {
  const [userData, setUserData] = useState(null);
  const [dogsData, setDogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [showDogModal, setShowDogModal] = useState(false);
  const [selectedDogForModal, setSelectedDogForModal] = useState(null);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${userId}`
        );
        setUserData(userResponse.data);

        const dogsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs/by-ids`,
          {
            params: { ids: userResponse.data.dogsListed.join(",") },
          }
        );

        const sortedDogs = dogsResponse.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setDogsData(sortedDogs);
      } catch (err) {
        setFetchError(
          err.response?.data?.message || "Error fetching user data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const handleDogClick = (dog) => {
    setSelectedDogForModal(dog);
    setShowDogModal(true);
  };

  if (loading) {
    return <ProfileLoader />;
  }

  if (fetchError) {
    return (
      <div className="text-center p-8 text-red-500">
        Error loading profile: {fetchError}
      </div>
    );
  }

  if (!userData) {
    return <div className="text-center p-8 text-gray-600">User not found</div>;
  }

  return (
    <div className="max-w-4xl min-h-screen mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden min-h-screen sm:p-6 p-2">
        {/* Dog Detail Modal */}
        <DogDetailModal
          isOpen={showDogModal}
          onClose={() => {
            setShowDogModal(false);
            setSelectedDogForModal(null);
          }}
          dog={selectedDogForModal}
          filteredDogs={dogsData}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center sm:gap-6 sm:mb-8 mb-2">
          <div className="flex items-center w-full md:w-auto mt-2 gap-0">
            <div className="w-24 h-24 sm:w-26 sm:h-26 rounded-full ml-2 bg-gray-200 overflow-hidden">
              <img
                src={
                  userData.dp_url ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <div className="flex flex-col mt-2">
              <h1 className="text-2xl font-bold text-gray-800 whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px] sm:max-w-none leading-tight">
                {userData.username}
              </h1>
              <p className="text-gray-500 text-base sm:text-[17px] leading-tight mt-[2px]">
                Member since{" "}
                <span className="text-gray-700">
                  {new Date(userData.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
          <div className="p-4 bg-violet-50 rounded-lg border border-violet-200">
            <h3 className="font-medium text-gray-700 text-base">Dogs Listed</h3>
            <p className="text-3xl font-bold text-violet-500">
              {userData.dogsListed.length}
            </p>
          </div>
        </div>

        {/* Recent Listings Section */}
        <div className="sm:mt-8 mt-4">
          <h2 className="sm:text-xl text-lg font-bold text-gray-800 mb-4">
            Recent Listings
          </h2>

          {dogsData.length === 0 ? (
            <div className="flex flex-col flex-grow min-h-[30vh] sm:min-h-[50vh] items-center justify-center p-4">
              <div className="text-center text-gray-500 bg-violet-50 rounded-xl w-full max-w-sm mx-auto p-8 shadow-inner border border-violet-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto mb-4 text-violet-300"
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
                <p className="text-gray-600 font-medium">No dogs posted yet</p>
              </div>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 lg:columns-3 sm:gap-2 custom-column-gap">
              {dogsData.map((dog) => (
                <div key={dog._id} className="break-inside-avoid image-item">
                  <div className="relative overflow-hidden special-shadow-1 rounded-xl group">
                    <img
                      src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                      alt={dog.type}
                      className="w-full h-auto object-cover cursor-pointer select-none"
                      onClick={() => handleDogClick(dog)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default User;
