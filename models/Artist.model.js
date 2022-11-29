const mongoose = require("mongoose");

const ArtistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    picture: { type: String, required: true },
    creations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Creation",
      },
    ],
  },
  { timestamps: true }
);

const Artist = mongoose.model("Artist", ArtistSchema);

module.exports = Artist;
