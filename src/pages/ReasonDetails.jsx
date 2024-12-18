import React, { useEffect, useState } from "react";
import HMIHeader from "../components/HMIHeader";
import { Spin, Tooltip } from "antd";
import { PlusOutlined, StepBackwardOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { fetchReasonItems } from "../apicalling/apis";
import ReasonModal from "../components/ReasonModal";

function ReasonDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSettings, setopenSettings] = useState(false);
  const { state } = location;
  const { reason } = state || {};

  const [reasons, setReasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReasons = async () => {
      setLoading(true);
      try {
        const response = await fetchReasonItems(reason);
        setReasons(response.data || []);
      } catch (error) {
        console.error("Error fetching reasons:", error);
        setReasons([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReasons();
  }, [reason]);

  return (
    <>
      <HMIHeader />
      <div className="flex items-center justify-between p-5">
        <div className="text-xl font-semibold">Reasons</div>
        <div
          className="text-xl text-red-500 font-semibold hover:cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <Tooltip title={"Go Back"} placement="right">
            <StepBackwardOutlined /> Back
          </Tooltip>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center mt-20">
          <Spin size="large" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 p-5">
          {reasons.length > 0 ? (
            reasons.map((item, index) => (
              <div
                key={index}
                className="w-56 h-28 p-4 flex items-center justify-center bg-white rounded-lg text-blue-500 cursor-pointer hover:bg-blue-600 hover:text-white shadow-md border border-gray-300 hover:shadow-lg transition duration-300"
              >
                <p className="text-lg font-semibold text-center">{item}</p>
              </div>
            ))
          ) : (
            <div className="w-full text-center col-span-full text-gray-500">
              No reasons available.
            </div>
          )}
          <div
            className="w-56 h-28 flex items-center justify-center bg-white rounded-lg shadow-md border border-gray-300 hover:shadow-lg transition duration-300 text-blue-500 cursor-pointer hover:bg-blue-600 hover:text-white"
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

export default ReasonDetails;
