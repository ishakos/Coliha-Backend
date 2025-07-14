//Runs every midnight to delete unverified users after one month of their account creation
//IMPORT
const cron = require("node-cron");
const Users = require("../models/usersModel");

// Schedule a task to run every day at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    // Find and delete users who have not verified their email within one month
    const result = await Users.deleteMany({
      verified: false,
      createdAt: { $lte: oneMonthAgo },
    });

    console.log(`Deleted ${result.deletedCount} unverified users`);
  } catch (error) {
    console.error("Error deleting unverified users:", error.message);
  }
});
