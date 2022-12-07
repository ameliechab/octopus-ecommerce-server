const mongoose = require("mongoose");

const CreationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true},
    description: { type: String, required: true },
    img: { type: String, required: true },
    categories: { type: Array, required: true },
    price: { type: Number, required: true },
    user: 
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    artistId: 
      {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      },
  },
  { timestamps: true }
);

const Creation = mongoose.model("Creation", CreationSchema);
module.exports = Creation;
