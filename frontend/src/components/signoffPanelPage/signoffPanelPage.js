import { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  Stack,
  Button,
  Autocomplete,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
} from "@mui/material";
import { useTheme } from "@emotion/react";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";

import { ReactComponent as Signature } from "../../images/signature.svg";
import { FilterList, InfoRounded, PlayArrow } from "@mui/icons-material";

const SignOffPanelPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [openInfo, setOpenInfo] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);

  const [station, setStation] = useState(null);
  const [after, setAfter] = useState("");
  const [before, setBefore] = useState("");

  const [stations, setStations] = useState([]);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const loadStations = async () => {
    const res = await axios.post("/signoff/dashboard/stations", {});
    if (userAuth.control(res)) {
      if (res.data) {
        setStations(res.data.stations);
        setOpenFilters(true);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Didn't fetch the stations!", {
              variant: "error",
            });
            break;
          case 406:
            enqueueSnackbar(
              "You do not have access to fetch the stations. Please contact system admin.",
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

  return (
    <Box m="0 20px" height="50%">
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
                var path = "/signoff/filters?page=1";

                if (station && station !== null) {
                  path += "&station=" + station;
                }
                if (after && after?.trim() !== "") {
                  path += "&after=" + after;
                }
                if (before && before?.trim() !== "") {
                  path += "&before=" + before;
                }
                navigate(path);
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
              value={station}
              options={stations.map(({ name }) => name)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  label="Station"
                  name="station"
                />
              )}
            />
          </Stack>
          <Stack spacing={1} pt={2}>
            <Typography variant="h3" pl={2} fontWeight={700}>
              DATE PARAMETERS
            </Typography>
            <TextField
              fullWidth={true}
              placeholder="Run Started After (# Days Ago)"
              value={after}
              onChange={(e) => {
                setAfter(e.target.value);
              }}
              variant="outlined"
              InputProps={{ sx: { fontSize: 16 } }}
            />
            <TextField
              fullWidth={true}
              placeholder="Run Started Before (# Days Ago)"
              value={before}
              onChange={(e) => {
                setBefore(e.target.value);
              }}
              variant="outlined"
              InputProps={{ sx: { fontSize: 16 } }}
            />
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
            onClick={async () => {
              await loadStations();
            }}
          >
            <FilterList
              sx={{
                fontSize: 25,
                border: "2px solid",
                borderColor: colors.ciboInnerGreen[400],
                borderRadius: 10,
                p: 0.1,
                color: colors.ciboInnerGreen[400],
              }}
            />
          </IconButton>
        </Stack>
      </Stack>
      <Stack
        justifyContent="center"
        textAlign="center"
        width="100%"
        height="100%"
        spacing={2}
        pt={10}
      >
        <Signature
          width={120}
          fill={colors.grey[300]}
          stroke={colors.grey[300]}
          strokeWidth={4}
          style={{ alignSelf: "center" }}
        />
        <Typography fontWeight={600} color={colors.grey[300]} fontSize={22}>
          Welcome to the Sign Off Dashboard. Get started by selecting an
          existing filter or creating a new one.
        </Typography>
      </Stack>
    </Box>
  );
};

export default SignOffPanelPage;
