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
import UploadImage from "../UploadImage";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen } from "../../utils/helpers";

const SAMPLE_POINTS = ["Beginning", "Middle", "End"];

const NitrogenTestPage = (props) => {
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

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const signOut = () => {
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    enqueueSnackbar("Please sign in again!", {
      variant: "error",
    });
  };

  const loadAllStations = async () => {
    const res = await axios.post("/qualitycontrol");
    if (userAuth.control(res)) {
      setStations(res.data.stations);
    } else {
      signOut();
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
      signOut();
    }
  };

  const formOpen = async (formType, station, partNum, planId) => {
    const res = await sendFormOpen(formType, station, partNum, planId);
    if (userAuth.control(res)) {
      console.log("Form opened!");
    } else {
      signOut();
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
      signOut();
    }
  };

  useEffect(() => {
    loadAllStations();
  }, []);

  const handleSubmit = async (valuesX) => {
    setOpen(true);
    const values = { ...valuesX };
    values.product = values.product.partNum;
    values.started = Number(productDetails?.started);
    values.startDateTime = moment(productDetails?.startDateTime);
    if (values.hasRightSide === "No") {
      delete values.nitrogenRightBeginning;
      delete values.nitrogenRightMiddle;
      delete values.nitrogenRightEnd;
      delete values.rightPicture;
    }

    const formData = new FormData();
    for (const name in values) {
      if (values[name]?.constructor?.name === "Blob") {
        formData.append(name, values[name], name + ".jpeg");
      } else {
        formData.append(name, values[name]);
      }
    }

    const res = await axios.post("/nitrogentest/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });

        navigate("/nitrogentest/" + res.data.form._id);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;
          case 405:
            enqueueSnackbar(
              "Something went wrong while saving the form. Please try again!",
              {
                variant: "error",
              },
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
      signOut();
    }
    setOpen(false);
  };

  const passFail = yup
    .string()
    .nullable()
    .required("Please select Pass or Fail!");
  const picture = yup
    .mixed()
    .nullable()
    .required("Please upload the picture of the nitrogen screen!")
    .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
      return !value || (value && value.size < 1024 * 1024 * 10);
    })
    .test("FILE_FORMAT", "You can only upload JPG/JPEG/PNG files!", (value) => {
      return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
    });

  const rightSideOnly = (schema) =>
    yup
      .mixed()
      .nullable()
      .when("hasRightSide", { is: "Yes", then: () => schema });

  const formik = useFormik({
    initialValues: {
      station: null,
      shift: null,
      product: null,
      lotCode: "",
      hasRightSide: "Yes",
      nitrogenLeftBeginning: null,
      nitrogenLeftMiddle: null,
      nitrogenLeftEnd: null,
      leftPicture: null,
      nitrogenRightBeginning: null,
      nitrogenRightMiddle: null,
      nitrogenRightEnd: null,
      rightPicture: null,
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
          (value) => Boolean(value && value?.partNum !== ""),
        ),
      lotCode: yup.string().required("Please enter the lot number!"),
      nitrogenLeftBeginning: passFail,
      nitrogenLeftMiddle: passFail,
      nitrogenLeftEnd: passFail,
      leftPicture: picture,
      nitrogenRightBeginning: rightSideOnly(passFail),
      nitrogenRightMiddle: rightSideOnly(passFail),
      nitrogenRightEnd: rightSideOnly(passFail),
      rightPicture: rightSideOnly(picture),
    }),
  });

  const gridSx = {
    "& > div": { gridColumn: isNonMobile ? undefined : "span 1" },
    "& .MuiInputBase-root::after": {
      borderBottomColor: colors.ciboInnerGreen[500],
    },
    "& .MuiInputBase-root::before": {
      borderBottomColor: colors.ciboInnerGreen[600],
    },
    "& .MuiFormLabel-root.Mui-focused": {
      color: colors.ciboInnerGreen[300],
    },
  };

  const renderSide = (label, side) => {
    const pictureName = side.toLowerCase() + "Picture";
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              {label}
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {side === "Right" ? (
            <Stack spacing={1} sx={{ mb: "20px" }}>
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
              >
                Does this machine have a right side?
              </Typography>
              <ToggleButtonCheck
                alignment={formik.values.hasRightSide}
                onChange={(value) =>
                  formik.setFieldValue("hasRightSide", value)
                }
                options={[{ label: "Yes" }, { label: "No" }]}
              />
            </Stack>
          ) : undefined}
          <Box
            sx={{
              display:
                side === "Right" && formik.values.hasRightSide === "No"
                  ? "none"
                  : "block",
            }}
          >
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ mb: "15px" }}
            >
              Sample Points
            </Typography>
            <Typography color={colors.grey[300]} sx={{ mb: "15px" }}>
              Is the oxygen reading less than 5%?
            </Typography>
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="minmax(0, 1fr)"
              sx={gridSx}
            >
              {SAMPLE_POINTS.map((point) => {
                const name = "nitrogen" + side + point;
                return (
                  <Stack key={name} spacing={1}>
                    <Typography color={colors.grey[100]} fontWeight="600">
                      {point}
                    </Typography>
                    <ToggleButtonCheck
                      alignment={formik.values[name]}
                      onChange={(value) => formik.setFieldValue(name, value)}
                      error={!!formik.touched[name] && !!formik.errors[name]}
                      options={[{ label: "Pass" }, { label: "Fail" }]}
                    />
                  </Stack>
                );
              })}
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", gridColumn: "span 1" }}
              >
                Photo of Nitrogen Screen ({label.toLowerCase()} results)
              </Typography>
              <UploadImage
                sx={{ gridColumn: "span 1", justifySelf: "start" }}
                value={formik.values[pictureName]}
                error={
                  !!formik.touched[pictureName] && !!formik.errors[pictureName]
                }
                helperText={
                  formik.touched[pictureName] && formik.errors[pictureName]
                }
                onChange={(blob) => {
                  formik.setFieldValue(pictureName, blob);
                }}
              />
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

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
      <Header title="Nitrogen Test" subtitle="Please fill out the form" />
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
            ...gridSx,
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
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
                ({ name }) => !name.includes("ROAST") && !name.includes("MIX"),
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
              { label: "1", icon: <Schedule /> },
              { label: "2", icon: <Schedule /> },
              { label: "3", icon: <Schedule /> },
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
                await formOpen(
                  "nitrogenTest",
                  station,
                  value.partNum,
                  value.planId,
                );
              }
            }}
            value={formik.values.product}
            sx={{ marginBottom: "30px", gridColumn: "span 4" }}
            options={products}
            getOptionKey={(item) => item?.planId}
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
                  LOT NUMBER
                </Typography>
                <Typography fontWeight={600}>1 Item</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                variant="filled"
                type="text"
                label="Lot Number"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.lotCode}
                name="lotCode"
                error={!!formik.touched.lotCode && !!formik.errors.lotCode}
                helperText={formik.touched.lotCode && formik.errors.lotCode}
                fullWidth
              />
            </AccordionDetails>
          </Accordion>
          {renderSide("LEFT SIDE", "Left")}
          {renderSide("RIGHT SIDE", "Right")}

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

export default NitrogenTestPage;
