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

  function renderCheckpointsTab(appKey) {
    var events = loadEvents(appKey);

    var checkpoints = events.filter(function (evt) {
      return evt.type === "checkpoint" || evt.type === "security";
    });

    if (checkpoints.length === 0) {
      return (
        '<div class="empty-state">' +
        '<div class="big">No checkpoints yet</div>' +
        "<div>Checkpoint and security events from " + appKey + " will appear here.</div>" +
        "</div>"
      );
    }

    // newest first
    checkpoints.sort(function (a, b) { return b.timestamp - a.timestamp; });

    return (
      '<div class="timeline">' +
      checkpoints
        .map(function (evt) {
          var cls = evt.status === "fail" ? "fail" : "pass";
          var kindLabel = evt.type === "security" ? "Security" : "Checkpoint";
          return (
            '<div class="timeline-item">' +
            '<div class="lamp ' + cls + '"></div>' +
            '<div class="timeline-body">' +
            '<div class="timeline-name">' + evt.name + "</div>" +
            '<div class="timeline-meta">' +
            "<span>" + kindLabel + "</span>" +
            "<span>" + shortWallet(evt.wallet) + "</span>" +
            "<span>" + formatTime(evt.timestamp) + "</span>" +
            "</div>" +
            '<div class="timeline-session">' + evt.sessionId + "</div>" +
            "</div>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  // ---------- error code lookup ----------

  var ERROR_EXPLANATIONS = {
    "-32002": "Wallet already has a pending request — open MetaMask/Brave and check for a waiting popup.",
    "-32603": "Internal JSON-RPC error — often a contract revert or bad call data.",
    "4001": "The wallet rejected the request — user likely tapped Cancel.",
    "-32000": "Invalid input — often insufficient funds or bad transaction parameters.",
    "-32700": "Parse error — the RPC received malformed JSON.",
    "-32601": "Method not found — the RPC node doesn't support this call."
  };

  function explainError(evt) {
    var code = evt.code !== null && evt.code !== undefined ? String(evt.code) : null;
    if (code && ERROR_EXPLANATIONS[code]) {
      return ERROR_EXPLANATIONS[code];
    }
    if (evt.message) {
      return evt.message;
    }
    return "Unrecognized error — see raw details below.";
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderErrorsTab(appKey) {
    var events = loadEvents(appKey);
    var errors = events.filter(function (evt) { return evt.type === "error"; });

    if (errors.length === 0) {
      return (
        '<div class="empty-state">' +
        '<div class="big">No errors logged</div>' +
        "<div>Caught errors from " + appKey + " will appear here.</div>" +
        "</div>"
      );
    }

    // group + dedupe by function + code + message
    var groups = {};
    var order = [];

    errors.forEach(function (evt) {
      var key = evt.function + "|" + evt.code + "|" + evt.message;
      if (!groups[key]) {
        groups[key] = {
          function: evt.function,
          code: evt.code,
          message: evt.message,
          count: 0,
          lastSeen: evt.timestamp,
          raw: evt
        };
        order.push(key);
      }
      var g = groups[key];
      g.count += 1;
      if (evt.timestamp > g.lastSeen) {
        g.lastSeen = evt.timestamp;
        g.raw = evt;
      }
    });

    var groupList = order.map(function (key) { return groups[key]; });
    groupList.sort(function (a, b) { return b.lastSeen - a.lastSeen; });

    return groupList
      .map(function (g, i) {
        var rawJson = JSON.stringify(g.raw, null, 2);
        return (
          '<div class="error-card">' +
          '<div class="error-explanation">' + escapeHtml(explainError(g.raw)) + "</div>" +
          '<div class="error-meta">' +
          "<span><strong>" + escapeHtml(g.function) + "</strong>()</span>" +
          "<span>x" + g.count + "</span>" +
          "<span>" + formatTime(g.lastSeen) + "</span>" +
          "</div>" +
          "<details>" +
          "<summary>Raw error details</summary>" +
          '<pre class="error-raw" id="raw-' + i + '">' + escapeHtml(rawJson) + "</pre>" +
          '<button class="copy-btn" data-target="raw-' + i + '">Copy</button>' +
          "</details>" +
          "</div>"
        );
      })
      .join("");
  }

  function renderWalletsTab(appKey) {
    var events = loadEvents(appKey);

    var wallets = {}; // addr -> { connections, errors, pass, fail }
    var order = [];

    events.forEach(function (evt) {
      var addr = evt.wallet || "unknown";
      if (!wallets[addr]) {
        wallets[addr] = { connections: 0, errors: 0, pass: 0, fail: 0 };
        order.push(addr);
      }
      var w = wallets[addr];

      if (evt.type === "session_start") w.connections += 1;
      if (evt.type === "error") w.errors += 1;
      if (evt.type === "checkpoint" || evt.type === "security") {
        if (evt.status === "fail") w.fail += 1;
        else w.pass += 1;
      }
    });

    if (order.length === 0) {
      return (
        '<div class="empty-state">' +
        '<div class="big">No wallets seen yet</div>' +
        "<div>Wallets that connect to " + appKey + " will appear here.</div>" +
        "</div>"
      );
    }

    // sort by most connections first
    order.sort(function (a, b) { return wallets[b].connections - wallets[a].connections; });

    return order
      .map(function (addr) {
        var w = wallets[addr];
        var total = w.pass + w.fail;
        var rate = total > 0 ? Math.round((w.pass / total) * 100) : 100;

        return (
          '<div class="wallet-card">' +
          '<div class="wallet-addr">' + shortWallet(addr === "unknown" ? null : addr) + "</div>" +
          '<div class="session-row"><span class="label">Connections</span><span class="value">' + w.connections + "</span></div>" +
          '<div class="session-row"><span class="label">Errors</span><span class="value">' + w.errors + "</span></div>" +
          '<div class="session-row"><span class="label">Success rate</span><span class="value">' + rate + "%</span></div>" +
          '<div class="rate-bar"><div class="rate-bar-fill" style="width:' + rate + '%"></div></div>' +
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
    } else if (state.activeTab === "Checkpoints") {
      content.innerHTML = renderCheckpointsTab(state.selectedApp);
    } else if (state.activeTab === "Errors") {
      content.innerHTML = renderErrorsTab(state.selectedApp);
      content.querySelectorAll(".copy-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var pre = document.getElementById(btn.getAttribute("data-target"));
          if (!pre) return;
          var text = pre.textContent;
          if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(function () {
              btn.textContent = "Copied!";
              setTimeout(function () { btn.textContent = "Copy"; }, 1200);
            });
          }
        });
      });
    } else if (state.activeTab === "Wallets") {
      content.innerHTML = renderWalletsTab(state.selectedApp);
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

  Gate.init(
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

