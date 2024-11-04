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
import LabelResult from "../LabelResult";
import StatusIndicator from "../StatusIndicator";

import "../formStatus.css";

const LabelInspectionAccordion = ({ id, expanded, isForm, onChange }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();

  const loadLabelInspectionPage = async () => {
    const res = await axios.post("/labelinspection/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.labelInspectionForm);
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
    loadLabelInspectionPage();
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
          justifyContent="space-between"
          width="100%"
          alignItems="center"
        >
          <Typography
            component="a"
            onClick={() => {
              navigate("/labelinspection/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Direct Observation Label Inspection
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
          <Label title="Lot Code #" subtitle={data?.lotCode} />
          <StatusIndicator status={Boolean(data?.lotCode)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Allergen statement is correct?"
            subtitle={
              <LabelResult
                text={data?.isAllergenStatementCorrect}
                status={data?.isAllergenStatementCorrect === "Yes"}
              />
            }
          />
          <StatusIndicator
            status={data?.isAllergenStatementCorrect === "Yes"}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Person Being Observed"
            subtitle={data?.personBeingObserved}
          />
          <StatusIndicator status={Boolean(data?.personBeingObserved)} />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default LabelInspectionAccordion;
