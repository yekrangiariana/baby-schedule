# Baby Schedule

A simple, mobile-first web app to track your baby's daily activities. Features instant local storage with optional cloud sync to Google Sheets.

## Project Structure

```
baby-schedule/
├── index.html           # Main HTML file
├── manifest.json        # PWA manifest
├── robots.txt          # Search engine directives
├── sitemap.xml         # Sitemap for SEO
├── styles.css          # Root styles (legacy)
├── assets/
│   └── favicon.svg     # App icon
├── css/
│   ├── styles.css      # Application styles
│   └── welcome.css     # Welcome screen styles
├── docs/
│   ├── USER_GUIDE.md   # Setup guide (English)
│   └── USER_GUIDE_FI.md # Setup guide (Finnish)
└── js/
    ├── app.js          # Main application logic
    ├── translations.js # Translation system (EN/FI)
    └── welcome.js      # Welcome screen
```

## Languages

The app is available in:
- English (default)
- Finnish (Suomi)

Language can be changed in the Settings tab. Your preference is saved automatically.

## Features

### Quick Logging
- One-tap buttons with automatic timestamps
- Customizable activity types (Feed, Pee, Poop, and more)
- Instant response with local-first storage
- Undo button appears for 5 seconds after logging

### Calendar View
- Monthly calendar with color-coded activity indicators
- Visual overview of daily activity patterns
- Quick navigation between months
- Activity type filtering

### Smart Insights
- Today's Summary with real-time stats
- Recent Activity list with latest entries
- Visual Charts:
  - Today's Activity (bar chart)
  - 7-Day Trend (stacked bars)
  - Last 24 Hours (line chart showing hourly patterns)
  - Activity Distribution (pie chart)
- Activity type filtering for all charts

### Full Activity Log
- View all entries organized by date
- Filter by specific day using date picker
- Delete individual entries
- Search and filter functionality
- Export to CSV or JSON for backup

### Customization
- Add custom activity types with name, emoji, and color
- Edit or delete existing activity types
- Activity types sync across devices when using Google Sheets
- Custom types stored locally and in the cloud

### Settings
- Optional Google Sheets sync configuration
- Manual sync control with status indicators
- Import/Export data (CSV and JSON formats)
- Cloud backup for cross-device access
- Language selection

### Mobile-Optimized
- Screen-based navigation with bottom tab bar
- Thumb-friendly button placement
- Professional design with clean pastel colors
- PWA-ready: Add to home screen for app-like experience
- Offline-first architecture

## Quick Start

1. Open `index.html` in your browser or serve with a local web server
2. Start logging activities using the quick action buttons
3. View insights and charts in the Insights tab
4. Browse complete history in the Log tab
5. Customize activity types in Settings

### Install as App

**iPhone (Safari)**:
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"
4. Tap "Add"

**Android (Chrome)**:
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Select "Add to Home Screen" or "Install App"
4. Tap "Add"

## Optional: Google Sheets Sync

The app works 100% offline by default. Enable cloud sync to backup data and access across multiple devices.

### Step 1: Create Your Google Sheet

1. Create a new Google Sheet
2. Create TWO sheets (tabs):
   - **Data**: For storing activity entries
     - Add headers in row 1: `Timestamp`, `ISO`, `Type`, `Note`, `ID`, `Source`
   - **Config**: For storing custom activity types (auto-created by the script)
3. Make sure your first sheet is named "Data"

### Step 2: Add the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code
3. Paste the following script:

```javascript
// Helper: Get or create a sheet by name
function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
  }
  return sheet;
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents || '{}');
    var ss = SpreadsheetApp.getActive();

    // Handle action types sync (goes to "Config" tab)
    if (body.action === 'saveActionTypes' && body.actionTypes) {
      var configSheet = getOrCreateSheet(ss, 'Config');
      
      // Clear existing and write header
      configSheet.clear();
      configSheet.appendRow(['ID', 'Name', 'Emoji', 'Color']);
      
      // Write action types
      body.actionTypes.forEach(function(type) {
        configSheet.appendRow([
          type.id || '',
          type.name || '',
          type.emoji || '',
          type.color || ''
        ]);
      });
      
      return ContentService
        .createTextOutput(JSON.stringify({status: 'ok', action: 'saveActionTypes'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Handle regular entries (goes to "Data" tab, fallback to "Log" for backward compatibility)
    var dataSheet = ss.getSheetByName('Data') || ss.getSheetByName('Log') || ss.getActiveSheet();

    // Handle deletions by entry ID
    if (body.action === 'delete' && body.id) {
      var id = String(body.id);
      var values = dataSheet.getDataRange().getValues();
      var idCol = 5; // Column E (ID column)
      
      for (var r = 2; r <= values.length; r++) {
        if (String(values[r-1][idCol-1]) === id) {
          dataSheet.deleteRow(r);
          break;
        }
      }
      
      return ContentService
        .createTextOutput(JSON.stringify({status: 'ok', action: 'delete'}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Default: append a new entry
    var ts = new Date(body.timestamp || Date.now());
    dataSheet.appendRow([
      ts,                                // Timestamp (Date)
      new Date(ts).toISOString(),       // ISO string
      body.type || '',                   // Type (e.g., feed, pee, poop, custom)
      body.note || '',                   // Note
      body.id || '',                     // Unique ID
      body.source || 'babylog-web'       // Source
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({status: 'ok', action: 'append'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: String(err)}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActive();
    
    // Read entries from "Data" tab (fallback to "Log" for backward compatibility)
    var dataSheet = ss.getSheetByName('Data') || ss.getSheetByName('Log') || ss.getActiveSheet();
    var dataValues = dataSheet.getDataRange().getValues();
    
    var entries = [];
    for (var r = 2; r <= dataValues.length; r++) {
      var row = dataValues[r-1];
      var ts = row[0];
      var iso = row[1];
      var type = row[2];
      var note = row[3];
      var id = row[4];
      
      entries.push({
        id: String(id || ''),
        type: String(type || ''),
        note: String(note || ''),
        timestamp: ts instanceof Date ? ts.getTime() : (iso ? Date.parse(iso) : 0),
        iso: String(iso || '')
      });
    }
    
    // Sort newest first
    entries.sort(function(a, b) { return b.timestamp - a.timestamp; });
    
    // Read action types from "Config" tab (if exists)
    var actionTypes = [];
    var configSheet = ss.getSheetByName('Config');
    if (configSheet) {
      var configValues = configSheet.getDataRange().getValues();
      for (var r = 2; r <= configValues.length; r++) {
        var row = configValues[r-1];
        actionTypes.push({
          id: String(row[0] || ''),
          name: String(row[1] || ''),
          emoji: String(row[2] || ''),
          color: String(row[3] || '')
        });
      }
    }
    
    // Return both entries and action types
    var response = {
      entries: entries,
      actionTypes: actionTypes
    };
    
    var payload = JSON.stringify(response);
    var cb = e && e.parameter && e.parameter.callback;
    
    if (cb) {
      // JSONP support
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

4. Click **Save**
5. Name your project (e.g., "Baby Schedule Sync")

### Step 3: Deploy the Web App

1. Click **Deploy → New deployment**
2. Click the gear icon next to "Select type"
3. Choose **Web app**
4. Configure:
   - **Execute as**: Me
   - **Who has access**: Anyone
5. Click **Deploy**
6. **Copy the Web App URL** (it ends with `/exec`)
7. Click **Done**

> **Important**: After any script changes, you must create a new deployment or use "Manage deployments" to update the existing one.

### Step 4: Configure the App

You have two options:

#### Option A: Settings UI (Recommended for beginners)

1. Open the Baby Schedule app
2. Tap **Settings** tab at the bottom
3. Paste your Web App URL
4. Toggle **Enable Sync** on
5. Click **Save Settings**
6. Use **Sync Now** to push any existing local entries

#### Option B: Hardcoded URL (Set and forget)

1. Open `app.js` in a text editor
2. Find this line near the top (around line 5):
   ```js
   const FIXED_WEB_APP_URL = "";
   ```
3. Paste your Web App URL between the quotes:
   ```js
   const FIXED_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
   ```
4. Save the file

> When using a hardcoded URL, the Settings tab will still appear but the URL field will be disabled. Sync is automatically enabled.

### How Sync Works

- **Instant local**: All actions save to your browser first (instant response)
- **Background sync**: New entries automatically sync to Google Sheets
- **Queue system**: If offline, entries queue and sync when connection returns
- **On startup**: App syncs any pending changes when you open it
- **Deletions**: Deleting entries also removes them from Google Sheets

## Data & Privacy

- **Local Storage**: All entries stored in your browser's `localStorage` under `babylog.entries.v1`
- **No tracking**: Zero analytics, no external services (except optional Google Sheets)
- **Your data**: With Google Sheets sync, data lives in YOUR Google Sheet only
- **No secrets**: The Web App URL is like a webhook - functional but not private
- **Browser-specific**: Data tied to browser/profile (use sync for multi-device)

## Export & Backup

### Export CSV
1. Go to **Log** tab
2. Click **Export CSV** button
3. Save the file for backup or sharing with doctors

### Print/PDF
1. Use your browser's print function (Ctrl/Cmd+P)
2. Select "Save as PDF" as the destination
3. Clean, printer-friendly layout automatically applied

## Troubleshooting

### Entries Not Showing Up
- **Check browser/profile**: localStorage is per-browser. Use the same browser where you logged entries.
- **Clear cache carefully**: Don't clear site data or you'll lose local entries (sync first!)

### Sync Not Working
1. **Verify URL**: Must end with `/exec` (not `/dev`)
2. **Check deployment**:
   - Execute as: **Me** (not "User accessing the web app")
   - Who has access: **Anyone**
3. **Redeploy**: After script changes, create new deployment
4. **Test independently**: Use the curl command below to verify

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d '{"id":"test123","type":"pee","timestamp":'$(date +%s000)'}' \
  "YOUR_WEB_APP_URL_HERE"
```

Check your Google Sheet - a test row should appear.

### Charts Not Displaying
- **Need data**: Charts require at least one entry to display
- **Refresh**: Try pulling down to refresh or reload the page
- **Browser compatibility**: Use a modern browser (Chrome, Safari, Firefox, Edge)

### Wrong Timezone in Google Sheets
1. In Google Sheets: **File → Settings**
2. Set correct **Locale** and **Time zone**
3. Format Timestamp column as **Date time**

## Technical Details

### Architecture
- **Local-first**: All operations write to localStorage first (instant)
- **Background sync**: Queue-based sync to Google Sheets when online
- **Screen-based navigation**: iOS/Android-style full-screen views
- **Progressive Web App**: Can install as standalone app

### Tech Stack
- **Pure vanilla JavaScript**: No frameworks, no dependencies
- **Modern CSS**: CSS Grid, Flexbox, CSS variables
- **Canvas API**: For smooth, animated charts
- **Inter font**: Professional typography via Google Fonts

### Files
- `index.html` - App structure and markup (253 lines)
- `styles.css` - Complete styling and responsive design (847+ lines)  
- `app.js` - All logic, local storage, sync, charts (1220+ lines)
- `README.md` - This documentation

### Browser Support
- Chrome/Edge 90+
- Safari 14+
- Firefox 88+
- Mobile Safari (iOS 14+)
- Chrome Android

## Development

### Running Locally

**Option 1: Direct File** (Quick test)
```bash
open index.html
# or just double-click the file
```

**Option 2: Local Server** (Best for testing sync)
```bash
# Python 3
python3 -m http.server 8099

# Then visit: http://localhost:8099
```

### Project Structure
```
baby-schedule/
├── index.html      # App structure
├── styles.css      # All styling
├── app.js          # All logic
└── README.md       # Documentation
```

No build process, no package.json, no dependencies. Just open and run.

## Deployment & Sharing

### Safe Public Deployment

The app is designed to be safely deployed publicly! The Google Sheets URL is **never hardcoded** in your deployed app - instead, users enter it in Settings. This means:

- Your data URL is NOT visible in the public source code
- Safe to deploy to any free hosting platform
- Easy to share with family members
- Each family member can access the same shared data

### How It Works

1. **Deploy your app** to any hosting platform (instructions below)
2. **Create your Google Sheet** and deploy the Apps Script (see above)
3. **Share the deployed app URL** with family members
4. **Share the Google Sheets URL privately** (text, email, or password manager) with trusted family only
5. **Each person** opens Settings → Pastes the Google Sheets URL → Clicks "Connect & Sync"
6. **Everyone syncs** to the same sheet - perfect for co-parenting!

### Quick Deployment Guide

**Cloudflare Pages** (Recommended)
```bash
# 1. Ensure FIXED_WEB_APP_URL is empty in app.js
const FIXED_WEB_APP_URL = "";

# 2. Sign up at pages.cloudflare.com
# 3. Upload files or connect Git repo
# 4. Deploy (no build needed)
# Live at: https://your-project.pages.dev
```

**Netlify**
- Drag folder to [netlify.com/drop](https://app.netlify.com/drop)
- Optional: Add password protection (Site settings → Access control)
- Live at: `https://your-site.netlify.app`

**GitHub Pages**
- Push to GitHub → Settings → Pages → Deploy from `main`
- Live at: `https://username.github.io/repo-name/`

**Vercel**
- Import repo at [vercel.com](https://vercel.com)
- Live at: `https://your-project.vercel.app`

### Family Sharing Setup

**Step-by-step for co-parents:**

1. **Deploy the app** (see options above)
2. **Create ONE Google Sheet** following the setup instructions above
3. **Share two links privately** with your partner/family:
   - Your deployed app URL (e.g., `https://our-baby.pages.dev`)
   - Your Google Sheets Web App URL (via secure text/email)
4. **Each person**:
   - Opens the app
   - Goes to Settings tab
   - Pastes the Google Sheets URL
   - Clicks "Connect & Sync"
   - Sees "Connected to Google Sheets" confirmation
5. **Done!** Everyone now shares the same baby log

**Security notes:**
- Only share the Google Sheets URL with people you trust
- Keep the URL private (don't post it publicly)
- Anyone with the URL can view/edit your baby's data
- Consider using your hosting provider's password protection for extra security

### Personal Use (Alternative)

If you prefer to use the app alone without sharing:

1. Keep the app on your device (no deployment needed)
2. Optionally hardcode your Google Sheets URL in `app.js`:
   ```js
   const FIXED_WEB_APP_URL = "https://script.google.com/macros/s/YOUR_ID/exec";
   ```
3. Your settings will be locked to this URL automatically

**Optional: Add password to your deployment**
- Most hosts (Netlify, Vercel) offer password protection
- Adds extra security layer before accessing the app

## License

This is a personal project. Feel free to use and modify for your own needs.

## Contributing

This is a personal baby tracking app, but suggestions and improvements are welcome!

---

Made for new parents who need simple, fast baby tracking.

