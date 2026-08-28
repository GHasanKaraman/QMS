import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Pagination,
  Skeleton,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { FilterList, InfoRounded, PlayArrow } from "@mui/icons-material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";

import { tokens } from "../../theme";
import Header from "../Header";

import { ReactComponent as Signature } from "../../images/signature.svg";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import {
  extractUniqueProducts,
  getTimeRange,
  toStringDate,
} from "../../utils/helpers";
import moment from "moment-timezone";
import DateRangePicker, { useRangePicker } from "../DateRangePicker.jsx";

const SignoffDashboard = (props) => {
  const [getter, setter] = useRangePicker();
  const params = useParams();
  const loc = useLocation();
  const { id } = params;

  const page = new URLSearchParams(loc.search).get("page");
  const station = new URLSearchParams(loc.search).get("station");
  const itemCode = new URLSearchParams(loc.search).get("itemCode");
  const before = new URLSearchParams(loc.search).get("before");
  const after = new URLSearchParams(loc.search).get("after");

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [openInfo, setOpenInfo] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const [switchStatus, setSwitchStatus] = useState(false);

  const [stations, setStations] = useState([]);
  const [forms, setForms] = useState([]);
  const [description, setDescription] = useState();

  const [formStation, setStation] = useState(station || null);
  const [formItemCode, setItemCode] = useState(itemCode || "");
  const [formAfter, setAfter] = useState(after || "");
  const [formBefore, setBefore] = useState(before || "");

  const [currentPage, setCurrentPage] = useState(page ? parseInt(page) : 1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalForms, setTotalForms] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);

  const [values, setValues] = useState({});

  const loadSignoffDashboardPage = async () => {
    const res = await axios.post("/signoff/dashboard", {
      page: currentPage,
      station,
      itemCode,
      before,
      after,
    });
    if (userAuth.control(res)) {
      if (res.data) {
        setStations(res.data.stations);
        setForms(res.data.forms);
        setCurrentPage(res.data.currentPage);
        setTotalCount(res.data.totalCount);
        setTotalForms(res.data.totalForms);
        setTotalPages(res.data.totalPages);
        setDescription(res.data.desc[0]);
        setLoading(false);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Didn't fetch the records!", {
              variant: "error",
            });
            break;
          case 406:
            enqueueSnackbar(
              "You do not have access to fetch the records. Please contact system admin.",
              {
                variant: "error",
              },
            );
            break;
          default:
            enqueueSnackbar("Something went wrong with the server!", {
              variant: "error",
            });
            break;
        }
      }
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
    loadSignoffDashboardPage();
    var path = "/signoff/filters?page=" + currentPage;

    if (station && station !== null) {
      path += "&station=" + station;
    }
    if (itemCode && itemCode?.trim() !== "") {
      path += "&itemCode=" + itemCode;
    }
    if (after && after?.trim() !== "") {
      path += "&after=" + after;
    }
    if (before && before?.trim() !== "") {
      path += "&before=" + before;
    }
    navigate(path, { replace: true });
  }, [currentPage]);

  const handlePageChange = (event, value) => {
    setLoading(true);
    setCurrentPage(value);
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const getSignoffState = (currentRun) => {
    const signedoffForms = currentRun.filter((run) => run.signoffs.length > 0);
    if (signedoffForms.length === 0) {
      return colors.grey[400];
    } else if (signedoffForms.length === currentRun.length) {
      return colors.ciboInnerGreen[400];
    }
    return colors.orangeAccent[500];
  };

  const handleSignoffAll = () => {
    navigate("/signoffsteps", {
      state: { forms: Object.keys(temp).filter((value) => temp[value]) },
    });
  };

  const handleSignoff = () => {
    navigate("/signoffsteps", {
      state: { forms: Object.keys(values).filter((value) => values[value]) },
    });
  };

  const temp = { ...values };
  return id === "filters" ? (
    <Box m="0 20px">
      <Dialog
        open={openFilters}
        fullWidth={true}
        onClose={() => {
          setOpenFilters(false);
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            width="100%"
            alignItems="center"
            justifyContent="space-between"
          >
            <Button
              color="error"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {
                setOpenFilters(false);
              }}
            >
              Cancel
            </Button>
            <Typography fontWeight={600} fontSize={25}>
              Sign Off Dashboard Filters
            </Typography>
            <IconButton
              onClick={() => {
                if (
                  formStation === null &&
                  formItemCode === "" &&
                  getter.startDate === "" &&
                  getter.endDate === "" &&
                  formAfter?.trim() === "" &&
                  formBefore?.trim() === ""
                ) {
                } else {
                  var path = "/signoff/filters?page=1";

                  if (formStation && formStation !== null) {
                    path += "&station=" + formStation;
                  }
                  if (formItemCode && formItemCode?.trim() !== "") {
                    path += "&itemCode=" + formItemCode;
                  }
                  if (switchStatus) {
                    const { startDate, endDate } = getter;
                    const tempAfter =
                      moment(startDate).diff(moment(), "days") * -1;
                    const tempBefore =
                      moment(endDate).diff(moment(), "days") * -1;
                    path += "&after=" + tempAfter;
                    path += "&before=" + tempBefore;
                  } else {
                    if (formAfter && formAfter?.trim() !== "") {
                      path += "&after=" + formAfter;
                    }
                    if (formBefore && formBefore?.trim() !== "") {
                      path += "&before=" + formBefore;
                    }
                  }

                  navigate(path, { replace: true });
                  navigate(0);
                }
              }}
            >
              <PlayArrow
                sx={{ color: colors.ciboInnerGreen[500], fontSize: 40 }}
              />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1}>
            <Typography variant="h3" pl={2} fontWeight={700}>
              BASIC PARAMETERS
            </Typography>
            <Autocomplete
              onChange={(_, value) => {
                setStation(value);
              }}
              value={formStation}
              options={stations?.map(({ name }) => name)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Station"
                  name="station"
                />
              )}
            />
            <TextField
              fullWidth={true}
              placeholder="Item Code"
              value={formItemCode}
              onChange={(e) => {
                setItemCode(e.target.value);
              }}
              variant="outlined"
              InputProps={{ sx: { fontSize: 16 } }}
            />
          </Stack>
          <Stack spacing={1} pt={2}>
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h3" pl={2} fontWeight={700}>
                DATE PARAMETERS
              </Typography>
              <Switch
                color="secondary"
                onChange={(e) => {
                  setSwitchStatus(!switchStatus);
                }}
              />
            </Stack>
            {switchStatus ? (
              <DateRangePicker getter={getter} setter={setter} />
            ) : undefined}
            {!switchStatus ? (
              <Stack spacing={1}>
                <TextField
                  fullWidth={true}
                  placeholder="Run Started After (# Days Ago)"
                  value={formAfter}
                  onChange={(e) => {
                    setAfter(e.target.value);
                  }}
                  variant="outlined"
                  InputProps={{ sx: { fontSize: 16 } }}
                />
                <TextField
                  fullWidth={true}
                  placeholder="Run Started Before (# Days Ago)"
                  value={formBefore}
                  onChange={(e) => {
                    setBefore(e.target.value);
                  }}
                  variant="outlined"
                  InputProps={{ sx: { fontSize: 16 } }}
                />
              </Stack>
            ) : undefined}
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

      <Stack
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Header title="Sign Off Dashboard" />
        <Stack direction="row" spacing={0}>
          <IconButton
            onClick={() => {
              setOpenInfo(true);
            }}
          >
            <InfoRounded
              sx={{ color: colors.ciboInnerGreen[400], fontSize: 30 }}
            />
          </IconButton>
          <IconButton
            onClick={() => {
              setOpenFilters(true);
            }}
          >
            <div
              style={{
                background: colors.ciboInnerGreen[400],
                padding: 4,
                paddingBottom: 1,
                borderRadius: 5,
              }}
            >
              <FilterList
                sx={{
                  fontSize: 25,
                  border: "2px solid",
                  borderColor: colors.primary[400],
                  borderRadius: 10,

                  color: colors.primary[400],
                }}
              />
            </div>
          </IconButton>
        </Stack>
      </Stack>

      <Stack
        direction="row"
        width="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        <Typography fontWeight={600} fontSize={14}>
          {Object.values(values).filter((value) => value).length +
            " Runs Selected"}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ fontWeight: 600, borderWidth: 1.5, fontSize: 14 }}
            onClick={handleSignoffAll}
          >
            {"Sign Off All (" + totalForms + ")"}
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            sx={{ fontWeight: 600, borderWidth: 1.5, fontSize: 14 }}
            disabled={
              Object.values(values).filter((value) => value).length === 0
            }
            onClick={handleSignoff}
          >
            Sign Off
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <Stack spacing={-3}>
          <Skeleton height={140} />
          <Divider sx={{ pt: 0.5 }} />
          <Skeleton height={140} />
          <Divider sx={{ pt: 0.5 }} />
          <Skeleton height={140} />
        </Stack>
      ) : forms.length === 0 ? (
        <Stack textAlign="center" spacing={1.3} pt={20} justifyContent="center">
          <FilterList
            sx={{
              fontSize: 75,
              border: "5px solid",
              alignSelf: "center",
              p: 1,
              borderColor: colors.contrast[100],
              borderRadius: 10,
              color: colors.contrast[100],
            }}
          />
          <Typography>No results found for the selected filter.</Typography>
        </Stack>
      ) : (
        <div>
          <div style={{ marginTop: 15 }}>
            {forms?.map((group, index) => {
              const products = extractUniqueProducts(group);
              return products.flatMap((product) => {
                const runs = group.filter((item) => item.product === product);
                const uniqueStations = Array.from(
                  new Set(runs.map((run) => run.station)),
                );
                return uniqueStations.map((station) => {
                  const currentRun = runs.filter(
                    (item) => item.station === station,
                  );
                  temp[
                    station +
                      "&" +
                      product +
                      "&" +
                      moment(group[0].createdAt).format("YYYY-MM-DD")
                  ] = true;

                  const currentRange = getTimeRange(currentRun);

                  return (
                    <Box
                      width="100%"
                      key={
                        station +
                        product +
                        moment(group[0].createdAt).format("YYYY-MM-DD")
                      }
                      sx={{ background: colors.primary[400], p: 1 }}
                    >
                      <Stack
                        alignItems="center"
                        direction="row"
                        spacing={1}
                        width="100%"
                      >
                        <ButtonBase
                          sx={{ width: "100%", p: 1 }}
                          onClick={() => {
                            navigate(
                              "/runsignoff/" +
                                encodeURIComponent(product) +
                                "?dateStart=" +
                                moment(currentRange?.start).format() +
                                "&dateEnd=" +
                                moment(currentRange?.end).format() +
                                "&type=" +
                                "" +
                                "&station=" +
                                station,
                            );
                          }}
                        >
                          <Stack width="100%">
                            <Stack
                              width="100%"
                              justifyContent="space-between"
                              alignItems="center"
                              direction="row"
                            >
                              <Stack textAlign="left">
                                <Typography fontWeight={600} fontSize={17}>
                                  {product + " • " + description[product]}
                                </Typography>
                                <Typography>
                                  {station +
                                    " • " +
                                    toStringDate(currentRange?.start, {
                                      month: "short",
                                      year: "numeric",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                    }) +
                                    " - " +
                                    toStringDate(currentRange?.end, {
                                      month: "short",
                                      year: "numeric",
                                      day: "numeric",
                                      hour: "numeric",
                                      minute: "numeric",
                                    })}
                                </Typography>
                              </Stack>
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={2}
                                px={2}
                              >
                                <Stack
                                  textAlign="center"
                                  spacing={0}
                                  color={colors.blueAccent[400]}
                                >
                                  <Typography fontWeight={700} fontSize={16}>
                                    {
                                      currentRun.filter(
                                        (run) => run.signoffs.length === 0,
                                      ).length
                                    }
                                  </Typography>
                                  <Typography fontWeight={600}>
                                    To Review
                                  </Typography>
                                </Stack>
                                <Signature
                                  width={25}
                                  fill={getSignoffState(currentRun)}
                                />
                              </Stack>
                            </Stack>
                            <Stack
                              direction="row"
                              spacing={0.5}
                              style={{ width: "100%", paddingTop: 2 }}
                            >
                              {currentRun.map((run) => {
                                return (
                                  <div
                                    key={run._id}
                                    style={{
                                      width: `${100 / currentRun.length}%`,
                                      height: 10,
                                      borderRadius: 3,
                                      background:
                                        run.status === "passed"
                                          ? colors.ciboInnerGreen[400]
                                          : colors.yoggieRed[400],
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          </Stack>
                        </ButtonBase>
                        <Checkbox
                          color="secondary"
                          size="large"
                          checked={Boolean(
                            values[
                              station +
                                "&" +
                                product +
                                "&" +
                                moment(group[0].createdAt).format() +
                                "&" +
                                moment(
                                  group[group.length - 1].createdAt,
                                ).format()
                            ],
                          )}
                          onChange={(e, checked) => {
                            const temp = { ...values };
                            temp[
                              station +
                                "&" +
                                product +
                                "&" +
                                moment(group[0].createdAt).format() +
                                "&" +
                                moment(
                                  group[group.length - 1].createdAt,
                                ).format()
                            ] = checked;
                            setValues(temp);
                          }}
                        />
                      </Stack>
                      <Divider />
                    </Box>
                  );
                });
              });
            })}
          </div>
          <Pagination
            sx={{ py: 2, justifySelf: "center" }}
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="secondary"
            shape="rounded"
          />
        </div>
      )}
    </Box>
  ) : (
    "No Content"
  );
};

export default SignoffDashboard;
