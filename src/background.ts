const dateRange = {
    this_month: "thisMonth",
    prev_month: "prevMonth",
    custom: "custom"
};

async function onClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
    const config = await GetConfig();
    chrome.storage.local.set({ "togglJiraConfig": { ...config, dateMode: getDateMode(info.menuItemId) } });

    chrome.scripting.executeScript({
        target: { tabId: tab?.id ?? 0 },
        files: ['script.js']
    });
}

function getDateMode(tabId: string) {
    for (const key in dateRange)
        if (tabId.includes(key))
            return (dateRange as any)[key];

    return dateRange.prev_month;
}

async function GetConfig() {
    var response = await fetch("./config.json");
    var data = await response.json();
    return data;
}

const contextItemMain = {
    contexts: ['page'],
    id: 'toggle_jira_report',
    title: 'Toggle jira report',
    type: 'normal',
    visible: true,
};

const contextItemThisMonth = {
    contexts: ['page'],
    parentId: 'toggle_jira_report',
    id: 'toggle_jira_report_this_month',
    title: 'This month',
    type: 'normal',
    visible: true,
};

const contextItemPrevMonth = {
    contexts: ['page'],
    parentId: 'toggle_jira_report',
    id: 'toggle_jira_report_prev_month',
    title: 'Previous month',
    type: 'normal',
    visible: true,
};
const contextItemCustom = {
    contexts: ['page'],
    parentId: 'toggle_jira_report',
    id: 'toggle_jira_report_custom',
    title: 'From url',
    type: 'normal',
    visible: true
};


chrome.contextMenus.create(contextItemMain);
chrome.contextMenus.create(contextItemThisMonth);
chrome.contextMenus.create(contextItemPrevMonth);
chrome.contextMenus.create(contextItemCustom);
chrome.contextMenus.onClicked.addListener(onClick);