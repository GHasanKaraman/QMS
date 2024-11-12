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
import ImageLabel from "../ImageLabel";

const ViewMixingQualityControlPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [clicked, setClicked] = useState(false);

  const loadLotInspectionPage = async () => {
    setOpen(true);
    const res = await axios.post("/mixingquality/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.mixingQualityForm);
      setImages(res.data.images);
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
              MIXING CHECKS
            </Typography>
            <Typography fontWeight={600}>3 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Probiotic jars correctly labelled?"
              subtitle={
                <LabelResult
                  text={data?.correctLabel}
                  status={data?.correctLabel !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.correctLabel !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Probiotic Mix Lot Code?"
              subtitle={
                <LabelResult
                  text={data?.probioticMixLot}
                  status={data?.probioticMixLot !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.probioticMixLot !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Cleaning by Allergen or Quality?"
              subtitle={
                <LabelResult
                  text={data?.cleaning}
                  status={data?.cleaning !== "Quality"}
                />
              }
            />
            <StatusIndicator status={data?.cleaning !== "Quality"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Allergens kept separate?"
              subtitle={
                <LabelResult
                  text={data?.allergensSeparate}
                  status={data?.allergensSeparate === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.allergensSeparate === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Sensory evaluation?"
              subtitle={
                <LabelResult
                  text={data?.sensory}
                  status={data?.sensory === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.sensory === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Floor is clean?"
              subtitle={
                <LabelResult
                  text={data?.cleanFloor}
                  status={data?.cleanFloor === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.cleanFloor === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Garbage Organized?"
              subtitle={
                <LabelResult
                  text={data?.garbageOrganized}
                  status={data?.garbageOrganized === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.garbageOrganized === "Yes"} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              PICTURES
            </Typography>
            <Typography fontWeight={600}>2 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {images.map((image, index) => {
            if (index !== images.length - 1) {
              return (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  key={index}
                >
                  <ImageLabel
                    title={`Ingredient ${index + 1}`}
                    folderIndex={image?.folderIndex}
                    fileName={image?.fileName}
                  />
                  <StatusIndicator status={Boolean(image)} />
                </Stack>
              );
            }
          })}
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture of Finished Product"
              folderIndex={images[images.length - 1]?.folderIndex}
              fileName={images[images.length - 1]?.fileName}
            />
            <StatusIndicator status={Boolean(images[images.length - 1])} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              ANY DEVIATIONS?
            </Typography>
            <Typography fontWeight={600}>9 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Any deviations?" subtitle={data?.anyDeviations} />
            <StatusIndicator status={Boolean(data?.anyDeviations)} />
          </Stack>
          {data?.anyDeviations === "Yes"
            ? [
                <Divider key="first" />,
                <Stack
                  direction="row"
                  key="second"
                  justifyContent="space-between"
                >
                  <Label
                    title="Deviation Form"
                    subtitle={
                      <a
                        href={`http://10.12.11.192:3000/deviation/${data?.deviationID}`}
                      >
                        {data?.deviationID}
                      </a>
                    }
                  />
                  <StatusIndicator status={Boolean(data?.anyDeviations)} />
                </Stack>,
              ]
            : undefined}
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="mixingQuality" />
    </Box>
  );
};

export default ViewMixingQualityControlPage;
