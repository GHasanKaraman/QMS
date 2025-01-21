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
  Chip,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";

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
import UploadImage from "../UploadImage";

const RoastingQualityControlPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");

  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);

  const [stationState, setStationState] = useState(null);

  const [open, setOpen] = useState(false);
  const [deviationState, setDeviationState] = useState(null);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/qualitycontrol");
    if (userAuth.control(res)) {
      setStations(
        res.data.stations.filter(
          (item) =>
            item.name.includes("ROAST") && !item.name.includes("ROAST-0"),
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

  const loadProducts = async (station) => {
    const res = await axios.post("/qualitycontrol/stationplan", {
      station: station,
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

  useEffect(() => {
    loadAllStations();
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setOpen(true);
    values.product = values.product.partNum;
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);

    const formData = new FormData();
    for (const name in values) {
      if (values[name]?.constructor?.name === "Blob") {
        formData.append(name, values[name], name + ".jpeg");
      } else {
        formData.append(name, values[name]);
      }
    }

    const res = await axios.post("/roastingquality/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/roastingquality/" + res.data.form._id);
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

  const formikRequired = () => {
    var yupObjects = {};
    if (stationState === "ROAST-1") {
      yupObjects = {
        preLotCodeMixing: yup
          .string()
          .required("Please enter the pre lot code of the mixing!"),
        preLotCodeLiquid: yup
          .string()
          .required("Please enter the pre lot code of the liquid!"),
        preLotCodePowder: yup
          .string()
          .required("Please enter the pre lot code of the powder!"),
        areAllergensCorrect: yup.string().required(),
        sensoryEvaluation: yup.string().required(),
        beltSpeed: yup.string().required("Please enter the belt speed!"),
        temperature1: yup
          .string()
          .required("Please enter the temperature of the oven 1!"),
        temperature2: yup
          .string()
          .required("Please enter the temperature of the oven 2!"),
        temperature3: yup
          .string()
          .required("Please enter the temperature of the oven 3!"),
        temperature4: yup
          .string()
          .required("Please enter the temperature of the oven 4!"),
        temperature5: yup
          .string()
          .required("Please enter the temperature of the oven 5!"),
        temperature6: yup
          .string()
          .required("Please enter the temperature of the oven 6!"),
        finishedProductTemperature: yup
          .string()
          .required("Please enter the temperature of the finished product!"),
        productThickness: yup.string().required(),
        colorOfFinishedProduct: yup.string().required(),
      };
    } else if (stationState === "ROAST-M5") {
      yupObjects = {
        receivingCode: yup
          .string()
          .required("Please enter the receiving code!"),
        cleaning: yup.string().required(),
        areAllergensCorrect: yup.string().required(),
        rawProductTemperature: yup
          .string()
          .required("Please enter the temperature of raw product!"),
        drumSpeed: yup.string().required("Please enter the drum speed!"),
        salinityOfWater: yup
          .string()
          .required(
            "Please enter the percentage the of salinity of water (tank)!",
          ),
        salinityOfProduct: yup
          .string()
          .required(
            "Please enter the percentage of the salinity of finished product!",
          ),
        colorOfFinishedProduct: yup.string().required(),
        finishedProductTemperature: yup
          .string()
          .required("Please enter the temperature of the finished product!"),
        sensoryEvaluation: yup.string().required(),
      };
    } else {
      yupObjects = {
        receivingCode: yup
          .string()
          .required("Please enter the receiving code!"),
        rawProductTemperature: yup
          .string()
          .required("Please enter the temperature of raw product!"),
        cleaning: yup.string().required(),
        areAllergensCorrect: yup.string().required(),
        sensoryEvaluation: yup.string().required(),
        beltSpeed: yup.string().required("Please enter the belt speed!"),
        productThickness: yup.string().required(),
        drumSpeed: yup.string().required("Please enter the drum speed!"),
        salinityOfWater: yup
          .string()
          .required(
            "Please enter the percentage the of salinity of water (tank)!",
          ),
        colorOfFinishedProduct: yup.string().required(),
        salinityOfProduct: yup
          .string()
          .required(
            "Please enter the percentage of the salinity of finished product!",
          ),
        temperature1: yup
          .string()
          .required("Please enter the temperature of the oven 1!"),
        temperature2: yup
          .string()
          .required("Please enter the temperature of the oven 2!"),
        temperature3: yup
          .string()
          .required("Please enter the temperature of the oven 3!"),
        temperature4: yup
          .string()
          .required("Please enter the temperature of the oven 4!"),
        temperature5: yup
          .string()
          .required("Please enter the temperature of the oven 5!"),
        temperature6: yup
          .string()
          .required("Please enter the temperature of the oven 6!"),
        finishedProductTemperature: yup
          .string()
          .required("Please enter the temperature of the finished product!"),
        heatingFan1: yup
          .string()
          .required("Please enter the parameter of heating fan 1!"),
        heatingFan2: yup
          .string()
          .required("Please enter the parameter of heating fan 2!"),
        heatingFan3: yup
          .string()
          .required("Please enter the parameter of heating fan 3!"),
        heatingFan4: yup
          .string()
          .required("Please enter the parameter of heating fan 4!"),
        heatingFan5: yup
          .string()
          .required("Please enter the parameter of heating fan 5!"),
        heatingFan6: yup
          .string()
          .required("Please enter the parameter of heating fan 6!"),
        coolingFan1: yup
          .string()
          .required("Please enter the parameter of cooling fan 1!"),
        coolingFan2: yup
          .string()
          .required("Please enter the parameter of cooling fan 2!"),
        coolingFan3: yup
          .string()
          .required("Please enter the parameter of cooling fan 3!"),
        coolingFan4: yup
          .string()
          .required("Please enter the parameter of cooling fan 4!"),
        coolingFan5: yup
          .string()
          .required("Please enter the parameter of cooling fan 5!"),
        coolingFan6: yup
          .string()
          .required("Please enter the parameter of cooling fan 6!"),
      };
    }

    return yupObjects;
  };

  const formik = useFormik({
    initialValues: {
      station: null,
      product: null,
      lotCode: "",

      rawMaterialPicture: null,
      finishedProductPicture: null,

      anyDeviations: null,
      deviationID: "",

      //R1
      preLotCodeMixing: "",
      preLotCodeLiquid: "",
      preLotCodePowder: "",

      areAllergensCorrect: null,
      sensoryEvaluation: null,

      beltSpeed: "",
      temperature1: "",
      temperature2: "",
      temperature3: "",
      temperature4: "",
      temperature5: "",
      temperature6: "",
      finishedProductTemperature: "",
      productThickness: null,
      colorOfFinishedProduct: null,

      //R5
      receivingCode: "",
      cleaning: null,
      rawProductTemperature: "",
      oilParameter: "",
      saltParameter: "",
      drumSpeed: "",
      saltSpiralSpeed: "",
      salinityOfWater: "",
      salinityOfProduct: "",

      //R2-3-4
      heatingFan1: "",
      heatingFan2: "",
      heatingFan3: "",
      heatingFan4: "",
      heatingFan5: "",
      heatingFan6: "",
      coolingFan1: "",
      coolingFan2: "",
      coolingFan3: "",
      coolingFan4: "",
      coolingFan5: "",
      coolingFan6: "",
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      ...formikRequired(),
      finishedProductPicture: yup
        .mixed()
        .nullable()
        .required("Please upload the finished product!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          },
        ),
      rawMaterialPicture: yup
        .mixed()
        .nullable()
        .required("Please upload the raw product!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          },
        ),

      station: yup.string().required("Please select the station!"),
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
      lotCode: yup
        .string()
        .required("Please enter the lot code of the finished product!"),
      anyDeviations: yup.string().required(),
      deviationID:
        deviationState === "Yes"
          ? yup.string().required("You must enter deviation ID!")
          : undefined,
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
        title="Roasting Quality Control Inspection"
        subtitle="Please fill out the form"
      />
      <form
        encType="multipart/form-data"
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
              setStationState(value);
              formik.setFieldValue("product", null);
              if (value != null) {
                await loadProducts(value);
              }
            }}
            value={formik.values.station}
            sx={{ marginBottom: "30px", gridColumn: "span 2" }}
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
          <Autocomplete
            getOptionLabel={({ partNum, description }) =>
              partNum + " - " + description
            }
            disabled={products.length === 0}
            onChange={async (_, value) => {
              const station = formik.values.station;
              formik.resetForm();
              formik.setFieldValue("station", station);
              formik.setFieldValue("product", value);
              if (value != null) {
                await loadDetails(formik.values.station, value.partNum);
              }
            }}
            value={formik.values.product}
            sx={{ marginBottom: "30px", gridColumn: "span 2" }}
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
          key="R1_Questions"
          style={{
            display:
              productDetails == null ||
              productDetails?.err ||
              formik.values.product == null
                ? "none"
                : formik.values.station === "ROAST-1"
                  ? "block"
                  : "none",
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
                  QUALITY CHECKS
                </Typography>
                <Typography fontWeight={600}>9 Items</Typography>
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
                  label="Finished Product Lot Code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode}
                  name="lotCode"
                  error={!!formik.touched.lotCode && !!formik.errors.lotCode}
                  helperText={formik.touched.lotCode && formik.errors.lotCode}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Pre-Mix Lot Code (Mixing)"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.preLotCodeMixing}
                  name="preLotCodeMixing"
                  error={
                    !!formik.touched.preLotCodeMixing &&
                    !!formik.errors.preLotCodeMixing
                  }
                  helperText={
                    formik.touched.preLotCodeMixing &&
                    formik.errors.preLotCodeMixing
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Pre-Mix Lot Code (Liquid)"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.preLotCodeLiquid}
                  name="preLotCodeLiquid"
                  error={
                    !!formik.touched.preLotCodeLiquid &&
                    !!formik.errors.preLotCodeLiquid
                  }
                  helperText={
                    formik.touched.preLotCodeLiquid &&
                    formik.errors.preLotCodeLiquid
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Pre-Mix Lot Code (Powder)"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.preLotCodePowder}
                  name="preLotCodePowder"
                  error={
                    !!formik.touched.preLotCodePowder &&
                    !!formik.errors.preLotCodePowder
                  }
                  helperText={
                    formik.touched.preLotCodePowder &&
                    formik.errors.preLotCodePowder
                  }
                  sx={{ gridColumn: "span 4" }}
                />

                <Stack direction="column" spacing={2}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Are the allergens correct?
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {productDetails?.allergens === ""
                      ? "There is no allergen!"
                      : productDetails?.allergens?.split("").map((allergen) => {
                          return (
                            <Chip
                              key={allergen}
                              label={allergen}
                              variant="filled"
                              color="primary"
                              style={{
                                color: colors.contrast[300],
                                fontWeight: "bold",
                                fontSize: "13px",
                                backgroundColor: colors.contrast[100],
                                borderRadius: "5px",
                              }}
                            />
                          );
                        })}
                  </Stack>
                </Stack>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.areAllergensCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("areAllergensCorrect", value);
                  }}
                  error={
                    !!formik.touched.areAllergensCorrect &&
                    !!formik.errors.areAllergensCorrect
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Sensory Evaluation Sample OK/Sample Taken
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.sensoryEvaluation}
                  onChange={(value) => {
                    formik.setFieldValue("sensoryEvaluation", value);
                  }}
                  error={
                    !!formik.touched.sensoryEvaluation &&
                    !!formik.errors.sensoryEvaluation
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Belt Speed"
                  placeholder="0.00"
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
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is product thickness correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.productThickness}
                  onChange={(value) => {
                    formik.setFieldValue("productThickness", value);
                  }}
                  error={
                    !!formik.touched.productThickness &&
                    !!formik.errors.productThickness
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is the color of roasted finished product correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.colorOfFinishedProduct}
                  onChange={(value) => {
                    formik.setFieldValue("colorOfFinishedProduct", value);
                  }}
                  error={
                    !!formik.touched.colorOfFinishedProduct &&
                    !!formik.errors.colorOfFinishedProduct
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
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
                  SCREEN TEMPERATURES
                </Typography>
                <Typography fontWeight={600}>7 Items</Typography>
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
                  type="number"
                  aria-valuemin={2}
                  label="1st Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature1}
                  name="temperature1"
                  error={
                    !!formik.touched.temperature1 &&
                    !!formik.errors.temperature1
                  }
                  helperText={
                    formik.touched.temperature1 && formik.errors.temperature1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="2nd Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature2}
                  name="temperature2"
                  error={
                    !!formik.touched.temperature2 &&
                    !!formik.errors.temperature2
                  }
                  helperText={
                    formik.touched.temperature2 && formik.errors.temperature2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="3rd Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature3}
                  name="temperature3"
                  error={
                    !!formik.touched.temperature3 &&
                    !!formik.errors.temperature3
                  }
                  helperText={
                    formik.touched.temperature3 && formik.errors.temperature3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="4th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature4}
                  name="temperature4"
                  error={
                    !!formik.touched.temperature4 &&
                    !!formik.errors.temperature4
                  }
                  helperText={
                    formik.touched.temperature4 && formik.errors.temperature4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="5th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature5}
                  name="temperature5"
                  error={
                    !!formik.touched.temperature5 &&
                    !!formik.errors.temperature5
                  }
                  helperText={
                    formik.touched.temperature5 && formik.errors.temperature5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="6th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature6}
                  name="temperature6"
                  error={
                    !!formik.touched.temperature6 &&
                    !!formik.errors.temperature6
                  }
                  helperText={
                    formik.touched.temperature6 && formik.errors.temperature6
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Finished Product Temperature (Max 90° F)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.finishedProductTemperature}
                  name="finishedProductTemperature"
                  error={
                    !!formik.touched.finishedProductTemperature &&
                    !!formik.errors.finishedProductTemperature
                  }
                  helperText={
                    formik.touched.finishedProductTemperature &&
                    formik.errors.finishedProductTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </div>
        <div
          key="R234_Questions"
          style={{
            display:
              productDetails == null ||
              productDetails?.err ||
              formik.values.product == null
                ? "none"
                : formik.values.station === "ROAST-2" ||
                    formik.values.station === "ROAST-3" ||
                    formik.values.station === "ROAST-4"
                  ? "block"
                  : "none",
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
                  QUALITY CHECKS
                </Typography>
                <Typography fontWeight={600}>17 Items</Typography>
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
                  label="Receiving Code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.receivingCode}
                  name="receivingCode"
                  error={
                    !!formik.touched.receivingCode &&
                    !!formik.errors.receivingCode
                  }
                  helperText={
                    formik.touched.receivingCode && formik.errors.receivingCode
                  }
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  variant="filled"
                  type="text"
                  label="Finished Product Lot Code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode}
                  name="lotCode"
                  error={!!formik.touched.lotCode && !!formik.errors.lotCode}
                  helperText={formik.touched.lotCode && formik.errors.lotCode}
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Raw Product Temperature (Max 65° F or higher)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.rawProductTemperature}
                  name="rawProductTemperature"
                  error={
                    !!formik.touched.rawProductTemperature &&
                    !!formik.errors.rawProductTemperature
                  }
                  helperText={
                    formik.touched.rawProductTemperature &&
                    formik.errors.rawProductTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Cleaning by Allergen or Quality?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.cleaning}
                  onChange={(value) => {
                    formik.setFieldValue("cleaning", value);
                  }}
                  error={!!formik.touched.cleaning && !!formik.errors.cleaning}
                  options={[
                    {
                      label: "Allergen",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "Quality",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                    {
                      label: "N/A",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <Stack direction="column" spacing={2}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Are the allergens correct?
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {productDetails?.allergens === ""
                      ? "There is no allergen!"
                      : productDetails?.allergens?.split("").map((allergen) => {
                          return (
                            <Chip
                              key={allergen}
                              label={allergen}
                              variant="filled"
                              color="primary"
                              style={{
                                color: colors.contrast[300],
                                fontWeight: "bold",
                                fontSize: "13px",
                                backgroundColor: colors.contrast[100],
                                borderRadius: "5px",
                              }}
                            />
                          );
                        })}
                  </Stack>
                </Stack>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.areAllergensCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("areAllergensCorrect", value);
                  }}
                  error={
                    !!formik.touched.areAllergensCorrect &&
                    !!formik.errors.areAllergensCorrect
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Sensory Evaluation Sample OK/Sample Taken
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.sensoryEvaluation}
                  onChange={(value) => {
                    formik.setFieldValue("sensoryEvaluation", value);
                  }}
                  error={
                    !!formik.touched.sensoryEvaluation &&
                    !!formik.errors.sensoryEvaluation
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Belt Speed"
                  placeholder="0.00"
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
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is product thickness correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.productThickness}
                  onChange={(value) => {
                    formik.setFieldValue("productThickness", value);
                  }}
                  error={
                    !!formik.touched.productThickness &&
                    !!formik.errors.productThickness
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Drum Speed"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.drumSpeed}
                  name="drumSpeed"
                  error={
                    !!formik.touched.drumSpeed && !!formik.errors.drumSpeed
                  }
                  helperText={
                    formik.touched.drumSpeed && formik.errors.drumSpeed
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salt Spiral Speed"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.saltSpiralSpeed}
                  name="saltSpiralSpeed"
                  error={
                    !!formik.touched.saltSpiralSpeed &&
                    !!formik.errors.saltSpiralSpeed
                  }
                  helperText={
                    formik.touched.saltSpiralSpeed &&
                    formik.errors.saltSpiralSpeed
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salt Parameter"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.saltParameter}
                  name="saltParameter"
                  error={
                    !!formik.touched.saltParameter &&
                    !!formik.errors.saltParameter
                  }
                  helperText={
                    formik.touched.saltParameter && formik.errors.saltParameter
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Oil Parameter"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.oilParameter}
                  name="oilParameter"
                  error={
                    !!formik.touched.oilParameter &&
                    !!formik.errors.oilParameter
                  }
                  helperText={
                    formik.touched.oilParameter && formik.errors.oilParameter
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salinity of water (tank) %"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.salinityOfWater}
                  name="salinityOfWater"
                  error={
                    !!formik.touched.salinityOfWater &&
                    !!formik.errors.salinityOfWater
                  }
                  helperText={
                    formik.touched.salinityOfWater &&
                    formik.errors.salinityOfWater
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is the color of roasted finished product correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.colorOfFinishedProduct}
                  onChange={(value) => {
                    formik.setFieldValue("colorOfFinishedProduct", value);
                  }}
                  error={
                    !!formik.touched.colorOfFinishedProduct &&
                    !!formik.errors.colorOfFinishedProduct
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salinity finished product %"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.salinityOfProduct}
                  name="salinityOfProduct"
                  error={
                    !!formik.touched.salinityOfProduct &&
                    !!formik.errors.salinityOfProduct
                  }
                  helperText={
                    formik.touched.salinityOfProduct &&
                    formik.errors.salinityOfProduct
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
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
                  SCREEN TEMPERATURES
                </Typography>
                <Typography fontWeight={600}>7 Items</Typography>
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
                  type="number"
                  aria-valuemin={2}
                  label="1st Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature1}
                  name="temperature1"
                  error={
                    !!formik.touched.temperature1 &&
                    !!formik.errors.temperature1
                  }
                  helperText={
                    formik.touched.temperature1 && formik.errors.temperature1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="2nd Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature2}
                  name="temperature2"
                  error={
                    !!formik.touched.temperature2 &&
                    !!formik.errors.temperature2
                  }
                  helperText={
                    formik.touched.temperature2 && formik.errors.temperature2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="3rd Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature3}
                  name="temperature3"
                  error={
                    !!formik.touched.temperature3 &&
                    !!formik.errors.temperature3
                  }
                  helperText={
                    formik.touched.temperature3 && formik.errors.temperature3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="4th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature4}
                  name="temperature4"
                  error={
                    !!formik.touched.temperature4 &&
                    !!formik.errors.temperature4
                  }
                  helperText={
                    formik.touched.temperature4 && formik.errors.temperature4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="5th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature5}
                  name="temperature5"
                  error={
                    !!formik.touched.temperature5 &&
                    !!formik.errors.temperature5
                  }
                  helperText={
                    formik.touched.temperature5 && formik.errors.temperature5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="6th Oven"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.temperature6}
                  name="temperature6"
                  error={
                    !!formik.touched.temperature6 &&
                    !!formik.errors.temperature6
                  }
                  helperText={
                    formik.touched.temperature6 && formik.errors.temperature6
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Finished Product Temperature (Max 95° F)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.finishedProductTemperature}
                  name="finishedProductTemperature"
                  error={
                    !!formik.touched.finishedProductTemperature &&
                    !!formik.errors.finishedProductTemperature
                  }
                  helperText={
                    formik.touched.finishedProductTemperature &&
                    formik.errors.finishedProductTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
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
                  FAN SETTINGS
                </Typography>
                <Typography fontWeight={600}>12 Items</Typography>
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
                  variant="h5"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  HEATING
                </Typography>

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 1 Setting (Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan1}
                  name="heatingFan1"
                  error={
                    !!formik.touched.heatingFan1 && !!formik.errors.heatingFan1
                  }
                  helperText={
                    formik.touched.heatingFan1 && formik.errors.heatingFan1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 2 Setting(Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan2}
                  name="heatingFan2"
                  error={
                    !!formik.touched.heatingFan2 && !!formik.errors.heatingFan2
                  }
                  helperText={
                    formik.touched.heatingFan2 && formik.errors.heatingFan2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 3 Setting(Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan3}
                  name="heatingFan3"
                  error={
                    !!formik.touched.heatingFan3 && !!formik.errors.heatingFan3
                  }
                  helperText={
                    formik.touched.heatingFan3 && formik.errors.heatingFan3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 4 Setting(Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan4}
                  name="heatingFan4"
                  error={
                    !!formik.touched.heatingFan4 && !!formik.errors.heatingFan4
                  }
                  helperText={
                    formik.touched.heatingFan4 && formik.errors.heatingFan4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 5 Setting(Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan5}
                  name="heatingFan5"
                  error={
                    !!formik.touched.heatingFan5 && !!formik.errors.heatingFan5
                  }
                  helperText={
                    formik.touched.heatingFan5 && formik.errors.heatingFan5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 6 Setting(Heating)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.heatingFan6}
                  name="heatingFan6"
                  error={
                    !!formik.touched.heatingFan6 && !!formik.errors.heatingFan6
                  }
                  helperText={
                    formik.touched.heatingFan6 && formik.errors.heatingFan6
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
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  COOLING
                </Typography>

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 1 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan1}
                  name="coolingFan1"
                  error={
                    !!formik.touched.coolingFan1 && !!formik.errors.coolingFan1
                  }
                  helperText={
                    formik.touched.coolingFan1 && formik.errors.coolingFan1
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 2 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan2}
                  name="coolingFan2"
                  error={
                    !!formik.touched.coolingFan2 && !!formik.errors.coolingFan2
                  }
                  helperText={
                    formik.touched.coolingFan2 && formik.errors.coolingFan2
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 3 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan3}
                  name="coolingFan3"
                  error={
                    !!formik.touched.coolingFan3 && !!formik.errors.coolingFan3
                  }
                  helperText={
                    formik.touched.coolingFan3 && formik.errors.coolingFan3
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 4 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan4}
                  name="coolingFan4"
                  error={
                    !!formik.touched.coolingFan4 && !!formik.errors.coolingFan4
                  }
                  helperText={
                    formik.touched.coolingFan4 && formik.errors.coolingFan4
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 5 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan5}
                  name="coolingFan5"
                  error={
                    !!formik.touched.coolingFan5 && !!formik.errors.coolingFan5
                  }
                  helperText={
                    formik.touched.coolingFan5 && formik.errors.coolingFan5
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Fan 6 Setting(Cooling)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.coolingFan6}
                  name="coolingFan6"
                  error={
                    !!formik.touched.coolingFan6 && !!formik.errors.coolingFan6
                  }
                  helperText={
                    formik.touched.coolingFan6 && formik.errors.coolingFan6
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </div>

        <div
          key="R5_Questions"
          style={{
            display:
              productDetails == null ||
              productDetails?.err ||
              formik.values.product == null
                ? "none"
                : formik.values.station === "ROAST-M5"
                  ? "block"
                  : "none",
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
                  QUALITY CHECKS
                </Typography>
                <Typography fontWeight={600}>16 Items</Typography>
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
                  label="Receiving Code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.receivingCode}
                  name="receivingCode"
                  error={
                    !!formik.touched.receivingCode &&
                    !!formik.errors.receivingCode
                  }
                  helperText={
                    formik.touched.receivingCode && formik.errors.receivingCode
                  }
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  variant="filled"
                  type="text"
                  label="Finished Product Lot Code"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode}
                  name="lotCode"
                  error={!!formik.touched.lotCode && !!formik.errors.lotCode}
                  helperText={formik.touched.lotCode && formik.errors.lotCode}
                  sx={{ gridColumn: "span 4" }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Cleaning by Allergen or Quality?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.cleaning}
                  onChange={(value) => {
                    formik.setFieldValue("cleaning", value);
                  }}
                  error={!!formik.touched.cleaning && !!formik.errors.cleaning}
                  options={[
                    {
                      label: "Allergen",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "Quality",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                    {
                      label: "N/A",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <Stack direction="column" spacing={2}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Are the allergens correct?
                  </Typography>
                  <Stack direction="row" spacing={0.5}>
                    {productDetails?.allergens === ""
                      ? "There is no allergen!"
                      : productDetails?.allergens?.split("").map((allergen) => {
                          return (
                            <Chip
                              key={allergen}
                              label={allergen}
                              variant="filled"
                              color="primary"
                              style={{
                                color: colors.contrast[300],
                                fontWeight: "bold",
                                fontSize: "13px",
                                backgroundColor: colors.contrast[100],
                                borderRadius: "5px",
                              }}
                            />
                          );
                        })}
                  </Stack>
                </Stack>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.areAllergensCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("areAllergensCorrect", value);
                  }}
                  error={
                    !!formik.touched.areAllergensCorrect &&
                    !!formik.errors.areAllergensCorrect
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Raw Product Temperature (Max 65° F or higher)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.rawProductTemperature}
                  name="rawProductTemperature"
                  error={
                    !!formik.touched.rawProductTemperature &&
                    !!formik.errors.rawProductTemperature
                  }
                  helperText={
                    formik.touched.rawProductTemperature &&
                    formik.errors.rawProductTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Oil Parameter"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.oilParameter}
                  name="oilParameter"
                  error={
                    !!formik.touched.oilParameter &&
                    !!formik.errors.oilParameter
                  }
                  helperText={
                    formik.touched.oilParameter && formik.errors.oilParameter
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salt Parameter"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.saltParameter}
                  name="saltParameter"
                  error={
                    !!formik.touched.saltParameter &&
                    !!formik.errors.saltParameter
                  }
                  helperText={
                    formik.touched.saltParameter && formik.errors.saltParameter
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Drum Speed"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.drumSpeed}
                  name="drumSpeed"
                  error={
                    !!formik.touched.drumSpeed && !!formik.errors.drumSpeed
                  }
                  helperText={
                    formik.touched.drumSpeed && formik.errors.drumSpeed
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salt Spiral Speed"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.saltSpiralSpeed}
                  name="saltSpiralSpeed"
                  error={
                    !!formik.touched.saltSpiralSpeed &&
                    !!formik.errors.saltSpiralSpeed
                  }
                  helperText={
                    formik.touched.saltSpiralSpeed &&
                    formik.errors.saltSpiralSpeed
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salinity of water (tank) %"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.salinityOfWater}
                  name="salinityOfWater"
                  error={
                    !!formik.touched.salinityOfWater &&
                    !!formik.errors.salinityOfWater
                  }
                  helperText={
                    formik.touched.salinityOfWater &&
                    formik.errors.salinityOfWater
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Salinity finished product %"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.salinityOfProduct}
                  name="salinityOfProduct"
                  error={
                    !!formik.touched.salinityOfProduct &&
                    !!formik.errors.salinityOfProduct
                  }
                  helperText={
                    formik.touched.salinityOfProduct &&
                    formik.errors.salinityOfProduct
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is the color of roasted finished product correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.colorOfFinishedProduct}
                  onChange={(value) => {
                    formik.setFieldValue("colorOfFinishedProduct", value);
                  }}
                  error={
                    !!formik.touched.colorOfFinishedProduct &&
                    !!formik.errors.colorOfFinishedProduct
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Finished Product Temperature (Max 95° F)"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.finishedProductTemperature}
                  name="finishedProductTemperature"
                  error={
                    !!formik.touched.finishedProductTemperature &&
                    !!formik.errors.finishedProductTemperature
                  }
                  helperText={
                    formik.touched.finishedProductTemperature &&
                    formik.errors.finishedProductTemperature
                  }
                  sx={{ gridColumn: "span 4" }}
                  InputProps={{
                    inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Sensory Evaluation Sample OK/Sample Taken
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.sensoryEvaluation}
                  onChange={(value) => {
                    formik.setFieldValue("sensoryEvaluation", value);
                  }}
                  error={
                    !!formik.touched.sensoryEvaluation &&
                    !!formik.errors.sensoryEvaluation
                  }
                  options={[
                    {
                      label: "Yes",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "No",
                      icon: (
                        <CloseIcon
                          sx={{
                            color: colors.yoggieRed[500],
                            stroke: colors.yoggieRed[500],
                            strokeWidth: "2",
                          }}
                        />
                      ),
                    },
                  ]}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
        </div>
        <div
          key="common"
          style={{
            display:
              productDetails == null ||
              productDetails?.err ||
              formik.values.product == null
                ? "none"
                : "block",
          }}
        >
          <Accordion>
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
                  PICTURES
                </Typography>
                <Typography fontWeight={600}>2 Items</Typography>
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
                  Raw Material Picture
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.rawMaterialPicture}
                  error={
                    !!formik.touched.rawMaterialPicture &&
                    !!formik.errors.rawMaterialPicture
                  }
                  helperText={
                    formik.touched.rawMaterialPicture &&
                    formik.errors.rawMaterialPicture
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("rawMaterialPicture", blob);
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Finished Product Picture
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.finishedProductPicture}
                  error={
                    !!formik.touched.finishedProductPicture &&
                    !!formik.errors.finishedProductPicture
                  }
                  helperText={
                    formik.touched.finishedProductPicture &&
                    formik.errors.finishedProductPicture
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("finishedProductPicture", blob);
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
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
                  ANY DEVIATIONS?
                </Typography>
                <Typography fontWeight={600}>1 Items</Typography>
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
                  Any Deviations?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.anyDeviations}
                  onChange={(value) => {
                    formik.setFieldValue("anyDeviations", value);
                    setDeviationState(value);
                  }}
                  error={
                    !!formik.touched.anyDeviations &&
                    !!formik.errors.anyDeviations
                  }
                  options={[
                    {
                      label: "Yes",
                    },
                    {
                      label: "No",
                    },
                  ]}
                />
                {deviationState === "Yes" ? (
                  <TextField
                    variant="filled"
                    type="text"
                    label="Deviation ID"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.deviationID}
                    name="deviationID"
                    error={
                      !!formik.touched.deviationID &&
                      !!formik.errors.deviationID
                    }
                    helperText={
                      formik.touched.deviationID && formik.errors.deviationID
                    }
                    sx={{ gridColumn: "span 4" }}
                  />
                ) : undefined}
              </Box>
            </AccordionDetails>
          </Accordion>
        </div>
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
      </form>
    </Box>
  );
};

export default RoastingQualityControlPage;
