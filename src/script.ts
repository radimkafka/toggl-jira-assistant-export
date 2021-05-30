import { Config, ConfigFilterItem, DateModel, GroupedReportItem, ReportData, ReportItem, TogglReportItem, TogglResponse } from "./types";

function download(filename: string, text: string) {
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:attachment/text,' + encodeURI(text);
    hiddenElement.target = '_blank';
    hiddenElement.download = filename;
    hiddenElement.click();
}

function processData(data: TogglReportItem[]): ReportItem[] {
    return data.map(a => ({ project: a.project, comment: a.description, duration: Math.round((a.dur / 1000)), date: dateStringFormat(a.start) }))
}

/**
 * Spáruje záznamy se stejným dnem, projektem a komentářem
 * @param data 
 */
function groupData(data: ReportItem[]) {
    const records: GroupedReportItem[] = [];
    data.forEach((item) => {
        const updatedRecord = updateProjectName(item);
        let foundItem = records.find(a => a.project === updatedRecord.project && a.date === updatedRecord.date && a.comment === updatedRecord.comment);
        if (foundItem) {
            foundItem.recordCount += 1;
            foundItem.roundedDuration += roundDuration(updatedRecord.duration);
            foundItem.duration += updatedRecord.duration;
        }
        else {
            records.push({ ...updatedRecord, recordCount: 1, roundedDuration: roundDuration(updatedRecord.duration), duration: updatedRecord.duration });
        }
    });

    return records;
}

function createReports(data: { name: string, items: ReportData[] }[]) {
    data.forEach(a => {
        download(`${a.name}.csv`, getReportContent(a.items));
    });
}

function filterData(data: GroupedReportItem[], config: Config): { name: string, items: ReportData[] }[] {    
    return config.filter.map(a => {
        const itemsForReport = data.filter(d => a.includedProjects.includes(d?.projectName ?? "") || !!a.restAs)
            .map(d => !!a.restAs && !a.includedProjects.includes(d?.projectName ?? "") ? getReportData({ ...d, project: a.restAs, comment: d.project }, config.roundDuration) : getReportData(d, config.roundDuration));
        return { name: a.filename, items: itemsForReport };
    });
}

function getReportData(item: GroupedReportItem, useRoundedDuration: boolean): ReportData {
    return {
        comment: item.comment,
        date: item.date,
        project: item.project,
        duration: useRoundedDuration ? item.roundedDuration : item.duration
    };
}

function getReportContent(data: ReportData[]) {
    let output = "Ticket No;Start Date;Timespent;Comment";
    const newLine = "\r\n";
    data.forEach(a => {
        output += newLine + stringifyWorklog(a);
    });
    return output;
}

/**
 * Upraví project, project name a comment 
 * @param item 
 */
function updateProjectName(item: ReportItem): ReportItem {
    // vše za středníkem je komentář
    var updatedRecord = { ...item };
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
            console.warn("Item without project!", item);
        }
    }
    return updatedRecord;
}

/**
 * 
 * @param duration dobra v sekundách
 * @param includeSeconds 
 */
function timeFormat(duration: number, includeSeconds?: boolean) {
    const hours = Math.floor(duration / 60 / 60);
    const minutes = Math.floor((duration - hours * 60 * 60) / 60)
    const seconds = duration - (hours * 60 * 60 + minutes * 60)

    const minutesString = minutes < 10 ? `0${minutes}` : minutes;
    const hoursString = hours < 10 ? `0${hours}` : hours;
    const secondsString = seconds < 10 ? `0${seconds}` : seconds;
    return `${hoursString}:${minutesString}${!!includeSeconds ? ":" + secondsString : ""}`;
}

function stringifyWorklog({ project, comment, duration, date }: ReportData) {
    return `${project};${date};${timeFormat(duration)};${comment}`;
}

function getConfigFromStorageAsync(): Promise<Config> {
    return new Promise(function (resolve, reject) {
        chrome.storage.local.get("togglJiraConfig", function (items) {
            resolve(items.togglJiraConfig);
        })
    });
}

async function getDataAsync(from: string, to: string, workspaceId: string): Promise<TogglReportItem[]> {
    let start = 1;
    let paging = 1;
    let workspace_id = workspaceId;
    let url = ""

    let totalCount = 0;
    let loadedData = 0;

    let records: TogglReportItem[] = [];
    do {
        url = `https://track.toggl.com/reports/api/v2/details.json?workspace_id=${workspace_id}&start_date=${from}&end_date=${to}&start=${start}&order_by=date&order_dir=asc&date_format=MM/DD/YYYY&order_field=date&order_desc=false&since=${from}&until=${to}&page=${paging}&user_agent=Toggl%20New%205.10.10&bars_count=31&subgrouping_ids=true&bookmark_token=`
        var response = await fetch(url);
        var data: TogglResponse = await response.json();
        records = records.concat(data.data);

        totalCount = data.total_count
        loadedData += data.data.length;

        paging += 1;
        start += 1;
    }
    while (totalCount > loadedData);

    return records;
}

function dateFormat(date: Date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return `${year}-${month < 10 ? "0" : ""}${month}-${day < 10 ? "0" : ""}${day}`;
}

function dateStringFormat(dateString: string) {
    const date = new Date(dateString);
    return dateFormat(date);
}

function roundDuration(worklogItemDuration: number): number {
    const modulo = worklogItemDuration % (60 * 5);
    let add = 0;
    if (modulo >= 150) {
        add = 300 - modulo;
    }
    else {
        add = -1 * modulo;
    }
    const rounded = worklogItemDuration + add;
    return rounded;
}

function getDateRageThisMonth(): [string, string] {
    const dateNow = new Date(Date.now());
    const from = new Date(dateNow.getFullYear(), dateNow.getMonth(), 1);
    const to = new Date(dateNow.getFullYear(), dateNow.getMonth() + 1, 0);
    return [dateFormat(from), dateFormat(to)];

}

function getDateRagePreviousMonth(): [string, string] {
    const dateNow = new Date(Date.now());
    const from = new Date(dateNow.getFullYear(), dateNow.getMonth() - 1, 1);
    const to = new Date(dateNow.getFullYear(), dateNow.getMonth(), 0);
    return [dateFormat(from), dateFormat(to)];
}

function getDateRangeFromUrl(): [string, string] {
    const matched = window.location.pathname.match("from\/(?<from>....-..-..)\/to\/(?<to>(....-..-..))");
    if (!matched?.groups?.["from"] || !matched?.groups?.["to"]) {
        console.warn("Date not found in URL. Date range set to last month.")
        return getDateRagePreviousMonth();
    }
    return [matched.groups["from"], matched?.groups["to"]];
}

function getDateRange(mode: DateModel): [string, string] {
    switch (mode) {
        case "custom": return getDateRangeFromUrl();
        case "thisMonth": return getDateRageThisMonth();
        case "prevMonth": return getDateRagePreviousMonth();
        default: return getDateRagePreviousMonth();
    }
}

function getWorkspaceId(): string {
    const url = window.location.pathname;
    var rest = url.replace("https://", "");

    rest = rest.substring(rest.indexOf("\/") + 1);//odstranění stránky    
    rest = rest.substring(rest.indexOf("\/") + 1);//odstranění reports    
    rest = rest.substring(rest.indexOf("\/") + 1);//odstranění summary/detailed/weekly

    let id = "";
    //pokud je v url od do, tak obsahuje další lomítko, jinak ne
    if (rest.indexOf("\/") > 0) {
        id = rest.substring(0, rest.indexOf("\/"));
        rest = rest.substring(rest.indexOf("\/") + 1);
    }
    else {

        id = rest;
        rest = "";
    }

    return id;
}

(async function () {
    const config = await getConfigFromStorageAsync();
    const [from, to] = getDateRange(config.dateMode);
    const workspaceId = getWorkspaceId();
    if (!workspaceId)
        return;

    const data = await getDataAsync(from, to, workspaceId);
    const processedData = processData(data);
    const groupedData = groupData(processedData);
    const filteredData = filterData(groupedData, config);

    createReports(filteredData);
})();