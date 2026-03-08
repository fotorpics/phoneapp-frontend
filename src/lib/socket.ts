import { io } from "socket.io-client";
import { API_BASE_URL } from "./billingApi";

// SOCKET_URL should be the base URL without the /api suffix
const SOCKET_URL = API_BASE_URL.replace(/\/api$/, "");

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  auth: (cb) => {
    cb({ token: localStorage.getItem("callflow:authToken") });
  },
  extraHeaders: {
    Authorization: `Bearer ${localStorage.getItem("callflow:authToken")}`
  }
});
