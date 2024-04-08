import { ConfigApiKeyLocation } from "./types";

let currentTabId: number | undefined = undefined;

export function setCurrentTabId(tabId: number) {
  return (currentTabId = tabId);
}

export function logInTargetTab(text: string, type: "info" | "warn" | "error" = "info") {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }

  chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: async (...args: string[]) => {
      console[args[0] as "info" | "warn" | "error"](args[1]);
    },
    args: [type, text],
  });
}

export async function fetchInTargetTab<T>(url: string, authHeader: string) {
  if (!currentTabId) {
    throw new Error("currentTabId is not set");
  }

  const response = await chrome.scripting.executeScript({
    target: { tabId: currentTabId },
    func: async (...args: string[]) => {
      const response = await fetch(args[0], {
        method: "GET",
        headers: { Authorization: args[1] },
      });
      return (await response.json()) as T;
    },
    args: [url, authHeader],
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
