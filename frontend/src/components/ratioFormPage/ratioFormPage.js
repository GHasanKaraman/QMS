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
  Backdrop,
  CircularProgress,
  InputAdornment,
  Divider,
  Stack,
} from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import Label from "../Label";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen } from "../../utils/helpers";

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

  const handleSubmit = async (values) => {
    setOpen(true);
    const res = await axios.post("/ratio/add", values);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the form!", {
          variant: "success",
        });
        navigate("/ratio/" + res.data.form._id);
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

  const formik = useFormik({
    initialValues: {
      station: null,
      shift: null,
      product: null,
      weights: {},
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
      weights: yup
        .mixed()
        .nullable()
        .required("Please fill out the form!")
        .test("CHECK", "Please fill out the form!", (value) => {
          return Object.values(value)
            .map((item) => {
              if (
                item.part &&
                item.part !== "" &&
                item.desc &&
                item.desc !== "" &&
                item.weight &&
                item.weight !== ""
              ) {
                return true;
              } else {
                return false;
              }
            })
            .reduce((prev, curr) => {
              return prev && curr;
            }, true);
        }),
    }),
  });

  const loadRecipe = async (product) => {
    const res = await axios.post("/ratio/recipe", {
      product,
    });
    if (userAuth.control(res)) {
      if (res?.data) {
        setProductRecipe(res.data.recipe);
        const uniqueGroups = Array.from(
          new Set(res.data.recipe.recipe.map(({ groupName }) => groupName))
        );

        const weights = {};

        uniqueGroups
          .map((group) => {
            return res.data.recipe?.recipe?.filter(
              ({ groupName }) => groupName === group
            );
          })
          .forEach((item) => {
            if (item[0].groupName === null) {
              item.forEach((grp, index) => {
                weights["null" + index] = {
                  part: grp.part,
                  desc: grp.desc,
                  ratio: grp.qty,
                  weight: "",
                };
              });
            } else {
              weights[item[0].groupName] = {
                part: item[0].part,
                desc: item[0].desc,
                ratio: item[0].qty,
                weight: "",
              };
            }
          });

        formik.setFieldValue("weights", weights);
        setUniqueGroups(uniqueGroups);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Product is wrong!", {
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
  };

  useEffect(() => {
    loadAllStations();
  }, []);

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
              formik.setFieldValue("shift", null);
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
              setProductRecipe(null);
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
              const shift = formik.values.shift;
              formik.resetForm();
              formik.setFieldValue("station", station);
              formik.setFieldValue("shift", shift);
              formik.setFieldValue("product", value);
              if (value != null) {
                await loadRecipe(value.partNum);
                await formOpen("ratio", station, value.partNum);
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
            display: productRecipe?.recipe?.length === 0 ? "block" : "none",
            color: colors.yoggieRed[500],
            fontWeight: 600,
            fontSize: 15,
            textAlign: "center",
          }}
        >
          You cannot fill out this form for this product!
        </div>
        <div
          style={{
            display:
              productRecipe === null ||
              productRecipe?.recipe?.length === 0 ||
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
            gap="10px"
            gridTemplateColumns="repeat(10, minmax(0, 1fr))"
            sx={{
              "& > div": { gridColumn: isNonMobile ? undefined : "span 10" },
            }}
            textAlign="center"
          >
            <Label subtitle="Product" style={{ gridColumn: "span 4" }} />
            <Label subtitle="Group" style={{ gridColumn: "span 2" }} />
            <Label subtitle="Ratio" style={{ gridColumn: "span 2" }} />
            <Label subtitle="Weight" style={{ gridColumn: "span 2" }} />
          </Box>
          <Divider />
          {uniqueGroups?.map((group, index) => {
            const details = productRecipe?.recipe?.filter(
              ({ groupName }) => groupName === group
            );

            return (
              <Box
                key={index}
                mt="10px"
                display="grid"
                gap="10px"
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
                  alignItems: "center",
                }}
              >
                {group ? (
                  <>
                    <Autocomplete
                      getOptionLabel={(row) => {
                        if (row[group]) {
                          return row[group]?.part + " - " + row[group]?.desc;
                        }
                        return row.part + " - " + row.desc;
                      }}
                      isOptionEqualToValue={(option, value) => {
                        return value[group]?.part === option?.part;
                      }}
                      onChange={(_, value) => {
                        const temp = { ...formik.values.weights };
                        temp[group].part = value?.part;
                        temp[group].desc = value?.desc;
                        temp[group].ratio = value?.qty;
                        formik.setFieldValue("weights", temp);
                      }}
                      value={formik.values.weights}
                      sx={{
                        width: "100%",
                        gridColumn: "span 4",
                      }}
                      options={details || []}
                      onBlur={formik.handleBlur}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          variant="filled"
                          label="Product"
                          name="weights"
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
                      {details?.length > 0
                        ? (details[0].qty * 100).toFixed(2) + "%"
                        : undefined}
                    </Typography>
                    <TextField
                      variant="filled"
                      type="number"
                      aria-valuemin={2}
                      label="Weight"
                      placeholder="0.0"
                      onBlur={formik.handleBlur}
                      onChange={(event) => {
                        const temp = { ...formik.values.weights };
                        temp[group].weight = event.target.value;
                        formik.setFieldValue("weights", temp);
                      }}
                      value={formik.values.weights[group]?.weight}
                      name="weights"
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
                  </>
                ) : (
                  productRecipe?.recipe
                    ?.filter(({ groupName }) => groupName === null)
                    .map((recipe, index) => {
                      return (
                        <>
                          <Typography
                            sx={{
                              width: "100%",
                              gridColumn: "span 4",
                              textAlign: "center",
                            }}
                          >
                            {recipe.part + " - " + recipe.desc}
                          </Typography>

                          <Typography
                            sx={{
                              width: "100%",
                              gridColumn: "span 2",
                              textAlign: "center",
                            }}
                          >
                            ?
                          </Typography>
                          <Typography
                            sx={{
                              width: "100%",
                              gridColumn: "span 2",
                              textAlign: "center",
                            }}
                          >
                            {(recipe.qty * 100).toFixed(2) + "%"}
                          </Typography>
                          <TextField
                            variant="filled"
                            type="number"
                            aria-valuemin={2}
                            label="Weight"
                            placeholder="0.0"
                            onBlur={formik.handleBlur}
                            onChange={(event) => {
                              const temp = { ...formik.values.weights };
                              temp["null" + index].weight = event.target.value;
                              temp["null" + index].ratio = recipe.qty;
                              formik.setFieldValue("weights", temp);
                            }}
                            value={
                              formik.values.weights["null" + index]?.weight
                            }
                            name="weight"
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
                              inputProps: {
                                inputMode: "decimal",
                                min: 1,
                                step: 0.1,
                              },
                              endAdornment: (
                                <InputAdornment position="end">
                                  lbs
                                </InputAdornment>
                              ),
                            }}
                          />
                        </>
                      );
                    })
                )}
              </Box>
            );
          })}
          <div />
          <Stack
            sx={{
              alignSelf: "center",
              textAlign: "center",
              mt: "10px",
              color: colors.yoggieRed[500],
              display:
                !!formik.touched.weights && !!formik.errors.weights
                  ? "block"
                  : "none",
            }}
          >
            {formik.touched.weights && formik.errors.weights}
          </Stack>
          <Box display="flex" justifyContent="center" mt="10px">
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
