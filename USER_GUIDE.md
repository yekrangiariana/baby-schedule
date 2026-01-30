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
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  if (data.action === 'add') {
    sheet.appendRow([data.timestamp, data.type, data.note || '', data.id]);
  } else if (data.action === 'delete') {
    const allData = sheet.getDataRange().getValues();
    for (let i = allData.length - 1; i >= 1; i--) {
      if (allData[i][3] === data.id) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
  } else if (data.action === 'update') {
    const allData = sheet.getDataRange().getValues();
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][3] === data.id) {
        sheet.getRange(i + 1, 1, 1, 4).setValues([[
          data.timestamp, data.type, data.note || '', data.id
        ]]);
        break;
      }
    }
  }
  
  return ContentService.createTextOutput('OK');
}

function doGet(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const result = rows.map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
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
