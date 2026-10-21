import SampleTestAccordion from "../sampleTest/SampleTestAccordion";
import { NITROGEN_TEST } from "../nitrogenTestPage/nitrogenTestPage";

const NitrogenTestAccordion = (props) => (
  <SampleTestAccordion config={NITROGEN_TEST} {...props} />
);

export default NitrogenTestAccordion;
