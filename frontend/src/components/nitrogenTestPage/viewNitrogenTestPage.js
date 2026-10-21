import SampleTestViewPage from "../sampleTest/SampleTestViewPage";
import { NITROGEN_TEST } from "./nitrogenTestPage";

const ViewNitrogenTestPage = (props) => (
  <SampleTestViewPage config={NITROGEN_TEST} title={props.title} />
);

export default ViewNitrogenTestPage;
