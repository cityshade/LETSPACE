import { Plus, Search, Wrench, AlertTriangle, Clock, CheckCircle2, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

const mockTickets = [
  { id: "MNT-837291", title: "Burst water pipe in kitchen", property: "Park View Apartments", unit: "A08", tenant: "Grace Wanjiku", category: "PLUMBING", priority: "URGENT", status: "IN_PROGRESS", assignedTo: "Plumber Kenya Ltd", estimatedCost: 15000, reportedAt: new Date("2026-03-24") },
  { id: "MNT-837292", title: "Faulty electrical wiring", property: "Kilimani Heights", unit: "C15", tenant: "Peter Njoroge", category: "ELECTRICAL", priority: "HIGH", status: "ASSIGNED", assignedTo: "TechSpark Electricals", estimatedCost: 25000, reportedAt: new Date("2026-03-25") },
  { id: "MNT-837293", title: "Roof leaking during rain", property: "Garden Estate Block A", unit: "D02", tenant: "Amina Hassan", category: "STRUCTURAL", priority: "HIGH", status: "OPEN", assignedTo: null, estimatedCost: null, reportedAt: new Date("2026-03-23") },
  { id: "MNT-837294", title: "Broken main entrance door lock", property: "Park View Apartments", unit: "Common", tenant: null, category: "SECURITY", priority: "URGENT", status: "COMPLETED", assignedTo: "SecureKeys Ltd", estimatedCost: 8000, reportedAt: new Date("2026-03-20") },
  { id: "MNT-837295", title: "Interior painting - Unit B06", property: "Westlands Towers", unit: "B06", tenant: "Sarah Kamau", category: "PAINTING", priority: "LOW", status: "OPEN", assignedTo: null, estimatedCost: null, reportedAt: new Date("2026-03-22") },
  { id: "MNT-837296", title: "Blocked drainage system", property: "Lavington Court", unit: "E10", tenant: "David Ochieng", category: "PLUMBING", priority: "MEDIUM", status: "ASSIGNED", assignedTo: "QuickFix Plumbing", estimatedCost: 12000, reportedAt: new Date("2026-03-21") },
  { id: "MNT-837297", title: "Broken window pane", property: "Garden Estate Block A", unit: "D09", tenant: "Lucy Achieng", category: "STRUCTURAL", priority: "MEDIUM", status: "OPEN", assignedTo: null, estimatedCost: null, reportedAt: new Date("2026-03-19") },
];

const priorityConfig: Record<string, { variant: string; label: string }> = {
  LOW: { variant: "info", label: "Low" },
  MEDIUM: { variant: "warning", label: "Medium" },
  HIGH: { variant: "destructive", label: "High" },
  URGENT: { variant: "destructive", label: "Urgent" },
};

const statusConfig: Record<string, { variant: string; icon: typeof Wrench }> = {
  OPEN: { variant: "warning", icon: AlertTriangle },
  ASSIGNED: { variant: "info", icon: Clock },
  IN_PROGRESS: { variant: "info", icon: Wrench },
  COMPLETED: { variant: "success", icon: CheckCircle2 },
  CANCELLED: { variant: "secondary", icon: Clock },
};

const categoryColors: Record<string, string> = {
  PLUMBING: "text-blue-600 bg-blue-50",
  ELECTRICAL: "text-yellow-600 bg-yellow-50",
  STRUCTURAL: "text-orange-600 bg-orange-50",
  SECURITY: "text-red-600 bg-red-50",
  PAINTING: "text-purple-600 bg-purple-50",
  HVAC: "text-teal-600 bg-teal-50",
  CLEANING: "text-green-600 bg-green-50",
  OTHER: "text-gray-600 bg-gray-50",
};

export default function MaintenancePage() {
  const open = mockTickets.filter(t => t.status === "OPEN").length;
  const urgent = mockTickets.filter(t => t.priority === "URGENT" && t.status !== "COMPLETED").length;
  const inProgress = mockTickets.filter(t => t.status === "IN_PROGRESS").length;
  const completed = mockTickets.filter(t => t.status === "COMPLETED").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-sm text-muted-foreground">{mockTickets.length} total tickets</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/maintenance/vendors">
            <Button variant="outline" size="sm">Vendors</Button>
          </Link>
          <Link href="/dashboard/maintenance/new">
            <Button size="sm"><Plus className="h-4 w-4" />New Request</Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Open", value: open, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
          { label: "In Progress", value: inProgress, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "Urgent", value: urgent, color: "text-red-700", bg: "bg-red-50 border-red-200" },
          { label: "Completed (30d)", value: completed, color: "text-green-700", bg: "bg-green-50 border-green-200" },
        ].map((s) => (
          <Card key={s.label} className={`border ${s.bg}`}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <Input placeholder="Search tickets..." prefix={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filter</Button>
        {["All", "OPEN", "IN PROGRESS", "URGENT", "COMPLETED"].map((f) => (
          <Button key={f} variant={f === "All" ? "default" : "outline"} size="sm" className="text-xs">{f}</Button>
        ))}
      </div>

      {/* Ticket List */}
      <div className="space-y-3">
        {mockTickets.map((ticket) => {
          const statusCfg = statusConfig[ticket.status];
          const StatusIcon = statusCfg.icon;
          const catStyle = categoryColors[ticket.category] || categoryColors.OTHER;

          return (
            <Card key={ticket.id} className={`hover:shadow-sm transition-all ${ticket.priority === "URGENT" ? "border-red-200" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`rounded-lg p-2.5 shrink-0 ${catStyle}`}>
                    <Wrench className="h-4 w-4" />
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/maintenance/${ticket.id}`} className="font-semibold text-gray-900 hover:text-blue-600">
                            {ticket.title}
                          </Link>
                          <Badge variant={priorityConfig[ticket.priority].variant as any} className="text-[10px]">
                            {priorityConfig[ticket.priority].label}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {ticket.property} · Unit {ticket.unit}
                          {ticket.tenant && ` · ${ticket.tenant}`}
                        </p>
                      </div>
                      <Badge variant={statusCfg.variant as any} className="text-[10px] flex items-center gap-1 shrink-0">
                        <StatusIcon className="h-3 w-3" />
                        {ticket.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Reported {formatRelativeDate(ticket.reportedAt)}
                      </span>
                      {ticket.assignedTo && (
                        <span>Assigned to: <span className="font-medium text-gray-700">{ticket.assignedTo}</span></span>
                      )}
                      {ticket.estimatedCost && (
                        <span>Est. cost: <span className="font-medium text-gray-700">KES {ticket.estimatedCost.toLocaleString()}</span></span>
                      )}
                      <span className="font-mono text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">{ticket.id}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1 shrink-0">
                    {ticket.status === "OPEN" && (
                      <Button size="sm" variant="outline" className="h-8 text-xs">Assign</Button>
                    )}
                    {ticket.status === "IN_PROGRESS" && (
                      <Button size="sm" variant="success" className="h-8 text-xs">Mark Done</Button>
                    )}
                    <Link href={`/dashboard/maintenance/${ticket.id}`}>
                      <Button size="sm" variant="ghost" className="h-8 text-xs">View</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
