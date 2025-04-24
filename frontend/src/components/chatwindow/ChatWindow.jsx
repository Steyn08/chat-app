import React, { useState, useEffect, useRef } from "react";
import "./chatwindow.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faPaperPlane,
  faDownload,
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
  const [viewerImage, setViewerImage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
        <input
          type="search"
          placeholder="Search..."
          className="w-100 search-field rounded"
        />
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
                  <small className="text-start">Online</small>
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
                        return (
                          <div key={idx} className="mt-2">
                            <img
                              src={fullUrl}
                              alt="attachment"
                              style={{ cursor: "pointer" }}
                              className="img-thumbnail"
                              onClick={() => openImage(fullUrl)}
                              width={150}
                              height={150}
                            />
                            <br />
                            <a
                              href={fullUrl}
                              download
                              className="btn btn-sm btn-outline-secondary mt-1"
                            >
                              <FontAwesomeIcon icon={faDownload} color="#000" />
                            </a>
                          </div>
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
              </div>
              {attachments.length > 0 && (
                <div className="attachments-preview d-flex gap-2 overflow-auto">
                  {attachments.map((file, index) => (
                    <div
                      key={index}
                      className="attachment-preview position-relative"
                    >
                      {file.type.startsWith("image") ? (
                        <img
                          src={URL.createObjectURL(file)}
                          alt="preview"
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div className="file-icon">📄 {file.name}</div>
                      )}
                      <button
                        className="btn-close position-absolute top-0 end-0"
                        onClick={() =>
                          setAttachments((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
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
                  <small className="text-start">Online</small>
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
                        return (
                          <div key={idx} className="mt-2">
                            <img
                              src={fullUrl}
                              alt="attachment"
                              style={{ cursor: "pointer" }}
                              className="img-thumbnail"
                              onClick={() => openImage(fullUrl)}
                              width={150}
                              height={150}
                            />
                            <br />
                            <a
                              href={fullUrl}
                              download
                              className="btn btn-sm btn-outline-secondary mt-1"
                            >
                              <FontAwesomeIcon icon={faDownload} color="#000" />
                            </a>
                          </div>
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
                  <div className="attachments-preview d-flex gap-2 overflow-auto">
                    {attachments.map((file, index) => (
                      <div
                        key={index}
                        className="attachment-preview position-relative"
                      >
                        {file.type.startsWith("image") ? (
                          <img
                            src={URL.createObjectURL(file)}
                            alt="preview"
                            style={{
                              width: "60px",
                              height: "60px",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <div className="file-icon">📄 {file.name}</div>
                        )}
                        <button
                          className="btn-close position-absolute top-0 end-0"
                          onClick={() =>
                            setAttachments((prev) =>
                              prev.filter((_, i) => i !== index)
                            )
                          }
                        />
                      </div>
                    ))}
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
    </div>
  );
};

export default ChatWindow;
