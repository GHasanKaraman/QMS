import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AccordionSummary,
  Backdrop,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Skeleton,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";

import { ReactComponent as Signature } from "../../images/signature.svg";
import { tokens } from "../../theme";
import { toStringDate } from "../../utils/helpers";

import { Accordion as CustomAccordion } from "../Accordion";

import axios from "../../api/axios";
import { useSnackbar } from "notistack";
import userAuth from "../../utils/userAuth";
import RunSummaryAccordions from "../RunSummaryAccordions";
import { LibraryAddCheck } from "@mui/icons-material";

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

  const [forms, setForms] = useState([]);
  const [signedoffForms, setSignedoffForms] = useState([]);
  const [description, setDescription] = useState();

  const [approveAll, setApproveAll] = useState(false);
  const [values, setValues] = useState({});
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(true);

  const [formIDList, setFormIDList] = useState([]);

  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const initiateChecks = (forms) => {
    const temp = {};
    forms
      .filter((form) => form?.signoffs?.length === 0)
      .forEach((element) => {
        temp[element._id] = true;
      });
    setValues(temp);
  };

  const loadSignoffPage = async () => {
    const res = await axios.post("/runsignoff", { station, product, date });
    if (userAuth.control(res)) {
      const forms = res.data.forms.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      setForms(forms);
      setDescription(res.data.desc[0]);
      setSignedoffForms(forms.filter((form) => form.signoffs.length > 0));
      initiateChecks(forms);
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

  useEffect(() => {
    loadSignoffPage();
  }, []);

  useEffect(() => {
    const allChecked = Object.values(values).every((value) => value === true);
    setApproveAll(allChecked);
    setFormIDList(Object.keys(values).filter((key) => values[key] === true));
  }, [values]);

  const handleApproveAllChange = (_, checked) => {
    setApproveAll(checked);

    const temp = {};
    for (let key in values) {
      temp[key] = checked;
    }
    setValues(temp);
  };

  const handleChange = (id, value) => {
    setValues((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSignoff = async () => {
    const res = await axios.post("/signoff", { forms: formIDList });
    if (userAuth.control(res)) {
      if (res.data) {
        enqueueSnackbar("You have successfully signed off the forms!", {
          variant: "success",
        });
        await loadSignoffPage();
        setClicked(false);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
              variant: "error",
            });
            break;
          case 406:
            enqueueSnackbar(
              "You do not have access to signoff the forms. Please contact system admin.",
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

  const getSignatureState = (forms) => {
    if (signedoffForms.length === 0) {
      return colors.grey[400];
    } else if (signedoffForms.length === forms.length) {
      return colors.ciboInnerGreen[400];
    }
    return colors.orangeAccent[500];
  };

  return clicked ? (
    <Box m="0 20px" textAlign="center">
      <CircularProgress />
    </Box>
  ) : !loading ? (
    <Box m="0 20px">
      <Dialog
        fullWidth={true}
        open={open}
        onClose={() => {
          setOpen(false);
          setPassword("");
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
                setOpen(false);
                setPassword("");
              }}
            >
              Cancel
            </Button>
            <Typography fontWeight={600} fontSize={20}>
              Sign Off Authentication
            </Typography>
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {
                if (password === "134679") {
                  if (!clicked) {
                    setClicked(true);
                    setOpen(false);
                    handleSignoff();
                  }
                } else {
                  setOpen(false);
                  setPassword("");
                  enqueueSnackbar(
                    "Please enter special pin number for this action!",
                    {
                      variant: "error",
                    },
                  );
                }
              }}
            >
              Confirm
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          <TextField
            InputProps={{ sx: { fontSize: 18, fontWeight: 700 } }}
            InputLabelProps={{ sx: { fontSize: 16, fontWeight: 600 } }}
            fullWidth
            variant="outlined"
            sx={{ my: 1 }}
            disabled
            value={localStorage.getItem("username")}
            label="Username"
          />
          <DialogContentText>
            ENTERING THE PIN NUMBER CONFIRMS THAT THE RESULTS HAVE BEEN REVIEWED
            AND ARE CORRECT.
          </DialogContentText>
          <TextField
            type="password"
            inputProps={{ maxLength: 6 }}
            InputProps={{ sx: { fontSize: 18, fontWeight: 600 } }}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            InputLabelProps={{
              sx: {
                fontSize: 16,
                fontWeight: 600,
              },
            }}
            fullWidth
            sx={{
              my: 1,
              "& label, label.Mui-focused": { color: colors.yoggieRed[500] },
            }}
            placeholder="Confirm 6 Digit Pin"
            label="Required"
          />
        </DialogContent>
      </Dialog>
      {signedoffForms.length !== forms.length ? (
        <Stack direction="row" width="100%" justifyContent="right">
          <Button
            onClick={() => {
              setOpen(true);
            }}
            size="large"
            color="secondary"
            sx={{ mb: 1, fontWeight: 600, fontSize: 17 }}
          >
            Sign Off
          </Button>
        </Stack>
      ) : undefined}

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
              {product + " • " + description[product]}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Stack direction="row" spacing={1} mt={1}>
                <Signature
                  width={25}
                  style={{ marginRight: 10 }}
                  stroke={getSignatureState(forms)}
                  fill={getSignatureState(forms)}
                  strokeWidth="10px"
                />
                <Typography>
                  {station +
                    " " +
                    type +
                    " • " +
                    toStringDate(forms[forms.length - 1].createdAt, {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    }) +
                    " - " +
                    toStringDate(forms[0].createdAt, {
                      month: "short",
                      year: "numeric",
                      day: "numeric",
                      hour: "numeric",
                      minute: "numeric",
                    })}
                </Typography>
              </Stack>
              {signedoffForms.length !== forms.length ? (
                <Stack direction="row" alignItems="center">
                  <div>Approve All</div>
                  <Checkbox
                    checkedIcon={<LibraryAddCheck />}
                    color="secondary"
                    size="large"
                    checked={approveAll}
                    onChange={handleApproveAllChange}
                  />
                </Stack>
              ) : undefined}
            </Stack>
          </Stack>
        </AccordionSummary>
      </CustomAccordion>
      {signedoffForms.length !== forms.length ? (
        <RunSummaryAccordions
          isForm={false}
          values={values}
          onChange={handleChange}
          forms={forms.filter((form) => form?.signoffs?.length === 0)}
        />
      ) : (
        <Stack
          spacing={1}
          textAlign="center"
          width="100%"
          alignItems="center"
          mt={20}
        >
          <LibraryAddCheck
            sx={{ fontSize: 150, color: colors.ciboInnerGreen[500] }}
          />
          <Typography>
            You're all set! All completed data sheets have been previously
            signed off.
          </Typography>
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

export default RunSignoffPage;
