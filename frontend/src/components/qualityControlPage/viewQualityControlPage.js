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
  Button,
} from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import PrintIcon from "@mui/icons-material/Print";

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
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";

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

  const [clicked, setClicked] = useState(false);

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

  const handleSignOff = async () => {
    if (!clicked) {
      const res = await axios.post("/qualitycontrol/signoff", { id });
      if (userAuth.control(res)) {
        switch (res.response?.status) {
          case 200:
            enqueueSnackbar("You have successfully signed off the form!", {
              variant: "success",
            });
            break;
          case 400:
            enqueueSnackbar("Something went wrong while signin off the form!", {
              variant: "error",
            });
            break;
          case 406:
            enqueueSnackbar("You don't have an access for this action!", {
              variant: "error",
            });
            localStorage.removeItem("token");
            localStorage.removeItem("username");
            break;
          case 503:
            enqueueSnackbar("Something went wrong with the server!", {
              variant: "error",
            });
            break;
        }
        await loadQualityControlPage();
      } else {
        navigate("/login");
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        enqueueSnackbar("Please sign in again!", {
          variant: "error",
        });
      }
    }

    setClicked(true);
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
      <Button
        sx={{ marginY: "3px", borderWidth: "2px", fontWeight: "700" }}
        variant="outlined"
        id="button"
        color="secondary"
        startIcon={<PrintIcon />}
        onClick={() => {
          window.print();
        }}
      >
        Print
      </Button>
      <Divider />
      <Label
        title="Data Sheet Signed Off"
        subtitle={
          data ? (
            data?.signedOff === "" ? (
              localStorage.getItem("access").includes("S") ? (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ fontWeight: "600" }}
                  onClick={handleSignOff}
                >
                  Sign Off
                </Button>
              ) : (
                "Not Signed Off"
              )
            ) : (
              data?.signedOff +
              " • " +
              toStringDate(data?.signOffDate, {
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })
            )
          ) : (
            ""
          )
        }
      />
      <RunLabel started={data?.started} startDateTime={data?.startDateTime} />
      <Accordion defaultExpanded>
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
                  status={data?.isNotchCorrect !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.isNotchCorrect !== "No"} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
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
            <StatusIndicator status={Boolean(data?.xrayRequired)} />
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
      <Accordion defaultExpanded>
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
            <StatusIndicator status={Boolean(data?.metalCardRequired)} />
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
      <Accordion defaultExpanded>
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
                  text={data?.metalBallSingleRequired}
                  status={data?.metalBallSingleRequired === "Yes"}
                />
              }
            />
            <StatusIndicator status={Boolean(data?.metalBallSingleRequired)} />
          </Stack>
          {data?.metalBallSingleRequired === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallSingleFeDetected}
                      status={data?.metalBallSingleFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallSingleFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 4.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallSingleNonFeDetected}
                      status={data?.metalBallSingleNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallSingleNonFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallSingleSsDetected}
                      status={data?.metalBallSingleSsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallSingleSsDetected === "Yes"}
                />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              METAL DETECTOR BALLS CHECK (If machine is required)
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
                  text={data?.metalBallMultipleRequired}
                  status={data?.metalBallMultipleRequired === "Yes"}
                />
              }
            />
            <StatusIndicator
              status={Boolean(data?.metalBallMultipleRequired)}
            />
          </Stack>
          {data?.metalBallMultipleRequired === "Yes" ? (
            <div>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Fe 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallMultipleFeDetected}
                      status={data?.metalBallMultipleFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallMultipleFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="Non Fe 4.50 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallMultipleNonFeDetected}
                      status={data?.metalBallMultipleNonFeDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallMultipleNonFeDetected === "Yes"}
                />
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between">
                <Label
                  title="SS 3.00 mm detected?"
                  subtitle={
                    <LabelResult
                      text={data?.metalBallMultipleSsDetected}
                      status={data?.metalBallMultipleSsDetected === "Yes"}
                    />
                  }
                />
                <StatusIndicator
                  status={data?.metalBallMultipleSsDetected === "Yes"}
                />
              </Stack>
            </div>
          ) : undefined}
          <Divider />
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
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
              title="Correct Packaging?"
              subtitle={data?.correctPackaging}
            />
            <StatusIndicator status={Boolean(data?.correctPackaging)} />
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
      <Accordion defaultExpanded>
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
                  status={data?.unitsCase !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.unitsCase !== "No"} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Sales Order Number"
              subtitle={
                data?.salesOrderNumber === "No"
                  ? "Not Given"
                  : data?.salesOrderNumber
              }
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
          <Stack
            direction="row"
            justifyContent="space-between"
            style={{ display: data?.caseLabel === "Yes" ? "block" : "none" }}
          >
            <ImageLabel
              title="Picture Of Box-Label"
              folderIndex={images[6]?.folderIndex}
              fileName={images[6]?.fileName}
            />
            <StatusIndicator status={Boolean(images[6])} />
          </Stack>
        </AccordionDetails>
      </Accordion>
      <Accordion defaultExpanded>
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
      <CommentAccordion formID={id} form="qualityControl" />
    </Box>
  );
};

export default ViewQualityControlPage;
