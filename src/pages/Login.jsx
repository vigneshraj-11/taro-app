import React, { useState, useRef, useEffect } from "react";
import { Input, Button, message } from "antd";
import OnScreenKeyboard from "../components/OnScreenKeyboard";

function Login() {
  const [empid, setEmpid] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [inputWidth, setInputWidth] = useState("400px");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Event listener for handling physical keyboard input
    const handleKeyDown = (event) => {
      if (isFocused) {
        if (event.key === "Backspace") {
          setEmpid((prev) => prev.slice(0, -1)); // Handle backspace
        } else if (event.key === " ") {
          setEmpid((prev) => prev + " "); // Handle space
        } else if (event.key.length === 1) {
          setEmpid((prev) => prev + event.key); // Add the typed character
        } else if (event.key === "Enter") {
          handleLogin(); // Trigger login on Enter key press
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown); // Clean up event listener
    };
  }, [isFocused]);

  const handleInputFocus = () => {
    setIsKeyboardVisible(true);
    setIsFocused(true); // Mark input as focused

    // Access DOM element and calculate position
    if (inputRef.current && inputRef.current.input) {
      const { left, top, height } =
        inputRef.current.input.getBoundingClientRect();
      setPosition({
        x: left,
        y: top + height + 10, // Place keyboard below input field
      });
      setInputWidth(`${inputRef.current.input.offsetWidth}px`);
    }
  };

  const handleInputChange = (input) => {
    setEmpid(input);
  };

  let debounceTimeout = null;

  const handleKeyPress = (button) => {
    if (debounceTimeout) clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      if (button === "{enter}") {
        handleLogin(); // Trigger login on Enter button press
      } else if (button === "{bksp}") {
        setEmpid((prev) => prev.slice(0, -1)); // Handle backspace
      } else if (button === "{space}") {
        setEmpid((prev) => prev + " "); // Handle space
      } else {
        setEmpid((prev) => prev + button); // Append typed character
      }
    }, 100); // Add a delay to prevent rapid typing
  };

  const handleInputBlur = () => {
    // Only hide the keyboard if the input field loses focus AND if there is no ongoing typing
    if (!isFocused) return;

    setTimeout(() => {
      setIsKeyboardVisible(false); // Hide keyboard after a small delay
    }, 200);
  };

  const handleLogin = () => {
    if (empid.trim() === "") {
      message.error("Please enter a valid Employee ID!");
      return;
    }

    setLoginMessage(`Welcome Employee ${empid}`);
    message.success("Login successful!");
    setEmpid("");
    setIsKeyboardVisible(false); // Hide keyboard on successful login
  };

  return (
    <div className="login-container">
      <div className="flex justify-center items-center h-screen">
        <div className="p-8 rounded-lg shadow-lg border border-gray-300 w-96">
          <h2 className="text-xl font-bold text-center mb-4">Employee Login</h2>
          <div className="mb-4">
            <Input
              type="text"
              ref={inputRef}
              value={empid}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter Employee ID"
              className="py-2 px-3 border rounded-md"
              readOnly
            />
          </div>
          <Button type="primary" className="w-full" onClick={handleLogin}>
            Log In
          </Button>
          {loginMessage && (
            <p className="text-green-500 text-center mt-4">{loginMessage}</p>
          )}
        </div>
      </div>

      {/* On-screen Keyboard */}
      <OnScreenKeyboard
        input={empid}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        isVisible={isKeyboardVisible}
        inputWidth={inputWidth}
        position={position} // Pass the calculated position
      />
    </div>
  );
}

export default Login;
