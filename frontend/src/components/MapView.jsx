import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth0 } from "@auth0/auth0-react";
import L from "leaflet";
import axios from "axios";
import Sidebar from "./Sidebar";
import { useLocation } from "react-router-dom";
import Notification from "./Notification";
import ResetViewControl from "./ResetViewControl";
import MapViewLoader from "./MapViewLoader";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const dogIcon = new L.Icon({
  iconUrl: "./images/marker.svg",
  iconSize: [25, 25],
});

const MapView = () => {
  const Location = useLocation();
  const [newlyListedDogId, setNewlyListedDogId] = useState(null);
  const [map, setMap] = useState(null);
  const markerRefs = useRef({});

  const { user, getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [location, setLocation] = useState(null);
  const [viewDogLocation, setViewDogLocation] = useState(() => {
    const selectedDog = Location.state?.selectedDog;

    return selectedDog ? { lat: selectedDog.lat, lng: selectedDog.lng } : null;
  });

  const [dogs, setDogs] = useState([]);
  const [isLoadingDogs, setIsLoadingDogs] = useState(true);
  const [mapBounds, setMapBounds] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [isContactAsked, setIsContactAsked] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [initialPosition, setInitialPosition] = useState(null);
  const [initialZoom, setInitialZoom] = useState(16);
  const [placeNames, setPlaceNames] = useState({});

  useEffect(() => {
    if (Location.state?.newlyListedDogId) {
      setNewlyListedDogId(Location.state.newlyListedDogId);
      navigate(Location.pathname, { replace: true, state: {} });
    }
  }, [Location]);

  useEffect(() => {
    if (newlyListedDogId && dogs.length > 0 && map) {
      const newDog = dogs.find((dog) => dog._id === newlyListedDogId);
      if (newDog) {
        map.flyTo([newDog.lat, newDog.lng], 16);
        const marker = markerRefs.current[newDog._id];
        if (marker) {
          setTimeout(() => marker.openPopup(), 500);
        }
      }
    }
  }, [dogs, newlyListedDogId, map]);

  useEffect(() => {
    const handleNewDogNavigation = () => {
      if (newlyListedDogId && dogs.length > 0 && map) {
        const newDog = dogs.find((dog) => dog._id === newlyListedDogId);

        if (newDog) {
          setTimeout(() => {
            map.flyTo([newDog.lat, newDog.lng], 16, {
              duration: 1,
            });

            const marker = markerRefs.current[newDog._id];
            if (marker) {
              setTimeout(() => {
                marker.openPopup();

                map.panBy([0, -75], { animate: true, duration: 0.5 });
              }, 300);
            }
          }, 100);
        }
      }
    };

    handleNewDogNavigation();
  }, [dogs, newlyListedDogId, map]);

  const getPlaceName = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        {
          headers: {
            "User-Agent": "StreetPaws/1.0 (vishwanathgowda951@gmail.com)",
          },
        }
      );

      const address = response.data.address;
      return (
        address.neighbourhood ||
        address.suburb ||
        address.village ||
        address.city_district ||
        " "
      );
    } catch (error) {
      console.error("Error fetching place name:", error);
      return "Nearby area";
    }
  };

  useEffect(() => {
    const fetchDogs = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/dogs`,
          { timeout: 10000 }
        );

        if (!Array.isArray(response.data)) {
          throw new Error("Invalid response format");
        }

        const dogsWithLocation = response.data
          .map((dog) => {
            if (!dog.location) {
              console.warn("Missing location for dog:", dog._id);
              return null;
            }

            let lat, lng;

            if (
              dog.location.coordinates &&
              Array.isArray(dog.location.coordinates)
            ) {
              if (dog.location.coordinates.length !== 2) {
                console.warn(
                  "Invalid coordinates array length for dog:",
                  dog._id
                );
                return null;
              }
              [lng, lat] = dog.location.coordinates;
            } else if (
              typeof dog.location.lat === "number" &&
              typeof dog.location.lng === "number"
            ) {
              lat = dog.location.lat;
              lng = dog.location.lng;
            } else {
              console.warn("Invalid location data for dog:", dog._id);
              return null;
            }

            if (
              isNaN(lat) ||
              isNaN(lng) ||
              lat < -90 ||
              lat > 90 ||
              lng < -180 ||
              lng > 180
            ) {
              console.warn("Invalid coordinate values for dog:", dog._id);
              return null;
            }

            return {
              ...dog,
              lat,
              lng,
              type: dog.type || "Unknown",
              age: dog.age || "Age not specified",
              gender: dog.gender || "Unknown",
            };
          })
          .filter((dog) => dog !== null);
        setDogs(dogsWithLocation);
        const names = {};
        for (const dog of dogsWithLocation) {
          names[dog._id] =
            (await getPlaceName(dog.lat, dog.lng)) || " "; 
        }
        setPlaceNames(names);
      } catch (error) {
        console.error("Error fetching dogs:", error);
        setNotificationMessage(error.response?.data?.message || error.message);
        setNotificationImage("/images/error-icon.svg");
      } finally {
        setIsLoadingDogs(false);
      }
    };

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLocation = [pos.coords.latitude, pos.coords.longitude];
        console.log(userLocation);

        setLocation(userLocation);
        setInitialPosition(userLocation);
        fetchDogs();
      },
      (error) => {
        console.error("Geolocation error:", error);
        setNotificationMessage(
          "Could not get your location. Using default view."
        );
        setNotificationImage("/images/location-error.svg");
        fetchDogs();
      }
    );
  }, []);

  const handleViewportChanged = (e) => {
    const map = e.target;
    setMapBounds(map.getBounds());
  };

  const visibleDogs = dogs.filter((dog) =>
    mapBounds ? mapBounds.contains([dog.lat, dog.lng]) : true
  );
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;

    if (distanceKm < 1) {
      const distanceMeters = distanceKm * 1000;
      return `${Math.round(distanceMeters)}m away`;
    } else {
      return `${distanceKm.toFixed(0)}km away`;
    }
  };

  const handleColorSelect = (colorName) => {
    setSelectedColor(colorName.name);
    setSidebarVisible(false);
    setNotificationMessage(`${colorName.name} filter applied`);
    setNotificationImage(colorName.imageUrl);
  };

  const handleSidebarLeave = (e) => {
    const relatedTarget = e.relatedTarget;
    if (
      !(relatedTarget instanceof Element) ||
      !relatedTarget.closest(".sidebar-container, .edge-detector")
    ) {
      setSidebarVisible(false);
    }
  };

  const handleListerProfileClick = async (listerId) => {
    console.log(listerId);

    try {
      const token = await getAccessTokenSilently();
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/mongo/${listerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigate("/user", { state: { user: response.data } });
    } catch (error) {
      console.error("Error fetching lister's profile:", error);
      alert("Login to view lister's profile");
      if (error.response?.status === 404) {
      }
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#F7F6F1]">
      <Notification
        message={notificationMessage}
        image={notificationImage}
        duration={1500}
      />

      {sidebarVisible && (
        <div
          className="fixed inset-0 z-[999]"
          onClick={() => setSidebarVisible(false)}
          onTouchStart={() => setSidebarVisible(false)}
        />
      )}

      <div
        className="edge-detector fixed left-0 top-0 h-full w-4 z-[1000] transition-all duration-200"
        onMouseEnter={() => setSidebarVisible(true)}
        onMouseLeave={handleSidebarLeave}>
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-1 w-8 h-8 invert-50 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300 ${
            sidebarVisible
              ? "opacity-0 -translate-x-8"
              : "opacity-100 translate-x-2 hover:translate-x-3"
          }`}>
          <img src="./images/left.svg" alt="Toggle sidebar" />
        </div>
      </div>

      <Sidebar
        sidebarVisible={sidebarVisible}
        setSidebarVisible={setSidebarVisible}
        setNotificationMessage={setNotificationMessage}
        setNotificationImage={setNotificationImage}
        selectedColor={selectedColor}
        handleColorSelect={handleColorSelect}
      />

      {location ? (
        <MapContainer
          center={viewDogLocation || location}
          zoom={16}
          className="w-full h-full"
          whenCreated={(mapInstance) => {
            setMap(mapInstance); // Store the map instance
            setInitialZoom(mapInstance.getZoom());
            setMapBounds(mapInstance.getBounds());
          }}
          onMoveEnd={handleViewportChanged}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />

          {initialPosition && (
            <ResetViewControl
              initialPosition={initialPosition}
              initialZoom={initialZoom}
            />
          )}

          <Marker position={location}>
            <Popup>You are here</Popup>
          </Marker>

          {visibleDogs.map((dog) => {
            let lat, lng;

            if (dog.location?.coordinates) {
              [lng, lat] = dog.location.coordinates;
            } else {
              lat = dog.location?.lat;
              lng = dog.location?.lng;
            }

            const distance = calculateDistance(
              location[0],
              location[1],
              lat,
              lng
            );

            return (
              <Marker
                key={dog._id}
                ref={(ref) => {
                  if (ref) {
                    markerRefs.current[dog._id] = ref;
                  } else {
                    delete markerRefs.current[dog._id];
                  }
                }}
                position={[dog.lat, dog.lng]}
                icon={dogIcon}>
                <Popup>
                  <div className="relative max-h-[380px] duration-100 w-64 max-w-[260px] rounded-2xl overflow-hidden">
                    {/* <div
                      className="absolute inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 
                    animate-gradient-x blur-4xl opacity-40"
                    /> */}

                    <div className="relative z-10   backdrop-blur-lg rounded-lg shadow-2xl p-2 space-y-4 text-gray-800">
                      <div
                        className={`overflow-hidden rounded-xl relative bg-gray-100 ${
                          isContactAsked ? "min-h-60" : "h-55"
                        }`}>
                        {dog.imageUrl ? (
                          <img
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-300 hover:scale-105"
                            src={`https://svoxpghpsuritltipmqb.supabase.co/storage/v1/object/public/bucket1/uploads/${dog.imageUrl}`}
                            alt={dog.type}
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-violet-400 animate-pulse" />
                        )}
                      </div>

                      <div className="flex items-center  justify-between">
                        <div className="text-gray-800 ml-2">
                          <div className="flex flex-col">
                            {placeNames[dog._id] && (
                              <span className="text-[14px] font-semibold text-gray-600 mb-1">
                                {placeNames[dog._id]}
                              </span>
                            )}
                            <span className="text-[12px]  text-gray-800">
                              {distance}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2 items-center">
                          <a
                            onClick={() => setIsContactAsked(!isContactAsked)}
                            href={`https://www.google.com/maps/dir/?api=1&destination=${dog.lat},${dog.lng}&travelmode=driving`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cursor-pointer rounded-full transition-colors w-7 h-7 flex items-center justify-center">
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
                          </a>

                          <div
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => setIsContactAsked(!isContactAsked)}>
                            <div
                              className={`pt-1 mr-2 rounded-full  w-7 h-7 flex items-center justify-center transform transition-transform duration-400 ${
                                isContactAsked ? "rotate-180" : "rotate-0"
                              }`}>
                              <svg
                                className="w-4 h-4 text-violet-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M19 9l-7 7-7-7"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>

                      {isContactAsked && (
                        <div className="flex justify-between items-center">
                          <div className="ml-1">
                            {dog.type && (
                              <div className="text-[16px] mb-1 font-bold text-gray-700">
                                {dog.type}
                              </div>
                            )}
                            {dog.age && (
                              <div className="text-[14px] text-gray-700">
                                {dog.gender}, {dog.age}
                              </div>
                            )}
                          </div>
                          <div className="relative rounded-full w-12 h-12 mr-2">
                            {dog.lister ? (
                              <img
                                src={
                                  dog.lister.dp_url ||
                                  "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                                }
                                className="w-full h-full rounded-full cursor-pointer object-cover"
                                alt="Lister"
                                onClick={() =>
                                  handleListerProfileClick(dog.listerId)
                                }
                              />
                            ) : (
                              <div className="absolute inset-0 rounded-full bg-gray-200 animate-pulse" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {isLoadingDogs && (
            <div className="map-loading-overlay">
              <div className="loading-spinner"></div>
              <p>Loading dogs in your area...</p>
            </div>
          )}
        </MapContainer>
      ) : (
        <MapViewLoader />
      )}
    </div>
  );
};

export default MapView;
