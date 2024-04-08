export type TogglReportItem = {
  id: number;
  pid: number;
  tid: number | null | undefined;
  uid: number;
  description: string;
  start: string;
  end: string;
  updated: string;

  /** doba v milisekundách */
  dur: number;
  user: string;
  use_stop: boolean;
  client: string | null | undefined;
  project: string;
  project_color: 0;
  project_hex_color: string;
  task: string | null | undefined;
  billable: string | null | undefined;
  is_billable: boolean;
  cur: string | null | undefined;
  tags: string[];
};

export type TogglResponse = {
  data: TogglReportItem[];
  activity: any[];
  per_page: number;
  total_billable: number | null;
  total_count: number;
  total_currencies: { currency: any; amount: any }[];
  total_grand: number;
};

export type ReportItem = {
  project: string;
  projectName: string;
  projectNumber?: string;
  comment: string;

  /** doba ve sekundách */
  duration: number;
  date: string;
  commentItems: CommentItem[];
};

export type GroupedReportItem = ReportItem & {
  recordCount: number;
};

export type ReportData = {
  project: string;
  comment: string;
  duration: number;
  date: string;
};

export type CommentItemType = "projectNumber" | "Tag" | "Comment" | "unknown";

export type CommentItem = {
  type: CommentItemType;
  value: string;
};

export type ConfigApiKeyLocation = {
  storage: "local" | "session";
  key: string;
  propertyName: string;
};

export type DateMode = "custom" | "thisMonth" | "prevMonth";

export type Config = {
  roundDuration?: boolean;
  roundToMinutes?: number;
  includeSeconds?: boolean;
  filter: ConfigFilterItem[];
  apiKeyLocation?: ConfigApiKeyLocation;
};

export type ConfigFilterItem = {
  filename: string;
  restAs: string;
  includedProjects: string[];
  transformations: ConfigTransfromationItem[];
};

export type ConfigTransfromationItem = {
  sourceProjectName: string;
  destinationProject: string;
};

export type TimeEntry = {
  /** When was last updated */
  at: string;

  /** Whether the time entry is marked as billable */
  billable: boolean;

  /** Related entities meta fields - if requested */
  client_name: string | null;

  /** Time Entry description, null if not provided at creation/update */
  description: string;

  /** Time entry duration in seconds. For running entries should be negative, preferable -1 */
  duration: number;

  /** Used to create a TE with a duration but without a stop time, this field is deprecated for GET endpoints where the value will always be true. */
  duronly: boolean;

  /** Time Entry ID */
  id: number;

  /** Permission list */
  permissions: Array<string>;

  /** Project ID, legacy field */
  pid: number;

  project_active: boolean;

  project_color: string | null;

  /** Project ID. Can be null if project was not provided or project was later deleted */
  project_id: number;

  project_name: string | null;

  /** When was deleted, null if not deleted */
  server_deleted_at: string;

  /** Indicates who the time entry has been shared with */
  shared_with: Array<{
    accepted: boolean;

    user_id: number;
    user_name: string;
  }>;

  /** Start time in UTC */
  start: string;

  /** Stop time in UTC, can be null if it's still running or created with "duration" and "duronly" fields */
  stop: string;

  /** Tag IDs, null if tags were not provided or were later deleted */
  tag_ids: Array<number>;

  /** Tag names, null if tags were not provided or were later deleted */
  tags: Array<string>;

  /** Task ID. Can be null if task was not provided or project was later deleted */
  task_id: number | null;

  task_name: string;

  /** Task ID, legacy field */
  tid: number;

  /** Time Entry creator ID, legacy field */
  uid: number;

  /** Time Entry creator ID */
  user_id: number;

  /** Workspace ID, legacy field */
  wid: number;

  /** Workspace ID */
  workspace_id: number;
};

export type Project = {
  /** Whether the project is active or archived */
  active: boolean;

  /** Actual hours */
  actual_hours: number | null;

  /** Actual seconds */
  actual_seconds: number | null;

  /** Last updated date */
  at: string;

  /** Whether estimates are based on task hours, premium feature */
  auto_estimates: boolean | null;

  /** Whether the project is billable, premium feature */
  billable: boolean | null;

  /** Client ID legacy field */
  cid: number;

  /** Client ID */
  client_id: number | null;

  /** Color */
  color: string;

  /** Creation date */
  created_at: string;

  /** Currency, premium feature */
  currency: string | null;

  /** Current project period, premium feature */
  current_period: Array<{
    end_date: string;
    start_date: string;
  }>;

  /** End date */
  end_date: string;

  /** Estimated hours */
  estimated_hours: number | null;

  /**  Estimated seconds */
  estimated_seconds: number | null;

  /** Fixed fee, premium feature */
  fixed_fee: number;

  /** Project ID */
  id: number;

  integrationExtID: string;

  integrationExtType: string;

  /** Integrations data */
  integrationProvider: string;

  /** Whether the project is private */
  is_private: boolean;

  /** Name */
  name: string;

  permissions: string;

  /** Hourly rate */
  rate: number;

  /** Last date for rate change */
  rate_last_updated: string | null;

  /** Whether the project is recurring, premium feature */
  recurring: boolean;

  /** Project recurring parameters, premium feature */
  recurring_parameters: Array<{
    /** Custom period, used when "period" field is "custom" */
    custom_period: number;

    /** Estimated seconds */
    estimated_seconds: number;

    /** Recurring end date */
    parameter_end_date: string | null;

    /** Recurring start date */
    parameter_start_date: string;

    /** Period */
    period: string;

    /** Project start date */
    project_start_date: string;
  }>;

  /** Deletion date */
  server_deleted_at: string | null;

  /** Start date */
  start_date: string;

  /** Status of the project (upcoming, active, ended, archived, deleted) */
  status: string;

  /** Whether the project is used as template, premium feature */
  template: boolean | null;

  /** Template ID */
  template_id: number | null;

  /** Workspace ID legacy field */
  wid: number;

  /** Workspace ID */
  workspace_id: number;
};

export type DateRangeType =
  | ""
  | "today"
  | "yesterday"
  | "last7"
  | "thisWeek"
  | "lastWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear";
