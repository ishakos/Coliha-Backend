//IMPORT
const express = require("express");
const Users = require("../models/usersModel");
const Offers = require("../models/offersModel");
const { validateUser } = require("../middlewares/userMiddleware");
const { validateSubscribe } = require("../middlewares/subscribtionMiddleware");

const router = express.Router();

//route1 (get offers)
router.get("/", async (req, res) => {
  try {
    const offers = await Offers.find({});
    res.status(200).json({ offers: offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route2 (check if user still has his offer)
router.post("/check-offer", async (req, res) => {
  const { username, expirationDate } = req.body;
  try {
    let user = await Users.findOne({ username: username });
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    //zedt isoString bah ywelo f nefs l format
    const currentDate = new Date().toISOString();
    if (currentDate >= expirationDate) {
      const nullOffer = {
        offer: null,
        purchasedAt: null,
        EndsAt: null,
      };
      await Users.updateOne(
        {
          _id: user.id,
        },
        {
          $set: {
            purchasedOffer: nullOffer,
          },
        }
      );
      let newUser = await Users.findOne({ username: username });
      return res.status(200).json({ newUser: newUser });
    } else {
      return res.status(200).json({ notExpired: "User still have his offer" });
    }
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//route3 (get user's current purchased offer)
router.post("/current-offer", async (req, res) => {
  const { userId } = req.body;
  try {
    let user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    const offerId = user.purchasedOffer.offer;
    let offer = await Offers.findById(offerId);
    if (!offer) {
      return res.status(404).json({ noOffer: "This offer does not exist" });
    }
    res.status(200).json({ offer: offer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route4 (User's new Offer Request)
router.patch("/order-new-offer", validateUser, async (req, res) => {
  const { offerRequested } = req.body;
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This User does not exist" });
    }
    await Users.updateOne(
      {
        _id: user.id,
      },
      {
        $set: {
          hasSubscribeRequest: true,
          offerRequested: offerRequested,
        },
      }
    );
    return res.status(200).json({ requested: "Offer Requested" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

//route5 (subscribe verification)
router.post(
  "/check-access",
  validateUser,
  validateSubscribe,
  async (req, res) => {
    try {
      return res
        .status(200)
        .json({ access: true, message: "User subscribed " });
    } catch (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
