import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DiamondPlus } from "lucide-react";

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
  const [userDataLoaded, setUserDataLoaded] = useState(false);
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
          setUserDataLoaded(true);
        } catch (error) {
          console.error("Error fetching user data:", error);
          if (error.response?.status === 404) {
            navigate("/PostDP");
          }
          setUserDataLoaded(true); // Set as loaded even on error
        }
      } else if (!isAuthenticated && !isLoading) {
        // Clear user data when not authenticated
        setUserData(null);
        setUserDataLoaded(true);
      }
    };

    if (!isLoading) {
      fetchUserData();
    }
  }, [
    isLoading,
    isAuthenticated,
    auth0User?.sub,
    navigate,
    getAccessTokenSilently,
  ]);

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
    setNotificationImage(userData?.dp_url);
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

  // Show loading state while auth is loading or user data is being fetched
  const isLoadingState = isLoading || (isAuthenticated && !userDataLoaded);

  return (
    <div
      className={`sidebar-container fixed left-0 top-0 h-full w-[260px] backdrop-blur-sm bg-white/80 border-r border-gray-200 shadow-2xl transform transition-transform duration-300 z-[1001] ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={() => setSidebarVisible(true)}
      onMouseLeave={handleSidebarLeave}>
      {/* Top profile section */}
      <div className="h-[calc(100%-200px)] overflow-y-auto pb-4">
        {isLoadingState ? (
          // Show skeleton for profile while loading
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
        ) : isAuthenticated && userData ? (
          <>
            {/* Profile Section */}
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

            {/* Explore Button - Below Profile */}
            <div className="px-3 mt-2">
              <Link
                to="/explore"
                className="flex items-center gap-3 px-4 py-2 w-full text-sm font-medium rounded-lg border-2 border-violet-500 bg-white text-violet-500 hover:bg-violet-50 transition-colors duration-200 focus:ring-2 focus:ring-violet-400 focus:outline-none">
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#7c3aed"
                  stroke="#7c3aed">
                  <path d="M231.6 16.18l16.7 120.02 73.8 20.5c37.3-11.2 78.5-18.2 102.3-43.6 9.7-10.3 17.2-24.78 9.1-37.92l-75.3 2.22-14.6-31.79h-74.7c-7.7-11.71-22.8-20.46-37.3-29.43zm5.7 145.22c-46.9 19.8-110.1 146.3-111.8 276.5-34.02-58.1-24.9-122.6-2.9-202.6C55.31 287 4.732 448.4 133.1 486.9H346s-6.3-21.5-14.1-28.9c-12.7-12-48.2-20.2-48.2-20.2 27.8-39.2 33.5-71.7 38.6-103.9 4.5 59.8 40.7 126.8 57.4 153h76.5s4.6-15.9.2-21.5c-10.9-13.8-51.3-11.9-51.3-11.9-31.1-107.2-46.3-260.2-90-273.2-21.7-6.5-54.3-14.1-77.8-18.9z" />
                </svg>
                <span>Explore Dogs</span>
              </Link>
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Buttons incl. login/logout + others */}
      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-2">
        {isLoadingState ? (
          // Skeleton while loading
          <div className="h-[42px] rounded-lg bg-violet-200 w-full animate-pulse" />
        ) : isAuthenticated && userData ? (
          <>
            // Replace the existing "Post a Dog" button with this code
            <button
              onClick={handleListDog}
              className="group relative flex items-center justify-center gap-2 px-4 py-2.5 w-full text-sm font-medium rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white hover:from-violet-700 hover:to-fuchsia-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:ring-2 focus:ring-violet-400 focus:outline-none">
              {/* Animated shine effect */}
              <div className="absolute inset-0 overflow-hidden rounded-lg">
                <div className="absolute -inset-[100px] opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.3)_50%,_transparent_75%)] group-hover:animate-shine" />
              </div>

              {/* Icon with subtle bounce animation */}
              <DiamondPlus className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-300" />

              <span className="relative">
                Premium Listing
                <svg
                  className="w-4 h-4 ml-1.5 inline-block transform group-hover:rotate-12 transition-transform duration-300"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  stroke="currentColor">
                  <path d="M5 16L3 5l8.5 5L12 4l1.5 6L22 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1s.4-1 1-1h12c.6 0 1 .4 1 1z" />
                </svg>
              </span>
            </button>
            <Link
              to="/users"
              className="flex items-center gap-2 px-4 py-2 w-full text-sm font-medium rounded-lg border-2 border-violet-500 bg-white text-violet-500 hover:bg-violet-50 transition-colors duration-200 focus:ring-2 focus:ring-violet-400 focus:outline-none">
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
          </>
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
