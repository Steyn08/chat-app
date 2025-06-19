import { io } from "socket.io-client";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const socket = io(API_BASE_URL, {
  transports: ["websocket"],
  autoConnect: false,
});

export default socket;
