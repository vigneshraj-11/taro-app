import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import MachineStatus from "../pages/MachineStatus";
import Welcome from "../pages/Welcome";
import HMI from "../pages/HMI";
import ToolLife from "../pages/ToolLife";
import Reasons from "../pages/Reasons";
import ReasonDetails from "../pages/ReasonDetails";

function Routers() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/ms" element={<MachineStatus />} />
        <Route path="/hmi" element={<HMI />} />
        <Route path="/toollife" element={<ToolLife />} />
        <Route path="/reasons" element={<Reasons />} />
        <Route path="/reasondetails" element={<ReasonDetails />} />
      </Routes>
    </Router>
  );
}

export default Routers;
