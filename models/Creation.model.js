const mongoose = require("mongoose");

const CreationSchema = new mongoose.Schema(
  {
    artistId: { type: String, required: true },
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array },
    price: { type: Number, required: true },
    // inStock: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Creation = mongoose.model("Creation", CreationSchema);
module.exports = Creation;
