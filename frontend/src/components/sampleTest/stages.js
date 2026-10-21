// Tests sampled at the beginning, middle and end of a run (leak, nitrogen)

export const STAGES = ["Beginning", "Middle", "End"];

// The first stage whose left sample has not been recorded yet,
// or undefined when every stage is filled (or there is no form).
export const getNextStage = (form, prefix) =>
  form ? STAGES.find((stage) => !form[prefix + "Left" + stage]) : undefined;

// Who recorded a stage and when
export const getStageLog = (form, stage) =>
  form?.stageLog?.find((log) => log.stage === stage);

export const statusLabel = (status) =>
  status === "passed"
    ? "Passed"
    : status === "inProgress"
      ? "In Progress"
      : "Failed";

const sideFields = (form, prefix, stage) =>
  form?.hasRightSide === "No"
    ? [prefix + "Left" + stage]
    : [prefix + "Left" + stage, prefix + "Right" + stage];

// The first stage with a failed sample, or undefined
export const getFailedStage = (form, prefix) =>
  STAGES.find((stage) =>
    sideFields(form, prefix, stage).some((field) => form?.[field] === "Fail"),
  );

// What a retest of a failed form starts with: the stages before the failed
// one are carried over, the failed stage and the ones after it are empty.
export const getRetestBase = (form, prefix) => {
  const failedIndex = STAGES.indexOf(getFailedStage(form, prefix));
  const base = { ...form, attempt: (form.attempt || 1) + 1 };
  STAGES.slice(failedIndex).forEach((stage) => {
    sideFields(form, prefix, stage).forEach((field) => {
      base[field] = "";
    });
  });
  base.stageLog = (form.stageLog || [])
    .filter((log) => STAGES.indexOf(log.stage) < failedIndex)
    .map((log) => ({ ...log, carriedFrom: form._id }));
  return base;
};

export const getLogTime = (log) => log?.recordedAt || log?.createdAt;
