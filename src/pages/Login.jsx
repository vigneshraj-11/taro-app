import React, { useState, useRef, useEffect } from "react";
import { Input } from "antd";
import VirtualKeyboard from "../components/VirtualKeyboard";
import { EmpLogin } from "../apicalling/apis";
import { useNavigate } from "react-router-dom";

function Login() {
  const [empid, setEmpid] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isKeyboardVisible &&
        inputRef.current &&
        !inputRef.current.input.contains(event.target) &&
        !event.target.closest(".virtual-keyboard")
      ) {
        setIsKeyboardVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isKeyboardVisible]);

  const handleInputFocus = () => {
    if (inputRef.current?.input) {
      const rect = inputRef.current.input.getBoundingClientRect();
      setKeyboardPosition({
        x: rect.left + window.scrollX,
        y: rect.bottom + window.scrollY + 8,
      });
      setIsKeyboardVisible(true);
    }
  };

  const handleKeyPress = (key, isCapsEnabled) => {
    if (key === "Backspace") {
      setEmpid((prev) => prev.slice(0, -1));
    } else if (key === "Space") {
      setEmpid((prev) => prev + " ");
    } else if (key === "Enter") {
      handleLogin();
      setIsKeyboardVisible(false);
    } else if (key === "Tab") {
      setEmpid((prev) => prev + "\t");
    } else {
      const effectiveKey =
        isCapsEnabled && /^[a-zA-Z]$/.test(key)
          ? key.toUpperCase()
          : !isCapsEnabled && /^[a-zA-Z]$/.test(key)
          ? key.toLowerCase()
          : key;

      setEmpid((prev) => prev + effectiveKey);
    }
  };

  const handleChange = (e) => {
    setEmpid(e.target.value);
  };

  const handleLogin = async () => {
    if (empid.trim() === "") {
      setLoginMessage("Please enter a valid Employee ID!");
      setEmpid("");
      return;
    }

    try {
      const data = await EmpLogin("empid1", empid);
      const { name, greeting, message } = data;

      setLoginMessage(message);

      const getCurrentShift = () => {
        const currentTime = new Date();
        const hours = currentTime.getHours();

        if (hours >= 6 && hours < 14) return "1";
        if (hours >= 14 && hours < 22) return "2";
        return "3";
      };

      const currentShift = getCurrentShift();
      localStorage.setItem("empid", empid);
      localStorage.setItem("empName", name);
      localStorage.setItem("currentShift", currentShift);

      navigate("/welcome", { state: { empName: name, greeting: greeting } });

      setEmpid("");
    } catch (error) {
      setLoginMessage("Login failed! Please try again.");
      console.error("Login Error:", error);
    }
  };

  return (
    <div className="login-container">
      <div className="flex justify-center items-center h-screen">
        <div className="p-8 rounded-lg shadow-lg border border-gray-300 w-96">
          <h2 className="text-xl font-bold text-center mb-4">Employee Login</h2>
          <div className="mb-4">
            <Input
              type="text"
              value={empid}
              ref={inputRef}
              onFocus={handleInputFocus}
              onChange={handleChange}
              placeholder="Enter Employee ID"
              className="py-2 px-3 border rounded-md"
            />
          </div>
          <button
            className="w-full bg-blue-500 text-white font-semibold hover:bg-blue-600 p-2 border-none rounded-md"
            onClick={handleLogin}
          >
            Log In
          </button>
          {loginMessage && (
            <p className="text-red-500 font-semibold text-center mt-4">
              {loginMessage}
            </p>
          )}
        </div>
      </div>
      {isKeyboardVisible && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          initialPosition={keyboardPosition}
        />
      )}
    </div>
  );
}

export default Login;
