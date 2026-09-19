import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "./supabase";
import { useSupabaseAuth } from "./supabase-auth";
import { useCurrentEmployee, useCurrentOrganisation } from "./supabase-identity";

export type CustomerCase = {
  id: string;
  organization_id: string;
  case_number: string;
  category_id: string | null;
  patient_id: string | null;
  doctor_id: string | null;
  booking_id: string | null;
  reported_by_employee_id: string | null;
  assigned_to_employee_id: string | null;
  subject: string;
  description: string | null;
  source: string | null;
  priority: string;
  status: string;
  customer_type: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  sla_response_due_at: string | null;
  sla_resolution_due_at: string | null;
  sla_response_breached: boolean | null;
  sla_resolution_breached: boolean | null;
  satisfaction_score: number | null;
  resolution_summary: string | null;
  internal_notes: string | null;
};

export type CaseCategory = {
  id: string;
  organization_id: string;
  code: string;
  name: string;
  description: string | null;
  default_priority: string | null;
  default_response_hours: number | null;
  default_resolution_hours: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type CaseEscalation = {
  id: string;
  organization_id: string;
  case_id: string;
  escalated_by_employee_id: string | null;
  escalated_to_employee_id: string | null;
  escalation_level: string;
  reason: string;
  notes: string | null;
  status: string;
  escalated_at: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CaseInteraction = {
  id: string;
  organization_id: string;
  case_id: string;
  employee_id: string | null;
  interaction_type: string;
  direction: string | null;
  subject: string | null;
  message: string | null;
  interaction_at: string;
  customer_visible: boolean;
  created_at: string;
};

export type CaseTask = {
  id: string;
  organization_id: string;
  case_id: string;
  task_id: string | null;
  assigned_to_employee_id: string | null;
  title: string;
  description: string | null;
  priority: string | null;
  status: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string | null;
};

export type CaseTicket = {
  id: string;
  organization_id: string;
  case_id: string;
  ticket_id: string | null;
  title: string;
  description: string | null;
  priority: string | null;
  status: string;
  assigned_to_employee_id: string | null;
  due_at: string | null;
  resolved_at: string | null;
  created_at: string;
};

export type CustomerFeedback = {
  id: string;
  case_id: string;
  doctor_id: string | null;
  organization_id: string;
  patient_id: string | null;
  reviewed_by_employee_id: string | null;
};

export type CustomerCaseSlaSummary = {
  case_id: string;
  organization_id: string;
  case_number: string;
  subject: string;
  priority: string;
  status: string;
  created_at: string | null;
  first_response_at: string | null;
  resolved_at: string | null;
  sla_response_due_at: string | null;
  sla_resolution_due_at: string | null;
  response_sla_breached: boolean | null;
  resolution_sla_breached: boolean | null;
  sla_compliant: boolean | null;
  currently_overdue: boolean | null;
};

export type CustomerOperationsEmployee = {
  id: string;
  organization_id: string | null;
  first_name: string;
  last_name: string;
  job_title: string | null;
  employee_status: string;
};

export type CustomerCaseRecord = CustomerCase & {
  category: CaseCategory | null;
  reportedBy: CustomerOperationsEmployee | null;
  assignedTo: CustomerOperationsEmployee | null;
  sla: CustomerCaseSlaSummary | null;
};

export type CustomerOperationsData = {
  cases: CustomerCaseRecord[];
  categories: CaseCategory[];
  escalations: CaseEscalation[];
  interactions: CaseInteraction[];
  tasks: CaseTask[];
  tickets: CaseTicket[];
  feedback: CustomerFeedback[];
  employees: CustomerOperationsEmployee[];
  slaSummary: CustomerCaseSlaSummary[];
  slaSource: "summary-view" | "case-records" | "unavailable";
  optionalErrors: string[];
};

type QueryState = {
  data: CustomerOperationsData | undefined;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
};

type RawRecord = Record<string, unknown>;
type RowParser<T> = (value: unknown) => T;

type SettledRows<T> = {
  rows: T[];
  error: string | null;
};

const columns = {
  cases:
    "id, organization_id, case_number, category_id, patient_id, doctor_id, booking_id, reported_by_employee_id, assigned_to_employee_id, subject, description, source, priority, status, customer_type, first_response_at, resolved_at, closed_at, sla_response_due_at, sla_resolution_due_at, sla_response_breached, sla_resolution_breached, satisfaction_score, resolution_summary, internal_notes",
  categories:
    "id, organization_id, code, name, description, default_priority, default_response_hours, default_resolution_hours, active, created_at, updated_at",
  escalations:
    "id, organization_id, case_id, escalated_by_employee_id, escalated_to_employee_id, escalation_level, reason, notes, status, escalated_at, resolved_at, created_at, updated_at",
  interactions:
    "id, organization_id, case_id, employee_id, interaction_type, direction, subject, message, interaction_at, customer_visible, created_at",
  tasks:
    "id, organization_id, case_id, task_id, assigned_to_employee_id, title, description, priority, status, due_date, completed_at, created_at, updated_at",
  tickets:
    "id, organization_id, case_id, ticket_id, title, description, priority, status, assigned_to_employee_id, due_at, resolved_at, created_at",
  feedback:
    "id, case_id, doctor_id, organization_id, patient_id, reviewed_by_employee_id",
  slaSummary:
    "case_id, organization_id, case_number, subject, priority, status, created_at, first_response_at, resolved_at, sla_response_due_at, sla_resolution_due_at, response_sla_breached, resolution_sla_breached, sla_compliant, currently_overdue",
  employees: "id, organization_id, first_name, last_name, job_title, employee_status",
} as const;

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecord(value: unknown): RawRecord {
  if (!isRecord(value)) throw new Error("The response row is not an object.");
  return value;
}

function requiredString(row: RawRecord, field: string) {
  const value = row[field];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`The ${field} field is invalid.`);
  }
  return value;
}

function nullableString(row: RawRecord, field: string) {
  const value = row[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") throw new Error(`The ${field} field is invalid.`);
  return value;
}

function requiredUuid(row: RawRecord, field: string) {
  const value = requiredString(row, field);
  if (!uuidPattern.test(value)) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableUuid(row: RawRecord, field: string) {
  const value = nullableString(row, field);
  if (value === null) return null;
  if (!uuidPattern.test(value)) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function numericValue(value: unknown) {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  throw new Error("A numeric response field is invalid.");
}

function nullableNumber(row: RawRecord, field: string) {
  return numericValue(row[field]);
}

function nullableBoolean(row: RawRecord, field: string) {
  const value = row[field];
  if (value === null || value === undefined) return null;
  if (typeof value !== "boolean") throw new Error(`The ${field} field is invalid.`);
  return value;
}

function requiredBoolean(row: RawRecord, field: string) {
  const value = row[field];
  if (typeof value !== "boolean") throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableDate(row: RawRecord, field: string) {
  const value = nullableString(row, field);
  if (value === null) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const date = new Date(`${value}T00:00:00Z`);
    if (Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== value) {
      throw new Error(`The ${field} field is invalid.`);
    }
    return value;
  }
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.valueOf())) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function requiredDate(row: RawRecord, field: string) {
  const value = nullableDate(row, field);
  if (value === null) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableTimestamp(row: RawRecord, field: string) {
  const value = nullableString(row, field);
  if (value === null) return null;
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function requiredTimestamp(row: RawRecord, field: string) {
  const value = nullableTimestamp(row, field);
  if (value === null) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function parseCase(value: unknown): CustomerCase {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_number: requiredString(row, "case_number"),
    category_id: nullableUuid(row, "category_id"),
    patient_id: nullableUuid(row, "patient_id"),
    doctor_id: nullableUuid(row, "doctor_id"),
    booking_id: nullableUuid(row, "booking_id"),
    reported_by_employee_id: nullableUuid(row, "reported_by_employee_id"),
    assigned_to_employee_id: nullableUuid(row, "assigned_to_employee_id"),
    subject: requiredString(row, "subject"),
    description: nullableString(row, "description"),
    source: nullableString(row, "source"),
    priority: requiredString(row, "priority"),
    status: requiredString(row, "status"),
    customer_type: nullableString(row, "customer_type"),
    first_response_at: nullableTimestamp(row, "first_response_at"),
    resolved_at: nullableTimestamp(row, "resolved_at"),
    closed_at: nullableTimestamp(row, "closed_at"),
    sla_response_due_at: nullableTimestamp(row, "sla_response_due_at"),
    sla_resolution_due_at: nullableTimestamp(row, "sla_resolution_due_at"),
    sla_response_breached: nullableBoolean(row, "sla_response_breached"),
    sla_resolution_breached: nullableBoolean(row, "sla_resolution_breached"),
    satisfaction_score: nullableNumber(row, "satisfaction_score"),
    resolution_summary: nullableString(row, "resolution_summary"),
    internal_notes: nullableString(row, "internal_notes"),
  };
}

function parseCategory(value: unknown): CaseCategory {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    code: requiredString(row, "code"),
    name: requiredString(row, "name"),
    description: nullableString(row, "description"),
    default_priority: nullableString(row, "default_priority"),
    default_response_hours: nullableNumber(row, "default_response_hours"),
    default_resolution_hours: nullableNumber(row, "default_resolution_hours"),
    active: requiredBoolean(row, "active"),
    created_at: requiredTimestamp(row, "created_at"),
    updated_at: requiredTimestamp(row, "updated_at"),
  };
}

function parseEscalation(value: unknown): CaseEscalation {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_id: requiredUuid(row, "case_id"),
    escalated_by_employee_id: nullableUuid(row, "escalated_by_employee_id"),
    escalated_to_employee_id: nullableUuid(row, "escalated_to_employee_id"),
    escalation_level: requiredString(row, "escalation_level"),
    reason: requiredString(row, "reason"),
    notes: nullableString(row, "notes"),
    status: requiredString(row, "status"),
    escalated_at: requiredTimestamp(row, "escalated_at"),
    resolved_at: nullableTimestamp(row, "resolved_at"),
    created_at: requiredTimestamp(row, "created_at"),
    updated_at: requiredTimestamp(row, "updated_at"),
  };
}

function parseInteraction(value: unknown): CaseInteraction {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_id: requiredUuid(row, "case_id"),
    employee_id: nullableUuid(row, "employee_id"),
    interaction_type: requiredString(row, "interaction_type"),
    direction: nullableString(row, "direction"),
    subject: nullableString(row, "subject"),
    message: nullableString(row, "message"),
    interaction_at: requiredTimestamp(row, "interaction_at"),
    customer_visible: requiredBoolean(row, "customer_visible"),
    created_at: requiredTimestamp(row, "created_at"),
  };
}

function parseTask(value: unknown): CaseTask {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_id: requiredUuid(row, "case_id"),
    task_id: nullableUuid(row, "task_id"),
    assigned_to_employee_id: nullableUuid(row, "assigned_to_employee_id"),
    title: requiredString(row, "title"),
    description: nullableString(row, "description"),
    priority: nullableString(row, "priority"),
    status: requiredString(row, "status"),
    due_date: nullableDate(row, "due_date"),
    completed_at: nullableTimestamp(row, "completed_at"),
    created_at: requiredTimestamp(row, "created_at"),
    updated_at: nullableTimestamp(row, "updated_at"),
  };
}

function parseTicket(value: unknown): CaseTicket {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_id: requiredUuid(row, "case_id"),
    ticket_id: nullableUuid(row, "ticket_id"),
    title: requiredString(row, "title"),
    description: nullableString(row, "description"),
    priority: nullableString(row, "priority"),
    status: requiredString(row, "status"),
    assigned_to_employee_id: nullableUuid(row, "assigned_to_employee_id"),
    due_at: nullableTimestamp(row, "due_at"),
    resolved_at: nullableTimestamp(row, "resolved_at"),
    created_at: requiredTimestamp(row, "created_at"),
  };
}

function parseFeedback(value: unknown): CustomerFeedback {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    case_id: requiredUuid(row, "case_id"),
    doctor_id: nullableUuid(row, "doctor_id"),
    organization_id: requiredUuid(row, "organization_id"),
    patient_id: nullableUuid(row, "patient_id"),
    reviewed_by_employee_id: nullableUuid(row, "reviewed_by_employee_id"),
  };
}

function parseSlaSummary(value: unknown): CustomerCaseSlaSummary {
  const row = asRecord(value);
  return {
    case_id: requiredUuid(row, "case_id"),
    organization_id: requiredUuid(row, "organization_id"),
    case_number: requiredString(row, "case_number"),
    subject: requiredString(row, "subject"),
    priority: requiredString(row, "priority"),
    status: requiredString(row, "status"),
    created_at: requiredTimestamp(row, "created_at"),
    first_response_at: nullableTimestamp(row, "first_response_at"),
    resolved_at: nullableTimestamp(row, "resolved_at"),
    sla_response_due_at: nullableTimestamp(row, "sla_response_due_at"),
    sla_resolution_due_at: nullableTimestamp(row, "sla_resolution_due_at"),
    response_sla_breached: nullableBoolean(row, "response_sla_breached"),
    resolution_sla_breached: nullableBoolean(row, "resolution_sla_breached"),
    sla_compliant: nullableBoolean(row, "sla_compliant"),
    currently_overdue: nullableBoolean(row, "currently_overdue"),
  };
}

function parseEmployee(value: unknown): CustomerOperationsEmployee {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: nullableUuid(row, "organization_id"),
    first_name: requiredString(row, "first_name"),
    last_name: requiredString(row, "last_name"),
    job_title: nullableString(row, "job_title"),
    employee_status: requiredString(row, "employee_status"),
  };
}

function normalizeRows<T>(value: unknown, parser: RowParser<T>, label: string) {
  if (!Array.isArray(value)) throw new Error(`The ${label} response is invalid.`);
  try {
    return value.map(parser);
  } catch {
    throw new Error(`The ${label} response contains malformed records.`);
  }
}

function deduplicateBy<T>(rows: T[], getId: (row: T) => string) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const id = getId(row);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

async function selectRows(
  table: string,
  selection: string,
  organizationId: string,
): Promise<unknown> {
  const { data, error } = await getSupabaseClient()
    .from(table)
    .select(selection)
    .eq("organization_id", organizationId);
  if (error) throw error;
  return data;
}

function optionalRows<T>(
  result: PromiseSettledResult<unknown>,
  parser: RowParser<T>,
  label: string,
): SettledRows<T> {
  if (result.status === "rejected") {
    return { rows: [], error: `${label} data is unavailable.` };
  }
  try {
    return { rows: normalizeRows(result.value, parser, label), error: null };
  } catch {
    return { rows: [], error: `${label} data contains malformed records.` };
  }
}

function normaliseStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? "";
}

function isTerminalStatus(value: string | null | undefined) {
  return [
    "resolved",
    "closed",
    "complete",
    "completed",
    "done",
    "cancelled",
    "canceled",
    "dismissed",
  ].includes(normaliseStatus(value));
}

function isOpenEscalation(value: CaseEscalation) {
  return !value.resolved_at && !isTerminalStatus(value.status);
}

function isOpenTask(value: CaseTask) {
  return !value.completed_at && !isTerminalStatus(value.status);
}

function isOpenTicket(value: CaseTicket) {
  return !value.resolved_at && !isTerminalStatus(value.status);
}

function fallbackSla(caseRow: CustomerCase): CustomerCaseSlaSummary {
  return {
    case_id: caseRow.id,
    organization_id: caseRow.organization_id,
    case_number: caseRow.case_number,
    subject: caseRow.subject,
    priority: caseRow.priority,
    status: caseRow.status,
    created_at: null,
    first_response_at: caseRow.first_response_at,
    resolved_at: caseRow.resolved_at,
    sla_response_due_at: caseRow.sla_response_due_at,
    sla_resolution_due_at: caseRow.sla_resolution_due_at,
    response_sla_breached: caseRow.sla_response_breached,
    resolution_sla_breached: caseRow.sla_resolution_breached,
    sla_compliant: null,
    currently_overdue: null,
  };
}

async function fetchCustomerOperationsDashboard(
  organizationId: string,
): Promise<CustomerOperationsData> {
  const results = await Promise.allSettled([
    selectRows("customer_cases", columns.cases, organizationId),
    selectRows("case_categories", columns.categories, organizationId),
    selectRows("case_escalations", columns.escalations, organizationId),
    selectRows("case_interactions", columns.interactions, organizationId),
    selectRows("case_tasks", columns.tasks, organizationId),
    selectRows("case_tickets", columns.tickets, organizationId),
    selectRows("customer_feedback", columns.feedback, organizationId),
    selectRows("customer_case_sla_summary", columns.slaSummary, organizationId),
    selectRows("employees", columns.employees, organizationId),
  ]);

  const cases = optionalRows(results[0], parseCase, "Customer case");
  const categories = optionalRows(results[1], parseCategory, "Case category");
  const escalations = optionalRows(results[2], parseEscalation, "Case escalation");
  const interactions = optionalRows(results[3], parseInteraction, "Case interaction");
  const tasks = optionalRows(results[4], parseTask, "Case task");
  const tickets = optionalRows(results[5], parseTicket, "Case ticket");
  const feedback = optionalRows(results[6], parseFeedback, "Customer feedback");
  const slaSummary = optionalRows(results[7], parseSlaSummary, "Customer case SLA summary");
  const employees = optionalRows(results[8], parseEmployee, "Customer operations employee");
  const caseRows = deduplicateBy(cases.rows, (row) => row.id);
  const categoryRows = deduplicateBy(categories.rows, (row) => row.id);
  const employeeRows = deduplicateBy(employees.rows, (row) => row.id);
  const slaRows = deduplicateBy(slaSummary.rows, (row) => row.case_id);
  const categoryById = new Map(categoryRows.map((row) => [row.id, row]));
  const employeeById = new Map(employeeRows.map((row) => [row.id, row]));
  const slaByCaseId = new Map(slaRows.map((row) => [row.case_id, row]));
  const slaSource: CustomerOperationsData["slaSource"] =
    slaSummary.error === null
      ? "summary-view"
      : caseRows.length > 0
        ? "case-records"
        : "unavailable";
  const records = caseRows.map((caseRow) => ({
    ...caseRow,
    category: caseRow.category_id ? categoryById.get(caseRow.category_id) ?? null : null,
    reportedBy: caseRow.reported_by_employee_id
      ? employeeById.get(caseRow.reported_by_employee_id) ?? null
      : null,
    assignedTo: caseRow.assigned_to_employee_id
      ? employeeById.get(caseRow.assigned_to_employee_id) ?? null
      : null,
    sla:
      slaSource === "summary-view"
        ? slaByCaseId.get(caseRow.id) ?? null
        : slaSource === "case-records"
          ? fallbackSla(caseRow)
          : null,
  }));
  const optionalErrors = [
    cases.error,
    categories.error,
    escalations.error,
    interactions.error,
    tasks.error,
    tickets.error,
    feedback.error,
    slaSummary.error,
    employees.error,
  ].filter((value): value is string => Boolean(value));
  return {
    cases: records,
    categories: categoryRows,
    escalations: deduplicateBy(escalations.rows, (row) => row.id),
    interactions: deduplicateBy(interactions.rows, (row) => row.id),
    tasks: deduplicateBy(tasks.rows, (row) => row.id),
    tickets: deduplicateBy(tickets.rows, (row) => row.id),
    feedback: deduplicateBy(feedback.rows, (row) => row.id),
    employees: employeeRows,
    slaSummary: slaRows,
    slaSource,
    optionalErrors: [...new Set(optionalErrors)],
  };
}

export function useCustomerOperationsDashboard(): QueryState {
  const { user, loading: authLoading } = useSupabaseAuth();
  const employeeState = useCurrentEmployee();
  const organizationState = useCurrentOrganisation();
  const organizationId = organizationState.organizationId;
  const enabled = Boolean(
    user &&
      !authLoading &&
      employeeState.status === "active" &&
      !organizationState.isLoading &&
      organizationId,
  );
  const query = useQuery({
    queryKey: [
      "customer-operations-dashboard",
      user?.id ?? null,
      employeeState.employee?.id ?? null,
      organizationId,
    ],
    enabled,
    queryFn: () => fetchCustomerOperationsDashboard(organizationId!),
    staleTime: 30_000,
  });
  return {
    data: query.data,
    isPending: query.isPending,
    isError: query.isError,
    error:
      query.error instanceof Error
        ? query.error
        : query.error
          ? new Error("Customer Operations data could not be loaded.")
          : null,
  };
}

export type CustomerOperationsMetrics = {
  totalCases: number;
  openCases: number;
  newCases: number | null;
  inProgressCases: number | null;
  resolvedCases: number | null;
  closedCases: number | null;
  overdueCases: number | null;
  responseBreaches: number | null;
  resolutionBreaches: number | null;
  compliantCases: number | null;
  openEscalations: number;
  openTasks: number;
  openTickets: number;
  overdueTasks: number;
  overdueTickets: number;
  feedbackRecords: number;
  reviewedFeedback: number;
  averageSatisfaction: number | null;
  averageResponseHours: number | null;
};

export function buildCustomerOperationsMetrics(
  data: CustomerOperationsData | undefined,
  now = new Date(),
): CustomerOperationsMetrics {
  const empty: CustomerOperationsMetrics = {
    totalCases: 0,
    openCases: 0,
    newCases: null,
    inProgressCases: null,
    resolvedCases: null,
    closedCases: null,
    overdueCases: null,
    responseBreaches: null,
    resolutionBreaches: null,
    compliantCases: null,
    openEscalations: 0,
    openTasks: 0,
    openTickets: 0,
    overdueTasks: 0,
    overdueTickets: 0,
    feedbackRecords: 0,
    reviewedFeedback: 0,
    averageSatisfaction: null,
    averageResponseHours: null,
  };
  if (!data) return empty;
  const statuses = data.cases.map((row) => normaliseStatus(row.status));
  const slaRows = data.cases.map((row) => row.sla).filter((row): row is CustomerCaseSlaSummary => row !== null);
  const responseTimes = data.cases
    .map((row) => {
      if (!row.sla?.created_at || !row.sla.first_response_at) return null;
      const created = new Date(row.sla.created_at).valueOf();
      const firstResponse = new Date(row.sla.first_response_at).valueOf();
      if (Number.isNaN(created) || Number.isNaN(firstResponse) || firstResponse < created) return null;
      return (firstResponse - created) / 3_600_000;
    })
    .filter((value): value is number => value !== null);
  const satisfaction = data.cases
    .map((row) => row.satisfaction_score)
    .filter((value): value is number => value !== null);
  const overdueTasks = data.tasks.filter((task) => {
    if (!isOpenTask(task) || !task.due_date) return false;
    const due = new Date(`${task.due_date}T23:59:59Z`).valueOf();
    return !Number.isNaN(due) && due < now.valueOf();
  }).length;
  const overdueTickets = data.tickets.filter((ticket) => {
    if (!isOpenTicket(ticket) || !ticket.due_at) return false;
    const due = new Date(ticket.due_at).valueOf();
    return !Number.isNaN(due) && due < now.valueOf();
  }).length;
  const countStatus = (status: string) =>
    statuses.includes(status) ? statuses.filter((value) => value === status).length : null;
  return {
    totalCases: data.cases.length,
    openCases: data.cases.filter((row) => !isTerminalStatus(row.status)).length,
    newCases: countStatus("new"),
    inProgressCases: countStatus("in progress"),
    resolvedCases: countStatus("resolved"),
    closedCases: countStatus("closed"),
    overdueCases:
      data.slaSource === "unavailable"
        ? null
        : slaRows.filter((row) => row.currently_overdue === true).length,
    responseBreaches:
      data.slaSource === "unavailable"
        ? null
        : slaRows.filter((row) => row.response_sla_breached === true).length,
    resolutionBreaches:
      data.slaSource === "unavailable"
        ? null
        : slaRows.filter((row) => row.resolution_sla_breached === true).length,
    compliantCases:
      data.slaSource === "unavailable"
        ? null
        : slaRows.filter((row) => row.sla_compliant === true).length,
    openEscalations: data.escalations.filter(isOpenEscalation).length,
    openTasks: data.tasks.filter(isOpenTask).length,
    openTickets: data.tickets.filter(isOpenTicket).length,
    overdueTasks,
    overdueTickets,
    feedbackRecords: data.feedback.length,
    reviewedFeedback: data.feedback.filter((row) => row.reviewed_by_employee_id !== null).length,
    averageSatisfaction: satisfaction.length
      ? satisfaction.reduce((total, value) => total + value, 0) / satisfaction.length
      : null,
    averageResponseHours: responseTimes.length
      ? responseTimes.reduce((total, value) => total + value, 0) / responseTimes.length
      : null,
  };
}

export type CustomerOperationsWorkload = {
  employee: CustomerOperationsEmployee;
  openCases: number;
  openTasks: number;
  openTickets: number;
  openEscalations: number;
};

export function buildCustomerOperationsWorkload(
  data: CustomerOperationsData | undefined,
): CustomerOperationsWorkload[] {
  if (!data) return [];
  return data.employees
    .map((employee) => ({
      employee,
      openCases: data.cases.filter(
        (row) => row.assigned_to_employee_id === employee.id && !isTerminalStatus(row.status),
      ).length,
      openTasks: data.tasks.filter(
        (row) => row.assigned_to_employee_id === employee.id && isOpenTask(row),
      ).length,
      openTickets: data.tickets.filter(
        (row) => row.assigned_to_employee_id === employee.id && isOpenTicket(row),
      ).length,
      openEscalations: data.escalations.filter(
        (row) => row.escalated_to_employee_id === employee.id && isOpenEscalation(row),
      ).length,
    }))
    .filter((row) => row.openCases + row.openTasks + row.openTickets + row.openEscalations > 0)
    .sort(
      (left, right) =>
        right.openCases + right.openTasks + right.openTickets + right.openEscalations -
        (left.openCases + left.openTasks + left.openTickets + left.openEscalations),
    );
}

export type CustomerOperationsCategorySummary = CaseCategory & {
  caseCount: number;
  openCaseCount: number;
};

export function buildCustomerOperationsCategorySummaries(
  data: CustomerOperationsData | undefined,
): CustomerOperationsCategorySummary[] {
  if (!data) return [];
  return data.categories
    .map((category) => {
      const categoryCases = data.cases.filter((row) => row.category_id === category.id);
      return {
        ...category,
        caseCount: categoryCases.length,
        openCaseCount: categoryCases.filter((row) => !isTerminalStatus(row.status)).length,
      };
    })
    .sort((left, right) => right.caseCount - left.caseCount);
}

export function isCaseSlaBreached(caseRow: CustomerCaseRecord) {
  return caseRow.sla?.response_sla_breached === true || caseRow.sla?.resolution_sla_breached === true;
}

export function isCaseOverdue(caseRow: CustomerCaseRecord) {
  return caseRow.sla?.currently_overdue === true;
}

export function isCaseSlaCompliant(caseRow: CustomerCaseRecord) {
  return caseRow.sla?.sla_compliant === true;
}

export function normaliseCustomerOperationsStatus(value: string | null | undefined) {
  return normaliseStatus(value);
}

export function displayEmployeeName(employee: CustomerOperationsEmployee | null | undefined) {
  if (!employee) return "Employee unavailable";
  return `${employee.first_name} ${employee.last_name}`.trim() || "Employee unavailable";
}

export function formatDate(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: value.includes("T") ? "2-digit" : undefined,
    minute: value.includes("T") ? "2-digit" : undefined,
  }).format(date);
}

export function formatHours(value: number | null) {
  return value === null ? "Unavailable" : `${value.toFixed(1)} h`;
}

export function formatScore(value: number | null) {
  return value === null ? "Unavailable" : value.toFixed(1);
}
