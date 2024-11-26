import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../../api/axios.js";

import RunSignoffPage from "../../components/runSignoffPage/runSignoffPage.js";
import { tokens } from "../../theme.js";
import userAuth from "../../utils/userAuth.js";

const SignoffSteps = (props) => {
  const location = useLocation();
  const { forms } = location.state;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [index, setIndex] = useState(0);

  const [ids, setIds] = useState([]);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [password, setPassword] = useState("");
  const [open, setOpen] = useState(false);
  const [clicked, setClicked] = useState(false);

  const loadSignoffStepsPage = () => {
    if (forms.length === 0) {
      navigate("/signoff");
    }
  };

  const handleChange = (idList) => {
    const tempIds = [...ids];
    const temp = Array.from(new Set(tempIds.concat(idList)));
    setIds(temp);

    if (index < forms.length - 1) {
      setIndex(index + 1);
    } else {
      setOpen(true);
    }
  };

  const handleBack = () => {
    if (index === 0) {
      navigate(-1);
    } else {
      setIndex(index - 1);
    }
  };

  const handleSignoff = async () => {
    const res = await axios.post("/signoff", { forms: ids });
    if (userAuth.control(res)) {
      if (res.data) {
        enqueueSnackbar("You have successfully signed off the forms!", {
          variant: "success",
        });
        loadSignoffStepsPage();
        setClicked(false);
        navigate(-1);
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

  const Steps = () => {
    const [station, product, date] = forms[index].split("&");
    return (
      <RunSignoffPage
        mode="steps"
        isLast={index === forms.length - 1}
        text={`Run Sign Off (${index + 1} of ${forms.length})`}
        station={station}
        product={product}
        onBack={handleBack}
        type=""
        date={date}
        onChange={handleChange}
      />
    );
  };

  useEffect(() => {
    loadSignoffStepsPage();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  return (
    <Box>
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
      <Steps />
    </Box>
  );
};

export default SignoffSteps;
