(() => {
  if (window.__fastCallClickerInitialized) return;
  window.__fastCallClickerInitialized = true;

  const api = globalThis.browser || globalThis.chrome;
  let busy = false;

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

    const text = (el.innerText || el.textContent || "")
      .trim()
      .toLowerCase();

    return text === "call";
  }

  function findTargets(limit) {
    const targets = [];
    const elements = document.querySelectorAll("button, a");

    for (const el of elements) {
      if (isCallButton(el)) {
        targets.push(el);

        if (targets.length >= limit) break;
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

  function runOnce() {
    return new Promise((resolve) => {
      const MAX_CLICKS = 4;
      let stopped = false;

      function stop(observer, count) {
        if (stopped) return;
        stopped = true;
        observer.disconnect();
        resolve(count);
      }

      function scanAndClick(observer) {
        if (stopped) return;

        const targets = findTargets(MAX_CLICKS);

        if (targets.length === 0) return;

        for (const el of targets) {
          fastClick(el);
        }

        stop(observer, targets.length);
      }

      const observer = new MutationObserver(() => {
        scanAndClick(observer);
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
        attributes: true
      });

      scanAndClick(observer);
    });
  }

  api.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== "RUN_ONCE") return;
    if (busy) return;

    busy = true;

    (async () => {
      let count = 0;

      try {
        count = await runOnce();
      } catch (err) {
        console.error("Fast Call Clicker content error:", err);
      } finally {
        busy = false;

        try {
          await api.runtime.sendMessage({
            type: "RUN_COMPLETE",
            count
          });
        } catch (err) {
          console.error("Failed to notify background:", err);
        }
      }
    })();
  });
})();
