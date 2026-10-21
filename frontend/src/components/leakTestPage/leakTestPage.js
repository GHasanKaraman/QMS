import SampleTestPage from "../sampleTest/SampleTestPage";

export const LEAK_TEST = {
  prefix: "leak",
  title: "Leak Test",
  path: "/leaktest",
  formType: "leakTest",
  responseKey: "leakTestForm",
  withDefects: true,
};

const LeakTestPage = (props) => (
  <SampleTestPage config={LEAK_TEST} title={props.title} />
);

export default LeakTestPage;
