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

import SvgIcon from "@mui/material/SvgIcon";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeed";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import RoomPreferencesOutlinedIcon from "@mui/icons-material/RoomPreferencesOutlined";
import MonitorOutlinedIcon from "@mui/icons-material/MonitorOutlined";
import SummarizeOutlinedIcon from "@mui/icons-material/SummarizeOutlined";
import HistoryEduOutlinedIcon from "@mui/icons-material/HistoryEduOutlined";
import TroubleshootOutlinedIcon from "@mui/icons-material/TroubleshootOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import TableViewIcon from "@mui/icons-material/TableView";
import PostAddIcon from "@mui/icons-material/PostAdd";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import InventoryIcon from "@mui/icons-material/Inventory";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PermContactCalendarIcon from "@mui/icons-material/PermContactCalendar";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddLocationAltIcon from "@mui/icons-material/AddLocationAlt";
import BuildIcon from "@mui/icons-material/Build";
import OutputIcon from "@mui/icons-material/Output";
import AssignmentReturnIcon from "@mui/icons-material/AssignmentReturn";
import GridOnIcon from "@mui/icons-material/GridOn";

import logo from "../images/logo.png";

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
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

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
            <img src={logo} width="75%" style={{ pointerEvents: "none" }} />
            {!isCollapsed ? (
              <Typography variant="h6" color={colors.grey[100]}>
                v2.1.0
              </Typography>
            ) : null}
          </div>
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
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
                  Gurkan
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight="600"
                  color={colors.ciboInnerGreen[500]}
                >
                  Admin Developer
                </Typography>
              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="My Quality Dashboard"
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
              Settings
            </Typography>
            <Item
              title="New Part"
              to="/newpart"
              icon={<AddCircleOutlineOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />
            <ItemGroup
              label="Locations"
              icon={<PrecisionManufacturingOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Locations"
                  parentTitle="Locations"
                  to="/locations/view"
                  icon={<MapIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Location"
                  parentTitle="Locations"
                  to="/locations/add"
                  icon={<AddLocationAltIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
