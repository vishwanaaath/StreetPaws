import React from "react";

const ListDogLoader = () => {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 -z-1" />

      {/* Back Button Skeleton */}
      <div className="inline-flex items-center mb-6 text-violet-500">
        <div className="h-5 w-5 mr-1 bg-gray-200 rounded-full" />
      </div>

      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        {/* Title Skeleton */}
        <div className="h-13 bg-gray-200 rounded w-3/4 mx-auto mb-6" />

        {/* Progress Indicator Skeleton */}
        <div className="mb-8">
          <div className="flex justify-between">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-9 h-9 bg-gray-200 rounded-full" />
                <div className="h-4 w-12 bg-gray-200 mt-1 rounded" />
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-1 mt-4">
            <div className="bg-gray-300 h-1 w-1/2" />
          </div>
        </div>

        {/* Step Content Skeleton */}
        <div className="space-y-4">
          {/* Photo Upload Skeleton */}
          <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 mb-4">
            <div className="h-16.5 bg-gray-200 rounded-lg animate-pulse" />
          </div>

          
        </div>

         
      </div>
    </div>
  );
};

export default ListDogLoader;
