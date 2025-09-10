import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Box,
  Checkbox,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";

import "../formStatus.css";
import { toStringDate } from "../../utils/helpers";

const RatioAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const isNonMobile = useMediaQuery("(min-width:600px)");
  const [data, setData] = useState({ recipe: {} });
  const [totalWeight, setTotalWeight] = useState(1);

  const loadRatioPage = async () => {
    const res = await axios.post("/ratio/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.ratioForm);
      setTotalWeight(
        Object.values(res.data.ratioForm.recipe).reduce(
          (prev, curr) => prev + curr.weight * 1.0,
          0
        )
      );
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
    loadRatioPage();
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
              navigate("/ratio/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Mixing Ratio Form
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

        <Box
          mt="10px"
          display="grid"
          gap="10px"
          gridTemplateColumns="repeat(12, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 12" },
          }}
          textAlign="center"
        >
          <Label subtitle="Product" style={{ gridColumn: "span 4" }} />
          <Label subtitle="Group" style={{ gridColumn: "span 2" }} />
          <Label subtitle="Actual Ratio" style={{ gridColumn: "span 2" }} />
          <Label subtitle="Weight" style={{ gridColumn: "span 2" }} />
          <Label subtitle="Your Ratio" style={{ gridColumn: "span 2" }} />
        </Box>
        <Divider />
        {Object.values(data?.recipe)?.map((recipe, index) => {
          const group = Object.keys(data.recipe)[index];
          const groupName = group.includes("null") ? "?" : group;
          const ratio = recipe.weight / totalWeight;

          var tolerance = 5;
          if (data?.station.contains("MIX")) {
            tolerance = 3;
          }
          const lowerbound = recipe.ratio - tolerance;
          const upperbound = recipe.ratio + tolerance;
          const passed = lowerbound <= ratio && ratio <= upperbound;
          return (
            <Box
              key={index}
              mt="10px"
              display="grid"
              gap="10px"
              gridTemplateColumns="repeat(12, minmax(0, 1fr))"
              sx={{
                "& > div": {
                  gridColumn: isNonMobile ? undefined : "span 12",
                },
                "& .MuiInputBase-root::after": {
                  borderBottomColor: colors.ciboInnerGreen[500],
                },
                "& .MuiInputBase-root::before": {
                  borderBottomColor: colors.ciboInnerGreen[600],
                },
                "& .MuiFormLabel-root.Mui-focused": {
                  color: colors.ciboInnerGreen[300],
                },
                alignItems: "center",
              }}
            >
              <Typography sx={{ textAlign: "left", gridColumn: "span 4" }}>
                {recipe.part + " - " + recipe.desc}
              </Typography>
              <Typography sx={{ textAlign: "center", gridColumn: "span 2" }}>
                {groupName}
              </Typography>
              <Typography sx={{ textAlign: "center", gridColumn: "span 2" }}>
                {(recipe.ratio * 100).toFixed(2) + " %"}
              </Typography>
              <Typography sx={{ textAlign: "center", gridColumn: "span 2" }}>
                {recipe.weight}
              </Typography>
              <Typography
                sx={{
                  textAlign: "center",
                  gridColumn: "span 2",
                  fontWeight: 600,
                  color: passed
                    ? colors.ciboInnerGreen[500]
                    : colors.yoggieRed[500],
                }}
              >
                {(ratio * 100).toFixed(2) + " %"}
              </Typography>
            </Box>
          );
        })}
      </AccordionDetails>
    </Accordion>
  );
};

export default RatioAccordion;
