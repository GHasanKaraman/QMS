import SampleTestViewPage from "../sampleTest/SampleTestViewPage";
import { LEAK_TEST } from "./leakTestPage";

const ViewLeakTestPage = (props) => (
  <SampleTestViewPage config={LEAK_TEST} title={props.title} />
);

export default ViewLeakTestPage;
