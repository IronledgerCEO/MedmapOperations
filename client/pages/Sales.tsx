import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Megaphone,
  Network,
  Percent,
  Target,
  TrendingUp,
  Users,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import {
  buildSalesMetrics,
  buildSalesPipelineGroups,
  buildSalesTargetViews,
  displayAmbassadorName,
  displayEmployeeName,
  formatDate,
  formatMoney,
  formatPercentage,
  followupBucket,
  isSalesAttributedRevenue,
  normaliseSalesStatus,
  useSalesDashboard,
  type SalesAccountabilityRow,
  type SalesCampaign,
  type SalesConversionOutcome,
  type SalesFollowup,
  type SalesPipelineGroup,
  type SalesTargetView,
} from "@/lib/sales-dashboard";
import { cn } from "@/lib/utils";

function StateMessage({
  children,
  tone = "empty",
}: {
  children: React.ReactNode;
  tone?: "empty" | "error" | "warning";
}) {
  return (
    <p
      className={cn(
        "rounded-xl p-3 text-[11px] leading-5",
        tone === "error"
          ? "border border-[#f0cdca] bg-[#fff8f7] text-[#a34f4b]"
          : tone === "warning"
            ? "border border-[#f4dfb3] bg-[#fffaf0] text-[#94651d]"
            : "bg-[#f7f9fb] text-slate-400",
      )}
    >
      {children}
    </p>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ElementType;
  tone: "blue" | "mint" | "amber" | "red" | "purple";
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
      <span
        className={cn(
          "grid size-9 place-items-center rounded-xl",
          tone === "blue" && "bg-[#eaf3ff] text-[#4a87c9]",
          tone === "mint" && "bg-[#e8f8f2] text-[#1b9975]",
          tone === "amber" && "bg-[#fff2d9] text-[#b3781f]",
          tone === "red" && "bg-[#ffe9e6] text-[#bf5b56]",
          tone === "purple" && "bg-[#f1edff] text-[#755bc0]",
        )}
      >
        <Icon size={17} />
      </span>
      <p className="mt-4 text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-[25px] font-bold tracking-[-0.06em] text-[#152239]">
        {value}
      </p>
      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function Section({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:p-6",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="font-display text-[16px] font-bold text-[#152239]">{title}</h2>
          <p className="mt-1 text-[11px] leading-5 text-slate-400">{description}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function statusClass(value: string | null | undefined) {
  const status = normaliseSalesStatus(value);
  if (["converted", "won", "active", "completed", "complete", "paid", "on track"].includes(status)) {
    return "bg-[#e8f8f2] text-[#168465]";
  }
  if (["lost", "cancelled", "canceled", "overdue", "critical", "failed"].includes(status)) {
    return "bg-[#ffe5e3] text-[#bd504d]";
  }
  if (["open", "qualified", "proposal", "pending", "in progress", "due"].includes(status)) {
    return "bg-[#fff2d9] text-[#94651d]";
  }
  return "bg-[#eef2f7] text-slate-500";
}

function StatusPill({ value }: { value: string | null | undefined }) {
  return (
    <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", statusClass(value))}>
      {value || "Not provided"}
    </span>
  );
}

function formatValue(value: number | null, formatter: (value: number) => string = String) {
  return value === null ? "Unavailable" : formatter(value);
}

function formatPipelineName(
  firstName: string | null,
  lastName: string | null,
  practiceName: string | null,
) {
  const doctorName = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return practiceName ? `${practiceName}${doctorName ? ` · ${doctorName}` : ""}` : doctorName || "Doctor unavailable";
}

function PipelineTable({
  rows,
  type,
}: {
  rows: Array<{
    opportunity_id: string;
    stage: string;
    priority: string | null;
    source: string | null;
    expected_value: number | null;
    probability_percentage: number | null;
    expected_close_date: string | null;
    converted_at: string | null;
    lost_at: string | null;
    loss_reason: string | null;
    owner_first_name: string | null;
    owner_last_name: string | null;
    doctor_first_name?: string | null;
    doctor_last_name?: string | null;
    practice_name?: string | null;
    specialty?: string | null;
    patient_first_name?: string | null;
    patient_last_name?: string | null;
    lifecycle_status?: string | null;
  }>;
  type: "doctor" | "patient";
}) {
  if (!rows.length) {
    return <StateMessage>No live {type} opportunities found.</StateMessage>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">{type === "doctor" ? "Practice / doctor" : "Opportunity"}</th>
            <th className="pb-2 font-bold">Stage</th>
            <th className="pb-2 font-bold">Source</th>
            <th className="pb-2 font-bold">Owner</th>
            <th className="pb-2 font-bold">Priority</th>
            <th className="pb-2 text-right font-bold">Expected</th>
            <th className="pb-2 text-right font-bold">Probability</th>
            <th className="pb-2 text-right font-bold">Close date</th>
            <th className="pb-2 font-bold">State</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 30).map((row) => (
            <tr key={row.opportunity_id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4">
                <p className="font-semibold text-slate-700">
                  {type === "doctor"
                    ? formatPipelineName(row.doctor_first_name ?? null, row.doctor_last_name ?? null, row.practice_name ?? null)
                    : "Patient opportunity"}
                </p>
                <p className="mt-1 text-[9px] text-slate-400">
                  {type === "doctor" ? row.specialty || "Specialty not provided" : row.lifecycle_status || "Patient context not displayed"}
                </p>
              </td>
              <td className="py-3 pr-4"><StatusPill value={row.stage} /></td>
              <td className="py-3 pr-4 text-slate-500">{row.source || "Not provided"}</td>
              <td className="py-3 pr-4 text-slate-500">
                {`${row.owner_first_name ?? ""} ${row.owner_last_name ?? ""}`.trim() || "Owner unavailable"}
              </td>
              <td className="py-3 pr-4 text-slate-500">{row.priority || "Not provided"}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{formatMoney(row.expected_value)}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{formatPercentage(row.probability_percentage)}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{formatDate(row.expected_close_date)}</td>
              <td className="py-3 text-slate-500">
                {row.converted_at ? "Converted" : row.lost_at ? `Lost${row.loss_reason ? ` · ${row.loss_reason}` : ""}` : "Open"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 30 && <p className="mt-3 text-[10px] text-slate-400">Showing 30 of {rows.length} live opportunities.</p>}
    </div>
  );
}

function PipelineGroupList({ groups }: { groups: SalesPipelineGroup[] }) {
  if (!groups.length) return <StateMessage>No live opportunities found.</StateMessage>;
  return (
    <div className="space-y-2">
      {groups.map((group) => (
        <div key={group.stage} className="rounded-xl bg-[#f7f9fb] p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold capitalize text-slate-700">{group.stage}</p>
              <p className="mt-1 text-[10px] text-slate-400">
                {group.doctorCount} doctor · {group.patientCount} patient opportunities
              </p>
            </div>
            <span className="font-display text-[20px] font-bold text-[#152239]">{group.count}</span>
          </div>
          <div className="mt-3 grid gap-2 text-[10px] text-slate-500 sm:grid-cols-2">
            <span>Expected: <strong className="text-slate-700">{formatMoney(group.expectedValue)}</strong></span>
            <span>Weighted: <strong className="text-slate-700">{formatMoney(group.weightedValue)}</strong></span>
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountabilityTable({ rows }: { rows: SalesAccountabilityRow[] }) {
  if (!rows.length) return <StateMessage>No sales performance records found for this period.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[930px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Employee</th>
            <th className="pb-2 font-bold">Channel</th>
            <th className="pb-2 text-right font-bold">Leads</th>
            <th className="pb-2 text-right font-bold">Contacts</th>
            <th className="pb-2 text-right font-bold">Opps</th>
            <th className="pb-2 text-right font-bold">Conversions</th>
            <th className="pb-2 text-right font-bold">Member</th>
            <th className="pb-2 text-right font-bold">Partner</th>
            <th className="pb-2 text-right font-bold">Premium</th>
            <th className="pb-2 text-right font-bold">Rate</th>
            <th className="pb-2 text-right font-bold">Revenue</th>
            <th className="pb-2 text-right font-bold">Variance</th>
            <th className="pb-2 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.performance_id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4 font-semibold text-slate-700">{row.employee_name || "Employee unavailable"}</td>
              <td className="py-3 pr-4 text-slate-500">{row.sales_channel || "Not provided"}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.leads_count}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.contacts_count}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.opportunities_count}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.conversions_count}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.member_conversions}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.partner_conversions}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{row.premium_conversions}</td>
              <td className="py-3 pr-4 text-right text-slate-500">{formatPercentage(row.conversion_rate)}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{formatMoney(row.revenue_generated)}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{formatMoney(row.target_variance)}</td>
              <td className="py-3"><StatusPill value={row.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TargetTable({ rows }: { rows: SalesTargetView[] }) {
  if (!rows.length) return <StateMessage>No active sales targets found for this period.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Employee</th>
            <th className="pb-2 font-bold">Target</th>
            <th className="pb-2 text-right font-bold">Value</th>
            <th className="pb-2 font-bold">Unit</th>
            <th className="pb-2 text-right font-bold">Actual</th>
            <th className="pb-2 text-right font-bold">Variance</th>
            <th className="pb-2 font-bold">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4 text-slate-600">{row.employeeName}</td>
              <td className="py-3 pr-4 font-semibold text-slate-700">{row.target_type}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{row.target_value}</td>
              <td className="py-3 pr-4 text-slate-500">{row.target_unit || "Not provided"}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{row.actualValue === null ? "Unavailable" : row.actualValue}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{row.variance === null ? "Unavailable" : row.variance}</td>
              <td className="py-3"><StatusPill value={row.actualStatus} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FollowupList({ followups }: { followups: SalesFollowup[] }) {
  if (!followups.length) return <StateMessage>No scheduled follow-ups found.</StateMessage>;
  const buckets = (["due", "upcoming", "overdue", "completed"] as const).map((bucket) => ({
    bucket,
    rows: followups.filter((followup) => followupBucket(followup) === bucket),
  }));
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {buckets.map(({ bucket, rows }) => (
        <div key={bucket} className="rounded-xl bg-[#f7f9fb] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">{bucket}</p>
            <span className="font-display text-[18px] font-bold text-[#152239]">{rows.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {rows.slice(0, 5).map((followup) => (
              <div key={followup.id} className="border-t border-slate-200 pt-2 text-[10px] text-slate-500 first:border-0 first:pt-0">
                <p className="font-semibold text-slate-700">Opportunity {followup.opportunity_id.slice(0, 8)}</p>
                <p className="mt-1">{formatDate(followup.followup_at)} · {followup.outcome || followup.status}</p>
              </div>
            ))}
            {!rows.length && <p className="text-[10px] text-slate-400">No records.</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversionList({ rows }: { rows: SalesConversionOutcome[] }) {
  if (!rows.length) return <StateMessage>No organisation-scoped conversion outcomes found.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Date</th>
            <th className="pb-2 font-bold">Classification</th>
            <th className="pb-2 font-bold">Plan</th>
            <th className="pb-2 text-right font-bold">Value</th>
            <th className="pb-2 font-bold">Opportunity</th>
            <th className="pb-2 font-bold">Revenue link</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 30).map((row) => (
            <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4 text-slate-500">{formatDate(row.conversion_date)}</td>
              <td className="py-3 pr-4 text-slate-600">{row.doctor_id ? "Doctor" : row.patient_id ? "Patient" : "Not classified"}</td>
              <td className="py-3 pr-4 text-slate-600">{row.converted_plan || "Not provided"}</td>
              <td className="py-3 pr-4 text-right text-slate-600">{formatMoney(row.conversion_value)}</td>
              <td className="py-3 pr-4 text-slate-500">{row.opportunity_id ? row.opportunity_id.slice(0, 8) : "Not linked"}</td>
              <td className="py-3 text-slate-500">{row.revenue_id ? "Linked" : "Not linked"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CampaignList({ campaigns }: { campaigns: SalesCampaign[] }) {
  if (!campaigns.length) return <StateMessage>No active campaigns found.</StateMessage>;
  return (
    <div className="space-y-2">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="rounded-xl bg-[#f7f9fb] p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-700">{campaign.name}</p>
              <p className="mt-1 text-[10px] text-slate-400">{campaign.campaign_type || "Campaign type not provided"}</p>
            </div>
            <StatusPill value={campaign.status} />
          </div>
          <div className="mt-3 grid gap-2 text-[10px] text-slate-500 sm:grid-cols-3">
            <span>Leads target: <strong className="text-slate-700">{campaign.target_leads ?? "Unavailable"}</strong></span>
            <span>Conversions: <strong className="text-slate-700">{campaign.target_conversions ?? "Unavailable"}</strong></span>
            <span>Revenue: <strong className="text-slate-700">{formatMoney(campaign.target_revenue)}</strong></span>
          </div>
          <p className="mt-2 text-[10px] text-slate-400">{formatDate(campaign.start_date)} – {formatDate(campaign.end_date)}</p>
        </div>
      ))}
    </div>
  );
}

export default function Sales() {
  const dashboard = useSalesDashboard();
  const data = dashboard.data;
  const [selectedPeriodId, setSelectedPeriodId] = useState<string | null>(null);

  useEffect(() => {
    if (data?.currentPerformancePeriod) {
      setSelectedPeriodId(data.currentPerformancePeriod.id);
    }
  }, [data?.currentPerformancePeriod?.id]);

  const selectedPeriod = data?.performancePeriods.find((period) => period.id === selectedPeriodId) ?? null;
  const metrics = buildSalesMetrics(data, selectedPeriodId);
  const pipelineGroups = buildSalesPipelineGroups(data);
  const targetViews = buildSalesTargetViews(data, selectedPeriodId);
  const employeeById = useMemo(
    () => new Map((data?.employees ?? []).map((employee) => [employee.id, employee])),
    [data?.employees],
  );
  const ambassadorById = useMemo(
    () => new Map((data?.ambassadors ?? []).map((ambassador) => [ambassador.id, ambassador])),
    [data?.ambassadors],
  );
  const ambassadorOpportunities = (data?.doctorPipeline ?? []).filter((row) => row.ambassador_id);
  const attributedRevenue = (data?.revenue ?? []).filter(isSalesAttributedRevenue);
  const activeCampaigns = (data?.campaigns ?? []).filter((campaign) => ["active", "open", "running"].includes(normaliseSalesStatus(campaign.status)));
  const selectedAccountability = (data?.accountability ?? []).filter((row) => row.performance_period_id === selectedPeriodId);
  const coreEmpty = data && !data.summary && !data.doctorPipeline.length && !data.patientPipeline.length && !data.opportunities.length;

  return (
    <AppShell>
      <div className="mx-auto max-w-[1540px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#4a87c9]">
              <BriefcaseBusiness size={13} /> Operations · Sales
            </div>
            <h1 className="max-w-[1000px] font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">
              Sales pipeline, conversion and accountability.
            </h1>
            <p className="mt-2 max-w-[900px] text-[13px] leading-6 text-slate-500">
              Live organisation-scoped sales opportunities, production summaries, performance records, follow-ups, campaigns and attributed revenue for the authenticated organisation.
            </p>
          </div>
          <div className="rounded-2xl border border-[#cfe0f5] bg-[#f8fbff] px-4 py-3 text-[10px] text-[#4a87c9]">
            <p className="font-bold uppercase tracking-[0.12em]">Read-only command centre</p>
            <p className="mt-1">Production summary views and stored performance values remain authoritative.</p>
          </div>
        </div>

        {dashboard.isPending && <div className="mt-5"><StateMessage>Loading live Sales data...</StateMessage></div>}
        {dashboard.isError && <div className="mt-5"><StateMessage tone="error">Sales data could not be loaded. Check the production connection and RLS visibility.</StateMessage></div>}

        {data && !dashboard.isError && (
          <>
            {data.optionalErrors.length > 0 && (
              <div className="mt-5">
                <StateMessage tone="warning">
                  Some Sales sections are unavailable because their production data path is not accessible or contains no validated records: {data.optionalErrors.join(" ")}
                </StateMessage>
              </div>
            )}

            <div className="mt-6 flex flex-col justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)] sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Performance period</p>
                <p className="mt-1 text-[12px] text-slate-500">
                  {selectedPeriod ? `${selectedPeriod.period_name} · ${formatDate(selectedPeriod.period_start)} to ${formatDate(selectedPeriod.period_end)}` : "No current production period selected"}
                </p>
              </div>
              {data.performancePeriods.length > 0 && (
                <select
                  value={selectedPeriodId ?? ""}
                  onChange={(event) => setSelectedPeriodId(event.target.value || null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] text-slate-600 outline-none focus:border-[#4a87c9]"
                >
                  <option value="">No period selected</option>
                  {data.performancePeriods.map((period) => (
                    <option key={period.id} value={period.id}>{period.period_name} · {period.status}</option>
                  ))}
                </select>
              )}
            </div>

            {coreEmpty && <div className="mt-5"><StateMessage>No live opportunities found.</StateMessage></div>}

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              <MetricCard label="Total opportunities" value={formatValue(metrics.totalOpportunities)} detail="Production summary" icon={BriefcaseBusiness} tone="blue" />
              <MetricCard label="Open opportunities" value={formatValue(metrics.openOpportunities)} detail="Production summary" icon={TrendingUp} tone="mint" />
              <MetricCard label="Doctor opportunities" value={formatValue(metrics.doctorOpportunities)} detail="Provider pipeline" icon={UsersRound} tone="purple" />
              <MetricCard label="Patient opportunities" value={formatValue(metrics.patientOpportunities)} detail="Patient pipeline" icon={Users} tone="amber" />
              <MetricCard label="Converted opportunities" value={formatValue(metrics.convertedOpportunities)} detail="Production summary" icon={CheckCircle2} tone="mint" />
              <MetricCard label="Pipeline value" value={formatMoney(metrics.pipelineValue)} detail="Stored opportunity value" icon={CircleDollarSign} tone="blue" />
              <MetricCard label="Weighted pipeline" value={formatMoney(metrics.weightedPipelineValue)} detail="Stored probability weighting" icon={Percent} tone="purple" />
              <MetricCard label="Revenue generated" value={formatMoney(metrics.revenueGenerated)} detail={selectedPeriod ? selectedPeriod.period_name : "Selected period"} icon={CircleDollarSign} tone="amber" />
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-3">
              <Section title="Conversion and subscriptions" description="Authoritative production summary views; no plan prices are hard-coded." icon={TrendingUp}>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Doctor conversion rate</p><p className="mt-1 font-display text-[21px] font-bold text-[#152239]">{formatPercentage(metrics.doctorConversionRate)}</p></div>
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Patient conversion rate</p><p className="mt-1 font-display text-[21px] font-bold text-[#152239]">{formatPercentage(metrics.patientConversionRate)}</p></div>
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Active doctor subscriptions</p><p className="mt-1 font-display text-[21px] font-bold text-[#152239]">{formatValue(metrics.activeDoctorSubscriptions)}</p></div>
                  <div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Active patient memberships</p><p className="mt-1 font-display text-[21px] font-bold text-[#152239]">{formatValue(metrics.activePatientMemberships)}</p></div>
                </div>
              </Section>
              <Section title="Doctor provider sales" description="Conversion and subscription summaries are read from production views." icon={Network}>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Converted doctors</span><strong className="text-slate-700">{data.doctorConversionSummary?.converted_doctors ?? "Unavailable"}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Member conversions</span><strong className="text-slate-700">{data.doctorConversionSummary?.member_conversions ?? "Unavailable"}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Partner conversions</span><strong className="text-slate-700">{data.doctorConversionSummary?.partner_conversions ?? "Unavailable"}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Active member / partner subscriptions</span><strong className="text-slate-700">{data.doctorSubscriptionSummary ? `${data.doctorSubscriptionSummary.active_member_subscriptions} / ${data.doctorSubscriptionSummary.active_partner_subscriptions}` : "Unavailable"}</strong></div>
                </div>
              </Section>
              <Section title="Patient membership sales" description="Patient names are intentionally not exposed in the operational pipeline." icon={Users}>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Premium conversions</span><strong className="text-slate-700">{data.patientConversionSummary?.premium_conversions ?? "Unavailable"}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Total patients</span><strong className="text-slate-700">{data.patientMembershipSummary?.total_patients ?? "Unavailable"}</strong></div>
                  <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Active premium memberships</span><strong className="text-slate-700">{data.patientMembershipSummary?.active_premium_memberships ?? "Unavailable"}</strong></div>
                  <div className="rounded-xl border border-dashed border-slate-200 p-3 text-[10px] leading-5 text-slate-400">Patient plan pricing is not queried because the verified production table has no confirmed organisation-scoped SELECT policy.</div>
                </div>
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.8fr)]">
              <Section title="Sales pipeline by stage" description="Stages are displayed exactly as stored in the production pipeline views; no example stages are invented." icon={BriefcaseBusiness}>
                <PipelineGroupList groups={pipelineGroups} />
              </Section>
              <Section title="Sales-attributed revenue" description="Only revenue with an explicit supported sales source_entity_type is classified here." icon={CircleDollarSign}>
                <div className="rounded-xl bg-[#f7f9fb] p-4">
                  <p className="text-[10px] text-slate-400">Attributed revenue</p>
                  <p className="mt-1 font-display text-[25px] font-bold text-[#152239]">{formatMoney(metrics.salesAttributedRevenue)}</p>
                  <p className="mt-2 text-[10px] leading-5 text-slate-400">{attributedRevenue.length ? `${attributedRevenue.length} organisation-scoped revenue records.` : "No sales-attributed revenue found."}</p>
                </div>
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Section title="Doctor sales pipeline" description="Doctor/provider context comes from the organisation-scoped production view." icon={Network}>
                <PipelineTable rows={data.doctorPipeline} type="doctor" />
              </Section>
              <Section title="Patient sales pipeline" description="Only minimum operational fields are shown; patient personal names are withheld." icon={Users}>
                <PipelineTable rows={data.patientPipeline} type="patient" />
              </Section>
            </div>

            <div className="mt-5">
              <Section title="Sales accountability" description={selectedPeriod ? `${selectedPeriod.period_name} · stored performance values and target variance` : "Select a production period to view accountability."} icon={Target}>
                <AccountabilityTable rows={selectedAccountability} />
                {data.accountabilitySource === "performance" && <p className="mt-3 text-[10px] text-slate-400">Accountability is composed from the organisation-scoped sales_performance table because the summary view was unavailable.</p>}
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Section title="Active sales targets" description="Actuals and variance are shown only where they map clearly to stored performance metrics for the selected period." icon={Target}>
                <TargetTable rows={targetViews} />
              </Section>
              <Section title="Follow-up control" description="Buckets are derived strictly from followup_at, completed_at and stored status." icon={CalendarClock}>
                <FollowupList followups={data.followups} />
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Section title="Conversion outcomes" description="Organisation-scoped conversion outcomes are the authoritative displayed conversion record; raw unscoped conversions are not double-counted." icon={CheckCircle2}>
                <ConversionList rows={data.conversions} />
              </Section>
              <Section title="Campaigns" description="Campaign targets are live production values. Campaign-opportunity counts are omitted because the junction table has no verified organisation-scoped policy." icon={Megaphone}>
                <CampaignList campaigns={activeCampaigns} />
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Section title="Ambassador-sourced opportunities" description="This bridge uses sales_opportunities.ambassador_id → ambassadors.id where the authenticated database path permits the lookup." icon={UsersRound}>
                {!ambassadorOpportunities.length ? <StateMessage>No ambassador-sourced sales opportunities found.</StateMessage> : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-[10px]">
                      <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Ambassador</th><th className="pb-2 font-bold">Stage</th><th className="pb-2 font-bold">Type</th><th className="pb-2 text-right font-bold">Expected</th><th className="pb-2 font-bold">State</th></tr></thead>
                      <tbody>{ambassadorOpportunities.slice(0, 30).map((row) => <tr key={row.opportunity_id} className="border-t border-slate-100"><td className="py-3 pr-4 text-slate-600">{displayAmbassadorName(ambassadorById.get(row.ambassador_id!))}</td><td className="py-3 pr-4"><StatusPill value={row.stage} /></td><td className="py-3 pr-4 text-slate-500">{row.doctor_id ? "Doctor" : "Patient"}</td><td className="py-3 pr-4 text-right text-slate-600">{formatMoney(row.expected_value)}</td><td className="py-3 text-slate-500">{row.converted_at ? "Converted" : row.lost_at ? "Lost" : "Open"}</td></tr>)}</tbody>
                    </table>
                  </div>
                )}
              </Section>
              <Section title="Sales activity feed" description="The verified production audit found no organisation-scoped SELECT policy for sales_activities, so this dashboard does not bypass that boundary." icon={Activity}>
                <StateMessage>Sales activity records are not displayed until an existing authorised organisation-scoped view or policy is available.</StateMessage>
              </Section>
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-2">
              <Section title="Recent operational follow-up owners" description="Employee names are resolved through the organisation-scoped employees table, never by email matching." icon={UsersRound}>
                {data.followups.length === 0 ? <StateMessage>No scheduled follow-ups found.</StateMessage> : (
                  <div className="space-y-2">{[...new Set(data.followups.map((followup) => followup.assigned_to).filter((id): id is string => Boolean(id)))].slice(0, 8).map((employeeId) => <div key={employeeId} className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px]"><span className="text-slate-600">{displayEmployeeName(employeeById.get(employeeId))}</span><strong className="text-slate-700">{data.followups.filter((followup) => followup.assigned_to === employeeId).length}</strong></div>)}</div>
                )}
              </Section>
              <Section title="Data boundary" description="The page is intentionally read-only and uses only existing browser Supabase access." icon={Clock3}>
                <div className="space-y-2 text-[11px] leading-5 text-slate-500">
                  <p>Doctor and patient summary views, opportunities, follow-ups, performance, targets, campaigns, conversion outcomes and revenue use explicit organisation-scoped queries.</p>
                  <p>Unscoped raw leads, activities, conversions, plan/catalogue, subscription, membership-plan and campaign-junction tables are not treated as tenant-safe.</p>
                  <p>No records are created, updated, deleted, recalculated or replaced with sample metrics.</p>
                </div>
              </Section>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
