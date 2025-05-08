import React from "react";
import './Profile'
const DeleteConfirmationModal = ({
  onConfirm,
  onCancel,
  isDeleting, 
}) => {
  return (
    <div className="fixed inset-0 bg-black  bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl sm:scale-100 scale-80 shadow-2xl w-full max-w-md px-8 py-6 text-gray-800">
        <div className="flex items-center mb-4">
          <img src="./images/danger.svg" className="w-8 mr-2 h-8" alt="" />
          <h3 className="text-2xl font-semibold text-violet-500">
            Confirm Deletion
          </h3>
        </div>
        <p className="text-md mb-6 text-gray-600 leading-relaxed">
          Are you sure you want to delete this?
          <br />
          This action{" "}
          <span className="text-red-500 font-semibold">cannot be undone</span>.
        </p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border border-gray-300 cursor-pointer text-gray-600 hover:text-gray-800 hover:border-gray-400 transition-all duration-200">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className={`flex items-center justify-center gap-2 w-full px-4 py-3 
    ${
      isDeleting
        ? "bg-red-500 text-white font-bold uppercase cursor-not-allowed"
        : "bg-red-600 hover:bg-red-600 text-white font-bold uppercase shadow-lg   transition-all duration-300 hover:shake"
    }
    rounded-lg focus:ring-2  focus:outline-none`}>
            {isDeleting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
