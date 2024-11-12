import {
  Card,
  CardActionArea,
  CardContent,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

import { extractInformations, toStringDate } from "../utils/helpers";
import { tokens } from "../theme";

import { ReactComponent as Signature } from "../images/signature.svg";
import { ModeCommentOutlined } from "@mui/icons-material";

const FormCard = ({ form, date = false }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  const getStatusColor = (form) => {
    if (form.status === "passed") {
      return colors.ciboInnerGreen[300];
    }
    return colors.yoggieRed[300];
  };

  const info = extractInformations(form);
  if (info) {
    return (
      <Card
        key={form._id}
        sx={{
          background: getStatusColor(form),
          width: 200,
          height: date ? 100 : 75,
        }}
      >
        <CardActionArea
          sx={{ height: "100%" }}
          onClick={() => {
            navigate(info.link);
          }}
        >
          <CardContent sx={{ paddingTop: 1 }}>
            <Stack spacing={0}>
              <Typography
                variant="h6"
                fontWeight="bold"
                color={colors.primary[400]}
                sx={{ textAlign: "center" }}
              >
                {info.title}
              </Typography>
              <Stack
                direction="row"
                width="100%"
                alignItems="center"
                justifyContent="center"
                spacing={4}
                px={2}
              >
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color={colors.primary[400]}
                  sx={{ textAlign: "center" }}
                >
                  {date
                    ? toStringDate(form.createdAt, {
                        month: "short",
                        year: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      })
                    : toStringDate(form.createdAt, {
                        hour: "numeric",
                        minute: "numeric",
                      })}
                </Typography>
                {form?.comments?.length + form?.signoffs?.length ===
                0 ? undefined : (
                  <Stack direction="row" spacing={1}>
                    {form?.comments?.length > 0 ? (
                      <ModeCommentOutlined
                        fontSize="small"
                        sx={{ color: colors.primary[400] }}
                      />
                    ) : undefined}
                    {form?.signoffs?.length > 0 ? (
                      <Signature width={17} fill={colors.primary[400]} />
                    ) : undefined}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }
  return undefined;
};

export default FormCard;
