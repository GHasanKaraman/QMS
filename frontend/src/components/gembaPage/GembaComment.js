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

import { toStringDate } from "../../utils/helpers";

import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { IP } from "../../env";

const GembaComment = ({ onChange }) => {
  const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png"];

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [source, setSource] = useState("");

  const formik = useFormik({
    initialValues: {
      comment: "",
      picture: null,
    },
    validationSchema: yup.object().shape({
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

  const triggerChange = (copy) => {
    onChange(copy);
  };

  return (
    <form style={{ padding: "5px 0" }} encType="multipart/form-data">
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
              const copy = { ...formik.values };
              copy.picture = e.target.files[0];
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
              triggerChange(copy);
            }}
          />
        </IconButton>
        <TextField
          sx={{ width: "90%" }}
          variant="filled"
          type="text"
          label="Add a comment"
          onBlur={formik.handleBlur}
          onChange={(e) => {
            formik.setFieldValue("comment", e.target.value);
            const copy = { ...formik.values };
            copy.comment = e.target.value;
            triggerChange(copy);
          }}
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
                      const copy = { ...formik.values };
                      copy.picture = null;
                      triggerChange(copy);
                    }}
                  />
                </InputAdornment>
              ) : undefined,
          }}
        />
      </Stack>
    </form>
  );
};

export default GembaComment;
