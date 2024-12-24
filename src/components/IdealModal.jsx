import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Form, Typography } from "antd";
import CustomMessage from "./CustomMessage";
import VirtualKeyboard from "./VirtualKeyboard";
import { postIdealTime } from "../apicalling/apis";

const { Title, Text } = Typography;

const IdealModal = ({ onClose, machineID, programNo }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalText, setModalText] = useState("Please enter your credentials.");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [idealTime, setIdealTime] = useState("");
  const [form] = Form.useForm();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const [focusedField, setFocusedField] = useState("");

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

  const handleKeyPress = (key, isCapsEnabled) => {
    const processKey = (prevValue) => {
      if (key === "Backspace") return prevValue.slice(0, -1);
      if (key === "Space") return prevValue + " ";
      if (key === "Tab") return prevValue + "\t";
      if (key === "Enter") {
        setIsKeyboardVisible(false);
        if (focusedField === "password") {
          handleLogin();
        } else if (focusedField === "ideal") {
          handleSetTime();
        }
        return prevValue;
      }
      const effectiveKey =
        isCapsEnabled && /^[a-zA-Z]$/.test(key)
          ? key.toUpperCase()
          : !isCapsEnabled && /^[a-zA-Z]$/.test(key)
          ? key.toLowerCase()
          : key;
      return prevValue + effectiveKey;
    };

    if (focusedField === "username") {
      const newUsername = processKey(username);
      form.setFieldsValue({ username: newUsername });
      setUsername(newUsername);
    } else if (focusedField === "password") {
      const newPassword = processKey(password);
      form.setFieldsValue({ password: newPassword });
      setPassword(newPassword);
    } else if (focusedField === "ideal") {
      setIdealTime((prev) => handleIdealTimeChange1(processKey(prev)));
    }
  };

  const handleLogin = (values) => {
    const { username, password } = values;

    if (username.toLowerCase() === "admin" && password === "123123") {
      setIsLoggedIn(true);
      setModalText("Set your Ideal Time (MM:SS)");
      setMessage("Login successful! Please set your ideal time.");
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } else {
      setMessage("Invalid credentials. Please try again.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleSetTime = async () => {
    const timePattern = /^([0-5][0-9]):([0-5][0-9])$/;
    if (timePattern.test(idealTime)) {
      const response = await postIdealTime(machineID, programNo, idealTime);
      if (response) {
        setMessage("Ideal time inserted successfully");
        setMessageType("success");
        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
        setTimeout(() => {
          onClose();
        }, 3000);
      }
    } else {
      setMessage("Invalid time format. Please enter in MM:SS.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleIdealTimeChange = (e) => {
    let value = e.target.value;

    if (value.length === 2 && !value.includes(":")) {
      value = value + ":";
    }

    value = value.replace(/[^\d:]/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    setIdealTime(value);
  };

  const handleIdealTimeChange1 = (input) => {
    let value = typeof input === "string" ? input : input.target.value;

    if (value.length === 2 && !value.includes(":")) {
      value = value + ":";
    }

    value = value.replace(/[^\d:]/g, "");

    if (value.length > 5) {
      value = value.slice(0, 5);
    }

    return value;
  };

  return (
    <>
      <Modal
        open={true}
        footer={null}
        centered
        onCancel={onClose}
        width={400}
        style={{ padding: "5px" }}
      >
        {!isLoggedIn ? (
          <div className="text-center">
            <Title level={3}>Login</Title>
            <Text type="secondary">{modalText}</Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleLogin}
              autoComplete="off"
              initialValues={{ username, password }} // Set initial form values
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please input your Username!" },
                ]}
              >
                <Input
                  placeholder="Enter username"
                  allowClear
                  autoComplete="off"
                  ref={inputRef}
                  onChange={(e) => setUsername(e.target.value)} // Handle value change
                  onFocus={() => {
                    setFocusedField("username");
                    const rect = inputRef.current.input.getBoundingClientRect();
                    setKeyboardPosition({
                      x: rect.left + window.scrollX,
                      y: rect.bottom + window.scrollY + 8,
                    });
                    setIsKeyboardVisible(true);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
              >
                <Input.Password
                  placeholder="Enter password"
                  allowClear
                  autoComplete="new-password"
                  ref={inputRef}
                  onChange={(e) => setPassword(e.target.value)} // Handle value change
                  onFocus={() => {
                    setFocusedField("password");
                    const rect = inputRef.current.input.getBoundingClientRect();
                    setKeyboardPosition({
                      x: rect.left + window.scrollX,
                      y: rect.bottom + window.scrollY + 8,
                    });
                    setIsKeyboardVisible(true);
                  }}
                />
              </Form.Item>

              <div className="flex justify-center gap-3 mt-10">
                <button
                  type="submit"
                  className="w-24 bg-blue-500 text-white font-semibold hover:bg-blue-600 p-2 border-none rounded-md"
                >
                  Login
                </button>
                <button
                  className="w-24 bg-red-500 text-white font-semibold hover:bg-red-600 p-2 border-none rounded-md"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </Form>
          </div>
        ) : (
          <div className="text-center">
            <Title level={3}>Settings</Title>
            <Text type="secondary">{modalText}</Text>
            <div className="flex flex-col items-start mt-5">
              <label>
                <span className="text-red-500">*</span> {modalText}:
              </label>
              <Input
                placeholder="MM:SS (e.g., 01:00)"
                maxLength={5}
                value={idealTime}
                allowClear
                onChange={handleIdealTimeChange}
                style={{ margin: "10px auto" }}
                autoComplete="off"
                ref={inputRef}
                onFocus={() => {
                  setFocusedField("ideal");
                  const rect = inputRef.current.input.getBoundingClientRect();
                  setKeyboardPosition({
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY + 8,
                  });
                  setIsKeyboardVisible(true);
                }}
              />
            </div>
            <div className="flex justify-center mt-5 gap-3">
              <button
                onClick={handleSetTime}
                className="w-24 bg-blue-500 text-white font-semibold hover:bg-blue-600 p-2 border-none rounded-md"
              >
                Submit
              </button>
              <button
                className="w-24 bg-red-500 text-white font-semibold hover:bg-red-600 p-2 border-none rounded-md"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </Modal>

      <CustomMessage message={message} type={messageType} />

      {isKeyboardVisible && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          initialPosition={keyboardPosition}
        />
      )}
    </>
  );
};

export default IdealModal;
