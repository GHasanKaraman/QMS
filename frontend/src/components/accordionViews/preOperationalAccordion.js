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
import { toStringDate } from "../../utils/helpers";

const PreOperationalAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();

  const loadPreOperationalPage = async () => {
    const res = await axios.post("/preoperational/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.preOperationalForm);
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
    loadPreOperationalPage();
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
              navigate("/preoperational/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Pre-Operational Inspection
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
          <Label
            title="Dumper"
            subtitle={
              <LabelResult text={data?.dumper} status={data?.dumper !== "No"} />
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
              <LabelResult text={data?.sealer} status={data?.sealer !== "No"} />
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
        <Divider />
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
        <Divider />
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
        <Divider />
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
  );
};

export default PreOperationalAccordion;
