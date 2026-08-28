import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import {
  extractInformations,
  getTimeRange,
  toStringDate,
} from "../../utils/helpers";

import whiteLogo from "../../images/whitelogo.png";
import moment from "moment-timezone";
import RunSummaryAccordions from "../RunSummaryAccordions";
import { forwardRef, useState } from "react";

const SummaryPDF = forwardRef((props, ref) => {
  const [forms, _f] = useState(props.forms);
  const [product, _p] = useState(props.product);
  const [description, _d] = useState(props.description);
  const [station, _s] = useState(props.station);
  const [type, _t] = useState(props.type);
  const [timeRange, _tr] = useState(getTimeRange(props.forms));
  return (
    <Box
      ref={ref}
      m="0 20px"
      p={2}
      sx={{ background: "#fff" }}
      style={{ display: "none" }}
      data-print="true"
    >
      <Stack sx={{ backgroundColor: "#585f6f", p: 1, color: "#fff" }}>
        <Stack
          direction="row"
          width="100%"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h3" fontWeight={600}>
            Quality Run Summary
          </Typography>
          <img alt="whiteLogo" src={whiteLogo} width={150} />
        </Stack>
        <Typography mt={1}>
          {product +
            " • " +
            description[product] +
            " • " +
            toStringDate(moment(), {
              month: "short",
              year: "numeric",
              day: "numeric",
              hour: "numeric",
              minute: "numeric",
            })}
        </Typography>
      </Stack>
      <TableContainer sx={{ mt: 3 }} component={Paper}>
        <Table
          sx={{
            "& .MuiTableCell-head": {
              backgroundColor: "#f3f4f8",
              p: 1,
              fontWeight: 600,
            },
          }}
        >
          <TableRow>
            <TableCell variant="head">Product</TableCell>
            <TableCell>{description[product]}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">SKU</TableCell>
            <TableCell>{product}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">Site</TableCell>
            <TableCell>Cibo Vita - NJ</TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">Station</TableCell>
            <TableCell>{station + " " + type}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell variant="head">Start Date</TableCell>
            <TableCell>
              {toStringDate(timeRange?.start, {
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell variant="head">End Date</TableCell>
            <TableCell>
              {toStringDate(timeRange?.end, {
                month: "short",
                year: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              })}
            </TableCell>
          </TableRow>
        </Table>
      </TableContainer>

      <Typography pt={2} variant="h3" fontWeight={500}>
        Accumullated Results
      </Typography>
      <TableContainer sx={{ mt: 3 }} component={Paper}>
        <Table
          sx={{
            "& .MuiTableCell-head": {
              background: "#f3f4f8",
              p: 1,
              fontWeight: 600,
            },
          }}
        >
          <TableHead>
            <TableRow>
              <TableCell width="40%">Quality Check</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Pass</TableCell>
              <TableCell>Warn</TableCell>
              <TableCell>Fail</TableCell>
              <TableCell>Cancel</TableCell>
              <TableCell>Miss</TableCell>
              <TableCell>Void</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.from(
              new Set(forms.map((form) => extractInformations(form).title)),
            ).map((title) => {
              return (
                <TableRow
                  key={title}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                >
                  <TableCell component="th" scope="row">
                    {title}
                  </TableCell>
                  <TableCell>
                    {
                      forms.filter(
                        (form) => extractInformations(form).title === title,
                      ).length
                    }
                  </TableCell>
                  <TableCell>
                    {
                      forms.filter(
                        (form) =>
                          extractInformations(form).title === title &&
                          form.status === "passed",
                      ).length
                    }
                  </TableCell>
                  <TableCell />
                  <TableCell>
                    {forms.filter(
                      (form) =>
                        extractInformations(form).title === title &&
                        form.status === "failed",
                    ).length || undefined}
                  </TableCell>
                  <TableCell />
                  <TableCell />
                  <TableCell />
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography pt={3} variant="h3" fontWeight={500}>
        Sign Off History
      </Typography>
      <Stack
        spacing={0.8}
        p={1}
        mt={2}
        sx={{ border: "0.5px solid rgba(224,224,224,1)" }}
      >
        {forms.reduce((prev, curr) => {
          return prev + curr.signoffs.length;
        }, 0) !== 0
          ? Array.from(
              new Set(
                forms.flatMap((form) =>
                  form.signoffs.map(
                    (item) =>
                      toStringDate(item.createdAt, {
                        month: "short",
                        year: "numeric",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                      }) +
                      " • Production Sign Off by " +
                      item.signedOff,
                  ),
                ),
              ),
            ).map((a, i) => (
              <Typography key={i} fontWeight={500} fontSize={14}>
                {a}
              </Typography>
            ))
          : "No Sign Off Record Found"}
      </Stack>

      <Typography pt={3} variant="h3" fontWeight={500}>
        Results
      </Typography>

      <RunSummaryAccordions
        expand={true}
        showExpand={false}
        forms={forms}
        isForm={false}
      />
    </Box>
  );
});

export default SummaryPDF;
