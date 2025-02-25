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
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Schedule } from "@mui/icons-material";

const CCPPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([
    { name: "ROAST-M5", type: "Roasting" },
  ]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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
          default:
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

  const handleSubmit = async (values, { resetForm }) => {
    setOpen(true);
    values.product = values.product.partNum;
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);

    const res = await axios.post("/ccp/add", values);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/ccp/" + res.data.form._id);
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
          default:
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

      rawTemperature: "",
      moistureContent: "",
      chamberSet1: "",
      chamberActual1: "",
      chamberSet2: "",
      chamberActual2: "",
      chamberSet3: "",
      chamberActual3: "",
      chamberSet4: "",
      chamberActual4: "",
      chamberSet5: "",
      chamberActual5: "",
      chamberSet6: "",
      chamberActual6: "",
      chamberSet7: "",
      chamberActual7: "",
      chamberSet8: "",
      chamberActual8: "",
      fan1: "",
      fan2: "",
      fan3: "",
      fan4: "",
      fan5: "",
      fan6: "",
      fan7: "",
      fan8: "",
      zoneCooling: "",
      bedDepth: "",
      beltSpeed: "",
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
              if (value?.partnum !== "") {
                return true;
              }
            }
            return false;
          },
        ),
      rawTemperature: yup.string().required("Please enter raw temperature!"),
      moistureContent: yup
        .string()
        .required("Please enter moisture content raw!"),
      chamberSet1: yup
        .string()
        .required("Please enter set temperature of chamber 1!"),
      chamberSet2: yup
        .string()
        .required("Please enter set temperature of chamber 2!"),
      chamberSet3: yup
        .string()
        .required("Please enter set temperature of chamber 3!"),
      chamberSet4: yup
        .string()
        .required("Please enter set temperature of chamber 4!"),
      chamberSet5: yup
        .string()
        .required("Please enter set temperature of chamber 5!"),
      chamberSet6: yup
        .string()
        .required("Please enter set temperature of chamber 6!"),
      chamberSet7: yup
        .string()
        .required("Please enter set temperature of chamber 7!"),
      chamberSet8: yup
        .string()
        .required("Please enter set temperature of chamber 8!"),
      chamberActual1: yup
        .string()
        .required("Please enter actual temperature of chamber1!"),
      chamberActual2: yup
        .string()
        .required("Please enter actual temperature of chamber2!"),
      chamberActual3: yup
        .string()
        .required("Please enter actual temperature of chamber3!"),
      chamberActual4: yup
        .string()
        .required("Please enter actual temperature of chamber4!"),
      chamberActual5: yup
        .string()
        .required("Please enter actual temperature of chamber5!"),
      chamberActual6: yup
        .string()
        .required("Please enter actual temperature of chamber6!"),
      chamberActual7: yup
        .string()
        .required("Please enter actual temperature of chamber7!"),
      chamberActual8: yup
        .string()
        .required("Please enter actual temperature of chamber8!"),
      fan1: yup.string().required("Please enter the parameter of Fan 1!"),
      fan2: yup.string().required("Please enter the parameter of Fan 2!"),
      fan3: yup.string().required("Please enter the parameter of Fan 3!"),
      fan4: yup.string().required("Please enter the parameter of Fan 4!"),
      fan5: yup.string().required("Please enter the parameter of Fan 5!"),
      fan6: yup.string().required("Please enter the parameter of Fan 6!"),
      fan7: yup.string().required("Please enter the parameter of Fan 7!"),
      fan8: yup.string().required("Please enter the parameter of Fan 8!"),
      zoneCooling: yup
        .string()
        .required("Please enter the parameter of Cooling Fan!"),
      bedDepth: yup.string().required("Please enter bed depth!"),
      beltSpeed: yup.string().required("Please enter the belt speed!"),
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
        title="Parameters Inspection Form"
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
            disabled={products.length === 0}
            onChange={async (_, value) => {
              const station = formik.values.station;
              formik.setFieldValue("product", value);
              if (value != null) {
                await loadDetails(station, value.partNum);
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
                  CCP-2
                </Typography>
                <Typography fontWeight={600}>29 Items</Typography>
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
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  {"Raw temperature => 65°F"}
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Raw Temperature"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.rawTemperature}
                  name="rawTemperature"
                  error={
                    !!formik.touched.rawTemperature &&
                    !!formik.errors.rawTemperature
                  }
                  helperText={
                    formik.touched.rawTemperature &&
                    formik.errors.rawTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Moisture content Raw (4.50-6.50%)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Moisture Content Raw"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.moistureContent}
                  name="moistureContent"
                  error={
                    !!formik.touched.moistureContent &&
                    !!formik.errors.moistureContent
                  }
                  helperText={
                    formik.touched.moistureContent &&
                    formik.errors.moistureContent
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 1
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (345°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 1 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet1}
                  name="chamberSet1"
                  error={
                    !!formik.touched.chamberSet1 && !!formik.errors.chamberSet1
                  }
                  helperText={
                    formik.touched.chamberSet1 && formik.errors.chamberSet1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (320°F - 416°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 1 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual1}
                  name="chamberActual1"
                  error={
                    !!formik.touched.chamberActual1 &&
                    !!formik.errors.chamberActual1
                  }
                  helperText={
                    formik.touched.chamberActual1 &&
                    formik.errors.chamberActual1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 2
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (342°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 2 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet2}
                  name="chamberSet2"
                  error={
                    !!formik.touched.chamberSet2 && !!formik.errors.chamberSet2
                  }
                  helperText={
                    formik.touched.chamberSet2 && formik.errors.chamberSet2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (337°F - 372°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 2 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual2}
                  name="chamberActual2"
                  error={
                    !!formik.touched.chamberActual2 &&
                    !!formik.errors.chamberActual2
                  }
                  helperText={
                    formik.touched.chamberActual2 &&
                    formik.errors.chamberActual2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 3
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (342°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 3 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet3}
                  name="chamberSet3"
                  error={
                    !!formik.touched.chamberSet3 && !!formik.errors.chamberSet3
                  }
                  helperText={
                    formik.touched.chamberSet3 && formik.errors.chamberSet3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (338°F - 372°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 3 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual3}
                  name="chamberActual3"
                  error={
                    !!formik.touched.chamberActual3 &&
                    !!formik.errors.chamberActual3
                  }
                  helperText={
                    formik.touched.chamberActual3 &&
                    formik.errors.chamberActual3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 4
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (342°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 4 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet4}
                  name="chamberSet4"
                  error={
                    !!formik.touched.chamberSet4 && !!formik.errors.chamberSet4
                  }
                  helperText={
                    formik.touched.chamberSet4 && formik.errors.chamberSet4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (338°F - 356°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 4 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual4}
                  name="chamberActual4"
                  error={
                    !!formik.touched.chamberActual4 &&
                    !!formik.errors.chamberActual4
                  }
                  helperText={
                    formik.touched.chamberActual4 &&
                    formik.errors.chamberActual4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 5
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (335°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 5 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet5}
                  name="chamberSet5"
                  error={
                    !!formik.touched.chamberSet5 && !!formik.errors.chamberSet5
                  }
                  helperText={
                    formik.touched.chamberSet5 && formik.errors.chamberSet5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (334°F - 348°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 5 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual5}
                  name="chamberActual5"
                  error={
                    !!formik.touched.chamberActual5 &&
                    !!formik.errors.chamberActual5
                  }
                  helperText={
                    formik.touched.chamberActual5 &&
                    formik.errors.chamberActual5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 6
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (335°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 6 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet6}
                  name="chamberSet6"
                  error={
                    !!formik.touched.chamberSet6 && !!formik.errors.chamberSet6
                  }
                  helperText={
                    formik.touched.chamberSet6 && formik.errors.chamberSet6
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (334°F - 337°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 6 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual6}
                  name="chamberActual6"
                  error={
                    !!formik.touched.chamberActual6 &&
                    !!formik.errors.chamberActual6
                  }
                  helperText={
                    formik.touched.chamberActual6 &&
                    formik.errors.chamberActual6
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 7
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (335°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 7 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet7}
                  name="chamberSet7"
                  error={
                    !!formik.touched.chamberSet7 && !!formik.errors.chamberSet7
                  }
                  helperText={
                    formik.touched.chamberSet7 && formik.errors.chamberSet7
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (336°F - 338°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 7 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual7}
                  name="chamberActual7"
                  error={
                    !!formik.touched.chamberActual7 &&
                    !!formik.errors.chamberActual7
                  }
                  helperText={
                    formik.touched.chamberActual7 &&
                    formik.errors.chamberActual7
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Chamber 8
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Set Temp (335°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 8 Set Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberSet8}
                  name="chamberSet8"
                  error={
                    !!formik.touched.chamberSet8 && !!formik.errors.chamberSet8
                  }
                  helperText={
                    formik.touched.chamberSet8 && formik.errors.chamberSet8
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Actual Temp (337°F - 352°F)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Chamber 8 Actual Temp"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.chamberActual8}
                  name="chamberActual8"
                  error={
                    !!formik.touched.chamberActual8 &&
                    !!formik.errors.chamberActual8
                  }
                  helperText={
                    formik.touched.chamberActual8 &&
                    formik.errors.chamberActual8
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Heating
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 1 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 1"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan1}
                  name="fan1"
                  error={!!formik.touched.fan1 && !!formik.errors.fan1}
                  helperText={formik.touched.fan1 && formik.errors.fan1}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 2 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 2"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan2}
                  name="fan2"
                  error={!!formik.touched.fan2 && !!formik.errors.fan2}
                  helperText={formik.touched.fan2 && formik.errors.fan2}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 3 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 3"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan3}
                  name="fan3"
                  error={!!formik.touched.fan3 && !!formik.errors.fan3}
                  helperText={formik.touched.fan3 && formik.errors.fan3}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 4 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 4"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan4}
                  name="fan4"
                  error={!!formik.touched.fan4 && !!formik.errors.fan4}
                  helperText={formik.touched.fan4 && formik.errors.fan4}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 5 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 5"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan5}
                  name="fan5"
                  error={!!formik.touched.fan5 && !!formik.errors.fan5}
                  helperText={formik.touched.fan5 && formik.errors.fan5}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 6 (40% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 6"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan6}
                  name="fan6"
                  error={!!formik.touched.fan6 && !!formik.errors.fan6}
                  helperText={formik.touched.fan6 && formik.errors.fan6}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 7 (50% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 7"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan7}
                  name="fan7"
                  error={!!formik.touched.fan7 && !!formik.errors.fan7}
                  helperText={formik.touched.fan7 && formik.errors.fan7}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Fan 8 (50% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 8"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.fan8}
                  name="fan8"
                  error={!!formik.touched.fan8 && !!formik.errors.fan8}
                  helperText={formik.touched.fan8 && formik.errors.fan8}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{
                    m: "0 0 -20px 0",
                    minWidth: "250px",
                    gridColumn: "span 4",
                  }}
                >
                  Cooling
                </Typography>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Zone 1 - Zone 4 (55% Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Zone 1 - Zone 4"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.zoneCooling}
                  name="zoneCooling"
                  error={
                    !!formik.touched.zoneCooling && !!formik.errors.zoneCooling
                  }
                  helperText={
                    formik.touched.zoneCooling && formik.errors.zoneCooling
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Bed Depth (6.2 cm)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Bed Depth"
                  placeholder="0.0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.bedDepth}
                  name="bedDepth"
                  error={!!formik.touched.bedDepth && !!formik.errors.bedDepth}
                  helperText={formik.touched.bedDepth && formik.errors.bedDepth}
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.1 },
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Belt Speed (21 Hz)
                </Typography>
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Belt Speed"
                  placeholder="0"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.beltSpeed}
                  name="beltSpeed"
                  error={
                    !!formik.touched.beltSpeed && !!formik.errors.beltSpeed
                  }
                  helperText={
                    formik.touched.beltSpeed && formik.errors.beltSpeed
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 1 },
                  }}
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

export default CCPPage;
