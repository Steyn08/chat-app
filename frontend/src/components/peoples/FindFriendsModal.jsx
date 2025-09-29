import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Typography,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { useSelector } from "react-redux";

const FindFriendsModal = ({ open, onClose }) => {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const { token } = useSelector((state) => state.auth);

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchUsersRef = useRef(null);
  const getFriendsRef = useRef(null);
  const addFriendRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const getFriends = useCallback(async () => {
    try {
      if (getFriendsRef.current) getFriendsRef.current.abort();

      getFriendsRef.current = new AbortController();
      const res = await axios.get(`${API_BASE_URL}/friends/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: getFriendsRef.current.signal,
      });

      const ids = res.data.data.map((f) => f._id);
      setFriends(ids);
    } catch (error) {
      console.error("Error fetching friends", error);
    }
  }, [token]);

  const searchUsers = useCallback(async () => {
    try {
      if (!search.trim()) return;
      if (searchUsersRef.current) searchUsersRef.current.abort();

      searchUsersRef.current = new AbortController();
      setLoading(true);

      const res = await axios.get(`${API_BASE_URL}/friends/search`, {
        params: { query: search },
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: searchUsersRef.current.signal,
      });

      if (res.data.success) {
        setUsers(res.data.data || []);
      }
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setLoading(false);
    }
  }, [search, token]);

  const handleAddFriend = async (id) => {
    try {
      if (addFriendRef.current) addFriendRef.current.abort();
      addFriendRef.current = new AbortController();

      const res = await axios.post(
        `${API_BASE_URL}/friends/add-friend`,
        { user_id: id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: addFriendRef.current.signal,
        }
      );

      if (res.data.success) {
        setFriends((prev) => [...prev, id]);
      }
    } catch (error) {
      console.error("Add friend failed", error);
    }
  };

  useEffect(() => {
    getFriends();
  }, [getFriends]);

  useEffect(() => {
    if (!search.trim()) return setUsers([]);

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    debounceTimerRef.current = setTimeout(() => {
      searchUsers();
    }, 500);

    return () => clearTimeout(debounceTimerRef.current);
  }, [search, searchUsers]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Find Friends
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          fullWidth
          label="Search Users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Enter name or username"
          margin="normal"
        />

        {loading ? (
          <div className="d-flex justify-content-center py-3">
            <CircularProgress size={24} />
          </div>
        ) : (
          <List>
            {users.length === 0 && search ? (
              <Typography variant="body2" className="text-muted mt-2">
                No users found.
              </Typography>
            ) : (
              users.map((user) => (
                <ListItem key={user._id} divider>
                  <ListItemAvatar>
                    <Avatar
                      src={
                        user.profileImage
                          ? `${API_BASE_URL}/${user.profileImage}`
                          : "/assets/icons/profile.jpg"
                      }
                    />
                  </ListItemAvatar>
                  <ListItemText primary={user.username} />
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => handleAddFriend(user._id)}
                    disabled={friends.includes(user._id)}
                  >
                    {friends.includes(user._id) ? "Friends" : "Add Friend"}
                  </Button>
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FindFriendsModal;
