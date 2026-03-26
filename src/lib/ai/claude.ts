import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const MODEL = "claude-opus-4-6";

interface AICallOptions {
  organizationId: string;
  feature: string;
  maxTokens?: number;
}

async function trackUsage(
  organizationId: string,
  feature: string,
  inputTokens: number,
  outputTokens: number
) {
  const costPer1kInput = 0.015;
  const costPer1kOutput = 0.075;
  const cost =
    (inputTokens / 1000) * costPer1kInput +
    (outputTokens / 1000) * costPer1kOutput;

  await db.aIUsage.create({
    data: { organizationId, feature, inputTokens, outputTokens, cost },
  });
}

// ─── Property Description Generator ─────────────────────────────────────────

export async function generatePropertyDescription(
  property: {
    name: string;
    type: string;
    category: string;
    city: string;
    county: string;
    bedrooms?: number;
    bathrooms?: number;
    size?: number;
    amenities?: string[];
    nearbyFacilities?: string[];
    rentAmount?: number;
  },
  opts: AICallOptions
): Promise<string> {
  const prompt = `You are a professional Kenyan real estate copywriter. Write a compelling, accurate property listing description for:

Property: ${property.name}
Type: ${property.category} (${property.type})
Location: ${property.city}, ${property.county}, Kenya
${property.bedrooms ? `Bedrooms: ${property.bedrooms}` : ""}
${property.bathrooms ? `Bathrooms: ${property.bathrooms}` : ""}
${property.size ? `Size: ${property.size} sq ft` : ""}
${property.amenities?.length ? `Amenities: ${property.amenities.join(", ")}` : ""}
${property.nearbyFacilities?.length ? `Nearby: ${property.nearbyFacilities.join(", ")}` : ""}
${property.rentAmount ? `Rent: KES ${property.rentAmount.toLocaleString()}/month` : ""}

Write a 150-200 word marketing description that:
1. Highlights key features and benefits
2. Appeals to the Kenyan rental market
3. Mentions proximity to key amenities (schools, hospitals, transport)
4. Uses professional, engaging language
5. Ends with a compelling call to action

Return only the description text, no headings or labels.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    opts.feature,
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  return (response.content[0] as { type: string; text: string }).text;
}

// ─── Tenant Screening Analysis ───────────────────────────────────────────────

export async function analyzeTenantApplication(
  application: {
    firstName: string;
    lastName: string;
    employer?: string;
    monthlyIncome?: number;
    nationalId?: string;
    message?: string;
  },
  unit: {
    rentAmount: number;
    depositAmount: number;
  },
  opts: AICallOptions
): Promise<{ score: number; analysis: string; recommendation: string }> {
  const affordabilityRatio = application.monthlyIncome
    ? (unit.rentAmount / application.monthlyIncome) * 100
    : null;

  const prompt = `You are an expert Kenyan property management consultant analyzing a tenant application. Provide a risk assessment.

TENANT APPLICATION:
Name: ${application.firstName} ${application.lastName}
Employer: ${application.employer || "Not provided"}
Monthly Income: ${application.monthlyIncome ? `KES ${application.monthlyIncome.toLocaleString()}` : "Not provided"}
National ID: ${application.nationalId ? "Provided" : "Not provided"}
Message: ${application.message || "None"}

UNIT DETAILS:
Monthly Rent: KES ${unit.rentAmount.toLocaleString()}
Security Deposit: KES ${unit.depositAmount.toLocaleString()}
${affordabilityRatio ? `Income-to-Rent Ratio: ${affordabilityRatio.toFixed(1)}% (ideal < 33%)` : ""}

Analyze this application and provide:
1. A risk score from 0-100 (100 = lowest risk, best tenant)
2. Key strengths and concerns
3. A clear recommendation (APPROVE / REVIEW / REJECT)

Respond in this exact JSON format:
{
  "score": <number>,
  "analysis": "<2-3 sentence analysis>",
  "recommendation": "APPROVE|REVIEW|REJECT",
  "reasons": ["<reason1>", "<reason2>"]
}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    "tenant_screening",
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return { score: 50, analysis: text, recommendation: "REVIEW" };
  }

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    score: parsed.score,
    analysis: parsed.analysis,
    recommendation: parsed.recommendation,
  };
}

// ─── Rental Price Intelligence ───────────────────────────────────────────────

export async function analyzePricingIntelligence(
  property: {
    type: string;
    category: string;
    city: string;
    county: string;
    bedrooms?: number;
    size?: number;
    amenities?: string[];
  },
  currentRent: number,
  opts: AICallOptions
): Promise<{
  suggestedMin: number;
  suggestedMax: number;
  marketPosition: string;
  insights: string[];
}> {
  const prompt = `You are a Kenyan real estate market analyst with deep knowledge of rental prices in Kenya (2024-2026).

PROPERTY:
Category: ${property.category}
Type: ${property.type}
Location: ${property.city}, ${property.county}
${property.bedrooms !== undefined ? `Bedrooms: ${property.bedrooms}` : ""}
${property.size ? `Size: ${property.size} sq ft` : ""}
Amenities: ${property.amenities?.join(", ") || "Standard"}
Current Rent: KES ${currentRent.toLocaleString()}/month

Based on current Kenya market data, provide:
1. Suggested rent range (min/max in KES)
2. Market position assessment
3. Key pricing insights for this location

Respond in JSON:
{
  "suggestedMin": <number>,
  "suggestedMax": <number>,
  "marketPosition": "below_market|at_market|above_market",
  "insights": ["<insight1>", "<insight2>", "<insight3>"]
}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 300,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    "pricing_intelligence",
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      suggestedMin: currentRent * 0.9,
      suggestedMax: currentRent * 1.1,
      marketPosition: "at_market",
      insights: ["Unable to retrieve market data at this time."],
    };
  }

  return JSON.parse(jsonMatch[0]);
}

// ─── Maintenance Priority Assessment ─────────────────────────────────────────

export async function assessMaintenancePriority(
  request: {
    title: string;
    description: string;
    category: string;
  },
  opts: AICallOptions
): Promise<{ priority: string; assessment: string; estimatedTimeframe: string }> {
  const prompt = `You are an expert property maintenance manager in Kenya. Assess this maintenance request.

REQUEST:
Title: ${request.title}
Category: ${request.category}
Description: ${request.description}

Determine:
1. Priority level: LOW, MEDIUM, HIGH, or URGENT
2. Brief assessment of the issue
3. Recommended response timeframe

Consider safety, habitability, and legal compliance with Kenya's Landlord & Tenant Act.

Respond in JSON:
{
  "priority": "LOW|MEDIUM|HIGH|URGENT",
  "assessment": "<2 sentence assessment>",
  "estimatedTimeframe": "<timeframe e.g. 'Within 24 hours', 'Within 1 week'>"
}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    "maintenance_assessment",
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      priority: "MEDIUM",
      assessment: request.description,
      estimatedTimeframe: "Within 1 week",
    };
  }

  return JSON.parse(jsonMatch[0]);
}

// ─── Smart Property Search ────────────────────────────────────────────────────

export async function parseNaturalLanguageSearch(
  query: string,
  opts: AICallOptions
): Promise<{
  city?: string;
  county?: string;
  category?: string;
  bedrooms?: number;
  maxRent?: number;
  minRent?: number;
  amenities?: string[];
}> {
  const prompt = `Parse this Kenya real estate search query into structured filters.

Query: "${query}"

Extract search parameters. Respond in JSON:
{
  "city": "<city or null>",
  "county": "<county or null>",
  "category": "<APARTMENT|HOUSE|BEDSITTER|STUDIO|OFFICE|etc or null>",
  "bedrooms": <number or null>,
  "maxRent": <number in KES or null>,
  "minRent": <number in KES or null>,
  "amenities": ["<amenity1>"] or []
}

Only include fields that are clearly mentioned. Use null for missing fields.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 150,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    "search_parse",
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  const text = (response.content[0] as { type: string; text: string }).text;
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return {};

  return JSON.parse(jsonMatch[0]);
}

// ─── Financial Summary Generation ─────────────────────────────────────────────

export async function generateFinancialInsights(
  data: {
    totalRevenue: number;
    totalExpenses: number;
    occupancyRate: number;
    overdueInvoices: number;
    totalProperties: number;
    month: string;
  },
  opts: AICallOptions
): Promise<string> {
  const prompt = `You are a Kenyan property investment financial advisor. Analyze this month's performance data and provide actionable insights.

MONTHLY DATA (${data.month}):
- Revenue Collected: KES ${data.totalRevenue.toLocaleString()}
- Total Expenses: KES ${data.totalExpenses.toLocaleString()}
- Net Income: KES ${(data.totalRevenue - data.totalExpenses).toLocaleString()}
- Occupancy Rate: ${data.occupancyRate}%
- Overdue Invoices: ${data.overdueInvoices}
- Total Properties: ${data.totalProperties}

Provide a 3-4 sentence executive summary with:
1. Performance assessment
2. Key areas of concern
3. One actionable recommendation

Keep it concise and professional for a Kenyan property manager.`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  await trackUsage(
    opts.organizationId,
    "financial_insights",
    response.usage.input_tokens,
    response.usage.output_tokens
  );

  return (response.content[0] as { type: string; text: string }).text;
}
