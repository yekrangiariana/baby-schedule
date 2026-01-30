// please refer to readme.md for technical documentation 

# 👶 Baby Schedule Tracker - User Guide

Welcome! This app helps you track your baby's daily activities - feeding, diaper changes, and sleep patterns. All data is stored locally on your device by default, so it's completely private and works offline.

## 🎯 How It Works

The app runs entirely in your web browser - no installation needed! Your data is saved automatically on your device, so you can use it anywhere, anytime, even without internet.

### Quick Actions
- **🍼 Feed** - Log breastfeeding or bottle feeding
- **💧 Pee** - Record wet diapers
- **💩 Poop** - Track bowel movements

Simply tap a button, and it's recorded with a timestamp. You can add notes to any entry if needed.

### Viewing Your Data
- **Home Tab** - See today's summary and recent activity
- **Log Tab** - Browse all entries with date filtering
- **Graphs Tab** - Visualize patterns over the last 7 days

## ☁️ Google Sheets Sync (Optional)

Want to share data with your partner or family? You can optionally sync your data to Google Sheets so everyone stays on the same page.

### Why Use Google Sheets Sync?
- ✅ Share data with family members in real-time
- ✅ Access from multiple devices
- ✅ Automatic backup of your data
- ✅ View/analyze data in Google Sheets if needed

### Setting Up Sync

#### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Baby Tracker Data"
4. Add these column headers in row 1:
   - Column A: `timestamp`
   - Column B: `type`
   - Column C: `note`
   - Column D: `id`

#### Step 2: Add the Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any code you see
3. Paste this code:

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || '{}');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    Logger.log('Received data: ' + JSON.stringify(data));
    
    // Handle action type config operations
    if (data.action === 'saveActionTypes') {
      const configSheet = getOrCreateSheet(ss, 'Config');
      
      if (configSheet.getLastRow() > 1) {
        configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 4).clear();
      }
      
      if (configSheet.getLastRow() === 0) {
        configSheet.appendRow(['id', 'name', 'emoji', 'color']);
      }
      
      data.actionTypes.forEach(function(type) {
        configSheet.appendRow([type.id, type.name, type.emoji, type.color]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}));
    }
    
    // Use Sheet1 for all activity entries
    const sheet1 = getOrCreateSheet(ss, 'Sheet1');
    
    // Handle delete action
    if (data.action === 'delete') {
      const allData = sheet1.getDataRange().getValues();
      for (let i = allData.length - 1; i >= 1; i--) {
        if (allData[i][4] === data.id) {  // id is in column E (index 4)
          sheet1.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}));
    }
    
    // DEFAULT: append new entry to Sheet1
    if (data.id && data.type && data.timestamp) {
      // Convert timestamp to Date object
      const dateObj = new Date(data.timestamp);
      
      sheet1.appendRow([
        dateObj,                    // Column A: Date/time (Google Sheets will format it)
        data.iso || dateObj.toISOString(),  // Column B: ISO string
        data.type,                  // Column C: type
        data.note || '',            // Column D: note
        data.id,                    // Column E: id
        data.source || 'babylog-web'  // Column F: source
      ]);
      
      Logger.log('Added to Sheet1: ' + data.type);
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}));
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: 'Invalid data'}));
    
  } catch (err) {
    Logger.log('Error: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}));
  }
}

function doGet(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Read from Sheet1
    const sheet1 = getOrCreateSheet(ss, 'Sheet1');
    const entries = [];
    
    if (sheet1.getLastRow() > 1) {
      const data = sheet1.getDataRange().getValues();
      const headers = data[0];
      const rows = data.slice(1);
      
      rows.forEach(function(row) {
        const obj = {};
        headers.forEach(function(header, index) {
          obj[header] = row[index];
        });
        entries.push(obj);
      });
    }
    
    // Get action types from Config
    const configSheet = getOrCreateSheet(ss, 'Config');
    const actionTypes = [];
    
    if (configSheet.getLastRow() > 1) {
      const configData = configSheet.getDataRange().getValues();
      const configHeaders = configData[0];
      const configRows = configData.slice(1);
      
      configRows.forEach(function(row) {
        const obj = {};
        configHeaders.forEach(function(header, index) {
          obj[header] = row[index];
        });
        actionTypes.push(obj);
      });
    }
    
    const result = {
      entries: entries,
      actionTypes: actionTypes
    };
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (err) {
    Logger.log('Error in doGet: ' + err.toString());
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function getOrCreateSheet(ss, sheetName) {
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    if (sheetName === 'Sheet1') {
      sheet.appendRow(['Timestamp', 'ISO', 'Type', 'Note', 'ID', 'Source']);
    } else if (sheetName === 'Config') {
      sheet.appendRow(['id', 'name', 'emoji', 'color']);
    }
  }
  
  return sheet;
}
```

4. Click **Save** (💾 icon)
5. Click **Deploy** → **New deployment**
6. Click the gear icon ⚙️ → Choose **Web app**
7. Set these options:
   - **Execute as:** Me
   - **Who has access:** Anyone
8. Click **Deploy**
9. Click **Authorize access** and follow the prompts
10. **Copy the Web App URL** - you'll need this!

#### Step 3: Connect the App

1. Open the app and go to **⚙️ Settings** tab
2. Paste your Web App URL in the **Sync URL** field
3. Click **💾 Connect & Sync**
4. You'll see "✓ Connected to Google Sheets" when it's working!

That's it! Your data now syncs automatically to Google Sheets.

### Sharing with Family

To let your partner or family members use the same data:

1. **Share the Google Sheet:**
   - Open your Google Sheet
   - Click **Share** button
   - Add their email addresses
   - Give them **Editor** access

2. **Share the Web App URL:**
   - Send them the same Web App URL you copied
   - They paste it in their Settings tab
   - Everyone's data syncs to the same sheet!

3. **Share the App:**
   - Just send them the link to this app
   - They open it, add the sync URL, and you're connected!

## 🎨 Personalization

Choose your favorite theme in Settings:
- 🌸 **Blossom** - Soft pink and purple
- ☄️ **Comet** - Cool blue and cosmic
- 🌿 **Meadow** - Fresh green and natural

## 🔒 Privacy & Data

- **Local-only mode:** If you don't set up Google Sheets sync, all data stays on your device only. No one else can access it.
- **With sync enabled:** Data is stored in YOUR Google Sheet that you control. Only people you explicitly share the sheet with can see the data.
- **The app itself doesn't store any data** - everything is either on your device or in your own Google Sheet.

## 💡 Tips

- **Multiple devices?** Set up sync and use the same URL on all your devices
- **Want to start fresh?** Clear your browser data or use the app in a different browser
- **Need help?** All your entries are timestamped - you can review them anytime in the Log tab
- **Export your data?** If you have sync enabled, just open your Google Sheet and download it as Excel or CSV

---

Need more help? Check the Settings tab for sync status and connection info!
