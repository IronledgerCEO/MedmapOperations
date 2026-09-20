import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  Boxes,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Cloud,
  FileCheck2,
  GitBranch,
  Layers3,
  ListChecks,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { AppShell } from "@/components/medmap/AppShell";
import {
  displayEmployeeName,
  displayWorkReference,
  groupValues,
  isOpenRecord,
  isPastDate,
  statusTone,
  useProductEngineeringDashboard,
  type Deployment,
  type EngineeringProject,
  type ProductFeedback,
  type ProductItem,
  type ProductRelease,
  type ProductRoadmap,
  type SecurityControl,
  type SecurityFinding,
  type SecurityIncident,
  type SecurityRemediation,
  type SecurityTest,
} from "@/lib/product-engineering-dashboard";
import { cn } from "@/lib/utils";

export type TechnologyFocus = "product" | "engineering" | "security";

type Tone = "healthy" | "attention" | "critical" | "neutral";

type Props = { focus: TechnologyFocus };

function formatDate(value: string | null) {
  if (!value) return "Not provided";
  const date = new Date(value.includes("T") ? value : `${value}T12:00:00`);
  return Number.isNaN(date.valueOf())
    ? value
    : new Intl.DateTimeFormat("en-ZA", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date);
}

function titleFor(focus: TechnologyFocus) {
  if (focus === "product") return "Product command centre";
  if (focus === "engineering") return "Engineering command centre";
  return "Security command centre";
}

function descriptionFor(focus: TechnologyFocus) {
  if (focus === "product") {
    return "Roadmaps, product delivery, releases and customer feedback from the authenticated organisation.";
  }
  if (focus === "engineering") {
    return "Engineering delivery, operational work and deployment activity with ownership visible.";
  }
  return "Security controls, tests, findings, incidents and remediation relationships from live records.";
}

function StatusPill({ value }: { value: string | null | undefined }) {
  const tone = statusTone(value);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold",
        tone === "healthy" && "bg-[#e4f8f0] text-[#15805f]",
        tone === "attention" && "bg-[#fff2d9] text-[#9a6419]",
        tone === "critical" && "bg-[#ffe5e3] text-[#bd504d]",
        tone === "neutral" && "bg-slate-100 text-slate-600",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          tone === "healthy" && "bg-[#25a879]",
          tone === "attention" && "bg-[#e0a03a]",
          tone === "critical" && "bg-[#da6560]",
          tone === "neutral" && "bg-slate-400",
        )}
      />
      {value || "Not provided"}
    </span>
  );
}

function StateMessage({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "error" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-3 text-[11px] leading-5",
        tone === "neutral" && "bg-[#f7f9fb] text-slate-500",
        tone === "warning" && "border border-[#f0dfb9] bg-[#fffaf0] text-[#9a6419]",
        tone === "error" && "border border-[#f0cdca] bg-[#fff8f7] text-[#a34f4b]",
      )}
    >
      {children}
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
  description?: string;
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
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[#eaf3ff] text-[#4a87c9]">
          <Icon size={16} />
        </span>
        <div>
          <h2 className="font-display text-[16px] font-bold tracking-[-0.03em] text-[#152239]">
            {title}
          </h2>
          {description && <p className="mt-1 text-[11px] leading-5 text-slate-400">{description}</p>}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: Tone;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_5px_20px_rgba(21,36,58,0.035)]">
      <div className="flex items-start justify-between">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-xl",
            tone === "healthy" && "bg-[#e8f8f2] text-[#1b9975]",
            tone === "attention" && "bg-[#fff3dd] text-[#b87720]",
            tone === "critical" && "bg-[#ffe9e6] text-[#bf5b56]",
            tone === "neutral" && "bg-[#eaf0f8] text-[#2f527a]",
          )}
        >
          <Icon size={17} />
        </span>
        <span
          className={cn(
            "size-1.5 rounded-full",
            tone === "healthy" && "bg-[#36ac87]",
            tone === "attention" && "bg-[#e0a03a]",
            tone === "critical" && "bg-[#da6560]",
            tone === "neutral" && "bg-[#4a87c9]",
          )}
        />
      </div>
      <p className="mt-4 text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-1 font-display text-[27px] font-bold tracking-[-0.05em] text-[#152239]">{value}</p>
      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="form-input mt-1 min-w-[145px] normal-case tracking-normal"
      >
        <option value="all">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function GroupList({ title, values }: { title: string; values: Record<string, number> }) {
  const entries = Object.entries(values).sort(([left], [right]) => left.localeCompare(right));
  return (
    <div className="rounded-xl bg-[#f7f9fb] p-3.5">
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">{title}</p>
      {entries.length ? (
        <div className="mt-3 space-y-2">
          {entries.map(([label, count]) => (
            <div key={label} className="flex items-center justify-between gap-3 text-[11px]">
              <span className="truncate text-slate-600">{label}</span>
              <span className="font-bold text-slate-800">{count}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-[11px] text-slate-400">No records available.</p>
      )}
    </div>
  );
}

function Owner({
  employees,
  employeeId,
}: {
  employees: ReturnType<typeof useProductEngineeringDashboard>["data"] extends infer T
    ? T extends { employees: infer E }
      ? E
      : never
    : never;
  employeeId: string | null;
}) {
  return <span>{displayEmployeeName(employees, employeeId)}</span>;
}

function LinkReference({
  label,
  value,
  to,
}: {
  label: string;
  value: string | null;
  to?: string;
}) {
  if (!value) return <span className="text-slate-400">{label}: —</span>;
  return (
    <span className="text-slate-500">
      {label}: {to ? <Link className="font-semibold text-[#4a87c9] hover:underline" to={to}>{value}</Link> : value}
    </span>
  );
}

function ProductOverview({
  roadmaps,
  items,
  releases,
  feedback,
}: {
  roadmaps: ProductRoadmap[];
  items: ProductItem[];
  releases: ProductRelease[];
  feedback: ProductFeedback[];
}) {
  const today = new Date();
  const activeRoadmaps = roadmaps.filter((roadmap) => isOpenRecord(roadmap.status));
  const upcomingReleases = releases.filter(
    (release) => release.release_date && new Date(release.release_date) >= today && isOpenRecord(release.status),
  );
  const reviewQueue = feedback.filter((row) => !row.reviewed_at);
  const overdueItems = items.filter((row) => isPastDate(row.target_date, row.status));
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Active roadmaps" value={activeRoadmaps.length} detail={`${roadmaps.length} roadmap records`} tone={activeRoadmaps.length ? "healthy" : "attention"} icon={Layers3} />
        <MetricCard label="Product items" value={items.length} detail="Live backlog records" icon={ListChecks} />
        <MetricCard label="Upcoming releases" value={upcomingReleases.length} detail={`${releases.length} release records`} tone={upcomingReleases.length ? "attention" : "neutral"} icon={Rocket} />
        <MetricCard label="Feedback to review" value={reviewQueue.length} detail={`${feedback.length} feedback records`} tone={reviewQueue.length ? "attention" : "healthy"} icon={CircleAlert} />
        <MetricCard label="Overdue items" value={overdueItems.length} detail="Based on target date and stored status" tone={overdueItems.length ? "critical" : "healthy"} icon={AlertTriangle} />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <GroupList title="Items by status" values={groupValues(items.map((item) => item.status))} />
        <GroupList title="Items by priority" values={groupValues(items.map((item) => item.priority))} />
      </div>
    </>
  );
}

function RoadmapTable({
  roadmaps,
  items,
  releases,
  employees,
}: {
  roadmaps: ProductRoadmap[];
  items: ProductItem[];
  releases: ProductRelease[];
  employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"];
}) {
  const releaseNames = new Map(releases.map((release) => [release.id, release.name]));
  return roadmaps.length ? (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-[11px]">
        <thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400">
          <tr><th className="pb-3 pr-4">Roadmap</th><th className="pb-3 pr-4">Owner</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Dates</th><th className="pb-3">Delivery</th></tr>
        </thead>
        <tbody>
          {roadmaps.map((roadmap) => {
            const roadmapItems = items.filter((item) => item.roadmap_id === roadmap.id);
            const targetReleases = [...new Set(roadmapItems.map((item) => item.target_release_id).filter((id): id is string => Boolean(id)))].map((id) => releaseNames.get(id) ?? id);
            return (
              <tr key={roadmap.id} className="border-b border-slate-100 align-top last:border-0">
                <td className="py-3 pr-4"><p className="font-bold text-slate-700">{roadmap.name}</p><p className="mt-1 max-w-[250px] text-slate-400">{roadmap.description || "No description provided."}</p></td>
                <td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={roadmap.owner_employee_id} /></td>
                <td className="py-3 pr-4"><StatusPill value={roadmap.status} /></td>
                <td className="py-3 pr-4 text-slate-500">{formatDate(roadmap.start_date)} → {formatDate(roadmap.target_date)}</td>
                <td className="py-3 text-slate-500"><strong className="text-slate-700">{roadmapItems.length}</strong> items{targetReleases.length ? <p className="mt-1 text-[10px]">{targetReleases.join(", ")}</p> : null}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  ) : <StateMessage>No product roadmaps are currently recorded.</StateMessage>;
}

function ProductItemsTable({
  items,
  roadmaps,
  releases,
  employees,
  tasks,
  tickets,
}: {
  items: ProductItem[];
  roadmaps: ProductRoadmap[];
  releases: ProductRelease[];
  employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"];
  tasks: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tasks"];
  tickets: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tickets"];
}) {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [itemType, setItemType] = useState("all");
  const [roadmapId, setRoadmapId] = useState("all");
  const [ownerId, setOwnerId] = useState("all");
  const filtered = items.filter((item) =>
    (status === "all" || item.status === status) &&
    (priority === "all" || item.priority === priority) &&
    (itemType === "all" || item.item_type === itemType) &&
    (roadmapId === "all" || item.roadmap_id === roadmapId) &&
    (ownerId === "all" || item.owner_employee_id === ownerId),
  );
  const roadmapNames = new Map(roadmaps.map((roadmap) => [roadmap.id, roadmap.name]));
  const releaseNames = new Map(releases.map((release) => [release.id, release.name]));
  return (
    <>
      <div className="mb-4 flex flex-wrap gap-3">
        <FilterSelect label="Status" value={status} options={[...new Set(items.map((item) => item.status))]} onChange={setStatus} />
        <FilterSelect label="Priority" value={priority} options={[...new Set(items.map((item) => item.priority))]} onChange={setPriority} />
        <FilterSelect label="Type" value={itemType} options={[...new Set(items.map((item) => item.item_type))]} onChange={setItemType} />
        <FilterSelect label="Roadmap" value={roadmapId} options={roadmaps.map((roadmap) => roadmap.id)} onChange={setRoadmapId} />
        <FilterSelect label="Owner" value={ownerId} options={employees.map((employee) => employee.id)} onChange={setOwnerId} />
      </div>
      {filtered.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-[11px]">
            <thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Item</th><th className="pb-3 pr-4">Type / priority</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Owner</th><th className="pb-3 pr-4">Roadmap / release</th><th className="pb-3 pr-4">Target</th><th className="pb-3">Operational links</th></tr></thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className="py-3 pr-4"><p className="font-bold text-slate-700">{item.title}</p><p className="mt-1 max-w-[230px] text-slate-400">{item.description || item.business_value || "No description provided."}</p></td>
                  <td className="py-3 pr-4 text-slate-500">{item.item_type}<br /><span className="text-slate-400">{item.priority}</span></td>
                  <td className="py-3 pr-4"><StatusPill value={item.status} /></td>
                  <td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={item.owner_employee_id} /></td>
                  <td className="py-3 pr-4 text-slate-500">{item.roadmap_id ? roadmapNames.get(item.roadmap_id) ?? item.roadmap_id : "No roadmap"}<br />{item.target_release_id ? releaseNames.get(item.target_release_id) ?? item.target_release_id : "No release"}</td>
                  <td className="py-3 pr-4 text-slate-500">{formatDate(item.target_date)}{isPastDate(item.target_date, item.status) && <span className="mt-1 block font-bold text-[#bd504d]">Overdue</span>}</td>
                  <td className="py-3 text-[10px]"><p><LinkReference label="Task" value={displayWorkReference(tasks, item.linked_task_id)} to="/operations" /></p><p className="mt-1"><LinkReference label="Ticket" value={displayWorkReference(tickets, item.linked_ticket_id)} to="/operations" /></p></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <StateMessage>No product items match the selected filters.</StateMessage>}
    </>
  );
}

function FeedbackTable({ feedback, items, employees }: { feedback: ProductFeedback[]; items: ProductItem[]; employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"] }) {
  const itemNames = new Map(items.map((item) => [item.id, item.title]));
  return feedback.length ? (
    <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Feedback</th><th className="pb-3 pr-4">Source</th><th className="pb-3 pr-4">Priority / status</th><th className="pb-3 pr-4">Product item</th><th className="pb-3">Review</th></tr></thead><tbody>{feedback.map((row) => <tr key={row.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4"><p className="font-bold text-slate-700">{row.title || "Feedback record"}</p><p className="mt-1 max-w-[320px] text-slate-400">{row.feedback}</p></td><td className="py-3 pr-4 text-slate-500">{row.source_type}<br />{row.source_reference || "No reference"}</td><td className="py-3 pr-4"><StatusPill value={row.priority} /><span className="mt-1 block"><StatusPill value={row.status} /></span></td><td className="py-3 pr-4 text-slate-500">{row.product_item_id ? itemNames.get(row.product_item_id) ?? row.product_item_id : "No product item"}</td><td className="py-3 text-slate-500">{row.reviewed_at ? <>{formatDate(row.reviewed_at)}<br /><Owner employees={employees} employeeId={row.reviewed_by} /></> : <span className="font-bold text-[#9a6419]">Not reviewed</span>}</td></tr>)}</tbody></table></div>
  ) : <StateMessage>No product feedback is currently recorded.</StateMessage>;
}

function ReleaseTable({ releases, items, deployments, employees }: { releases: ProductRelease[]; items: ProductItem[]; deployments: Deployment[]; employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"] }) {
  return releases.length ? <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Release</th><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Release date</th><th className="pb-3 pr-4">Owner</th><th className="pb-3">Relationships</th></tr></thead><tbody>{releases.map((release) => { const releaseItems = items.filter((item) => item.target_release_id === release.id); const releaseDeployments = deployments.filter((deployment) => deployment.product_release_id === release.id); return <tr key={release.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4"><p className="font-bold text-slate-700">{release.name}{release.version ? ` · ${release.version}` : ""}</p><p className="mt-1 max-w-[280px] text-slate-400">{release.description || release.release_notes || "No release detail provided."}</p></td><td className="py-3 pr-4"><StatusPill value={release.status} /></td><td className="py-3 pr-4 text-slate-500">{formatDate(release.release_date)}{isPastDate(release.release_date, release.status) && <span className="mt-1 block font-bold text-[#bd504d]">Past date</span>}</td><td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={release.owner_employee_id} /></td><td className="py-3 text-slate-500">{releaseItems.length} product item{releaseItems.length === 1 ? "" : "s"}<br />{releaseDeployments.length} deployment{releaseDeployments.length === 1 ? "" : "s"}</td></tr>; })}</tbody></table></div> : <StateMessage>No product releases are currently recorded.</StateMessage>;
}

function EngineeringOverview({ projects, deployments }: { projects: EngineeringProject[]; deployments: Deployment[] }) {
  const active = projects.filter((project) => isOpenRecord(project.status));
  const overdue = projects.filter((project) => isPastDate(project.target_date, project.status));
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label="Engineering projects" value={projects.length} detail="Live project records" icon={Boxes} /><MetricCard label="Active projects" value={active.length} detail="Stored status is unresolved" tone={active.length ? "attention" : "healthy"} icon={Activity} /><MetricCard label="Overdue targets" value={overdue.length} detail="Based on target date and status" tone={overdue.length ? "critical" : "healthy"} icon={CalendarDays} /><MetricCard label="Deployments" value={deployments.length} detail="Live deployment records" icon={Rocket} /><MetricCard label="Recent deployment activity" value={deployments.filter((deployment) => deployment.deployment_started_at).length} detail="Records with a start timestamp" tone="neutral" icon={Cloud} /></div>;
}

function ProjectTable({ projects, items, employees, tasks, tickets }: { projects: EngineeringProject[]; items: ProductItem[]; employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"]; tasks: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tasks"]; tickets: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tickets"] }) {
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [projectType, setProjectType] = useState("all");
  const [ownerId, setOwnerId] = useState("all");
  const filtered = projects.filter((project) => (status === "all" || project.status === status) && (priority === "all" || project.priority === priority) && (projectType === "all" || project.project_type === projectType) && (ownerId === "all" || project.owner_employee_id === ownerId));
  const itemNames = new Map(items.map((item) => [item.id, item.title]));
  return <><div className="mb-4 flex flex-wrap gap-3"><FilterSelect label="Status" value={status} options={[...new Set(projects.map((project) => project.status))]} onChange={setStatus} /><FilterSelect label="Priority" value={priority} options={[...new Set(projects.map((project) => project.priority))]} onChange={setPriority} /><FilterSelect label="Type" value={projectType} options={[...new Set(projects.map((project) => project.project_type))]} onChange={setProjectType} /><FilterSelect label="Owner" value={ownerId} options={employees.map((employee) => employee.id)} onChange={setOwnerId} /></div>{filtered.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Project</th><th className="pb-3 pr-4">Status / priority</th><th className="pb-3 pr-4">Owner</th><th className="pb-3 pr-4">Product item</th><th className="pb-3 pr-4">Dates</th><th className="pb-3">Operational links</th></tr></thead><tbody>{filtered.map((project) => <tr key={project.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4"><p className="font-bold text-slate-700">{project.name}</p><p className="mt-1 max-w-[240px] text-slate-400">{project.description || project.project_type}</p></td><td className="py-3 pr-4"><StatusPill value={project.status} /><span className="mt-1 block text-slate-400">{project.priority}</span></td><td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={project.owner_employee_id} /></td><td className="py-3 pr-4 text-slate-500">{project.product_item_id ? itemNames.get(project.product_item_id) ?? project.product_item_id : "No product item"}</td><td className="py-3 pr-4 text-slate-500">{formatDate(project.start_date)} → {formatDate(project.target_date)}{project.completed_at && <span className="mt-1 block">Completed {formatDate(project.completed_at)}</span>}{isPastDate(project.target_date, project.status) && <span className="mt-1 block font-bold text-[#bd504d]">Overdue</span>}</td><td className="py-3 text-[10px]"><p><LinkReference label="Task" value={displayWorkReference(tasks, project.linked_task_id)} to="/operations" /></p><p className="mt-1"><LinkReference label="Ticket" value={displayWorkReference(tickets, project.linked_ticket_id)} to="/operations" /></p></td></tr>)}</tbody></table></div> : <StateMessage>No engineering projects match the selected filters.</StateMessage>}</>;
}

function DeploymentTable({ deployments, projects, releases, employees }: { deployments: Deployment[]; projects: EngineeringProject[]; releases: ProductRelease[]; employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"] }) {
  const projectNames = new Map(projects.map((project) => [project.id, project.name]));
  const releaseNames = new Map(releases.map((release) => [release.id, release.name]));
  return deployments.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1120px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Status</th><th className="pb-3 pr-4">Version / commit</th><th className="pb-3 pr-4">Environment</th><th className="pb-3 pr-4">Project / release</th><th className="pb-3 pr-4">Deployed by</th><th className="pb-3">Timing / rollback</th></tr></thead><tbody>{deployments.map((deployment) => <tr key={deployment.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4"><StatusPill value={deployment.deployment_status} /></td><td className="py-3 pr-4 text-slate-500">{deployment.version || "Version not provided"}<br />{deployment.commit_reference || "Commit not provided"}</td><td className="py-3 pr-4 text-slate-500">{deployment.environment_id ? `Environment ref ${deployment.environment_id}` : "Environment not provided"}</td><td className="py-3 pr-4 text-slate-500">{deployment.engineering_project_id ? projectNames.get(deployment.engineering_project_id) ?? deployment.engineering_project_id : "No project"}<br />{deployment.product_release_id ? releaseNames.get(deployment.product_release_id) ?? deployment.product_release_id : "No release"}</td><td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={deployment.deployed_by} /></td><td className="py-3 text-slate-500">{formatDate(deployment.deployment_started_at)} → {formatDate(deployment.deployment_completed_at)}{deployment.rollback_reason && <p className="mt-1 font-bold text-[#bd504d]">Rollback: {deployment.rollback_reason}</p>}{deployment.notes && <p className="mt-1 text-slate-400">{deployment.notes}</p>}</td></tr>)}</tbody></table></div> : <StateMessage>No deployments are currently recorded.</StateMessage>;
}

function SecurityOverview({ controls, tests, findings, incidents, remediations }: { controls: SecurityControl[]; tests: SecurityTest[]; findings: SecurityFinding[]; incidents: SecurityIncident[]; remediations: SecurityRemediation[] }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><MetricCard label="Security controls" value={controls.length} detail="Live control records" icon={ShieldCheck} /><MetricCard label="Security tests" value={tests.length} detail="Relationship fields verified" icon={FileCheck2} /><MetricCard label="Findings" value={findings.length} detail="Live finding records" tone={findings.length ? "attention" : "healthy"} icon={AlertTriangle} /><MetricCard label="Incidents" value={incidents.length} detail="Live incident records" tone={incidents.length ? "critical" : "healthy"} icon={CircleAlert} /><MetricCard label="Remediations" value={remediations.length} detail="Finding-linked records" icon={CheckCircle2} /></div>;
}

function SecurityControlsTable({ controls, employees }: { controls: SecurityControl[]; employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"] }) {
  return controls.length ? <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Control</th><th className="pb-3 pr-4">Type / status</th><th className="pb-3 pr-4">Owner</th><th className="pb-3 pr-4">Review cadence</th><th className="pb-3">Evidence / notes</th></tr></thead><tbody>{controls.map((control) => <tr key={control.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4"><p className="font-bold text-slate-700">{control.control_code ? `${control.control_code} · ` : ""}{control.name}</p><p className="mt-1 max-w-[280px] text-slate-400">{control.description || "No description provided."}</p></td><td className="py-3 pr-4"><StatusPill value={control.status} /><span className="mt-1 block text-slate-400">{control.control_type}</span></td><td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={control.owner_employee_id} /></td><td className="py-3 pr-4 text-slate-500">{control.review_frequency || "Not provided"}<br />Last {formatDate(control.last_reviewed_at)}<br />Next {formatDate(control.next_review_at)}{isPastDate(control.next_review_at, control.status) && <span className="mt-1 block font-bold text-[#bd504d]">Review overdue</span>}</td><td className="py-3 text-slate-500">{control.evidence_reference || "No evidence reference"}{control.notes && <p className="mt-1 text-slate-400">{control.notes}</p>}</td></tr>)}</tbody></table></div> : <StateMessage>No security controls are currently recorded.</StateMessage>;
}

function RelationshipTable({
  title,
  rows,
  employees,
  tests,
  findings,
  tasks,
  tickets,
}: {
  title: string;
  rows: SecurityTest[] | SecurityFinding[] | SecurityIncident[] | SecurityRemediation[];
  employees: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["employees"];
  tests: SecurityTest[];
  findings: SecurityFinding[];
  tasks: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tasks"];
  tickets: NonNullable<ReturnType<typeof useProductEngineeringDashboard>["data"]>["tickets"];
}) {
  const findingById = new Map(findings.map((finding) => [finding.id, finding]));
  return rows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[920px] text-left text-[11px]"><thead className="border-b border-slate-100 text-[10px] uppercase tracking-[0.1em] text-slate-400"><tr><th className="pb-3 pr-4">Record</th><th className="pb-3 pr-4">Ownership</th><th className="pb-3 pr-4">Security relationship</th><th className="pb-3">Operational work</th></tr></thead><tbody>{rows.map((row) => { const remediation = "finding_id" in row ? row : null; const testId = "security_test_id" in row ? row.security_test_id : null; const findingId = remediation?.finding_id ?? null; return <tr key={row.id} className="border-b border-slate-100 align-top last:border-0"><td className="py-3 pr-4 font-bold text-slate-700">{title} · {row.id}</td><td className="py-3 pr-4 text-slate-500"><Owner employees={employees} employeeId={row.owner_employee_id} />{"verified_by" in row && row.verified_by && <span className="mt-1 block">Verified by <Owner employees={employees} employeeId={row.verified_by} /></span>}</td><td className="py-3 pr-4 text-slate-500">{testId ? `Test ${testId}` : findingId ? <>{findingById.get(findingId) ? `Finding ${findingId}` : `Finding ${findingId}`}</> : "No linked security record"}{testId && tests.some((test) => test.id === testId) ? " · linked" : ""}</td><td className="py-3 text-[10px]"><p><LinkReference label="Task" value={displayWorkReference(tasks, row.linked_task_id)} to="/operations" /></p><p className="mt-1"><LinkReference label="Ticket" value={displayWorkReference(tickets, row.linked_ticket_id)} to="/operations" /></p></td></tr>; })}</tbody></table></div> : <StateMessage>No {title.toLowerCase()} are currently recorded.</StateMessage>;
}

function QueryState({
  dashboard,
  children,
}: {
  dashboard: ReturnType<typeof useProductEngineeringDashboard>;
  children: React.ReactNode;
}) {
  if (dashboard.isPending) return <StateMessage>Loading live Product, Engineering and Security data...</StateMessage>;
  if (dashboard.isError) return <StateMessage tone="error">The command centre could not load its live data. Check the connection and try again.</StateMessage>;
  return <>{children}</>;
}

export default function TechnologyCommandCentre({ focus }: Props) {
  const dashboard = useProductEngineeringDashboard();
  const data = dashboard.data;
  const pageTitle = titleFor(focus);
  return (
    <AppShell>
      <div className="mx-auto max-w-[1540px] px-5 pb-12 pt-8 sm:px-8 xl:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.17em] text-[#4a87c9]"><GitBranch size={13} /> Technology · Product, Engineering & Security</div>
            <h1 className="font-display text-[32px] font-bold tracking-[-0.06em] text-[#152239] sm:text-[39px]">{pageTitle}</h1>
            <p className="mt-2 max-w-[850px] text-[13px] leading-6 text-slate-500">{descriptionFor(focus)}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px] font-bold">
            <Link to="/product" className={cn("rounded-xl border px-3.5 py-2.5", focus === "product" ? "border-[#84cbb8] bg-[#e8f8f2] text-[#176c56]" : "border-slate-200 bg-white text-slate-500")}>Product</Link>
            <Link to="/engineering" className={cn("rounded-xl border px-3.5 py-2.5", focus === "engineering" ? "border-[#84cbb8] bg-[#e8f8f2] text-[#176c56]" : "border-slate-200 bg-white text-slate-500")}>Engineering</Link>
            <Link to="/security" className={cn("rounded-xl border px-3.5 py-2.5", focus === "security" ? "border-[#84cbb8] bg-[#e8f8f2] text-[#176c56]" : "border-slate-200 bg-white text-slate-500")}>Security</Link>
          </div>
        </div>

        <div className="mt-7">
          <QueryState dashboard={dashboard}>
            {data && (
              <>
                {data.optionalErrors.length > 0 && <div className="mb-5"><StateMessage tone="warning">Some live sections are unavailable: {data.optionalErrors.join(" ")}</StateMessage></div>}
                {focus === "product" && <ProductOverview roadmaps={data.roadmaps} items={data.items} releases={data.releases} feedback={data.feedback} />}
                {focus === "engineering" && <EngineeringOverview projects={data.projects} deployments={data.deployments} />}
                {focus === "security" && <SecurityOverview controls={data.controls} tests={data.securityTests} findings={data.findings} incidents={data.incidents} remediations={data.remediations} />}

                {focus === "product" && <>
                  <div className="mt-5"><Section title="Product roadmaps" description="Roadmap ownership, status, dates, associated items and target releases." icon={Layers3}><RoadmapTable roadmaps={data.roadmaps} items={data.items} releases={data.releases} employees={data.employees} /></Section></div>
                  <div className="mt-5"><Section title="Product backlog and delivery" description="Filterable product items with live ownership and operational links." icon={ListChecks}><ProductItemsTable items={data.items} roadmaps={data.roadmaps} releases={data.releases} employees={data.employees} tasks={data.tasks} tickets={data.tickets} /></Section></div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-2"><Section title="Product releases" description="Release dates, ownership, associated items and deployment count." icon={Rocket}><ReleaseTable releases={data.releases} items={data.items} deployments={data.deployments} employees={data.employees} /></Section><Section title="Feedback queue" description="Stored feedback with source, priority, status and review evidence." icon={CircleAlert}><FeedbackTable feedback={data.feedback} items={data.items} employees={data.employees} /></Section></div>
                </>}

                {focus === "engineering" && <>
                  <div className="mt-5"><Section title="Engineering projects" description="Project status, priority, ownership, product relationships and operational work." icon={Boxes}><ProjectTable projects={data.projects} items={data.items} employees={data.employees} tasks={data.tasks} tickets={data.tickets} /></Section></div>
                  <div className="mt-5"><Section title="Deployment tracking" description="Deployment records use the stored environment relationship reference; environment fields are not inferred." icon={Rocket}><DeploymentTable deployments={data.deployments} projects={data.projects} releases={data.releases} employees={data.employees} /></Section></div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-2"><GroupList title="Projects by status" values={groupValues(data.projects.map((project) => project.status))} /><GroupList title="Projects by priority" values={groupValues(data.projects.map((project) => project.priority))} /></div>
                </>}

                {focus === "security" && <>
                  <div className="mt-5"><Section title="Security controls" description="Control status, ownership, review cadence and evidence references." icon={ShieldCheck}><SecurityControlsTable controls={data.controls} employees={data.employees} /></Section></div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-2"><Section title="Security tests" description="Verified security-test relationship fields and operational work." icon={FileCheck2}><RelationshipTable title="Security test" rows={data.securityTests} employees={data.employees} tests={data.securityTests} findings={data.findings} tasks={data.tasks} tickets={data.tickets} /></Section><Section title="Security findings" description="Findings connected to tests and operational work where IDs are present." icon={AlertTriangle}><RelationshipTable title="Security finding" rows={data.findings} employees={data.employees} tests={data.securityTests} findings={data.findings} tasks={data.tasks} tickets={data.tickets} /></Section></div>
                  <div className="mt-5 grid gap-5 xl:grid-cols-2"><Section title="Security incidents" description="Incident ownership and linked operational work." icon={CircleAlert}><RelationshipTable title="Security incident" rows={data.incidents} employees={data.employees} tests={data.securityTests} findings={data.findings} tasks={data.tasks} tickets={data.tickets} /></Section><Section title="Security remediations" description="Finding, ownership, verification and operational work relationships." icon={CheckCircle2}><RelationshipTable title="Security remediation" rows={data.remediations} employees={data.employees} tests={data.securityTests} findings={data.findings} tasks={data.tasks} tickets={data.tickets} /></Section></div>
                </>}
              </>
            )}
          </QueryState>
        </div>

        <div className="mt-8 flex flex-col justify-between gap-2 border-t border-slate-200/70 pt-5 text-[10px] text-slate-400 sm:flex-row"><span>MedMap Operating System · Supabase-backed technology command centre</span><span>Live data → Evidence → Status → Action</span></div>
      </div>
    </AppShell>
  );
}
