import React, { useCallback, useEffect, useRef, useState } from "react";
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
  const searchUsersRef = useRef(null);
  const getFriendsRef = useRef(null);
  const [apiError, setApiError] = useState(null);
  const { token } = useSelector((state) => state.auth);
  const debounceTimerRef = useRef(null);
  const addFriendRef = useRef(null);
  const [users, setUsers] = useState();
  const [friends, setFriends] = useState();

  // const filteredUsers = users.filter((user) =>
  //   user.name.toLowerCase().includes(search.toLowerCase())
  // );

  const handleAddFriend = async (id) => {
    try {
      if (addFriendRef.current) {
        addFriendRef.current.abort();
      }

      addFriendRef.current = new AbortController();

      const response = await axios.post(
        `${API_BASE_URL}/friends/add-friend`,
        {
          user_id: id,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          signal: addFriendRef.current.signal,
        }
      );

      const responseData = response.data;

      if (responseData.success) {
        getFriends();
      }
    } catch (error) {
      console.log(error);
    }
  };
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getFriends = useCallback(async () => {
    try {
      if (getFriendsRef.current) {
        getFriendsRef.current.abort();
      }

      getFriendsRef.current = new AbortController();

      const response = await axios.get(`${API_BASE_URL}/friends/list`, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getFriendsRef.current.signal,
      });
      const responseData = response.data;
      const ids = responseData.data.map((user) => user._id);
      setFriends(ids);
      console.log("friends", responseData);
    } catch (error) {
      console.log(error);
    }
  }, [token]);

  const searchUsers = useCallback(async () => {
    try {
      if (searchUsersRef.current) {
        searchUsersRef.current.abort();
      }

      searchUsersRef.current = new AbortController();

      const response = await axios.get(`${API_BASE_URL}/friends/search`, {
        params: { query: search },
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: searchUsersRef.current.signal,
      });

      const responseData = response.data;
      if (responseData.success) {
        if (responseData.data) {
          setUsers(responseData.data);
        }
      }

      // setUsers(responseData)
    } catch (error) {
      console.log(error);
      setApiError("Something went wrong. Please try again.");
    }
  }, [search, token]);

  useEffect(() => {
    getFriends();

    if (search.trim() === "") return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => {
      clearTimeout(debounceTimerRef.current);
    };
  }, [search, searchUsers, getFriends]);

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
        {users &&
          users.map((user) => (
            <div key={user._id} className="user-card">
              <img
                src={user.avatar}
                alt={user.username}
                className="user-avatar"
              />
              <span className="user-name">{user.profilename}</span>
              <button
                onClick={() => handleAddFriend(user._id)}
                className="add-friend-btn"
                disabled={friends.includes(user._id)}
              >
                {friends.includes(user._id) ? "Friends" : "Add Friend"}
              </button>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Home;
