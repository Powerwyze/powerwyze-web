/**
 * PowerWyze Lead Capture — Google Apps Script Web App
 *
 * SETUP INSTRUCTIONS (one-time, ~3 minutes):
 *
 * 1. Open the Leads CRM sheet:
 *    https://docs.google.com/spreadsheets/d/1VmQLvJaZi2RU2oEpC4RQS9RCAt-2K4Fd1pC_Rdb0Gjs/edit
 *
 * 2. Extensions → Apps Script. A new tab opens with an empty editor.
 *
 * 3. Delete any boilerplate code, paste this entire file in, and save (Ctrl/Cmd+S).
 *
 * 4. Click "Deploy" (top-right) → "New deployment".
 *      - Click the gear icon → choose "Web app".
 *      - Description: "PowerWyze lead webhook"
 *      - Execute as: "Me"
 *      - Who has access: "Anyone"
 *      - Click Deploy. Authorize when prompted (review permissions, allow).
 *
 * 5. Copy the "Web app URL" (ends in /exec). Paste it into the website's
 *    script.js  →  WEBHOOK_URL constant.
 *
 * 6. (Optional) Test by running the function `testRun` once from the editor.
 */

// ============== CONFIG ==============
const SHEET_NAME       = 'Leads';                 // tab name to write into
const NOTIFY_EMAIL     = 'wyzer@powerwyze.com';   // who gets notified per lead
const NOTIFY_FROM_NAME = 'PowerWyze Site';
// ====================================

const HEADERS = [
  'Submitted At',
  'Name',
  'Company',
  'Title',
  'Work Email',
  'Phone',
  'Event Name',
  'Event Type',
  'Event Dates',
  'Days',
  'Kiosks',
  'Expected Attendance',
  'Venue / City',
  'Branding / Theme',
  'Notes',
  'Referral',
  'Source',
  'User Agent'
];

function doPost(e) {
  try {
    const body = e.postData && e.postData.contents
      ? JSON.parse(e.postData.contents)
      : (e.parameter || {});

    const ss   = SpreadsheetApp.openById('1VmQLvJaZi2RU2oEpC4RQS9RCAt-2K4Fd1pC_Rdb0Gjs');
    let sheet  = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);

    // Ensure headers
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }

    const row = [
      new Date(),
      body.name        || '',
      body.company     || '',
      body.title       || '',
      body.email       || '',
      body.phone       || '',
      body.eventName   || '',
      body.eventType   || '',
      body.eventDates  || '',
      body.days        || '',
      body.kiosks      || '',
      body.attendance  || '',
      body.venue       || '',
      body.branding    || '',
      body.notes       || '',
      body.referral    || '',
      body.source      || 'powerwyze.com',
      body.userAgent   || ''
    ];
    sheet.appendRow(row);

    // Email notification
    const subject = `New PowerWyze lead — ${body.company || body.name || 'Unknown'}`;
    const lines = [
      `Name:        ${body.name || ''}`,
      `Company:     ${body.company || ''}`,
      `Title:       ${body.title || ''}`,
      `Email:       ${body.email || ''}`,
      `Phone:       ${body.phone || ''}`,
      `Event:       ${body.eventName || ''}`,
      `Type:        ${body.eventType || ''}`,
      `Dates:       ${body.eventDates || ''}`,
      `Days:        ${body.days || ''}`,
      `Kiosks:      ${body.kiosks || ''}`,
      `Attendance:  ${body.attendance || ''}`,
      `Venue/City:  ${body.venue || ''}`,
      `Branding:    ${body.branding || ''}`,
      `Notes:       ${body.notes || ''}`,
      `Referral:    ${body.referral || ''}`,
      `Source:      ${body.source || 'powerwyze.com'}`
    ].join('\n');
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: subject,
      body: lines,
      name: NOTIFY_FROM_NAME
    });

    return _json({ ok: true });
  } catch (err) {
    return _json({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json({ ok: true, status: 'PowerWyze webhook live' });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// Manual sanity check — run from the editor menu (Run → testRun)
function testRun() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        name: 'Test Lead',
        company: 'Acme Corp',
        title: 'Director of Events',
        email: 'test@acme.com',
        phone: '555-0100',
        eventName: 'Acme Annual Summit',
        eventType: 'Trade show',
        eventDates: 'Sep 12–14, 2026',
        days: 3,
        kiosks: 2,
        attendance: 5000,
        venue: 'Las Vegas, NV',
        branding: 'Acme blue + white, custom decal',
        notes: 'Looking for production lane',
        referral: 'LinkedIn',
        source: 'manual test',
        userAgent: 'Apps Script test'
      })
    }
  };
  doPost(fakeEvent);
}
