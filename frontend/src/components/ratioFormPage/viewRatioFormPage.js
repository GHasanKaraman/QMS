import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Divider,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
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
import CommentAccordion from "../CommentAccordion";

const ViewRatioFormPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState({ recipe: {} });
  const [totalWeight, setTotalWeight] = useState(1);
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(true);

  const loadCCPPage = async () => {
    const res = await axios.post("/ratio/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.ratioForm);
      setTotalWeight(
        Object.values(res.data.ratioForm.recipe).reduce(
          (prev, curr) => prev + curr.weight * 1.0,
          0,
        ),
      );
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
          title="Mixing Ratio Form"
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
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              RATIOS
            </Typography>
            <Typography fontWeight={600}>
              {Object.values(data?.recipe).length + " Items"}
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <div style={{ color: colors.yoggieRed[500] }}>
            Form status is calculated by 10% tolerence value!
          </div>
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
            const tolerance = recipe.ratio * 0.1;
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
                    fontWeight: 700,
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
          <Divider />
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="ratio" />
    </Box>
  );
};

export default ViewRatioFormPage;
