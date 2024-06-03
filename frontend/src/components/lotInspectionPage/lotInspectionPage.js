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
import UploadButton from "../UploadButton";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";

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
      formData.append(name, values[name]);
    }

    const res = await axios.post("/lotinspection/add", formData);
    console.log(res.data);
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
                <Stack direction="column" spacing={1.5}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Picture of Back, Single (Multipack )
                  </Typography>

                  <UploadButton
                    value={formik.values.picture1}
                    onFileChange={async function (fileObject, fileState) {
                      await formik.setFieldValue("picture1", fileObject);
                      if (fileState) {
                        await formik.setTouched({
                          ...formik.touched,
                          picture1: true,
                        });
                      }
                    }}
                    error={
                      !!formik.touched.picture1 && !!formik.errors.picture1
                    }
                    helperText={
                      formik.touched.picture1 && formik.errors.picture1
                    }
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
                <Stack direction="column" spacing={1.5}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Picture of Back, Single (Multipack )
                  </Typography>

                  <UploadButton
                    value={formik.values.picture2}
                    onFileChange={async function (fileObject, fileState) {
                      await formik.setFieldValue("picture2", fileObject);
                      if (fileState) {
                        await formik.setTouched({
                          ...formik.touched,
                          picture2: true,
                        });
                      }
                    }}
                    error={
                      !!formik.touched.picture2 && !!formik.errors.picture2
                    }
                    helperText={
                      formik.touched.picture2 && formik.errors.picture2
                    }
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
                <Stack direction="column" spacing={1.5}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Picture of Back, Single (Multipack )
                  </Typography>

                  <UploadButton
                    value={formik.values.picture3}
                    onFileChange={async function (fileObject, fileState) {
                      await formik.setFieldValue("picture1", fileObject);
                      if (fileState) {
                        await formik.setTouched({
                          ...formik.touched,
                          picture3: true,
                        });
                      }
                    }}
                    error={
                      !!formik.touched.picture3 && !!formik.errors.picture3
                    }
                    helperText={
                      formik.touched.picture3 && formik.errors.picture3
                    }
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
                <Stack direction="column" spacing={1.5}>
                  <Typography
                    variant="h6"
                    color={colors.grey[100]}
                    fontWeight="600"
                    sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                  >
                    Picture of Back, Single (Multipack )
                  </Typography>

                  <UploadButton
                    value={formik.values.picture4}
                    onFileChange={async function (fileObject, fileState) {
                      await formik.setFieldValue("picture1", fileObject);
                      if (fileState) {
                        await formik.setTouched({
                          ...formik.touched,
                          picture4: true,
                        });
                      }
                    }}
                    error={
                      !!formik.touched.picture4 && !!formik.errors.picture4
                    }
                    helperText={
                      formik.touched.picture4 && formik.errors.picture4
                    }
                  />
                </Stack>
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
