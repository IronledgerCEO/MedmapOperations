import {
  AlertTriangle,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Layers3,
  LifeBuoy,
  MessageSquare,
  ShieldAlert,
  Target,
  Ticket,
  UsersRound,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import {
  buildCustomerOperationsCategorySummaries,
  buildCustomerOperationsMetrics,
  buildCustomerOperationsWorkload,
  displayEmployeeName,
  formatDate,
  formatHours,
  formatScore,
  isCaseOverdue,
  isCaseSlaBreached,
  isCaseSlaCompliant,
  normaliseCustomerOperationsStatus,
  useCustomerOperationsDashboard,
  type CaseCategory,
  type CaseEscalation,
  type CaseInteraction,
  type CaseTask,
  type CaseTicket,
  type CustomerCaseRecord,
  type CustomerOperationsCategorySummary,
  type CustomerOperationsEmployee,
} from "@/lib/customer-operations-dashboard";
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
  const status = normaliseCustomerOperationsStatus(value);
  if (["resolved", "closed", "complete", "completed", "done", "compliant"].includes(status)) {
    return "bg-[#e8f8f2] text-[#168465]";
  }
  if (["critical", "breached", "overdue", "escalated", "failed"].includes(status)) {
    return "bg-[#ffe5e3] text-[#bd504d]";
  }
  if (["open", "new", "in progress", "pending", "active", "at risk"].includes(status)) {
    return "bg-[#fff2d9] text-[#94651d]";
  }
  return "bg-[#eef2f7] text-slate-500";
}

function priorityClass(value: string | null | undefined) {
  const priority = normaliseCustomerOperationsStatus(value);
  if (["critical", "urgent"].includes(priority)) return "bg-[#ffe5e3] text-[#bd504d]";
  if (["high"].includes(priority)) return "bg-[#fff2d9] text-[#94651d]";
  return "bg-[#eaf3ff] text-[#4a87c9]";
}

function Pill({ value, className }: { value: string | null | undefined; className?: string }) {
  return (
    <span className={cn("rounded-full px-2 py-1 text-[9px] font-bold", className ?? statusClass(value))}>
      {value || "Not provided"}
    </span>
  );
}

function formatCount(value: number | null) {
  return value === null ? "Unavailable" : String(value);
}

function formatCaseContext(caseRow: CustomerCaseRecord) {
  if (caseRow.customer_type) return caseRow.customer_type;
  if (caseRow.patient_id) return "Patient case";
  if (caseRow.doctor_id) return "Doctor case";
  return "Customer case";
}

function slaLabel(caseRow: CustomerCaseRecord) {
  if (isCaseOverdue(caseRow)) return "Overdue";
  if (isCaseSlaBreached(caseRow)) return "Breached";
  if (isCaseSlaCompliant(caseRow)) return "Compliant";
  return "Unavailable";
}

function dueDate(caseRow: CustomerCaseRecord) {
  if (isCaseOverdue(caseRow) || isCaseSlaBreached(caseRow)) {
    return caseRow.sla?.sla_resolution_due_at ?? caseRow.sla?.sla_response_due_at ?? null;
  }
  return caseRow.sla?.sla_response_due_at ?? caseRow.sla?.sla_resolution_due_at ?? null;
}

function CaseQueue({
  cases,
}: {
  cases: CustomerCaseRecord[];
}) {
  if (!cases.length) return <StateMessage>No active customer cases.</StateMessage>;
  const queue = [...cases]
    .filter((caseRow) => !["resolved", "closed"].includes(normaliseCustomerOperationsStatus(caseRow.status)))
    .sort((left, right) => {
      const urgency = (caseRow: CustomerCaseRecord) =>
        (isCaseOverdue(caseRow) ? 4 : 0) +
        (isCaseSlaBreached(caseRow) ? 3 : 0) +
        (["critical", "urgent"].includes(normaliseCustomerOperationsStatus(caseRow.priority)) ? 2 : 0) +
        (["high"].includes(normaliseCustomerOperationsStatus(caseRow.priority)) ? 1 : 0);
      return urgency(right) - urgency(left);
    });
  if (!queue.length) return <StateMessage>No active customer cases.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[970px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Case</th>
            <th className="pb-2 font-bold">Category</th>
            <th className="pb-2 font-bold">Context</th>
            <th className="pb-2 font-bold">Priority</th>
            <th className="pb-2 font-bold">Status</th>
            <th className="pb-2 font-bold">Assigned</th>
            <th className="pb-2 font-bold">SLA</th>
            <th className="pb-2 text-right font-bold">Due</th>
          </tr>
        </thead>
        <tbody>
          {queue.slice(0, 40).map((caseRow) => (
            <tr key={caseRow.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4">
                <p className="font-semibold text-slate-700">{caseRow.case_number}</p>
                <p className="mt-1 max-w-[230px] truncate text-slate-400">{caseRow.subject}</p>
              </td>
              <td className="py-3 pr-4 text-slate-500">{caseRow.category?.name || "Category unavailable"}</td>
              <td className="py-3 pr-4 text-slate-500">{formatCaseContext(caseRow)}</td>
              <td className="py-3 pr-4"><Pill value={caseRow.priority} className={priorityClass(caseRow.priority)} /></td>
              <td className="py-3 pr-4"><Pill value={caseRow.status} /></td>
              <td className="py-3 pr-4 text-slate-500">{displayEmployeeName(caseRow.assignedTo)}</td>
              <td className="py-3 pr-4"><Pill value={slaLabel(caseRow)} /></td>
              <td className="py-3 text-right text-slate-500">{formatDate(dueDate(caseRow))}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {queue.length > 40 && <p className="mt-3 text-[10px] text-slate-400">Showing 40 of {queue.length} active cases.</p>}
    </div>
  );
}

function SlaTable({ cases }: { cases: CustomerCaseRecord[] }) {
  const rows = cases.filter((caseRow) => caseRow.sla !== null);
  if (!rows.length) return <StateMessage>No SLA-monitored cases.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Case</th>
            <th className="pb-2 font-bold">Status</th>
            <th className="pb-2 font-bold">Response</th>
            <th className="pb-2 font-bold">Resolution</th>
            <th className="pb-2 font-bold">Compliance</th>
            <th className="pb-2 text-right font-bold">Due</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 40).map((caseRow) => (
            <tr key={caseRow.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4"><p className="font-semibold text-slate-700">{caseRow.case_number}</p><p className="mt-1 max-w-[260px] truncate text-slate-400">{caseRow.subject}</p></td>
              <td className="py-3 pr-4"><Pill value={caseRow.sla?.status} /></td>
              <td className="py-3 pr-4"><Pill value={caseRow.sla?.response_sla_breached === true ? "Breached" : caseRow.sla?.first_response_at ? "Responded" : "Pending"} /></td>
              <td className="py-3 pr-4"><Pill value={caseRow.sla?.resolution_sla_breached === true ? "Breached" : caseRow.sla?.resolved_at ? "Resolved" : "Pending"} /></td>
              <td className="py-3 pr-4"><Pill value={caseRow.sla?.currently_overdue ? "Overdue" : caseRow.sla?.sla_compliant === true ? "Compliant" : "Not determined"} /></td>
              <td className="py-3 text-right text-slate-500">{formatDate(caseRow.sla?.sla_resolution_due_at ?? caseRow.sla?.sla_response_due_at ?? null)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CaseTable({ cases }: { cases: CustomerCaseRecord[] }) {
  if (!cases.length) return <StateMessage>No customer cases.</StateMessage>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400">
          <tr>
            <th className="pb-2 font-bold">Case</th>
            <th className="pb-2 font-bold">Category</th>
            <th className="pb-2 font-bold">Source</th>
            <th className="pb-2 font-bold">Context</th>
            <th className="pb-2 font-bold">Priority</th>
            <th className="pb-2 font-bold">Status</th>
            <th className="pb-2 font-bold">Assigned</th>
            <th className="pb-2 text-right font-bold">Created</th>
            <th className="pb-2 text-right font-bold">First response</th>
          </tr>
        </thead>
        <tbody>
          {cases.slice(0, 50).map((caseRow) => (
            <tr key={caseRow.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4"><p className="font-semibold text-slate-700">{caseRow.case_number}</p><p className="mt-1 max-w-[220px] truncate text-slate-400">{caseRow.subject}</p></td>
              <td className="py-3 pr-4 text-slate-500">{caseRow.category?.name || "Unavailable"}</td>
              <td className="py-3 pr-4 text-slate-500">{caseRow.source || "Not provided"}</td>
              <td className="py-3 pr-4 text-slate-500">{formatCaseContext(caseRow)}</td>
              <td className="py-3 pr-4"><Pill value={caseRow.priority} className={priorityClass(caseRow.priority)} /></td>
              <td className="py-3 pr-4"><Pill value={caseRow.status} /></td>
              <td className="py-3 pr-4 text-slate-500">{displayEmployeeName(caseRow.assignedTo)}</td>
              <td className="py-3 pr-4 text-right text-slate-500">Not provided</td>
              <td className="py-3 text-right text-slate-500">{formatDate(caseRow.first_response_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EscalationTable({
  escalations,
  employees,
  cases,
}: {
  escalations: CaseEscalation[];
  employees: CustomerOperationsEmployee[];
  cases: CustomerCaseRecord[];
}) {
  if (!escalations.length) return <StateMessage>No escalations found.</StateMessage>;
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const caseById = new Map(cases.map((caseRow) => [caseRow.id, caseRow]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[830px] text-left text-[10px]">
        <thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Case</th><th className="pb-2 font-bold">Level</th><th className="pb-2 font-bold">Reason</th><th className="pb-2 font-bold">Escalated by</th><th className="pb-2 font-bold">Escalated to</th><th className="pb-2 font-bold">Status</th><th className="pb-2 text-right font-bold">Date</th></tr></thead>
        <tbody>
          {escalations.slice(0, 40).map((escalation) => (
            <tr key={escalation.id} className="border-t border-slate-100 align-top">
              <td className="py-3 pr-4 font-semibold text-slate-700">{caseById.get(escalation.case_id)?.case_number || "Case unavailable"}</td>
              <td className="py-3 pr-4 text-slate-500">{escalation.escalation_level}</td>
              <td className="max-w-[240px] py-3 pr-4 text-slate-500">{escalation.reason}</td>
              <td className="py-3 pr-4 text-slate-500">{displayEmployeeName(employeeById.get(escalation.escalated_by_employee_id ?? ""))}</td>
              <td className="py-3 pr-4 text-slate-500">{displayEmployeeName(employeeById.get(escalation.escalated_to_employee_id ?? ""))}</td>
              <td className="py-3 pr-4"><Pill value={escalation.status} /></td>
              <td className="py-3 text-right text-slate-500">{formatDate(escalation.escalated_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InteractionFeed({
  interactions,
  employees,
  cases,
}: {
  interactions: CaseInteraction[];
  employees: CustomerOperationsEmployee[];
  cases: CustomerCaseRecord[];
}) {
  if (!interactions.length) return <StateMessage>No case interactions found.</StateMessage>;
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  const caseById = new Map(cases.map((caseRow) => [caseRow.id, caseRow]));
  return (
    <div className="space-y-2">
      {interactions.slice(0, 35).map((interaction) => (
        <div key={interaction.id} className="flex gap-3 border-b border-slate-100 py-3 last:border-0">
          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-[#f1edff] text-[#755bc0]"><MessageSquare size={14} /></span>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-700">{interaction.subject || interaction.interaction_type}</p>
            <p className="mt-1 text-[10px] text-slate-400">{caseById.get(interaction.case_id)?.case_number || "Case unavailable"} · {displayEmployeeName(employeeById.get(interaction.employee_id ?? ""))}</p>
            <p className="mt-1 text-[10px] text-slate-500">{interaction.interaction_type} · {interaction.direction || "Direction not provided"} · {interaction.customer_visible ? "Customer visible" : "Internal"}</p>
          </div>
          <p className="ml-auto shrink-0 text-right text-[10px] text-slate-400">{formatDate(interaction.interaction_at)}</p>
        </div>
      ))}
    </div>
  );
}

function TaskTable({ tasks, cases, employees }: { tasks: CaseTask[]; cases: CustomerCaseRecord[]; employees: CustomerOperationsEmployee[] }) {
  if (!tasks.length) return <StateMessage>No case tasks.</StateMessage>;
  const caseById = new Map(cases.map((caseRow) => [caseRow.id, caseRow]));
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-[10px]"><thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Task</th><th className="pb-2 font-bold">Case</th><th className="pb-2 font-bold">Assigned</th><th className="pb-2 font-bold">Priority</th><th className="pb-2 font-bold">Status</th><th className="pb-2 text-right font-bold">Due</th></tr></thead><tbody>{tasks.slice(0, 40).map((task) => <tr key={task.id} className="border-t border-slate-100"><td className="py-3 pr-4 font-semibold text-slate-700">{task.title}</td><td className="py-3 pr-4 text-slate-500">{caseById.get(task.case_id)?.case_number || "Unavailable"}</td><td className="py-3 pr-4 text-slate-500">{displayEmployeeName(employeeById.get(task.assigned_to_employee_id ?? ""))}</td><td className="py-3 pr-4"><Pill value={task.priority} className={priorityClass(task.priority)} /></td><td className="py-3 pr-4"><Pill value={task.status} /></td><td className="py-3 text-right text-slate-500">{formatDate(task.due_date)}</td></tr>)}</tbody></table>
    </div>
  );
}

function TicketTable({ tickets, cases, employees }: { tickets: CaseTicket[]; cases: CustomerCaseRecord[]; employees: CustomerOperationsEmployee[] }) {
  if (!tickets.length) return <StateMessage>No case tickets.</StateMessage>;
  const caseById = new Map(cases.map((caseRow) => [caseRow.id, caseRow]));
  const employeeById = new Map(employees.map((employee) => [employee.id, employee]));
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[650px] text-left text-[10px]"><thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Ticket</th><th className="pb-2 font-bold">Case</th><th className="pb-2 font-bold">Assigned</th><th className="pb-2 font-bold">Priority</th><th className="pb-2 font-bold">Status</th><th className="pb-2 text-right font-bold">Due</th></tr></thead><tbody>{tickets.slice(0, 40).map((ticket) => <tr key={ticket.id} className="border-t border-slate-100"><td className="py-3 pr-4 font-semibold text-slate-700">{ticket.title}</td><td className="py-3 pr-4 text-slate-500">{caseById.get(ticket.case_id)?.case_number || "Unavailable"}</td><td className="py-3 pr-4 text-slate-500">{displayEmployeeName(employeeById.get(ticket.assigned_to_employee_id ?? ""))}</td><td className="py-3 pr-4"><Pill value={ticket.priority} className={priorityClass(ticket.priority)} /></td><td className="py-3 pr-4"><Pill value={ticket.status} /></td><td className="py-3 text-right text-slate-500">{formatDate(ticket.due_at)}</td></tr>)}</tbody></table>
    </div>
  );
}

function WorkloadTable({ data }: { data: ReturnType<typeof buildCustomerOperationsWorkload> }) {
  if (!data.length) return <StateMessage>No assigned customer operations workload.</StateMessage>;
  return (
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Employee</th><th className="pb-2 text-right font-bold">Open cases</th><th className="pb-2 text-right font-bold">Open tasks</th><th className="pb-2 text-right font-bold">Open tickets</th><th className="pb-2 text-right font-bold">Open escalations</th></tr></thead><tbody>{data.map((row) => <tr key={row.employee.id} className="border-t border-slate-100"><td className="py-3 pr-4 font-semibold text-slate-700">{displayEmployeeName(row.employee)}</td><td className="py-3 pr-4 text-right text-slate-500">{row.openCases}</td><td className="py-3 pr-4 text-right text-slate-500">{row.openTasks}</td><td className="py-3 pr-4 text-right text-slate-500">{row.openTickets}</td><td className="py-3 text-right text-slate-500">{row.openEscalations}</td></tr>)}</tbody></table></div>
  );
}

function CategoryTable({ categories }: { categories: CustomerOperationsCategorySummary[] }) {
  if (!categories.length) return <StateMessage>No case categories found.</StateMessage>;
  return (
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-[10px]"><thead className="text-[9px] uppercase tracking-[0.12em] text-slate-400"><tr><th className="pb-2 font-bold">Category</th><th className="pb-2 font-bold">Code</th><th className="pb-2 font-bold">Active</th><th className="pb-2 text-right font-bold">Cases</th><th className="pb-2 text-right font-bold">Open</th><th className="pb-2 text-right font-bold">Response hours</th><th className="pb-2 text-right font-bold">Resolution hours</th></tr></thead><tbody>{categories.map((category) => <tr key={category.id} className="border-t border-slate-100"><td className="py-3 pr-4 font-semibold text-slate-700">{category.name}</td><td className="py-3 pr-4 text-slate-500">{category.code}</td><td className="py-3 pr-4"><Pill value={category.active ? "Active" : "Inactive"} /></td><td className="py-3 pr-4 text-right text-slate-500">{category.caseCount}</td><td className="py-3 pr-4 text-right text-slate-500">{category.openCaseCount}</td><td className="py-3 pr-4 text-right text-slate-500">{category.default_response_hours ?? "Unavailable"}</td><td className="py-3 text-right text-slate-500">{category.default_resolution_hours ?? "Unavailable"}</td></tr>)}</tbody></table></div>
  );
}

export default function CustomerOperations() {
  const dashboard = useCustomerOperationsDashboard();
  const data = dashboard.data;
  const metrics = buildCustomerOperationsMetrics(data);
  const workload = buildCustomerOperationsWorkload(data);
  const categories = buildCustomerOperationsCategorySummaries(data);

  return (
    <AppShell>
      <div className="mx-auto max-w-[1540px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#4a87c9]"><LifeBuoy size={13} /> Operations · Customer Operations</div>
            <h1 className="max-w-[1050px] font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">Customer cases, SLA and resolution ownership.</h1>
            <p className="mt-2 max-w-[900px] text-[13px] leading-6 text-slate-500">Live organisation-scoped cases, SLA state, escalations, interactions, child work items, feedback and operational capacity for the authenticated organisation.</p>
          </div>
          <div className="rounded-2xl border border-[#cfe0f5] bg-[#f8fbff] px-4 py-3 text-[10px] text-[#4a87c9]"><p className="font-bold uppercase tracking-[0.12em]">Read-only command centre</p><p className="mt-1">No case, task, ticket or escalation mutations are exposed.</p></div>
        </div>

        {dashboard.isPending && <div className="mt-5"><StateMessage>Loading live Customer Operations data...</StateMessage></div>}
        {dashboard.isError && <div className="mt-5"><StateMessage tone="error">Customer Operations data could not be loaded. Check the production connection and RLS visibility.</StateMessage></div>}

        {data && !dashboard.isError && <>
          {data.optionalErrors.length > 0 && <div className="mt-5"><StateMessage tone="warning">Some Customer Operations sections are unavailable because their production data path is inaccessible or contains malformed records: {data.optionalErrors.join(" ")}</StateMessage></div>}

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
            <MetricCard label="Open cases" value={String(metrics.openCases)} detail={`${metrics.totalCases} total cases`} icon={LifeBuoy} tone="blue" />
            <MetricCard label="New cases" value={formatCount(metrics.newCases)} detail="Stored status: new" icon={AlertTriangle} tone="amber" />
            <MetricCard label="In progress" value={formatCount(metrics.inProgressCases)} detail="Stored status: in progress" icon={Clock3} tone="purple" />
            <MetricCard label="Overdue cases" value={metrics.overdueCases === null ? "Unavailable" : String(metrics.overdueCases)} detail="Authoritative SLA view" icon={ShieldAlert} tone="red" />
            <MetricCard label="SLA breaches" value={metrics.responseBreaches === null || metrics.resolutionBreaches === null ? "Unavailable" : String(metrics.responseBreaches + metrics.resolutionBreaches)} detail="Response + resolution records" icon={Target} tone="red" />
            <MetricCard label="Open escalations" value={String(metrics.openEscalations)} detail="Unresolved escalation records" icon={AlertTriangle} tone="red" />
            <MetricCard label="Open work items" value={String(metrics.openTasks + metrics.openTickets)} detail={`${metrics.openTasks} tasks · ${metrics.openTickets} tickets`} icon={Layers3} tone="blue" />
            <MetricCard label="Satisfaction" value={formatScore(metrics.averageSatisfaction)} detail={`${metrics.feedbackRecords} feedback records`} icon={CheckCircle2} tone="mint" />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]">
            <Section title="Customer Operations work queue" description="Actionable cases are ordered by stored SLA condition, breach state and priority. No synthetic urgency threshold is applied." icon={LifeBuoy}><CaseQueue cases={data.cases} /></Section>
            <Section title="SLA command centre" description={data.slaSource === "summary-view" ? "SLA state comes from customer_case_sla_summary." : data.slaSource === "case-records" ? "The SLA view was unavailable; only stored case SLA fields are shown." : "No authoritative SLA data is available."} icon={Target}>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>Monitored cases</span><strong className="text-slate-700">{data.slaSource === "unavailable" ? "Unavailable" : data.cases.filter((caseRow) => caseRow.sla !== null).length}</strong></div>
                <div className="flex items-center justify-between rounded-xl bg-[#f7f9fb] p-3 text-[11px] text-slate-500"><span>SLA compliant</span><strong className="text-[#168465]">{metrics.compliantCases === null ? "Unavailable" : metrics.compliantCases}</strong></div>
                <div className="flex items-center justify-between rounded-xl bg-[#fff8f7] p-3 text-[11px] text-slate-500"><span>Response breaches</span><strong className="text-[#bd504d]">{metrics.responseBreaches === null ? "Unavailable" : metrics.responseBreaches}</strong></div>
                <div className="flex items-center justify-between rounded-xl bg-[#fff8f7] p-3 text-[11px] text-slate-500"><span>Resolution breaches</span><strong className="text-[#bd504d]">{metrics.resolutionBreaches === null ? "Unavailable" : metrics.resolutionBreaches}</strong></div>
                <div className="flex items-center justify-between rounded-xl bg-[#fffaf0] p-3 text-[11px] text-slate-500"><span>Average response</span><strong className="text-slate-700">{formatHours(metrics.averageResponseHours)}</strong></div>
              </div>
            </Section>
          </div>

          <div className="mt-5"><Section title="SLA case detail" description="Response, resolution, compliance and due state use stored customer_case_sla_summary values without frontend reinterpretation." icon={Target}><SlaTable cases={data.cases} /></Section></div>
          <div className="mt-5"><Section title="Case management" description="Customer cases are the denominator. Tasks, tickets, interactions and escalations are displayed as child operational records." icon={LifeBuoy}><CaseTable cases={data.cases} /></Section></div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Section title="Escalations" description="Unresolved escalation records are highlighted without changing their stored status." icon={ShieldAlert}><EscalationTable escalations={data.escalations} employees={data.employees} cases={data.cases} /></Section>
            <Section title="Case interactions" description="Only operational interaction metadata is shown; message bodies are intentionally withheld." icon={MessageSquare}><InteractionFeed interactions={data.interactions} employees={data.employees} cases={data.cases} /></Section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Section title="Case tasks" description="Overdue identification uses due_date, completed_at and stored status only." icon={CalendarClock}><TaskTable tasks={data.tasks} cases={data.cases} employees={data.employees} /></Section>
            <Section title="Case tickets" description="Case tickets remain child work items and are not counted as independent cases." icon={Ticket}><TicketTable tickets={data.tickets} cases={data.cases} employees={data.employees} /></Section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Section title="Employee workload" description="Capacity visibility only: assigned open cases, tasks, tickets and unresolved escalations." icon={UsersRound}><WorkloadTable data={workload} /></Section>
            <Section title="Category configuration and volume" description="Category defaults are configuration; case-level SLA results remain authoritative." icon={BarChart3}><CategoryTable categories={categories} /></Section>
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-2">
            <Section title="Customer feedback" description="Only fields verified in customer_feedback are used; no satisfaction score is invented from missing data." icon={CheckCircle2}>
              {metrics.feedbackRecords === 0 ? <StateMessage>No customer feedback records.</StateMessage> : <div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Records</p><p className="mt-1 font-display text-[22px] font-bold text-[#152239]">{metrics.feedbackRecords}</p></div><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Reviewed</p><p className="mt-1 font-display text-[22px] font-bold text-[#152239]">{metrics.reviewedFeedback}</p></div><div className="rounded-xl bg-[#f7f9fb] p-3"><p className="text-[10px] text-slate-400">Case scores</p><p className="mt-1 font-display text-[22px] font-bold text-[#152239]">{formatScore(metrics.averageSatisfaction)}</p></div></div>}
            </Section>
            <Section title="Customer Operations alerts" description="The verified alert view was not queryable without an explicit column contract; no duplicate frontend alert logic is created." icon={AlertTriangle}><StateMessage>Customer Operations alerts are unavailable until the existing production view columns are verified. No alert records are fabricated.</StateMessage></Section>
          </div>

          <div className="mt-5"><Section title="Data boundary" description="The module uses the existing browser Supabase client and authenticated organisation RLS." icon={Layers3}><div className="space-y-2 text-[11px] leading-5 text-slate-500"><p>All Customer Operations base-table reads include the authenticated organisation context and remain subject to database RLS.</p><p>The SLA summary view is authoritative whenever available. The undocumented summary, work-queue and alert views are not queried with guessed columns.</p><p>No cases, interactions, tasks, tickets, escalations or feedback records are created, updated, deleted or replaced with sample values.</p></div></Section></div>
        </>}
      </div>
    </AppShell>
  );
}
