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
} from "@mui/material";

import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";

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

const PGQualityControlPage = (props) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, _] = useState([{ name: "MAC-FW1", type: "Multipacks" }]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  const [open, setOpen] = useState(false);

  const [metalBallState, setMetalBallState] = useState(null);

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
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);

    const formData = new FormData();
    for (const name in values) {
      formData.append(name, values[name]);
    }
    const res = await axios.post("/pgqualitycontrol/add", formData);
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

      rawProduct: null,
      areIngredientsCorrect: null,
      pictureOfLabelInspectionPouch: null,
      pictureOfExpiration: null,
      expirationDatePouch: "",
      lotCodePouch: "",
      currentWeightPouch: "",
      isNotchCorrect: null,
      isSealCorrectPouch: null,

      metalDetector: null,
      metalBallFeDetected: null,
      metalBallNonFeDetected: null,
      metalBallSsDetected: null,

      pictureOfAllergenStatementPouch: null,
      pictureOfPanningBatch: null,
      pictureOfSugarShelledBatch: null,

      pictureOfLabelInspectionFront: null,
      pictureOfLabelInspectionBack: null,
      currentWeightBox: "",
      isSealCorrectBox: null,
      pictureOfAllergenStatementBox: null,

      pictureOfLabelInspectionCase: null,
      expirationDateCase: "",
      lotCodeCase: "",
      pictureOfPattern: null,

      pictureOfChep: null,
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
      rawProduct: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the raw product!")
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
      pictureOfLabelInspectionPouch: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the product!")
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
      pictureOfExpiration: yup
        .mixed()
        .nullable()
        .required(
          "Please upload the picture of the expiration date on the pouch!"
        )
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
      expirationDatePouch: yup
        .string()
        .required("Please enter the expiration date!"),
      lotCodePouch: yup
        .string()
        .required("Please enter the lot code of the product!"),
      currentWeightPouch: yup
        .string()
        .required("Please enter the weight of the pouch!"),
      isSealCorrectPouch: yup.string().required(),
      isNotchCorrect: yup.string().required(),

      metalDetector: yup.string().required(),
      metalBallFeDetected:
        metalBallState === "Yes" ? yup.string().required() : undefined,
      metalBallNonFeDetected:
        metalBallState === "Yes" ? yup.string().required() : undefined,
      metalBallSsDetected:
        metalBallState === "Yes" ? yup.string().required() : undefined,

      pictureOfAllergenStatementPouch: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the allergen statement!")
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
      pictureOfPanningBatch: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the panning batch!")
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
      pictureOfSugarShelledBatch: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the sugar shelled batch!")
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

      pictureOfLabelInspectionFront: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the label!")
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
      pictureOfLabelInspectionBack: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the label!")
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
      currentWeightBox: yup
        .string()
        .required("Please enter the weight of the box!"),
      isSealCorrectBox: yup.string().required(),
      pictureOfAllergenStatementBox: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the allergen statement!")
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

      pictureOfLabelInspectionCase: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the label!")
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
      expirationDateCase: yup
        .string()
        .required("Please enter the expiration date on the case!"),
      lotCodeCase: yup
        .string()
        .required("Please enter the lot code of the case!"),
      pictureOfPattern: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the case pattern!")
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

      pictureOfChep: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the pallet label!")
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
                  alignment={formik.values.metalDetector}
                  onChange={(value) => {
                    formik.setFieldValue("metalDetector", value);
                    setMetalBallState(value);
                  }}
                  error={
                    !!formik.touched.metalDetector &&
                    !!formik.errors.metalDetector
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
                      formik.values.metalDetector === "Yes" ? "block" : "none",
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
                    alignment={formik.values.metalBallFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalBallFeDetected", value);
                    }}
                    error={
                      !!formik.touched.metalBallFeDetected &&
                      !!formik.errors.metalBallFeDetected
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
                    alignment={formik.values.metalBallNonFeDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalBallNonFeDetected", value);
                    }}
                    error={
                      !!formik.touched.metalBallNonFeDetected &&
                      !!formik.errors.metalBallNonFeDetected
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
                    alignment={formik.values.metalBallSsDetected}
                    onChange={(value) => {
                      formik.setFieldValue("metalBallSsDetected", value);
                    }}
                    error={
                      !!formik.touched.metalBallSsDetected &&
                      !!formik.errors.metalBallSsDetected
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
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  POUCH
                </Typography>
                <Typography fontWeight={600}>13 Items</Typography>
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
                  Raw Product
                </Typography>

                <UploadButton
                  value={formik.values.rawProduct}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("rawProduct", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        rawProduct: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.rawProduct && !!formik.errors.rawProduct
                  }
                  helperText={
                    formik.touched.rawProduct && formik.errors.rawProduct
                  }
                />

                <Stack spacing={2} direction="row">
                  <Stack spacing={1.5}>
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="600"
                      sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                    >
                      Label Inspection
                    </Typography>

                    <UploadButton
                      value={formik.values.pictureOfLabelInspectionPouch}
                      onFileChange={async function (fileObject, fileState) {
                        await formik.setFieldValue(
                          "pictureOfLabelInspectionPouch",
                          fileObject
                        );
                        if (fileState) {
                          await formik.setTouched({
                            ...formik.touched,
                            pictureOfLabelInspectionPouch: true,
                          });
                        }
                      }}
                      error={
                        !!formik.touched.pictureOfLabelInspectionPouch &&
                        !!formik.errors.pictureOfLabelInspectionPouch
                      }
                      helperText={
                        formik.touched.pictureOfLabelInspectionPouch &&
                        formik.errors.pictureOfLabelInspectionPouch
                      }
                    />
                  </Stack>
                  <Stack spacing={1.5}>
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="600"
                      sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                    >
                      Picture of Expiration Date
                    </Typography>

                    <UploadButton
                      value={formik.values.pictureOfExpiration}
                      onFileChange={async function (fileObject, fileState) {
                        await formik.setFieldValue(
                          "pictureOfExpiration",
                          fileObject
                        );
                        if (fileState) {
                          await formik.setTouched({
                            ...formik.touched,
                            pictureOfExpiration: true,
                          });
                        }
                      }}
                      error={
                        !!formik.touched.pictureOfExpiration &&
                        !!formik.errors.pictureOfExpiration
                      }
                      helperText={
                        formik.touched.pictureOfExpiration &&
                        formik.errors.pictureOfExpiration
                      }
                    />
                  </Stack>
                </Stack>

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
                          !!formik.touched.expirationDatePouch &&
                          !!formik.errors.expirationDatePouch,
                        helperText:
                          formik.touched.expirationDatePouch &&
                          formik.errors.expirationDatePouch,
                      },
                    }}
                    label="Expiration Date"
                    format="MM/YYYY"
                    formatDensity="spacious"
                    value={moment(formik.values.expirationDatePouch)}
                    onChange={(value) => {
                      if (value != null) {
                        formik.setFieldValue(
                          "expirationDatePouch",
                          value.format()
                        );
                      } else {
                        formik.setFieldValue("expirationDatePouch", "");
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
                  value={formik.values.lotCodePouch}
                  name="lotCodePouch"
                  error={
                    !!formik.touched.lotCodePouch &&
                    !!formik.errors.lotCodePouch
                  }
                  helperText={
                    formik.touched.lotCodePouch && formik.errors.lotCodePouch
                  }
                  sx={{ gridColumn: "span 4" }}
                />

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Current Weight"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.currentWeightPouch}
                  name="currentWeightPouch"
                  error={
                    !!formik.touched.currentWeightPouch &&
                    !!formik.errors.currentWeightPouch
                  }
                  helperText={
                    formik.touched.currentWeightPouch &&
                    formik.errors.currentWeightPouch
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
                  Is sealing correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isSealCorrectPouch}
                  onChange={(value) => {
                    formik.setFieldValue("isSealCorrectPouch", value);
                  }}
                  error={
                    !!formik.touched.isSealCorrectPouch &&
                    !!formik.errors.isSealCorrectPouch
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
                  value={formik.values.pictureOfAllergenStatementPouch}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfAllergenStatementPouch",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfAllergenStatementPouch: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfAllergenStatementPouch &&
                    !!formik.errors.pictureOfAllergenStatementPouch
                  }
                  helperText={
                    formik.touched.pictureOfAllergenStatementPouch &&
                    formik.errors.pictureOfAllergenStatementPouch
                  }
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Panning Batch
                </Typography>
                <UploadButton
                  value={formik.values.pictureOfPanningBatch}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfPanningBatch",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfPanningBatch: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfPanningBatch &&
                    !!formik.errors.pictureOfPanningBatch
                  }
                  helperText={
                    formik.touched.pictureOfPanningBatch &&
                    formik.errors.pictureOfPanningBatch
                  }
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Sugar Shelled Batch
                </Typography>
                <UploadButton
                  value={formik.values.pictureOfSugarShelledBatch}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfSugarShelledBatch",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfSugarShelledBatch: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfSugarShelledBatch &&
                    !!formik.errors.pictureOfSugarShelledBatch
                  }
                  helperText={
                    formik.touched.pictureOfSugarShelledBatch &&
                    formik.errors.pictureOfSugarShelledBatch
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
                <Stack spacing={2} direction="row">
                  <Stack spacing={1.5}>
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="600"
                      sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                    >
                      Label Inspection
                    </Typography>
                    <UploadButton
                      value={formik.values.pictureOfLabelInspectionFront}
                      onFileChange={async function (fileObject, fileState) {
                        await formik.setFieldValue(
                          "pictureOfLabelInspectionFront",
                          fileObject
                        );
                        if (fileState) {
                          await formik.setTouched({
                            ...formik.touched,
                            pictureOfLabelInspectionFront: true,
                          });
                        }
                      }}
                      error={
                        !!formik.touched.pictureOfLabelInspectionFront &&
                        !!formik.errors.pictureOfLabelInspectionFront
                      }
                      helperText={
                        formik.touched.pictureOfLabelInspectionFront &&
                        formik.errors.pictureOfLabelInspectionFront
                      }
                    />
                  </Stack>

                  <Stack spacing={1.5}>
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="600"
                      sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                    >
                      Label Inspection
                    </Typography>
                    <UploadButton
                      value={formik.values.pictureOfLabelInspectionBack}
                      onFileChange={async function (fileObject, fileState) {
                        await formik.setFieldValue(
                          "pictureOfLabelInspectionBack",
                          fileObject
                        );
                        if (fileState) {
                          await formik.setTouched({
                            ...formik.touched,
                            pictureOfLabelInspectionBack: true,
                          });
                        }
                      }}
                      error={
                        !!formik.touched.pictureOfLabelInspectionBack &&
                        !!formik.errors.pictureOfLabelInspectionBack
                      }
                      helperText={
                        formik.touched.pictureOfLabelInspectionBack &&
                        formik.errors.pictureOfLabelInspectionBack
                      }
                    />
                  </Stack>
                </Stack>

                <TextField
                  variant="filled"
                  type="number"
                  aria-valuemin={2}
                  label="Current Weight"
                  placeholder="0.00"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.currentWeightBox}
                  name="currentWeightBox"
                  error={
                    !!formik.touched.currentWeightBox &&
                    !!formik.errors.currentWeightBox
                  }
                  helperText={
                    formik.touched.currentWeightBox &&
                    formik.errors.currentWeightBox
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
                  Is sealing correct?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.isSealCorrectBox}
                  onChange={(value) => {
                    formik.setFieldValue("isSealCorrectBox", value);
                  }}
                  error={
                    !!formik.touched.isSealCorrectBox &&
                    !!formik.errors.isSealCorrectBox
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
                  value={formik.values.pictureOfAllergenStatementBox}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfAllergenStatementBox",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfAllergenStatementBox: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfAllergenStatementBox &&
                    !!formik.errors.pictureOfAllergenStatementBox
                  }
                  helperText={
                    formik.touched.pictureOfAllergenStatementBox &&
                    formik.errors.pictureOfAllergenStatementBox
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
                  value={formik.values.pictureOfLabelInspectionCase}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue(
                      "pictureOfLabelInspectionCase",
                      fileObject
                    );
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfLabelInspectionCase: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfLabelInspectionCase &&
                    !!formik.errors.pictureOfLabelInspectionCase
                  }
                  helperText={
                    formik.touched.pictureOfLabelInspectionCase &&
                    formik.errors.pictureOfLabelInspectionCase
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
                          !!formik.touched.expirationDateCase &&
                          !!formik.errors.expirationDateCase,
                        helperText:
                          formik.touched.expirationDateCase &&
                          formik.errors.expirationDateCase,
                      },
                    }}
                    label="Expiration Date"
                    format="MM/YYYY"
                    formatDensity="spacious"
                    value={moment(formik.values.expirationDateCase)}
                    onChange={(value) => {
                      if (value != null) {
                        formik.setFieldValue(
                          "expirationDateCase",
                          value.format()
                        );
                      } else {
                        formik.setFieldValue("expirationDateCase", "");
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
                  value={formik.values.lotCodeCase}
                  name="lotCodeCase"
                  error={
                    !!formik.touched.lotCodeCase && !!formik.errors.lotCodeCase
                  }
                  helperText={
                    formik.touched.lotCodeCase && formik.errors.lotCodeCase
                  }
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
                  value={formik.values.pictureOfPattern}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfPattern", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfPattern: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfPattern &&
                    !!formik.errors.pictureOfPattern
                  }
                  helperText={
                    formik.touched.pictureOfPattern &&
                    formik.errors.pictureOfPattern
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
                <Typography fontWeight={600}>1 Item</Typography>
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
                  value={formik.values.pictureOfChep}
                  onFileChange={async function (fileObject, fileState) {
                    await formik.setFieldValue("pictureOfChep", fileObject);
                    if (fileState) {
                      await formik.setTouched({
                        ...formik.touched,
                        pictureOfChep: true,
                      });
                    }
                  }}
                  error={
                    !!formik.touched.pictureOfChep &&
                    !!formik.errors.pictureOfChep
                  }
                  helperText={
                    formik.touched.pictureOfChep && formik.errors.pictureOfChep
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

export default PGQualityControlPage;
