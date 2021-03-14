const DEFAULT_CONTAINER = "firefox-default";
const BLOCK_URL = browser.runtime.getURL("blocker.html");
import { getSettings, isInBlockRange } from "./lib/settings";

// note: types don't support cookieStoreId
interface ReqListenerDetails {
  url: string;
  cookieStoreId: string;
}

function redirect(domain: string, url: string, rule: string) {
  const redirectUrl = new URL(BLOCK_URL);
  redirectUrl.searchParams.set("url", encodeURIComponent(url));
  redirectUrl.searchParams.set("rule", encodeURIComponent(rule));
  return { redirectUrl: redirectUrl.toString() };
}

let uninit: { (): void } | null = null;
async function updateListeners() {
  console.log("update");
  if (uninit) {
    uninit();
    uninit = null;
  }

  const settings = await getSettings();
  const args = {
    urls: settings.domains.map((domain) => "*://*." + domain + "/*"),
  };

  const listener = async (details: ReqListenerDetails) => {
    // Only block the default container
    if (
      settings.disabled !== true &&
      isInBlockRange(settings) &&
      details.cookieStoreId === DEFAULT_CONTAINER
    ) {
      return redirect("domain", details.url, "test");
    }
    return null;
  };

  browser.webRequest.onBeforeRequest.addListener(listener as any, args, [
    "blocking",
  ]);
  uninit = () => {
    browser.webRequest.onBeforeRequest.removeListener(listener as any);
  };
}

browser.runtime.onMessage.addListener((message: any) => {
  if (message.type === "update-settings") {
    updateListeners();
  }
});
updateListeners();
