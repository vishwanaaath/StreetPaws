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
  const [sortBy, setSortBy] = useState("az");
  const [filterHasDogs, setFilterHasDogs] = useState(false);

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

  const handleFilterChange = (type, value) => {
    if (type === "sort") setSortBy(value);
    if (type === "filter") setFilterHasDogs(value);
  };

  const filteredUsers = users
    .filter((user) => !filterHasDogs || user.dogsListed?.length > 0)
    .sort((a, b) => {
      switch (sortBy) {
        case "az":
          return a.username.localeCompare(b.username);
        case "za":
          return b.username.localeCompare(a.username);
        case "dogsHighToLow":
          return (b.dogsListed?.length || 0) - (a.dogsListed?.length || 0);
        default:
          return 0;
      }
    });

  if (loading) return <UserLoader />;

  return (
    <div className="relative min-h-screen bg-gray-50 sm:pt-6 flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto w-full flex-1">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-1 p-0.5 h-full min-h-[calc(100vh-4rem)] flex flex-col">
          {/* Header with Filters */}
          <div className="flex justify-between items-center p-4 border-b">
            <h1 className="text-2xl font-bold text-violet-600">Community</h1>

            <div className="flex gap-4 items-center">
              {/* Has Dogs Checkbox */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasDogs"
                  checked={filterHasDogs}
                  onChange={(e) =>
                    handleFilterChange("filter", e.target.checked)
                  }
                  className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <label htmlFor="hasDogs" className="text-sm text-gray-700">
                  Has Listed Dogs
                </label>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="block w-48 rounded-md border-gray-300 py-1.5 pl-3 pr-10 text-base focus:border-violet-500 focus:outline-none focus:ring-violet-500 sm:text-sm">
                <option value="az">Alphabetical (A-Z)</option>
                <option value="za">Alphabetical (Z-A)</option>
                <option value="dogsHighToLow">Most Dogs Listed</option>
              </select>
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto space-y-2 pb-4 px-4">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                onClick={() => handleListerProfileClick(user._id)}
                className="group relative cursor-pointer flex items-center p-4
                  bg-white hover:bg-gray-50 transition-colors
                  rounded-lg active:scale-[0.98] active:shadow-sm">
                <div className="absolute inset-0 bg-violet-500 opacity-0 group-active:opacity-10 transition-opacity rounded-lg" />

                {/* User Avatar */}
                <img
                  src={
                    user.dp_url ||
                    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                  }
                  alt={user.username}
                  className="w-14 h-14 rounded-full object-cover border-2 border-violet-100"
                />

                {/* User Info */}
                <div className="ml-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-semibold text-gray-800 truncate">
                      {user.username}
                    </h2>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {user.dogsListed?.length || 0}{" "}
                    {user.dogsListed?.length === 1 ? "dog" : "dogs"} listed
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
