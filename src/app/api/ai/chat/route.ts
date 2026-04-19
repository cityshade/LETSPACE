import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are LETSPACE AI, an expert property management assistant for Kenya's real estate market. You are powered by Claude and deeply knowledgeable about:

1. Kenya real estate market (Nairobi, Mombasa, Kisumu, Nakuru, Eldoret) - rental prices, trends, neighborhoods
2. Kenya property laws - Landlord & Tenant Act, Land Act 2012, Sectional Properties Act
3. Property management best practices - tenant screening, rent collection, maintenance
4. Safaricom M-Pesa for rent collection and payment automation
5. KRA tax compliance - rental income declarations, VAT for commercial properties
6. Kenya estate agency regulations - EARB (Estate Agents Registration Board)
7. Financial analysis - ROI, yield calculations, occupancy optimization
8. Tenant relations and Kenyan cultural context

You have access to portfolio data for Kamau Properties Ltd:
- 12 properties, 148 units across Nairobi, Mombasa, Nakuru
- Current occupancy: 89% (131/148 units occupied)
- Monthly revenue: KES 4,280,000
- 8 overdue invoices totaling KES 642,000
- 14 open maintenance requests (2 urgent)
- 23 new leads this month

GUIDELINES:
- Always respond in clear, professional English
- Provide specific, actionable advice for the Kenyan context
- Quote prices in KES (Kenyan Shillings)
- Reference specific Nairobi neighborhoods when relevant (Westlands, Kilimani, Karen, Eastleigh, etc.)
- Be concise but comprehensive
- When relevant, mention M-Pesa integration for payments
- Maintain a professional yet approachable tone`;

export async function POST(req: NextRequest) {
  try {
    const { message, history = [] } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build conversation history
    const messages: Anthropic.MessageParam[] = [
      ...history.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
    });

    const responseText = (response.content[0] as { type: string; text: string }).text;

    return NextResponse.json({
      response: responseText,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process AI request", details: error.message },
      { status: 500 }
    );
  }
}
