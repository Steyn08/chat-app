import React, { useState, useEffect, useRef } from "react";
import "./chatwindow.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperclip,
  faPaperPlane,
  faEye,
  faAddressBook,
  faCheck,
  faClose,
  faEnvelope,
  faPen,
  faAlignLeft,
} from "@fortawesome/free-solid-svg-icons";
import GroupList from "../groups/GroupList";
import PeopleList from "../peoples/PeopleList";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import socket from "../../socket";
import { setAuth } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import "react-image-lightbox/style.css";
import Lightbox from "react-image-lightbox";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import FilePreviewCard from "../FilePreviewCard";
import { Camera } from "lucide-react";
import MessagesList from "../MessagesList";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const ChatWindow = () => {
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.user);

  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImage, setViewerImage] = useState("");
  const [isChatUserOnline, setIsChatUserOnline] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [friendsList, setFriendsList] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [groupData, setGroupData] = useState([]);
  const messagesEndRef = useRef(null);
  const groupMessagesRef = useRef(null);
  const getFriendsMessageRef = useRef(null);
  const uploadImageRef = useRef(null);
  const updateProfileRef = useRef(null);
  const deleteProfileRef = useRef(null);
  const updateDetailsRef = useRef(null);
  const addMemberRef = useRef(null);
  const removeMemberRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toggleInfoPanel = () => {
    setShowInfoPanel((prev) => !prev);
  };

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

  const formatMessageTime = (timestamp) =>
    new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const fetchGroupMessages = async (groupId) => {
    try {
      setMessageLoading(true);

      if (groupMessagesRef.current) {
        groupMessagesRef.current.abort();
      }

      groupMessagesRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: groupMessagesRef.current.signal,
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
    } finally {
      setMessageLoading(false);
    }
  };

  const fetchFriendsMessages = async (userId) => {
    try {
      setMessageLoading(true);
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
    } finally {
      setMessageLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      updateDetailsRef.current = new AbortController();

      const formData = new FormData();
      formData.append("name", groupData.name);
      formData.append("groupDescription", groupData.groupDescription);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        signal: updateDetailsRef.current.signal,
      };
      const response = await axios.put(
        `${API_BASE_URL}/groups/${groupData._id}`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        // window.location.reload();
        setGroupData((prev) => ({
          ...prev,
          name: responseData.updatedGroup.name,
          groupDescription: responseData.updatedGroup.groupDescription,
        }));
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
    setIsEditing(false);
  };

  const handleProfileUpdate = async (file, groupId) => {
    try {
      updateProfileRef.current = new AbortController();

      const formData = new FormData();
      formData.append("profile_image", file);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: updateProfileRef.current.signal,
      };
      const response = await axios.post(
        `${API_BASE_URL}/groups/update-profile-image/${groupId}`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        window.location.reload();
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

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

  const handleToggle = () => {
    setShowOptions(!showOptions);
  };

  const handleOption = (action) => {
    setShowOptions(false);
    if (action === "view") {
      window.open(`${API_BASE_URL}/${selectedChat?.data?.groupIcon}`, "_blank");
    } else if (action === "upload") {
      document.getElementById("profileUpload").click();
    } else if (action === "remove") {
      handleProfileDelete(selectedChat?.data?._id);
    }
  };

  const handleProfileDelete = async (groupId) => {
    try {
      deleteProfileRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: deleteProfileRef.current.signal,
      };
      const response = await axios.delete(
        `${API_BASE_URL}/groups/profile/image/${groupId}`,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        window.location.reload();
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  const handleAddMember = async (friendId, groupId) => {
    try {
      addMemberRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: addMemberRef.current.signal,
      };

      const formData = new FormData();
      formData.append("user_id", friendId);
      const response = await axios.post(
        `${API_BASE_URL}/groups/${groupId}/add-members`,
        formData,
        config
      );

      const responseData = response.data;
      console.log(responseData);

      if (responseData.success) {
        setGroupData((prev) => ({
          ...prev,
          members: [...prev.members, responseData.newMember],
        }));
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }

      setShowAddMemberModal(false);
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  const handelRemoveMember = async (friendId, groupId) => {
    const confirm = window.confirm(
      "Are you sure you want to remove this member?"
    );
    if (!confirm) return;
    try {
      removeMemberRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: removeMemberRef.current.signal,
      };

      // const formData = new FormData();
      // formData.append("user_id", friendId);
      const response = await axios.delete(
        `${API_BASE_URL}/groups/${groupId}/remove-member/${friendId}`,
        // formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        setGroupData((prev) => ({
          ...prev,
          members: prev.members.filter((m) => m._id !== friendId),
        }));
      } else {
        if (responseData.logout) {
          dispatch(
            setAuth({
              login: false,
              token: null,
            })
          );
          navigate("/sign-in");
        }
      }
    } catch (e) {
      console.log(e);
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  return (
    <>
      <div className="d-flex chats-block gap-2 w-100 mx-2">
        <div className="d-flex flex-column gap-4 justify-content-between chats-list">
          {/* <input
          type="search"
          placeholder="Search..."
          className="w-100 search-field rounded"
        /> */}
          <div className="groups-block rounded p-2">
            <h3 className="text-start">Groups</h3>
            <GroupList
              onSelect={(group) => {
                setSelectedChat({ type: "group", data: group });
                setGroupData(group);
              }}
            />
          </div>
          <div className="peoples-block rounded p-2">
            <h3 className="text-start">People</h3>
            <PeopleList
              setFriendsList={setFriendsList}
              onSelect={(person) =>
                setSelectedChat({ type: "person", data: person })
              }
            />
          </div>
        </div>

        {selectedChat?.type === "group" && (
          <div className="h-100 chat-content">
            <div className="chat-view rounded d-flex flex-column justify-content-between">
              <div className="profile-details d-flex justify-content-between p-3">
                <div className="status d-flex align-items-center">
                  <img
                    src={
                      selectedChat?.data?.groupIcon
                        ? `${API_BASE_URL}/${
                            selectedChat?.data?.groupIcon
                          }?v=${Date.now()}`
                        : "/assets/icons/group-placeholder.png"
                    }
                    onError={(e) =>
                      (e.target.src = "/assets/icons/group-placeholder.png")
                    }
                    alt="Profile"
                    className="profile-pic"
                  />
                  <div className="d-flex mx-1 flex-column justify-content-between">
                    <h6 className="m-0 text-start">
                      {selectedChat?.data?.name}
                    </h6>
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
                    onClick={toggleInfoPanel}
                    style={{ cursor: "pointer" }}
                  />
                </div>
              </div>

              {messageLoading ? (
                <div
                  className="flex-grow-1 d-flex justify-content-center align-items-center"
                  style={{ minHeight: "300px" }}
                >
                  <span className="spinner-border text-success" />
                </div>
              ) : (
                <>
                  <div className="messages-block p-3">
                    <MessagesList
                      messages={messages}
                      userId={user._id}
                      API_BASE_URL={API_BASE_URL}
                      formatDateSeparator={formatDateSeparator}
                      formatMessageTime={formatMessageTime}
                      viewerImage={viewerImage}
                      setViewerImage={setViewerImage}
                      viewerOpen={viewerOpen}
                      setViewerOpen={setViewerOpen}
                      isGroupChat={true}
                    />

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
                </>
              )}
            </div>
          </div>
        )}

        {selectedChat?.type === "person" && (
          <div className="h-100 chat-content">
            <div className="chat-view rounded d-flex flex-column justify-content-between">
              <div className="profile-details d-flex justify-content-between p-3">
                <div className="status d-flex align-items-center">
                  <img
                    // src="/assets/icons/profile.jpg"
                    src={
                      selectedChat?.data?.profileImage
                        ? `${API_BASE_URL}/${
                            selectedChat?.data?.profileImage
                          }?v=${Date.now()}`
                        : "/assets/icons/profile.jpg"
                    }
                    onError={(e) =>
                      (e.target.src = "/assets/icons/profile.jpg")
                    }
                    alt="Profile"
                    className="profile-pic"
                  />
                  <div className="d-flex mx-1 flex-column justify-content-between">
                    <h6 className="m-0 text-start">
                      {selectedChat?.data?.name}
                    </h6>
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
                    onClick={toggleInfoPanel}
                  />
                </div>
              </div>

              {messageLoading ? (
                <div
                  className="flex-grow-1 d-flex justify-content-center align-items-center"
                  style={{ minHeight: "300px" }}
                >
                  <span className="spinner-border text-success" />
                </div>
              ) : (
                <>
                  <div className="messages-block p-3">
                    <MessagesList
                      messages={messages}
                      userId={user._id}
                      API_BASE_URL={API_BASE_URL}
                      formatDateSeparator={formatDateSeparator}
                      formatMessageTime={formatMessageTime}
                      viewerImage={viewerImage}
                      setViewerImage={setViewerImage}
                      viewerOpen={viewerOpen}
                      setViewerOpen={setViewerOpen}
                      isGroupChat={false}
                    />

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
                </>
              )}
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
      {showInfoPanel && (
        <div className="info-sidebar">
          <div className="info-header d-flex justify-content-between align-items-center p-3">
            <h5 className="m-0">
              {selectedChat?.type === "person" ? "Personal Info" : "Group Info"}
            </h5>
            <button className="btn-close" onClick={toggleInfoPanel}></button>
          </div>
          <div className="info-body p-0">
            <div className="profile-photo-section d-flex flex-column justify-content-center">
              <div className="profile-photo">
                {selectedChat?.data?.groupIcon || selectedChat?.profileImage ? (
                  <img
                    src={`${API_BASE_URL}/${
                      selectedChat?.data?.groupIcon ||
                      selectedChat?.profileImage
                    }?v=${Date.now()}`}
                    onError={(e) =>
                      (e.target.src =
                        selectedChat?.type === "person"
                          ? "/assets/icons/profile.jpg"
                          : "/assets/icons/group-placeholder.png")
                    }
                    alt="Profile"
                    className="profile-pic"
                    style={{ objectFit: "cover" }}
                    height={120}
                    width={120}
                  />
                ) : (
                  <img
                    src={
                      selectedChat?.type === "person"
                        ? "/assets/icons/profile.jpg"
                        : "/assets/icons/group-placeholder.png"
                    }
                    alt="Profile"
                    className="profile-pic"
                    style={{ objectFit: "cover" }}
                    height={120}
                    width={120}
                  />
                )}
                <div
                  className="profile-photo-overlay"
                  onClick={() => handleToggle()}
                >
                  {selectedChat?.type === "group" && (
                    <>
                      <Camera size={24} />
                      <div className="photo-text text-white text-center">
                        CHANGE
                        <br />
                        PROFILE
                        <br />
                        PHOTO
                      </div>
                    </>
                  )}
                </div>

                {showOptions && (
                  <div className="profile-options">
                    <div
                      className="option-item"
                      onClick={() => handleOption("upload")}
                    >
                      Upload New
                    </div>
                    {selectedChat?.data?.groupIcon && (
                      <>
                        <div
                          className="option-item"
                          onClick={() => handleOption("view")}
                        >
                          View
                        </div>
                        <div
                          className="option-item"
                          onClick={() => handleOption("remove")}
                        >
                          Remove
                        </div>
                      </>
                    )}
                  </div>
                )}

                <input
                  type="file"
                  id="profileUpload"
                  ref={uploadImageRef}
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleProfileUpdate(
                      e.target.files[0],
                      selectedChat?.data?._id
                    )
                  }
                />
              </div>
            </div>
            <div className="info-block d-flex justify-content-between align-items-start flex-wrap p-3 pb-0 mt-4 border-bottom">
              <div className="flex-grow-1">
                {selectedChat?.type == "group" ? (
                  <>
                    <div className="profile-item d-flex align-items-center mb-3">
                      <FontAwesomeIcon icon={faAddressBook} className="me-2" />
                      {isEditing &&
                      selectedChat?.type == "group" &&
                      selectedChat.data.admin == user._id ? (
                        <input
                          className="form-control"
                          type="text"
                          name="name"
                          value={groupData?.name || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span>{groupData?.name || "-"}</span>
                      )}
                    </div>

                    <div className="profile-item d-flex align-items-center mb-3">
                      <FontAwesomeIcon icon={faAlignLeft} className="me-2" />
                      {isEditing &&
                      selectedChat?.type == "group" &&
                      selectedChat.data.admin == user._id ? (
                        <input
                          className="form-control"
                          type="text"
                          name="groupDescription"
                          value={groupData?.groupDescription || ""}
                          onChange={handleChange}
                        />
                      ) : (
                        <span>{groupData?.groupDescription || "-"}</span>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="profile-item d-flex align-items-center mb-3">
                      <FontAwesomeIcon icon={faAddressBook} className="me-2" />

                      <span>{selectedChat?.data?.name || "-"}</span>
                    </div>
                    <div className="profile-item d-flex align-items-center">
                      <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                      <span>{selectedChat?.data?.email || ""}</span>
                    </div>
                  </>
                )}
              </div>

              {isEditing &&
              selectedChat?.type === "group" &&
              selectedChat.data.admin === user._id ? (
                <div className="mt-2 ms-3 w-100 d-flex justify-content-end gap-2">
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => setIsEditing(false)}
                  >
                    <FontAwesomeIcon icon={faClose} className="me-1" />
                    Cancel
                  </button>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={handleSubmit}
                  >
                    <FontAwesomeIcon icon={faCheck} className="me-1" />
                    Save
                  </button>
                </div>
              ) : selectedChat?.type === "group" &&
                selectedChat.data.admin === user._id ? (
                <div className="mt-2 ms-3">
                  <button
                    className="btn btn-sm btn-outline-secondary rounded-circle"
                    onClick={() => setIsEditing(true)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                </div>
              ) : (
                <></>
              )}
            </div>
            {selectedChat?.type === "group" && (
              <div className="info-block d-flex flex-column justify-content-between align-items-start flex-wrap p-3">
                <div className="d-flex justify-content-end w-100">
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={() => setShowAddMemberModal(true)}
                  >
                    + Add Member
                  </button>
                </div>

                <h5>
                  <small>{groupData.members.length}</small>&nbsp;Members
                </h5>

                <div className="members-list d-flex flex-column w-100">
                  {groupData?.members
                    ?.slice()
                    .sort((a, b) =>
                      a._id === groupData?.admin
                        ? -1
                        : b._id === groupData?.admin
                        ? 1
                        : 0
                    )
                    .map((member, index) => {
                      return (
                        <div
                          key={index}
                          className="d-flex justify-content-between align-items-center w-100 border-bottom pb-1"
                        >
                          <div>
                            <img
                              src={
                                member?.profileImage
                                  ? `${API_BASE_URL}/${
                                      member.profileImage
                                    }?v=${Date.now()}`
                                  : "/assets/icons/profile.jpg"
                              }
                              onError={(e) =>
                                (e.target.src = "/assets/icons/profile.jpg")
                              }
                              alt={member?.name}
                              className="people-avatar"
                            />
                            <span>
                              {user?._id == member?._id
                                ? "You"
                                : member?.username}
                            </span>
                          </div>
                          {groupData?.admin == member?._id ? (
                            <small
                              className="text-white bg-secondary rounded p-1"
                              style={{ fontSize: "10px" }}
                            >
                              Group admin
                            </small>
                          ) : (
                            user?._id == groupData?.admin && (
                              <a
                                className="text-danger text-decoration-none"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  handelRemoveMember(member?._id, groupData._id)
                                }
                              >
                                remove
                              </a>
                            )
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showAddMemberModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header d-flex justify-content-between">
                <h5 className="modal-title">Add Member</h5>
                <button
                  type="button"
                  className="close"
                  onClick={() => setShowAddMemberModal(false)}
                >
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {/* Friend List Goes Here */}
                {friendsList
                  ?.filter(
                    (friend) =>
                      !groupData?.members?.some(
                        (member) => member?._id === friend?._id
                      )
                  )
                  .map((friend) => (
                    <div
                      key={friend?._id}
                      className="d-flex justify-content-between align-items-center border-bottom py-1"
                    >
                      <div>
                        <img
                          src={
                            friend?.profileImage
                              ? `${API_BASE_URL}/${friend.profileImage}`
                              : "/assets/icons/profile.jpg"
                          }
                          alt={friend?.name}
                          className="people-avatar"
                        />
                        <span>{friend?.name}</span>
                      </div>
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() =>
                          handleAddMember(friend?._id, groupData?._id)
                        }
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWindow;
