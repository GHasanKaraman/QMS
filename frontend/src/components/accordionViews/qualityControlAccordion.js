import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Checkbox, Chip, Divider, Stack, Typography } from "@mui/material";
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

const QualityControlAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [product, setProduct] = useState();

  const loadQualityControlPage = async () => {
    const res = await axios.post("/qualitycontrol/get", { id });
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
    loadQualityControlPage();
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
          justifyContent="space-between"
          width="100%"
          alignItems="center"
        >
          <Typography
            component="a"
            onClick={() => {
              navigate("/qualitycontrol/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            Quality Control Inspection
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
            })}
          />
          <StatusIndicator status={Boolean(data?.expirationDate)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label
            title="What is the unit of measure?"
            subtitle={
              <LabelResult
                text={data?.unitOfMeasure}
                status={Boolean(data?.unitOfMeasure)}
              />
            }
          />
          <StatusIndicator status={Boolean(data?.unitOfMeasure)} />
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
            {data?.xrayGlassDetected !== "" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Glass 8.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayGlassDetected}
                        status={data?.xrayGlassDetected === "Yes"}
                      />
                    }
                  />
                  <StatusIndicator status={data?.xrayGlassDetected === "Yes"} />
                </Stack>
              </div>
            ) : undefined}
            {data?.xrayCeramicDetected !== "" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Ceramic 6.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayCeramicDetected}
                        status={data?.xrayCeramicDetected === "Yes"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayCeramicDetected === "Yes"}
                  />
                </Stack>
              </div>
            ) : undefined}
          </div>
        ) : undefined}
        <Divider />
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
          <StatusIndicator status={Boolean(data?.metalBallMultipleRequired)} />
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
        <Stack direction="row" justifyContent="space-between">
          <Label title="Correct Packaging?" subtitle={data?.correctPackaging} />
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

export default QualityControlAccordion;
