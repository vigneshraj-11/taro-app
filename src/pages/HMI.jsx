import React, { useEffect, useState } from "react";
import { Select, Input, Tooltip, Modal } from "antd";
import HMIHeader from "../components/HMIHeader";
import { SendOutlined, StepBackwardOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import IdealModal from "../components/IdealModal";

const { Option } = Select;

const HMI = () => {
  const [remainingTime, setRemainingTime] = useState(200);
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedVendor, setSelectedVendor] = useState("");
  const [machineStatus, setMachineStatus] = useState("IDEAL");
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [openAlert, setopenAlert] = useState(false);
  const [openSettings, setopenSettings] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalText, setModalText] = useState("");

  const [setupEnabled, setSetupEnabled] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [reworkEnabled, setReworkEnabled] = useState(false);
  const [time, setTime] = useState(0);
  const maxTime = 60;

  useEffect(() => {
    let timer = null;

    if (setupEnabled || maintenanceEnabled || reworkEnabled) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;

          if (newTime === Math.floor(maxTime * 0.8)) {
            handleShowModal1("Yellow Alert", "Reaching 80% of allocated time!");
          }

          if (newTime >= maxTime) {
            handleShowModal1(
              "Red Alert",
              "Critical: Idle time has exceeded the 0-minute limit!"
            );
            clearInterval(timer);
          }

          return newTime;
        });
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(timer);
  }, [setupEnabled, maintenanceEnabled, reworkEnabled, navigate]);

  const handleShowModal1 = (title, content) => {
    setModalTitle(title);
    setModalText(content);
    setopenAlert(true);
  };

  const renderFooter = () => {
    if (modalTitle === "Red Alert") {
      return (
        <div className="flex justify-center mb-5" id="redAlert">
          <div className="flex justify-center w-80 space-x-5">
            <button
              className="bg-blue-500 text-white w-28 rounded-lg p-2 hover:bg-blue-700"
              onClick={() => {
                const backButton = false;
                navigate("/reasons", { state: { backButton } });
              }}
            >
              Okay
            </button>
          </div>
        </div>
      );
    } else if (modalTitle === "Yellow Alert") {
      return (
        <div className="flex justify-center mb-5" id="yellowAlert">
          <div className="flex justify-center w-80 space-x-5">
            <button
              className="bg-blue-500 text-white w-28 rounded-lg p-2 hover:bg-blue-700"
              onClick={() => {
                setopenAlert(false);
              }}
            >
              Okay
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleShowModal = (title, content) => {
    setModalTitle(title);
    setModalText(content);
    setOpen(true);
  };

  const handleOk = (type) => {
    console.log(remainingTime); //Vignesh Unnesaccary for handle warning
    setConfirmLoading(true);
    setTimeout(() => {
      if (type === "Setup") {
        const newStatus = !setupEnabled ? "SETUP ON" : "IDEAL";
        setSetupEnabled(!setupEnabled);
        setMachineStatus(newStatus);
      }

      if (type === "Maintenance") {
        const newStatus = !maintenanceEnabled ? "MAINTENANCE ON" : "IDEAL";
        setMaintenanceEnabled(!maintenanceEnabled);
        setMachineStatus(newStatus);
      }

      if (type === "Rework") {
        const newStatus = !reworkEnabled ? "REWORK ON" : "IDEAL";
        setReworkEnabled(!reworkEnabled);
        setMachineStatus(newStatus);
      }

      setConfirmLoading(false);
      setOpen(false);
    }, 1000);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${secs}`;
  };

  // const getBackgroundColor = () => {
  //   if (time >= maxTime) return "bg-red-500";
  //   if (time >= maxTime * 0.8) return "bg-yellow-500";
  //   return "bg-yellow-200";
  // };

  const programOptions = [
    { label: "Program 1", value: "P1" },
    { label: "Program 2", value: "P2" },
    { label: "Program 3", value: "P3" },
  ];

  const vendorOptions = [
    { label: "Vendor A", value: "V1" },
    { label: "Vendor B", value: "V2" },
    { label: "Vendor C", value: "V3" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <div>
        <HMIHeader />

        <div className="flex items-center justify-between p-5 w-full">
          <div className="flex-1 text-xl font-semibold text-center">HMI</div>
          <div
            className="flex-shrink-0 text-xl text-red-500 font-semibold hover:cursor-pointer text-right"
            onClick={() => {
              navigate("/ms");
            }}
          >
            <Tooltip title="Go Back" placement="right">
              <StepBackwardOutlined /> Back
            </Tooltip>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 p-5">
          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">MACHINE ID:</label>
            <Input placeholder="MACHINE123" className="w-2/3 rounded-lg" />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">SHIFT:</label>
            <Input placeholder="1" className="w-2/3  rounded-lg" />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">PROGRAM NO:</label>
            <Select
              showSearch
              className="w-2/3 rounded-lg"
              placeholder="Select Program"
              value={selectedProgram || undefined}
              onChange={(value) => setSelectedProgram(value)}
              optionFilterProp="children"
            >
              {programOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">VENDOR:</label>
            <Select
              showSearch
              className="w-2/3 rounded-lg"
              placeholder="Select Vendor"
              value={selectedVendor || undefined}
              onChange={(value) => setSelectedVendor(value)}
              optionFilterProp="children"
            >
              {vendorOptions.map((option) => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">PART NAME:</label>
            <Input placeholder="PART001" className="w-2/3  rounded-lg" />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">OPERATION:</label>
            <Input placeholder="OP-01" className="w-2/3  rounded-lg" />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">OPERATOR 1:</label>
            <Input placeholder="OP123" className="w-2/3  rounded-lg" />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">OPERATOR 2:</label>
            <div className="w-2/3 flex space-x-5">
              <Input placeholder="OP456" className="rounded-lg" />
              <SendOutlined className="text-xl text-blue-500 font-semibold" />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between">
            <div>
              <button
                className={`text-white px-4 font-semibold py-2 rounded-md shadow w-80 ${
                  setupEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={() => handleShowModal("Setup Alert", "Setup")}
              >
                {setupEnabled ? "SETUP OFF" : "SETUP ON"}
              </button>

              <button
                className={`text-white px-4 font-semibold py-2 rounded-md ml-4 shadow w-80 ${
                  maintenanceEnabled
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={() =>
                  handleShowModal("Maintenance Alert", "Maintenance")
                }
              >
                {maintenanceEnabled ? "MAINTENANCE OFF" : "MAINTENANCE ON"}
              </button>

              <button
                className={`text-white px-4 py-2 font-semibold rounded-md ml-4 shadow w-80 ${
                  reworkEnabled
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={() => handleShowModal("Rework Alert", "Rework")}
              >
                {reworkEnabled ? "REWORK OFF" : "REWORK ON"}
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between p-5 w-full space-x-5">
            <button
              className="w-1/3 px-4 py-2 text-center font-semibold rounded-md shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                navigate("/toollife");
              }}
            >
              TOOL LIFE
            </button>
            <button
              className="w-1/3 px-4 py-2 text-center font-semibold rounded-md shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                setopenSettings(true);
              }}
            >
              SETTINGS
            </button>
            <button
              className="w-1/3 px-4 py-2 text-center rounded-md font-semibold shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                navigate("/reasons");
              }}
            >
              REASONS
            </button>
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 mt-[-20px]">
          <div
            className={`w-5/6 border border-black bg-yellow-200 text-center font-semibold p-4 rounded-lg`}
          >
            {machineStatus}
          </div>
          <div className="w-1/6 border border-black text-center p-4  font-semibold rounded-lg">
            {formatTime(time)}
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 mt-[-20px]">
          <div className="w-5/6 border border-black text-center font-semibold text-gray-500 p-4 rounded-lg">
            Reason Message
          </div>
          <div className="w-1/6 border border-black font-semibold text-center p-4 rounded-lg hover:bg-blue-500 hover:text-white hover:cursor-pointer">
            Confirm Reason
          </div>
        </div>
      </div>
      <Modal
        open={open}
        confirmLoading={confirmLoading}
        onCancel={handleCancel}
        footer={
          <div className="flex justify-center mb-5">
            <div className="flex justify-between w-80 space-x-5">
              <button
                className="bg-blue-500 text-white w-28 rounded-lg p-2 hover:bg-blue-700"
                onClick={() => handleOk(modalText)}
              >
                Sure
              </button>
              <button
                className="bg-red-600 text-white hover:bg-red-700 w-28 rounded-lg p-2"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </div>
        }
      >
        <div className="text-3xl font-semibold text-center mt-5 mb-10">
          <p>{modalTitle}</p>
        </div>
        <div className="text-2xl text-gray-500 font-semibold text-center mt-10 mb-10">
          <p>
            Are you sure you want to{" "}
            {modalText === "Setup" && (setupEnabled ? "disable" : "enable")}
            {modalText === "Maintenance" &&
              (maintenanceEnabled ? "disable" : "enable")}
            {modalText === "Rework" && (reworkEnabled ? "disable" : "enable")}
            <span className="text-red-500"> {modalText} </span> mode?
          </p>
        </div>
      </Modal>
      <Modal open={openAlert} footer={renderFooter()}>
        <div className="text-3xl font-semibold text-center mt-5 mb-10">
          <p>{modalTitle}</p>
        </div>
        <div className="text-2xl text-gray-500 font-semibold text-center mt-10 mb-10">
          <p>{modalText}</p>
        </div>
      </Modal>
      <div>
        {openSettings && (
          <>
            <IdealModal onClose={() => setopenSettings(false)} />
          </>
        )}
      </div>
    </>
  );
};

export default HMI;
