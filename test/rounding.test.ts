import { expect, test } from "vitest";
import { roundDuration } from "../src/script";
// function testRounding() {
//     const getSecondsFromMinuts = minutes => minutes * 60;
//     const getSeconds = _ => Math.floor(Math.random() * 60);
//     const test = duration => {
//       var rounded = roundDuration(duration);
//       console.log(timeFormat(duration, true), timeFormat(rounded, true));
//     };

//     for (let i = 0; i <= 10; i++) {
//       test(getSecondsFromMinuts(i) + getSeconds());
//     }
//     for (let i = 40; i < 50; i++) {
//       test(getSecondsFromMinuts(i) + getSeconds());
//     }
//     console.log("_______");
//     test(getSecondsFromMinuts(2) + 28);
//     test(getSecondsFromMinuts(2) + 29);
//     test(getSecondsFromMinuts(2) + 30);
//     test(getSecondsFromMinuts(2) + 31);
//     test(getSecondsFromMinuts(2) + 32);
//   }

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
