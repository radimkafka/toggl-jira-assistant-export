import type { ConfigApiKeyLocation } from "./types";

let currentTabId: number | undefined = undefined;

export function setCurrentTabId(tabId: number) {
  return (currentTabId = tabId);
}

export function alertInTargetTab(text: string) {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }
  chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: async (...args: [string]) => {
      alert(`toggl jira assistant export:\n${args[0]}`);
    },
    args: [text],
  });
}

export async function fetchInTargetTab<T>(url: string, authHeader?: string) {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }

  const response = await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: async (...args: [string, string | null]) => {
      const response = await fetch(args[0], {
        method: "GET",
        headers: args[1] ? { Authorization: args[1] } : undefined,
      });
      return (await response.json()) as T;
    },
    args: [url, authHeader ?? null],
  });
  return response[0].result;
}

export async function getApiToken(location?: ConfigApiKeyLocation) {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }

  const locationKey = location?.key ?? "/api/v9/me";
  const locationStorage = location?.storage ?? "session";
  const locationPropertyName = location?.propertyName ?? "api_token";
  const response = await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: (...args: string[]) => {
      const storage = args[1] === "session" ? sessionStorage : localStorage;
      const me = JSON.parse(storage.getItem(args[0]) ?? "null");
      return me?.[args[2]];
    },
    args: [locationKey, locationStorage, locationPropertyName],
  });
  return response[0].result;
}

export async function download(filename: string, text: string) {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }

  await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: (...args: string[]) => {
      var hiddenElement = document.createElement("a");
      hiddenElement.href = "data:attachment/text," + encodeURI(args[0]);
      hiddenElement.target = "_blank";
      hiddenElement.download = args[1];
      hiddenElement.click();
    },
    args: [text, filename],
  });
}
