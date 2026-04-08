const api = globalThis.browser || globalThis.chrome;

async function setBadge(tabId, text, color) {
  try {
    await api.action.setBadgeText({ tabId, text });
    await api.action.setBadgeBackgroundColor({ tabId, color });
  } catch (err) {
    console.error("Badge update failed:", err);
  }
}

async function ensureContentScript(tabId) {
  try {
    await api.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Content script injection failed:", err);
  }
}

api.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  const tabId = tab.id;

  await setBadge(tabId, "RUN", "#d97706");
  await ensureContentScript(tabId);

  try {
    await api.tabs.sendMessage(tabId, { type: "RUN_ONCE" });
  } catch (err) {
    console.error("Message send failed:", err);
    await setBadge(tabId, "ERR", "#dc2626");
  }
});

api.runtime.onMessage.addListener((message, sender) => {
  const tabId = sender?.tab?.id;
  if (!tabId || !message?.type) return;

  if (message.type === "RUN_COMPLETE") {
    setBadge(tabId, "OFF", "#6b7280");
    console.log(`Fast Call Clicker: clicked ${message.count} button(s).`);
  }
}); 