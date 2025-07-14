//We exporting these functions to use em in other routes
//IMPORT
const Users = require("../models/usersModel");
const Offers = require("../models/offersModel");

const getUsers = async (req, res) => {
  try {
    //excluding passwords for security reasons
    const users = await Users.find({}).select("-password");
    res.status(200).json({ users: users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getOffers = async (req, res) => {
  try {
    const offers = await Offers.find({});
    res.status(200).json({ offers: offers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getUsers,
  getOffers,
};
