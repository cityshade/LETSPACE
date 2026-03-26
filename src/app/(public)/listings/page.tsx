import { Search, MapPin, Home, Filter, SlidersHorizontal, Star, Bed, Bath, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Properties in Kenya | LETSPACE",
  description: "Search verified rental properties across Nairobi, Mombasa, Kisumu and all Kenya counties. Apartments, houses, offices and more.",
};

const listings = [
  {
    id: "1", title: "Luxury 3-Bed Apartment - Westlands", category: "APARTMENT", city: "Nairobi", county: "Nairobi",
    area: "Westlands", beds: 3, baths: 2, size: 1800, rent: 95000, deposit: 190000,
    amenities: ["Pool", "Gym", "Parking", "Security", "Backup Power"],
    images: [], isFeatured: true, isVerified: true, rating: 4.8,
    description: "Modern 3-bedroom apartment in prime Westlands location with spectacular city views.",
  },
  {
    id: "2", title: "Affordable 1-Bed - Kasarani", category: "APARTMENT", city: "Nairobi", county: "Nairobi",
    area: "Kasarani", beds: 1, baths: 1, size: 650, rent: 25000, deposit: 50000,
    amenities: ["Parking", "Water 24/7", "Security"],
    images: [], isFeatured: false, isVerified: true, rating: 4.2,
    description: "Cozy 1-bedroom apartment near Kasarani Stadium and Thika Superhighway.",
  },
  {
    id: "3", title: "Executive Villa - Karen", category: "VILLA", city: "Nairobi", county: "Nairobi",
    area: "Karen", beds: 5, baths: 4, size: 5000, rent: 350000, deposit: 700000,
    amenities: ["Garden", "Pool", "Gym", "2 Parking", "DSQ", "Smart Home"],
    images: [], isFeatured: true, isVerified: true, rating: 4.9,
    description: "Magnificent 5-bedroom villa in Karen's serene environment with lush tropical garden.",
  },
  {
    id: "4", title: "Studio Apartment - Kilimani", category: "STUDIO", city: "Nairobi", county: "Nairobi",
    area: "Kilimani", beds: 0, baths: 1, size: 400, rent: 30000, deposit: 60000,
    amenities: ["Gym", "Rooftop", "WiFi Ready", "Security"],
    images: [], isFeatured: false, isVerified: true, rating: 4.5,
    description: "Modern studio perfect for young professionals in the heart of Kilimani.",
  },
  {
    id: "5", title: "Office Space - CBD Nairobi", category: "OFFICE", city: "Nairobi", county: "Nairobi",
    area: "Nairobi CBD", beds: 0, baths: 2, size: 2500, rent: 250000, deposit: 500000,
    amenities: ["24/7 Security", "Lift", "Parking", "Generator", "Conference Room"],
    images: [], isFeatured: false, isVerified: true, rating: 4.3,
    description: "Prime office space in a Grade-A building in Nairobi CBD, ideal for corporate tenants.",
  },
  {
    id: "6", title: "Bedsitter - Ruaka", category: "BEDSITTER", city: "Nairobi", county: "Nairobi",
    area: "Ruaka", beds: 0, baths: 1, size: 280, rent: 12000, deposit: 24000,
    amenities: ["Water", "Security", "DSTV Ready"],
    images: [], isFeatured: false, isVerified: false, rating: 3.9,
    description: "Budget-friendly bedsitter near Limuru Road, close to Ruaka town center.",
  },
];

const categoryIcons: Record<string, string> = {
  APARTMENT: "🏢", VILLA: "🏡", STUDIO: "🏠", OFFICE: "🏛️", BEDSITTER: "🛏️", HOUSE: "🏘️",
};

export default function ListingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">LET<span className="text-blue-600">SPACE</span></span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">List Property</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Search Hero */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-800 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Find Your Perfect Space in Kenya
          </h1>
          <p className="text-blue-100 mb-8">
            Verified properties across Nairobi, Mombasa, Kisumu and beyond
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-2 flex flex-col sm:flex-row gap-2 shadow-2xl">
            <div className="flex-1 flex items-center gap-2 px-3">
              <Search className="h-4 w-4 text-gray-400 shrink-0" />
              <input
                placeholder="Search by location, property type..."
                className="flex-1 text-sm outline-none placeholder:text-gray-400"
              />
            </div>
            <select className="text-sm border-l px-4 py-2 outline-none text-gray-700 bg-transparent">
              <option>All Types</option>
              <option>Apartment</option>
              <option>House/Villa</option>
              <option>Office</option>
              <option>Studio/Bedsitter</option>
            </select>
            <select className="text-sm border-l px-4 py-2 outline-none text-gray-700 bg-transparent">
              <option>Any Budget</option>
              <option>Under KES 20k</option>
              <option>KES 20k - 50k</option>
              <option>KES 50k - 100k</option>
              <option>KES 100k - 200k</option>
              <option>KES 200k+</option>
            </select>
            <Button className="shrink-0 px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Popular Areas */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {["Westlands", "Kilimani", "Karen", "Lavington", "Kasarani", "Lang'ata", "Mombasa", "Kisumu"].map((area) => (
              <button key={area} className="text-xs text-blue-100 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors">
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <Card>
              <CardContent className="p-4 space-y-5">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="font-semibold text-sm">Filters</span>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">PROPERTY TYPE</p>
                  <div className="space-y-1.5">
                    {["Apartment", "House/Villa", "Studio", "Bedsitter", "Office", "Retail"].map((type) => (
                      <label key={type} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">BEDROOMS</p>
                  <div className="grid grid-cols-5 gap-1">
                    {["Any", "0", "1", "2", "3+"].map((n) => (
                      <button key={n} className={`text-xs py-1 rounded border text-center ${n === "Any" ? "bg-blue-600 text-white border-blue-600" : "hover:border-blue-400"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">MONTHLY RENT</p>
                  <div className="space-y-2">
                    <Input placeholder="Min (KES)" type="number" className="h-8 text-xs" />
                    <Input placeholder="Max (KES)" type="number" className="h-8 text-xs" />
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">AMENITIES</p>
                  <div className="space-y-1.5">
                    {["Parking", "Pool", "Gym", "Security", "Backup Power", "Water 24/7", "Pet Friendly"].map((a) => (
                      <label key={a} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" className="rounded" />
                        {a}
                      </label>
                    ))}
                  </div>
                </div>

                <Button variant="outline" className="w-full text-xs" size="sm">Clear Filters</Button>
              </CardContent>
            </Card>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-gray-900">{listings.length}</span> properties found
              </p>
              <select className="text-sm border rounded-lg px-3 py-1.5 outline-none">
                <option>Sort: Featured</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Newest First</option>
                <option>Highest Rated</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {listings.map((listing) => (
                <Link key={listing.id} href={`/listings/${listing.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 cursor-pointer h-full">
                    {/* Image */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-200 relative">
                      <div className="absolute inset-0 flex items-center justify-center text-4xl">
                        {categoryIcons[listing.category] || "🏠"}
                      </div>
                      <div className="absolute top-3 left-3 flex gap-1.5">
                        {listing.isFeatured && (
                          <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white text-[10px]">★ Featured</Badge>
                        )}
                        {listing.isVerified && (
                          <Badge className="bg-green-600 hover:bg-green-600 text-white text-[10px]">✓ Verified</Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-black/70 text-white rounded-full px-3 py-1 text-xs font-bold">
                        {formatCurrency(listing.rent)}/mo
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{listing.title}</h3>
                        <div className="flex items-center gap-0.5 shrink-0">
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                          <span className="text-xs font-medium">{listing.rating}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span className="text-xs">{listing.area}, {listing.city}</span>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                        {listing.beds > 0 && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-3 w-3" />
                            <span>{listing.beds} bed{listing.beds !== 1 ? "s" : ""}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Bath className="h-3 w-3" />
                          <span>{listing.baths} bath{listing.baths !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize className="h-3 w-3" />
                          <span>{listing.size.toLocaleString()} sqft</span>
                        </div>
                      </div>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1 mt-3">
                        {listing.amenities.slice(0, 3).map((a) => (
                          <span key={a} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">{a}</span>
                        ))}
                        {listing.amenities.length > 3 && (
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">+{listing.amenities.length - 3}</span>
                        )}
                      </div>

                      <div className="mt-3 pt-3 border-t flex items-center justify-between">
                        <div>
                          <p className="text-xs text-muted-foreground">Deposit</p>
                          <p className="text-xs font-semibold">{formatCurrency(listing.deposit)}</p>
                        </div>
                        <Button size="sm" className="h-8 text-xs">Inquire Now</Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
