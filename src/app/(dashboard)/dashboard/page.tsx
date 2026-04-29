import {
  Building2, Users, CreditCard, AlertCircle, TrendingUp,
  Wrench, Megaphone, Home, CheckCircle2, Clock, Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";

// Mock data - replace with real DB queries in production
const stats = {
  totalProperties: 12,
  totalUnits: 148,
  occupiedUnits: 131,
  vacantUnits: 17,
  occupancyRate: 89,
  totalTenants: 131,
  monthlyRevenue: 4_280_000,
  pendingRent: 642_000,
  overdueInvoices: 8,
  openMaintenanceRequests: 14,
  newLeadsThisMonth: 23,
  collectionRate: 87,
};

const recentPayments = [
  { id: 1, tenant: "Grace Wanjiku", unit: "A12 - Park View Apts", amount: 45000, method: "MPESA", ref: "RGH7Y3K9", date: new Date("2026-03-25") },
  { id: 2, tenant: "David Ochieng", unit: "B04 - Westlands Towers", amount: 85000, method: "BANK", ref: "KCB-289341", date: new Date("2026-03-24") },
  { id: 3, tenant: "Amina Hassan", unit: "C08 - Garden Estate", amount: 32000, method: "MPESA", ref: "QWT5R2M1", date: new Date("2026-03-24") },
  { id: 4, tenant: "Peter Njoroge", unit: "D15 - Kilimani Heights", amount: 120000, method: "MPESA", ref: "PLK9H4F7", date: new Date("2026-03-23") },
  { id: 5, tenant: "Sarah Kamau", unit: "E02 - Lavington Court", amount: 65000, method: "BANK", ref: "EQT-112893", date: new Date("2026-03-22") },
];

const overdueInvoices = [
  { id: 1, tenant: "James Mwangi", unit: "F07 - Kasarani View", amount: 28000, daysOverdue: 15 },
  { id: 2, tenant: "Lucy Achieng", unit: "G12 - South C Block", amount: 18000, daysOverdue: 8 },
  { id: 3, tenant: "Mohamed Ali", unit: "H03 - Eastleigh Complex", amount: 22000, daysOverdue: 22 },
];

const maintenanceTickets = [
  { id: 1, title: "Broken water pipe", unit: "A08", priority: "HIGH", status: "IN_PROGRESS", reported: "2 days ago" },
  { id: 2, title: "Faulty electrical wiring", unit: "C15", priority: "URGENT", status: "ASSIGNED", reported: "1 day ago" },
  { id: 3, title: "Roof leak repair", unit: "D02", priority: "HIGH", status: "OPEN", reported: "3 days ago" },
  { id: 4, title: "Painting - interior", unit: "B06", priority: "LOW", status: "OPEN", reported: "5 days ago" },
];

const priorityColors: Record<string, string> = {
  LOW: "info",
  MEDIUM: "warning",
  HIGH: "destructive",
  URGENT: "destructive",
};

const statusColors: Record<string, string> = {
  OPEN: "warning",
  ASSIGNED: "info",
  IN_PROGRESS: "info",
  COMPLETED: "success",
};

export default function DashboardPage() {
  const netIncome = stats.monthlyRevenue - 1_240_000; // mock expenses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good morning, John</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {formatDate(new Date())} · Here&apos;s your portfolio overview
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/properties/new">
            <Button size="sm" className="hidden sm:flex">
              <Home className="h-4 w-4" />
              Add Property
            </Button>
          </Link>
          <Link href="/dashboard/ai">
            <Button variant="outline" size="sm">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">AI Insights</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Insight Banner */}
      <div className="rounded-xl border border-soil-200 bg-soil-50 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-soil-100 p-2 shrink-0">
            <Sparkles className="h-4 w-4 text-soil-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm text-soil-900">AI Insight</p>
            <p className="text-xs text-soil-700 mt-0.5">
              Occupancy up 4% this month. 3 leases expire in 30 days — start renewal conversations now.
              Overdue collections of KES {formatCurrency(stats.pendingRent)} require attention.
            </p>
          </div>
          <Link href="/dashboard/ai" className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs">Ask AI</Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Revenue"
          value={stats.monthlyRevenue}
          isCurrency
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBg="bg-green-50"
          trend={12}
          description="March 2026"
        />
        <StatCard
          title="Occupancy Rate"
          value={stats.occupancyRate}
          suffix="%"
          icon={Building2}
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
          trend={4}
          description={`${stats.occupiedUnits}/${stats.totalUnits} units`}
        />
        <StatCard
          title="Active Tenants"
          value={stats.totalTenants}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
          description={`Across ${stats.totalProperties} properties`}
        />
        <StatCard
          title="Overdue Rent"
          value={stats.pendingRent}
          isCurrency
          icon={AlertCircle}
          iconColor="text-red-600"
          iconBg="bg-red-50"
          description={`${stats.overdueInvoices} invoices overdue`}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Net Income"
          value={netIncome}
          isCurrency
          icon={CreditCard}
          iconColor="text-emerald-600"
          iconBg="bg-emerald-50"
          description="After expenses"
        />
        <StatCard
          title="Collection Rate"
          value={stats.collectionRate}
          suffix="%"
          icon={CheckCircle2}
          iconColor="text-teal-600"
          iconBg="bg-teal-50"
          description="This month"
        />
        <StatCard
          title="Maintenance"
          value={stats.openMaintenanceRequests}
          suffix=" open"
          icon={Wrench}
          iconColor="text-orange-600"
          iconBg="bg-orange-50"
          description="Tickets this week"
        />
        <StatCard
          title="New Leads"
          value={stats.newLeadsThisMonth}
          icon={Megaphone}
          iconColor="text-pink-600"
          iconBg="bg-pink-50"
          trend={35}
          description="This month"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent Payments */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Recent Payments</CardTitle>
              <CardDescription>Last 7 days</CardDescription>
            </div>
            <Link href="/dashboard/financials/payments">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{payment.tenant}</p>
                  <p className="text-xs text-muted-foreground truncate">{payment.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <Badge
                      variant={payment.method === "MPESA" ? "success" : "info"}
                      className="text-[10px] px-1.5 py-0"
                    >
                      {payment.method}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      {formatRelativeDate(payment.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Overdue Invoices */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Overdue Invoices</CardTitle>
              <CardDescription>Requires immediate action</CardDescription>
            </div>
            <Link href="/dashboard/financials/invoices?status=OVERDUE">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueInvoices.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Clock className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{inv.tenant}</p>
                  <p className="text-xs text-muted-foreground truncate">{inv.unit}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold text-red-700">{formatCurrency(inv.amount)}</p>
                  <p className="text-[10px] text-red-500">{inv.daysOverdue} days overdue</p>
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full text-xs">
              Send Reminders via SMS & Email
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance Tickets */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Maintenance Requests</CardTitle>
              <CardDescription>{stats.openMaintenanceRequests} open tickets</CardDescription>
            </div>
            <Link href="/dashboard/maintenance">
              <Button variant="ghost" size="sm" className="text-xs">View All</Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {maintenanceTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-3 py-2 border-b last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{ticket.title}</p>
                  <p className="text-xs text-muted-foreground">Unit {ticket.unit} · {ticket.reported}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <Badge variant={priorityColors[ticket.priority] as any} className="text-[10px]">
                    {ticket.priority}
                  </Badge>
                  <Badge variant={statusColors[ticket.status] as any} className="text-[10px]">
                    {ticket.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Occupancy by Property */}
        <Card>
          <CardHeader className="flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base">Occupancy by Property</CardTitle>
              <CardDescription>Current month snapshot</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "Park View Apartments", city: "Westlands", units: 40, occupied: 38 },
              { name: "Kilimani Heights", city: "Kilimani", units: 24, occupied: 22 },
              { name: "Garden Estate Block A", city: "Kasarani", units: 36, occupied: 29 },
              { name: "Lavington Court", city: "Lavington", units: 16, occupied: 16 },
              { name: "Eastleigh Complex", city: "Eastleigh", units: 32, occupied: 26 },
            ].map((p) => {
              const rate = Math.round((p.occupied / p.units) * 100);
              return (
                <div key={p.name} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold">{rate}%</span>
                      <p className="text-xs text-muted-foreground">{p.occupied}/{p.units}</p>
                    </div>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        rate >= 90 ? "bg-green-500" : rate >= 75 ? "bg-blue-500" : "bg-yellow-500"
                      }`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
