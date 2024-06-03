import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Stack,
  Typography,
  Box,
  IconButton,
  TextField,
  Button,
  InputAdornment,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import { useFormik } from "formik";
import * as yup from "yup";

import { Accordion, AccordionDetails, AccordionSummary } from "./Accordion";

import { toStringDate } from "../utils/helpers";

import { tokens } from "../theme";
import axios from "../api/axios";
import userAuth from "../utils/userAuth";
import { IP } from "../env";

const CommentAccordion = ({ formID, form }) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [comments, setComments] = useState([]);

  const loadComments = async () => {
    const res = await axios.post("/comment", { formID, form });
    if (userAuth.control(res)) {
      if (res?.data) {
        setComments(res.data.comments);
      } else {
        switch (res.response?.status) {
          case 500:
            enqueueSnackbar(
              "Something went wrong while fetching the comments!",
              {
                variant: "error",
              }
            );
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
  };

  useEffect(() => {
    loadComments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadComments();
    }, 1000 * 5);
    return function cleanup() {
      clearInterval(interval);
    };
  }, []);

  const handleSubmit = async (values, { resetForm }) => {
    const formData = new FormData();
    for (const name in values) {
      formData.append(name, values[name]);
    }
    const res = await axios.post("/comment/add", formData);
    if (userAuth.control(res)) {
      if (res?.data) {
        enqueueSnackbar("You have left a comment on this form!", {
          variant: "success",
        });
        loadComments();
        resetForm();
      } else {
        switch (res.response?.status) {
          case 404:
            enqueueSnackbar("Station or product is wrong!", {
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
  };

  const [source, setSource] = useState("");

  const formik = useFormik({
    initialValues: {
      formID: formID,
      form: form,
      comment: "",
      picture: null,
    },
    onSubmit: handleSubmit,
    validationSchema: yup.object().shape({
      comment: yup.string().required("Please enter your comment!"),
      picture: yup
        .mixed()
        .nullable()
        .test("FILE_SIZE", "Image must smaller than 10MB!", (value) => {
          return !value || (value && value.size < 1024 * 1024 * 10);
        })
        .test(
          "FILE_FORMAT",
          "You can only upload JPG/JPEG/PNG files!",
          (value) => {
            return !value || (value && SUPPORTED_FORMATS.includes(value?.type));
          }
        ),
    }),
  });

  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    try {
      reader.addEventListener("load", () => callback(reader.result));
      reader.readAsDataURL(img);
    } catch (e) {}
  };

  return (
    <Box
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
        paddingBottom: "10px",
      }}
    >
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              COMMENTS
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <form
            onSubmit={formik.handleSubmit}
            style={{ padding: "5px 0" }}
            encType="multipart/form-data"
          >
            <Stack
              direction="row"
              spacing={2}
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
              <IconButton
                component="label"
                aria-label="attach"
                sx={{
                  width: "5%",
                  transform: "scale(1.2)",
                  color:
                    !!formik.touched.picture && !!formik.errors.picture
                      ? colors.yoggieRed[500]
                      : colors.ciboInnerGreen[500],
                }}
              >
                <AddCircleOutlineIcon />
                <input
                  hidden
                  accept="image/*"
                  type="file"
                  onChange={(e) => {
                    formik.setFieldValue("picture", e.target.files[0]);
                    formik.setTouched({
                      ...formik.touched,
                      picture: true,
                    });
                    getBase64(e.target.files[0], (url) => {
                      setSource(url);
                    });
                    formik.validateForm({
                      picture: e.target.files[0],
                    });
                  }}
                />
              </IconButton>
              <TextField
                sx={{ width: "90%" }}
                variant="filled"
                type="text"
                label="Add a comment"
                onBlur={formik.handleBlur}
                onChange={formik.handleChange}
                value={formik.values.comment}
                name="comment"
                error={!!formik.touched.comment && !!formik.errors.comment}
                InputProps={{
                  endAdornment:
                    !formik.errors.picture && formik.values.picture ? (
                      <InputAdornment position="end">
                        <Chip
                          icon={<ImageIcon />}
                          label="Image"
                          variant="outlined"
                          onClick={async () => {
                            const blob = await (await fetch(source)).blob();
                            window.open(URL.createObjectURL(blob), "_blank");
                          }}
                          onDelete={() => {
                            formik.setFieldValue("picture", null);
                            setSource("");
                          }}
                        />
                      </InputAdornment>
                    ) : undefined,
                }}
              />
              <Button
                color="secondary"
                type="submit"
                sx={{ fontWeight: "bold", fontSize: "17px", width: "5%" }}
              >
                Send
              </Button>
            </Stack>
          </form>
          <p
            style={{
              marginTop: "5px",
              fontSize: 11,
              color: "red",
            }}
          >
            {(formik.touched.picture && formik.errors.picture) ||
              (formik.touched.comment && formik.errors.comment)}
          </p>
          <Divider />
          <List sx={{ width: "100%", bgcolor: "background.paper" }}>
            {comments.map((comment) => {
              return (
                <ListItem
                  alignItems="flex-start"
                  sx={{ display: "flex", alignItems: "center" }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {comment.username.slice(0, 2).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <Stack
                    direction="row"
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <ListItemText
                      primary={comment.comment}
                      secondary={
                        <Box sx={{ alignItems: "center" }}>
                          <Typography
                            sx={{ display: "inline" }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {comment.username}
                          </Typography>
                          {` — ${toStringDate(comment.updatedAt, {
                            month: "short",
                            year: "numeric",
                            day: "numeric",
                            hour: "numeric",
                            minute: "numeric",
                          })}`}
                        </Box>
                      }
                    />
                    {comment.image ? (
                      <a
                        href={
                          "http://" +
                          IP +
                          "/imgs/" +
                          comment.image.folderIndex +
                          "/" +
                          comment.image.fileName
                        }
                        target="_blank"
                      >
                        <img
                          width={50}
                          src={
                            "http://" +
                            IP +
                            "/imgs/" +
                            comment.image.folderIndex +
                            "/thumbnail-" +
                            comment.image.fileName?.substr(
                              0,
                              comment.image.fileName?.lastIndexOf(".")
                            ) +
                            ".jpeg"
                          }
                        />
                      </a>
                    ) : undefined}
                  </Stack>
                </ListItem>
              );
            })}
          </List>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CommentAccordion;
