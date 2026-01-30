(function () {
  // Optional: hardcode your Google Apps Script Web App URL here to avoid using the Settings UI.
  // If non-empty, syncing will be enabled automatically and the Settings section will be hidden.
  const FIXED_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbx3ZBVvxpKSSpCHbEAwdWiKi1O_bwatIT8McEgsb0iJw785UQelb85smJSRp5QRiG4s/exec";

  const STORE_KEY = "babylog.entries.v1";
  const SETTINGS_KEY = "babylog.settings.v1";
  const DELETE_QUEUE_KEY = "babylog.deletes.v1";
  const SYNC_QUEUE_KEY = "babylog.syncqueue.v1";
  const LAST_SYNC_KEY = "babylog.lastsync.v1";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  // Screens
  const homeScreen = $("#homeScreen");
  const logScreen = $("#logScreen");
  const insightsScreen = $("#insightsScreen");
  const settingsScreen = $("#settingsScreen");

  const toastEl = $("#toast");
  const nowText = $("#nowText");
  const lastFeed = $("#lastFeed");
  const lastPee = $("#lastPee");
  const lastPoop = $("#lastPoop");
  const todayTotals = $("#todayTotals");
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
  const syncToggle = $("#syncToggle");
  const saveSettingsBtn = $("#saveSettingsBtn");
  const syncNowBtn = $("#syncNowBtn");

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
  let isSyncing = false;

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
    haptics(15);
    toast(`${capitalize(type)} logged`);
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
      $$(`.nav-item[data-screen="home"]`)[0]?.classList.add("active");
    } else if (screen === "log") {
      homeScreen.hidden = true;
      logScreen.hidden = false;
      insightsScreen.hidden = true;
      settingsScreen.hidden = true;
      renderLog();
      backgroundSync();
      startRemoteAutoRefresh();
    } else if (screen === "insights") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = false;
      settingsScreen.hidden = true;
      renderGraphs();
      backgroundSync();
    } else if (screen === "settings") {
      homeScreen.hidden = true;
      logScreen.hidden = true;
      insightsScreen.hidden = true;
      settingsScreen.hidden = false;
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
      .slice(0, 4);

    if (recent.length === 0) {
      recentList.innerHTML =
        '<p style="text-align:center;color:var(--text-muted);padding:20px;">No activity yet</p>';
      return;
    }

    recentList.innerHTML = recent
      .map(
        (e, index) => `
      <div class="recent-item" style="animation-delay: ${index * 0.05}s">
        <div class="recent-icon ${e.type}">${getTypeEmoji(e.type)}</div>
        <div class="recent-info">
          <div class="recent-type">${capitalize(e.type)}</div>
          <div class="recent-time">${formatDate(e.timestamp)} ${formatTime(e.timestamp)}</div>
        </div>
      </div>
    `,
      )
      .join("");
  }

  function getTypeEmoji(type) {
    return { feed: "🍼", pee: "💧", poop: "💩" }[type] || "📝";
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
    const lastOf = (t) => {
      const e = src
        .filter((e) => e.type === t)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      return e ? `${formatDate(e.timestamp)} ${formatTime(e.timestamp)}` : "—";
    };
    lastFeed.textContent = lastOf("feed");
    lastPee.textContent = lastOf("pee");
    lastPoop.textContent = lastOf("poop");

    const today = new Date();
    const todayEntries = src.filter((e) => isSameDay(e.timestamp, today));
    const counts = countByType(todayEntries);
    todayTotals.textContent = src.length
      ? `Today: Feed ${counts.feed || 0} • Pee ${counts.pee || 0} • Poop ${counts.poop || 0}`
      : "Today: —";

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

    // Today's totals
    const todayEntries = entries.filter((e) => e.timestamp >= todayStart);
    const todayCounts = { feed: 0, pee: 0, poop: 0 };
    todayEntries.forEach((e) => {
      if (todayCounts[e.type] !== undefined) todayCounts[e.type]++;
    });
    drawBarChart("todayChart", [
      { label: "Feed", value: todayCounts.feed, color: "var(--accent)" },
      { label: "Pee", value: todayCounts.pee, color: "var(--yellow)" },
      { label: "Poop", value: todayCounts.poop, color: "var(--red)" },
    ]);

    // Last 24 hours by hour
    const hourlyData = Array(24)
      .fill(0)
      .map((_, i) => ({ hour: i, count: 0 }));
    entries
      .filter((e) => e.timestamp >= last24h)
      .forEach((e) => {
        const h = new Date(e.timestamp).getHours();
        hourlyData[h].count++;
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
      const counts = { feed: 0, pee: 0, poop: 0 };
      dayEntries.forEach((e) => {
        if (counts[e.type] !== undefined) counts[e.type]++;
      });
      dailyData.push({
        day: new Date(dayStart).toLocaleDateString("en", { weekday: "short" }),
        ...counts,
      });
    }
    drawStackedBarChart("weekChart", dailyData);

    // Feed-to-Diaper Ratio (pediatric standard: ~1-2 diapers per feed is healthy)
    const feedCount = todayCounts.feed;
    const diaperCount = todayCounts.pee + todayCounts.poop;
    const ratio = feedCount > 0 ? (diaperCount / feedCount).toFixed(1) : 0;
    drawRatioChart("ratioChart", {
      feeds: feedCount,
      diapers: diaperCount,
      ratio: ratio,
      target: 1.5, // healthy target: ~1-2 diapers per feed
    });
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

    const max = Math.max(...data.map((d) => d.count), 1);
    const step = w / (data.length - 1 || 1);

    // Draw smooth curve with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, "#60a5fa");
    gradient.addColorStop(1, "#93c5fd");

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();

    data.forEach((d, i) => {
      const x = i * step;
      const y = h - 30 - (d.count / max) * (h - 60);
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        // Use quadratic curves for smooth lines
        const prevX = (i - 1) * step;
        const prevY = h - 30 - (data[i - 1].count / max) * (h - 60);
        const cpX = (prevX + x) / 2;
        const cpY = (prevY + y) / 2;
        ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
      }
    });

    // Draw final segment
    if (data.length > 1) {
      const lastIdx = data.length - 1;
      const x = lastIdx * step;
      const y = h - 30 - (data[lastIdx].count / max) * (h - 60);
      ctx.lineTo(x, y);
    }

    ctx.stroke();

    ctx.fillStyle = "#6b7280";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    const showEvery = Math.ceil(data.length / 6);
    data.forEach((d, i) => {
      if (i % showEvery === 0) {
        const x = i * step;
        ctx.fillText(d.hour + "h", x, h - 10);
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

    const maxTotal = Math.max(...data.map((d) => d.feed + d.pee + d.poop), 1);
    const barWidth = w / data.length - 16;
    const spacing = 16;

    data.forEach((d, i) => {
      const total = d.feed + d.pee + d.poop;
      const scale = (h - 60) / maxTotal;
      const x = i * (barWidth + spacing) + spacing / 2;
      let y = h - 30;

      // Poop (bottom)
      const poopH = d.poop * scale;
      ctx.fillStyle = "#f87171";
      ctx.fillRect(x, y - poopH, barWidth, poopH);
      y -= poopH;

      // Pee (middle)
      const peeH = d.pee * scale;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x, y - peeH, barWidth, peeH);
      y -= peeH;

      // Feed (top)
      const feedH = d.feed * scale;
      ctx.fillStyle = "#60a5fa";
      ctx.fillRect(x, y - feedH, barWidth, feedH);

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

    // Update summary text
    summaryEl.textContent = list.length
      ? `Showing ${list.length} entries — Feed ${counts.feed || 0}, Pee ${counts.pee || 0}, Poop ${counts.poop || 0}`
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
        const card = document.createElement("div");
        card.className = "log-entry";
        card.innerHTML = `
          <div class="log-entry-icon ${e.type}">${getTypeEmoji(e.type)}</div>
          <div class="log-entry-content">
            <div class="log-entry-type">${capitalize(e.type)}</div>
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
    ...$$(".action"),
    undoBtn,
    viewGraphsBtn,
    viewLogBtn,
    printBtn,
    saveSettingsBtn,
    syncNowBtn,
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
  $$(".action").forEach((btn) => {
    btn.addEventListener("click", async () => {
      await addEntry(btn.dataset.type);
    });
  });
  undoBtn.addEventListener("click", undoLast);
  viewGraphsBtn.addEventListener("click", async () => {
    try {
      await openGraphs();
    } catch (err) {
      console.error("Graph button error:", err);
    }
  });
  closeGraphsBtn.addEventListener("click", closeGraphs);
  closeLogBtn.addEventListener("click", closeLog);
  closeSettingsBtn.addEventListener("click", closeSettings);
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
  if (saveSettingsBtn && appsScriptUrl && syncToggle) {
    saveSettingsBtn.addEventListener("click", () => {
      settings = {
        webAppUrl: appsScriptUrl.value.trim(),
        syncEnabled: !!syncToggle.checked,
      };
      saveSettings(settings);
      toast("Settings saved");
    });
  }
  if (syncNowBtn) {
    syncNowBtn.addEventListener("click", syncAll);
  }

  function initSettingsUI() {
    if (appsScriptUrl) appsScriptUrl.value = settings.webAppUrl || "";
    if (syncToggle) syncToggle.checked = !!settings.syncEnabled;
    // Hide the Settings section entirely if fixed URL mode is active
    if (FIXED_WEB_APP_URL) {
      const settingsSection = document.getElementById("settingsPanel");
      const openBtn = document.getElementById("openSettingsBtn");
      if (settingsSection) settingsSection.style.display = "none";
      if (openBtn) openBtn.style.display = "none";
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
