/* ============================================================
   DebugHub Dashboard Logic
   ============================================================ */

(function () {
  "use strict";

  // List of DApps DebugHub knows about.
  // key = localStorage prefix (must match DEBUGHUB_CONFIG.appName in each DApp)
  var APPS = [
    { key: "Faucet", label: "0xFaucet" },
    { key: "BlockpotDAO", label: "BlockpotDAO" },
    { key: "TestApp", label: "TestApp (dev)" }
  ];

  var TABS = ["Sessions", "Checkpoints", "Errors", "Wallets"];

  var state = {
    selectedApp: APPS[0].key,
    activeTab: "Sessions"
  };

  // ---------- storage helpers ----------

  function b64decode(str) {
    return decodeURIComponent(escape(atob(str)));
  }

  function loadEvents(appKey) {
    try {
      var raw = localStorage.getItem(appKey + "_sessions");
      if (!raw) return [];
      return JSON.parse(b64decode(raw));
    } catch (e) {
      return [];
    }
  }

  // ---------- session grouping ----------

  function buildSessions(events) {
    var sessions = {}; // id -> { id, wallet, started, ended, lastCheckpoint, lastStatus }
    var order = [];

    events.forEach(function (evt) {
      var id = evt.sessionId;
      if (!id) return;

      if (!sessions[id]) {
        sessions[id] = {
          id: id,
          wallet: evt.wallet,
          started: null,
          ended: null,
          lastCheckpoint: null,
          lastStatus: null,
          lastTimestamp: evt.timestamp
        };
        order.push(id);
      }

      var s = sessions[id];
      s.lastTimestamp = evt.timestamp;

      if (evt.type === "session_start") s.started = evt.timestamp;
      if (evt.type === "session_end") s.ended = evt.timestamp;

      if (evt.type === "checkpoint" || evt.type === "security") {
        s.lastCheckpoint = evt.name;
        s.lastStatus = evt.status;
      }

      if (evt.type === "error") {
        s.lastCheckpoint = "Error: " + evt.function;
        s.lastStatus = "fail";
      }
    });

    // newest first
    return order
      .map(function (id) { return sessions[id]; })
      .sort(function (a, b) { return b.lastTimestamp - a.lastTimestamp; });
  }

  // ---------- formatting ----------

  function shortWallet(addr) {
    if (!addr) return "—";
    return addr.slice(0, 6) + "..." + addr.slice(-4);
  }

  function formatTime(ts) {
    if (!ts) return "—";
    var d = new Date(ts);
    return d.toLocaleTimeString();
  }

  function statusClass(session) {
    if (!session.ended) return "active";
    return session.lastStatus === "fail" ? "fail" : "pass";
  }

  function statusLabel(session) {
    if (!session.ended) return "ACTIVE";
    return session.lastStatus === "fail" ? "FAIL" : "PASS";
  }

  // ---------- rendering ----------

  function renderSessionsTab(appKey) {
    var events = loadEvents(appKey);
    var sessions = buildSessions(events);

    if (sessions.length === 0) {
      return (
        '<div class="empty-state">' +
        '<div class="big">No sessions yet</div>' +
        "<div>Events will appear here once " + appKey + " starts logging.</div>" +
        "</div>"
      );
    }

    return sessions
      .map(function (s) {
        var cls = statusClass(s);
        return (
          '<div class="session-card">' +
          '<div class="session-top">' +
          '<div class="lamp ' + cls + '"></div>' +
          '<div class="session-id">' + s.id + "</div>" +
          '<div style="flex:1"></div>' +
          '<div class="status-badge ' + cls + '">' + statusLabel(s) + "</div>" +
          "</div>" +
          '<div class="session-row"><span class="label">Wallet</span><span class="value">' + shortWallet(s.wallet) + "</span></div>" +
          '<div class="session-row"><span class="label">Last checkpoint</span><span class="value">' + (s.lastCheckpoint || "—") + "</span></div>" +
          '<div class="session-row"><span class="label">Last activity</span><span class="value">' + formatTime(s.lastTimestamp) + "</span></div>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderPlaceholderTab(name) {
    return (
      '<div class="empty-state">' +
      '<div class="big">' + name + "</div>" +
      "<div>This tab is coming in a future pass.</div>" +
      "</div>"
    );
  }

  function renderContent() {
    var content = document.getElementById("content");
    if (!content) return;
    if (state.activeTab === "Sessions") {
      content.innerHTML = renderSessionsTab(state.selectedApp);
    } else {
      content.innerHTML = renderPlaceholderTab(state.activeTab);
    }
  }

  function renderTabs() {
    var nav = document.getElementById("tab-nav");
    if (!nav) return;
    nav.innerHTML = TABS.map(function (tab) {
      var cls = tab === state.activeTab ? "active" : "";
      return '<button class="' + cls + '" data-tab="' + tab + '">' + tab + "</button>";
    }).join("");

    nav.querySelectorAll("button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.activeTab = btn.getAttribute("data-tab");
        renderTabs();
        renderContent();
      });
    });
  }

  function renderAppSelector() {
    var select = document.getElementById("app-select");
    if (!select) return;
    select.innerHTML = APPS.map(function (app) {
      return '<option value="' + app.key + '">' + app.label + "</option>";
    }).join("");

    select.value = state.selectedApp;

    select.addEventListener("change", function () {
      state.selectedApp = select.value;
      renderContent();
    });
  }

  function showDashboard(address) {
    var gateScreen = document.getElementById("gate-screen");
    var dashboard = document.getElementById("dashboard");
    var ownerAddr = document.getElementById("owner-address");

    if (gateScreen) gateScreen.style.display = "none";
    if (dashboard) dashboard.style.display = "block";
    if (ownerAddr) ownerAddr.textContent = shortWallet(address);

    renderAppSelector();
    renderTabs();
    renderContent();
  }

  function showGate(message, isError) {
    var dashboard = document.getElementById("dashboard");
    var gate = document.getElementById("gate-screen");
    var statusEl = document.getElementById("gate-status");

    if (dashboard) dashboard.style.display = "none";
    if (gate) gate.style.display = "block";

    if (statusEl) {
      statusEl.textContent = message;
      statusEl.className = "status-line " + (isError ? "status-fail" : "");
    }
  }

  // ---------- init ----------

  var connectBtn = document.getElementById("connect-btn");
  if (connectBtn) {
    connectBtn.addEventListener("click", function () {
      DebugHubGate.connect({
        onAuthorized: showDashboard,
        onUnauthorized: function (addr) {
          showGate("Connected as " + shortWallet(addr) + " — this wallet is not authorized.", true);
        },
        onNotConnected: function (reason) {
          if (reason === "no_wallet") {
            showGate("No wallet extension detected.", true);
          } else {
            showGate("Connect your wallet to continue.", false);
          }
        }
      });
    });
  }

  DebugHubGate.init(
    showDashboard,
    function (addr) {
      showGate("Connected as " + shortWallet(addr) + " — this wallet is not authorized.", true);
    },
    function (reason) {
      if (reason === "no_wallet") {
        showGate("No wallet extension detected.", true);
      } else {
        showGate("Connect your wallet to continue.", false);
      }
    }
  );
})();
