import axios from "axios";

const BASE_URL = "http://localhost:5001"; //Vignesh Replace with Live URL
const cell_name = "Impeller Cell";

export const fetchStatus = async () => {
  try {
    const response = await fetch(`${BASE_URL}/${cell_name}`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const fetchProgram = async (machineID, backgroundColor) => {
  try {
    const response = await axios.get(`${BASE_URL}/hmi/${machineID}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching program number:", error);
    throw error;
  }
};

export const fetchTool = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/tools`);
    return response;
  } catch (error) {
    console.error("Error fetching program number:", error);
    throw error;
  }
};

export const fetchReasons = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/reasons`);
    return response;
  } catch (error) {
    console.error("Error fetching reasons:", error);
    throw error;
  }
};

export const fetchReasonItems = async (reason) => {
  try {
    const response = await axios.get(`${BASE_URL}/reasons/${reason}`);
    return response;
  } catch (error) {
    console.error("Error fetching reasons items:", error);
    throw error;
  }
};

export const fetchConnection = async (machineID, backgroundColor) => {
  try {
    const response = await axios.get(`${BASE_URL}/ethernet/connection`);
    return response;
  } catch (error) {
    console.error("Error fetching program number:", error);
    throw error;
  }
};
