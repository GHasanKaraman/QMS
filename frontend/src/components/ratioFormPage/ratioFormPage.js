import { useEffect, useRef, useState } from "react";
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
  Grid,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import CalculateIcon from "@mui/icons-material/Calculate";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import SaveIcon from "@mui/icons-material/Save";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { saveRatioForm } from "../controllers/ratioFormController";

const RatioFormPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [locations, setLocations] = useState([]);
  const [totalWeight, setTotalWeight] = useState(0);
  const [totalPercentage, setTotalPercentage] = useState(0);
  const [samplePercentages, setSamplePercentages] = useState({});
  const [targets, setTargets] = useState({});
  const [calculated, setCalculated] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/ratioform");
    if (userAuth.control(res)) {
      setLocations(res.data.locations);
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

  const parseIngredient = (ingredient) => {
    const code = ingredient.substring(0, ingredient.indexOf(" "));
    const name = ingredient.substring(
      ingredient.indexOf(" ") + 1,
      ingredient.lastIndexOf(" ")
    );
    const target = ingredient.substring(
      ingredient.lastIndexOf(" ") + 1,
      ingredient.length
    );
    return { code, name, target };
  };

  const handleSave = async (type) => {
    setOpenDialog(false);
    setOpen(true);
    const res = await saveRatioForm(formik.values, type);
    setOpen(false);
    if (userAuth.control(res)) {
      if (res?.data) {
        formik.resetForm();
        if (type === "done") {
          enqueueSnackbar("You have succesfully created a ratio form!", {
            variant: "success",
          });
        } else {
          enqueueSnackbar("The ratio form is saved for later to complete!", {
            variant: "success",
          });
        }
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Your username or password is incorrect!", {
              variant: "error",
            });
            break;

          case 500:
            enqueueSnackbar(
              "Something went wrong while authenticate the credentials!",
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

  const handleSubmit = (values) => {
    setCalculated(true);
    Object.keys(values).forEach((k) => values[k] == "" && delete values[k]);
    const mixLength = (Object.keys(values).length - 3) / 2;
    var weight = 0;
    var targetPercentages = {};

    for (let i = 1; i <= mixLength; i++) {
      weight += values["weight" + i] * 1;
      targetPercentages[i] =
        parseIngredient(values["ingredient" + i]).target.slice(0, -1) * 1;
    }
    setTotalWeight(weight);
    setTargets(targetPercentages);

    const mixSamplePercentage = {};
    for (let i = 1; i <= mixLength; i++) {
      mixSamplePercentage[i] = (
        ((values["weight" + i] * 1) / weight) *
        100
      ).toFixed(2);
    }
    setSamplePercentages(mixSamplePercentage);

    var percentage = 0;
    for (let i = 1; i <= mixLength; i++) {
      percentage += mixSamplePercentage[i] * 1;
    }
    setTotalPercentage(percentage);
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth" });
    }, 50);
  };

  const formik = useFormik({
    initialValues: {
      productName: "asd",
      productCode: "123",
      ingredient1: "2334 pistachios 40%",
      ingredient2: "2334 pistachios 10%",
      ingredient3: "2334 pistachios 10%",
      ingredient4: "2334 pistachios 30%",
      ingredient5: "2334 pistachios 10%",
      ingredient6: "",
      ingredient7: "",
      ingredient8: "",
      ingredient9: "",
      ingredient10: "",
      weight1: "215.00",
      weight2: "40.00",
      weight3: "52.00",
      weight4: "130.00",
      weight5: "32.00",
      weight6: "",
      weight7: "",
      weight8: "",
      weight9: "",
      weight10: "",
      location: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      productName: yup.string().required("Please enter the product name!"),
      productCode: yup.string().required("Please enter the product code!"),
      location: yup.string().required("Please select the location!"),
      ingredient1: yup
        .string()
        .required("Please enter the ingredient!")
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            const parsed = parseIngredient(value);
            if (!parsed.code || !parsed.name || !parsed.target) {
              return false;
            }
            if (!value.includes("%")) {
              return false;
            }
            return true;
          }
        ),
      ingredient2: yup
        .string()
        .required("Please enter the ingredient!")
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            const parsed = parseIngredient(value);
            if (!parsed.code || !parsed.name || !parsed.target) {
              return false;
            }
            if (!value.includes("%")) {
              return false;
            }
            return true;
          }
        ),
      ingredient3: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient4: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient5: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient6: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient7: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient8: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient9: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      ingredient10: yup
        .string()
        .test(
          "INGREDIENT_FORMAT",
          "You should follow the writing rule!",
          (value) => {
            if (value) {
              const parsed = parseIngredient(value);
              if (!parsed.code || !parsed.name || !parsed.target) {
                return false;
              }
              if (!value.includes("%")) {
                return false;
              }
              return true;
            }
            return true;
          }
        ),
      weight1: yup.string().required("Please enter the weight!"),
      weight2: yup.string().required("Please enter the weight!"),
      weight3: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient3"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 3 first!", (value) => {
          if (!Boolean(formik.values["ingredient3"]) && value) {
            return false;
          }
          return true;
        }),
      weight4: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient4"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 4 first!", (value) => {
          if (!Boolean(formik.values["ingredient4"]) && value) {
            return false;
          }
          return true;
        }),
      weight5: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient5"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 5 first!", (value) => {
          if (!Boolean(formik.values["ingredient5"]) && value) {
            return false;
          }
          return true;
        }),
      weight6: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient6"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 6 first!", (value) => {
          if (!Boolean(formik.values["ingredient6"]) && value) {
            return false;
          }
          return true;
        }),
      weight7: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient7"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 7 first!", (value) => {
          if (!Boolean(formik.values["ingredient7"]) && value) {
            return false;
          }
          return true;
        }),
      weight8: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient8"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 8 first!", (value) => {
          if (!Boolean(formik.values["ingredient8"]) && value) {
            return false;
          }
          return true;
        }),
      weight9: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient9"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 9 first!", (value) => {
          if (!Boolean(formik.values["ingredient9"]) && value) {
            return false;
          }
          return true;
        }),
      weight10: yup
        .string()
        .test("INGREDIENT_CHECK", "Please enter the weight!", (value) => {
          if (Boolean(formik.values["ingredient10"]) && !value) {
            return false;
          }
          return true;
        })
        .test("WEIGHT_CHECK", "Please enter Ingredient 10 first!", (value) => {
          if (!Boolean(formik.values["ingredient10"]) && value) {
            return false;
          }
          return true;
        }),
    }),
  });

  useEffect(() => {
    setCalculated(false);
  }, [formik.values]);

  return (
    <Box m="0 20px">
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Confirm the action"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to save this form?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              console.log(handleSave("later"));
            }}
          >
            Save for Later
          </Button>
          <Button
            variant="contained"
            color="info"
            autoFocus
            onClick={() => {
              handleSave("done");
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
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
            onChange={(_, value) => {
              formik.setFieldValue("location", value);
            }}
            value={formik.values.location}
            sx={{ gridColumn: "span 4" }}
            options={locations.map(({ name }) => name)}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Location"
                name="location"
                error={!!formik.touched.location && !!formik.errors.location}
                helperText={formik.touched.location && formik.errors.location}
              />
            )}
          />
          <Typography
            variant="h4"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ m: "0 0 5px 0" }}
          >
            Product Name & Code
          </Typography>
          <TextField
            variant="filled"
            type="text"
            label="Product Name"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.productName}
            name="productName"
            error={!!formik.touched.productName && !!formik.errors.productName}
            helperText={formik.touched.productName && formik.errors.productName}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Product Code"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.productCode}
            name="productCode"
            error={!!formik.touched.productCode && !!formik.errors.productCode}
            helperText={formik.touched.productCode && formik.errors.productCode}
            sx={{ gridColumn: "span 4" }}
          />
          <Typography
            variant="h4"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ m: "0 0 5px 0" }}
          >
            Formula Information
          </Typography>
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 1 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient1}
            name="ingredient1"
            error={!!formik.touched.ingredient1 && !!formik.errors.ingredient1}
            helperText={formik.touched.ingredient1 && formik.errors.ingredient1}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 2 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient2}
            name="ingredient2"
            error={!!formik.touched.ingredient2 && !!formik.errors.ingredient2}
            helperText={formik.touched.ingredient2 && formik.errors.ingredient2}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 3 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient3}
            name="ingredient3"
            error={!!formik.touched.ingredient3 && !!formik.errors.ingredient3}
            helperText={formik.touched.ingredient3 && formik.errors.ingredient3}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 4 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient4}
            name="ingredient4"
            error={!!formik.touched.ingredient4 && !!formik.errors.ingredient4}
            helperText={formik.touched.ingredient4 && formik.errors.ingredient4}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 5 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient5}
            name="ingredient5"
            error={!!formik.touched.ingredient5 && !!formik.errors.ingredient5}
            helperText={formik.touched.ingredient5 && formik.errors.ingredient5}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 6 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient6}
            name="ingredient6"
            error={!!formik.touched.ingredient6 && !!formik.errors.ingredient6}
            helperText={formik.touched.ingredient6 && formik.errors.ingredient6}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 7 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient7}
            name="ingredient7"
            error={!!formik.touched.ingredient7 && !!formik.errors.ingredient7}
            helperText={formik.touched.ingredient7 && formik.errors.ingredient7}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 8 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient8}
            name="ingredient8"
            error={!!formik.touched.ingredient8 && !!formik.errors.ingredient8}
            helperText={formik.touched.ingredient8 && formik.errors.ingredient8}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 9 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient9}
            name="ingredient9"
            error={!!formik.touched.ingredient9 && !!formik.errors.ingredient9}
            helperText={formik.touched.ingredient9 && formik.errors.ingredient9}
            sx={{ gridColumn: "span 4" }}
          />
          <TextField
            variant="filled"
            type="text"
            label="Ingredient 10 (CODE-NAME-TARGET %)"
            placeholder="Type here..."
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.ingredient10}
            name="ingredient10"
            error={
              !!formik.touched.ingredient10 && !!formik.errors.ingredient10
            }
            helperText={
              formik.touched.ingredient10 && formik.errors.ingredient10
            }
            sx={{ gridColumn: "span 4" }}
          />
          <Typography
            variant="h4"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ m: "0 0 5px 0" }}
          >
            Mix Sample Weight
          </Typography>
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 1"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight1}
            name="weight1"
            error={!!formik.touched.weight1 && !!formik.errors.weight1}
            helperText={formik.touched.weight1 && formik.errors.weight1}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 2"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight2}
            name="weight2"
            error={!!formik.touched.weight2 && !!formik.errors.weight2}
            helperText={formik.touched.weight2 && formik.errors.weight2}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 3"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight3}
            name="weight3"
            error={!!formik.touched.weight3 && !!formik.errors.weight3}
            helperText={formik.touched.weight3 && formik.errors.weight3}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 4"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight4}
            name="weight4"
            error={!!formik.touched.weight4 && !!formik.errors.weight4}
            helperText={formik.touched.weight4 && formik.errors.weight4}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 5"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight5}
            name="weight5"
            error={!!formik.touched.weight5 && !!formik.errors.weight5}
            helperText={formik.touched.weight5 && formik.errors.weight5}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 6"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight6}
            name="weight6"
            error={!!formik.touched.weight6 && !!formik.errors.weight6}
            helperText={formik.touched.weight6 && formik.errors.weight6}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 7"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight7}
            name="weight7"
            error={!!formik.touched.weight7 && !!formik.errors.weight7}
            helperText={formik.touched.weight7 && formik.errors.weight7}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 8"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight8}
            name="weight8"
            error={!!formik.touched.weight8 && !!formik.errors.weight8}
            helperText={formik.touched.weight8 && formik.errors.weight8}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 9"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight9}
            name="weight9"
            error={!!formik.touched.weight9 && !!formik.errors.weight9}
            helperText={formik.touched.weight9 && formik.errors.weight9}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <TextField
            variant="filled"
            type="number"
            aria-valuemin={2}
            label="Weight 10"
            placeholder="0.00"
            onBlur={formik.handleBlur}
            onChange={formik.handleChange}
            value={formik.values.weight10}
            name="weight10"
            error={!!formik.touched.weight10 && !!formik.errors.weight10}
            helperText={formik.touched.weight10 && formik.errors.weight10}
            sx={{ gridColumn: "span 4" }}
            InputProps={{
              inputProps: { inputMode: "decimal", min: 0, step: 0.01 },
            }}
          />
          <Typography
            variant="h4"
            color={colors.grey[100]}
            fontWeight="bold"
            sx={{ m: "0 0 10px 0" }}
          >
            RECALIBRATION
          </Typography>
        </Box>
        <Button
          size="large"
          variant="contained"
          color="secondary"
          type="submit"
          startIcon={<CalculateIcon sx={{ color: colors.primary[400] }} />}
          sx={{ width: "100%", mb: "10px" }}
        >
          Calculate
        </Button>
        {calculated ? (
          <Stack ref={ref} spacing={2}>
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
              {"TOTAL WEIGHT: " + totalWeight}
            </Typography>
            <Typography variant="h5" color={colors.grey[100]} fontWeight="bold">
              {"TOTAL PERCENTAGE: " + totalPercentage + " %"}
            </Typography>
            {Object.keys(samplePercentages).map((key) => {
              return (
                <Grid container spacing={0}>
                  <Grid item xs={3} padding={0}>
                    <Typography
                      variant="h5"
                      color={colors.grey[100]}
                      fontWeight="bold"
                    >
                      {"PERCENTAGE " +
                        key +
                        ": " +
                        samplePercentages[key] +
                        "%"}
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    {Math.abs(samplePercentages[key] - targets[key]) >= 6 ? (
                      <RemoveCircleIcon
                        sx={{ margin: "auto", color: colors.yoggieRed[500] }}
                      />
                    ) : (
                      <CheckCircleIcon
                        sx={{
                          margin: "auto",
                          color: colors.ciboInnerGreen[500],
                        }}
                      />
                    )}
                  </Grid>
                </Grid>
              );
            })}
            <Button
              size="large"
              variant="contained"
              color="secondary"
              type="submit"
              startIcon={<SaveIcon sx={{ color: colors.primary[400] }} />}
              onClick={() => {
                setOpenDialog(true);
              }}
            >
              SAVE
            </Button>

            <div />
          </Stack>
        ) : null}
      </form>
    </Box>
  );
};

export default RatioFormPage;
