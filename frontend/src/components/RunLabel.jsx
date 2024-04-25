import { Divider } from "@mui/material";
import Label from "./Label";
import { toStringDate } from "../utils/helpers";

const RunLabel = ({ started, startDateTime }) => {
  const runType = started == 1 ? "Machine" : "Product";
  return started == 0 ? undefined : (
    <div>
      <Divider />
      <Label
        title="Run"
        subtitle={`${runType} Started ${toStringDate(startDateTime, {
          month: "short",
          year: "numeric",
          day: "numeric",
          hour: "numeric",
          minute: "numeric",
        })}`}
      />
    </div>
  );
};

export default RunLabel;
