import React from "react";

const UserLoader = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
          Community Members
        </h1>

        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse flex items-center justify-between bg-white shadow-sm sm:shadow-md rounded-xl px-4 py-3 sm:p-5">
              {/* Profile Picture Placeholder */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-300" />

              {/* Text Placeholders */}
              <div className="ml-4 flex-1 min-w-0 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
              </div>

              {/* Icon Placeholder */}
              <div className="ml-auto pl-2 sm:pl-4">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-300 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserLoader;
