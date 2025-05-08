import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import UserLoader from "./UserLoader";

const UsersList = () => {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) return <UserLoader />;

  return (
    <div className="relative min-h-screen bg-gray-50 p-1 flex flex-col">
      {/* Background Animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto flex-1 w-full">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-1 p-0.5 h-full min-h-[calc(100vh-4rem)] flex flex-col">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-4 pl-4">
            Community
          </h1>

          <div className="flex-1 overflow-y-auto space-y-2 pb-4">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleListerProfileClick(user._id)}
                className="group relative cursor-pointer flex items-center p-3 sm:p-4  
                  bg-white shadow-sm hover:shadow-md transition-all duration-200
                  active:scale-[0.98] active:shadow-sm">
                {/* Touch feedback animation */}
                <div className="absolute inset-0 bg-violet-500 opacity-0 group-active:opacity-10 transition-opacity rounded-xl" />

                <img
                  src={
                    user.dp_url ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt={user.username}
                  className="w-15 h-15 sm:w-14 sm:h-14 rounded-full object-cover"
                />

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                      {user.username}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.dogsListed?.length || 0}{" "}
                    {user.dogsListed?.length === 1
                      ? "dog listed"
                      : "dogs listed"}
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
