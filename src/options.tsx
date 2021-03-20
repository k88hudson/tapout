import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  getSettings,
  setSettings as setSettingsStorage,
  Settings,
  WorkDay,
  DEFAULT_CONTAINER,
} from "./lib/settings";

interface SettingsState {
  settings: Settings | null;
  hasChanges: boolean;
}

interface Container extends browser.contextualIdentities.ContextualIdentity {
  colorCode: string;
  iconUrl: string;
}

const DEFAULT_CONTAINER_ENTRY: Container = {
  cookieStoreId: DEFAULT_CONTAINER,
  name: "Default",
  colorCode: "#000000",
  iconUrl: "",
  // These are placeholder
  color: "purple",
  icon: "circle",
};

const Options = () => {
  const [{ settings, hasChanges }, setSettingsState] = useState<SettingsState>({
    settings: null,
    hasChanges: false,
  });
  const [containers, setContainers] = useState<Array<Container>>([]);
  useEffect(() => {
    (async () => {
      const containerQuery = [
        DEFAULT_CONTAINER_ENTRY,
        ...((await browser.contextualIdentities.query({})) as Array<Container>),
      ];
      setContainers(containerQuery);
      setSettingsState({ settings: await getSettings(), hasChanges: false });
    })();
  }, []);

  async function setSettings(newValues: Partial<Settings>) {
    // await setSettingsStorage(newValues);
    const merged = { ...(settings || {}), ...newValues } as Settings;
    setSettingsState({ settings: merged, hasChanges: true });
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (settings) {
      await setSettingsStorage(settings);
      setSettingsState({ settings, hasChanges: false });
    }
  }

  if (!settings) {
    return null;
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <input
          type="checkbox"
          id="enabled"
          checked={settings.enabled}
          onChange={(e) => setSettings({ enabled: e.target.checked })}
        />{" "}
        <label className="inline-label">
          Block sites outside specified hours
        </label>
      </div>
      <div
        style={settings.enabled ? {} : { opacity: 0.5, pointerEvents: "none" }}
      >
        <div className="form-group">
          <div className="form-group">
            <label>Domains (one per line)</label>
            <textarea
              id="domains"
              value={settings.domains.join("\n")}
              onChange={(e) =>
                setSettings({ domains: e.target.value.split("\n") })
              }
            ></textarea>
          </div>

          <div className="form-group">
            <label>Containers to block: </label>
            {containers.map(({ cookieStoreId, name, colorCode }) => (
              <div style={{ color: colorCode }}>
                <input
                  type="checkbox"
                  checked={settings.blockedContainers.includes(cookieStoreId)}
                  onChange={(e) => {
                    const updatedContainers = [...settings.blockedContainers];
                    if (
                      e.target.checked &&
                      !settings.blockedContainers.includes(cookieStoreId)
                    ) {
                      updatedContainers.push(cookieStoreId);
                    } else if (!e.target.checked) {
                      updatedContainers.splice(
                        updatedContainers.indexOf(cookieStoreId),
                        1
                      );
                    }
                    setSettings({ blockedContainers: updatedContainers });
                  }}
                />{" "}
                <label className="inline-label">{name}</label>
              </div>
            ))}
          </div>

          <div id="work-hours">
            <label>Allow only during these times:</label>
            <table>
              <tbody>
                {Object.keys(settings.workDays).map((day) => {
                  const { allow, startTime, endTime } = settings.workDays[day];
                  const setDayConfig = (config: Partial<WorkDay>) =>
                    setSettings({
                      workDays: {
                        ...settings.workDays,
                        [day]: { ...settings.workDays[day], ...config },
                      },
                    });
                  return (
                    <tr key={day}>
                      <td className="day-label">
                        <input
                          type="checkbox"
                          checked={allow}
                          onChange={(e) =>
                            setDayConfig({ allow: e.target.checked })
                          }
                        />{" "}
                        <label className="inline-label">{day}</label>
                      </td>
                      {allow && (
                        <>
                          <td>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) =>
                                setDayConfig({ startTime: e.target.value })
                              }
                            />
                          </td>
                          <td>to</td>
                          <td>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) =>
                                setDayConfig({ endTime: e.target.value })
                              }
                            />
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {hasChanges && (
        <div className="form-group">
          <button type="submit">Save changes</button>
        </div>
      )}
    </form>
  );
};

ReactDOM.render(<Options />, document.getElementById("root"));
