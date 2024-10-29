import { useEffect, useState } from "react";
import moment from "moment-timezone";
import {
  Box,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  Button,
  Autocomplete,
  TextField,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";

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
import { extractUniqueProducts, toStringDate } from "../../utils/helpers";
import FormCard from "../FormCard";

import noDataImage from "../../images/noData.jpg";

const SignOffPanelPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);

  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const loadAllStations = async (range) => {
    const res = await axios.post("/signoff/dashboard", range);
    if (userAuth.control(res)) {
      setLocations(
        res.data.locations.filter((location) =>
          res.data.forms.some((form) => form.station === location.name),
        ),
      );
      setForms(
        res.data.forms.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );
      setProducts(extractUniqueProducts(res.data.forms));
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };
  const handleSubmit = async (values) => {
    setLocations([]);
    setLoading(true);
    loadAllStations(values).then((_) => {
      setLoading(false);
    });
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
                setLocations([]);
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
                setLocations([]);
              }}
              minDate={
                formik.values.start === ""
                  ? null
                  : moment(formik.values.start).clone().add(1, "days")
              }
              formatDensity="spacious"
            />
            <Autocomplete
              disabled={locations.length === 0}
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
      {locations.length > 0 ? (
        <List>
          {locations
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
                        .filter(
                          (form) =>
                            form.station === location.name &&
                            productFilter(form),
                        )
                        .map((form) => {
                          return <FormCard date key={form._id} form={form} />;
                        })}
                    </Stack>
                  </Stack>
                </ListItem>,
                <Divider key={location + i} />,
              ];
            })}
        </List>
      ) : loading ? (
        <Stack p={4} alignItems="center">
          <CircularProgress size={30} />
        </Stack>
      ) : (
        <Stack alignItems="center" p={2}>
          <img src={noDataImage} alt="No Data" width={500} />
        </Stack>
      )}
    </Box>
  );
};

export default SignOffPanelPage;
