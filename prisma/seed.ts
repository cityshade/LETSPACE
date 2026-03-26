/**
 * LETSPACE - Database Seed Script
 * Creates demo data for development and demo purposes
 */

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("🌱 Seeding LETSPACE database...");

  // Create demo organization
  const org = await db.organization.upsert({
    where: { slug: "kamau-properties" },
    update: {},
    create: {
      name: "Kamau Properties Ltd",
      slug: "kamau-properties",
      email: "info@kamauproperties.co.ke",
      phone: "+254 720 000 000",
      address: "Upperhill, Nairobi",
      county: "Nairobi",
      city: "Nairobi",
      kraPin: "A001234567B",
      agencyLicense: "EARB/2024/001234",
      subscriptionPlan: "PROFESSIONAL",
      subscriptionStatus: "ACTIVE",
    },
  });

  // Create demo owner
  const passwordHash = await bcrypt.hash("letspace2026!", 12);
  const owner = await db.user.upsert({
    where: { email: "john@kamauproperties.co.ke" },
    update: {},
    create: {
      name: "John Kamau",
      email: "john@kamauproperties.co.ke",
      phone: "+254720000000",
      passwordHash,
      role: "USER",
    },
  });

  // Link owner to org
  await db.organizationUser.upsert({
    where: { organizationId_userId: { organizationId: org.id, userId: owner.id } },
    update: {},
    create: {
      organizationId: org.id,
      userId: owner.id,
      role: "OWNER",
      isActive: true,
      joinedAt: new Date(),
    },
  });

  // Create properties
  const property1 = await db.property.upsert({
    where: { organizationId_slug: { organizationId: org.id, slug: "park-view-apartments" } },
    update: {},
    create: {
      organizationId: org.id,
      name: "Park View Apartments",
      slug: "park-view-apartments",
      type: "RESIDENTIAL",
      category: "APARTMENT",
      address: "Westlands Road, Westlands",
      city: "Nairobi",
      county: "Nairobi",
      totalUnits: 40,
      isPublished: true,
      amenities: ["Swimming Pool", "Gym", "24/7 Security", "Parking", "Backup Power"],
      nearbyFacilities: ["Westgate Mall", "MP Shah Hospital", "Westlands CBD"],
      latitude: -1.2665,
      longitude: 36.8045,
    },
  });

  // Create sample units
  const unitData = [
    { unitNumber: "A01", type: "ONE_BEDROOM" as const, rentAmount: 35000, depositAmount: 70000, bedrooms: 1, bathrooms: 1, floor: 1 },
    { unitNumber: "A12", type: "TWO_BEDROOM" as const, rentAmount: 45000, depositAmount: 90000, bedrooms: 2, bathrooms: 2, floor: 1 },
    { unitNumber: "B04", type: "THREE_BEDROOM" as const, rentAmount: 85000, depositAmount: 170000, bedrooms: 3, bathrooms: 2, floor: 2 },
    { unitNumber: "C08", type: "ONE_BEDROOM" as const, rentAmount: 38000, depositAmount: 76000, bedrooms: 1, bathrooms: 1, floor: 3 },
    { unitNumber: "D15", type: "PENTHOUSE" as const, rentAmount: 120000, depositAmount: 240000, bedrooms: 4, bathrooms: 3, floor: 4 },
  ];

  const units = [];
  for (const unit of unitData) {
    const u = await db.unit.upsert({
      where: { propertyId_unitNumber: { propertyId: property1.id, unitNumber: unit.unitNumber } },
      update: {},
      create: {
        propertyId: property1.id,
        ...unit,
        status: unit.unitNumber === "A01" ? "VACANT" : "OCCUPIED",
        isPublished: true,
      },
    });
    units.push(u);
  }

  // Create sample tenants
  const tenantData = [
    { firstName: "Grace", lastName: "Wanjiku", phone: "0712345678", email: "grace@email.com", employer: "Equity Bank", monthlyIncome: 180000, creditScore: 82 },
    { firstName: "David", lastName: "Ochieng", phone: "0723456789", email: "david@email.com", employer: "Safaricom PLC", monthlyIncome: 350000, creditScore: 91 },
    { firstName: "Amina", lastName: "Hassan", phone: "0734567890", email: null, employer: "Self-Employed", monthlyIncome: 120000, creditScore: 68 },
    { firstName: "Peter", lastName: "Njoroge", phone: "0756789012", email: "peter@email.com", employer: "Kenya Airways", monthlyIncome: 550000, creditScore: 94 },
  ];

  const tenants = [];
  for (const tenant of tenantData) {
    const t = await db.tenant.upsert({
      where: {
        id: `seed-tenant-${tenant.firstName.toLowerCase()}`,
      },
      update: {},
      create: {
        id: `seed-tenant-${tenant.firstName.toLowerCase()}`,
        organizationId: org.id,
        ...tenant,
        riskLevel: tenant.creditScore >= 80 ? "LOW" : tenant.creditScore >= 60 ? "MEDIUM" : "HIGH",
        status: "ACTIVE",
      },
    });
    tenants.push(t);
  }

  console.log("✅ Seed complete!");
  console.log(`
  📧 Demo Login:
     Email: john@kamauproperties.co.ke
     Password: letspace2026!

  🏢 Organization: Kamau Properties Ltd (PROFESSIONAL plan)
  🏠 Properties created: 1 (Park View Apartments)
  👥 Tenants created: ${tenants.length}
  `);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
