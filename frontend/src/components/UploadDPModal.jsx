import React, { useRef, useState } from "react";
import axios from "axios";
import './Profile.css'

const UploadDPModal = ({ currentUser, onClose, onUpdate }) => {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleClickToPick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const uploadRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload-avatar`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const newDpUrl = uploadRes.data.downloadUrl;

      if (currentUser.dp_url) {
        const oldFileName = currentUser.dp_url.split("/").pop();
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/api/delete-avatar`,
          { data: { fileName: oldFileName } }
        );
      }

      const updateRes = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/users/${currentUser._id}`,
        { dp_url: newDpUrl }
      );

      const storedUser = JSON.parse(localStorage.getItem("currentUser"));
      if (storedUser) {
        storedUser.dp_url = newDpUrl;
        localStorage.setItem("currentUser", JSON.stringify(storedUser));
      }

      onUpdate(updateRes.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update profile picture"
      );
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold mb-4">Update Profile Picture</h2>

        <div
          className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center mb-4 relative 
            ${
              isUploading
                ? "border-4 border-dashed border-violet-400 animate-pulse"
                : "bg-gray-100 cursor-pointer hover:ring-2 ring-violet-500"
            }`}
          onClick={!isUploading ? handleClickToPick : undefined}>
          {isUploading ? (
            <>
              <div className="absolute w-full h-full border-4 border-dashed border-violet-300 rounded-full animate-spin-slow" />
              <div className="absolute w-full h-full border-4 border-dashed border-violet-500 rounded-full animate-spin-reverse" />
            </>
          ) : previewImage ? (
            <img
              src={previewImage}
              alt="Preview"
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="text-gray-500 text-sm">Click to choose</span>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />

        {error && (
          <p className="text-red-500 text-sm text-center mb-2">{error}</p>
        )}

        {!isUploading && (
          <div className="flex gap-4 justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50">
              Upload
            </button>
          </div>
        )}

        {isUploading && (
          <p className="text-center text-violet-600 mt-4 animate-pulse">
            Uploading...
          </p>
        )}
      </div>
    </div>
  );
};

export default UploadDPModal;
