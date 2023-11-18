import { useEffect, useState } from "react";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  Card,
  CardContent,
  Typography,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { toStringDate } from "../../utils/helpers";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [ratioForms, setRatioForms] = useState([]);

  const [locations, setLocations] = useState([]);
  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/dashboard");
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
      setRatioForms(res.data.ratioForms);
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
              <Stack spacing={1}>
                <div style={{ fontSize: "18px", fontWeight: "bold" }}>
                  {location.name + " " + location.type}
                </div>
                <div style={{ fontSize: "12px", color: colors.grey[200] }}>
                  {"Xth Shift  •  Started X:XX AM  •  " +
                    ratioForms.filter(
                      (ratioForm) => ratioForm.location === location.name
                    ).length +
                    " Completed Data Sheets"}
                </div>
                <Stack direction="row" spacing={1}>
                  {ratioForms
                    .filter((ratioForm) => ratioForm.location === location.name)
                    .map((ratioForm) => {
                      return (
                        <Card
                          sx={{
                            background: colors.ciboInnerGreen[500],
                            width: 200,
                            height: 75,
                          }}
                        >
                          <CardContent sx={{ paddingTop: 1 }}>
                            <Stack spacing={0}>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={colors.primary[400]}
                                sx={{ textAlign: "center" }}
                              >
                                Finished Product Ratio Form
                              </Typography>
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color={colors.primary[400]}
                                sx={{ textAlign: "center" }}
                              >
                                {toStringDate(ratioForm.createdAt, {
                                  hour: "numeric",
                                  minute: "numeric",
                                })}
                              </Typography>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                    })}
                </Stack>
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
