import { expect, test } from "vitest";
import { getDateRange } from "../src/dateRanges";

const testData: [Date, [string, string]][] = [
  [new Date("2024-02-01"), ["2024-01-29", "2024-02-01"]],
  [new Date("2024-02-02"), ["2024-01-29", "2024-02-02"]],
  [new Date("2024-02-03"), ["2024-01-29", "2024-02-03"]],
  [new Date("2024-02-04"), ["2024-01-29", "2024-02-04"]],
  [new Date("2024-02-26"), ["2024-02-26", "2024-02-26"]],
  [new Date("2024-02-27"), ["2024-02-26", "2024-02-27"]],
  [new Date("2024-02-28"), ["2024-02-26", "2024-02-28"]],
  [new Date("2024-02-29"), ["2024-02-26", "2024-02-29"]],
  [new Date("2024-03-01"), ["2024-02-26", "2024-03-01"]],
  [new Date("2024-03-02"), ["2024-02-26", "2024-03-02"]],
  [new Date("2024-03-03"), ["2024-02-26", "2024-03-03"]],
];

test.each(testData)("weekToData, %s", (a, expected) => {
  expect(getDateRange(new URL("/period/weekToDate", "https://www.toggl.com"), a)).toStrictEqual(expected);
});
