import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { Box, Chip, Divider, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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

const ViewDirectObservationMetalDetectorPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [product, setProduct] = useState();

  const loadMetalDetectorPage = async () => {
    const res = await axios.post("/metaldetector/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.metalDetectorForm);
      setProduct(res.data.product);
      console.log(res.data.metalDetectorForm);
      console.log(res.data.product);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    loadMetalDetectorPage();
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
      <Header
        title="Direct Observation Metal Detector"
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
      <Divider />
      <Label
        title="To"
        subtitle="Gurkan Karaman, Rabi Alam, Joseph Ben Yakob, Moshe Ben Yahuda"
      />
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
      <Label title="Data Sheet Signed Off" subtitle="Not Signed Off" />
      <Divider />
      <Label title="Run" subtitle="Started Dec 12, 2023 at 9.04 AM" />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              PRODUCT INFORMATION
            </Typography>
            <Typography fontWeight={600}>5 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Product name"
              subtitle={product?.part + " - " + product?.desc}
            />
            <StatusIndicator status={Boolean(product?.part)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Machine #" subtitle={data?.station} />
            <StatusIndicator status={Boolean(data?.station)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Lot Code #" subtitle={data?.lotCode} />
            <StatusIndicator status={Boolean(data?.lotCode)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Person Being Observed"
              subtitle={data?.personBeingObserved}
            />
            <StatusIndicator status={Boolean(data?.personBeingObserved)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Ball or Card?" subtitle={data?.ballOrCard} />
            <StatusIndicator status={Boolean(data?.ballOrCard)} />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ViewDirectObservationMetalDetectorPage;
