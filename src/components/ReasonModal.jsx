import React, { useState } from "react";
import { Modal, Input, Form, Button, message, Typography } from "antd";

const { Title, Text } = Typography;

const ReasonModal = ({ onClose }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [modalText, setModalText] = useState("Please enter your credentials.");
  const [idealTime, setIdealTime] = useState("");
  const [form] = Form.useForm();

  const handleLogin = (values) => {
    const { username, password } = values;

    if (username.toLowerCase() === "admin" && password === "123123") {
      message.success("Login successful!");
      setIsLoggedIn(true);
      setModalText("Set your Ideal Time (MM:SS)");
    } else {
      message.error("Invalid credentials. Please try again.");
    }
  };

  const handleSetTime = () => {
    const timePattern = /^([0-5][0-9]):([0-5][0-9])$/;
    if (timePattern.test(idealTime)) {
      message.success(`Ideal Time set to: ${idealTime}`);
      onClose();
    } else {
      message.error("Invalid time format. Use MM:SS (e.g., 01:00).");
    }
  };

  return (
    <Modal
      open={true}
      footer={null}
      centered
      onCancel={onClose}
      width={400} // Small modal
      bodyStyle={{ padding: "20px" }}
    >
      {!isLoggedIn ? (
        <div className="text-center">
          <Title level={3}>Login</Title>
          <Text type="secondary">{modalText}</Text>
          <Form form={form} layout="vertical" onFinish={handleLogin}>
            <Form.Item
              label="Username"
              name="username"
              rules={[
                { required: true, message: "Please input your Username!" },
              ]}
            >
              <Input placeholder="Enter username" allowClear />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please input your Password!" },
              ]}
            >
              <Input.Password placeholder="Enter password" allowClear />
            </Form.Item>

            <div className="flex justify-center gap-3">
              <Button type="primary" htmlType="submit" className="w-24">
                Login
              </Button>
              <Button danger className="w-24" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </Form>
        </div>
      ) : (
        <div className="text-center">
          <Title level={3}>Settings</Title>
          <Text type="secondary">{modalText}</Text>
          <Input
            placeholder="Enter Reason ID"
            maxLength={5}
            value={idealTime}
            onChange={(e) => setIdealTime(e.target.value)}
            style={{ margin: "20px auto" }}
          />
          <Input
            placeholder="Enter Reason"
            maxLength={5}
            value={idealTime}
            onChange={(e) => setIdealTime(e.target.value)}
            style={{ margin: "20px auto" }}
          />
          <div className="flex justify-center gap-3">
            <Button type="primary" onClick={handleSetTime} className="w-24">
              Submit
            </Button>
            <Button danger className="w-24" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReasonModal;
