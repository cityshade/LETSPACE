# Integrated Segmented Prompt Pack

## How to Use This Pack

- Run stages in order from **Stage 1 → Stage 8**.
- At the end of each stage, copy the structured output into the next stage's `INPUTS` section.
- Keep all assumptions explicit and tagged as `ASSUMPTION`.
- Keep unknowns in a `DATA_GAPS` section and add a resolution owner/date.

---

## Stage 1 — Asset Intelligence Extraction

### Prompt
```text
ROLE:
Elite product analyst and digital systems intelligence expert.

OBJECTIVE:
Produce a comprehensive intelligence report for the target digital asset.

INPUTS:
- Asset name:
- Asset type (SaaS, website, mobile app, IoT, XR, AI platform, blockchain, hybrid):
- Primary market:
- Known links/docs:
- Known constraints (budget, legal, timeline, geography):

REQUIRED COVERAGE:
1) UX & Interaction
2) Core features & workflows
3) Data models & storage
4) Integrations & APIs
5) Infrastructure & hosting
6) Security & compliance
7) Monetization model
8) Market position & competition
9) Business success indicators
10) Future enhancement potential

OUTPUT FORMAT:
A) Product Overview
B) Feature Inventory
C) User Journey Maps
D) Technology Assumptions
E) Data Flows
F) Integration Points
G) Security Architecture
H) Monetization & Revenue Streams
I) Market / Competitive Analysis
J) SWOT
K) Business Model & Scalability
L) Novel Opportunities
M) DATA_GAPS + validation plan

STOP:
Stop when all sections A–M are complete and measurable.
```

### Handoff to Stage 2
- `FEATURE_INVENTORY`
- `USER_JOURNEYS`
- `MONETIZATION_STREAMS`
- `SWOT`
- `DATA_GAPS`

---

## Stage 2 — Feature Decomposition & Module Breakdown

### Prompt
```text
ROLE:
Senior systems architect and business strategist.

OBJECTIVE:
Map every feature/workflow into technical modules and business impact.

INPUTS:
- Stage 1 report
- Priority goals (speed, margin, defensibility, compliance)

REQUIRED OUTPUT:
1) Core Modules
2) User Management
3) Authentication & Permissions
4) Content / Data Engine
5) APIs & Integrations
6) AI / ML Components
7) Automation & Workflows
8) Infrastructure / Hosting Modules
9) Analytics & Reporting
10) Admin / Control Panels
11) Revenue / Monetization Modules
12) Optional Enhancement Modules

FOR EACH MODULE INCLUDE:
- Purpose
- Dependencies
- Build/Buy recommendation
- Monetization impact
- KPI contribution
- Risk level (Low/Med/High)

STOP:
Stop after each Stage 1 feature is mapped to at least one module.
```

### Handoff to Stage 3
- `MODULE_CATALOG`
- `DEPENDENCY_MAP`
- `RISK_REGISTER`
- `BUILD_BUY_DECISIONS`

---

## Stage 3 — Architecture & Tech Stack Design

### Prompt
```text
ROLE:
Cloud and software architect with business growth expertise.

OBJECTIVE:
Create an actionable architecture blueprint for clone/migrate/enhance/scale.

INPUTS:
- Stage 2 module outputs
- Non-functional requirements (SLA, latency, region, cost ceiling)

OUTPUT FORMAT:
1) Frontend Architecture
2) Backend Architecture
3) Database / Warehouse Design
4) API / Integration Design
5) AI / ML Components
6) Blockchain / Token Modules (if applicable)
7) IoT / XR Layers (if applicable)
8) Authentication & Security
9) Hosting & Infrastructure
10) DevOps / CI-CD
11) Revenue & Payment Systems
12) Enhancement / Combination Strategy

MANDATORY:
- Include reference architecture diagram description in text
- Include scaling path (MVP → Growth → Enterprise)
- Include cost model assumptions

STOP:
Stop when architecture is implementation-ready with explicit trade-offs.
```

### Handoff to Stage 4
- `SCHEMA_DRAFTS`
- `API_CONTRACTS`
- `INFRA_PLAN`
- `SECURITY_BASELINE`
- `COST_ASSUMPTIONS`

---

## Stage 4 — Data Migration & Structure

### Prompt
```text
ROLE:
Database and business data migration specialist.

OBJECTIVE:
Produce migration and continuity plan with analytics and revenue integrity.

INPUTS:
- Stage 3 architecture outputs
- Source data inventory
- Compliance requirements (GDPR, HIPAA, SOC2, etc.)

OUTPUT FORMAT:
1) Database / Storage Schemas
2) Data Flows & Pipelines
3) ETL / Migration Plan
4) Cross-Platform Data Mapping
5) Integration with AI / Automation / Revenue Modules
6) Backup, Recovery, and Business Continuity
7) Analytics & Reporting Enhancements

MANDATORY:
- Data validation checks
- Reconciliation strategy (counts, sums, checksums)
- Rollback strategy

STOP:
Stop when migration plan is executable and testable end-to-end.
```

### Handoff to Stage 5
- `SCREEN_DATA_REQUIREMENTS`
- `TRACKING_EVENTS`
- `REPORTING_NEEDS`
- `BCP_DR_PLAN`

---

## Stage 5 — UI/UX & Business Interactions

### Prompt
```text
ROLE:
Senior product designer and UX strategist.

OBJECTIVE:
Design interaction blueprint that improves usability and monetization.

INPUTS:
- Stage 4 outputs
- Brand constraints
- Target personas

OUTPUT FORMAT:
1) Page / Screen Map
2) User Flow Diagrams
3) Dashboard Layouts
4) Interaction Patterns
5) Monetization Interaction Points (checkout, upsell, subscription, retention)
6) Accessibility / Mobile / XR Considerations
7) Optional Feature Enhancements

MANDATORY:
- Define activation moment(s)
- Define conversion funnel screens
- Define churn-reduction UX interventions

STOP:
Stop when all core journeys are mapped from entry to monetization and retention.
```

### Handoff to Stage 6
- `MVP_SCOPE`
- `DESIGN_SYSTEM_REQUIREMENTS`
- `FUNNEL_DEFINITION`
- `EXPERIMENT_BACKLOG`

---

## Stage 6 — Development & Business Roadmap

### Prompt
```text
ROLE:
Technical project manager and business strategist.

OBJECTIVE:
Create phased delivery roadmap aligned with revenue and operational goals.

INPUTS:
- Stages 1–5 outputs
- Team capacity and budget

OUTPUT FORMAT:
Phase 1 — MVP / Core Functionality
Phase 2 — Full Feature Set
Phase 3 — Revenue & Monetization Features
Phase 4 — Enhancements & Optimizations
Phase 5 — Cross-Asset Combination
Phase 6 — Business Scaling / Growth

FOR EACH PHASE INCLUDE:
- Timeline
- Roles and ownership
- Dependencies
- Resource plan
- ROI estimate
- Exit criteria

STOP:
Stop when roadmap includes critical path and measurable phase gates.
```

### Handoff to Stage 7
- `REVENUE_EXPERIMENT_PLAN`
- `GROWTH_MILESTONES`
- `KPI_TARGETS`
- `PHASE_GATES`

---

## Stage 7 — Enhancement, Combination & Monetization

### Prompt
```text
ROLE:
Digital product innovator and revenue strategist.

OBJECTIVE:
Define enhancement and cross-asset monetization strategy with measurable KPIs.

INPUTS:
- Stage 6 roadmap
- Market benchmarks

OUTPUT FORMAT:
1) Feature Enhancement Recommendations
2) Cross-Asset Integration Map
3) AI / Automation Integration
4) UX Improvements
5) Revenue Optimization & Payment Flows
6) Marketing & Growth Strategy
7) Business Success Metrics & KPIs
8) Innovation & Future-Proofing

MANDATORY:
- Pricing model matrix (subscription, usage, hybrid, enterprise)
- CAC/LTV assumptions
- Channel strategy by segment

STOP:
Stop when monetization and growth plan is testable and KPI-linked.
```

### Handoff to Stage 8
- `SCALING_SCENARIOS`
- `VALUE_CREATION_MAP`
- `UNIT_ECONOMICS`
- `RISK_MITIGATION`

---

## Stage 8 — Future Asset Innovation & Exit Strategy

### Prompt
```text
ROLE:
Futurist product designer, emerging tech strategist, and exit strategist.

OBJECTIVE:
Build long-term innovation portfolio and explicit exit pathways.

INPUTS:
- Stage 7 strategy outputs
- Macro trends and M&A comps

OUTPUT FORMAT:
1) Emerging Asset Concepts
2) Core Features & Workflows
3) Technical Feasibility
4) Monetization Potential
5) Marketing & Growth Strategy
6) Enhancement & Combination Potential
7) Business Model & Scaling Strategy
8) Exit Strategies (acquisition, IPO, tokenization, licensing)
9) Long-Term Success Metrics

MANDATORY:
- 3 scenario plans: conservative/base/aggressive
- Exit readiness checklist
- 24-month strategic milestones

STOP:
Stop when innovation roadmap and exit thesis are quantified.
```

---

## Master Orchestrator Prompt (Runs the Full Pipeline)

```text
ROLE:
Principal strategy orchestrator for digital asset cloning, enhancement, monetization, and exit planning.

TASK:
Execute Stages 1 through 8 sequentially. At each stage:
1) Produce the required output structure.
2) Validate completeness against stop conditions.
3) Generate a HANDOFF PACKAGE for the next stage.
4) Record assumptions, data gaps, risks, and confidence level.

GLOBAL CONSTRAINTS:
- Prioritize legal, security, and compliance safety.
- Favor modular architecture and measurable business outcomes.
- Keep recommendations implementation-ready.

GLOBAL DELIVERABLES:
- Technical blueprint
- Product blueprint
- Monetization and growth plan
- KPI framework
- Exit strategy with scenarios

FINAL OUTPUT STRUCTURE:
I. Executive Summary
II. Stage-by-Stage Outputs (1–8)
III. Consolidated Risk Register
IV. KPI Tree and Operating Cadence
V. 12/24-Month Roadmap
VI. Exit Readiness Scorecard
VII. Immediate Next 30/60/90 Day Actions
```

---

## Suggested KPI Baseline Template

- Activation rate
- Time-to-value
- Trial-to-paid conversion
- ARPU / ARPA
- Gross margin
- CAC, LTV, payback period
- Churn / retention (logo + revenue)
- NPS / CSAT
- Uptime / latency / error budget
- Compliance incidents

---

## Quick Start (Copy/Paste)

```text
Use the “Master Orchestrator Prompt (Runs the Full Pipeline)” in this document.
Start with Stage 1 inputs for the target asset below:
- Asset name:
- Asset URL/repository:
- Asset type:
- Market/segment:
- Revenue model today:
- Top constraints:
- 12-month target outcomes:
```
