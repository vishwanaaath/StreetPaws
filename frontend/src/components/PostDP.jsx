import React, { useState, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import PhoneInput from "react-phone-number-input";
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

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [notificationImage, setNotificationImage] = useState(null);
  const [username, setUsername] = useState(
    auth0User?.name || auth0User?.nickname || ""
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleGoBack = useCallback(() => {
    setPreviewImage(null);
    setSelectedFile(null);
  }, []);

  const handleSkipPhoto = useCallback(() => {
    setPreviewImage(auth0User?.picture || "https://via.placeholder.com/150");
  }, [auth0User?.picture]);

  const handleSubmit = async () => {
    // 🔒 Validation
    if (!username.trim()) {
      alert("Username is required.");
      return;
    }

    if (!phoneNumber || phoneNumber.length <= 6) {
      alert("Please enter a valid phone number.");
      return;
    }
    

    setIsUploading(true);

    try {
      if (!auth0User?.sub?.includes("|")) {
        throw new Error("Invalid user authentication");
      }

      const numericAuth0Id = auth0User.sub.split("|")[1];
      let dpUrl = previewImage;

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

      const userData = {
        username: username.trim(),
        phoneNumber,
        email: auth0User.email,
        auth0_id: numericAuth0Id,
        dp_url: dpUrl,
        profile_complete: true,
        dogsListed: [],
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users`,
        userData
      );

      const customUser = {
        ...response.data.user,
        auth0Data: auth0User,
      };

      localStorage.setItem("currentUser", JSON.stringify(customUser));
      navigate("/map", { state: { user: customUser } });
    } catch (error) {
      console.error("Submission error:", error);
      alert(error.response?.data?.message || error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-1  sm:p-0 sm:pt-6  flex flex-col">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <Notification
        message={notificationMessage}
        image={notificationImage}
        duration={3000}
      />

      <div className="max-w-md mx-auto flex-1 flex flex-col justify-center bg-white/80 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden p-8 w-full relative">
        <div className="relative z-10 flex flex-col flex-1 items-center">
          <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-6">
            Complete Your Profile
          </h1>

          {!previewImage ? (
            <div className="flex flex-col items-center justify-center flex-1">
              <label className="cursor-pointer group">
                <div className="border-4 border-dashed border-gray-400 hover:border-violet-400 rounded-full p-2 mb-14 w-52 h-52 flex items-center justify-center group-hover:scale-105 transition-transform duration-300 ease-in-out animate-pulse-slow">
                  <div className="flex flex-col items-center justify-center">
                    <svg
                      className="h-14 w-14 text-gray-400 group-hover:text-violet-400 transition-colors duration-300"
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
            <div className="flex flex-col items-center justify-center flex-1 w-full">
              <button
                onClick={handleGoBack}
                className="absolute top-2 left-2 p-1 hover:bg-gray-100 rounded-full transition-colors duration-200"
                aria-label="Go back">
                <svg
                  className="w-8 h-8 text-violet-400 hover:text-violet-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
              </button>

              <div className="w-48 h-48 flex justify-center items-center border-4 border-dashed border-violet-400 rounded-full mb-6 relative">
                <img
                  src={previewImage || "https://via.placeholder.com/150"}
                  alt="Profile preview"
                  className="rounded-full w-44 h-44 object-cover shadow-lg"
                />
              </div>

              <h2 className="text-sm font-semibold text-gray-600 mb-2">Name</h2>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-3 py-2 mb-4 text-center text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-violet-400 transition-colors duration-300"
              />

              <h2 className="text-sm font-semibold text-gray-600 mb-2">
                Phone Number
              </h2>
              <div className="w-full mb-6">
                <PhoneInput
                  defaultCountry="IN"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  onFocus={() => {
                    setNotificationImage(previewImage);
                    setNotificationMessage("We trust you without an OTP ;)");
                  }}
                  className="phone-input-container"
                  inputComponent={CustomInput}
                />
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={
                  isUploading ||
                  !username.trim() ||
                  !phoneNumber ||
                  phoneNumber.length < 12
                }
                className="w-full py-3 mt-4 bg-gradient-to-r cursor-pointer from-violet-600 to-purple-500 text-white text-2xl font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-75 disabled:hover:scale-100 flex justify-center items-center">
                {isUploading ? (
                  <div className="flex items-center space-x-3">
                    <svg
                      className="animate-spin h-7 w-7 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
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

      <style jsx global>{`
        .phone-input-container {
          width: 100%;
          padding: 0.5rem 0.75rem;
          text-align: center;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          transition: border-color 0.3s;
        }
        .phone-input-container:focus-within {
          border-color: #8b5cf6;
          outline: none;
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
