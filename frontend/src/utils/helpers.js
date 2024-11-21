export const toStringDate = (date, format) => {
  return new Date(date).toLocaleString("en-us", format);
};

export const extractUniqueProducts = (...forms) => {
  return Array.from(
    new Set(forms.flatMap((item) => item.map((form) => form.product))),
  );
};

export const extractInformations = (form) => {
  let info = undefined;
  if (form.isTasteAcceptable) {
    info = {
      type: "qualitycontrol",
      link: "/qualitycontrol/" + form._id,
      title: "Quality Control Inspection",
    };
  } else if (form.lotCodePouch) {
    info = {
      type: "pgqualitycontrol",
      link: "/pgqualitycontrol/" + form._id,
      title: "P&G Quality Check",
    };
  } else if (form.garbageOrganized) {
    info = {
      type: "mixingquality",
      link: "/mixingquality/" + form._id,
      title: "Mixing Quality Check",
    };
  } else if (form.colorOfFinishedProduct) {
    info = {
      type: "roastingquality",
      link: "/roastingquality/" + form._id,
      title: "Roasting Quality Check",
    };
  } else if (form.itemCode1) {
    info = {
      type: "lotinspection",
      link: "/lotinspection/" + form._id,
      title: "LOT Inspection",
    };
  } else if (form.ballOrCard) {
    info = {
      type: "metaldetector",
      link: "/metaldetector/" + form._id,
      title: "Direct Observation Metal Detector",
    };
  } else if (form.isAllergenStatementCorrect) {
    info = {
      type: "labelinspection",
      link: "/labelinspection/" + form._id,
      title: "Direct Observation Label Inspection",
    };
  } else if (form.noLoose) {
    info = {
      type: "preoperational",
      link: "/preoperational/" + form._id,
      title: "Pre-Operational Inspection",
    };
  } else {
    info = {
      type: "xray",
      link: "/xray/" + form._id,
      title: "Direct Observation X-Ray",
    };
  }
  return info;
};
