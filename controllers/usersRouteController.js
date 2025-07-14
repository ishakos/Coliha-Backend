// IMPORT
const Users = require("../models/usersModel");
const Offers = require("../models/offersModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const config = require("../config/config");
const { createSheet, deleteSheet } = require("./sheetController");

// ENV
const { SECRET1, SECRET3, SECRET4, GMAIL_PASS, GMAIL } = config;

//domain Name
const DOMAIN = "http://localhost:3000";

exports.getEssentialUsers = async (req, res) => {
  try {
    const users = await Users.find({}).select("username email");
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerUser = async (req, res) => {
  const { username, email, password, city } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await Users.create({
      username,
      email,
      password: hashedPassword,
      city,
    });

    // Email verification token
    const evSecret = SECRET3 + hashedPassword;
    const token = jwt.sign({ email }, evSecret, { expiresIn: "24h" });
    const link = `${DOMAIN}/email-verification/${username}/${token}`;

    const verificationEmailHTML = `
  <div style="font-family: 'Helvetica Neue', sans-serif; background-color: #f9fafb; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #0f172a; text-align: center;">Welcome to <span style="color: #14b8a6;">Coliha</span> 🎉</h2>
      <p style="font-size: 16px; color: #334155; text-align: center;">Let’s verify your email address so you can get started.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #14b8a6; color: white; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 13px; color: #475569; word-break: break-all; text-align: center;">
        ${link}
      </p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link will expire in 24 hours.</p>
    </div>
  </div>
`;
    // Send verification email
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL, pass: GMAIL_PASS },
    });
    const mailOptions = {
      from: GMAIL,
      to: email,
      subject: "Verify Your Email Address",
      html: verificationEmailHTML,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.log(error);
      else console.log("Email sent: " + info.response);
    });
    return res.status(200).json({ registered: "User Registered Succesfully" });
  } catch (err) {
    if (err.code === 11000) {
      const dupField = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ message: `${dupField} already exists` });
    }
    return res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ noUser: "User Doesn't Exist!" });
    }
    bcrypt.compare(password, user.password).then((match) => {
      if (match) {
        const accessToken = jwt.sign({ userId: user.id }, SECRET1);
        return res.status(200).json(accessToken);
      } else {
        res.status(404).json({ wrongPassword: "Wrong Password!" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  const { username, token } = req.params;
  try {
    const user = await Users.findOne({ username });
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    const evSecret = SECRET3 + user.password;
    let verify;
    try {
      verify = jwt.verify(token, evSecret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ expired: "Link expired" });
      }
      return res.status(401).json({ invalid: "Invalid or tampered link" });
    }
    let sheetID;
    try {
      const sheetResponse = await createSheet(user.username, user.email);
      if (sheetResponse.status !== 200) {
        return res.status(500).json({ error: sheetResponse.error });
      }
      sheetID = sheetResponse.data.sheetID;
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
    const Offer = await Offers.findOne({ title: "Free Trial" });
    await Users.updateOne(
      { username },
      {
        $set: {
          verified: true,
          secondEVR: false,
          purchasedOffer: {
            offer: Offer._id,
            purchasedAt: new Date(),
            EndsAt: new Date(new Date().setMonth(new Date().getMonth() + 1)),
          },
          sheetID,
        },
      }
    );
    console.log("here");
    return res.status(200).json({ verified: "User Verified" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.sendSecondEmailVerification = async (req, res) => {
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    const expirationDate = new Date(user.createdAt);
    expirationDate.setMonth(expirationDate.getMonth() + 1);
    const evSecret = SECRET3 + user.password;
    const token = jwt.sign({ email: user.email }, evSecret, {
      expiresIn: Math.floor((expirationDate.getTime() - Date.now()) / 1000),
    });
    const link = `${DOMAIN}/email-verification/${user.username}/${token}`;
    const verificationEmailHTML = `
  <div style="font-family: 'Helvetica Neue', sans-serif; background-color: #f9fafb; padding: 40px;">
    <div style="max-width: 600px; margin: auto; background: white; border-radius: 10px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <h2 style="color: #0f172a; text-align: center;">Welcome to <span style="color: #14b8a6;">Coliha</span> 🎉</h2>
      <p style="font-size: 16px; color: #334155; text-align: center;">Let’s verify your email address so you can get started.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${link}" style="display: inline-block; background-color: #14b8a6; color: white; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 16px;">Verify Email</a>
      </div>
      <p style="font-size: 14px; color: #64748b; text-align: center;">
        If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="font-size: 13px; color: #475569; word-break: break-all; text-align: center;">
        ${link}
      </p>
      <hr style="margin: 40px 0; border: none; border-top: 1px solid #e2e8f0;" />
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">This link will expire in 24 hours.</p>
    </div>
  </div>
`;
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL, pass: GMAIL_PASS },
    });
    var mailOptions = {
      from: GMAIL,
      to: user.email,
      subject: "Verify Your Email Address",
      html: verificationEmailHTML,
    };
    try {
      await transporter.sendMail(mailOptions);
      await Users.updateOne({ _id: user.id }, { $set: { secondEVR: false } });
      return res
        .status(200)
        .json({ evrSent: "Email Verification Request Sent" });
    } catch (error) {
      return res.status(500).json({ error: error.message || error.toString() });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ noEmail: `Email not found` });
    }
    const fpSecret = SECRET4 + user.password;
    const token = jwt.sign({ userId: user.id, email: user.email }, fpSecret, {
      expiresIn: "15m",
    });
    const link = `${DOMAIN}/reset-password/${user.id}/${token}`;
    const linkHTML = `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 40px; text-align: center;">
    <div style="max-width: 500px; margin: auto; background: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 6px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Reset Your Password</h2>
      <p style="color: #666; font-size: 15px;">
        We received a request to reset your password. Click the button below to continue.
      </p>
      <a href="${link}" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 6px; font-weight: bold;">
        Reset Password
      </a>
      <p style="color: #999; font-size: 13px; margin-top: 30px;">
        If you didn’t request this, you can safely ignore this email.
      </p>
    </div>
    <p style="margin-top: 40px; font-size: 12px; color: #aaa;">
      &copy; ${new Date().getFullYear()} Coliha. All rights reserved.
    </p>
  </div>
`;

    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL, pass: GMAIL_PASS },
    });
    var mailOptions = {
      from: GMAIL,
      to: email,
      subject: "Reset Your Password",
      html: linkHTML,
    };
    try {
      await transporter.sendMail(mailOptions);
      return res.status(200).json({ sent: "Link sent to user's mail" });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkResetPasswordToken = async (req, res) => {
  const { id, token } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    const fpSecret = SECRET4 + user.password;
    try {
      jwt.verify(token, fpSecret);
      return res.status(200).json({ valid: "Link is valid" });
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ expired: "Link expired" });
      }
      return res.status(401).json({ invalid: "Invalid or tampered link" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPasswordFromLink = async (req, res) => {
  const { id, token } = req.params;
  const { password, password2 } = req.body;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    if (password !== password2) {
      return res.status(400).json({ noMatch: "Passwords dosent match" });
    }
    const fpSecret = SECRET4 + user.password;
    try {
      jwt.verify(token, fpSecret);
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ expired: "Link expired" });
      }
      return res.status(401).json({ invalid: "Invalid or tampered link" });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await Users.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );
    return res.status(200).json({ updated: "Password Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPasswordFromSettings = async (req, res) => {
  const { password, password2 } = req.body;
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    if (password !== password2) {
      return res.status(400).json({ noMatch: "Passwords don't match" });
    }
    const encryptedPassword = await bcrypt.hash(password, 10);
    await Users.updateOne(
      { _id: user.id },
      { $set: { password: encryptedPassword } }
    );
    res.status(200).json({ updated: "Password Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    await Users.deleteOne({ _id: user.id });
    await deleteSheet(user.sheetID);
    res.status(200).json({ deleted: "Account deleted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await Users.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProfilePic = async (req, res) => {
  const { path, pfp } = req.body;
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This User does not exist" });
    }
    await Users.updateOne(
      { _id: user.id },
      { $set: { profilePic: path, pfp } }
    );
    res.status(200).json({ updated: "Image Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateZrToken = async (req, res) => {
  const { zrkey, zrtoken } = req.body;
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    await Users.updateOne({ _id: user.id }, { $set: { zrkey, zrtoken } });
    res.status(200).json({ updated: "Tokens Updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateYalidineToken = async (req, res) => {
  const { yalidinekey, yalidinetoken } = req.body;
  try {
    const user = await Users.findById(req.userId);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    await Users.updateOne(
      { _id: user.id },
      { $set: { yalidinekey, yalidinetoken } }
    );
    return res.status(200).json({ updated: "Tokens Updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
