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
import UploadMultipleImage from "../UploadMultipleImage";
import UploadImage from "../UploadImage";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen } from "../../utils/helpers";

const MixingQualityControlPage = (props) => {
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
  const [deviationState, setDeviationState] = useState(null);
  const [probioticMixLot, setProbioticMixLot] = useState("No");

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/qualitycontrol");
    if (userAuth.control(res)) {
      setStations(
        res.data.stations.filter(
          (item) => item.name.includes("MIX") && !item.name.includes("MIX-0")
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

    const res = await axios.post("/mixingquality/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/mixingquality/" + res.data.form._id);
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
      shift: null,
      product: null,

      lotCode: "",
      correctLabel: null,
      probioticMixLot: null,
      probioticMixLotCode: "",
      areAllergensCorrect: null,
      cleaning: null,
      allergensSeparate: null,
      sensory: null,
      cleanFloor: null,
      garbageOrganized: null,

      rawMaterialPictures: [],
      finishedProductPicture: null,

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
      lotCode: yup
        .string()
        .required("Please enter the lot code of the finished product!"),
      correctLabel: yup.string().required(),
      probioticMixLot: yup.string().required(),
      areAllergensCorrect: yup.string().required(),
      probioticMixLotCode:
        probioticMixLot === "Yes"
          ? yup.string().required("Please enter the lot code of the probiotic!")
          : undefined,
      cleaning: yup.string().required(),
      allergensSeparate: yup.string().required(),
      sensory: yup.string().required(),
      cleanFloor: yup.string().required(),
      garbageOrganized: yup.string().required(),
      rawMaterialPictures: yup
        .array()
        .of(uploadRequired("Please upload pictures of raw materials!"))
        .required("You must upload at leat one image!")
        .min(1, "You must upload at least one image!"),
      finishedProductPicture: uploadRequired(
        "Please upload the finished product!"
      ),

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
        title="Mixing Quality Control Inspection"
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
              formik.setFieldValue("product", null);
              formik.setFieldValue("shift", null);
              if (value != null) {
                await loadProducts(value);
              }
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
                const details = await loadDetails(station, value.partNum);
                await formOpen("mixingQuality", station, value.partNum);
                if (details) {
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
                  MIXING CHECKS
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
                  Probiotic jars correctly labelled?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.correctLabel}
                  onChange={(value) => {
                    formik.setFieldValue("correctLabel", value);
                  }}
                  error={
                    !!formik.touched.correctLabel &&
                    !!formik.errors.correctLabel
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
                  Probiotic Mix Lot Code?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.probioticMixLot}
                  onChange={(value) => {
                    formik.setFieldValue("probioticMixLot", value);
                    setProbioticMixLot(value);
                  }}
                  error={
                    !!formik.touched.probioticMixLot &&
                    !!formik.errors.probioticMixLot
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
                {probioticMixLot === "Yes" ? (
                  <TextField
                    variant="filled"
                    type="text"
                    label="Probiotic Mix Lot Code"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.probioticMixLotCode}
                    name="probioticMixLotCode"
                    error={
                      !!formik.touched.probioticMixLotCode &&
                      !!formik.errors.probioticMixLotCode
                    }
                    helperText={
                      formik.touched.probioticMixLotCode &&
                      formik.errors.probioticMixLotCode
                    }
                    sx={{ gridColumn: "span 4" }}
                  />
                ) : (
                  <div style={{ display: "none" }} />
                )}
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

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Allergens kept separate?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.allergensSeparate}
                  onChange={(value) => {
                    formik.setFieldValue("allergensSeparate", value);
                  }}
                  error={
                    !!formik.touched.allergensSeparate &&
                    !!formik.errors.allergensSeparate
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
                  Sensory evaluation?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.sensory}
                  onChange={(value) => {
                    formik.setFieldValue("sensory", value);
                  }}
                  error={!!formik.touched.sensory && !!formik.errors.sensory}
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
                  Floor is clean?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.cleanFloor}
                  onChange={(value) => {
                    formik.setFieldValue("cleanFloor", value);
                  }}
                  error={
                    !!formik.touched.cleanFloor && !!formik.errors.cleanFloor
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
                  Garbage organized?
                </Typography>
                <ToggleButtonCheck
                  style={{ gridColumn: "span 4" }}
                  alignment={formik.values.garbageOrganized}
                  onChange={(value) => {
                    formik.setFieldValue("garbageOrganized", value);
                  }}
                  error={
                    !!formik.touched.garbageOrganized &&
                    !!formik.errors.garbageOrganized
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
                  Raw Material Pictures
                </Typography>
                <UploadMultipleImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.rawMaterialPictures}
                  error={
                    !!formik.touched.rawMaterialPictures &&
                    !!formik.errors.rawMaterialPictures
                  }
                  helperText={
                    formik.touched.rawMaterialPictures &&
                    formik.errors.rawMaterialPictures
                  }
                  onChange={(blobs) => {
                    formik.setFieldValue("rawMaterialPictures", blobs);
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

export default MixingQualityControlPage;
