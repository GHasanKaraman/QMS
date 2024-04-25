import { useEffect, useState } from "react";
import moment from "moment-timezone";
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
  CardActions,
  Typography,
  Button,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import ModeIcon from "@mui/icons-material/Mode";

import { useFormik } from "formik";
import * as yup from "yup";

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import ContentPasteSearchIcon from "@mui/icons-material/ContentPasteSearch";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { toStringDate } from "../../utils/helpers";

const SignOffPanelPage = (props) => {
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
  const [products, setProducts] = useState([]);

  const dateTimeProps = {
    popper: {
      sx: {
        "& .Mui-selected": {
          background: colors.ciboInnerGreen[600] + " !important",
        },
        "& .Mui-selected:hover": {
          background: colors.ciboInnerGreen[700],
        },
        "& .MuiButtonBase-root:hover": {
          background: colors.ciboInnerGreen[700],
        },
        "& .MuiButtonBase-root": {
          color: colors.grey[100],
        },
      },
    },
    dialog: {
      sx: {
        "& button.Mui-selected": {
          color: colors.ciboInnerGreen[500] + " !important",
        },
        "& .Mui-selected:hover": {
          color: colors.ciboInnerGreen[700],
        },
        "& .MuiButtonBase-root:hover": {
          color: colors.ciboInnerGreen[500],
        },
        "& .MuiButtonBase-root": {
          color: colors.grey[100],
        },
        "& .MuiTabs-indicator": {
          background: colors.ciboInnerGreen[500],
        },
        "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected": {
          background: colors.ciboInnerGreen[500],
          color: colors.primary[400] + " !important",
        },
      },
    },
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const extractUniqueProducts = (...forms) => {
    return Array.from(
      new Set(forms.flatMap((item) => item.map((form) => form.product)))
    );
  };

  const loadAllStations = async (range) => {
    const res = await axios.post("/signoff/dashboard", range);
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
      setDataSource(res.data.locations);
      setRatioForms(res.data.ratioForms);
      setQualityControlForms(res.data.qualityControlForms);
      setPGQualityControlForms(res.data.pgQualityControlForms);
      setMetalDetectorForms(res.data.metalDetectorForms);
      setLabelInspectionForms(res.data.labelInspectionForms);
      setProducts(
        extractUniqueProducts(
          res.data.labelInspectionForms,
          res.data.metalDetectorForms,
          res.data.pgQualityControlForms,
          res.data.qualityControlForms
        )
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

  const getStatusColor = (form) => {
    if (form.signOffDate) {
      if (form.status === "passed") {
        return colors.ciboInnerGreen[500];
      }
      return colors.yoggieRed[500];
    } else {
      if (form.status === "passed") {
        return colors.ciboInnerGreen[300];
      }
      return colors.yoggieRed[300];
    }
  };

  const handleSubmit = async (values) => {
    await loadAllStations(values);
  };

  const formik = useFormik({
    initialValues: {
      start: "",
      end: "",
      product: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      start: yup.string().required(""),
      end: yup.string().required(""),
    }),
  });

  const productFilter = (form) => {
    if (formik.values.product) {
      if (form.product === formik.values.product) {
        return true;
      } else {
        return false;
      }
    }
    return true;
  };

  return (
    <Box m="0 20px">
      <Header title="Sign-Off Dashboard" subtitle="Locations" />

      <form
        onSubmit={(e) => {
          if (!formik.isValid && !formik.isValidating) {
            enqueueSnackbar("Please fill out all the missing fields!", {
              variant: "error",
            });
          }
          formik.handleSubmit(e);
        }}
      >
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <Stack direction="row" spacing={5} sx={{ justifyContent: "center" }}>
            <DatePicker
              closeOnSelect
              format="LL"
              timeSteps={{ hours: 1, minutes: 1 }}
              label="Start Date"
              slotProps={dateTimeProps}
              value={moment(formik.values.start)}
              onChange={(value) => {
                formik.setFieldValue("start", value.format());
                setDataSource([]);
              }}
              maxDate={
                formik.values.end === ""
                  ? null
                  : moment(formik.values.end).clone().subtract(1, "days")
              }
              formatDensity="spacious"
            />
            <DatePicker
              closeOnSelect
              format="LL"
              timeSteps={{ hours: 1, minutes: 1 }}
              label="End Date"
              slotProps={dateTimeProps}
              value={moment(formik.values.end)}
              onChange={(value) => {
                formik.setFieldValue("end", value.format());
                setDataSource([]);
              }}
              minDate={
                formik.values.start === ""
                  ? null
                  : moment(formik.values.start).clone().add(1, "days")
              }
              formatDensity="spacious"
            />
            <Autocomplete
              disabled={dataSource.length == 0}
              onChange={(_, value) => {
                formik.setFieldValue("product", value);
              }}
              value={formik.values.product}
              sx={{ marginBottom: "30px", width: "20%" }}
              options={products}
              onBlur={formik.handleBlur}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="filled"
                  label="Products"
                  name="product"
                />
              )}
            />
            <Button
              type="submit"
              variant="outlined"
              color="secondary"
              endIcon={<ContentPasteSearchIcon />}
              sx={{ fontWeight: "bold", borderWidth: "2px !important" }}
            >
              FILTER
            </Button>
          </Stack>
        </LocalizationProvider>
      </form>

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
                      console.log(location);
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
                    {ratioForms
                      .filter(
                        (ratioForm) =>
                          ratioForm.location === location.name &&
                          productFilter(ratioForm)
                      )
                      .map((ratioForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(ratioForm),
                              width: 200,
                              height: 80,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                window.open(
                                  "/ratioform/" + ratioForm._id,
                                  "_blank"
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
                                    Finished Product Ratio Form
                                  </Typography>
                                  <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    color={colors.primary[400]}
                                    sx={{ textAlign: "center" }}
                                  >
                                    {toStringDate(ratioForm.createdAt, {
                                      month: "short",
                                      year: "numeric",
                                      day: "numeric",
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
                          qualityControlForm.station === location.name &&
                          productFilter(qualityControlForm)
                      )
                      .map((qualityControlForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(qualityControlForm),
                              width: 200,
                              height: 80,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                window.open(
                                  "/qualitycontrol/" + qualityControlForm._id,
                                  "_blank"
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
                                        month: "short",
                                        year: "numeric",
                                        day: "numeric",
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
                          pgqualityControlForm.station === location.name &&
                          productFilter(pgqualityControlForm)
                      )
                      .map((pgqualityControlForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(pgqualityControlForm),
                              width: 200,
                              height: 80,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                window.open(
                                  "/pgqualitycontrol/" +
                                    pgqualityControlForm._id,
                                  "_blank"
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
                                        month: "short",
                                        year: "numeric",
                                        day: "numeric",
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
                          metalDetectorForm.station === location.name &&
                          productFilter(metalDetectorForm)
                      )
                      .map((metalDetectorForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(metalDetectorForm),
                              width: 200,
                              height: 80,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "100%" }}
                              onClick={() => {
                                window.open(
                                  "/metaldetector/" + metalDetectorForm._id,
                                  "_blank"
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
                                      month: "short",
                                      year: "numeric",
                                      day: "numeric",
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
                          labelInspectionForm.station === location.name &&
                          productFilter(labelInspectionForm)
                      )
                      .map((labelInspectionForm, i) => {
                        return (
                          <Card
                            key={i}
                            sx={{
                              background: getStatusColor(labelInspectionForm),
                              width: 200,
                              height: 80,
                            }}
                          >
                            <CardActionArea
                              sx={{ height: "50%" }}
                              onClick={() => {
                                window.open(
                                  "/labelinspection/" + labelInspectionForm._id,
                                  "_blank"
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
                                        month: "short",
                                        year: "numeric",
                                        day: "numeric",
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

export default SignOffPanelPage;
