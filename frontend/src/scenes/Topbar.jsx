import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Badge,
  Divider,
  useTheme,
  Stack,
  Typography,
} from "@mui/material";

import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import Settings from "@mui/icons-material/Settings";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import Logout from "@mui/icons-material/Logout";

import { ColorModeContext, tokens } from "../theme";

const Topbar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);

  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const openUser = Boolean(anchorElUser);

  const [notificationsLength, setNotificationsLength] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const handleClickUser = (event) => {
    setAnchorElUser(event.currentTarget);
  };
  const handleCloseUser = () => {
    setAnchorElUser(null);
  };


  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Box display="flex" justifyContent="space-between" p={2}>
      {/* SEARCH BAR */}
      <Box
        display="flex"
        backgroundColor={colors.primary[400]}
        borderRadius="3px"
      ></Box>

      {/* ICONS */}
      <Box display="flex">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
        <IconButton
          aria-label="noti"
          id="noti-button"
          aria-haspopup="true"
        >
          <Badge
            badgeContent={notificationsLength}
            sx={{
              "& .MuiBadge-badge": {
                fontWeight: "600",
                color: colors.primary[400],
                backgroundColor: colors.yoggieRed[500],
              },
            }}
          >
            <NotificationsOutlinedIcon color="action" />
          </Badge>
        </IconButton>
        <IconButton
          onClick={handleClickUser}
          aria-controls={openUser ? "account-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={openUser ? "true" : undefined}
        >
          <PersonOutlinedIcon />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorElUser}
        id="account-menu"
        open={openUser}
        onClose={handleCloseUser}
        onClick={handleCloseUser}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={handleCloseUser}>
          <Avatar /> Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleCloseUser}>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem
          onClick={() => {
            logout();
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      <Menu
        id="noti-menu"
        MenuListProps={{
          "aria-labelledby": "noti-button",
        }}
        PaperProps={{
          style: {
            maxHeight: 72 * 4.5,
            width: "90ch",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {notifications.map((notification, index) => {
          return (
            <MenuItem onClick={handleCloseUser} key={"menuItem" + index}>
              <Stack
                direction="row"
                justifyContent="center"
                alignItems="center"
                textAlign="center"
                gap="10px"
              >
                <Avatar src={notification.image} />
                <Typography variant="h6">{notification.description}</Typography>
              </Stack>
            </MenuItem>
          );
        })}
      </Menu>
    </Box>
  );
};

export default Topbar;
