import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Avatar,
  IconButton,
  Button,
  Typography,
  Tooltip,
  Box,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Close as CloseIcon,
  PhotoCamera,
  Delete as DeleteIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import { useRef, useState } from "react";

function GroupInfoModal({
  open,
  onClose,
  groupDetails,
  user,
  groupData,
  handleChange,
  handleSubmit,
  handleProfileUpdate,
  handleRemoveMember,
  setShowAddMemberModal,
  handleProfileDelete,
  handleDeleteGroup,
}) {
  const groupIconUploadRef = useRef(null);
  const [groupIconAnchorEl, setGroupIconAnchorEl] = useState(null);
  const [editing, setEditing] = useState(false);
  const isAdmin = groupDetails?.admin === user?._id;

  const handleGroupIconUpdate = (file) => {
    handleProfileUpdate(file, groupData._id);
  };

  const handleGroupIconOption = (action) => {
    setGroupIconAnchorEl(null);

    if (action === "upload") {
      groupIconUploadRef.current.click();
    } else if (action === "remove") {
      handleProfileDelete(groupData._id);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Group Info
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <div className="text-center mb-3">
          <Box position="relative" mb={2} display="inline-block">
            <Avatar
              src={
                groupDetails?.groupIcon
                  ? `${process.env.REACT_APP_API_BASE_URL}/${
                      groupDetails.groupIcon
                    }?v=${Date.now()}`
                  : "/assets/icons/group-placeholder.png"
              }
              alt="Group Icon"
              sx={{ width: 100, height: 100 }}
            />

            {isAdmin && (
              <>
                <Tooltip title="Change Group Icon">
                  <IconButton
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      right: 0,
                      bgcolor: "#fff",
                      boxShadow: 1,
                    }}
                    onClick={(e) => setGroupIconAnchorEl(e.currentTarget)}
                  >
                    <PhotoCamera fontSize="small" />
                  </IconButton>
                </Tooltip>

                <input
                  type="file"
                  hidden
                  ref={groupIconUploadRef}
                  onChange={(e) =>
                    e.target.files[0] &&
                    handleGroupIconUpdate(e.target.files[0])
                  }
                />

                <Menu
                  anchorEl={groupIconAnchorEl}
                  open={Boolean(groupIconAnchorEl)}
                  onClose={() => setGroupIconAnchorEl(null)}
                >
                  <MenuItem onClick={() => handleGroupIconOption("upload")}>
                    Upload New
                  </MenuItem>
                  {groupDetails?.groupIcon && (
                    <MenuItem onClick={() => handleGroupIconOption("remove")}>
                      Remove
                    </MenuItem>
                  )}
                </Menu>
              </>
            )}
          </Box>
        </div>

        {editing && isAdmin ? (
          <>
            <TextField
              fullWidth
              margin="dense"
              label="Group Name"
              name="name"
              value={groupData?.name || ""}
              onChange={handleChange}
            />
            <TextField
              fullWidth
              margin="dense"
              label="Description"
              name="groupDescription"
              multiline
              rows={3}
              value={groupData?.groupDescription || ""}
              onChange={handleChange}
            />
          </>
        ) : (
          <>
            <Typography variant="h6">{groupData?.name || "-"}</Typography>
            <Typography variant="body2" className="text-muted mb-2">
              {groupData?.groupDescription || "No description"}
            </Typography>
          </>
        )}

        {isAdmin && (
          <div className="d-flex justify-content-end mb-3">
            {editing ? (
              <>
                <Button
                  onClick={() => setEditing(false)}
                  variant="outlined"
                  size="small"
                  className="me-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleSubmit();
                    setEditing(false);
                  }}
                  variant="contained"
                  size="small"
                >
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outlined"
                size="small"
                startIcon={<EditIcon />}
                onClick={() => setEditing(true)}
              >
                Edit Info
              </Button>
            )}
          </div>
        )}

        <div className="d-flex justify-content-between align-items-center mt-4 mb-1">
          <Typography variant="subtitle1">
            Members ({groupData?.members?.length})
          </Typography>
          {isAdmin && (
            <Button
              size="small"
              onClick={() => {
                setShowAddMemberModal(true);
              }}
            >
              + Add Member
            </Button>
          )}
        </div>

        <List dense>
          {groupData?.members
            ?.slice()
            .sort((a, b) =>
              a._id === groupData?.admin
                ? -1
                : b._id === groupData?.admin
                ? 1
                : 0
            )
            .map((member) => (
              <ListItem key={member._id}>
                <ListItemAvatar>
                  <Avatar
                    src={
                      member?.profileImage
                        ? `${process.env.REACT_APP_API_BASE_URL}/${member.profileImage}`
                        : "/assets/icons/profile.jpg"
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={user._id === member._id ? "You" : member.username}
                  secondary={
                    member._id === groupData?.admin ? "Group Admin" : null
                  }
                />
                {isAdmin && member._id !== groupData.admin && (
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() =>
                        handleRemoveMember(member._id, groupData._id)
                      }
                    >
                      <DeleteIcon color="error" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            ))}
        </List>
      </DialogContent>

      <DialogActions className="d-flex">
        <div className="w-100 d-flex justify-content-between">
          {isAdmin && (
            <div className="text-end">
              <Button
                color="error"
                // variant="outlined"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to delete this group?"
                    )
                  ) {
                    handleDeleteGroup(groupData._id);
                    onClose();
                  }
                }}
              >
                Delete Group
              </Button>
            </div>
          )}
          <Button onClick={onClose} variant="text">
            Close
          </Button>
        </div>
      </DialogActions>
    </Dialog>
  );
}

export default GroupInfoModal;
