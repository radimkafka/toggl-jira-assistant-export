export interface TogglReportItem {
    id: number,
    pid: number,
    tid: number | null | undefined,
    uid: number,
    description: string,
    start: string,
    end: string,
    updated: string,

    // doba v milisekundách
    dur: number,
    user: string,
    use_stop: boolean,
    client: string | null | undefined,
    project: string,
    project_color: 0,
    project_hex_color: string,
    task: string | null | undefined,
    billable: string | null | undefined,
    is_billable: boolean,
    cur: string | null | undefined,
    tags: string[]

}

export interface TogglResponse {
    data: TogglReportItem[];
    activity: any[];
    per_page: number;
    total_billable: number | null;
    total_count: number;
    total_currencies: { currency: any, amount: any }[];
    total_grand: number;
}

export interface ReportItem {
    project: string;
    projectName?: string;
    comment: string;

    /** doba ve sekundách */
    duration: number;
    date: string;
}

export interface GroupedReportItem extends ReportItem {
    recordCount: number;
    roundedDuration: number;
}

export interface ReportData {
    project: string;
    comment: string;
    duration: number;
    date: string;
}

export interface Config {
    dateMode: "custom" | "thisMonth" | "prevMonth";
    roundDuration: boolean;
    filter: ConfigFilterItem[];
}

export interface ConfigFilterItem {
    filename: string;
    restAs: string,
    includedProjects: string[]
}