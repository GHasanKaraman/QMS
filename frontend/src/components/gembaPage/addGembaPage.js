import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  useTheme,
  useMediaQuery,
  Autocomplete,
  TextField,
  Typography,
  Button,
  Stack,
  Backdrop,
  CircularProgress,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { useFormik } from "formik";
import * as yup from "yup";

import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { useSnackbar } from "notistack";

import Header from "../Header";
import { tokens } from "../../theme";
import ToggleButtonCheck from "../ToggleButtonCheck";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";

import useQuestions from "./gembaQuestions";
import GembaComment from "./GembaComment";

const AddGEMBAPage = (props) => {
  const { gembaQuestions } = useQuestions();

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isNonMobile = useMediaQuery("(min-width:600px)");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

  const handleSubmit = async (values, { resetForm }) => {
    setOpen(true);
    const answers = values.questions;
    const keys = Object.keys(answers);
    const questions = gembaQuestions.filter(({ id }) => keys.includes(id + ""));
    questions.forEach((item) => {
      item.answer = answers[item.id];
      delete item.id;
      delete item.area;
    });

    values.questions = questions;

    const formData = new FormData();

    // Append simple key
    formData.append("area", values.area);

    // Append questions array
    values.questions.forEach((q, index) => {
      formData.append(`questions[${index}][question]`, q.question);
      formData.append(`questions[${index}][answer]`, q.answer);
    });

    // Append comments object
    Object.entries(values.comments).forEach(([key, value]) => {
      if (value.comment) {
        formData.append(`comments[]`, value.comment);
        formData.append(`pictures[${key}]`, value.picture); // File or Blob
      }
    });

    const res = await axios.post("/gemba/add", formData);
    console.log(res.data);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have successfully created the GEMBA checklist!", {
          variant: "success",
        });
        navigate("/gemba/" + res.data.form._id);
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Area is wrong!", {
              variant: "error",
            });
            break;
          case 503:
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
    setOpen(false);
  };

  const formik = useFormik({
    initialValues: {
      area: null,
      questions: {},
      comments: {},
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      area: yup.string().required("Please select the Area!"),

      questions: yup
        .mixed()
        .nullable()
        .test(
          "QUESTION_VALIDATION",
          "Please answer all the questions!",
          (value) => {
            if (value) {
              if (
                Object.values(value).length ===
                gembaQuestions.filter(({ area }) => area === formik.values.area)
                  .length
              ) {
                return true;
              }
            }
            return false;
          }
        ),
      comments: yup
        .mixed()
        .nullable()
        .test(
          "COMMENT_VALIDATION",
          "You must both upload an picture and type something!",
          (value) => {
            const allComments = Object.values(value);

            if (
              allComments.length !==
              Object.values(formik.values.questions).filter((a) => a === "Fail")
                .length
            ) {
              return false;
            }

            for (let i = 0; i < allComments.length; i++) {
              if (
                allComments[i].picture === null ||
                !allComments[i].comment ||
                allComments[i].comment === "" ||
                allComments[i].comment.length === 0
              ) {
                return false;
              }
            }

            return true;
          }
        ),
    }),
  });

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
      <Header title="GEMBA CHECKLIST" subtitle="Please fill out the form" />

      <form
        onSubmit={(e) => {
          if (!formik.isValid && !formik.isValidating) {
            enqueueSnackbar("Please fill out all the missing fields!", {
              variant: "error",
            });
          }
          formik.handleSubmit(e);
        }}
        style={{ paddingBottom: "10px" }}
      >
        <Box
          display="grid"
          gap="30px"
          gridTemplateColumns="repeat(4, minmax(0, 1fr))"
          sx={{
            "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
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
          <Autocomplete
            onChange={async (_, value) => {
              formik.resetForm();
              formik.setFieldValue("questions", {});
              formik.setFieldValue("area", value);
            }}
            value={formik.values.area}
            sx={{ gridColumn: "span 4" }}
            options={[
              "ALL AREAS",
              "PILLOW",
              "AUTOMATION",
              "NEW AUTOMATION",
              "ROASTING",
              "MIXING",
            ]}
            onBlur={formik.handleBlur}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="filled"
                label="Area"
                name="area"
                error={!!formik.touched.area && !!formik.errors.area}
                helperText={formik.touched.area && formik.errors.area}
              />
            )}
          />
        </Box>

        <div
          style={{
            marginTop: "20px",
            display: formik.values.area == null ? "none" : "block",
          }}
        >
          <Accordion defaultExpanded>
            <AccordionSummary
              aria-controls="panel8d-content"
              id="panel8d-header"
              expandIcon={<ExpandMoreIcon />}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                width="100%"
              >
                <Typography fontWeight={600} fontSize={18}>
                  CHECKS
                </Typography>
                <Typography fontWeight={600}>
                  {gembaQuestions.filter(
                    ({ area }) => area === formik.values.area
                  ).length + " Items"}
                </Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Box
                display="grid"
                gap="30px"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 4" },
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
                <Stack direction="column" spacing={2} width="100%">
                  {gembaQuestions
                    .filter(({ area }) => area === formik.values.area)
                    .map((item) => {
                      const { id, area, question } = item;
                      return (
                        <Stack direction="column" spacing={2} width="100%">
                          <Typography
                            variant="h6"
                            color={colors.grey[100]}
                            fontWeight="600"
                            sx={{ m: "0 0 -20px 0", minWidth: "250px" }}
                          >
                            {question}
                          </Typography>

                          <ToggleButtonCheck
                            style={{ gridColumn: "span 4" }}
                            alignment={formik.values.questions[id]}
                            onChange={(value) => {
                              const temp = formik.values.questions;
                              temp[id] = value;
                              formik.setFieldValue("questions", temp);
                            }}
                            error={
                              !!formik.touched.ballOrCard &&
                              !!formik.errors.ballOrCard
                            }
                            options={[
                              {
                                label: "Pass",
                              },
                              {
                                label: "Fail",
                              },
                            ]}
                          />
                          <Stack
                            sx={{
                              width: "100%",
                              display:
                                formik.values.questions[id] !== "Fail"
                                  ? "none"
                                  : undefined,
                            }}
                          >
                            <GembaComment
                              onChange={(values) => {
                                const temp = formik.values.comments;
                                temp[id] = values;
                                formik.setFieldValue("comments", temp);
                              }}
                            />
                          </Stack>
                        </Stack>
                      );
                    })}
                </Stack>
              </Box>
            </AccordionDetails>
          </Accordion>
          <Box display="flex" justifyContent="center" mt="20px">
            <Button
              type="submit"
              color="secondary"
              variant="contained"
              sx={{ width: "100%" }}
            >
              Save
            </Button>
          </Box>
        </div>
      </form>
    </Box>
  );
};

export default AddGEMBAPage;
