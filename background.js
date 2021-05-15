
async function onClick(info, tab) {
    const config = await GetConfig();
    chrome.storage.local.set({ "togglJiraConfig": config });
    
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['script.js']
    }, callback);
}



async function GetConfig() {
    var response = await fetch("./config.json");
    var data = await response.json();
    return data;
}

function callback(data) {
    console.log('callback data: ', data);
    if (data === undefined)
        return;

    const items = data[0].result
    // {project, comment, duration, duration, date}[]

    const records = [];
    items.forEach(item => {
        updateRecord(item);
        let foundItem = records.find(a => a.project === item.project && a.date === item.date && a.comment === item.comment);
        if (foundItem !== undefined) {
            foundItem.totalDuration += item.totalDuration;
            foundItem.recordCount += 1;
        }
        else {
            records.push({ ...item, recordCount: 1 });
        }
    });

    let output = "Ticket No,Start Date,Timespent,Comment";
    records.forEach(a => {
        output += "\n" + stringifyWorklog(a);
    });

    console.log('records: ', records);
    console.log(output);
}

function updateRecord(workLog) {
    const commentIndex = workLog.comment.search(";");
    if (commentIndex > -1) {
        const projNumber = workLog.comment.slice(0, commentIndex);
        workLog.comment = workLog.comment.slice(commentIndex + 1, workLog.comment.length);
        workLog.project = `${workLog.project}-${projNumber}`;
    }
    else {
        workLog.project = `${workLog.project}-${workLog.comment}`;
        workLog.comment = "";
    }

    const durationIndex = workLog.duration.search(":");
    if (durationIndex > -1) {
        var hours = workLog.duration.slice(0, durationIndex);
        var minutes = workLog.duration.slice(durationIndex + 1, workLog.duration.length);
        workLog.totalDuration = Number(hours) * 60 + Number(minutes);
    }
    else {
        workLog.totalDuration = Number(workLog.duration);
    }
}

function stringifyWorklog({ project, comment, totalDuration, date }) {
    const minutes = totalDuration % 60;
    const hours = (totalDuration - minutes) / 60;

    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    const hoursString = hours < 10 ? `0${hours}` : hours;

    return `${project};${date};${hoursString}:${minutesString};${comment}`;
}

const contextItem = {
    contexts: ['page'],
    id: 'toggle_jira_report',
    title: 'Toggle jira report',
    type: 'normal',
    visible: true,
};

chrome.contextMenus.create(contextItem, callback);
chrome.contextMenus.onClicked.addListener(onClick);