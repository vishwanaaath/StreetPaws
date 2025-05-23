import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { DiamondPlus, Compass, Users, LogOut, LogIn } from "lucide-react";

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
          setUserDataLoaded(true);
        }
      } else if (!isAuthenticated && !isLoading) {
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

  // Button component with consistent styling
  const AnimatedButton = ({
    onClick,
    children,
    icon: Icon,
    gradient = "from-violet-600 to-fuchsia-500",
    hoverGradient = "from-violet-700 to-fuchsia-600",
    className = "",
  }) => (
    <button
      onClick={onClick}
      className={`group relative flex items-center justify-center gap-2 px-4 py-2.5 w-full text-sm font-medium rounded-lg bg-gradient-to-br ${gradient} text-white hover:${hoverGradient} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:ring-2 focus:ring-violet-400 focus:outline-none ${className}`}>
      {/* Animated shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute -inset-[100px] opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.3)_50%,_transparent_75%)] group-hover:animate-shine" />
      </div>

      {/* Icon with subtle bounce animation */}
      {Icon && (
        <Icon className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-300" />
      )}

      <span className="relative font-medium">{children}</span>
    </button>
  );

  // Link component with consistent styling
  const AnimatedLink = ({
    to,
    state,
    children,
    icon: Icon,
    gradient = "from-violet-600 to-fuchsia-500",
    hoverGradient = "from-violet-700 to-fuchsia-600",
    className = "",
  }) => (
    <Link
      to={to}
      state={state}
      className={`group relative flex items-center justify-center gap-2 px-4 py-2.5 w-full text-sm font-medium rounded-lg bg-gradient-to-br ${gradient} text-white hover:${hoverGradient} transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] focus:ring-2 focus:ring-violet-400 focus:outline-none ${className}`}>
      {/* Animated shine effect */}
      <div className="absolute inset-0 overflow-hidden rounded-lg">
        <div className="absolute -inset-[100px] opacity-0 group-hover:opacity-30 transition-opacity duration-300 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.3)_50%,_transparent_75%)] group-hover:animate-shine" />
      </div>

      {/* Icon with subtle bounce animation */}
      {Icon && (
        <Icon className="w-5 h-5 transform group-hover:-translate-y-0.5 transition-transform duration-300" />
      )}

      <span className="relative font-medium">{children}</span>
    </Link>
  );

  const isLoadingState = isLoading || (isAuthenticated && !userDataLoaded);

  return (
    <div
      className={`sidebar-container fixed left-0 top-0 h-full w-[260px] backdrop-blur-sm bg-white/80 border-r border-gray-200 shadow-2xl transform transition-transform duration-300 z-[1001] ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={() => setSidebarVisible(true)}
      onMouseLeave={handleSidebarLeave}>
      {/* Top profile section */}
      <div className="h-[calc(100%-260px)] overflow-y-auto pb-4">
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
              className="flex w-full p-3 transition-colors hover:bg-violet-50 rounded-lg mx-2 my-2">
              <div className="flex w-full items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-2 ring-violet-200">
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
                  <p className="text-[13px] text-gray-600 mt-1">
                    {userData.dogsListed?.length || 0}{" "}
                    {userData.dogsListed?.length === 1
                      ? "dog listed"
                      : "dogs listed"}
                  </p>
                </div>
              </div>
            </Link>

            {/* Explore Button - Below Profile */}
            <div className="px-3 mt-4">
              <AnimatedLink
                to="/explore"
                icon={Compass}
                gradient="from-blue-600 to-purple-500"
                hoverGradient="from-blue-700 to-purple-600">
                Explore Dogs
              </AnimatedLink>
            </div>
          </>
        ) : null}
      </div>

      {/* Bottom Buttons incl. login/logout + others */}
      <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
        {isLoadingState ? (
          // Skeleton while loading
          <div className="space-y-3">
            <div className="h-[42px] rounded-lg bg-violet-200 w-full animate-pulse" />
            <div className="h-[42px] rounded-lg bg-violet-200 w-full animate-pulse" />
            <div className="h-[42px] rounded-lg bg-violet-200 w-full animate-pulse" />
          </div>
        ) : isAuthenticated && userData ? (
          <>
            {/* Post a Dog Button */}
            <AnimatedButton
              onClick={handleListDog}
              icon={DiamondPlus}
              gradient="from-violet-600 to-fuchsia-500"
              hoverGradient="from-violet-700 to-fuchsia-600">
              Post a Dog
            </AnimatedButton>

            {/* Community Button */}
            <AnimatedLink
              to="/users"
              icon={Users}
              gradient="from-emerald-600 to-teal-500"
              hoverGradient="from-emerald-700 to-teal-600">
              Community
            </AnimatedLink>

            {/* Logout Button */}
            <AnimatedButton
              onClick={handleLogout}
              icon={LogOut}
              gradient="from-red-600 to-pink-500"
              hoverGradient="from-red-700 to-pink-600">
              Logout
            </AnimatedButton>
          </>
        ) : (
          // Login Button
          <AnimatedButton
            onClick={handleLogin}
            icon={LogIn}
            gradient="from-indigo-600 to-blue-500"
            hoverGradient="from-indigo-700 to-blue-600">
            Login
          </AnimatedButton>
        )}
      </div>

      {/* Add custom shine animation to the CSS */}
      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 1s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
