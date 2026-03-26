import { Plus, Search, Filter, Phone, Mail, Shield, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import Link from "next/link";

const mockTenants = [
  {
    id: "1", firstName: "Grace", lastName: "Wanjiku", email: "grace.wanjiku@email.com",
    phone: "0712345678", unit: "A12 - Park View Apts", leaseEnd: new Date("2026-12-31"),
    rentAmount: 45000, status: "ACTIVE", riskLevel: "LOW", monthlyIncome: 180000,
    creditScore: 82,
  },
  {
    id: "2", firstName: "David", lastName: "Ochieng", email: "david.ochieng@email.com",
    phone: "0723456789", unit: "B04 - Westlands Towers", leaseEnd: new Date("2026-08-31"),
    rentAmount: 85000, status: "ACTIVE", riskLevel: "LOW", monthlyIncome: 350000,
    creditScore: 91,
  },
  {
    id: "3", firstName: "Amina", lastName: "Hassan", email: null,
    phone: "0734567890", unit: "C08 - Garden Estate", leaseEnd: new Date("2026-06-30"),
    rentAmount: 32000, status: "ACTIVE", riskLevel: "MEDIUM", monthlyIncome: 120000,
    creditScore: 68,
  },
  {
    id: "4", firstName: "James", lastName: "Mwangi", email: "james.m@email.com",
    phone: "0745678901", unit: "F07 - Kasarani View", leaseEnd: new Date("2026-04-30"),
    rentAmount: 28000, status: "ACTIVE", riskLevel: "HIGH", monthlyIncome: 95000,
    creditScore: 45,
  },
  {
    id: "5", firstName: "Sarah", lastName: "Kamau", email: "skamau@email.com",
    phone: "0756789012", unit: "E02 - Lavington Court", leaseEnd: new Date("2027-01-31"),
    rentAmount: 65000, status: "ACTIVE", riskLevel: "LOW", monthlyIncome: 280000,
    creditScore: 87,
  },
  {
    id: "6", firstName: "Peter", lastName: "Njoroge", email: "p.njoroge@email.com",
    phone: "0767890123", unit: "D15 - Kilimani Heights", leaseEnd: new Date("2026-09-30"),
    rentAmount: 120000, status: "ACTIVE", riskLevel: "LOW", monthlyIncome: 550000,
    creditScore: 94,
  },
];

const riskColors: Record<string, string> = {
  LOW: "success",
  MEDIUM: "warning",
  HIGH: "destructive",
};

const riskIcons: Record<string, typeof Shield> = {
  LOW: Shield,
  MEDIUM: AlertTriangle,
  HIGH: AlertTriangle,
};

export default function TenantsPage() {
  const expiringLeases = mockTenants.filter((t) => {
    const daysLeft = Math.ceil((t.leaseEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 60;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tenants</h1>
          <p className="text-sm text-muted-foreground">{mockTenants.length} active tenants</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/tenants/applications">
            <Button variant="outline" size="sm">Applications</Button>
          </Link>
          <Link href="/dashboard/tenants/new">
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Add Tenant
            </Button>
          </Link>
        </div>
      </div>

      {/* Expiring Leases Alert */}
      {expiringLeases.length > 0 && (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <p className="text-sm font-medium text-yellow-800">
              {expiringLeases.length} lease(s) expiring within 60 days
            </p>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            {expiringLeases.map((t) => `${t.firstName} ${t.lastName}`).join(", ")} — initiate renewal conversations.
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active Tenants", value: mockTenants.filter(t => t.status === "ACTIVE").length },
          { label: "Low Risk", value: mockTenants.filter(t => t.riskLevel === "LOW").length },
          { label: "Avg Credit Score", value: Math.round(mockTenants.reduce((s, t) => s + t.creditScore, 0) / mockTenants.length) },
          { label: "Total Rent Roll", value: formatCurrency(mockTenants.reduce((s, t) => s + t.rentAmount, 0)) },
        ].map((stat) => (
          <Card key={stat.label} className="border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-xl font-bold mt-1">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input placeholder="Search tenants..." prefix={<Search className="h-3.5 w-3.5" />} className="max-w-xs" />
        <Button variant="outline" size="sm"><Filter className="h-4 w-4" />Filter</Button>
        {["All", "LOW Risk", "MEDIUM Risk", "HIGH Risk", "Expiring Soon"].map((f) => (
          <Button key={f} variant={f === "All" ? "default" : "outline"} size="sm" className="text-xs">{f}</Button>
        ))}
      </div>

      {/* Tenant Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Tenants</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">Tenant</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Unit</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Rent</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Lease End</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Credit Score</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Risk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockTenants.map((tenant) => {
                  const RiskIcon = riskIcons[tenant.riskLevel];
                  const daysLeft = Math.ceil((tenant.leaseEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={tenant.id} className="border-b hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm shrink-0">
                            {getInitials(`${tenant.firstName} ${tenant.lastName}`)}
                          </div>
                          <div>
                            <Link
                              href={`/dashboard/tenants/${tenant.id}`}
                              className="font-medium text-gray-900 hover:text-blue-600 text-sm"
                            >
                              {tenant.firstName} {tenant.lastName}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              {tenant.phone && (
                                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                  <Phone className="h-2.5 w-2.5" />{tenant.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-gray-700">{tenant.unit}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold">{formatCurrency(tenant.rentAmount)}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm">{formatDate(tenant.leaseEnd)}</p>
                        {daysLeft <= 60 && (
                          <p className="text-[10px] text-yellow-600">{daysLeft} days left</p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                tenant.creditScore >= 80 ? "bg-green-500" : tenant.creditScore >= 60 ? "bg-yellow-500" : "bg-red-500"
                              }`}
                              style={{ width: `${tenant.creditScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{tenant.creditScore}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={riskColors[tenant.riskLevel] as any} className="text-[10px] flex items-center gap-1 w-fit">
                          <RiskIcon className="h-2.5 w-2.5" />
                          {tenant.riskLevel}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          <Link href={`/dashboard/tenants/${tenant.id}`}>
                            <Button variant="ghost" size="icon-sm" className="h-7 w-7">
                              <Mail className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Link href={`/dashboard/financials/invoices/new?tenantId=${tenant.id}`}>
                            <Button variant="outline" size="sm" className="h-7 text-xs">Invoice</Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
