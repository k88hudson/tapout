import { isInBlockRange, DEFAULT_SETTINGS } from "./settings";

describe("isInBlockRange", () => {
  test("returns a result", () => {
    expect(isInBlockRange(DEFAULT_SETTINGS)).not.toBeUndefined();
  });
});
