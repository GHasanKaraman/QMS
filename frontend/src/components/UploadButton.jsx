import { useEffect, useState } from "react";
import { Box, Stack, IconButton } from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";

import PreviewImage from "./previewImage";

const UploadButton = (props) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  useEffect(() => {
    if (props.value && !props.error && imageUrl === "") {
      getBase64(props.value, (url) => {
        setImageUrl(url);
        setLoading(true);
      });
    } else {
      setImageUrl("");
      setLoading(false);
    }
  }, [props.value]);

  return (
    <Box sx={{ gridColumn: "span 4" }}>
      <IconButton
        color="secondary"
        component="label"
        sx={{
          width: "100px",
          height: "100px",
          borderRadius: "1px",
          outline: "1px dashed",
        }}
      >
        <Stack direction="column" alignItems="center">
          {loading ? (
            props.value ? (
              <PreviewImage preview={imageUrl} />
            ) : null
          ) : (
            <div>
              <UploadIcon fontSize="large" />
              Upload
            </div>
          )}
        </Stack>

        <input
          hidden
          accept="image/*"
          type="file"
          onChange={async (e) => {
            const fileState = e.target.files.length > 0;
            setLoading(fileState);
            await props.onFileChange(e.target.files[0], fileState);
          }}
        />
      </IconButton>
      <p
        style={{
          marginTop: "5px",
          fontSize: 11,
          color: props.error ? "red" : "black",
        }}
      >
        {props.helperText}
      </p>
    </Box>
  );
};

export default UploadButton;
