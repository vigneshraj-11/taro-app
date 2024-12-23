import React, { useEffect, useState } from "react";

const CustomMessage = ({ message, type }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const messageStyles = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    info: "bg-blue-500 text-white",
    warning: "bg-yellow-500 text-black",
  };

  return (
    <div
      className={`fixed z-[9999] top-4 left-1/2 transform -translate-x-1/2 w-96 p-4 rounded-lg transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${messageStyles[type]}`}
    >
      <div className="flex justify-between items-center">
        <span>{message}</span>
      </div>
    </div>
  );
};

export default CustomMessage;
