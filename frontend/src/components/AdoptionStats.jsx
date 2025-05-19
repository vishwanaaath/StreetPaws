import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";

const AdoptionStats = () => {
  const {
    user: auth0User,
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  const navigate = useNavigate();
 
  const [positions, setPositions] = useState([
    "far-left",
    "left",
    "active",
    "right",
    "far-right",
  ]);
  const [tagline, setTagline] = useState(1);
 
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions((prev) => {
        const newPositions = [...prev];
        const last = newPositions.pop();
        return [last, ...newPositions];
      });
      setTagline((prev) => (prev % 5) + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);
 
  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleListDog = async () => { 
    if (!isAuthenticated)
      return loginWithRedirect({ appState: { returnTo: "/list-dog" } });

    try {
      const token = await getAccessTokenSilently();
      const numericId = auth0User.sub.split("|")[1];
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/${numericId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/list-dog", { state: { user: response.data } });
    } catch (error) {
      error.response?.status === 404
        ? navigate("/PostDP")
        : alert(`Error: ${error.message}`);
    }
  };
 
  const handleCardClick = (index) => {
    if (positions[index] === "active") return;
    const newPositions = [...positions];
    const activeIndex = newPositions.indexOf("active");
    [newPositions[activeIndex], newPositions[index]] = [
      newPositions[index],
      newPositions[activeIndex],
    ];
    setPositions(newPositions);
  };
 
  const petData = [
    {
      id: 1,
      img: "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406393596-white.jpg",
      distance: "650m away",
      type: "White",
      age: "0-6 months",
    },
    {
      id: 2,
      img: "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/Brown.jpg",
      distance: "1.2km away",
      type: "Brown",
      age: "6-12 months",
    },
    {
      id: 3,
      img: "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745406357610-black.jpg",
      distance: "3.5km away",
      type: "Black",
      age: "1-2 years",
    },
    {
      id: 4,
      img: "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405559806-brown-white.jpg",
      distance: "500m away",
      type: "Brown-white",
      age: "1 year",
    },
    {
      id: 5,
      img: "https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/1745405701747-black-white.jpg",
      distance: "2km away",
      type: "Black-White",
      age: "2-3 years",
    },
  ];

  return (
    <div className="relative flex flex-col sm:flex-row items-center justify-start min-h-screen overflow-hidden text-violet-400 sm:p-16 gap-9">
      <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/20 via-purple-500/15 to-indigo-500/10 backdrop-blur-xl -z-10" />

      <div className="w-full max-w-2xl z-10 order-1 scale-85 sm:scale-100 sm:order-none">
        <div className="min-h-[180px] sm:min-h-[400px] flex items-center justify-start sm:block">
          {tagline === 2 && (
            <h1 className="font-gilroy font-extrabold text-6xl sm:text-[100px] bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent   leading-tight">
              Find your
              <br />
              Fur-ever
              <br />
              Friend
            </h1>
          )}
          {tagline === 3 && (
            <h1 className="font-gilroy font-extrabold text-6xl sm:text-[100px] bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent leading-tight">
              From <br /> Streets
              <br />
              To Sofa
            </h1>
          )}
          {tagline === 5 && (
            <h1 className="font-gilroy font-extrabold text-6xl sm:text-[100px] bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent  leading-tight">
              Zoooom <br /> in on <br /> Looove
            </h1>
          )}
          {tagline === 4 && (
            <h1 className="font-gilroy font-extrabold text-6xl sm:text-[100px] bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent leading-tight">
              Pawsitive
              <br />
              Connections
              <br />
              Only
            </h1>
          )}
          {tagline === 1 && (
            <h1 className="font-gilroy font-extrabold text-6xl sm:text-[150px] text-[90px] bg-gradient-to-r from-purple-600 to-violet-400 bg-clip-text text-transparent leading-tight">
              Street <br />
              Paws
            </h1>
          )}
        </div>

        <div className="hidden sm:block mt-8">
          <div className="space-y-6">
            <button
              onClick={() => handleNavigation("/map")}
              className="sm:w-[450px] w-full py-5 px-4 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              Find Dogs
            </button>
            <button
              onClick={handleListDog}
              className="sm:w-[450px] w-full py-5 px-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-2xl font-bold cursor-pointer rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
              Post a Dog
            </button>
          </div>
        </div>
      </div>

      <div className="relative w-full sm:h-[500px] h-[180px] mt-4 scale-75 sm:scale-120 mr-0 sm:mr-20 flex items-center justify-center order-2 sm:order-none overflow-visible">
        {petData.map((pet, index) => (
          <div
            key={pet.id}
            className={`absolute w-80 sm:w-80 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              positions[index] === "active"
                ? "z-50 sm:scale-125 opacity-100 translate-x-0 shadow-2xl rotate-3"
                : positions[index] === "left"
                ? "z-40 -translate-x-28 scale-75 -rotate-6 sm:-translate-x-28 sm:scale-100"
                : positions[index] === "right"
                ? "z-40 translate-x-28 scale-75 rotate-6 sm:translate-x-28 sm:scale-100"
                : positions[index] === "far-left"
                ? "z-30 -translate-x-45 scale-50 -rotate-12 sm:-translate-x-36 sm:scale-85"
                : "z-30 translate-x-45 scale-50 rotate-12 sm:translate-x-36 sm:scale-85"
            }`}
            onClick={() => handleCardClick(index)}>
            <div className="relative bg-white rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="relative overflow-hidden rounded-xl h-72">
                <img
                  src={pet.img}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-300"
                  alt="Dog"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-5">
                  <div className="flex justify-between items-center text-white">
                    <span className="font-bold text-lg">{pet.type}</span>
                    <span className="text-base font-medium bg-violet-500/20 px-3 py-1 rounded-full backdrop-blur-sm">
                      {pet.age}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-5 flex justify-between items-center">
                <span className="text-base text-gray-600 font-medium">
                  {pet.distance}
                </span>
                <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center hover:bg-violet-200 transition-colors">
                  <svg
                    className="w-5 h-5 text-violet-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full max-w-md z-10 order-3 sm:scale-100  sm:hidden mt-8">
        <div className="space-y-6">
          <button
            onClick={() => handleNavigation("/map")}
            className="w-[90%] py-3 px-4 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            Find Dogs
          </button>
          <button
            onClick={handleListDog}
            className="w-[90%] py-3 px-4 bg-gradient-to-r from-purple-500 to-violet-600 text-white text-2xl font-bold cursor-pointer rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
            Post a Dog
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdoptionStats;
