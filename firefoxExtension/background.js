const api = globalThis.browser || globalThis.chrome;

api.action.onClicked.addListener(async (tab) => {
  if (!tab.id) return;

  try {
    await api.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  } catch (err) {
    console.error("Failed to inject script:", err);
  }
});