import axios from "axios";
import Swal from "sweetalert2";

const BASE_URL = process.env.REACT_APP_BASE_URL;
const cell_name = process.env.REACT_APP_CELL_NAME;

const showError = (title, message) => {
  Swal.fire({
    icon: "error",
    title: title,
    text: message,
    confirmButtonText: "OK",
  });
};

export const EmpLogin = async (key, value) => {
  try {
    console.log(key);
    const requestBody = { [key]: value };
    const response = await axios.post(`${BASE_URL}/emplogin`, requestBody, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    showError("Login Failed", error.response?.data?.message || error.message);
    throw error;
  }
};

export const fetchStatus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/${cell_name}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    showError("Fetch Status Failed", error.message);
    throw error;
  }
};

export const fetchHMIDetails = async (machineID) => {
  try {
    const response = await axios.get(`${BASE_URL}/hmi/${machineID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching:", error);
    showError(
      "Fetching Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const FetchPartInfo = async (machineID, programNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/hmi/part-info`, {
      params: {
        machineID,
        programNumber,
      },
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving part info:", error);
    showError(
      "Fetch Part info Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchTool = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tools`);
    return response;
  } catch (error) {
    console.error("Error fetching tools:", error);
    showError(
      "Fetch Tools Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchReasons = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reasons`);
    return response;
  } catch (error) {
    console.error("Error fetching reasons:", error);
    showError(
      "Fetch Reasons Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchReasonItems = async (reason) => {
  try {
    const response = await axios.get(`${BASE_URL}/reasons/${reason}`);
    return response;
  } catch (error) {
    console.error("Error fetching reasons items:", error);
    showError(
      "Fetch Reason Items Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchConnection = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/ethernet/connection`);
    return response;
  } catch (error) {
    console.error("Error fetching connection:", error);
    showError(
      "Fetch Connection Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchVendorList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/vendorList`, {
      headers: { "Content-Type": "application/json" },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((vendor) => ({
        label: vendor.label,
        value: vendor.label,
      }));
    } else {
      console.error("Unexpected response format:", response.data);
      throw new Error("Unexpected response format.");
    }
  } catch (error) {
    console.error("Error fetching vendor list:", error);
    showError(
      "Fetching Vendor List Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchProgramList = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/programNoList`, {
      headers: { "Content-Type": "application/json" },
    });

    if (Array.isArray(response.data)) {
      return response.data;
    } else {
      console.error("Unexpected response format:", response.data);
      throw new Error("Unexpected response format.");
    }
  } catch (error) {
    console.error("Error fetching vendor list:", error);
    showError(
      "Fetching Vendor List Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const postIdealTime = async (master_id, program_no, ideal_time) => {
  try {
    const response = await axios.post(`${BASE_URL}/insert_ideal_time`, {
      master_id,
      program_no,
      ideal_time,
    });
    return response.data;
  } catch (error) {
    console.error("Error during POST request:", error);
    showError(
      "Error during POST Ideal request",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const fetchIdealTime = async (master_id, program_no, toggle) => {
  try {
    console.log({
      master_id,
      program_no,
      toggle,
    });
    const response = await axios.get(`${BASE_URL}/get_ideal_time`, {
      params: {
        master_id,
        program_no,
        toggle,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during GET request:", error);
    showError(
      "Error during GET Ideal request",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const postReasonDetail = async (
  master_id,
  ideal_reason_group,
  ideal_reason
) => {
  try {
    const response = await axios.post(`${BASE_URL}/reasons`, {
      master_id,
      ideal_reason_group,
      ideal_reason,
    });
    return response.data;
  } catch (error) {
    console.error("Error during POST Reason request:", error);
    showError(
      "Error during POST Reason request",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const toggleMachineMode = async (data) => {
  try {
    const response = await axios.post(`${BASE_URL}/toggle`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error in toggle API:", error);
    showError(
      error.response?.data?.message ||
        "An unexpected error occurred. Please try again."
    );
    throw error;
  }
};

export const confirmation = async (data) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/reasons_confirmation`,
      data,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error in confirmation API:", error);
    showError(
      error.response?.data?.message ||
        "An unexpected error occurred. Please try again."
    );
    throw error;
  }
};

export const postOperator2 = async (operator2) => {
  try {
    const response = await axios.post(`${BASE_URL}/operator2`, {
      operator2,
    });
    return response.data;
  } catch (error) {
    console.error("Error during POST Operator2 request:", error);
    showError(
      "Error during POST Operator2 request",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const usernameLogin = async (username, password) => {
  try {
    const response = await axios.post(
      `${BASE_URL}/username_pwd`,
      { username, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error during login:", error);
    showError("Login Failed", error.response?.data?.message || error.message);
    throw error;
  }
};

export const getPartName = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/get_part_name`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching part name:", error);
    showError(
      "Error fetching part name",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const setPercentage = async (percentage) => {
  try {
    const response = await axios.get(`${BASE_URL}/percentage/${percentage}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching:", error);
    showError(
      "Fetching Failed",
      error.response?.data?.message || error.message
    );
    throw error;
  }
};

export const submitProgramDetails = async (data) => {
  try {
    console.log("Submitting program details:", data);

    const response = await axios.post(`${BASE_URL}/program_no`, data, {
      headers: { "Content-Type": "application/json" },
    });

    return response.data;
  } catch (error) {
    console.error("Error during submission:", error);
    throw new Error(
      error.response?.data?.message || "Failed to submit program details"
    );
  }
};
