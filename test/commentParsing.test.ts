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

test("Parse comment: 52;Test123", () => {
  const data = parseComment("52;Test123");
  expect(data).toEqual([expectedValues[0], expectedValues[1]]);
});

test("Parse comment: 52#Tag123", () => {
  const data = parseComment("52#Tag123");
  expect(data).toEqual([expectedValues[0], expectedValues[2]]);
});

test("Parse comment: 52;Test123#Tag123", () => {
  const data = parseComment("52;Test123#Tag123");
  expect(data).toEqual([expectedValues[0], expectedValues[1], expectedValues[2]]);
});

test("Parse comment: 52#Tag123;Test123", () => {
  const data = parseComment("52#Tag123;Test123");
  expect(data).toEqual([expectedValues[0], expectedValues[2], expectedValues[1]]);
});
