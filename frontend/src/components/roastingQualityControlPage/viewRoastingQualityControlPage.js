import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import {
  Box,
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
import StatusIndicator from "../StatusIndicator";
import CommentAccordion from "../CommentAccordion";
import RunLabel from "../RunLabel";
import LabelResult from "../LabelResult";
import ImageLabel from "../ImageLabel";

const ViewRoastingQualityControlPage = (props) => {
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

  const loadViewRoastingQualityPage = async () => {
    setOpen(true);
    const res = await axios.post("/roastingquality/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.roastingQualityForm);
      setProduct(res.data.product);
      setImages(res.data.images);
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
    loadViewRoastingQualityPage();
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
          title="Roasting Quality Control"
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
      <Divider />

      <Label
        title="Data Sheet Signed Off"
        subtitle={
          data
            ? !data.signOff
              ? "Not Signed Off"
              : data?.signOff.signedOff +
                " • " +
                toStringDate(data?.signOff.createdAt, {
                  month: "short",
                  year: "numeric",
                  day: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                })
            : ""
        }
      />
      <RunLabel
        started={data?.started}
        startDateTime={data?.startDateTime}
        shift={data?.shift}
      />

      <div
        key="R1_View"
        style={{ display: data?.station === "ROAST-1" ? "block" : "none" }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                QUALITY CHECKS
              </Typography>
              <Typography fontWeight={600}>9 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Lot Code"
                subtitle={data?.lotCode}
              />
              <StatusIndicator status={Boolean(data?.lotCode)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Pre-Mix Lot Code (Mixing)"
                subtitle={data?.preLotCodeMixing}
              />
              <StatusIndicator status={Boolean(data?.preLotCodeMixing)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Pre-Mix Lot Code (Liquid)"
                subtitle={data?.preLotCodeLiquid}
              />
              <StatusIndicator status={Boolean(data?.preLotCodeLiquid)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Pre-Mix Lot Code (Powder)"
                subtitle={data?.preLotCodePowder}
              />
              <StatusIndicator status={Boolean(data?.preLotCodePowder)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Are the allergens correct?"
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
                title="Sensory Evaluation Sample OK/Sample Taken"
                subtitle={
                  <LabelResult
                    text={data?.sensoryEvaluation}
                    status={data?.sensoryEvaluation === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.sensoryEvaluation === "Yes"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Belt Speed" subtitle={data?.beltSpeed} />
              <StatusIndicator status={Boolean(data?.beltSpeed)} />
            </Stack>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Is product thickness correct?"
                subtitle={
                  <LabelResult
                    text={data?.productThickness}
                    status={data?.productThickness === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.productThickness === "Yes"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Is the color of roasted finished product correct?"
                subtitle={
                  <LabelResult
                    text={data?.colorOfFinishedProduct}
                    status={data?.colorOfFinishedProduct === "Yes"}
                  />
                }
              />
              <StatusIndicator
                status={data?.colorOfFinishedProduct === "Yes"}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                SCREEN TEMPERATURES
              </Typography>
              <Typography fontWeight={600}>8 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="1st Oven" subtitle={data?.temperature1} />
              <StatusIndicator status={Boolean(data?.temperature1)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="2nd Oven" subtitle={data?.temperature2} />
              <StatusIndicator status={Boolean(data?.temperature2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="3rd Oven" subtitle={data?.temperature3} />
              <StatusIndicator status={Boolean(data?.temperature3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="4th Oven" subtitle={data?.temperature4} />
              <StatusIndicator status={Boolean(data?.temperature4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="5th Oven" subtitle={data?.temperature5} />
              <StatusIndicator status={Boolean(data?.temperature5)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="6th Oven" subtitle={data?.temperature6} />
              <StatusIndicator status={Boolean(data?.temperature6)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Temperature (Max 90° F)"
                subtitle={data?.finishedProductTemperature}
              />
              <StatusIndicator
                status={Boolean(data?.finishedProductTemperature)}
              />
            </Stack>
            <Divider />
          </AccordionDetails>
        </Accordion>
      </div>

      <div
        key="R5_View"
        style={{ display: data?.station === "ROAST-M5" ? "block" : "none" }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                QUALITY CHECKS
              </Typography>
              <Typography fontWeight={600}>16 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Receiving Code" subtitle={data?.receivingCode} />
              <StatusIndicator status={Boolean(data?.receivingCode)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Lot Code"
                subtitle={data?.lotCode}
              />
              <StatusIndicator status={Boolean(data?.lotCode)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Cleaning by Allergen or Quality?"
                subtitle={<LabelResult text={data?.cleaning} status={true} />}
              />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Are the allergens correct?"
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
                title="Raw Product Temperature (Max 65° F or higher)"
                subtitle={data?.rawProductTemperature}
              />
              <StatusIndicator status={Boolean(data?.rawProductTemperature)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Oil Parameter" subtitle={data?.oilParameter} />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Salt Parameter" subtitle={data?.saltParameter} />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Drum Speed" subtitle={data?.drumSpeed} />
              <StatusIndicator status={Boolean(data?.drumSpeed)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salt Spiral Speed"
                subtitle={data?.saltSpiralSpeed}
              />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salinity of water (tank) %"
                subtitle={data?.salinityOfWater}
              />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salinity finished product %"
                subtitle={data?.salinityOfProduct}
              />
              <StatusIndicator status={Boolean(data?.salinityOfProduct)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Is the color of roasted finished product correct?"
                subtitle={
                  <LabelResult
                    text={data?.colorOfFinishedProduct}
                    status={data?.colorOfFinishedProduct === "Yes"}
                  />
                }
              />
              <StatusIndicator
                status={data?.colorOfFinishedProduct === "Yes"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Temperature (Max 95° F)"
                subtitle={data?.finishedProductTemperature}
              />
              <StatusIndicator
                status={Boolean(data?.finishedProductTemperature)}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Sensory Evaluation Sample OK/Sample Taken"
                subtitle={
                  <LabelResult
                    text={data?.sensoryEvaluation}
                    status={data?.sensoryEvaluation === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.sensoryEvaluation === "Yes"} />
            </Stack>
            <Divider />
          </AccordionDetails>
        </Accordion>
      </div>

      <div
        key="R234_View"
        style={{
          display:
            data?.station !== "ROAST-M5" && data?.station !== "ROAST-1"
              ? "block"
              : "none",
        }}
      >
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                QUALITY CHECKS
              </Typography>
              <Typography fontWeight={600}>17 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Receiving Code" subtitle={data?.receivingCode} />
              <StatusIndicator status={Boolean(data?.receivingCode)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Lot Code"
                subtitle={data?.lotCode}
              />
              <StatusIndicator status={Boolean(data?.lotCode)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Raw Product Temperature (Max 65° F or higher)"
                subtitle={data?.rawProductTemperature}
              />
              <StatusIndicator status={Boolean(data?.rawProductTemperature)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Cleaning by Allergen or Quality?"
                subtitle={
                  <LabelResult
                    text={data?.cleaning}
                    status={data?.cleaning !== "Quality"}
                  />
                }
              />
              <StatusIndicator status={data?.cleaning !== "Quality"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Are the allergens correct?"
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
                title="Sensory Evaluation Sample OK/Sample Taken"
                subtitle={
                  <LabelResult
                    text={data?.sensoryEvaluation}
                    status={data?.sensoryEvaluation === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.sensoryEvaluation === "Yes"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Belt Speed" subtitle={data?.beltSpeed} />
              <StatusIndicator status={Boolean(data?.beltSpeed)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Is product thickness correct?"
                subtitle={
                  <LabelResult
                    text={data?.productThickness}
                    status={data?.productThickness === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.productThickness === "Yes"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Drum Speed" subtitle={data?.drumSpeed} />
              <StatusIndicator status={Boolean(data?.drumSpeed)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salt Spiral Speed"
                subtitle={data?.saltSpiralSpeed}
              />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Salt Parameter" subtitle={data?.saltParameter} />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Oil Parameter" subtitle={data?.oilParameter} />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salinity of water (tank) %"
                subtitle={data?.salinityOfWater}
              />
              <StatusIndicator status={true} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Is the color of roasted finished product correct?"
                subtitle={
                  <LabelResult
                    text={data?.colorOfFinishedProduct}
                    status={data?.colorOfFinishedProduct === "Yes"}
                  />
                }
              />
              <StatusIndicator
                status={data?.colorOfFinishedProduct === "Yes"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Salinity finished product %"
                subtitle={data?.salinityOfProduct}
              />
              <StatusIndicator status={Boolean(data?.salinityOfProduct)} />
            </Stack>
            <Divider />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                SCREEN TEMPERATURES
              </Typography>
              <Typography fontWeight={600}>8 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Stack direction="row" justifyContent="space-between">
              <Label title="1st Oven" subtitle={data?.temperature1} />
              <StatusIndicator status={Boolean(data?.temperature1)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="2nd Oven" subtitle={data?.temperature2} />
              <StatusIndicator status={Boolean(data?.temperature2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="3rd Oven" subtitle={data?.temperature3} />
              <StatusIndicator status={Boolean(data?.temperature3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="4th Oven" subtitle={data?.temperature4} />
              <StatusIndicator status={Boolean(data?.temperature4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="5th Oven" subtitle={data?.temperature5} />
              <StatusIndicator status={Boolean(data?.temperature5)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="6th Oven" subtitle={data?.temperature6} />
              <StatusIndicator status={Boolean(data?.temperature6)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Finished Product Temperature (Max 90° F)"
                subtitle={data?.finishedProductTemperature}
              />
              <StatusIndicator
                status={Boolean(data?.finishedProductTemperature)}
              />
            </Stack>
            <Divider />
          </AccordionDetails>
        </Accordion>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Stack direction="row" justifyContent="space-between" width="100%">
              <Typography fontWeight={600} fontSize={18}>
                FAN SETTINGS
              </Typography>
              <Typography fontWeight={600}>12 Items</Typography>
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="h4"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "10 10 10px 0", minWidth: "250px" }}
            >
              HEATING
            </Typography>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 1 Setting(Heating)"
                subtitle={data?.heatingFan1}
              />
              <StatusIndicator status={Boolean(data?.heatingFan1)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 2 Setting(Heating)"
                subtitle={data?.heatingFan2}
              />
              <StatusIndicator status={Boolean(data?.heatingFan2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 3 Setting(Heating)"
                subtitle={data?.heatingFan3}
              />
              <StatusIndicator status={Boolean(data?.heatingFan3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 4 Setting(Heating)"
                subtitle={data?.heatingFan4}
              />
              <StatusIndicator status={Boolean(data?.heatingFan4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 5 Setting(Heating)"
                subtitle={data?.heatingFan5}
              />
              <StatusIndicator status={Boolean(data?.heatingFan5)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 6 Setting(Heating)"
                subtitle={data?.heatingFan6}
              />
              <StatusIndicator status={Boolean(data?.heatingFan6)} />
            </Stack>
            <Typography
              variant="h4"
              color={colors.grey[100]}
              fontWeight="600"
              sx={{ m: "10 10 10px 0", minWidth: "250px" }}
            >
              COOLING
            </Typography>

            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 1 Setting(Cooling)"
                subtitle={data?.coolingFan1}
              />
              <StatusIndicator status={Boolean(data?.coolingFan1)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 2 Setting(Cooling)"
                subtitle={data?.coolingFan2}
              />
              <StatusIndicator status={Boolean(data?.coolingFan2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 3 Setting(Cooling)"
                subtitle={data?.coolingFan3}
              />
              <StatusIndicator status={Boolean(data?.coolingFan3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 4 Setting(Cooling)"
                subtitle={data?.coolingFan4}
              />
              <StatusIndicator status={Boolean(data?.coolingFan4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 5 Setting(Cooling)"
                subtitle={data?.coolingFan5}
              />
              <StatusIndicator status={Boolean(data?.coolingFan5)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Fan 6 Setting(Cooling)"
                subtitle={data?.coolingFan6}
              />
              <StatusIndicator status={Boolean(data?.coolingFan6)} />
            </Stack>
            <Divider />
          </AccordionDetails>
        </Accordion>
      </div>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              PICTURES
            </Typography>
            <Typography fontWeight={600}>2 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="Raw Material Picture"
              folderIndex={images[0]?.folderIndex}
              fileName={images[0]?.fileName}
            />
            <StatusIndicator status={Boolean(images[0])} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <ImageLabel
              title="
              Finished Product Picture"
              folderIndex={images[1]?.folderIndex}
              fileName={images[1]?.fileName}
            />
            <StatusIndicator status={Boolean(images[1])} />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Stack direction="row" justifyContent="space-between" width="100%">
            <Typography fontWeight={600} fontSize={18}>
              ANY DEVIATIONS?
            </Typography>
            <Typography fontWeight={600}>1 Items</Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction="row" justifyContent="space-between">
            <Label title="Any deviations?" subtitle={data?.anyDeviations} />
            <StatusIndicator status={Boolean(data?.anyDeviations)} />
          </Stack>
          {data?.anyDeviations === "Yes"
            ? [
                <Divider />,
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Deviation Form"
                    subtitle={
                      <a
                        href={`http://10.12.11.192:3000/deviations/ciboqa/${data?.deviationID}`}
                      >
                        {data?.deviationID}
                      </a>
                    }
                  />
                  <StatusIndicator status={Boolean(data?.anyDeviations)} />
                </Stack>,
              ]
            : undefined}
        </AccordionDetails>
      </Accordion>

      <CommentAccordion formID={id} form="roastingQuality" />
    </Box>
  );
};

export default ViewRoastingQualityControlPage;
