import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Avatar,
  Typography,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../../slices/authSlice";

const CreateGroupModal = ({ open, onClose, onGroupCreated }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDesc, setGroupDesc] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);

  const user = useSelector((state) => state.profile.user);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const abortRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    const getFriends = async () => {
      try {
        setLoading(true);
        abortRef.current = new AbortController();

        const response = await axios.get(`${API_BASE_URL}/friends/list`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: abortRef.current.signal,
        });

        if (response.data.success) {
          setFriends(response.data.data || []);
        } else if (response.data.logout) {
          dispatch(setAuth({ login: false, token: null }));
          navigate("/sign-in");
        }
      } catch (e) {
        if (axios.isCancel(e)) return;
        if (e.response?.status === 401) {
          dispatch(setAuth({ login: false, token: null }));
          navigate("/sign-in");
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    getFriends();

    return () => abortRef.current?.abort();
  }, [open, API_BASE_URL, token, dispatch, navigate]);

  const handleToggle = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleSubmit = async () => {
    if (!groupName.trim()) return toast.warn("Group name is required.");
    try {
      const res = await axios.post(
        `${API_BASE_URL}/groups/create`,
        {
          name: groupName,
          members: selectedFriends,
          group_description: groupDesc,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      );

      toast.success(res.data.message);
      onClose();
      setGroupName("");
      setGroupDesc("");
      setSelectedFriends([]);
      onGroupCreated();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Failed to create group.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        Create New Group
        <IconButton onClick={onClose} className="float-end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          className="mb-3"
        />
        <TextField
          fullWidth
          label="Group Description"
          multiline
          rows={3}
          value={groupDesc}
          onChange={(e) => setGroupDesc(e.target.value)}
          className="mb-3"
        />
        <Typography variant="subtitle1" className="mb-2">
          Add Members
        </Typography>

        {loading ? (
          <div className="text-center my-4">
            <CircularProgress />
          </div>
        ) : (
          <List dense>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <ListItem
                  key={friend._id}
                  button
                  onClick={() => handleToggle(friend._id)}
                >
                  <Avatar
                    src={
                      friend.profileImage
                        ? `${API_BASE_URL}/${friend.profileImage}`
                        : "/assets/icons/profile.jpg"
                    }
                    className="me-2"
                  />
                  <ListItemText primary={friend.name} />
                  <Checkbox
                    edge="end"
                    checked={selectedFriends.includes(friend._id)}
                  />
                </ListItem>
              ))
            ) : (
              <Typography variant="body2" className="text-muted px-2">
                No friends available
              </Typography>
            )}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading || !groupName.trim() || selectedFriends.length == 0}
        >
          Create Group
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateGroupModal;
