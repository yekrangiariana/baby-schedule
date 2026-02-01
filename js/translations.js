// Translation system for Baby Schedule App
// Add new languages by adding a new key to the translations object

const translations = {
  en: {
    // Meta tags
    pageTitle: "Baby Schedule - Track Your Baby's Activities",
    pageDescription:
      "Simple baby activity tracker. Log feedings, diaper changes, and other activities. Works offline and syncs with Google Sheets.",
    pageKeywords:
      "baby tracker, baby log, feeding tracker, diaper log, baby activities, parenting tool",

    // Home Screen
    todaySummary: "📊 Today's Summary",
    recentActivity: "Recent Activity",
    logActivity: "Log Activity",
    dataStoredLocally: "💡 Data stored locally only.",
    connectGoogleSheets: "Connect Google Sheets",

    // Navigation
    navHome: "Home",
    navLog: "Log",
    navInsights: "Insights",
    navSettings: "Settings",

    // Log Screen
    logTitle: "📋 Log",
    filterByDate: "📅 Filter by Date:",
    clearFilter: "Clear Filter",

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
    wizardQuickActionsDesc: "Tap buttons to log activities instantly.",
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

    // Log Summary/Overview
    overview: "Overview",
    total: "Total",
    today: "Today",
    dayStreak: "Day Streak",
    most: "Most",
    lastActivityTimes: "Last Activity Times",
    noData: "—",

    // Log Entries
    delete: "Delete",
    noEntriesToExport: "No entries to export",
    noEntriesYet: "No entries yet",
    showing: "Showing",
    entries: "entries",

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
    welcomeActivitiesDesc:
      "Select activities to track. Add more or customise in Settings anytime.",
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
    todaySummary: "📊 Tämän Päivän Yhteenveto",
    recentActivity: "Viimeisimmät Toiminnot",
    logActivity: "Kirjaa Toiminto",
    dataStoredLocally: "💡 Tiedot tallennettu vain paikallisesti.",
    connectGoogleSheets: "Yhdistä Google Sheets",

    // Navigation
    navHome: "Koti",
    navLog: "Loki",
    navInsights: "Tilastot",
    navSettings: "Asetukset",

    // Log Screen
    logTitle: "📋 Loki",
    filterByDate: "📅 Suodata Päivämäärän Mukaan:",
    clearFilter: "Tyhjennä Suodatin",

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
      "Napauta painikkeita kirjataksesi toimintoja välittömästi.",
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

    // Log Summary/Overview
    overview: "Yleiskatsaus",
    total: "Yhteensä",
    today: "Tänään",
    dayStreak: "Päivän Putki",
    most: "Eniten",
    lastActivityTimes: "Viimeisimmät Toiminta-ajat",
    noData: "—",

    // Log Entries
    delete: "Poista",
    noEntriesToExport: "Ei merkintöjä vietäväksi",
    noEntriesYet: "Ei vielä merkintöjä",
    showing: "Näytetään",
    entries: "merkintää",

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
    welcomeActivitiesDesc:
      "Valitse toiminnot. Lisää tai muokkaa Asetuksissa milloin tahansa.",
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
  document.documentElement.lang = lang === "fi" ? "fi" : "en";
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
