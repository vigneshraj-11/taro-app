import React, { useState, useEffect } from "react";
import logos from "../assets/images/Logo.png";
import Etherlogo from "../assets/images/ethernet.png";
import { useLocation } from "react-router-dom";
import { fetchConnection, getPartName } from "../apicalling/apis";
import RdEtherUp from "../assets/images/Rd_ether_up.png";
import RdEtherDown from "../assets/images/Rd_ether_down.png";
import GrEtherUp from "../assets/images/Gr_ether_up.png";
import GrEtherDown from "../assets/images/Gr_ether_down.png";

function Header() {
  const [dateTime, setDateTime] = useState(new Date());
  const companyName = "Our Company Name";
  const [isConnected, setIsConnected] = useState(false);
  const [machineValue, setMachineValue] = useState("");
  const location = useLocation();
  const [selectedReason, setSelectedReason] = useState("");
  const [partname, setPartname] = useState("");
  const [ethernetStatus, setEthernetStatus] = useState({
    ethernet1: "disconnected",
    ethernet2: "disconnected",
  });
  const [empId, setEmpId] = useState(null);
  const [shift, setShift] = useState(null);

  useEffect(() => {
    const storedEmpId = localStorage.getItem("empid");
    const storedShift = localStorage.getItem("currentShift");

    if (storedShift && storedEmpId) {
      setShift(storedShift);
      setEmpId(storedEmpId);
    } else {
      setShift("No shift assigned");
    }
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchConnectionStatus = async () => {
      try {
        const response = await fetchConnection();
        setIsConnected(response.data.ethernet1 === "connected");
        setEthernetStatus({
          ethernet1: response.data.ethernet1,
          ethernet2: response.data.ethernet2,
        });
        const partResponse = await getPartName();
        setPartname(partResponse.partname);
      } catch (error) {
        console.error("Error fetching connection status:", error);
      }
    };

    fetchConnectionStatus();
  }, []);

  useEffect(() => {
    if (location.state?.machineID) setMachineValue(location.state.machineID);
    if (location.state?.selectedReason)
      setSelectedReason(location.state.selectedReason);
  }, [location]);

  const dates = {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  const times = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hourCycle: "h23",
  };

  const formattedDate = dateTime.toLocaleString("en-US", dates);
  const formattedTime = dateTime.toLocaleString("en-US", times);

  return (
    <header
      className="flex items-center justify-between p-4 bg-blue-900 text-white shadow-lg"
      style={{ position: "sticky", top: 0, zIndex: 10 }}
    >
      <div className="flex items-center space-x-4">
        <img
          src={logos}
          alt={companyName + " Logo"}
          className="w-56 h-24 hidden md:block"
        />
      </div>
      <div className="text-white text-center">
        <h1 className="text-3xl font-semibold mb-2">C2 IMPELLER CELL</h1>
        <h4 className="text-2xl text-yellow-300 font-semibold">
          Part Name: {partname}
        </h4>
      </div>

      <div className="flex items-center space-x-5">
        <div className={`flex flex-row space-x-5`}>
          <div className={`flex flex-col`}>
            <img
              src={
                ethernetStatus.ethernet1 === "connected" ? GrEtherUp : RdEtherUp
              }
              alt={
                ethernetStatus.ethernet1 === "connected"
                  ? "Red Ethernet Up"
                  : "Green Ethernet Up"
              }
              className="w-10 h-16"
            />
            <div>
              <p style={{ textAlign: "center" }}>Server</p>
            </div>
          </div>

          <div className={`flex flex-col`}>
            <div>
              <p style={{ textAlign: "center" }}>DB</p>
            </div>
            <img
              src={
                ethernetStatus.ethernet2 === "connected"
                  ? GrEtherDown
                  : RdEtherDown
              }
              alt={
                ethernetStatus.ethernet2 === "connected"
                  ? "Green Ethernet Down"
                  : "Red Ethernet Down"
              }
              className="w-10 h-16"
            />
          </div>
        </div>

        <div className="text-center text-orange-400 font-semibold space-y-1 hidden md:block">
          <h4 className="text-xl">Shift: {shift}</h4>
          <h4 className="text-lg">{formattedTime}</h4>
          <h4 className="text-lg">{formattedDate}</h4>
        </div>
      </div>
    </header>
  );
}

export default Header;
