import { useQuery } from "@tanstack/react-query";
import { getSupabaseClient } from "./supabase";
import { useSupabaseAuth } from "./supabase-auth";
import { useCurrentEmployee, useCurrentOrganisation } from "./supabase-identity";

export type SalesSummary = {
  organization_id: string;
  total_opportunities: number;
  open_opportunities: number;
  doctor_opportunities: number;
  patient_opportunities: number;
  converted_opportunities: number;
  pipeline_value: number;
  weighted_pipeline_value: number;
};

export type DoctorConversionSummary = {
  organization_id: string;
  doctor_opportunities: number;
  converted_doctors: number;
  member_conversions: number;
  partner_conversions: number;
  doctor_conversion_rate: number;
};

export type DoctorSubscriptionSummary = {
  organization_id: string;
  doctors: number;
  active_subscriptions: number;
  active_member_subscriptions: number;
  active_partner_subscriptions: number;
};

export type PatientConversionSummary = {
  organization_id: string;
  patient_opportunities: number;
  premium_conversions: number;
  patient_conversion_rate: number;
};

export type PatientMembershipSummary = {
  organization_id: string;
  total_patients: number;
  active_memberships: number;
  active_premium_memberships: number;
};

export type DoctorSalesPipelineRow = {
  opportunity_id: string;
  organization_id: string;
  lead_id: string | null;
  doctor_id: string | null;
  ambassador_id: string | null;
  owner_employee_id: string | null;
  performance_period_id: string | null;
  opportunity_type: string | null;
  stage: string;
  priority: string | null;
  source: string | null;
  expected_value: number | null;
  probability_percentage: number | null;
  opened_at: string | null;
  expected_close_date: string | null;
  converted_at: string | null;
  lost_at: string | null;
  loss_reason: string | null;
  doctor_first_name: string | null;
  doctor_last_name: string | null;
  practice_name: string | null;
  specialty: string | null;
  acquisition_status: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
};

export type PatientSalesPipelineRow = {
  opportunity_id: string;
  organization_id: string;
  lead_id: string | null;
  patient_id: string | null;
  owner_employee_id: string | null;
  performance_period_id: string | null;
  opportunity_type: string | null;
  stage: string;
  priority: string | null;
  source: string | null;
  expected_value: number | null;
  probability_percentage: number | null;
  opened_at: string | null;
  expected_close_date: string | null;
  converted_at: string | null;
  lost_at: string | null;
  loss_reason: string | null;
  patient_first_name: string | null;
  patient_last_name: string | null;
  lifecycle_status: string | null;
  owner_first_name: string | null;
  owner_last_name: string | null;
};

export type SalesOpportunity = {
  id: string;
  organization_id: string;
  lead_id: string | null;
  doctor_id: string | null;
  patient_id: string | null;
  ambassador_id: string | null;
  owner_employee_id: string | null;
  performance_period_id: string | null;
  opportunity_type: string | null;
  stage: string;
  priority: string | null;
  source: string | null;
  expected_value: number | null;
  probability_percentage: number | null;
  opened_at: string | null;
  expected_close_date: string | null;
  converted_at: string | null;
  lost_at: string | null;
  loss_reason: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesEmployee = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  job_title: string | null;
  employee_status: string;
};

export type SalesAmbassador = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  status: string | null;
};

export type SalesFollowup = {
  id: string;
  organization_id: string;
  opportunity_id: string;
  assigned_to: string | null;
  followup_at: string;
  status: string;
  outcome: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SalesPerformancePeriod = {
  id: string;
  organization_id: string;
  period_name: string;
  period_start: string;
  period_end: string;
  period_type: string;
  status: string;
  notes: string | null;
};

export type SalesAccountabilityRow = {
  performance_id: string;
  organization_id: string;
  performance_period_id: string;
  period_name: string | null;
  period_start: string | null;
  period_end: string | null;
  employee_id: string | null;
  employee_name: string | null;
  sales_channel: string | null;
  leads_count: number;
  contacts_count: number;
  opportunities_count: number;
  conversions_count: number;
  member_conversions: number;
  partner_conversions: number;
  premium_conversions: number;
  conversion_rate: number | null;
  revenue_generated: number;
  target_value: number | null;
  target_variance: number | null;
  status: string;
};

export type SalesPerformance = {
  id: string;
  organization_id: string;
  performance_period_id: string;
  employee_id: string | null;
  sales_channel: string | null;
  leads_count: number;
  contacts_count: number;
  opportunities_count: number;
  conversions_count: number;
  member_conversions: number;
  partner_conversions: number;
  premium_conversions: number;
  conversion_rate: number | null;
  revenue_generated: number;
  target_value: number | null;
  target_variance: number | null;
  status: string;
  notes: string | null;
};

export type SalesTarget = {
  id: string;
  organization_id: string;
  performance_period_id: string;
  employee_id: string | null;
  target_type: string;
  target_value: number;
  target_unit: string | null;
  notes: string | null;
  active: boolean;
};

export type SalesConversionOutcome = {
  id: string;
  organization_id: string;
  opportunity_id: string | null;
  sales_conversion_id: string | null;
  doctor_id: string | null;
  patient_id: string | null;
  converted_plan: string | null;
  conversion_value: number | null;
  conversion_date: string;
  revenue_id: string | null;
  notes: string | null;
};

export type SalesCampaign = {
  id: string;
  organization_id: string;
  name: string;
  campaign_type: string | null;
  start_date: string | null;
  end_date: string | null;
  target_leads: number | null;
  target_conversions: number | null;
  target_revenue: number | null;
  status: string;
  owner_employee_id: string | null;
  description: string | null;
};

export type SalesRevenue = {
  id: string;
  organization_id: string;
  revenue_date: string;
  revenue_type: string | null;
  source_entity_type: string | null;
  source_entity_id: string | null;
  amount: number;
  currency: string | null;
  status: string;
  description: string | null;
};

export type SalesDashboardData = {
  summary: SalesSummary | null;
  doctorConversionSummary: DoctorConversionSummary | null;
  doctorSubscriptionSummary: DoctorSubscriptionSummary | null;
  patientConversionSummary: PatientConversionSummary | null;
  patientMembershipSummary: PatientMembershipSummary | null;
  doctorPipeline: DoctorSalesPipelineRow[];
  patientPipeline: PatientSalesPipelineRow[];
  opportunities: SalesOpportunity[];
  employees: SalesEmployee[];
  ambassadors: SalesAmbassador[];
  followups: SalesFollowup[];
  performancePeriods: SalesPerformancePeriod[];
  accountability: SalesAccountabilityRow[];
  performance: SalesPerformance[];
  targets: SalesTarget[];
  conversions: SalesConversionOutcome[];
  campaigns: SalesCampaign[];
  revenue: SalesRevenue[];
  accountabilitySource: "summary" | "performance" | "unavailable";
  optionalErrors: string[];
  currentPerformancePeriod: SalesPerformancePeriod | null;
};

type QueryState = {
  data: SalesDashboardData | undefined;
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
  ceoSalesSummary:
    "organization_id, total_opportunities, open_opportunities, doctor_opportunities, patient_opportunities, converted_opportunities, pipeline_value, weighted_pipeline_value",
  doctorConversionSummary:
    "organization_id, doctor_opportunities, converted_doctors, member_conversions, partner_conversions, doctor_conversion_rate",
  doctorSubscriptionSummary:
    "organization_id, doctors, active_subscriptions, active_member_subscriptions, active_partner_subscriptions",
  patientConversionSummary:
    "organization_id, patient_opportunities, premium_conversions, patient_conversion_rate",
  patientMembershipSummary:
    "organization_id, total_patients, active_memberships, active_premium_memberships",
  doctorPipeline:
    "opportunity_id, organization_id, lead_id, doctor_id, ambassador_id, owner_employee_id, performance_period_id, opportunity_type, stage, priority, source, expected_value, probability_percentage, opened_at, expected_close_date, converted_at, lost_at, loss_reason, doctor_first_name, doctor_last_name, practice_name, specialty, acquisition_status, owner_first_name, owner_last_name",
  patientPipeline:
    "opportunity_id, organization_id, lead_id, patient_id, owner_employee_id, performance_period_id, opportunity_type, stage, priority, source, expected_value, probability_percentage, opened_at, expected_close_date, converted_at, lost_at, loss_reason, patient_first_name, patient_last_name, lifecycle_status, owner_first_name, owner_last_name",
  opportunities:
    "id, organization_id, lead_id, doctor_id, patient_id, ambassador_id, owner_employee_id, performance_period_id, opportunity_type, stage, priority, source, expected_value, probability_percentage, opened_at, expected_close_date, converted_at, lost_at, loss_reason, notes, created_at, updated_at",
  employees: "id, first_name, last_name, job_title, employee_status",
  ambassadors: "id, first_name, last_name, status",
  followups:
    "id, organization_id, opportunity_id, assigned_to, followup_at, status, outcome, notes, completed_at, created_at, updated_at",
  performancePeriods:
    "id, organization_id, period_name, period_start, period_end, period_type, status, notes",
  accountability:
    "performance_id, organization_id, performance_period_id, period_name, period_start, period_end, employee_id, employee_name, sales_channel, leads_count, contacts_count, opportunities_count, conversions_count, member_conversions, partner_conversions, premium_conversions, conversion_rate, revenue_generated, target_value, target_variance, status",
  performance:
    "id, organization_id, performance_period_id, employee_id, sales_channel, leads_count, contacts_count, opportunities_count, conversions_count, member_conversions, partner_conversions, premium_conversions, conversion_rate, revenue_generated, target_value, target_variance, status, notes",
  targets:
    "id, organization_id, performance_period_id, employee_id, target_type, target_value, target_unit, notes, active",
  conversions:
    "id, organization_id, opportunity_id, sales_conversion_id, doctor_id, patient_id, converted_plan, conversion_value, conversion_date, revenue_id, notes",
  campaigns:
    "id, organization_id, name, campaign_type, start_date, end_date, target_leads, target_conversions, target_revenue, status, owner_employee_id, description",
  revenue:
    "id, organization_id, revenue_date, revenue_type, source_entity_type, source_entity_id, amount, currency, status, description",
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

function requiredNumber(row: RawRecord, field: string) {
  const value = numericValue(row[field]);
  if (value === null) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableNumber(row: RawRecord, field: string) {
  return numericValue(row[field]);
}

function requiredInteger(row: RawRecord, field: string) {
  const value = requiredNumber(row, field);
  if (!Number.isInteger(value)) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableInteger(row: RawRecord, field: string) {
  const value = nullableNumber(row, field);
  if (value !== null && !Number.isInteger(value)) {
    throw new Error(`The ${field} field is invalid.`);
  }
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

function requiredTimestamp(row: RawRecord, field: string) {
  const value = nullableString(row, field);
  if (value === null) throw new Error(`The ${field} field is invalid.`);
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.valueOf())) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function nullableTimestamp(row: RawRecord, field: string) {
  const value = nullableString(row, field);
  if (value === null) return null;
  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.valueOf())) throw new Error(`The ${field} field is invalid.`);
  return value;
}

function parseSummary(value: unknown): SalesSummary {
  const row = asRecord(value);
  return {
    organization_id: requiredUuid(row, "organization_id"),
    total_opportunities: requiredInteger(row, "total_opportunities"),
    open_opportunities: requiredInteger(row, "open_opportunities"),
    doctor_opportunities: requiredInteger(row, "doctor_opportunities"),
    patient_opportunities: requiredInteger(row, "patient_opportunities"),
    converted_opportunities: requiredInteger(row, "converted_opportunities"),
    pipeline_value: requiredNumber(row, "pipeline_value"),
    weighted_pipeline_value: requiredNumber(row, "weighted_pipeline_value"),
  };
}

function parseDoctorConversionSummary(value: unknown): DoctorConversionSummary {
  const row = asRecord(value);
  return {
    organization_id: requiredUuid(row, "organization_id"),
    doctor_opportunities: requiredInteger(row, "doctor_opportunities"),
    converted_doctors: requiredInteger(row, "converted_doctors"),
    member_conversions: requiredInteger(row, "member_conversions"),
    partner_conversions: requiredInteger(row, "partner_conversions"),
    doctor_conversion_rate: requiredNumber(row, "doctor_conversion_rate"),
  };
}

function parseDoctorSubscriptionSummary(value: unknown): DoctorSubscriptionSummary {
  const row = asRecord(value);
  return {
    organization_id: requiredUuid(row, "organization_id"),
    doctors: requiredInteger(row, "doctors"),
    active_subscriptions: requiredInteger(row, "active_subscriptions"),
    active_member_subscriptions: requiredInteger(row, "active_member_subscriptions"),
    active_partner_subscriptions: requiredInteger(row, "active_partner_subscriptions"),
  };
}

function parsePatientConversionSummary(value: unknown): PatientConversionSummary {
  const row = asRecord(value);
  return {
    organization_id: requiredUuid(row, "organization_id"),
    patient_opportunities: requiredInteger(row, "patient_opportunities"),
    premium_conversions: requiredInteger(row, "premium_conversions"),
    patient_conversion_rate: requiredNumber(row, "patient_conversion_rate"),
  };
}

function parsePatientMembershipSummary(value: unknown): PatientMembershipSummary {
  const row = asRecord(value);
  return {
    organization_id: requiredUuid(row, "organization_id"),
    total_patients: requiredInteger(row, "total_patients"),
    active_memberships: requiredInteger(row, "active_memberships"),
    active_premium_memberships: requiredInteger(row, "active_premium_memberships"),
  };
}

function parseDoctorPipeline(value: unknown): DoctorSalesPipelineRow {
  const row = asRecord(value);
  return {
    opportunity_id: requiredUuid(row, "opportunity_id"),
    organization_id: requiredUuid(row, "organization_id"),
    lead_id: nullableUuid(row, "lead_id"),
    doctor_id: nullableUuid(row, "doctor_id"),
    ambassador_id: nullableUuid(row, "ambassador_id"),
    owner_employee_id: nullableUuid(row, "owner_employee_id"),
    performance_period_id: nullableUuid(row, "performance_period_id"),
    opportunity_type: nullableString(row, "opportunity_type"),
    stage: requiredString(row, "stage"),
    priority: nullableString(row, "priority"),
    source: nullableString(row, "source"),
    expected_value: nullableNumber(row, "expected_value"),
    probability_percentage: nullableNumber(row, "probability_percentage"),
    opened_at: nullableTimestamp(row, "opened_at"),
    expected_close_date: nullableDate(row, "expected_close_date"),
    converted_at: nullableTimestamp(row, "converted_at"),
    lost_at: nullableTimestamp(row, "lost_at"),
    loss_reason: nullableString(row, "loss_reason"),
    doctor_first_name: nullableString(row, "doctor_first_name"),
    doctor_last_name: nullableString(row, "doctor_last_name"),
    practice_name: nullableString(row, "practice_name"),
    specialty: nullableString(row, "specialty"),
    acquisition_status: nullableString(row, "acquisition_status"),
    owner_first_name: nullableString(row, "owner_first_name"),
    owner_last_name: nullableString(row, "owner_last_name"),
  };
}

function parsePatientPipeline(value: unknown): PatientSalesPipelineRow {
  const row = asRecord(value);
  return {
    opportunity_id: requiredUuid(row, "opportunity_id"),
    organization_id: requiredUuid(row, "organization_id"),
    lead_id: nullableUuid(row, "lead_id"),
    patient_id: nullableUuid(row, "patient_id"),
    owner_employee_id: nullableUuid(row, "owner_employee_id"),
    performance_period_id: nullableUuid(row, "performance_period_id"),
    opportunity_type: nullableString(row, "opportunity_type"),
    stage: requiredString(row, "stage"),
    priority: nullableString(row, "priority"),
    source: nullableString(row, "source"),
    expected_value: nullableNumber(row, "expected_value"),
    probability_percentage: nullableNumber(row, "probability_percentage"),
    opened_at: nullableTimestamp(row, "opened_at"),
    expected_close_date: nullableDate(row, "expected_close_date"),
    converted_at: nullableTimestamp(row, "converted_at"),
    lost_at: nullableTimestamp(row, "lost_at"),
    loss_reason: nullableString(row, "loss_reason"),
    patient_first_name: nullableString(row, "patient_first_name"),
    patient_last_name: nullableString(row, "patient_last_name"),
    lifecycle_status: nullableString(row, "lifecycle_status"),
    owner_first_name: nullableString(row, "owner_first_name"),
    owner_last_name: nullableString(row, "owner_last_name"),
  };
}

function parseOpportunity(value: unknown): SalesOpportunity {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    lead_id: nullableUuid(row, "lead_id"),
    doctor_id: nullableUuid(row, "doctor_id"),
    patient_id: nullableUuid(row, "patient_id"),
    ambassador_id: nullableUuid(row, "ambassador_id"),
    owner_employee_id: nullableUuid(row, "owner_employee_id"),
    performance_period_id: nullableUuid(row, "performance_period_id"),
    opportunity_type: nullableString(row, "opportunity_type"),
    stage: requiredString(row, "stage"),
    priority: nullableString(row, "priority"),
    source: nullableString(row, "source"),
    expected_value: nullableNumber(row, "expected_value"),
    probability_percentage: nullableNumber(row, "probability_percentage"),
    opened_at: nullableTimestamp(row, "opened_at"),
    expected_close_date: nullableDate(row, "expected_close_date"),
    converted_at: nullableTimestamp(row, "converted_at"),
    lost_at: nullableTimestamp(row, "lost_at"),
    loss_reason: nullableString(row, "loss_reason"),
    notes: nullableString(row, "notes"),
    created_at: requiredTimestamp(row, "created_at"),
    updated_at: requiredTimestamp(row, "updated_at"),
  };
}

function parseEmployee(value: unknown): SalesEmployee {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    first_name: nullableString(row, "first_name"),
    last_name: nullableString(row, "last_name"),
    job_title: nullableString(row, "job_title"),
    employee_status: requiredString(row, "employee_status"),
  };
}

function parseAmbassador(value: unknown): SalesAmbassador {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    first_name: nullableString(row, "first_name"),
    last_name: nullableString(row, "last_name"),
    status: nullableString(row, "status"),
  };
}

function parseFollowup(value: unknown): SalesFollowup {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    opportunity_id: requiredUuid(row, "opportunity_id"),
    assigned_to: nullableUuid(row, "assigned_to"),
    followup_at: requiredTimestamp(row, "followup_at"),
    status: requiredString(row, "status"),
    outcome: nullableString(row, "outcome"),
    notes: nullableString(row, "notes"),
    completed_at: nullableTimestamp(row, "completed_at"),
    created_at: requiredTimestamp(row, "created_at"),
    updated_at: requiredTimestamp(row, "updated_at"),
  };
}

function parsePerformancePeriod(value: unknown): SalesPerformancePeriod {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    period_name: requiredString(row, "period_name"),
    period_start: requiredDate(row, "period_start"),
    period_end: requiredDate(row, "period_end"),
    period_type: requiredString(row, "period_type"),
    status: requiredString(row, "status"),
    notes: nullableString(row, "notes"),
  };
}

function parseAccountability(value: unknown): SalesAccountabilityRow {
  const row = asRecord(value);
  return {
    performance_id: requiredUuid(row, "performance_id"),
    organization_id: requiredUuid(row, "organization_id"),
    performance_period_id: requiredUuid(row, "performance_period_id"),
    period_name: nullableString(row, "period_name"),
    period_start: nullableDate(row, "period_start"),
    period_end: nullableDate(row, "period_end"),
    employee_id: nullableUuid(row, "employee_id"),
    employee_name: nullableString(row, "employee_name"),
    sales_channel: nullableString(row, "sales_channel"),
    leads_count: requiredInteger(row, "leads_count"),
    contacts_count: requiredInteger(row, "contacts_count"),
    opportunities_count: requiredInteger(row, "opportunities_count"),
    conversions_count: requiredInteger(row, "conversions_count"),
    member_conversions: requiredInteger(row, "member_conversions"),
    partner_conversions: requiredInteger(row, "partner_conversions"),
    premium_conversions: requiredInteger(row, "premium_conversions"),
    conversion_rate: nullableNumber(row, "conversion_rate"),
    revenue_generated: requiredNumber(row, "revenue_generated"),
    target_value: nullableNumber(row, "target_value"),
    target_variance: nullableNumber(row, "target_variance"),
    status: requiredString(row, "status"),
  };
}

function parsePerformance(value: unknown): SalesPerformance {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    performance_period_id: requiredUuid(row, "performance_period_id"),
    employee_id: nullableUuid(row, "employee_id"),
    sales_channel: nullableString(row, "sales_channel"),
    leads_count: requiredInteger(row, "leads_count"),
    contacts_count: requiredInteger(row, "contacts_count"),
    opportunities_count: requiredInteger(row, "opportunities_count"),
    conversions_count: requiredInteger(row, "conversions_count"),
    member_conversions: requiredInteger(row, "member_conversions"),
    partner_conversions: requiredInteger(row, "partner_conversions"),
    premium_conversions: requiredInteger(row, "premium_conversions"),
    conversion_rate: nullableNumber(row, "conversion_rate"),
    revenue_generated: requiredNumber(row, "revenue_generated"),
    target_value: nullableNumber(row, "target_value"),
    target_variance: nullableNumber(row, "target_variance"),
    status: requiredString(row, "status"),
    notes: nullableString(row, "notes"),
  };
}

function parseTarget(value: unknown): SalesTarget {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    performance_period_id: requiredUuid(row, "performance_period_id"),
    employee_id: nullableUuid(row, "employee_id"),
    target_type: requiredString(row, "target_type"),
    target_value: requiredNumber(row, "target_value"),
    target_unit: nullableString(row, "target_unit"),
    notes: nullableString(row, "notes"),
    active: requiredBoolean(row, "active"),
  };
}

function parseConversion(value: unknown): SalesConversionOutcome {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    opportunity_id: nullableUuid(row, "opportunity_id"),
    sales_conversion_id: nullableUuid(row, "sales_conversion_id"),
    doctor_id: nullableUuid(row, "doctor_id"),
    patient_id: nullableUuid(row, "patient_id"),
    converted_plan: nullableString(row, "converted_plan"),
    conversion_value: nullableNumber(row, "conversion_value"),
    conversion_date: requiredDate(row, "conversion_date"),
    revenue_id: nullableUuid(row, "revenue_id"),
    notes: nullableString(row, "notes"),
  };
}

function parseCampaign(value: unknown): SalesCampaign {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    name: requiredString(row, "name"),
    campaign_type: nullableString(row, "campaign_type"),
    start_date: nullableDate(row, "start_date"),
    end_date: nullableDate(row, "end_date"),
    target_leads: nullableInteger(row, "target_leads"),
    target_conversions: nullableInteger(row, "target_conversions"),
    target_revenue: nullableNumber(row, "target_revenue"),
    status: requiredString(row, "status"),
    owner_employee_id: nullableUuid(row, "owner_employee_id"),
    description: nullableString(row, "description"),
  };
}

function parseRevenue(value: unknown): SalesRevenue {
  const row = asRecord(value);
  return {
    id: requiredUuid(row, "id"),
    organization_id: requiredUuid(row, "organization_id"),
    revenue_date: requiredDate(row, "revenue_date"),
    revenue_type: nullableString(row, "revenue_type"),
    source_entity_type: nullableString(row, "source_entity_type"),
    source_entity_id: nullableUuid(row, "source_entity_id"),
    amount: requiredNumber(row, "amount"),
    currency: nullableString(row, "currency"),
    status: requiredString(row, "status"),
    description: nullableString(row, "description"),
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
  source: string,
  selection: string,
  organizationId?: string,
  ids?: string[],
): Promise<unknown> {
  if (ids && ids.length === 0) return [];
  let query = getSupabaseClient().from(source).select(selection);
  if (organizationId) query = query.eq("organization_id", organizationId);
  if (ids) query = query.in("id", ids);
  const { data, error } = await query;
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

function optionalSingle<T>(
  result: PromiseSettledResult<unknown>,
  parser: RowParser<T>,
  label: string,
): { row: T | null; error: string | null } {
  if (result.status === "rejected") {
    return { row: null, error: `${label} data is unavailable.` };
  }
  if (!Array.isArray(result.value)) {
    return { row: null, error: `${label} data is malformed.` };
  }
  if (result.value.length === 0) return { row: null, error: null };
  try {
    return { row: parser(result.value[0]), error: null };
  } catch {
    return { row: null, error: `${label} data contains malformed records.` };
  }
}

function normaliseStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_-]+/g, " ") ?? "";
}

function isCurrentPeriod(period: SalesPerformancePeriod, now = new Date()) {
  const today = now.toISOString().slice(0, 10);
  return (
    ["current", "active", "open"].includes(normaliseStatus(period.status)) &&
    today >= period.period_start &&
    today <= period.period_end
  );
}

function selectCurrentPeriod(periods: SalesPerformancePeriod[]) {
  return periods.find((period) => isCurrentPeriod(period)) ?? null;
}

function performanceToAccountability(
  rows: SalesPerformance[],
  periods: SalesPerformancePeriod[],
  employees: SalesEmployee[],
): SalesAccountabilityRow[] {
  const periodById = new Map(periods.map((period) => [period.id, period]));
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  return rows.map((row) => {
    const period = periodById.get(row.performance_period_id);
    const employee = row.employee_id ? employeeById.get(row.employee_id) : null;
    return {
      performance_id: row.id,
      organization_id: row.organization_id,
      performance_period_id: row.performance_period_id,
      period_name: period?.period_name ?? null,
      period_start: period?.period_start ?? null,
      period_end: period?.period_end ?? null,
      employee_id: row.employee_id,
      employee_name: employee ? displayEmployeeName(employee) : null,
      sales_channel: row.sales_channel,
      leads_count: row.leads_count,
      contacts_count: row.contacts_count,
      opportunities_count: row.opportunities_count,
      conversions_count: row.conversions_count,
      member_conversions: row.member_conversions,
      partner_conversions: row.partner_conversions,
      premium_conversions: row.premium_conversions,
      conversion_rate: row.conversion_rate,
      revenue_generated: row.revenue_generated,
      target_value: row.target_value,
      target_variance: row.target_variance,
      status: row.status,
    };
  });
}

async function fetchSalesDashboard(organizationId: string): Promise<SalesDashboardData> {
  const initialResults = await Promise.allSettled([
    selectRows("ceo_sales_summary", columns.ceoSalesSummary, organizationId),
    selectRows("doctor_sales_conversion_summary", columns.doctorConversionSummary, organizationId),
    selectRows("doctor_sales_subscription_summary", columns.doctorSubscriptionSummary, organizationId),
    selectRows("patient_sales_conversion_summary", columns.patientConversionSummary, organizationId),
    selectRows("patient_sales_membership_summary", columns.patientMembershipSummary, organizationId),
    selectRows("doctor_sales_pipeline", columns.doctorPipeline, organizationId),
    selectRows("patient_sales_pipeline", columns.patientPipeline, organizationId),
    selectRows("sales_opportunities", columns.opportunities, organizationId),
    selectRows("employees", columns.employees, organizationId),
    selectRows("sales_followups", columns.followups, organizationId),
    selectRows("sales_performance_periods", columns.performancePeriods, organizationId),
    selectRows("sales_accountability_summary", columns.accountability, organizationId),
    selectRows("sales_performance", columns.performance, organizationId),
    selectRows("sales_targets", columns.targets, organizationId),
    selectRows("sales_conversion_outcomes", columns.conversions, organizationId),
    selectRows("sales_campaigns", columns.campaigns, organizationId),
    selectRows("revenue", columns.revenue, organizationId),
  ]);

  const summary = optionalSingle(initialResults[0], parseSummary, "Sales overview");
  const doctorConversionSummary = optionalSingle(
    initialResults[1],
    parseDoctorConversionSummary,
    "Doctor sales conversion summary",
  );
  const doctorSubscriptionSummary = optionalSingle(
    initialResults[2],
    parseDoctorSubscriptionSummary,
    "Doctor subscription summary",
  );
  const patientConversionSummary = optionalSingle(
    initialResults[3],
    parsePatientConversionSummary,
    "Patient sales conversion summary",
  );
  const patientMembershipSummary = optionalSingle(
    initialResults[4],
    parsePatientMembershipSummary,
    "Patient membership summary",
  );
  const doctorPipeline = optionalRows(initialResults[5], parseDoctorPipeline, "Doctor sales pipeline");
  const patientPipeline = optionalRows(initialResults[6], parsePatientPipeline, "Patient sales pipeline");
  const opportunities = optionalRows(initialResults[7], parseOpportunity, "Sales opportunity");
  const employees = optionalRows(initialResults[8], parseEmployee, "Sales employee");
  const followups = optionalRows(initialResults[9], parseFollowup, "Sales follow-up");
  const performancePeriods = optionalRows(
    initialResults[10],
    parsePerformancePeriod,
    "Sales performance period",
  );
  const accountability = optionalRows(
    initialResults[11],
    parseAccountability,
    "Sales accountability",
  );
  const performance = optionalRows(initialResults[12], parsePerformance, "Sales performance");
  const targets = optionalRows(initialResults[13], parseTarget, "Sales target");
  const conversions = optionalRows(
    initialResults[14],
    parseConversion,
    "Sales conversion outcome",
  );
  const campaigns = optionalRows(initialResults[15], parseCampaign, "Sales campaign");
  const revenue = optionalRows(initialResults[16], parseRevenue, "Revenue");

  const opportunityIds = opportunities.rows
    .map((opportunity) => opportunity.ambassador_id)
    .filter((id): id is string => id !== null);
  const ambassadorResult = await Promise.allSettled([
    selectRows(
      "ambassadors",
      columns.ambassadors,
      undefined,
      [...new Set(opportunityIds)],
    ),
  ]);
  const ambassadors = optionalRows(ambassadorResult[0], parseAmbassador, "Ambassador sales attribution");

  const performancePeriodRows = deduplicateBy(performancePeriods.rows, (row) => row.id);
  const employeeRows = deduplicateBy(employees.rows, (row) => row.id);
  const currentPerformancePeriod = selectCurrentPeriod(performancePeriodRows);
  const performanceRows = deduplicateBy(performance.rows, (row) => row.id);
  const accountabilityRows = deduplicateBy(accountability.rows, (row) => row.performance_id);
  const accountabilitySource: SalesDashboardData["accountabilitySource"] =
    accountability.error === null
      ? "summary"
      : performance.error === null
        ? "performance"
        : "unavailable";
  const finalAccountability =
    accountabilitySource === "summary"
      ? accountabilityRows
      : accountabilitySource === "performance"
        ? performanceToAccountability(performanceRows, performancePeriodRows, employeeRows)
        : [];
  const optionalErrors = [
    summary.error,
    doctorConversionSummary.error,
    doctorSubscriptionSummary.error,
    patientConversionSummary.error,
    patientMembershipSummary.error,
    doctorPipeline.error,
    patientPipeline.error,
    opportunities.error,
    employees.error,
    followups.error,
    performancePeriods.error,
    accountabilitySource === "unavailable" ? accountability.error : null,
    conversions.error,
    campaigns.error,
    revenue.error,
    ambassadors.error,
  ].filter((value): value is string => Boolean(value));

  return {
    summary: summary.row,
    doctorConversionSummary: doctorConversionSummary.row,
    doctorSubscriptionSummary: doctorSubscriptionSummary.row,
    patientConversionSummary: patientConversionSummary.row,
    patientMembershipSummary: patientMembershipSummary.row,
    doctorPipeline: deduplicateBy(doctorPipeline.rows, (row) => row.opportunity_id),
    patientPipeline: deduplicateBy(patientPipeline.rows, (row) => row.opportunity_id),
    opportunities: deduplicateBy(opportunities.rows, (row) => row.id),
    employees: employeeRows,
    ambassadors: deduplicateBy(ambassadors.rows, (row) => row.id),
    followups: deduplicateBy(followups.rows, (row) => row.id),
    performancePeriods: performancePeriodRows,
    accountability: finalAccountability,
    performance: performanceRows,
    targets: deduplicateBy(targets.rows, (row) => row.id),
    conversions: deduplicateBy(conversions.rows, (row) => row.id),
    campaigns: deduplicateBy(campaigns.rows, (row) => row.id),
    revenue: deduplicateBy(revenue.rows, (row) => row.id),
    accountabilitySource,
    optionalErrors: [...new Set(optionalErrors)],
    currentPerformancePeriod,
  };
}

export function useSalesDashboard(): QueryState {
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
      "sales-dashboard",
      user?.id ?? null,
      employeeState.employee?.id ?? null,
      organizationId,
    ],
    enabled,
    queryFn: () => fetchSalesDashboard(organizationId!),
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
          ? new Error("The Sales data could not be loaded.")
          : null,
  };
}

export type SalesMetrics = {
  totalOpportunities: number | null;
  openOpportunities: number | null;
  doctorOpportunities: number | null;
  patientOpportunities: number | null;
  convertedOpportunities: number | null;
  pipelineValue: number | null;
  weightedPipelineValue: number | null;
  revenueGenerated: number | null;
  doctorConversionRate: number | null;
  patientConversionRate: number | null;
  activeDoctorSubscriptions: number | null;
  activePatientMemberships: number | null;
  salesAttributedRevenue: number | null;
};

export function buildSalesMetrics(
  data: SalesDashboardData | undefined,
  periodId: string | null,
): SalesMetrics {
  const empty: SalesMetrics = {
    totalOpportunities: null,
    openOpportunities: null,
    doctorOpportunities: null,
    patientOpportunities: null,
    convertedOpportunities: null,
    pipelineValue: null,
    weightedPipelineValue: null,
    revenueGenerated: null,
    doctorConversionRate: null,
    patientConversionRate: null,
    activeDoctorSubscriptions: null,
    activePatientMemberships: null,
    salesAttributedRevenue: null,
  };
  if (!data) return empty;

  const accountability = periodId
    ? data.accountability.filter((row) => row.performance_period_id === periodId)
    : [];
  const selectedPeriod = periodId
    ? data.performancePeriods.find((period) => period.id === periodId) ?? null
    : null;
  const sourceRevenue = data.revenue.filter((row) => {
    if (!isSalesAttributedRevenue(row)) return false;
    if (!periodId) return true;
    return Boolean(
      selectedPeriod &&
        row.revenue_date >= selectedPeriod.period_start &&
        row.revenue_date <= selectedPeriod.period_end,
    );
  });
  return {
    totalOpportunities: data.summary?.total_opportunities ?? null,
    openOpportunities: data.summary?.open_opportunities ?? null,
    doctorOpportunities:
      data.summary?.doctor_opportunities ?? data.doctorConversionSummary?.doctor_opportunities ?? null,
    patientOpportunities:
      data.summary?.patient_opportunities ?? data.patientConversionSummary?.patient_opportunities ?? null,
    convertedOpportunities: data.summary?.converted_opportunities ?? null,
    pipelineValue: data.summary?.pipeline_value ?? null,
    weightedPipelineValue: data.summary?.weighted_pipeline_value ?? null,
    revenueGenerated:
      accountability.length > 0
        ? accountability.reduce((total, row) => total + row.revenue_generated, 0)
        : null,
    doctorConversionRate: data.doctorConversionSummary?.doctor_conversion_rate ?? null,
    patientConversionRate: data.patientConversionSummary?.patient_conversion_rate ?? null,
    activeDoctorSubscriptions: data.doctorSubscriptionSummary?.active_subscriptions ?? null,
    activePatientMemberships: data.patientMembershipSummary?.active_memberships ?? null,
    salesAttributedRevenue:
      sourceRevenue.length > 0
        ? sourceRevenue.reduce((total, row) => total + row.amount, 0)
        : null,
  };
}

export type SalesPipelineGroup = {
  stage: string;
  count: number;
  expectedValue: number | null;
  weightedValue: number | null;
  doctorCount: number;
  patientCount: number;
};

function weightedValue(expectedValue: number | null, probability: number | null) {
  if (expectedValue === null || probability === null) return null;
  return expectedValue * (probability / 100);
}

export function buildSalesPipelineGroups(data: SalesDashboardData | undefined): SalesPipelineGroup[] {
  if (!data) return [];
  const rows = [
    ...data.doctorPipeline.map((row) => ({
      stage: row.stage,
      type: "doctor",
      expectedValue: row.expected_value,
      probability: row.probability_percentage,
    })),
    ...data.patientPipeline.map((row) => ({
      stage: row.stage,
      type: "patient",
      expectedValue: row.expected_value,
      probability: row.probability_percentage,
    })),
  ];
  if (!rows.length && data.opportunities.length) {
    rows.push(
      ...data.opportunities.map((row) => ({
        stage: row.stage,
        type: row.doctor_id ? "doctor" : "patient",
        expectedValue: row.expected_value,
        probability: row.probability_percentage,
      })),
    );
  }
  const groups = new Map<string, SalesPipelineGroup>();
  rows.forEach((row) => {
    const existing = groups.get(row.stage) ?? {
      stage: row.stage,
      count: 0,
      expectedValue: 0,
      weightedValue: 0,
      doctorCount: 0,
      patientCount: 0,
    };
    existing.count += 1;
    existing.expectedValue =
      existing.expectedValue === null || row.expectedValue === null
        ? null
        : existing.expectedValue + row.expectedValue;
    const weighted = weightedValue(row.expectedValue, row.probability);
    existing.weightedValue =
      existing.weightedValue === null || weighted === null
        ? null
        : existing.weightedValue + weighted;
    if (row.type === "doctor") existing.doctorCount += 1;
    if (row.type === "patient") existing.patientCount += 1;
    groups.set(row.stage, existing);
  });
  return [...groups.values()].sort((left, right) => right.count - left.count);
}

export type SalesFollowupBucket = "due" | "upcoming" | "completed" | "overdue";

export function followupBucket(followup: SalesFollowup, now = new Date()): SalesFollowupBucket {
  const status = normaliseStatus(followup.status);
  const completed = Boolean(followup.completed_at) || [
    "completed",
    "complete",
    "done",
    "closed",
    "cancelled",
    "canceled",
  ].includes(status);
  if (completed) return "completed";
  const time = new Date(followup.followup_at).valueOf();
  if (Number.isNaN(time) || time > now.valueOf()) return "upcoming";
  const sameDay = new Date(time).toISOString().slice(0, 10) === now.toISOString().slice(0, 10);
  return sameDay ? "due" : "overdue";
}

export function isSalesAttributedRevenue(row: SalesRevenue) {
  const sourceType = normaliseStatus(row.source_entity_type);
  return [
    "sales opportunity",
    "sales conversion",
    "sales conversion outcome",
  ].includes(sourceType);
}

export type SalesTargetView = SalesTarget & {
  employeeName: string;
  actualValue: number | null;
  variance: number | null;
  actualStatus: string | null;
};

function targetMetric(targetType: string) {
  const type = normaliseStatus(targetType);
  if (["revenue", "revenue generated", "sales revenue"].includes(type)) return "revenue";
  if (["conversions", "conversion", "total conversions"].includes(type)) return "conversions";
  if (["leads", "lead count", "leads count"].includes(type)) return "leads";
  if (["opportunities", "opportunity count", "opportunities count"].includes(type)) return "opportunities";
  return null;
}

export function buildSalesTargetViews(
  data: SalesDashboardData | undefined,
  periodId: string | null,
): SalesTargetView[] {
  if (!data || !periodId) return [];
  const accountability = data.accountability.filter(
    (row) => row.performance_period_id === periodId,
  );
  const employeeById = new Map(data.employees.map((employee) => [employee.id, employee]));
  return data.targets
    .filter((target) => target.active && target.performance_period_id === periodId)
    .map((target) => {
      const performance = accountability.find(
        (row) => row.employee_id === target.employee_id,
      );
      const metric = targetMetric(target.target_type);
      const actualValue = performance && metric
        ? metric === "revenue"
          ? performance.revenue_generated
          : metric === "conversions"
            ? performance.conversions_count
            : metric === "leads"
              ? performance.leads_count
              : performance.opportunities_count
        : null;
      const variance = performance && metric && performance.target_value === target.target_value
        ? performance.target_variance
        : null;
      return {
        ...target,
        employeeName: target.employee_id
          ? displayEmployeeName(employeeById.get(target.employee_id))
          : "Organisation target",
        actualValue,
        variance,
        actualStatus: performance?.status ?? null,
      };
    });
}

export function displayEmployeeName(employee: SalesEmployee | null | undefined) {
  if (!employee) return "Employee unavailable";
  const name = `${employee.first_name ?? ""} ${employee.last_name ?? ""}`.trim();
  return name || "Employee unavailable";
}

export function displayAmbassadorName(ambassador: SalesAmbassador | null | undefined) {
  if (!ambassador) return "Ambassador unavailable";
  const name = `${ambassador.first_name ?? ""} ${ambassador.last_name ?? ""}`.trim();
  return name || "Ambassador unavailable";
}

export function formatMoney(value: number | null, currency = "ZAR") {
  if (value === null) return "Unavailable";
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentage(value: number | null) {
  return value === null ? "Unavailable" : `${value.toFixed(1)}%`;
}

export function formatDate(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00Z`);
  if (Number.isNaN(date.valueOf())) return value;
  return new Intl.DateTimeFormat("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function normaliseSalesStatus(value: string | null | undefined) {
  return normaliseStatus(value);
}
