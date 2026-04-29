"use client";

import { BarChart3, TrendingUp, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, occupancyRate } from "@/lib/utils";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const revenueData = [
  { month: "Sep '25", revenue: 3_200_000, expenses: 980_000, net: 2_220_000 },
  { month: "Oct '25", revenue: 3_450_000, expenses: 1_100_000, net: 2_350_000 },
  { month: "Nov '25", revenue: 3_680_000, expenses: 1_050_000, net: 2_630_000 },
  { month: "Dec '25", revenue: 3_900_000, expenses: 1_280_000, net: 2_620_000 },
  { month: "Jan '26", revenue: 4_050_000, expenses: 1_150_000, net: 2_900_000 },
  { month: "Feb '26", revenue: 3_820_000, expenses: 1_090_000, net: 2_730_000 },
  { month: "Mar '26", revenue: 4_280_000, expenses: 1_240_000, net: 3_040_000 },
];

const occupancyData = [
  { month: "Sep '25", rate: 81 },
  { month: "Oct '25", rate: 83 },
  { month: "Nov '25", rate: 85 },
  { month: "Dec '25", rate: 82 },
  { month: "Jan '26", rate: 86 },
  { month: "Feb '26", rate: 88 },
  { month: "Mar '26", rate: 89 },
];

const categoryBreakdown = [
  { name: "Residential", value: 68, color: "#3b82f6" },
  { name: "Commercial", value: 22, color: "#10b981" },
  { name: "Industrial", value: 10, color: "#f59e0b" },
];

const propertyPerformance = [
  { property: "Park View Apts", revenue: 1_710_000, occupancy: 95, units: 40 },
  { property: "Lavington Court", revenue: 2_240_000, occupancy: 100, units: 16 },
  { property: "Kilimani Heights", revenue: 1_980_000, occupancy: 92, units: 24 },
  { property: "Garden Estate A", revenue: 870_000, occupancy: 81, units: 36 },
  { property: "Mombasa Office", revenue: 480_000, occupancy: 83, units: 12 },
  { property: "Nakuru Retail", revenue: 320_000, occupancy: 80, units: 20 },
];

const formatYAxis = (value: number) => {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return String(value);
};

export default function AnalyticsPage() {
  const totalRevenue = revenueData[revenueData.length - 1].revenue;
  const prevRevenue = revenueData[revenueData.length - 2].revenue;
  const revenueGrowth = ((totalRevenue - prevRevenue) / prevRevenue * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-sm text-muted-foreground">Portfolio performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4" />
            Last 7 Months
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue (Mar)", value: formatCurrency(4_280_000), change: `+${revenueGrowth}%`, positive: true },
          { label: "Net Operating Income", value: formatCurrency(3_040_000), change: "+11.4%", positive: true },
          { label: "Avg Occupancy Rate", value: "89%", change: "+1%", positive: true },
          { label: "Expense Ratio", value: "29%", change: "-2%", positive: true },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-bold mt-1">{kpi.value}</p>
              <p className={`text-xs mt-1 font-medium ${kpi.positive ? "text-green-600" : "text-red-600"}`}>
                {kpi.change} vs last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Revenue vs Expenses vs Net Income</CardTitle>
            <CardDescription>Monthly performance (KES)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={revenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{ fontSize: 12, borderRadius: 8 }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" name="Net Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Portfolio Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Portfolio Breakdown</CardTitle>
            <CardDescription>By property type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  dataKey="value"
                >
                  {categoryBreakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {categoryBreakdown.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-semibold">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Occupancy Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Occupancy Rate Trend</CardTitle>
          <CardDescription>Portfolio-wide monthly occupancy (%)</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip formatter={(v) => `${v}%`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Property Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Property Performance Comparison</CardTitle>
          <CardDescription>March 2026</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  {["Property", "Monthly Revenue", "Occupancy", "Units", "Revenue/Unit", "Performance"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {propertyPerformance
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((p, i) => {
                    const revenuePerUnit = Math.round(p.revenue / p.units);
                    return (
                      <tr key={p.property} className="border-b hover:bg-gray-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground w-4">#{i + 1}</span>
                            <span className="text-sm font-medium">{p.property}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold tabular-nums">{formatCurrency(p.revenue)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 w-16 rounded-full bg-gray-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${p.occupancy >= 90 ? "bg-green-500" : p.occupancy >= 80 ? "bg-blue-500" : "bg-yellow-500"}`}
                                style={{ width: `${p.occupancy}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">{p.occupancy}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm">{p.units}</td>
                        <td className="px-6 py-4 text-sm">{formatCurrency(revenuePerUnit)}</td>
                        <td className="px-6 py-4">
                          <TrendingUp className={`h-4 w-4 ${p.occupancy >= 90 ? "text-green-500" : "text-yellow-500"}`} />
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
