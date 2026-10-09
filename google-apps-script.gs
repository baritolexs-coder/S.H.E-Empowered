/**
 * S.H.E Empowered — saves website registrations into this Google Sheet.
 *
 * HOW TO USE (full steps in README.md):
 *  1. Create a Google Sheet → Extensions → Apps Script.
 *  2. Delete what's there, paste this whole file, click Save.
 *  3. Deploy → New deployment → type "Web app"
 *       Execute as: Me      Who has access: Anyone
 *  4. Copy the Web app URL into GOOGLE_SCRIPT_URL in script.js.
 */

const SHEET_NAME = "Registrations";

const COLUMNS = [
  ["submittedAt", "Submitted at"],
  ["fullName", "Full name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["level", "Level"],
  ["college", "College"],
  ["department", "Department"],
  ["hasBusiness", "Owns a business?"],
  ["businessName", "Business name"],
  ["businessDescription", "What the business does"],
  ["fitness", "Fitness interest?"],
  ["fitnessActivities", "Fitness activities"],
  ["books", "Reads books?"],
  ["bookGenres", "Book genres"],
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000); // avoid two sign-ups writing to the same row
  try {
    const sheet = getSheet_();
    const p = (e && e.parameter) || {};
    const row = COLUMNS.map(([key]) => {
      if (key === "submittedAt") return new Date();
      const v = String(p[key] || "").trim();
      // stop spreadsheet formulas being injected, and keep leading 0 on phone numbers
      if (key === "phone") return "'" + v;
      return /^[=+\-@]/.test(v) ? "'" + v : v;
    });
    sheet.appendRow(row);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

// Visiting the Web app URL in a browser shows this — handy to check it's live.
function doGet() {
  return json_({ ok: true, message: "S.H.E Empowered registration endpoint is running." });
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(([, label]) => label));
    sheet.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight("bold")
      .setBackground("#6B0E4B")
      .setFontColor("#FFFFFF");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
