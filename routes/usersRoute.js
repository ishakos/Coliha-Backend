//IMPORT
const express = require("express");
const { validateUser } = require("../middlewares/userMiddleware");
const {
  getEssentialUsers,
  registerUser,
  loginUser,
  verifyEmail,
  sendSecondEmailVerification,
  forgotPassword,
  checkResetPasswordToken,
  resetPasswordFromLink,
  resetPasswordFromSettings,
  deleteAccount,
  getCurrentUser,
  updateProfilePic,
  updateZrToken,
  updateYalidineToken,
} = require("../controllers/usersRouteController");

const router = express.Router();

//route1 (get users [username and email only])
router.get("/essential", getEssentialUsers);
//route2 (add user to db when register)
router.post("/register", registerUser);
//route3 (login)
router.post("/login", loginUser);
//route4 (Email Verification)
router.post("/email-verification/:username/:token", verifyEmail);
//route5 (email verification 2nd request)
router.post("/email-verification", validateUser, sendSecondEmailVerification);
//route6 (forgot password request)
router.post("/forgot-password", forgotPassword);
//route7 (check reset password token (email link))
router.post("/check-token-rs/:id/:token", checkResetPasswordToken);
//route8 (reset password (email link))
router.post("/reset-password/:id/:token", resetPasswordFromLink);
//route9 (reset password (settings))
router.patch("/reset-password", validateUser, resetPasswordFromSettings);
//route10 (delete account)
router.post("/delete-account", validateUser, deleteAccount);
//route11 (get current user infos)
router.get("/current-user", validateUser, getCurrentUser);
//route12 (change user pfp)
router.patch("/profile-picture", validateUser, updateProfilePic);
//route13 (update zr tokens)
router.patch("/zr-token", validateUser, updateZrToken);
//route14 (update yalidine tokens)
router.patch("/yalidine-token", validateUser, updateYalidineToken);

module.exports = router;
