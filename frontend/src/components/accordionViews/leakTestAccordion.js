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
import { toStringDate } from "../../utils/helpers";

const SAMPLE_POINTS = ["Beginning", "Middle", "End"];

const LeakTestAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();

  const loadLeakTestPage = async () => {
    const res = await axios.post("/leaktest/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.leakTestForm);
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
    loadLeakTestPage();
  }, []);

  const renderSide = (label, side) => {
    const defects = data?.["leak" + side + "Defects"];
    return (
      <div>
        {SAMPLE_POINTS.map((point) => {
          const result = data?.["leak" + side + point];
          return (
            <div key={point}>
              <Stack direction="row" justifyContent="space-between">
                <Label title={label + " - " + point} subtitle={result} />
                <StatusIndicator status={result === "Pass"} />
              </Stack>
              <Divider />
            </div>
          );
        })}
        <Stack direction="row" justifyContent="space-between">
          <Label
            title={label + " - Number of Bags with Defects"}
            subtitle={defects}
          />
          <StatusIndicator status={defects === 0} />
        </Stack>
        <Divider />
      </div>
    );
  };

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
              navigate("/leaktest/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Leak Test
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
                checked={Boolean(value)}
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
            title="Created At"
            subtitle={toStringDate(data?.createdAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="QC" subtitle={data?.username} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Lot Number" subtitle={data?.lotCode} />
          <StatusIndicator status={Boolean(data?.lotCode)} />
        </Stack>
        <Divider />
        {renderSide("Left Side", "Left")}
        {renderSide("Right Side", "Right")}
      </AccordionDetails>
    </Accordion>
  );
};

export default LeakTestAccordion;
