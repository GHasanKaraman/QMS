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
import UploadImage from "../UploadImage";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen } from "../../utils/helpers";

const LotInspectionPage = (props) => {
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
    if (deviationState) {
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

      const res = await axios.post("/lotinspection/add", formData);
      if (userAuth.control(res)) {
        if (res?.data) {
          enqueueSnackbar("You have successfully created the form!", {
            variant: "success",
          });

          navigate("/lotinspection/" + res.data.form._id);
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
    } else {
      enqueueSnackbar("Please fill out all the missing fields!", {
        variant: "error",
      });
    }
  };

  const formik = useFormik({
    initialValues: {
      station: null,
      shift: null,
      product: null,
      salesOrderNumber: "",
      itemCode1: "",
      lotCode1: "",
      picture1: null,
      itemCode2: "",
      lotCode2: "",
      picture2: null,
      itemCode3: "",
      lotCode3: "",
      picture3: null,
      itemCode4: "",
      lotCode4: "",
      picture4: null,
      isAllergenStatementCorrect: null,
      personBeingObserved: "",

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
      salesOrderNumber: yup.string().required("Please enter the PO number!"),
      itemCode1: yup
        .string()
        .required("Please enter the item code of the product!"),
      lotCode1: yup
        .string()
        .required("Please enter the lot code of the product!"),
      picture1: yup
        .mixed()
        .nullable()
        .required("Please upload the picture of the back, Single!")
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
      <Header title="LOT Inspection" subtitle="Please fill out the form" />
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
                await formOpen("lotInspection", station, value.partNum);
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
                  SALES ORDER NUMBER
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
                <TextField
                  variant="filled"
                  type="text"
                  label="Item Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.salesOrderNumber}
                  name="salesOrderNumber"
                  error={
                    !!formik.touched.salesOrderNumber &&
                    !!formik.errors.salesOrderNumber
                  }
                  helperText={
                    formik.touched.salesOrderNumber &&
                    formik.errors.salesOrderNumber
                  }
                  sx={{ gridColumn: "span 4" }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={formik.values.salesOrderNumber !== ""}
            disabled={formik.values.salesOrderNumber === ""}
          >
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
                  1. ITEM NAME
                </Typography>
                <Typography fontWeight={600}>3 Items</Typography>
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
                  label="Item Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.itemCode1}
                  name="itemCode1"
                  error={
                    !!formik.touched.itemCode1 && !!formik.errors.itemCode1
                  }
                  helperText={
                    formik.touched.itemCode1 && formik.errors.itemCode1
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode1}
                  name="lotCode1"
                  error={!!formik.touched.lotCode1 && !!formik.errors.lotCode1}
                  helperText={formik.touched.lotCode1 && formik.errors.lotCode1}
                  sx={{ gridColumn: "span 4" }}
                />

                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture of Back, Single (Multipack )
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.picture1}
                  error={!!formik.touched.picture1 && !!formik.errors.picture1}
                  helperText={formik.touched.picture1 && formik.errors.picture1}
                  onChange={(blob) => {
                    formik.setFieldValue("picture1", blob);
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion disabled={!formik.isValid} expanded={formik.isValid}>
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
                  2. ITEM NAME
                </Typography>
                <Typography fontWeight={600}>3 Items</Typography>
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
                  label="Item Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.itemCode2}
                  name="itemCode2"
                  error={
                    !!formik.touched.itemCode2 && !!formik.errors.itemCode2
                  }
                  helperText={
                    formik.touched.itemCode2 && formik.errors.itemCode2
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode2}
                  name="lotCode2"
                  error={!!formik.touched.lotCode2 && !!formik.errors.lotCode2}
                  helperText={formik.touched.lotCode2 && formik.errors.lotCode2}
                  sx={{ gridColumn: "span 4" }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture of Back, Single (Multipack )
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.picture2}
                  error={!!formik.touched.picture2 && !!formik.errors.picture2}
                  helperText={formik.touched.picture2 && formik.errors.picture2}
                  onChange={(blob) => {
                    formik.setFieldValue("picture2", blob);
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={
              formik.isValid &&
              formik.values.picture2 !== null &&
              formik.values.itemCode2 !== "" &&
              formik.values.lotCode2 !== ""
            }
            disabled={
              !formik.isValid ||
              formik.values.picture2 === null ||
              formik.values.itemCode2 === "" ||
              formik.values.lotCode2 === ""
            }
          >
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
                  3. ITEM NAME
                </Typography>
                <Typography fontWeight={600}>3 Items</Typography>
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
                  label="Item Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.itemCode3}
                  name="itemCode3"
                  error={
                    !!formik.touched.itemCode3 && !!formik.errors.itemCode3
                  }
                  helperText={
                    formik.touched.itemCode3 && formik.errors.itemCode3
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode3}
                  name="lotCode3"
                  error={!!formik.touched.lotCode3 && !!formik.errors.lotCode3}
                  helperText={formik.touched.lotCode3 && formik.errors.lotCode3}
                  sx={{ gridColumn: "span 4" }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture of Back, Single (Multipack )
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.picture3}
                  error={!!formik.touched.picture3 && !!formik.errors.picture3}
                  helperText={formik.touched.picture3 && formik.errors.picture3}
                  onChange={(blob) => {
                    formik.setFieldValue("picture3", blob);
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>
          <Accordion
            expanded={
              formik.isValid &&
              formik.values.picture2 !== null &&
              formik.values.itemCode2 !== "" &&
              formik.values.lotCode2 !== "" &&
              formik.values.picture3 !== null &&
              formik.values.itemCode3 !== "" &&
              formik.values.lotCode3 !== ""
            }
            disabled={
              !formik.isValid ||
              formik.values.picture3 === null ||
              formik.values.itemCode3 === "" ||
              formik.values.lotCode3 === "" ||
              formik.values.picture2 === null ||
              formik.values.itemCode2 === "" ||
              formik.values.lotCode2 === ""
            }
          >
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
                  4. ITEM NAME
                </Typography>
                <Typography fontWeight={600}>3 Items</Typography>
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
                  label="Item Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.itemCode4}
                  name="itemCode4"
                  error={
                    !!formik.touched.itemCode4 && !!formik.errors.itemCode4
                  }
                  helperText={
                    formik.touched.itemCode4 && formik.errors.itemCode4
                  }
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                  variant="filled"
                  type="text"
                  label="Lot Code #"
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values.lotCode4}
                  name="lotCode4"
                  error={!!formik.touched.lotCode4 && !!formik.errors.lotCode4}
                  helperText={formik.touched.lotCode4 && formik.errors.lotCode4}
                  sx={{ gridColumn: "span 4" }}
                />
                <Typography
                  variant="h6"
                  color={colors.grey[100]}
                  fontWeight="600"
                  sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                >
                  Picture of Back, Single (Multipack )
                </Typography>
                <UploadImage
                  sx={{ gridColumn: "span 4", justifySelf: "start" }}
                  value={formik.values.picture4}
                  error={!!formik.touched.picture4 && !!formik.errors.picture4}
                  helperText={formik.touched.picture4 && formik.errors.picture4}
                  onChange={(blob) => {
                    formik.setFieldValue("picture4", blob);
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

export default LotInspectionPage;
