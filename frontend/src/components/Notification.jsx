import { useState, useEffect } from "react";

const Notification = ({ message, image, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return (
    <div
      className={`fixed top-6 flex justify-center items-center w-auto min-w-[7cm] max-w-[7cm] left-1/2 transform -translate-x-1/2 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
      } z-5000`}>
      <div className="backdrop-blur-md bg-violet-400 text-black px-3 py-2 rounded-2xl shadow-2xl flex items-center space-x-3 w-auto min-w-[6cm] max-w-full ">
        {/* <span className="text-violet-600 text-xl">✅</span> */}
        <img
          src={image}
          className="w-[40px] h-[40px] object-cover  rounded-full"
          alt=""
        />
        <p className="text-sm text-black font-medium">{message}</p>
      </div>
    </div>
  );
};

export default Notification;
