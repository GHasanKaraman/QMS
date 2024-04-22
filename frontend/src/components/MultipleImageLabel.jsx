import { Typography, Box, useTheme, Stack } from "@mui/material";
import { tokens } from "../theme";

const MultipleImageLabel = ({
  title1,
  folderIndex1,
  fileName1,
  title2,
  folderIndex2,
  fileName2,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box mb="10px" mt="5px">
      <Stack spacing={5} direction="row">
        <Stack spacing={1.5}>
          <Typography
            variant="h6"
            color={colors.grey[300]}
            sx={{ m: "0 0 0px 0" }}
          >
            {title1}
          </Typography>
          <a
            href={
              "http://10.12.0.56:4000/imgs/" + folderIndex1 + "/" + fileName1
            }
            target="_blank"
          >
            <img
              src={
                "http://10.12.0.56:4000/imgs/" +
                folderIndex1 +
                "/thumbnail-" +
                fileName1?.substr(0, fileName1?.lastIndexOf(".")) +
                ".jpeg"
              }
            />
          </a>
        </Stack>
        <Stack spacing={1.5}>
          <Typography
            variant="h6"
            color={colors.grey[300]}
            sx={{ m: "0 0 0px 0" }}
          >
            {title2}
          </Typography>
          <a
            href={
              "http://10.12.0.56:4000/imgs/" + folderIndex2 + "/" + fileName2
            }
            target="_blank"
          >
            <img
              src={
                "http://10.12.0.56:4000/imgs/" +
                folderIndex2 +
                "/thumbnail-" +
                fileName2?.substr(0, fileName2?.lastIndexOf(".")) +
                ".jpeg"
              }
            />
          </a>
        </Stack>
      </Stack>
    </Box>
  );
};

export default MultipleImageLabel;
