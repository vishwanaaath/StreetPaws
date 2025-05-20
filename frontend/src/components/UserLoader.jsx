import React from "react";

const UserLoader = () => {
  return (
    <div className="relative min-h-screen bg-gray-50 p-0 sm:p-0 sm:pt-6 flex flex-col">
      <div className="fixed inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />

      <div className="relative z-10 max-w-4xl mx-auto flex-1 w-full">
        <div className="bg-white rounded-xl shadow-md overflow-hidden sm:p-1 p-0.5 h-full min-h-[calc(100vh-4rem)] flex flex-col">
          <h1 className="text-[25px] font-bold text-violet-600 mb-2 mt-4 pl-4 flex justify-between items-center pr-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
              <div className="h-4 w-24 bg-gray-300 rounded animate-pulse" />
            </div>
            <div className="w-6 h-6 bg-gray-300 rounded-full animate-pulse" />
          </h1>

          <div className="px-4 mt-2 mb-2">
            <div className="h-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pb-1">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="relative flex items-center ml-2 p-2 sm:p-4 bg-white">
                <div className="relative w-14 h-14 sm:w-14 sm:h-14 rounded-full bg-gray-200 animate-pulse" />

                <div className="ml-4 flex-1 min-w-0 space-y-2">
                  <div className="h-4 w-1/2 bg-gray-300 rounded animate-pulse" />
                  <div className="h-3 w-1/4 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoader;
