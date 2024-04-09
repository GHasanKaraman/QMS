import { useEffect, useState } from "react";
import {
  Sidebar as ProSidebar,
  Menu,
  SubMenu,
  MenuItem,
} from "react-pro-sidebar";
import { Box, IconButton, Typography, Avatar, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";

import { tokens } from "../theme";

import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";
import BlenderIcon from "@mui/icons-material/Blender";
import RadarIcon from "@mui/icons-material/Radar";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";

import logo from "../images/logo.png";

import { userInformations } from "../atoms/userAtom";
import { useRecoilState } from "recoil";

import axios from "../api/axios";

const Item = ({ title, to, icon, selected, setSelected, sub, parentTitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  return (
    <MenuItem
      active={selected === title}
      style={{
        color: colors.grey[100],
      }}
      onClick={() => {
        if (sub) {
          setSelected(parentTitle);
        } else {
          setSelected(title);
        }
        navigate(to);
      }}
      icon={icon}
    >
      <Typography>{title}</Typography>
    </MenuItem>
  );
};

const ItemGroup = ({ label, icon, items, selected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <SubMenu
      active={selected === label}
      label={label}
      icon={icon}
      style={{
        color: colors.grey[100],
      }}
    >
      {items.map((item, index) => {
        return <div key={index}>{item}</div>;
      })}
    </SubMenu>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(
    (function () {
      const collapsed = localStorage.getItem("collapsed");
      if (collapsed === "true") {
        return true;
      }
      return false;
    })()
  );
  const [selected, setSelected] = useState("Dashboard");
  const [user, setUser] = useRecoilState(userInformations);

  const loadUser = async () => {
    const response = await axios.post("/user/get", null);
    return response;
  };

  useEffect(() => {
    if (user?.username === "") {
      loadUser().then((res) => {
        setUser({ username: res.data.username, access: res.data.access });
      });
    }
  });

  return (
    <Box
      sx={{
        "& .ps-sidebar-container": {
          background: `${colors.primary[400]} !important`,
        },
        "& .ps-submenu-content": {
          background: `${colors.primary[400]} !important`,
          borderRadius: 2,
          marginLeft: 2,
        },
        "& .ps-menu-icon": {
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .ps-menu-button:hover": {
          color: colors.ciboInnerGreen[500] + " !important",
          backgroundColor: "transparent !important",
        },
        "& .ps-menu-button.ps-active": {
          color: colors.ciboInnerGreen[400] + " !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <div style={{ width: "100%", textAlign: "center", marginTop: "5px" }}>
            <img
              src={logo}
              width="75%"
              alt="logo"
              style={{ pointerEvents: "none", marginBottom: "-15px" }}
            />
            {!isCollapsed ? (
              <Typography variant="h6" color={colors.grey[100]}>
                v0.3b
              </Typography>
            ) : null}
          </div>
          <MenuItem
            onClick={() => {
              localStorage.setItem("collapsed", !isCollapsed);
              setIsCollapsed(!isCollapsed);
            }}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}>
                  ADMINS
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <Box mb="25px">
              <Box display="flex" justifyContent="center" alignItems="center">
                <Avatar
                  sx={{ width: 100, height: 100, pointerEvents: "none" }}
                  alt=""
                  src={""}
                />
              </Box>
              <Box textAlign="center">
                <Typography
                  variant="h2"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.username}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.ciboInnerGreen[500]}
                >
                  QC
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<DashboardIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 0px", ml: isCollapsed ? "10px" : "20px" }}
            >
              Create
            </Typography>
            <Item
              title="Quality Control"
              to="/qualitycontrol"
              icon={<ContentPasteSearchIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Quality Check"
              to="/pgqualitycontrol"
              icon={<div style={{ fontWeight: "600" }}>P&G</div>}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Metal Detector"
              to="/metalDetector"
              icon={<RadarIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Label Inspection"
              to="/labelinspection"
              icon={<CollectionsBookmarkIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Ratio Form"
              to="/ratioform"
              icon={<BlenderIcon />}
              selected={selected}
              setSelected={setSelected}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
