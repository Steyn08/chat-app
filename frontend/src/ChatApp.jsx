import React, { useEffect, useState } from "react";
import "./styles/chat-app.scss";
import { IconButton, TextField, Button } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import GroupList from "./components/groups/GroupList";
import PeopleList from "./components/peoples/PeopleList";
import GroupChatBox from "./components/groups/GroupChatBox";
import PeopleChatBox from "./components/peoples/PeopleChatBox";
import { useSelector } from "react-redux";
import Welcome from "./components/Welcome";
import EditProfileModal from "./components/peoples/EditProfileModal";
import FindFriendsModal from "./components/peoples/FindFriendsModal";
import CreateGroupModal from "./components/groups/CreateGroupModal";

const ChatApp = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const [menu, setMenu] = useState("group");
  const [groupData, setGroupData] = useState([]);
  const [showFriendsModal, setShowFriendsModal] = useState(false);

  const [selectedChat, setSelectedChat] = useState(null);
  const user = useSelector((state) => state.profile.user);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [openProfileModal, setOpenProfileModal] = useState(false);
  const [searchFriend, setSearchFriend] = useState("");
  const [searchGroup, setSearchGroup] = useState("");
  const [openCreateGroup, setOpenCreateGroup] = useState(false);
  const [groupRefresh, setGroupRefresh] = useState(false);

  useEffect(() => {
    console.log(selectedChat, "chat");
  }, [selectedChat]);

  return (
    <div className="chat-ui-wrapper d-flex w-100">
      <div
        className={`sidebar bg-primary text-white ${sidebarOpen ? "open" : ""}`}
      >
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center">
            <img
              src={
                user?.profileImage
                  ? `${API_BASE_URL}/${user?.profileImage}?v=${Date.now()}`
                  : "/assets/icons/profile.jpg"
              }
              onError={(e) => (e.target.src = "/assets/icons/profile.jpg")}
              onClick={() => setOpenProfileModal(true)}
              alt={user?.profilename || ""}
              className="people-avatar"
            />
            <span className="ms-2 fw-semibold">{user?.profilename}</span>
          </div>
          <IconButton className="d-md-none text-white" onClick={toggleSidebar}>
            <CloseIcon />
          </IconButton>
        </div>
        <div className="nav-tabs d-flex">
          <Button
            fullWidth
            variant="text"
            className={
              menu === "group" ? "text-white fw-bold" : "text-white-50"
            }
            onClick={() => setMenu("group")}
          >
            Groups
          </Button>
          <Button
            fullWidth
            variant="text"
            className={
              menu === "people" ? "text-white fw-bold" : "text-white-50"
            }
            onClick={() => setMenu("people")}
          >
            People
          </Button>
        </div>
        {menu === "group" ? (
          <>
            <div className="px-3 py-2">
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                variant="filled"
                InputProps={{
                  style: { backgroundColor: "#3f51b5", color: "#fff" },
                }}
                value={searchGroup}
                onChange={(e) => setSearchGroup(e.target.value)}
              />
            </div>
            <div className="px-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold">Groups</span>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => setOpenCreateGroup(true)}
              >
                + New Group
              </Button>
            </div>
            <CreateGroupModal
              open={openCreateGroup}
              onClose={() => setOpenCreateGroup(false)}
              onGroupCreated={() => setGroupRefresh((prev) => !prev)}
            />
            <GroupList
              onSelect={(group) => {
                setSelectedChat({ type: "group", data: group });
                setGroupData(group);
              }}
              searchGroup={searchGroup}
              refresh={groupRefresh}
            />
          </>
        ) : (
          <>
            <div className="px-3 py-2">
              <TextField
                fullWidth
                size="small"
                placeholder="Search..."
                variant="filled"
                InputProps={{
                  style: { backgroundColor: "#3f51b5", color: "#fff" },
                }}
                value={searchFriend}
                onChange={(e) => setSearchFriend(e.target.value)}
              />
            </div>
            <div className="px-3 d-flex justify-content-between align-items-center">
              <span className="fw-bold">People</span>
              <Button
                variant="contained"
                size="small"
                color="secondary"
                onClick={() => setShowFriendsModal(true)}
              >
                + Add Friend
              </Button>
              <FindFriendsModal
                open={showFriendsModal}
                onClose={() => setShowFriendsModal(false)}
              />
            </div>
            <PeopleList
              onSelect={(person) =>
                setSelectedChat({ type: "person", data: person })
              }
              searchFriend={searchFriend}
            />
          </>
        )}
      </div>
      {!selectedChat ? (
        <Welcome  sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
      ) : selectedChat.type === "person" ? (
        <PeopleChatBox
          receiverDetails={selectedChat.data}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      ) : (
        <GroupChatBox
          groupDetails={selectedChat.data}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
      )}

      <EditProfileModal
        open={openProfileModal}
        onClose={() => setOpenProfileModal(false)}
      />
    </div>
  );
};

export default ChatApp;
