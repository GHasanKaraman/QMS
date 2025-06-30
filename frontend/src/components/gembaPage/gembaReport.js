import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
  useMediaQuery,
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

import "../formStatus.css";
import RunLabel from "../RunLabel";
import ImageLabel from "../ImageLabel";

const GEMBAReportPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [open, setOpen] = useState(false);

  const loadGEMBAPage = async () => {
    setOpen(true);
    const res = await axios.post("/gemba/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.gemba);
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
    loadGEMBAPage();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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
          title="GEMBA Report"
          subtitle={
            "Trigger: Report Created (" +
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
            " • Area: " +
            data?.area
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
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              GEMBA CHECKS
            </Typography>
            <Typography fontWeight={600}>
              {data?.questions.length + 1 + " Items"}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Area #" subtitle={data?.area} />
            <StatusIndicator status={Boolean(data?.area)} />
          </Stack>
          <Divider />
          {data?.questions.map((question, i) => {
            if (question?.answer === "Fail") {
              var comment = data?.comments.shift() ?? "";
              var image = data?.images.shift() ?? "";
            }
            return (
              <Stack key={i}>
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title={question.question}
                    subtitle={question?.answer}
                  />
                  <StatusIndicator status={question?.answer === "Pass"} />
                </Stack>
                {question?.answer === "Fail" ? (
                  <Stack
                    direction="row"
                    justifyContent="space-around"
                    textAlign="center"
                    alignItems="center"
                  >
                    <Typography>{comment}</Typography>
                    <ImageLabel
                      width={100}
                      folderIndex={image?.folderIndex}
                      fileName={image?.fileName}
                    />
                  </Stack>
                ) : undefined}
                <Divider />
              </Stack>
            );
          })}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default GEMBAReportPage;
