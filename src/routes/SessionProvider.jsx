import React, { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const SessionProvider = ({ children }) => {
  const navigate = useNavigate();

  const getCurrentShift = () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = currentTime.getMinutes();
    const totalMinutes = currentHour * 60 + currentMinutes;

    const shift1Start = 8 * 60;
    const shift1End = 16 * 60 + 30;
    const shift2Start = 16 * 60 + 30;
    const shift2End = 1 * 60;
    const shift3Start = 1 * 60;
    const shift3End = 8 * 60;

    if (totalMinutes >= shift1Start && totalMinutes < shift1End) return "1";
    if (totalMinutes >= shift2Start || totalMinutes < shift2End) return "2";
    if (totalMinutes >= shift3Start && totalMinutes < shift3End) return "3";
    return null;
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
      1: new Date().setHours(16, 30, 0, 0),
      2:
        new Date().setHours(1, 0, 0, 0) +
        (currentShift === "2" && new Date().getHours() < 16
          ? 0
          : 24 * 60 * 60 * 1000),
      3:
        new Date().setHours(8, 0, 0, 0) +
        (currentShift === "3" ? 24 * 60 * 60 * 1000 : 0),
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
