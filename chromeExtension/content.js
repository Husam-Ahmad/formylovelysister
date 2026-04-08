(() => {
  if (window.__fastCallClickerInitialized) return;
  window.__fastCallClickerInitialized = true;

  let running = false;
  let loopActive = false;

  function isVisible(el) {
    if (!el || el.disabled) return false;

    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);

    return (
      rect.width > 0 &&
      rect.height > 0 &&
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      style.pointerEvents !== "none"
    );
  }

  function isCallButton(el) {
    if (!(el instanceof HTMLElement)) return false;
    if (!el.matches("button, a")) return false;
    if (!isVisible(el)) return false;

    const text = (el.innerText || el.textContent || "").trim().toLowerCase();

    return text === "call";
  }

  function findTargets(maxCount = 4) {
    const targets = [];
    const elements = document.querySelectorAll("button, a");

    for (const el of elements) {
      if (isCallButton(el)) {
        targets.push(el);

        if (targets.length >= maxCount) {
          break;
        }
      }
    }

    return targets;
  }

  function fastClick(el) {
    try {
      ["mousedown", "mouseup", "click"].forEach(type => {
        el.dispatchEvent(new MouseEvent(type, {
          bubbles: true,
          cancelable: true,
          view: window
        }));
      });
    } catch (err) {
      try {
        el.click();
      } catch (_) {}
    }
  }

  function runLoop() {
    if (loopActive) return;
    loopActive = true;

    const tick = () => {
      if (!running) {
        loopActive = false;
        return;
      }

      const targets = findTargets(4);

      if (targets.length > 0) {
        for (const el of targets) {
          fastClick(el);
        }

        console.log(`Fast Call Clicker: clicked ${targets.length} button(s).`);
        loopActive = false;
        return;
      }

      setTimeout(tick, 0);
    };

    tick();
  }

  function start() {
    if (running) return;
    running = true;
    console.log("Fast Call Clicker: ON");
    runLoop();
  }

  function stop() {
    running = false;
    console.log("Fast Call Clicker: OFF");
  }

  const api = globalThis.browser || globalThis.chrome;

  api.runtime.onMessage.addListener((message) => {
    if (!message || !message.type) return;

    if (message.type === "START_CLICKER") {
      start();
    }

    if (message.type === "STOP_CLICKER") {
      stop();
    }
  });
})();