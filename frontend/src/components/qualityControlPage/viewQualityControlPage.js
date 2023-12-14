import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
  Chip,
  Divider,
  Stack,
  Typography,
  Backdrop,
  CircularProgress,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";

import { toStringDate } from "../../utils/helpers";
import Header from "../Header";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import LabelResult from "../LabelResult";
import StatusIndicator from "../StatusIndicator";
import ImageLabel from "../ImageLabel";

const ViewQualityControlPage = (props) => {
  const params = useParams();
  const { id } = params;

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();
  const [open, setOpen] = useState(false);

  const loadQualityControlPage = async () => {
    setOpen(true);
    const res = await axios.post("/qualitycontrol/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.qualityControlForm);
      setImages(res.data.images);
      setProduct(res.data.product);
      console.log(res.data.images);
      console.log(res.data.qualityControlForm);
      console.log(res.data.product);
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

  useEffect(() => {
    loadQualityControlPage();
  }, []);

  useEffect(() => {
    document.title = props.title || "";
  }, [props.title]);

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
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Header
          title="Quality Control Inspection"
          subtitle={
            "Trigger: Run Started (" +
            toStringDate(data?.createdAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }) +
            ") • Updated: " +
            toStringDate(data?.updatedAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            }) +
            " • Station: " +
            data?.station +
            " • Product Type: " +
            product?.desc +
            " • SKU: " +
            product?.part
          }
        />
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ pl: "20px" }}
        >
          <div className="swing">
            {data ? (
              data?.status === "passed" ? (
                <ThumbUpIcon
                  sx={{
                    color: colors.ciboInnerGreen[500],
                    fontSize: "25px",
                  }}
                />
              ) : (
                <ThumbDownIcon
                  sx={{
                    color: colors.yoggieRed[500],
                    fontSize: "25px",
                  }}
                />
              )
            ) : undefined}
          </div>
          <Box
            sx={{
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {data
              ? data?.status === "passed"
                ? "Passed"
                : "Failed"
              : undefined}
          </Box>
        </Stack>
      </Stack>
      <Divider />
      <Label
        title="To"
        subtitle="Gurkan Karaman, Rabi Alam, Joseph Ben Yakob, Moshe Ben Yahuda"
      />
      <Divider />
      <Label
        title="Completed By"
        subtitle={
          data?.username +
          " • " +
          toStringDate(data?.createdAt, {
            month: "short",
            year: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        }
      />
      <Divider />
      <Label title="Data Sheet Signed Off" subtitle="Not Signed Off" />
      <Divider />
      <Label title="Run" subtitle="Started Dec 12, 2023 at 9.04 AM" />
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              PRODUCT INFORMATION
            </Typography>
            <Typography fontWeight={600}>10 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Are the ingredients correct?"
              subtitle={
                <LabelResult
                  text={data?.areIngredientsCorrect}
                  status={data?.areIngredientsCorrect !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.areIngredientsCorrect !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture Of Product"
              folderIndex={images[0]?.folderIndex}
              fileName={images[0]?.fileName}
            />
            <StatusIndicator status={Boolean(images[0])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the taste acceptable or unacceptable?"
              subtitle={
                <LabelResult
                  text={data?.isTasteAcceptable}
                  status={data?.isTasteAcceptable !== "Unacceptable"}
                />
              }
            />
            <StatusIndicator
              status={data?.isTasteAcceptable !== "Unacceptable"}
            />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture Of Product"
              folderIndex={images[1]?.folderIndex}
              fileName={images[1]?.fileName}
            />
            <StatusIndicator status={Boolean(images[1])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
            <StatusIndicator status={Boolean(data?.lotCode)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Expiration Date"
              subtitle={toStringDate(data?.expirationDate, {
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            />
            <StatusIndicator status={Boolean(data?.expirationDate)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Current Weight" subtitle={data?.currentWeight} />
            <StatusIndicator status={Boolean(data?.currentWeight)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="What is the unit of measure?"
              subtitle={data?.unitOfMeasure}
            />
            <StatusIndicator status={Boolean(data?.unitOfMeasure)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the seal correct?"
              subtitle={
                <LabelResult
                  text={data?.isSealCorrect}
                  status={data?.isSealCorrect === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.isSealCorrect === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is the notch correct?"
              subtitle={
                <LabelResult
                  text={data?.isNotchCorrect}
                  status={data?.isNotchCorrect === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.isNotchCorrect === "Yes"} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              X-RAYS METAL DETECTOR CARD CHECK
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="X-RAYS REQUIRED?"
              subtitle={
                <LabelResult
                  text={data?.xrayRequired}
                  status={data?.xrayRequired === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.xrayRequired === "Yes"} />
          </Stack>
          {data?.xrayRequired === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 2.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.xrayFeDetected}
                      status={data?.xrayFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.xrayFeDetected === "Yes"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 2.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.xrayNonFeDetected}
                      status={data?.xrayNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.xrayNonFeDetected === "Yes"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 2.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.xraySsDetected}
                      status={data?.xraySsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.xraySsDetected === "Yes"} />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              METAL DETECTOR CARDS CHECK
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="METAL DETECTOR CARD REQUIRED?"
              subtitle={
                <LabelResult
                  text={data?.metalCardRequired}
                  status={data?.metalCardRequired === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.metalCardRequired === "Yes"} />
          </Stack>
          {data?.metalCardRequired === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 2.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalCardFeDetected}
                      status={data?.metalCardFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalCardFeDetected === "Yes"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 2.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalCardNonFeDetected}
                      status={data?.metalCardNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalCardNonFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 2.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalCardSsDetected}
                      status={data?.metalCardSsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalCardSsDetected === "Yes"} />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              METAL DETECTOR BALLS CHECK
            </Typography>
            <Typography fontWeight={600}>4 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="METAL DETECTOR BALL REQUIRED?"
              subtitle={
                <LabelResult
                  text={data?.metalBallRequired}
                  status={data?.metalBallRequired === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.metalBallRequired === "Yes"} />
          </Stack>
          {data?.metalBallRequired === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallFeDetected}
                      status={data?.metalBallFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalBallFeDetected === "Yes"} />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 4.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallNonFeDetected}
                      status={data?.metalBallNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallNonFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallSsDetected}
                      status={data?.metalBallSsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator status={data?.metalBallSsDetected === "Yes"} />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              LABEL INSPECTION (CCP)
            </Typography>
            <Typography fontWeight={600}>9 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Correct Container?"
              subtitle={data?.correctContainer}
            />
            <StatusIndicator status={Boolean(data?.correctContainer)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture (Front)"
              folderIndex={images[2]?.folderIndex}
              fileName={images[2]?.fileName}
            />
            <StatusIndicator status={Boolean(images[2])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture (Back)"
              folderIndex={images[3]?.folderIndex}
              fileName={images[3]?.fileName}
            />
            <StatusIndicator status={Boolean(images[3])} />
          </Stack>
          <Divider />
          <Stack direction="row" spacing={0.5}>
            {product?.allergens === ""
              ? "There is no allergen!"
              : product?.allergens?.split("").map((allergen) => {
                  return (
                    <Chip
                      key={allergen}
                      label={allergen}
                      variant="filled"
                      color="primary"
                      style={{
                        color: colors.contrast[300],
                        fontWeight: "bold",
                        fontSize: "13px",
                        backgroundColor: colors.contrast[100],
                        borderRadius: "5px",
                      }}
                    />
                  );
                })}
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Are allergens correct?"
              subtitle={
                <LabelResult
                  text={data?.areAllergensCorrect}
                  status={data?.areAllergensCorrect === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.areAllergensCorrect === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Allergen Statement?"
              subtitle={
                <LabelResult
                  text={data?.allergenStatement}
                  status={data?.allergenStatement !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.allergenStatement !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture Of Allergen Statement"
              folderIndex={images[4]?.folderIndex}
              fileName={images[4]?.fileName}
            />
            <StatusIndicator status={Boolean(images[4])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Label / Package Correct?"
              subtitle={
                <LabelResult
                  text={data?.labelPackageCorrect}
                  status={data?.labelPackageCorrect !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.labelPackageCorrect !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture Of Barcode"
              folderIndex={images[5]?.folderIndex}
              fileName={images[5]?.fileName}
            />
            <StatusIndicator status={Boolean(images[5])} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              CASE INFORMATION
            </Typography>
            <Typography fontWeight={600}>9 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Is case count correct?"
              subtitle={
                <LabelResult
                  text={data?.unitsCase}
                  status={data?.unitsCase === "Yes"}
                />
              }
            />
            <StatusIndicator status={data?.unitsCase === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Sales Order Number"
              subtitle={data?.salesOrderNumber}
            />
            <StatusIndicator status={data?.unitsCase === "Yes"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Case Label"
              subtitle={
                <LabelResult
                  text={data?.caseLabel}
                  status={data?.caseLabel !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.caseLabel !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Picture Of Box-Label"
              folderIndex={images[6]?.folderIndex}
              fileName={images[6]?.fileName}
            />
            <StatusIndicator status={Boolean(images[6])} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              ANY DEVIATIONS?
            </Typography>
            <Typography fontWeight={600}>9 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Any deviations?" subtitle={data?.anyDeviations} />
            <StatusIndicator status={Boolean(data?.anyDeviations)} />
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ViewQualityControlPage;
