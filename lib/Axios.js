import axios from "axios";
import { signOut } from "next-auth/react";

export const Axios = axios.create({
  baseURL: "http://localhost:8000/api", // langsung ke Laravel
  headers: {
    "Content-Type": "application/json",
    'Access-Control-Allow-Origin': '*',
  },
});

// Axios.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status == 401 || error.response?.status == 402) {
//       signOut({ callbackUrl: "/login" });
//     }
//     return Promise.reject(error);
//   }
// );

async function postData(endpoint, data = {}, customHeader = {}) {
  try {
    const response = await Axios.get(endpoint, data, {
      headers: customHeader,
    });
    return response;
  } catch (error) {
    throw error;
  }
}
