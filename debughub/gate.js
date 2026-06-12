/* ============================================================
   DebugHub Gate
   Checks that the connected wallet matches the owner address.
   Exposes window.DebugHubGate with:
     init(onAuthorized, onUnauthorized, onNotConnected)
     connect(callbacks)   - triggers MetaMask popup
     getAddress()
     isOwner(addr)
   ============================================================ */

(function () {
  "use strict";

  var OWNER_ADDRESS = "0x42536623b503D4926DfAF6173B0357b7DfD19800";

  var currentAddress = null;

  function normalize(addr) {
    return addr ? addr.toLowerCase() : null;
  }

  function isOwner(addr) {
    return normalize(addr) === normalize(OWNER_ADDRESS);
  }

  function getAddress() {
    return currentAddress;
  }

  function classify(accounts, callbacks) {
    if (!accounts || accounts.length === 0) {
      currentAddress = null;
      callbacks.onNotConnected("not_connected");
      return;
    }
    currentAddress = accounts[0];
    if (isOwner(currentAddress)) {
      callbacks.onAuthorized(currentAddress);
    } else {
      callbacks.onUnauthorized(currentAddress);
    }
  }

  function checkConnection(callbacks) {
    if (!window.ethereum) {
      callbacks.onNotConnected("no_wallet");
      return;
    }
    window.ethereum
      .request({ method: "eth_accounts" })
      .then(function (accounts) {
        classify(accounts, callbacks);
      })
      .catch(function () {
        callbacks.onNotConnected("error");
      });
  }

  function connect(callbacks) {
    if (!window.ethereum) {
      callbacks.onNotConnected("no_wallet");
      return;
    }
    window.ethereum
      .request({ method: "eth_requestAccounts" })
      .then(function (accounts) {
        classify(accounts, callbacks);
      })
      .catch(function () {
        callbacks.onNotConnected("error");
      });
  }

  function init(onAuthorized, onUnauthorized, onNotConnected) {
    var callbacks = {
      onAuthorized: onAuthorized,
      onUnauthorized: onUnauthorized,
      onNotConnected: onNotConnected
    };

    // Silent check on load - does not prompt MetaMask popup
    checkConnection(callbacks);

    // React to account switches while page is open
    if (window.ethereum && window.ethereum.on) {
      window.ethereum.on("accountsChanged", function (accounts) {
        classify(accounts, callbacks);
      });
    }
  }

  window.DebugHubGate = {
    init: init,
    connect: connect,
    getAddress: getAddress,
    isOwner: isOwner
  };
})();
