import { Config } from "../src/types";

export const testData = [
  {
    description: "52;Test123#Tag123",
    start: "2021-05-04T07:00:55+02:00",
    dur: 22 * 60 * 1000,
    project: "Test",
  },
  {
    description: "52;Test123#456",
    start: "2021-05-04T07:00:55+02:00",
    dur: 21 * 60 * 1000,
    project: "Test",
  },
  {
    description: "52;Test123",
    start: "2021-05-04T07:00:55+02:00",
    dur: 120 * 60 * 1000,
    project: "Blabla",
  },
  {
    description: "52;Test123#Test123",
    start: "2021-05-04T07:00:55+02:00",
    dur: 120 * 60 * 1000,
    project: "Blabla",
  },
  {
    description: "52;Test123#Test123",
    start: "2021-05-04T07:00:55+02:00",
    dur: 120 * 60 * 1000,
    project: "ToBeTransformed",
  },
  {
    description: "111;Magic#Test123",
    start: "2021-05-05T07:00:55+02:00",
    dur: 60 * 60 * 1000,
    project: "ToBeTransformed2",
  },
];

export const workspaceId = 3522757;
export const baseConfig: Config = {
  roundDuration: true,
  filter: [
    {
      filename: "elx",
      restAs: "BEI-27",
      includedProjects: ["BEI", "RED", "ESA", "SWE", "OLZA"],
    },
  ],
};
