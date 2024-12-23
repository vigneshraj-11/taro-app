import React, { useEffect, useState, useRef } from "react";
import { Input, Tooltip, Modal } from "antd";
import HMIHeader from "../components/HMIHeader";
import { SendOutlined, StepBackwardOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import IdealModal from "../components/IdealModal";
import VirtualKeyboard from "../components/VirtualKeyboard";
import CustomMessage from "../components/CustomMessage";
import {
  confirmation,
  fetchHMIDetails,
  fetchIdealTime,
  fetchVendorList,
  toggleMachineMode,
} from "../apicalling/apis";

const HMI = () => {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardPosition, setKeyboardPosition] = useState({ x: 0, y: 0 });
  const inputRef = useRef(null);
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
  const [maxTime, setMaxTime] = useState(300);
  const [machineIDValue, setMachineIDValue] = useState(null);
  const [backgroundValue, setBackgroundValue] = useState(null);
  const [empId, setEmpId] = useState(null);
  const [shift, setShift] = useState(null);
  const location = useLocation();
  const [focusedField, setFocusedField] = useState("");
  const {
    machineID,
    backgroundColor,
    reasonValue,
    programno,
    vendor,
    partnames,
    opertors,
  } = location.state || {};
  const [transformedData, setTransformedData] = useState([]);
  const [operator2, setOperator2] = useState("");
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [isDropdownVisible1, setIsDropdownVisible1] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [reasonMessage, setReasonMessage] = useState("Reason Message");
  const [partname, setPartname] = useState("");
  const [operation, setOperation] = useState("");
  const [isDisabled, setIsDisabled] = useState(false);
  const [setupDisabled, setSetupDisabled] = useState(false);
  const [maintenceDisabled, setMaintenceDisabled] = useState(false);
  const [reworkDisabled, setReworkDisabled] = useState(false);

  const [systemEnableStatus, setSystemEnableStatus] = useState(false);
  const [progress, setProgress] = useState(0);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [receivedTimestamp, setReceivedTimestamp] = useState(0);

  useEffect(() => {
    if (!systemEnableStatus) return;

    const interval = 100;
    const step = (interval / (maxTime * 1000)) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const nextProgress = Math.min(prev + step, 100);
        if (nextProgress >= 100) {
          clearInterval(timer);
        }
        return nextProgress;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [maxTime, systemEnableStatus]);

  function getStatusMessage(statusColor) {
    switch (statusColor) {
      case "#fdfd96":
        return "Ideal";
      case "#5FEE5F":
        return "Running";
      case "#FF6666":
        return "Maintenance";
      case "#b9b9fc":
        return "Unknown";
      default:
        return "Status Unknown";
    }
  }

  useEffect(() => {
    const loadVendorOptions = async () => {
      try {
        const options = await fetchVendorList();
        setVendorOptions(options);
      } catch (err) {}
    };

    loadVendorOptions();
  }, []);

  const progressColor =
    systemEnableStatus && progress >= 80
      ? "linear-gradient(90deg, #f44336, #ff5722)"
      : systemEnableStatus
      ? "linear-gradient(90deg, #ffeb3b, #ffc107)"
      : "transparent";

  const handleOk = async (type) => {
    try {
      setConfirmLoading(true);

      const modes = {
        Setup: {
          enabledState: setupEnabled,
          setEnabled: setSetupEnabled,
          disable1: setMaintenceDisabled,
          disable2: setReworkDisabled,
        },
        Maintenance: {
          enabledState: maintenanceEnabled,
          setEnabled: setMaintenanceEnabled,
          disable1: setSetupDisabled,
          disable2: setReworkDisabled,
        },
        Rework: {
          enabledState: reworkEnabled,
          setEnabled: setReworkEnabled,
          disable1: setSetupDisabled,
          disable2: setMaintenceDisabled,
        },
      };

      const currentMode = modes[type];
      const isEnabled = !currentMode.enabledState;
      const newStatus = isEnabled
        ? `${type.toUpperCase()} ON`
        : `${type.toUpperCase()} OFF`;

      currentMode.setEnabled(isEnabled);
      setMachineStatus(newStatus);
      currentMode.disable1(true);
      currentMode.disable2(true);

      if (type !== "Maintenance") setIsDisabled(false);
      if (isEnabled) setSystemEnableStatus(true);

      setOpen(false);

      const requestData = {
        machine_id: machineID,
        operation: operation,
        operator1: empId,
        operator2: operator2,
        part_name: partname,
        progarm: selectedProgram,
        shift: shift,
        machine_mode: type.toUpperCase(),
        machine_status: isEnabled ? 1 : 0,
        vendor_name: selectedVendor,
      };

      console.log("Request Data:", requestData);

      return; //remove

      const response = await toggleMachineMode(requestData);

      console.log("Response:", response); //remove

      if (response) {
        setMessage("Updated Successfully");
        setMessageType("success");

        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }

      fetchHMI();
      setConfirmLoading(false);
      setOpen(false);
    } catch (error) {
      console.error("Error in handleOk:", error);
      setConfirmLoading(false);
    }
  };

  const handleOkViaAPI = (type) => {
    setConfirmLoading(true);

    setTimeout(() => {
      const modes = {
        Setup: {
          enabledState: setupEnabled,
          setEnabled: setSetupEnabled,
          disable1: setMaintenceDisabled,
          disable2: setReworkDisabled,
          isDisabled: setIsDisabled,
        },
        Maintenance: {
          enabledState: maintenanceEnabled,
          setEnabled: setMaintenanceEnabled,
          disable1: setSetupDisabled,
          disable2: setReworkDisabled,
        },
        Rework: {
          enabledState: reworkEnabled,
          setEnabled: setReworkEnabled,
          disable1: setSetupDisabled,
          disable2: setMaintenceDisabled,
          isDisabled: setIsDisabled,
        },
      };

      const currentMode = modes[type];
      const isEnabled = !currentMode.enabledState;
      const newStatus = isEnabled
        ? `${type.toUpperCase()} ON`
        : `${type.toUpperCase()} OFF`;

      currentMode.setEnabled(isEnabled);
      setMachineStatus(newStatus);
      currentMode.disable1(true);
      currentMode.disable2(true);

      if (currentMode.isDisabled) currentMode.isDisabled(false);

      console.log(`Machine mode changed: ${newStatus}`); //remove

      setConfirmLoading(false);
      setOpen(false);
    }, 1000);
  };

  const fetchHMI = async () => {
    try {
      const response = await fetchHMIDetails(machineID);
      if (response) {
        const transformedData = response.map((item) => ({
          programno: item.programno,
          partname: item.partname,
          operation: item.operation,
        }));

        setTransformedData(transformedData);

        const options = transformedData.map((program) => ({
          label: program.programno,
          value: program.programno,
        }));
        setProgramOptions(options);
        if (programno) {
          setSelectedProgram(programno.selectedProgram);
        } else {
          setSelectedProgram(response[0].programno);
        }

        if (vendor) {
          setSelectedVendor(vendor.selectedVendor);
        } else {
          setSelectedVendor(response[0].vendor);
        }
        if (partnames) {
          setPartname(partnames.partname);
          setSystemEnableStatus(false);
        } else {
          setPartname(response[0].partname);
        }
        if (opertors) {
          setOperation(opertors.operation);
        } else {
          setOperation(response[0].operation);
        }

        if (response[0].tooglestatus === 1) {
          if (response[0].timestamp) {
            setReceivedTimestamp(response[0].timestamp);
          }
          if (response[0].tooglemode === "SETUP") {
            handleOkViaAPI("Setup");
            setSetupDisabled(false);
            setMaintenceDisabled(true);
            setReworkDisabled(true);
          } else if (response[0].tooglemode === "MAINTAINANCE") {
            handleOkViaAPI("Maintenance");
            setSetupDisabled(true);
            setMaintenceDisabled(false);
            setReworkDisabled(true);
          } else if (response[0].tooglemode === "REWORK") {
            handleOkViaAPI("Rework");
            setSetupDisabled(true);
            setMaintenceDisabled(true);
            setReworkDisabled(false);
          }
        } else {
          const program = response[0].programno;
          const idealTimeResponse = await fetchIdealTime(machineID, program, 0);
          if (idealTimeResponse.ideal_time != 0) {
            setMaxTime(idealTimeResponse.ideal_time);
          }
        }
        setIsDisabled(true);
      }
    } catch (error) {
      console.error("Error fetching reasons:", error);
    } finally {
    }
  };

  useEffect(() => {
    fetchHMI();
  }, []);

  useEffect(() => {
    let initialTimeDifference;

    if (receivedTimestamp === 0) {
      return;
    }
    if (typeof receivedTimestamp === "string") {
      const date = new Date(receivedTimestamp);
      initialTimeDifference = Math.floor((Date.now() - date.getTime()) / 1000);
    } else if (typeof receivedTimestamp === "number") {
      initialTimeDifference = Math.floor(Date.now() / 1000 - receivedTimestamp);
    } else {
      console.error("Invalid receivedTimestamp format");
      return;
    }

    setTime(initialTimeDifference);

    const timerInterval = setInterval(() => {
      setTime((prevTime) => prevTime + 1);
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [receivedTimestamp]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSecs = secs < 10 ? `0${secs}` : secs;

    if (hours > 0) {
      const formattedHours = hours < 10 ? `0${hours}` : hours;
      return `${formattedHours}:${formattedMinutes}:${formattedSecs}`;
    } else {
      return `${formattedMinutes}:${formattedSecs}`;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownVisible && !event.target.closest(".program-dropdown")) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownVisible1 && !event.target.closest(".program-dropdown1")) {
        setIsDropdownVisible1(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownVisible1]);

  useEffect(() => {
    const storedEmpId = localStorage.getItem("empid");
    const storedShift = localStorage.getItem("currentShift");

    if (storedShift && storedEmpId) {
      setShift(storedShift);
      setEmpId(storedEmpId);
      setMachineIDValue(machineID);
      setBackgroundValue(backgroundColor);
      if (reasonValue) {
        setReasonMessage(reasonValue);
      }
      setMachineStatus(getStatusMessage(backgroundColor).toUpperCase());
    } else {
      setShift("No shift assigned");
    }
  }, []);

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

  const onSettingHandler = () => {
    if (selectedProgram === "") {
      setMessage("Please select the Program Number");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return;
    }

    setopenSettings(true);
  };

  const handleKeyPress = (key, isCapsEnabled) => {
    const processKey = (prevValue) => {
      if (key === "Backspace") return prevValue.slice(0, -1);
      if (key === "Space") return prevValue + " ";
      if (key === "Tab") return prevValue + "\t";
      if (key === "Enter") {
        setIsKeyboardVisible(false);
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

    if (focusedField === "operator2") {
      setOperator2((prev) => processKey(prev));
    } else if (focusedField === "program") {
      setIsDropdownVisible(true);
      setSearchTerm((prev) => {
        const updatedValue = processKey(prev);
        setSelectedProgram(updatedValue);
        return updatedValue;
      });
    } else if (focusedField === "vendor") {
      setIsDropdownVisible1(true);
      setSearchTerm((prev) => processKey(prev));
      setSelectedVendor((prev) => processKey(prev));
    }
  };

  useEffect(() => {
    let timer = null;

    if (setupEnabled || maintenanceEnabled || reworkEnabled) {
      timer = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;

          if (newTime === Math.floor(maxTime * 0.8)) {
            if (reasonMessage === "" || reasonMessage === "Reason Message") {
              handleShowModal1(
                "Yellow Alert",
                "Reaching 80% of allocated time!"
              );
            }
          }

          if (newTime >= maxTime) {
            if (reasonMessage === "" || reasonMessage === "Reason Message") {
              handleShowModal1(
                "Red Alert",
                "Critical: Idle time has exceeded the 0-minute limit!"
              );
            }
          }

          return newTime;
        });
      }, 1000);
    } else {
      setTime(0);
    }

    return () => clearInterval(timer);
  }, [setupEnabled, maintenanceEnabled, reworkEnabled, navigate]);

  const submitOperator2 = () => {
    if (operator2 === "") {
      setMessage("Please fill in Operator 2 before submitting.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
    if (operator2 === empId) {
      setMessage("Operator 1 and Operator 2 cannot be the same.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    }
  };

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
                navigate("/reasons", {
                  state: {
                    backButton,
                    machineID,
                    backgroundColor,
                    programno: { selectedProgram },
                    vendor: { selectedVendor },
                    partnames: { partname },
                    opertors: { operation },
                  },
                });
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

  const validateFields = () => {
    if (selectedProgram === "") {
      setMessage("Please select the Program Number");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return;
    }

    if (selectedVendor === "") {
      setMessage("Please select the Vendor");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);

      return;
    }
  };

  const handleShowModal = (title, content) => {
    validateFields();

    if (selectedProgram !== "" && selectedVendor !== "") {
      setModalTitle(title);
      setModalText(content);
      setOpen(true);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  const filteredOptions1 = vendorOptions.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOptions = programOptions.filter((option) =>
    option.label.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect1 = (value) => {
    setSelectedVendor(value);
    setIsDropdownVisible1(false);
  };

  const handleSelect = (value) => {
    setSelectedProgram(value);

    const selectedProgramDetails = transformedData.find(
      (item) => item.programno === value
    );

    if (selectedProgramDetails) {
      setPartname(selectedProgramDetails.partname);
      setOperation(selectedProgramDetails.operation);
    }

    setIsDropdownVisible(false);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const onConfirmation = async () => {
    if (!reasonMessage || reasonMessage === "Reason Message") {
      setMessage("Please select the reason message");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    const modeMapping = {
      "SETUP ON": "SETUP",
      "MAINTENANCE ON": "MAINTENANCE",
      "REWORK ON": "REWORK",
    };

    const newMode = modeMapping[machineStatus] || "";
    const newStatus = newMode ? 1 : 0;

    const requestData = {
      machine_id: machineID,
      operation,
      operator1: empId,
      operator2,
      part_name: partname,
      program: selectedProgram,
      shift,
      vendor_name: selectedVendor,
      machine_mode: newMode,
      machine_status: newStatus,
      reason: reasonMessage,
      ideal_time: formatTime(time),
    };

    console.log("Confirmation Data:", requestData); //remove

    return; //remove

    const response = await confirmation(requestData);

    console.log("Response:", response); //remove

    if (response) {
      setMessage("Updated Successfully");
      setMessageType("success");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      
      fetchHMI();
    }
  };

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
            <div
              className={`${
                reasonMessage &&
                reasonMessage.toLowerCase() !== "reason message"
                  ? "hidden"
                  : "block"
              }`}
            >
              <Tooltip title="Go Back" placement="right">
                <StepBackwardOutlined /> Back
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 p-5">
          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">MACHINE ID:</label>
            <Input
              placeholder="MACHINE123"
              className="w-2/3 rounded-lg input-design"
              value={machineIDValue}
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">SHIFT:</label>
            <Input
              placeholder="1"
              className="w-2/3  rounded-lg input-design"
              value={shift}
              disabled
            />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">
              PROGRAM NO: <span className="text-red-600 font-semibold">*</span>
            </label>
            <div className="relative w-2/3">
              <Input
                ref={inputRef}
                disabled={isDisabled}
                placeholder="Select Program"
                className="w-full rounded-lg input-design"
                value={selectedProgram || ""}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownVisible(true);
                }}
                onFocus={(e) => {
                  setSearchTerm("");
                  setIsDropdownVisible(true);
                  setFocusedField("program");
                  const rect = e.target.getBoundingClientRect();
                  setKeyboardPosition({
                    x: rect.right + 20,
                    y: rect.top + window.scrollY,
                  });
                  setIsKeyboardVisible(true);
                }}
              />
              {isDropdownVisible && filteredOptions.length > 0 && (
                <div
                  className="program-dropdown absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                  style={{ zIndex: 1000 }}
                >
                  <ul className="max-h-60 overflow-auto">
                    {filteredOptions.map((option) => (
                      <li
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSelect(option.value)}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">
              VENDOR: <span className="text-red-600 font-semibold">*</span>
            </label>
            <div className="relative w-2/3">
              <Input
                ref={inputRef}
                disabled={isDisabled}
                placeholder="Select Vendor"
                className="w-full rounded-lg input-design"
                value={selectedVendor || ""}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownVisible1(true);
                }}
                onFocus={(e) => {
                  setSearchTerm("");
                  setIsDropdownVisible1(true);
                  setFocusedField("vendor");
                  const rect = e.target.getBoundingClientRect();
                  setKeyboardPosition({
                    x: rect.left - 420,
                    y: rect.top + window.scrollY,
                  });
                  setIsKeyboardVisible(true);
                }}
              />
              {isDropdownVisible1 && filteredOptions1.length > 0 && (
                <div
                  className="program-dropdown1 absolute left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
                  style={{ zIndex: 1000 }}
                >
                  <ul className="max-h-60 overflow-auto">
                    {filteredOptions1.map((option) => (
                      <li
                        key={option.value}
                        className="px-4 py-2 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleSelect1(option.value)}
                      >
                        {option.label}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">PART NAME:</label>
            <Input
              value={partname}
              placeholder="PART001"
              className="w-2/3  rounded-lg input-design"
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">OPERATION:</label>
            <Input
              value={operation}
              placeholder="OP001"
              className="w-2/3  rounded-lg input-design"
              disabled
            />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-lg font-semibold">OPERATOR 1:</label>
            <Input
              placeholder="OP123"
              className="w-2/3  rounded-lg input-design"
              value={empId}
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-lg font-semibold">OPERATOR 2:</label>
            <div className="w-2/3 flex space-x-5">
              <Input
                placeholder="456"
                className="rounded-lg input-design"
                ref={inputRef}
                value={operator2}
                onFocus={() => {
                  setFocusedField("operator2");
                  handleInputFocus();
                }}
              />
              <SendOutlined
                className="text-xl text-blue-500 font-semibold hover:cursor-pointer"
                onClick={() => {
                  submitOperator2();
                }}
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-between">
            <div>
              <button
                className={`px-4 font-semibold py-2 rounded-md shadow w-80 ${
                  setupEnabled
                    ? "bg-goldenrod text-black hover:bg-lightgoldenrod"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={() => handleShowModal("Setup Alert", "Setup")}
                disabled={setupDisabled}
              >
                {setupEnabled ? "SETUP ON" : "SETUP OFF"}
              </button>

              <button
                className={`px-4 font-semibold py-2 rounded-md ml-4 shadow w-80 ${
                  maintenanceEnabled
                    ? "bg-goldenrod text-black hover:bg-lightgoldenrod"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
                onClick={() =>
                  handleShowModal("Maintenance Alert", "Maintenance")
                }
                disabled={maintenceDisabled}
              >
                {maintenanceEnabled ? "MAINTENANCE ON" : "MAINTENANCE OFF"}
              </button>

              <button
                className={`text-white px-4 py-2 font-semibold rounded-md ml-4 shadow w-80 ${
                  reworkEnabled
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
                onClick={() => handleShowModal("Rework Alert", "Rework")}
                disabled={reworkDisabled}
              >
                {reworkEnabled ? "REWORK ON" : "REWORK OFF"}
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
                onSettingHandler();
              }}
            >
              SETTINGS
            </button>
            <button
              className="w-1/3 px-4 py-2 text-center rounded-md font-semibold shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                navigate("/reasons", {
                  state: {
                    machineID,
                    backgroundColor,
                    programno: { selectedProgram },
                    vendor: { selectedVendor },
                    partnames: { partname },
                    opertors: { operation },
                  },
                });
              }}
            >
              REASONS
            </button>
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 mt-[-20px]">
          <div
            className={`w-5/6 border border-black text-center font-semibold p-4 rounded-lg relative`}
            style={{
              backgroundColor: backgroundValue,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: `${progress}%`,
                background: progressColor,
                zIndex: 0,
                transition: "width 0.1s linear",
              }}
            ></div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
              }}
            >
              {machineStatus}
            </div>
          </div>
          <div className="w-1/6 border border-black text-center p-4  font-semibold rounded-lg">
            {formatTime(time)}
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 mt-[-20px]">
          <div className="w-5/6 border text-2xl border-black text-center font-semibold text-black p-4 rounded-lg">
            {reasonMessage}
          </div>
          <div
            className={`w-1/6 border ${
              reasonMessage && reasonMessage.toLowerCase() !== "reason message"
                ? "animate-blink"
                : ""
            } text-lg border-black font-semibold text-center p-4 rounded-lg hover:bg-blue-500 hover:text-white hover:cursor-pointer`}
            onClick={() => {
              onConfirmation();
            }}
          >
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
            <IdealModal
              onClose={() => setopenSettings(false)}
              machineID={machineID}
              programNo={selectedProgram}
            />
          </>
        )}
      </div>
      {isKeyboardVisible && (
        <VirtualKeyboard
          onKeyPress={handleKeyPress}
          initialPosition={keyboardPosition}
        />
      )}
      <CustomMessage message={message} type={messageType} />
    </>
  );
};

export default HMI;
