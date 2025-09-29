import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  Button,
  Avatar,
  Box,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  CameraAlt as CameraIcon,
} from "@mui/icons-material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAddressBook,
  faEnvelope,
  faCheck,
  faClose,
  faPen,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAuth, setUser } from "../../slices/authSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EditProfileModal = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);

  const [anchorEl, setAnchorEl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const uploadImageRef = useRef(null);
  const logoutController = useRef(null);

  const [profileData, setProfileData] = useState({
    profilename: user?.profilename || "",
    email: user?.email || "",
  });

  const [deleteProfileRef, updateProfileRef, updateDetailsRef] = [
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      updateDetailsRef.current = new AbortController();

      const formData = new FormData();
      formData.append("name", profileData.profilename);
      formData.append("email", profileData.email);

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: updateDetailsRef.current.signal,
      };

      const response = await axios.post(
        `${API_BASE_URL}/user/profile/update`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
        setIsEditing(false);
        window.location.reload();
      } else if (responseData.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  const handleProfileDelete = async () => {
    try {
      deleteProfileRef.current = new AbortController();

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: deleteProfileRef.current.signal,
      };

      const response = await axios.delete(
        `${API_BASE_URL}/user/profile/image`,
        config
      );
      const responseData = response.data;

      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
        window.location.reload();
      } else if (responseData.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  const handleProfileUpdate = async (file) => {
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
        `${API_BASE_URL}/user/profile/update-profile-image`,
        formData,
        config
      );

      const responseData = response.data;

      if (responseData.success) {
        dispatch(setUser(responseData.user || []));
        window.location.reload();
      } else if (responseData.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      if (e.response?.status === 401) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    }
  };

  const handleOption = (action) => {
    setAnchorEl(null);
    if (action === "upload") {
      uploadImageRef.current.click();
    } else if (action === "view") {
      window.open(`${API_BASE_URL}/${user.profileImage}`, "_blank");
    } else if (action === "remove") {
      handleProfileDelete();
    }
  };

  const handleLogOutClick = async () => {
    try {
      const result = await Swal.fire({
        text: "Are you sure you want to logout?",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#83C212',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, I am sure!',
        cancelButtonText: "No, cancel it!",
      });

      if (!result.isConfirmed) return;

      if (logoutController.current) {
        logoutController.current.abort();
      }

      logoutController.current = new AbortController();

      const config = {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: logoutController.current.signal,
      };

      const response = await axios.post(`${API_BASE_URL}/auth/logout`, [], config);
      const responseData = response.data;

      if (responseData.success || responseData?.logout) {
        dispatch(setAuth({ login: false, token: null }));
        navigate("/sign-in");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        Profile
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box position="relative" mb={2}>
            <Avatar
              src={
                user?.profileImage
                  ? `${API_BASE_URL}/${user.profileImage}?v=${Date.now()}`
                  : "/assets/icons/profile.jpg"
              }
              alt="Profile"
              sx={{ width: 120, height: 120 }}
            />
            <Tooltip title="Change Profile Photo">
              <IconButton
                sx={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  bgcolor: "#fff",
                  boxShadow: 1,
                }}
                onClick={(e) => setAnchorEl(e.currentTarget)}
              >
                <CameraIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <input
              type="file"
              hidden
              ref={uploadImageRef}
              onChange={(e) => handleProfileUpdate(e.target.files[0])}
            />
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem onClick={() => handleOption("upload")}>
                Upload New
              </MenuItem>
              {user?.profileImage && (
                <>
                  {/* <MenuItem onClick={() => handleOption("view")}>View</MenuItem> */}
                  <MenuItem onClick={() => handleOption("remove")}>
                    Remove
                  </MenuItem>
                </>
              )}
            </Menu>
          </Box>

          <Box width="100%">
            <Typography variant="body2" className="mb-1">
              <FontAwesomeIcon icon={faAddressBook} className="me-2" />
              Name
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="profilename"
                value={profileData.profilename}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1">
                {profileData.profilename || "-"}
              </Typography>
            )}

            <Typography variant="body2" className="mt-3 mb-1">
              <FontAwesomeIcon icon={faEnvelope} className="me-2" />
              Email
            </Typography>
            {isEditing ? (
              <TextField
                fullWidth
                name="email"
                value={profileData.email}
                onChange={handleChange}
                size="small"
              />
            ) : (
              <Typography variant="body1">
                {profileData.email || "-"}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ justifyContent: "space-between" }}>
        <Button
          color="error"
          onClick={handleLogOutClick}
          startIcon={<FontAwesomeIcon icon={faClose} />}
        >
          Logout
        </Button>

        {isEditing ? (
          <Box>
            <Button
              onClick={() => setIsEditing(false)}
              startIcon={<FontAwesomeIcon icon={faClose} />}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              startIcon={<FontAwesomeIcon icon={faCheck} />}
            >
              Save
            </Button>
          </Box>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            startIcon={<FontAwesomeIcon icon={faPen} />}
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default EditProfileModal;
