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

    const text = (el.innerText || el.textContent || "").trim();

    return text === "Call" || text === "call";
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

  function scanUntilFound() {
    return new Promise((resolve) => {
      const tick = () => {
        const targets = findTargets(4);

        if (targets.length > 0) {
          resolve(targets);
          return;
        }

        setTimeout(tick, 0);
      };

      tick();
    });
  }

  api.runtime.onMessage.addListener((message) => {
    if (!message || message.type !== "RUN_ONCE") return;
    if (busy) return;

    busy = true;

    (async () => {
      let count = 0;

      try {
        const targets = await scanUntilFound();

        count = targets.length;

        for (const el of targets) {
          fastClick(el);
        }
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