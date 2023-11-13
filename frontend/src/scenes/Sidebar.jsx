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
import baseRequest from "../core/baseRequests";

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

  const loadUser = async () => {
    const response = await baseRequest.post("/user/get", null);
    return response;
  };

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
                  Developer
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
              sx={{ m: "15px 0 5px 20px" }}
            >
              Stock
            </Typography>
            <Item
              title="Vreeland"
              to="/vreeland"
              icon={
                <SvgIcon viewBox="0 0 384 512" fontSize="1em">
                  <path d="M19.7 34.5c16.3-6.8 35 .9 41.8 17.2L192 364.8 322.5 51.7c6.8-16.3 25.5-24 41.8-17.2s24 25.5 17.2 41.8l-160 384c-5 11.9-16.6 19.7-29.5 19.7s-24.6-7.8-29.5-19.7L2.5 76.3c-6.8-16.3 .9-35 17.2-41.8z" />
                </SvgIcon>
              }
              selected={selected}
              setSelected={setSelected}
            />
            <Item
              title="Madison"
              to="/madison"
              icon={
                <SvgIcon viewBox="0 0 448 512" fontSize="1em">
                  <path d="M22.7 33.4c13.5-4.1 28.1 1.1 35.9 12.9L224 294.3 389.4 46.2c7.8-11.7 22.4-17 35.9-12.9S448 49.9 448 64V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V169.7L250.6 369.8c-5.9 8.9-15.9 14.2-26.6 14.2s-20.7-5.3-26.6-14.2L64 169.7V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 49.9 9.2 37.5 22.7 33.4z" />
                </SvgIcon>
              }
              selected={selected}
              setSelected={setSelected}
            />
            <Typography
              variant="h6"
              color={colors.grey[300]}
              sx={{ m: "15px 0 5px 20px" }}
            >
              Data
            </Typography>
            <ItemGroup
              label="Logs"
              icon={<HistoryEduOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="Output Logs"
                  parentTitle="Logs"
                  to="/logs/output"
                  icon={<OutputIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Return Logs"
                  parentTitle="Logs"
                  to="/logs/return"
                  icon={<AssignmentReturnIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Reports"
              icon={<SummarizeOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="Maintenance"
                  parentTitle="Reports"
                  to="/reports"
                  icon={<BuildIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Costs"
                  parentTitle="Reports"
                  to="/reports"
                  icon={<AttachMoneyIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Technicians"
                  parentTitle="Reports"
                  to="/reports"
                  icon={<EngineeringOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Inventory"
                  parentTitle="Reports"
                  to="/reports"
                  icon={<InventoryIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Issues"
              icon={<TroubleshootOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Issues"
                  parentTitle="Issues"
                  to="/issues/view"
                  icon={<DynamicFeedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Create Issue"
                  parentTitle="Issues"
                  to="/issues/create"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <Item
              title="Issue Monitoring"
              to="/issuemonitoring"
              icon={<MonitorOutlinedIcon />}
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
              label="Tags"
              icon={<SellOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Tags"
                  parentTitle="Tags"
                  to="/labels/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Tag"
                  parentTitle="Tags"
                  to="/labels/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Users"
              icon={<ManageAccountsIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Users"
                  parentTitle="Users"
                  to="/users/view"
                  icon={<PermContactCalendarIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add User"
                  parentTitle="Users"
                  to="/users/add"
                  icon={<PersonAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Racks"
              icon={<GridOnIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Racks"
                  parentTitle="Racks"
                  to="/racks/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Rack"
                  parentTitle="Racks"
                  to="/racks/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Locations"
              icon={<LocationOnIcon />}
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
            <ItemGroup
              label="Vendors"
              icon={<StorefrontOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Vendors"
                  parentTitle="Vendors"
                  to="/vendors/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Vendor"
                  parentTitle="Vendors"
                  to="/vendors/add"
                  icon={<AddBusinessIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Machine Types"
              icon={<RoomPreferencesOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Mach. Types"
                  parentTitle="Machine Types"
                  to="/machinetypes/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Mach. Type"
                  parentTitle="Machine Types"
                  to="/machinetypes/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Targets"
              icon={<PrecisionManufacturingOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Targets"
                  parentTitle="Targets"
                  to="/targets/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Target"
                  parentTitle="Targets"
                  to="/targets/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Fixing Methods"
              icon={<ConstructionOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Fixings"
                  parentTitle="Fixing Methods"
                  to="/fixingmethods/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Fixing"
                  parentTitle="Fixing Methods"
                  to="/fixingmethods/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
              ]}
            />
            <ItemGroup
              label="Problems"
              icon={<HelpOutlineOutlinedIcon />}
              selected={selected}
              items={[
                <Item
                  sub
                  title="View Problems"
                  parentTitle="Problems"
                  to="/problems/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="View Superiors"
                  parentTitle="Problems"
                  to="/problems/superiors/view"
                  icon={<TableViewIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Problem"
                  parentTitle="Problems"
                  to="/problems/add"
                  icon={<PostAddIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />,
                <Item
                  sub
                  title="Add Superior"
                  parentTitle="Problems"
                  to="/problems/superiors/add"
                  icon={<PostAddIcon />}
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
