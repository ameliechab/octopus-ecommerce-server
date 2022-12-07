const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    creations: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Creation",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    date: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
