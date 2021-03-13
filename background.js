const DEFAULT_CONTAINER = "firefox-default";
const BLOCK_URL = browser.runtime.getURL("blocker.html");
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

function redirect(url, rule) {
  const redirectUrl = new URL(BLOCK_URL);
  redirectUrl.searchParams.set("url", encodeURIComponent(url));
  redirectUrl.searchParams.set("rule", encodeURIComponent(rule));
  return { redirectUrl: redirectUrl.toString() };
}

let uninit = null;
async function updateListeners() {
  console.log("Updating listeners...")
  if (uninit) {
    uninit();
    uninit = null;
    console.log("Removing old listeners.");
  }

  const {enabled, domains} = await getSettings();
  const args = { urls: domains.map(domain => '*://*.' + domain + '/*') };

  const listener = async details => {
    // Only block the default container
    if (enabled && details.cookieStoreId === DEFAULT_CONTAINER) {
      return redirect(details.url, "test");
    }
    return null;
  }

  console.log("Adding listeners", args.urls);
  browser.webRequest.onBeforeRequest.addListener(listener, args, ["blocking"] );
  uninit = () => {
    browser.webRequest.onBeforeRequest.removeListener(listener);
  };
}

browser.runtime.onMessage.addListener((message) => {
  if (message.type === "update-settings") {
    updateListeners();
  }
});
updateListeners();

