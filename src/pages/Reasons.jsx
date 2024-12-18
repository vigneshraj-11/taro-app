import React, { useEffect, useState } from "react";
import HMIHeader from "../components/HMIHeader";
import { Spin, Tooltip } from "antd";
import { PlusOutlined, StepBackwardOutlined } from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchReasons } from "../apicalling/apis";
import ReasonModal from "../components/ReasonModal";

function Reasons() {
  const navigate = useNavigate();
  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSettings, setopenSettings] = useState(false);
  const location = useLocation();
  const { state } = location;
  const { backButton } = state || {};

  useEffect(() => {
    const fetchReasonsList = async () => {
      try {
        const response = await fetchReasons();
        setReasons(response.data);
      } catch (error) {
        console.error("Error fetching reasons:", error);
      } finally {
        setLoading(false);
      }
    };

    setTimeout(() => {
      fetchReasonsList();
      setLoading(false);
    }, 3000);
  }, []);

  return (
    <>
      <HMIHeader />
      <div className="flex items-center justify-between p-5">
        <div className="text-xl font-semibold">Reasons</div>
        {backButton !== false && (
          <div
            className="text-xl text-red-500 font-semibold hover:cursor-pointer"
            onClick={() => navigate(-1)}
          >
            <Tooltip title={"Go Back"} placement="right">
              <StepBackwardOutlined /> Back
            </Tooltip>
          </div>
        )}
      </div>

      {loading ? (
        <div className="text-center mt-10 text-xl font-semibold">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="p-10 bg-white rounded-lg text-blue-500  cursor-pointer hover:bg-blue-600 hover:text-white shadow-md border border-gray-300 hover:shadow-lg transition duration-300"
              onClick={() => {
                navigate("/reasondetails", { state: { reason } });
              }}
            >
              <p className="text-lg font-semibold text-center">{reason}</p>
            </div>
          ))}
          <div
            className="p-4 bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition duration-300 flex items-center justify-center text-blue-500 cursor-pointer hover:bg-blue-600 hover:text-white"
            onClick={() => {
              setopenSettings(true);
            }}
          >
            <h3 className="text-lg font-semibold">
              <PlusOutlined /> Add new Reason
            </h3>
          </div>
        </div>
      )}
      <div>
        {openSettings && (
          <>
            <ReasonModal onClose={() => setopenSettings(false)} />
          </>
        )}
      </div>
    </>
  );
}

export default Reasons;
