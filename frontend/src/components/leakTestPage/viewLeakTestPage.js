import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
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

import { toStringDate } from "../../utils/helpers";
import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import StatusIndicator from "../StatusIndicator";
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";

const SAMPLE_POINTS = ["Beginning", "Middle", "End"];

const ViewLeakTestPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);

  const loadLeakTestPage = async () => {
    setOpen(true);
    const res = await axios.post("/leaktest/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.leakTestForm);
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
    loadLeakTestPage();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const renderSide = (label, side) => {
    const defects = data?.["leak" + side + "Defects"];
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
          {SAMPLE_POINTS.map((point) => {
            const value = data?.["leak" + side + point];
            return (
              <div key={point}>
                <Stack direction="row" justifyContent="space-between">
                  <Label title={"Sample Point: " + point} subtitle={value} />
                  <StatusIndicator status={value === "Pass"} />
                </Stack>
                <Divider />
              </div>
            );
          })}
          <Stack direction="row" justifyContent="space-between">
            <Label title="Number of Bags with Defects" subtitle={defects} />
            <StatusIndicator status={defects === 0} />
          </Stack>
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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header
          title="Leak Test Form"
          subtitle={
            "Trigger: Run Started (" +
            toStringDate(data?.createdAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }) +
            ") • Updated: " +
            toStringDate(data?.updatedAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }) +
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
          <div className="swing">
            {data ? (
              data?.status === "passed" ? (
                <ThumbUpIcon
                  sx={{
                    color: colors.ciboInnerGreen[500],
                    fontSize: "25px",
                  }}
                />
              ) : (
                <ThumbDownIcon
                  sx={{
                    color: colors.yoggieRed[500],
                    fontSize: "25px",
                  }}
                />
              )
            ) : undefined}
          </div>
          <Box
            sx={{
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {data
              ? data?.status === "passed"
                ? "Passed"
                : "Failed"
              : undefined}
          </Box>
        </Stack>
      </Stack>
      <Divider />
      <Label
        title="Completed By"
        subtitle={
          data?.username +
          " • " +
          toStringDate(data?.createdAt, {
            month: "short",
            year: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
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
                toStringDate(data?.signOff.createdAt, {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
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
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              LOT NUMBER
            </Typography>
            <Typography fontWeight={600}>1 Item</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Lot Number" subtitle={data?.lotCode} />
            <StatusIndicator status={Boolean(data?.lotCode)} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {renderSide("LEFT SIDE", "Left")}
      {data?.hasRightSide === "No" ? (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600} fontSize={18}>
              RIGHT SIDE
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Label
              title="Right Side"
              subtitle="Not applicable (single-sided machine)"
            />
          </AccordionDetails>
        </Accordion>
      ) : (
        renderSide("RIGHT SIDE", "Right")
      )}

      <CommentAccordion formID={id} form="leaktest" />
    </Box>
  );
};

export default ViewLeakTestPage;
