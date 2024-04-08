import { getDateRange } from "./dateRanges.js";
import { fetchInTargetTab, getApiToken, logInTargetTab, setCurrentTabId } from "./targetWindowUtils.js";
import type {
  Config,
  CommentItem,
  CommentItemType,
  GroupedReportItem,
  ReportData,
  ReportItem,
  ConfigFilterItem,
  ConfigApiKeyLocation,
  TimeEntry,
  Project,
  DateMode,
  DateRangeType,
} from "./types";

function download(filename: string, text: string) {
  // todo vyzkoušet
  var hiddenElement = document.createElement("a");
  hiddenElement.href = "data:attachment/text," + encodeURI(text);
  hiddenElement.target = "_blank";
  hiddenElement.download = filename;
  hiddenElement.click();
}

function processData(data: TimeEntry[], projects: Project[]): ReportItem[] {
  return data.map(a => createReportItem(a, projects));
}

function createReportItem(timeEntry: TimeEntry, projects: Project[]): ReportItem {
  const projectName = projects.find(a => a.id === timeEntry.project_id)?.name ?? "NoProject";
  const durationInSeconds = timeEntry.duration;
  const date = dateStringFormat(timeEntry.start);

  const comments = parseComment(timeEntry.description);
  const projectNumber = comments.find(a => a.type === "projectNumber")?.value ?? "NoProject";
  if (projectNumber === "NoProject") console.warn("Item without project!", timeEntry);

  let reportItem: ReportItem = {
    date,
    duration: durationInSeconds,
    projectName,
    projectNumber,
    project: `${projectName}-${projectNumber}`,
    comment: comments
      .filter(a => a.type === "Comment")
      .map(a => a.value)
      .join(", "),
    commentItems: comments,
  };
  return reportItem;
}

/**
 * Spáruje záznamy se stejným dnem, projektem a komentářem
 * @param data
 */
function groupData(data: ReportItem[]): GroupedReportItem[] {
  const records: GroupedReportItem[] = [];
  data.forEach(item => {
    let foundItem = records.find(a => a.project === item.project && a.date === item.date && a.comment === item.comment);
    if (foundItem) {
      foundItem.recordCount += 1;
      foundItem.duration += item.duration;
    } else {
      records.push({ ...item, recordCount: 1, duration: item.duration });
    }
  });

  return records;
}

function createReports(data: { name: string; items: ReportData[] }[], config: Config) {
  data.forEach(a => {
    download(`${a.name}.csv`, getReportContent(a.items, config));
  });
}

function filterData(data: GroupedReportItem[], config: Config): { name: string; items: ReportData[] }[] {
  const updateRestName = (i: GroupedReportItem, a: ConfigFilterItem) => ({
    ...i,
    project: a.restAs,
    comment: `${i.project} ${i.comment}`,
  });

  const updateTransformedName = (i: GroupedReportItem, a: ConfigFilterItem) => ({
    ...i,
    project: a.transformations.find(t => t.sourceProjectName === i.projectName)!.destinationProject,
    comment: `${i.project} ${i.comment}`,
  });

  return config.filter.map(a => {
    const transformedProjectNames = a.transformations?.map(a => a.sourceProjectName) ?? [];

    const grouped = data.reduce<{
      transformed: GroupedReportItem[];
      included: GroupedReportItem[];
      rest: GroupedReportItem[];
    }>(
      (acc, d) =>
        a.includedProjects.includes(d.projectName)
          ? { ...acc, included: [...acc.included, d] }
          : transformedProjectNames.includes(d.projectName)
          ? { ...acc, transformed: [...acc.transformed, d] }
          : { ...acc, rest: [...acc.rest, d] },
      { transformed: [], included: [], rest: [] }
    );

    const itemsForReport = [
      ...grouped.included.map(i => getReportData(i)),
      ...grouped.transformed.map(i => getReportData(updateTransformedName(i, a))),
      ...(a.restAs ? grouped.rest.map(i => getReportData(updateRestName(i, a))) : []),
    ];

    return {
      name: a.filename,
      items: config?.roundDuration ? roundDurations(itemsForReport, config?.roundToMinutes) : itemsForReport,
    };
  });
}

function getReportData(item: GroupedReportItem): ReportData {
  return {
    comment: item.comment,
    date: item.date,
    project: item.project,
    duration: item.duration,
  };
}

function roundDurations(data: ReportData[], roundToMinutes?: number) {
  const sortedData = data.sort((a, b) => a.project.localeCompare(b.project));
  let restOfRounding = 0;
  return sortedData
    .map(a => {
      let rounded = roundDuration(a.duration + restOfRounding, roundToMinutes);
      restOfRounding += a.duration - rounded;
      return { ...a, duration: rounded };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

function getReportContent(data: ReportData[], config: Config) {
  let output = "Ticket No;Start Date;Timespent;Comment";
  const newLine = "\r\n";
  data.forEach(a => {
    output += newLine + stringifyWorklog(a, config.includeSeconds);
  });
  return output;
}

/**
 *
 * @param comment
 */
function parseComment(comment: string) {
  let commentRest = comment;
  const commentItems = [];
  let index = 0;
  do {
    index = findSeparatorIndex(commentRest.slice(1, commentRest.length));
    if (index === -1) {
      commentItems.push(getCommentItem(commentRest));
      break;
    }
    let value = commentRest.slice(0, index + 1);
    commentItems.push(getCommentItem(value));
    commentRest = commentRest.slice(index + 1, commentRest.length);
  } while (index !== -1);
  return commentItems;
}

/**
 * Najde první index oddělovače
 * @param data
 */
function findSeparatorIndex(data: string) {
  if (!data) return -1;
  const separators = [";", "#"];
  return (
    separators
      .map(s => data.indexOf(s))
      .filter(a => a >= 0)
      .sort((a, b) => a - b)
      .find(_ => true) ?? -1
  );
}

/**
 * Vytvoří Description Item
 * @param value
 */
function getCommentItem(value: string): CommentItem {
  let type: CommentItemType = "unknown";
  if (value?.length > 0) {
    switch (value[0]) {
      case ";":
        type = "Comment";
        break;
      case "#":
        type = "Tag";
        break;
      default:
        type = "projectNumber";
        break;
    }
  }

  return {
    type,
    value: value.slice(["projectNumber", "unknown"].includes(type) ? 0 : 1, value.length), //pokud se jedná okomentář, tak smažeme oddělovač (# nebo ;)
  };
}

/**
 *
 * @param duration dobra v sekundách
 * @param includeSeconds
 */
function timeFormat(duration: number, includeSeconds?: boolean) {
  const hours = Math.floor(duration / 60 / 60);
  const minutes = Math.floor((duration - hours * 60 * 60) / 60);
  const seconds = duration - (hours * 60 * 60 + minutes * 60);

  const minutesString = minutes < 10 ? `0${minutes}` : minutes;
  const hoursString = hours < 10 ? `0${hours}` : hours;
  const secondsString = seconds < 10 ? `0${seconds}` : seconds;
  return `${hoursString}:${minutesString}${!!includeSeconds ? ":" + secondsString : ""}`;
}

function stringifyWorklog({ project, comment, duration, date }: ReportData, includeSeconds?: boolean) {
  return `${project};${date};${timeFormat(duration, includeSeconds)};${comment}`;
}

async function getDataAsync(dateFrom: string, dateTo: string, authHeader: string): Promise<TimeEntry[]> {
  const dateTimeFrom = `${dateFrom}T00:00:00.000Z`;
  const dateTimeTo = `${dateTo}T23:59:59.999Z`;
  const url = `https://track.toggl.com/api/v9/me/time_entries?start_date=${dateTimeFrom}&end_date=${dateTimeTo}`;
  const response = await fetchInTargetTab<TimeEntry[]>(url, authHeader);
  return response ?? [];
}

async function getProjectsAsync(workspaceId: string, authHeader: string): Promise<Project[]> {
  const url = `https://track.toggl.com/api/v9/workspaces/${workspaceId}/projects`;
  const response = await fetchInTargetTab<Project[]>(url, authHeader);
  return response ?? [];
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

function roundDuration(worklogItemDuration: number, roundToMinutes: number = 5): number {
  const roundToSeconds = 60 * roundToMinutes;
  const modulo = worklogItemDuration % roundToSeconds;
  let add = 0;
  if (modulo >= roundToSeconds / 2) {
    add = roundToSeconds - modulo;
  } else {
    add = -1 * modulo;
  }
  const rounded = worklogItemDuration + add;
  return rounded;
}

function getWorkspaceId(tabUrl: URL): string {
  const url = tabUrl.pathname;
  let rest = url.replace("https://", "");

  rest = rest.substring(rest.indexOf("/") + 1); //odstranění stránky
  rest = rest.substring(rest.indexOf("/") + 1); //odstranění reports
  rest = rest.substring(rest.indexOf("/") + 1); //odstranění summary/detailed/weekly

  let id = "";
  //pokud je v url od do, tak obsahuje další lomítko, jinak ne
  if (rest.indexOf("/") > 0) {
    id = rest.substring(0, rest.indexOf("/"));
    rest = rest.substring(rest.indexOf("/") + 1);
  } else {
    id = rest;
    rest = "";
  }

  return id;
}

export async function createReport(tab: chrome.tabs.Tab, config: Config) {
  if (!tab.id) {
    console.warn("Tab id not found!");
    return;
  }

  setCurrentTabId(tab.id);
  if (!tab.url) {
    logInTargetTab("Tab url not found!", "warn");
    return;
  }

  const url = new URL(tab.url ?? "");
  const [from, to] = getDateRange(url);

  const workspaceId = getWorkspaceId(url);
  if (!workspaceId) {
    logInTargetTab("Workspace not found!", "warn");
    return;
  }

  const apiToken = await getApiToken(config.apiKeyLocation);
  if (!apiToken) {
    logInTargetTab("Api token not found!", "warn");
    return;
  }

  const authHeader = `Basic ${btoa(`${apiToken}:api_token`)}`;
  const projects = await getProjectsAsync(workspaceId, authHeader);
  const data = await getDataAsync(from, to, authHeader);

  const processedData = processData(data, projects);

  const groupedData = groupData(processedData);
  const filteredData = filterData(groupedData, config);
  createReports(filteredData, config);
}
