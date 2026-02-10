(function () {
  // Optional: hardcode your Google Apps Script Web App URL here to avoid using the Settings UI.
  // If non-empty, syncing will be enabled automatically and the Settings section will be hidden.
  const FIXED_WEB_APP_URL = "";

  const STORE_KEY = "babylog.entries.v1";
  const SETTINGS_KEY = "babylog.settings.v1";
  const DELETE_QUEUE_KEY = "babylog.deletes.v1";
  const SYNC_QUEUE_KEY = "babylog.syncqueue.v1";
  const LAST_SYNC_KEY = "babylog.lastsync.v1";
  const ACTION_TYPES_KEY = "babylog.actiontypes.v1";
  const SYNC_NOTICE_DISMISSED_KEY = "babylog.syncnoticedismissed.v1";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // Screens
  const homeScreen = $("#homeScreen");
  const logScreen = $("#logScreen");
  const insightsScreen = $("#insightsScreen");
  const settingsScreen = $("#settingsScreen");

  const toastEl = $("#toast");
  const nowText = $("#nowText");
  const actionButtons = $("#actionButtons");
  const miniStatsHome = $("#miniStatsHome");
  const logStats = $("#logStats");
  const logSummaryCard = $("#logSummaryCard");
  const lastFeed = $("#lastFeed");
  const lastPee = $("#lastPoop");
  const lastPoop = $("#lastPoop");
  const todayTotals = $("#todayTotals");
  const syncNoticeWarning = $("#syncNoticeWarning");
  const syncNoticeSuccess = $("#syncNoticeSuccess");
  const syncNoticeLink = $("#syncNoticeLink");
  const dismissSyncNotice = $("#dismissSyncNotice");
  const recentList = $("#recentList");
  const logEntries = $("#logEntries");
  const undoBtn = $("#undoBtn");
  const viewGraphsBtn = $("#viewGraphsBtn");
  const viewLogBtn = $("#viewLogBtn");

  const closeGraphsBtn = $("#closeGraphsBtn");
  const closeLogBtn = $("#closeLogBtn");
  const closeSettingsBtn = $("#closeSettingsBtn");
  const dateFilter = $("#dateFilter");
  const clearFilterBtn = $("#clearFilterBtn");
  const summaryEl = $("#summary");

  const openSettingsBtn = $("#openSettingsBtn");
  const appsScriptUrl = $("#appsScriptUrl");
  const pasteUrlBtn = $("#pasteUrlBtn");
  const saveSettingsBtn = $("#saveSettingsBtn");
  const exportCSVBtn = $("#exportCSVBtn");
  const importCSVBtn = $("#importCSVBtn");
  const importCSVInput = $("#importCSVInput");
  const exportJSONBtn = $("#exportJSONBtn");
  const importJSONBtn = $("#importJSONBtn");
  const importJSONInput = $("#importJSONInput");
  const viewHelpBtn = $("#viewHelpBtn");
  const disconnectBtn = $("#disconnectBtn");
  const disconnectSection = $("#disconnectSection");
  const syncSetupState = $("#syncSetupState");
  const disconnectModal = $("#disconnectModal");
  const closeDisconnectModalBtn = $("#closeDisconnectModalBtn");
  const keepDataBtn = $("#keepDataBtn");
  const deleteDataBtn = $("#deleteDataBtn");
  const aboutAppBtn = $("#aboutAppBtn");
  const githubRepoBtn = $("#githubRepoBtn");
  const aboutAppScreen = $("#aboutAppScreen");

  // Action Types Manager
  const actionTypesList = $("#actionTypesList");
  const addActionTypeBtn = $("#addActionTypeBtn");
  const actionTypeModal = $("#actionTypeModal");
  const modalTitle = $("#modalTitle");
  const editingTypeId = $("#editingTypeId");
  const typeNameInput = $("#typeNameInput");
  const typeEmojiInput = $("#typeEmojiInput");
  const typeColorInput = $("#typeColorInput");
  const typeColorText = $("#typeColorText");
  const closeModalBtn = $("#closeModalBtn");
  const cancelModalBtn = $("#cancelModalBtn");
  const saveTypeBtn = $("#saveTypeBtn");

  // Edit Entry Modal
  const editEntryModal = $("#editEntryModal");
  const closeEditModalBtn = $("#closeEditModalBtn");
  const cancelEditModalBtn = $("#cancelEditModalBtn");
  const saveEditBtn = $("#saveEditBtn");
  const editingEntryId = $("#editingEntryId");
  const editEntryType = $("#editEntryType");
  const editEntryDate = $("#editEntryDate");
  const editEntryTime = $("#editEntryTime");
  const editEntryNote = $("#editEntryNote");

  // Log Past Entry Modal
  const logPastEntryModal = $("#logPastEntryModal");
  const closePastEntryModalBtn = $("#closePastEntryModalBtn");
  const cancelPastEntryModalBtn = $("#cancelPastEntryModalBtn");
  const savePastEntryBtn = $("#savePastEntryBtn");
  const pastEntryType = $("#pastEntryType");
  const pastEntryDate = $("#pastEntryDate");
  const pastEntryTime = $("#pastEntryTime");
  const pastEntryNote = $("#pastEntryNote");

  // FAB (Floating Action Button)
  const fabContainer = $("#fabContainer");
  const fabButton = $("#fabButton");
  const fabMenu = $("#fabMenu");
  const fabMenuActivities = $("#fabMenuActivities");
  const fabPastEntry = $("#fabPastEntry");
  const fabManageActivities = $("#fabManageActivities");
  const fabBackdrop = $("#fabBackdrop");

  // Screens
  const helpScreen = $("#helpScreen");
  const helpContent = $("#helpContent");

  // Legacy elements for compatibility
  const logPanel = { hidden: true };
  const graphsPanel = { hidden: true };

  // Selected activities for filtering graphs (default: all selected)
  let selectedActivityTypes = new Set();

  // State for calendar navigation
  let currentCalendarMonth = new Date().getMonth();
  let currentCalendarYear = new Date().getFullYear();

  const haptics = (ms) => {
    if (navigator.vibrate) navigator.vibrate(ms || 10);
  };
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 1400);
  };

  // Loading indicator for remote log fetch
  let loadingTimer = null;
  let loadingPercent = 0;
  function setLoading(isLoading, label) {
    const base = label || "Loading from Sheets";
    if (isLoading) {
      loadingPercent = 0;
      if (progressWrap) progressWrap.hidden = false;
      if (summaryEl) summaryEl.classList.add("loading");
      if (logTbody) logTbody.innerHTML = "";
      if (progressBar) progressBar.style.width = "0%";
      if (progressLabel) progressLabel.textContent = `${base}… 0%`;
      if (loadingTimer) clearInterval(loadingTimer);
      loadingTimer = setInterval(() => {
        // Smoothly advance toward 85% while waiting; complete to 100% on finish
        const target = 85;
        const step = 3; // ~3% per tick
        loadingPercent = Math.min(target, loadingPercent + step);
        if (progressBar) progressBar.style.width = `${loadingPercent}%`;
        if (progressLabel)
          progressLabel.textContent = `${base}… ${Math.floor(loadingPercent)}%`;
      }, 250);
    } else {
      // Finish the bar
      loadingPercent = 100;
      if (progressBar) progressBar.style.width = "100%";
      if (progressLabel) progressLabel.textContent = `${base}… 100%`;
      if (loadingTimer) {
        clearInterval(loadingTimer);
        loadingTimer = null;
      }
      if (summaryEl) summaryEl.classList.remove("loading");
      // Hide after a short delay so users can see completion
      setTimeout(() => {
        if (progressWrap) progressWrap.hidden = true;
      }, 600);
    }
  }

  function loadEntries() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveEntries(list) {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  }
  function loadSettings() {
    try {
      return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
    } catch {
      return {};
    }
  }
  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }
  function loadDeletes() {
    try {
      return JSON.parse(localStorage.getItem(DELETE_QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveDeletes(list) {
    localStorage.setItem(DELETE_QUEUE_KEY, JSON.stringify(list));
  }
  function loadSyncQueue() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || "[]");
    } catch {
      return [];
    }
  }
  function saveSyncQueue(list) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(list));
  }
  function getLastSyncTime() {
    try {
      return parseInt(localStorage.getItem(LAST_SYNC_KEY) || "0") || 0;
    } catch {
      return 0;
    }
  }
  function setLastSyncTime(ts) {
    localStorage.setItem(LAST_SYNC_KEY, String(ts || Date.now()));
  }
  // Default action types
  function getDefaultActionTypes() {
    return [
      {
        id: "feed",
        name: typeof t === "function" ? t("feed") : "Feed",
        emoji: "🍼",
        color: "#a8d5ff",
      },
      {
        id: "pee",
        name: typeof t === "function" ? t("pee") : "Pee",
        emoji: "💧",
        color: "#ffe4a8",
      },
      {
        id: "poop",
        name: typeof t === "function" ? t("poop") : "Poop",
        emoji: "💩",
        color: "#ffb3ba",
      },
    ];
  }

  function loadActionTypes() {
    try {
      const stored = localStorage.getItem(ACTION_TYPES_KEY);
      return stored ? JSON.parse(stored) : getDefaultActionTypes();
    } catch {
      return getDefaultActionTypes();
    }
  }

  function saveActionTypes(types) {
    localStorage.setItem(ACTION_TYPES_KEY, JSON.stringify(types));
  }

  function getActionTypeById(id) {
    return actionTypes.find((t) => t.id === id) || null;
  }

  // Get translated action type name
  function getActionTypeName(actionType) {
    if (!actionType) return "";
    // For all default activity types, use translation if available
    const defaultActivityIds = [
      "feed",
      "pee",
      "poop",
      "sleep",
      "bath",
      "play",
      "walk",
      "medicine",
    ];
    if (defaultActivityIds.includes(actionType.id) && typeof t === "function") {
      return t(actionType.id);
    }
    // For custom types, use the stored name
    return actionType.name;
  }

  function formatDate(ts) {
    const d = new Date(ts);
    const locale =
      typeof getCurrentLanguage === "function" && getCurrentLanguage() === "fi"
        ? "fi-FI"
        : "en-US";
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    };
    return d.toLocaleDateString(locale, options);
  }
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Format time since timestamp in a friendly way
  function formatTimeSince(ts) {
    const now = Date.now();
    const diff = now - ts;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return "yesterday";
    return `${days}d ago`;
  }

  function isSameDay(ts, day) {
    const d1 = new Date(ts);
    const d2 = new Date(day);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  }

  let entries = loadEntries();
  let settings = loadSettings();
  let deleteQueue = loadDeletes();
  let syncQueue = loadSyncQueue();
  let actionTypes = loadActionTypes();
  let isSyncing = false;

  // Auto-refresh remote log every 20s while the panel is open
  let remoteRefreshTimer = null;
  function startRemoteAutoRefresh() {
    if (remoteRefreshTimer) clearInterval(remoteRefreshTimer);
    remoteRefreshTimer = setInterval(async () => {
      await backgroundSync();
    }, 20000);
  }
  function stopRemoteAutoRefresh() {
    if (remoteRefreshTimer) {
      clearInterval(remoteRefreshTimer);
      remoteRefreshTimer = null;
    }
  }

  // Apply saved theme or default to blossom
  function applyTheme(theme) {
    const validThemes = ["blossom", "comet", "meadow", "midnight"];
    const selectedTheme = validThemes.includes(theme) ? theme : "blossom";
    document.body.setAttribute("data-theme", selectedTheme);

    // Update radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.checked = radio.value === selectedTheme;
    });

    // Haptic feedback when theme changes
    if (theme !== "blossom" || document.body.getAttribute("data-theme")) {
      haptics(5);
    }
  }

  // Load and apply theme on startup
  applyTheme(settings.theme || "blossom");

  // Apply saved font or default to roboto
  function applyFont(font) {
    const validFonts = ["roboto", "mono", "lora", "inter", "creepster"];
    const selectedFont = validFonts.includes(font) ? font : "roboto";
    document.body.setAttribute("data-font", selectedFont);

    // Update radio buttons
    const fontRadios = document.querySelectorAll('input[name="font"]');
    fontRadios.forEach((radio) => {
      radio.checked = radio.value === selectedFont;
    });

    // Haptic feedback when font changes
    if (font !== "roboto" || document.body.getAttribute("data-font")) {
      haptics(3);
    }
  }

  // Load and apply font on startup
  applyFont(settings.font || "roboto");

  // Apply saved language or default to English
  function applyLanguage(lang) {
    const validLanguages = ["en", "fi"];
    const selectedLanguage = validLanguages.includes(lang) ? lang : "en";

    // Save the language setting
    settings.language = selectedLanguage;
    saveSettings(settings);

    // Update radio buttons
    const languageRadios = document.querySelectorAll('input[name="language"]');
    languageRadios.forEach((radio) => {
      radio.checked = radio.value === selectedLanguage;
    });

    // Update all translations on the page
    if (typeof updatePageTranslations === "function") {
      updatePageTranslations();
    }

    // Re-render UI components with new language
    renderHomeScreen();
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();
    if (!settingsScreen.hidden && typeof renderActionTypes === "function") {
      renderActionTypes();
    }
    updateStatus();

    // Haptic feedback when language changes
    haptics(5);
  }

  // Load and apply language on startup
  applyLanguage(settings.language || "en");

  // If a fixed URL is provided, force-enable sync
  if (FIXED_WEB_APP_URL) {
    settings = { webAppUrl: FIXED_WEB_APP_URL, syncEnabled: true };
    saveSettings(settings);
  }

  // Initialize app and sync with Google Sheets
  async function initializeApp() {
    // Show loading state immediately
    renderHomeScreen(true);
    updateStatus();

    // Pull from Google Sheets to get latest data
    await pullAndMergeRemote();

    // Render final UI with synced data
    renderHomeScreen(false);
    updateStatus();
  }

  // Start initialization
  initializeApp();

  // Initialize screen based on URL hash after app loads
  initializeScreen();

  // Render clock
  setInterval(() => {
    const now = new Date();
    const locale =
      typeof getCurrentLanguage === "function" && getCurrentLanguage() === "fi"
        ? "fi-FI"
        : "en-US";
    const options = {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    if (nowText) nowText.textContent = now.toLocaleDateString(locale, options);
  }, 1000);

  // Show/hide undo button temporarily
  let undoTimer = null;
  function showUndoButton() {
    if (!undoBtn) return;
    undoBtn.hidden = false;
    if (undoTimer) clearTimeout(undoTimer);
    undoTimer = setTimeout(() => {
      undoBtn.hidden = true;
    }, 5000);
  }

  // Add entry - instant local save with background sync
  function addEntry(type, note) {
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      note: note || "",
      timestamp: Date.now(),
      synced: false,
    };
    entries.push(entry);
    saveEntries(entries);

    // Add to sync queue
    syncQueue.push({ type: "create", entry, queuedAt: Date.now() });
    saveSyncQueue(syncQueue);

    // Immediate UI update
    haptics(15);
    const actionType = getActionTypeById(type);
    const actionName = actionType
      ? getActionTypeName(actionType)
      : capitalize(type);
    const loggedText = typeof t === "function" ? t("logged") : "logged";
    toast(`${actionName} ${loggedText}`);
    updateStatus();
    showUndoButton();

    // Update open screens immediately
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();

    // Trigger background sync
    backgroundSync();
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Screen Navigation with Browser History Support
  function showScreen(screen, updateHistory = true) {
    // Close FAB when switching screens
    closeFAB();

    // Update browser history if not called from popstate event
    if (updateHistory) {
      const currentHash = window.location.hash.slice(1) || "home";
      if (currentHash !== screen) {
        history.pushState({ screen: screen }, "", `#${screen}`);
      }
    }

    // Update nav buttons
    $$(`.nav-item`).forEach((btn) => btn.classList.remove("active"));

    if (screen === "home") {
      homeScreen.hidden = false;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      if (aboutAppScreen) aboutAppScreen.hidden = true;
      $$(`.nav-item[data-screen="home"]`)[0]?.classList.add("active");
      updateStatus(); // Refresh sync notice when returning to home
      // Scroll to top
      const homeContent = homeScreen.querySelector(".screen-content");
      if (homeContent) homeContent.scrollTop = 0;
    } else if (screen === "log") {
      homeScreen.hidden = true;
      logScreen.hidden = false;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      if (aboutAppScreen) aboutAppScreen.hidden = true;
      $$(`.nav-item[data-screen="log"]`)[0]?.classList.add("active");
      renderLogSummary();
      renderLog();
      backgroundSync();
      startRemoteAutoRefresh();
      // Scroll to top
      const logContent = logScreen.querySelector(".screen-content");
      if (logContent) logContent.scrollTop = 0;
    } else if (screen === "insights") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = false;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      if (aboutAppScreen) aboutAppScreen.hidden = true;
      $$(`.nav-item[data-screen="insights"]`)[0]?.classList.add("active");
      renderGraphs();
      backgroundSync();
      // Scroll to top
      const insightsContent = insightsScreen.querySelector(".screen-content");
      if (insightsContent) insightsContent.scrollTop = 0;
    } else if (screen === "settings") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = false;
      if (helpScreen) helpScreen.hidden = true;
      if (aboutAppScreen) aboutAppScreen.hidden = true;
      $$(`.nav-item[data-screen="settings"]`)[0]?.classList.add("active");
      renderActionTypes();
      // Scroll to top
      const settingsContent = settingsScreen.querySelector(".screen-content");
      if (settingsContent) settingsContent.scrollTop = 0;
    } else if (screen === "help") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) {
        helpScreen.hidden = false;
        loadHelpContent();
        // Scroll to top
        const helpContent = helpScreen.querySelector(".screen-content");
        if (helpContent) helpContent.scrollTop = 0;
      }
      if (aboutAppScreen) aboutAppScreen.hidden = true;
    } else if (screen === "about") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      if (aboutAppScreen) {
        aboutAppScreen.hidden = false;
        // Scroll to top
        const aboutContent = aboutAppScreen.querySelector(".screen-content");
        if (aboutContent) aboutContent.scrollTop = 0;
      }
    }
  }

  function goHome() {
    showScreen("home");
    stopRemoteAutoRefresh();
  }

  // Browser History Support
  function handleBrowserNavigation() {
    const hash = window.location.hash.slice(1) || "home";
    const validScreens = [
      "home",
      "log",
      "insights",
      "settings",
      "help",
      "about",
    ];

    // Handle modal states
    if (hash === "add-activity") {
      // Don't change underlying screen, just show modal
      if (actionTypeModal && actionTypeModal.hidden) {
        // Show modal without adding to history again
        actionTypeModal.hidden = false;
      }
      return;
    } else if (hash === "disconnect") {
      // Don't change underlying screen, just show disconnect modal
      if (disconnectModal && disconnectModal.hidden) {
        disconnectModal.hidden = false;
      }
      return;
    } else {
      // Close any open modals when navigating to screens
      if (actionTypeModal && !actionTypeModal.hidden) {
        actionTypeModal.hidden = true;
      }
      if (disconnectModal && !disconnectModal.hidden) {
        disconnectModal.hidden = true;
      }
    }

    if (validScreens.includes(hash)) {
      // Don't update history when handling browser navigation
      showScreen(hash, false);
    } else {
      // Default to home for invalid hashes
      showScreen("home", false);
    }
  }

  // Listen for browser back/forward button
  window.addEventListener("popstate", (event) => {
    handleBrowserNavigation();
  });

  // Initialize app with correct screen based on URL hash
  function initializeScreen() {
    handleBrowserNavigation();
  }

  // Render recent activity on home screen
  function renderRecentActivity() {
    if (!recentList) return;
    const recent = entries
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    if (recent.length === 0) {
      const noActivityMsg =
        typeof t === "function" ? t("noActivityYet") : "No activity yet";
      recentList.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:20px;">${noActivityMsg}</p>`;
      return;
    }

    recentList.innerHTML = recent
      .map((e, index) => {
        const actionType = getActionTypeById(e.type);
        const actionName = actionType
          ? getActionTypeName(actionType)
          : capitalize(e.type);
        return `
      <div class="recent-item" style="animation-delay: ${index * 0.05}s">
        <div class="recent-icon ${e.type}">${getTypeEmoji(e.type)}</div>
        <div class="recent-info">
          <div class="recent-type">${actionName}</div>
          <div class="recent-time">${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</div>
        </div>
      </div>
    `;
      })
      .join("");
  }

  function getTypeEmoji(type) {
    const actionType = getActionTypeById(type);
    return actionType ? actionType.emoji : "📝";
  }

  function getTypeColor(type) {
    const actionType = getActionTypeById(type);
    return actionType ? actionType.color : "#e2e8f0";
  }

  function getTypeName(type) {
    const actionType = getActionTypeById(type);
    return actionType ? getActionTypeName(actionType) : type;
  }

  // Undo last - instant local delete with background sync
  function undoLast() {
    if (!entries.length) return;

    // Hide undo button immediately
    if (undoBtn) undoBtn.hidden = true;
    if (undoTimer) clearTimeout(undoTimer);

    const last = entries.pop();
    saveEntries(entries);

    // Add to delete queue for background sync
    deleteQueue.push(last.id);
    saveDeletes(deleteQueue);
    syncQueue.push({ type: "delete", id: last.id, queuedAt: Date.now() });
    saveSyncQueue(syncQueue);

    // Immediate UI update
    haptics(10);
    updateStatus();
    const undidLabel = typeof t === "function" ? t("undid") : "Undid";
    const actionType = getActionTypeById(last.type);
    const typeName = actionType ? getActionTypeName(actionType) : last.type;
    toast(`${undidLabel} ${typeName} at ${formatTime(last.timestamp)}`);

    // Update open screens immediately
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();

    // Trigger background sync
    backgroundSync();
  }

  // Render home screen action buttons dynamically
  function renderHomeScreen(showLoading = false) {
    // Render FAB menu items instead of action buttons
    if (fabMenuActivities) {
      fabMenuActivities.innerHTML = "";

      if (!showLoading) {
        actionTypes.forEach((type) => {
          const btn = document.createElement("button");
          btn.className = "fab-menu-activity";
          btn.dataset.type = type.id;
          btn.innerHTML = `
            <span class="fab-menu-icon" style="background: ${type.color}33;">${type.emoji}</span>
            <span class="fab-menu-label">${getActionTypeName(type)}</span>
          `;

          fabMenuActivities.appendChild(btn);
        });

        // Re-attach event listeners to new FAB menu buttons
        $$(".fab-menu-activity").forEach((btn) => {
          btn.addEventListener("click", async () => {
            closeFAB();
            await addEntry(btn.dataset.type);
          });
        });
      }
    }

    // Render mini-stats
    if (miniStatsHome) {
      miniStatsHome.innerHTML = "";
      // Only show first 3 types to avoid crowding
      actionTypes.slice(0, 3).forEach((type) => {
        const stat = document.createElement("div");
        stat.className = `stat-mini stat-${type.id}`;
        stat.style.borderColor = type.color;
        stat.innerHTML = `
          <div class="stat-mini-icon">${type.emoji}</div>
          <div class="stat-mini-content">
            <div class="stat-mini-label">Last ${getActionTypeName(type)}</div>
            <div class="stat-mini-value" id="last${capitalize(type.id)}">—</div>
          </div>
        `;
        miniStatsHome.appendChild(stat);
      });
    }
  }

  // Render stats for log screen (all activity types)
  function renderLogStats() {
    if (!logStats) return;

    logStats.innerHTML = "";
    const src = entries;

    // Show all activity types in a grid
    actionTypes.forEach((type) => {
      const stat = document.createElement("div");
      stat.className = `stat-card stat-${type.id}`;

      const lastEntry = src
        .filter((e) => e.type === type.id)
        .sort((a, b) => b.timestamp - a.timestamp)[0];

      const lastTime = lastEntry
        ? `${formatDate(lastEntry.timestamp)} ${formatTime(lastEntry.timestamp)}`
        : "—";

      stat.innerHTML = `
        <div class="stat-icon" style="background-color: ${type.color}">${type.emoji}</div>
        <div class="stat-info">
          <div class="stat-label">Last ${getActionTypeName(type)}</div>
          <div class="stat-value">${lastTime}</div>
        </div>
      `;
      logStats.appendChild(stat);
    });
  }

  // Render summary overview for log screen
  function renderLogSummary() {
    if (!logSummaryCard) return;

    const src = entries;
    const today = new Date();
    const todayEntries = src.filter((e) => isSameDay(e.timestamp, today));
    const todayCounts = countByType(todayEntries);

    // Find most logged activity (all time) - handle ties
    const allCounts = countByType(src);
    let mostLoggedTypes = [];
    if (Object.keys(allCounts).length > 0) {
      const maxCount = Math.max(...Object.values(allCounts));
      const topIds = Object.keys(allCounts).filter(
        (id) => allCounts[id] === maxCount,
      );
      mostLoggedTypes = topIds
        .map((id) => getActionTypeById(id))
        .filter((t) => t);
    }

    // Calculate streak (consecutive days with at least one entry)
    let streak = 0;
    let checkDate = new Date(today);
    while (true) {
      const hasEntry = src.some((e) => isSameDay(e.timestamp, checkDate));
      if (!hasEntry) break;
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    }

    logSummaryCard.innerHTML = `
      <div class="summary-header">
        <h3>📊 ${typeof t === "function" ? t("overview") : "Overview"}</h3>
        <div class="summary-header-actions">
          <div class="summary-badges">
            <span class="summary-badge">${src.length} ${typeof t === "function" ? t("total") : "Total"}</span>
            <span class="summary-badge">${todayEntries.length} ${typeof t === "function" ? t("today") : "Today"}</span>
          </div>
        </div>
      </div>
      
      <div class="summary-quick-stats">
        <div class="quick-stat">
          <div class="quick-stat-icon">🔥</div>
          <div class="quick-stat-value">${streak}</div>
          <div class="quick-stat-label">${typeof t === "function" ? t("dayStreak") : "Day Streak"}</div>
        </div>
        ${
          mostLoggedTypes.length > 0
            ? mostLoggedTypes
                .map((type) => {
                  const count = allCounts[type.id];
                  const mostLabel =
                    typeof t === "function" ? t("most") : "Most";
                  return `
          <div class="quick-stat">
            <div class="quick-stat-icon" style="background-color: ${type.color}33">${type.emoji}</div>
            <div class="quick-stat-value">${count}</div>
            <div class="quick-stat-label">${mostLabel}: ${getActionTypeName(type)}</div>
          </div>
        `;
                })
                .join("")
            : ""
        }
      </div>
      
      <div class="summary-divider"></div>
      
      <div class="summary-activities">
        <div class="summary-activities-header">${typeof t === "function" ? t("lastActivityTimes") : "Last Activity Times"}</div>
        <div class="summary-activities-grid">
          ${actionTypes
            .map((type) => {
              const lastEntry = src
                .filter((e) => e.type === type.id)
                .sort((a, b) => b.timestamp - a.timestamp)[0];
              const noDataLabel = typeof t === "function" ? t("noData") : "—";
              const lastTime = lastEntry
                ? `${formatDate(lastEntry.timestamp)} ${formatTime(lastEntry.timestamp)}`
                : noDataLabel;
              const todayCount = todayCounts[type.id] || 0;

              return `
              <div class="activity-row">
                <div class="activity-row-icon" style="background-color: ${type.color}">${type.emoji}</div>
                <div class="activity-row-info">
                  <div class="activity-row-name">${getActionTypeName(type)}${todayCount > 0 ? ` <span class="activity-today-count">+${todayCount}</span>` : ""}</div>
                  <div class="activity-row-time">${lastTime}</div>
                </div>
              </div>
            `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function updateStatus() {
    const src = entries;

    // Update dynamic mini-stats for home screen (first 3 only)
    actionTypes.slice(0, 3).forEach((type) => {
      const lastEl = document.getElementById(`lastHome${capitalize(type.id)}`);
      if (lastEl) {
        const e = src
          .filter((e) => e.type === type.id)
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        lastEl.textContent = e
          ? `${formatDate(e.timestamp)} ${formatTime(e.timestamp)}`
          : "—";
      }
    });

    // Build dynamic today's summary
    const today = new Date();
    const todayEntries = src.filter((e) => isSameDay(e.timestamp, today));
    const counts = countByType(todayEntries);

    if (todayTotals) {
      if (src.length) {
        // Create visual card-based summary
        const summaryCards = actionTypes
          .map((type) => {
            const count = counts[type.id] || 0;
            const lastEntry = src
              .filter((e) => e.type === type.id)
              .sort((a, b) => b.timestamp - a.timestamp)[0];
            const timeText = lastEntry
              ? formatTimeSince(lastEntry.timestamp)
              : "—";

            return `
              <div class="summary-card">
                <div class="summary-emoji" style="background-color: ${type.color}20;">${type.emoji}</div>
                <div class="summary-info">
                  <div class="summary-count">${count}</div>
                  <div class="summary-time">${timeText}</div>
                </div>
              </div>
            `;
          })
          .join("");

        todayTotals.innerHTML = `<div class="summary-grid">${summaryCards}</div>`;
      } else {
        const todayNone =
          typeof t === "function" ? t("todayNone") : "No activities yet";
        todayTotals.innerHTML = `<div class="summary-empty">${todayNone}</div>`;
      }
    }

    // Show sync warning on home screen if not connected
    // Reload settings to ensure we have latest state
    const currentSettings = loadSettings();
    const hasUrl = !!(currentSettings.webAppUrl || FIXED_WEB_APP_URL);
    const isSyncConfigured = hasUrl && currentSettings.syncEnabled;

    // Only show warning on home screen when NOT connected and not dismissed
    if (syncNoticeWarning) {
      const isDismissed =
        localStorage.getItem(SYNC_NOTICE_DISMISSED_KEY) === "true";
      syncNoticeWarning.hidden = isSyncConfigured || isDismissed;
    }

    // Update success notice in settings (handled separately when settings screen is shown)
    if (syncNoticeSuccess) {
      syncNoticeSuccess.hidden = !isSyncConfigured;
    }

    // Show/hide setup state vs connected state
    if (syncSetupState) {
      syncSetupState.style.display = isSyncConfigured ? "none" : "block";
    }

    // Show/hide disconnect button based on connection status
    if (disconnectBtn) {
      disconnectBtn.style.display = isSyncConfigured ? "inline-block" : "none";
    }

    renderRecentActivity();
  }

  function countByType(list) {
    return list.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
  }

  async function openLog() {
    showScreen("log");
    renderLogSummary();
    renderLog();
    updateStatus();
    // Trigger background sync to pull latest from other devices
    backgroundSync();
    startRemoteAutoRefresh();
  }
  function closeLog() {
    showScreen("home");
    stopRemoteAutoRefresh();
  }

  async function openGraphs() {
    haptics(8);
    showScreen("insights");
    try {
      renderGraphs();
      // Trigger background sync to get latest data
      backgroundSync();
    } catch (err) {
      toast("Graphs unavailable — add some logs first");
    }
  }

  function closeGraphs() {
    haptics(6);
    showScreen("home");
  }

  function openSettings() {
    showScreen("settings");
  }

  function closeSettings() {
    showScreen("home");
  }

  function renderGraphLegends() {
    const legendIds = ["todayLegend", "weekLegend", "hourlyLegend"];
    const filteredTypes = getFilteredActivityTypes();

    legendIds.forEach((legendId) => {
      const legend = document.getElementById(legendId);
      if (!legend) return;

      legend.innerHTML = "";
      filteredTypes.forEach((type) => {
        const item = document.createElement("div");
        item.className = "legend-item";
        item.innerHTML = `
          <span class="legend-color" style="background: ${type.color}"></span>
          <span class="legend-label">${getActionTypeName(type)}</span>
        `;
        legend.appendChild(item);
      });
    });

    // Interval chart legend - show activity types
    const intervalLegend = document.getElementById("intervalLegend");
    if (intervalLegend) {
      intervalLegend.innerHTML = "";
      filteredTypes.forEach((type) => {
        const item = document.createElement("div");
        item.className = "legend-item";
        const intervalsLabel =
          typeof t === "function" ? t("intervals") : "intervals";
        item.innerHTML = `
          <span class="legend-color" style="background: ${type.color}"></span>
          <span class="legend-label">${getActionTypeName(type)} ${intervalsLabel}</span>
        `;
        intervalLegend.appendChild(item);
      });
    }
  }

  function getFilteredActivityTypes() {
    if (selectedActivityTypes.size === 0) {
      // Default: all activities selected
      return actionTypes;
    }
    return actionTypes.filter((type) => selectedActivityTypes.has(type.id));
  }

  function renderActivityFilter() {
    const filterGrid = document.getElementById("activityFilterGrid");
    if (!filterGrid) return;

    // Initialize selectedActivityTypes if empty (first time)
    if (selectedActivityTypes.size === 0) {
      actionTypes.forEach((type) => selectedActivityTypes.add(type.id));
    }

    filterGrid.innerHTML = "";
    actionTypes.forEach((type) => {
      const isSelected = selectedActivityTypes.has(type.id);
      const item = document.createElement("div");
      item.className = `activity-filter-item ${isSelected ? "selected" : ""}`;
      item.dataset.typeId = type.id;

      item.innerHTML = `
        <div class="activity-filter-checkbox"></div>
        <div class="activity-filter-icon" style="background-color: ${type.color}">${type.emoji}</div>
        <div class="activity-filter-label">${getActionTypeName(type)}</div>
      `;

      item.addEventListener("click", () => {
        haptics(5);
        toggleActivityFilter(type.id);
      });

      filterGrid.appendChild(item);
    });
  }

  function toggleActivityFilter(typeId) {
    if (selectedActivityTypes.has(typeId)) {
      selectedActivityTypes.delete(typeId);
    } else {
      selectedActivityTypes.add(typeId);
    }

    // Update UI
    renderActivityFilter();

    // Re-render graphs with new filter
    if (!insightsScreen.hidden) {
      renderGraphs();
    }
  }

  function renderGraphs() {
    const graphsContainer = document.querySelector(".graphs-container");
    if (!graphsContainer) return;

    // Render activity filter
    renderActivityFilter();

    const filteredTypes = getFilteredActivityTypes();

    if (!entries || !entries.length) {
      graphsContainer.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          text-align: center;
          color: var(--text-secondary);
        ">
          <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">📊</div>
          <h3 style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">${typeof t === "function" ? t("noDataYet") : "No Data Yet"}</h3>
          <p style="font-size: 15px; line-height: 1.5; max-width: 300px;">
            ${typeof t === "function" ? t("noDataYetDesc") : "Start logging activities to see insightful graphs and trends about your baby's routine."}
          </p>
        </div>
      `;
      return;
    }

    // Restore graphs container structure if it was replaced
    if (!graphsContainer.querySelector(".graph-card")) {
      const todayTitle =
        typeof t === "function" ? t("todayActivityTitle") : "Today's Activity";
      const hourlyTitle =
        typeof t === "function" ? t("last24HoursTitle") : "24-Hour Timeline";
      const weekTitle =
        typeof t === "function" ? t("sevenDayTrendTitle") : "7-Day Trend";
      const intervalTitle =
        typeof t === "function"
          ? t("timeBetweenActivitiesTitle")
          : "Time Between Activities";
      const monthlyTitle =
        typeof t === "function"
          ? t("monthlyHabit")
          : "📅 Monthly Activity Tracker";
      const monthlyDesc =
        typeof t === "function"
          ? t("monthlyHabitDesc")
          : "Track a single activity across the month to visualize patterns and build consistent habits";
      const selectActivityLabel =
        typeof t === "function"
          ? t("selectActivityToTrack")
          : "Select activity to track:";

      graphsContainer.innerHTML = `
        <div class="graph-card">
          <h3>${todayTitle}</h3>
          <canvas id="todayChart"></canvas>
          <div id="todayLegend" class="graph-legend"></div>
        </div>
        <div class="graph-card">
          <h3>${hourlyTitle}</h3>
          <canvas id="hourlyChart"></canvas>
          <div id="hourlyLegend" class="graph-legend"></div>
        </div>
        <div class="graph-card">
          <h3>${weekTitle}</h3>
          <canvas id="weekChart"></canvas>
          <div id="weekLegend" class="graph-legend"></div>
        </div>
        <div class="graph-card">
          <h3>${intervalTitle}</h3>
          <canvas id="intervalChart"></canvas>
          <div id="intervalLegend" class="graph-legend"></div>
        </div>
        <div class="graph-card">
          <h3>${monthlyTitle}</h3>
          <div class="graph-guide">${monthlyDesc}</div>
          <div class="habit-activity-selector">
            <label>${selectActivityLabel}</label>
            <div id="habitActivityGrid" class="habit-activity-grid">
            </div>
          </div>
          <div id="monthlyCalendar" class="monthly-calendar">
          </div>
        </div>
      `;
    }

    // Render legends dynamically
    renderGraphLegends();

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const last7days = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Today's totals - filtered by selected activities
    const todayEntries = entries.filter(
      (e) => e.timestamp >= todayStart && selectedActivityTypes.has(e.type),
    );
    const todayCounts = {};
    filteredTypes.forEach((type) => {
      todayCounts[type.id] = 0;
    });
    todayEntries.forEach((e) => {
      if (todayCounts[e.type] !== undefined) todayCounts[e.type]++;
    });
    drawBarChart(
      "todayChart",
      filteredTypes.map((type) => ({
        label: getActionTypeName(type),
        value: todayCounts[type.id],
        color: type.color,
      })),
    );

    // Last 24 hours by hour - filtered by selected activities
    const hourlyData = Array(24)
      .fill(0)
      .map((_, i) => {
        const obj = { hour: i };
        filteredTypes.forEach((type) => {
          obj[type.id] = 0;
        });
        return obj;
      });
    entries
      .filter(
        (e) => e.timestamp >= last24h && selectedActivityTypes.has(e.type),
      )
      .forEach((e) => {
        const h = new Date(e.timestamp).getHours();
        if (hourlyData[h][e.type] !== undefined) {
          hourlyData[h][e.type]++;
        }
      });
    drawLineChart("hourlyChart", hourlyData);

    // 7-day trend - filtered by selected activities
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayEntries = entries.filter(
        (e) =>
          e.timestamp >= dayStart &&
          e.timestamp < dayEnd &&
          selectedActivityTypes.has(e.type),
      );
      const counts = {};
      filteredTypes.forEach((type) => {
        counts[type.id] = 0;
      });
      dayEntries.forEach((e) => {
        if (counts[e.type] !== undefined) counts[e.type]++;
      });
      const locale =
        typeof getCurrentLanguage === "function" &&
        getCurrentLanguage() === "fi"
          ? "fi-FI"
          : "en";
      dailyData.push({
        day: new Date(dayStart).toLocaleDateString(locale, {
          weekday: "short",
        }),
        ...counts,
      });
    }
    drawStackedBarChart("weekChart", dailyData);

    // Time Between Activities - show average intervals for each activity type
    const intervalData = [];
    filteredTypes.forEach((type) => {
      const typeEntries = entries
        .filter((e) => e.type === type.id && selectedActivityTypes.has(e.type))
        .sort((a, b) => a.timestamp - b.timestamp);

      if (typeEntries.length < 2) {
        const notEnoughDataLabel =
          typeof t === "function" ? t("notEnoughData") : "Not enough data";
        intervalData.push({
          type: type,
          avgInterval: 0,
          intervalCount: 0,
          label: notEnoughDataLabel,
        });
        return;
      }

      const intervals = [];
      for (let i = 1; i < typeEntries.length; i++) {
        const interval =
          typeEntries[i].timestamp - typeEntries[i - 1].timestamp;
        intervals.push(interval);
      }

      const avgInterval =
        intervals.reduce((sum, interval) => sum + interval, 0) /
        intervals.length;
      const hours = Math.floor(avgInterval / (1000 * 60 * 60));
      const minutes = Math.floor(
        (avgInterval % (1000 * 60 * 60)) / (1000 * 60),
      );

      let label;
      if (hours > 0) {
        label = `${hours}h ${minutes}m`;
      } else {
        label = `${minutes}m`;
      }

      intervalData.push({
        type: type,
        avgInterval: avgInterval,
        intervalCount: intervals.length,
        label: label,
      });
    });

    drawIntervalChart("intervalChart", intervalData);

    // Render monthly calendar
    renderMonthlyCalendar();
  }

  // Render monthly habit tracker calendar
  function renderMonthlyCalendar(navigateMonth, selectedTypeId) {
    const activityGrid = document.getElementById("habitActivityGrid");
    const calendarDiv = document.getElementById("monthlyCalendar");

    if (!activityGrid || !calendarDiv) return;

    // Handle month navigation
    if (navigateMonth === "prev") {
      currentCalendarMonth--;
      if (currentCalendarMonth < 0) {
        currentCalendarMonth = 11;
        currentCalendarYear--;
      }
    } else if (navigateMonth === "next") {
      currentCalendarMonth++;
      if (currentCalendarMonth > 11) {
        currentCalendarMonth = 0;
        currentCalendarYear++;
      }
    } else if (navigateMonth === undefined) {
      // Reset to current month on initial load or activity change
      currentCalendarMonth = new Date().getMonth();
      currentCalendarYear = new Date().getFullYear();
    }

    // Populate activity selector - use ALL activities, not filtered ones
    const allTypes = actionTypes || [];
    if (allTypes.length === 0) {
      calendarDiv.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-secondary);">${typeof t === "function" ? t("noDataYet") : "No activities available"}</div>`;
      return;
    }

    // Get selected activity (or default to first)
    if (!selectedTypeId) {
      const currentSelected = activityGrid.querySelector(
        ".habit-activity-option.selected",
      );
      selectedTypeId = currentSelected
        ? currentSelected.dataset.typeId
        : allTypes[0].id;
    }

    // Build activity selector (always rebuild to ensure translations are current)
    activityGrid.innerHTML = allTypes
      .map(
        (type) =>
          `<div class="habit-activity-option ${type.id === selectedTypeId ? "selected" : ""}" data-type-id="${type.id}" onclick="renderMonthlyCalendar(undefined, '${type.id}')">
            <span class="habit-activity-icon">${type.emoji}</span>
            <span>${getActionTypeName(type)}</span>
          </div>`,
      )
      .join("");

    if (!selectedTypeId) return;

    const selectedType = allTypes.find((t) => t.id === selectedTypeId);

    // Use current calendar month/year
    const year = currentCalendarYear;
    const month = currentCalendarMonth;

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Get entries for this activity in current month
    const monthStart = firstDay.getTime();
    const monthEnd = new Date(year, month + 1, 0, 23, 59, 59).getTime();

    const monthEntries = entries.filter(
      (e) =>
        e.type === selectedTypeId &&
        e.timestamp >= monthStart &&
        e.timestamp <= monthEnd,
    );

    // Count entries per day
    const dayCounts = {};
    monthEntries.forEach((e) => {
      const day = new Date(e.timestamp).getDate();
      dayCounts[day] = (dayCounts[day] || 0) + 1;
    });

    // Calculate max count for scaling
    const maxCount = Math.max(...Object.values(dayCounts), 1);

    // Calculate stats
    const totalCount = monthEntries.length;
    const daysWithActivity = Object.keys(dayCounts).length;

    // Get locale for month name
    const locale =
      typeof getCurrentLanguage === "function" && getCurrentLanguage() === "fi"
        ? "fi-FI"
        : "en";
    const monthName = firstDay.toLocaleDateString(locale, {
      month: "long",
      year: "numeric",
    });

    // Get weekday names
    const weekdayNames = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(2024, 0, i); // Start from a Sunday
      weekdayNames.push(date.toLocaleDateString(locale, { weekday: "narrow" }));
    }

    // Check if we can navigate forward (not beyond current month)
    const today = new Date();
    const isCurrentMonth =
      month === today.getMonth() && year === today.getFullYear();
    const isFutureMonth =
      year > today.getFullYear() ||
      (year === today.getFullYear() && month > today.getMonth());

    // Build calendar HTML
    let calendarHTML = `
      <div class="calendar-header">
        <div class="calendar-nav">
          <button class="calendar-nav-btn" onclick="renderMonthlyCalendar('prev')">←</button>
          <div class="calendar-month">${monthName}</div>
          <button class="calendar-nav-btn" ${isFutureMonth || isCurrentMonth ? "disabled" : ""} onclick="renderMonthlyCalendar('next')">→</button>
        </div>
        <div class="calendar-stats">${totalCount} × ${daysWithActivity}d</div>
      </div>
      <div class="calendar-weekdays">
        ${weekdayNames.map((name) => `<div class="calendar-weekday">${name}</div>`).join("")}
      </div>
      <div class="calendar-grid">
    `;

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += `<div class="calendar-day empty"></div>`;
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const count = dayCounts[day] || 0;
      const dayDate = new Date(year, month, day);
      const isToday = dayDate.toDateString() === today.toDateString();
      const isFuture = dayDate > today;

      // Calculate intensity level (0-5)
      let level = 0;
      if (count > 0) {
        level = Math.min(5, Math.ceil((count / maxCount) * 5));
      }

      const classes = [
        "calendar-day",
        `level-${level}`,
        isToday ? "today" : "",
        isFuture ? "future" : "",
      ]
        .filter(Boolean)
        .join(" ");

      calendarHTML += `
        <div class="${classes}" title="${selectedType.emoji} ${getActionTypeName(selectedType)}: ${count}"></div>
      `;
    }

    calendarHTML += `
      </div>
      <div class="calendar-legend">
        <span class="calendar-legend-label">${typeof t === "function" ? (getCurrentLanguage() === "fi" ? "Vähemmän" : "Less") : "Less"}</span>
        <div class="calendar-legend-scale">
          <div class="calendar-legend-box level-0"></div>
          <div class="calendar-legend-box level-1"></div>
          <div class="calendar-legend-box level-2"></div>
          <div class="calendar-legend-box level-3"></div>
          <div class="calendar-legend-box level-4"></div>
          <div class="calendar-legend-box level-5"></div>
        </div>
        <span class="calendar-legend-label">${typeof t === "function" ? (getCurrentLanguage() === "fi" ? "Enemmän" : "More") : "More"}</span>
      </div>
    `;

    calendarDiv.innerHTML = calendarHTML;
  }

  // Expose renderMonthlyCalendar to window for onclick handlers
  window.renderMonthlyCalendar = renderMonthlyCalendar;

  // Helper function to get chart colors based on current theme
  function getChartColors() {
    const theme = document.body.getAttribute("data-theme") || "blossom";
    if (theme === "midnight") {
      return {
        background: "#0f172a",
        text: "#f8fafc",
        muted: "#cbd5e1",
      };
    }
    return {
      background: "#ffffff",
      text: "#1f2937",
      muted: "#6b7280",
    };
  }

  // Helper function to draw rounded rectangles
  function drawRoundedRect(ctx, x, y, width, height, radius = 8) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
  }

  function drawBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Set higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const w = rect.width,
      h = rect.height;

    const chartColors = getChartColors();

    // Dynamic background based on theme
    ctx.fillStyle = chartColors.background;
    ctx.fillRect(0, 0, w, h);

    const max = Math.max(...data.map((d) => d.value), 1);
    const barWidth = w / data.length - 20;
    const spacing = 20;

    data.forEach((d, i) => {
      const barHeight = (d.value / max) * (h - 60);
      const x = i * (barWidth + spacing) + spacing;
      const y = h - barHeight - 30;

      ctx.fillStyle = d.color;
      drawRoundedRect(ctx, x, y, barWidth, barHeight, 6);

      ctx.fillStyle = chartColors.text;
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.label, x + barWidth / 2, h - 12);
      ctx.fillText(d.value, x + barWidth / 2, y - 6);
    });
  }

  function drawLineChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Set higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const w = rect.width,
      h = rect.height;

    const chartColors = getChartColors();

    // Dynamic background based on theme
    ctx.fillStyle = chartColors.background;
    ctx.fillRect(0, 0, w, h);

    // Find max value across filtered types only
    const filteredTypes = getFilteredActivityTypes();
    const filteredTypeIds = filteredTypes.map((t) => t.id);
    const max = Math.max(
      ...data.map((d) => Math.max(...filteredTypeIds.map((id) => d[id] || 0))),
      1,
    );
    const step = w / (data.length - 1 || 1);

    // Helper function to draw a smooth line
    const drawLine = (type, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = i * step;
        const y = h - 40 - ((d[type] || 0) / max) * (h - 70);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic curves for smooth lines
          const prevX = (i - 1) * step;
          const prevY = h - 40 - ((data[i - 1][type] || 0) / max) * (h - 70);
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
        }
      });

      // Draw final segment
      if (data.length > 1) {
        const lastIdx = data.length - 1;
        const x = lastIdx * step;
        const y = h - 40 - ((data[lastIdx][type] || 0) / max) * (h - 70);
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    // Draw subtle grid lines for each hour to show all 24 hours are represented
    ctx.strokeStyle = chartColors.muted + "20"; // Very subtle grid lines
    ctx.lineWidth = 1;
    data.forEach((d, i) => {
      const x = i * step;
      ctx.beginPath();
      ctx.moveTo(x, 30);
      ctx.lineTo(x, h - 40);
      ctx.stroke();
    });

    // Draw lines for each filtered action type dynamically
    filteredTypes.forEach((type) => {
      drawLine(type.id, type.color);
    });

    // Draw time labels - show more hours to make it clearer all 24 are included
    ctx.fillStyle = chartColors.muted;
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const showEvery = Math.max(1, Math.ceil(data.length / 8)); // Show more labels
    data.forEach((d, i) => {
      if (i % showEvery === 0 || i === data.length - 1) {
        // Always show first and last
        const x = i * step;
        const hour = d.hour;
        const timeLabel =
          hour === 0
            ? "12am"
            : hour < 12
              ? hour + "am"
              : hour === 12
                ? "12pm"
                : hour - 12 + "pm";
        ctx.fillText(timeLabel, x, h - 10);
      }
    });
  }

  function drawStackedBarChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Set higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const w = rect.width,
      h = rect.height;

    const chartColors = getChartColors();

    // Dynamic background based on theme
    ctx.fillStyle = chartColors.background;
    ctx.fillRect(0, 0, w, h);

    // Calculate totals dynamically
    const allTypeIds = actionTypes.map((t) => t.id);
    const maxTotal = Math.max(
      ...data.map((d) => allTypeIds.reduce((sum, id) => sum + (d[id] || 0), 0)),
      1,
    );
    const barWidth = w / data.length - 16;
    const spacing = 16;

    data.forEach((d, i) => {
      const scale = (h - 60) / maxTotal;
      const x = i * (barWidth + spacing) + spacing / 2;
      let y = h - 30;

      // Draw stacked segments for each action type (reverse order so first type is on top)
      [...actionTypes].reverse().forEach((type) => {
        const segmentH = (d[type.id] || 0) * scale;
        ctx.fillStyle = type.color;
        drawRoundedRect(ctx, x, y - segmentH, barWidth, segmentH, 4);
        y -= segmentH;
      });

      // Label
      ctx.fillStyle = chartColors.muted;
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.day, x + barWidth / 2, h - 10);
    });
  }
  function drawIntervalChart(canvasId, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    // Set higher resolution for better quality
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    const w = rect.width,
      h = rect.height;

    const chartColors = getChartColors();

    // Dynamic background based on theme
    ctx.fillStyle = chartColors.background;
    ctx.fillRect(0, 0, w, h);

    const padding = { top: 40, right: 30, bottom: 50, left: 30 };
    const chartWidth = w - padding.left - padding.right;
    const chartHeight = h - padding.top - padding.bottom;

    // Filter out activities with no data
    const validData = data.filter((d) => d.intervalCount > 0);

    if (validData.length === 0) {
      const needMoreMsg =
        typeof t === "function"
          ? t("needMoreActivities")
          : "Need more activities to show intervals";
      ctx.fillStyle = chartColors.text;
      ctx.font = "14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(needMoreMsg, w / 2, h / 2);
      return;
    }

    // Find max interval for scaling
    const maxInterval = Math.max(...validData.map((d) => d.avgInterval));

    // Draw bars for each activity type
    const barWidth = chartWidth / validData.length;
    validData.forEach((item, index) => {
      const x = padding.left + index * barWidth;
      const barHeight = (item.avgInterval / maxInterval) * chartHeight;
      const y = padding.top + chartHeight - barHeight;

      // Draw bar with activity type color
      ctx.fillStyle = item.type.color;
      drawRoundedRect(
        ctx,
        x + barWidth * 0.15,
        y,
        barWidth * 0.7,
        barHeight,
        4,
      );

      // Activity label (horizontal, under bar)
      ctx.fillStyle = chartColors.text;
      ctx.font = "11px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        getActionTypeName(item.type),
        x + barWidth / 2,
        h - padding.bottom + 15,
      );

      // Interval time label above bar
      ctx.font = "12px sans-serif";
      ctx.fillText(item.label, x + barWidth / 2, y - 10);

      // Activity emoji in center of bar
      ctx.font = "18px sans-serif";
      if (barHeight > 30) {
        ctx.fillText(item.type.emoji, x + barWidth / 2, y + barHeight / 2 + 6);
      }
    });

    // Title
    // Removed for cleaner appearance
  }
  function renderLog() {
    const source = entries;
    const filterVal = dateFilter.value ? new Date(dateFilter.value) : null;
    const list = filterVal
      ? source.filter((e) => isSameDay(e.timestamp, filterVal))
      : source;
    const counts = countByType(list);

    // Update summary text with dynamic types
    if (summaryEl) {
      if (list.length) {
        const countParts = actionTypes
          .map((type) => `${getActionTypeName(type)} ${counts[type.id] || 0}`)
          .join(", ");
        const showingLabel = typeof t === "function" ? t("showing") : "Showing";
        const entriesLabel = typeof t === "function" ? t("entries") : "entries";
        summaryEl.textContent = `${showingLabel} ${list.length} ${entriesLabel} — ${countParts}`;
      } else {
        const noEntriesLabel =
          typeof t === "function" ? t("noEntriesYet") : "No entries yet";
        summaryEl.textContent = noEntriesLabel;
      }
    }

    // Render log entries as cards
    logEntries.innerHTML = "";
    if (list.length === 0) {
      return; // Summary already shows "No entries yet"
    }

    // Add swipe instructions
    if (list.length > 0) {
      const instructions = document.createElement("div");
      instructions.className = "swipe-instructions";
      instructions.innerHTML = `<span style="opacity: 0.6;">💡 Swipe right to edit • Swipe left to delete</span>`;
      logEntries.appendChild(instructions);
    }

    list
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((e) => {
        const card = document.createElement("div");
        card.className = "log-entry-wrapper";
        card.innerHTML = `
          <div class="log-entry-actions-bg">
            <div class="log-entry-action-left" data-edit="${e.id}">
              <div class="log-entry-action-icon">✏️</div>
              <div class="log-entry-action-label">${typeof t === "function" ? t("edit") : "Edit"}</div>
            </div>
            <div class="log-entry-action-right" data-del="${e.id}">
              <div class="log-entry-action-icon">🗑️</div>
              <div class="log-entry-action-label">${typeof t === "function" ? t("delete") : "Delete"}</div>
            </div>
          </div>
          <div class="log-entry" data-entry-id="${e.id}">
            <div class="log-entry-icon ${e.type}" style="background-color: ${getTypeColor(e.type)}">${getTypeEmoji(e.type)}</div>
            <div class="log-entry-content">
              <div class="log-entry-type">${getTypeName(e.type)}</div>
              <div class="log-entry-time">${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</div>
              ${e.note ? `<div class="log-entry-note">${escapeHtml(e.note)}</div>` : ""}
            </div>
          </div>
        `;
        logEntries.appendChild(card);
      });

    // Initialize swipe handlers
    initSwipeHandlers();
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  }

  // Swipe handler for log entries
  function initSwipeHandlers() {
    const entries = document.querySelectorAll(".log-entry");

    entries.forEach((entry) => {
      let startX = 0;
      let startY = 0;
      let currentX = 0;
      let isDragging = false;
      let hasMoved = false;
      let swipeEnabled = false;
      const wrapper = entry.closest(".log-entry-wrapper");
      const actionLeft = wrapper.querySelector(".log-entry-action-left");
      const actionRight = wrapper.querySelector(".log-entry-action-right");

      const onStart = (e) => {
        // Check if clicking on action buttons
        if (e.target.closest(".log-entry-actions-bg")) return;

        startX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
        currentX = startX;
        isDragging = true;
        hasMoved = false;
        swipeEnabled = false;
        entry.style.transition = "none";
        if (actionLeft) actionLeft.style.transition = "none";
        if (actionRight) actionRight.style.transition = "none";
      };

      const onMove = (e) => {
        if (!isDragging) return;

        currentX = e.type.includes("mouse") ? e.clientX : e.touches[0].clientX;
        const currentY = e.type.includes("mouse")
          ? e.clientY
          : e.touches[0].clientY;
        const diffX = currentX - startX;
        const diffY = currentY - startY;

        // Determine if movement is horizontal (swipe) or vertical (scroll)
        if (!swipeEnabled && (Math.abs(diffX) > 8 || Math.abs(diffY) > 8)) {
          // Enable swipe only if horizontal movement dominates
          swipeEnabled = Math.abs(diffX) > Math.abs(diffY) * 1.5;
          if (!swipeEnabled) {
            // It's a scroll, not a swipe
            isDragging = false;
            return;
          }
        }

        if (!swipeEnabled) return;

        if (Math.abs(diffX) > 5) {
          hasMoved = true;
          e.preventDefault();
        }

        // Limit swipe distance
        const maxSwipe = 120;
        const limitedDiff = Math.max(-maxSwipe, Math.min(maxSwipe, diffX));
        entry.style.transform = `translate3d(${limitedDiff}px, 0, 0)`;

        // Expand action backgrounds based on swipe distance
        if (diffX > 0) {
          // Swiping right - show edit
          const width = Math.min(Math.abs(limitedDiff), maxSwipe);
          if (actionLeft) {
            actionLeft.style.width = `${width}px`;
            if (width > 40) {
              actionLeft.classList.add("visible");
            } else {
              actionLeft.classList.remove("visible");
            }
          }
          if (actionRight) {
            actionRight.style.width = "0";
            actionRight.classList.remove("visible");
          }
        } else if (diffX < 0) {
          // Swiping left - show delete
          const width = Math.min(Math.abs(limitedDiff), maxSwipe);
          if (actionRight) {
            actionRight.style.width = `${width}px`;
            if (width > 40) {
              actionRight.classList.add("visible");
            } else {
              actionRight.classList.remove("visible");
            }
          }
          if (actionLeft) {
            actionLeft.style.width = "0";
            actionLeft.classList.remove("visible");
          }
        }
      };

      const onEnd = () => {
        if (!isDragging) return;
        isDragging = false;

        const diff = currentX - startX;
        const threshold = 60;

        if (swipeEnabled && Math.abs(diff) > threshold) {
          // Action triggered - execute immediately
          if (diff > threshold) {
            // Swiped right - Edit
            const entryId = entry.getAttribute("data-entry-id");
            openEditModal(entryId);
            // Reset position and styles
            entry.style.transition = "transform 0.2s ease-out";
            if (actionLeft) actionLeft.style.transition = "all 0.2s ease-out";
            if (actionRight) actionRight.style.transition = "all 0.2s ease-out";
          } else {
            // Swiped left - Delete with animation
            const entryId = entry.getAttribute("data-entry-id");
            // Animate card out
            wrapper.style.transition =
              "opacity 0.3s ease-out, transform 0.3s ease-out, max-height 0.3s ease-out";
            wrapper.style.opacity = "0";
            wrapper.style.transform = "translateX(-100%)";
            wrapper.style.maxHeight = wrapper.offsetHeight + "px";
            setTimeout(() => {
              wrapper.style.maxHeight = "0";
              wrapper.style.marginBottom = "0";
            }, 50);

            // Delete after animation
            setTimeout(() => {
              deleteEntry(entryId);
            }, 350);
            return; // Don't reset position for delete
          }
        }

        // Reset position and styles (for swipes that don't trigger action)
        entry.style.transition = "transform 0.2s ease-out";
        if (actionLeft) actionLeft.style.transition = "all 0.2s ease-out";
        if (actionRight) actionRight.style.transition = "all 0.2s ease-out";

        entry.style.transform = "";
        if (actionLeft) {
          actionLeft.style.width = "0";
          actionLeft.classList.remove("visible");
        }
        if (actionRight) {
          actionRight.style.width = "0";
          actionRight.classList.remove("visible");
        }
      };

      // Touch events
      entry.addEventListener("touchstart", onStart, { passive: true });
      entry.addEventListener("touchmove", onMove, { passive: false });
      entry.addEventListener("touchend", onEnd);
      entry.addEventListener("touchcancel", onEnd);

      // Mouse events (for trackpad)
      const onMouseMove = (e) => {
        if (isDragging) {
          onMove(e);
        }
      };

      const onMouseUp = () => {
        if (isDragging) {
          onEnd();
        }
      };

      entry.addEventListener("mousedown", onStart);

      // Add listeners to document for mouse movement
      entry._onMouseMove = onMouseMove;
      entry._onMouseUp = onMouseUp;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  }

  // Export entries to CSV
  window.exportToCSV = function () {
    const src = entries;
    if (src.length === 0) {
      const noEntriesMsg =
        typeof t === "function"
          ? t("noEntriesToExport")
          : "No entries to export";
      toast(noEntriesMsg);
      return;
    }

    // CSV header
    let csv = "Date,Time,Activity,Note\n";

    // Sort by timestamp (newest first) and add rows
    src
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((e) => {
        const date = formatDate(e.timestamp);
        const time = formatTime(e.timestamp);
        const activity = getTypeName(e.type);
        const note = (e.note || "").replace(/"/g, '""'); // Escape quotes

        csv += `"${date}","${time}","${activity}","${note}"\n`;
      });

    // Create download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const filename = `baby-log-${new Date().toISOString().split("T")[0]}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(`✓ Exported ${src.length} entries`);
  };

  // Export complete backup as JSON
  window.exportToJSON = function () {
    const backup = {
      version: "1.0",
      exportDate: new Date().toISOString(),
      entries: entries,
      actionTypes: actionTypes,
      settings: {
        theme: settings.theme || "blossom",
        font: settings.font || "roboto",
        webAppUrl: settings.webAppUrl || "",
        syncEnabled: settings.syncEnabled || false,
      },
      selectedActivities: Array.from(selectedActivities || new Set()),
    };

    const json = JSON.stringify(backup, null, 2);
    const blob = new Blob([json], { type: "application/json;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const filename = `baby-schedule-backup-${new Date().toISOString().split("T")[0]}.json`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast(
      `✓ Complete backup exported (${entries.length} entries, settings, activities)`,
    );
  };

  function importFromCSV(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const csv = e.target.result;
        const lines = csv.split("\n");

        // Skip header row
        const dataLines = lines.slice(1).filter((line) => line.trim());

        let imported = 0;
        dataLines.forEach((line) => {
          // Simple CSV parsing (handles quoted fields)
          const matches = line.match(/("(?:[^"]|"")*"|[^,]*)/g);
          if (!matches || matches.length < 3) return;

          const date = matches[0].replace(/^"|"$/g, "").trim();
          const time = matches[1].replace(/^"|"$/g, "").trim();
          const activity = matches[2].replace(/^"|"$/g, "").trim();
          const note = matches[3]
            ? matches[3].replace(/^"|"$/g, "").replace(/""/g, '"').trim()
            : "";

          // Parse date and time
          const dateTimeStr = `${date} ${time}`;
          const timestamp = new Date(dateTimeStr).getTime();

          if (isNaN(timestamp)) return;

          // Find matching activity type (case insensitive)
          const type = actionTypes.find(
            (t) => t.name.toLowerCase() === activity.toLowerCase(),
          );

          if (!type) return;

          // Check if entry already exists (by timestamp and type)
          const exists = entries.some(
            (e) =>
              Math.abs(e.timestamp - timestamp) < 60000 && e.type === type.id,
          );

          if (exists) return;

          // Create entry
          const entry = {
            id: `${timestamp}_${Math.random().toString(36).slice(2, 8)}`,
            type: type.id,
            note: note,
            timestamp: timestamp,
            synced: false,
          };

          entries.push(entry);
          imported++;
        });

        if (imported > 0) {
          saveEntries(entries);
          updateStatus();
          renderHomeScreen();
          toast(`✓ Imported ${imported} entries`);

          // Trigger background sync
          backgroundSync();
        } else {
          toast("No new entries found in CSV");
        }
      } catch (err) {
        toast("Error importing CSV - check file format");
      }
    };

    reader.readAsText(file);
  }

  function importFromJSON(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const backup = JSON.parse(e.target.result);

        // Validate backup format
        if (!backup.version || !backup.entries || !backup.actionTypes) {
          toast("Invalid backup file format");
          return;
        }

        let importedEntries = 0;
        let importedSettings = false;

        // Import entries (merge with existing, avoid duplicates)
        if (backup.entries && Array.isArray(backup.entries)) {
          backup.entries.forEach((entry) => {
            // Check if entry already exists (by ID or timestamp+type)
            const exists = entries.some(
              (e) =>
                e.id === entry.id ||
                (Math.abs(e.timestamp - entry.timestamp) < 60000 &&
                  e.type === entry.type),
            );

            if (!exists && entry.id && entry.type && entry.timestamp) {
              entries.push({
                id: entry.id,
                type: entry.type,
                note: entry.note || "",
                timestamp: entry.timestamp,
                synced: false, // Mark as unsynced
              });
              importedEntries++;
            }
          });
        }

        // Import action types (merge with existing, avoid duplicates)
        if (backup.actionTypes && Array.isArray(backup.actionTypes)) {
          backup.actionTypes.forEach((actionType) => {
            const exists = actionTypes.some((a) => a.id === actionType.id);
            if (!exists && actionType.id && actionType.name) {
              actionTypes.push({
                id: actionType.id,
                name: actionType.name,
                emoji: actionType.emoji || "📝",
                color: actionType.color || "#3b82f6",
              });
            }
          });
        }

        // Import settings
        if (backup.settings) {
          if (backup.settings.theme) {
            settings.theme = backup.settings.theme;
            applyTheme(backup.settings.theme);
            importedSettings = true;
          }
          if (backup.settings.font) {
            settings.font = backup.settings.font;
            applyFont(backup.settings.font);
            importedSettings = true;
          }
          if (backup.settings.webAppUrl !== undefined) {
            settings.webAppUrl = backup.settings.webAppUrl;
            settings.syncEnabled = backup.settings.syncEnabled || false;
            importedSettings = true;
          }
        }

        // Import selected activities filter
        if (
          backup.selectedActivities &&
          Array.isArray(backup.selectedActivities)
        ) {
          selectedActivities = new Set(backup.selectedActivities);
        }

        // Save everything
        if (importedEntries > 0) {
          saveEntries(entries);
        }
        saveActionTypes(actionTypes);
        if (importedSettings) {
          saveSettings(settings);
        }

        // Update UI
        updateStatus();
        renderHomeScreen();
        if (typeof renderActionTypes === "function") {
          renderActionTypes();
        }

        // Show success message
        let message = `✓ Backup restored!`;
        if (importedEntries > 0) message += ` ${importedEntries} entries`;
        if (importedSettings) message += `, settings`;
        toast(message);

        // Trigger background sync if entries were imported
        if (importedEntries > 0) {
          backgroundSync();
        }
      } catch (err) {
        console.error("Import error:", err);
        toast("Error importing backup - invalid JSON format");
      }
    };

    reader.readAsText(file);
  }

  function deleteEntry(id) {
    // Remove from local entries immediately
    const index = entries.findIndex((e) => e.id === id);
    if (index === -1) return;

    const deleted = entries.splice(index, 1)[0];
    saveEntries(entries);

    // Add to delete queue for background sync
    deleteQueue.push(id);
    saveDeletes(deleteQueue);
    syncQueue.push({ type: "delete", id, queuedAt: Date.now() });
    saveSyncQueue(syncQueue);

    // Immediate UI update
    haptics(8);
    toast(`Deleted ${deleted.type} entry`);
    updateStatus();

    // Update open screens immediately
    if (!logScreen.hidden) {
      renderLogSummary();
      // Remove only the deleted card from DOM instead of rebuilding
      const cardToRemove = logEntries.querySelector(`[data-entry-id="${id}"]`);
      if (cardToRemove) {
        const wrapper = cardToRemove.closest(".log-entry-wrapper");
        if (wrapper) {
          wrapper.remove();
        }
      }
      // If no entries left, show empty state
      const remainingCards = logEntries.querySelectorAll(".log-entry-wrapper");
      if (remainingCards.length === 0) {
        logEntries.innerHTML = "";
      }
    }
    if (!insightsScreen.hidden) renderGraphs();

    // Trigger background sync
    backgroundSync();
  }

  // Open edit modal with entry data
  function openEditModal(entryId) {
    const entry = entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Populate the modal with entry data
    editingEntryId.value = entry.id;

    // Populate activity type dropdown
    editEntryType.innerHTML = "";
    actionTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = `${getTypeEmoji(type.id)} ${getActionTypeName(type)}`;
      if (type.id === entry.type) {
        option.selected = true;
      }
      editEntryType.appendChild(option);
    });

    // Convert timestamp to date and time
    const date = new Date(entry.timestamp);
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().slice(0, 5);

    editEntryDate.value = dateStr;
    editEntryTime.value = timeStr;
    editEntryNote.value = entry.note || "";

    // Show the modal
    editEntryModal.hidden = false;
    haptics(5);
  }

  // Close edit modal
  function closeEditModal() {
    editEntryModal.hidden = true;
    editingEntryId.value = "";
    editEntryType.value = "";
    editEntryDate.value = "";
    editEntryTime.value = "";
    editEntryNote.value = "";
  }

  // Update entry with new data
  function updateEntry() {
    const oldEntryId = editingEntryId.value;
    const newType = editEntryType.value;
    const newDate = editEntryDate.value;
    const newTime = editEntryTime.value;
    const newNote = editEntryNote.value;

    if (!oldEntryId || !newType || !newDate || !newTime) {
      const fillAllFieldsMsg =
        typeof t === "function"
          ? t("fillAllFields")
          : "Please fill all required fields";
      toast(fillAllFieldsMsg);
      return;
    }

    // Find the entry
    const index = entries.findIndex((e) => e.id === oldEntryId);
    if (index === -1) {
      const entryNotFoundMsg =
        typeof t === "function" ? t("entryNotFound") : "Entry not found";
      toast(entryNotFoundMsg);
      closeEditModal();
      return;
    }

    // Create new timestamp from date and time
    const newTimestamp = new Date(`${newDate}T${newTime}`).getTime();

    // Generate a NEW ID for the edited entry
    const newEntryId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Create the updated entry with a NEW ID
    const updatedEntry = {
      id: newEntryId,
      type: newType,
      timestamp: newTimestamp,
      note: newNote,
      synced: false, // Mark as not synced
    };

    // Replace the old entry with the new one
    entries[index] = updatedEntry;

    // Save to localStorage
    saveEntries(entries);

    // Add to delete queue - delete the OLD entry from Google Sheets
    deleteQueue.push(oldEntryId);
    saveDeletes(deleteQueue);

    // Add to sync queue - delete old, create new
    syncQueue.push({ type: "delete", id: oldEntryId, queuedAt: Date.now() });
    syncQueue.push({
      type: "create",
      entry: updatedEntry,
      queuedAt: Date.now(),
    });
    saveSyncQueue(syncQueue);

    // Immediate UI update
    haptics(15);
    const actionType = getActionTypeById(newType);
    const actionName = actionType
      ? getActionTypeName(actionType)
      : capitalize(newType);
    const updatedText = typeof t === "function" ? t("updated") : "updated";
    toast(`${actionName} ${updatedText}`);
    updateStatus();

    // Update open screens immediately
    if (!logScreen.hidden) {
      renderLogSummary();
      renderLog();
    }
    if (!insightsScreen.hidden) renderGraphs();

    // Close modal
    closeEditModal();

    // Trigger background sync
    backgroundSync();
  }

  // FAB (Floating Action Button) functions
  function toggleFAB() {
    if (fabContainer && fabBackdrop) {
      const isActive = fabContainer.classList.toggle("active");
      if (isActive) {
        fabBackdrop.classList.add("active");
      } else {
        fabBackdrop.classList.remove("active");
      }
      haptics(5);
    }
  }

  function closeFAB() {
    if (fabContainer && fabBackdrop) {
      fabContainer.classList.remove("active");
      fabBackdrop.classList.remove("active");
    }
  }

  // Open past entry modal
  function openPastEntryModal() {
    // Populate activity type dropdown
    pastEntryType.innerHTML = "";
    actionTypes.forEach((type) => {
      const option = document.createElement("option");
      option.value = type.id;
      option.textContent = `${type.emoji} ${getActionTypeName(type)}`;
      pastEntryType.appendChild(option);
    });

    // Set default date to today and time to now
    const now = new Date();
    pastEntryDate.value = now.toISOString().split("T")[0];
    pastEntryTime.value = now.toTimeString().slice(0, 5);
    pastEntryNote.value = "";

    // Show the modal
    logPastEntryModal.hidden = false;
    closeFAB();
    haptics(5);
  }

  // Close past entry modal
  function closePastEntryModal() {
    logPastEntryModal.hidden = true;
    pastEntryType.value = "";
    pastEntryDate.value = "";
    pastEntryTime.value = "";
    pastEntryNote.value = "";
  }

  // Log past entry
  function logPastEntry() {
    const type = pastEntryType.value;
    const date = pastEntryDate.value;
    const time = pastEntryTime.value;
    const note = pastEntryNote.value;

    if (!type || !date || !time) {
      const fillAllFieldsMsg =
        typeof t === "function"
          ? t("fillAllFields")
          : "Please fill all required fields";
      toast(fillAllFieldsMsg);
      return;
    }

    // Create timestamp from date and time
    const timestamp = new Date(`${date}T${time}`).getTime();

    // Validate that the timestamp is not in the future
    if (timestamp > Date.now()) {
      const cannotLogFutureMsg =
        typeof t === "function"
          ? t("cannotLogFuture")
          : "Cannot log future entries";
      toast(cannotLogFutureMsg);
      return;
    }

    // Create the entry
    const entry = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      note: note || "",
      timestamp: timestamp,
      synced: false,
    };

    entries.push(entry);
    saveEntries(entries);

    // Add to sync queue
    syncQueue.push({ type: "create", entry, queuedAt: Date.now() });
    saveSyncQueue(syncQueue);

    // Immediate UI update
    haptics(15);
    const actionType = getActionTypeById(type);
    const actionName = actionType
      ? getActionTypeName(actionType)
      : capitalize(type);
    const loggedText = typeof t === "function" ? t("logged") : "logged";
    toast(`${actionName} ${loggedText}`);
    updateStatus();

    // Update open screens immediately
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();

    // Close modal
    closePastEntryModal();

    // Trigger background sync
    backgroundSync();
  }

  // Button press feedback (visual + haptics on pointer)
  function attachPressFeedback(el) {
    if (!el) return;
    el.addEventListener("pointerdown", () => {
      el.classList.add("pressed");
      haptics(6);
    });
    const clear = () => el.classList.remove("pressed");
    el.addEventListener("pointerup", clear);
    el.addEventListener("pointerleave", clear);
    el.addEventListener("pointercancel", clear);
  }
  [
    ...$$(".action"),
    undoBtn,
    viewGraphsBtn,
    viewLogBtn,
    saveSettingsBtn,
    clearFilterBtn,
    closeGraphsBtn,
    closeLogBtn,
    openSettingsBtn,
  ].forEach(attachPressFeedback);

  // Background sync: push local changes to Sheets and pull remote changes
  async function backgroundSync() {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl || isSyncing) {
      return;
    }

    isSyncing = true;
    const hadPendingChanges = syncQueue.length > 0;

    try {
      // Step 1: Push local changes (sync queue)
      if (syncQueue.length > 0) {
        const createOps = syncQueue.filter((op) => op.type === "create");
        const deleteOps = syncQueue.filter((op) => op.type === "delete");

        // Push creates
        if (createOps.length > 0) {
          await maybeSync(createOps.map((op) => op.entry));
          // Remove successfully synced operations
          syncQueue = syncQueue.filter(
            (op) => op.type !== "create" || !createOps.includes(op),
          );
          saveSyncQueue(syncQueue);
        }

        // Push deletes
        if (deleteOps.length > 0) {
          await maybeDelete(deleteOps.map((op) => op.id));
          // Remove successfully synced deletes
          syncQueue = syncQueue.filter(
            (op) => op.type !== "delete" || !deleteOps.includes(op),
          );
          saveSyncQueue(syncQueue);
        }
      }

      // Step 2: Pull remote changes and merge
      await pullAndMergeRemote();

      setLastSyncTime(Date.now());
    } catch (err) {
      // Silently fail - will retry on next sync attempt
    } finally {
      isSyncing = false;
    }
  }

  async function syncActionTypesToSheet() {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl) return;

    try {
      // Use URL parameters for GET request
      const url = new URL(cfg.webAppUrl);
      url.searchParams.set("action", "saveActionTypes");
      url.searchParams.set("data", JSON.stringify(actionTypes));

      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
      });

      if (response.ok) {
        const result = await response.json();
        if (result.status === "ok") {
          toast("✓ Activities synced to Google Sheets");
        }
      } else {
        throw new Error("Response not OK");
      }
    } catch (err) {
      toast("⚠️ Failed to sync activities to Google Sheets");
    }
  }

  // Pull remote entries and merge with local
  async function pullAndMergeRemote() {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl) return;

    let remoteEntries = null;

    // Try to fetch from Sheets
    try {
      const url = new URL(cfg.webAppUrl);
      url.searchParams.set("action", "list");
      url.searchParams.set("t", String(Date.now()));
      const res = await fetch(url.toString(), { method: "GET", mode: "cors" });
      if (res.ok) {
        const data = await res.json();
        // New API response format with action types
        if (data.entries && Array.isArray(data.entries)) {
          remoteEntries = normalizeRemote(data.entries);
          // Update action types if provided and different
          if (
            data.actionTypes &&
            Array.isArray(data.actionTypes) &&
            data.actionTypes.length > 0
          ) {
            const currentTypesJson = JSON.stringify(actionTypes);
            const newTypesJson = JSON.stringify(data.actionTypes);

            if (currentTypesJson !== newTypesJson) {
              actionTypes = data.actionTypes;
              saveActionTypes(actionTypes);
              renderHomeScreen();
              renderActionTypes();
            }
          }
        } else if (Array.isArray(data)) {
          // Legacy format - just entries array
          remoteEntries = normalizeRemote(data);
        }
      }
    } catch {
      // Fallback to JSONP
      try {
        const data = await jsonpList(cfg.webAppUrl);
        if (data) {
          // Check for new format
          if (data.entries) {
            remoteEntries = normalizeRemote(data.entries || []);
            if (
              data.actionTypes &&
              Array.isArray(data.actionTypes) &&
              data.actionTypes.length > 0
            ) {
              const currentTypesJson = JSON.stringify(actionTypes);
              const newTypesJson = JSON.stringify(data.actionTypes);

              if (currentTypesJson !== newTypesJson) {
                actionTypes = data.actionTypes;
                saveActionTypes(actionTypes);
                renderHomeScreen();
                renderActionTypes();
              }
            }
          } else {
            // Legacy format
            remoteEntries = normalizeRemote(data || []);
          }
        }
      } catch {
        // Sync failed silently - keep using local data
        return;
      }
    }

    if (!remoteEntries) return;

    // Merge: Add remote entries not in local
    const localIds = new Set(entries.map((e) => e.id));
    const newRemoteEntries = remoteEntries.filter((e) => !localIds.has(e.id));

    if (newRemoteEntries.length > 0) {
      entries.push(...newRemoteEntries);
      entries.sort((a, b) => b.timestamp - a.timestamp);
      saveEntries(entries);

      // Show notification for new entries from other devices
      if (newRemoteEntries.length === 1) {
        toast(`Synced 1 new entry from another device`);
      } else {
        toast(
          `Synced ${newRemoteEntries.length} new entries from other devices`,
        );
      }

      // Update UI
      updateStatus();
      renderRecentActivity();
      if (!logScreen.hidden) {
        renderLogSummary();
        renderLog();
      }
      if (!insightsScreen.hidden) renderGraphs();
    }
  }

  // Load entries from Google Sheets (if sync enabled). Fallback to local on failure.
  async function maybeLoadRemoteEntries() {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl) {
      remoteEntries = null;
      setLoading(false);
      return;
    }
    // Try JSON over CORS first
    try {
      const url = new URL(cfg.webAppUrl);
      url.searchParams.set("action", "list");
      url.searchParams.set("t", String(Date.now()));
      const res = await fetch(url.toString(), { method: "GET", mode: "cors" });
      if (!res.ok) throw new Error("non-ok");
      const data = await res.json();
      if (Array.isArray(data)) {
        remoteEntries = normalizeRemote(data);
        setLoading(false);
        toast(`Loaded ${remoteEntries.length} from Sheets`);
        return;
      }
      throw new Error("bad-json");
    } catch {
      // Fallback to JSONP
      try {
        const data = await jsonpList(loadSettings().webAppUrl);
        remoteEntries = normalizeRemote(data || []);
        setLoading(false);
        toast(`Loaded ${remoteEntries.length} from Sheets`);
        return;
      } catch {
        remoteEntries = null;
        setLoading(false);
        // Remote-only mode: inform user about failure
        toast("Couldn't load from Sheets");
      }
    }
  }

  function normalizeRemote(arr) {
    return arr
      .map((r) => {
        // Handle both uppercase (Google Sheets format) and lowercase property names
        const id = String(r.id || r.ID || "");
        const type = String(r.type || r.Type || "");
        const note = String(r.note || r.Note || "");

        // Handle timestamp from multiple possible formats
        let timestamp = 0;
        if (r.timestamp) {
          timestamp = Number(r.timestamp);
        } else if (r.Timestamp) {
          // Google Sheets date object - convert to timestamp
          timestamp = new Date(r.Timestamp).getTime();
        } else if (r.iso || r.ISO) {
          // Parse from ISO string
          timestamp = Date.parse(r.iso || r.ISO);
        }

        return {
          id,
          type,
          note,
          timestamp: timestamp || 0,
          synced: true,
        };
      })
      .filter((e) => e.id && e.timestamp)
      .sort((a, b) => b.timestamp - a.timestamp);
  }

  function jsonpList(baseUrl) {
    return new Promise((resolve, reject) => {
      const cb = `__babylog_cb_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2)}`;
      const url = new URL(baseUrl);
      url.searchParams.set("action", "list");
      url.searchParams.set("callback", cb);
      url.searchParams.set("t", String(Date.now()));
      const script = document.createElement("script");
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error("jsonp-timeout"));
      }, 8000);
      function cleanup() {
        clearTimeout(timeout);
        delete window[cb];
        if (script.parentNode) script.parentNode.removeChild(script);
      }
      window[cb] = (data) => {
        cleanup();
        resolve(data);
      };
      script.onerror = () => {
        cleanup();
        reject(new Error("jsonp-error"));
      };
      script.src = url.toString();
      document.head.appendChild(script);
    });
  }

  // Sync to Google Apps Script (Sheets)
  async function maybeSync(list) {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl) return;

    async function sendOne(e) {
      const payload = {
        action: "create",
        id: e.id,
        type: e.type,
        note: e.note || "",
        timestamp: e.timestamp,
        iso: new Date(e.timestamp).toISOString(),
        source: "babylog-web",
      };
      // Use a simple request that avoids CORS preflight (no-cors + text/plain)
      try {
        const response = await fetch(cfg.webAppUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
          keepalive: true,
          credentials: "omit",
        });
        // We can't read the response (opaque), assume delivery and verify via read-back
        return "opaque";
      } catch (err) {
        return "fail";
      }
    }

    const results = await Promise.all(list.map(sendOne));
    let changed = false;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      const r = results[i];
      if (r === "ok" || r === "opaque") {
        // assume success on opaque to avoid duplicate rows
        const found = entries.find((x) => x.id === e.id);
        if (found && !found.synced) {
          found.synced = true;
          changed = true;
        }
      }
    }
    if (changed) saveEntries(entries);
  }

  // Delete from Google Sheets by ID (Apps Script must support delete)
  async function maybeDelete(ids) {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl || !ids?.length) return;

    async function deleteOne(id) {
      const payload = { action: "delete", id };
      try {
        await fetch(cfg.webAppUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
          keepalive: true,
          credentials: "omit",
        });
        return "opaque";
      } catch {
        return "fail";
      }
    }

    const results = await Promise.all(ids.map(deleteOne));
    // Remove successfully processed ids from queue
    const keep = new Set();
    for (let i = 0; i < ids.length; i++) {
      if (results[i] === "fail") keep.add(ids[i]);
    }
    deleteQueue = deleteQueue.filter((id) => keep.has(id));
    saveDeletes(deleteQueue);
  }

  async function syncAll() {
    const unsynced = entries.filter((e) => !e.synced);
    if (!unsynced.length) {
      toast("All entries are already synced");
      return;
    }
    toast("Syncing…");
    await maybeSync(unsynced);
    toast("Sync complete");
  }

  // Tutorial Wizard
  function startTutorialWizard() {
    const wizardOverlay = document.getElementById("tutorialWizard");
    const spotlight = wizardOverlay.querySelector(".wizard-spotlight");
    const title = wizardOverlay.querySelector(".wizard-title");
    const description = wizardOverlay.querySelector(".wizard-description");
    const progressBar = wizardOverlay.querySelector(".wizard-progress-bar");
    const indicators = wizardOverlay.querySelector(".wizard-indicators");
    const backBtn = document.getElementById("wizardBack");
    const nextBtn = document.getElementById("wizardNext");
    const skipBtn = document.getElementById("wizardSkip");

    let currentHighlightedElement = null;

    const steps = [
      {
        title:
          typeof t === "function" ? t("wizardWelcomeTitle") : "Welcome! 👶",
        description:
          typeof t === "function"
            ? t("wizardWelcomeDesc")
            : "Quick tour of your baby tracker.",
        target: null,
        screen: "home",
      },
      {
        title:
          typeof t === "function"
            ? t("wizardQuickActionsTitle")
            : "Quick Actions",
        description:
          typeof t === "function"
            ? t("wizardQuickActionsDesc")
            : "Tap the + button to open the menu and log activities.",
        target: ".fab-button",
        screen: "home",
      },
      {
        title:
          typeof t === "function"
            ? t("wizardTodaySummaryTitle")
            : "Today's Summary",
        description:
          typeof t === "function"
            ? t("wizardTodaySummaryDesc")
            : "View totals and time since last activity.",
        target: ".today-summary",
        screen: "home",
      },
      {
        title:
          typeof t === "function"
            ? t("wizardActivityLogTitle")
            : "Activity Log",
        description:
          typeof t === "function"
            ? t("wizardActivityLogDesc")
            : "See all entries, filter by date, delete if needed.",
        target: null,
        screen: "log",
      },
      {
        title: typeof t === "function" ? t("wizardInsightsTitle") : "Insights",
        description:
          typeof t === "function"
            ? t("wizardInsightsDesc")
            : "Charts showing patterns and trends.",
        target: null,
        screen: "insights",
      },
      {
        title: typeof t === "function" ? t("wizardSettingsTitle") : "Settings",
        description:
          typeof t === "function"
            ? t("wizardSettingsDesc")
            : "Themes, custom activities, sync & export.",
        target: null,
        screen: "settings",
      },
      {
        title:
          typeof t === "function"
            ? t("wizardGoogleSheetsTitle")
            : "Google Sheets Sync",
        description:
          typeof t === "function"
            ? t("wizardGoogleSheetsDesc")
            : "Sync across devices with Google Sheets. Check the Setup Guide for instructions.",
        target: "#googleSheetsSection",
        screen: "settings",
      },
      {
        title: typeof t === "function" ? t("wizardAllSetTitle") : "All Set! 🎉",
        description:
          typeof t === "function"
            ? t("wizardAllSetDesc")
            : "Start tracking now. Replay from Settings anytime.",
        target: ".bottom-nav",
        screen: "home",
      },
    ];

    let currentStep = 0;

    function showStep(index) {
      if (index < 0 || index >= steps.length) return;

      currentStep = index;
      const step = steps[index];

      haptics(5);

      // Clear previous highlighting
      if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove("wizard-highlighted");
        currentHighlightedElement = null;
      }
      wizardOverlay.classList.remove("active");

      // Close FAB menu when leaving Quick Actions step
      if (currentStep === 1 && index !== 1) {
        closeFAB();
      }

      // Navigate to the correct screen
      if (step.screen) {
        showScreen(step.screen);
      }

      // Shorter delay to ensure screen is fully rendered
      setTimeout(() => {
        title.textContent = step.title;
        description.textContent = step.description;
        progressBar.style.width = `${((index + 1) / steps.length) * 100}%`;

        // Update indicators
        indicators.innerHTML = steps
          .map(
            (_, i) =>
              `<div class="wizard-indicator ${i === index ? "active" : ""}"></div>`,
          )
          .join("");

        // Update buttons
        backBtn.style.display = index === 0 ? "none" : "flex";
        const finishLabel = typeof t === "function" ? t("finish") : "Finish";
        const nextLabel = typeof t === "function" ? t("next") : "Next";
        nextBtn.textContent =
          index === steps.length - 1 ? finishLabel : nextLabel;

        // Highlight target element
        if (step.target) {
          const targetEl = document.querySelector(step.target);
          if (targetEl) {
            // Add highlighting class to element
            targetEl.classList.add("wizard-highlighted");
            currentHighlightedElement = targetEl;
            wizardOverlay.classList.add("active");

            // Scroll element into view
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

            // Wait a bit for scroll to complete
            setTimeout(() => {
              const rect = targetEl.getBoundingClientRect();
              const viewportHeight = window.innerHeight;
              const elementCenter = rect.top + rect.height / 2;

              // Open FAB menu during Quick Actions step
              if (index === 1 && step.target === ".fab-button") {
                // Open the FAB menu to show the activities
                if (
                  fabContainer &&
                  !fabContainer.classList.contains("active")
                ) {
                  fabContainer.classList.add("active");
                  if (fabBackdrop) fabBackdrop.classList.add("active");
                }
              }

              // Position card at top if element is in bottom half of screen
              if (elementCenter > viewportHeight / 2) {
                wizardOverlay.classList.add("top");
              } else {
                wizardOverlay.classList.remove("top");
              }

              // Position spotlight using viewport coordinates
              spotlight.style.top = `${rect.top - 8}px`;
              spotlight.style.left = `${rect.left - 8}px`;
              spotlight.style.width = `${rect.width + 16}px`;
              spotlight.style.height = `${rect.height + 16}px`;
            }, 100);
          }
        } else {
          wizardOverlay.classList.remove("top");
        }
      }, 100);
    }

    function closeWizard() {
      haptics(8);

      // Close FAB if open
      closeFAB();

      // Clear highlighting
      if (currentHighlightedElement) {
        currentHighlightedElement.classList.remove("wizard-highlighted");
        currentHighlightedElement = null;
      }
      wizardOverlay.classList.remove("active");

      wizardOverlay.hidden = true;
    }

    // Event listeners
    nextBtn.onclick = () => {
      if (currentStep === steps.length - 1) {
        closeWizard();
      } else {
        showStep(currentStep + 1);
      }
    };

    backBtn.onclick = () => {
      showStep(currentStep - 1);
    };

    skipBtn.onclick = closeWizard;

    wizardOverlay.onclick = (e) => {
      if (e.target === wizardOverlay) {
        closeWizard();
      }
    };

    // Start the wizard
    wizardOverlay.hidden = false;
    showStep(0);
  }

  // Wire events (action buttons are wired in renderHomeScreen)
  undoBtn.addEventListener("click", undoLast);
  viewGraphsBtn.addEventListener("click", async () => {
    try {
      showScreen("insights");
      renderGraphs();
      backgroundSync();
    } catch (err) {
      // Silently fail
    }
  });
  viewLogBtn.addEventListener("click", () => {
    showScreen("log");
    renderLogSummary();
    renderLog();
    backgroundSync();
    startRemoteAutoRefresh();
  });
  dateFilter.addEventListener("change", () => {
    renderLog();
    // Show/hide clear button based on whether a date is selected
    clearFilterBtn.style.display = dateFilter.value ? "inline-block" : "none";
  });
  dateFilter.addEventListener("click", (e) => {
    e.stopPropagation();
  });
  clearFilterBtn.addEventListener("click", () => {
    dateFilter.value = "";
    clearFilterBtn.style.display = "none";
    renderLog();
  });

  // Wire up log entry actions (event delegation)
  logEntries.addEventListener("click", (e) => {
    const editAction = e.target.closest("[data-edit]");
    if (editAction) {
      const entryId = editAction.getAttribute("data-edit");
      openEditModal(entryId);
      return;
    }

    const deleteAction = e.target.closest("[data-del]");
    if (deleteAction) {
      const entryId = deleteAction.getAttribute("data-del");
      deleteEntry(entryId);
      return;
    }
  });

  // Bottom navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      haptics(5);
      const screen = item.dataset.screen;
      if (screen) {
        if (screen === "log") {
          showScreen("log");
          renderLogSummary();
          renderLog();
          backgroundSync();
          startRemoteAutoRefresh();
        } else if (screen === "insights") {
          showScreen("insights");
          renderGraphs();
          backgroundSync();
        } else if (screen === "settings") {
          showScreen("settings");
        } else {
          showScreen(screen);
        }
      }
    });
  });

  // Settings button event listener is handled below with renderActionTypes
  if (saveSettingsBtn && appsScriptUrl) {
    saveSettingsBtn.addEventListener("click", async () => {
      const url = appsScriptUrl.value.trim();

      // Get selected theme
      const selectedTheme =
        document.querySelector('input[name="theme"]:checked')?.value ||
        "blossom";

      // Get selected font
      const selectedFont =
        document.querySelector('input[name="font"]:checked')?.value || "roboto";

      // Automatically enable sync if URL is provided
      settings = {
        webAppUrl: url,
        syncEnabled: !!url, // Auto-enable if URL exists
        theme: selectedTheme,
        font: selectedFont,
      };
      saveSettings(settings);

      // Apply theme and font immediately
      applyTheme(selectedTheme);
      applyFont(selectedFont);

      if (url) {
        // Show loading state
        const btnText = saveSettingsBtn.querySelector(".btn-text");
        const btnLoading = saveSettingsBtn.querySelector(".btn-loading");
        if (btnText) btnText.hidden = true;
        if (btnLoading) btnLoading.hidden = false;
        saveSettingsBtn.disabled = true;

        try {
          // Sync with Google Sheets
          await backgroundSync(); // Use backgroundSync instead of syncAll for first connection
          await updateStatus(); // Update status after sync completes
          toast("✓ Connected & synced successfully");
        } catch (error) {
          toast("⚠️ Connected but sync failed. Check your URL.");
          await updateStatus(); // Still update status even if sync fails
        } finally {
          // Reset button state
          if (btnText) btnText.hidden = false;
          if (btnLoading) btnLoading.hidden = true;
          saveSettingsBtn.disabled = false;
        }
      } else {
        toast("Settings saved (local only)");
        await updateStatus(); // Update status for local-only mode too
      }
    });
  }

  // Paste from clipboard functionality
  if (pasteUrlBtn && appsScriptUrl) {
    pasteUrlBtn.addEventListener("click", async () => {
      const originalText = pasteUrlBtn.textContent;

      try {
        const text = await navigator.clipboard.readText();
        if (text.trim()) {
          appsScriptUrl.value = text.trim();

          // Success state
          pasteUrlBtn.textContent = "✓ Pasted!";
          pasteUrlBtn.classList.add("copied");

          // Haptic feedback
          haptics(5);

          // Revert after 3 seconds
          setTimeout(() => {
            pasteUrlBtn.textContent = originalText;
            pasteUrlBtn.classList.remove("copied");
          }, 3000);

          toast("📋 URL pasted from clipboard");
        } else {
          toast("📋 Clipboard is empty");
        }
      } catch (err) {
        // Fallback for browsers that don't support clipboard API
        toast("📋 Please paste manually (Ctrl+V)");
        appsScriptUrl.focus();
        appsScriptUrl.select();
      }
    });
  }

  // Help/Documentation
  if (viewHelpBtn) {
    viewHelpBtn.addEventListener("click", () => {
      showScreen("help");
    });
  }

  // Tutorial Wizard
  const startTutorialBtn = $("#startTutorialBtn");
  if (startTutorialBtn) {
    startTutorialBtn.addEventListener("click", () => {
      startTutorialWizard();
    });
  }

  // Restart Welcome Setup
  const restartWelcomeBtn = $("#restartWelcomeBtn");
  if (restartWelcomeBtn) {
    restartWelcomeBtn.addEventListener("click", () => {
      const confirmMessage =
        typeof t === "function"
          ? t("restartAppConfirm")
          : "This will delete ALL activity data and restart the app. This cannot be undone. Are you sure?";

      if (confirm(confirmMessage)) {
        // Clear all data
        localStorage.removeItem(STORE_KEY);
        localStorage.removeItem(DELETE_QUEUE_KEY);
        localStorage.removeItem(SYNC_QUEUE_KEY);
        localStorage.removeItem(LAST_SYNC_KEY);
        localStorage.removeItem(SYNC_NOTICE_DISMISSED_KEY);

        // Reset welcome
        if (window.WelcomeSystem) {
          window.WelcomeSystem.reset();
        }

        // Reload
        window.location.reload();
      }
    });
  }

  // Sync notice link
  if (syncNoticeLink) {
    syncNoticeLink.addEventListener("click", () => {
      showScreen("settings");
    });
  }

  // Dismiss sync notice
  if (dismissSyncNotice) {
    dismissSyncNotice.addEventListener("click", () => {
      localStorage.setItem(SYNC_NOTICE_DISMISSED_KEY, "true");
      if (syncNoticeWarning) {
        syncNoticeWarning.hidden = true;
      }
    });
  }

  // Theme switching - instant preview
  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      applyTheme(e.target.value);
      // Save theme setting immediately
      settings.theme = e.target.value;
      saveSettings(settings);
    });
  });

  // Font switching - instant preview
  document.querySelectorAll('input[name="font"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      applyFont(e.target.value);
      // Save font setting immediately
      settings.font = e.target.value;
      saveSettings(settings);
    });
  });

  // Language switching - instant preview
  document.querySelectorAll('input[name="language"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      applyLanguage(e.target.value);
      // Toast notification
      toast(
        e.target.value === "fi"
          ? "Kieli vaihdettu suomeksi"
          : "Language changed to English",
      );
    });
  });

  // Disconnect from Google Sheets functionality
  if (disconnectBtn) {
    disconnectBtn.addEventListener("click", async () => {
      const confirmed = confirm(
        "Disconnect from Google Sheets?\n\nYour data will be kept locally on this device.",
      );

      if (confirmed) {
        // Keep data locally, just remove the Google Sheets connection
        settings.webAppUrl = "";
        settings.syncEnabled = false;
        saveSettings(settings);

        // Clear the URL input
        if (appsScriptUrl) appsScriptUrl.value = "";

        // Update UI
        await updateStatus();

        toast("📱 Disconnected - Data kept locally");
      }
    });
  }

  function closeDisconnectModal() {
    if (disconnectModal) disconnectModal.hidden = true;

    // Handle browser history - go back to the previous screen
    const currentHash = window.location.hash.slice(1);
    if (currentHash === "disconnect") {
      history.back();
    }
  }

  if (closeDisconnectModalBtn && disconnectModal) {
    closeDisconnectModalBtn.addEventListener("click", closeDisconnectModal);
  }

  // Close disconnect modal when clicking outside
  if (disconnectModal) {
    disconnectModal.addEventListener("click", (e) => {
      if (e.target === disconnectModal) {
        closeDisconnectModal();
      }
    });
  }

  // Privacy Policy and GitHub functionality
  if (aboutAppBtn) {
    aboutAppBtn.addEventListener("click", () => {
      showScreen("about");
    });
  }

  if (githubRepoBtn) {
    githubRepoBtn.addEventListener("click", () => {
      window.open("https://github.com/yekrangiariana/baby-schedule", "_blank");
    });
  }

  // Action Types Manager

  function animateMovedItem(itemElement) {
    // Add haptic feedback on mobile
    if (typeof haptics === "function") {
      haptics(15);
    }

    // Add move animation class
    itemElement.classList.add("moved");

    // Remove animation class after animation completes
    setTimeout(() => {
      itemElement.classList.remove("moved");
    }, 600);
  }

  function renderActionTypes() {
    if (!actionTypesList) return;

    actionTypesList.innerHTML = "";

    actionTypes.forEach((type, index) => {
      const item = document.createElement("div");
      item.className = "action-type-item";
      item.setAttribute("data-type-id", type.id);
      item.innerHTML = `
        <div class="action-type-color" style="background-color: ${type.color}">
          ${type.emoji}
        </div>
        <div class="action-type-info">
          <div class="action-type-name">${getActionTypeName(type)}</div>
          <div class="action-type-meta">ID: ${type.id}</div>
        </div>
        <div class="action-type-actions">
          <button class="action-type-btn" data-edit="${type.id}" title="Edit">✏️</button>
          <button class="action-type-btn" data-delete="${type.id}" title="Delete">🗑️</button>
          ${index > 0 ? `<button class="action-type-btn" data-move-up="${type.id}" title="Move Up">↑</button>` : ""}
          ${index < actionTypes.length - 1 ? `<button class="action-type-btn" data-move-down="${type.id}" title="Move Down">↓</button>` : ""}
        </div>
      `;
      actionTypesList.appendChild(item);
    });

    // Add event listeners for buttons
    $$("[data-edit]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-edit");
        openActionTypeModal(id);
      });
    });

    $$("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.getAttribute("data-delete");
        deleteActionType(id);
      });
    });

    $$("[data-move-up]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent item selection
        const id = btn.getAttribute("data-move-up");

        // Move the item first
        moveActionType(id, -1);

        // Animate the moved item in its new position
        setTimeout(() => {
          const movedItem = document.querySelector(`[data-type-id="${id}"]`);
          if (movedItem) {
            animateMovedItem(movedItem);
          }
        }, 10);
      });
    });

    $$("[data-move-down]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent item selection
        const id = btn.getAttribute("data-move-down");

        // Move the item first
        moveActionType(id, 1);

        // Animate the moved item in its new position
        setTimeout(() => {
          const movedItem = document.querySelector(`[data-type-id="${id}"]`);
          if (movedItem) {
            animateMovedItem(movedItem);
          }
        }, 10);
      });
    });
  }

  function openActionTypeModal(editId = null) {
    if (!actionTypeModal) return;

    // Add to browser history
    const currentHash = window.location.hash.slice(1) || "home";
    history.pushState(
      { screen: currentHash, modal: "add-activity" },
      "",
      "#add-activity",
    );

    if (editId) {
      const type = getActionTypeById(editId);
      if (!type) return;

      modalTitle.textContent =
        typeof t === "function" ? t("editActivity") : "Edit Activity";
      editingTypeId.value = editId;
      typeNameInput.value = type.name;
      typeEmojiInput.value = type.emoji;
      typeColorInput.value = type.color;
      typeColorText.value = type.color;

      // Hide suggestions when editing
      document.getElementById("activitySuggestions").style.display = "none";
    } else {
      modalTitle.textContent =
        typeof t === "function" ? t("addActivity") : "Add Activity";
      editingTypeId.value = "";
      typeNameInput.value = "";
      typeEmojiInput.value = "";
      typeColorInput.value = "#a8d5ff";
      typeColorText.value = "#a8d5ff";

      // Show and populate suggestions
      populateActivitySuggestions();
      document.getElementById("activitySuggestions").style.display = "flex";
    }

    // Always populate emoji picker and color presets
    populateEmojiPicker();
    populateColorPresets();

    actionTypeModal.hidden = false;
    // Don't auto-focus to prevent keyboard from opening
  }

  function populateActivitySuggestions() {
    const sleepLabel = typeof t === "function" ? t("sleep") : "Sleep";
    const bathLabel = typeof t === "function" ? t("bath") : "Bath";
    const playLabel = typeof t === "function" ? t("play") : "Play";
    const tummyTimeLabel =
      typeof t === "function" ? t("tummyTime") : "Tummy Time";
    const medicineLabel =
      typeof t === "function" ? t("medicine") : "Medication";
    const walkLabel = typeof t === "function" ? t("walk") : "Walk";
    const doctorVisitLabel =
      typeof t === "function" ? t("doctorVisit") : "Doctor Visit";
    const cryLabel = typeof t === "function" ? t("cry") : "Cry";
    const massageLabel = typeof t === "function" ? t("massage") : "Massage";
    const storyTimeLabel =
      typeof t === "function" ? t("storyTime") : "Story Time";
    const musicLabel = typeof t === "function" ? t("music") : "Music";
    const carRideLabel = typeof t === "function" ? t("carRide") : "Car Ride";
    const cuddleLabel = typeof t === "function" ? t("cuddle") : "Cuddle";
    const weightCheckLabel =
      typeof t === "function" ? t("weightCheck") : "Weight Check";
    const temperatureLabel =
      typeof t === "function" ? t("temperature") : "Temperature";
    const teethLabel = typeof t === "function" ? t("teeth") : "Teeth";
    const strollerLabel = typeof t === "function" ? t("stroller") : "Stroller";
    const visitorLabel = typeof t === "function" ? t("visitor") : "Visitor";
    const photoLabel = typeof t === "function" ? t("photo") : "Photo";
    const milestoneLabel =
      typeof t === "function" ? t("milestone") : "Milestone";

    const suggestions = [
      { name: sleepLabel, emoji: "😴", color: "#b8b8ff" },
      { name: bathLabel, emoji: "🛁", color: "#a8d5ff" },
      { name: playLabel, emoji: "🧸", color: "#ffd4a8" },
      { name: tummyTimeLabel, emoji: "🤸", color: "#c4e7ff" },
      { name: medicineLabel, emoji: "💊", color: "#ffc4d4" },
      { name: doctorVisitLabel, emoji: "🏥", color: "#d4c4ff" },
      { name: walkLabel, emoji: "🚶", color: "#c4ffd4" },
      { name: cryLabel, emoji: "😢", color: "#ffd4d4" },
      { name: massageLabel, emoji: "👐", color: "#e8d4ff" },
      { name: storyTimeLabel, emoji: "📖", color: "#fff4d4" },
      { name: musicLabel, emoji: "🎵", color: "#d4fff0" },
      { name: carRideLabel, emoji: "🚗", color: "#d4e8ff" },
      { name: cuddleLabel, emoji: "🤗", color: "#ffeed4" },
      { name: weightCheckLabel, emoji: "⚖️", color: "#e0d4ff" },
      { name: temperatureLabel, emoji: "🌡️", color: "#ffd4d4" },
      { name: "Bob 💩", emoji: "👶", color: "#d4ffd4" },
      { name: "Rowan 💩", emoji: "👶", color: "#d4f4ff" },
      { name: "Bob Feed", emoji: "🍼", color: "#fff0d4" },
      { name: "Rowan Feed", emoji: "🍼", color: "#f0d4ff" },
      { name: teethLabel, emoji: "🦷", color: "#f0d4ff" },
      { name: strollerLabel, emoji: "🚼", color: "#d4ffe0" },
      { name: visitorLabel, emoji: "👋", color: "#ffe4d4" },
      { name: photoLabel, emoji: "📸", color: "#d4d4ff" },
      { name: milestoneLabel, emoji: "🎉", color: "#ffd4f0" },
    ];

    const container = document.getElementById("activitySuggestions");
    container.innerHTML = suggestions
      .map(
        (s) => `
        <button 
          type="button" 
          class="suggestion-chip" 
          data-name="${s.name}" 
          data-emoji="${s.emoji}" 
          data-color="${s.color}"
        >
          ${s.emoji} ${s.name}
        </button>
      `,
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".suggestion-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        haptics(8);
        typeNameInput.value = chip.dataset.name;
        typeEmojiInput.value = chip.dataset.emoji;
        typeColorInput.value = chip.dataset.color;
        typeColorText.value = chip.dataset.color;
        updateColorPresetSelection(chip.dataset.color);
      });
    });
  }

  function populateEmojiPicker() {
    const emojis = [
      "😴",
      "🛁",
      "🧸",
      "🍼",
      "🚼",
      "💩",
      "🤸",
      "💊",
      "😊",
      "🎵",
      "🧼",
      "⏰",
    ];

    const container = document.getElementById("emojiPicker");
    container.innerHTML = emojis
      .map(
        (emoji) => `
        <button type="button" class="emoji-option" data-emoji="${emoji}">
          ${emoji}
        </button>
      `,
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".emoji-option").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptics(6);
        typeEmojiInput.value = btn.dataset.emoji;
      });
    });
  }

  function populateColorPresets() {
    const colors = [
      "#b8deff",
      "#ffb8d4",
      "#b8ffb8",
      "#ffd4a8",
      "#d4b8ff",
      "#ffd4d4",
      "#b8fff4",
      "#fff4b8",
    ];

    const container = document.getElementById("colorPresets");
    container.innerHTML = colors
      .map(
        (color) => `
        <button 
          type="button" 
          class="color-preset" 
          data-color="${color}" 
          style="background-color: ${color}"
        ></button>
      `,
      )
      .join("");

    // Add click handlers
    container.querySelectorAll(".color-preset").forEach((btn) => {
      btn.addEventListener("click", () => {
        haptics(6);
        const color = btn.dataset.color;
        typeColorInput.value = color;
        typeColorText.value = color;
        updateColorPresetSelection(color);
      });
    });

    // Set initial selection
    updateColorPresetSelection(typeColorInput.value);
  }

  function updateColorPresetSelection(color) {
    const presets = document.querySelectorAll(".color-preset");
    presets.forEach((preset) => {
      if (preset.dataset.color === color) {
        preset.classList.add("selected");
      } else {
        preset.classList.remove("selected");
      }
    });
  }

  function closeActionTypeModal() {
    if (actionTypeModal) actionTypeModal.hidden = true;

    // Handle browser history - go back to the previous screen
    const currentHash = window.location.hash.slice(1);
    if (currentHash === "add-activity") {
      // Go back in history instead of manually changing hash
      history.back();
    }
  }

  function saveActionType() {
    const name = typeNameInput.value.trim();
    const emoji = typeEmojiInput.value.trim();
    const color = typeColorInput.value;
    const editId = editingTypeId.value;

    if (!name) {
      haptics(20);
      toast("⚠️ Please enter an activity name");
      return;
    }

    if (!emoji) {
      haptics(20);
      toast("⚠️ Please enter an emoji");
      return;
    }

    if (editId) {
      // Edit existing
      const type = getActionTypeById(editId);
      if (type) {
        type.name = name;
        type.emoji = emoji;
        type.color = color;
      }
    } else {
      // Add new
      const id = name.toLowerCase().replace(/[^a-z0-9]/g, "_");

      // Check if ID already exists
      if (getActionTypeById(id)) {
        haptics(20);
        toast("⚠️ An activity with this name already exists");
        return;
      }

      actionTypes.push({ id, name, emoji, color });
    }

    saveActionTypes(actionTypes);
    renderActionTypes();
    renderHomeScreen();
    closeActionTypeModal();
    haptics(12);
    toast(editId ? "✓ Activity updated" : "✓ Activity added");

    // If sync is enabled, sync action types to Google Sheets
    const cfg = loadSettings();
    if (cfg.syncEnabled && cfg.webAppUrl) {
      syncActionTypesToSheet();
    }
  }

  function deleteActionType(id) {
    // Don't allow deleting if it's the last type
    if (actionTypes.length <= 1) {
      toast("⚠️ You must have at least one activity type");
      return;
    }

    // Check if any entries use this type
    const usageCount = entries.filter((e) => e.type === id).length;

    if (usageCount > 0) {
      const confirmed = confirm(
        `This activity has ${usageCount} log entries. Are you sure you want to delete it? The entries will remain but show as "${id}".`,
      );
      if (!confirmed) return;
    }

    actionTypes = actionTypes.filter((t) => t.id !== id);
    saveActionTypes(actionTypes);
    renderActionTypes();
    renderHomeScreen();
    toast("✓ Activity deleted");

    // Sync to sheet if enabled
    const cfg = loadSettings();
    if (cfg.syncEnabled && cfg.webAppUrl) {
      syncActionTypesToSheet();
    }
  }

  function moveActionType(id, direction) {
    const index = actionTypes.findIndex((t) => t.id === id);
    if (index === -1) return;

    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= actionTypes.length) return;

    // Swap
    [actionTypes[index], actionTypes[newIndex]] = [
      actionTypes[newIndex],
      actionTypes[index],
    ];

    saveActionTypes(actionTypes);
    renderActionTypes();
    renderHomeScreen();

    // Sync to sheet if enabled
    const cfg = loadSettings();
    if (cfg.syncEnabled && cfg.webAppUrl) {
      syncActionTypesToSheet();
    }
  }

  // Action Type Modal Event Listeners
  if (addActionTypeBtn) {
    addActionTypeBtn.addEventListener("click", () => {
      openActionTypeModal();
    });
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener("click", closeActionTypeModal);
  }

  if (cancelModalBtn) {
    cancelModalBtn.addEventListener("click", closeActionTypeModal);
  }

  if (saveTypeBtn) {
    saveTypeBtn.addEventListener("click", saveActionType);
  }

  // Edit Entry Modal Event Listeners
  if (closeEditModalBtn) {
    closeEditModalBtn.addEventListener("click", closeEditModal);
  }

  if (cancelEditModalBtn) {
    cancelEditModalBtn.addEventListener("click", closeEditModal);
  }

  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", updateEntry);
  }

  // FAB Event Listeners
  if (fabButton) {
    fabButton.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleFAB();
    });
  }

  if (fabPastEntry) {
    fabPastEntry.addEventListener("click", openPastEntryModal);
  }

  if (fabManageActivities) {
    fabManageActivities.addEventListener("click", () => {
      closeFAB();
      showScreen("settings");
      // Scroll to Activity Types section
      setTimeout(() => {
        const activityTypesSection = document.getElementById(
          "activityTypesSection",
        );
        if (activityTypesSection) {
          activityTypesSection.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    });
  }

  // Close FAB when clicking backdrop
  if (fabBackdrop) {
    fabBackdrop.addEventListener("click", closeFAB);
  }

  // Close FAB when clicking outside
  document.addEventListener("click", (e) => {
    if (fabContainer && fabContainer.classList.contains("active")) {
      if (!fabContainer.contains(e.target)) {
        closeFAB();
      }
    }
  });

  // Past Entry Modal Event Listeners
  if (closePastEntryModalBtn) {
    closePastEntryModalBtn.addEventListener("click", closePastEntryModal);
  }

  if (cancelPastEntryModalBtn) {
    cancelPastEntryModalBtn.addEventListener("click", closePastEntryModal);
  }

  if (savePastEntryBtn) {
    savePastEntryBtn.addEventListener("click", logPastEntry);
  }

  // Close past entry modal on overlay click
  if (logPastEntryModal) {
    logPastEntryModal.addEventListener("click", (e) => {
      if (e.target === logPastEntryModal) {
        closePastEntryModal();
      }
    });
  }

  // Close edit modal on overlay click
  if (editEntryModal) {
    editEntryModal.addEventListener("click", (e) => {
      if (e.target === editEntryModal) {
        closeEditModal();
      }
    });
  }

  if (typeColorInput && typeColorText) {
    typeColorInput.addEventListener("input", (e) => {
      typeColorText.value = e.target.value;
      updateColorPresetSelection(e.target.value);
    });
    typeColorText.addEventListener("input", (e) => {
      const value = e.target.value;
      if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
        typeColorInput.value = value;
        updateColorPresetSelection(value);
      }
    });
  }

  // Close modal on overlay click
  if (actionTypeModal) {
    actionTypeModal.addEventListener("click", (e) => {
      if (e.target === actionTypeModal) {
        closeActionTypeModal();
      }
    });
  }

  // Settings button event listener
  if (openSettingsBtn) {
    openSettingsBtn.addEventListener("click", () => {
      showScreen("settings");
    });
  }

  // Export CSV button
  if (exportCSVBtn) {
    exportCSVBtn.addEventListener("click", () => {
      exportToCSV();
    });
  }

  // Import CSV button
  if (importCSVBtn && importCSVInput) {
    importCSVBtn.addEventListener("click", () => {
      importCSVInput.click();
    });

    importCSVInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        importFromCSV(file);
        // Reset input so same file can be selected again
        importCSVInput.value = "";
      }
    });
  }

  // Export JSON button
  if (exportJSONBtn) {
    exportJSONBtn.addEventListener("click", () => {
      exportToJSON();
    });
  }

  // Import JSON button
  if (importJSONBtn && importJSONInput) {
    importJSONBtn.addEventListener("click", () => {
      importJSONInput.click();
    });

    importJSONInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        importFromJSON(file);
        // Reset input so same file can be selected again
        importJSONInput.value = "";
      }
    });
  }

  // Back button handlers
  $$(".back-btn[data-back]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const backTo = btn.getAttribute("data-back");
      showScreen(backTo);
    });
  });

  // Simple markdown-to-HTML converter
  function simpleMarkdownToHTML(markdown) {
    let html = markdown;

    // Code blocks (must come before inline code)
    html = html.replace(
      /```(\w+)?\n([\s\S]*?)```/g,
      "<pre><code>$2</code></pre>",
    );

    // Headers
    html = html.replace(/^#### (.*$)/gim, "<h4>$1</h4>");
    html = html.replace(/^### (.*$)/gim, "<h3>$1</h3>");
    html = html.replace(/^## (.*$)/gim, "<h2>$1</h2>");
    html = html.replace(/^# (.*$)/gim, "<h1>$1</h1>");

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

    // Italic
    html = html.replace(/\*(.*?)\*/g, "<em>$1</em>");

    // Inline code
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

    // Links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank">$1</a>',
    );

    // Blockquotes
    html = html.replace(/^&gt; (.*$)/gim, "<blockquote><p>$1</p></blockquote>");
    html = html.replace(/^> (.*$)/gim, "<blockquote><p>$1</p></blockquote>");

    // Horizontal rules
    html = html.replace(/^---$/gim, "<hr>");

    // Lists
    const lines = html.split("\n");
    let inList = false;
    let listType = "";
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const ulMatch = line.match(/^[\-\*] (.+)$/);
      const olMatch = line.match(/^\d+\. (.+)$/);

      if (ulMatch) {
        if (!inList || listType !== "ul") {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push("<ul>");
          listType = "ul";
          inList = true;
        }
        processedLines.push(`<li>${ulMatch[1]}</li>`);
      } else if (olMatch) {
        if (!inList || listType !== "ol") {
          if (inList) processedLines.push(`</${listType}>`);
          processedLines.push("<ol>");
          listType = "ol";
          inList = true;
        }
        processedLines.push(`<li>${olMatch[1]}</li>`);
      } else {
        if (inList) {
          processedLines.push(`</${listType}>`);
          inList = false;
          listType = "";
        }
        // Paragraphs (skip empty lines and lines that are already HTML)
        if (line.trim() && !line.match(/^<[^>]+>/)) {
          processedLines.push(`<p>${line}</p>`);
        } else {
          processedLines.push(line);
        }
      }
    }

    if (inList) {
      processedLines.push(`</${listType}>`);
    }

    return processedLines.join("\n");
  }

  async function loadHelpContent() {
    if (!helpContent) return;

    try {
      const loadingMsg =
        typeof t === "function" ? t("loadingGuide") : "Loading guide...";
      helpContent.innerHTML = `<p style="text-align: center; color: var(--text-muted); padding: 2rem;">${loadingMsg}</p>`;

      // Load language-specific guide
      const lang =
        typeof getCurrentLanguage === "function" ? getCurrentLanguage() : "en";
      const guideFile =
        lang === "fi" ? "docs/USER_GUIDE_FI.md" : "docs/USER_GUIDE.md";

      const response = await fetch(guideFile);
      if (!response.ok) throw new Error("Failed to load user guide");

      const markdown = await response.text();
      const html = simpleMarkdownToHTML(markdown);

      helpContent.innerHTML = html;

      // Add functionality for copy code button
      setupCodeCopyButtons();
    } catch (error) {
      const setupTitle =
        typeof t === "function"
          ? t("googleSheetsSyncSetup")
          : "📖 Google Sheets Sync Setup";
      const unableMsg =
        typeof t === "function"
          ? t("unableToLoadGuide")
          : "Unable to load user guide. Please check USER_GUIDE.md file.";
      const setupSteps =
        typeof t === "function"
          ? t("setupSteps")
          : "For Google Sheets sync setup:";
      const step1 =
        typeof t === "function"
          ? t("setupStep1")
          : "1. Create a Google Sheet with headers";
      const step2 =
        typeof t === "function"
          ? t("setupStep2")
          : "2. Add Apps Script (Extensions → Apps Script)";
      const step3 =
        typeof t === "function"
          ? t("setupStep3")
          : "3. Deploy as Web App (Anyone access)";
      const step4 =
        typeof t === "function"
          ? t("setupStep4")
          : "4. Paste URL in Settings and click Connect & Sync";

      helpContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">${setupTitle}</p>
          <p style="color: var(--text-muted); margin-top: 1rem;">
            ${unableMsg}
          </p>
          <p style="color: var(--text-muted); font-size: var(--text-sm); margin-top: 1rem;">
            ${setupSteps}<br>
            ${step1}<br>
            ${step2}<br>
            ${step3}<br>
            ${step4}
          </p>
        </div>
      `;
    }
  }

  function setupCodeCopyButtons() {
    // Add copy functionality to code copy buttons
    const copyButtons = document.querySelectorAll(".copy-code-btn");
    copyButtons.forEach((button) => {
      button.addEventListener("click", async (e) => {
        const codeBlock =
          e.target.parentNode.querySelector("pre code") ||
          e.target.parentNode.querySelector("details pre code");
        if (codeBlock) {
          try {
            await navigator.clipboard.writeText(codeBlock.textContent);
            const originalText = e.target.textContent;

            // Change button to success state
            const copiedLabel =
              typeof t === "function" ? t("copied") : "✓ Copied!";
            e.target.textContent = copiedLabel;
            e.target.classList.add("copied");

            setTimeout(() => {
              e.target.textContent = originalText;
              e.target.classList.remove("copied");
            }, 3000);

            const copiedMsg =
              typeof t === "function"
                ? t("appsScriptCopied")
                : "📋 Apps Script code copied to clipboard";
            toast(copiedMsg);
            haptics(5);
          } catch (err) {
            const failedMsg =
              typeof t === "function"
                ? t("failedToCopy")
                : "❌ Failed to copy to clipboard";
            toast(failedMsg);
          }
        }
      });
    });
  }

  function initSettingsUI() {
    if (appsScriptUrl) appsScriptUrl.value = settings.webAppUrl || "";
    // Note: Settings tab is always visible in bottom nav, even with FIXED_WEB_APP_URL
    // Users can still view the settings screen, just can't edit the URL
    if (FIXED_WEB_APP_URL) {
      // Disable editing of the URL field if it's hardcoded
      if (appsScriptUrl) {
        appsScriptUrl.disabled = true;
        appsScriptUrl.placeholder = "URL is configured in code";
      }
    }
  }

  // Init
  updateStatus();
  // Prime initial sync on load and when refocusing
  if (settings.syncEnabled && settings.webAppUrl) {
    backgroundSync();
    window.addEventListener("focus", () => {
      backgroundSync();
    });
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        backgroundSync();
      }
    });
  }
  initSettingsUI();

  // Auto-sync any pending operations on load and when going back online
  if (settings.syncEnabled && settings.webAppUrl) {
    // Sync any queued operations
    if (syncQueue.length || deleteQueue.length) {
      backgroundSync();
    }
    window.addEventListener("online", () => {
      backgroundSync();
    });
  }

  // (auto-refresh hooks are called from openLog/closeLog above)

  // ========================================
  // Welcome/Onboarding Integration
  // ========================================

  // Check if tutorial should start after welcome (on page reload)
  function checkStartTutorialAfterWelcome() {
    const shouldStart = localStorage.getItem(
      "babylog.startTutorialAfterWelcome",
    );
    if (shouldStart === "true") {
      // Remove the flag
      localStorage.removeItem("babylog.startTutorialAfterWelcome");

      // Start tutorial with a small delay to ensure everything is loaded
      setTimeout(() => {
        if (typeof startTutorialWizard === "function") {
          startTutorialWizard();
        }
      }, 800);
    }
  }

  // Call this after app initialization
  checkStartTutorialAfterWelcome();

  window.addEventListener("welcomeCompleted", (event) => {
    const welcomeSettings = event.detail;

    // Apply language
    if (welcomeSettings.language) {
      settings.language = welcomeSettings.language;
      saveSettings(settings);
      if (typeof updatePageTranslations === "function") {
        updatePageTranslations();
      }
    }

    // Apply theme
    if (welcomeSettings.theme) {
      settings.theme = welcomeSettings.theme;
      saveSettings(settings);
      applyTheme(welcomeSettings.theme);
    }

    // Apply font
    if (welcomeSettings.font) {
      settings.font = welcomeSettings.font;
      saveSettings(settings);
      applyFont(welcomeSettings.font);
    }

    // Apply selected activities (only keep selected ones)
    if (welcomeSettings.activities && welcomeSettings.activities.length > 0) {
      // Define all available activities
      const allAvailableActivities = [
        {
          id: "feed",
          name: typeof t === "function" ? t("feed") : "Feed",
          emoji: "🍼",
          color: "#a8d5ff",
        },
        {
          id: "pee",
          name: typeof t === "function" ? t("pee") : "Pee",
          emoji: "💧",
          color: "#ffe4a8",
        },
        {
          id: "poop",
          name: typeof t === "function" ? t("poop") : "Poop",
          emoji: "💩",
          color: "#ffb3ba",
        },
        {
          id: "sleep",
          name: typeof t === "function" ? t("sleep") : "Sleep",
          emoji: "😴",
          color: "#c7b8ea",
        },
        {
          id: "bath",
          name: typeof t === "function" ? t("bath") : "Bath",
          emoji: "🛁",
          color: "#a8e6ff",
        },
        {
          id: "play",
          name: typeof t === "function" ? t("play") : "Play",
          emoji: "🎮",
          color: "#ffcba8",
        },
        {
          id: "walk",
          name: typeof t === "function" ? t("walk") : "Walk",
          emoji: "🚶",
          color: "#b8ffb8",
        },
        {
          id: "medicine",
          name: typeof t === "function" ? t("medicine") : "Medicine",
          emoji: "💊",
          color: "#ffb8e6",
        },
      ];

      const selectedTypes = allAvailableActivities.filter((type) =>
        welcomeSettings.activities.includes(type.id),
      );

      // Update action types to only include selected ones
      actionTypes = selectedTypes;
      saveActionTypes(actionTypes);

      // Re-render action buttons and types list
      renderActionButtons();
      renderActionTypesList();
      renderActionTypesInsights();
    }

    // Refresh all displays with new settings
    renderHome();
    renderLog();
    updateStatus();
    updateAllGraphs();
  });
})();
