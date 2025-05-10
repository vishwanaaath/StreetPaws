import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({
  sidebarVisible,
  setSidebarVisible,
  setNotificationMessage,
  setNotificationImage,
  selectedColor,
  handleColorSelect,
}) => {
  const {
    isAuthenticated,
    isLoading,
    user: auth0User,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [istypeDropdownOpen, setIstypeDropdownOpen] = useState(false);

  const dogTypeOptions = [
    { name: "Brown", imageUrl: "brown-image-url" },
    { name: "Black", imageUrl: "black-image-url" },
    { name: "White", imageUrl: "white-image-url" },
    { name: "Brown and White", imageUrl: "brown-white-image-url" },
    { name: "Black and White", imageUrl: "black-white-image-url" },
    { name: "Unique", imageUrl: "unique-image-url" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!isAuthenticated || !auth0User?.sub) return;

      try {
        const numericId = auth0User.sub.split("|")[1];
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${numericId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        error.response?.status === 404 && navigate("/PostDP");
      }
    };

    fetchUserData();
  }, [isAuthenticated, auth0User?.sub, navigate, getAccessTokenSilently]);

  const handleLogin = () => !isAuthenticated && loginWithRedirect();

  const handleLogout = () => {
    setSidebarVisible(false);
    logout({ logoutParams: { returnTo: window.location.origin } });
    setNotificationMessage("Successfully logged out");
  };

  const handleFilterSelect = (typeName, imageUrl) => {
    handleColorSelect(typeName);
    setNotificationImage(imageUrl);
    setNotificationMessage(`${typeName} filter added`);
    setIstypeDropdownOpen(false);
  };

  return (
    <div
      className={`sidebar-container fixed left-0 top-0 h-full w-[260px] backdrop-blur-lg bg-white/80 border-r border-gray-200 shadow-2xl transform transition-transform duration-300 z-[1001] ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={() => setSidebarVisible(true)}
      onMouseLeave={() => setSidebarVisible(false)}>
      {/* User Profile Section */}
      {isLoading || (isAuthenticated && !userData) ? (
        <div className="flex w-full p-3 animate-pulse">
          <div className="flex w-full items-start gap-4">
            <div className="w-15 h-15 rounded-full bg-violet-200" />
            <div className="flex flex-col mt-2.5 justify-center flex-1 space-y-2">
              <div className="h-4 bg-violet-200 rounded w-3/4" />
              <div className="h-3 bg-violet-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      ) : isAuthenticated ? (
        <Link
          to="/profile"
          state={{ user: userData }}
          className="flex w-full p-3 transition-colors hover:bg-violet-50">
          <div className="flex items-start gap-4 w-full">
            <img
              src={userData.dp_url || auth0User.picture}
              alt="Profile"
              className="w-15 h-15 rounded-full object-cover"
            />
            <div className="flex flex-col justify-center flex-1">
              <p className="text-[16px] font-bold text-gray-800">
                {userData.username}
              </p>
              <p className="text-[13px] text-gray-900 mt-1">
                {userData.dogsListed?.length || 0} dogs listed
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="p-4">
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 border-2 border-violet-400 text-violet-500 rounded-lg hover:bg-violet-50 transition-colors">
            Login
          </button>
        </div>
      )}

      {/* Filter Section */}
      <div className="relative mt-5 px-4">
        <div className="space-y-2">
          <button
            className="w-full px-4 py-3.5 text-sm font-medium rounded-lg bg-white/80 border-2 border-violet-400 hover:bg-violet-100/40 transition-all"
            onClick={() => setIstypeDropdownOpen(!istypeDropdownOpen)}>
            <div className="flex items-center justify-between">
              <span>{selectedColor || "Filter dog type"}</span>
              <svg
                className={`w-4 h-4 transform transition-transform ${
                  istypeDropdownOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>
          </button>

          {selectedColor && (
            <button
              onClick={() => handleColorSelect(null)}
              className="text-xs text-violet-600 hover:text-violet-700">
              Clear Filters
            </button>
          )}
        </div>

        {istypeDropdownOpen && (
          <div className="mt-2 bg-white rounded-lg shadow-lg max-h-[300px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 p-3">
              {dogTypeOptions.map((type) => (
                <div
                  key={type.name}
                  className="cursor-pointer group"
                  onClick={() => handleFilterSelect(type.name, type.imageUrl)}>
                  <img
                    src={type.imageUrl}
                    alt={type.name}
                    className={`w-full h-32 object-cover rounded-lg border-2 transition-all ${
                      selectedColor === type.name
                        ? "border-violet-400 shadow-md"
                        : "border-gray-200 group-hover:border-violet-300"
                    }`}
                  />
                  <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
                    {type.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Buttons */}
      {isAuthenticated && (
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
          <Link
            to="/users"
            className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium rounded-lg border-2 border-violet-400 bg-white text-violet-600 hover:bg-violet-50 transition-colors">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            Community
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-3 bg-violet-500 text-white rounded-lg hover:bg-violet-600 transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4zm9.293 1.293a1 1 0 011.414 0L17 8.586a1 1 0 010 1.414l-3.293 3.293a1 1 0 01-1.414-1.414L13.586 10H9a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
