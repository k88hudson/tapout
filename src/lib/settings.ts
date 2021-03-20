export const DEFAULT_CONTAINER = "firefox-default";

export type WorkDay = {
  allow: boolean;
  startTime?: string;
  endTime?: string;
};

export interface Settings {
  enabled: boolean;
  domains: Array<string>;
  workDays: { [day: string]: WorkDay };
  blockedContainers: Array<string>;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  domains: ["mail.google.com", "docs.google.com"],
  workDays: {
    sunday: { allow: false },
    monday: { allow: true, startTime: "09:00", endTime: "17:00" },
    tuesday: { allow: true, startTime: "09:00", endTime: "17:00" },
    wednesday: { allow: true, startTime: "09:00", endTime: "17:00" },
    thursday: { allow: true, startTime: "09:00", endTime: "17:00" },
    friday: { allow: true, startTime: "09:00", endTime: "17:00" },
    saturday: { allow: false },
  },
  blockedContainers: [DEFAULT_CONTAINER],
};

export async function getSettings(): Promise<Settings> {
  let settings = {};
  try {
    settings = await browser.storage.local.get();
  } catch (e) {
    console.error(e);
  }
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  };
}

export async function setSettings(settings: Partial<Settings>): Promise<void> {
  await browser.storage.local.set(settings);
  browser.runtime.sendMessage({ type: "update-settings" });
}

function createDateFromTimeString(timeString: string) {
  const [hours, minutes] = timeString.split(":");
  const compareDate = new Date();
  compareDate.setHours(Number(hours));
  compareDate.setMinutes(Number(minutes));
  return compareDate;
}

export function isInBlockRange(settings: Settings, now = new Date()): boolean {
  const weekday = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ][now.getDay()];
  const { allow, startTime, endTime } = settings.workDays[weekday];
  if (!allow) {
    return true;
  }
  if (startTime && now < createDateFromTimeString(startTime)) {
    return true;
  }
  if (endTime && now > createDateFromTimeString(endTime)) {
    return true;
  }

  return false;
}
