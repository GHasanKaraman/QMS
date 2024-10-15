const mongoose = require("mongoose");

const roastingQualityFormSchema = new mongoose.Schema(
  {
    station: { type: String, required: true },
    product: { type: String, required: true },
    username: { type: String, required: true },
    lotCode: { type: String, required: true },

    preLotCodeMixing: { type: String, required: true },
    preLotCodeLiquid: { type: String, required: true },
    preLotCodePowder: { type: String, required: true },

    areAllergensCorrect: { type: String, required: true },
    sensoryEvaluation: { type: String, required: true },

    beltSpeed: { type: Number, required: true },
    temperature1: { type: Number, required: true },
    temperature2: { type: Number, required: true },
    temperature3: { type: Number, required: true },
    temperature4: { type: Number, required: true },
    temperature5: { type: Number, required: true },
    temperature6: { type: Number, required: true },
    finishedProductTemperature: { type: Number, required: true },
    productThickness: { type: String, required: true },
    colorOfFinishedProduct: { type: String, required: true },

    //R5
    receivingCode: { type: String, required: true },
    cleaning: { type: String, required: true },
    rawProductTemperature: { type: Number, required: true },
    oilParameter: { type: Number, required: true },
    saltParameter: { type: Number, required: true },
    drumSpeed: { type: Number, required: true },
    saltSpiralSpeed: { type: Number, required: true },
    salinityOfWater: { type: Number, required: true },
    salinityOfProduct: { type: Number, required: true },
    moistureOfRaw: { type: Number, required: true },
    moistureOfRoasted: { type: Number, required: true },

    //R2-3-4
    heatingFan1: { type: Number, required: true },
    heatingFan2: { type: Number, required: true },
    heatingFan3: { type: Number, required: true },
    heatingFan4: { type: Number, required: true },
    heatingFan5: { type: Number, required: true },
    heatingFan6: { type: Number, required: true },
    coolingFan1: { type: Number, required: true },
    coolingFan2: { type: Number, required: true },
    coolingFan3: { type: Number, required: true },
    coolingFan4: { type: Number, required: true },
    coolingFan5: { type: Number, required: true },
    coolingFan6: { type: Number, required: true },

    anyDeviations: { type: String, required: true },
    deviationID: { type: String, default: "" },

    status: { type: String, default: "failed" },
    signedOff: { type: String, default: "" },
    signOffDate: { type: Date },
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
