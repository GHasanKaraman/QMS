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
      link: "/qualitycontrol/" + form._id,
      title: "Quality Control Inspection",
    };
  } else if (form.lotCodePouch) {
    info = {
      link: "/pgqualitycontrol/" + form._id,
      title: "P&G Quality Check",
    };
  } else if (form.garbageOrganized) {
    info = {
      link: "/mixingquality/" + form._id,
      title: "Mixing Quality Check",
    };
  } else if (form.itemCode1) {
    info = {
      link: "/lotinspection/" + form._id,
      title: "LOT Inspection",
    };
  } else if (form.ballOrCard) {
    info = {
      link: "/metaldetector/" + form._id,
      title: "Direct Observation Metal Detector",
    };
  } else if (form.isAllergenStatementCorrect) {
    info = {
      link: "/labelinspection/" + form._id,
      title: "Direct Observation Label Inspection",
    };
  } else if (form.noLoose) {
    info = {
      link: "/preoperational/" + form._id,
      title: "Pre-Operational Inspection",
    };
  } else {
    info = {
      link: "/xray/" + form._id,
      title: "Direct Observation X-Ray",
    };
  }
  return info;
};
