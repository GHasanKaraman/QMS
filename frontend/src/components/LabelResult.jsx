import { Stack, useTheme } from "@mui/material";
import { tokens } from "../theme";

import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CloseIcon from "@mui/icons-material/Close";

const LabelResult = ({ text, status }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Stack direction="row" spacing={2}>
      <div>|</div>
      <Stack direction="row" justifyContent="center" alignItems="center">
        {status ? (
          <CheckBoxIcon
            sx={{
              fill: colors.ciboInnerGreen[500],
            }}
          />
        ) : (
          <CloseIcon
            sx={{
              color: colors.yoggieRed[500],
              stroke: colors.yoggieRed[500],
              strokeWidth: "2",
            }}
          />
        )}
        <div>{text}</div>
      </Stack>

      <div>|</div>
    </Stack>
  );
};

export default LabelResult;
