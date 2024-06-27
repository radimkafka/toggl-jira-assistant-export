import { expect, test } from "vitest";
import { parseComment } from "../src/script";
import { CommentItem } from "../src/types";

const expectedValues = [
  {
    type: "projectNumber",
    value: "52",
  },
  {
    type: "Comment",
    value: "Test123",
  },
  {
    type: "Tag",
    value: "Tag123",
  },
] as const satisfies CommentItem[];

const rounding5minTestData: [string, CommentItem[]][] = [
  ["52;Test123", [expectedValues[0], expectedValues[1]]],
  ["52#Tag123", [expectedValues[0], expectedValues[2]]],
  ["52;Test123#Tag123", [expectedValues[0], expectedValues[1], expectedValues[2]]],
  ["52#Tag123;Test123", [expectedValues[0], expectedValues[2], expectedValues[1]]],
  ["52;Test123;Test456", [expectedValues[0], expectedValues[1], { type: "Comment", value: "Test456" }]],
];

test.each(rounding5minTestData)("Parse comment: %s", (a, expected) => {
  expect(parseComment(a)).toEqual(expected);
});
