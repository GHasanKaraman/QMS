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

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import ScaleIcon from "@mui/icons-material/Scale";
import BalanceIcon from "@mui/icons-material/Balance";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";

import UploadImage from "../UploadImage";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import UploadMultipleImage from "../UploadMultipleImage";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen } from "../../utils/helpers";

const QualityControlPage = (props) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [open, setOpen] = useState(false);

  const [xRayState, setXRayState] = useState(null);
  const [metalCardState, setMetalCardState] = useState(null);
  const [metalBallStateSingle, setMetalBallStateSingle] = useState(null);
  const [metalBallStateMultiple, setMetalBallStateMultiple] = useState(null);
  const [deviationState, setDeviationState] = useState(null);
  const [caseLabelState, setCaseLabelState] = useState(null);
  const [mixCodeState, setMixCodeState] = useState(null);

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

  const formOpen = async (formType, station, partNum) => {
    const res = await sendFormOpen(formType, station, partNum);
    if (userAuth.control(res)) {
      console.log("Form opened!");
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
        return res.data.details;
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;

          default:
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
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    setOpen(true);
    values.product = values.product.partNum;
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);
    values.mixCodeLength = values.pictureMixCode.length;
    const formData = new FormData();
    for (const name in values) {
      if (values[name]?.constructor?.name === "Blob") {
        formData.append(name, values[name], name + ".jpeg");
      } else if (Array.isArray(values[name])) {
        values[name].forEach((blob, index) => {
          if (blob.constructor.name === "Blob") {
            formData.append(`${name}`, blob, `${name}-${index}.jpeg`); // Use index to differentiate files
          }
        });
      } else {
        formData.append(name, values[name]);
      }
    }
    formData.append("treenuts", values.treenuts);

    const res = await axios.post("/qualitycontrol/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/qualitycontrol/" + res.data.form._id);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;
          case 405:
            enqueueSnackbar(
              "Something went wrong while saving the form. Ploease try again!",
              {
                variant: "error",
              }
            );
            break;
          default:
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

  const uploadRequired = (message) => {
    return yup
      .mixed()
      .nullable()
      .required(message)
      .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
        return !value || (value && value.size < 1024 * 1024 * 10);
      })
      .test(
        "FILE_FORMAT",
        "You can only upload JPG/JPEG/PNG files!",
        (value) => {
          return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
        }
      );
  };

  const formik = useFormik({
    initialValues: {
      station: null,
      product: null,
      shift: null,
      areIngredientsCorrect: null,
      pictureOfProduct: null,
      isTasteAcceptable: null,
      visualForeignMaterial: null,
      pictureMixCode: [],
      lotCode: "",
      expirationDate: "",
      currentWeight: "",
      unitOfMeasure: "oz",
      isSealCorrect: null,
      isNotchCorrect: null,

      xrayRequired: null,
      xrayFeDetected: null,
      xrayNonFeDetected: null,
      xraySsDetected: null,
      xrayGlass10Detected: null,
      xrayCeramic10Detected: null,
      xrayGlass7Detected: null,
      xrayCeramic8Detected: null,

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
      treenuts: [],
      allergenStatement: null,
      pictureOfAllergenStatement: null,
      labelPackageCorrect: null,
      pictureOfBarcode: null,

      unitsCase: null,
      salesOrderNumber: "",
      caseLabel: null,
      pictureOfBoxLabel: null,

      anyDeviations: null,
      deviationID: "",
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
      visualForeignMaterial: yup.string().required(),
      pictureMixCode:
        mixCodeState === "Yes"
          ? yup
              .array()
              .of(uploadRequired("Please upload pictures of raw materials!"))
              .required("You must upload at leat one image!")
              .min(1, "You must upload at least one image!")
          : undefined,
      lotCode: yup
        .string()
        .required("Please enter the lot code of the finished product!"),
      expirationDate: yup
        .string()
        .required("Please enter the expiration date!"),
      unitOfMeasure: yup.string().required(),
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
      xrayGlass7Detected:
        xRayState === "Yes" ? yup.string().required() : undefined,
      xrayCeramic8Detected:
        xRayState === "Yes" ? yup.string().required() : undefined,

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
      treenuts: productDetails?.allergens?.includes("T")
        ? yup
            .mixed()
            .nullable()
            .required("Please select the treenuts!")
            .test("SELECTION_CHECK", "Please select the treenuts!", (value) => {
              return value.length > 0;
            })
        : undefined,
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
      pictureOfBoxLabel:
        caseLabelState === "Yes"
          ? yup
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
                  return (
                    !value || (value && SUPPORTED_FORMATS.includes(value?.type))
                  );
                }
              )
          : undefined,

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
        title="Quality Control Inspection"
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
              formik.setFieldValue("shift", null);
            }}
            value={formik.values.station}
            sx={{ gridColumn: "span 4" }}
            options={stations
              .filter(
                ({ name }) => !name.includes("ROAST") && !name.includes("MIX")
              )
              .map(({ name }) => name)}
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
                await formOpen("qualityControl", station, value.partNum);
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  PRODUCT INFORMATION
                </Typography>
                <Typography fontWeight={600}>11 Items</Typography>
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
                  Are the ingredients correct?
                </Typography>

                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.areIngredientsCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("areIngredientsCorrect", value);
                  }}
                  error={
                    !!formik.touched.areIngredientsCorrect &&
                    !!formik.errors.areIngredientsCorrect
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
                  Picture of Product
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.pictureOfProduct}
                  error={
                    !!formik.touched.pictureOfProduct &&
                    !!formik.errors.pictureOfProduct
                  }
                  helperText={
                    formik.touched.pictureOfProduct &&
                    formik.errors.pictureOfProduct
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("pictureOfProduct", blob);
                  }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Is the taste acceptable or unacceptable?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isTasteAcceptable}
                  onChange={(value) => {
                    formik.setFieldValue("isTasteAcceptable", value);
                  }}
                  error={
                    !!formik.touched.isTasteAcceptable &&
                    !!formik.errors.isTasteAcceptable
                  }
                  options={[
                    {
                      label: "Acceptable",
                      icon: (
                        <CheckBoxIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "Unacceptable",
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
                  Visual Foreign Material Inspection?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.visualForeignMaterial}
                  onChange={(value) => {
                    formik.setFieldValue("visualForeignMaterial", value);
                  }}
                  error={
                    !!formik.touched.visualForeignMaterial &&
                    !!formik.errors.visualForeignMaterial
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
                  Do you have mix code?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={mixCodeState}
                  onChange={(value) => {
                    setMixCodeState(value);
                  }}
                  error={
                    !!formik.touched.mixCodeState &&
                    !!formik.errors.mixCodeState
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
                {mixCodeState === "Yes" ? (
                  <Stack direction="column" spacing={1.5}>
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="600"
                      sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                    >
                      Mix Code
                    </Typography>
                    <UploadMultipleImage
                      sx={{ gridColumn: "span 4", justifySelf: "start" }}
                      value={formik.values.pictureMixCode}
                      error={
                        !!formik.touched.pictureMixCode &&
                        !!formik.errors.pictureMixCode
                      }
                      helperText={
                        formik.touched.pictureMixCode &&
                        formik.errors.pictureMixCode
                      }
                      onChange={(blobs) => {
                        formik.setFieldValue("pictureMixCode", blobs);
                      }}
                    />
                  </Stack>
                ) : undefined}
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
                  label="Expiration Date"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.expirationDate}
                  name="expirationDate"
                  error={
                    !!formik.touched.expirationDate &&
                    !!formik.errors.expirationDate
                  }
                  helperText={
                    formik.touched.expirationDate &&
                    formik.errors.expirationDate
                  }
                  sx={{ gridColumn: "span 4" }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  What is the unit of measure?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.unitOfMeasure}
                  onChange={(value) => {
                    formik.setFieldValue("unitOfMeasure", value);
                  }}
                  error={
                    !!formik.touched.unitOfMeasure &&
                    !!formik.errors.unitOfMeasure
                  }
                  options={[
                    {
                      label: "lb",
                      icon: (
                        <ScaleIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "oz",
                      icon: (
                        <ScaleIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "gr",
                      icon: (
                        <BalanceIcon
                          sx={{
                            fill: colors.ciboInnerGreen[500],
                          }}
                        />
                      ),
                    },
                    {
                      label: "kg",
                      icon: (
                        <BalanceIcon
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
                  Is the seal correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isSealCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("isSealCorrect", value);
                  }}
                  error={
                    !!formik.touched.isSealCorrect &&
                    !!formik.errors.isSealCorrect
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
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              aria-controls="panel2d-content"
              id="panel2d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  X-RAYS METAL DETECTOR CARD CHECK
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
                  X-RAYS REQUIRED?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.xrayRequired}
                  onChange={(value) => {
                    formik.setFieldValue("xrayRequired", value);
                    setXRayState(value);
                  }}
                  error={
                    !!formik.touched.xrayRequired &&
                    !!formik.errors.xrayRequired
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
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display:
                      formik.values.xrayRequired === "Yes" ? "block" : "none",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Fe 2.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.xrayFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("xrayFeDetected", value);
                    }}
                    error={
                      !!formik.touched.xrayFeDetected &&
                      !!formik.errors.xrayFeDetected
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
                    Non-Fe 2.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.xrayNonFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("xrayNonFeDetected", value);
                    }}
                    error={
                      !!formik.touched.xrayNonFeDetected &&
                      !!formik.errors.xrayNonFeDetected
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
                    SS 2.50 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.xraySsDetected}
                    onChange={(value) => {
                      formik.setFieldValue("xraySsDetected", value);
                    }}
                    error={
                      !!formik.touched.xraySsDetected &&
                      !!formik.errors.xraySsDetected
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
                    Glass 7.0 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.xrayGlass7Detected}
                    onChange={(value) => {
                      formik.setFieldValue("xrayGlass7Detected", value);
                    }}
                    error={
                      !!formik.touched.xrayGlass7Detected &&
                      !!formik.errors.xrayGlass7Detected
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
                    Ceramic 8.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.xrayCeramic8Detected}
                    onChange={(value) => {
                      formik.setFieldValue("xrayCeramic8Detected", value);
                    }}
                    error={
                      !!formik.touched.xrayCeramic8Detected &&
                      !!formik.errors.xrayCeramic8Detected
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
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              aria-controls="panel3d-content"
              id="panel3d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  METAL DETECTOR CARDS CHECK
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
                  METAL DETECTOR CARD REQUIRED?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.metalCardRequired}
                  onChange={(value) => {
                    formik.setFieldValue("metalCardRequired", value);
                    setMetalCardState(value);
                  }}
                  error={
                    !!formik.touched.metalCardRequired &&
                    !!formik.errors.metalCardRequired
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
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display:
                      formik.values.metalCardRequired === "Yes"
                        ? "block"
                        : "none",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Fe 2.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalCardFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalCardFeDetected", value);
                    }}
                    error={
                      !!formik.touched.metalCardFeDetected &&
                      !!formik.errors.metalCardFeDetected
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
                    Non-Fe 2.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalCardNonFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalCardNonFeDetected", value);
                    }}
                    error={
                      !!formik.touched.metalCardNonFeDetected &&
                      !!formik.errors.metalCardNonFeDetected
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
                    SS 2.50 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalCardSsDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalCardSsDetected", value);
                    }}
                    error={
                      !!formik.touched.metalCardSsDetected &&
                      !!formik.errors.metalCardSsDetected
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
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary
              aria-controls="panel4d-content"
              id="panel4d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  METAL DETECTOR BALLS CHECK
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
                  METAL DETECTOR BALL REQUIRED?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.metalBallSingleRequired}
                  onChange={(value) => {
                    formik.setFieldValue("metalBallSingleRequired", value);
                    setMetalBallStateSingle(value);
                  }}
                  error={
                    !!formik.touched.metalBallSingleRequired &&
                    !!formik.errors.metalBallSingleRequired
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
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display:
                      formik.values.metalBallSingleRequired === "Yes"
                        ? "block"
                        : "none",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Fe 3.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallSingleFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalBallSingleFeDetected", value);
                    }}
                    error={
                      !!formik.touched.metalBallSingleFeDetected &&
                      !!formik.errors.metalBallSingleFeDetected
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
                    Non-Fe 4.50 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallSingleNonFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue(
                        "metalBallSingleNonFeDetected",
                        value
                      );
                    }}
                    error={
                      !!formik.touched.metalBallSingleNonFeDetected &&
                      !!formik.errors.metalBallSingleNonFeDetected
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
                    SS 3.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallSingleSsDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalBallSingleSsDetected", value);
                    }}
                    error={
                      !!formik.touched.metalBallSingleSsDetected &&
                      !!formik.errors.metalBallSingleSsDetected
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
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary
              aria-controls="panel4d-content"
              id="panel4d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  METAL DETECTOR BALLS CHECK (If machine is required)
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
                  METAL DETECTOR BALL REQUIRED?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.metalBallMultipleRequired}
                  onChange={(value) => {
                    formik.setFieldValue("metalBallMultipleRequired", value);
                    setMetalBallStateMultiple(value);
                  }}
                  error={
                    !!formik.touched.metalBallMultipleRequired &&
                    !!formik.errors.metalBallMultipleRequired
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
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display:
                      formik.values.metalBallMultipleRequired === "Yes"
                        ? "block"
                        : "none",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Fe 3.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallMultipleFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue(
                        "metalBallMultipleFeDetected",
                        value
                      );
                    }}
                    error={
                      !!formik.touched.metalBallMultipleFeDetected &&
                      !!formik.errors.metalBallMultipleFeDetected
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
                    Non-Fe 4.50 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallMultipleNonFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue(
                        "metalBallMultipleNonFeDetected",
                        value
                      );
                    }}
                    error={
                      !!formik.touched.metalBallMultipleNonFeDetected &&
                      !!formik.errors.metalBallMultipleNonFeDetected
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
                    SS 3.00 mm detected?
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.metalBallMultipleSsDetected}
                    onChange={(value) => {
                      formik.setFieldValue(
                        "metalBallMultipleSsDetected",
                        value
                      );
                    }}
                    error={
                      !!formik.touched.metalBallMultipleSsDetected &&
                      !!formik.errors.metalBallMultipleSsDetected
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
                </Stack>
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
                  LABEL INSPECTION (CCP)
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
                  Correct Packaging?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.correctPackaging}
                  onChange={(value) => {
                    formik.setFieldValue("correctPackaging", value);
                  }}
                  error={
                    !!formik.touched.correctPackaging &&
                    !!formik.errors.correctPackaging
                  }
                  options={[
                    {
                      label: "Bag",
                    },
                    {
                      label: "Box",
                    },
                    {
                      label: "Container",
                    },
                    {
                      label: "Jar",
                    },
                  ]}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture(Front)
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.pictureLabelFront}
                  error={
                    !!formik.touched.pictureLabelFront &&
                    !!formik.errors.pictureLabelFront
                  }
                  helperText={
                    formik.touched.pictureLabelFront &&
                    formik.errors.pictureLabelFront
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("pictureLabelFront", blob);
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture(Back)
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.pictureLabelBack}
                  error={
                    !!formik.touched.pictureLabelBack &&
                    !!formik.errors.pictureLabelBack
                  }
                  helperText={
                    formik.touched.pictureLabelBack &&
                    formik.errors.pictureLabelBack
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("pictureLabelBack", blob);
                  }}
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
                    {productDetails?.allergens === "" ? (
                      <div style={{ fontWeight: 600 }}>
                        {" "}
                        There is no allergen!
                      </div>
                    ) : (
                      productDetails?.allergens?.split("").map((allergen) => {
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
                      })
                    )}
                  </Stack>
                </Stack>
                {productDetails?.allergens === "" ? (
                  <div style={{ gridColumn: "span 4" }} />
                ) : (
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
                )}
                {productDetails?.allergens?.includes("T") ? (
                  <Autocomplete
                    multiple
                    disableCloseOnSelect
                    onChange={async (_, value) => {
                      formik.setFieldValue("treenuts", value);
                    }}
                    value={formik.values.treenuts}
                    sx={{ marginBottom: "30px", gridColumn: "span 4" }}
                    options={[
                      "Pecan",
                      "Almond",
                      "Walnut",
                      "Pistachio",
                      "Hazelnut",
                      "Pine Nut",
                      "Brazil Nut",
                      "Coconut",
                      " Cashew",
                      "Macadamia",
                    ]}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        label="Tree Nuts"
                        name="treenuts"
                        error={
                          !!formik.touched.treenuts && !!formik.errors.treenuts
                        }
                        helperText={
                          formik.touched.treenuts && formik.errors.treenuts
                        }
                      />
                    )}
                  />
                ) : undefined}
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Allergen Statement?
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
                  Picture of Allergen Statement
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.pictureOfAllergenStatement}
                  error={
                    !!formik.touched.pictureOfAllergenStatement &&
                    !!formik.errors.pictureOfAllergenStatement
                  }
                  helperText={
                    formik.touched.pictureOfAllergenStatement &&
                    formik.errors.pictureOfAllergenStatement
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("pictureOfAllergenStatement", blob);
                  }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Label/Package Correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.labelPackageCorrect}
                  onChange={(value) => {
                    formik.setFieldValue("labelPackageCorrect", value);
                  }}
                  error={
                    !!formik.touched.labelPackageCorrect &&
                    !!formik.errors.labelPackageCorrect
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
                  Picture of Barcode
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.pictureOfBarcode}
                  error={
                    !!formik.touched.pictureOfBarcode &&
                    !!formik.errors.pictureOfBarcode
                  }
                  helperText={
                    formik.touched.pictureOfBarcode &&
                    formik.errors.pictureOfBarcode
                  }
                  onChange={(blob) => {
                    formik.setFieldValue("pictureOfBarcode", blob);
                  }}
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
                  CASE INFORMATION
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
                  {"Is case pack count "}
                  <span
                    style={{
                      fontWeight: "bold",
                      fontSize: "15px",
                      border: "2px solid",
                      borderColor: colors.ciboInnerGreen[500],
                      padding: "1px",
                    }}
                  >
                    {productDetails?.casePack}
                  </span>
                  <span>{" ?"}</span>
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.unitsCase}
                  onChange={(value) => {
                    formik.setFieldValue("unitsCase", value);
                  }}
                  error={
                    !!formik.touched.unitsCase && !!formik.errors.unitsCase
                  }
                  options={[
                    {
                      label: "Yes",
                    },
                    {
                      label: "No",
                    },
                    {
                      label: "N/A",
                    },
                  ]}
                />
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display:
                      productDetails?.soList?.length == 0 ? "none" : "block",
                    gridColumn: "span 4",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "360px" }}
                  >
                    Is sales order number one of these? (If not, please select
                    No)
                  </Typography>
                  <ToggleButtonCheck
                    style={{ gridColumn: "span 4" }}
                    alignment={formik.values.salesOrderNumber}
                    onChange={(value) => {
                      formik.setFieldValue("salesOrderNumber", value);
                    }}
                    error={
                      !!formik.touched.salesOrderNumber &&
                      !!formik.errors.salesOrderNumber
                    }
                    options={productDetails?.soList
                      ?.map((so) => {
                        return { label: so };
                      })
                      .concat([
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
                      ])}
                  />
                </Stack>
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Case Label?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.caseLabel}
                  onChange={(value) => {
                    formik.setFieldValue("caseLabel", value);
                    setCaseLabelState(value);
                  }}
                  error={
                    !!formik.touched.caseLabel && !!formik.errors.caseLabel
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
                <Stack
                  direction="column"
                  spacing={1.5}
                  style={{
                    display: caseLabelState === "Yes" ? "block" : "none",
                  }}
                >
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Picture of Box-Label
                  </Typography>

                  <UploadImage
                    sx={{ gridColumn: "span 4", justifySelf: "start" }}
                    value={formik.values.pictureOfBoxLabel}
                    error={
                      !!formik.touched.pictureOfBoxLabel &&
                      !!formik.errors.pictureOfBoxLabel
                    }
                    helperText={
                      formik.touched.pictureOfBoxLabel &&
                      formik.errors.pictureOfBoxLabel
                    }
                    onChange={(blob) => {
                      formik.setFieldValue("pictureOfBoxLabel", blob);
                    }}
                  />
                </Stack>
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

export default QualityControlPage;
