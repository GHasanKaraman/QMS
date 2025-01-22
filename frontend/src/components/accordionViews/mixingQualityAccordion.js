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

const MixingQualityAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();

  const loadLotInspectionPage = async () => {
    const res = await axios.post("/mixingquality/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.mixingQualityForm);
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
            Mixing Quality Control Inspection
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
        <Stack direction="row" justifyContent="space-between">
          <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
          <StatusIndicator status={true} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Probiotic jars correctly labelled?"
            subtitle={
              <LabelResult
                text={data?.correctLabel}
                status={data?.correctLabel !== "No"}
              />
            }
          />
          <StatusIndicator status={data?.correctLabel !== "No"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Probiotic Mix Lot Code?"
            subtitle={
              <LabelResult
                text={data?.probioticMixLot}
                status={data?.probioticMixLot !== "No"}
              />
            }
          />
          <StatusIndicator status={data?.probioticMixLot !== "No"} />
        </Stack>
        {data?.probioticMixLot === "Yes" ? (
          <div>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Probiotic Mix Lot Code"
                subtitle={
                  <LabelResult
                    text={data?.probioticMixLotCode}
                    status={Boolean(data?.probioticMixLotCode)}
                  />
                }
              />
              <StatusIndicator status={data?.xrayFeDetected === "Yes"} />
            </Stack>
          </div>
        ) : undefined}

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
            title="Allergens kept separate?"
            subtitle={
              <LabelResult
                text={data?.allergensSeparate}
                status={data?.allergensSeparate === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.allergensSeparate === "Yes"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Sensory evaluation?"
            subtitle={
              <LabelResult
                text={data?.sensory}
                status={data?.sensory === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.sensory === "Yes"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Floor is clean?"
            subtitle={
              <LabelResult
                text={data?.cleanFloor}
                status={data?.cleanFloor === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.cleanFloor === "Yes"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Garbage Organized?"
            subtitle={
              <LabelResult
                text={data?.garbageOrganized}
                status={data?.garbageOrganized === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.garbageOrganized === "Yes"} />
        </Stack>
        {images.map((image, index) => {
          if (index !== images.length - 1) {
            return (
              <Stack direction="row" justifyContent="space-between" key={index}>
                <ImageLabel
                  title={`Ingredient ${index + 1}`}
                  folderIndex={image?.folderIndex}
                  fileName={image?.fileName}
                />
                <StatusIndicator status={Boolean(image)} />
              </Stack>
            );
          }
        })}
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Picture of Finished Product"
            folderIndex={images[images.length - 1]?.folderIndex}
            fileName={images[images.length - 1]?.fileName}
          />
          <StatusIndicator status={Boolean(images[images.length - 1])} />
        </Stack>
        <Stack direction="row" justifyContent="space-between">
          <Label title="Any deviations?" subtitle={data?.anyDeviations} />
          <StatusIndicator status={Boolean(data?.anyDeviations)} />
        </Stack>
        {data?.anyDeviations === "Yes"
          ? [
              <Divider key="first" />,
              <Stack
                direction="row"
                key="second"
                justifyContent="space-between"
              >
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

export default MixingQualityAccordion;
