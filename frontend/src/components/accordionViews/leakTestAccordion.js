import SampleTestAccordion from "../sampleTest/SampleTestAccordion";
import { LEAK_TEST } from "../leakTestPage/leakTestPage";

const LeakTestAccordion = (props) => (
  <SampleTestAccordion config={LEAK_TEST} {...props} />
);

export default LeakTestAccordion;
