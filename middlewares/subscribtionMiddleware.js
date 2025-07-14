//IMPORT
const Offers = require("../models/offersModel");

// subscribe auth
const validateSubscribe = async (req, res, next) => {
  const currentPage = req.header("currentPage");
  const offerId = req.header("offerId");
  try {
    if (!offerId) {
      return res
        .status(403)
        .json({ denied: "User not subscribed to any plan" });
    }
    const offer = await Offers.findById(offerId);
    if (!offer) {
      return res
        .status(403)
        .json({ denied: "User not subscribed to any plan" });
    }
    if (!offer.features.includes(currentPage)) {
      return res.status(403).json({
        denied: "Access to this feature is not allowed for your current plan",
      });
    }
    req.user = { plan: offer };
    return next();
  } catch (err) {
    return res.status(500).json({ denied: "Server error" });
  }
};

module.exports = { validateSubscribe };
