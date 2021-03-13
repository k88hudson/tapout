const DEFAULT_SETTINGS = {
  enabled: false,
  domains: ["mail.google.com", "docs.google.com"],
};

async function getSettings() {
  let settings = {};
  try {
    settings = await browser.storage.local.get();
  } catch (e) {
    console.error(e);
  }
  return {
    ...DEFAULT_SETTINGS,
    ...settings};
}

async function saveOptions(e) {
  e.preventDefault();
  const settings = {
    enabled: document.getElementById("enabled").checked,
    domains: document.getElementById("domains").value.split("\n")
  };
  await browser.storage.local.set(settings);
  console.log("Updated settings", settings);
  browser.runtime.sendMessage({type: "update-settings"})
}

async function restoreOptions() {
  const {enabled, domains} = await getSettings();
  document.getElementById("enabled").checked = enabled;
  document.getElementById("domains").value = domains.join("\n");
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
