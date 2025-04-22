import { io } from "socket.io-client";

const socket = io(process.env.REACT_APP_API_BASE_URL, {
  withCredentials: true,
});

export default socket;
