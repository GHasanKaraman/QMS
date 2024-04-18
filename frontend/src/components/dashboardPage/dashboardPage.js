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
  CardActionArea,
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
import ToggleButtonCheck from "../ToggleButtonCheck";

const DashboardPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [ratioForms, setRatioForms] = useState([]);
  const [qualityControlForms, setQualityControlForms] = useState([]);
  const [metalDetectorForms, setMetalDetectorForms] = useState([]);
  const [labelInspectionForms, setLabelInspectionForms] = useState([]);
  const [pgQualityControlForms, setPGQualityControlForms] = useState([]);

  const [locations, setLocations] = useState([]);
  const [dataSource, setDataSource] = useState([]);

  const [toggleOption, setToggleOption] = useState("All");

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/dashboard");
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
      setDataSource(res.data.locations);
      console.log(res.data.locations);
      setRatioForms(res.data.ratioForms);
      setQualityControlForms(res.data.qualityControlForms);
      setPGQualityControlForms(res.data.pgQualityControlForms);
      setMetalDetectorForms(res.data.metalDetectorForms);
      setLabelInspectionForms(res.data.labelInspectionForms);
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

  const getStatusColor = (status) => {
    if (status === "passed") {
      return colors.ciboInnerGreen[500];
    }
    return colors.yoggieRed[500];
  };

  return (
    <Box m="0 20px">
      <Header title="My Quality Dashboard" subtitle="Locations" />
      <ToggleButtonCheck
        style={{
          width: "100%",
          textAlign: "center",
          justifyContent: "center",
          alignContent: "center",
        }}
        alignment={toggleOption}
        onChange={(value) => {
          setToggleOption(value);
          if (value === "Shifts") {
            setDataSource(
              locations.filter((loc) => loc.shift && loc.shift === getShift())
            );
          } else if (value === "Runs") {
            setDataSource(
              locations.filter((loc) => loc.running && loc.running === true)
            );
          } else {
            setDataSource([...locations]);
          }
        }}
        options={[
          {
            label: "All",
          },
          {
            label: "Shifts",
          },
          {
            label: "Runs",
          },
        ]}
      />
      <List>
        {dataSource
          .filter((loc) => loc.type)
          .map((location, i) => {
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
                        if (location.shift == 1) {
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
                      const length = ratioForms.filter(
                        (ratioForm) => ratioForm.location === location.name
                      ).length;
                      if (length == 0) {
                        return "No";
                      }
                      return length;
                    })() + " Completed Data Sheets"}
                  </div>
                  <Stack direction="row" spacing={1}>
                    {ratioForms
                      .filter(
                        (ratioForm) => ratioForm.location === location.name
                      )
                      .map((ratioForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(ratioForm.status),
                              width: 200,
                              height: 75,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                navigate("/ratioform/" + ratioForm._id);
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
                            </CardActionArea>
                          </Card>
                        );
                      })}
                    {qualityControlForms
                      .filter(
                        (qualityControlForm) =>
                          qualityControlForm.station === location.name
                      )
                      .map((qualityControlForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(
                                qualityControlForm.status
                              ),
                              width: 200,
                              height: 75,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                navigate(
                                  "/qualitycontrol/" + qualityControlForm._id
                                );
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
                                    Quality Control Inspection
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={colors.primary[400]}
                                    sx={{ textAlign: "center" }}
                                  >
                                    {toStringDate(
                                      qualityControlForm.createdAt,
                                      {
                                        hour: "numeric",
                                        minute: "numeric",
                                      }
                                    )}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        );
                      })}
                    {pgQualityControlForms
                      .filter(
                        (pgqualityControlForm) =>
                          pgqualityControlForm.station === location.name
                      )
                      .map((pgqualityControlForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(
                                pgqualityControlForm.status
                              ),
                              width: 200,
                              height: 75,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                navigate(
                                  "/pgqualitycontrol/" +
                                    pgqualityControlForm._id
                                );
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
                                    P&G Quality Check
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={colors.primary[400]}
                                    sx={{ textAlign: "center" }}
                                  >
                                    {toStringDate(
                                      pgqualityControlForm.createdAt,
                                      {
                                        hour: "numeric",
                                        minute: "numeric",
                                      }
                                    )}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        );
                      })}
                    {metalDetectorForms
                      .filter(
                        (metalDetectorForm) =>
                          metalDetectorForm.station === location.name
                      )
                      .map((metalDetectorForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(
                                metalDetectorForm.status
                              ),
                              width: 200,
                              height: 75,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                navigate(
                                  "/metaldetector/" + metalDetectorForm._id
                                );
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
                                    Direct Observation Metal Detector
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={colors.primary[400]}
                                    sx={{ textAlign: "center" }}
                                  >
                                    {toStringDate(metalDetectorForm.createdAt, {
                                      hour: "numeric",
                                      minute: "numeric",
                                    })}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        );
                      })}
                    {labelInspectionForms
                      .filter(
                        (labelInspectionForm) =>
                          labelInspectionForm.station === location.name
                      )
                      .map((labelInspectionForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(
                                labelInspectionForm.status
                              ),
                              width: 200,
                              height: 75,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                navigate(
                                  "/labelinspection/" + labelInspectionForm._id
                                );
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
                                    Direct Observation Label Inspection
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={colors.primary[400]}
                                    sx={{ textAlign: "center" }}
                                  >
                                    {toStringDate(
                                      labelInspectionForm.createdAt,
                                      {
                                        hour: "numeric",
                                        minute: "numeric",
                                      }
                                    )}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </CardActionArea>
                          </Card>
                        );
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
