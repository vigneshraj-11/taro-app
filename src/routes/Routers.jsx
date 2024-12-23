import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";
import MachineStatus from "../pages/MachineStatus";
import Welcome from "../pages/Welcome";
import HMI from "../pages/HMI";
import ToolLife from "../pages/ToolLife";
import Reasons from "../pages/Reasons";
import ReasonDetails from "../pages/ReasonDetails";
import PrivateRoute from "./PrivateRoute";
import SessionProvider from "./SessionProvider";

function Routers() {
  return (
    <Router>
      <SessionProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/welcome"
            element={
              <PrivateRoute>
                <Welcome />
              </PrivateRoute>
            }
          />
          <Route
            path="/ms"
            element={
              <PrivateRoute>
                <MachineStatus />
              </PrivateRoute>
            }
          />
          <Route
            path="/hmi"
            element={
              <PrivateRoute>
                <HMI />
              </PrivateRoute>
            }
          />
          <Route
            path="/toollife"
            element={
              <PrivateRoute>
                <ToolLife />
              </PrivateRoute>
            }
          />
          <Route
            path="/reasons"
            element={
              <PrivateRoute>
                <Reasons />
              </PrivateRoute>
            }
          />
          <Route
            path="/reasondetails"
            element={
              <PrivateRoute>
                <ReasonDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </SessionProvider>
    </Router>
  );
}

export default Routers;
