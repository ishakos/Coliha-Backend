//IMPORT
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
//ENV
const config = require("./config/config");
const PORT = config.PORT;
const MONGODB_URI = config.MONGODB_URI;

const app = express();

//when we get and send requests rahom en forme json
app.use(express.json());
//whitelisting
app.use(cors());

//routes
const usersRoute = require("./routes/usersRoute");
app.use("/users", usersRoute);
const adminsRoute = require("./routes/adminsRoute");
app.use("/admins", adminsRoute);
const subscribersRoute = require("./routes/subscribersRoute");
app.use("/subscribers", subscribersRoute);
const ordersRoute = require("./routes/ordersRoute");
app.use("/orders", ordersRoute);
const shippingRoute = require("./routes/shippingRoute");
app.use("/shipping", shippingRoute);

//Import and initialize cron jobs
require("./controllers/autoCleanerController");

//connect to db
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Listening on Server ${PORT}`);
    });
    console.log("Connected to DB");
  })
  .catch((error) => {
    console.log("Connection Failed", error);
  });
