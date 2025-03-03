import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import { useSnackbar } from "notistack";
import moment from "moment-timezone";

import Header from "../Header";
import axios from "../../api/axios";
import { tokens } from "../../theme";
import userAuth from "../../utils/userAuth";
import { extractUniqueProducts, toStringDate } from "../../utils/helpers";
import FormCard from "../FormCard";

import { ReactComponent as Signature } from "../../images/signature.svg";
import { InfoRounded } from "@mui/icons-material";

const RunDashboardPage = (props) => {
  const params = useParams();
  const { id } = params;

  const loc = useLocation();
  const type = new URLSearchParams(loc.search).get("type");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);
  const [products, setProducts] = useState([]);
  const [descriptions, setDescriptions] = useState({});

  const [days, setDays] = useState([]);

  const [open, setOpen] = useState(false);
  const [openInfo, setOpenInfo] = useState(false);

  const [currentRun, setCurrentRun] = useState();
  const [currentForms, setCurrentForms] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState();
  const [selectedStart, setSelectedStart] = useState();
  const [selectedEnd, setSelectedEnd] = useState();

  const getDates = () => {
    const _days = [];
    const current = moment().add(1, "days");

    for (let i = 0; i < 14; i++) {
      const date = current.subtract(1, "days").format("YYYY-MM-DD");
      _days.push(date);
    }
    setDays(_days);
  };

  const loadAllStations = async () => {
    const res = await axios.post("/rundashboard", { station: id });
    if (userAuth.control(res)) {
      const _forms = res.data.forms.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setForms(_forms);
      setCurrentRun(_forms[0]?.product);
      setDescriptions(res.data.desc[0]);
      setCurrentForms(
        _forms.filter(
          (form) =>
            form.product === _forms[0].product &&
            moment(form.createdAt).format("YYYY-MM-DD") ===
              moment().format("YYYY-MM-DD"),
        ),
      );
      setProducts(extractUniqueProducts(_forms));
      getDates();
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
    loadAllStations();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const getSignatureState = (forms) => {
    if (
      forms.filter((form) => form.signoffs.length > 0).length === forms.length
    ) {
      return colors.ciboInnerGreen[400];
    } else if (forms.filter((form) => form.signoffs.length > 0).length === 0) {
      return colors.grey[400];
    }
    return colors.orangeAccent[500];
  };

  return (
    <Box m="0 20px">
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          fontSize={25}
          fontWeight={600}
          textAlign="center"
        >
          {selectedProduct}
        </DialogTitle>
        <DialogContent>
          <Stack>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {
                navigate(
                  "/runsummary/" +
                    selectedProduct +
                    "?dateStart=" +
                    selectedStart +
                    "&dateEnd=" +
                    selectedEnd +
                    "&type=" +
                    type +
                    "&station=" +
                    id,
                );
              }}
            >
              Quality Run Summary
            </Button>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {
                navigate(
                  "/runsignoff/" +
                    selectedProduct +
                    "?dateStart=" +
                    selectedStart +
                    "&dateEnd=" +
                    selectedEnd +
                    "&type=" +
                    type +
                    "&station=" +
                    id,
                );
              }}
            >
              Run Sign Off
            </Button>
            <Divider />

            <Button
              color="secondary"
              sx={{ fontWeight: 700, fontSize: 18 }}
              autoFocus
              onClick={() => {
                setOpen(false);
              }}
            >
              Cancel
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>
      <Dialog
        open={openInfo}
        onClose={() => {
          setOpenInfo(false);
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle
          id="alert-dialog-title"
          fontSize={25}
          fontWeight={600}
          textAlign="center"
        >
          Sign Off Status
        </DialogTitle>
        <DialogContent>
          <Stack
            direction="column"
            width="100%"
            spacing={-1}
            sx={{
              background: colors.primary[400] + "50",
              borderRadius: "10px",
            }}
          >
            <Stack direction="row" spacing={2} p={2}>
              <Signature
                width={25}
                style={{ marginRight: 10 }}
                stroke={colors.grey[400]}
                fill={colors.grey[400]}
                strokeWidth="10px"
              />
              <Typography
                color={colors.grey[400]}
                fontSize={15}
                fontWeight={600}
              >
                Not Signed Off
              </Typography>
            </Stack>

            <Stack direction="row" spacing={2} p={2}>
              <Signature
                width={25}
                style={{ marginRight: 10 }}
                stroke={colors.orangeAccent[500]}
                fill={colors.orangeAccent[500]}
                strokeWidth="10px"
              />
              <Typography
                color={colors.orangeAccent[500]}
                fontSize={15}
                fontWeight={600}
              >
                Partial Sign Off
              </Typography>
            </Stack>
            <Stack direction="row" spacing={2} p={2}>
              <Signature
                width={25}
                style={{ marginRight: 10 }}
                stroke={colors.ciboInnerGreen[400]}
                fill={colors.ciboInnerGreen[400]}
                strokeWidth="10px"
              />
              <Typography
                color={colors.ciboInnerGreen[400]}
                fontSize={15}
                fontWeight={600}
              >
                Production Sign Off
              </Typography>
            </Stack>
          </Stack>
          <Stack>
            <Button
              color="secondary"
              sx={{
                mt: 1,
                fontWeight: 600,
                fontSize: 16,
                width: "50%",
                alignSelf: "center",
              }}
              autoFocus
              onClick={() => {
                setOpenInfo(false);
              }}
            >
              Close
            </Button>
          </Stack>
        </DialogContent>
      </Dialog>

      <Header title={id} subtitle="Run Quality Dashboard" mb="0px" />
      <Stack direction="row" width="100%" justifyContent="right">
        <IconButton
          onClick={() => {
            setOpenInfo(true);
          }}
        >
          <InfoRounded
            fontSize="large"
            sx={{ color: colors.ciboInnerGreen[400] }}
          />
        </IconButton>
        <IconButton
          onClick={() => {
            navigate("/signoff/filters?page=1&station=" + id);
          }}
        >
          <Signature
            width={30}
            fill={colors.ciboInnerGreen[400]}
            stroke={colors.ciboInnerGreen[400]}
            strokeWidth={20}
          />
        </IconButton>
      </Stack>
      <Accordion expanded={true}>
        <AccordionSummary
          sx={{
            background:
              theme.palette.mode === "dark" ? colors.grey[700] : "#f2f0f0",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Current Runs
        </AccordionSummary>
        <AccordionDetails>
          {currentForms.length > 0 ? (
            <List>
              <Stack>
                <Stack
                  direction="row"
                  width="100%"
                  justifyContent="space-between"
                >
                  <Typography fontSize={21} fontWeight={600}>
                    {currentRun + " • " + descriptions[currentRun]}
                  </Typography>
                  <Signature
                    width={25}
                    style={{ marginRight: 10 }}
                    stroke={getSignatureState(currentForms)}
                    fill={getSignatureState(currentForms)}
                    strokeWidth="10px"
                  />
                </Stack>
                <Typography>
                  {toStringDate(
                    currentForms[currentForms.length - 1]?.createdAt,
                    {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    },
                  ) +
                    " - " +
                    toStringDate(currentForms[0]?.createdAt, {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }) +
                    " • " +
                    currentForms.length +
                    " Completed Data Sheets"}
                </Typography>
                <ListItem
                  secondaryAction={
                    <IconButton
                      sx={{ padding: "0 0px" }}
                      onClick={() => {
                        setOpen(true);
                        setSelectedProduct(currentRun);
                        setSelectedStart(currentForms[0]?.createdAt);
                        setSelectedEnd(
                          currentForms[currentForms.length - 1]?.createdAt,
                        );
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  }
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      overflowX: "auto",
                      overflowY: "hidden",
                      "& .MuiPaper-root.MuiCard-root": {
                        overflow: "visible !important",
                      },
                      display: "webkit-flex !important",
                      padding: "10px 0",
                    }}
                  >
                    {currentForms
                      .sort(
                        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
                      )
                      .map((form) => {
                        return <FormCard key={form._id} form={form} />;
                      })}
                  </Stack>
                </ListItem>
              </Stack>
            </List>
          ) : (
            <div style={{ color: colors.yoggieRed[500] }}>No Current Runs</div>
          )}
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={true}>
        <AccordionSummary
          sx={{
            background:
              theme.palette.mode === "dark" ? colors.grey[700] : "#f2f0f0",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          Completed Runs in Last 2 Weeks
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {forms.length > 0 ? (
              days.map((day) => {
                return products.map((product) => {
                  const _forms = forms.filter(
                    (i) =>
                      i.product === product &&
                      moment(i.createdAt).format("YYYY-MM-DD") === day,
                  );
                  if (_forms.length > 0) {
                    return (
                      <Stack key={day + product}>
                        <Stack
                          direction="row"
                          width="100%"
                          justifyContent="space-between"
                        >
                          <Typography fontSize={21} fontWeight={600}>
                            {product + " • " + descriptions[product]}
                          </Typography>
                          <Signature
                            width={25}
                            style={{ marginRight: 10 }}
                            stroke={getSignatureState(_forms)}
                            fill={getSignatureState(_forms)}
                            strokeWidth="10px"
                          />
                        </Stack>

                        <Typography>
                          {toStringDate(_forms[_forms.length - 1]?.createdAt, {
                            month: "short",
                            year: "numeric",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          }) +
                            " - " +
                            toStringDate(_forms[0]?.createdAt, {
                              month: "short",
                              year: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            }) +
                            " • " +
                            _forms.length +
                            " Completed Data Sheets"}
                        </Typography>
                        <ListItem
                          sx={{ display: "grid" }}
                          secondaryAction={
                            <IconButton
                              sx={{ padding: "0 0px" }}
                              onClick={() => {
                                setOpen(true);
                                setSelectedProduct(product);
                                setSelectedStart(_forms[0]?.createdAt);
                                setSelectedEnd(
                                  _forms[_forms.length - 1]?.createdAt,
                                );
                              }}
                            >
                              <MenuIcon />
                            </IconButton>
                          }
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            sx={{
                              overflowX: "auto",
                              overflowY: "hidden",
                              "& .MuiPaper-root.MuiCard-root": {
                                overflow: "visible !important",
                              },
                              display: "webkit-flex !important",
                              padding: "10px 0",
                            }}
                          >
                            {_forms
                              .sort(
                                (a, b) =>
                                  new Date(a.createdAt) - new Date(b.createdAt),
                              )
                              .map((form) => {
                                return <FormCard key={form._id} form={form} />;
                              })}
                          </Stack>
                        </ListItem>
                        <Divider />
                      </Stack>
                    );
                  } else return undefined;
                });
              })
            ) : (
              <div style={{ color: colors.yoggieRed[500] }}>
                No Completed Runs
              </div>
            )}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};
export default RunDashboardPage;
