import { useEffect, useState } from "react";
import { Box, Divider, IconButton, List, ListItem, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [locations, setLocations] = useState([]);
  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/dashboard");
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    loadAllStations();
  }, []);

  return (
    <Box m="0 20px">
      <Header title="My Quality Dashboard" subtitle="Locations" />
      <List>
        {locations.map((location) => {
          return [
            <ListItem
              key={location}
              secondaryAction={
                <IconButton
                  onClick={() => {
                    console.log(location);
                  }}
                >
                  <MenuIcon />
                </IconButton>
              }
            >
              <Stack  spacing={1}>
                <div
                  style={{ fontSize: "18px", fontWeight: "bold" }}
                >
                  {location.name + " " + location.type}
                </div>
                <div style={{ fontSize: "12px", color: colors.grey[200] }}>
                  {"1st Shift  •  Started 8:23 AM  •  2 Completed Data Sheets"}
                </div>
              </Stack>
            </ListItem>,
            <Divider />,
          ];
        })}
      </List>
    </Box>
  );
};

export default DashboardPage;
