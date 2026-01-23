(function () {
  // Optional: hardcode your Google Apps Script Web App URL here to avoid using the Settings UI.
  // If non-empty, syncing will be enabled automatically and the Settings section will be hidden.
  const FIXED_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbyE1-2SJ3cn17xdKLk6s7jU96Pw_t5DQlS_CjH8JMtL08yrYoNxQC3wo1JTfUcQuuAi/exec";

  const STORE_KEY = "babylog.entries.v1";
  const SETTINGS_KEY = "babylog.settings.v1";
  const DELETE_QUEUE_KEY = "babylog.deletes.v1";

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => Array.from(document.querySelectorAll(s));

  const toastEl = $("#toast");
  const nowText = $("#nowText");
  const lastFeed = $("#lastFeed");
  const lastPee = $("#lastPee");
  const lastPoop = $("#lastPoop");
  const todayTotals = $("#todayTotals");
  const undoBtn = $("#undoBtn");
  const viewLogBtn = $("#viewLogBtn");
  const printBtn = $("#printBtn");

  const logPanel = $("#logPanel");
  const closeLogBtn = $("#closeLogBtn");
  const dateFilter = $("#dateFilter");
  const clearFilterBtn = $("#clearFilterBtn");
  const summaryEl = $("#summary");
  const logTbody = $("#logTbody");
  const exportCsvBtn = $("#exportCsvBtn");

  const openSettingsBtn = $("#openSettingsBtn");
  const settingsPanel = $("#settingsPanel");
  const appsScriptUrl = $("#appsScriptUrl");
  const syncToggle = $("#syncToggle");
  const saveSettingsBtn = $("#saveSettingsBtn");
  const syncNowBtn = $("#syncNowBtn");

  const haptics = (ms) => {
    if (navigator.vibrate) navigator.vibrate(ms || 10);
  };
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    setTimeout(() => toastEl.classList.remove("show"), 1400);
  };

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

  // Add entry
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
    updateStatus();
    maybeSync([entry]);
    haptics(15);
    toast(`${capitalize(type)} logged`);
  }

  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  // Undo last
  function undoLast() {
    if (!entries.length) return;
    const last = entries.pop();
    saveEntries(entries);
    updateStatus();
    // If the entry was synced to Sheets, enqueue a delete and attempt sync
    if (settings.syncEnabled && settings.webAppUrl && last.synced) {
      deleteQueue.push(last.id);
      saveDeletes(deleteQueue);
      maybeDelete([last.id]);
    }
    toast(`Undid ${last.type} at ${formatTime(last.timestamp)}`);
  }

  function updateStatus() {
    const lastOf = (t) => {
      const e = [...entries]
        .filter((e) => e.type === t)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      return e ? `${formatDate(e.timestamp)} ${formatTime(e.timestamp)}` : "—";
    };
    lastFeed.textContent = lastOf("feed");
    lastPee.textContent = lastOf("pee");
    lastPoop.textContent = lastOf("poop");

    const today = new Date();
    const todayEntries = entries.filter((e) => isSameDay(e.timestamp, today));
    const counts = countByType(todayEntries);
    todayTotals.textContent = `Today: Feed ${counts.feed || 0} • Pee ${counts.pee || 0} • Poop ${counts.poop || 0}`;
  }

  function countByType(list) {
    return list.reduce((acc, e) => {
      acc[e.type] = (acc[e.type] || 0) + 1;
      return acc;
    }, {});
  }

  function openLog() {
    logPanel.hidden = false;
    renderLog();
  }
  function closeLog() {
    logPanel.hidden = true;
  }

  function renderLog() {
    const filterVal = dateFilter.value ? new Date(dateFilter.value) : null;
    const list = filterVal
      ? entries.filter((e) => isSameDay(e.timestamp, filterVal))
      : entries;
    const counts = countByType(list);

    summaryEl.textContent = list.length
      ? `Showing ${list.length} entries — Feed ${counts.feed || 0}, Pee ${counts.pee || 0}, Poop ${counts.poop || 0}`
      : "No entries yet";

    logTbody.innerHTML = "";
    list
      .slice()
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((e) => {
        const tr = document.createElement("tr");
        tr.dataset.type = e.type;
        tr.innerHTML = `
          <td>${formatDate(e.timestamp)}</td>
          <td>${formatTime(e.timestamp)}</td>
          <td class="type">${emojiFor(e.type)} ${capitalize(e.type)}</td>
          <td>${escapeHtml(e.note || "")}</td>
          <td class="no-print">
            <button class="secondary" data-del="${e.id}">Delete</button>
          </td>
        `;
        logTbody.appendChild(tr);
      });
  }

  function emojiFor(t) {
    if (t === "feed") return "🍼";
    if (t === "pee") return "💧";
    if (t === "poop") return "💩";
    return "";
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  }

  function deleteEntry(id) {
    const idx = entries.findIndex((e) => e.id === id);
    if (idx >= 0) {
      const removed = entries.splice(idx, 1)[0];
      saveEntries(entries);
      updateStatus();
      renderLog();
      toast("Entry deleted");
      if (settings.syncEnabled && settings.webAppUrl && removed?.synced) {
        deleteQueue.push(id);
        saveDeletes(deleteQueue);
        maybeDelete([id]);
      }
    }
  }

  function exportCsv() {
    const rows = [["Date", "Time", "Type", "Note", "ID"]];
    entries.forEach((e) => {
      rows.push([
        formatDate(e.timestamp),
        formatTime(e.timestamp),
        e.type,
        e.note?.replaceAll("\n", " "),
        e.id,
      ]);
    });
    const csv = rows
      .map((r) =>
        r
          .map((cell) => {
            const s = String(cell ?? "");
            if (/[",\n]/.test(s)) return '"' + s.replaceAll('"', '""') + '"';
            return s;
          })
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `baby-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function printView() {
    openLog();
    setTimeout(() => window.print(), 50);
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
      // Try a CORS-friendly request first (may preflight)
      try {
        const res = await fetch(cfg.webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify(payload),
        });
        if (res && res.ok) return "ok";
        // If we get a non-ok, fall through to no-cors
        throw new Error("non-ok");
      } catch {
        // Fallback: opaque request that usually succeeds to Apps Script from file:// origins
        try {
          await fetch(cfg.webAppUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
          });
          return "opaque";
        } catch {
          return "fail";
        }
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
        const res = await fetch(cfg.webAppUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "cors",
          body: JSON.stringify(payload),
        });
        if (res && res.ok) return "ok";
        throw new Error("non-ok");
      } catch {
        try {
          await fetch(cfg.webAppUrl, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(payload),
          });
          return "opaque";
        } catch {
          return "fail";
        }
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
    btn.addEventListener("click", () => addEntry(btn.dataset.type));
  });
  undoBtn.addEventListener("click", undoLast);
  viewLogBtn.addEventListener("click", openLog);
  closeLogBtn.addEventListener("click", closeLog);
  exportCsvBtn.addEventListener("click", exportCsv);
  printBtn.addEventListener("click", printView);
  dateFilter.addEventListener("change", renderLog);
  clearFilterBtn.addEventListener("click", () => {
    dateFilter.value = "";
    renderLog();
  });
  logTbody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-del]");
    if (btn) {
      deleteEntry(btn.dataset.del);
    }
  });

  if (openSettingsBtn && settingsPanel) {
    openSettingsBtn.addEventListener("click", () =>
      settingsPanel.scrollIntoView({ behavior: "smooth" }),
    );
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
  initSettingsUI();

  // Auto-sync any pending entries on load and when going back online (if sync is enabled)
  if (settings.syncEnabled && settings.webAppUrl) {
    const pending = entries.filter((e) => !e.synced);
    if (pending.length) {
      // run in background without toasts on load
      maybeSync(pending);
    }
    if (deleteQueue.length) {
      maybeDelete(deleteQueue.slice());
    }
    window.addEventListener("online", () => {
      const unsynced = entries.filter((e) => !e.synced);
      if (unsynced.length) maybeSync(unsynced);
      if (deleteQueue.length) maybeDelete(deleteQueue.slice());
    });
  }
})();
