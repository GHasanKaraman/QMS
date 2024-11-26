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
import ImageLabel from "../ImageLabel";
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";

const ViewLotInspectionPage = (props) => {
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
    const res = await axios.post("/lotinspection/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.lotInspectionForm);
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
      <Backdrop
        sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={open}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header
          title="LOT Inspection Form"
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
              SALES ORDER NUMBER
            </Typography>
            <Typography fontWeight={600}>3 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Sales Order Number"
              subtitle={
                data?.salesOrderNumber === ""
                  ? "Not Given"
                  : data?.salesOrderNumber
              }
            />
            <StatusIndicator status={Boolean(data?.salesOrderNumber)} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              1. ITEM NAME
            </Typography>
            <Typography fontWeight={600}>3 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Item Code" subtitle={data?.itemCode1} />
            <StatusIndicator status={Boolean(data?.itemCode1)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Lot Code" subtitle={data?.lotCode1} />
            <StatusIndicator status={Boolean(data?.lotCode1)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture of Back, Single (Multipack )"
              folderIndex={images[0]?.folderIndex}
              fileName={images[0]?.fileName}
            />
            <StatusIndicator status={Boolean(images[0])} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      {data?.itemCode2 !== "" ? (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                2. ITEM NAME
              </Typography>
              <Typography fontWeight={600}>3 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode2} />
              <StatusIndicator status={Boolean(data?.itemCode2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode2} />
              <StatusIndicator status={Boolean(data?.lotCode2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[1]?.folderIndex}
                fileName={images[1]?.fileName}
              />
              <StatusIndicator status={Boolean(images[1])} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : undefined}
      {data?.itemCode3 !== "" ? (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                3. ITEM NAME
              </Typography>
              <Typography fontWeight={600}>3 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode3} />
              <StatusIndicator status={Boolean(data?.itemCode3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode3} />
              <StatusIndicator status={Boolean(data?.lotCode3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[2]?.folderIndex}
                fileName={images[2]?.fileName}
              />
              <StatusIndicator status={Boolean(images[2])} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : undefined}
      {data?.itemCode4 !== "" ? (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                4. ITEM NAME
              </Typography>
              <Typography fontWeight={600}>3 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode4} />
              <StatusIndicator status={Boolean(data?.itemCode4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode4} />
              <StatusIndicator status={Boolean(data?.lotCode4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[3]?.folderIndex}
                fileName={images[3]?.fileName}
              />
              <StatusIndicator status={Boolean(images[3])} />
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : undefined}
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
                <Divider />,
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Deviation Form"
                    subtitle={
                      <a
                        href={`http://10.12.11.192:3000/deviations/ciboqa/${data?.deviationID}`}
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

      <CommentAccordion formID={id} form="lotinspection" />
    </Box>
  );
};

export default ViewLotInspectionPage;
