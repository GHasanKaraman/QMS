import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment-timezone";
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

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScaleIcon from "@mui/icons-material/Scale";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import ToggleButtonCheck from "../ToggleButtonCheck";
import UploadButton from "../UploadButton";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";

const PnGQualityControlPage = (props) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([
    { name: "MAC-FW1", type: "Multipacks" },
  ]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [open, setOpen] = useState(false);

  const [xRayState, setXRayState] = useState(null);
  const [metalCardState, setMetalCardState] = useState(null);
  const [metalBallStateSingle, setMetalBallStateSingle] = useState(null);
  const [metalBallStateMultiple, setMetalBallStateMultiple] = useState(null);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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
    const formData = new FormData();
    for (const name in values) {
      formData.append(name, values[name]);
    }
    const res = await axios.post("/qualitycontrol/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        resetForm();
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
      product: null,
      areIngredientsCorrect: null,
      pictureOfProduct: null,
      isTasteAcceptable: null,
      pictureMixCode: null,
      lotCode: "",
      expirationDate: "",
      currentWeight: "",
      unitOfMeasure: null,
      isSealCorrect: null,
      isNotchCorrect: null,

      xrayRequired: null,
      xrayFeDetected: null,
      xrayNonFeDetected: null,
      xraySsDetected: null,

      metalCardRequired: null,
      metalCardFeDetected: null,
      metalCardNonFeDetected: null,
      metalCardSsDetected: null,

      metalBallSingleRequired: null,
      metalBallSingleFeDetected: null,
      metalBallSingleNonFeDetected: null,
      metalBallSingleSsDetected: null,

      metalBallMultipleRequired: null,
      metalBallMultipleFeDetected: null,
      metalBallMultipleNonFeDetected: null,
      metalBallMultipleSsDetected: null,

      correctPackaging: null,
      pictureLabelFront: null,
      pictureLabelBack: null,
      areAllergensCorrect: null,
      allergenStatement: null,
      pictureOfAllergenStatement: null,
      labelPackageCorrect: null,
      pictureOfBarcode: null,

      unitsCase: null,
      salesOrderNumber: "",
      caseLabel: null,
      pictureOfBoxLabel: null,

      anyDeviations: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      station: yup.string().required("Please select the station!"),
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
          }
        ),
      areIngredientsCorrect: yup.string().required(),
      pictureOfProduct: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the item!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
      isTasteAcceptable: yup.string().required(),
      pictureMixCode: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the mix code!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
      lotCode: yup
        .string()
        .required("Please enter the lot code of the finished product!"),
      expirationDate: yup
        .string()
        .required("Please enter the expiration date!"),
      currentWeight: yup
        .string()
        .required("Please enter the weight of the item!"),
      isSealCorrect: yup.string().required(),
      isNotchCorrect: yup.string().required(),

      xrayRequired: yup.string().required(),
      xrayFeDetected: xRayState === "Yes" ? yup.string().required() : undefined,
      xrayNonFeDetected:
        xRayState === "Yes" ? yup.string().required() : undefined,
      xraySsDetected: xRayState === "Yes" ? yup.string().required() : undefined,

      metalCardRequired: yup.string().required(),
      metalCardFeDetected:
        metalCardState === "Yes" ? yup.string().required() : undefined,
      metalCardNonFeDetected:
        metalCardState === "Yes" ? yup.string().required() : undefined,
      metalCardSsDetected:
        metalCardState === "Yes" ? yup.string().required() : undefined,

      metalBallSingleRequired: yup.string().required(),
      metalBallSingleFeDetected:
        metalBallStateSingle === "Yes" ? yup.string().required() : undefined,
      metalBallSingleNonFeDetected:
        metalBallStateSingle === "Yes" ? yup.string().required() : undefined,
      metalBallSingleSsDetected:
        metalBallStateSingle === "Yes" ? yup.string().required() : undefined,

      metalBallMultipleRequired: yup.string().required(),
      metalBallMultipleFeDetected:
        metalBallStateMultiple === "Yes" ? yup.string().required() : undefined,
      metalBallMultipleNonFeDetected:
        metalBallStateMultiple === "Yes" ? yup.string().required() : undefined,
      metalBallMultipleSsDetected:
        metalBallStateMultiple === "Yes" ? yup.string().required() : undefined,

      correctPackaging: yup.string().required(),
      pictureLabelFront: yup
        .mixed()
        .nullable()
        .required("Please upload the image of front side of the label!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
      pictureLabelBack: yup
        .mixed()
        .nullable()
        .required("Please upload the image of back side of the label!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
      areAllergensCorrect: yup.string().required(),
      allergenStatement: yup.string().required(),
      pictureOfAllergenStatement: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the allergen statement!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
      labelPackageCorrect: yup.string().required(),
      pictureOfBarcode: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the barcode")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),

      unitsCase: yup.string().required(),
      salesOrderNumber: yup.string().required(),
      caseLabel: yup.string().required(),
      pictureOfBoxLabel: yup
        .mixed()
        .nullable()
        .required("Please upload the image of the box label!")
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),

      anyDeviations: yup.string().required(),
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
      <Header title="P&G Quality Check" subtitle="Please fill out the form" />

      <form
        onSubmit={formik.handleSubmit}
        style={{ paddingBottom: "10px" }}
        encType="multipart/form-data"
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
            disabled={products.length == 0}
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  POUCH
                </Typography>
                <Typography fontWeight={600}>10 Items</Typography>
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
                  Label Inspection
                </Typography>

                <UploadButton
                  value={formik.values.pictureOfProduct}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfProduct", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfProduct: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfProduct &&
                    !!formik.errors.pictureOfProduct
                  }
                  helperText={
                    formik.touched.pictureOfProduct &&
                    formik.errors.pictureOfProduct
                  }
                />

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    slotProps={{
                      toolbar: {
                        sx: {
                          "& span.MuiDatePickerToolbar-separator": {
                            marginTop: "10px",
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .Mui-selected": {
                            background:
                              colors.ciboInnerGreen[600] + " !important",
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
                          "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                            {
                              background: colors.ciboInnerGreen[500],
                              color: colors.primary[400] + " !important",
                            },
                        },
                      },
                      textField: {
                        error:
                          !!formik.touched.expirationDate &&
                          !!formik.errors.expirationDate,
                        helperText:
                          formik.touched.expirationDate &&
                          formik.errors.expirationDate,
                      },
                    }}
                    label="Expiration Date"
                    format="MM/YYYY"
                    formatDensity="spacious"
                    value={moment(formik.values.expirationDate)}
                    onChange={(value) => {
                      if (value != null) {
                        formik.setFieldValue("expirationDate", value.format());
                      } else {
                        formik.setFieldValue("expirationDate", "");
                      }
                    }}
                    views={["year", "month"]}
                    sx={{ gridColumn: "span 4" }}
                  />
                </LocalizationProvider>

                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code"
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
                  Is the notch correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isNotchCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("isNotchCorrect", value);
                  }}
                  error={
                    !!formik.touched.isNotchCorrect &&
                    !!formik.errors.isNotchCorrect
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

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Sealing?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isNotchCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("isNotchCorrect", value);
                  }}
                  error={
                    !!formik.touched.isNotchCorrect &&
                    !!formik.errors.isNotchCorrect
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

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Current Weight"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.currentWeight}
                  name="currentWeight"
                  error={
                    !!formik.touched.currentWeight &&
                    !!formik.errors.currentWeight
                  }
                  helperText={
                    formik.touched.currentWeight && formik.errors.currentWeight
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
                  Metal Detector?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isNotchCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("isNotchCorrect", value);
                  }}
                  error={
                    !!formik.touched.isNotchCorrect &&
                    !!formik.errors.isNotchCorrect
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

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Allergen Statement
                </Typography>

                <UploadButton
                  value={formik.values.pictureOfProduct}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfProduct", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfProduct: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfProduct &&
                    !!formik.errors.pictureOfProduct
                  }
                  helperText={
                    formik.touched.pictureOfProduct &&
                    formik.errors.pictureOfProduct
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              aria-controls="panel6d-content"
              id="panel6d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  BOX
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
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Label Inspection
                </Typography>

                <UploadButton
                  value={formik.values.pictureOfProduct}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfProduct", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfProduct: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfProduct &&
                    !!formik.errors.pictureOfProduct
                  }
                  helperText={
                    formik.touched.pictureOfProduct &&
                    formik.errors.pictureOfProduct
                  }
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Current Weight"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.currentWeight}
                  name="currentWeight"
                  error={
                    !!formik.touched.currentWeight &&
                    !!formik.errors.currentWeight
                  }
                  helperText={
                    formik.touched.currentWeight && formik.errors.currentWeight
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
                  Sealing?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.allergenStatement}
                  onChange={(value) => {
                    formik.setFieldValue("allergenStatement", value);
                  }}
                  error={
                    !!formik.touched.allergenStatement &&
                    !!formik.errors.allergenStatement
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

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Allergen Statement
                </Typography>

                <UploadButton
                  value={formik.values.pictureOfAllergenStatement}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfAllergenStatement",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfAllergenStatement: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfAllergenStatement &&
                    !!formik.errors.pictureOfAllergenStatement
                  }
                  helperText={
                    formik.touched.pictureOfAllergenStatement &&
                    formik.errors.pictureOfAllergenStatement
                  }
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              aria-controls="panel7d-content"
              id="panel7d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  CASE
                </Typography>
                <Typography fontWeight={600}>4 Items</Typography>
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
                  Label Inspection
                </Typography>

                <UploadButton
                  value={formik.values.pictureOfProduct}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfProduct", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfProduct: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfProduct &&
                    !!formik.errors.pictureOfProduct
                  }
                  helperText={
                    formik.touched.pictureOfProduct &&
                    formik.errors.pictureOfProduct
                  }
                />

                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DatePicker
                    slotProps={{
                      toolbar: {
                        sx: {
                          "& span.MuiDatePickerToolbar-separator": {
                            marginTop: "10px",
                          },
                        },
                      },
                      popper: {
                        sx: {
                          "& .Mui-selected": {
                            background:
                              colors.ciboInnerGreen[600] + " !important",
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
                          "& button.MuiButtonBase-root.MuiPickersDay-root.Mui-selected":
                            {
                              background: colors.ciboInnerGreen[500],
                              color: colors.primary[400] + " !important",
                            },
                        },
                      },
                      textField: {
                        error:
                          !!formik.touched.expirationDate &&
                          !!formik.errors.expirationDate,
                        helperText:
                          formik.touched.expirationDate &&
                          formik.errors.expirationDate,
                      },
                    }}
                    label="Expiration Date"
                    format="MM/YYYY"
                    formatDensity="spacious"
                    value={moment(formik.values.expirationDate)}
                    onChange={(value) => {
                      if (value != null) {
                        formik.setFieldValue("expirationDate", value.format());
                      } else {
                        formik.setFieldValue("expirationDate", "");
                      }
                    }}
                    views={["year", "month"]}
                    sx={{ gridColumn: "span 4" }}
                  />
                </LocalizationProvider>

                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code"
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
                  Pattern
                </Typography>
                <UploadButton
                  value={formik.values.pictureOfBoxLabel}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfBoxLabel", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfBoxLabel: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfBoxLabel &&
                    !!formik.errors.pictureOfBoxLabel
                  }
                  helperText={
                    formik.touched.pictureOfBoxLabel &&
                    formik.errors.pictureOfBoxLabel
                  }
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
                  PALLET
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
                  CHEP
                </Typography>
                <UploadButton
                  value={formik.values.pictureOfBoxLabel}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfBoxLabel", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfBoxLabel: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfBoxLabel &&
                    !!formik.errors.pictureOfBoxLabel
                  }
                  helperText={
                    formik.touched.pictureOfBoxLabel &&
                    formik.errors.pictureOfBoxLabel
                  }
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

export default PnGQualityControlPage;
