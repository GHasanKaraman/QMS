const mongoose = require("mongoose");

const roastingQualityFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },
    imageIDs: [{ type: mongoose.Types.ObjectId }],

    preLotCodeMixing: { type: String, required: false },
    preLotCodeLiquid: { type: String, required: false },
    preLotCodePowder: { type: String, required: false },

    areAllergensCorrect: { type: String, required: true },
    sensoryEvaluation: { type: String, required: true },

    beltSpeed: { type: Number, required: false },
    temperature1: { type: Number, required: false },
    temperature2: { type: Number, required: false },
    temperature3: { type: Number, required: false },
    temperature4: { type: Number, required: false },
    temperature5: { type: Number, required: false },
    temperature6: { type: Number, required: false },
    finishedProductTemperature: { type: Number, required: true },
    productThickness: { type: String, required: true },
    colorOfFinishedProduct: { type: String, required: true },

    //R5
    receivingCode: { type: String, required: false },
    cleaning: { type: String, required: false },
    rawProductTemperature: { type: Number, required: false },
    oilParameter: { type: Number, required: false, default: "" },
    saltParameter: { type: Number, required: false, default: "" },
    drumSpeed: { type: Number, required: false },
    saltSpiralSpeed: { type: Number, required: false, default: "" },
    salinityOfWater: { type: Number, required: false },
    salinityOfProduct: { type: Number, required: false },

    //R2-3-4
    heatingFan1: { type: Number, required: false },
    heatingFan2: { type: Number, required: false },
    heatingFan3: { type: Number, required: false },
    heatingFan4: { type: Number, required: false },
    heatingFan5: { type: Number, required: false },
    heatingFan6: { type: Number, required: false },
    coolingFan1: { type: Number, required: false },
    coolingFan2: { type: Number, required: false },
    coolingFan3: { type: Number, required: false },
    coolingFan4: { type: Number, required: false },
    coolingFan5: { type: Number, required: false },
    coolingFan6: { type: Number, required: false },

    anyDeviations: { type: String, required: true },
    deviationID: { type: String, default: "" },

    status: { type: String, default: "failed" },
    started: { type: Number, default: 0 },
    startDateTime: { type: Date },
  },
  { timestamps: true },
);

const roastingQualityFormModel = mongoose.model(
  "roastingQualityForms",
  roastingQualityFormSchema,
);

module.exports = roastingQualityFormModel;
