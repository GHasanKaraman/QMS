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

const ViewCCPPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);

  const loadCCPPage = async () => {
    setOpen(true);
    const res = await axios.post("/ccp/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.ccpForm);
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
    loadCCPPage();
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
          title="Parameters Inspection Form"
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
              CCP-2
            </Typography>
            <Typography fontWeight={600}>29 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Raw temperature >= 65°F"
              subtitle={data?.rawTemperature}
            />
            <StatusIndicator status={data?.rawTemperature >= 65} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Moisture content Raw (4.50-650%)"
              subtitle={data?.moistureContent}
            />
            <StatusIndicator status={4.5 <= data?.moistureContent <= 6.5} />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 1
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (345°F)" subtitle={data?.chamberSet1} />
            <StatusIndicator status={data?.chamberSet1 === 345} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (320°F - 416°F)"
              subtitle={data?.chamberActual1}
            />
            <StatusIndicator
              status={
                320 <= data?.chamberActual1 && data?.chamberActual1 <= 416
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 2
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (342°F)" subtitle={data?.chamberSet2} />
            <StatusIndicator status={data?.chamberSet2 === 342} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (337°F - 372°F)"
              subtitle={data?.chamberActual2}
            />
            <StatusIndicator
              status={
                337 <= data?.chamberActual2 && data?.chamberActual2 <= 372
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 3
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (342°F)" subtitle={data?.chamberSet3} />
            <StatusIndicator status={data?.chamberSet3 === 342} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (338°F - 372°F)"
              subtitle={data?.chamberActual3}
            />
            <StatusIndicator
              status={
                338 <= data?.chamberActual3 && data?.chamberActual3 <= 372
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 4
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (342°F)" subtitle={data?.chamberSet4} />
            <StatusIndicator status={data?.chamberSet4 === 342} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (338°F - 356°F)"
              subtitle={data?.chamberActual4}
            />
            <StatusIndicator
              status={
                338 <= data?.chamberActual4 && data?.chamberActual4 <= 356
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 5
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (335°F)" subtitle={data?.chamberSet5} />
            <StatusIndicator status={data?.chamberSet5 === 335} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (334°F - 348°F)"
              subtitle={data?.chamberActual5}
            />
            <StatusIndicator
              status={
                334 <= data?.chamberActual5 && data?.chamberActual5 <= 348
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 6
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (335°F)" subtitle={data?.chamberSet6} />
            <StatusIndicator status={data?.chamberSet6 === 335} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (334°F - 337°F)"
              subtitle={data?.chamberActual6}
            />
            <StatusIndicator
              status={
                334 <= data?.chamberActual6 && data?.chamberActual6 <= 337
              }
            />
          </Stack>

          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 7
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (335°F)" subtitle={data?.chamberSet7} />
            <StatusIndicator status={data?.chamberSet7 === 335} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (336°F - 338°F)"
              subtitle={data?.chamberActual7}
            />
            <StatusIndicator
              status={
                336 <= data?.chamberActual7 && data?.chamberActual7 <= 338
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Chamber 8
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Set Temp (335°F)" subtitle={data?.chamberSet8} />
            <StatusIndicator status={data?.chamberSet8 === 338} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Actual Temp (337°F - 352°F)"
              subtitle={data?.chamberActual8}
            />
            <StatusIndicator
              status={
                337 <= data?.chamberActual8 && data?.chamberActual8 <= 352
              }
            />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Heating
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 1 (40% Hz)" subtitle={data?.fan1} />
            <StatusIndicator status={data?.fan1 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 2 (40% Hz)" subtitle={data?.fan2} />
            <StatusIndicator status={data?.fan2 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 3 (40% Hz)" subtitle={data?.fan3} />
            <StatusIndicator status={data?.fan3 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 4 (40% Hz)" subtitle={data?.fan4} />
            <StatusIndicator status={data?.fan4 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 5 (40% Hz)" subtitle={data?.fan5} />
            <StatusIndicator status={data?.fan5 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 6 (40% Hz)" subtitle={data?.fan6} />
            <StatusIndicator status={data?.fan6 === 40} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 7 (50% Hz)" subtitle={data?.fan7} />
            <StatusIndicator status={data?.fan7 === 50} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Fan 8 (50% Hz)" subtitle={data?.fan8} />
            <StatusIndicator status={data?.fan8 === 50} />
          </Stack>
          <Typography variant="h5" color={colors.grey[100]} fontWeight="600">
            Cooling
          </Typography>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Zone 1 - Zone 4 (55% Hz)"
              subtitle={data?.zoneCooling}
            />
            <StatusIndicator status={data?.zoneCooling === 55} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Bed Depth (6.2 cm)" subtitle={data?.bedDepth} />
            <StatusIndicator status={data?.bedDepth === 6.2} />
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Belt Speed" subtitle={data?.beltSpeed} />
            <StatusIndicator status={data?.beltSpeed === 21} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="ccp" />
    </Box>
  );
};

export default ViewCCPPage;
