import { expect, test } from "vitest";
import { roundDuration } from "../src/script";

const getSecondsFromMinuts = (minutes: number) => minutes * 60;

const rounding5minTestData = [
  [getSecondsFromMinuts(2) + 28, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(2) + 29, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(2) + 30, getSecondsFromMinuts(5)],
  [getSecondsFromMinuts(2) + 31, getSecondsFromMinuts(5)],
  [getSecondsFromMinuts(2) + 32, getSecondsFromMinuts(5)],
];

test.each(rounding5minTestData)("round duration to 5min, %s", (a, expected) => {
  expect(roundDuration(a, 5)).toBe(expected);
});

const rounding15minTestData = [
  [getSecondsFromMinuts(7) + 28, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(7) + 29, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(7) + 30, getSecondsFromMinuts(15)],
  [getSecondsFromMinuts(7) + 31, getSecondsFromMinuts(15)],
  [getSecondsFromMinuts(7) + 32, getSecondsFromMinuts(15)],
];

test.each(rounding15minTestData)("round duration to 15min, %s", (a, expected) => {
  expect(roundDuration(a, 15)).toBe(expected);
});

const rounding20minTestData = [
  [getSecondsFromMinuts(9) + 58, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(9) + 59, getSecondsFromMinuts(0)],
  [getSecondsFromMinuts(10) + 0, getSecondsFromMinuts(20)],
  [getSecondsFromMinuts(10) + 1, getSecondsFromMinuts(20)],
  [getSecondsFromMinuts(10) + 2, getSecondsFromMinuts(20)],
];

test.each(rounding20minTestData)("round duration to 20min, %s", (a, expected) => {
  expect(roundDuration(a, 20)).toBe(expected);
});
