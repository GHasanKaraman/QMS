import { useState } from "react";
import { extractInformations } from "../utils/helpers";
import LabelInspectionAccordion from "./accordionViews/labelInspectionAccordion";
import LOTInspectionAccordion from "./accordionViews/lotInspectionAccordion";
import MetalDetectorAccordion from "./accordionViews/metalDetectorAccordion";
import MixingQualityAccordion from "./accordionViews/mixingQualityAccordion";
import PGQualityControlAccordion from "./accordionViews/pgQualityControlAccordion";
import QualityControlAccordion from "./accordionViews/qualityControlAccordion";
import XRAYInspectionAccordion from "./accordionViews/xRayInspectionAccordion";

const RunSummaryAccordions = ({ forms, expanded, style, isForm, onChange }) => {
  const [values, setValues] = useState({});

  function handleChange(id, value) {
    let temp = { ...values };
    temp[id] = value;
    setValues(temp);
    onChange(temp);
  }

  return (
    <div style={style}>
      {forms.map((form) => {
        const { type } = extractInformations(form);
        switch (type) {
          case "pgqualitycontrol":
            return (
              <PGQualityControlAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          case "qualitycontrol":
            return (
              <QualityControlAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          case "labelinspection":
            return (
              <LabelInspectionAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          case "lotinspection":
            return (
              <LOTInspectionAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          case "mixingquality":
            return (
              <MixingQualityAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );

          case "xray":
            return (
              <XRAYInspectionAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          case "metaldetector":
            return (
              <MetalDetectorAccordion
                isForm={isForm}
                onChange={handleChange}
                key={form._id}
                id={form._id}
                expanded={expanded}
              />
            );
          default:
            return undefined;
        }
      })}
    </div>
  );
};

export default RunSummaryAccordions;
