import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  Button,
  Typography,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

function PeopleInfoModal({ open, onClose, user }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        User Info
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            src={
              user?.profileImage
                ? `${process.env.REACT_APP_API_BASE_URL}/${user.profileImage}`
                : "/assets/icons/profile.jpg"
            }
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <Typography variant="h6">{user?.name || "Unknown User"}</Typography>
          {user?.email && (
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          )}
          {user?.status && (
            <Typography variant="caption" color="text.secondary">
              {user.status}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="text">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default PeopleInfoModal;
