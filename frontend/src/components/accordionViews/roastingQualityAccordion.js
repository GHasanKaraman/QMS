import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Checkbox, Divider, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import StatusIndicator from "../StatusIndicator";
import LabelResult from "../LabelResult";
import ImageLabel from "../ImageLabel";

const RoastingQualityAccordion = ({
  id,
  expanded,
  isForm,
  onChange,
  value,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();

  const loadLotInspectionPage = async () => {
    const res = await axios.post("/roastingquality/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.roastingQualityForm);
      setImages(res.data.images);
      setProduct(res.data.product);
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
    loadLotInspectionPage();
  }, []);

  return (
    <Accordion expanded={expanded}>
      <AccordionSummary
        disableIcon
        sx={{
          "& .MuiAccordionSummary-content": {
            margin: "0px !important",
          },
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          width="100%"
        >
          <Typography
            component="a"
            onClick={() => {
              navigate("/mixingquality/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Roasting Quality Control Inspection
          </Typography>
          <Stack direction="row" spacing={2}>
            <Typography
              fontWeight={600}
              fontSize={16}
              sx={{
                color: colors.contrast[300],
                background:
                  data?.status === "passed"
                    ? colors.ciboInnerGreen[500]
                    : colors.yoggieRed[500],
                p: 2,
              }}
            >
              {data?.status === "passed" ? "Pass" : "Failed"}
            </Typography>

            {isForm === true ? (
              <Checkbox
                size="large"
                color="secondary"
                checked={Boolean(value)}
                onChange={(_, checked) => {
                  onChange(data._id, checked);
                }}
              />
            ) : undefined}
          </Stack>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <div
          key="R1_View"
          style={{ display: data?.station === "ROAST-1" ? "block" : "none" }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
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
            <StatusIndicator status={data?.colorOfFinishedProduct === "Yes"} />
          </Stack>
          <Divider />
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
        </div>
        <div
          key="R5_View"
          style={{ display: data?.station === "ROAST-M5" ? "block" : "none" }}
        >
          <Stack direction="row" justifyContent="space-between">
            <Label title="Receiving Code" subtitle={data?.receivingCode} />
            <StatusIndicator status={Boolean(data?.receivingCode)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
            <StatusIndicator status={Boolean(data?.lotCode)} />
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
              title="Raw Product Temperature (Max 65° F or higher)"
              subtitle={data?.rawProductTemperature}
            />
            <StatusIndicator status={Boolean(data?.rawProductTemperature)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Oil Parameter" subtitle={data?.oilParameter} />
            <StatusIndicator status={Boolean(data?.oilParameter)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Salt Parameter" subtitle={data?.saltParameter} />
            <StatusIndicator status={Boolean(data?.saltParameter)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Drum Speed" subtitle={data?.drumSpeed} />
            <StatusIndicator status={Boolean(data?.drumSpeed)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Salt Spiral Speed" subtitle={data?.saltSpiralSpeed} />
            <StatusIndicator status={Boolean(data?.saltSpiralSpeed)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Salinity of water (tank) %"
              subtitle={data?.salinityOfWater}
            />
            <StatusIndicator status={Boolean(data?.salinityOfWater)} />
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
            <StatusIndicator status={data?.colorOfFinishedProduct === "Yes"} />
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

          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Moisture % of Raw (4.5 - 6.5%)"
              subtitle={data?.moistureOfRaw}
            />
            <StatusIndicator status={Boolean(data?.moistureOfRaw)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Moisture % of Roasted(0.4 - 1.7%)"
              subtitle={data?.moistureOfRoasted}
            />
            <StatusIndicator status={Boolean(data?.moistureOfRoasted)} />
          </Stack>
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
          <Stack direction="row" justifyContent="space-between">
            <Label title="Receiving Code" subtitle={data?.receivingCode} />
            <StatusIndicator status={Boolean(data?.receivingCode)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
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
            <Label title="Salt Spiral Speed" subtitle={data?.saltSpiralSpeed} />
            <StatusIndicator status={Boolean(data?.saltSpiralSpeed)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Salt Parameter" subtitle={data?.saltParameter} />
            <StatusIndicator status={Boolean(data?.saltParameter)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label title="Oil Parameter" subtitle={data?.oilParameter} />
            <StatusIndicator status={Boolean(data?.oilParameter)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Salinity of water (tank) %"
              subtitle={data?.salinityOfWater}
            />
            <StatusIndicator status={Boolean(data?.salinityOfWater)} />
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
            <StatusIndicator status={data?.colorOfFinishedProduct === "Yes"} />
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
              title="Moisture % of Raw (4.5 - 6.5%)"
              subtitle={data?.moistureOfRaw}
            />
            <StatusIndicator status={Boolean(data?.moistureOfRaw)} />
          </Stack>
          <Divider />
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Moisture % of Roasted(0.4 - 1.7%)"
              subtitle={data?.moistureOfRoasted}
            />
            <StatusIndicator status={Boolean(data?.moistureOfRoasted)} />
          </Stack>
          <Divider />
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
          <Divider />
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
        </div>
        <Divider />
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
        <Divider />
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
  );
};

export default RoastingQualityAccordion;
