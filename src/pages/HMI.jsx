import React, { useEffect, useState, useRef } from "react";
import { Input, Tooltip, Modal } from "antd";
import HMIHeader from "../components/HMIHeader";
import {
  LogoutOutlined,
  SendOutlined,
  StepBackwardOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import IdealModal from "../components/IdealModal";
import VirtualKeyboard from "../components/VirtualKeyboard";
import CustomMessage from "../components/CustomMessage";
import {
  confirmation,
  EmpLogin,
  fetchHMIDetails,
  fetchIdealTime,
  fetchVendorList,
  postOperator2,
  toggleMachineMode,
  setPercentage,
  submitProgramDetails,
} from "../apicalling/apis";

const HMI = () => {
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
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
  const [openAlert1, setopenAlert1] = useState(false);
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
  //New Changes
  const [tempBackgroundValue, setTempBackgroundValue] = useState(null);
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
    operators2,
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
  const storedEmpName = localStorage.getItem("empName");
  const storedEmpName1 = localStorage.getItem("empName1");

  const [alertModal, setAlertModal] = useState(true);

  const refreshInterval =
    parseInt(process.env.REACT_APP_REFRESH_INTERVAL, 10) || 15000;

  useEffect(() => {
    if (!systemEnableStatus) return;

    const interval = 100;
    const maxTimeMs = maxTime * 1000;
    const step = (interval / maxTimeMs) * 100;

    const receivedTime = receivedTimestamp
      ? new Date(receivedTimestamp).getTime()
      : null;
    const currentTime = Date.now();
    const elapsedTime = receivedTime ? currentTime - receivedTime : 0;

    const initialProgress = receivedTime
      ? Math.min((elapsedTime / maxTimeMs) * 100, 100)
      : 0;

    setProgress(initialProgress);

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
  }, [maxTime, systemEnableStatus, receivedTimestamp]);

  function getStatusMessage(statusColor) {
    switch (statusColor) {
      case "#ffff52":
        return "Idle";
      case "#0d8b0d":
        return "Running";
      case "#f54848":
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
      if (!isEnabled) {
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
            operator2: { operator2 },
          },
        });
        return;
      } else {
        alert("Call toggle Status on");
        const newStatus = isEnabled
          ? `${type.toUpperCase()} ON`
          : `${type.toUpperCase()} OFF`;

        currentMode.setEnabled(isEnabled);
        setMachineStatus(newStatus);
        currentMode.disable1(true);
        currentMode.disable2(true);

        if (type !== "Maintenance") setIsDisabled(false);
        if (isEnabled) {
          //New Changes
          setSystemEnableStatus(true);
          setBackgroundValue("white");
        } else {
          //New Changes
          if (backgroundValue === "white") {
            setBackgroundValue(tempBackgroundValue);
          }
          setTime(0);
          setReceivedTimestamp(0);
          setIsDisabled(true);
          setSystemEnableStatus(false);
          setSetupDisabled(false);
          setMaintenceDisabled(false);
          setReworkDisabled(false);
        }

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

        // fetchHMI();
        setConfirmLoading(false);

        // navigate("/hmi", {
        //   state: { machineID: machineID, backgroundColor: backgroundColor },
        // });
        setOpen(false);
      }
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
      console.log(response);
      if (response) {
        const transformedData = response.map((item) => ({
          programno: item.programno,
          partname: item.partname,
          operation: item.operation,
        }));

        setTransformedData(transformedData);
        console.log(transformedData);

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
        if (operators2) {
          setOperator2(operators2.operator2);
        } else {
          if (response[0]?.operator2 !== null) {
            setOperator2(response[0].operator2);
          }
        }

        console.log("response", response[0].tooglestatus);
        const toggle_st = response[0].tooglestatus ? 1 : 0;
        console.log("button status", toggle_st);
        alert("Response from API: " + toggle_st);
        if (toggle_st === 1) {
          const program = response[0].programno;
          const idealTimeResponse = await fetchIdealTime(machineID, program, 1);
          if (
            idealTimeResponse &&
            idealTimeResponse.data &&
            idealTimeResponse.data.length > 0
          ) {
            const idealTime = idealTimeResponse.data[0].IDEAL_TIME;
            if (idealTime) {
              setReceivedTimestamp(idealTime);
            }
          }
          const idealTimeResponse1 = await fetchIdealTime(
            machineID,
            program,
            0
          );
          if (
            idealTimeResponse1 &&
            idealTimeResponse1.data &&
            idealTimeResponse1.data.length > 0
          ) {
            const idealTime = idealTimeResponse1.data[0].IDEAL_TIME;
            if (idealTime) {
              setMaxTime(idealTime);
            }
          }
          setSystemEnableStatus(true);
          //New Changes
          setBackgroundValue("white");
          //Remove this only for Dev purposes
          console.log("Toggle status: " + 1);
          console.log("Ideal Time: " + maxTime);
          console.log("Timestamp: " + idealTimeResponse.data[0].IDEAL_TIME);
          console.log(receivedTimestamp);
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

          if (response[0]?.start_time !== null) {
            setReceivedTimestamp(response[0]?.start_time);
            setSystemEnableStatus(true);
            //New Changes
            setBackgroundValue("white");
            getStatusMessage("#fdfd96");
          } else {
            getStatusMessage(backgroundValue);
            setSystemEnableStatus(false);
            //New Changes
            if (backgroundValue === "white") {
              setBackgroundValue(tempBackgroundValue);
            }
            setReceivedTimestamp(0);
          }

          const idealTimeResponse = await fetchIdealTime(machineID, program, 0);
          if (
            idealTimeResponse &&
            idealTimeResponse.data &&
            idealTimeResponse.data.length > 0
          ) {
            const idealTime = idealTimeResponse.data[0].IDEAL_TIME;
            if (idealTime !== 0) {
              setMaxTime(idealTime);
            }
          }
          //Remove this only for Dev purposes
          console.log("Toggle status: " + 0);
          console.log("Ideal Time: " + maxTime);
          console.log("Timestamp: " + receivedTimestamp);
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

    const interval = setInterval(() => {
      fetchHMI();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

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
      //New Changes
      setTempBackgroundValue(backgroundColor);
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
        if (focusedField === "operator2") {
          submitOperator2();
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

  const updateTimer = () => {
    setTime((prevTime) => {
      const newTime = prevTime + 1;

      if (newTime === Math.floor(maxTime * 0.8)) {
        if (reasonMessage === "" || reasonMessage === "Reason Message") {
          handleShowModal1("Yellow Alert", "Reaching 80% of allocated time!");
        }
      }

      if (newTime >= maxTime) {
        if (reasonMessage === "" || reasonMessage === "Reason Message") {
          if (!alertModal) {
            handleShowModal1(
              "Red Alert",
              "Critical: Idle time has exceeded limit!"
            );
          }
        }
      }

      return newTime;
    });
  };

  useEffect(() => {
    let timer = null;
    if (receivedTimestamp === 0) {
      if (setupEnabled || maintenanceEnabled || reworkEnabled) {
        timer = setInterval(updateTimer, 1000);
      } else {
        setTime(0);
      }
      return () => clearInterval(timer);
    }
  }, [
    setupEnabled,
    maintenanceEnabled,
    reworkEnabled,
    navigate,
    receivedTimestamp,
  ]);

  useEffect(() => {
    let timer = null;

    if (receivedTimestamp !== 0) {
      const elapsedSeconds = Math.floor(
        (Date.now() - new Date(receivedTimestamp).getTime()) / 1000
      );
      setTime(elapsedSeconds);

      if (elapsedSeconds === Math.floor(maxTime * 0.8)) {
        try {
          const res = setPercentage(80);
        } catch (error) {
          console.error("Error fetching part name:", error);
        }
        if (reasonMessage === "" || reasonMessage === "Reason Message") {
          handleShowModal1("Yellow Alert", "Reaching 80% of allocated time!");
        }
      }

      if (elapsedSeconds >= maxTime) {
        // alert('100% Reached')
        try {
          const res = setPercentage(100);
        } catch (error) {
          console.error("Error fetching part name:", error);
        }
        if (reasonMessage === "" || reasonMessage === "Reason Message") {
          if (!alertModal) {
            handleShowModal1(
              "Red Alert",
              "Critical: Idle time has exceeded limit!"
            );
          }
        }
      }
    }

    return () => clearInterval(timer);
  }, [
    setupEnabled,
    maintenanceEnabled,
    reworkEnabled,
    navigate,
    receivedTimestamp,
    time,
  ]);

  const submitOperator2 = async () => {
    if (!operator2) {
      setMessage("Please fill in Operator 2 before submitting.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    if (operator2 === empId) {
      setMessage("Operator 1 and Operator 2 cannot be the same.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
      return;
    }

    //New Changes

    try {
      const response = await EmpLogin("empid2", operator2);

      if (response) {
        const { name, greeting, message } = response;

        localStorage.setItem("empName1", name);

        const msg = `${message}, ${name}`;
        handleShowModal2(greeting, msg);
      }
    } catch (error) {
      console.error("Login Error:", error);

      setMessage("An error occurred while logging in. Please try again.");
      setMessageType("error");

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } finally {
      setTimeout(() => {
        setopenAlert1(false);
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

  const handleShowModal2 = (title, content) => {
    setModalTitle(title);
    setModalText(content);
    setopenAlert1(true);
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
                    operator2: { operator2 },
                  },
                });
              }}
            >
              Okay
            </button>
            <button
              className="bg-red-500 text-white w-28 rounded-lg p-2 hover:bg-red-700"
              onClick={() => {
                setopenAlert(false);
                setAlertModal(false);
              }}
            >
              Cancel
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
            <button
              className="bg-red-500 text-white w-28 rounded-lg p-2 hover:bg-red-700"
              onClick={() => {
                setopenAlert(false);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setOperator2(value);
    }
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

  const handleSelect1 = async (value) => {
    setSelectedVendor(value);

    const programData = {
      master_id: machineID,
      program_no: selectedProgram,
      part_name: partname,
      operation: operation,
      vendor_name: value,
    };

    try {
      await submitProgramDetails(programData);
    } catch (e) {
      console.log(e);
    }

    setIsDropdownVisible1(false);
  };

  const handleSelect = async (value) => {
    setSelectedProgram(value);

    const selectedProgramDetails = transformedData.find(
      (item) => item.programno === value
    );

    if (selectedProgramDetails) {
      setPartname(selectedProgramDetails.partname);
      setOperation(selectedProgramDetails.operation);
    }

    const programData = {
      master_id: machineID,
      program_no: value,
      part_name: partname,
      operation: operation,
      vendor_name: selectedVendor,
    };

    try {
      await submitProgramDetails(programData);
    } catch (e) {
      console.log(e);
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
    try {
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

      const requestData1 = {
        machine_id: machineID,
        operation: operation,
        operator1: empId,
        operator2: operator2,
        part_name: partname,
        progarm: selectedProgram,
        shift: shift,
        machine_mode: newMode,
        machine_status: 0,
        vendor_name: selectedVendor,
      };

      console.log("Request Data:", requestData1);

      const response = await toggleMachineMode(requestData1);

      if (response) {
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

        const response1 = await confirmation(requestData);

        console.log("Response:", response1); //remove

        if (response1) {
          setMessage("Updated Successfully");
          setMessageType("success");

          setTimeout(() => {
            setMessage("");
            setMessageType("");
          }, 3000);

          setReasonMessage("Reason Message");
        }
      } else {
        setMessage("Issue while updating");
        setMessageType("error");

        setTimeout(() => {
          setMessage("");
          setMessageType("");
        }, 3000);
      }
      navigate("/ms");
    } catch (e) {
      console.log(e);
    } finally {
      navigate("/ms");
    }
  };

  return (
    <>
      <div>
        <HMIHeader />

        <div className="flex items-center justify-between p-5 w-full">
          <div className="flex-1 text-xl font-semibold">
            <span className=" hover:cursor-pointer">
              <Tooltip title="Logout" placement="right">
                <LogoutOutlined
                  className="text-red-500 font-semibold text-2xl hover:cursor-pointer"
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
            <div
            // className={`${
            //   reasonMessage &&
            //   reasonMessage.toLowerCase() !== "reason message"
            //     ? "hidden"
            //     : "block"
            // }`}
            >
              <Tooltip title="Go Back" placement="right">
                <StepBackwardOutlined /> Back
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8 p-5">
          <div className="flex items-center">
            <label className="w-1/3 text-2xl font-semibold">MACHINE ID:</label>
            <Input
              placeholder="MACHINE123"
              className="w-2/3 rounded-lg input-design"
              value={machineIDValue}
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-2xl  font-semibold">SHIFT:</label>
            <Input
              placeholder="1"
              className="w-2/3  rounded-lg input-design"
              value={shift}
              disabled
            />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-2xl  font-semibold">
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
            <label className="w-1/3 text-2xl  font-semibold">
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
            <label className="w-1/3 text-2xl  font-semibold">PART NAME:</label>
            <Input
              value={partname}
              placeholder="PART001"
              className="w-2/3  rounded-lg input-design"
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-2xl  font-semibold">OPERATION:</label>
            <Input
              value={operation}
              placeholder="OP001"
              className="w-2/3  rounded-lg input-design"
              disabled
            />
          </div>

          <div className="flex items-center">
            <label className="w-1/3 text-2xl  font-semibold">OPERATOR 1:</label>
            <Input
              placeholder="OP123"
              className="w-2/3  rounded-lg input-design"
              value={empId}
              disabled
            />
          </div>

          <div className="flex items-center ml-5">
            <label className="w-1/3 text-2xl  font-semibold">OPERATOR 2:</label>
            <div className="w-2/3 flex space-x-5">
              <Input
                placeholder="456"
                maxLength={10}
                className="rounded-lg input-design"
                ref={inputRef}
                value={operator2}
                onChange={handleChange}
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
        <div className="flex items-center justify-center mt-5">
          <div className="flex items-center justify-between">
            <div>
              <button
                className={`px-4 font-semibold py-2 text-xl  rounded-md shadow w-80 h-14 ${
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
                className={`px-4 font-semibold py-2 rounded-md ml-4 text-xl h-14 shadow w-80 ${
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
                className={`text-white px-4 py-2 font-semibold text-xl rounded-md h-14 ml-4 shadow w-80 ${
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
        <div className="flex items-center justify-center mt-5">
          <div className="flex items-center justify-between p-5 w-full space-x-5">
            <button
              className="w-1/3 px-4 py-2 h-14 text-center font-semibold text-xl rounded-md shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                navigate("/toollife");
              }}
            >
              TOOL LIFE
            </button>
            <button
              className="w-1/3 px-4 py-2 h-14 text-center text-xl font-semibold rounded-md shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                onSettingHandler();
              }}
            >
              SETTINGS
            </button>
            <button
              className="w-1/3 px-4 py-2 h-14 text-center text-xl rounded-md font-semibold shadow border border-black hover:bg-blue-500 hover:text-white hover:border-blue-600"
              onClick={() => {
                navigate("/reasons", {
                  state: {
                    machineID,
                    backgroundColor,
                    programno: { selectedProgram },
                    vendor: { selectedVendor },
                    partnames: { partname },
                    opertors: { operation },
                    operator2: { operator2 },
                  },
                });
              }}
            >
              REASONS
            </button>
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 ">
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
              className="text-xl"
            >
              {machineStatus}
            </div>
          </div>
          <div className="w-1/6 border border-black text-center p-4 text-xl  font-semibold rounded-lg">
            {formatTime(time)}
          </div>
        </div>
        <div className="flex w-full p-5 space-x-5 ">
          <div className="w-5/6 border text-2xl border-black text-center font-semibold text-black p-4 rounded-lg">
            {reasonMessage}
          </div>
          <div
            className={`w-1/6 border ${
              reasonMessage && reasonMessage.toLowerCase() !== "reason message"
                ? "animate-blink"
                : ""
            } text-xl border-black font-semibold text-center p-4 rounded-lg hover:bg-blue-500 hover:text-white hover:cursor-pointer`}
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
      <Modal open={openAlert1} footer={<></>}>
        <div className="text-3xl font-semibold text-center mt-5 mb-10">
          <p>{modalTitle}</p>
        </div>
        <div className="text-2xl text-gray-500 font-semibold text-center mt-10 mb-10">
          <p>{modalText}</p>
        </div>
      </Modal>
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
