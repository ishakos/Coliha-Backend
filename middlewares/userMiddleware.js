//IMPORT
const { verify } = require("jsonwebtoken");
//ENV
const config = require("../config/config");
const SECRET1 = config.SECRET1;

//user auth
const validateUser = (req, res, next) => {
  const accessToken = req.header("accessToken");
  try {
    const validToken = verify(accessToken, SECRET1);
    req.userId = validToken.userId; //cause we created the token using userId when login
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ expired: "Access token expired" });
    }
    return res.status(401).json({ invalid: "Invalid access token" });
  }
};

module.exports = { validateUser };
