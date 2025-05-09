const ProfileLoader = () => {
  return (
    <div className="max-w-4xl mx-auto p-5 animate-pulse"> 
      <div className="mb-4 h-5 w-5 bg-gray-200 rounded-full"></div>
 
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8"> 
          <div className="w-24 h-24 rounded-full bg-gray-200"></div>
 
          <div className="space-y-2">
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
 
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map((item) => (
            <div key={item} className="bg-gray-50 p-4 rounded-lg">
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
          ))}
        </div>
 
        <div className="mt-8">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[1, 2, 3, 4, 5, 6].map((item, index) => (
              <div
                key={item}
                className="break-inside-avoid"
                style={{ marginBottom: index % 2 === 0 ? "1rem" : "2rem" }}>
                <div
                  className={`
          bg-gray-200 rounded-lg 
          ${
            index % 4 === 0
              ? "h-56"
              : index % 3 === 0
              ? "h-40"
              : index % 2 === 0
              ? "h-48"
              : "h-32"
          }
        `}></div>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent opacity-20 animate-shimmer"></div>
    </div>
  );
};

export default ProfileLoader;
