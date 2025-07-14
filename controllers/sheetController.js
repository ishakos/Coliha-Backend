const { google } = require("googleapis");
const path = require("path");

// Authenticate with Google API
const auth = new google.auth.GoogleAuth({
  keyFile: path.join(__dirname, ""), //service-acc.json
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive",
  ],
});
const sheets = google.sheets({ version: "v4", auth });
const drive = google.drive({ version: "v3", auth });

async function createSheet(username, userEmail) {
  try {
    const response = await sheets.spreadsheets.create({
      auth: await auth.getClient(),
      resource: { properties: { title: `${username}_OrdersListSheet` } },
    });

    const sheetID = response.data.spreadsheetId;
    await drive.permissions.create({
      fileId: sheetID,
      requestBody: { role: "writer", type: "user", emailAddress: userEmail },
    });

    return { status: 200, data: { sheetID } };
  } catch (error) {
    return {
      status: 500,
      error: error.message || "Server Error, Could not create the sheet",
    };
  }
}

async function getSheetData(sheetID, range = "A1:Z") {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetID,
      range: range,
    });
    return { status: 200, data: response.data.values };
  } catch (error) {
    return {
      status: 500,
      error: error.message || "Failed to fetch sheet data.",
    };
  }
}

async function addSheetData(spreadsheetId, values) {
  try {
    //values must be in this form: [["1", "2", "3"], ["4", "5", "6"], ...]
    if (!Array.isArray(values[0])) {
      values = [values];
    }
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:A",
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values },
    });

    return { status: 200, data: response.data };
  } catch (error) {
    return {
      status: 500,
      error: error.message || "Error adding data to the sheet.",
    };
  }
}

async function updateSheetData(sheetID, range, values) {
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: sheetID,
      range: range,
      valueInputOption: "RAW",
      requestBody: {
        values: [values],
      },
    });

    return { status: 200, data: response.data };
  } catch (error) {
    return { status: 500, error: error.message || "Error updating data." };
  }
}

async function deleteSheetData(spreadsheetId, rowNumber) {
  try {
    const sheetInfo = await sheets.spreadsheets.get({
      spreadsheetId,
    });
    const sheet = sheetInfo.data.sheets.find(
      (s) => s.properties.title === "Sheet1"
    );
    if (!sheet) {
      return { status: 404, error: `Sheet with name Sheet1 not found.` };
    }
    const sheetId = sheet.properties.sheetId;
    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: "ROWS",
                startIndex: rowNumber - 1,
                endIndex: rowNumber,
              },
            },
          },
        ],
      },
    });
    return { status: 200, data: response.data };
  } catch (error) {
    return { status: 500, error: error.message || "Error deleting row." };
  }
}

async function deleteSheet(sheetID) {
  try {
    await drive.files.delete({
      fileId: sheetID,
    });
    return {
      status: 200,
      data: { message: `Sheet with ID ${sheetID} deleted successfully.` },
    };
  } catch (error) {
    return { status: 500, error: error.message || "Error deleting sheet." };
  }
}

module.exports = {
  createSheet,
  getSheetData,
  updateSheetData,
  deleteSheetData,
  addSheetData,
  deleteSheet,
};
