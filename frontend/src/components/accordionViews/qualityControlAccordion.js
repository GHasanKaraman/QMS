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
  const [mixCodeLength, setMixCodeLength] = useState(1);

  const loadQualityControlPage = async () => {
    const res = await axios.post("/qualitycontrol/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.qualityControlForm);
      setImages(res.data.images);
      setMixCodeLength(res.data.qualityControlForm.mixCodeLength ?? 1);
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
            title="Created At"
            subtitle={toStringDate(data?.createdAt, {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
          />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="QC" subtitle={data?.username} />
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
        {data?.visualForeignMaterial && data?.visualForeignMaterial !== "" ? (
          <div>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Visual Foreign Material Inspection?"
                subtitle={
                  <LabelResult
                    text={data?.visualForeignMaterial}
                    status={data?.visualForeignMaterial === "Yes"}
                  />
                }
              />
              <StatusIndicator status={data?.visualForeignMaterial === "Yes"} />
            </Stack>
            <Divider />
          </div>
        ) : undefined}
        {images.slice(1, mixCodeLength + 1).map((image, index) => {
          if (index !== images.length - 1) {
            return (
              <Stack direction="row" justifyContent="space-between" key={index}>
                <ImageLabel
                  title={`Mix Code ${index + 1}`}
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
          <Label title="Finished Product Lot Code" subtitle={data?.lotCode} />
          <StatusIndicator status={Boolean(data?.lotCode)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Expiration Date" subtitle={data?.expirationDate} />
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
        {data?.vacuumWorking && data?.vacuumWorking !== "" ? (
          <Stack direction="row" justifyContent="space-between">
            <Label
              title="Vacuum system properly working?"
              subtitle={
                <LabelResult
                  text={data?.vacuumWorking}
                  status={data?.vacuumWorking !== "No"}
                />
              }
            />
            <StatusIndicator status={data?.vacuumWorking !== "No"} />
          </Stack>
        ) : undefined}
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
                    status={data?.xrayFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator status={data?.xrayFeDetected !== "No"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Non Fe 2.00 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.xrayNonFeDetected}
                    status={data?.xrayNonFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator status={data?.xrayNonFeDetected !== "No"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="SS 2.50 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.xraySsDetected}
                    status={data?.xraySsDetected !== "No"}
                  />
                }
              />
              <StatusIndicator status={data?.xraySsDetected !== "No"} />
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
                        status={data?.xrayGlassDetected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator status={data?.xrayGlassDetected !== "No"} />
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
                        status={data?.xrayCeramicDetected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayCeramicDetected !== "No"}
                  />
                </Stack>
              </div>
            ) : undefined}
            {data.xrayGlass10Detected &&
            data?.xrayGlass10Detected !== "" &&
            data?.xrayGlass10Detected !== "null" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Glass 10.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayGlass10Detected}
                        status={data?.xrayGlass10Detected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayGlass10Detected !== "No"}
                  />
                </Stack>
              </div>
            ) : undefined}
            {data.xrayCeramic10Detected &&
            data?.xrayCeramic10Detected !== "" &&
            data?.xrayCeramic10Detected !== "null" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Ceramic 10.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayCeramic10Detected}
                        status={data?.xrayCeramic10Detected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayCeramic10Detected !== "No"}
                  />
                </Stack>
              </div>
            ) : undefined}
            {data.xrayGlass7Detected && data?.xrayGlass7Detected !== "" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Glass 7.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayGlass7Detected}
                        status={data?.xrayGlass7Detected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayGlass7Detected !== "No"}
                  />
                </Stack>
              </div>
            ) : undefined}
            {data.xrayCeramic8Detected && data?.xrayCeramic8Detected !== "" ? (
              <div>
                <Divider />
                <Stack direction="row" justifyContent="space-between">
                  <Label
                    title="Ceramic 8.00 mm detected?"
                    subtitle={
                      <LabelResult
                        text={data?.xrayCeramic8Detected}
                        status={data?.xrayCeramic8Detected !== "No"}
                      />
                    }
                  />
                  <StatusIndicator
                    status={data?.xrayCeramic8Detected !== "No"}
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
                    status={data?.metalCardFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator status={data?.metalCardFeDetected !== "No"} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Non Fe 2.00 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalCardNonFeDetected}
                    status={data?.metalCardNonFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalCardNonFeDetected !== "No"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="SS 2.50 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalCardSsDetected}
                    status={data?.metalCardSsDetected !== "No"}
                  />
                }
              />
              <StatusIndicator status={data?.metalCardSsDetected !== "No"} />
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
                status={data?.metalBallSingleRequired !== "No"}
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
                    status={data?.metalBallSingleFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallSingleFeDetected !== "No"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Non Fe 4.50 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalBallSingleNonFeDetected}
                    status={data?.metalBallSingleNonFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallSingleNonFeDetected !== "No"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="SS 3.00 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalBallSingleSsDetected}
                    status={data?.metalBallSingleSsDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallSingleSsDetected !== "No"}
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
                    status={data?.metalBallMultipleFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallMultipleFeDetected !== "No"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Non Fe 4.50 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalBallMultipleNonFeDetected}
                    status={data?.metalBallMultipleNonFeDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallMultipleNonFeDetected !== "No"}
              />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="SS 3.00 mm detected?"
                subtitle={
                  <LabelResult
                    text={data?.metalBallMultipleSsDetected}
                    status={data?.metalBallMultipleSsDetected !== "No"}
                  />
                }
              />
              <StatusIndicator
                status={data?.metalBallMultipleSsDetected !== "No"}
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
            folderIndex={images[mixCodeLength + 1]?.folderIndex}
            fileName={images[mixCodeLength + 1]?.fileName}
          />
          <StatusIndicator status={Boolean(images[mixCodeLength + 1])} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Picture (Back)"
            folderIndex={images[mixCodeLength + 2]?.folderIndex}
            fileName={images[mixCodeLength + 2]?.fileName}
          />
          <StatusIndicator status={Boolean(images[mixCodeLength + 2])} />
        </Stack>{" "}
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
        {data?.treenuts && data?.treenuts.length > 0 ? (
          <div>
            <Label title="Treenuts" />

            {data?.treenuts?.split(",").map((treenut) => {
              return (
                <Chip
                  key={treenut}
                  label={treenut}
                  variant="filled"
                  color="primary"
                  style={{
                    color: colors.contrast[300],
                    fontWeight: "bold",
                    fontSize: "13px",
                    backgroundColor: colors.contrast[100],
                    borderRadius: "5px",
                    marginRight: "2px",
                  }}
                />
              );
            })}
            <Divider sx={{ pt: 1 }} />
          </div>
        ) : undefined}
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
            folderIndex={images[mixCodeLength + 3]?.folderIndex}
            fileName={images[mixCodeLength + 3]?.fileName}
          />
          <StatusIndicator status={Boolean(images[mixCodeLength + 3])} />
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
            folderIndex={images[mixCodeLength + 4]?.folderIndex}
            fileName={images[mixCodeLength + 4]?.fileName}
          />
          <StatusIndicator status={Boolean(images[mixCodeLength + 4])} />
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
        {data?.salesOrderNumber && data?.salesOrderNumber !== "" ? (
          <div>
            <Stack direction="row" justifyContent="space-between">
              <Label
                title="Sales Order Number"
                subtitle={
                  data?.salesOrderNumber === "No"
                    ? "Not Given"
                    : data?.salesOrderNumber
                }
              />
              <StatusIndicator status={Boolean(data?.salesOrderNumber)} />
            </Stack>
            <Divider />
          </div>
        ) : undefined}
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
