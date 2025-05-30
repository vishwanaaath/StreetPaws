import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";0
import axios from "axios";
import { Search, ArrowLeft } from "lucide-react";
import UserLoader from "./UserLoader";

const UsersList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState({});
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.username?.toLowerCase().startsWith(searchText.toLowerCase())
  );

  const handleListerProfileClick = async (listerId) => {
    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/mongo/${listerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/user", { state: { user: response.data } });
    } catch (error) {
      console.error("Error fetching lister's profile:", error);
    }
  };

  const handleImageLoad = (userId) => {
    setImageLoaded((prev) => ({ ...prev, [userId]: true }));
  };

  const handleImageError = (userId) => {
    setImageLoaded((prev) => ({ ...prev, [userId]: true }));
  };

  if (loading) return <UserLoader />;


  return (
    <div className="relative min-h-screen bg-gray-50 p-0  sm:p-0 sm:pt-6 flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto flex-1 w-full">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-1 p-0.5 h-full min-h-[calc(100vh-4rem)] flex flex-col">
          <h1 className="text-[25px] font-bold text-violet-600 mb-2 mt-4 pl-4 flex justify-between items-center pr-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate("/map")}
                className="text-violet-600 mr-1 hover:text-violet-800 transition">
                <ArrowLeft size={23} />
              </button>
              Community
            </div>
            <button
              onClick={() => setSearchVisible((prev) => !prev)}
              className="text-violet-600 px-3 py-2 hover:text-violet-800 transition">
              <Search size={20} />
            </button>
          </h1>
          {searchVisible && (
            <div className="px-4 mt-2 mb-2">
              <input
                type="text"
                placeholder="Search by username"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>
          )}
          <div className="flex-1 overflow-y-auto space-y-1 pb-1">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleListerProfileClick(user._id)}
                className="group relative cursor-pointer flex items-center ml-2 p-2 sm:p-4  
                  bg-white transition-all duration-200
                  active:scale-[0.98] active:shadow-sm">
                <div className="absolute inset-0 bg-violet-500 opacity-0 group-active:opacity-10 transition-opacity rounded-xl" />

                <div className="relative w-14 h-14 sm:w-14 sm:h-14 rounded-full">
                  {!imageLoaded[user._id] && (
                    <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-full" />
                  )}
                  <img
                    src={
                      user.dp_url ||
                      "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    }
                    alt={user.username}
                    className="w-full h-full rounded-full object-cover"
                    onLoad={() => handleImageLoad(user._id)}
                    onError={() => handleImageError(user._id)}
                    style={{
                      visibility: imageLoaded[user._id] ? "visible" : "hidden",
                    }}
                  />
                </div>

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                      {user.username}
                    </h2>
                  </div>
                  <p className="text-[12px] text-gray-500 ">
                    {user.dogsListed?.length || 0}{" "}
                    {user.dogsListed?.length === 1
                      ? "dog posted"
                      : "dogs posted"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersList;
