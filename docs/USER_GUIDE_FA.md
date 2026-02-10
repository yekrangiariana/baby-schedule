# ☁️ راهنمای راه اندازی همگام سازی Google Sheets

این راهنما توضیح می دهد چگونه داده های پیگیری نوزاد را با Google Sheets همگام کنید تا بتوانید آن را با خانواده به اشتراک بگذارید و از چند دستگاه استفاده کنید.

## چرا همگام سازی با Google Sheets؟
- ✅ اشتراک داده با اعضای خانواده به صورت لحظه ای
- ✅ دسترسی از چند دستگاه
- ✅ پشتیبان گیری خودکار از داده ها
- ✅ امکان بررسی و تحلیل داده ها در Google Sheets در صورت نیاز

## دستورالعمل راه اندازی

### مرحله ۱: ساخت یک Google Sheet

1. به [Google Sheets](https://sheets.google.com) بروید
2. یک صفحه گسترده خالی بسازید
3. یک نام مثل "داده های پیگیری نوزاد" انتخاب کنید
4. سرستون های زیر را در ردیف اول قرار دهید:
   - ستون A: `Timestamp`
   - ستون B: `ISO`
   - ستون C: `Type`
   - ستون D: `Note`
   - ستون E: `ID`
   - ستون F: `Source`

### مرحله ۲: افزودن Apps Script

1. در Google Sheet روی **Extensions** → **Apps Script** کلیک کنید
2. هر کدی که آنجا هست را پاک کنید و کد زیر را جایگذاری کنید:

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

3. روی **Save** (آیکن 💾) کلیک کنید
4. روی **Deploy** → **New deployment** کلیک کنید
5. آیکن چرخ دنده ⚙️ را بزنید و **Web app** را انتخاب کنید
6. این گزینه ها را تنظیم کنید:
   - **Execute as:** Me
   - **Who has access:** Anyone
7. روی **Deploy** کلیک کنید
8. روی **Authorize access** کلیک کنید و مراحل را انجام دهید
9. **آدرس Web App را کپی کنید** - به آن نیاز دارید!

### مرحله ۳: اتصال برنامه

1. برنامه را باز کنید و به تب **⚙️ تنظیمات** بروید
2. آدرس Web App را در فیلد **Sync URL** قرار دهید (یا اگر در کلیپ بورد است روی **Paste** کلیک کنید)
3. روی **💾 Connect & Sync** کلیک کنید
4. وقتی درست کار کند پیام "✓ Connected to Google Sheets" را می بینید!

تمام شد! داده های شما اکنون به صورت خودکار با Google Sheets همگام می شود.

## اشتراک گذاری با خانواده

برای اینکه شریک زندگی یا اعضای خانواده هم از همان داده ها استفاده کنند:

1. **آدرس Web App را به اشتراک بگذارید:**
   - همان آدرس Web App را برایشان بفرستید
   - آن ها در تنظیمات قرار می دهند
   - داده های همه به یک Sheet همگام می شود

2. **برنامه را به اشتراک بگذارید:**
   - لینک همین برنامه را بفرستید
   - آن ها برنامه را باز می کنند و آدرس همگام سازی را وارد می کنند

## رفع اشکال

- **اتصال ناموفق است؟** مطمئن شوید Apps Script را به عنوان **Web app** با دسترسی **Anyone** منتشر کرده اید
- **داده ای نشان داده نمی شود؟** سرستون ها دقیقا مانند مرحله ۱ باشند
- **همگام سازی کار نمی کند؟** قطع اتصال و اتصال دوباره را امتحان کنید

---

اگر هنوز مشکلی دارید، وضعیت همگام سازی را در تب تنظیمات بررسی کنید.
