// npm install dotenv
require("dotenv").config();

module.exports = {
  MONGODB_URI: process.env.MONGODB_URI,
  PORT: process.env.PORT || 3001,
  SECRET1: process.env.SECRET1,
  SECRET2: process.env.SECRET2,
  SECRET3: process.env.SECRET3,
  SECRET4: process.env.SECRET4,
  GMAIL: process.env.GMAIL,
  GMAIL_PASS: process.env.GMAIL_PASS,
  ADMIN1: process.env.ADMIN1,
  ADMIN_PASS1: process.env.ADMIN_PASS1,
  DOMAIN = "https://coliha.vercel.app";
};
