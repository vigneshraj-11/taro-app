import React, { useEffect, useState } from "react";
import { Table, Button, Tooltip } from "antd";
import { StepBackwardOutlined } from "@ant-design/icons";
import HMIHeader from "../components/HMIHeader";
import { useNavigate } from "react-router-dom";
import { fetchTool } from "../apicalling/apis";

const ToolLife = () => {
  const navigate = useNavigate();

  const [disabledButtons, setDisabledButtons] = useState({});
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetchTool();
        const fetchedData = response.data.map((item, index) => ({
          ...item,
          key: index,
        }));

        setTimeout(() => {
          setData(fetchedData);
          setLoading(false);
        }, 3000);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleButtonClick = (rowKey, inspection) => {
    setDisabledButtons((prev) => ({
      ...prev,
      [rowKey]: {
        ...prev[rowKey],
        [inspection]: true,
      },
    }));
  };

  const isButtonDisabled = (rowKey, inspection) => {
    return disabledButtons[rowKey]?.[inspection] || false;
  };

  const columns = [
    {
      title: "TOOL NO",
      dataIndex: "toolNo",
      key: "toolNo",
      className: "text-center",
    },
    {
      title: "TOOL NAME",
      dataIndex: "toolName",
      key: "toolName",
      className: "text-center",
    },
    {
      title: "ACTUAL PRODUCED",
      dataIndex: "actualProduced",
      key: "actualProduced",
      className: "text-center",
    },
    {
      title: "WARNING LIMIT",
      dataIndex: "warningLimit",
      key: "warningLimit",
      className: "text-center",
    },
    {
      title: "STOP LIMIT",
      dataIndex: "stopLimit",
      key: "stopLimit",
      className: "text-center",
    },
    {
      title: "STATUS",
      dataIndex: "status",
      key: "status",
      render: (_, record) => {
        const statusColor =
          record.actualProduced >= record.stopLimit
            ? "bg-red-500 text-white"
            : record.actualProduced >= record.warningLimit
            ? "bg-yellow-400 text-black"
            : "bg-green-500 text-white";

        return (
          <span
            className={`px-3 py-1 rounded-md ${statusColor} text-center block`}
          >
            {record.actualProduced >= record.stopLimit
              ? "Alert"
              : record.actualProduced >= record.warningLimit
              ? "Warning"
              : "In Progress"}
          </span>
        );
      },
    },
    {
      title: "EDGE",
      key: "edge",
      render: (_, record) => (
        <div className="flex justify-center gap-2">
          {["Edge 1", "Edge 2", "Edge 3", "Edge 4"].map((edge, index) => (
            <Button
              key={index}
              disabled={isButtonDisabled(record.key, edge)}
              onClick={() => handleButtonClick(record.key, edge)}
              className="border-gray-300 hover:bg-blue-500 hover:text-white"
            >
              {edge}
            </Button>
          ))}
        </div>
      ),
    },
    {
      title: "TOOL CHANGE",
      key: "toolChange",
      render: (_, record) => (
        <Button
          disabled={isButtonDisabled(record.key, "Tool Change")}
          onClick={() => handleButtonClick(record.key, "Tool Change")}
          className="border-gray-300 hover:bg-blue-500 hover:text-white"
        >
          Tool Change
        </Button>
      ),
    },
  ];

  return (
    <div>
      <HMIHeader />

      <div className="flex items-center justify-between p-5">
        <div className="text-xl font-semibold">Tool Life Management</div>
        <div
          className="text-xl text-red-500 font-semibold hover:cursor-pointer"
          onClick={() => navigate(-1)}
        >
          <Tooltip title={"Go Back"} placement="right">
            <StepBackwardOutlined /> Back
          </Tooltip>
        </div>
      </div>

      <div className="px-5">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          pagination={false}
          className="shadow-md"
          bordered
        />
      </div>
    </div>
  );
};

export default ToolLife;
