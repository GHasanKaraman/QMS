import {
  Box,
  ButtonBase,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Zoom,
} from "@mui/material";
import { useEffect } from "react";
import Header from "../Header";
import { tokens } from "../../theme";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import axios from "../../api/axios";
import { useState } from "react";
import userAuth from "../../utils/userAuth";
import { toStringDate } from "../../utils/helpers";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ErrorOutline from "@mui/icons-material/ErrorOutline";

const ViewGEMBAPage = (props) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [forms, setForms] = useState([]);

  const getFormColor = (item) => {
    if (item.status === "passed") {
      return colors.ciboInnerGreen[500];
    } else {
      return colors.yoggieRed[500];
    }
  };

  const loadForms = async () => {
    try {
      const res = await axios.get("/gemba", {});
      if (userAuth.control(res)) {
        setForms(Object.values(res.data.gemba));
      } else {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        enqueueSnackbar("Please sign in again!", {
          variant: "error",
        });
      }
    } catch (error) {
      enqueueSnackbar("Something went wrong while authenticating the user!", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  useEffect(() => {
    loadForms();
  }, []);

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
      <Header title="GEMBA CARDS" subtitle="You can view the forms" />

      <Grid container spacing={3} justifyContent="center">
        {forms.map((item, index) => {
          return (
            <Grid
              key={index}
              item
              sm={8}
              md={4}
              lg={3}
              xl={2}
              textAlign={"center"}
            >
              <Zoom
                in={Boolean(forms)}
                style={{
                  transitionDelay: (index / 3 + (index % 3)) * 75,
                }}
              >
                <ButtonBase
                  onClick={() => {
                    navigate(`/gemba/${item._id}`);
                  }}
                >
                  <Card
                    sx={{
                      minWidth: 250,
                      minHeight: 113,
                      background: getFormColor(item),
                      transition: "0.2s",
                      "&:hover": {
                        transform: "scale(1.05) !important",
                        boxShadow: `0px 7px 40px ${getFormColor(item)}}`,
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        item.status === "failed" ? (
                          <ErrorOutline />
                        ) : (
                          <TaskAltIcon />
                        )
                      }
                      title={
                        <Typography variant="h4" fontWeight="bold">
                          {item.truck}
                        </Typography>
                      }
                      subheader={
                        <Stack
                          direction="row"
                          spacing={3}
                          sx={{ color: colors.primary[400] }}
                        >
                          <Typography variant="h7">
                            {toStringDate(item.createdAt, {
                              month: "short",
                              year: "numeric",
                              day: "numeric",
                              hour: "numeric",
                              minute: "numeric",
                            })}
                          </Typography>
                        </Stack>
                      }
                      sx={{ color: colors.primary[400] }}
                    />
                    <CardContent>
                      <Stack
                        spacing={2}
                        direction="column"
                        textAlign={"center"}
                        justifyContent={"space-between"}
                      >
                        <Typography
                          variant="h5"
                          sx={{ color: colors.primary[400] }}
                        >
                          {item.area}
                        </Typography>
                        <Typography
                          variant="h5"
                          sx={{ color: colors.primary[400] }}
                        >
                          {item.username}
                        </Typography>
                      </Stack>
                    </CardContent>
                  </Card>
                </ButtonBase>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default ViewGEMBAPage;
