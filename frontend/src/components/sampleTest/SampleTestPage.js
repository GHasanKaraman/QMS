import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Divider,
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
import ImageLabel from "../ImageLabel";
import Label from "../Label";
import { Schedule } from "@mui/icons-material";
import { sendFormOpen, toStringDate } from "../../utils/helpers";
import {
  STAGES,
  getFailedStage,
  getLogTime,
  getNextStage,
  getRetestBase,
  getStageLog,
} from "./stages";

const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];
const SIDES = [
  { label: "LEFT SIDE", side: "Left" },
  { label: "RIGHT SIDE", side: "Right" },
];

const dateFormat = {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};

/*
 * Entry page for tests sampled at the beginning, middle and end of a run.
 * The form is created with the beginning samples (/<path>), then reopened to
 * add the middle and end samples (/<path>/:id/edit). Filled stages are locked.
 * A failed form is closed and can be retested (/<path>/:id/retest): a new
 * linked form that keeps the stages before the failed one and continues from
 * the failed stage.
 *
 * config: { prefix, title, path, formType, responseKey,
 *           question?, withDefects?, withPhotos? }
 */
const SampleTestPage = ({ config, title }) => {
  const { prefix, path, withDefects, withPhotos } = config;
  const { id } = useParams();
  const isContinue = Boolean(id);
  const isRetest = useLocation().pathname.endsWith("/retest");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [stations, setStations] = useState([]);
  const [products, setProducts] = useState([]);
  const [productDetails, setProductDetails] = useState(null);
  // In retest mode: the failed form, and "existing" is the retest to be
  const [original, setOriginal] = useState(null);
  const [existing, setExisting] = useState(null);
  const [existingImages, setExistingImages] = useState([]);
  const [unfinished, setUnfinished] = useState(null);
  const [startNew, setStartNew] = useState(false);

  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = title || "";
  }, [title]);

  const signOut = () => {
    navigate("/login");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    enqueueSnackbar("Please sign in again!", {
      variant: "error",
    });
  };

  const showError = (status) => {
    switch (status) {
      case 404:
        enqueueSnackbar("Station or product is wrong!", { variant: "error" });
        break;
      case 405:
        enqueueSnackbar(
          "Something went wrong while saving the form. Please try again!",
          { variant: "error" },
        );
        break;
      case 409:
        enqueueSnackbar(
          "This stage has already been filled. The form has been reloaded.",
          { variant: "warning" },
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

  const formOpen = async (station, partNum, planId) => {
    const res = await sendFormOpen(config.formType, station, partNum, planId);
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
        return res.data.details;
      }
      showError(res.response?.status);
    } else {
      signOut();
    }
  };

  // An unfinished form of the same run should be continued, not duplicated
  const loadUnfinished = async (station, product, started) => {
    const res = await axios.post(path + "/inprogress", {
      station,
      product,
      started,
    });
    if (userAuth.control(res)) {
      setUnfinished(res?.data?.form || null);
    } else {
      signOut();
    }
  };

  const loadExisting = async () => {
    setOpen(true);
    const res = await axios.post(path + "/get", { id });
    if (userAuth.control(res)) {
      if (res?.data) {
        const loaded = res.data[config.responseKey];
        const form = isRetest ? getRetestBase(loaded, prefix) : loaded;
        setOriginal(isRetest ? loaded : null);
        setExisting(form);
        // Screen photos are not carried over to a retest
        setExistingImages(isRetest ? [] : res.data.images || []);
        formik.resetForm({ values: initialValuesFor(form) });
      } else {
        showError(res.response?.status);
      }
    } else {
      signOut();
    }
    setOpen(false);
  };

  useEffect(() => {
    if (isContinue) {
      loadExisting();
    } else {
      loadAllStations();
    }
  }, [id, isRetest]);

  const canRetest = original?.status === "failed" && !original?.retestedBy;
  const isClosed = isRetest ? !canRetest : Boolean(existing?.completed);
  const stage = !isContinue
    ? STAGES[0]
    : isClosed
      ? undefined
      : getNextStage(existing, prefix);
  const stageIndex = STAGES.indexOf(stage);

  const initialValuesFor = (form) => {
    const formStage = form ? getNextStage(form, prefix) : STAGES[0];
    return {
      station: null,
      shift: null,
      product: null,
      lotCode: "",
      hasRightSide: form?.hasRightSide || "Yes",
      [prefix + "Left" + formStage]: null,
      [prefix + "Right" + formStage]: null,
      leftDefects: form?.[prefix + "LeftDefects"] ?? "",
      rightDefects: form?.[prefix + "RightDefects"] ?? "",
      leftPicture: null,
      rightPicture: null,
    };
  };

  const handleSubmit = async (values) => {
    const hasRight = values.hasRightSide !== "No";
    const data = { stage };
    if (isContinue) {
      data.id = id;
    } else {
      data.station = values.station;
      data.shift = values.shift;
      data.product = values.product.partNum;
      data.lotCode = values.lotCode;
      data.hasRightSide = values.hasRightSide;
      data.started = Number(productDetails?.started);
      data.startDateTime = moment(productDetails?.startDateTime);
    }
    data[prefix + "Left" + stage] = values[prefix + "Left" + stage];
    if (hasRight) {
      data[prefix + "Right" + stage] = values[prefix + "Right" + stage];
    }
    if (withDefects) {
      data[prefix + "LeftDefects"] = values.leftDefects;
      if (hasRight) data[prefix + "RightDefects"] = values.rightDefects;
    }

    let body = data;
    if (withPhotos) {
      body = new FormData();
      for (const name in data) {
        body.append(name, data[name]);
      }
      if (values.leftPicture) {
        body.append("leftPicture", values.leftPicture, "leftPicture.jpeg");
      }
      if (hasRight && values.rightPicture) {
        body.append("rightPicture", values.rightPicture, "rightPicture.jpeg");
      }
    }

    setOpen(true);
    const res = await axios.post(
      path + (isRetest ? "/retest" : isContinue ? "/update" : "/add"),
      body,
    );
    setOpen(false);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar(
          isRetest
            ? "You have successfully created the retest!"
            : isContinue
              ? "You have successfully saved the " + stage.toLowerCase() + "!"
              : "You have successfully created the form!",
          { variant: "success" },
        );
        navigate(path + "/" + res.data.form._id);
      } else {
        showError(res.response?.status);
        if (res.response?.status === 409) loadExisting();
      }
    } else {
      signOut();
    }
  };

  const validationSchema = () => {
    const passFail = yup
      .string()
      .nullable()
      .required("Please select Pass or Fail!");
    const defects = yup
      .number()
      .typeError("Please enter a number!")
      .integer("Please enter a whole number!")
      .min(0, "Number of bags cannot be negative!")
      .required("Please enter the number of bags with defects!");
    const picture = (side) => {
      const schema = yup
        .mixed()
        .nullable()
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || value.size < 1024 * 1024 * 10;
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || SUPPORTED_FORMATS.includes(value?.type);
          },
        );
      // Photos can be attached at any stage but are required by the end
      return stage === "End" && !existingImages[side === "Left" ? 0 : 1]
        ? schema.required("Please upload the picture of the nitrogen screen!")
        : schema;
    };
    const rightSideOnly = (schema) =>
      yup
        .mixed()
        .nullable()
        .when("hasRightSide", { is: "Yes", then: () => schema });

    const shape = {
      [prefix + "Left" + stage]: passFail,
      [prefix + "Right" + stage]: rightSideOnly(passFail),
    };
    if (withDefects) {
      shape.leftDefects = defects;
      shape.rightDefects = rightSideOnly(defects);
    }
    if (withPhotos) {
      shape.leftPicture = picture("Left");
      shape.rightPicture = rightSideOnly(picture("Right"));
    }
    if (!isContinue) {
      shape.station = yup.string().required("Please select the station!");
      shape.shift = yup.string().required("Please select the shift!");
      shape.product = yup
        .mixed()
        .nullable()
        .test(
          "PRODUCT_VALIDATION",
          "Please select the running product!",
          (value) => Boolean(value && value?.partNum !== ""),
        );
      shape.lotCode = yup.string().required("Please enter the lot number!");
    }
    return yup.object().shape(shape);
  };

  const formik = useFormik({
    initialValues: initialValuesFor(null),
    onSubmit: handleSubmit,
    validationSchema,
  });

  const fieldError = (name) => !!formik.touched[name] && !!formik.errors[name];
  const fieldHelper = (name) => formik.touched[name] && formik.errors[name];

  const gridSx = {
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

  // Red is reserved for failures
  const passFailOptions = [
    { label: "Pass", color: colors.ciboInnerGreen[500] },
    { label: "Fail", color: colors.yoggieRed[500] },
  ];

  const renderSamplePoint = (side, point, i) => {
    const name = prefix + side + point;
    if (i < stageIndex) {
      const log = getStageLog(existing, point);
      return (
        <Stack key={name} spacing={1}>
          <Typography color={colors.grey[100]} fontWeight="600">
            {point}
          </Typography>
          <ToggleButtonCheck
            disabled
            alignment={existing?.[name]}
            onChange={() => {}}
            options={passFailOptions}
          />
          <Typography variant="body2" color={colors.grey[300]}>
            {log
              ? "Recorded by " +
                log.username +
                " • " +
                toStringDate(getLogTime(log), dateFormat) +
                (log.carriedFrom ? " • from the failed form" : "")
              : "Recorded"}
          </Typography>
        </Stack>
      );
    }
    if (i > stageIndex) {
      return (
        <Stack key={name} spacing={1}>
          <Typography color={colors.grey[300]} fontWeight="600">
            {point}
          </Typography>
          <ToggleButtonCheck
            disabled
            alignment={null}
            onChange={() => {}}
            options={passFailOptions}
          />
          <Typography variant="body2" color={colors.grey[300]}>
            To be filled later in the run
          </Typography>
        </Stack>
      );
    }
    return (
      <Stack key={name} spacing={1}>
        <Typography color={colors.grey[100]} fontWeight="600">
          {point}
        </Typography>
        <ToggleButtonCheck
          alignment={formik.values[name]}
          onChange={(value) => formik.setFieldValue(name, value)}
          error={fieldError(name)}
          options={passFailOptions}
        />
      </Stack>
    );
  };

  const renderPhoto = (side, label) => {
    const pictureName = side.toLowerCase() + "Picture";
    const image = existingImages[side === "Left" ? 0 : 1];
    if (image) {
      return (
        <ImageLabel
          title={"Photo of Nitrogen Screen (" + label.toLowerCase() + ")"}
          folderIndex={image.folderIndex}
          fileName={image.fileName}
        />
      );
    }
    return (
      <Stack spacing={1}>
        <Typography variant="h6" color={colors.grey[100]} fontWeight="600">
          Photo of Nitrogen Screen ({label.toLowerCase()} results)
          {stage === "End" ? "" : " - can also be added at a later stage"}
        </Typography>
        <UploadImage
          sx={{ justifySelf: "start" }}
          value={formik.values[pictureName]}
          error={fieldError(pictureName)}
          helperText={fieldHelper(pictureName)}
          onChange={(blob) => {
            formik.setFieldValue(pictureName, blob);
          }}
        />
      </Stack>
    );
  };

  const renderSide = ({ label, side }) => {
    const hidden = side === "Right" && formik.values.hasRightSide === "No";
    if (side === "Right" && isContinue && hidden) return undefined;
    const defectsName = side.toLowerCase() + "Defects";
    return (
      <Accordion defaultExpanded key={side}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600} fontSize={18}>
            {label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {side === "Right" && !isContinue ? (
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
                options={[
                  { label: "Yes", color: colors.blueAccent[500] },
                  { label: "No", color: colors.blueAccent[500] },
                ]}
              />
            </Stack>
          ) : undefined}
          <Box sx={{ display: hidden ? "none" : "block" }}>
            <Typography
              variant="h6"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ mb: "15px" }}
            >
              Sample Points
            </Typography>
            {config.question ? (
              <Typography color={colors.grey[300]} sx={{ mb: "15px" }}>
                {config.question}
              </Typography>
            ) : undefined}
            <Box
              display="grid"
              gap="30px"
              gridTemplateColumns="minmax(0, 1fr)"
              sx={gridSx}
            >
              {STAGES.map((point, i) => renderSamplePoint(side, point, i))}
              {withDefects ? (
                <TextField
                  variant="filled"
                  type="number"
                  label="Number of Bags with Defects (total so far)"
                  inputProps={{ min: 0, step: 1 }}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                  value={formik.values[defectsName]}
                  name={defectsName}
                  error={fieldError(defectsName)}
                  helperText={fieldHelper(defectsName)}
                />
              ) : undefined}
              {withPhotos ? renderPhoto(side, label) : undefined}
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>
    );
  };

  const renderRunSelection = () => (
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
          setUnfinished(null);
          setStartNew(false);
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
            error={fieldError("station")}
            helperText={fieldHelper("station")}
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
          setUnfinished(null);
          setStartNew(false);
          formik.setFieldValue("shift", value);
          formik.setFieldValue("product", null);
          if (value != null) {
            await loadProducts(formik.values.station, value);
          }
        }}
        disabled={!Boolean(formik.values.station)}
        error={fieldError("shift")}
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
          setUnfinished(null);
          setStartNew(false);
          if (value != null) {
            const details = await loadDetails(station, value.partNum);
            await formOpen(station, value.partNum, value.planId);
            if (details && !details.err) {
              await loadUnfinished(station, value.partNum, details.started);
            }
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
            error={fieldError("product")}
            helperText={fieldHelper("product")}
          />
        )}
      />
    </Box>
  );

  const renderUnfinishedNotice = () => {
    const failedStage = getFailedStage(unfinished, prefix);
    const nextStage = failedStage || getNextStage(unfinished, prefix);
    return (
      <Alert
        severity={failedStage ? "error" : "warning"}
        sx={{ mb: "20px" }}
        action={
          <Stack direction={isNonMobile ? "row" : "column"} spacing={1}>
            <Button
              color="secondary"
              variant="contained"
              onClick={() =>
                navigate(
                  path +
                    "/" +
                    unfinished._id +
                    (failedStage ? "/retest" : "/edit"),
                )
              }
            >
              {failedStage ? "Retest" : "Continue"} ({nextStage})
            </Button>
            <Button color="inherit" onClick={() => setStartNew(true)}>
              Start new
            </Button>
          </Stack>
        }
      >
        A {config.title.toLowerCase()} for this run was started by{" "}
        {unfinished.username} at{" "}
        {toStringDate(unfinished.createdAt, dateFormat)} (lot{" "}
        {unfinished.lotCode}).{" "}
        {failedStage
          ? "It failed at the " +
            failedStage.toLowerCase() +
            " stage. Retest it from the " +
            failedStage.toLowerCase() +
            " stage."
          : "Continue it to fill the " + nextStage?.toLowerCase() + " samples."}
      </Alert>
    );
  };

  const renderLotNumber = () => (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography fontWeight={600} fontSize={18}>
          LOT NUMBER
        </Typography>
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
          error={fieldError("lotCode")}
          helperText={fieldHelper("lotCode")}
          fullWidth
        />
      </AccordionDetails>
    </Accordion>
  );

  const renderExistingSummary = () => (
    <Box sx={{ mb: "10px" }}>
      <Stack
        direction={isNonMobile ? "row" : "column"}
        spacing={isNonMobile ? 4 : 0}
        flexWrap="wrap"
      >
        <Label title="Station" subtitle={existing.station} />
        <Label title="Shift" subtitle={existing.shift} />
        <Label title="Product" subtitle={existing.product} />
        <Label title="Lot Number" subtitle={existing.lotCode} />
        <Label
          title="Started By"
          subtitle={
            existing.username +
            " • " +
            toStringDate(existing.createdAt, dateFormat)
          }
        />
      </Stack>
      <Divider />
    </Box>
  );

  // Explains where this form stands: retest, failed (closed) or completed
  const renderFormNotice = () => {
    const viewButton = (formID, label) => (
      <Button
        color="secondary"
        variant="contained"
        onClick={() => navigate(path + "/" + formID)}
      >
        {label}
      </Button>
    );
    if (isRetest) {
      if (canRetest) {
        return (
          <Alert
            severity="info"
            sx={{ mb: "10px" }}
            action={viewButton(original._id, "Failed Form")}
          >
            Retest (attempt {existing.attempt}) of the form that failed at the{" "}
            {stage?.toLowerCase()} stage.
            {stageIndex > 0
              ? " Stages before it are carried over from the failed form."
              : ""}
          </Alert>
        );
      }
      return (
        <Alert
          severity="warning"
          sx={{ mb: "10px" }}
          action={
            original?.retestedBy
              ? viewButton(original.retestedBy, "View Retest")
              : viewButton(id, "View")
          }
        >
          {original?.retestedBy
            ? "This form has already been retested."
            : "Only failed forms can be retested."}
        </Alert>
      );
    }
    if (!stage) {
      if (existing.status === "failed") {
        const failedStage = getFailedStage(existing, prefix);
        return (
          <Alert
            severity="error"
            sx={{ mb: "10px" }}
            action={
              existing.retestedBy ? (
                viewButton(existing.retestedBy, "View Retest")
              ) : (
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={() => navigate(path + "/" + id + "/retest")}
                >
                  Retest ({failedStage})
                </Button>
              )
            }
          >
            This form failed
            {failedStage
              ? " at the " + failedStage.toLowerCase() + " stage"
              : ""}{" "}
            and can't be continued.
            {existing.retestedBy ? " It has been retested." : ""}
          </Alert>
        );
      }
      return (
        <Alert
          severity="success"
          sx={{ mb: "10px" }}
          action={viewButton(id, "View")}
        >
          All samples of this form have been filled.
        </Alert>
      );
    }
    return undefined;
  };

  const showSamples = isContinue
    ? Boolean(existing && stage)
    : productDetails != null &&
      !productDetails?.err &&
      formik.values.product != null &&
      (!unfinished || startNew);

  return (
    <Box m="0 20px" sx={gridSx}>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Header
        title={config.title}
        subtitle={
          isContinue
            ? stage
              ? (isRetest ? "Retest: fill out the " : "Fill out the ") +
                stage.toLowerCase() +
                " of the run samples"
              : ""
            : "Fill out the beginning of the run samples. Middle and end are added later from the same form."
        }
      />
      {existing ? renderFormNotice() : undefined}
      <form
        encType={withPhotos ? "multipart/form-data" : undefined}
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
        {isContinue
          ? existing
            ? renderExistingSummary()
            : undefined
          : renderRunSelection()}
        {!isContinue && unfinished && !startNew && formik.values.product
          ? renderUnfinishedNotice()
          : undefined}
        <div style={{ display: showSamples ? "block" : "none" }}>
          {isContinue ? undefined : renderLotNumber()}
          {SIDES.map(renderSide)}

          <Box display="flex" justifyContent="center" mt="20px">
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              sx={{ width: "100%" }}
            >
              {stage ? "Save " + stage : "Save"}
            </Button>
          </Box>
        </div>
      </form>
    </Box>
  );
};

export default SampleTestPage;
