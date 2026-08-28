import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Divider,
  Skeleton,
  Stack,
  Switch,
  Typography,
  useTheme,
} from "@mui/material";
import confetti from "canvas-confetti";

import PrintIcon from "@mui/icons-material/Print";

import { ReactComponent as Signature } from "../../images/signature.svg";
import { tokens } from "../../theme";
import {
  extractInformations,
  getTimeRange,
  toStringDate,
} from "../../utils/helpers";

import axios from "../../api/axios";
import { useSnackbar } from "notistack";
import userAuth from "../../utils/userAuth";

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "../Accordion.jsx";
import RunSummaryAccordions from "../RunSummaryAccordions";
import SummaryPDF from "./SummaryPDF";
import ReactToPrint from "react-to-print";
import Header from "../Header";

const RunSummaryPage = (props) => {
  const params = useParams();
  const loc = useLocation();
  const { id: product } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const dateStart = new URLSearchParams(loc.search).get("dateStart");
  const dateEnd = new URLSearchParams(loc.search).get("dateEnd");
  const station = new URLSearchParams(loc.search).get("station");
  const type = new URLSearchParams(loc.search).get("type");

  const [switchStatus, setSwitchStatus] = useState(false);

  const [forms, setForms] = useState([]);
  const [forms1, setForms1] = useState([]);
  const [forms2, setForms2] = useState([]);
  const [forms3, setForms3] = useState([]);

  const [signedoffForms, setSignedoffForms] = useState([]);
  const [description, setDescription] = useState();

  const [loading, setLoading] = useState(true);

  const ref = useRef();

  const [dateRange, setDateRange] = useState();

  const loadRunSummaryPage = async () => {
    const res = await axios.post("/runsummary", {
      station,
      product,
      dateStart,
      dateEnd,
    });
    if (userAuth.control(res)) {
      const forms = res.data.forms.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      setDateRange(getTimeRange(forms));

      setForms(forms);
      loadBatchForms(forms);
      setSignedoffForms(forms.filter((form) => form.signoffs.length > 0));
      setDescription(res.data.desc[0]);
      setLoading(false);
    } else {
      navigate("/login");
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      enqueueSnackbar("Please sign in again!", {
        variant: "error",
      });
    }
  };

  function groupByShiftFirstType(forms) {
    const result = { 1: [], 2: [], 3: [] };
    const seen = { 1: new Set(), 2: new Set(), 3: new Set() };

    for (const form of forms) {
      const { shift, type } = form;
      if (!seen[shift].has(type)) {
        seen[shift].add(type);
        result[shift].push(form);
      }
    }

    return result;
  }

  const loadBatchForms = (forms) => {
    forms.forEach((form) => {
      const { type } = extractInformations(form);
      form.type = type;
    });

    const result = groupByShiftFirstType(forms);
    setForms1(result[1]);
    setForms2(result[2]);
    setForms3(result[3]);
  };

  useEffect(() => {
    loadRunSummaryPage();
  }, []);

  const getSignatureState = (forms) => {
    if (signedoffForms.length === 0) {
      return colors.grey[400];
    } else if (signedoffForms.length === forms.length) {
      return colors.ciboInnerGreen[400];
    }
    return colors.orangeAccent[500];
  };

  return !loading ? (
    <Box m="0 20px">
      <SummaryPDF
        forms={forms}
        product={product}
        station={station}
        type={type}
        description={description}
        ref={ref}
      />
      <Header
        title={
          !switchStatus ? "Quality Run Summary" : "Batch Record Run Summary"
        }
      />
      <Accordion expanded={true}>
        <AccordionSummary
          disableIcon
          sx={{
            background:
              theme.palette.mode === "dark" ? colors.grey[700] : "#f2f0f0",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <Stack width="100%">
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              width="100%"
            >
              <Typography variant="h4" fontWeight={600}>
                {product + " • " + description[product]}
              </Typography>
              <Stack spacing={2} direction="row">
                <Button
                  color="error"
                  sx={{ fontWeight: 600, fontSize: 13 }}
                  onClick={() => {
                    navigate(
                      "/runsignoff/" +
                        product +
                        "?dateStart=" +
                        dateStart +
                        "&dateEnd=" +
                        dateEnd +
                        "&type=" +
                        type +
                        "&station=" +
                        station,
                    );
                  }}
                >
                  Signoff
                </Button>
                <ReactToPrint
                  trigger={() => (
                    <Button
                      sx={{
                        marginY: "3px",
                        borderWidth: "2px",
                        fontWeight: "700",
                      }}
                      variant="outlined"
                      id="button"
                      color="secondary"
                      startIcon={<PrintIcon />}
                    >
                      Print
                    </Button>
                  )}
                  content={() => ref.current}
                  pageStyle="print"
                />
              </Stack>
            </Stack>
            <Typography mt={1}>
              {station +
                " " +
                type +
                " • " +
                toStringDate(dateRange?.start, {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                }) +
                " - " +
                toStringDate(dateRange?.end, {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })}
            </Typography>
            <Stack
              pt={2}
              direction="row"
              width="100%"
              justifyContent="space-between"
              alignItems="center"
            >
              <Stack direction="row" alignContent="space-between" width="100%">
                <Stack spacing={0.2} direction="row" width="100%">
                  {forms.map((form) => {
                    return (
                      <div
                        key={form._id}
                        style={{
                          minWidth:
                            forms.length > 25
                              ? "3%"
                              : forms.length > 20
                                ? "4%"
                                : forms.length > 15
                                  ? "5%"
                                  : "7%",
                          height: "20px",
                          background:
                            form.status === "passed"
                              ? colors.ciboInnerGreen[500]
                              : colors.yoggieRed[500],
                        }}
                      />
                    );
                  })}
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Stack direction="row" spacing={0.2}>
                    <Switch
                      color="secondary"
                      onChange={() => {
                        setSwitchStatus(!switchStatus);
                        if (switchStatus === false) confetti();
                      }}
                    />
                  </Stack>

                  <div
                    style={{
                      width: "25px",
                      height: "25px",
                      borderRadius: "15px",
                      background: forms.every(
                        (form) => form.status === "passed",
                      )
                        ? colors.ciboInnerGreen[500]
                        : colors.yoggieRed[500],
                    }}
                  />
                  <Signature
                    width={25}
                    style={{ marginRight: 10 }}
                    stroke={getSignatureState(forms)}
                    fill={getSignatureState(forms)}
                    strokeWidth="10px"
                  />
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </AccordionSummary>
      </Accordion>
      <Accordion>
        <AccordionSummary sx={{ fontWeight: 600 }}>
          Sign Off History
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={0.8}>
            {Array.from(
              new Set(
                forms.flatMap((form) =>
                  form.signoffs.map(
                    (item) =>
                      toStringDate(item.createdAt, {
                        month: "short",
                        year: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }) +
                      " • Production Sign Off by " +
                      item.signedOff,
                  ),
                ),
              ),
            ).map((a, i) => (
              <Stack key={i} direction="row">
                <Signature
                  width={25}
                  style={{ marginRight: 10 }}
                  stroke={getSignatureState(forms)}
                  fill={getSignatureState(forms)}
                  strokeWidth="10px"
                />
                <Typography fontWeight={600} fontSize={16}>
                  {a}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </AccordionDetails>
      </Accordion>
      {!switchStatus ? (
        <RunSummaryAccordions isForm={false} forms={forms} />
      ) : (
        <Stack>
          <RunSummaryAccordions isForm={false} forms={forms1} title="Shift 1" />
          <RunSummaryAccordions isForm={false} forms={forms2} title="Shift 2" />
          <RunSummaryAccordions isForm={false} forms={forms3} title="Shift 3" />
        </Stack>
      )}
    </Box>
  ) : (
    <Stack alignItems="center" width="100%">
      <Skeleton width="90%" height="120px" variant="rectangular" />
      <Divider />
      <Skeleton width="90%" height="50px" variant="rectangular" />
    </Stack>
  );
};

export default RunSummaryPage;
