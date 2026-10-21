import SampleTestPage from "../sampleTest/SampleTestPage";

export const NITROGEN_TEST = {
  prefix: "nitrogen",
  title: "Nitrogen Test",
  path: "/nitrogentest",
  formType: "nitrogenTest",
  responseKey: "nitrogenTestForm",
  question: "Is the oxygen reading less than 5%?",
  withPhotos: true,
};

const NitrogenTestPage = (props) => (
  <SampleTestPage config={NITROGEN_TEST} title={props.title} />
);

export default NitrogenTestPage;
