import React, { useRef, useState } from "react";
import "./home.scss";
import axios from "axios";
import { useSelector } from "react-redux";

const users = [
  { id: 1, name: "John Doe", avatar: "/assets/icons/profile.jpg" },
  { id: 2, name: "Jane Smith", avatar: "/assets/icons/profile.jpg" },
  { id: 3, name: "Michael Johnson", avatar: "/assets/icons/profile.jpg" },
];

const Home = () => {
  const [search, setSearch] = useState("");
  const [friendRequests, setFriendRequests] = useState([]);
  const getUsersRef = useRef(null);
  const [apiError, setApiError] = useState(null);
  const { token } = useSelector((state) => state.auth);

  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddFriend = (id) => {
    setFriendRequests([...friendRequests, id]);
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getUsers = async () => {
    try {
      getUsersRef.current = new AbortController();

      const response = await axios.get(`${API_BASE_URL}/auth/login`, null, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getUsersRef.current.signal,
      });

      const responseData = response.data;

      console.log(responseData);
    } catch (error) {
      console.log(error);

      setApiError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="home w-100 mx-4">
      <h2>Find Friends</h2>
      <input
        type="text"
        placeholder="Search for users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-input"
      />

      <div className="user-list">
        {filteredUsers.map((user) => (
          <div key={user.id} className="user-card">
            <img src={user.avatar} alt={user.name} className="user-avatar" />
            <span className="user-name">{user.name}</span>
            <button
              onClick={() => handleAddFriend(user.id)}
              className="add-friend-btn"
              disabled={friendRequests.includes(user.id)}
            >
              {friendRequests.includes(user.id) ? "Request Sent" : "Add Friend"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;
