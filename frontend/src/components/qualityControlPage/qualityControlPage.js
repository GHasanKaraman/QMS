import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import {
  Box,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Stack,
  Dialog,
  DialogActions,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Backdrop,
  CircularProgress,
  Switch,
} from "@mui/material";
import MuiAccordion from "@mui/material/Accordion";
import MuiAccordionSummary from "@mui/material/AccordionSummary";
import MuiAccordionDetails from "@mui/material/AccordionDetails";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";
import InventoryIcon from "@mui/icons-material/Inventory";
import ScaleIcon from "@mui/icons-material/Scale";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";

import { useFormik } from "formik";
import * as yup from "yup";

import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import ToggleButtonCheck from "../ToggleButtonCheck";
import UploadButton from "../UploadButton";

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1F2A40" : "#f2f0f0",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

const QualityControlPage = (props) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [locations, setLocations] = useState([]);

  const [openDialog, setOpenDialog] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadAllStations = async () => {
    const res = await axios.post("/qualitycontrol");
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

  const handleSave = async () => {};

  const handleSubmit = async (values) => {
    console.log(values);
  };

  const formik = useFormik({
    initialValues: {
      location: null,
      areIngredientsCorrect: null,
      pictureOfProduct: null,
      isTasteAcceptable: null,
      pictureMixCode: null,
      lotCode: "",
      expirationDate: "",
      currentWeight: "0.00",
      unitOfMeasure: null,
      isSealCorrect: null,
      isNotchCorrect: null,
      xrayRequired: null,
      xrayFeDetected: null,
      xrayNonFeDetected: null,
      xraySsDetected: null,
      metalCardRequired: null,
      metalCardFeDetected: null,
      metalCardNonFeDetected: null,
      metalCardSsDetected: null,
      metalBallRequired: null,
      metalBallFeDetected: null,
      metalBallNonFeDetected: null,
      metalBallSsDetected: null,
      correctContainer: null,
      pictureLabelFront: null,
      pictureLabelBack: null,
      allergenPresent: null,
      milk: null,
      soy: null,
      egg: null,
      peanut: null,
      treenut: null,
      wheat: null,
      sesame: null,
      allergenStatement: null,
      pictureOfAllergenStatement: null,
      labelPackageCorrect: null,
      pictureOfBarcode: null,
      unitsCase: "",
      salesOrderNumber: "",
      caseLabel: null,
      pictureOfBoxLabel: null,
      anyDeviations: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup
      .object()
      .shape({ lotCode: yup.string().required("input") }),
  });

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
        title="Quality Control Inspection"
        subtitle="Please fill out the form"
      />

      <form onSubmit={formik.handleSubmit} style={{ paddingBottom: "10px" }}>
        <Autocomplete
          onChange={(_, value) => {
            formik.setFieldValue("location", value);
          }}
          value={formik.values.location}
          sx={{ marginBottom: "30px" }}
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
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                PRODUCT INFORMATION
              </Typography>
              <Typography fontWeight={600}>10 Items</Typography>
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

              <UploadButton
                value={formik.values.pictureOfProduct}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureOfProduct", fileObject);
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureOfProduct: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureOfProduct &&
                  !!formik.errors.pictureOfProduct
                }
                helperText={
                  formik.touched.pictureOfProduct &&
                  formik.errors.pictureOfProduct
                }
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
                Mix Code
              </Typography>
              <UploadButton
                value={formik.values.pictureMixCode}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureMixCode", fileObject);
                  if (fileState) {
                    formik.setTouched({
                      ...formik.touched,
                      pictureMixCode: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureMixCode &&
                  !!formik.errors.pictureMixCode
                }
                helperText={
                  formik.touched.pictureMixCode && formik.errors.pictureMixCode
                }
              />
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
                  formik.touched.expirationDate && formik.errors.expirationDate
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
                What is the unit of measure?
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.isTasteAcceptable}
                onChange={(value) => {
                  formik.setFieldValue("isTasteAcceptable", value);
                }}
                options={[
                  {
                    label: "Count",
                    icon: (
                      <InventoryIcon
                        sx={{
                          fill: colors.ciboInnerGreen[500],
                        }}
                      />
                    ),
                  },
                  {
                    label: "Weight",
                    icon: (
                      <ScaleIcon
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
                Is the seal correct?
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.isSealCorrect}
                onChange={(value) => {
                  formik.setFieldValue("isSealCorrect", value);
                }}
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
            aria-controls="panel2d-content"
            id="panel2d-header"
            expandIcon={<ExpandMoreIcon />}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
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
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
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
            aria-controls="panel3d-content"
            id="panel3d-header"
            expandIcon={<ExpandMoreIcon />}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
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
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
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
            aria-controls="panel4d-content"
            id="panel4d-header"
            expandIcon={<ExpandMoreIcon />}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
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
                alignment={formik.values.metalBallRequired}
                onChange={(value) => {
                  formik.setFieldValue("metalBallRequired", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
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
            aria-controls="panel6d-content"
            id="panel6d-header"
            expandIcon={<ExpandMoreIcon />}
          >
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                LABEL INSPECTION (CCP)
              </Typography>
              <Typography fontWeight={600}>15 Items</Typography>
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
                Correct Container?
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.correctContainer}
                onChange={(value) => {
                  formik.setFieldValue("correctContainer", value);
                }}
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

              <UploadButton
                value={formik.values.pictureLabelFront}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureLabelFront", fileObject);
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureLabelFront: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureLabelFront &&
                  !!formik.errors.pictureLabelFront
                }
                helperText={
                  formik.touched.pictureLabelFront &&
                  formik.errors.pictureLabelFront
                }
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Picture(Back)
              </Typography>

              <UploadButton
                value={formik.values.pictureLabelBack}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureLabelBack", fileObject);
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureLabelBack: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureLabelBack &&
                  !!formik.errors.pictureLabelBack
                }
                helperText={
                  formik.touched.pictureLabelBack &&
                  formik.errors.pictureLabelBack
                }
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Allergen Present?
              </Typography>

              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.allergenPresent}
                onChange={(value) => {
                  formik.setFieldValue("allergenPresent", value);
                }}
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
                Milk
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.milk}
                onChange={(value) => {
                  formik.setFieldValue("milk", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Soy
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.soy}
                onChange={(value) => {
                  formik.setFieldValue("soy", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Egg
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.egg}
                onChange={(value) => {
                  formik.setFieldValue("egg", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Peanut
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.peanut}
                onChange={(value) => {
                  formik.setFieldValue("peanut", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Treenut
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.treenut}
                onChange={(value) => {
                  formik.setFieldValue("treenut", value);
                }}
                options={[
                  {
                    label: "Almond",
                  },
                  {
                    label: "Cashew",
                  },
                  {
                    label: "Macadamia",
                  },
                  {
                    label: "Hazelnut",
                  },
                  {
                    label: "Brazil Nut",
                  },
                  {
                    label: "Pecan",
                  },
                  {
                    label: "Pistachios",
                  },
                  {
                    label: "Walnut",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Wheat
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.wheat}
                onChange={(value) => {
                  formik.setFieldValue("wheat", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
              <Typography
                variant="h6"
                color={colors.grey[100]}
                fontWeight="600"
                sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
              >
                Sesame
              </Typography>
              <ToggleButtonCheck
                style={{ gridColumn: "span 4" }}
                alignment={formik.values.sesame}
                onChange={(value) => {
                  formik.setFieldValue("sesame", value);
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
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

              <UploadButton
                value={formik.values.pictureOfAllergenStatement}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue(
                    "pictureOfAllergenStatement",
                    fileObject
                  );
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureOfAllergenStatement: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureOfAllergenStatement &&
                  !!formik.errors.pictureOfAllergenStatement
                }
                helperText={
                  formik.touched.pictureOfAllergenStatement &&
                  formik.errors.pictureOfAllergenStatement
                }
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

              <UploadButton
                value={formik.values.pictureOfBarcode}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureOfBarcode", fileObject);
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureOfBarcode: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureOfBarcode &&
                  !!formik.errors.pictureOfBarcode
                }
                helperText={
                  formik.touched.pictureOfBarcode &&
                  formik.errors.pictureOfBarcode
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
            <Stack direction="row" justifyContent="space-between" width="100%">
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
              <TextField
                variant="filled"
                type="text"
                label="Units/Case"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.unitsCase}
                name="unitsCase"
                error={!!formik.touched.unitsCase && !!formik.errors.unitsCase}
                helperText={formik.touched.unitsCase && formik.errors.unitsCase}
                sx={{ gridColumn: "span 4" }}
              />
              <TextField
                variant="filled"
                type="text"
                label="Sales Order Number"
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
                }}
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
                Picture of Box-Label
              </Typography>

              <UploadButton
                value={formik.values.pictureOfBoxLabel}
                onFileChange={async function (fileObject, fileState) {
                  await formik.setFieldValue("pictureOfBoxLabel", fileObject);
                  if (fileState) {
                    await formik.setTouched({
                      ...formik.touched,
                      pictureOfBoxLabel: true,
                    });
                  }
                }}
                error={
                  !!formik.touched.pictureOfBoxLabel &&
                  !!formik.errors.pictureOfBoxLabel
                }
                helperText={
                  formik.touched.pictureOfBoxLabel &&
                  formik.errors.pictureOfBoxLabel
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
            <Stack direction="row" justifyContent="space-between" width="100%">
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
                }}
                options={[
                  {
                    label: "Yes",
                  },
                  {
                    label: "No",
                  },
                ]}
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      </form>
    </Box>
  );
};

export default QualityControlPage;
