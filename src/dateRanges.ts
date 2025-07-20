import type { PreferenesDatePeriod } from "./types";
import { isPreferenesDatePeriodFromTo } from "./validation";

export function getDateRange(preferences: PreferenesDatePeriod, initDate = new Date()): [string, string] {
  if (isPreferenesDatePeriodFromTo(preferences)) {
    return [preferences.from, preferences.to];
  }

  switch (preferences.preset) {
    case "today":
      return getTodayRange(initDate);
    case "yesterday":
      return getYesterdayRange(initDate);
    case "thisWeek":
      return getThisWeekRange(initDate);
    case "thisMonth":
      return getThisMonthRange(initDate);
    case "thisQuarter":
      return getThisQuarterRange(initDate);
    case "thisSemester":
      return getThisSemesterRange(initDate);
    case "thisYear":
      return getThisYearRange(initDate);
    case "prevWeek":
      return getPrevWeekRange(initDate);
    case "last2Weeks":
      return getLast2WeeksRange(initDate);
    case "prevMonth":
      return getPrevMonthRange(initDate);
    case "last30Days":
      return getLast30DaysRange(initDate);
    case "last90Days":
      return getLast90DaysRange(initDate);
    case "lastQuarter":
      return getLastQuarterRange(initDate);
    case "lastSemester":
      return getLastSemesterRange(initDate);
    case "last12Months":
      return getLast12MonthsRange(initDate);
    case "prevYear":
      return getPrevYearRange(initDate);
    case "weekToDate":
      return getWeekToDateRange(initDate);
    case "monthToDate":
      return getMonthToDateRange(initDate);
    case "quarterToDate":
      return getQuarterToDateRange(initDate);
    case "semesterToDate":
      return getSemesterToDateRange(initDate);
    case "yearToDate":
      return getYearToDateRange(initDate);
  }

  throw new Error("Invalid date range type");
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

function getWeekToDateRange(initDate: Date): [string, string] {
  return [formatDate(getStartOfWeek(initDate)), formatDate(new Date(initDate))];
}

function getStartAndEndOfWeek(date: Date) {
  var startOfWeek = getStartOfWeek(date);

  var endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 6);

  return [startOfWeek, endOfWeek];
}

function getStartOfWeek(date: Date) {
  var startOfWeek = new Date(date);
  startOfWeek.setDate(startOfWeek.getDate() - ((startOfWeek.getDay() + 6) % 7));

  return startOfWeek;
}

function getThisQuarterRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which quarter we're in (0-3)
  const quarter = Math.floor(currentMonth / 3);

  // Calculate start month of the quarter (0, 3, 6, 9)
  const startMonth = quarter * 3;

  // Calculate end month of the quarter (2, 5, 8, 11)
  const endMonth = startMonth + 2;

  const startDate = new Date(currentYear, startMonth, 1);
  const endDate = new Date(currentYear, endMonth + 1, 0); // Last day of the month

  return [formatDate(startDate), formatDate(endDate)];
}

function getThisSemesterRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which semester we're in (0 or 1)
  const semester = Math.floor(currentMonth / 6);

  // Calculate start month of the semester (0 or 6)
  const startMonth = semester * 6;

  // Calculate end month of the semester (5 or 11)
  const endMonth = startMonth + 5;

  const startDate = new Date(currentYear, startMonth, 1);
  const endDate = new Date(currentYear, endMonth + 1, 0); // Last day of the month

  return [formatDate(startDate), formatDate(endDate)];
}

function getLast2WeeksRange(date: Date): [string, string] {
  const twoWeeksAgo = subtractDays(date, 14);
  return [formatDate(twoWeeksAgo), formatDate(date)];
}

function getLastQuarterRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which quarter we're in (0-3)
  const quarter = Math.floor(currentMonth / 3);

  // Calculate start month of the previous quarter
  const startMonth = ((quarter - 1 + 4) % 4) * 3; // Handle negative quarters
  const startYear = quarter === 0 ? currentYear - 1 : currentYear;

  // Calculate end month of the previous quarter
  const endMonth = startMonth + 2;

  const startDate = new Date(startYear, startMonth, 1);
  const endDate = new Date(startYear, endMonth + 1, 0);

  return [formatDate(startDate), formatDate(endDate)];
}

function getLastSemesterRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which semester we're in (0 or 1)
  const semester = Math.floor(currentMonth / 6);

  // Calculate start month of the previous semester
  const startMonth = ((semester - 1 + 2) % 2) * 6; // Handle negative semesters
  const startYear = semester === 0 ? currentYear - 1 : currentYear;

  // Calculate end month of the previous semester
  const endMonth = startMonth + 5;

  const startDate = new Date(startYear, startMonth, 1);
  const endDate = new Date(startYear, endMonth + 1, 0);

  return [formatDate(startDate), formatDate(endDate)];
}

function getMonthToDateRange(date: Date): [string, string] {
  const firstDayOfMonth = new Date(date);
  firstDayOfMonth.setDate(1);

  return [formatDate(firstDayOfMonth), formatDate(date)];
}

function getQuarterToDateRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which quarter we're in (0-3)
  const quarter = Math.floor(currentMonth / 3);

  // Calculate start month of the quarter (0, 3, 6, 9)
  const startMonth = quarter * 3;

  const startDate = new Date(currentYear, startMonth, 1);

  return [formatDate(startDate), formatDate(date)];
}

function getSemesterToDateRange(date: Date): [string, string] {
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();

  // Determine which semester we're in (0 or 1)
  const semester = Math.floor(currentMonth / 6);

  // Calculate start month of the semester (0 or 6)
  const startMonth = semester * 6;

  const startDate = new Date(currentYear, startMonth, 1);

  return [formatDate(startDate), formatDate(date)];
}

function getYearToDateRange(date: Date): [string, string] {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);

  return [formatDate(firstDayOfYear), formatDate(date)];
}

function subtractDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function formatDate(date: Date) {
  return date.toISOString().substring(0, 10);
}
