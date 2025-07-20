import { createReport } from "./script.js";

async function onClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  if (!tab) return;
  const config = await GetConfig();
  await createReport(tab, config);
}

async function GetConfig() {
  try {
    var response = await fetch("./config.json");
    var data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}

const contextItemMain: chrome.contextMenus.CreateProperties = {
  contexts: ["page"],
  id: "toggle_jira_report",
  title: "Toggle jira report",
  type: "normal",
  visible: true,
  targetUrlPatterns: ["https://track.toggl.com/reports/*"],
};

chrome.contextMenus.create(contextItemMain);
chrome.contextMenus.onClicked.addListener(onClick);
