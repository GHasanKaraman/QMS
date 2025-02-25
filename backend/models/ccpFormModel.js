const mongoose = require("mongoose");

const ccpFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    shift: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },

    rawTemperature: { type: Number, required: true },
    moistureContent: { type: Number, required: true },
    rawTemperature: { type: Number, required: true },
    moistureContent: { type: Number, required: true },
    chamberSet1: { type: Number, required: true },
    chamberActual1: { type: Number, required: true },
    chamberSet2: { type: Number, required: true },
    chamberActual2: { type: Number, required: true },
    chamberSet3: { type: Number, required: true },
    chamberActual3: { type: Number, required: true },
    chamberSet4: { type: Number, required: true },
    chamberActual4: { type: Number, required: true },
    chamberSet5: { type: Number, required: true },
    chamberActual5: { type: Number, required: true },
    chamberSet6: { type: Number, required: true },
    chamberActual6: { type: Number, required: true },
    chamberSet7: { type: Number, required: true },
    chamberActual7: { type: Number, required: true },
    chamberSet8: { type: Number, required: true },
    chamberActual8: { type: Number, required: true },
    fan1: { type: Number, required: true },
    fan2: { type: Number, required: true },
    fan3: { type: Number, required: true },
    fan4: { type: Number, required: true },
    fan5: { type: Number, required: true },
    fan6: { type: Number, required: true },
    fan7: { type: Number, required: true },
    fan8: { type: Number, required: true },
    zoneCooling: { type: Number, required: true },
    bedDepth: { type: Number, required: true },
    beltSpeed: { type: Number, required: true },

    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const ccpFormModel = mongoose.model("ccpForms", ccpFormSchema);

module.exports = ccpFormModel;
