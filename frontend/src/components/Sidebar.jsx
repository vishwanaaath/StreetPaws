import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Sidebar = ({
  sidebarVisible,
  setSidebarVisible,
  setNotificationMessage,
  setNotificationImage,
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

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && auth0User?.sub) {
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
          if (error.response?.status === 404) {
            navigate("/PostDP");
          }
        }
      }
    };

    fetchUserData();
  }, [isAuthenticated, auth0User?.sub, navigate, getAccessTokenSilently]);

  const handleLogin = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname },
      });
    }
  };

  const handleLogout = () => {
    setSidebarVisible(false);
    logout({
      logoutParams: {
        returnTo: "https://streetpaws.onrender.com/",
      },
    });
    setNotificationMessage("Successfully logged out");
    setNotificationImage(userData.dp_url);
  };

  const handleSidebarLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    if (
      relatedTarget?.closest &&
      !relatedTarget.closest(".sidebar-container")
    ) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(false);
    }
  };

  const handleListDog = async () => {
      navigate("/list-dog", { state: { user: userData } });
  };

  return (
    <div
      className={`sidebar-container fixed left-0 top-0 h-full w-[260px] backdrop-blur-lg bg-white/80 border-r border-gray-200 shadow-2xl transform transition-transform duration-300 z-[1001] ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={() => setSidebarVisible(true)}
      onMouseLeave={handleSidebarLeave}>
      <div className="h-[calc(100%-120px)] overflow-y-auto pb-4">
        {/* Profile section if logged in */}
        {isLoading || (isAuthenticated && !userData) ? (
          <>
            {/* Profile loader */}
            <div className="flex w-full p-3 animate-pulse">
              <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-15 h-15 rounded-full bg-violet-200" />
                </div>
                <div className="flex flex-col mt-2.5 justify-center flex-1 space-y-2">
                  <div className="h-4 bg-violet-200 rounded w-3/4" />
                  <div className="h-3 bg-violet-200 rounded w-1/2" />
                </div>
              </div>
            </div>

            {/* Button loaders */}
            <div className="px-2 pt-4 space-y-3 animate-pulse">
              <div className="h-[42px] rounded-lg bg-violet-200 w-full" />
              <div className="h-[42px] rounded-lg bg-violet-200 w-full" />
            </div>
          </>
        ) : isAuthenticated && userData ? (
          <>
            <Link
              to="/profile"
              state={{ user: userData }}
              className="flex w-full p-3 transition-colors hover:bg-violet-50">
              <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden">
                    <img
                      src={userData.dp_url || auth0User.picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-col mt-2.5 justify-center flex-1">
                  <p className="text-[16px] font-bold text-gray-800">
                    {userData.username}
                  </p>
                  <p className="text-[13px] text-gray-900 mt-1">
                    {userData.dogsListed?.length || 0}{" "}
                    {userData.dogsListed?.length === 1
                      ? "dog listed"
                      : "dogs listed"}
                  </p>
                </div>
              </div>
            </Link>

            {/* Post Dog and Community */}
            <div className="px-2 pt-4">
              <button
                onClick={handleListDog}
                className="flex items-center gap-2 px-4 py-2 mt-2 text-sm sm:text-base font-medium rounded-lg border-2 border-violet-400 bg-white text-violet-600 hover:bg-violet-50 transition-colors duration-200 focus:ring-2 focus:ring-violet-400 focus:outline-none">
                <img
                  src="./images/Sitting dog.svg"
                  alt=""
                  className="w-5 h-5"
                />
                <span>Post a Dog</span>
              </button>
              <Link
                to="/users"
                className="flex items-center gap-2 px-4 py-2 mt-2 text-sm sm:text-base font-medium rounded-lg border-2 border-violet-400 bg-white text-violet-600 hover:bg-violet-50 transition-colors duration-200 focus:ring-2 focus:ring-violet-400 focus:outline-none">
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
                <span>Community</span>
              </Link>
            </div>
          </>
        ) : null}
      </div>

      {/* Auth Buttons */}
      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full sm:px-4 sm:py-3 px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-red-500 transition-colors duration-300 shadow-md focus:ring-2 focus:ring-red-300 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h6a1 1 0 110 2H5v10h5a1 1 0 110 2H4a1 1 0 01-1-1V4zm9.293 1.293a1 1 0 011.414 0L17 8.586a1 1 0 010 1.414l-3.293 3.293a1 1 0 01-1.414-1.414L13.586 10H9a1 1 0 110-2h4.586l-1.293-1.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium text-[16px]">Logout</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="w-full px-4 py-2 border-2 border-violet-400 cursor-pointer text-violet-500 rounded-lg hover:bg-violet-50 transition-colors">
            Login
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
