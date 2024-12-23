import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SessionProvider = ({ children }) => {
  const navigate = useNavigate();

  const getCurrentShift = () => {
    const currentTime = new Date();
    const hours = currentTime.getHours();

    if (hours >= 6 && hours < 14) return "1";
    if (hours >= 14 && hours < 22) return "2";
    return "3";
  };

  const handleSessionTimeout = useCallback(() => {
    Swal.fire({
      title: "Shift Ended",
      text: "Your shift has expired. Redirecting to login...",
      icon: "warning",
      timer: 3000,
      showConfirmButton: false,
      allowOutsideClick: false,
    }).then(() => {
      localStorage.removeItem("empid");
      localStorage.removeItem("currentShift");
      navigate("/login");
    });
  }, [navigate]);

  const resetTimer = useCallback(() => {
    const currentShift = getCurrentShift();
    localStorage.setItem("currentShift", currentShift);

    const shiftEndTimes = {
      1: new Date().setHours(14, 0, 0, 0),
      2: new Date().setHours(22, 0, 0, 0),
      3: new Date().setHours(6, 0, 0, 0) + 24 * 60 * 60 * 1000,
    };

    const currentTime = new Date().getTime();
    const timeToNextShiftEnd = shiftEndTimes[currentShift] - currentTime;

    if (timeToNextShiftEnd <= 0) {
      handleSessionTimeout();
    } else {
      clearTimeout(window.sessionTimeout);
      window.sessionTimeout = setTimeout(() => {
        handleSessionTimeout();
      }, timeToNextShiftEnd);
    }
  }, [handleSessionTimeout]);

  useEffect(() => {
    resetTimer();

    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keypress", resetTimer);

    return () => {
      clearTimeout(window.sessionTimeout);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keypress", resetTimer);
    };
  }, [resetTimer]);

  return <>{children}</>;
};

export default SessionProvider;
