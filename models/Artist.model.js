const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    img: { type: String, required: true },
    creations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Creation",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Artist", ArtistSchema);
