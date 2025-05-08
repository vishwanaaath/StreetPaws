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
    <div className="relative min-h-screen bg-gray-50 p-1">
      {/* Background Animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-1 p-0.5">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 pl-4">
            Community
          </h1>

          <div className="">
            {users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleListerProfileClick(user._id)}
                className="group relative cursor-pointer flex items-center p-3 sm:p-4 rounded-xl 
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
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover shadow-sm"
                />

                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base sm:text-lg font-semibold text-gray-800 truncate">
                      {user.username}
                    </h2>
                    {user.isDeveloper && (
                      <span className="px-2 py-1 bg-violet-100 text-violet-600 text-xs rounded-full">
                        Creator
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.dogsListed?.length || 0}{" "}
                    {user.dogsListed?.length === 1 ? "Rescue" : "Rescues"}
                  </p>
                </div>

                {/* Premium chevron */}
                <div className="ml-auto pl-2 transform group-hover:translate-x-1 transition-transform">
                  <div className="w-8 h-8 flex items-center justify-center bg-gradient-to-br from-violet-400 to-violet-500 rounded-full shadow-sm">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-white"
                      viewBox="0 0 20 20"
                      fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
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
