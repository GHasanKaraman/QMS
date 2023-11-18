const mongoose = require("mongoose");
const essentials = require("../utils/essentials");

const ratioFormSchema = new mongoose.Schema({
  username: { type: String, required: true },
  location: { type: String, required: true },
  productCode: { type: String, required: true },
  productName: { type: String, required: true },
  ingredient1: { type: String, required: true },
  ingredient2: { type: String, required: true },
  ingredient3: { type: String, default: "" },
  ingredient4: { type: String, default: "" },
  ingredient5: { type: String, default: "" },
  ingredient6: { type: String, default: "" },
  ingredient7: { type: String, default: "" },
  ingredient8: { type: String, default: "" },
  ingredient9: { type: String, default: "" },
  ingredient10: { type: String, default: "" },
  weight1: { type: String, required: true },
  weight2: { type: String, required: true },
  weight3: { type: String, default: "" },
  weight4: { type: String, default: "" },
  weight5: { type: String, default: "" },
  weight6: { type: String, default: "" },
  weight7: { type: String, default: "" },
  weight8: { type: String, default: "" },
  weight9: { type: String, default: "" },
  weight10: { type: String, default: "" },
  type: { type: String, default: "later" },
  createdAt: {
    type: Date,
    default: () => essentials.getEST(),
    required: true,
  },
});

const ratioFormModel = mongoose.model("ratioForms", ratioFormSchema);

module.exports = ratioFormModel;
