//IMPORT
const { verify } = require("jsonwebtoken");
//ENV
const config = require("../config/config");
const SECRET2 = config.SECRET2;

//admin auth
const validateAdmin = (req, res, next) => {
  const adminAccess = req.header("accessTokenAdmin");
  try {
    const validToken = verify(adminAccess, SECRET2);
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ expired: "Access token expired" });
    }
    return res.status(401).json({ invalid: "Invalid access token" });
  }
};

module.exports = { validateAdmin };
