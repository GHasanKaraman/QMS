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
import ImageLabel from "../ImageLabel";

const LOTInspectionAccordion = ({ id, expanded, isForm, onChange, value }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const [data, setData] = useState();
  const [images, setImages] = useState([]);
  const [, setProduct] = useState();

  const loadLotInspectionPage = async () => {
    const res = await axios.post("/lotinspection/get", { id });
    if (userAuth.control(res)) {
      setData(res.data.lotInspectionForm);
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
              navigate("/lotinspection/" + data._id);
            }}
            fontWeight={600}
            fontSize={18}
          >
            LOT Inspection
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
            title="Sales Order Number"
            subtitle={
              data?.salesOrderNumber === ""
                ? "Not Given"
                : data?.salesOrderNumber
            }
          />
          <StatusIndicator status={Boolean(data?.salesOrderNumber)} />
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Label title="Item Code" subtitle={data?.itemCode1} />
          <StatusIndicator status={Boolean(data?.itemCode1)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <Label title="Lot Code" subtitle={data?.lotCode1} />
          <StatusIndicator status={Boolean(data?.lotCode1)} />
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="space-between">
          <ImageLabel
            title="Picture of Back, Single (Multipack )"
            folderIndex={images[0]?.folderIndex}
            fileName={images[0]?.fileName}
          />
          <StatusIndicator status={Boolean(images[0])} />
        </Stack>
        {data?.itemCode2 !== "" ? (
          <div>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode2} />
              <StatusIndicator status={Boolean(data?.itemCode2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode2} />
              <StatusIndicator status={Boolean(data?.lotCode2)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[1]?.folderIndex}
                fileName={images[1]?.fileName}
              />
              <StatusIndicator status={Boolean(images[1])} />
            </Stack>
          </div>
        ) : undefined}
        {data?.itemCode3 !== "" ? (
          <div>
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode3} />
              <StatusIndicator status={Boolean(data?.itemCode3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode3} />
              <StatusIndicator status={Boolean(data?.lotCode3)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[2]?.folderIndex}
                fileName={images[2]?.fileName}
              />
              <StatusIndicator status={Boolean(images[2])} />
            </Stack>
          </div>
        ) : undefined}
        {data?.itemCode4 !== "" ? (
          <div>
            {" "}
            <Stack direction="row" justifyContent="space-between">
              <Label title="Item Code" subtitle={data?.itemCode4} />
              <StatusIndicator status={Boolean(data?.itemCode4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Label title="Lot Code" subtitle={data?.lotCode4} />
              <StatusIndicator status={Boolean(data?.lotCode4)} />
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <ImageLabel
                title="Picture of Back, Single (Multipack )"
                folderIndex={images[3]?.folderIndex}
                fileName={images[3]?.fileName}
              />
              <StatusIndicator status={Boolean(images[3])} />
            </Stack>
          </div>
        ) : undefined}
        <div>
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
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default LOTInspectionAccordion;
