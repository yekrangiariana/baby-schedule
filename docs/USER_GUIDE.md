# ☁️ Google Sheets Sync Setup

This guide shows you how to sync your baby tracking data with Google Sheets so you can share it with family members and access it from multiple devices.

## Why Use Google Sheets Sync?
- ✅ Share data with family members in real-time
- ✅ Access from multiple devices  
- ✅ Automatic backup of your data
- ✅ View/analyse data in Google Sheets if needed.

## Setup Instructions

### Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new blank spreadsheet
3. Name it something like "Baby Tracker Data" or whatever you like
4. Add these column headers in row 1:
   - Column A: `Timestamp`
   - Column B: `ISO` 
   - Column C: `Type`
   - Column D: `Note`
   - Column E: `ID`
   - Column F: `Source`

### Step 2: Add the Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Remove whatever code that is there then copy and paste the code below:

<button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Copy Code</button>

<details class="code-snippet">
<summary>📋 Apps Script Code (Click to expand)</summary>

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
        if (allData[i][4] === data.id) {
          sheet1.deleteRow(i + 1);
          break;
        }
      }
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}));
    }
    
    // DEFAULT: append new entry to Sheet1
    if (data.id && data.type && data.timestamp) {
      const dateObj = new Date(data.timestamp);
      
      sheet1.appendRow([
        dateObj,
        data.iso || dateObj.toISOString(),
        data.type,
        data.note || '',
        data.id,
        data.source || 'babylog-web'
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
    
    // Handle saveActionTypes via GET request
    if (e.parameter.action === 'saveActionTypes' && e.parameter.data) {
      const actionTypes = JSON.parse(e.parameter.data);
      const configSheet = getOrCreateSheet(ss, 'Config');
      
      if (configSheet.getLastRow() > 1) {
        configSheet.getRange(2, 1, configSheet.getLastRow() - 1, 4).clear();
      }
      
      if (configSheet.getLastRow() === 0) {
        configSheet.appendRow(['id', 'name', 'emoji', 'color']);
      }
      
      actionTypes.forEach(function(type) {
        configSheet.appendRow([type.id, type.name, type.emoji, type.color]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({status: 'ok'}))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
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

</details>

3. Click **Save** (💾 icon)
4. Click **Deploy** → **New deployment**
5. Click the gear icon ⚙️ → Choose **Web app**
6. Set these options:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. Click **Deploy**
8. Click **Authorize access** and follow the prompts
9. **Copy the Web App URL** - you'll need this!

### Step 3: Connect the App

1. Open the baby tracker app and go to **⚙️ Settings** tab
2. Paste your Web App URL in the **Sync URL** field (or click **Paste** if it's in your clipboard)
3. Click **💾 Connect & Sync**
4. You'll see "✓ Connected to Google Sheets" when it's working!

That's it! Your data now syncs automatically to Google Sheets.

## Sharing with Family

To let your partner or family members use the same data:

1. **Share the Web App URL:**
   - Send them the same Web App URL you copied
   - They paste it in their Settings tab
   - Everyone's data syncs to the same sheet!

2. **Share the App:**
   - Just send them the link to this app
   - They open it, add the sync URL, and you're connected!

## Troubleshooting

- **Connection failed?** Double-check that you deployed the Apps Script as a **Web app** with **Anyone** access
- **No data showing?** Make sure the column headers match exactly as shown in Step 1
- **Sync not working?** Try disconnecting and reconnecting with the URL

---

Need more help? Check the Settings tab for sync status and connection info!
