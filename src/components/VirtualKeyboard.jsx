import React, { useState, useRef, useEffect } from "react";

const VirtualKeyboard = ({ onKeyPress, initialPosition }) => {
  const keys = [
    ["Caps", "!", "@", "#", "$", "%", "^", "&", "*", "Tab"],
    ["Q", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "W"],
    ["E", "R", "T", "Y", "U", "I", "O", "P", "A", "S", "D", "F"],
    ["G", "H", "J", "K", "L", "Z", "X", "C", "V", "B", "N", "M"],
    ["Backspace", "Space", "Enter"],
  ];

  const [position, setPosition] = useState(initialPosition);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [keyboardSize, setKeyboardSize] = useState({ width: 400, height: 200 });
  const [capsLock, setCapsLock] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (dragging) {
        requestAnimationFrame(() => {
          setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y,
          });
        });
      }
    };

    const handleMouseUp = () => setDragging(false);

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, dragStart]);

  const handleMouseDown = (e) => {
    setDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setKeyboardSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  const handleKeyPress = (key) => {
    if (key === "Caps") {
      setCapsLock((prev) => !prev);
    } else {
      onKeyPress(key, capsLock);
    }
  };

  return (
    <div
      ref={containerRef}
      className="virtual-keyboard absolute bg-white text-gray-800 rounded-md shadow resize overflow-hidden"
      style={{
        top: position.y,
        left: position.x,
        width: keyboardSize.width,
        height: keyboardSize.height,
        zIndex: 10000000,
      }}
    >
      <div
        className="bg-gray-300 p-2 h-10 cursor-move text-center font-semibold rounded-t-md"
        onMouseDown={handleMouseDown}
      ></div>

      <div
        className="grid gap-1 p-2"
        style={{
          gridTemplateColumns: `repeat(12, minmax(0, 1fr))`,
          gridAutoRows: "minmax(0, 1fr)",
          height: `calc(${keyboardSize.height}px - 40px)`,
        }}
      >
        {keys.flat().map((key, index) => {
          const span = ["Caps", "Tab"].includes(key)
            ? 2
            : ["Backspace", "Space", "Enter"].includes(key)
            ? 4
            : 1;

          const displayKey =
            capsLock && /^[a-z]$/.test(key)
              ? key.toUpperCase()
              : !capsLock && /^[A-Z]$/.test(key)
              ? key.toLowerCase()
              : key;

          return (
            <button
              key={index}
              className="bg-white text-gray-900 text-sm border border-gray-500 text-center rounded shadow hover:bg-gray-200"
              style={{
                gridColumn: `span ${span}`,
                height: "100%",
              }}
              onClick={() => handleKeyPress(key)}
            >
              {displayKey}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualKeyboard;
