import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import { extractInformations } from "../utils/helpers";
import { Accordion, AccordionSummary } from "./Accordion";
import LabelInspectionAccordion from "./accordionViews/labelInspectionAccordion";
import LOTInspectionAccordion from "./accordionViews/lotInspectionAccordion";
import MetalDetectorAccordion from "./accordionViews/metalDetectorAccordion";
import MixingQualityAccordion from "./accordionViews/mixingQualityAccordion";
import PGQualityControlAccordion from "./accordionViews/pgQualityControlAccordion";
import QualityControlAccordion from "./accordionViews/qualityControlAccordion";
import XRAYInspectionAccordion from "./accordionViews/xRayInspectionAccordion";
import RoastingQualityAccordion from "./accordionViews/roastingQualityAccordion";

const RunSummaryAccordions = ({
  forms,
  style,
  isForm,
  onChange,
  values = {},
  expand = false,
  showExpand = true,
}) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setExpanded(expand);
  }, []);

  return (
    <div style={style}>
      <Accordion
        sx={{ display: showExpand ? "block" : "none" }}
        onChange={(_, isExpanded) => {
          setExpanded(isExpanded);
        }}
      >
        <AccordionSummary sx={{ fontWeight: 600 }}>
          <Stack direction="row" width="100%" justifyContent="space-between">
            <div>All Results</div>
            {isForm ? (
              <div>
                {Object.values(values).filter((value) => value === true)
                  .length +
                  " of " +
                  Object.values(values).length +
                  " Selected"}
              </div>
            ) : (
              forms.length + " Results"
            )}
          </Stack>
        </AccordionSummary>
      </Accordion>

      <div style={{ display: expanded ? "block" : "none" }}>
        {forms.map((form) => {
          const { type } = extractInformations(form);
          switch (type) {
            case "pgqualitycontrol":
              return (
                <PGQualityControlAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "qualitycontrol":
              return (
                <QualityControlAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "labelinspection":
              return (
                <LabelInspectionAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "lotinspection":
              return (
                <LOTInspectionAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "mixingquality":
              return (
                <MixingQualityAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "roastingquality":
              return (
                <RoastingQualityAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "xray":
              return (
                <XRAYInspectionAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            case "metaldetector":
              return (
                <MetalDetectorAccordion
                  isForm={isForm}
                  onChange={onChange}
                  key={form._id}
                  id={form._id}
                  expanded={expanded}
                  value={values[form._id]}
                />
              );
            default:
              return undefined;
          }
        })}
      </div>
    </div>
  );
};

export default RunSummaryAccordions;
