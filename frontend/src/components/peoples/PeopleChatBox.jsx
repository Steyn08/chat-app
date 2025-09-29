import "../../styles/chat-app.scss";
import { useEffect, useRef, useState } from "react";
import { AppBar, Avatar, IconButton, TextField, Button } from "@mui/material";
import {
  Menu as MenuIcon,
  Send as SendIcon,
  InsertEmoticon as InsertEmoticonIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Phone as PhoneIcon,
  Videocam as VideocamIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../slices/authSlice";
import FilePreviewCard from "../FilePreviewCard";
import socket from "../../socket";
import PeopleInfoModal from "./PeopleInfoModal";

function PeopleChatBox({ receiverDetails, sidebarOpen, setSidebarOpen }) {
  const receiverId = receiverDetails?._id;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.user);

  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleInfoPanel = () => {
    setShowInfoPanel((prev) => !prev);
  };

  const fetchMessages = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get(
        `${API_BASE_URL}/messages/list?user_id=${receiverId}`,
        config
      );
      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error("Error loading messages", err);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("receiver", receiverId);
      formData.append("text", newMessage);

      attachments.forEach((file) => formData.append("attachments", file));

      const config = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        formData,
        config
      );

      if (response.data.success && response.data.data) {
        const enrichedMessages = response.data.data.map((data) => ({
          ...data,
          sender: user,
        }));

        setMessages((prev) => [...prev, ...enrichedMessages]);
        setNewMessage("");
        setAttachments([]);
      } else if (response.data.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      console.error("Failed to send message", e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  useEffect(() => {
    fetchMessages();

    socket.emit("check-user-online", receiverId);

    socket.on("user-online-status", ({ userId, isOnline }) => {
      if (userId === receiverId) {
        setIsChatUserOnline(isOnline);
      }
    });

    socket.on(`private-message-${user._id}-${receiverId}`, (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off(`private-message-${user._id}-${receiverId}`);
      socket.off("user-online-status");
    };
  }, [receiverId, user._id]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("register", user._id);
    }
    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const formatTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  let lastDate = null;

  const formatDateSeparator = (date) => {
    const d = new Date(date);
    const today = new Date();
    const isToday =
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    const isYesterday =
      d.getDate() === today.getDate() - 1 &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getFileExtension = (url) => url.split(".").pop().toLowerCase();

  return (
    <>
      <div className="chat-area d-flex flex-column flex-grow-1">
        <AppBar
          position="static"
          className="bg-white shadow-sm d-flex flex-row justify-content-between align-items-center p-2 border-bottom"
        >
          <div className="d-flex align-items-center">
            <IconButton className="d-md-none" onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <div className="position-relative me-2">
              <Avatar
                src={
                  receiverDetails?.profileImage ||
                  "https://via.placeholder.com/40"
                }
                style={{ width: 40, height: 40 }}
              />
              {isChatUserOnline && (
                <span
                  style={{
                    position: "absolute",
                    bottom: 2,
                    right: 2,
                    width: 10,
                    height: 10,
                    backgroundColor: "#4caf50", // green
                    borderRadius: "50%",
                    border: "2px solid white",
                  }}
                />
              )}
            </div>
            <div className="fw-semibold text-dark">
              {receiverDetails?.name || "Unknown"}
            </div>
          </div>
          <div>
            {/* <IconButton>
              <PhoneIcon />
            </IconButton>
            <IconButton>
              <VideocamIcon />
            </IconButton> */}
            <IconButton>
              <MoreVertIcon onClick={toggleInfoPanel} />
            </IconButton>
          </div>
        </AppBar>

        {/* Chat Body */}
        <div className="flex-grow-1 overflow-auto p-3 bg-light">
          {messages.map((msg) => {
            const currentDate = new Date(msg.timestamp).toDateString();
            const showDateSeparator = lastDate !== currentDate;
            lastDate = currentDate;
            const isOwn = (msg?.sender?._id || msg?.sender) === user._id;

            return (
              <>
                <div key={msg._id || Math.random()}>
                  {showDateSeparator && (
                    <div className="date-separator text-center my-3">
                      <span>{formatDateSeparator(msg.timestamp)}</span>
                    </div>
                  )}
                  <div
                    className={`message-container d-flex mb-4 ${
                      isOwn ? "own justify-content-end" : "other"
                    }`}
                  >
                    {/* {!isOwn && (
                    <Avatar
                      src={
                        msg?.profileImage
                          ? `${API_BASE_URL}/${
                              msg.profileImage
                            }?v=${Date.now()}`
                          : "/assets/icons/profile.jpg"
                      }
                      className="me-2"
                    />
                  )} */}
                    <div style={{ maxWidth: "50%" }}>
                      {msg.text && (
                        <div className="message-bubble position-relative bg-white p-2 rounded shadow-sm">
                          <span className="message-text text-dark d-block pe-5 me-3">
                            {msg.text}
                          </span>
                          <span className="message-time position-absolute bottom-0 end-0 text-muted small me-1 mb-1">
                            {formatTime(msg.timestamp)}
                          </span>
                        </div>
                      )}
                      {msg.attachments &&
                        msg.attachments.map((file, idx) => {
                          const url = `${API_BASE_URL}/${file}`;
                          const ext = getFileExtension(url);
                          const isImage = [
                            "jpg",
                            "jpeg",
                            "png",
                            "gif",
                            "bmp",
                          ].includes(ext);

                          return isImage ? (
                            <div key={idx} className="mt-2">
                              <img
                                src={url}
                                alt="preview"
                                className="image-thumbnail rounded"
                                style={{ width: 150, cursor: "pointer" }}
                              />
                              <div className="small text-muted mt-1 d-flex align-items-center">
                                {formatDateSeparator(msg.timestamp)}
                                <a
                                  href={url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <IconButton size="small" className="ms-1">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div key={idx}>
                              <FilePreviewCard
                                fullUrl={url}
                                fileName={file.split("/").pop()}
                                fileExtension={ext}
                              />
                              <div className="small text-muted mt-1 d-flex align-items-center">
                                {formatDateSeparator(msg.timestamp)}
                                <a
                                  href={url}
                                  download
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <IconButton size="small" className="ms-1">
                                    <DownloadIcon fontSize="small" />
                                  </IconButton>
                                </a>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>
                <div ref={bottomRef} />
              </>
            );
          })}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
          className="border-top p-3 d-flex flex-column"
        >
          {attachments.length > 0 && (
            <div className="mb-2 d-flex flex-wrap gap-2">
              {attachments.map((file, idx) => {
                const fileURL = URL.createObjectURL(file);
                const ext = file.name.split(".").pop().toLowerCase();
                const isImage = [
                  "jpg",
                  "jpeg",
                  "png",
                  "gif",
                  "bmp",
                  "webp",
                ].includes(ext);

                return (
                  <div key={idx} className="position-relative">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="position-absolute top-0 end-0"
                      style={{ zIndex: 2 }}
                    >
                      ✕
                    </IconButton>
                    {isImage ? (
                      <img
                        src={fileURL}
                        alt="preview"
                        className="border rounded"
                        style={{ width: 100, height: 100, objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        className="border rounded bg-white p-2 text-center"
                        style={{
                          width: 150,
                          textOverflow: "ellipsis",
                          overflow: "hidden",
                        }}
                      >
                        📄 {file.name}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className="d-flex align-items-center">
            <input
              type="file"
              id="fileInput"
              multiple
              hidden
              onChange={(e) => {
                const selectedFiles = Array.from(e.target.files);
                setAttachments((prev) => [...prev, ...selectedFiles]);
                e.target.value = "";
              }}
            />
            <IconButton
              onClick={() => document.getElementById("fileInput").click()}
            >
              <AttachFileIcon />
            </IconButton>

            <TextField
              variant="outlined"
              size="small"
              placeholder="Type your message..."
              className="flex-grow-1 mx-2"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />

            <IconButton>
              <InsertEmoticonIcon />
            </IconButton>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              className="ms-2"
              disabled={!newMessage.trim() && attachments.length === 0}
            >
              <SendIcon />
            </Button>
          </div>
        </form>
      </div>
      <PeopleInfoModal
        open={showInfoPanel}
        onClose={toggleInfoPanel}
        user={receiverDetails}
      />
    </>
  );
}

export default PeopleChatBox;
