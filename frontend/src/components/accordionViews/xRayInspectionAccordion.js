import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Checkbox, Divider, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import StatusIndicator from "../StatusIndicator";

import "../formStatus.css";

const XRAYInspectionAccordion = ({ id, expanded, isForm, onChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [product, setProduct] = useState();

  const loadMetalDetectorPage = async () => {
    const res = await axios.post("/xray/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.xRayForm);
      setProduct(res.data.product);
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

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        disableIcon
        sx={{
          "& .MuiAccordionSummary-content": {
            margin: "0px !important",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography
            component="a"
            onClick={() => {
              navigate("/xray/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Direct Observation XRAY Inspection
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography
              fontWeight={600}
              fontSize={16}
              sx={{
                color: colors.contrast[300],
                background:
                  data?.status === "passed"
                    ? colors.ciboInnerGreen[500]
                    : colors.yoggieRed[500],
                p: 2,
              }}
            >
              {data?.status === "passed" ? "Pass" : "Failed"}
            </Typography>

            {isForm === true ? (
              <Checkbox
                size="large"
                color="secondary"
                onChange={(_, checked) => {
                  onChange(data._id, checked);
                }}
              />
            ) : undefined}
          </Stack>
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
      </AccordionDetails>
    </Accordion>
  );
};
export default XRAYInspectionAccordion;
