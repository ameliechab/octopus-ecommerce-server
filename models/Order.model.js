const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    creations: [
      {
        productId: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    amount: { type: Number, required: true },
    address: { type: Object, required: true },
    status: { type: String, default: "pending" },
    // s'en servir comme cart non confirmée
    date: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);

const mongoose = require("mongoose");
