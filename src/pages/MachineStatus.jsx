import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { message, Modal, Spin, Tooltip } from "antd";
import { fetchStatus } from "../apicalling/apis";
import { useNavigate } from "react-router-dom";
import {
  LogoutOutlined,
  StepBackwardOutlined,
  UserOutlined,
} from "@ant-design/icons";

function MachineStatus() {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const refreshInterval =
    parseInt(process.env.REACT_APP_REFRESH_INTERVAL, 10) || 15000;
  const storedEmpName = localStorage.getItem("empName");
  const storedEmpName1 = localStorage.getItem("empName1");
  const fetchMachineData = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const result = await fetchStatus();
      setMachineData(result);
    } catch (error) {
      console.error("Error fetching machine data:", error);
      message.error("Failed to fetch machine data.");
    } finally {
      //
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData(true);

    const interval = setInterval(() => {
      fetchMachineData(false);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getMachineDetails = (machineStatus) => {
    switch (machineStatus) {
      case "Idle":
        return {
          statusTitle: "Idle",
          glowClass: "border-yellow-400 shadow-glow-yellow",
          backgroundColor: "#ffff52",
        };
      case "Running":
        return {
          statusTitle: "Running",
          glowClass: "border-green-400 shadow-glow-green",
          backgroundColor: "#0d8b0d",
        };
      case "Maintenance":
        return {
          statusTitle: "Maintenance",
          glowClass: "border-red-400 shadow-glow-red",
          backgroundColor: "#f54848",
        };
      default:
        return {
          statusTitle: "Unknown",
          glowClass: "border-blue-400 shadow-glow-blue",
          backgroundColor: "#b9b9fc",
        };
    }
  };

  const getMachineImage = (modelName) => {
    try {
      return require(`../assets/images/machine_img/${modelName}.png`);
    } catch (error) {
      return require(`../assets/images/gearbox.png`);
    }
  };

  const machineClick = (machineID, backgroundColor) => {
    navigate("/hmi", { state: { machineID, backgroundColor } });
  };

  const statuses = ["Idle", "Running", "Maintenance", "Unknown"];

  return (
    <>
      <div>
        <Header />
        <div className="flex items-center justify-between p-5 w-full">
          <div className="flex-1 text-xl font-semibold">
            <span className="text-2xl hover:cursor-pointer">
              <Tooltip title="Logout" placement="right">
                <LogoutOutlined
                  className="text-red-500 font-semibold hover:cursor-pointer"
                  onClick={() => {
                    setOpenLogoutModal(true);
                  }}
                />
              </Tooltip>
              &nbsp;&nbsp;
              {storedEmpName}
              {storedEmpName1 && `/ ${storedEmpName1}`}
            </span>
          </div>
          <div
            className="flex-shrink-0 text-xl text-red-500 font-semibold hover:cursor-pointer text-right"
            onClick={() => {
              navigate("/ms");
            }}
          >
            <div>
              <Tooltip title="Go Back" placement="right">
                <StepBackwardOutlined /> Back
              </Tooltip>
            </div>
          </div>
        </div>
        <div className="container mx-auto p-5">
          {loading ? (
            <div className="flex justify-center items-center mt-20">
              <Spin size="large" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {machineData.map((machine, index) => {
                const machineDetails = getMachineDetails(machine.MCEVENTMODE);
                const isIdleTimeReached = machine.IDELTIMEREACHED;
                return (
                  <div key={index} className="p-2 mb-2 mt-2">
                    <h2 className="text-md text-center font-bold mb-5">
                      {machine.MACHINEID} {machine.spindle} (
                      {machine.MACHINEMODELNAME})
                    </h2>
                    <img
                      src={getMachineImage(machine.MACHINEMODELNAME)}
                      alt={machine.MACHINEMODELNAME}
                      className={`w-full h-56 object-cover border rounded-md ${
                        !isIdleTimeReached
                          ? machineDetails.glowClass
                          : "border-blue-400 shadow-none"
                      } hover:cursor-pointer`}
                      style={{
                        borderColor: isIdleTimeReached ? "#405bd8" : undefined,
                        boxShadow: isIdleTimeReached ? "none" : undefined,
                        backgroundColor: isIdleTimeReached
                          ? "#5067e2"
                          : machineDetails.backgroundColor,
                      }}
                      onClick={() => {
                        machineClick(
                          machine.MACHINEID,
                          machineDetails.backgroundColor
                        );
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {statuses.map((status) => {
            const { statusTitle, glowClass, backgroundColor } =
              getMachineDetails(status);
            return (
              <div
                key={status}
                className={`flex items-center p-4 rounded-md ${backgroundColor}`}
              >
                <div
                  className={`w-4 h-4 rounded-full mr-2`}
                  style={{ backgroundColor: backgroundColor }}
                ></div>
                <span className="text-lg">{statusTitle}</span>
              </div>
            );
          })}
        </div>
      </div>
      <Modal
        open={openLogoutModal}
        footer={
          <>
            <div className="flex justify-center mb-5" id="redAlert">
              <div className="flex justify-center w-80 space-x-5">
                <button
                  className="bg-blue-500 text-white w-28 rounded-lg p-2 hover:bg-blue-700"
                  onClick={() => {
                    localStorage.clear();
                    navigate("/login");
                  }}
                >
                  Okay
                </button>
                <button
                  className="bg-red-500 text-white w-28 rounded-lg p-2 hover:bg-red-700"
                  onClick={() => {
                    setOpenLogoutModal(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        }
      >
        <div className="text-2xl text-gray-500 font-semibold text-center mt-10 mb-10">
          <p>Are you sure to Logout</p>
        </div>
      </Modal>
    </>
  );
}

export default MachineStatus;
