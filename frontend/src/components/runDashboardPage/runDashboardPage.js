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
import { useNavigate, useParams } from "react-router-dom";
import Header from "../Header";
import { useEffect, useState } from "react";
import axios from "../../api/axios";
import { tokens } from "../../theme";
import { useSnackbar } from "notistack";
import userAuth from "../../utils/userAuth";
import { extractUniqueProducts, toStringDate } from "../../utils/helpers";
import moment from "moment-timezone";
import FormCard from "../FormCard";

import MenuIcon from "@mui/icons-material/Menu";

const RunDashboardPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);
  const [products, setProducts] = useState([]);

  const [days, setDays] = useState([]);

  const [open, setOpen] = useState(false);

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
          Test
        </DialogTitle>
        <DialogContent>
          <Stack>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {}}
            >
              Quality Run Summary
            </Button>
            <Divider />
            <Button
              color="secondary"
              sx={{ fontWeight: 600, fontSize: 18 }}
              onClick={() => {}}
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
      <Header title={id} subtitle="Run Quality Dashboard" />
      <Accordion expanded={true}>
        <AccordionSummary
          sx={{ background: colors.grey[800], fontWeight: 600, fontSize: 15 }}
        >
          Current Runs
        </AccordionSummary>
        <AccordionDetails>FL-611441</AccordionDetails>
      </Accordion>
      <Accordion expanded={true}>
        <AccordionSummary
          sx={{ background: colors.grey[800], fontWeight: 600, fontSize: 15 }}
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
                        <Typography fontSize={21} fontWeight={600}>
                          {product + " • " + "ROASTED HAZELNUTS 26 oz"}
                        </Typography>
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
                          secondaryAction={
                            <IconButton
                              sx={{ padding: "0 0px" }}
                              onClick={() => {
                                setOpen(true);
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
                            {_forms.map((form) => {
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
