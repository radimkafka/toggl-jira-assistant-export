function download(filename, text) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(text);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.click();
}

function processData(data) {
    return data.map(a => ({ project: a.project, comment: a.description, totalDuration: Math.round((a.dur / 60000)), date: dateFormat(a.start) }))
}

function groupData(data, toRoundDuration) {
    const records = [];
    data.forEach(item => {
        const updatedRecord = updateRecord(item);
        let foundItem = records.find(a => a.project === updatedRecord.project && a.date === updatedRecord.date && a.comment === updatedRecord.comment);
        if (foundItem !== undefined) {
            foundItem.totalDuration += updatedRecord.totalDuration;
            foundItem.recordCount += 1;
        }
        else {
            records.push({ ...updatedRecord, recordCount: 1 });
        }
    });
    return toRoundDuration ? records.map(a => ({ ...a, totalDuration: roundDuration(a.totalDuration) })) : records;
}

function createReports(data, filter) {
    //{ filename, restAs, includedProjects}   
    filter.forEach(a => {
        const itemsForReport = data.filter(d => a.includedProjects.includes(d.projectName) || !!a.restAs)
            .map(d => !!a.restAs ? (a.includedProjects.includes(d.projectName) ? d : { ...d, project: a.restAs, comment: d.project }) : d);
        const content = getReportContent(itemsForReport);
        download(`${a.filename}.csv`, content);
    });
}

function getReportContent(data) {
    let output = "Ticket No;Start Date;Timespent;Comment";
    data.forEach(a => {
        output += "\r\n" + stringifyWorklog(a);
    });
    return output;
}

function updateRecord(workLogItem) {
    // vše za středníkem je komentář
    var updatedRecord = { ...workLogItem };
    const commentIndex = updatedRecord.comment.search(";");
    if (commentIndex > -1) {
        const projNumber = updatedRecord.comment.slice(0, commentIndex);
        updatedRecord.comment = updatedRecord.comment.slice(commentIndex + 1, updatedRecord.comment.length);
        updatedRecord.projectName = updatedRecord.project;
        updatedRecord.project = `${updatedRecord.project}-${projNumber}`;
    }
    else {
        if (!!updatedRecord.project) {
            updatedRecord.projectName = updatedRecord.project;
            updatedRecord.project = `${updatedRecord.project}-${updatedRecord.comment}`;
            updatedRecord.comment = "";
        }
        else {
            updatedRecord.projectName = "";
            updatedRecord.project = "NoProject";
        }
    }
    return updatedRecord;
}

function stringifyWorklog({ project, comment, totalDuration, date }) {
    const minutes = totalDuration % 60;
    const hours = (totalDuration - minutes) / 60;

    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    const hoursString = hours < 10 ? `0${hours}` : hours;

    return `${project};${date};${hoursString}:${minutesString};${comment}`;
}

/*

*/
function getConfigFromStorageAsync() {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get("togglJiraConfig", function (items) {
            resolve(items.togglJiraConfig);
        })
    });
}

async function getDataAsync(from, to, workspaceId) {
    let start = 1;
    let paging = 1;
    let workspace_id = workspaceId;
    let url = ""

    let totalCount = 0;
    let loadedData = 0;

    let records = [];
    do {
        url = `https://track.toggl.com/reports/api/v2/details.json?workspace_id=${workspace_id}&start_date=${from}&end_date=${to}&start=${start}&order_by=date&order_dir=asc&date_format=MM/DD/YYYY&order_field=date&order_desc=false&since=${from}&until=${to}&page=${paging}&user_agent=Toggl%20New%205.10.10&bars_count=31&subgrouping_ids=true&bookmark_token=`
        var response = await fetch(url);
        var data = await response.json();
        records = records.concat(data.data);

        totalCount = data.total_count
        loadedData += data.data.length;

        paging += 1;
        start += 1;
    }
    while (totalCount > loadedData);

    return records;
}

function dateFormat(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
}

function roundDuration(worklogItemDuration) {
    const modulo = worklogItemDuration % 5;
    let add = 0;
    if (modulo >= 3) {
        add = 5 - modulo;
    }
    else {
        add = -1 * modulo;
    }
    return worklogItemDuration + add;
}

function getDateRange() {
    const from = "2021-05-01";
    const to = "2021-05-31";
    return [from, to];
}

function test123(){
    console.log("aaaa");
}

(async function () {
    const [from, to] = getDateRange();
    const config = await getConfigFromStorageAsync();
    const data = await getDataAsync(from, to, config.workspaceId);
    const processedData = processData(data);
    const groupedData = groupData(processedData, config.roundDuration);    
    createReports(groupedData, config.filter);
})();