import type { DateRangeType } from "./types";

const customRangeRegex = /from\/(?<from>....-..-..)\/to\/(?<to>....-..-..)/;

export function getDateRange(url: URL, initDate = new Date()): [string, string] {
  const rangeType = getDateRangeType(url.pathname);

  switch (rangeType) {
    case "custom":
      return getCustomRange(url);
    case "today":
      return getTodayRange(initDate);
    case "yesterday":
      return getYesterdayRange(initDate);
    case "thisWeek":
      return getThisWeekRange(initDate);
    case "prevWeek":
      return getPrevWeekRange(initDate);
    case "thisMonth":
      return getThisMonthRange(initDate);
    case "prevMonth":
      return getPrevMonthRange(initDate);
    case "last30Days":
      return getLast30DaysRange(initDate);
    case "last90Days":
      return getLast90DaysRange(initDate);
    case "last12Months":
      return getLast12MonthsRange(initDate);
    case "thisYear":
      return getThisYearRange(initDate);
    case "prevYear":
      return getPrevYearRange(initDate);
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

function getCustomRange(url: URL): [string, string] {
  const matched = url.pathname.match(customRangeRegex);
  if (matched?.groups?.["from"] && matched?.groups?.["to"]) {
    return [matched.groups["from"], matched?.groups["to"]];
  }

  throw new Error("Invalid custom date range URL");
}

function getTodayRange(initDate: Date): [string, string] {
  const today = formatDate(new Date(initDate));
  return [today, today];
}

function getYesterdayRange(initDate: Date): [string, string] {
  const yesterdayFormated = formatDate(subtractDays(new Date(initDate), 1));
  return [yesterdayFormated, yesterdayFormated];
}

function getThisWeekRange(initDate: Date): [string, string] {
  var [startOfWeek, endOfWeek] = getStartAndEndOfWeek(new Date(initDate));

  return [formatDate(startOfWeek), formatDate(endOfWeek)];
}

function getPrevWeekRange(initDate: Date): [string, string] {
  var [startOfWeek, endOfWeek] = getStartAndEndOfWeek(subtractDays(initDate, 7));

  return [formatDate(startOfWeek), formatDate(endOfWeek)];
}

function getThisMonthRange(initDate: Date): [string, string] {
  const firstDayOfMonth = new Date(initDate);
  firstDayOfMonth.setDate(1);

  const lastDayOfMonth = new Date(firstDayOfMonth);
  lastDayOfMonth.setMonth(lastDayOfMonth.getMonth() + 1);
  lastDayOfMonth.setDate(0);

  return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
}

function getPrevMonthRange(initDate: Date): [string, string] {
  const firstDayOfMonth = new Date(initDate);
  firstDayOfMonth.setDate(-1);
  firstDayOfMonth.setDate(1);

  const lastDayOfMonth = new Date(initDate);
  lastDayOfMonth.setDate(0);

  return [formatDate(firstDayOfMonth), formatDate(lastDayOfMonth)];
}

function getLast30DaysRange(initDate: Date): [string, string] {
  const date = subtractDays(new Date(initDate), 30);

  return [formatDate(date), formatDate(new Date(initDate))];
}

function getLast90DaysRange(initDate: Date): [string, string] {
  const date = subtractDays(new Date(initDate), 90);

  return [formatDate(date), formatDate(new Date(initDate))];
}

function getLast12MonthsRange(initDate: Date): [string, string] {
  const date = new Date(initDate);
  date.setFullYear(date.getFullYear() - 1);

  return [formatDate(date), formatDate(new Date(initDate))];
}

function getThisYearRange(initDate: Date): [string, string] {
  const today = new Date(initDate);
  const firstDayOfYear = new Date(today.getFullYear(), 0, 1);

  const lastDayOfYear = new Date(today.getFullYear(), 11, 31);
  return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
}

function getPrevYearRange(initDate: Date): [string, string] {
  const today = new Date(initDate);
  const firstDayOfYear = new Date(today.getFullYear() - 1, 0, 1);

  const lastDayOfYear = new Date(today.getFullYear() - 1, 11, 31);
  return [formatDate(firstDayOfYear), formatDate(lastDayOfYear)];
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
