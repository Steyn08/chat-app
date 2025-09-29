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
import GroupInfoModal from "./GroupInfoModal";
import AddMemberModal from "./AddmemberModal";
import { toast } from "react-toastify";

function GroupChatBox({ groupDetails, setSidebarOpen, sidebarOpen }) {
  const groupId = groupDetails?._id;
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { token } = useSelector((state) => state.auth);
  const user = useSelector((state) => state.profile.user);

  // const [sidebarOpen, setSidebarOpen] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [messages, setMessages] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getMessageRef = useRef();
  const bottomRef = useRef(null);
  const addMemberRef = useRef(null);
  const removeMemberRef = useRef(null);
  const [groupData, setGroupData] = useState(groupDetails ?? {});
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const deleteProfileRef = useRef(null);
  const updateDetailsRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const updateProfileRef = useRef(null);

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`${API_BASE_URL}/groups/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      toast.success("Group deleted");
      // setSelectedChat(null);
      // setGroupRefresh((prev) => !prev);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete group");
    }
  };

  const toggleInfoPanel = () => {
    setShowInfoPanel((prev) => !prev);
  };
  const fetchMessages = async (groupId) => {
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

      if (response.data.success) {
        setMessages(response.data.data || []);
      }
    } catch (err) {
      console.error("Error loading messages", err);
      setMessages([]);
    }
  };

  useEffect(() => {
    if (groupDetails) {
      setGroupData(groupDetails);
    }
  }, [groupDetails]);

  const getFileExtension = (url) => url.split(".").pop().toLowerCase();

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

  const sendMessage = async () => {
    if (!newMessage.trim() && attachments.length === 0) return;

    try {
      const formData = new FormData();
      formData.append("sender", user._id);
      formData.append("groupId", groupId);
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

  let lastDate = null;

  useEffect(() => {
    fetchMessages(groupId);

    const eventKey = `group-message-${groupId}`;

    const handleIncomingMessage = (data) => {
      console.log("socket");

      if (data?.sender && data.sender !== user._id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on(eventKey, handleIncomingMessage);

    return () => {
      socket.off(eventKey, handleIncomingMessage);
    };
  }, [groupId, user?._id]);

  useEffect(() => {
    if (user?._id) {
      socket.connect();
      socket.emit("register", user?._id);
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

  const formatTime = (timestamp) => {
    return new Date(timestamp)
      .toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
      .toLowerCase();
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

  const handleProfileDelete = async (groupId) => {
    const confirm = window.confirm(
      "Are you sure you want to remove the profile image?"
    );
    if (!confirm) return;

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
        // Instead of reloading the page
        setGroupData((prev) => ({
          ...prev,
          profileImage: null,
        }));
      } else if (responseData.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
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
      <div className="chat-area d-flex flex-column flex-grow-1">
        <AppBar
          position="static"
          className="bg-white shadow-sm d-flex flex-row justify-content-between align-items-center p-2 border-bottom"
        >
          <div className="d-flex align-items-center">
            <IconButton className="d-md-none" onClick={toggleSidebar}>
              <MenuIcon />
            </IconButton>
            <Avatar
              src={
                groupDetails?.groupIcon
                  ? `${process.env.REACT_APP_API_BASE_URL}/${groupDetails.groupIcon}`
                  : "/assets/icons/group-placeholder.png"
              }
              sx={{ width: 50, height: 50 }}
              className="me-2"
            />
            <div className="fw-semibold text-dark">
              {groupDetails?.name || "Unknown"}
            </div>
          </div>
          <div>
            {/* <IconButton>
              <PhoneIcon />
            </IconButton>
            <IconButton>
              <VideocamIcon />
            </IconButton> */}
            <IconButton onClick={toggleInfoPanel}>
              <MoreVertIcon />
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
                    {!isOwn && (
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
                    )}
                    <div style={{ maxWidth: "50%" }}>
                      {!isOwn && msg.sender.username && (
                        <div className="text-muted small fw-semibold ms-1">
                          {msg?.sender?.username}
                        </div>
                      )}
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
                                <IconButton size="small" className="ms-1">
                                  <DownloadIcon fontSize="small" />
                                </IconButton>
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
      <GroupInfoModal
        open={showInfoPanel}
        onClose={toggleInfoPanel}
        groupDetails={groupDetails}
        user={user}
        groupData={groupData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        handleProfileUpdate={handleProfileUpdate}
        handleRemoveMember={handelRemoveMember}
        setShowAddMemberModal={setShowAddMemberModal}
        handleProfileDelete={handleProfileDelete}
        handleDeleteGroup={handleDeleteGroup}
      />

      {showAddMemberModal && (
        <AddMemberModal
          open={showAddMemberModal}
          onClose={() => setShowAddMemberModal(false)}
          groupMembers={groupData?.members || []}
          handleAddMember={handleAddMember}
          groupId={groupDetails?._id}
        />
      )}
    </>
  );
}

export default GroupChatBox;
