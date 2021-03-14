import * as React from "react";
import { useEffect, useState } from "react";
import * as ReactDOM from "react-dom";
import {
  getSettings,
  setSettings as setSettingsStorage,
  Settings,
  WorkDay,
} from "./lib/settings";

const Options = () => {
  const [settings, setSettingsState] = useState<Settings | null>(null);
  useEffect(() => {
    (async () => {
      setSettingsState(await getSettings());
    })();
  }, []);

  async function setSettings(newValues: Partial<Settings>) {
    // await setSettingsStorage(newValues);
    const merged = { ...(settings || {}), ...newValues } as Settings;
    setSettingsState(merged);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (settings) {
      await setSettingsStorage(settings);
    }
  }

  if (!settings) {
    return null;
  }
  return (
    <form onSubmit={onSubmit}>
      <div className="form-group">
        <label>Disable all blocking</label>
        <input
          type="checkbox"
          id="disabled"
          checked={settings.disabled}
          onChange={(e) => setSettings({ disabled: e.target.checked })}
        />
      </div>

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
          <table>
            <thead>
              <tr>
                {["Day", "Allow?", "Start Time", "End Time"].map((title) => (
                  <th key={title}>{title}</th>
                ))}
              </tr>
            </thead>
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
                    <td>
                      <label>{day}</label>
                    </td>
                    <td>
                      <input
                        type="checkbox"
                        checked={allow}
                        onChange={(e) =>
                          setDayConfig({ allow: e.target.checked })
                        }
                      />
                    </td>
                    <td>
                      {allow && (
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) =>
                            setDayConfig({ startTime: e.target.value })
                          }
                        />
                      )}
                    </td>
                    <td>
                      {allow && (
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) =>
                            setDayConfig({ endTime: e.target.value })
                          }
                        />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="form-group">
        <button type="submit">Save</button>
      </div>
    </form>
  );
};

ReactDOM.render(<Options />, document.getElementById("root"));
