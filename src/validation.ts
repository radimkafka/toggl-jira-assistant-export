import type { ReportsDescriptorPreferences, PreferenesDatePeriodPreset, PreferenesDatePeriodFromTo } from "./types";

export function isReportDescriptorSummaryPreferences(obj: any): obj is ReportsDescriptorPreferences {
  return (
    obj &&
    typeof obj === "object" &&
    "datePeriod" in obj &&
    typeof obj.datePeriod === "object" &&
    (isPreferenesDatePeriodPreset(obj.datePeriod) || isPreferenesDatePeriodFromTo(obj.datePeriod))
  );
}

export function isPreferenesDatePeriodPreset(obj: any): obj is PreferenesDatePeriodPreset {
  return obj && typeof obj === "object" && "preset" in obj && typeof obj.preset === "string";
}
export function isPreferenesDatePeriodFromTo(obj: any): obj is PreferenesDatePeriodFromTo {
  return (
    obj &&
    typeof obj === "object" &&
    "from" in obj &&
    typeof obj.from === "string" &&
    "to" in obj &&
    typeof obj.to === "string"
  );
}
