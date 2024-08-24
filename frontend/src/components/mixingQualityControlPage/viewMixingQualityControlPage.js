import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import PrintIcon from "@mui/icons-material/Print";

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

const ViewMixingQualityControlPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState();
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [clicked, setClicked] = useState(false);

  const loadLotInspectionPage = async () => {
    setOpen(true);
    const res = await axios.post("/mixingquality/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.mixingQualityForm);
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

  const handleSignOff = async () => {
    if (!clicked) {
      const res = await axios.post("/mixingquality/signoff", { id });
      if (userAuth.control(res)) {
        switch (res.response?.status) {
          case 200:
            enqueueSnackbar("You have successfully signed off the form!", {
              variant: "success",
            });
            break;
          case 400:
            enqueueSnackbar("Something went wrong while signin off the form!", {
              variant: "error",
            });
            break;
          case 406:
            enqueueSnackbar("You don't have an access for this action!", {
              variant: "error",
            });
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            break;
          case 503:
            enqueueSnackbar("Something went wrong with the server!", {
              variant: "error",
            });
            break;
          default:
            break;
        }
        await loadLotInspectionPage();
        setOpenDialog(false);
      } else {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        enqueueSnackbar("Please sign in again!", {
          variant: "error",
        });
      }
    }

    setClicked(true);
  };

  useEffect(() => {
    loadLotInspectionPage();
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
            Do you really want to sign-off this form?
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
            Disagree
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={handleSignOff}
            autoFocus
          >
            Agree
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header
          title="Mixing Quality Control"
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
      <Button
        sx={{ marginY: "3px", borderWidth: "2px", fontWeight: "700" }}
        variant="outlined"
        id="button"
        color="secondary"
        startIcon={<PrintIcon />}
        onClick={() => {
          window.print();
        }}
      >
        Print
      </Button>
      <Divider />
      <Label
        title="Data Sheet Signed Off"
        subtitle={
          data ? (
            data?.signedOff === "" ? (
              localStorage.getItem("access").includes("S") ? (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ fontWeight: "600" }}
                  onClick={() => {
                    setOpenDialog(true);
                  }}
                >
                  Sign Off
                </Button>
              ) : (
                "Not Signed Off"
              )
            ) : (
              data?.signedOff +
              " • " +
              toStringDate(data?.signOffDate, {
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })
            )
          ) : (
            ""
          )
        }
      />
      <RunLabel started={data?.started} startDateTime={data?.startDateTime} />
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              MIXING CHECKS
            </Typography>
            <Typography fontWeight={600}>3 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Probiotic jars correctly labelled?"
              subtitle={data?.correctLabel}
            />
            <StatusIndicator status={data?.correctLabel !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Probiotic Mix Lot Code?"
              subtitle={data?.probioticMixLot}
            />
            <StatusIndicator status={data?.probioticMixLot !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Cleaning by Allergen or Quality?"
              subtitle={data?.cleaning}
            />
            <StatusIndicator status={data?.cleaning !== "Quality"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Allergens kept separate?"
              subtitle={data?.allergensSeparate}
            />
            <StatusIndicator status={data?.allergensSeparate === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Sensory evaluation?" subtitle={data?.sensory} />
            <StatusIndicator status={data?.sensory === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Floor is clean?" subtitle={data?.cleanFloor} />
            <StatusIndicator status={data?.cleanFloor === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Allergens kept separate?"
              subtitle={data?.garbageOrganized}
            />
            <StatusIndicator status={data?.garbageOrganized === "Yes"} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="mixingQuality" />
    </Box>
  );
};

export default ViewMixingQualityControlPage;
