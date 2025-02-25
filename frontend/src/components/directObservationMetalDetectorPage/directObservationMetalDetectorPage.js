import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useFormik } from "formik";
import * as yup from "yup";

import moment from "moment-timezone";

import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import { Schedule } from "@mui/icons-material";

const DirectObservationMetalDetectorPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [operators, setOperators] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/qualitycontrol");
    if (userAuth.control(res)) {
      setStations(res.data.stations);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  const loadOperators = async () => {
    const res = await axios.post("/operators");
    if (userAuth.control(res)) {
      setOperators(res.data.operators);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  const loadProducts = async (station, shift) => {
    const res = await axios.post("/qualitycontrol/stationplan", {
      station: station,
      shift: shift,
    });
    if (userAuth.control(res)) {
      setProducts(res.data.products);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  const loadDetails = async (station, product) => {
    const res = await axios.post("/qualitycontrol/getproduct", {
      station: station,
      product: product,
    });
    if (userAuth.control(res)) {
      if (res?.data) {
        setProductDetails(res.data.details);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;

          case 503:
            enqueueSnackbar("Something went wrong with the server!", {
              variant: "error",
            });
            break;
        }
      }
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
    loadOperators();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setOpen(true);

    values.product = values.product.partNum;
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);

    const res = await axios.post("/metaldetector/add", values);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/metaldetector/" + res.data.form._id);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;
          case 503:
            enqueueSnackbar("Something went wrong with the server!", {
              variant: "error",
            });
            break;
        }
      }
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      station: null,
      shift: null,
      product: null,
      lotCode: "",
      personBeingObserved: "",
      ballOrCard: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      station: yup.string().required("Please select the station!"),
      shift: yup.string().required("Please select the shift!"),
      product: yup
        .mixed()
        .nullable()
        .test(
          "PRODUCT_VALIDATION",
          "Please select the running product!",
          (value) => {
            if (value) {
              if (value?.partnum != "") {
                return true;
              }
            }
            return false;
          },
        ),
      lotCode: yup
        .string()
        .required("Please enter the lot code of the product!"),
      personBeingObserved: yup
        .string()
        .required("Please select the operator that you are observing!"),
      ballOrCard: yup.string().required(),
    }),
  });

  return (
    <Box
      m="0 20px"
      sx={{
        "& .MuiInputBase-root::after": {
          borderBottomColor: colors.ciboInnerGreen[500],
        },
        "& .MuiInputBase-root::before": {
          borderBottomColor: colors.ciboInnerGreen[600],
        },
        "& .MuiFormLabel-root.Mui-focused": {
          color: colors.ciboInnerGreen[300],
        },
      }}
    >
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Header
        title="Direct Observation Metal Detector"
        subtitle="Please fill out the form"
      />

      <form
        onSubmit={(e) => {
          if (!formik.isValid && !formik.isValidating) {
            enqueueSnackbar("Please fill out all the missing fields!", {
              variant: "error",
            });
          }
          formik.handleSubmit(e);
        }}
        style={{ paddingBottom: "10px" }}
      >
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
            "& .MuiInputBase-root::after": {
              borderBottomColor: colors.ciboInnerGreen[500],
            },
            "& .MuiInputBase-root::before": {
              borderBottomColor: colors.ciboInnerGreen[600],
            },
            "& .MuiFormLabel-root.Mui-focused": {
              color: colors.ciboInnerGreen[300],
            },
          }}
        >
          <Autocomplete
            onChange={async (_, value) => {
              formik.resetForm();
              setProductDetails(null);
              formik.setFieldValue("station", value);
              formik.setFieldValue("product", null);
              formik.setFieldValue("shift", null);
            }}
            value={formik.values.station}
            sx={{ gridColumn: "span 4" }}
            options={stations.map(({ name }) => name)}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Station"
                name="station"
                error={!!formik.touched.station && !!formik.errors.station}
                helperText={formik.touched.station && formik.errors.station}
              />
            )}
          />
          <Typography
            variant="h6"
            color={colors.grey[100]}
            fontWeight="600"
            sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
          >
            Shift
          </Typography>

          <ToggleButtonCheck
            style={{ gridColumn: "span 4" }}
            alignment={formik.values.shift}
            onChange={async (value) => {
              setProductDetails(null);
              formik.setFieldValue("shift", value);
              formik.setFieldValue("product", null);
              if (value != null) {
                await loadProducts(formik.values.station, value);
              }
            }}
            disabled={!Boolean(formik.values.station)}
            error={!!formik.touched.shift && !!formik.errors.shift}
            options={[
              {
                label: "1",
                icon: <Schedule />,
              },
              {
                label: "2",
                icon: <Schedule />,
              },
              {
                label: "3",
                icon: <Schedule />,
              },
            ]}
          />

          <Autocomplete
            getOptionLabel={({ partNum, description }) =>
              partNum + " - " + description
            }
            disabled={products.length == 0}
            onChange={async (_, value) => {
              const station = formik.values.station;
              formik.setFieldValue("product", value);
              if (value != null) {
                const details = await loadDetails(station, value.partNum);
                if (details) {
                  if (details?.soList?.length === 0) {
                    formik.setFieldValue("salesOrderNumber", "No");
                  }
                  if (details?.allergens === "") {
                    formik.setFieldValue("areAllergensCorrect", "Yes");
                  }
                }
              }
            }}
            value={formik.values.product}
            sx={{ marginBottom: "30px", gridColumn: "span 4" }}
            options={products}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Product"
                name="product"
                error={!!formik.touched.product && !!formik.errors.product}
                helperText={formik.touched.product && formik.errors.product}
              />
            )}
          />
        </Box>
        <div
          style={{
            display:
              productDetails == null ||
              productDetails?.err ||
              formik.values.product == null
                ? "none"
                : "block",
          }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary
              aria-controls="panel8d-content"
              id="panel8d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  PRODUCT INFORMATION
                </Typography>
                <Typography fontWeight={600}>5 Items</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
                  "& .MuiInputBase-root::after": {
                    borderBottomColor: colors.ciboInnerGreen[500],
                  },
                  "& .MuiInputBase-root::before": {
                    borderBottomColor: colors.ciboInnerGreen[600],
                  },
                  "& .MuiFormLabel-root.Mui-focused": {
                    color: colors.ciboInnerGreen[300],
                  },
                }}
              >
                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode}
                  name="lotCode"
                  error={!!formik.touched.lotCode && !!formik.errors.lotCode}
                  helperText={formik.touched.lotCode && formik.errors.lotCode}
                  sx={{ gridColumn: "span 4" }}
                />
                <Autocomplete
                  onChange={(_, value) => {
                    formik.setFieldValue("personBeingObserved", value);
                  }}
                  value={formik.values.personBeingObserved}
                  sx={{ marginBottom: "30px", gridColumn: "span 4" }}
                  options={operators}
                  onBlur={formik.handleBlur}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="filled"
                      label="Person Being Observed"
                      name="personBeingObserved"
                      error={
                        !!formik.touched.personBeingObserved &&
                        !!formik.errors.personBeingObserved
                      }
                      helperText={
                        formik.touched.personBeingObserved &&
                        formik.errors.personBeingObserved
                      }
                    />
                  )}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Ball or Card?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.ballOrCard}
                  onChange={(value) => {
                    formik.setFieldValue("ballOrCard", value);
                  }}
                  error={
                    !!formik.touched.ballOrCard && !!formik.errors.ballOrCard
                  }
                  options={[
                    {
                      label: "Ball",
                    },
                    {
                      label: "Card",
                    },
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Box display="flex" justifyContent="center" mt="20px">
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              sx={{ width: "100%" }}
            >
              Save
            </Button>
          </Box>
        </div>
      </form>
    </Box>
  );
};

export default DirectObservationMetalDetectorPage;
