import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Autocomplete, useTheme } from "@mui/material";
import { Formik } from "formik";
import * as yup from "yup";
import { useSnackbar } from "notistack";
import useMediaQuery from "@mui/material/useMediaQuery";

import Header from "../Header";

import { tokens } from "../../theme";

import axios from "../../api/axios";


const AddLocationPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [racks, setRacks] = useState([]);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const locationSchema = yup.object().shape({
    location: yup.string().required("Please enter a location name!"),
    rack: yup.string().required("Please select the rack!"),
  });
  const initialValues = {
    location: "",
    rack: null,
  };

  const loadRacks = async (response) => {
 
  };

  const loadLocationsPage = async () => {
    
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const handleSubmit = async (values, { resetForm }) => {
    
  };

  return (
    <Box m="0 20px ">
      <Header title="ADD LOCATION" subtitle="Create a New Location" />
      <Formik
        initialValues={initialValues}
        validationSchema={locationSchema}
        onSubmit={handleSubmit}
      >
        {({
          setFieldValue,
          values,
          errors,
          touched,
          handleBlur,
          handleChange,
          handleSubmit,
        }) => (
          <form onSubmit={handleSubmit}>
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
              <Box sx={{ gridColumn: "span 1" }} />

              <Autocomplete
                onChange={(_, value) => {
                  setFieldValue("rack", value);
                }}
                value={values.rack}
                sx={{ gridColumn: "span 2" }}
                options={racks.map(({ rack }) => rack)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="filled"
                    label="Rack"
                    onBlur={handleBlur}
                    name="rack"
                    error={!!touched.rack && !!errors.rack}
                    helperText={touched.rack && errors.rack}
                  />
                )}
              />
              <Box sx={{ gridColumn: "span 1" }} />
              <Box sx={{ gridColumn: "span 1" }} />
              <TextField
                autoFocus
                variant="filled"
                type="text"
                label="Location"
                onBlur={handleBlur}
                onChange={handleChange}
                value={values.location}
                name="location"
                error={!!touched.location && !!errors.location}
                helperText={touched.location && errors.location}
                sx={{ gridColumn: "span 2" }}
              />
            </Box>
            <Box display="flex" justifyContent="center" mt="20px">
              <Button type="submit" color="secondary" variant="contained">
                Create New Location
              </Button>
            </Box>
          </form>
        )}
      </Formik>
    </Box>
  );
};

export default AddLocationPage;