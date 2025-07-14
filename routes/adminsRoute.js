//IMPORT
const express = require("express");
const jwt = require("jsonwebtoken");
const Users = require("../models/usersModel");
const Offers = require("../models/offersModel");
const { validateAdmin } = require("../middlewares/adminMiddleware");
//ENV
const config = require("../config/config");
const SECRET2 = config.SECRET2;
const ADMIN1 = config.ADMIN1;
const ADMIN_PASS1 = config.ADMIN_PASS1;

const router = express.Router();

//route1 (get all users)
router.get("/users", validateAdmin, async (req, res) => {
  try {
    //excluding passwords for security reasons
    const users = await Users.find({}).select("-password");
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//route2 (admin login)
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (username !== ADMIN1) {
    return res.status(404).json({ noAdmin: "Admin Does Not Exist!" });
  }
  // ◘ i havent used the bcrypt method cause the password is stored in env file, so i compared directly
  if (password !== ADMIN_PASS1) {
    return res.status(404).json({ wrongPass: "Wrong Password!" });
  }
  try {
    const adminToken = jwt.sign({ username: ADMIN1 }, SECRET2);
    res.status(200).json(adminToken);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//route3 (delete selected user account)
router.delete("/delete-account/:id", validateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    let user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    await Users.deleteOne({ _id: user._id });
    res.status(200).json({ deleted: "Account deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//route4 (get all users who have orders)
router.get("/pending-sub-requests", validateAdmin, async (req, res) => {
  try {
    const clients = await Users.find({ hasSubscribeRequest: true }).select(
      "-password"
    );
    return res.status(200).json({ clients: clients });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//route5 (accept user's receipt )
router.post("/accept-receipt", validateAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    let user = await Users.findById(userId);

    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    let offer = await Offers.findOne({ title: user.offerRequested });
    if (!offer) {
      return res.status(404).json({ noOffer: "This offer does not exist" });
    }
    let newUserData = {
      hasSubscribeRequest: false,
      offerRequested: "",
      purchasedOffer: {
        offer: offer._id,
        purchasedAt: new Date(),
        EndsAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      },
    };
    await Users.updateOne(
      {
        username: user.username,
      },
      {
        $set: newUserData,
      }
    );
    res.status(200).json({ accepted: "Receipt Accepted Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//route6 (refuse user's receipt )
router.post("/refuse-receipt", validateAdmin, async (req, res) => {
  const { userId } = req.body;
  try {
    let user = await Users.findById(userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    let newUserData = {
      hasSubscribeRequest: false,
      offerRequested: "",
    };
    await Users.updateOne(
      {
        username: user.username,
      },
      {
        $set: newUserData,
      }
    );
    res.status(200).json({ refused: "Receipt Refused Successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//route7 (get users who dosent have an offer request)
router.get("/subscribed-users", validateAdmin, async (req, res) => {
  try {
    const users = await Users.find({ hasSubscribeRequest: false }).select(
      "-password"
    );
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
