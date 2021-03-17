import { isInBlockRange, DEFAULT_SETTINGS } from "./settings";

describe("isInBlockRange", () => {
  // Note: assumes DEFAULT_SETTINGS of 9:00 - 5:00 on weekedays
  const A_WEDNESDAY_AFTERNOON = new Date("March 30, 2021 11:30:00");
  const A_SUNDAY_AFTERNOON = new Date("March 28, 2021 13:30:00");
  const A_THURSDAY_BEFORE_WORK = new Date("March 18, 2021 06:30:00");
  const A_TUESDAY_AFTER_WORK = new Date("March 16, 2021 17:30:01");

  test("should return a result", () => {
    expect(isInBlockRange(DEFAULT_SETTINGS)).not.toBeUndefined();
  });
  test("should be true on a weekend (when allow: false)", () => {
    expect(isInBlockRange(DEFAULT_SETTINGS, new Date(A_SUNDAY_AFTERNOON))).toBe(
      true
    );
  });
  test("should be true before work hours", () => {
    expect(
      isInBlockRange(DEFAULT_SETTINGS, new Date(A_THURSDAY_BEFORE_WORK))
    ).toBe(true);
  });
  test("should be true after work hours", () => {
    expect(
      isInBlockRange(DEFAULT_SETTINGS, new Date(A_TUESDAY_AFTER_WORK))
    ).toBe(true);
  });
  test("should be false during work hours", () => {
    expect(
      isInBlockRange(DEFAULT_SETTINGS, new Date(A_WEDNESDAY_AFTERNOON))
    ).toBe(true);
  });
});
