(() => {
  const MAX_CLICKS = 4;
  let clickCount = 0;
  let stopped = false;

  const clickedElements = new WeakSet();

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
      if (isCallButton(el) && !clickedElements.has(el)) {
        clickedElements.add(el);
        targets.push(el);

        if (targets.length >= limit) break;
      }
    }

    return targets;
  }

  function stop(observer) {
    if (stopped) return;
    stopped = true;
    observer.disconnect();
    console.log(`Clicked ${clickCount} button(s). Done.`);
  }

  function scanAndClick(observer) {
    if (stopped) return;

    const remaining = MAX_CLICKS - clickCount;
    if (remaining <= 0) {
      stop(observer);
      return;
    }

    const targets = findTargets(remaining);
    if (targets.length === 0) return;

    for (const el of targets) {
      el.click();
    }

    clickCount += targets.length;
    console.log(`Clicked ${clickCount}/${MAX_CLICKS}`);

    if (clickCount >= MAX_CLICKS) {
      stop(observer);
    }
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
})();
