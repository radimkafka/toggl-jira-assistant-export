export interface TogglReportItem {
  id: number;
  pid: number;
  tid: number | null | undefined;
  uid: number;
  description: string;
  start: string;
  end: string;
  updated: string;

  // doba v milisekundách
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
}

export interface TogglResponse {
  data: TogglReportItem[];
  activity: any[];
  per_page: number;
  total_billable: number | null;
  total_count: number;
  total_currencies: { currency: any; amount: any }[];
  total_grand: number;
}

export interface ReportItem {
  project: string;
  projectName: string;
  projectNumber?: string;
  comment: string;

  /** doba ve sekundách */
  duration: number;
  date: string;
  commentItems: CommentItem[];
}

export interface GroupedReportItem extends ReportItem {
  recordCount: number;
}

export interface ReportData {
  project: string;
  comment: string;
  duration: number;
  date: string;
}

export type CommentItemType = "projectNumber" | "Tag" | "Comment" | "unknown";

export interface CommentItem {
  type: CommentItemType;
  value: string;
}

export type ConfigApiKeyLocation = {
  storage: "local" | "session";
  key: string;
  propertyName: string;
};

export interface Config {
  dateMode: "custom" | "thisMonth" | "prevMonth";
  roundDuration?: boolean;
  roundToMinutes?: number;
  includeSeconds?: boolean;
  filter: ConfigFilterItem[];
  apiKeyLocation?: ConfigApiKeyLocation;
}

export interface ConfigFilterItem {
  filename: string;
  restAs: string;
  includedProjects: string[];
  transformations: ConfigTransfromationItem[];
}

export interface ConfigTransfromationItem {
  sourceProjectName: string;
  destinationProject: string;
}

export type TimeEntry = {
  // When was last updated
  at: string;

  // Whether the time entry is marked as billable
  billable: boolean;

  // Related entities meta fields - if requested
  client_name: string | null;

  // Time Entry description, null if not provided at creation/update
  description: string;

  // Time entry duration. For running entries should be negative, preferable -1
  duration: number;

  // Used to create a TE with a duration but without a stop time, this field is deprecated for GET endpoints where the value will always be true.
  duronly: boolean;

  // Time Entry ID
  id: number;

  // Permission list
  permissions: Array<string>;

  // Project ID, legacy field
  pid: number;
  project_active: boolean;
  project_color: string | null;

  // Project ID. Can be null if project was not provided or project was later deleted
  project_id: number;

  project_name: string | null;

  // When was deleted, null if not deleted
  server_deleted_at: string;

  // Indicates who the time entry has been shared with
  shared_with: Array<{
    accepted: boolean;

    user_id: number;
    user_name: string;
  }>;

  // Start time in UTC
  start: string;

  // Stop time in UTC, can be null if it's still running or created with "duration" and "duronly" fields
  stop: string;

  // Tag IDs, null if tags were not provided or were later deleted
  tag_ids: Array<number>;

  // Tag names, null if tags were not provided or were later deleted
  tags: Array<string>;

  // Task ID. Can be null if task was not provided or project was later deleted
  task_id: number | null;
  task_name: string;

  // Task ID, legacy field
  tid: number;

  // Time Entry creator ID, legacy field
  uid: number;

  // Time Entry creator ID
  user_id: number;

  // Workspace ID, legacy field
  wid: number;

  // Workspace ID
  workspace_id: number;
};
