import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Checkbox, Divider, Stack, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { useTheme } from "@emotion/react";

import { toStringDate } from "../../utils/helpers";
import { tokens } from "../../theme";
import axios from "../../api/axios";
import userAuth from "../../utils/userAuth";
import { Accordion, AccordionDetails, AccordionSummary } from "../Accordion";
import Label from "../Label";
import LabelResult from "../LabelResult";
import StatusIndicator from "../StatusIndicator";
import ImageLabel from "../ImageLabel";
import MultipleImageLabel from "../MultipleImageLabel";

const PGQualityControlAccordion = ({
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

  const loadPGQualityControlPage = async () => {
    const res = await axios.post("/pgqualitycontrol/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.qualityControlForm);
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
    loadPGQualityControlPage();
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
          alignItems="center"
          direction="row"
          justifyContent="space-between"
          width="100%"
        >
          <Typography
            component="a"
            onClick={() => {
              navigate("/pgqualitycontrol/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            P&G Quality Control Inspection
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
          <Label
            title="Metal Detector Required?"
            subtitle={
              <LabelResult
                text={data?.metalDetector}
                status={data?.metalDetector !== "No"}
              />
            }
          />
          <StatusIndicator status={Boolean(data?.metalDetector)} />
        </Stack>
        {data?.metalDetector === "Yes" ? (
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
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Raw Product"
            folderIndex={images[0]?.folderIndex}
            fileName={images[0]?.fileName}
          />
          <StatusIndicator status={Boolean(images[0])} />
        </Stack>
        <Divider />
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
          <MultipleImageLabel
            title1="Label Inspection"
            folderIndex1={images[1]?.folderIndex}
            fileName1={images[1]?.fileName}
            title2="Picture of Expiration Date"
            folderIndex2={images[2]?.folderIndex}
            fileName2={images[2]?.fileName}
          />
          <StatusIndicator status={Boolean(images[1]) && Boolean(images[2])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Expiration Date"
            subtitle={toStringDate(data?.expirationDatePouch, {
              month: "numeric",
              year: "numeric",
            })}
          />
          <StatusIndicator status={Boolean(data?.expirationDatePouch)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Pouch Lot Code" subtitle={data?.lotCodePouch} />
          <StatusIndicator status={Boolean(data?.lotCodePouch)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Current Weight" subtitle={data?.currentWeightPouch} />
          <StatusIndicator status={Boolean(data?.currentWeightPouch)} />
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
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Is the seal correct?"
            subtitle={
              <LabelResult
                text={data?.isSealCorrectPouch}
                status={data?.isSealCorrectPouch === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.isSealCorrectPouch === "Yes"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Metal Detector?"
            subtitle={
              <LabelResult
                text={data?.metalDetector}
                status={data?.metalDetector !== "No"}
              />
            }
          />
          <StatusIndicator status={data?.metalDetector !== "No"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Allergen Statement"
            folderIndex={images[3]?.folderIndex}
            fileName={images[3]?.fileName}
          />
          <StatusIndicator status={Boolean(images[3])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Panning Batch"
            folderIndex={images[4]?.folderIndex}
            fileName={images[4]?.fileName}
          />
          <StatusIndicator status={Boolean(images[4])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Sugar Shelled Batch"
            folderIndex={images[5]?.folderIndex}
            fileName={images[5]?.fileName}
          />
          <StatusIndicator status={Boolean(images[5])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <MultipleImageLabel
            title1="Label Inspection"
            folderIndex1={images[6]?.folderIndex}
            fileName1={images[6]?.fileName}
            title2="Label Inspection"
            folderIndex2={images[7]?.folderIndex}
            fileName2={images[7]?.fileName}
          />
          <StatusIndicator status={Boolean(images[6]) && Boolean(images[7])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Current Weight" subtitle={data?.currentWeightBox} />
          <StatusIndicator status={Boolean(data?.currentWeightBox)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Is the seal correct?"
            subtitle={
              <LabelResult
                text={data?.isSealCorrectBox}
                status={data?.isSealCorrectBox === "Yes"}
              />
            }
          />
          <StatusIndicator status={data?.isSealCorrectBox === "Yes"} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Allergen Statement"
            folderIndex={images[8]?.folderIndex}
            fileName={images[8]?.fileName}
          />
          <StatusIndicator status={Boolean(images[8])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Label Inspection"
            folderIndex={images[9]?.folderIndex}
            fileName={images[9]?.fileName}
          />
          <StatusIndicator status={Boolean(images[9])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="Expiration Date"
            subtitle={toStringDate(data?.expirationDateCase, {
              month: "numeric",
              year: "numeric",
            })}
          />
          <StatusIndicator status={Boolean(data?.expirationDateCase)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Case Lot Code" subtitle={data?.lotCodeCase} />
          <StatusIndicator status={Boolean(data?.lotCodeCase)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Pattern"
            folderIndex={images[10]?.folderIndex}
            fileName={images[10]?.fileName}
          />
          <StatusIndicator status={Boolean(images[10])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Pattern"
            folderIndex={images[11]?.folderIndex}
            fileName={images[11]?.fileName}
          />
          <StatusIndicator status={Boolean(images[11])} />
        </Stack>
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
                      href={`http://10.12.11.192:3000/deviation/${data?.deviationID}`}
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

export default PGQualityControlAccordion;
