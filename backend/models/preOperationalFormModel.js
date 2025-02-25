const mongoose = require("mongoose");

const preOperationalFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    dumper: { type: String, required: true },
    elevator: { type: String, required: true },
    metalDetector: { type: String, required: true },
    conveyor: { type: String, required: true },
    sealer: { type: String, required: true },
    turntable: { type: String, required: true },
    platform: { type: String, required: true },
    floor: { type: String, required: true },
    drum: { type: String, required: true },
    belts: { type: String, required: true },
    goodCondition: { type: String, required: true },
    noLoose: { type: String, required: true },
    noChemicals: { type: String, required: true },
    noGlass: { type: String, required: true },
    garbageRemoved: { type: String, required: true },
    wearingCoat: { type: String, required: true },
    complyingGMP: { type: String, required: true },
    noSick: { type: String, required: true },
    okStart: { type: String, required: true },
    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const preoperationalFormModel = mongoose.model(
  "preOperationalForms",
  preOperationalFormSchema,
);

module.exports = preoperationalFormModel;
