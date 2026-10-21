import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Alert,
  Box,
  Button,
  Link,
  Divider,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

import { toStringDate } from "../../utils/helpers";
import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import StatusIndicator from "../StatusIndicator";
import ImageLabel from "../ImageLabel";
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";
import {
  STAGES,
  getFailedStage,
  getLogTime,
  getNextStage,
  getStageLog,
  statusLabel,
} from "./stages";

const dateFormat = {
  month: "short",
  year: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
};

// Data sheet of a test sampled at the beginning, middle and end of a run.
// Shares its config with SampleTestPage.
const SampleTestViewPage = ({ config, title }) => {
  const { prefix, path, withDefects, withPhotos } = config;
  const { id } = useParams();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);

  const loadForm = async () => {
    setOpen(true);
    const res = await axios.post(path + "/get", { id });
    if (userAuth.control(res)) {
      setData(res.data[config.responseKey]);
      setImages(res.data.images || []);
      setProduct(res.data.product);
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

  useEffect(() => {
    loadForm();
  }, [id]);

  useEffect(() => {
    document.title = title || "";
  }, [title]);

  const nextStage = data?.completed ? undefined : getNextStage(data, prefix);
  const failedStage =
    data?.status === "failed" ? getFailedStage(data, prefix) : undefined;

  const renderSide = (label, side) => {
    if (side === "Right" && data?.hasRightSide === "No") {
      return (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600} fontSize={18}>
              {label}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Label
              title="Right Side"
              subtitle="Not applicable (single-sided machine)"
            />
          </AccordionDetails>
        </Accordion>
      );
    }
    const defects = data?.[prefix + side + "Defects"];
    const image = images[side === "Left" ? 0 : 1];
    return (
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600} fontSize={18}>
            {label}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {STAGES.map((stage) => {
            const value = data?.[prefix + side + stage];
            const log = getStageLog(data, stage);
            return (
              <div key={stage}>
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title={
                      stage + (config.question ? " - " + config.question : "")
                    }
                    subtitle={
                      value
                        ? value +
                          (log
                            ? " • " +
                              log.username +
                              " • " +
                              toStringDate(getLogTime(log), dateFormat) +
                              (log.carriedFrom ? " • from the failed form" : "")
                            : "")
                        : "Not filled yet"
                    }
                  />
                  {value ? (
                    <StatusIndicator status={value === "Pass"} />
                  ) : undefined}
                </Stack>
                <Divider />
              </div>
            );
          })}
          {withDefects ? (
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Number of Bags with Defects"
                subtitle={defects ?? "-"}
              />
              <StatusIndicator
                status={defects !== null && defects !== undefined}
              />
            </Stack>
          ) : undefined}
          {withPhotos ? (
            <Stack direction="row" justifyContent="space-between">
              {image ? (
                <ImageLabel
                  title="Photo of Nitrogen Screen"
                  folderIndex={image.folderIndex}
                  fileName={image.fileName}
                />
              ) : (
                <Label
                  title="Photo of Nitrogen Screen"
                  subtitle="Not attached yet"
                />
              )}
              <StatusIndicator status={Boolean(image)} />
            </Stack>
          ) : undefined}
        </AccordionDetails>
      </Accordion>
    );
  };

  const statusIcon = () => {
    const sx = { fontSize: "25px" };
    if (data?.status === "passed") {
      return <ThumbUpIcon sx={{ ...sx, color: colors.ciboInnerGreen[500] }} />;
    }
    if (data?.status === "inProgress") {
      return (
        <HourglassTopIcon sx={{ ...sx, color: colors.orangeAccent[500] }} />
      );
    }
    return <ThumbDownIcon sx={{ ...sx, color: colors.yoggieRed[500] }} />;
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header
          title={config.title + " Form"}
          subtitle={
            "Trigger: Run Started (" +
            toStringDate(data?.createdAt, dateFormat) +
            ") • Updated: " +
            toStringDate(data?.updatedAt, dateFormat) +
            " • Station: " +
            data?.station +
            " • Product Type: " +
            product?.desc +
            " • SKU: " +
            product?.part
          }
        />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ pl: "20px" }}
        >
          <div className="swing">{data ? statusIcon() : undefined}</div>
          <Box sx={{ fontWeight: "600", fontSize: "18px" }}>
            {data ? statusLabel(data.status) : undefined}
          </Box>
        </Stack>
      </Stack>
      {data && nextStage ? (
        <Button
          color="secondary"
          variant="contained"
          sx={{ width: "100%", mb: "10px" }}
          onClick={() => navigate(path + "/" + id + "/edit")}
        >
          Continue: Fill {nextStage} Samples
        </Button>
      ) : undefined}
      {failedStage && !data?.retestedBy ? (
        <Button
          color="secondary"
          variant="contained"
          sx={{ width: "100%", mb: "10px" }}
          onClick={() => navigate(path + "/" + id + "/retest")}
        >
          Retest from {failedStage}
        </Button>
      ) : undefined}
      {data?.retestOf || data?.retestedBy ? (
        <Alert severity="info" sx={{ mb: "10px" }}>
          <Stack spacing={0.5}>
            {data.retestOf ? (
              <div>
                This is retest attempt {data.attempt} of a failed form.{" "}
                <Link
                  component="button"
                  color="secondary"
                  onClick={() => navigate(path + "/" + data.retestOf)}
                >
                  View previous attempt
                </Link>
              </div>
            ) : undefined}
            {data.retestedBy ? (
              <div>
                This form failed
                {failedStage
                  ? " at the " + failedStage.toLowerCase() + " stage"
                  : ""}{" "}
                and has been retested.{" "}
                <Link
                  component="button"
                  color="secondary"
                  onClick={() => navigate(path + "/" + data.retestedBy)}
                >
                  View retest (attempt {(data.attempt || 1) + 1})
                </Link>
              </div>
            ) : undefined}
          </Stack>
        </Alert>
      ) : undefined}
      <Divider />
      <Label
        title="Started By"
        subtitle={
          data?.username + " • " + toStringDate(data?.createdAt, dateFormat)
        }
      />
      <Divider />
      <Label
        title="Data Sheet Signed Off"
        subtitle={
          data
            ? !data.signOff
              ? "Not Signed Off"
              : data?.signOff.signedOff +
                " • " +
                toStringDate(data?.signOff.createdAt, dateFormat)
            : ""
        }
      />
      <RunLabel
        started={data?.started}
        startDateTime={data?.startDateTime}
        shift={data?.shift}
      />

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600} fontSize={18}>
            LOT NUMBER
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Lot Number" subtitle={data?.lotCode} />
            <StatusIndicator status={Boolean(data?.lotCode)} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {renderSide("LEFT SIDE", "Left")}
      {renderSide("RIGHT SIDE", "Right")}

      <CommentAccordion formID={id} form={path.slice(1)} />
    </Box>
  );
};

export default SampleTestViewPage;
