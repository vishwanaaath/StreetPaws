import React from "react";

const MapViewLoader = () => {
  return (
    <div className="relative w-screen h-screen bg-gradient-to-br from-violet-50 to-white overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 bg-[conic-gradient(at_top_left,#f3f4f6_0%,#f3e8ff_50%,#f3f4f6_100%)] opacity-50 animate-gradient-rotate" />


      <div className="relative z-10 max-w-md space-y-12">
        
        <div className="relative mx-auto w-48 h-48">
          
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-200 to-purple-100 shadow-2xl shadow-violet-200/50 animate-pulse" />


          <div className="absolute inset-2.5 bg-white rounded-full shadow-lg border-8 border-violet-50/80 backdrop-blur-sm">
          
            <div className="absolute inset-0 flex items-center justify-center">
              {["N", "E", "S", "W"].map((dir, i) => (
                <span
                  key={dir}
                  className="absolute font-gilroy font-bold text-violet-400/80"
                  style={{
                    transform: `rotate(${i * 90}deg) translateY(-90px)`,
                  }}>
                  {dir}
                </span>
              ))}
            </div>


            <div className="absolute inset-4 flex items-center justify-center">
              <div className="relative w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-400 rounded-full shadow-xl animate-spin-slow">
                
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-1 h-8 bg-red-500 rounded-full shadow" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-8 h-1 bg-white rounded-full shadow" />


                <div className="absolute inset-2 bg-white rounded-full shadow-inner flex items-center justify-center">
                  <div className="w-4 h-4 bg-violet-500 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
 
        <div className="space-y-8 text-center">
          
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <h2 className="sm:text-2xl text-lg font-gilroy font-bold bg-gradient-to-r from-violet-600 to-purple-400 bg-clip-text text-transparent p-5">
                Sniffing out the best bois and <br /> gals near you
              </h2>
            </div> 
          </div>

         
        </div>
      </div>

      <style jsx>{`
        .animate-gradient-rotate {
          animation: gradient-rotate 12s linear infinite;
        }
        .animate-gradient-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s linear infinite;
        }
        @keyframes gradient-rotate {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes shimmer {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default MapViewLoader;
