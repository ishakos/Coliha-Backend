const mongoose = require("mongoose");

const UsersSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Please enter a Username"],
      unique: true,
    },
    email: {
      type: String,
      required: [true, "Please enter an Email"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter a Password"],
    },
    city: {
      type: String,
      required: true,
      required: [true, "Please enter a city"],
    },
    sheetID: {
      type: String,
      required: false,
      default: "",
    },
    verified: {
      type: Boolean,
      required: false,
      default: false,
    },
    profilePic: {
      type: String,
      required: false,
      default: "",
    },
    pfp: {
      type: Boolean,
      required: false,
      default: false,
    },
    //Email Verification Request
    secondEVR: {
      type: Boolean,
      required: false,
      default: true,
    },
    purchasedOffer: {
      offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offers",
        required: false,
        default: null,
      },
      purchasedAt: { type: Date, default: null },
      EndsAt: { type: Date, default: null },
    },
    hasSubscribeRequest: {
      type: Boolean,
      required: false,
      default: false,
    },
    offerRequested: {
      type: String,
      required: false,
      default: "",
    },
    zrtoken: {
      type: String,
      required: false,
      default: "",
    },
    zrkey: {
      type: String,
      required: false,
      default: "",
    },
    yalidinetoken: {
      type: String,
      required: false,
      default: "",
    },
    yalidinekey: {
      type: String,
      required: false,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Users = mongoose.model("Users", UsersSchema);

module.exports = Users;
