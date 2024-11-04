import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AccordionSummary,
  Box,
  Checkbox,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";

import { ReactComponent as Signature } from "../../images/signature.svg";
import { tokens } from "../../theme";
import { toStringDate } from "../../utils/helpers";

import {
  Accordion as CustomAccordion,
  AccordionSummary as CustomAccordionSummary,
} from "../Accordion";

import axios from "../../api/axios";
import { useSnackbar } from "notistack";
import userAuth from "../../utils/userAuth";
import RunSummaryAccordions from "../RunSummaryAccordions";

const RunSignoffPage = (props) => {
  const params = useParams();
  const loc = useLocation();
  const { id: product } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const date = new URLSearchParams(loc.search).get("date");
  const station = new URLSearchParams(loc.search).get("station");
  const type = new URLSearchParams(loc.search).get("type");

  const [expanded, setExpanded] = useState(false);

  const [forms, setForms] = useState([]);

  const [checkedForms, setCheckedForms] = useState({});

  const loadSignoffPage = async () => {
    const res = await axios.post("/runsignoff", { station, product, date });
    if (userAuth.control(res)) {
      setForms(res.data.forms);
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
    loadSignoffPage();
  }, []);

  const handleChange = (values) => {
    console.log(values);
  };

  return (
    <Box m="0 20px">
      <CustomAccordion expanded={true}>
        <AccordionSummary
          sx={{
            background:
              theme.palette.mode === "dark" ? colors.grey[700] : "#f2f0f0",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <Stack width="100%">
            <Typography variant="h3" fontWeight={600}>
              {product}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Stack direction="row" spacing={1}>
                <Signature width={25} />
                <Typography>
                  {station +
                    " " +
                    type +
                    " • " +
                    toStringDate(date, {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                    })}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center">
                <div>Approve All</div>
                <Checkbox color="secondary" size="large" />
              </Stack>
            </Stack>
          </Stack>
        </AccordionSummary>
      </CustomAccordion>
      <CustomAccordion
        onChange={(_, isExpanded) => {
          setExpanded(isExpanded);
        }}
      >
        <CustomAccordionSummary>All Results</CustomAccordionSummary>
      </CustomAccordion>
      <RunSummaryAccordions
        isForm={true}
        onChange={handleChange}
        forms={forms}
        expanded={expanded}
        style={{ display: expanded ? "block" : "none" }}
      />
    </Box>
  );
};

export default RunSignoffPage;
