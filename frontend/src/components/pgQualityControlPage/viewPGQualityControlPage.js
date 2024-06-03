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
import LabelResult from "../LabelResult";
import StatusIndicator from "../StatusIndicator";
import ImageLabel from "../ImageLabel";
import MultipleImageLabel from "../MultipleImageLabel";
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";

const ViewPGQualityControlPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);

  const [clicked, setClicked] = useState(false);

  const loadPGQualityControlPage = async () => {
    setOpen(true);
    const res = await axios.post("/pgqualitycontrol/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.qualityControlForm);
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
      const res = await axios.post("/pgqualitycontrol/signoff", { id });
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
        }
        await loadPGQualityControlPage();
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
    loadPGQualityControlPage();
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
          title="P&G Quality Check"
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
                  onClick={handleSignOff}
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
              METAL DETECTOR BALLS CHECK
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Metal Detector Required?"
              subtitle={
                <LabelResult
                  text={data?.metalDetector}
                  status={data?.metalDetector !== "No"}
                />
              }
            />
            <StatusIndicator status={Boolean(data?.metalDetector)} />
          </Stack>
          {data?.metalDetector === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallFeDetected}
                      status={data?.metalBallFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalBallFeDetected === "Yes"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 4.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallNonFeDetected}
                      status={data?.metalBallNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallNonFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallSsDetected}
                      status={data?.metalBallSsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalBallSsDetected === "Yes"} />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              POUCH
            </Typography>
            <Typography fontWeight={600}>13 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Raw Product"
              folderIndex={images[0]?.folderIndex}
              fileName={images[0]?.fileName}
            />
            <StatusIndicator status={Boolean(images[0])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Are the ingredients correct?"
              subtitle={
                <LabelResult
                  text={data?.areIngredientsCorrect}
                  status={data?.areIngredientsCorrect !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.areIngredientsCorrect !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <MultipleImageLabel
              title1="Label Inspection"
              folderIndex1={images[1]?.folderIndex}
              fileName1={images[1]?.fileName}
              title2="Picture of Expiration Date"
              folderIndex2={images[2]?.folderIndex}
              fileName2={images[2]?.fileName}
            />
            <StatusIndicator
              status={Boolean(images[1]) && Boolean(images[2])}
            />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Expiration Date"
              subtitle={toStringDate(data?.expirationDatePouch, {
                month: "numeric",
                year: "numeric",
              })}
            />
            <StatusIndicator status={Boolean(data?.expirationDatePouch)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Pouch Lot Code" subtitle={data?.lotCodePouch} />
            <StatusIndicator status={Boolean(data?.lotCodePouch)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Current Weight" subtitle={data?.currentWeightPouch} />
            <StatusIndicator status={Boolean(data?.currentWeightPouch)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the notch correct?"
              subtitle={
                <LabelResult
                  text={data?.isNotchCorrect}
                  status={data?.isNotchCorrect !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.isNotchCorrect !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the seal correct?"
              subtitle={
                <LabelResult
                  text={data?.isSealCorrectPouch}
                  status={data?.isSealCorrectPouch === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.isSealCorrectPouch === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Metal Detector?"
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
            <ImageLabel
              title="Allergen Statement"
              folderIndex={images[3]?.folderIndex}
              fileName={images[3]?.fileName}
            />
            <StatusIndicator status={Boolean(images[3])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Panning Batch"
              folderIndex={images[4]?.folderIndex}
              fileName={images[4]?.fileName}
            />
            <StatusIndicator status={Boolean(images[4])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Sugar Shelled Batch"
              folderIndex={images[5]?.folderIndex}
              fileName={images[5]?.fileName}
            />
            <StatusIndicator status={Boolean(images[5])} />
          </Stack>
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              BOX
            </Typography>
            <Typography fontWeight={600}>5 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <MultipleImageLabel
              title1="Label Inspection"
              folderIndex1={images[6]?.folderIndex}
              fileName1={images[6]?.fileName}
              title2="Label Inspection"
              folderIndex2={images[7]?.folderIndex}
              fileName2={images[7]?.fileName}
            />
            <StatusIndicator
              status={Boolean(images[6]) && Boolean(images[7])}
            />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Current Weight" subtitle={data?.currentWeightBox} />
            <StatusIndicator status={Boolean(data?.currentWeightBox)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the seal correct?"
              subtitle={
                <LabelResult
                  text={data?.isSealCorrectBox}
                  status={data?.isSealCorrectBox === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.isSealCorrectBox === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Allergen Statement"
              folderIndex={images[8]?.folderIndex}
              fileName={images[8]?.fileName}
            />
            <StatusIndicator status={Boolean(images[8])} />
          </Stack>
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              CASE
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Label Inspection"
              folderIndex={images[9]?.folderIndex}
              fileName={images[9]?.fileName}
            />
            <StatusIndicator status={Boolean(images[9])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Expiration Date"
              subtitle={toStringDate(data?.expirationDateCase, {
                month: "numeric",
                year: "numeric",
              })}
            />
            <StatusIndicator status={Boolean(data?.expirationDateCase)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Case Lot Code" subtitle={data?.lotCodeCase} />
            <StatusIndicator status={Boolean(data?.lotCodeCase)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Pattern"
              folderIndex={images[10]?.folderIndex}
              fileName={images[10]?.fileName}
            />
            <StatusIndicator status={Boolean(images[10])} />
          </Stack>
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              PALLET
            </Typography>
            <Typography fontWeight={600}>1 Item</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Pattern"
              folderIndex={images[11]?.folderIndex}
              fileName={images[11]?.fileName}
            />
            <StatusIndicator status={Boolean(images[11])} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <CommentAccordion formID={id} form="pgQualityControl" />
    </Box>
  );
};

export default ViewPGQualityControlPage;
