import { Plus, Search, Filter, MapPin, Home, Users, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, occupancyRate } from "@/lib/utils";
import Link from "next/link";

const mockProperties = [
  {
    id: "1",
    name: "Park View Apartments",
    category: "APARTMENT",
    address: "Westlands Road",
    city: "Nairobi",
    county: "Nairobi",
    totalUnits: 40,
    occupiedUnits: 38,
    monthlyRevenue: 1_710_000,
    image: null,
    status: "ACTIVE",
    isFeatured: true,
  },
  {
    id: "2",
    name: "Kilimani Heights",
    category: "APARTMENT",
    address: "Argwings Kodhek Road",
    city: "Nairobi",
    county: "Nairobi",
    totalUnits: 24,
    occupiedUnits: 22,
    monthlyRevenue: 1_980_000,
    image: null,
    status: "ACTIVE",
    isFeatured: false,
  },
  {
    id: "3",
    name: "Garden Estate Block A",
    category: "HOUSE",
    address: "Thika Road",
    city: "Nairobi",
    county: "Nairobi",
    totalUnits: 36,
    occupiedUnits: 29,
    monthlyRevenue: 870_000,
    image: null,
    status: "ACTIVE",
    isFeatured: false,
  },
  {
    id: "4",
    name: "Mombasa Office Complex",
    category: "OFFICE",
    address: "Nyali Road",
    city: "Mombasa",
    county: "Mombasa",
    totalUnits: 12,
    occupiedUnits: 10,
    monthlyRevenue: 480_000,
    image: null,
    status: "ACTIVE",
    isFeatured: false,
  },
  {
    id: "5",
    name: "Lavington Court",
    category: "VILLA",
    address: "James Gichuru Road",
    city: "Nairobi",
    county: "Nairobi",
    totalUnits: 16,
    occupiedUnits: 16,
    monthlyRevenue: 2_240_000,
    image: null,
    status: "ACTIVE",
    isFeatured: true,
  },
  {
    id: "6",
    name: "Nakuru Retail Center",
    category: "RETAIL",
    address: "Kenyatta Avenue",
    city: "Nakuru",
    county: "Nakuru",
    totalUnits: 20,
    occupiedUnits: 16,
    monthlyRevenue: 320_000,
    image: null,
    status: "ACTIVE",
    isFeatured: false,
  },
];

const categoryColors: Record<string, string> = {
  APARTMENT: "info",
  HOUSE: "success",
  VILLA: "purple",
  OFFICE: "warning",
  RETAIL: "secondary",
  WAREHOUSE: "outline",
};

export default function PropertiesPage() {
  const totalRevenue = mockProperties.reduce((sum, p) => sum + p.monthlyRevenue, 0);
  const totalUnits = mockProperties.reduce((sum, p) => sum + p.totalUnits, 0);
  const totalOccupied = mockProperties.reduce((sum, p) => sum + p.occupiedUnits, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-sm text-muted-foreground">{mockProperties.length} properties in portfolio</p>
        </div>
        <Link href="/dashboard/properties/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add Property
          </Button>
        </Link>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Total Properties</p>
          <p className="text-2xl font-bold mt-1">{mockProperties.length}</p>
          <p className="text-xs text-muted-foreground">{totalUnits} units total</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Overall Occupancy</p>
          <p className="text-2xl font-bold mt-1">{occupancyRate(totalOccupied, totalUnits)}%</p>
          <p className="text-xs text-muted-foreground">{totalOccupied}/{totalUnits} occupied</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-muted-foreground">Monthly Revenue</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-muted-foreground">Across all properties</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Input
          placeholder="Search properties..."
          prefix={<Search className="h-3.5 w-3.5" />}
          className="max-w-xs"
        />
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <div className="flex gap-1">
          {["All", "Nairobi", "Mombasa", "Nakuru"].map((f) => (
            <Button key={f} variant={f === "All" ? "default" : "outline"} size="sm" className="text-xs">
              {f}
            </Button>
          ))}
        </div>
      </div>

      {/* Property Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockProperties.map((property) => {
          const occ = occupancyRate(property.occupiedUnits, property.totalUnits);
          return (
            <Link key={property.id} href={`/dashboard/properties/${property.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
                {/* Property Image Placeholder */}
                <div className="h-40 bg-gradient-to-br from-blue-100 to-indigo-200 relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Home className="h-12 w-12 text-blue-300" />
                  </div>
                  <div className="absolute top-3 left-3">
                    <Badge variant={categoryColors[property.category] as any} className="text-[10px]">
                      {property.category}
                    </Badge>
                  </div>
                  {property.isFeatured && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="default" className="text-[10px] bg-yellow-500 hover:bg-yellow-500">
                        ★ Featured
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3">
                    <div
                      className={`text-xs font-bold px-2 py-1 rounded-full ${
                        occ >= 90 ? "bg-green-500 text-white" : occ >= 75 ? "bg-blue-500 text-white" : "bg-yellow-500 text-white"
                      }`}
                    >
                      {occ}% occupied
                    </div>
                  </div>
                </div>

                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{property.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="text-xs truncate">{property.address}, {property.city}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Home className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{property.totalUnits}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Units</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{property.occupiedUnits}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Tenants</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-semibold">{formatCurrency(property.monthlyRevenue / 1000)}k</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                    </div>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${occ >= 90 ? "bg-green-500" : occ >= 75 ? "bg-blue-500" : "bg-yellow-500"}`}
                      style={{ width: `${occ}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}

        {/* Add Property Card */}
        <Link href="/dashboard/properties/new">
          <Card className="border-dashed border-2 hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer h-full min-h-[200px]">
            <CardContent className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Plus className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-700">Add New Property</p>
              <p className="text-xs text-muted-foreground">List a residential, commercial, or industrial property</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
