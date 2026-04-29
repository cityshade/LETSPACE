import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getJobs, startJob, finishJob } from "@/lib/cron-store";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ─── Mock data (demo mode) ─────────────────────────────────────────────────────

const PORTFOLIO = {
  properties: 12, units: 148, occupied: 131, vacant: 17,
  occupancyRate: 88.5, monthlyRevenue: 4_280_000,
  overdueInvoices: 8, overdueAmount: 642_000,
  openMaintenance: 14, urgentMaintenance: 2,
  collectionRate: 87, newLeads: 23,
  pendingDisbursements: 3_295_600,
};

const TENANTS = [
  { id: "T001", name: "Grace Wanjiku",    unit: "A12", property: "Park View Apartments",    rent: 45000,  daysOverdue: 22, riskLevel: "HIGH",   balance: 45000  },
  { id: "T002", name: "David Ochieng",    unit: "B04", property: "Westlands Towers",         rent: 85000,  daysOverdue: 0,  riskLevel: "LOW",    balance: 0      },
  { id: "T003", name: "Amina Hassan",     unit: "C08", property: "Garden Estate Block A",    rent: 32000,  daysOverdue: 8,  riskLevel: "MEDIUM", balance: 32000  },
  { id: "T004", name: "Peter Njoroge",    unit: "D15", property: "Kilimani Heights",         rent: 120000, daysOverdue: 0,  riskLevel: "LOW",    balance: 0      },
  { id: "T005", name: "Sarah Kamau",      unit: "E02", property: "Lavington Court",          rent: 65000,  daysOverdue: 0,  riskLevel: "LOW",    balance: 0      },
  { id: "T006", name: "James Mwangi",     unit: "F07", property: "Kasarani View",            rent: 28000,  daysOverdue: 15, riskLevel: "HIGH",   balance: 56000  },
  { id: "T007", name: "Lucy Achieng",     unit: "G12", property: "South C Block",            rent: 18000,  daysOverdue: 8,  riskLevel: "MEDIUM", balance: 18000  },
  { id: "T008", name: "Mohamed Ali",      unit: "H03", property: "Eastleigh Complex",        rent: 22000,  daysOverdue: 22, riskLevel: "HIGH",   balance: 44000  },
  { id: "T009", name: "Esther Mutua",     unit: "A03", property: "Park View Apartments",    rent: 45000,  daysOverdue: 0,  riskLevel: "LOW",    balance: 0      },
  { id: "T010", name: "Brian Otieno",     unit: "B11", property: "Westlands Towers",         rent: 75000,  daysOverdue: 3,  riskLevel: "LOW",    balance: 75000  },
];

const MAINTENANCE = [
  { id: "MNT-001", title: "Burst water pipe",         unit: "A08", property: "Park View Apartments",  priority: "URGENT", status: "IN_PROGRESS" },
  { id: "MNT-002", title: "Faulty electrical wiring", unit: "C15", property: "Kilimani Heights",      priority: "HIGH",   status: "ASSIGNED"    },
  { id: "MNT-003", title: "Roof leaking",             unit: "D02", property: "Garden Estate Block A", priority: "HIGH",   status: "OPEN"        },
  { id: "MNT-004", title: "Broken door lock",         unit: "Common", property: "Park View Apartments", priority: "URGENT", status: "COMPLETED" },
  { id: "MNT-005", title: "Interior painting",        unit: "B06", property: "Westlands Towers",      priority: "LOW",    status: "OPEN"        },
];

// ─── Tool definitions ──────────────────────────────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_portfolio_summary",
    description: "Get the live portfolio summary: occupancy, revenue, overdue invoices, maintenance, collection rate.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_tenants",
    description: "Get tenants with payment status. Filter by: all | overdue | current | high_risk",
    input_schema: {
      type: "object" as const,
      properties: {
        filter: { type: "string", enum: ["all", "overdue", "current", "high_risk"] },
      },
      required: [],
    },
  },
  {
    name: "get_maintenance",
    description: "Get open maintenance tickets. Filter by: all | urgent | open | in_progress",
    input_schema: {
      type: "object" as const,
      properties: {
        filter: { type: "string", enum: ["all", "urgent", "open", "in_progress"] },
      },
      required: [],
    },
  },
  {
    name: "get_financial_report",
    description: "Get a financial breakdown: revenue, collections, outstanding, platform fees, landlord net.",
    input_schema: {
      type: "object" as const,
      properties: {
        period: { type: "string", enum: ["this_month", "last_month", "ytd"] },
      },
      required: [],
    },
  },
  {
    name: "run_automation",
    description: "Trigger a background automation job immediately. Jobs: sms-cadence | late-fees | deposit-depletion | generate-invoices",
    input_schema: {
      type: "object" as const,
      properties: {
        job: { type: "string", enum: ["sms-cadence", "late-fees", "deposit-depletion", "generate-invoices"] },
      },
      required: ["job"],
    },
  },
  {
    name: "get_cron_status",
    description: "Get the current status of all scheduled automation jobs including last run time and execution count.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
];

// ─── Tool execution ────────────────────────────────────────────────────────────

async function runTool(name: string, input: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "get_portfolio_summary":
      return PORTFOLIO;

    case "get_tenants": {
      const filter = (input.filter as string) || "all";
      const filtered = TENANTS.filter((t) => {
        if (filter === "overdue") return t.daysOverdue > 0;
        if (filter === "current") return t.daysOverdue === 0;
        if (filter === "high_risk") return t.riskLevel === "HIGH";
        return true;
      });
      return { count: filtered.length, tenants: filtered };
    }

    case "get_maintenance": {
      const filter = (input.filter as string) || "all";
      const filtered = MAINTENANCE.filter((m) => {
        if (filter === "urgent") return m.priority === "URGENT";
        if (filter === "open") return m.status === "OPEN";
        if (filter === "in_progress") return m.status === "IN_PROGRESS";
        return true;
      });
      return { count: filtered.length, tickets: filtered };
    }

    case "get_financial_report": {
      const period = (input.period as string) || "this_month";
      return {
        period,
        revenue: PORTFOLIO.monthlyRevenue,
        collected: Math.round(PORTFOLIO.monthlyRevenue * 0.87),
        outstanding: PORTFOLIO.overdueAmount,
        collectionRate: `${PORTFOLIO.collectionRate}%`,
        platformFee: Math.round(PORTFOLIO.monthlyRevenue * 0.10),
        landlordNet: Math.round(PORTFOLIO.monthlyRevenue * 0.77),
        byProperty: [
          { property: "Park View Apartments",   revenue: 1_240_000, rate: "95%" },
          { property: "Kilimani Heights",        revenue:   980_000, rate: "92%" },
          { property: "Garden Estate Block A",   revenue:   860_000, rate: "81%" },
          { property: "Lavington Court",         revenue:   740_000, rate: "100%" },
          { property: "Eastleigh Complex",       revenue:   460_000, rate: "71%" },
        ],
      };
    }

    case "run_automation": {
      const job = input.job as string;
      startJob(job);

      const results: Record<string, string> = {
        "sms-cadence":        "8 SMS reminders sent to overdue tenants",
        "late-fees":          "3 late fee penalties posted · KES 4,500",
        "deposit-depletion":  "2 deposits depleted · KES 60,000 recovered",
        "generate-invoices":  "131 invoices generated for next billing cycle",
      };

      // Simulate a short execution delay
      await new Promise((r) => setTimeout(r, 300));
      const message = results[job] || "Job completed";
      finishJob(job, message, true);

      return { job, success: true, message };
    }

    case "get_cron_status": {
      const jobs = getJobs();
      return {
        systemStatus: jobs.every((j) => j.status !== "error") ? "healthy" : "degraded",
        jobs: jobs.map((j) => ({
          id: j.id,
          name: j.name,
          schedule: j.scheduleLabel,
          status: j.status,
          lastRun: j.lastRun?.toISOString() ?? null,
          lastMessage: j.lastMessage,
          runCount: j.runCount,
        })),
      };
    }

    default:
      return { error: "Unknown tool" };
  }
}

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM = `You are Cornerstone — an AI property management system for Kenya built on Claude Opus 4.7.

You are the operating brain of Kamau Properties Ltd. You don't just answer questions — you act. You trigger automations, check live data, and report verified facts.

ABSOLUTE RULE — NO HALLUCINATION:
You MUST call a tool before stating ANY financial figure, tenant name, balance, count, or status.
Never use numbers from your training or from this system prompt in a response — those are stale context.
If someone asks "how much rent is overdue?" — call get_portfolio_summary first, then answer from the tool result.
If someone asks about a specific tenant — call get_tenants first.
If someone asks about cron jobs — call get_cron_status first.
NEVER invent or estimate figures. If a tool doesn't return the data, say so explicitly.

CAPABILITIES:
- Use tools to get real-time data before answering any factual question
- Trigger automations: SMS cadence, late fees, deposit depletion, invoice generation
- After running an automation, report only what the tool result says — not what you expect
- Be direct: "I ran the SMS cadence. Result: [exact tool output]"

RESPONSE STYLE:
- Factual, precise, action-oriented
- Use tables for lists of tenants, tickets, properties
- Short paragraphs, no filler
- Always show next recommended action
- Amounts in KES with comma separators`;

// ─── Route handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();
    if (!message) return NextResponse.json({ error: "Message required" }, { status: 400 });

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        response: "ANTHROPIC_API_KEY is not configured. Add it to your environment variables.",
        toolCalls: [],
      });
    }

    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-20).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const toolCalls: Array<{ name: string; input: unknown; result: unknown }> = [];

    // Agentic loop — keep running until no more tool calls
    let loopMessages = [...messages];
    for (let i = 0; i < 8; i++) {
      const response = await anthropic.messages.create({
        model: "claude-opus-4-7",
        max_tokens: 2048,
        system: SYSTEM,
        tools: TOOLS,
        messages: loopMessages,
      });

      if (response.stop_reason === "end_turn") {
        const text = response.content
          .filter((b) => b.type === "text")
          .map((b) => (b as { type: "text"; text: string }).text)
          .join("\n");
        return NextResponse.json({ response: text, toolCalls });
      }

      if (response.stop_reason === "tool_use") {
        const toolUseBlocks = response.content.filter((b) => b.type === "tool_use") as Anthropic.ToolUseBlock[];
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const block of toolUseBlocks) {
          const result = await runTool(block.name, block.input as Record<string, unknown>);
          toolCalls.push({ name: block.name, input: block.input, result });
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        }

        loopMessages = [
          ...loopMessages,
          { role: "assistant", content: response.content },
          { role: "user", content: toolResults },
        ];
        continue;
      }

      break;
    }

    return NextResponse.json({ response: "No response generated.", toolCalls });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("AI chat error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
