(function () {
  // Optional: hardcode your Google Apps Script Web App URL here to avoid using the Settings UI.
  // If non-empty, syncing will be enabled automatically and the Settings section will be hidden.
  const FIXED_WEB_APP_URL =
    "https://script.google.com/macros/s/AKfycbydUtJ4Am__X8HayB8hiothcJzCp-kUTffRBap9mjMZ6XyKfx8lBkFbJJvyeWQuzExe/exec";

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
  const progressWrap = document.getElementById("progressWrap");
  const progressBar = document.getElementById("progressBar");
  const progressLabel = document.getElementById("progressLabel");

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
        if (progressLabel) progressLabel.textContent = `${base}… ${Math.floor(loadingPercent)}%`;
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
  let remoteEntries = null; // when loaded from Sheets, used for rendering
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

  async function openLog() {
    logPanel.hidden = false;
    setLoading(true);
    await maybeLoadRemoteEntries();
    renderLog();
  }
  function closeLog() {
    logPanel.hidden = true;
  }

  function renderLog() {
    const source = remoteEntries || entries;
    const filterVal = dateFilter.value ? new Date(dateFilter.value) : null;
    const list = filterVal
      ? source.filter((e) => isSameDay(e.timestamp, filterVal))
      : source;
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
        tr.innerHTML = `
          <td>${formatDate(e.timestamp)}</td>
          <td>${formatTime(e.timestamp)}</td>
          <td>${capitalize(e.type)}</td>
          <td>${escapeHtml(e.note || "")}</td>
          <td class="no-print">
            <button class="secondary" data-del="${e.id}">Delete</button>
          </td>
        `;
        logTbody.appendChild(tr);
      });
  }

  function escapeHtml(s) {
    return s.replace(
      /[&<>"]/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
    );
  }

  async function deleteEntry(id) {
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
        await maybeDelete([id]);
        // If we are viewing remote, refresh after deletion
        if (remoteEntries) {
          await maybeLoadRemoteEntries();
          renderLog();
        }
      }
      return;
    }
    // If not found locally but visible remotely, request remote delete
    if (remoteEntries && remoteEntries.some((e) => e.id === id)) {
      if (settings.syncEnabled && settings.webAppUrl) {
        await maybeDelete([id]);
        await maybeLoadRemoteEntries();
        renderLog();
        toast("Entry deleted from Sheets");
      }
    }
  }

  function exportCsv() {
    const source = remoteEntries || entries;
    const rows = [["Date", "Time", "Type", "Note", "ID"]];
    source.forEach((e) => {
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
    setTimeout(() => window.print(), 200);
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
        // Hint only once per open
        toast("Showing local log (couldn't load from Sheets)");
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
