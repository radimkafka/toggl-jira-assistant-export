import {
  Config,
  CommentItem,
  CommentItemType,
  GroupedReportItem,
  ReportData,
  ReportItem,
  TogglReportItem,
  TogglResponse,
  ConfigFilterItem,
  ConfigApiKeyLocation,
  TimeEntry,
  Project,
} from "./types";

function download(filename: string, text: string) {
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

function getConfigFromStorageAsync(): Promise<Config> {
  return new Promise(function (resolve, reject) {
    chrome.storage.local.get("togglJiraConfig", function (items) {
      resolve(items.togglJiraConfig);
    });
  });
}

async function getDataAsync(dateFrom: string, dateTo: string, authHeader: string): Promise<TimeEntry[]> {
  const dateTimeFrom = `${dateFrom}T00:00:00.000Z`;
  const dateTimeTo = `${dateTo}T23:59:59.999Z`;
  const url = `https://track.toggl.com/api/v9/me/time_entries?start_date=${dateTimeFrom}&end_date=${dateTimeTo}`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader },
  });
  return (await response.json()) as Promise<TimeEntry[]>;
}

async function getProjectsAsync(workspaceId: string, authHeader: string): Promise<Project[]> {
  const url = `https://track.toggl.com/api/v9/workspaces/${workspaceId}/projects`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: authHeader },
  });
  return (await response.json()) as Promise<Project[]>;
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
  const matched = window.location.pathname.match("from/(?<from>....-..-..)/to/(?<to>(....-..-..))");
  if (matched?.groups?.["from"] && matched?.groups?.["to"]) {
    return [matched.groups["from"], matched?.groups["to"]];
  } else if (window.location.pathname.endsWith("/period/today")) {
    const today = formatDate(new Date());
    return [today, today];
  } else if (window.location.pathname.endsWith("/period/yesterday")) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormated = formatDate(yesterday);
    return [yesterdayFormated, yesterdayFormated];
  } else if (window.location.pathname.endsWith("/period/thisWeek")) {
    const firstDayOfWeek = new Date();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1);

    const lastDayOfWeek = new Date();
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7 - lastDayOfWeek.getDay());

    return [formatDate(firstDayOfWeek), formatDate(lastDayOfWeek)];
  } else if (window.location.pathname.endsWith("/period/prevWeek")) {
    const firstDayOfWeek = new Date();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay() + 1 - 7);

    const lastDayOfWeek = new Date();
    lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 7 - lastDayOfWeek.getDay() - 7);

    return [formatDate(firstDayOfWeek), formatDate(lastDayOfWeek)];
  } else if (window.location.pathname.endsWith("/period/thisMonth")) {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);

    const lastDayOfMonth = new Date();
    lastDayOfMonth.setDate(1);
    lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(-1);

    return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
  } else if (window.location.pathname.endsWith("/period/prevMonth")) {
    const firstDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setDate(-1);
    firstDayOfMonth.setDate(1);

    const lastDayOfMonth = new Date();
    firstDayOfMonth.setDate(1);
    firstDayOfMonth.setDate(-1);

    return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
  } else if (window.location.pathname.endsWith("/period/last30Days")) {
    const date = new Date();
    date.setDate(-30);

    return [formatDate(date), formatDate(new Date())];
  } else if (window.location.pathname.endsWith("/period/last90Days")) {
    const date = new Date();
    date.setDate(-90);

    return [formatDate(date), formatDate(new Date())];
  } else if (window.location.pathname.endsWith("/period/last12Months")) {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);

    return [formatDate(date), formatDate(new Date())];
  } else if (window.location.pathname.endsWith("/period/thisYear")) {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
    return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
  } else if (window.location.pathname.endsWith("/period/prevYear")) {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear() - 1, 0, 1);

    const lastDayOfYear = new Date(today.getFullYear() - 1, 11, 31);
    return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
  }

  console.warn("Date not found in URL. Date range set to last month.");
  return getDateRagePreviousMonth();
}

function formatDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function getDateRange(mode: "custom" | "thisMonth" | "prevMonth"): [string, string] {
  switch (mode) {
    case "custom":
      return getDateRangeFromUrl();
    case "thisMonth":
      return getDateRageThisMonth();
    case "prevMonth":
      return getDateRagePreviousMonth();
    default:
      return getDateRagePreviousMonth();
  }
}

function getWorkspaceId(): string {
  const url = window.location.pathname;
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

function getApiToken(location?: ConfigApiKeyLocation) {
  const locationKey = location?.key ?? "/api/v9/me";
  const locationStorage = location?.storage ?? "session";
  const locationPropertyName = location?.propertyName ?? "api_token";

  const storage = locationStorage === "session" ? sessionStorage : localStorage;
  const me = JSON.parse(storage.getItem(locationKey) ?? "null");
  return me?.[locationPropertyName];
}

(async function () {
  const config = await getConfigFromStorageAsync();
  const [from, to] = getDateRange(config.dateMode);
  const workspaceId = getWorkspaceId();
  if (!workspaceId) {
    console.warn("Workspace not found!");
    return;
  }

  const apiToken = getApiToken(config.apiKeyLocation);
  if (!apiToken) {
    console.warn("Api token not found!");
    return;
  }

  const authHeader = `Basic ${btoa(`${apiToken}:api_token`)}`;

  const projects = await getProjectsAsync(workspaceId, authHeader);
  const data = await getDataAsync(from, to, authHeader);
  const processedData = processData(data, projects);

  const groupedData = groupData(processedData);
  const filteredData = filterData(groupedData, config);
  createReports(filteredData, config);
})();
