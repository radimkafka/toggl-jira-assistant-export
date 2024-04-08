import type { DateRangeType } from "./types";

const customRangeRegex = /from\/(?<from>....-..-..)\/to\/(?<to>....-..-..)/;

export function getDateRange(url: URL, initDate = new Date()): [string, string] {
  const rangeType = getDateRangeType(url.pathname);

  if (rangeType === "custom") {
    const matched = url.pathname.match(customRangeRegex);
    if (matched?.groups?.["from"] && matched?.groups?.["to"]) {
      return [matched.groups["from"], matched?.groups["to"]];
    }
    console.error("Invalid custom date range URL");
  }

  if (rangeType === "today") {
    const today = formatDate(new Date(initDate));
    return [today, today];
  }

  if (rangeType === "yesterday") {
    const yesterday = new Date(initDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormated = formatDate(yesterday);
    return [yesterdayFormated, yesterdayFormated];
  }

  if (rangeType === "thisWeek") {
    var [startOfWeek, endOfWeek] = getStartAndEndOfWeek(new Date(initDate));

    return [formatDate(startOfWeek), formatDate(endOfWeek)];
  }

  if (rangeType === "prevWeek") {
    var [startOfWeek, endOfWeek] = getStartAndEndOfWeek(subtractDays(initDate, 7));

    return [formatDate(startOfWeek), formatDate(endOfWeek)];
  }

  if (rangeType === "thisMonth") {
    const firstDayOfMonth = new Date(initDate);
    firstDayOfMonth.setDate(1);

    const lastDayOfMonth = new Date(firstDayOfMonth);
    lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
    lastDayOfMonth.setDate(0);

    return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
  }

  if (rangeType === "prevMonth") {
    const firstDayOfMonth = new Date(initDate);
    firstDayOfMonth.setDate(-1);
    firstDayOfMonth.setDate(1);

    const lastDayOfMonth = new Date(initDate);
    lastDayOfMonth.setDate(0);

    return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
  }

  if (rangeType === "last30Days") {
    const date = new Date(initDate);
    date.setDate(date.getDate() - 30);

    return [formatDate(date), formatDate(new Date(initDate))];
  }

  if (rangeType === "last90Days") {
    const date = new Date(initDate);
    date.setDate(date.getDate() - 90);

    return [formatDate(date), formatDate(new Date(initDate))];
  }

  if (rangeType === "last12Months") {
    const date = new Date(initDate);
    date.setFullYear(date.getFullYear() - 1);

    return [formatDate(date), formatDate(new Date(initDate))];
  }

  if (rangeType === "thisYear") {
    const today = new Date(initDate);
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

    const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
    return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
  }

  if (rangeType === "prevYear") {
    const today = new Date(initDate);
    const firstDayOfYear = new Date(today.getFullYear() - 1, 0, 1);

    const lastDayOfYear = new Date(today.getFullYear() - 1, 11, 31);
    return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
  }

  throw new Error("Invalid date range type");
}

export function getDateRangeType(url: string): DateRangeType {
  if (customRangeRegex.test(url)) {
    return "custom";
  }
  if (url.endsWith("/period/today")) {
    return "today";
  }
  if (url.endsWith("/period/yesterday")) {
    return "yesterday";
  }
  if (url.endsWith("/period/thisWeek")) {
    return "thisWeek";
  }
  if (url.endsWith("/period/prevWeek")) {
    return "prevWeek";
  }
  if (url.endsWith("/period/thisMonth")) {
    return "thisMonth";
  }
  if (url.endsWith("/period/prevMonth")) {
    return "prevMonth";
  }
  if (url.endsWith("/period/last30Days")) {
    return "last30Days";
  }
  if (url.endsWith("/period/last90Days")) {
    return "last90Days";
  }
  if (url.endsWith("/period/last12Months")) {
    return "last12Months";
  }
  if (url.endsWith("/period/thisYear")) {
    return "thisYear";
  }
  if (url.endsWith("/period/prevYear")) {
    return "prevYear";
  }

  // todo log v consoli tabu
  console.warn("Date range not found in URL. Date range set to last month.");
  return "prevMonth";
}

function getStartAndEndOfWeek(date: Date) {
  var startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));

  var endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  return [startOfWeek, endOfWeek];
}

function subtractDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}
function formatDate(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}
