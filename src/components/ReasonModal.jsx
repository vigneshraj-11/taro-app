import React, { useState, useRef, useEffect } from "react";
import { Modal, Input, Form, Typography } from "antd";
import CustomMessage from "./CustomMessage";
import VirtualKeyboard from "./VirtualKeyboard";
import { postReasonDetail, usernameLogin } from "../apicalling/apis";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const ReasonModal = ({
  onClose,
  machineID,
  backgroundColor,
  programno,
  vendor,
  partnames,
  opertors,
  reasonGroup,
  operator2,
}) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalText, setModalText] = useState("Please enter your credentials.");
  const [reasonId, setReasonId] = useState("");
  const [reason, setReason] = useState("");
  const [form] = Form.useForm();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
  const [focusedField, setFocusedField] = useState("");
  const [disableStatus, setDisableStatus] = useState(false);

  useEffect(() => {
    if (reasonGroup) {
      setReasonId(reasonGroup);
      setDisableStatus(true);
    }
  }, [reasonGroup]);

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
          form.submit();
        } else if (focusedField === "reason") {
          handleSubmitReason();
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
      const newUsername = processKey(form.getFieldValue("username") || "");
      form.setFieldsValue({ username: newUsername });
    } else if (focusedField === "password") {
      const newPassword = processKey(form.getFieldValue("password") || "");
      form.setFieldsValue({ password: newPassword });
    } else if (focusedField === "reasonId") {
      setReasonId((prev) => processKey(prev));
    } else if (focusedField === "reason") {
      setReason((prev) => processKey(prev));
    }
  };

  const handleLogin = async (values) => {
    const { username, password } = values;

    try {
      const response = await usernameLogin(username, password);

      if (response.message === "login successfully") {
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
    } catch (error) {
      console.error("Login error:", error);
      setMessage("An error occurred. Please try again later.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

  const handleSubmitReason = async () => {
    if (reasonId.trim() === "" || reason.trim() === "") {
      setMessage("Reason Group and Reason are required.");
      setMessageType("error");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    const resposne = await postReasonDetail(machineID, reasonId, reason);
    if (resposne) {
      setMessage(`Reason inserted successfully`);
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      setTimeout(() => {
        onClose();
      }, 2000);
      navigate("/hmi", {
        state: {
          reasonValue: reason,
          machineID: machineID,
          backgroundColor: backgroundColor,
          programno: programno,
          vendor: vendor,
          partnames: partnames,
          opertors: opertors,
          operators2: operator2,
        },
      });
    }
  };

  return (
    <>
      <Modal
        open={true}
        footer={null}
        centered
        onCancel={onClose}
        width={400}
        bodyStyle={{ padding: "5px" }}
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
            <Title level={3}>Reason Details</Title>
            <Text type="secondary">{modalText}</Text>
            <div className="flex flex-col items-start mt-5">
              <label>
                <span className="text-red-500">*</span> Enter Reason Group:
              </label>
              <Input
                placeholder="Enter Reason Group"
                value={reasonId}
                disabled={disableStatus}
                onChange={(e) => setReasonId(e.target.value)}
                style={{ margin: "10px auto" }}
                autoComplete="off"
                ref={inputRef}
                onFocus={() => {
                  setFocusedField("reasonId");
                  const rect = inputRef.current.input.getBoundingClientRect();
                  setKeyboardPosition({
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY + 8,
                  });
                  setIsKeyboardVisible(true);
                }}
              />
            </div>
            <div className="flex flex-col items-start mt-5">
              <label>
                <span className="text-red-500">*</span> Enter Reason:
              </label>
              <Input
                placeholder="Enter Reason"
                maxLength={50}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ margin: "10px auto" }}
                autoComplete="off"
                ref={inputRef}
                onFocus={() => {
                  setFocusedField("reason");
                  const rect = inputRef.current.input.getBoundingClientRect();
                  setKeyboardPosition({
                    x: rect.left + window.scrollX,
                    y: rect.bottom + window.scrollY + 8,
                  });
                  setIsKeyboardVisible(true);
                }}
              />
            </div>
            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={handleSubmitReason}
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

export default ReasonModal;
