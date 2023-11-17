import { useEffect, useState } from "react";
import { Box, Divider, List, ListItem, Stack } from "@mui/material";
import { useTheme } from "@emotion/react";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

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
    const res = await axios.post("/home");
    if (userAuth.control(res)) {
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
    /*const res = await api.post("http://10.12.0.15:81/qac.php?stations");
    setLocations(res.data);*/
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
            <ListItem>
              <Stack>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
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
