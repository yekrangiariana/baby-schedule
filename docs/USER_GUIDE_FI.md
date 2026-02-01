# ☁️ Google Sheets Synkronoinnin Asennus

Tämä opas näyttää, kuinka synkronoit vauvasi seurantatiedot Google Sheetsin kanssa, jotta voit jakaa ne perheenjäsenten kanssa ja käyttää useista laitteista.

## Miksi Käyttää Google Sheets Synkronointia?
- ✅ Jaa tiedot perheenjäsenten kanssa reaaliajassa
- ✅ Käytä useista laitteista
- ✅ Automaattinen tietojen varmuuskopiointi
- ✅ Tarkastele/analysoi tietoja Google Sheetsissa tarvittaessa

## Asennusohjeet

### Vaihe 1: Luo Google Sheet

1. Siirry [Google Sheetsiin](https://sheets.google.com)
2. Luo uusi tyhjä laskentataulukko
3. Anna sille nimi kuten "Vauvan Seuranta" tai mitä haluat
4. Lisää nämä sarakeotsikot riville 1:
   - Sarake A: `Timestamp`
   - Sarake B: `ISO` 
   - Sarake C: `Type`
   - Sarake D: `Note`
   - Sarake E: `ID`
   - Sarake F: `Source`

### Vaihe 2: Lisää Apps Script

1. Google Sheetissäsi, klikkaa **Laajennukset** → **Apps Script**
2. Kopioi ja liitä alla oleva koodi:

<button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Kopioi Koodi</button>

<details class="code-snippet">
<summary>📋 Apps Script Koodi (Klikkaa laajentaaksesi)</summary>

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

3. Klikkaa **Tallenna** (💾 kuvake)
4. Klikkaa **Käyttöönotto** → **Uusi käyttöönotto**
5. Klikkaa hammaspyörä-kuvaketta ⚙️ → Valitse **Verkkosovellus**
6. Aseta nämä asetukset:
   - **Suorita nimellä:** Minä
   - **Kenellä on käyttöoikeus:** Kuka tahansa
7. Klikkaa **Ota käyttöön**
8. Klikkaa **Valtuuta käyttöoikeus** ja seuraa ohjeita
9. **Kopioi Web App URL** - tarvitset tätä!

### Vaihe 3: Yhdistä Sovellus

1. Avaa vauvan seurantasovellus ja siirry **⚙️ Asetukset** -välilehteen
2. Liitä Web App URL **Sync URL** -kenttään (tai klikkaa **Liitä**, jos se on leikepöydälläsi)
3. Klikkaa **💾 Yhdistä & Synkronoi**
4. Näet "✓ Yhdistetty Google Sheetsiin", kun se toimii!

Siinä kaikki! Tietosi synkronoituvat nyt automaattisesti Google Sheetsiin.

## Jakaminen Perheen Kanssa

Antaaksesi kumppanisi tai perheenjäsenten käyttää samoja tietoja:

1. **Jaa Web App URL:**
   - Lähetä heille sama Web App URL, jonka kopioit
   - He liittävät sen Asetukset-välilehteen
   - Kaikkien tiedot synkronoituvat samaan taulukkoon!

2. **Jaa Sovellus:**
   - Lähetä heille linkki tähän sovellukseen
   - He avaavat sen, lisäävät synkronointi-URL:n, ja olette yhdistetty!

## Vianmääritys

- **Yhteys epäonnistui?** Tarkista vielä, että otit Apps Scriptin käyttöön **Verkkosovelluksena** **Kuka tahansa** -käyttöoikeudella
- **Ei tietoja näkyvissä?** Varmista, että sarakeotsikot täsmäävät täsmälleen kuten Vaiheessa 1 näytetään
- **Synkronointi ei toimi?** Yritä katkaista yhteys ja yhdistää uudelleen URL:lla

---

Tarvitsetko lisää apua? Tarkista Asetukset-välilehti synkronoinnin tilasta ja yhteystiedoista!
