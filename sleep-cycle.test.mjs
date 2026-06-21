import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateCycles, validateClockInput } from "./sleep-cycle.js";

describe("sleep cycle calculation", () => {
  it("adds seven 90-minute wake nodes from the sleep time", () => {
    const results = calculateCycles(7, 30);

    assert.deepEqual(
      results.map((item) => item.time),
      ["09:00", "10:30", "12:00", "13:30", "15:00", "16:30", "18:00"],
    );
  });

  it("wraps wake nodes across midnight", () => {
    const results = calculateCycles(23, 0);

    assert.deepEqual(
      results.slice(0, 3).map((item) => item.time),
      ["00:30", "02:00", "03:30"],
    );
  });

  it("marks the fifth cycle as preferred and seventh as not recommended", () => {
    const results = calculateCycles(7, 30);

    assert.equal(results[4].badge, "首选");
    assert.equal(results[4].tone, "preferred");
    assert.equal(results[6].badge, "不推荐");
    assert.equal(results[6].tone, "caution");
  });
});

describe("clock input validation", () => {
  it("accepts valid 24-hour hour and minute values", () => {
    assert.deepEqual(validateClockInput("07", "30"), {
      valid: true,
      hour: 7,
      minute: 30,
      message: "",
    });
  });

  it("rejects empty and out-of-range values", () => {
    assert.equal(validateClockInput("", "30").valid, false);
    assert.equal(validateClockInput("24", "00").valid, false);
    assert.equal(validateClockInput("23", "60").valid, false);
  });
});
