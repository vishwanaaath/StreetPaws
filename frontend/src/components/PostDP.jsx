import React, { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import Notification from "./Notification";

const CustomInput = React.forwardRef((props, ref) => (
  <input
    {...props}
    ref={ref}
    className="!w-full !text-center focus:!ring-0 focus:!outline-none bg-transparent"
  />
));

const PostDP = () => {
  const { user: auth0User } = useAuth0();
  const navigate = useNavigate();

  // State management
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [username, setUsername] = useState(
    auth0User?.name || auth0User?.nickname || ""
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [phoneError, setPhoneError] = useState(false);

  // File handling
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  // Navigation handlers
  const handleGoBack = useCallback(() => {
    setPreviewImage(null);
    setSelectedFile(null);
  }, []);

  const handleSkipPhoto = useCallback(() => {
    setPreviewImage(auth0User?.picture || "https://via.placeholder.com/150");
  }, [auth0User?.picture]);

  // Phone number validation
  const handlePhoneChange = (value) => {
    setPhoneNumber(value);
    setPhoneError(false);
  };

  // Form submission
  const handleSubmit = async () => {
    // Validate phone number if provided
    if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
      setNotificationMessage("Please enter a valid phone number");
      setNotificationImage(previewImage);
      setPhoneError(true);
      return;
    }

    setIsUploading(true);

    try {
      if (!auth0User?.sub?.includes("|")) {
        throw new Error("Invalid user authentication");
      }

      const numericAuth0Id = auth0User.sub.split("|")[1];
      let dpUrl = previewImage;

      // Handle file upload
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);

        const uploadResponse = await axios.post(
          `${import.meta.env.VITE_API_URL}/upload-avatar`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        dpUrl = uploadResponse.data.downloadUrl;
      }

      // Prepare user data
      const userData = {
        username: username.trim(),
        phoneNumber,
        email: auth0User.email,
        auth0_id: numericAuth0Id,
        dp_url: dpUrl,
        profile_complete: true,
        dogsListed: [],
      };

      // Submit profile
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users`,
        userData
      );

      // Store user data
      const customUser = {
        ...response.data.user,
        auth0Data: auth0User,
      };
      localStorage.setItem("currentUser", JSON.stringify(customUser));

      // Navigate to map
      navigate("/map", { state: { user: customUser } });
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <Notification
        message={notificationMessage}
        image={notificationImage}
        duration={3000}
      />

      {/* Main form container */}
      <div className="max-w-md mx-auto flex-1 flex flex-col justify-center bg-white/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden p-8 w-full relative">
        <div className="relative z-10 flex flex-col flex-1 items-center">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            Complete Your Profile
          </h1>

          {!previewImage ? (
            // Photo upload section
            <div className="flex flex-col items-center justify-center flex-1">
              <label className="cursor-pointer group">
                <div className="border-4 border-dashed border-gray-400 hover:border-violet-400 rounded-full p-2 mb-14 w-52 h-52 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-in-out animate-pulse-slow">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-14 w-14 text-gray-400 group-hover:text-violet-400 transition-colors duration-300"
                      /* ... upload icon ... */
                    />
                    <p className="mt-2 text-base text-gray-600 group-hover:text-violet-400 transition-colors duration-300">
                      Upload your photo
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </label>
              <button
                type="button"
                onClick={handleSkipPhoto}
                className="w-full py-3 mt-4 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                Skip for now
              </button>
            </div>
          ) : (
            // Profile details section
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <button
                onClick={handleGoBack}
                className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Go back">
                {/* Back arrow icon */}
              </button>

              {/* Profile image preview */}
              <div className="w-48 h-48 flex justify-center items-center border-4 border-dashed border-violet-400 rounded-full mb-6 relative">
                <img
                  src={previewImage}
                  alt="Profile preview"
                  className="rounded-full w-44 h-44 object-cover shadow-lg"
                />
              </div>

              {/* Username input */}
              <h2 className="text-sm font-semibold text-gray-600 mb-2">Name</h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 mb-4 text-center text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-violet-400 transition-colors duration-300"
              />

              {/* Phone number input */}
              <h2 className="text-sm font-semibold text-gray-600 mb-2">
                Phone Number
              </h2>
              <div className="w-full mb-2">
                <PhoneInput
                  international
                  defaultCountry="US"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  onFocus={() => {
                    setNotificationImage(previewImage);
                    setNotificationMessage("We trust you without an OTP ;)");
                  }}
                  className={`phone-input-container ${
                    phoneError ? "error" : ""
                  }`}
                  inputComponent={CustomInput}
                />
                {phoneError && (
                  <div className="text-red-500 text-sm mt-1 ml-2">
                    Please enter a valid phone number
                  </div>
                )}
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isUploading}
                className="w-full py-3 mt-4 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:hover:scale-100 flex justify-center items-center">
                {isUploading ? (
                  // Loading spinner
                  <div className="flex items-center space-x-3">
                    <svg
                      className="animate-spin h-7 w-7 text-white"
                      /* ... loading spinner ... */
                    />
                    <span className="text-xl">Setting up Profile...</span>
                  </div>
                ) : (
                  "Set up Profile"
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .phone-input-container {
          width: 100%;
          padding: 0.5rem 0.75rem;
          text-align: center;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: border-color 0.3s;
        }
        .phone-input-container.error {
          border-color: #ef4444;
        }
        .phone-input-container:focus-within {
          border-color: #8b5cf6;
          outline: none;
        }
        .phone-input-container.error:focus-within {
          border-color: #ef4444;
        }
        .react-phone-number-input__icon {
          border-radius: 6px 0 0 6px;
        }
        @keyframes gradient-x {
          0%,
          100% {
            background-position: left center;
          }
          50% {
            background-position: right center;
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s infinite;
        }
      `}</style>
    </div>
  );
};

export default PostDP;
