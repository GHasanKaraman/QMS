import React, { useEffect, useRef, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Stack,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import UploadIcon from "@mui/icons-material/Upload";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  CircleStencil,
  Cropper,
  RectangleStencil,
} from "react-advanced-cropper";
import "react-advanced-cropper/dist/themes/corners.css";
import "react-advanced-cropper/dist/style.css";

const UploadMultipleImage = ({ sx, stencil, onChange, error, helperText }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

  const [openDialog, setOpenDialog] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);
  const inputRef = useRef(null);
  const cropperRef = useRef(null);
  const [images, setImages] = useState([]);
  const [coordinates, setCoordinates] = useState(null);
  const [image, setImage] = useState("");
  const [blobs, setBlobs] = useState([]);
  const onCrop = () => {
    const cropper = cropperRef.current;
    if (cropper) {
      const canvas = cropper.getCanvas();
      const newImage = canvas.toDataURL();
      const updatedImages = [...images];
      updatedImages[currentImageIndex] = newImage;

      const updatedBlobs = [...blobs];
      canvas.toBlob((blob) => {
        if (blob) {
          updatedBlobs[currentImageIndex] = blob;
          setBlobs(updatedBlobs);
        }
      }, "image/jpeg");
      setImages(updatedImages);
      onChange(updatedBlobs);
      setOpenDialog(false);
    }
  };

  const onLoadImage = (event) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map((file) =>
        URL.createObjectURL(file),
      );
      setImages((prev) => [...prev, ...newImages]);
      // Open dialog for the last uploaded image
      setCurrentImageIndex(images.length);
      setImage(newImages[newImages.length - 1]);
      setOpenDialog(true);

      event.target.value = "";
    }
  };

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image));
    };
  }, [images]);

  const onCancel = () => {
    setOpenDialog(false);
    setImage("");
  };

  const handleEditImage = (index) => {
    setCurrentImageIndex(index);
    setImage(images[index]);
    setCoordinates(null);
    setOpenDialog(true);
  };

  const handleDeleteImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedBlobs = blobs.filter((_, i) => i !== index);
    setImages(updatedImages);
    setBlobs(updatedBlobs);
    onChange(updatedBlobs);
  };

  return (
    <Stack sx={{ ...sx, alignItems: "center" }} spacing={1}>
      <Dialog
        fullScreen={fullScreen}
        open={openDialog}
        onClose={onCancel}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Crop Image</DialogTitle>
        <DialogContent>
          <Cropper
            stencilComponent={
              stencil === "circle" ? CircleStencil : RectangleStencil
            }
            ref={cropperRef}
            defaultCoordinates={coordinates}
            src={image}
            stencilProps={{ grid: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="error" onClick={onCancel}>
            CANCEL
          </Button>
          <Button
            variant="contained"
            color="warning"
            onClick={() => cropperRef.current?.reset()}
          >
            RESET
          </Button>
          <Button variant="contained" color="success" onClick={onCrop}>
            CROP
          </Button>
        </DialogActions>
      </Dialog>
      <IconButton
        color={error ? "error" : "secondary"}
        component="label"
        sx={{
          width: "100px",
          height: "100px",
          borderRadius: "1px",
          outline: "1px dashed",
        }}
      >
        <Stack direction="column" alignItems="center">
          <div>
            <UploadIcon fontSize="large" />
            Upload
          </div>
        </Stack>
        <input
          ref={inputRef}
          hidden
          accept="image/*"
          type="file"
          multiple
          onChange={onLoadImage}
        />
      </IconButton>
      <Stack direction="column" spacing={2}>
        {images.map((imgSrc, index) => (
          <Stack
            key={index}
            sx={{
              width: "200px",
              height: "200px",
              justifyContent: "center",
            }}
          >
            <Stack sx={{ position: "relative" }}>
              <Stack
                sx={{
                  "&:hover": {
                    backgroundColor: "black",
                    transition: "0.5s",
                    opacity: "0.5",
                  },
                  "&:hover .icons": {
                    visibility: "visible",
                  },
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: "1",
                  borderRadius: stencil === "circle" ? "100px" : "0px",
                }}
              >
                <Stack
                  direction="row"
                  spacing={4}
                  className="icons"
                  sx={{
                    visibility: "hidden",
                    color: "white",
                    height: "100%",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <IconButton
                    disableFocusRipple={true}
                    onClick={() => handleEditImage(index)}
                  >
                    <EditIcon sx={{ color: "white" }} />
                  </IconButton>

                  <IconButton
                    disableFocusRipple={true}
                    onClick={() => handleDeleteImage(index)}
                  >
                    <DeleteIcon sx={{ color: "white" }} />
                  </IconButton>
                </Stack>
              </Stack>
              <img
                width={200}
                height={200}
                style={{
                  borderRadius: stencil === "circle" ? "100px" : "0px",
                  objectFit: "contain",
                }}
                alt={`Uploaded ${index}`}
                src={imgSrc}
              />
            </Stack>
          </Stack>
        ))}
      </Stack>
      <div style={{ fontSize: "0.64rem", fontWeight: 400, color: "#d32f2f" }}>
        {helperText}
      </div>
    </Stack>
  );
};

export default UploadMultipleImage;
