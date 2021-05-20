
async function onClick(info, tab) {    
    const config = await GetConfig();    
    chrome.storage.local.set({ "togglJiraConfig": config });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    });
}

async function GetConfig() {
    var response = await fetch("./config.json");
    var data = await response.json();
    return data;
}

const contextItem = {
    contexts: ['page'],
    id: 'toggle_jira_report',
    title: 'Toggle jira report',
    type: 'normal',
    visible: true,
};

chrome.contextMenus.create(contextItem);
chrome.contextMenus.onClicked.addListener(onClick);