import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  getSettings,
  setSettings as setSettingsStorage,
  Settings,
  WorkDay,
} from "./lib/settings";

interface SettingsState {
  settings: Settings | null;
  hasChanges: boolean;
}

const Options = () => {
  const [{ settings, hasChanges }, setSettingsState] = useState<SettingsState>({
    settings: null,
    hasChanges: false,
  });
  useEffect(() => {
    (async () => {
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
        <label>Block sites outside specified hours</label>
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

          <div id="work-hours">
            <p>Allow only during these times:</p>
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
                        <label>{day}</label>
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
