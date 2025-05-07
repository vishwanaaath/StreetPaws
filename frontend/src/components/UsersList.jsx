// components/UsersList.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { Link } from "react-router-dom";
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
          {
            headers: { Authorization: `Bearer ${token}` },
          }
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

  if (loading) {
    return <UserLoader/>;
  }
  return (
    <div className="relative min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-violet-800 mb-10">
          Community
        </h1>

        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
          {users.map((user) => (
            <div
              key={user._id}
              onClick={() => handleListerProfileClick(user._id)}
              className="cursor-pointer flex items-center justify-between bg-white shadow-sm sm:shadow-md hover:shadow-md sm:hover:shadow-lg rounded-xl px-4 py-3 sm:p-5 transition-transform duration-200 hover:scale-[1.02]">
              <img
                src={
                  user.dp_url ||
                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                }
                alt=" "
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
              />
              <div className="ml-4 flex-1 min-w-0">
                <h2 className="text-base sm:text-xl font-medium sm:font-semibold text-gray-900 truncate">
                  {user.username}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {user.dogsListed?.length || 0}{" "}
                  {user.dogsListed?.length === 1 ? "rescue" : "rescues"}
                </p>
              </div>
              <div className="ml-auto pl-2 sm:pl-4 opacity-50 sm:opacity-60 group-hover:opacity-100 transition-opacity">
                <div className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-violet-100 sm:bg-gradient-to-br from-violet-400 to-violet-500 rounded-full shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5 text-violet-600 sm:text-white"
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
  );
};

export default UsersList;