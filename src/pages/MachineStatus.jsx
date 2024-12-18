import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { message, Spin } from "antd";
import { fetchStatus } from "../apicalling/apis";
import { useNavigate } from "react-router-dom";

function MachineStatus() {
  const [machineData, setMachineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchMachineData = async () => {
    try {
      setLoading(true);
      setTimeout(async () => {
        const result = await fetchStatus();
        setMachineData(result);
        setLoading(false);
      }, 2000);
    } catch (error) {
      console.error("Error fetching machine data:", error);
      message.error("Failed to fetch machine data.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachineData();
  }, []);

  const getMachineDetails = (machineStatus) => {
    switch (machineStatus) {
      case "Idle":
        return {
          statusTitle: "Idle",
          glowClass: "border-yellow-400 shadow-glow-yellow",
          backgroundColor: "#fdfd96",
        };
      case "Running":
        return {
          statusTitle: "Running",
          glowClass: "border-green-400 shadow-glow-green",
          backgroundColor: "#5FEE5F",
        };
      case "Maintenance":
        return {
          statusTitle: "Maintenance",
          glowClass: "border-red-400 shadow-glow-red",
          backgroundColor: "#FF6666",
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

  return (
    <div>
      <Header />
      {/* <div className="flex items-center justify-center p-5">
        <div className="text-xl font-semibold">Machine Status</div>
      </div> */}
      <div className="container mx-auto p-5">
        {loading ? (
          <div className="flex justify-center items-center mt-20">
            <Spin size="large" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {machineData.map((machine, index) => {
              const machineDetails = getMachineDetails(machine.MCEVENTMODE);
              return (
                <div key={index} className="p-2 mb-2 mt-2">
                  <h2 className="text-md font-bold mb-5">
                    {machine.MACHINEID} {machine.spindle} (
                    {machine.MACHINEMODELNAME})
                  </h2>
                  <img
                    src={getMachineImage(machine.MACHINEMODELNAME)}
                    alt={machine.MACHINEMODELNAME}
                    className={`w-full h-56 object-cover border rounded-md ${machineDetails.glowClass} hover:cursor-pointer`}
                    style={{
                      backgroundColor: machineDetails.backgroundColor,
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
    </div>
  );
}

export default MachineStatus;
