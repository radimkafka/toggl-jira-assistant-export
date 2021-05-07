function download(filename, text) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(text);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.click();
}

function getReportDom(data) {
    if (data === undefined)
        return;

    // const items = data[0].result
    // {project, comment, duration, date}[]

    const records = [];
    data.forEach(item => {
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

    let output = "Ticket No;Start Date;Timespent;Comment";
    records.forEach(a => {
        output += "\r\n" + stringifyWorklog(a);
    });

    download('test.txt', output);
}

function getReport(data) {
    if (data === undefined)
        return;

    // const items = data[0].result
    // {project, comment, duration, date}[]

    const records = [];
    data.forEach(item => {
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

    let output = "Ticket No;Start Date;Timespent;Comment";
    records.forEach(a => {
        output += "\r\n" + stringifyWorklog(a);
    });
    
    download('test.csv', output);
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

    // const durationIndex = workLog.duration.search(":");
    // if (durationIndex > -1) {
    //     var hours = workLog.duration.slice(0, durationIndex);
    //     var minutes = workLog.duration.slice(durationIndex + 1, workLog.duration.length);
    //     workLog.totalDuration = Number(hours) * 60 + Number(minutes);
    // }
    // else {
    //     workLog.totalDuration = Number(workLog.duration);
    // }
}

function stringifyWorklog({ project, comment, totalDuration, date }) {
    const minutes = totalDuration % 60;
    const hours = (totalDuration - minutes) / 60;

    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    const hoursString = hours < 10 ? `0${hours}` : hours;

    return `${project};${date};${hoursString}:${minutesString};${comment}`;
}

async function getDataAsync() {
    const from = "2021-04-01";
    const to = "2021-04-30";
    let start = 1;
    let paging = 1;
    let url = `https://track.toggl.com/reports/api/v2/details.json?workspace_id=3522757&start_date=${from}&end_date=${to}&start=3&order_by=date&order_dir=asc&date_format=MM/DD/YYYY&order_field=date&order_desc=false&since=${from}&until=${to}&page=3&user_agent=Toggl%20New%205.10.10&bars_count=31&subgrouping_ids=true&bookmark_token=`

    let totalCount = 0;
    let loadedData = 0;

    let records = [];
    do {
        url = `https://track.toggl.com/reports/api/v2/details.json?workspace_id=3522757&start_date=${from}&end_date=${to}&start=${start}&order_by=date&order_dir=asc&date_format=MM/DD/YYYY&order_field=date&order_desc=false&since=${from}&until=${to}&page=${paging}&user_agent=Toggl%20New%205.10.10&bars_count=31&subgrouping_ids=true&bookmark_token=`
        var response = await fetch(url);
        var data = await response.json();
        records = records.concat(data.data);

        totalCount = data.total_count
        loadedData += data.data.length;

        paging += 1;
        start += 1;
    }
    while (totalCount > loadedData);

    getReport(records.map(a => ({ project: a.project, comment: a.description, totalDuration: (a.dur / 60000).toFixed(0), date: new Date(a.start).toLocaleDateString() })));


}

function getDomData() {
    var elements = document.getElementsByClassName('DetailedReportContent__table');
    if (elements.length > 0) {
        const table = elements[0];
        const body = table.children[1];
        const items = body.children;
        const records = [];
        var project = "";
        var comment = "";
        var duration = "";
        var date = "";
        for (let index = 0; index < items.length; index++) {
            const element = items[index];
            project = element.getElementsByClassName("css-1q07lv6-NameContainer e1t0hi2n9")[0]?.children[0]?.textContent;
            comment = element.getElementsByClassName("ebdwukj8 css-14l5gqu-TimeEntryDescription-DescriptionInput e10vqxue0")[0]?.textContent;
            duration = element.getElementsByClassName("css-1xlwrd0-Highlighted e1ujoigz0")[0].textContent;
            date = element.getElementsByClassName("DateTimeInput__startDate")[0].textContent;
            records.push({ project, comment, duration, date });
        }

        getReport(records);
    }
}

(function () {
    getDataAsync();

    return [];
})();