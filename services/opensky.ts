import axios from "axios";

export const fetchAllPlanes = async () => {
  try {
    const response = await axios.get(
      "https://opensky-network.org/api/states/all"
    );
    return response.data;
  } catch (error) {
    console.error("Ошибка запроса к OpenSky:", error);
    throw error;
  }
};
