//IMPORT
const express = require("express");
const Users = require("../models/usersModel");
const { validateUser } = require("../middlewares/userMiddleware");
const { validateSubscribe } = require("../middlewares/subscribtionMiddleware");
const {
  getSheetData,
  updateSheetData,
  deleteSheetData,
  addSheetData,
} = require("../controllers/sheetController");

const router = express.Router();

//route1 (get user's sheetData)
router.get("/:id", validateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const user = await Users.findById(id);
    if (!user) {
      return res.status(404).json({ noUser: "This user does not exist" });
    }
    const sheetResponse = await getSheetData(user.sheetID);
    if (sheetResponse.status !== 200) {
      return res.status(404).json({ message: sheetResponse.error });
    }
    res.status(200).json({ sheets: sheetResponse.data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

//route2 (insert a row)
router.post("/insert", validateUser, validateSubscribe, async (req, res) => {
  const { sheetID, values } = req.body;
  if (!sheetID || !values) {
    return res.status(400).json({ missing: "Missing Data or SheetID" });
  }
  try {
    const sheetResponse = await addSheetData(sheetID, values);
    if (sheetResponse.status !== 200) {
      return res
        .status(sheetResponse.status)
        .json({ sheetError: sheetResponse.error });
    }
    res.status(200).json({ inserted: "Row Inserted" });
  } catch (error) {
    res
      .status(500)
      .json({ error: error.message || "Failed to add data to sheet" });
  }
});

//route3 (update a row)
router.post("/update", validateUser, validateSubscribe, async (req, res) => {
  const { sheetID, rowNumber, newData } = req.body;
  if (!newData) {
    return res.status(500).json({ missing: "Missing required parameters" });
  }
  try {
    const range = `Sheet1!A${rowNumber}:Z${rowNumber}`;
    const sheetResponse = await updateSheetData(sheetID, range, newData);
    if (sheetResponse.status !== 200) {
      return res.status(500).json({ sheetError: sheetResponse.error });
    }
    return res.status(200).json({ updated: "Row updated" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update sheet" });
  }
});

//route3 (delete a row)
router.post("/delete", validateUser, validateSubscribe, async (req, res) => {
  try {
    const { sheetID, rowNumber } = req.body;
    const sheetResponse = await deleteSheetData(sheetID, rowNumber);
    if (sheetResponse.status !== 200) {
      return res
        .status(sheetResponse.status)
        .json({ sheetError: sheetResponse.error });
    }
    res.status(200).json({ deleted: "Row deleted" });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
