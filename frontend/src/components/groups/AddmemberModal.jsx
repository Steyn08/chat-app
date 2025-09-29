import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Checkbox,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuth } from "../../slices/authSlice";

function AddMemberModal({
  open,
  onClose,
  groupMembers,
  handleAddMember,
  groupId,
}) {
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState([]);
  const [friendsList, setPeoples] = useState([]);
  const [loading, setLoading] = useState(false);
  const getPeoplesRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  const getPeoples = useCallback(async () => {
    try {
      setLoading(true);
      getPeoplesRef.current = new AbortController();

      const config = {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: getPeoplesRef.current.signal,
      };

      const response = await axios.get(`${API_BASE_URL}/friends/list`, config);

      const responseData = response.data;

      if (responseData.success && responseData.data) {
        setPeoples(responseData.data);
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
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, navigate]);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedId([]);
    }
  }, [open]);

  useEffect(() => {
    getPeoples();
  }, [groupId]);

  const handleToggle = (id) => {
    setSelectedId((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    if (selectedId.length === 0) {
      toast.warning("Select at friend to add.");
      return;
    }
    handleAddMember(selectedId, groupId);
    toast.success(`${selectedId.length} member(s) added`);
    onClose();
  };

  const availableFriends = friendsList?.filter(
    (f) => !groupMembers.some((m) => m._id === f._id)
  );

  const filteredFriends = availableFriends.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Members
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
          placeholder="Search friends..."
          variant="outlined"
          size="small"
          className="mb-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <List dense sx={{ maxHeight: 300, overflowY: "auto" }}>
          {filteredFriends.length === 0 && (
            <Typography variant="body2" className="text-muted">
              No matching friends found.
            </Typography>
          )}

          {filteredFriends.map((friend) => (
            <ListItem
              key={friend._id}
              button
              onClick={() => handleToggle(friend._id)}
              selected={selectedId.includes(friend._id)}
              secondaryAction={
                <Checkbox
                  edge="end"
                  checked={selectedId.includes(friend._id)}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => handleToggle(friend._id)}
                />
              }
            >
              <ListItemAvatar>
                <Avatar
                  src={
                    friend?.profileImage
                      ? `${process.env.REACT_APP_API_BASE_URL}/${friend.profileImage}`
                      : "/assets/icons/profile.jpg"
                  }
                  alt={friend.name}
                />
              </ListItemAvatar>
              <ListItemText primary={friend.name} />
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={selectedId.length === 0}
        >
          Add {selectedId.length > 0 && `(${selectedId.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddMemberModal;
