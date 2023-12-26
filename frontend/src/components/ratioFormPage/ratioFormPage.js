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
  InputAdornment,
  Divider,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import Label from "../Label";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";

const RatioFormPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);

  const [productRecipe, setProductRecipe] = useState(null);
  const [uniqueGroups, setUniqueGroups] = useState(null);

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

  const loadRecipe = async (product) => {
    const res = await axios.post("/ratioform/recipe", {
      product,
    });
    if (userAuth.control(res)) {
      if (res?.data) {
        setProductRecipe(res.data.recipe);
        setUniqueGroups([
          ...new Set(res.data.recipe.recipe.map((item) => item.groupName)),
        ]);
        console.log(
          ...new Set(res.data.recipe.recipe.map((item) => item.groupName))
        );
        console.log(res.data.recipe);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Product is wrong!", {
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

  const handleSubmit = async (values) => {
    setOpen(true);
    console.log(values);
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      station: null,
      product: null,
      lotCode: "",
      personBeingObserved: "",
      ballOrCard: null,
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
      lotCode: yup
        .string()
        .required("Please enter the lot code of the product!"),
      personBeingObserved: yup
        .string()
        .required("Please enter the lot code of the product!"),
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
        title="Finished Product Ratio Form"
        subtitle="Please fill out the form"
      />
      <form onSubmit={formik.handleSubmit} style={{ paddingBottom: "10px" }}>
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
              setProductRecipe(null);
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
                await loadRecipe(value.partNum);
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
              productRecipe == null ||
              productRecipe?.err ||
              formik.values.product == null
                ? "none"
                : "block",
          }}
        >
          <Divider />
          <Box
            mt="10px"
            display="grid"
            gap="30px"
            gridTemplateColumns="repeat(10, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 10" },
            }}
            textAlign="center"
          >
            <Label subtitle="Product" style={{ gridColumn: "span 4" }} />
            <Label subtitle="Group" style={{ gridColumn: "span 2" }} />
            <Label subtitle="Ratio" style={{ gridColumn: "span 2" }} />
            <Label subtitle="Actual Weight" style={{ gridColumn: "span 2" }} />
          </Box>
          <Divider />
          {uniqueGroups?.map((group) => {
            if (group != null) {
              return (
                <Box
                  mt="10px"
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(10, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 10",
                    },
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
                    getOptionLabel={({ part }) => part}
                    defaultValue={
                      productRecipe?.recipe.filter(
                        (r) => r.groupName === group
                      )[0]
                    }
                    onChange={async (_, value) => {}}
                    //value={}
                    sx={{
                      width: "100%",
                      gridColumn: "span 4",
                    }}
                    options={productRecipe.recipe.filter(
                      (r) => r.groupName === group
                    )}
                    onBlur={formik.handleBlur}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        variant="filled"
                        label="Product"
                        name="product"
                        //error={!!formik.touched.product && !!formik.errors.product}
                        //helperText={formik.touched.product && formik.errors.product}
                      />
                    )}
                  />
                  <Typography
                    sx={{
                      width: "100%",
                      gridColumn: "span 2",
                      textAlign: "center",
                    }}
                  >
                    {group}
                  </Typography>
                  <Typography
                    sx={{
                      width: "100%",
                      gridColumn: "span 2",
                      textAlign: "center",
                    }}
                  >
                    {productRecipe?.recipe.filter(
                      (r) => r.groupName === group
                    )[0].qty *
                      100 +
                      "%"}
                  </Typography>
                  <TextField
                    variant="filled"
                    type="number"
                    aria-valuemin={2}
                    label="Weight 1"
                    placeholder="0.0"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.weight2}
                    name="weight2"
                    error={!!formik.touched.weight2 && !!formik.errors.weight2}
                    helperText={formik.touched.weight2 && formik.errors.weight2}
                    sx={{
                      gridColumn: "span 2",
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    InputProps={{
                      inputProps: { inputMode: "decimal", min: 1, step: 0.1 },
                      endAdornment: (
                        <InputAdornment position="end">lbs</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              );
            }
          })}
          {productRecipe?.recipe
            .filter((r) => r.groupName === null)
            .map((product) => {
              return (
                <Box
                  mt="10px"
                  display="grid"
                  gap="30px"
                  gridTemplateColumns="repeat(10, minmax(0, 1fr))"
                  sx={{
                    "& > div": {
                      gridColumn: isNonMobile ? undefined : "span 10",
                    },
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
                    defaultValue={product.part}
                    aria-valuemin={2}
                    label="Weight 1"
                    placeholder="0.0"
                    onBlur={formik.handleBlur}
                    //onChange={formik.handleChange}
                    // value={formik.values.weight2}
                    //name="weight2"
                    //error={!!formik.touched.weight2 && !!formik.errors.weight2}
                    //helperText={formik.touched.weight2 && formik.errors.weight2}
                    sx={{
                      gridColumn: "span 4",
                    }}
                    InputProps={{ readOnly: true }}
                  />
                  <Typography
                    sx={{
                      width: "100%",
                      gridColumn: "span 2",
                      textAlign: "center",
                    }}
                  >
                    -
                  </Typography>
                  <Typography
                    sx={{
                      width: "100%",
                      gridColumn: "span 2",
                      textAlign: "center",
                    }}
                  >
                    {product.qty * 100 + "%"}
                  </Typography>
                  <TextField
                    variant="filled"
                    type="number"
                    aria-valuemin={2}
                    label="Weight 1"
                    placeholder="0.0"
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                    value={formik.values.weight2}
                    name="weight2"
                    error={!!formik.touched.weight2 && !!formik.errors.weight2}
                    helperText={formik.touched.weight2 && formik.errors.weight2}
                    sx={{
                      gridColumn: "span 2",
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                        {
                          display: "none",
                        },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                    InputProps={{
                      inputProps: { inputMode: "decimal", min: 1, step: 0.1 },
                      endAdornment: (
                        <InputAdornment position="end">lbs</InputAdornment>
                      ),
                    }}
                  />
                </Box>
              );
            })}
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

export default RatioFormPage;
