# Baby Log (No-Server)

An ultra-simple, offline-first web app to log your baby's feed, pee, and poop with one tap. Stores data locally in your browser. Optionally syncs to Google Sheets using a tiny Google Apps Script (no separate server needed).

## Features
- One-tap buttons: Feed, Pee, Poop (auto timestamp)
- Last event times and today's totals at a glance
- Log view with per-day filter, delete, and CSV export
- Print-friendly table (File → Print or use the "Print" button)
- Optional Google Sheets sync using Apps Script Web App URL

## Quick Start
1. Open `index.html` in your browser (double-click it or use a local web server).
2. Click the big buttons to log events.
3. Use "View log" for the table and per-day filter.
4. Click "Print" for a clean PDF-friendly layout.

Tip: On iPhone, open in Safari and use "Add to Home Screen" for a native-like shortcut.

## Optional: Sync to Google Sheets (no server)
You can keep everything local. If you want cloud backup and cross-device logs, set up a simple Google Apps Script that appends entries to a Google Sheet and serves them back for the Log view.

### 1) Create the Sheet
- Create a new Google Sheet, add a sheet named `Log` (or use the default).
- In row 1, add headers (optional): `Timestamp`, `ISO`, `Type`, `Note`, `ID`, `Source`.

### 2) Create the Apps Script
- In the Google Sheet, click Extensions → Apps Script.
- Replace the contents with the script below and press Save.

```javascript
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');

    // If you used a standalone script, prefer openById('SHEET_ID')
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName('Log') || ss.getActiveSheet();

    // Handle deletions by entry ID
    if (body.action === 'delete' && body.id) {
      var id = String(body.id);
      var values = sh.getDataRange().getValues();
      // Assume ID is in column 5 (A=1 ... E=5). Adjust if needed.
      var idCol = 5;
      for (var r = 2; r <= values.length; r++) { // skip header row
        if (String(values[r-1][idCol-1]) === id) {
          sh.deleteRow(r);
          break;
        }
      }
      return ContentService
        .createTextOutput(JSON.stringify({status:'ok', action:'delete'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: append a new event
    var ts = new Date(body.timestamp || Date.now());
    sh.appendRow([
      ts,                      // Timestamp (Date)
      new Date(ts).toISOString(), // ISO string
      body.type || '',
      body.note || '',
      body.id || '',
      body.source || 'babylog-web'
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok', action:'append'}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// List all entries as JSON (supports JSONP via `?callback=fn`)
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActive();
    var sh = ss.getSheetByName('Log') || ss.getActiveSheet();
    var values = sh.getDataRange().getValues();
    // Expect columns: Timestamp, ISO, Type, Note, ID, Source
    var rows = [];
    for (var r = 2; r <= values.length; r++) { // skip header
      var row = values[r-1];
      var ts = row[0];
      var iso = row[1];
      var type = row[2];
      var note = row[3];
      var id = row[4];
      rows.push({
        id: String(id || ''),
        type: String(type || ''),
        note: String(note || ''),
        timestamp: ts instanceof Date ? ts.getTime() : (iso ? Date.parse(iso) : 0),
        iso: String(iso || ''),
      });
    }
    // Sort newest first
    rows.sort(function(a,b){ return b.timestamp - a.timestamp; });

    var payload = JSON.stringify(rows);
    var cb = e && e.parameter && e.parameter.callback;
    if (cb) {
      // JSONP
      return ContentService
        .createTextOutput(cb + '(' + payload + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService
      .createTextOutput(payload)
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

### 3) Deploy as a Web App
- In Apps Script: Deploy → New deployment → Type: Web app.
- Execute as: Me.
- Who has access: Anyone.
- Click Deploy and copy the Web App URL (ends with `/exec`).

Note: The app reads the log with a normal JSON GET first, then falls back to JSONP automatically. This avoids CORS issues across different environments.

### 4) Paste URL in the app
- Option A — Settings UI: Open the app → Settings → paste the Web App URL → enable sync → Save. New entries sync automatically; use "Sync Now" to push unsynced ones.
- Option B — No settings (hardcoded): Edit `app.js` and set `FIXED_WEB_APP_URL` near the top to your Web App URL. The Settings section will be hidden and syncing will auto-enable.

```js
// app.js (top of file)
const FIXED_WEB_APP_URL = 'https://script.google.com/macros/s/XXXXXXXXXXXX/exec';
```

Auto-sync behavior: the app will try to sync immediately after you log an entry, and will also attempt to push any unsynced entries on startup and when your browser comes back online.

Deletions: when you delete or undo an entry in the app, it queues a delete by entry ID and attempts to delete the matching row in the `Log` sheet. If offline, deletes are retried on startup/when online. If the Log view is showing the remote Sheet, deleting an item will remove it from the Sheet directly.

## Data & Privacy
- Local: All events are stored in your browser's `localStorage` under `babylog.entries.v1`.
- Cloud (optional): If you enable the Web App URL, the app POSTs event JSON to your Script URL; only the fields in the request are sent.

## Export/Backup
- Use "Export CSV" in the Log view for a portable backup.
- You can also print to PDF for simple sharing with a pediatrician.

## Troubleshooting
- Entries not appearing? Ensure you’re opening the same browser/profile you used before (localStorage is per-browser).
- Sync not working? Re-check the Apps Script deployment URL and that deployment access is set to "Anyone" (and redeploy after script changes).
- Timezone mismatch in Sheet? Format the first column as Date/Time and ensure your Spreadsheet locale/timezone is correct (File → Settings in Google Sheets).
- Want the Settings hidden? Use the hardcoded URL option above. You won’t need to touch any in-app settings afterward.

### Local testing tips (CORS)
- If you open the app directly as a file (path starts with `file:///`), some browsers preflight CORS requests.
- The app writes with CORS and falls back to `no-cors` POST; it reads the log via CORS GET and falls back to JSONP automatically.
- For reliable CORS behavior, run a tiny local server and open the site via `http://localhost:`:

```bash
python3 -m http.server 8099 --bind 127.0.0.1
```

Then visit http://127.0.0.1:8099

### Verify your webhook independently
Send a test from Terminal to confirm the Sheet is appending rows:

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","type":"pee","note":"test","timestamp":'$(date +%s000)',"iso":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","source":"babylog-web"}' \
  "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec"
```

If this does not create a row, double-check deployment settings (Execute as: Me; Access: Anyone) and that you copied the `/exec` URL (not `/dev`).

## Security & Privacy Notes
- The Web App URL is not a secret; it’s similar to a webhook endpoint. Don’t share it publicly.
- No API keys or OAuth tokens are stored in the app. The script runs under your Google account and appends rows in your sheet.
- For extra control, you can add a simple shared token check in Apps Script (and include that token in the request body). Keep in mind that the token would still live in your local `app.js` file.

## Dev Notes
- This app is completely static: HTML + CSS + vanilla JS.
- No build step, no dependencies.
