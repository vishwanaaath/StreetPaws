import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import Notification from "./Notification";
import "./Profile.css";

const ListDog = () => {
  const {
    user: auth0User,
    isAuthenticated,
    getAccessTokenSilently,
  } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState(location.state?.user || null);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [step, setStep] = useState(1);
  const [dogImage, setDogImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [type, settype] = useState("");
  const [geoLocation, setGeoLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualError, setManualError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gender, setGender] = useState("");
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [age, setAge] = useState(""); // Update state initialization
  const [email, setEmail] = useState(currentUser?.email || "");
  const [Lat, setlat] = useState("");
  const [Lon, setlon] = useState("");
  const [phone, setPhone] = useState(currentUser?.phoneNumber || "");
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [istypeDropdownOpen, setIstypeDropdownOpen] = useState(false);
  const [isAgeDropdownOpen, setIsAgeDropdownOpen] = useState(false);

  const [errors, setErrors] = useState({});
  // Add gender options
  const genders = ["Male", "Female", "Unknown"];

  // Dog type data with your specified images

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

  // Check user existence on mount
  useEffect(() => {
    document.body.classList.remove("cursor-wait");
    const checkUserExists = async () => {
      if (!isAuthenticated) {
        navigate("/");
        return;
      }

      try {
        // Use passed user data if available
        if (location.state?.user) {
          setCurrentUser(location.state.user);
          console.log(currentUser);

          setIsCheckingUser(false);
          return;
        }

        // Fetch user from your API
        const token = await getAccessTokenSilently();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/${auth0User.sub}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setCurrentUser(response.data);
      } catch (error) {
        if (error.response?.status === 404) {
          navigate("/PostDP", { state: { fromListDog: true } });
        } else {
          console.error("Error fetching user:", error);
          alert("Error loading user data");
        }
      } finally {
        setIsCheckingUser(false);
      }
    };

    if (isAuthenticated) {
      checkUserExists();
    }
  }, [isAuthenticated, auth0User?.sub]);

  // Show loading state
  if (isCheckingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mt-4 text-lg">Loading user profile...</p>
        </div>
      </div>
    );
  }

  const ageRanges = [
    "0-6 months",
    "6-12 months",
    "1-2 years",
    "3-5 years",
    "More than 5 years",
  ];

  // Validate email format
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Validate phone number format
  const validatePhone = (phone) => {
    const re = /^[0-9]{10,15}$/;
    return re.test(phone);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDogImage(file);
      setStep(2);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Handle location capture
  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setlat(position.coords.latitude);
          setlon(position.coords.longitude);
          setStep(4);
          setIsLoadingLocation(false);
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get Auth0 token
      const token = await getAccessTokenSilently();

      // Upload image to Supabase
      const formData = new FormData();
      formData.append("file", dogImage);

      const uploadResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      // Create final dog data
      const dogData = {
        imageUrl: uploadResponse.data.downloadUrl.split("uploads/")[1],
        type,
        location: {
          type: "Point", // Required by schema
          coordinates: [
            geoLocation.lng, // Latitude second
            geoLocation.lat, // Longitude first
          ],
        },
        age,
        gender,
        listerId: currentUser._id,
        adopted: false,
      };

      console.log(
        "Submitting:",
        JSON.stringify(
          {
            ...dogData,
            location: {
              lat: typeof dogData.location.lat,
              lng: typeof dogData.location.lng,
            },
          },
          null,
          2
        )
      );

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/dogs`,
        dogData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update local state with new dog
      setCurrentUser((prev) => ({
        ...prev,
        dogsListed: [...prev.dogsListed, response.data.dog._id],
      }));

      console.log(uploadResponse);

      setNotificationImage(uploadResponse.data.downloadUrl);
      setNotificationMessage("Dog listed successfully!");
      setIsSubmitting(false);
      console.log("Dog Data:", JSON.stringify(dogData, null, 2));
      resetForm();
      setTimeout(() => {
        navigate("/map", {
          state: {
            selectedDog: {
              lat: Lat, // Correct here
              lng: Lon,
            },
          },
        });
      }, 2000);
    } catch (error) {
      setIsSubmitting(false);
      console.error("Submission error:", error);
      alert(
        `Submission failed: ${error.response?.data?.message || error.message}`
      );
    }
  };

  // Add reset form function
  const resetForm = () => {
    setStep(1);
    setDogImage(null);
    setPreviewImage(null);
    settype("");
    setGeoLocation(null);
    setAge("");
    setGender("");
    setErrors({});
  };
  return (
    <div className="min-h-screen  py-12 px-4 sm:px-6 lg:px-8">
      <Notification
        message={notificationMessage}
        image={notificationImage}
        duration={5000}
      />

      {/* {currentUser && (
        <div className=" p-4 bg-violet-50 rounded-lg">
          <p className="text-xs text-gray-600">{currentUser.email}</p>
        </div>
      )} */}

      {/* Background Animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl  opacity-30 -z-10 pointer-events-none" />

      <Link
        to="/"
        className="inline-flex items-center mb-6 text-violet-500 hover:text-violet-700">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-1"
          viewBox="0 0 20 20"
          fill="currentColor">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </Link>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl   p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
          List a Dog
        </h1>

        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5].map((stepNumber) => (
              <div
                key={stepNumber}
                className={`flex flex-col items-center ${
                  step >= stepNumber ? "text-violet-500" : "text-gray-400"
                }`}>
                <div
                  className={`w-9 h-9 rounded-full shadow flex items-center justify-center ${
                    step >= stepNumber
                      ? "bg-violet-500 text-white"
                      : "bg-gray-200"
                  }`}>
                  {stepNumber}
                </div>
                <span className="text-xs mt-1">
                  {stepNumber === 1 && "Photo"}
                  {stepNumber === 2 && "Type"}
                  {stepNumber === 3 && "Location"}
                  {stepNumber === 4 && "Age"}
                  {stepNumber === 5 && "Submit"}
                </span>
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 mt-4">
            <div
              className="bg-violet-500 h-2 shadow transition-all duration-300"
              style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
          </div>
        </div>

        {/* Step 1: Upload photo */}
        {step === 1 && (
          <div className="text-center">
            <label className="cursor-pointer">
              <div className="border-4 border-dashed border-gray-300 rounded-lg p-8 mb-4">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Dog preview"
                    className="mx-auto h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div>
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <p className="mt-2 text-sm text-gray-600">
                      Please upload images with an aspect ratio between 1:1 and
                      4:5.
                    </p>
                  </div>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                required
              />
            </label>
            {previewImage && (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="mt-4 px-4 py-2 bg-violet-500 cursor-pointer text-white rounded-lg hover:bg-violet-600 font-bold transition-colors">
                Next
              </button>
            )}
          </div>
        )}

        {/* Step 2: Select dog type */}
        {step === 2 && (
          <div className="mb-6">
            <label className="block  text-sm font-medium text-gray-700 mb-2">
              Dog Type
            </label>
            <div className="relative">
              <button
                className="w-full px-4 py-2  cursor-pointer rounded-lg border border-gray-300 text-center mb-2"
                onClick={() => setIstypeDropdownOpen(!istypeDropdownOpen)}>
                {type || "Choose Dog Type"}
              </button>

              {istypeDropdownOpen && (
                <div className="w-full rounded-lg p-2">
                  <div className="flex overflow-x-scroll gap-2 pb-2">
                    {dogType.map((typeItem, index) => {
                      return (
                        <div key={typeItem.name} className="flex-shrink-0 w-40">
                          <div className="relative w-40 h-40">
                            {!isLoaded && (
                              <div className="absolute inset-0 animate-pulse bg-gray-200 rounded-lg" />
                            )}

                            <img
                              src={typeItem.imageUrl}
                              alt={typeItem.name}
                              title={typeItem.name}
                              onLoad={() => setIsLoaded(true)}
                              className={`w-40 h-40 object-cover rounded-lg cursor-pointer border-2 transition-opacity duration-300 ${
                                isLoaded ? "opacity-100" : "opacity-0"
                              } ${
                                type === typeItem.name
                                  ? "border-violet-400"
                                  : "border-transparent"
                              } hover:border-violet-400`}
                              onClick={() => {
                                settype(typeItem.name);
                                setIstypeDropdownOpen(false);
                                setStep(3);
                              }}
                            />
                          </div>
                          <span className="block text-center mt-1 text-sm font-medium text-gray-700">
                            {typeItem.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            {/* //////////// */}
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mb-6">
              <label className="block text-lg mt-10 font-semibold text-gray-700 mb-2">
                Where does the dog usually stay ?
              </label>

              <button
                type="button"
                onClick={() => {
                  setIsLoadingLocation(true);
                  getLocation();
                }}
                disabled={isLoadingLocation}
                className="w-full px-4 py-2 bg-violet-500 cursor-pointer font-semibold text-white rounded-lg hover:bg-violet-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isLoadingLocation ? (
                  <div className="flex  items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Finding Location...
                  </div>
                ) : (
                  "Use Current Location"
                )}
              </button>

              <p className="mt-3 text-xs text-gray-500">
                We'll use your device's location services to get coordinates
              </p>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                className="mt-12 text-[12px] cursor-pointer font-semibold text-violet-500 hover:text-violet-700">
                {showManualInput
                  ? "Hide manual input"
                  : "Enter co-ordinates manually"}
              </button>

              {showManualInput && (
                <div className="mt-4 space-y-3">
                  <div>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      step="any"
                      value={manualLat} // Changed from manualLng
                      onChange={(e) => {
                        setlat(e.target.value);
                        setManualLat(e.target.value);
                      }}
                      placeholder="Latitude"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      step="any"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      value={manualLng} // Changed from manualLat
                      onChange={(e) => {
                        setManualLng(e.target.value);
                        setlon(e.target.value);
                      }}
                      placeholder="Longitude"
                    />
                  </div>
                  {manualError && (
                    <div className="text-red-500 text-sm">{manualError}</div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (!manualLat || !manualLng) {
                        setManualError(
                          "Please enter both latitude and longitude"
                        );
                        return;
                      }
                      if (isNaN(manualLat)) {
                        setManualError("Latitude must be a number");
                        return;
                      }
                      if (isNaN(manualLng)) {
                        setManualError("Longitude must be a number");
                        return;
                      }
                      setManualError("");
                      setGeoLocation({
                        lat: parseFloat(manualLat),
                        lng: parseFloat(manualLng),
                      });
                      setShowManualInput(false);
                      setStep(4);
                    }}
                    className="px-4 py-2 bg-gray-200 cursor-pointer text-gray-700 rounded-lg hover:bg-gray-300">
                    Set Manual Location
                  </button>
                </div>
              )}

              {geoLocation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">
                    Location captured: {geoLocation.lat.toFixed(4)},{" "}
                    {geoLocation.lng.toFixed(4)}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Select age */}
        {step === 4 && (
          <div className="space-y-6">
            <div
              className="mb-6"
              style={{
                height: isAgeDropdownOpen ? "200px" : "auto",
                transition: "height 0.3s ease",
                position: "relative", // Ensure positioning context
                zIndex: 20, // Bring age dropdown above other elements if needed
                marginBottom: isAgeDropdownOpen ? "120px" : "1.5rem", // Add space below when open
              }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estimated Age
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full px-4 py-2 cursor-pointer rounded-lg border border-gray-300 text-left"
                  onClick={() => setIsAgeDropdownOpen(!isAgeDropdownOpen)}>
                  {age || "Select age range"}
                </button>
                {isAgeDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 max-h-80 overflow-y-auto transform translate-y-2 ">
                    {ageRanges.map((ageRange) => (
                      <div
                        key={ageRange}
                        className={`px-4 py-2 hover:bg-gray-100  cursor-pointer ${
                          age === ageRange ? "bg-violet-50" : ""
                        }`}
                        onClick={() => {
                          setAge(ageRange);
                          setIsAgeDropdownOpen(false);
                        }}>
                        {ageRange}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>{" "}
            <div
              className="mb-6"
              style={{
                height: isGenderDropdownOpen ? "200px" : "auto",
                transition: "height 0.3s ease",
                position: "relative", // Ensure positioning context
                zIndex: 20, // Bring age dropdown above other elements if needed
                marginBottom: isGenderDropdownOpen ? "30px" : "1.5rem", // Add space below when open
              }}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="relative">
                <button
                  type="button"
                  className="w-full cursor-pointer px-4 py-2 rounded-lg border border-gray-300 text-left"
                  onClick={() =>
                    setIsGenderDropdownOpen(!isGenderDropdownOpen)
                  }>
                  {gender || "Select gender"}
                </button>
                {isGenderDropdownOpen && (
                  <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    {genders.map((genderOption) => (
                      <div
                        key={genderOption}
                        className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                          gender === genderOption ? "bg-violet-50" : ""
                        }`}
                        onClick={() => {
                          setGender(genderOption);
                          setIsGenderDropdownOpen(false);
                        }}>
                        {genderOption}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 5: Contact information */}
        {/* {step === 5 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Contact Information
            </h2>

            {errors.contact && (
              <div className="text-red-500 text-sm mb-4">{errors.contact}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email} // Changed from user?.email to email
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="your@email.com"
              />
              {errors.email && (
                <div className="text-red-500 text-sm mt-1">{errors.email}</div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone} // Changed from currentUser.phoneNumber
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="1234567890"
              />
              {errors.phone && (
                <div className="text-red-500 text-sm mt-1">{errors.phone}</div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                if (validateContactInfo()) {
                  setStep(6);
                }
              }}
              className="w-full px-4 py-2 bg-violet-500 cursor-pointer font-bold text-white rounded-lg hover:bg-violet-600 transition-colors">
              Next
            </button>
          </div>
        )} */}

        {/* Step 6: Review and submit */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl w-full font-bold text-center text-gray-800 mb-4">
              Review Your Listing
            </h2>
            {/* ///////////// */}
            <div className="flex  flex-wrap md:flex-nowrap p-4  mb-4 justify-between">
              <div className="sm:mb-0  flex justify-center items-center  w-full rounded-lg mb-4 sm:mr-8">
                {previewImage && (
                  <img
                    src={previewImage}
                    alt="Dog to list"
                    className="h-70 mx-auto special-shadow object-cover rounded-lg "
                  />
                )}
              </div>
              <div className="  flex flex-col justify-around ">
                <p>
                  <span>Type: </span>
                  <span className="text-base text-black font-bold">
                    {type}
                  </span>{" "}
                </p>
                <p>
                  <span>Location: </span>
                  <span className="text-base text-black font-bold">
                    {geoLocation &&
                      `${geoLocation.lat.toFixed(4)}, ${geoLocation.lng.toFixed(
                        4
                      )}`}
                  </span>{" "}
                </p>
                <p>
                  <span>Age: </span>
                  <span className="text-base text-black font-bold">{age}</span>
                </p>
                <p>
                  <span>Gender: </span>
                  <span className="text-base text-black font-bold">
                    {gender}
                  </span>
                </p>
                {email && (
                  <p>
                    <span>Email: </span>
                    <span className="text-base text-black font-bold">
                      {email}
                    </span>{" "}
                  </p>
                )}
                {phone && (
                  <p>
                    <span>Phone: </span>
                    <span className="text-base text-black font-bold">
                      {phone}
                    </span>{" "}
                  </p>
                )}
              </div>
            </div>
            {/* ///////////// */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full px-6 py-3 rounded-lg bg-violet-500 text-white text-lg font-bold hover:bg-violet-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-75 flex items-center cursor-pointer justify-center">
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Listing Dog...
                </>
              ) : (
                "List Dog"
              )}
            </button>
          </div>
        )}

        {/* Navigation buttons */}
        {step > 1 && step <= 5 && (
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 text-gray-500 font-bold cursor-pointer hover:text-gray-900">
              {step !== 6 ? "Back" : "Edit"}
            </button>
            {step < 5 && ( // Skip next button for location and contact steps
              <button
                type="button"
                onClick={() => {
                  if (step === 1 && previewImage) setStep(2);
                  else if (step === 2 && type) setStep(3);
                  else if (step === 3 && location) setStep(4);
                  else if (step === 4 && age) setStep(5);
                }}
                className="px-4 py-2 bg-violet-500 font-bold text-white cursor-pointer  rounded-lg hover:bg-violet-600 transition-colors"
                disabled={(step === 2 && !type) || (step === 4 && !age)}>
                Next
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListDog;
