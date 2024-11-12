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
import LabelResult from "../LabelResult";

const ViewPreOperationalPage = (props) => {
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
    const res = await axios.post("/preoperational/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.preOperationalForm);
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
      const res = await axios.post("/signoff", { id });
      if (userAuth.control(res)) {
        switch (res.response?.status) {
          case 201:
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
          title="Pre-Operational Inspection Form"
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
      <RunLabel started={data?.started} startDateTime={data?.startDateTime} />
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              CLEANING ACTIVITIES
            </Typography>
            <Typography fontWeight={600}>10 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Dumper"
              subtitle={
                <LabelResult
                  text={data?.dumper}
                  status={data?.dumper !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.dumper !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Elevator"
              subtitle={
                <LabelResult
                  text={data?.elevator}
                  status={data?.elevator !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.elevator !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Metal Detector"
              subtitle={
                <LabelResult
                  text={data?.metalDetector}
                  status={data?.metalDetector !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.metalDetector !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Conveyor"
              subtitle={
                <LabelResult
                  text={data?.conveyor}
                  status={data?.conveyor !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.conveyor !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Sealer"
              subtitle={
                <LabelResult
                  text={data?.sealer}
                  status={data?.sealer !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.sealer !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Turntable"
              subtitle={
                <LabelResult
                  text={data?.turntable}
                  status={data?.turntable !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.turntable !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Platform"
              subtitle={
                <LabelResult
                  text={data?.platform}
                  status={data?.platform !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.platform !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Floor"
              subtitle={
                <LabelResult text={data?.floor} status={data?.floor !== "No"} />
              }
            />
            <StatusIndicator status={data?.floor !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Drum"
              subtitle={
                <LabelResult text={data?.drum} status={data?.drum !== "No"} />
              }
            />
            <StatusIndicator status={data?.drum !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Belts"
              subtitle={
                <LabelResult text={data?.belts} status={data?.belts !== "No"} />
              }
            />
            <StatusIndicator status={data?.belts !== "No"} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              GENERAL CONDITION
            </Typography>
            <Typography fontWeight={600}>5 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Plant & equipment in good condition. No broken equipment?"
              subtitle={
                <LabelResult
                  text={data?.goodCondition}
                  status={data?.goodCondition === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.goodCondition === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="No loose/frayed part on machines?"
              subtitle={
                <LabelResult
                  text={data?.noLoose}
                  status={data?.noLoose === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.noLoose === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="No chemicals containers left out on equipment/tables?"
              subtitle={
                <LabelResult
                  text={data?.noChemicals}
                  status={data?.noChemicals === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.noChemicals === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="No glass or other contaminants?"
              subtitle={
                <LabelResult
                  text={data?.noGlass}
                  status={data?.noGlass === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.noGlass === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Garbage and empty boxes are removed from the area?"
              subtitle={
                <LabelResult
                  text={data?.garbageRemoved}
                  status={data?.garbageRemoved === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.garbageRemoved === "Pass"} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              EMPLOYEE PRACTICES
            </Typography>
            <Typography fontWeight={600}>3 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Wearing clean lab coats, hairnets, and beard nets?"
              subtitle={
                <LabelResult
                  text={data?.wearingCoat}
                  status={data?.wearingCoat === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.wearingCoat === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Complying with GMPs. No jewelry, no outside food/drinks?"
              subtitle={
                <LabelResult
                  text={data?.complyingGMP}
                  status={data?.complyingGMP === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.complyingGMP === "Pass"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="No sick employees observed?"
              subtitle={
                <LabelResult
                  text={data?.noSick}
                  status={data?.noSick === "Pass"}
                />
              }
            />
            <StatusIndicator status={data?.noSick === "Pass"} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              OBSERVATIONS
            </Typography>
            <Typography fontWeight={600}>1 Item</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="OK to start production?"
              subtitle={
                <LabelResult
                  text={data?.okStart}
                  status={data?.okStart === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.okStart === "Yes"} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="preOperational" />
    </Box>
  );
};

export default ViewPreOperationalPage;
