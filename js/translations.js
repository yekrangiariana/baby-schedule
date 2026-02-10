// Translation system for Little Agenda App
// Add new languages by adding a new key to the translations object

const translations = {
  en: {
    // Meta tags
    pageTitle: "Little Agenda - Track Your Baby's Activities",
    pageDescription:
      "Simple baby activity tracker. Log feedings, diaper changes, and other activities. Works offline and syncs with Google Sheets.",
    pageKeywords:
      "baby tracker, baby log, feeding tracker, diaper log, baby activities, parenting tool",

    // Home Screen
    todaySummary: "Today's Summary",
    recentActivity: "Recent Activity",
    logActivity: "Log Activity",
    dataStoredLocally: "💡 Data stored locally only.",
    connectGoogleSheets: "Connect Google Sheets",
    hideNotice: "Hide",

    // Navigation
    navHome: "Home",
    navLog: "Log",
    navInsights: "Insights",
    navSettings: "Settings",

    // Log Screen
    logTitle: "📋 Log",
    filterByDate: "📅 Filter by Date:",
    clearFilter: "Clear Filter",
    all: "All",
    last: "Last",
    last3Days: "Last 3d",
    last7Days: "Last 7d",
    pickDate: "Pick Date",

    // Insights Screen
    insightsTitle: "📈 Insights",
    showActivities: "📊 Show Activities",
    showActivitiesDesc: "Select activities to include in the graphs below",
    todayActivity: "📅 Today's Activity",
    todayActivityDesc:
      "Shows activity breakdown for today with a quick overview of what's been logged so far",
    todayActivityTitle: "Today's Activity",
    sevenDayTrend: "📈 7-Day Trend",
    sevenDayTrendDesc:
      "Shows weekly patterns and changes to track how routines develop over the past week",
    sevenDayTrendTitle: "7-Day Trend",
    last24Hours: "🕑 Last 24 Hours",
    last24HoursDesc:
      "Shows hour-by-hour timeline to see exactly when activities happened throughout the day",
    last24HoursTitle: "24-Hour Timeline",
    timeBetweenActivities: "⏱️ Time Between Activities",
    timeBetweenActivitiesTitle: "Time Between Activities",
    timeBetweenActivitiesDesc:
      "Shows average time between same activities to help track feeding intervals, diaper timing, and sleep patterns",
    monthlyHabit: "📅 Monthly Activity Tracker",
    monthlyHabitDesc:
      "Track a single activity across the month to visualize patterns and build consistent habits",
    selectActivityToTrack: "Select activity to track:",
    noDataYet: "No Data Yet",
    noDataYetDesc:
      "Start logging activities to see insightful graphs and trends about your baby's routine.",

    // Settings Screen
    settingsTitle: "⚙️ Settings",
    googleSheetsSync: "☁️ Google Sheets Sync",
    connectedToSheets: "✓ Connected to Google Sheets",
    webAppUrl: "Web App URL",
    webAppUrlHint: "Leave blank for local-only storage.",
    webAppUrlPlaceholder: "Paste your Google Sheets Web App URL",
    paste: "Paste",
    connectAndSync: "Connect & Sync",
    syncing: "Syncing...",
    setupGuide: "Setup Guide",
    disconnect: "Disconnect",

    // Activity Types Section
    activityTypes: "📝 Activity Types",
    activityTypesDesc:
      "Customise the activities you want to track. Each activity has a name, emoji, and colour.",
    addNewActivity: "➕ Add New Activity",

    // Theme Section
    theme: "🎨 Theme",
    themeBlossom: "🌸 Blossom",
    themeComet: "☄️ Comet",
    themeMeadow: "🌿 Meadow",
    themeMidnight: "🌙 Midnight",

    // Font Section
    font: "🔤 Font",
    fontDesc: "Choose your preferred font style for better readability.",

    // Language Section
    language: "🌐 Language",
    languageDesc: "Choose your preferred language for the app.",
    languageEnglish: "English",
    languageFinnish: "Suomi (Finnish)",
    languageFarsi: "فارسی (Persian)",
    languageNote:
      "Note: Custom activities keep their creation name. Edit anytime in Activity Types above.",

    // Data Management Section
    dataManagement: "💾 Data Management",
    dataManagementDesc:
      "Export or import your complete data including settings.",
    exportData: "📥 Export Data",
    importData: "📤 Import Data",
    exportCSV: "📊 Export Your Data as CSV",

    // Tutorial Section
    tutorial: "🎓 Tutorial",
    tutorialDesc: "Learn how to use the app with an interactive guided tour.",
    startTutorial: "🎓 Start App Tutorial",
    restartWelcome: "� Restart App & Remove Data",
    resetApp: "🔄 Reset App",
    resetAppDesc:
      "Restart the welcome setup and clear all activity data. This cannot be undone.",
    restartAppConfirm:
      "This will delete ALL activity data and restart the app. This cannot be undone. Are you sure?",
    finish: "Finish",
    undo: "Undo",
    undid: "Undid",

    // About & Legal Section
    aboutLegal: "📋 About & Legal",
    aboutDesc:
      "I had to check my baby's bowel movements for a week, and I couldn't be bothered to pay three euros to buy an app. Which, in hindsight, I should have. So I spent an ungodly amount of time making this instead. Anyway, if you find yourself in a situation like this, you are welcome to use it, fork it, or adopt it in whatever way you like.",
    privacyPolicy: "Privacy Policy",
    githubRepo: "GitHub Repository",

    // Modals
    addActivity: "Add Activity",
    editActivity: "Edit Activity",
    activityName: "Activity Name",
    activityNamePlaceholder: "e.g., Sleep, Bath, Play",
    emoji: "Emoji",
    color: "Colour",
    cancel: "Cancel",
    save: "Save",

    // Disconnect Modal
    disconnectTitle: "Disconnect from Google Sheets",
    disconnectQuestion: "What would you like to do with your activity data?",
    keepDataLocally: "Keep Data Locally",
    keepDataLocallyDesc: "Your activities will remain on this device only",
    deleteAllData: "Delete All Data",
    deleteAllDataDesc: "Remove all activities and start fresh",

    // About Screen
    aboutAppTitle: "📋 About This App",
    whatIsThis: "What This App Is",
    whatIsThisDesc:
      "This is a completely static baby activity tracking app. No servers, no databases, no cloud services—everything runs locally in your browser.",
    yourDataPrivacy: "Your Data & Privacy",
    yourDataPrivacyDesc:
      "Your data never leaves your device. Everything is stored locally using your browser's storage.",
    noTracking: "No tracking, no analytics, no telemetry",
    noAccounts: "No user accounts or login required",
    noDataSent:
      "No data is sent to any servers (unless you connect Google Sheets sync)",
    worksOffline: "You can use this app completely offline",
    googleSheetsSyncOptional: "Google Sheets Sync (Optional)",
    googleSheetsSyncDesc:
      "If you choose to connect Google Sheets sync, your data will be sent to Google's servers through your own Google Apps Script. This is entirely optional and controlled by you.",
    openSource: "Open Source",
    openSourceDesc:
      "This app is open source. You can view the code, contribute, or run your own copy.",
    viewOnGithub: "View on GitHub →",

    // Setup Guide
    setupGuideTitle: "📖 Setup Guide",
    loadingDocumentation: "Loading documentation...",

    // Tutorial Wizard
    skip: "Skip",
    back: "Back",
    next: "Next",
    wizardWelcomeTitle: "Welcome! 👶",
    wizardWelcomeDesc: "Quick tour of your baby tracker.",
    wizardQuickActionsTitle: "Quick Actions",
    wizardQuickActionsDesc:
      "Tap the + button to open the menu and log activities.",
    wizardTodaySummaryTitle: "Today's Summary",
    wizardTodaySummaryDesc: "View totals and time since last activity.",
    wizardActivityLogTitle: "Activity Log",
    wizardActivityLogDesc: "See all entries, filter by date, delete if needed.",
    wizardInsightsTitle: "Insights",
    wizardInsightsDesc: "Charts showing patterns and trends.",
    wizardSettingsTitle: "Settings",
    wizardSettingsDesc: "Themes, custom activities, sync & export.",
    wizardGoogleSheetsTitle: "Google Sheets Sync",
    wizardGoogleSheetsDesc:
      "Sync across devices with Google Sheets. Check the Setup Guide for instructions.",
    wizardAllSetTitle: "All Set! 🎉",
    wizardAllSetDesc: "Start tracking now. Replay from Settings anytime.",

    // Toast Messages
    logged: "logged",
    updated: "updated",

    // Log Summary/Overview
    overview: "Overview",
    total: "Total",
    today: "Today",
    timelineTitle: "{count} activities today",
    dayStreak: "Day Streak",
    most: "Most",
    lastActivityTimes: "Last Activity Times",
    noData: "—",

    // Log Entries
    edit: "Edit",
    editEntry: "Edit Entry",
    logPastEntry: "Log Past Entry",
    manageActivities: "Manage Activities",
    logEntry: "Log Entry",
    activityType: "Activity Type",
    date: "Date",
    time: "Time",
    note: "Note",
    notePlaceholder: "Optional note...",
    delete: "Delete",
    noEntriesToExport: "No entries to export",
    noEntriesYet: "No entries yet",
    showing: "Showing",
    entries: "entries",
    fillAllFields: "Please fill all required fields",
    entryNotFound: "Entry not found",
    cannotLogFuture: "Cannot log future entries",

    // Home Screen Today Summary
    todayLabel: "Today:",
    todayNone: "Today: —",
    noActivityYet: "No activity yet",

    // Intervals
    intervals: "intervals",
    notEnoughData: "Not enough data",
    needMoreActivities: "Need more activities to show intervals",

    // Activity Suggestions
    sleep: "Sleep",
    bath: "Bath",
    play: "Play",
    tummyTime: "Tummy Time",
    medicine: "Medicine",
    walk: "Walk",
    doctorVisit: "Doctor Visit",
    cry: "Cry",
    massage: "Massage",
    storyTime: "Story Time",
    music: "Music",
    carRide: "Car Ride",
    cuddle: "Cuddle",
    weightCheck: "Weight Check",
    temperature: "Temperature",
    teeth: "Teeth",
    stroller: "Stroller",
    visitor: "Visitor",
    photo: "Photo",
    milestone: "Milestone",

    // Help/Setup Guide
    loadingGuide: "Loading guide...",
    googleSheetsSyncSetup: "📖 Google Sheets Sync Setup",
    unableToLoadGuide:
      "Unable to load user guide. Please check USER_GUIDE.md file.",
    setupSteps: "For Google Sheets sync setup:",
    setupStep1: "1. Create a Google Sheet with headers",
    setupStep2: "2. Add Apps Script (Extensions → Apps Script)",
    setupStep3: "3. Deploy as Web App (Anyone access)",
    setupStep4: "4. Paste URL in Settings and click Connect & Sync",
    appsScriptCopied: "📋 Apps Script code copied to clipboard",
    failedToCopy: "❌ Failed to copy to clipboard",
    copied: "✓ Copied!",

    // Default Activity Types
    feed: "Feed",
    pee: "Pee",
    poop: "Poop",

    // Welcome/Onboarding
    welcomeTitle: "Welcome to",
    welcomeLanguageDesc: "Let's start by choosing your preferred language",
    welcomeActivitiesTitle: "Choose Activities to Track",
    welcomeActivitiesDesc: "Start with these common activities",
    welcomeActivitiesInfoTitle: "Track whatever you want!",
    welcomeActivitiesInfoDesc:
      "You can add, remove, and customise activities anytime in Settings → Activity Types.",
    welcomeThemeTitle: "Choose Your Theme",
    welcomeThemeDesc: "Pick a colour scheme that suits your style",
    welcomeFontTitle: "Choose Your Font",
    welcomeFontDesc: "Select a font that's comfortable for you to read",
    welcomeTutorialTitle: "Would You Like a Tutorial?",
    welcomeTutorialDesc:
      "Take a quick tour to learn the features, or explore on your own. All settings can be changed in Settings anytime.",
    welcomeTutorialYes: "Yes, Show Me Around",
    welcomeTutorialYesDesc: "Take a quick tour to learn all the features",
    welcomeTutorialNo: "I'll Explore Myself",
    welcomeTutorialNoDesc: "Jump right in and start tracking",
    welcomeSettingsReminder:
      "💡 You can change all these settings anytime in the Settings tab",
    welcomeGetStarted: "🚀 Get Started!",
  },

  fi: {
    // Meta tags
    pageTitle: "Vauvan Aikataulu - Seuraa Vauvasi Toimintoja",
    pageDescription:
      "Yksinkertainen vauvan toimintojen seurantatyökalu. Kirjaa ruokailut, vaipanvaihdot ja muut toiminnot. Toimii offline-tilassa ja synkronoi Google Sheetsin kanssa.",
    pageKeywords:
      "vauvan seuranta, vauvan loki, ruokailun seuranta, vaippaloki, vauvan toiminnot, vanhemmuustyökalu",

    // Home Screen
    todaySummary: "Tämän Päivän Yhteenveto",
    recentActivity: "Viimeisimmät Toiminnot",
    logActivity: "Kirjaa Toiminto",
    dataStoredLocally: "💡 Tiedot tallennettu vain paikallisesti.",
    connectGoogleSheets: "Yhdistä Google Sheets",
    hideNotice: "Piilota",

    // Navigation
    navHome: "Koti",
    navLog: "Loki",
    navInsights: "Tilastot",
    navSettings: "Asetukset",

    // Log Screen
    logTitle: "📋 Loki",
    filterByDate: "📅 Suodata Päivämäärän Mukaan:",
    clearFilter: "Tyhjennä Suodatin",
    all: "Kaikki",
    last: "Viimeiset",
    last3Days: "Viimeiset 3 pv",
    last7Days: "Viimeiset 7 pv",
    pickDate: "Valitse Päivä",

    // Insights Screen
    insightsTitle: "📈 Tilastot",
    showActivities: "📊 Näytä Toiminnot",
    showActivitiesDesc: "Valitse kaavioihin sisällytettävät toiminnot",
    todayActivity: "📅 Tämän Päivän Toiminta",
    todayActivityDesc:
      "Näyttää tämän päivän toimintojen jakauman ja nopean yleiskatsauksen kirjatuista toiminnoista",
    todayActivityTitle: "Tämän Päivän Toiminta",
    sevenDayTrend: "📈 7 Päivän Trendi",
    sevenDayTrendDesc:
      "Näyttää viikottaiset mallit ja muutokset rutiinien kehityksen seuraamiseksi viimeisen viikon aikana",
    sevenDayTrendTitle: "7 Päivän Trendi",
    last24Hours: "🕑 Viimeiset 24 Tuntia",
    last24HoursDesc:
      "Näyttää tuntikohtaisen aikajanan nähdäksesi tarkalleen milloin toimintoja tapahtui päivän aikana",
    last24HoursTitle: "24 Tunnin Aikajana",
    timeBetweenActivities: "⏱️ Aika Toimintojen Välillä",
    timeBetweenActivitiesTitle: "Aika Toimintojen Välillä",
    timeBetweenActivitiesDesc:
      "Näyttää keskimääräisen ajan samojen toimintojen välillä ruokailuväliaikojen, vaipan vaihtojen ja unirytmien seuraamiseksi",
    monthlyHabit: "📅 Kuukauden Aktiviteettiseuranta",
    monthlyHabitDesc:
      "Seuraa yhtä toimintoa koko kuukauden ajan visualisoidaksesi kaavoja ja rakentaaksesi johdonmukaisia tapoja",
    selectActivityToTrack: "Valitse seurattava toiminto:",
    noDataYet: "Ei Vielä Tietoja",
    noDataYetDesc:
      "Aloita toimintojen kirjaaminen nähdäksesi oivaltavia kaavioita ja trendejä vauvasi rutiineista.",

    // Settings Screen
    settingsTitle: "⚙️ Asetukset",
    googleSheetsSync: "☁️ Google Sheets Synkronointi",
    connectedToSheets: "✓ Yhdistetty Google Sheetsiin",
    webAppUrl: "Web App URL",
    webAppUrlHint: "Jätä tyhjäksi vain paikalliseen tallennukseen.",
    webAppUrlPlaceholder: "Liitä Google Sheets Web App URL",
    paste: "Liitä",
    connectAndSync: "Yhdistä & Synkronoi",
    syncing: "Synkronoidaan...",
    setupGuide: "Asennusopas",
    disconnect: "Katkaise Yhteys",

    // Activity Types Section
    activityTypes: "📝 Toimintotyypit",
    activityTypesDesc:
      "Mukauta seurattavat toiminnot. Jokaisella toiminnolla on nimi, emoji ja väri.",
    addNewActivity: "➕ Lisää Uusi Toiminto",

    // Theme Section
    theme: "🎨 Teema",
    themeBlossom: "🌸 Kukinto",
    themeComet: "☄️ Komeetta",
    themeMeadow: "🌿 Niitty",
    themeMidnight: "🌙 Keskiyö",

    // Font Section
    font: "🔤 Fontti",
    fontDesc:
      "Valitse haluamasi fonttityyli paremman luettavuuden saavuttamiseksi.",

    // Language Section
    language: "🌐 Kieli",
    languageDesc: "Valitse sovelluksen kieli.",
    languageEnglish: "English (Englanti)",
    languageFinnish: "Suomi",
    languageFarsi: "فارسی (persia)",
    languageNote:
      "Huom: Mukautetut toiminnot säilyttävät luontihetken nimen. Muokkaa koska tahansa Toimintotyypit-osiossa.",

    // Data Management Section
    dataManagement: "💾 Tietojen Hallinta",
    dataManagementDesc: "Vie tai tuo kaikki tietosi mukaan lukien asetukset.",
    exportData: "📥 Vie Tiedot",
    importData: "📤 Tuo Tiedot",
    exportCSV: "📊 Vie Tietosi CSV-muodossa",

    // Tutorial Section
    tutorial: "🎓 Opastus",
    tutorialDesc:
      "Opi käyttämään sovellusta interaktiivisen ohjatun kierroksen avulla.",
    startTutorial: "🎓 Aloita Sovelluksen Opastus",
    restartWelcome: "🔄 Käynnistä Sovellus Uudelleen & Poista Tiedot",
    resetApp: "🔄 Nollaa Sovellus",
    resetAppDesc:
      "Käynnistä tervetuloasetukset uudelleen ja poista kaikki toimintatiedot. Tätä ei voi kumota.",
    restartAppConfirm:
      "Tämä poistaa KAIKKI toimintatiedot ja käynnistää sovelluksen uudelleen. Tätä ei voi kumota. Oletko varma?",
    finish: "Valmis",
    undo: "Kumoa",
    undid: "Kumottiin",

    // About & Legal Section
    aboutLegal: "📋 Tietoa & Laki",
    aboutDesc:
      "Minun piti tarkkailla vauvani ulostamista viikon ajan, enkä jaksanut maksaa kolmea euroa sovelluksen ostamisesta. Jälkikäteen ajateltuna olisin pitänyt. Joten käytin järjettömästi aikaa tämän tekemiseen. Joka tapauksessa, jos joudut vastaavaan tilanteeseen, voit vapaasti käyttää, forkata tai omaksua tämän haluamallasi tavalla.",
    privacyPolicy: "Tietosuojakäytäntö",
    githubRepo: "GitHub Tietovarasto",

    // Modals
    addActivity: "Lisää Toiminto",
    editActivity: "Muokkaa Toimintoa",
    activityName: "Toiminnon Nimi",
    activityNamePlaceholder: "esim. Uni, Kylpy, Leikki",
    emoji: "Emoji",
    color: "Väri",
    cancel: "Peruuta",
    save: "Tallenna",

    // Disconnect Modal
    disconnectTitle: "Katkaise Yhteys Google Sheetsiin",
    disconnectQuestion: "Mitä haluat tehdä toimintotiedoillesi?",
    keepDataLocally: "Säilytä Tiedot Paikallisesti",
    keepDataLocallyDesc: "Toimintosi säilyvät vain tällä laitteella",
    deleteAllData: "Poista Kaikki Tiedot",
    deleteAllDataDesc: "Poista kaikki toiminnot ja aloita alusta",

    // About Screen
    aboutAppTitle: "📋 Tietoa Sovelluksesta",
    whatIsThis: "Mikä Tämä Sovellus On",
    whatIsThisDesc:
      "Tämä on täysin staattinen vauvan toimintojen seurantasovellus. Ei palvelimia, ei tietokantoja, ei pilvipalveluita—kaikki toimii paikallisesti selaimessasi.",
    yourDataPrivacy: "Tietosi & Yksityisyys",
    yourDataPrivacyDesc:
      "Tietosi eivät poistu laitteeltasi. Kaikki tallennetaan paikallisesti selaimesi tallennustilaan.",
    noTracking: "Ei seurantaa, ei analytiikkaa, ei telemetriaa",
    noAccounts: "Ei käyttäjätilejä tai kirjautumista tarvita",
    noDataSent:
      "Tietoja ei lähetetä mihinkään palvelimiin (ellet yhdistä Google Sheets synkronointia)",
    worksOffline: "Voit käyttää tätä sovellusta täysin offline-tilassa",
    googleSheetsSyncOptional: "Google Sheets Synkronointi (Valinnainen)",
    googleSheetsSyncDesc:
      "Jos päätät yhdistää Google Sheets synkronoinnin, tietosi lähetetään Googlen palvelimille oman Google Apps Script -skriptisi kautta. Tämä on täysin valinnaista ja sinun hallinnassasi.",
    openSource: "Avoimen Lähdekoodin",
    openSourceDesc:
      "Tämä sovellus on avoimen lähdekoodin. Voit tarkastella koodia, osallistua tai ajaa omaa kopiotasi.",
    viewOnGithub: "Katso GitHubissa →",

    // Setup Guide
    setupGuideTitle: "📖 Asennusopas",
    loadingDocumentation: "Ladataan dokumentaatiota...",

    // Tutorial Wizard
    skip: "Ohita",
    back: "Takaisin",
    next: "Seuraava",
    wizardWelcomeTitle: "Tervetuloa! 👶",
    wizardWelcomeDesc: "Nopea kierros vauvaseurantasovelluksestasi.",
    wizardQuickActionsTitle: "Pikatoiminnot",
    wizardQuickActionsDesc:
      "Napauta + -painiketta avataksesi valikon ja kirjataksesi toimintoja.",
    wizardTodaySummaryTitle: "Tämän Päivän Yhteenveto",
    wizardTodaySummaryDesc:
      "Katso kokonaismäärät ja aika viimeisestä toiminnasta.",
    wizardActivityLogTitle: "Toimintaloki",
    wizardActivityLogDesc:
      "Näe kaikki merkinnät, suodata päivämäärän mukaan, poista tarvittaessa.",
    wizardInsightsTitle: "Tilastot",
    wizardInsightsDesc: "Kaaviot, jotka näyttävät malleja ja trendejä.",
    wizardSettingsTitle: "Asetukset",
    wizardSettingsDesc: "Teemat, mukautetut toiminnot, synkronointi ja vienti.",
    wizardGoogleSheetsTitle: "Google Sheets Synkronointi",
    wizardGoogleSheetsDesc:
      "Synkronoi laitteiden välillä Google Sheetsin avulla. Tarkista Asennusopas ohjeet varten.",
    wizardAllSetTitle: "Kaikki Valmista! 🎉",
    wizardAllSetDesc:
      "Aloita seuranta nyt. Toista Asetuksista milloin tahansa.",

    // Toast Messages
    logged: "kirjattu",
    updated: "päivitetty",

    // Log Summary/Overview
    overview: "Yleiskatsaus",
    total: "Yhteensä",
    today: "Tänään",
    timelineTitle: "{count} toimintoa tänään",
    dayStreak: "Päivän Putki",
    most: "Eniten",
    lastActivityTimes: "Viimeisimmät Toiminta-ajat",
    noData: "—",

    // Log Entries
    edit: "Muokkaa",
    editEntry: "Muokkaa Merkintää",
    logPastEntry: "Kirjaa Aikaisempi Merkintä",
    manageActivities: "Hallinnoi Toimintoja",
    logEntry: "Kirjaa Merkintä",
    activityType: "Toiminnan Tyyppi",
    date: "Päivämäärä",
    time: "Aika",
    note: "Huomautus",
    notePlaceholder: "Valinnainen huomautus...",
    delete: "Poista",
    noEntriesToExport: "Ei merkintöjä vietäväksi",
    noEntriesYet: "Ei vielä merkintöjä",
    showing: "Näytetään",
    entries: "merkintää",
    fillAllFields: "Täytä kaikki pakolliset kentät",
    entryNotFound: "Merkintää ei löytynyt",
    cannotLogFuture: "Ei voi kirjata tulevia merkintöjä",

    // Home Screen Today Summary
    todayLabel: "Tänään:",
    todayNone: "Tänään: —",
    noActivityYet: "Ei vielä toimintaa",

    // Intervals
    intervals: "välit",
    notEnoughData: "Ei tarpeeksi dataa",
    needMoreActivities: "Tarvitaan lisää toimintoja välien näyttämiseen",

    // Activity Suggestions
    sleep: "Uni",
    bath: "Kylpy",
    play: "Leikki",
    tummyTime: "Vatsallaan Aika",
    medicine: "Lääke",
    walk: "Kävely",
    doctorVisit: "Lääkärissa",
    cry: "Itku",
    massage: "Hieronta",
    storyTime: "Satuhetki",
    music: "Musiikki",
    carRide: "Autokyyti",
    cuddle: "Halaus",
    weightCheck: "Punnituspuntari",
    temperature: "Lämpötila",
    teeth: "Hampaat",
    stroller: "Rattaat",
    visitor: "Vierailija",
    photo: "Valokuva",
    milestone: "Virstanpylväs",

    // Help/Setup Guide
    loadingGuide: "Ladataan opasta...",
    googleSheetsSyncSetup: "📖 Google Sheets Synkronoinnin Asennus",
    unableToLoadGuide:
      "Oppaan lataaminen epäonnistui. Tarkista USER_GUIDE.md tiedosto.",
    setupSteps: "Google Sheets synkronoinnin asennus:",
    setupStep1: "1. Luo Google Sheet otsikkoriveillä",
    setupStep2: "2. Lisää Apps Script (Laajennukset → Apps Script)",
    setupStep3: "3. Ota käyttöön Web App (Kaikille pääsy)",
    setupStep4: "4. Liitä URL Asetuksiin ja klikkaa Yhdistä & Synkronoi",
    appsScriptCopied: "📋 Apps Script koodi kopioitu leikepöydälle",
    failedToCopy: "❌ Kopiointi leikepöydälle epäonnistui",
    copied: "✓ Kopioitu!",

    // Default Activity Types
    feed: "Ruokailu",
    pee: "Pissa",
    poop: "Kakka",

    // Welcome/Onboarding
    welcomeTitle: "Tervetuloa",
    welcomeLanguageDesc: "Aloitetaan valitsemalla haluamasi kieli",
    welcomeActivitiesTitle: "Valitse Seurattavat Toiminnot",
    welcomeActivitiesDesc: "Aloita näillä yleisillä toiminnoilla",
    welcomeActivitiesInfoTitle: "Seuraa mitä haluat!",
    welcomeActivitiesInfoDesc:
      "Voit lisätä, poistaa ja muokata toimintoja milloin tahansa kohdassa Asetukset → Toimintotyypit.",
    welcomeThemeTitle: "Valitse Teemasi",
    welcomeThemeDesc: "Valitse värimaailma, joka sopii tyyliisi",
    welcomeFontTitle: "Valitse Fonttisi",
    welcomeFontDesc: "Valitse fontti, joka on sinulle mukava lukea",
    welcomeTutorialTitle: "Haluatko Opastuksen?",
    welcomeTutorialDesc:
      "Tee pikakierros oppiaksesi ominaisuudet tai tutki itse. Kaikki asetukset voi muuttaa Asetuksissa.",
    welcomeTutorialYes: "Kyllä, Näytä Minulle",
    welcomeTutorialYesDesc: "Tee pikakierros oppiaksesi kaikki ominaisuudet",
    welcomeTutorialNo: "En, Tutkin Itse",
    welcomeTutorialNoDesc: "Hyppää suoraan sisään ja aloita seuranta",
    welcomeSettingsReminder:
      "💡 Voit muuttaa kaikkia näitä asetuksia milloin tahansa Asetukset-välilehdessä",
    welcomeGetStarted: "🚀 Aloita!",
  },

  fa: {
    // Meta tags
    pageTitle: "لیتل اجندا - پیگیری فعالیت های نوزاد",
    pageDescription:
      "پیگیر ساده فعالیت های نوزاد. تغذیه، تعویض پوشک و سایر فعالیت ها را ثبت کنید. آفلاین کار می کند و با Google Sheets همگام می شود.",
    pageKeywords:
      "پیگیری نوزاد, ثبت نوزاد, پیگیری تغذیه, پوشک, فعالیت های نوزاد, ابزار والدین",

    // Home Screen
    todaySummary: "خلاصه امروز",
    recentActivity: "فعالیت های اخیر",
    logActivity: "ثبت فعالیت",
    dataStoredLocally: "💡 داده ها فقط به صورت محلی ذخیره می شوند.",
    connectGoogleSheets: "اتصال به Google Sheets",
    hideNotice: "پنهان کردن",

    // Navigation
    navHome: "خانه",
    navLog: "ثبت",
    navInsights: "آمار",
    navSettings: "تنظیمات",

    // Log Screen
    logTitle: "📋 ثبت",
    filterByDate: "📅 فیلتر بر اساس تاریخ:",
    clearFilter: "پاک کردن فیلتر",
    all: "همه",
    last: "آخرین",
    last3Days: "آخرین ۳ روز",
    last7Days: "آخرین ۷ روز",
    pickDate: "انتخاب تاریخ",

    // Insights Screen
    insightsTitle: "📈 آمار",
    showActivities: "📊 نمایش فعالیت ها",
    showActivitiesDesc: "فعالیت هایی را برای نمودارها انتخاب کنید",
    todayActivity: "📅 فعالیت امروز",
    todayActivityDesc:
      "نمایش نمای کلی فعالیت های امروز و آنچه تا حالا ثبت شده است",
    todayActivityTitle: "فعالیت امروز",
    sevenDayTrend: "📈 روند ۷ روزه",
    sevenDayTrendDesc:
      "نمایش الگوهای هفتگی و تغییرات برای پیگیری روند های اخیر",
    sevenDayTrendTitle: "روند ۷ روزه",
    last24Hours: "🕑 ۲۴ ساعت اخیر",
    last24HoursDesc:
      "نمایش خط زمانی ساعتی برای دیدن زمان دقیق فعالیت ها در طول روز",
    last24HoursTitle: "خط زمانی ۲۴ ساعته",
    timeBetweenActivities: "⏱️ فاصله بین فعالیت ها",
    timeBetweenActivitiesTitle: "فاصله بین فعالیت ها",
    timeBetweenActivitiesDesc:
      "نمایش میانگین فاصله زمانی بین فعالیت های مشابه برای پیگیری تغذیه، پوشک و خواب",
    monthlyHabit: "📅 پیگیری فعالیت ماهانه",
    monthlyHabitDesc:
      "یک فعالیت را در طول ماه پیگیری کنید تا الگوها را ببینید و عادت ها را پایدار کنید",
    selectActivityToTrack: "انتخاب فعالیت برای پیگیری:",
    noDataYet: "هنوز داده ای نیست",
    noDataYetDesc: "برای دیدن نمودارها و روندها، شروع به ثبت فعالیت ها کنید.",

    // Settings Screen
    settingsTitle: "⚙️ تنظیمات",
    googleSheetsSync: "☁️ همگام سازی Google Sheets",
    connectedToSheets: "✓ به Google Sheets متصل است",
    webAppUrl: "آدرس وب اپ",
    webAppUrlHint: "برای ذخیره محلی خالی بگذارید.",
    webAppUrlPlaceholder: "آدرس وب اپ Google Sheets را جایگذاری کنید",
    paste: "چسباندن",
    connectAndSync: "اتصال و همگام سازی",
    syncing: "در حال همگام سازی...",
    setupGuide: "راهنمای راه اندازی",
    disconnect: "قطع اتصال",

    // Activity Types Section
    activityTypes: "📝 نوع فعالیت ها",
    activityTypesDesc:
      "فعالیت هایی را که می خواهید پیگیری کنید سفارشی کنید. هر فعالیت نام، ایموجی و رنگ دارد.",
    addNewActivity: "➕ افزودن فعالیت جدید",

    // Theme Section
    theme: "🎨 تم",
    themeBlossom: "🌸 شکوفه",
    themeComet: "☄️ دنباله دار",
    themeMeadow: "🌿 چمنزار",
    themeMidnight: "🌙 نیمه شب",

    // Font Section
    font: "🔤 فونت",
    fontDesc: "فونت دلخواه برای خوانایی بهتر را انتخاب کنید.",

    // Language Section
    language: "🌐 زبان",
    languageDesc: "زبان دلخواه برنامه را انتخاب کنید.",
    languageEnglish: "English",
    languageFinnish: "Suomi",
    languageFarsi: "فارسی",
    languageNote:
      "نکته: فعالیت های سفارشی نام زمان ایجاد را حفظ می کنند. هر زمان در بخش نوع فعالیت ها ویرایش کنید.",

    // Data Management Section
    dataManagement: "💾 مدیریت داده ها",
    dataManagementDesc: "داده ها و تنظیمات را صادر یا وارد کنید.",
    exportData: "📥 خروجی گرفتن از داده ها",
    importData: "📤 وارد کردن داده ها",
    exportCSV: "📊 خروجی CSV",

    // Tutorial Section
    tutorial: "🎓 آموزش",
    tutorialDesc: "با یک راهنمای تعاملی یاد بگیرید.",
    startTutorial: "🎓 شروع آموزش برنامه",
    restartWelcome: "🔄 راه اندازی دوباره و حذف داده ها",
    resetApp: "🔄 بازنشانی برنامه",
    resetAppDesc:
      "راه اندازی اولیه را دوباره اجرا و همه داده ها را پاک می کند. این قابل بازگشت نیست.",
    restartAppConfirm:
      "این کار همه داده ها را حذف و برنامه را بازنشانی می کند. مطمئن هستید؟",
    finish: "پایان",
    undo: "برگشت",
    undid: "برگشت داده شد",

    // About & Legal Section
    aboutLegal: "📋 درباره و حقوقی",
    aboutDesc:
      "یک هفته باید حرکات روده نوزادم را بررسی می کردم و حوصله پرداخت سه یورو برای خرید یک برنامه را نداشتم. که البته بعدا فهمیدم باید می خریدم. پس وقت زیادی گذاشتم و این را ساختم. اگر شما هم در چنین موقعیتی هستید، می توانید از آن استفاده کنید، فورک کنید یا هر طور دوست دارید به کار بگیرید.",
    privacyPolicy: "سیاست حریم خصوصی",
    githubRepo: "مخزن GitHub",

    // Modals
    addActivity: "افزودن فعالیت",
    editActivity: "ویرایش فعالیت",
    activityName: "نام فعالیت",
    activityNamePlaceholder: "مثلا خواب، حمام، بازی",
    emoji: "ایموجی",
    color: "رنگ",
    cancel: "لغو",
    save: "ذخیره",

    // Disconnect Modal
    disconnectTitle: "قطع اتصال از Google Sheets",
    disconnectQuestion: "با داده های فعالیت چه می خواهید انجام دهید؟",
    keepDataLocally: "نگه داشتن داده ها به صورت محلی",
    keepDataLocallyDesc: "فعالیت ها فقط روی این دستگاه می مانند",
    deleteAllData: "حذف همه داده ها",
    deleteAllDataDesc: "همه فعالیت ها را حذف و از نو شروع کنید",

    // About Screen
    aboutAppTitle: "📋 درباره این برنامه",
    whatIsThis: "این برنامه چیست",
    whatIsThisDesc:
      "این یک برنامه کاملا استاتیک برای پیگیری فعالیت های نوزاد است. بدون سرور، بدون پایگاه داده و بدون سرویس ابری — همه چیز در مرورگر شما اجرا می شود.",
    yourDataPrivacy: "داده های شما و حریم خصوصی",
    yourDataPrivacyDesc:
      "داده های شما از دستگاه خارج نمی شوند. همه چیز به صورت محلی در مرورگر ذخیره می شود.",
    noTracking: "بدون ردیابی، بدون تحلیل، بدون تله متری",
    noAccounts: "نیازی به حساب کاربری یا ورود نیست",
    noDataSent:
      "هیچ داده ای به سرور ارسال نمی شود (مگر اینکه همگام سازی Google Sheets را فعال کنید)",
    worksOffline: "می توانید کاملا آفلاین از برنامه استفاده کنید",
    googleSheetsSyncOptional: "همگام سازی Google Sheets (اختیاری)",
    googleSheetsSyncDesc:
      "اگر همگام سازی Google Sheets را فعال کنید، داده های شما از طریق Apps Script شما به سرورهای گوگل ارسال می شوند. این کاملا اختیاری و تحت کنترل شماست.",
    openSource: "متن باز",
    openSourceDesc:
      "این برنامه متن باز است. می توانید کد را ببینید، مشارکت کنید یا نسخه خودتان را اجرا کنید.",
    viewOnGithub: "مشاهده در GitHub →",

    // Setup Guide
    setupGuideTitle: "📖 راهنمای راه اندازی",
    loadingDocumentation: "در حال بارگذاری مستندات...",

    // Tutorial Wizard
    skip: "رد کردن",
    back: "بازگشت",
    next: "بعدی",
    wizardWelcomeTitle: "خوش آمدید! 👶",
    wizardWelcomeDesc: "تور کوتاه برنامه پیگیری نوزاد.",
    wizardQuickActionsTitle: "اقدامات سریع",
    wizardQuickActionsDesc:
      "برای باز کردن منو و ثبت فعالیت ها، دکمه + را بزنید.",
    wizardTodaySummaryTitle: "خلاصه امروز",
    wizardTodaySummaryDesc: "مشاهده مجموع ها و زمان از آخرین فعالیت.",
    wizardActivityLogTitle: "ثبت فعالیت ها",
    wizardActivityLogDesc:
      "همه ورودی ها را ببینید، با تاریخ فیلتر کنید و حذف کنید.",
    wizardInsightsTitle: "آمار",
    wizardInsightsDesc: "نمودارهایی که الگوها و روندها را نشان می دهند.",
    wizardSettingsTitle: "تنظیمات",
    wizardSettingsDesc: "تم ها، فعالیت های سفارشی، همگام سازی و خروجی.",
    wizardGoogleSheetsTitle: "همگام سازی Google Sheets",
    wizardGoogleSheetsDesc:
      "با Google Sheets بین دستگاه ها همگام کنید. راهنما را برای دستورالعمل ها ببینید.",
    wizardAllSetTitle: "همه چیز آماده است! 🎉",
    wizardAllSetDesc:
      "همین حالا پیگیری را شروع کنید. هر زمان از تنظیمات تکرار کنید.",

    // Toast Messages
    logged: "ثبت شد",
    updated: "به روز شد",

    // Log Summary/Overview
    overview: "خلاصه",
    total: "مجموع",
    today: "امروز",
    timelineTitle: "امروز {count} فعالیت",
    dayStreak: "رکورد روزانه",
    most: "بیشترین",
    lastActivityTimes: "زمان های آخرین فعالیت",
    noData: "—",

    // Log Entries
    edit: "ویرایش",
    editEntry: "ویرایش ورودی",
    logPastEntry: "ثبت ورودی قبلی",
    manageActivities: "مدیریت فعالیت ها",
    logEntry: "ثبت ورودی",
    activityType: "نوع فعالیت",
    date: "تاریخ",
    time: "زمان",
    note: "یادداشت",
    notePlaceholder: "یادداشت اختیاری...",
    delete: "حذف",
    noEntriesToExport: "ورودی برای خروجی وجود ندارد",
    noEntriesYet: "هنوز ورودی وجود ندارد",
    showing: "نمایش",
    entries: "ورودی",
    fillAllFields: "همه فیلدهای لازم را پر کنید",
    entryNotFound: "ورودی پیدا نشد",
    cannotLogFuture: "نمی توان برای آینده ثبت کرد",

    // Home Screen Today Summary
    todayLabel: "امروز:",
    todayNone: "امروز: —",
    noActivityYet: "هنوز فعالیتی ثبت نشده",

    // Intervals
    intervals: "فاصله ها",
    notEnoughData: "داده کافی نیست",
    needMoreActivities: "برای نمایش فاصله ها فعالیت های بیشتری لازم است",

    // Activity Suggestions
    sleep: "خواب",
    bath: "حمام",
    play: "بازی",
    tummyTime: "تمرین شکم",
    medicine: "دارو",
    walk: "پیاده روی",
    doctorVisit: "ویزیت پزشک",
    cry: "گریه",
    massage: "ماساژ",
    storyTime: "قصه",
    music: "موسیقی",
    carRide: "سواری با ماشین",
    cuddle: "بغل",
    weightCheck: "بررسی وزن",
    temperature: "دما",
    teeth: "دندان",
    stroller: "کالسکه",
    visitor: "مهمان",
    photo: "عکس",
    milestone: "نقطه عطف",

    // Help/Setup Guide
    loadingGuide: "در حال بارگذاری راهنما...",
    googleSheetsSyncSetup: "📖 راه اندازی همگام سازی Google Sheets",
    unableToLoadGuide:
      "امکان بارگذاری راهنما نیست. لطفا فایل USER_GUIDE.md را بررسی کنید.",
    setupSteps: "برای راه اندازی همگام سازی Google Sheets:",
    setupStep1: "1. یک Google Sheet با سرستون ها بسازید",
    setupStep2: "2. Apps Script اضافه کنید (Extensions → Apps Script)",
    setupStep3: "3. به عنوان Web App انتشار دهید (دسترسی برای همه)",
    setupStep4: "4. آدرس را در تنظیمات قرار دهید و اتصال را بزنید",
    appsScriptCopied: "📋 کد Apps Script به کلیپ بورد کپی شد",
    failedToCopy: "❌ کپی به کلیپ بورد ناموفق بود",
    copied: "✓ کپی شد!",

    // Default Activity Types
    feed: "تغذیه",
    pee: "ادرار",
    poop: "مدفوع",

    // Welcome/Onboarding
    welcomeTitle: "خوش آمدید به",
    welcomeLanguageDesc: "بیایید با انتخاب زبان دلخواه شروع کنیم",
    welcomeActivitiesTitle: "فعالیت های مورد نظر را انتخاب کنید",
    welcomeActivitiesDesc: "با این فعالیت های رایج شروع کنید",
    welcomeActivitiesInfoTitle: "هر چه می خواهید پیگیری کنید!",
    welcomeActivitiesInfoDesc:
      "می توانید هر زمان در تنظیمات → نوع فعالیت ها، فعالیت ها را اضافه، حذف یا ویرایش کنید.",
    welcomeThemeTitle: "تم خود را انتخاب کنید",
    welcomeThemeDesc: "رنگ بندی مناسب سلیقه تان را انتخاب کنید",
    welcomeFontTitle: "فونت خود را انتخاب کنید",
    welcomeFontDesc: "فونتی که برایتان راحت است انتخاب کنید",
    welcomeTutorialTitle: "آیا آموزش می خواهید؟",
    welcomeTutorialDesc:
      "یک تور کوتاه برای آشنایی یا خودتان ادامه دهید. همه تنظیمات در تنظیمات قابل تغییر است.",
    welcomeTutorialYes: "بله، به من نشان بده",
    welcomeTutorialYesDesc: "تور کوتاه برای آشنایی با همه ویژگی ها",
    welcomeTutorialNo: "خودم بررسی می کنم",
    welcomeTutorialNoDesc: "مستقیما شروع به پیگیری کنید",
    welcomeSettingsReminder:
      "💡 همه این تنظیمات را هر زمان در تب تنظیمات می توانید تغییر دهید",
    welcomeGetStarted: "🚀 شروع کنیم!",
  },
};

// Get current language from localStorage or default to English
function getCurrentLanguage() {
  try {
    const settings = JSON.parse(
      localStorage.getItem("babylog.settings.v1") || "{}",
    );
    return settings.language || "en";
  } catch {
    return "en";
  }
}

// Get translation for a key
function t(key) {
  const lang = getCurrentLanguage();
  return translations[lang]?.[key] || translations.en[key] || key;
}

// Update all translatable elements on the page
function updatePageTranslations() {
  const lang = getCurrentLanguage();

  // Update document title and meta tags
  document.title = t("pageTitle");
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute("content", t("pageDescription"));
  document
    .querySelector('meta[name="keywords"]')
    ?.setAttribute("content", t("pageKeywords"));

  // Update all elements with data-i18n attribute
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const translation = t(key);

    // Check if element has data-i18n-attr to update specific attribute
    const attr = el.getAttribute("data-i18n-attr");
    if (attr) {
      el.setAttribute(attr, translation);
    } else {
      // Update text content by default
      el.textContent = translation;
    }
  });

  // Update HTML lang attribute
  document.documentElement.lang =
    lang === "fi" ? "fi" : lang === "fa" ? "fa" : "en";
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
}

// Export functions for use in app.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    translations,
    getCurrentLanguage,
    t,
    updatePageTranslations,
  };
}
