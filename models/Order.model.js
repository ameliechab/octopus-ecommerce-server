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
    //amount: { type: Number, required: true },
    // address: { type: Object, required: true },
    // status: { type: String, default: "pending" },
    // s'en servir comme cart non confirmée
    date: { type: Date },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;
