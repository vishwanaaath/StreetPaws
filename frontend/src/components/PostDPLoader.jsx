import React from "react";

const PostDPLoader = () => {
  return (
    <div className="min-h-screen h-screen-mobile bg-gray-100 py-8 sm:py-12 px-4 sm:px-6 lg:px-8 flex flex-col animate-pulse">
      {" "}
      {/* Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-violet-500 to-violet-600 animate-gradient-x blur-2xl opacity-30 z-0" />
      <div className="max-w-md mx-auto flex-1 flex flex-col justify-center bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8 w-full">
        {/* Title skeleton */}
        <div className="h-8 bg-gray-200 rounded-full w-3/4 mx-auto mb-8" />

        {/* Main content skeleton */}
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Animated profile circle */}
          <div className="relative w-52 h-52 mx-auto">
            <div className="absolute inset-0 rounded-full bg-gray-200" />
            <div className="absolute inset-2 rounded-full bg-gray-100 animate-shimmer">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            </div>
          </div>

          {/* Input skeleton */}
          <div className="w-full h-12 bg-gray-200 rounded-lg" />

          {/* Button skeleton */}
          <div className="w-full max-w-xs h-12 bg-gray-300 rounded-lg animate-pulse-slow" />
        </div>
      </div>
      <style jsx global>{`
        @keyframes paw-float {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.8);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(1.2);
          }
        }
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
        .animate-paw-float {
          animation: paw-float 3s ease-in-out infinite;
        }
        .animate-shimmer {
          overflow: hidden;
          position: relative;
        }
        .animate-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.2) 20%,
            rgba(255, 255, 255, 0.5) 60%,
            transparent 100%
          );
          animation: shimmer 2s infinite;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default PostDPLoader;
