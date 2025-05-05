import React, { useState, useEffect, useRef } from "react";
import "./chatwindow.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faPaperPlane,
  faDownload,
  faEye,
  faFilePdf,
  faFileWord,
  faFileExcel,
  faFileImage,
  faFile,
} from "@fortawesome/free-solid-svg-icons";
import GroupList from "../groups/GroupList";
import PeopleList from "../peoples/PeopleList";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { io } from "socket.io-client";
import { setAuth } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import "react-image-lightbox/style.css";
import Lightbox from "react-image-lightbox";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import FilePreviewCard from "../FilePreviewCard";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ChatWindow = () => {
  const socket = io(API_BASE_URL);
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.user);

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const getMessageRef = useRef(null);
  const getFriendsMessageRef = useRef(null);
  const [attachments, setAttachments] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [showAttachmentPopup, setShowAttachmentPopup] = useState(false);
  const [viewerImage, setViewerImage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);

  const openImage = (imageUrl) => {
    setViewerImage(imageUrl);
    setViewerOpen(true);
  };
  // const [messages, setMessages] = useState([
  //   { id: 1, text: "Hey! How are you?", sender: "other" },
  //   { id: 2, text: "I'm good! How about you?", sender: "own" },
  //   {
  //     id: 3,
  //     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //     sender: "other",
  //   },
  //   {
  //     id: 4,
  //     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //     sender: "other",
  //   },
  //   {
  //     id: 5,
  //     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //     sender: "other",
  //   },
  //   {
  //     id: 6,
  //     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //     sender: "other",
  //   },
  //   {
  //     id: 7,
  //     text: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  //     sender: "other",
  //   },
  // ]);

  const fetchGroupMessages = async (groupId) => {
    try {
      getMessageRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getMessageRef.current.signal,
      };

      const response = await axios.get(
        `${API_BASE_URL}/messages/list?group_id=${groupId}`,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        if (responseData.data) {
          setMessages(responseData.data);
        }
      }
    } catch (err) {
      console.error("Error loading messages", err);
    }
  };

  const fetchFriendsMessages = async (userId) => {
    try {
      getFriendsMessageRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getFriendsMessageRef.current.signal,
      };

      const response = await axios.get(
        `${API_BASE_URL}/messages/list?user_id=${userId}`,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        if (responseData.data) {
          setMessages(responseData.data);
        }
      }
    } catch (err) {
      console.error("Error loading messages", err);
    }
  };

  const getFileExtension = (url) => {
    const extension = url.split(".").pop().toLowerCase();
    return extension;
  };

  const getFileIcon = (fileUrl) => {
    const extension = getFileExtension(fileUrl);

    if (extension === "pdf") {
      return faFilePdf;
    } else if (extension === "doc" || extension === "docx") {
      return faFileWord;
    } else if (extension === "xls" || extension === "xlsx") {
      return faFileExcel;
    } else if (["jpg", "jpeg", "png", "gif", "bmp"].includes(extension)) {
      return faFileImage;
    } else {
      return faFile;
    }
  };

  useEffect(() => {
    if (user?._id) {
      socket.emit("register", user._id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat?.type === "group") {
      // socket.emit("join-group", selectedChat.data._id);
      fetchGroupMessages(selectedChat.data._id);

      socket.on(`group-message-${selectedChat.data._id}`, (data) => {
        if (data.sender && data.sender != user._id)
          setMessages((prev) => [...prev, data]);
      });
    }

    if (selectedChat?.type === "person") {
      // socket.emit("private-message", selectedChat.data._id);
      fetchFriendsMessages(selectedChat.data._id);

      socket.emit("check-user-online", selectedChat.data._id);

      socket.on("user-online-status", ({ userId, isOnline }) => {
        console.log("user online");

        if (userId === selectedChat.data._id) {
          setIsChatUserOnline(isOnline);
        }
      });

      socket.on(
        `private-message-${user._id}-${selectedChat.data._id}`,
        (data) => {
          // console.log("message received", data, messages);
          setMessages((prev) => [...prev, data]);
        }
      );
    }

    return () => {
      if (selectedChat?.type === "person") {
        socket.off(`private-message-${user._id}-${selectedChat.data._id}`);
        socket.off("user-online-status");
      }
      if (selectedChat?.type === "group") {
        socket.off(`group-message-${selectedChat.data._id}`);
      }
    };
  }, [selectedChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("sender", user._id);
      if (selectedChat?.type === "group") {
        formData.append("groupId", selectedChat.data._id);
      } else {
        formData.append("receiver", selectedChat.data._id);
      }
      formData.append("text", newMessage);

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

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

      const responseData = response.data;

      if (responseData.success && responseData.data) {
        console.log("res", responseData.data);

        const enrichedMessages = responseData.data.map((data) => ({
          ...data,
          sender: selectedChat?.type === "group" ? user : user._id,
        }));

        setMessages((prev) => [...prev, ...enrichedMessages]);
        setNewMessage("");
        setAttachments([]);
      } else if (responseData.logout) {
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

  return (
    <div className="d-flex chats-block row w-100 mx-2">
      <div className="col-4 d-flex flex-column justify-content-between chats-list">
        {/* <input
          type="search"
          placeholder="Search..."
          className="w-100 search-field rounded"
        /> */}
        <div className="groups-block rounded p-2">
          <h3 className="text-start">Groups</h3>
          <GroupList
            onSelect={(group) =>
              setSelectedChat({ type: "group", data: group })
            }
          />
        </div>
        <div className="peoples-block rounded p-2">
          <h3 className="text-start">People</h3>
          <PeopleList
            onSelect={(person) =>
              setSelectedChat({ type: "person", data: person })
            }
          />
        </div>
      </div>

      {selectedChat?.type === "group" && (
        <div className="col-8 h-100">
          <div className="chat-view rounded d-flex flex-column justify-content-between">
            <div className="profile-details d-flex justify-content-between p-3">
              <div className="status d-flex align-items-center">
                <img
                  src="/assets/icons/profile.jpg"
                  alt="Profile"
                  className="profile-pic"
                />
                <div className="d-flex mx-1 flex-column justify-content-between">
                  <h6 className="m-0 text-start">{selectedChat?.data?.name}</h6>
                  {/* <small className="text-start">
                    {isChatUserOnline ? "Online" : ""}
                  </small> */}
                </div>
              </div>
              <div className="chat-menu d-flex justify-content-between align-items-center gap-3">
                <img
                  src="/assets/icons/telephone.png"
                  alt="call"
                  className="chat-menu-icons"
                />
                <img
                  src="/assets/icons/cam-recorder.png"
                  alt="video"
                  className="chat-menu-icons"
                />
                <img
                  src="/assets/icons/more.png"
                  alt="more"
                  className="chat-menu-icons"
                />
              </div>
            </div>

            <div className="messages-block p-3">
              {messages.length > 0 &&
                messages.map((msg) => (
                  <div
                    key={msg?._id}
                    className={`message-container ${
                      (msg?.sender?._id || msg?.sender) === user._id
                        ? "own"
                        : "other"
                    }`}
                  >
                    {msg.text && (
                      <div className="w-75 d-flex msg-block">
                        <span className="message-text badge text-wrap px-3 py-2">
                          {msg.text}
                        </span>
                      </div>
                    )}

                    {msg.attachments &&
                      msg.attachments.map((file, idx) => {
                        const fullUrl = `${API_BASE_URL}/${file}`;
                        const fileExtension = getFileExtension(fullUrl); // returns 'pdf', 'docx', etc.
                        const fileName = file.split("/").pop();

                        const isImage = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "bmp",
                        ].includes(fileExtension);

                        return isImage ? (
                          <div key={idx} className="image-preview-wrapper">
                            <img
                              src={fullUrl}
                              alt={fileName}
                              onClick={() => openImage(fullUrl)}
                              className="image-thumbnail"
                            />
                            <a
                              href={fullUrl}
                              download
                              className="download-button"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                          </div>
                        ) : (
                          <FilePreviewCard
                            key={idx}
                            fullUrl={fullUrl}
                            fileName={fileName}
                            fileExtension={fileExtension}
                          />
                        );
                      })}
                  </div>
                ))}

              <div ref={messagesEndRef} />
              {viewerOpen && (
                <Lightbox
                  mainSrc={viewerImage}
                  onCloseRequest={() => setViewerOpen(false)}
                />
              )}
            </div>

            <div className="respond-block d-flex align-items-center justify-content-between p-3 gap-2">
              <div className="d-flex justify-content-between align-items-center w-100 gap-2 p-2 rounded message-input-block">
                <input
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  id="fileInput"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setAttachments(files);
                  }}
                />
                <label
                  htmlFor="fileInput"
                  className="icon-btn"
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faPaperclip} />
                </label>
                <input
                  type="text"
                  className="border-0 w-100"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                {attachments.length > 0 && (
                  <div className="attachments-preview-wrapper">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">
                        {attachments.length} attachment
                        {attachments.length > 1 ? "s" : ""}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#attachmentsModal"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="icon-btn send-btn p-2 rounded"
                onClick={sendMessage}
              >
                <FontAwesomeIcon icon={faPaperPlane} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedChat?.type === "person" && (
        <div className="col-8 h-100">
          <div className="chat-view rounded d-flex flex-column justify-content-between">
            <div className="profile-details d-flex justify-content-between p-3">
              <div className="status d-flex align-items-center">
                <img
                  src="/assets/icons/profile.jpg"
                  alt="Profile"
                  className="profile-pic"
                />
                <div className="d-flex mx-1 flex-column justify-content-between">
                  <h6 className="m-0 text-start">{selectedChat?.data?.name}</h6>
                  <small className="text-start">
                    {isChatUserOnline ? "Online" : ""}
                  </small>
                </div>
              </div>
              <div className="chat-menu d-flex justify-content-between align-items-center gap-3">
                <img
                  src="/assets/icons/telephone.png"
                  alt="call"
                  className="chat-menu-icons"
                />
                <img
                  src="/assets/icons/cam-recorder.png"
                  alt="video"
                  className="chat-menu-icons"
                />
                <img
                  src="/assets/icons/more.png"
                  alt="more"
                  className="chat-menu-icons"
                />
              </div>
            </div>

            <div className="messages-block p-3">
              {messages.length > 0 &&
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`message-container ${
                      (msg?.sender?._id || msg?.sender) === user._id
                        ? "own"
                        : "other"
                    }`}
                  >
                    {msg.text && (
                      <div className="w-75 d-flex msg-block">
                        <span className="message-text badge text-wrap px-3 py-2">
                          {msg.text}
                        </span>
                      </div>
                    )}

                    {msg.attachments &&
                      msg.attachments.map((file, idx) => {
                        const fullUrl = `${API_BASE_URL}/${file}`;
                        const fileExtension = getFileExtension(fullUrl); // returns 'pdf', 'docx', etc.
                        const fileName = file.split("/").pop();

                        const isImage = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "bmp",
                        ].includes(fileExtension);

                        return isImage ? (
                          <div key={idx} className="image-preview-wrapper">
                            <img
                              src={fullUrl}
                              alt={fileName}
                              onClick={() => openImage(fullUrl)}
                              className="image-thumbnail"
                            />
                            <a
                              href={fullUrl}
                              download
                              className="download-button"
                            >
                              <FontAwesomeIcon icon={faDownload} />
                            </a>
                          </div>
                        ) : (
                          <FilePreviewCard
                            key={idx}
                            fullUrl={fullUrl}
                            fileName={fileName}
                            fileExtension={fileExtension}
                          />
                        );
                      })}
                  </div>
                ))}
              <div ref={messagesEndRef} />
              {viewerOpen && (
                <Lightbox
                  mainSrc={viewerImage}
                  onCloseRequest={() => setViewerOpen(false)}
                />
              )}
            </div>

            <div className="respond-block d-flex align-items-center justify-content-between p-3 gap-2">
              <div className="d-flex justify-content-between align-items-center w-100 gap-2 p-2 rounded message-input-block">
                <input
                  type="file"
                  multiple
                  style={{ display: "none" }}
                  id="fileInput"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setAttachments(files);
                  }}
                />
                <label
                  htmlFor="fileInput"
                  className="icon-btn"
                  style={{ cursor: "pointer" }}
                >
                  <FontAwesomeIcon icon={faPaperclip} />
                </label>
                <input
                  type="text"
                  className="border-0 w-100"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                />
                {attachments.length > 0 && (
                  <div className="attachments-preview-wrapper">
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-secondary">
                        {attachments.length} attachment
                        {attachments.length > 1 ? "s" : ""}
                      </span>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#attachmentsModal"
                      >
                        <FontAwesomeIcon icon={faEye} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <button
                className="icon-btn send-btn p-2 rounded"
                onClick={sendMessage}
              >
                <FontAwesomeIcon icon={faPaperPlane} color="#fff" />
              </button>
            </div>
          </div>
        </div>
      )}
      <div
        className="modal fade"
        id="attachmentsModal"
        tabIndex="-1"
        aria-labelledby="attachmentsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="attachmentsModalLabel">
                Attached Files ({attachments.length})
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="d-flex flex-wrap gap-3">
                {attachments.map((file, index) => (
                  <div key={index} className="text-center position-relative">
                    {file.type.startsWith("image") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        style={{
                          width: "120px",
                          height: "120px",
                          objectFit: "cover",
                        }}
                        className="rounded border"
                      />
                    ) : (
                      <div className="p-3 border rounded bg-light">
                        📄 {file.name}
                      </div>
                    )}

                    <button
                      className="btn-close bg-danger rounded-circle position-absolute top-0 end-0"
                      onClick={() => {
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== index)
                        );
                      }}
                      aria-label="Remove attachment"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
