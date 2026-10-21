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
import ImageLabel from "../ImageLabel";
import { toStringDate } from "../../utils/helpers";
import { STAGES, statusLabel } from "./stages";

// Run summary card of a test sampled at the beginning, middle and end of a run
const SampleTestAccordion = ({
  config,
  id,
  expanded,
  isForm,
  onChange,
  value,
}) => {
  const { prefix, path, withDefects, withPhotos } = config;
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);

  const loadForm = async () => {
    const res = await axios.post(path + "/get", { id });
    if (userAuth.control(res)) {
      setData(res.data[config.responseKey]);
      setImages(res.data.images || []);
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
    loadForm();
  }, []);

  const renderSide = (label, side) => {
    const defects = data?.[prefix + side + "Defects"];
    const image = images[side === "Left" ? 0 : 1];
    return (
      <div>
        {STAGES.map((stage) => {
          const result = data?.[prefix + side + stage];
          return (
            <div key={stage}>
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title={label + " - " + stage}
                  subtitle={result || "Not filled yet"}
                />
                {result ? (
                  <StatusIndicator status={result === "Pass"} />
                ) : undefined}
              </Stack>
              <Divider />
            </div>
          );
        })}
        {withDefects ? (
          <Stack direction="row" justifyContent="space-between">
            <Label
              title={label + " - Number of Bags with Defects"}
              subtitle={defects ?? "-"}
            />
            <StatusIndicator
              status={defects !== null && defects !== undefined}
            />
          </Stack>
        ) : undefined}
        {withPhotos ? (
          <Stack direction="row" justifyContent="space-between">
            {image ? (
              <ImageLabel
                title={label + " - Photo of Nitrogen Screen"}
                folderIndex={image.folderIndex}
                fileName={image.fileName}
              />
            ) : (
              <Label
                title={label + " - Photo of Nitrogen Screen"}
                subtitle="Not attached yet"
              />
            )}
            <StatusIndicator status={Boolean(image)} />
          </Stack>
        ) : undefined}
        <Divider />
      </div>
    );
  };

  const statusColor =
    data?.status === "passed"
      ? colors.ciboInnerGreen[500]
      : data?.status === "inProgress"
        ? colors.orangeAccent[500]
        : colors.yoggieRed[500];

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
              navigate(path + "/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            {config.title}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography
              fontWeight={600}
              fontSize={16}
              sx={{
                color: colors.contrast[300],
                background: statusColor,
                p: 2,
              }}
            >
              {data?.status === "passed" ? "Pass" : statusLabel(data?.status)}
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
        {data?.attempt > 1 ? (
          <>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Retest"
                subtitle={"Attempt " + data.attempt + " of a failed form"}
              />
            </Stack>
            <Divider />
          </>
        ) : undefined}
        {data?.retestedBy ? (
          <>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Retest" subtitle="This failed form was retested" />
            </Stack>
            <Divider />
          </>
        ) : undefined}
        <Stack direction="row" justifyContent="space-between">
          <Label title="Lot Number" subtitle={data?.lotCode} />
          <StatusIndicator status={Boolean(data?.lotCode)} />
        </Stack>
        <Divider />
        {renderSide("Left Side", "Left")}
        {data?.hasRightSide === "No" ? (
          <Label
            title="Right Side"
            subtitle="Not applicable (single-sided machine)"
          />
        ) : (
          renderSide("Right Side", "Right")
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default SampleTestAccordion;
