//This file must be in the root folder, Otherwise it cant get the env variables
//"node insertOffers"
//IMPORT
const mongoose = require("mongoose");
const Offers = require("../models/offersModel");
//ENV
const config = require("../config/config");
const MONGODB_URI = config.MONGODB_URI;

//connect to db
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.log("Connection Failed", error);
  });

const offersToInsert = [
  {
    title: "Free Trial",
    description: "Allows you to try 2 features for free for a limited time",
    price: 0,
    features: ["feature-a", "feature-b"],
    noAccess: "Feature C",
    available: true,
  },
  {
    title: "Offer1",
    description: "Allows you to use 2 features",
    price: 10,
    features: ["feature-a", "feature-b"],
    noAccess: "Feature C",
    available: true,
  },
  {
    title: "Offer2",
    description: "Allows you to use 3 features",
    price: 20,
    features: ["feature-a", "feature-b", "feature-c"],
    noAccess: "Feature D",
    available: true,
  },
  {
    title: "Offer3",
    description: "Allows you to use 4 features",
    price: 30,
    features: ["feature-a", "feature-b", "feature-c", "feature-d"],
    noAccess: "",
    available: true,
  },
];

//inserting offers into db
async function insertOffers() {
  try {
    for (let offer of offersToInsert) {
      const newOffer = new Offers({
        title: offer.title,
        description: offer.description,
        price: offer.price,
        features: offer.features,
        noAccess: offer.noAccess,
        available: offer.available,
      });
      await newOffer.save();
      console.log(`${offer.title} inserted successfully`);
    }
  } catch (error) {
    console.error("Error inserting data:", error);
  } finally {
    return;
  }
}

//executing
insertOffers();
