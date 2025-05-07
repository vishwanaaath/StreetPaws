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
    user: auth0User,
    loginWithRedirect,
    logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const [type, settype] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [istypeDropdownOpen, setIstypeDropdownOpen] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isDistanceDropdownOpen, setIsDistanceDropdownOpen] = useState(false);

  const dogType = [
    {
      name: "Brown",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/Brown.jpg",
    },
    {
      name: "Black",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406357610-black.jpg",
    },
    {
      name: "White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406393596-white.jpg",
    },
    {
      name: "Brown and White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405559806-brown-white.jpg",
    },
    {
      name: "Black and White",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405701747-black-white.jpg",
    },
    {
      name: "Unique",
      imageUrl:
        "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406502654-spotted-dog.jpg",
    },
  ];

  // Fetch user data when authenticated
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
          console.log(response.data);
          console.log("signed");

          // navigate("/profile", { state: { user: response.data } });
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

  const handleSignUp = async () => {
    if (!isAuthenticated) {
      await loginWithRedirect({
        appState: { returnTo: window.location.pathname },
        authorizationParams: {
          screen_hint: "signup",
          redirect_uri: window.location.origin,
        },
      });
    }
  };

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
        returnTo: "http://localhost:5173/",
      },
    });
    setNotificationMessage("Successfully logged out"); 
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

  return (
    <div
      className={`sidebar-container fixed left-0 top-0 h-full w-[260px] backdrop-blur-lg bg-white/80 border-r border-gray-200 shadow-2xl transform transition-transform duration-300 z-[1001] ${
        sidebarVisible ? "translate-x-0" : "-translate-x-full"
      }`}
      onMouseEnter={() => setSidebarVisible(true)}
      onMouseLeave={handleSidebarLeave}>
      {isAuthenticated && userData ? (
        <Link
          to="/profile"
          state={{ user: userData }}
          className="flex w-full p-3 transition-colors  ">
          <div className="flex w-full items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-15 h-15 rounded-full overflow-hidden    ">
                <img
                  src={userData.dp_url || auth0User.picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="flex flex-col  mt-2.5 justify-center flex-1">
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
      ) : (
        <div className="p-4 space-y-4" onClick={handleLogin}>
          {/* <button
            onClick={handleSignUp}
            className="w-full px-4 py-2 bg-violet-400 cursor-pointer text-white rounded-lg hover:bg-violet-600 transition-colors">
            Sign Up
          </button> */}
          <button className="w-full px-4 py-2 border-2 border-violet-400 cursor-pointer text-violet-500 rounded-lg hover:bg-violet-50 transition-colors">
            Login
          </button>
        </div>
      )}

      <div className="relative mt-5 w-full px-4">
        {/* Add custom scrollbar styles */}
        <style jsx>{`
          .custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: rgba(245, 243, 255, 0.5);
            border-radius: 10px;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: rgba(167, 139, 250, 0.8);
            border-radius: 10px;
            border: 1px solid rgba(245, 243, 255, 0.5);
          }
          .custom-scroll::-webkit-scrollbar-thumb:hover {
            background: rgba(139, 92, 246, 0.8);
          }
        `}</style>
        <button
          className="w-full  sm:px-4 sm:py-3.5  px-3 py-2 text-[15px] font-medium rounded-lg bg-white/80 backdrop-blur-md border-2 border-violet-400  hover:shadow-lg hover:bg-violet-100/40 transition-all duration-200"
          onClick={() => {
            setIstypeDropdownOpen(!istypeDropdownOpen);
            if (isDistanceDropdownOpen) {
              setIsDistanceDropdownOpen(false);
            }
          }}>
          <div className="flex items-center cursor-pointer justify-around">
            <span>{type || "Filter dog type"}</span>
            <svg
              className={`w-4 h-4 ml-2 transform transition-transform ${
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
        {type && (
          <button
            onClick={() => settype("")}
            className="text-xs text-violet-600 hover:text-violet-700">
            Clear Filters
          </button>
        )}
        {istypeDropdownOpen && (
          <div className=" bg-white rounded-lg max-h-[300px] overflow-y-auto ">
            <div className="flex px-3 py-2 gap-2 overflow-x-auto snap-x snap-mandatory touch-pan-x custom-scroll">
              {dogType.map((typeItem) => (
                <div
                  key={typeItem.name}
                  className="flex-shrink-0 w-32 snap-center">
                  <div className="relative cursor-pointer group">
                    <img
                      src={typeItem.imageUrl}
                      alt={typeItem.name}
                      className={`w-35 h-35 object-cover rounded-lg border-2 transition-all duration-200 ${
                        type === typeItem.name
                          ? "border-violet-400 shadow-md"
                          : "border-gray-200 group-hover:border-violet-300"
                      }`}
                      onClick={() => {
                        settype(typeItem.name);
                        setNotificationImage(typeItem.imageUrl);
                        setNotificationMessage(`${typeItem.name} filter added`);
                        setIstypeDropdownOpen(false);
                      }}
                    />
                    <span className="block mt-2 text-sm font-medium text-gray-700 text-center">
                      {typeItem.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* <div className="relative mt-5 w-full px-4">
        <style jsx>{`
          .custom-scroll::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scroll::-webkit-scrollbar-track {
            background: #f5f3ff;
            border-radius: 4px;
          }
          .custom-scroll::-webkit-scrollbar-thumb {
            background: #a78bfa;
            border-radius: 4px;
          }
          .custom-scroll {
            scrollbar-width: thin;
            scrollbar-color: #a78bfa #f5f3ff;
          }
        `}</style>

        <button
          className="w-full px-1 py-2 text-[15px] font-medium rounded-lg border-2 border-violet-400 bg-white hover:bg-violet-50 transition-colors duration-200"
          onClick={() => {
            setIsDistanceDropdownOpen(!isDistanceDropdownOpen);
            if (istypeDropdownOpen) {
              setIstypeDropdownOpen(false);
            }
          }}>
          <div className="flex items-center  cursor-pointer justify-around">
            <span>{distance ? `within ${distance} ` : "no limit"}</span>

            <svg
              className={`w-4 h-4 ml-2 transform transition-transform ${
                isDistanceDropdownOpen ? "rotate-180" : ""
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

        {isDistanceDropdownOpen && (
          <div className="bg-white rounded-lg max-h-[300px] overflow-y-auto">
            <div className="flex px-3 py-2 gap-2 overflow-x-auto snap-x snap-mandatory touch-pan-x custom-scroll">
              {["1km", "5km", "10km", , "No limit"].map((distanceOption) => (
                <div
                  key={distanceOption}
                  className="flex-shrink-0 w-32 snap-center">
                  <div
                    className={`p-4 text-center  rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      distance === distanceOption
                        ? "border-violet-400 shadow-md bg-violet-50"
                        : "border-gray-200 hover:border-violet-300 bg-white"
                    }`}
                    onClick={() => {
                      setDistance(distanceOption);
                      setIsDistanceDropdownOpen(false);
                    }}>
                    <span className="text-sm font-medium text-gray-700">
                      {distanceOption === "No limit"
                        ? "No limit"
                        : `${distanceOption}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div> */}

      {/* Updated buttons section */}
      {isAuthenticated && (
        <div className="absolute bottom-4 left-0 right-0 px-4 space-y-3">
          {/* Users Button - Improved semantics */}
          <Link
            to="/users"
            className="flex items-center justify-center gap-2 w-full  sm:px-4 sm:py-3  px-3 py-2 text-sm sm:text-base font-medium rounded-lg border-2 border-violet-400 bg-white text-violet-600 hover:bg-violet-50 transition-colors duration-200 shadow-md focus:ring-2 focus:ring-violet-400 focus:outline-none"
            role="button"
            aria-label="View community members">
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

          {/* Logout Button - Enhanced accessibility */}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full sm:px-4 sm:py-3  px-3 py-2 bg-violet-500 text-white rounded-lg hover:bg-red-500 transition-colors duration-300 shadow-md focus:ring-2 focus:ring-red-300 focus:outline-none"
            aria-label="Logout">
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
        </div>
      )}
    </div>
  );
};

export default Sidebar;
