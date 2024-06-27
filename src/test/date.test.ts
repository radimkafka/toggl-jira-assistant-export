import { expect, test } from "vitest";
import { getDateRange } from "../dateRanges";

export function sum(a: number, b: number) {
  return a + b;
}

test("adds 1 + 2 to equal 3", () => {
  expect(sum(1, 2)).toBe(3);
});

test("weekToDate 2024-02-01", () => {
  expect(getDateRange(new URL("/period/weekToDate", "https://www.toggl.com"), new Date("2024-02-01"))).toBe([
    "2024-01-29",
    "2024-02-01",
  ]);
});
