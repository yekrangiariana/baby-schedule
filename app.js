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

  // Default action types
  const DEFAULT_ACTION_TYPES = [
    { id: "feed", name: "Feed", emoji: "🍼", color: "#a8d5ff" },
    { id: "pee", name: "Pee", emoji: "💧", color: "#ffe4a8" },
    { id: "poop", name: "Poop", emoji: "💩", color: "#ffb3ba" },
  ];

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
  const logStats = $("#logStats");
  const todayTotals = $("#todayTotals");
  const syncNoticeWarning = $("#syncNoticeWarning");
  const syncNoticeSuccess = $("#syncNoticeSuccess");
  const syncNoticeLink = $("#syncNoticeLink");
  const recentList = $("#recentList");
  const logEntries = $("#logEntries");
  const undoBtn = $("#undoBtn");
  const viewGraphsBtn = $("#viewGraphsBtn");
  const viewLogBtn = $("#viewLogBtn");
  const printBtn = $("#printBtn");

  const closeGraphsBtn = $("#closeGraphsBtn");
  const closeLogBtn = $("#closeLogBtn");
  const closeSettingsBtn = $("#closeSettingsBtn");
  const dateFilter = $("#dateFilter");
  const clearFilterBtn = $("#clearFilterBtn");
  const summaryEl = $("#summary");

  const openSettingsBtn = $("#openSettingsBtn");
  const appsScriptUrl = $("#appsScriptUrl");
  const saveSettingsBtn = $("#saveSettingsBtn");
  const viewHelpBtn = $("#viewHelpBtn");

  // Action Types Manager
  const actionTypesList = $("#actionTypesList");
  const addActionTypeBtn = $("#addActionTypeBtn");
  const actionTypeModal = $("#actionTypeModal");
  const actionTypeModalTitle = $("#actionTypeModalTitle");
  const actionTypeName = $("#actionTypeName");
  const actionTypeEmoji = $("#actionTypeEmoji");
  const actionTypeColor = $("#actionTypeColor");
  const saveActionTypeBtn = $("#saveActionTypeBtn");
  const cancelActionTypeBtn = $("#cancelActionTypeBtn");
  let editingActionTypeId = null;

  // Screens
  const helpScreen = $("#helpScreen");
  const helpContent = $("#helpContent");

  // Legacy elements for compatibility
  const logPanel = { hidden: true };
  const graphsPanel = { hidden: true };

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
  function loadActionTypes() {
    try {
      const stored = localStorage.getItem(ACTION_TYPES_KEY);
      if (!stored) return DEFAULT_ACTION_TYPES;
      return JSON.parse(stored);
    } catch {
      return DEFAULT_ACTION_TYPES;
    }
  }
  function saveActionTypes(types) {
    localStorage.setItem(ACTION_TYPES_KEY, JSON.stringify(types));
  }
  function getActionTypeById(id) {
    return (
      actionTypes.find((t) => t.id === id) || {
        id,
        name: id,
        emoji: "📝",
        color: "#cbd5e1",
      }
    );
  }

  function formatDate(ts) {
    const d = new Date(ts);
    return d.toLocaleDateString();
  }
  function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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

  // Apply saved theme or default to blossom
  function applyTheme(theme) {
    const validThemes = ["blossom", "comet", "meadow"];
    const selectedTheme = validThemes.includes(theme) ? theme : "blossom";
    document.body.setAttribute("data-theme", selectedTheme);

    // Update radio buttons
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach((radio) => {
      radio.checked = radio.value === selectedTheme;
    });
  }

  // Load and apply theme on startup
  applyTheme(settings.theme || "blossom");

  // If a fixed URL is provided, force-enable sync
  if (FIXED_WEB_APP_URL) {
    settings = { webAppUrl: FIXED_WEB_APP_URL, syncEnabled: true };
    saveSettings(settings);
  }

  // Render clock
  setInterval(() => {
    const now = new Date();
    if (nowText) nowText.textContent = now.toLocaleString();
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
    const typeInfo = getActionTypeById(type);
    haptics(15);
    toast(`${typeInfo.name} logged`);
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

  // Screen Navigation
  function showScreen(screen) {
    // Update nav buttons
    $$(`.nav-item`).forEach((btn) => btn.classList.remove("active"));

    if (screen === "home") {
      homeScreen.hidden = false;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      $$(`.nav-item[data-screen="home"]`)[0]?.classList.add("active");
      updateStatus(); // Refresh sync notice when returning to home
    } else if (screen === "log") {
      homeScreen.hidden = true;
      logScreen.hidden = false;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      $$(`.nav-item[data-screen="log"]`)[0]?.classList.add("active");
      renderLog();
      backgroundSync();
      startRemoteAutoRefresh();
    } else if (screen === "insights") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = false;
      settingsScreen.hidden = true;
      if (helpScreen) helpScreen.hidden = true;
      $$(`.nav-item[data-screen="insights"]`)[0]?.classList.add("active");
      renderGraphs();
      backgroundSync();
    } else if (screen === "settings") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = false;
      if (helpScreen) helpScreen.hidden = true;
      $$(`.nav-item[data-screen="settings"]`)[0]?.classList.add("active");
    } else if (screen === "help") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      if (helpScreen) {
        helpScreen.hidden = false;
        loadHelpContent();
      }
    }
  }

  function goHome() {
    showScreen("home");
    stopRemoteAutoRefresh();
  }

  // Render recent activity on home screen
  function renderRecentActivity() {
    if (!recentList) return;
    const recent = entries
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    if (recent.length === 0) {
      recentList.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:20px;">No activity yet</p>';
      return;
    }

    recentList.innerHTML = recent
      .map((e, index) => {
        const typeInfo = getActionTypeById(e.type);
        return `
      <div class="recent-item" style="animation-delay: ${index * 0.05}s">
        <div class="recent-icon" style="background: ${typeInfo.color}30; color: ${typeInfo.color};">${typeInfo.emoji}</div>
        <div class="recent-info">
          <div class="recent-type">${typeInfo.name}</div>
          <div class="recent-time">${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</div>
        </div>
      </div>
    `;
      })
      .join("");
  }

  // Render action buttons on home screen
  function renderHomeScreen() {
    if (!actionButtons) return;

    actionButtons.innerHTML = actionTypes
      .map(
        (type) => `
      <button class="action" data-type="${type.id}" style="border-color: ${type.color};">
        <div class="action-glow" style="background: linear-gradient(135deg, ${type.color}30, ${type.color});"></div>
        <span class="action-emoji">${type.emoji}</span>
        <span class="action-label">${type.name}</span>
      </button>
    `,
      )
      .join("");

    // Re-attach event listeners and press feedback
    actionButtons.querySelectorAll(".action").forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.type;
        addEntry(type);
      });
      attachPressFeedback(btn);
    });
  }

  function getTypeEmoji(type) {
    const actionType = getActionTypeById(type);
    return actionType.emoji;
  }

  function getTypeColor(type) {
    const actionType = getActionTypeById(type);
    return actionType.color;
  }

  function getTypeName(type) {
    const actionType = getActionTypeById(type);
    return actionType.name;
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
    toast(`Undid ${last.type} at ${formatTime(last.timestamp)}`);

    // Update open screens immediately
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();

    // Trigger background sync
    backgroundSync();
  }

  function updateStatus() {
    const src = entries;

    // Render dynamic mini stats
    if (logStats) {
      logStats.innerHTML = actionTypes
        .slice(0, 3)
        .map((type) => {
          const e = src
            .filter((e) => e.type === type.id)
            .sort((a, b) => b.timestamp - a.timestamp)[0];
          const lastTime = e
            ? `${formatDate(e.timestamp)} ${formatTime(e.timestamp)}`
            : "—";

          return `
          <div class="stat-mini" style="background: ${type.color}20; border-color: ${type.color};">
            <div class="stat-mini-icon">${type.emoji}</div>
            <div class="stat-mini-content">
              <div class="stat-mini-label">Last ${type.name}</div>
              <div class="stat-mini-value">${lastTime}</div>
            </div>
          </div>
        `;
        })
        .join("");
    }

    const today = new Date();
    const todayEntries = src.filter((e) => isSameDay(e.timestamp, today));
    const counts = countByType(todayEntries);

    // Build dynamic summary text
    const summaryParts = actionTypes.map(
      (type) => `${type.name} ${counts[type.id] || 0}`,
    );
    todayTotals.textContent = src.length
      ? `Today: ${summaryParts.join(" • ")}`
      : "Today: —";

    // Show sync warning on home screen if not connected
    // Reload settings to ensure we have latest state
    const currentSettings = loadSettings();
    const hasUrl = !!(currentSettings.webAppUrl || FIXED_WEB_APP_URL);
    const isSyncConfigured = hasUrl && currentSettings.syncEnabled;

    // Only show warning on home screen when NOT connected
    if (syncNoticeWarning) {
      syncNoticeWarning.hidden = isSyncConfigured;
    }

    // Update success notice in settings (handled separately when settings screen is shown)
    if (syncNoticeSuccess) {
      syncNoticeSuccess.hidden = !isSyncConfigured;
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
      console.error("Failed to render graphs:", err);
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

  function renderGraphs() {
    if (!entries || !entries.length) return;

    const today = new Date();
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    ).getTime();
    const last24h = Date.now() - 24 * 60 * 60 * 1000;
    const last7days = Date.now() - 7 * 24 * 60 * 60 * 1000;

    // Build dynamic counts object
    const createCountsObj = () => {
      const obj = {};
      actionTypes.forEach((type) => {
        obj[type.id] = 0;
      });
      return obj;
    };

    // Render legends
    const renderLegend = (elementId) => {
      const legendEl = document.getElementById(elementId);
      if (legendEl) {
        legendEl.innerHTML = actionTypes
          .map(
            (type) => `
          <div class="legend-item">
            <span class="legend-color" style="background: ${type.color};"></span>
            <span class="legend-label">${type.name}</span>
          </div>
        `,
          )
          .join("");
      }
    };
    renderLegend("weekLegend");
    renderLegend("hourlyLegend");

    // Today's totals
    const todayEntries = entries.filter((e) => e.timestamp >= todayStart);
    const todayCounts = createCountsObj();
    todayEntries.forEach((e) => {
      if (todayCounts[e.type] !== undefined) todayCounts[e.type]++;
    });

    // Build chart data from action types
    const todayChartData = actionTypes.map((type) => ({
      label: type.name,
      value: todayCounts[type.id] || 0,
      color: type.color,
    }));
    drawBarChart("todayChart", todayChartData);

    // Last 24 hours by hour
    const hourlyData = Array(24)
      .fill(0)
      .map((_, i) => {
        const obj = { hour: i };
        actionTypes.forEach((type) => {
          obj[type.id] = 0;
        });
        return obj;
      });
    entries
      .filter((e) => e.timestamp >= last24h)
      .forEach((e) => {
        const h = new Date(e.timestamp).getHours();
        if (hourlyData[h][e.type] !== undefined) {
          hourlyData[h][e.type]++;
        }
      });
    drawLineChart("hourlyChart", hourlyData);

    // 7-day trend
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = todayStart - i * 24 * 60 * 60 * 1000;
      const dayEnd = dayStart + 24 * 60 * 60 * 1000;
      const dayEntries = entries.filter(
        (e) => e.timestamp >= dayStart && e.timestamp < dayEnd,
      );
      const counts = createCountsObj();
      dayEntries.forEach((e) => {
        if (counts[e.type] !== undefined) counts[e.type]++;
      });
      dailyData.push({
        day: new Date(dayStart).toLocaleDateString("en", { weekday: "short" }),
        ...counts,
      });
    }
    drawStackedBarChart("weekChart", dailyData);

    // Only show ratio chart if we have feed and diaper types
    const hasFeed = actionTypes.some((t) => t.id === "feed");
    const hasPee = actionTypes.some((t) => t.id === "pee");
    const hasPoop = actionTypes.some((t) => t.id === "poop");

    if (hasFeed && (hasPee || hasPoop)) {
      const feedCount = todayCounts.feed || 0;
      const diaperCount = (todayCounts.pee || 0) + (todayCounts.poop || 0);
      const ratio = feedCount > 0 ? (diaperCount / feedCount).toFixed(1) : 0;
      drawRatioChart("ratioChart", {
        feeds: feedCount,
        diapers: diaperCount,
        ratio: ratio,
        target: 1.5,
      });
    }
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

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    const max = Math.max(...data.map((d) => d.value), 1);
    const barWidth = w / data.length - 20;
    const spacing = 20;

    data.forEach((d, i) => {
      const barHeight = (d.value / max) * (h - 60);
      const x = i * (barWidth + spacing) + spacing;
      const y = h - barHeight - 30;

      ctx.fillStyle = d.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      ctx.fillStyle = "#1f2937";
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

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Find max value across all types dynamically
    const max = Math.max(
      ...data.map((d) =>
        Math.max(...actionTypes.map((type) => d[type.id] || 0)),
      ),
      1,
    );
    const step = w / (data.length - 1 || 1);

    // Helper function to draw a smooth line
    const drawLine = (typeId, color) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();

      data.forEach((d, i) => {
        const x = i * step;
        const y = h - 40 - ((d[typeId] || 0) / max) * (h - 70);
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          // Use quadratic curves for smooth lines
          const prevX = (i - 1) * step;
          const prevY = h - 40 - ((data[i - 1][typeId] || 0) / max) * (h - 70);
          const cpX = (prevX + x) / 2;
          const cpY = (prevY + y) / 2;
          ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
        }
      });

      // Draw final segment
      if (data.length > 1) {
        const lastIdx = data.length - 1;
        const x = lastIdx * step;
        const y = h - 40 - ((data[lastIdx][typeId] || 0) / max) * (h - 70);
        ctx.lineTo(x, y);
      }

      ctx.stroke();
    };

    // Draw lines for each action type
    actionTypes.forEach((type) => {
      drawLine(type.id, type.color);
    });

    // Draw time labels
    ctx.fillStyle = "#6b7280";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const showEvery = Math.ceil(data.length / 6);
    data.forEach((d, i) => {
      if (i % showEvery === 0) {
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

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Calculate max total dynamically
    const maxTotal = Math.max(
      ...data.map((d) =>
        actionTypes.reduce((sum, type) => sum + (d[type.id] || 0), 0),
      ),
      1,
    );
    const barWidth = w / data.length - 16;
    const spacing = 16;

    data.forEach((d, i) => {
      const scale = (h - 60) / maxTotal;
      const x = i * (barWidth + spacing) + spacing / 2;
      let y = h - 30;

      // Draw stacked segments in reverse order (bottom to top)
      [...actionTypes].reverse().forEach((type) => {
        const segmentH = (d[type.id] || 0) * scale;
        ctx.fillStyle = type.color;
        ctx.fillRect(x, y - segmentH, barWidth, segmentH);
        y -= segmentH;
      });

      // Label
      ctx.fillStyle = "#6b7280";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(d.day, x + barWidth / 2, h - 10);
    });
  }
  function drawRatioChart(canvasId, data) {
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

    // White background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);

    // Draw comparison bars
    const barWidth = 60;
    const spacing = (w - barWidth * 2) / 3;

    // Feeds bar
    const maxVal = Math.max(data.feeds, data.diapers, 1);
    const feedHeight = (data.feeds / maxVal) * (h - 100);
    const x1 = spacing;
    ctx.fillStyle = "#60a5fa";
    ctx.fillRect(x1, h - feedHeight - 50, barWidth, feedHeight);
    ctx.fillStyle = "#1f2937";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.feeds, x1 + barWidth / 2, h - feedHeight - 60);
    ctx.font = "12px sans-serif";
    ctx.fillText("Feeds", x1 + barWidth / 2, h - 30);

    // Diapers bar
    const diaperHeight = (data.diapers / maxVal) * (h - 100);
    const x2 = spacing * 2 + barWidth;
    ctx.fillStyle = "#fbbf24";
    ctx.fillRect(x2, h - diaperHeight - 50, barWidth, diaperHeight);
    ctx.fillStyle = "#1f2937";
    ctx.font = "14px sans-serif";
    ctx.fillText(data.diapers, x2 + barWidth / 2, h - diaperHeight - 60);
    ctx.font = "12px sans-serif";
    ctx.fillText("Diapers", x2 + barWidth / 2, h - 30);

    // Ratio display
    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(data.ratio + ":1", w / 2, 40);
    ctx.font = "11px sans-serif";
    ctx.fillStyle = "#6b7280";
    const status =
      data.ratio >= 1 && data.ratio <= 2
        ? "Healthy range"
        : data.ratio > 2
          ? "Great hydration"
          : "Monitor intake";
    ctx.fillText(status + " (target: 1-2:1)", w / 2, 58);
  }
  function renderLog() {
    const source = entries;
    const filterVal = dateFilter.value ? new Date(dateFilter.value) : null;
    const list = filterVal
      ? source.filter((e) => isSameDay(e.timestamp, filterVal))
      : source;
    const counts = countByType(list);

    // Build dynamic summary text
    const summaryParts = actionTypes.map(
      (type) => `${type.name} ${counts[type.id] || 0}`,
    );
    summaryEl.textContent = list.length
      ? `Showing ${list.length} entries — ${summaryParts.join(", ")}`
      : "No entries yet";

    // Render log entries as cards
    logEntries.innerHTML = "";
    if (list.length === 0) {
      return; // Summary already shows "No entries yet"
    }

    list
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((e) => {
        const typeInfo = getActionTypeById(e.type);
        const card = document.createElement("div");
        card.className = "log-entry";
        card.innerHTML = `
          <div class="log-entry-icon" style="background: ${typeInfo.color}30; color: ${typeInfo.color};">${typeInfo.emoji}</div>
          <div class="log-entry-content">
            <div class="log-entry-type">${typeInfo.name}</div>
            <div class="log-entry-time">${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</div>
            ${e.note ? `<div class="log-entry-note">${escapeHtml(e.note)}</div>` : ""}
          </div>
          <button class="log-entry-delete" data-del="${e.id}">Delete</button>
        `;
        logEntries.appendChild(card);
      });
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
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
    if (!logScreen.hidden) renderLog();
    if (!insightsScreen.hidden) renderGraphs();

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
    undoBtn,
    viewGraphsBtn,
    viewLogBtn,
    printBtn,
    saveSettingsBtn,
    clearFilterBtn,
    closeGraphsBtn,
    closeLogBtn,
    openSettingsBtn,
  ].forEach(attachPressFeedback);

  async function printView() {
    // Ensure remote data is loaded and log is displayed
    await openLog();
    // Wait for DOM to update with rendered data
    setTimeout(() => window.print(), 400);
  }

  // Background sync: push local changes to Sheets and pull remote changes
  async function backgroundSync() {
    const cfg = loadSettings();
    if (!cfg.syncEnabled || !cfg.webAppUrl || isSyncing) return;

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

      // Show subtle sync confirmation only if we had pending changes
      if (hadPendingChanges && syncQueue.length === 0) {
        // All changes synced successfully
        console.log("✓ Synced with Google Sheets");
      }
    } catch (err) {
      console.error("Background sync failed:", err);
      // Silently fail - will retry on next sync attempt
    } finally {
      isSyncing = false;
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
        if (Array.isArray(data)) {
          remoteEntries = normalizeRemote(data);
        }
      }
    } catch {
      // Fallback to JSONP
      try {
        const data = await jsonpList(cfg.webAppUrl);
        remoteEntries = normalizeRemote(data || []);
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
      if (!logScreen.classList.contains("hidden")) renderLog();
      if (!insightsScreen.classList.contains("hidden")) renderGraphs();
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
      .map((r) => ({
        id: String(r.id || ""),
        type: String(r.type || ""),
        note: String(r.note || ""),
        timestamp: Number(r.timestamp || (r.iso ? Date.parse(r.iso) : 0)) || 0,
        synced: true,
      }))
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
        id: e.id,
        type: e.type,
        note: e.note || "",
        timestamp: e.timestamp,
        iso: new Date(e.timestamp).toISOString(),
        source: "babylog-web",
      };
      // Use a simple request that avoids CORS preflight (no-cors + text/plain)
      try {
        await fetch(cfg.webAppUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain" },
          body: JSON.stringify(payload),
          keepalive: true,
          credentials: "omit",
        });
        // We can't read the response (opaque), assume delivery and verify via read-back
        return "opaque";
      } catch {
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

  // Wire events
  undoBtn.addEventListener("click", undoLast);
  viewGraphsBtn.addEventListener("click", async () => {
    try {
      await openGraphs();
    } catch (err) {
      console.error("Graph button error:", err);
    }
  });
  viewLogBtn.addEventListener("click", openLog);
  printBtn.addEventListener("click", printView);
  dateFilter.addEventListener("change", renderLog);
  clearFilterBtn.addEventListener("click", () => {
    dateFilter.value = "";
    renderLog();
  });

  // Wire up log entry delete buttons (event delegation)
  logEntries.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-del]");
    if (btn) {
      deleteEntry(btn.dataset.del);
    }
  });

  // Bottom navigation
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const screen = item.dataset.screen;
      if (screen) {
        if (screen === "log") openLog();
        else if (screen === "insights") openGraphs();
        else if (screen === "settings") openSettings();
        else showScreen(screen);
      }
    });
  });

  if (openSettingsBtn && settingsPanel) {
    openSettingsBtn.addEventListener("click", openSettings);
  }
  if (saveSettingsBtn && appsScriptUrl) {
    saveSettingsBtn.addEventListener("click", async () => {
      const url = appsScriptUrl.value.trim();

      // Get selected theme
      const selectedTheme =
        document.querySelector('input[name="theme"]:checked')?.value ||
        "blossom";

      // Automatically enable sync if URL is provided
      settings = {
        webAppUrl: url,
        syncEnabled: !!url, // Auto-enable if URL exists
        theme: selectedTheme,
      };
      saveSettings(settings);

      // Apply theme immediately
      applyTheme(selectedTheme);

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

  // Help/Documentation
  if (viewHelpBtn) {
    viewHelpBtn.addEventListener("click", () => {
      showScreen("help");
    });
  }

  // Sync notice link
  if (syncNoticeLink) {
    syncNoticeLink.addEventListener("click", () => {
      showScreen("settings");
    });
  }

  // Theme switching - instant preview
  document.querySelectorAll('input[name="theme"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      applyTheme(e.target.value);
    });
  });

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
      helpContent.innerHTML =
        '<p style="text-align: center; color: var(--text-muted); padding: 2rem;">Loading guide...</p>';

      const response = await fetch("USER_GUIDE.md");
      if (!response.ok) throw new Error("Failed to load user guide");

      const markdown = await response.text();
      const html = simpleMarkdownToHTML(markdown);

      helpContent.innerHTML = html;
    } catch (error) {
      console.error("Error loading help:", error);
      helpContent.innerHTML = `
        <div style="text-align: center; padding: 2rem;">
          <p style="color: var(--text-secondary);">📖 User Guide</p>
          <p style="color: var(--text-muted); margin-top: 1rem;">
            Unable to load user guide. Please check USER_GUIDE.md file.
          </p>
          <p style="color: var(--text-muted); font-size: var(--text-sm); margin-top: 1rem;">
            For Google Sheets sync setup:<br>
            1. Create a Google Sheet with headers<br>
            2. Add Apps Script (Extensions → Apps Script)<br>
            3. Deploy as Web App (Anyone access)<br>
            4. Paste URL in Settings and click Connect & Sync
          </p>
        </div>
      `;
    }
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
    renderActionTypesList();
  }

  // Action Types Manager
  function renderActionTypesList() {
    if (!actionTypesList) return;

    actionTypesList.innerHTML = actionTypes
      .map(
        (type) => `
      <div class="action-type-item">
        <div class="action-type-preview" style="background: ${type.color}20; border: 2px solid ${type.color};">
          ${type.emoji}
        </div>
        <div class="action-type-info">
          <div class="action-type-name">${type.name}</div>
        </div>
        <div class="action-type-actions">
          <button class="action-type-btn" data-edit="${type.id}" title="Edit">✏️</button>
          <button class="action-type-btn" data-delete="${type.id}" title="Delete">🗑️</button>
        </div>
      </div>
    `,
      )
      .join("");
  }

  if (addActionTypeBtn) {
    addActionTypeBtn.addEventListener("click", () => {
      editingActionTypeId = null;
      actionTypeModalTitle.textContent = "Add Activity Type";
      actionTypeName.value = "";
      actionTypeEmoji.value = "";
      actionTypeColor.value = "";
      actionTypeModal.hidden = false;
    });
  }

  if (actionTypeModal) {
    // Emoji picker
    $$(".emoji-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".emoji-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        actionTypeEmoji.value = btn.dataset.emoji;
      });
    });

    // Color picker
    $$(".color-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        $$(".color-btn").forEach((b) => b.classList.remove("selected"));
        btn.classList.add("selected");
        actionTypeColor.value = btn.dataset.color;
      });
    });

    // Save action type
    if (saveActionTypeBtn) {
      saveActionTypeBtn.addEventListener("click", () => {
        const name = actionTypeName.value.trim();
        const emoji = actionTypeEmoji.value;
        const color = actionTypeColor.value;

        if (!name || !emoji || !color) {
          toast("⚠️ Please fill all fields");
          return;
        }

        if (editingActionTypeId) {
          // Edit existing
          const index = actionTypes.findIndex(
            (t) => t.id === editingActionTypeId,
          );
          if (index !== -1) {
            actionTypes[index] = { ...actionTypes[index], name, emoji, color };
          }
        } else {
          // Add new
          const id =
            name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now();
          actionTypes.push({ id, name, emoji, color });
        }

        saveActionTypes(actionTypes);
        renderActionTypesList();
        renderHomeScreen();
        actionTypeModal.hidden = true;
        toast(editingActionTypeId ? "✓ Activity updated" : "✓ Activity added");
      });
    }

    // Cancel
    if (cancelActionTypeBtn) {
      cancelActionTypeBtn.addEventListener("click", () => {
        actionTypeModal.hidden = true;
      });
    }

    // Handle edit and delete clicks
    if (actionTypesList) {
      actionTypesList.addEventListener("click", (e) => {
        const editBtn = e.target.closest("[data-edit]");
        const deleteBtn = e.target.closest("[data-delete]");

        if (editBtn) {
          const id = editBtn.dataset.edit;
          const type = actionTypes.find((t) => t.id === id);
          if (type) {
            editingActionTypeId = id;
            actionTypeModalTitle.textContent = "Edit Activity Type";
            actionTypeName.value = type.name;
            actionTypeEmoji.value = type.emoji;
            actionTypeColor.value = type.color;

            // Select current emoji and color
            $$(".emoji-btn").forEach((btn) => {
              btn.classList.toggle(
                "selected",
                btn.dataset.emoji === type.emoji,
              );
            });
            $$(".color-btn").forEach((btn) => {
              btn.classList.toggle(
                "selected",
                btn.dataset.color === type.color,
              );
            });

            actionTypeModal.hidden = false;
          }
        }

        if (deleteBtn) {
          const id = deleteBtn.dataset.delete;
          const type = actionTypes.find((t) => t.id === id);

          // Check if there are entries with this type
          const entriesCount = entries.filter((e) => e.type === id).length;

          let confirmMsg = `Delete "${type.name}"?`;
          if (entriesCount > 0) {
            confirmMsg += `\n\n⚠️ ${entriesCount} log entries use this activity. They will still be visible but the activity type won't be available for new entries.`;
          }

          if (confirm(confirmMsg)) {
            actionTypes = actionTypes.filter((t) => t.id !== id);
            saveActionTypes(actionTypes);
            renderActionTypesList();
            renderHomeScreen();
            toast("✓ Activity deleted");
          }
        }
      });
    }
  }

  // Init
  renderHomeScreen();
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
  // (auto-refresh hooks are called from openLog/closeLog above)
})();
