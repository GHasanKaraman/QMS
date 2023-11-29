import { CircularProgress } from "@mui/material";
import { useEffect } from "react";

const PreviewImage = ({ preview }) => {
  return preview ? (
    <img src={preview} width="90px" height="90px" />
  ) : (
    <CircularProgress size={30} sx={{ color: "#73b569" }} />
  );
};

export default PreviewImage;
