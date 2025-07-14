const mongoose = require("mongoose");

const OffersSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    price: {
      type: Number,
      required: true,
    },
    features: {
      type: [String],
      required: true,
    },
    noAccess: {
      type: [String],
      required: true,
    },
    available: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Offers = mongoose.model("Offers", OffersSchema);

module.exports = Offers;
