import { createReport } from "./script.js";
import { DateMode } from "./types.js";

const dateRange = {
  this_month: "thisMonth",
  prev_month: "prevMonth",
  custom: "custom",
} as const;

async function onClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  if (!tab) return;
  const config = await GetConfig();
  await createReport(tab, config, getDateMode(info.menuItemId));
}

function getDateMode(tabId: string | number): DateMode {
  const tabIdString = tabId.toString();
  for (const key in dateRange) if (tabIdString.includes(key)) return (dateRange as any)[key];

  return dateRange.prev_month;
}

async function GetConfig() {
  var response = await fetch("./config.json");
  var data = await response.json();
  return data;
}

const contextItemMain: chrome.contextMenus.CreateProperties = {
  contexts: ["page"],
  id: "toggle_jira_report",
  title: "Toggle jira report",
  type: "normal",
  visible: true,
  targetUrlPatterns: ["https://track.toggl.com/reports/*"],
};

const contextItemThisMonth: chrome.contextMenus.CreateProperties = {
  contexts: ["page"],
  parentId: "toggle_jira_report",
  id: "toggle_jira_report_this_month",
  title: "This month",
  type: "normal",
  visible: true,
  targetUrlPatterns: ["https://track.toggl.com/reports/*"],
};

const contextItemPrevMonth: chrome.contextMenus.CreateProperties = {
  contexts: ["page"],
  parentId: "toggle_jira_report",
  id: "toggle_jira_report_prev_month",
  title: "Previous month",
  type: "normal",
  visible: true,
  targetUrlPatterns: ["https://track.toggl.com/reports/*"],
};
const contextItemCustom: chrome.contextMenus.CreateProperties = {
  contexts: ["page"],
  parentId: "toggle_jira_report",
  id: "toggle_jira_report_custom",
  title: "From url",
  type: "normal",
  visible: true,
  targetUrlPatterns: ["https://track.toggl.com/reports/*"],
};

chrome.contextMenus.create(contextItemMain);
chrome.contextMenus.create(contextItemThisMonth);
chrome.contextMenus.create(contextItemPrevMonth);
chrome.contextMenus.create(contextItemCustom);
chrome.contextMenus.onClicked.addListener(onClick);
