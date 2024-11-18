import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  useMediaQuery,
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
import ToggleButtonCheck from "../ToggleButtonCheck";
import FormCard from "../FormCard";

import { ReactComponent as Signature } from "../../images/signature.svg";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);

  const [locations, setLocations] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const [toggleOption, setToggleOption] = useState("All");
  const [open, setOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({});

  const [options, _] = useState([
    {
      label: "All",
    },
    {
      label: "Shifts",
    },
    {
      label: "Runs",
    },
    {
      label: "MAC",
    },
    {
      label: "ROAST",
    },
    {
      label: "MIX",
    },
  ]);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/dashboard");
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
      setDataSource(res.data.locations);
      setForms(
        res.data.forms.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
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

  const getShift = () => {
    const currentHour = new Date().getHours();
    if (currentHour > 7 && currentHour < 18) {
      return 1;
    }
    return 2;
  };

  const handleChange = (value) => {
    setToggleOption(value);
    if (value === "Shifts") {
      setDataSource(
        locations.filter((loc) => loc.shift && loc.shift === getShift()),
      );
    } else if (value === "Runs") {
      setDataSource(
        locations.filter((loc) => loc.running && loc.running === true),
      );
    } else if (value === "MAC") {
      setDataSource(locations.filter((loc) => loc.name.slice(0, 3) === "MAC"));
    } else if (value === "ROAST") {
      setDataSource(
        locations.filter((loc) => loc.name.slice(0, 5) === "ROAST"),
      );
    } else if (value === "MIX") {
      setDataSource(locations.filter((loc) => loc.name.slice(0, 3) === "MIX"));
    } else {
      setDataSource([...locations]);
    }
  };

  return (
    <Box m="0 20px">
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          fontWeight={600}
          textAlign="center"
          fontSize={25}
        >
          {selectedLocation.name + " " + selectedLocation?.type}
        </DialogTitle>
        <DialogContent>
          <Stack>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {
                navigate(
                  "/runqualitydashboard/" +
                    selectedLocation.name +
                    "?type=" +
                    selectedLocation?.type,
                );
              }}
            >
              Run Quality Dashboard
            </Button>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 700, fontSize: 18 }}
              autoFocus
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Header title="My Quality Dashboard" subtitle="Locations" />
      <Stack
        width="100%"
        justifyContent="space-between"
        alignItems="center"
        direction="row"
      >
        <ToggleButtonCheck
          style={{
            width: "100%",
            textAlign: "center",
            justifyContent: "center",
            alignContent: "center",
          }}
          alignment={toggleOption}
          onChange={handleChange}
          options={options}
        />
        <IconButton
          onClick={() => {
            navigate("/signoff");
          }}
        >
          <Signature
            width={30}
            fill={colors.ciboInnerGreen[500]}
            stroke={colors.ciboInnerGreen[500]}
            strokeWidth={8}
          />
        </IconButton>
      </Stack>
      <List>
        {dataSource
          .filter((loc) => loc.type)
          .map((location, i) => {
            return [
              <ListItem
                key={location}
                secondaryAction={
                  <IconButton
                    sx={{ padding: "0 0px" }}
                    onClick={() => {
                      setSelectedLocation(location);
                      setOpen(true);
                    }}
                  >
                    <MenuIcon />
                  </IconButton>
                }
              >
                <Stack spacing={1} sx={{ width: "100%" }}>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: "bold",
                      color:
                        location?.running == true
                          ? colors.contrast[100]
                          : colors.grey[500],
                    }}
                  >
                    {location.name + " " + location.type?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: "12px", color: colors.grey[200] }}>
                    {(function () {
                      if (location.shift) {
                        if (location.shift === 1) {
                          return "1st Shift • ";
                        } else {
                          return "2nd Shift • ";
                        }
                      }
                    })()}
                    {(function () {
                      if (location.startTime) {
                        const time = toStringDate(location.startTime, {
                          hour: "numeric",
                          minute: "numeric",
                        });
                        return "Started at " + time + "  •  ";
                      }
                    })()}
                    {(function () {
                      const length = forms.filter(
                        (form) => form.station === location.name,
                      ).length;
                      if (length === 0) {
                        return "No";
                      }
                      return length;
                    })() + " Completed Data Sheets"}
                  </div>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      overflowX: "auto",
                      overflowY: "hidden",
                      "& .MuiPaper-root.MuiCard-root": {
                        overflow: "visible !important",
                      },
                      display: "webkit-flex !important",
                      padding: "10px 0",
                    }}
                  >
                    {forms
                      .filter((form) => form.station === location.name)
                      .map((form) => {
                        return <FormCard key={form._id} form={form} />;
                      })}
                  </Stack>
                </Stack>
              </ListItem>,
              <Divider key={location + i} />,
            ];
          })}
      </List>
    </Box>
  );
};

export default DashboardPage;
